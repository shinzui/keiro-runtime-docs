import { base } from "./runtime-patterns.mjs"

// Only byte-identical regenerated source fields receive the quotation exception.
export function patternProse(key, prose, snapshot, presentation, generated) {
  const findings = []
  const concept = snapshot?.concepts.find((c) => key === base + c.path.replace(/\.md$/, ".mdx"))
  if (concept) {
    if (generated.get(key) !== prose)
      findings.push({
        file: key,
        line: 1,
        rule: "source-quotation-integrity",
        severity: "error",
        detail: "Source quotation differs from verified generation.",
      })
    else {
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
  if (!concept && generated.get(key) === prose && key.endsWith("/index.mdx")) {
    // The owner's watermark notes are quoted evidence, like concept bodies.
    // Keep the exception behind the same exact-generation check so local
    // captions and forged provenance remain subject to the normal rules.
    prose = prose.replace(/<PatternProvenance>[\s\S]*?<\/PatternProvenance>/g, "")
    for (const c of snapshot.concepts) {
      prose = prose.replaceAll(`[${c.metadata.title}]`, "[Source concept]")
      prose = prose.replaceAll(
        `| ${c.metadata.type} | ${c.metadata.status} |`,
        "| Source type | Source status |",
      )
    }
  }
  return { prose, findings }
}
