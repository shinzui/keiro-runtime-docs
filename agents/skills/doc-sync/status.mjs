// Staleness report across every docs ↔ source sync pointer.
//
// For each `docs/*-source-sync.md`, parse the mori qualified name and the pinned
// "Last reviewed commit" SHA, resolve the upstream repo on disk (mori first, the
// recorded path as a fallback), and report how far the docs are behind it.
//
//   node agents/skills/doc-sync/status.mjs              # every tracked upstream
//   node agents/skills/doc-sync/status.mjs keiro keiki  # substring-matched subset
//   node agents/skills/doc-sync/status.mjs --json
//   node agents/skills/doc-sync/status.mjs --log 20     # show N subjects per repo

import { execFileSync } from "node:child_process"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join, resolve } from "node:path"

const ROOT = resolve(import.meta.dirname, "..", "..", "..")
const POINTER_DIR = join(ROOT, "docs")

const argv = process.argv.slice(2)
const asJson = argv.includes("--json")
const logIndex = argv.indexOf("--log")
const logLimit = logIndex === -1 ? 10 : Number(argv[logIndex + 1] ?? 10)
const filters = argv.filter(
  (arg, index) => !arg.startsWith("--") && !(logIndex !== -1 && index === logIndex + 1),
)

// Built from a char code so the source carries no literal control character.
const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g")

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  })
}

function tryRun(command, args, options) {
  try {
    return run(command, args, options).replace(ANSI, "").trim()
  } catch {
    return null
  }
}

function parsePointer(file) {
  const text = readFileSync(join(POINTER_DIR, file), "utf8")
  const moriName = text.match(/Qualified name \(mori\):\*\*\s*`([^`]+)`/)?.[1] ?? null
  const recordedPath = text.match(/Path at last sync:\*\*\s*\n?\s*`([^`]+)`/)?.[1] ?? null

  // The pinned SHA is the first 40-hex word after the "Last reviewed commit" heading.
  const afterHeading = text.split(/^##\s+Last reviewed commit\s*$/m)[1] ?? ""
  const sha = afterHeading.match(/\b([0-9a-f]{40})\b/)?.[1] ?? null

  return {
    pointer: `docs/${file}`,
    library: file.replace(/-source-sync\.md$/, ""),
    moriName,
    recordedPath,
    sha,
  }
}

function resolveRepoPath(entry) {
  if (entry.moriName) {
    const shown = tryRun("mori", ["registry", "show", entry.moriName, "--full"])
    const path = shown?.match(/^\s*Path:\s*(.+?)\s*$/m)?.[1]
    if (path && existsSync(path)) return { path, via: "mori" }
  }
  if (entry.recordedPath && existsSync(entry.recordedPath)) {
    return { path: entry.recordedPath, via: "pointer-file (mori lookup failed)" }
  }
  return { path: null, via: null }
}

function inspect(entry) {
  const { path, via } = resolveRepoPath(entry)
  if (!path) return { ...entry, error: "upstream repo not found on disk" }
  if (!entry.sha) return { ...entry, repoPath: path, error: "no pinned SHA in pointer file" }

  const git = (args) => tryRun("git", ["-C", path, ...args])

  if (git(["cat-file", "-e", `${entry.sha}^{commit}`]) === null) {
    return { ...entry, repoPath: path, error: `pinned SHA ${entry.sha.slice(0, 7)} not in repo` }
  }

  const head = git(["rev-parse", "HEAD"]) ?? ""
  const range = `${entry.sha}..HEAD`
  const commits = Number(git(["rev-list", "--count", range]) ?? "0")
  const dirty = (git(["status", "--porcelain"]) ?? "").split("\n").filter(Boolean)

  return {
    ...entry,
    repoPath: path,
    resolvedVia: via,
    head,
    headSubject: git(["log", "-1", "--format=%s"]) ?? "",
    headDate: git(["log", "-1", "--format=%cI"]) ?? "",
    commitsBehind: commits,
    dirtyFiles: dirty.length,
    diffstat: commits ? (git(["diff", "--shortstat", range]) ?? "") : "",
    changedPaths: commits
      ? (git(["diff", "--name-only", range]) ?? "")
          .split("\n")
          .filter(Boolean)
          .map((p) => p.split("/")[0])
          .reduce((counts, top) => counts.set(top, (counts.get(top) ?? 0) + 1), new Map())
      : new Map(),
    log: commits ? (git(["log", "--oneline", `-${logLimit}`, range]) ?? "").split("\n") : [],
  }
}

const pointerFiles = readdirSync(POINTER_DIR)
  .filter((name) => name.endsWith("-source-sync.md"))
  .toSorted()

const selected = pointerFiles
  .map(parsePointer)
  .filter((entry) => filters.length === 0 || filters.some((f) => entry.library.includes(f)))

if (selected.length === 0) {
  console.error(`No pointer files matched: ${filters.join(", ")}`)
  process.exit(1)
}

const results = selected.map(inspect)

if (asJson) {
  console.log(
    JSON.stringify(
      results.map((r) => ({ ...r, changedPaths: Object.fromEntries(r.changedPaths ?? []) })),
      null,
      2,
    ),
  )
  process.exit(0)
}

const behind = results.filter((r) => !r.error && r.commitsBehind > 0)
const current = results.filter((r) => !r.error && r.commitsBehind === 0)
const broken = results.filter((r) => r.error)

for (const r of behind) {
  console.log(`\n■ ${r.library} — ${r.commitsBehind} commit(s) behind`)
  console.log(`  pointer   ${r.pointer} @ ${r.sha.slice(0, 7)}`)
  console.log(`  upstream  ${r.repoPath}${r.resolvedVia === "mori" ? "" : `  [${r.resolvedVia}]`}`)
  console.log(`  head      ${r.head.slice(0, 7)}  ${r.headDate.slice(0, 10)}  ${r.headSubject}`)
  if (r.diffstat) console.log(`  diff     ${r.diffstat}`)
  const tops = [...r.changedPaths.entries()].toSorted((a, b) => b[1] - a[1]).slice(0, 8)
  if (tops.length) console.log(`  touched   ${tops.map(([p, n]) => `${p}(${n})`).join(" ")}`)
  if (r.dirtyFiles) console.log(`  ⚠ upstream worktree is dirty (${r.dirtyFiles} file(s)) — review the committed tree only`)
  for (const line of r.log) console.log(`    ${line}`)
  if (r.commitsBehind > r.log.length) console.log(`    … ${r.commitsBehind - r.log.length} more`)
}

if (current.length) {
  console.log(`\n✓ current: ${current.map((r) => `${r.library}@${r.sha.slice(0, 7)}`).join(", ")}`)
}

for (const r of broken) {
  console.log(`\n✗ ${r.library}: ${r.error}  (${r.pointer})`)
}

console.log(
  `\n${behind.length} behind, ${current.length} current, ${broken.length} unresolved — of ${results.length} tracked.`,
)
