// Source-level internal-link checker for the docs content tree.
//
// Why this exists: the site is a client-rendered TanStack Start SPA. Its
// prerendered HTML files are hydration shells with ZERO static <a> tags — the
// navbar, sidebar, and MDX body links are all injected by JavaScript at runtime
// (verified: `grep -c '<a ' .output/public/docs/**/index.html` => 0). A static
// HTML crawler (linkinator over .output/public) therefore finds ~0 links and
// cannot catch a broken in-content link. This script closes that gap by checking
// links at the SOURCE: it scans every content/docs/**/*.mdx file for internal
// doc links and fails if any points at a page that does not exist.
//
// It is deterministic and offline (no network, no build needed). External links
// (http/https/mailto) and pure same-page anchors (#...) are skipped.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs"
import { join, dirname, resolve, relative } from "node:path"

const ROOT = resolve(import.meta.dirname, "..")
const DOCS_DIR = join(ROOT, "content", "docs")

/** Recursively collect every .mdx file under content/docs. */
function collectMdx(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    // `_templates/` holds copy-me skeletons with illustrative placeholder links
    // (e.g. `./00-start-here`) that are not real pages; it is hidden from nav.
    if (entry === "_templates") continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...collectMdx(full))
    else if (entry.endsWith(".mdx")) out.push(full)
  }
  return out
}

/** Extract link targets from markdown `[..](target)` and JSX `href="target"`. */
function extractTargets(src) {
  const targets = []
  // Markdown links: [text](target) — ignore image links' titles; capture up to space or ).
  for (const m of src.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) targets.push(m[1])
  // JSX href="target" / href='target'
  for (const m of src.matchAll(/href=["']([^"']+)["']/g)) targets.push(m[1])
  return targets
}

/**
 * Resolve an internal docs URL (e.g. "/docs/kiroku/explanation/event-sourcing")
 * to a file on disk. Returns true if a matching page exists. Handles:
 *   - section roots         -> <dir>/index.mdx
 *   - leaf pages            -> <path>.mdx
 *   - raw markdown routes   -> trailing ".md" stripped
 */
function docUrlExists(urlPath) {
  let p = urlPath.replace(/^\/docs\/?/, "").replace(/\/$/, "")
  if (p.endsWith(".md")) p = p.slice(0, -3) // raw-markdown route (/docs/x.md)
  if (p === "") return existsSync(join(DOCS_DIR, "index.mdx"))
  const asPage = join(DOCS_DIR, `${p}.mdx`)
  const asIndex = join(DOCS_DIR, p, "index.mdx")
  return existsSync(asPage) || existsSync(asIndex)
}

/** Resolve a relative link (./x, ../x) against the file's directory. */
function relativeExists(fileDir, target) {
  let p = target.split("#")[0]
  if (p === "") return true // pure anchor handled by caller
  if (p.endsWith(".md")) p = p.slice(0, -3)
  const base = resolve(fileDir, p)
  return existsSync(`${base}.mdx`) || existsSync(join(base, "index.mdx"))
}

const files = collectMdx(DOCS_DIR)
const broken = []

for (const file of files) {
  const src = readFileSync(file, "utf8")
  const fileDir = dirname(file)
  for (const raw of extractTargets(src)) {
    const target = raw.trim()
    // Skip externals, protocol-relative, mailto/tel, pure anchors, and template placeholders.
    if (/^(https?:|mailto:|tel:|#|\/\/)/.test(target)) continue
    if (target.startsWith("[") || target.includes("](")) continue // nested/garbage
    const noAnchor = target.split("#")[0]
    if (noAnchor === "") continue

    let ok
    if (noAnchor.startsWith("/docs")) ok = docUrlExists(noAnchor)
    else if (noAnchor.startsWith("/"))
      ok = false // absolute non-docs internal link: unknown route
    else ok = relativeExists(fileDir, noAnchor) // relative

    if (!ok) broken.push({ file: relative(ROOT, file), target })
  }
}

if (broken.length > 0) {
  console.error(`✗ ${broken.length} broken internal doc link(s):`)
  for (const b of broken) console.error(`  ${b.file} -> ${b.target}`)
  process.exit(1)
}
console.log(`✓ doc links OK — checked ${files.length} files, no broken internal links.`)
