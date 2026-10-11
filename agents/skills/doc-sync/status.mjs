// Read-only upstream drift and generated-publication review status.
import { execFileSync } from "node:child_process"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join, resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { hash, reviewIssues, validateSnapshot } from "../../../scripts/lib/runtime-patterns.mjs"

export const ROOT = resolve(import.meta.dirname, "../../..")
const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g")
export function tryRun(command, args) {
  try {
    return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).replace(ANSI, "").trim()
  } catch { return null }
}
export function parsePointer(file, root = ROOT) {
  const text = readFileSync(join(root, "docs", file), "utf8")
  return {
    pointer: `docs/${file}`,
    library: file.replace(/-source-sync\.md$/, ""),
    moriName: text.match(/Qualified name \(mori\):\*\*\s*`([^`]+)`/)?.[1] ?? null,
    recordedPath: text.match(/Path at last sync:\*\*\s*\n?\s*`([^`]+)`/)?.[1] ?? null,
    sha: (text.split(/^##\s+Last reviewed commit\s*$/m)[1] ?? "").match(/\b([0-9a-f]{40})\b/)?.[1] ?? null,
  }
}
export function resolveRepoPath(entry) {
  if (entry.moriName) {
    const shown = tryRun("mori", ["registry", "show", entry.moriName, "--full"])
    const path = shown?.match(/^\s*Path:\s*(.+?)\s*$/m)?.[1]
    if (path && existsSync(path)) return { path, via: "mori" }
  }
  if (entry.recordedPath && existsSync(entry.recordedPath)) return { path: entry.recordedPath, via: "pointer-file (mori lookup failed)" }
  return { path: null, via: null }
}
export function publication(entry, root = ROOT) {
  if (entry.moriName !== "shinzui/keiro-runtime-patterns") return {}
  try {
    const snapshot = JSON.parse(readFileSync(join(root, "docs/patterns/catalog.json"), "utf8"))
    const presentation = JSON.parse(readFileSync(join(root, "docs/patterns/presentation.json"), "utf8"))
    validateSnapshot(snapshot)
    const issues = reviewIssues(snapshot, presentation)
    if (Object.values(presentation.diagrams).filter((d) => !d.asset).length < 18) issues.push("Pattern diagram baseline requires 18 new assets")
    for (const [id, d] of Object.entries(presentation.diagrams)) {
      const asset = join(root, `content/diagrams/${d.asset ?? `runtime-patterns/${id}`}.svg`)
      if (!existsSync(asset)) issues.push(`Missing diagram asset: ${id}`)
      else if (d.assetHash && hash(readFileSync(asset)) !== d.assetHash) issues.push(`Diagram asset review stale: ${id}`)
    }
    if (entry.sha !== snapshot.commit) issues.push("Imported SHA differs from completed-review SHA")
    return { importedSha: snapshot.commit, completedReviewSha: entry.sha, publicationState: issues.length ? "imported-but-unreviewed" : "reviewed", reviewIssues: issues }
  } catch (error) {
    return { completedReviewSha: entry.sha, publicationState: "unavailable", reviewIssues: [error.message] }
  }
}
export function inspect(entry, { root = ROOT, resolveRepo = resolveRepoPath, execute = tryRun, logLimit = 10 } = {}) {
  const extra = publication(entry, root)
  const { path, via } = resolveRepo(entry)
  const common = { ...entry, ...extra, repoPath: path, resolvedVia: via }
  if (!path) return { ...common, error: "upstream repo not found on disk" }
  if (!entry.sha) return { ...common, error: "no pinned SHA in pointer file" }
  const git = (args) => execute("git", ["-C", path, ...args])
  if (git(["cat-file", "-e", `${entry.sha}^{commit}`]) === null) return { ...common, error: "pinned SHA not in repo" }
  const head = git(["rev-parse", "--verify", "HEAD^{commit}"])
  if (!head || !/^[a-f0-9]{40}$/.test(head)) return { ...common, error: "failed to resolve upstream HEAD" }
  // A divergent pin and a failed comparison must never be reported as current.
  if (git(["merge-base", "--is-ancestor", entry.sha, head]) === null) return { ...common, head, error: "reviewed commit is not an ancestor of HEAD, or comparison failed" }
  const range = `${entry.sha}..${head}`
  const count = git(["rev-list", "--count", range])
  const dirty = git(["status", "--porcelain"])
  const paths = git(["diff", "--name-only", range])
  const diffstat = git(["diff", "--shortstat", range])
  const log = git(["log", "--oneline", `-${logLimit}`, range])
  const headSubject = git(["log", "-1", "--format=%s", head])
  const headDate = git(["log", "-1", "--format=%cI", head])
  if (count === null || !/^\d+$/.test(count) || [dirty, paths, diffstat, log, headSubject, headDate].some((v) => v === null)) return { ...common, head, error: "failed Git range/status inspection" }
  const changedPaths = paths.split("\n").filter(Boolean).reduce((counts, p) => { const top = p.split("/")[0]; counts[top] = (counts[top] ?? 0) + 1; return counts }, {})
  return { ...common, head, headSubject, headDate, commitsBehind: Number(count), dirtyFiles: dirty.split("\n").filter(Boolean).length, changedPaths, diffstat, log: log.split("\n").filter(Boolean) }
}
export function main(argv = process.argv.slice(2)) {
  const logIndex = argv.indexOf("--log")
  const logLimit = logIndex < 0 ? 10 : Number(argv[logIndex + 1])
  if (!Number.isInteger(logLimit) || logLimit < 1) throw new Error("--log needs a positive integer")
  const filters = argv.filter((arg, i) => !arg.startsWith("--") && !(logIndex >= 0 && i === logIndex + 1))
  const entries = readdirSync(join(ROOT, "docs")).filter((f) => f.endsWith("-source-sync.md")).sort().map((f) => parsePointer(f)).filter((e) => !filters.length || filters.some((f) => e.library.includes(f)))
  // An imported catalog with no completed pointer is still visible in status.
  if (!entries.some((e) => e.moriName === "shinzui/keiro-runtime-patterns") && existsSync(join(ROOT, "docs/patterns/catalog.json")) && (!filters.length || filters.some((f) => "runtime-patterns".includes(f)))) entries.push({ pointer: "docs/runtime-patterns-source-sync.md", library: "runtime-patterns", moriName: "shinzui/keiro-runtime-patterns", sha: null })
  if (!entries.length) throw new Error(`No pointer files matched: ${filters.join(", ")}`)
  const results = entries.map((e) => inspect(e, { logLimit }))
  if (argv.includes("--json")) console.log(JSON.stringify(results, null, 2))
  else {
    for (const r of results) {
      console.log(`\n${r.error ? "✗" : r.commitsBehind ? "■" : "✓"} ${r.library}: ${r.error ?? `${r.commitsBehind} commit(s) behind`}`)
      console.log(`  pointer ${r.sha ?? "not completed"}; HEAD ${r.head ?? "unavailable"}`)
      if (r.importedSha) console.log(`  imported ${r.importedSha}; publication ${r.publicationState}`)
      for (const issue of r.reviewIssues ?? []) console.log(`  review: ${issue}`)
      if (r.dirtyFiles) console.log(`  dirty upstream: ${r.dirtyFiles} file(s), excluded from publication`)
      for (const line of r.log ?? []) console.log(`    ${line}`)
    }
    console.log(`\n${results.filter((r) => !r.error && r.commitsBehind > 0).length} behind, ${results.filter((r) => !r.error && r.commitsBehind === 0 && (!r.publicationState || r.publicationState === "reviewed")).length} current, ${results.filter((r) => r.error || (r.publicationState && r.publicationState !== "reviewed")).length} unresolved — of ${results.length} tracked.`)
  }
  return results
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}
