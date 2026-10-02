import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { readFileSync, readdirSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"

const root = resolve(import.meta.dirname, "..")
const snapshotPath = join(root, "docs/writing/technical-terms.json")
const pagePath = join(root, "content/docs/getting-started/technical-terms.mdx")
const bundle = "mori://shinzui/keiro/okf/terminology"

function render(snapshot) {
  const rows = snapshot.terms
    .filter((entry) => entry.status === "current")
    .map((entry) => `| ${entry.term} | ${entry.meaning} | \`${entry.source}\` |`)
  const retired = snapshot.terms
    .filter((entry) => entry.status === "deprecated")
    .map((entry) => {
      const replacement = snapshot.terms.find((term) => term.id === entry.replacedBy)
      if (!replacement) throw new Error(`Missing replacement for ${entry.id}`)
      return `| ${entry.term} | ${replacement.term} | \`${entry.source}\` |`
    })
  return `---
title: Technical terms
description: Keiro technical nouns and definitions from the canonical terminology bundle.
---

Use these definitions for Keiro concepts. The source is \`${bundle}\`.
The site uses a checked snapshot of that bundle.

Use **stream** for stored event history and **event stream** for the aggregate contract.
Use **idempotency** for duplicate-effect protection. Preserve the literal DSL clause \`idempotence delegated\`.
Preserve API names, identifiers, and protocol values exactly.

These entries are project technical nouns. They do not constitute the official ASD-STE100 dictionary.
Full vocabulary and grammar review against Issue 9 remains pending.
See [Contributing](/docs/getting-started/contributing) for the writing rules.

## Current terms

| Term | Definition | Canonical source |
| --- | --- | --- |
${rows.join("\n")}

## Deprecated names

Use the replacement in new prose. These entries remain available for terminology lookup.

| Deprecated name | Replacement | Canonical source |
| --- | --- | --- |
${retired.join("\n")}
`
}

function listField(metadata, key) {
  const match = metadata.match(new RegExp(`^${key}:\\n((?:  - [^\\n]+\\n)+)`, "m"))
  return match
    ? match[1]
        .trim()
        .split("\n")
        .map((line) => line.trim().slice(2))
    : []
}

function refresh() {
  // Mori identifies the owning repository. The bundle path is declared by its manifest.
  const location = execFileSync("mori", ["path", "mori://shinzui/keiro"], { encoding: "utf8" })
    .trim()
    .split("\n")
    .at(-1)
  const directory = join(location, "docs/terminology")
  const hash = createHash("sha256")
  const terms = []
  for (const filename of readdirSync(directory)
    .filter((name) => name.endsWith(".md"))
    .toSorted()) {
    const source = readFileSync(join(directory, filename), "utf8")
    hash.update(filename).update("\0").update(source).update("\0")
    const metadata = source.split(/^---\s*$/m)[1]
    const id = metadata?.match(/^termId: (TERM-\d+)$/m)?.[1]
    if (!id) continue
    const term = metadata.match(/^title: (.+)$/m)?.[1]
    const description = metadata.match(/^description: (.+)$/m)?.[1]
    const status = metadata.match(/^status: (current|deprecated)$/m)?.[1]
    if (!term || !description?.startsWith('"') || !status)
      throw new Error(
        `Unsupported terminology metadata in ${filename}; validate the OKF bundle first.`,
      )
    const entry = {
      id,
      term,
      partsOfSpeech: ["noun"],
      meaning: JSON.parse(description),
      status,
      source: `${bundle}/concepts/${id}`,
      aliases: listField(metadata, "aliases"),
      discouraged: listField(metadata, "discouraged"),
    }
    const replacement = metadata.match(/^replacedBy: (TERM-\d+)$/m)?.[1]
    if (replacement) entry.replacedBy = replacement
    terms.push(entry)
  }
  terms.sort((a, b) => Number(a.id.slice(5)) - Number(b.id.slice(5)))
  if (!terms.length) throw new Error("The terminology bundle has no terms.")
  const snapshot = {
    standard: "ASD-STE100 Issue 9",
    status: "project technical nouns; official dictionary and grammar review pending",
    source: bundle,
    sourceSha256: hash.digest("hex"),
    terms,
  }
  writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`)
  writeFileSync(pagePath, render(snapshot))
  console.log(`Refreshed ${terms.length} terms from ${bundle}.`)
}

if (process.argv.includes("--refresh")) refresh()
else {
  const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8"))
  if (readFileSync(pagePath, "utf8") !== render(snapshot)) {
    console.error(
      "The glossary differs from its canonical snapshot. Run pnpm run sync:terminology.",
    )
    process.exitCode = 1
  } else console.log(`Glossary matches ${snapshot.terms.length} canonical terms.`)
}
