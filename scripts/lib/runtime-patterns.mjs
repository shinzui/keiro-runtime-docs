import { createHash } from "node:crypto"
import { createRequire } from "node:module"
import { posix } from "node:path"

import { frontmatter } from "fumadocs-core/content/md/frontmatter"

// Reuse the parser versions supplied by mori://fuma-nama/fumadocs.
const require = createRequire(import.meta.resolve("fumadocs-core/package.json"))
const { remark } = await import(require.resolve("remark"))
const { default: gfm } = await import(require.resolve("remark-gfm"))
const { default: Slugger } = await import(require.resolve("github-slugger"))
const processor = remark().use(gfm)
export const project = "mori://shinzui/keiro-runtime-patterns"
export const bundle = `${project}/okf/runtime-patterns`
export const base = "content/docs/runtime-patterns/"
export const hash = (value) => createHash("sha256").update(value).digest("hex")
export const json = (value) => `${JSON.stringify(value, null, 2)}\n`
export function stable(value) {
  if (Array.isArray(value)) return value.map(stable)
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stable(value[key])]),
    )
  return value
}
export function safePath(path) {
  if (
    !/^[a-z0-9][a-z0-9./_-]*$/.test(path) ||
    path.split("/").some((x) => !x || x === "." || x === "..")
  )
    throw new Error(`Unsafe catalog path: ${path}`)
  return path
}
export function parseConcept(path, raw) {
  safePath(path)
  const { data: metadata, content: body } = frontmatter(raw)
  if (
    !metadata.resource?.startsWith(`${project}/`) ||
    !metadata.title ||
    !metadata.type ||
    !metadata.status
  )
    throw new Error(`Missing identity or required metadata: ${path}`)
  const semantic = {
    body,
    status: metadata.status,
    type: metadata.type,
    applicability: metadata.applicability ?? null,
    criteria: metadata.criteria ?? null,
    patternId: metadata.patternId ?? null,
    supersededBy: metadata.supersededBy ?? null,
  }
  return {
    path,
    resource: metadata.resource,
    raw,
    metadata: stable(metadata),
    rawHash: hash(raw),
    semanticHash: hash(json(stable(semantic))),
  }
}
function walk(node, fn) {
  fn(node)
  for (const child of node.children ?? []) walk(child, fn)
}
function text(node) {
  return node.value ?? (node.children ?? []).map(text).join("")
}
export function headings(raw) {
  const tree = processor.parse(frontmatter(raw).content)
  const slugger = new Slugger()
  const result = []
  walk(tree, (node) => {
    if (node.type === "heading") result.push({ title: text(node), id: slugger.slug(text(node)) })
  })
  return result
}
export function route(path) {
  return `/docs/runtime-patterns/${path.replace(/\.md$/, "").replace(/\/?index$/, "")}`.replace(
    /\/$/,
    "",
  )
}
export const historyAnchor = (path) =>
  `scope-${path.replace(/\/log\.md$|^log\.md$/, "").replaceAll("/", "-") || "root"}`
export function validateSnapshot(snapshot) {
  if (snapshot.schemaVersion !== 1 || !/^[a-f0-9]{40}$/.test(snapshot.commit))
    throw new Error("Invalid snapshot schema or commit")
  const identities = new Set(),
    paths = new Set()
  for (const c of snapshot.concepts) {
    const parsed = parseConcept(c.path, c.raw)
    if (json(parsed) !== json(c)) throw new Error(`Concept hash/metadata disagreement: ${c.path}`)
    if (identities.has(c.resource)) throw new Error(`Duplicate resource: ${c.resource}`)
    identities.add(c.resource)
    if (paths.has(c.path)) throw new Error(`Duplicate path: ${c.path}`)
    paths.add(c.path)
  }
  const inputs = new Map(snapshot.inputs.map((x) => [x.path, x.hash]))
  const recorded = [
    ...snapshot.concepts.map((c) => ({ path: `runtime-patterns/${c.path}`, raw: c.raw })),
    ...snapshot.reserved,
    snapshot.profile,
    snapshot.watermarks,
  ]
  for (const file of recorded) {
    safePath(file.path)
    if (inputs.get(file.path) !== hash(file.raw))
      throw new Error(`Input hash disagreement: ${file.path}`)
  }
  const conceptsFromInputs = snapshot.inputs.filter(
    (x) =>
      x.path.startsWith("runtime-patterns/") &&
      x.path.endsWith(".md") &&
      !/\/(index|log)\.md$/.test(x.path),
  )
  if (conceptsFromInputs.length !== snapshot.concepts.length)
    throw new Error("Snapshot inventory omits or adds concepts")
  const graphIds = new Set(snapshot.graph.nodes.map((x) => x.id))
  if (graphIds.size !== paths.size || [...paths].some((p) => !graphIds.has(p.replace(/\.md$/, ""))))
    throw new Error("Graph/concept coverage disagreement")
  for (const e of snapshot.graph.edges)
    if (!graphIds.has(e.source) || !graphIds.has(e.target))
      throw new Error("Graph edge has a missing concept")
}
export function reviewIssues(snapshot, presentation) {
  const issues = []
  const byResource = new Map(snapshot.concepts.map((c) => [c.resource, c]))
  for (const c of snapshot.concepts) {
    const a = presentation.assessments?.[c.resource]
    if (!a || a.semanticHash !== c.semanticHash)
      issues.push(`Visual assessment stale or missing: ${c.path}`)
    else if (!a.diagrams?.length && !a.textOnlyReason)
      issues.push(`Visual assessment has no decision: ${c.path}`)
    for (const id of a?.diagrams ?? [])
      if (!presentation.diagrams?.[id]) issues.push(`Unknown diagram ${id}: ${c.path}`)
  }
  for (const [id, d] of Object.entries(presentation.diagrams ?? {})) {
    safePath(id)
    if (d.asset) safePath(d.asset)
    if (
      !d.alt ||
      !d.caption ||
      !d.reviewActor ||
      !d.reviewedAt ||
      !d.placement ||
      !Object.keys(d.sources ?? {}).length
    )
      issues.push(`Incomplete diagram review: ${id}`)
    for (const [resource, digest] of Object.entries(d.sources ?? {})) {
      const c = byResource.get(resource)
      if (!c || c.semanticHash !== digest) issues.push(`Diagram binding stale: ${id} → ${resource}`)
    }
    const placement = byResource.get(d.placement.resource)
    if (!placement || !headings(placement.raw).some((h) => h.title === d.placement.heading))
      issues.push(`Diagram heading missing: ${id}`)
    if (placement && !presentation.assessments?.[placement.resource]?.diagrams?.includes(id))
      issues.push(`Unassessed diagram placement: ${id}`)
  }
  return issues
}
function mapLink(url, path, snapshot) {
  if (/^(https?:|mailto:)/.test(url)) return url
  if (url.startsWith("mori:")) {
    const [resource, anchor] = url.split("#")
    const target = snapshot.concepts.find((c) => c.resource === resource)
    if (target) return checkAnchor(target.path, anchor, snapshot)
    return url
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) throw new Error(`Unsupported link scheme: ${url}`)
  const [relative, anchor] = url.split("#")
  const targetPath = relative
    ? posix.normalize(posix.join(posix.dirname(path), decodeURI(relative)))
    : path
  if (targetPath.startsWith("../")) {
    // Administrative artifacts are outside the bundle. Retain owner + precise path.
    const ownerPath = posix.normalize(`runtime-patterns/${targetPath}`)
    return `${project}#path=${encodeURIComponent(ownerPath)}${anchor ? `&anchor=${encodeURIComponent(anchor)}` : ""}`
  }
  if (
    /\blog\.md$/.test(targetPath) &&
    snapshot.reserved.some((x) => x.path === `runtime-patterns/${targetPath}`)
  )
    return `/docs/runtime-patterns/history#${historyAnchor(targetPath)}`
  if (
    /\bindex\.md$/.test(targetPath) &&
    snapshot.reserved.some((x) => x.path === `runtime-patterns/${targetPath}`)
  )
    return route(targetPath)
  if (!snapshot.concepts.some((x) => x.path === targetPath))
    throw new Error(`Unresolved link in ${path}: ${url}`)
  return checkAnchor(targetPath, anchor, snapshot)
}
function checkAnchor(path, anchor, snapshot) {
  const c = snapshot.concepts.find((x) => x.path === path)
  if (anchor && !headings(c.raw).some((h) => h.id === decodeURIComponent(anchor)))
    throw new Error(`Unresolved anchor in ${path}: #${anchor}`)
  return `${route(path)}${anchor ? `#${anchor}` : ""}`
}
export function markdownData(raw, path, snapshot) {
  const tree = processor.parse(frontmatter(raw).content)
  for (const node of tree.children) {
    if (node.type === "html") {
      node.type = "paragraph"
      node.children = [{ type: "text", value: node.value }]
      delete node.value
    }
  }
  walk(tree, (node) => {
    if (["link", "image", "definition"].includes(node.type))
      node.url = mapLink(node.url, path, snapshot)
    if (node.type === "html") node.type = "text"
  })
  return processor()
    .data("settings", {
      handlers: {
        text(node, parent, state, info) {
          return state
            .safe(node.value, info)
            .replace(
              /^(import|export)(?=\s)/gm,
              (word) => `&#${word.charCodeAt(0)};${word.slice(1)}`,
            )
            .replace(
              /\\?[{}<>]/g,
              (ch) => ({ "{": "&#123;", "}": "&#125;", "<": "&lt;", ">": "&gt;" })[ch.at(-1)],
            )
        },
      },
    })
    .stringify(tree)
}
function fm(title, description, extra = "") {
  return `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\n${extra}---\n\n`
}
export function provenanceText(snapshot, c) {
  const m = c.metadata
  let result = `## Source and assessment evidence\n\nCanonical resource: \`${c.resource}\`.\n\nCatalog commit: \`${snapshot.commit}\` (${snapshot.commitDate}).\n\nConcept path: \`runtime-patterns/${c.path}\`. Type: **${m.type}**. Status: **${m.status}**.\n\nMaterial timestamp: ${m.timestamp ?? m.generated?.at ?? "not supplied"}. Source actor: \`${m.generated?.by ?? "not supplied"}\`.\n\n`
  for (const r of m.reviews ?? [])
    result += `Review (${r.document_timestamp === m.timestamp ? "matches material revision" : "historical; does not match material revision"}):\n\n\`\`\`json\n${JSON.stringify(r, null, 2)}\n\`\`\`\n\n`
  if (m.applicability)
    result += `### Supplied applicability\n\n\`\`\`json\n${JSON.stringify(m.applicability, null, 2)}\n\`\`\`\n\n`
  if (m.criteria?.length) {
    result += `### Supplied assessment criteria\n\nPattern ID: \`${m.patternId}\`.\n\n`
    for (const k of m.criteria)
      result += `- **${k.id}** (${k.severity}; evidence: ${k.evidenceKind}): ${k.statement}\n`
    result += "\n"
  }
  return markdownData(result, c.path, snapshot)
}
export function conceptMarkdown(snapshot, c, presentation) {
  let body = markdownData(c.raw, c.path, snapshot)
  for (const [id, d] of Object.entries(presentation.diagrams ?? {})) {
    if (d.placement.resource !== c.resource) continue
    const tree = processor.parse(body)
    const heading = tree.children.find(
      (n) => n.type === "heading" && text(n) === d.placement.heading,
    )
    if (!heading) throw new Error(`Diagram placement unavailable: ${id}`)
    const at = heading.position.end.offset
    body = `${body.slice(0, at)}\n\nSupplementary explanation: ${d.caption}\n\n<Diagram src="${d.asset ?? `runtime-patterns/${id}`}" alt=${JSON.stringify(d.alt)} caption=${JSON.stringify(d.caption)} />\n${body.slice(at)}`
  }
  const assessment = presentation.assessments?.[c.resource]
  const shared = (assessment?.diagrams ?? [])
    .map((id) => [id, presentation.diagrams[id]])
    .filter(([, d]) => d && d.placement.resource !== c.resource)
    .map(([, d]) => {
      const target = snapshot.concepts.find((x) => x.resource === d.placement.resource)
      const anchor = headings(target.raw).find((h) => h.title === d.placement.heading).id
      return `[${d.caption}](${route(target.path)}#${anchor})`
    })
  const links = assessment?.relatedPages ?? []
  return (
    provenanceText(snapshot, c) +
    (shared.length ? `Related supplementary explanations: ${shared.join(", ")}.\n\n` : "") +
    (links.length
      ? `Related product pages: ${links.map((x) => `[${x.label}](${x.route})`).join(", ")}.\n\n`
      : "") +
    `## Canonical source quotation\n\nThis is a versioned source quotation. Historical examples and candidate claims retain their original qualification.\n\n${body}`
  )
}
export function generate(snapshot, presentation) {
  validateSnapshot(snapshot)
  const outputs = new Map()
  const put = (p, content) => {
    safePath(p)
    if (outputs.has(p)) throw new Error(`Output collision: ${p}`)
    outputs.set(p, content)
  }
  const dirs = new Map([["", []]])
  for (const c of snapshot.concepts) {
    const path = c.path.replace(/\.md$/, ".mdx")
    put(
      base + path,
      fm(
        c.metadata.title,
        c.metadata.description,
        `patternResource: ${JSON.stringify(c.resource)}\n`,
      ) +
        `<PatternProvenance resource=${JSON.stringify(c.resource)} commit=${JSON.stringify(snapshot.commit)} />\n\n` +
        conceptMarkdown(snapshot, c, presentation),
    )
    let dir = posix.dirname(path) === "." ? "" : posix.dirname(path)
    if (!dirs.has(dir)) dirs.set(dir, [])
    dirs.get(dir).push(posix.basename(path, ".mdx"))
    while (dir) {
      const parent = posix.dirname(dir) === "." ? "" : posix.dirname(dir)
      if (!dirs.has(parent)) dirs.set(parent, [])
      dir = parent
    }
  }
  // Historical stubs keep their navigation even when an entire subject is removed.
  for (const old of Object.keys(presentation.retiredRoutes ?? {})) {
    let dir = posix.dirname(safePath(old))
    while (dir !== ".") {
      if (!dirs.has(dir)) dirs.set(dir, [])
      dir = posix.dirname(dir)
    }
  }
  for (const [dir, pages] of [...dirs].sort()) {
    const concepts = snapshot.concepts.filter(
      (c) => (posix.dirname(c.path) === "." ? "" : posix.dirname(c.path)) === dir,
    )
    const sections = [...dirs.keys()]
      .filter((x) => x && (posix.dirname(x) === "." ? "" : posix.dirname(x)) === dir)
      .map((x) => posix.basename(x))
      .sort()
    const prefix = base + (dir ? `${dir}/` : "")
    const title = dir ? dir.charAt(0).toUpperCase() + dir.slice(1) : "Runtime patterns"
    let body = fm(title, "Versioned canonical runtime standards, guides, and source evidence.")
    body += `Read the canonical catalog at \`${bundle}\`. This presentation uses commit \`${snapshot.commit}\`.\n\n`
    if (!dir)
      body += `The catalog contains **${snapshot.concepts.length} concepts**. Publication preserves source claims; it does not certify agent compliance.\n\nRead [the audit procedure](/docs/runtime-pattern-audit) and [scoped change history](/docs/runtime-patterns/history).\n\n`
    for (const s of sections)
      body += `- [${s}](/docs/runtime-patterns/${dir ? `${dir}/` : ""}${s})\n`
    body +=
      "\n| Concept | Type | Status |\n| --- | --- | --- |\n" +
      concepts
        .map(
          (c) =>
            `| [${c.metadata.title}](${route(c.path)}) | ${c.metadata.type} | ${c.metadata.status} |`,
        )
        .join("\n") +
      "\n"
    if (!dir)
      body += `\n## Declared source review watermarks\n\nThese are the owner's review declarations. They do not establish current dependency freshness. Import does not advance them.\n\n\`\`\`json\n${JSON.stringify(JSON.parse(snapshot.watermarks.raw), null, 2)}\n\`\`\`\n`
    put(prefix + "index.mdx", body)
    put(
      prefix + "meta.json",
      json({ title, pages: ["index", ...sections, ...pages.sort(), ...(!dir ? ["history"] : [])] }),
    )
  }
  let history =
    fm("Catalog change history", "Scoped owner logs from the published catalog revision.") +
    `Catalog commit: \`${snapshot.commit}\`. Logs provide review context; Git inventory provides coverage.\n\n`
  for (const f of snapshot.reserved.filter((x) => x.path.endsWith("log.md"))) {
    const path = f.path.replace(/^runtime-patterns\//, "")
    history += `<h2 id="${historyAnchor(path)}">${path}</h2>\n\n\`\`\`text\n${f.raw.trim()}\n\`\`\`\n\n`
  }
  put(base + "history.mdx", history)
  for (const [old, entry] of Object.entries(presentation.retiredRoutes ?? {})) {
    const path = base + safePath(old.replace(/\.md$/, ".mdx"))
    put(
      path,
      fm(
        entry.successor ? "Moved catalog concept" : "Removed catalog concept",
        "Historical route from an earlier catalog publication.",
      ) +
        `Canonical identity: \`${entry.resource}\`.\n\n${entry.successor ? `This concept moved to [its current route](${entry.successor}).` : "The owner removed this concept. Consult the prior publication revision and scoped history before applying it."}\n`,
    )
    const metaPath =
      base + (posix.dirname(old) === "." ? "" : `${posix.dirname(old)}/`) + "meta.json"
    if (!outputs.has(metaPath))
      throw new Error(`Retired route requires a retained navigation section: ${old}`)
    const meta = JSON.parse(outputs.get(metaPath))
    meta.pages.push(posix.basename(old, ".md"))
    outputs.set(metaPath, json(meta))
  }
  return outputs
}
