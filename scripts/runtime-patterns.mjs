import { execFileSync } from "node:child_process"
import {
  existsSync,
  readFileSync,
  readdirSync,
  mkdirSync,
  writeFileSync,
  renameSync,
  rmSync,
  mkdtempSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { pathToFileURL } from "node:url"

import {
  base,
  bundle,
  project,
  parseConcept,
  hash,
  json,
  stable,
  generate,
  reviewIssues,
  validateSnapshot,
  safePath,
} from "./lib/runtime-patterns.mjs"

const root = resolve(import.meta.dirname, "..")
const snapshotFile = "docs/patterns/catalog.json"
const manifestFile = "docs/patterns/generated-manifest.json"
const presentationFile = "docs/patterns/presentation.json"
export const run = (command, args, options = {}) =>
  execFileSync(command, args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  })
export function resolveOwner() {
  return run("mori", ["path", project]).trim().split("\n").at(-1)
}
export function readSnapshot(directory = root) {
  return JSON.parse(readFileSync(join(directory, snapshotFile), "utf8"))
}
export function readPresentation(directory = root) {
  return JSON.parse(readFileSync(join(directory, presentationFile), "utf8"))
}
export function pointerSha(directory = root) {
  const file = join(directory, "docs/runtime-patterns-source-sync.md")
  if (!existsSync(file)) return null
  return (
    readFileSync(file, "utf8")
      .split(/^## Last reviewed commit\s*$/m)[1]
      ?.match(/\b[a-f0-9]{40}\b/)?.[0] ?? null
  )
}
export function listFiles(directory, prefix = "") {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((e) => {
      const path = prefix + e.name
      if (e.isSymbolicLink()) throw new Error(`Symlink in generated output: ${path}`)
      return e.isDirectory() ? listFiles(join(directory, e.name), path + "/") : [path]
    })
}
export function importSnapshot(repo, ref, validate = validateOwner) {
  const commit = run("git", ["-C", repo, "rev-parse", "--verify", `${ref}^{commit}`]).trim()
  const tree = run("git", ["-C", repo, "ls-tree", "-rz", commit]).split("\0").filter(Boolean)
  const entries = tree.map((line) => {
    const [facts, path] = line.split("\t")
    return { mode: facts.split(" ")[0], path }
  })
  const wanted = entries.filter(
    (x) =>
      (x.path.startsWith("runtime-patterns/") && x.path.endsWith(".md")) ||
      ["okf/runtime-patterns.dhall", "agents/skills/update-patterns/sources.json"].includes(x.path),
  )
  const rawFiles = wanted
    .map(({ path, mode }) => {
      safePath(path)
      if (mode !== "100644" && mode !== "100755")
        throw new Error(`Unsupported source mode: ${path}`)
      const bytes = execFileSync("git", ["-C", repo, "show", `${commit}:${path}`])
      const raw = bytes.toString("utf8")
      if (!Buffer.from(raw).equals(bytes)) throw new Error(`Source is not UTF-8: ${path}`)
      return { path, raw }
    })
    .sort((a, b) => a.path.localeCompare(b.path))
  const graph = validate(repo, commit)
  const concepts = rawFiles
    .filter((x) => x.path.startsWith("runtime-patterns/") && !/\/(index|log)\.md$/.test(x.path))
    .map((x) => parseConcept(x.path.slice(17), x.raw))
  const snapshot = {
    schemaVersion: 1,
    sourceProject: project,
    sourceBundle: bundle,
    commit,
    commitDate: run("git", ["-C", repo, "show", "-s", "--format=%cI", commit]).trim(),
    profile: rawFiles.find((x) => x.path === "okf/runtime-patterns.dhall"),
    watermarks: rawFiles.find((x) => x.path.endsWith("sources.json")),
    concepts,
    reserved: rawFiles.filter((x) => /\/(index|log)\.md$/.test(x.path)),
    graph: stable(graph),
    inputs: rawFiles.map((x) => ({ path: x.path, hash: hash(x.raw) })),
  }
  validateSnapshot(snapshot)
  return snapshot
}
function validateOwner(repo, commit) {
  const temp = mkdtempSync(join(tmpdir(), "patterns-validation-"))
  try {
    const archive = execFileSync("git", ["-C", repo, "archive", commit], {
      maxBuffer: 64 * 1024 * 1024,
    })
    execFileSync("tar", ["-x", "-C", temp], { input: archive })
    run("git", ["init", "-q", temp])
    const evidence = run("bash", ["scripts/check-runtime-patterns"], { cwd: temp })
    console.error(evidence.trim())
    return JSON.parse(run("okf", ["graph", "runtime-patterns", "--json"], { cwd: temp }))
  } finally {
    rmSync(temp, { recursive: true, force: true })
  }
}
export function check(directory = root, { requireReview = true } = {}) {
  const snapshot = readSnapshot(directory),
    presentation = readPresentation(directory)
  const outputs = generate(snapshot, presentation)
  const manifest = JSON.parse(readFileSync(join(directory, manifestFile), "utf8"))
  const expected = Object.fromEntries([...outputs].map(([p, raw]) => [p, hash(raw)]).sort())
  if (json(manifest) !== json(expected))
    throw new Error("Generated manifest differs from expected coverage/hashes")
  const actual = listFiles(join(directory, base)).map((x) => base + x)
  for (const path of actual)
    if (!outputs.has(path)) throw new Error(`Extra generated output: ${path}`)
  for (const [path, raw] of outputs) {
    if (!existsSync(join(directory, path))) throw new Error(`Missing generated page: ${path}`)
    if (readFileSync(join(directory, path), "utf8") !== raw)
      throw new Error(`Edited generated output: ${path}`)
  }
  const issues = reviewIssues(snapshot, presentation)
  for (const id of Object.keys(presentation.diagrams ?? {}))
    if (!existsSync(join(directory, `content/diagrams/runtime-patterns/${id}.svg`)))
      issues.push(`Missing diagram asset: ${id}`)
  const sha = pointerSha(directory)
  if (
    existsSync(join(directory, "docs/runtime-patterns-source-sync.md")) &&
    sha !== snapshot.commit
  )
    issues.push(`Review pointer/snapshot disagreement: ${sha} ≠ ${snapshot.commit}`)
  if (requireReview && issues.length) throw new Error(issues.join("\n"))
  return { snapshot, outputs, issues }
}
export function refresh(directory, snapshot) {
  const presentation = readPresentation(directory)
  const previous = existsSync(join(directory, snapshotFile)) ? readSnapshot(directory) : null
  // Identity survives rename. Retained stubs explain removed identities without changing the denominator.
  presentation.retiredRoutes ??= {}
  for (const old of previous?.concepts ?? []) {
    const current = snapshot.concepts.find((x) => x.resource === old.resource)
    if (!current || current.path !== old.path)
      presentation.retiredRoutes[old.path] = {
        resource: old.resource,
        successor: current ? `/docs/runtime-patterns/${current.path.replace(/\.md$/, "")}` : null,
      }
  }
  for (const c of snapshot.concepts) delete presentation.retiredRoutes[c.path]
  const outputs = generate(snapshot, presentation)
  const target = join(directory, base)
  const oldManifest = existsSync(join(directory, manifestFile))
    ? JSON.parse(readFileSync(join(directory, manifestFile), "utf8"))
    : {}
  for (const path of Object.keys(oldManifest))
    if (!path.startsWith(base) || !safePath(path)) throw new Error(`Unsafe managed path: ${path}`)
  for (const path of listFiles(target).map((x) => base + x)) {
    if (!oldManifest[path]) throw new Error(`Refusing human output collision: ${path}`)
    if (hash(readFileSync(join(directory, path))) !== oldManifest[path])
      throw new Error(`Refusing edited managed file: ${path}`)
  }
  const stage = mkdtempSync(join(directory, ".patterns-stage-"))
  const backup = `${stage}/previous`
  const saved = new Map(
    [snapshotFile, manifestFile, presentationFile].map((p) => [
      p,
      existsSync(join(directory, p)) ? readFileSync(join(directory, p)) : null,
    ]),
  )
  let swapped = false
  try {
    for (const [path, raw] of outputs) {
      mkdirSync(join(stage, path, ".."), { recursive: true })
      writeFileSync(join(stage, path), raw)
    }
    const manifest = Object.fromEntries([...outputs].map(([p, raw]) => [p, hash(raw)]).sort())
    mkdirSync(join(directory, "content/docs"), { recursive: true })
    mkdirSync(join(directory, "docs/patterns"), { recursive: true })
    if (existsSync(target)) renameSync(target, backup)
    renameSync(join(stage, base), target)
    swapped = true
    writeFileSync(join(directory, snapshotFile), json(snapshot))
    writeFileSync(join(directory, manifestFile), json(manifest))
    writeFileSync(join(directory, presentationFile), json(presentation))
  } catch (error) {
    if (swapped) rmSync(target, { recursive: true, force: true })
    if (existsSync(backup)) renameSync(backup, target)
    for (const [p, bytes] of saved) {
      if (bytes) writeFileSync(join(directory, p), bytes)
      else rmSync(join(directory, p), { force: true })
    }
    throw error
  } finally {
    rmSync(stage, { recursive: true, force: true })
  }
  return reviewIssues(snapshot, presentation)
}
export function checkUpstream(directory, repo, ref = "HEAD") {
  const snapshot = readSnapshot(directory)
  if (!repo || !existsSync(repo)) throw new Error("Upstream catalog unavailable")
  const target = run("git", ["-C", repo, "rev-parse", "--verify", `${ref}^{commit}`]).trim()
  const dirty = run("git", ["-C", repo, "status", "--porcelain"]).trim()
  if (dirty) console.error("Upstream worktree is dirty; comparison excludes uncommitted files.")
  if (snapshot.commit !== target)
    throw new Error(`Catalog drift: imported ${snapshot.commit}; selected ${target}`)
  return { target, dirty: Boolean(dirty) }
}
export function main(args) {
  const flags = new Set(args.filter((x) => x.startsWith("--")))
  for (const flag of flags)
    if (!["--ref", "--refresh", "--check", "--check-upstream", "--"].includes(flag))
      throw new Error(`Unknown option: ${flag}`)
  const refAt = args.indexOf("--ref"),
    ref = refAt >= 0 ? args[refAt + 1] : "HEAD"
  if (!ref || ref.startsWith("--")) throw new Error("--ref requires a commit or ref")
  if (flags.has("--refresh")) {
    const snapshot = importSnapshot(resolveOwner(), ref)
    const issues = refresh(root, snapshot)
    console.log(
      `Imported ${snapshot.concepts.length} concepts at fixed target ${snapshot.commit}. Completed-review pointer unchanged.`,
    )
    if (issues.length) console.log(`${issues.length} source-bound visual review(s) pending.`)
  } else if (flags.has("--check-upstream"))
    console.log(`Upstream comparison: ${json(checkUpstream(root, resolveOwner(), ref)).trim()}`)
  else {
    const { snapshot } = check()
    console.log(`Catalog consistent: ${snapshot.concepts.length} concepts at ${snapshot.commit}.`)
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    main(process.argv.slice(2))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
