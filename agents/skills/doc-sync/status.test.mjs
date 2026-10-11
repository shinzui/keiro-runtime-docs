import { test } from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { inspect, tryRun, publication, parsePointer, ROOT } from "./status.mjs"

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "patterns-status-"))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const git = (...args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim()
  git("init", "-q"); git("config", "user.name", "Fixture"); git("config", "user.email", "fixture@example.invalid")
  writeFileSync(join(root, "a"), "a"); git("add", "."); git("commit", "-qm", "docs: initial")
  const sha = git("rev-parse", "HEAD")
  return { root, git, sha, entry: { library: "fixture", sha }, options: { resolveRepo: () => ({ path: root, via: "fixture" }) } }
}
test("library drift remains read-only and dirty work is separate", (t) => {
  const f = fixture(t)
  assert.equal(inspect(f.entry, f.options).commitsBehind, 0)
  writeFileSync(join(f.root, "a"), "b"); f.git("commit", "-qam", "docs: change")
  writeFileSync(join(f.root, "a"), "dirty")
  const r = inspect(f.entry, f.options)
  assert.equal(r.commitsBehind, 1); assert.equal(r.dirtyFiles, 1); assert.deepEqual(r.changedPaths, { a: 1 })
  assert.equal(readFileSync(join(f.root, "a"), "utf8"), "dirty")
})
test("missing checkout, SHA, divergent range, and failed Git comparison are unresolved", (t) => {
  const f = fixture(t)
  assert.match(inspect(f.entry, { resolveRepo: () => ({ path: null }) }).error, /not found/)
  assert.match(inspect({ ...f.entry, sha: "f".repeat(40) }, f.options).error, /not in repo/)
  f.git("checkout", "--orphan", "other"); f.git("commit", "-qm", "docs: unrelated")
  const divergent = inspect(f.entry, f.options)
  assert.match(divergent.error, /not an ancestor/); assert.equal(divergent.commitsBehind, undefined)
  f.git("checkout", "-q", f.sha)
  const failed = inspect(f.entry, { ...f.options, execute: (command, args) => args.includes("rev-list") ? null : tryRun(command, args) })
  assert.match(failed.error, /failed Git/); assert.equal(failed.commitsBehind, undefined)
})
test("publication evidence survives unavailable owner and binds completed review plus semantic content", (t) => {
  const f = fixture(t)
  mkdirSync(join(f.root, "docs/patterns"), { recursive: true })
  for (const name of ["catalog", "presentation"]) writeFileSync(join(f.root, `docs/patterns/${name}.json`), readFileSync(join(ROOT, `docs/patterns/${name}.json`)))
  const snapshot = JSON.parse(readFileSync(join(f.root, "docs/patterns/catalog.json")))
  const entry = { ...f.entry, moriName: "shinzui/keiro-runtime-patterns", sha: "0".repeat(40) }
  const r = inspect(entry, { root: f.root, resolveRepo: () => ({ path: null }) })
  assert.equal(r.importedSha, snapshot.commit); assert.equal(r.publicationState, "imported-but-unreviewed"); assert.match(r.error, /not found/)
  const p = JSON.parse(readFileSync(join(f.root, "docs/patterns/presentation.json")))
  const d = Object.values(p.diagrams)[0]; const resource = Object.keys(d.sources)[0]
  d.sources[resource] = "stale"; p.assessments[resource].semanticHash = "stale"
  writeFileSync(join(f.root, "docs/patterns/presentation.json"), JSON.stringify(p))
  const issues = publication({ ...entry, sha: snapshot.commit }, f.root).reviewIssues.join("\n")
  assert.match(issues, /Diagram binding stale/); assert.match(issues, /Visual assessment stale/)
})
test("pointer headings retain full SHA parser compatibility", (t) => {
  const f = fixture(t); mkdirSync(join(f.root, "docs"))
  writeFileSync(join(f.root, "docs/runtime-patterns-source-sync.md"), `**Qualified name (mori):** \`shinzui/keiro-runtime-patterns\`\n**Path at last sync:**\n\`${f.root}\`\n## Last reviewed commit\n\`${f.sha}\`\n`)
  const r = parsePointer("runtime-patterns-source-sync.md", f.root)
  assert.equal(r.sha, f.sha); assert.equal(r.moriName, "shinzui/keiro-runtime-patterns"); assert.equal(r.recordedPath, f.root)
})
