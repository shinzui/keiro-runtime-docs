import assert from "node:assert/strict"
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
  renameSync,
  existsSync,
} from "node:fs"
import { createRequire } from "node:module"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { test } from "node:test"

import {
  generate,
  parseConcept,
  reviewIssues,
  hash,
  json,
  validateSnapshot,
  base,
} from "./lib/runtime-patterns.mjs"
import {
  importSnapshot,
  refresh,
  check,
  run,
  checkUpstream,
  pointerSha,
} from "./runtime-patterns.mjs"
const require = createRequire(import.meta.resolve("fumadocs-mdx/package.json"))
const { compile } = await import(require.resolve("@mdx-js/mdx"))
function file(dir, path, raw) {
  mkdirSync(join(dir, path, ".."), { recursive: true })
  writeFileSync(join(dir, path), raw)
}
function concept(
  body = "# Rule\n\n## Boundary\n\nKeep one transaction.\n",
  resource = "mori://shinzui/keiro-runtime-patterns/docs/test",
) {
  return `---\ntitle: Test rule\ntype: Standard\nstatus: current\nresource: ${resource}\ntimestamp: 2026-10-11T00:00:00Z\ngenerated: {by: process:test, at: '2026-10-11T00:00:00Z'}\ncustom: {unknown: [kept, intact]}\napplicability: {scope: all}\ncriteria: [{id: original, statement: preserve, severity: required, evidenceKind: report}]\n---\n\n${body}`
}
function commit(repo) {
  run("git", ["-C", repo, "add", "."])
  run("git", [
    "-C",
    repo,
    "-c",
    "user.name=Fixture",
    "-c",
    "user.email=fixture@example.test",
    "commit",
    "-qm",
    "docs: fixture",
  ])
  return run("git", ["-C", repo, "rev-parse", "HEAD"]).trim()
}
function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), "pattern-test-"))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const repo = join(dir, "owner"),
    site = join(dir, "site")
  mkdirSync(repo)
  mkdirSync(site)
  run("git", ["init", "-q", repo])
  file(repo, "runtime-patterns/test/rule.md", concept())
  file(repo, "runtime-patterns/index.md", "# Catalog\n")
  file(repo, "runtime-patterns/log.md", "# Root log\n")
  file(repo, "runtime-patterns/test/log.md", "# Nearest log\n")
  file(repo, "runtime-patterns/test/index.md", "# Subject\n")
  file(repo, "okf/runtime-patterns.dhall", "profile\n")
  file(repo, "agents/skills/update-patterns/sources.json", '{"sources":[]}\n')
  const sha = commit(repo)
  file(
    site,
    "docs/patterns/presentation.json",
    json({ schemaVersion: 1, assessments: {}, diagrams: {} }),
  )
  const validate = (r, c) => {
    const paths = run("git", ["-C", r, "ls-tree", "-r", "--name-only", c])
      .trim()
      .split("\n")
      .filter(
        (x) =>
          x.startsWith("runtime-patterns/") && x.endsWith(".md") && !/\/(index|log)\.md$/.test(x),
      )
    return { nodes: paths.map((p) => ({ id: p.slice(17, -3) })), edges: [] }
  }
  const get = (ref = sha) => importSnapshot(repo, ref, validate)
  return { repo, site, sha, get }
}
function approve(site, snapshot, { diagram = false } = {}) {
  const c = snapshot.concepts[0]
  const p = {
    schemaVersion: 1,
    assessments: Object.fromEntries(
      snapshot.concepts.map((x) => [
        x.resource,
        { semanticHash: x.semanticHash, textOnlyReason: "A short textual rule is sufficient." },
      ]),
    ),
    diagrams: {},
  }
  if (diagram) {
    p.assessments[c.resource].diagrams = ["test/boundary"]
    delete p.assessments[c.resource].textOnlyReason
    p.diagrams["test/boundary"] = {
      sources: { [c.resource]: c.semanticHash },
      placement: { resource: c.resource, heading: "Boundary" },
      alt: "One transaction contains the work.",
      caption: "Commit work together.",
      reviewActor: "process:test",
      reviewedAt: "2026-10-11T00:00:00Z",
    }
    file(
      site,
      "content/diagrams/runtime-patterns/test/boundary.svg",
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"/>',
    )
  }
  file(site, "docs/patterns/presentation.json", json(p))
  return p
}
test("snapshot uses one committed tree, preserves unknown metadata/criteria, nested logs, and deterministic bytes", (t) => {
  const f = fixture(t),
    s = f.get()
  file(f.repo, "runtime-patterns/test/rule.md", concept("# DIRTY"))
  assert.equal(f.get().concepts[0].raw, s.concepts[0].raw)
  assert.deepEqual(s.concepts[0].metadata.custom, { unknown: ["kept", "intact"] })
  assert.equal(s.concepts[0].metadata.criteria[0].id, "original")
  assert.ok(s.reserved.some((x) => x.path.endsWith("test/log.md")))
  approve(f.site, s)
  refresh(f.site, s)
  const first = readFileSync(join(f.site, "docs/patterns/generated-manifest.json"), "utf8")
  refresh(f.site, f.get())
  assert.equal(readFileSync(join(f.site, "docs/patterns/generated-manifest.json"), "utf8"), first)
  assert.equal(check(f.site).snapshot.commit, f.sha)
})
test("offline checks reject omitted, extra, and edited pages, and snapshot inventory/hash/identity drift", (t) => {
  const f = fixture(t),
    s = f.get()
  approve(f.site, s)
  refresh(f.site, s)
  const page = join(f.site, base, "test/rule.mdx"),
    raw = readFileSync(page)
  rmSync(page)
  assert.throws(() => check(f.site), /Missing generated/)
  writeFileSync(page, raw)
  file(f.site, base + "extra.mdx", "extra")
  assert.throws(() => check(f.site), /Extra generated/)
  rmSync(join(f.site, base, "extra.mdx"))
  writeFileSync(page, "edited")
  assert.throws(() => check(f.site), /Edited generated/)
  const missing = structuredClone(s)
  missing.concepts = []
  assert.throws(() => validateSnapshot(missing), /omits/)
  const bad = structuredClone(s)
  bad.concepts[0].raw += "edit"
  assert.throws(() => validateSnapshot(bad), /hash\/metadata/)
  assert.throws(() => parseConcept("test/rule.md", "# Missing"), /Missing identity/)
})
test("Markdown-sensitive literals compile as inert text, with code, tables, links, and anchors preserved", async (t) => {
  const f = fixture(t)
  file(
    f.repo,
    "runtime-patterns/test/rule.md",
    concept(
      "# Rule\n\n## Boundary\n\nLiteral {danger()} and <Type<T>>.\n\n<script>alert(1)</script>\n\n```haskell\nx = {field = 1}\n```\n\n| Name | Meaning |\n| --- | --- |\n| x | literal |\n\n[Self](#boundary) [History](log.md) [Subject](index.md)\n",
    ),
  )
  const s = f.get(commit(f.repo))
  const page = generate(s, { assessments: {}, diagrams: {} }).get(base + "test/rule.mdx")
  await compile(page.replace(/^---\n[\s\S]*?\n---\n/, ""))
  assert.ok(page.includes("&#123;danger()&#125;"))
  assert.ok(page.includes("&lt;script&gt;"))
  assert.ok(page.includes("x = {field = 1}"))
  assert.ok(page.includes("/docs/runtime-patterns/test/rule#boundary"))
  assert.ok(page.includes("/docs/runtime-patterns/history#scope-test"))
  const broken = structuredClone(s)
  broken.concepts[0] = parseConcept("test/rule.md", concept("[Bad](absent.md)"))
  broken.inputs.find((x) => x.path.endsWith("rule.md")).hash = hash(broken.concepts[0].raw)
  assert.throws(() => generate(broken, {}), /Unresolved link/)
  broken.concepts[0] = parseConcept("test/rule.md", concept("[Bad](#absent)"))
  broken.inputs.find((x) => x.path.endsWith("rule.md")).hash = hash(broken.concepts[0].raw)
  assert.throws(() => generate(broken, {}), /Unresolved anchor/)
})
test("staged failure preserves published output; human edits, collision, traversal, duplicate resources are rejected", (t) => {
  const f = fixture(t),
    s = f.get()
  approve(f.site, s)
  refresh(f.site, s)
  const before = readFileSync(join(f.site, "docs/patterns/catalog.json"))
  writeFileSync(join(f.repo, "runtime-patterns/test/rule.md"), concept("[Bad](absent.md)"))
  assert.throws(() => refresh(f.site, f.get(commit(f.repo))), /Unresolved link/)
  assert.deepEqual(readFileSync(join(f.site, "docs/patterns/catalog.json")), before)
  file(f.site, base + "human.mdx", "mine")
  assert.throws(() => refresh(f.site, s), /human output collision/)
  rmSync(join(f.site, base + "human.mdx"))
  file(f.site, base + "test/rule.mdx", "edited")
  assert.throws(() => refresh(f.site, s), /edited managed/)
  assert.throws(() => parseConcept("../escape.md", concept()), /Unsafe/)
  const duplicate = structuredClone(s)
  duplicate.concepts.push(parseConcept("test/other.md", concept()))
  assert.throws(() => validateSnapshot(duplicate), /Duplicate resource/)
})
test("incremental nested-log change invalidates visual reviews, leaves pointer unchanged, and review clears it", (t) => {
  const f = fixture(t),
    s = f.get()
  approve(f.site, s, { diagram: true })
  refresh(f.site, s)
  file(f.site, "docs/runtime-patterns-source-sync.md", `## Last reviewed commit\n\n${f.sha}\n`)
  assert.equal(check(f.site).issues.length, 0)
  file(
    f.repo,
    "runtime-patterns/test/rule.md",
    concept("# Rule\n\n## Boundary\n\nChanged transaction rule.\n"),
  )
  file(f.repo, "runtime-patterns/test/log.md", "# Nearest log\nChanged rule.\n")
  const next = f.get(commit(f.repo))
  assert.equal(
    next.reserved.find((x) => x.path === "runtime-patterns/log.md").raw,
    s.reserved.find((x) => x.path === "runtime-patterns/log.md").raw,
  )
  assert.throws(() => checkUpstream(f.site, f.repo, next.commit), /Catalog drift/)
  refresh(f.site, next)
  assert.equal(pointerSha(f.site), f.sha)
  assert.throws(
    () => check(f.site),
    /Visual assessment stale[\s\S]*Diagram binding stale[\s\S]*pointer\/snapshot disagreement/,
  )
  approve(f.site, next, { diagram: true })
  refresh(f.site, next)
  file(
    f.site,
    "docs/runtime-patterns-source-sync.md",
    `## Last reviewed commit\n\n${next.commit}\n`,
  )
  assert.equal(check(f.site).issues.length, 0)
  assert.equal(checkUpstream(f.site, f.repo, next.commit).target, next.commit)
})
test("review-only metadata and unrelated commits retain semantic binding; heading removal requires review", (t) => {
  const f = fixture(t),
    s = f.get(),
    p = approve(f.site, s, { diagram: true })
  file(f.repo, "README.md", "unrelated")
  const newer = f.get(commit(f.repo))
  assert.equal(reviewIssues(newer, p).length, 0)
  const reviewOnly = concept().replace(
    "custom:",
    "reviews: [{document_timestamp: old, outcome: approved}]\ncustom:",
  )
  assert.equal(parseConcept("test/rule.md", reviewOnly).semanticHash, s.concepts[0].semanticHash)
  file(f.repo, "runtime-patterns/test/rule.md", concept("# Rule\n\n## Renamed\n\nSame work."))
  assert.ok(reviewIssues(f.get(commit(f.repo)), p).some((x) => x.includes("heading missing")))
})
test("rename retains identity and prior route; deletion cleans normative output and keeps labeled historical route", (t) => {
  const f = fixture(t),
    s = f.get()
  approve(f.site, s)
  refresh(f.site, s)
  renameSync(
    join(f.repo, "runtime-patterns/test/rule.md"),
    join(f.repo, "runtime-patterns/test/renamed.md"),
  )
  const next = f.get(commit(f.repo))
  approve(f.site, next)
  refresh(f.site, next)
  assert.equal(next.concepts[0].resource, s.concepts[0].resource)
  assert.match(readFileSync(join(f.site, base, "test/rule.mdx"), "utf8"), /current route/)
  assert.ok(existsSync(join(f.site, base, "test/renamed.mdx")))
  rmSync(join(f.repo, "runtime-patterns/test/renamed.md"))
  file(
    f.repo,
    "runtime-patterns/test/remaining.md",
    concept("# Remaining\n", "mori://shinzui/keiro-runtime-patterns/docs/remaining"),
  )
  const removed = f.get(commit(f.repo))
  approve(f.site, removed)
  refresh(f.site, removed)
  assert.match(readFileSync(join(f.site, base, "test/renamed.mdx"), "utf8"), /owner removed/)
  assert.equal(check(f.site).issues.length, 0)
})
