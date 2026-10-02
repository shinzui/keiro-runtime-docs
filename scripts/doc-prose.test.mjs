import assert from "node:assert/strict"
import test from "node:test"

import { analyzeMdx, proseBlocks } from "./doc-prose.mjs"

test("English checks preserve literal code and identifiers", () => {
  const source =
    "Use `don't` as the literal key.\n\n```text\nDon't change the literal.\n```\n\nDon't omit the declaration."
  const findings = analyzeMdx(source).filter((item) => item.rule === "contraction")
  assert.equal(findings.length, 1)
  assert.equal(findings[0].line, 7)
})

test("complete sources require Language 6 before context", () => {
  for (const code of ["context service", "context service\nlanguage keiro-dsl 6"]) {
    assert.ok(
      analyzeMdx(`\`\`\`keiro-dsl\n${code}\n\`\`\``).some(
        (item) => item.rule === "language-preamble",
      ),
    )
  }
  assert.ok(
    analyzeMdx("```keiro-dsl\nlanguage keiro-dsl 5\ncontext service\n```").some(
      (item) => item.rule === "language-6",
    ),
  )
  assert.equal(
    analyzeMdx(
      "```keiro-dsl\nlanguage keiro-dsl 6\ncontext service\n```\n\n```keiro-dsl\nregs count:Int=0\n```",
    ).length,
    0,
  )
})

test("visible MDX descriptions are prose, while type expressions remain literal", () => {
  const source =
    '<TypeTable\n  type={{\n    field: { type: "Don\'t", description: "Don\'t omit the value." },\n  }}\n/>\n\n<Callout type="info">Don\'t skip verification.</Callout>'
  const findings = analyzeMdx(source).filter((item) => item.rule === "contraction")
  assert.deepEqual(
    findings.map((item) => item.line),
    [3, 7],
  )
})

test("sentence review includes descriptions and uses a procedural limit", () => {
  const words = Array.from({ length: 23 }, () => "word").join(" ")
  const source = `---\ntitle: Page\ndescription: ${words}\n---\n\n${words}.\n\n1. ${words}.`
  const findings = analyzeMdx(source).filter((item) => item.rule === "sentence-length")
  assert.equal(findings.length, 1)
  assert.match(findings[0].detail, /^23\/20/)
})

test("links, escaped table separators, and wrapped paragraphs stay visible", () => {
  const blocks = proseBlocks(
    "Read [the guide](/docs/guide).\nThis is the same paragraph.\n\n| Field | Text \\| value |\n| --- | --- |",
  )
  assert.ok(blocks.some((item) => item.text.includes("same paragraph")))
  assert.ok(blocks.some((item) => item.text.includes("Text PIPE value")))
})

test("sentence boundaries allow lowercase product names and protect abbreviations", () => {
  const words = Array.from({ length: 18 }, () => "word").join(" ")
  assert.equal(analyzeMdx(`${words}. keiro-dsl supports this operation, e.g. a query.`).length, 0)
})
