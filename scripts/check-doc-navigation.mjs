// Offline navigation-integrity checker for the Fumadocs content tree.
//
// Fumadocs discovers MDX independently of meta.json, so a production build can
// succeed while a page is absent from the sidebar. This script treats each
// directory's meta.json as the owner of its immediate pages and child sections:
// every entry must resolve, and every owned target must appear exactly once.
// `_templates/` is intentionally excluded because it contains copy-me files,
// not published documentation.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative, resolve } from "node:path"

const ROOT = resolve(import.meta.dirname, "..")
const DOCS_DIR = join(ROOT, "content", "docs")
const IGNORED_DIRECTORIES = new Set(["_templates"])

const contentDirectories = []

function scanDirectory(dir) {
  const entries = readdirSync(dir, { withFileTypes: true })
  const pages = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => entry.name)
    .toSorted()
  const sections = []

  for (const entry of entries) {
    if (!entry.isDirectory() || IGNORED_DIRECTORIES.has(entry.name)) continue
    const child = join(dir, entry.name)
    if (scanDirectory(child)) sections.push(entry.name)
  }

  const sortedSections = sections.toSorted()
  const hasDocs = pages.length > 0 || sortedSections.length > 0
  if (hasDocs) contentDirectories.push({ dir, pages, sections: sortedSections })
  return hasDocs
}

scanDirectory(DOCS_DIR)
const sortedContentDirectories = contentDirectories.toSorted((a, b) => a.dir.localeCompare(b.dir))

const failures = []
let pageCount = 0

function fail(metaFile, message) {
  failures.push(`${relative(ROOT, metaFile)}: ${message}`)
}

for (const { dir, pages, sections } of sortedContentDirectories) {
  pageCount += pages.length
  const metaFile = join(dir, "meta.json")
  if (!existsSync(metaFile)) {
    failures.push(`${relative(ROOT, dir)}: missing meta.json`)
    continue
  }

  let metadata
  try {
    metadata = JSON.parse(readFileSync(metaFile, "utf8"))
  } catch (error) {
    fail(metaFile, `invalid JSON (${error.message})`)
    continue
  }

  if (!Array.isArray(metadata.pages)) {
    fail(metaFile, 'expected a "pages" array')
    continue
  }

  const rawCounts = new Map()
  const resolvedCounts = new Map()

  for (const entry of metadata.pages) {
    if (typeof entry !== "string" || entry.length === 0) {
      fail(metaFile, `invalid page entry ${JSON.stringify(entry)}; expected a non-empty string`)
      continue
    }
    if (entry.includes("/") || entry === "." || entry === "..") {
      fail(
        metaFile,
        `unsupported page entry ${JSON.stringify(entry)}; use an immediate page or section name`,
      )
      continue
    }

    rawCounts.set(entry, (rawCounts.get(entry) ?? 0) + 1)

    const page = join(dir, `${entry}.mdx`)
    const section = join(dir, entry)
    const hasPage = existsSync(page)
    const hasSection = existsSync(section) && statSync(section).isDirectory()

    if (hasPage && hasSection) {
      fail(metaFile, `${JSON.stringify(entry)} is ambiguous: both a page and a section exist`)
      continue
    }
    if (!hasPage && !hasSection) {
      fail(metaFile, `${JSON.stringify(entry)} does not resolve to an MDX page or child section`)
      continue
    }

    const target = hasPage ? `page:${entry}` : `section:${entry}`
    resolvedCounts.set(target, (resolvedCounts.get(target) ?? 0) + 1)
  }

  for (const [entry, count] of rawCounts) {
    if (count > 1) fail(metaFile, `${JSON.stringify(entry)} appears ${count} times`)
  }

  const expectedTargets = [
    ...pages.map((page) => `page:${page.slice(0, -".mdx".length)}`),
    ...sections.map((section) => `section:${section}`),
  ]

  for (const target of expectedTargets) {
    const count = resolvedCounts.get(target) ?? 0
    const label = target.slice(target.indexOf(":") + 1)
    if (count === 0) fail(metaFile, `${JSON.stringify(label)} is omitted from navigation`)
    else if (count > 1) fail(metaFile, `${JSON.stringify(label)} resolves ${count} times`)
  }
}

if (failures.length > 0) {
  console.error(`✗ ${failures.length} documentation navigation error(s):`)
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}

console.log(
  `✓ doc navigation OK — checked ${sortedContentDirectories.length} metadata files and ${pageCount} pages.`,
)
