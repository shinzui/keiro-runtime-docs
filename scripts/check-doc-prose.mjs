import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join, relative, resolve } from "node:path"

import { analyzeMdx } from "./doc-prose.mjs"
import { generate, base } from "./lib/runtime-patterns.mjs"

const root = resolve(import.meta.dirname, "..")
const docs = join(root, "content/docs")
const args = new Set(process.argv.slice(2))
const review = args.has("--review")
const json = args.has("--json")
const files = []
function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) collect(path)
    else if (entry.name.endsWith(".mdx")) files.push(path)
  }
}
collect(docs)
files.sort()
const findings = []
const snapshotPath = join(root, "docs/patterns/catalog.json")
const presentationPath = join(root, "docs/patterns/presentation.json")
const snapshot = existsSync(snapshotPath) ? JSON.parse(readFileSync(snapshotPath, "utf8")) : null
const presentation = snapshot ? JSON.parse(readFileSync(presentationPath, "utf8")) : null
const generated = snapshot ? generate(snapshot, presentation) : new Map()
for (const path of files) {
  let prose = readFileSync(path, "utf8")
  const key = relative(root, path)
  const concept = snapshot?.concepts.find((c) => key === base + c.path.replace(/\.md$/, ".mdx"))
  if (concept) {
    if (generated.get(key) !== prose) {
      findings.push({
        file: key,
        line: 1,
        rule: "source-quotation-integrity",
        severity: "error",
        detail: "Source quotation differs from verified generation.",
      })
    } else {
      // Only proven source fields are exempt. Site-owned captions, alt text, and links retain normal checks.
      prose = Object.values(presentation.diagrams ?? {})
        .filter((d) => d.placement.resource === concept.resource)
        .map((d) => `${d.alt}\n\n${d.caption}`)
        .join("\n\n")
      prose +=
        "\n" +
        (presentation.assessments[concept.resource]?.relatedPages ?? [])
          .map((x) => x.label)
          .join("\n")
    }
  }
  for (const finding of analyzeMdx(prose)) {
    findings.push({ file: relative(root, path), ...finding })
  }
}
for (const path of [
  "example-app",
  "keiro/how-to/upgrade-a-0-1-database.mdx",
  "keiro/how-to/migrate-a-keiro-spec-to-0-2.mdx",
  "keiro/explanation/migrating-from-tan-event-source.mdx",
  "keiro/explanation/the-jitsurei-example.mdx",
  "keiro/explanation/workflow-roadmap.mdx",
  "keiro/how-to/adopt-generated-haskell-v2.mdx",
]) {
  if (existsSync(join(docs, path)))
    findings.push({
      file: `content/docs/${path}`,
      line: 1,
      rule: "retired-content",
      severity: "error",
      detail: "This content is outside the initial-release documentation scope.",
    })
}
const terminology = JSON.parse(
  readFileSync(join(root, "docs/writing/technical-terms.json"), "utf8"),
)
const terms = new Set()
for (const entry of terminology.terms) {
  if (terms.has(entry.term) || !entry.meaning || !entry.partsOfSpeech?.length) {
    findings.push({
      file: "docs/writing/technical-terms.json",
      line: 1,
      rule: "terminology",
      severity: "error",
      detail: `Invalid or duplicate term: ${entry.term}`,
    })
  }
  terms.add(entry.term)
}
const errors = findings.filter((finding) => finding.severity === "error")
const reviews = findings.filter((finding) => finding.severity === "review")
if (json) {
  console.log(
    JSON.stringify(
      {
        standard: "ASD-STE100 Issue 9",
        compliance: "unverified; official dictionary review pending",
        pages: files.length,
        errors: errors.length,
        reviewFindings: reviews.length,
        findings,
      },
      null,
      2,
    ),
  )
} else {
  const selected = review ? findings : errors
  for (const item of selected)
    console.log(`${item.file}:${item.line}: ${item.rule}: ${item.detail}`)
  console.log(
    `Checked ${files.length} pages/templates: ${errors.length} errors; ${reviews.length} editorial findings.`,
  )
  console.log("This review aid does not establish ASD-STE100 compliance.")
}
if (errors.length) process.exitCode = 1
