// Editorial review aid. This is not an ASD-STE100 dictionary or grammar validator.
const contraction =
  /\b(?:can['’]t|won['’]t|don['’]t|doesn['’]t|didn['’]t|isn['’]t|aren['’]t|wasn['’]t|weren['’]t|hasn['’]t|haven['’]t|hadn['’]t|shouldn['’]t|wouldn['’]t|couldn['’]t|mustn['’]t|it['’]s|that['’]s|there['’]s|you['’](?:re|ve|ll|d)|we['’](?:re|ve|ll|d)|they['’](?:re|ve|ll|d)|let['’]s)\b/gi
const editorialPhrase =
  /\b(?:in order to|prior to|utili[sz]e|blast radius|footgun|gotchas?|happy path|escape hatch)\b/gi

export function plainText(text, keepIdentifiers = false) {
  return text
    .replace(/`+[^`\n]*`+/g, keepIdentifiers ? "$&" : "TECHNICAL_IDENTIFIER")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/[^\s)]+/g, "TECHNICAL_IDENTIFIER")
    .replace(/[*_]/g, "")
    .replace(/&(?:amp|lt|gt|quot|apos);/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** Extract visible prose, with original line locations. Code and JSX expressions stay literal. */
export function proseBlocks(source) {
  const lines = source.split("\n")
  const blocks = []
  let paragraph = []
  let paragraphLine = 1
  let fence = null
  let frontmatter = lines[0] === "---"
  let component = null
  let paragraphProcedural = false
  const flush = () => {
    if (paragraph.length) {
      blocks.push({
        line: paragraphLine,
        text: paragraph.join(" "),
        procedural: paragraphProcedural,
      })
      paragraph = []
      paragraphProcedural = false
    }
  }
  const descriptions = (text, line) => {
    for (const match of text.matchAll(/\b(?:description|title)\s*(?:=|:)\s*"((?:\\.|[^"\\])*)"/g)) {
      const location = line + text.slice(0, match.index).split("\n").length - 1
      blocks.push({ line: location, text: match[1].replace(/\\"/g, '"'), procedural: false })
    }
  }
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]
    const number = index + 1
    const marker = line.match(/^\s*(`{3,}|~{3,})(.*)$/)
    if (fence) {
      if (
        marker &&
        marker[1][0] === fence[0] &&
        marker[1].length >= fence.length &&
        !marker[2].trim()
      )
        fence = null
      continue
    }
    if (marker) {
      flush()
      fence = marker[1]
      continue
    }
    if (frontmatter) {
      if (index > 0 && line === "---") frontmatter = false
      else if (/^(description|title):/.test(line)) {
        blocks.push({
          line: number,
          text: line.replace(/^\w+:\s*/, "").replace(/^"|"$/g, ""),
          procedural: false,
        })
      }
      continue
    }
    if (component) {
      component.text += `\n${line}`
      if (/\/?>\s*$/.test(line)) {
        descriptions(component.text, component.line)
        component = null
      }
      continue
    }
    if (/^\s*(?:import |export |\{\/\*)/.test(line)) {
      flush()
      continue
    }
    if (/^\s*<[A-Z]/.test(line) && !line.includes(">")) {
      flush()
      component = { text: line, line: number }
      continue
    }
    if (/^\s*</.test(line)) {
      flush()
      descriptions(line, number)
      const body = line.replace(/<[^>]*>/g, "").trim()
      if (body) blocks.push({ line: number, text: body, procedural: false })
      continue
    }
    if (!line.trim()) {
      flush()
      continue
    }
    if (/^\s*#/.test(line)) {
      flush()
      blocks.push({ line: number, text: line.replace(/^\s*#+\s*/, ""), heading: true })
      continue
    }
    if (/^\s*\|/.test(line)) {
      flush()
      for (const cell of line.replace(/\\\|/g, "PIPE").split("|").filter(Boolean)) {
        if (!/^\s*[-:]+\s*$/.test(cell))
          blocks.push({ line: number, text: cell, procedural: false })
      }
      continue
    }
    const list = line.match(/^\s*(?:\d+[.)]|[-+*])\s+(.*)/)
    if (list) {
      flush()
      paragraphLine = number
      paragraph.push(list[1])
      // Numbered items are instructions. Unnumbered items can be descriptions.
      paragraphProcedural = /^\s*\d+[.)]/.test(line)
    } else {
      if (!paragraph.length) paragraphLine = number
      paragraph.push(line.replace(/^\s*>\s?/, ""))
    }
  }
  flush()
  return blocks
}

export function analyzeMdx(source) {
  const findings = []
  const add = (line, rule, severity, detail) => findings.push({ line, rule, severity, detail })
  const lines = source.split("\n")
  let fence = null
  let content = []
  let start = 0
  for (let index = 0; index < lines.length; index++) {
    const marker = lines[index].match(/^\s*(`{3,}|~{3,})(.*)$/)
    if (!fence && marker) {
      fence = marker[1]
      content = []
      start = index + 2
      continue
    }
    if (
      fence &&
      marker &&
      marker[1][0] === fence[0] &&
      marker[1].length >= fence.length &&
      !marker[2].trim()
    ) {
      const code = content.join("\n")
      const declaration = code.match(/^\s*language keiro-dsl\s+(\d+)\s*$/m)
      const context = code.match(/^context\s+[^\n]+/m)
      if (declaration && declaration[1] !== "6")
        add(start, "language-6", "error", "A source example selects an unsupported DSL language.")
      if (context && (!declaration || declaration.index > context.index))
        add(
          start,
          "language-preamble",
          "error",
          "A complete source example must declare Language 6 before context.",
        )
      fence = null
    } else if (fence) content.push(lines[index])
  }
  for (const block of proseBlocks(source)) {
    const text = plainText(block.text)
    for (const match of text.matchAll(contraction))
      add(block.line, "contraction", "error", match[0])
    for (const match of text.matchAll(editorialPhrase))
      add(block.line, "word-choice", "error", match[0])
    if (block.heading) continue
    // Protect abbreviations; punctuation inside inline identifiers was already removed.
    const sentences = text
      .replace(/\b(?:e\.g|i\.e)\./g, "ABBREVIATION")
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean)
    const limit = block.procedural ? 20 : 25
    for (const sentence of sentences) {
      const count = sentence.split(/\s+/).filter(Boolean).length
      if (count > limit)
        add(
          block.line,
          "sentence-length",
          "review",
          `${count}/${limit} estimated words: ${sentence}`,
        )
    }
    if (sentences.length > 6)
      add(block.line, "paragraph-length", "review", `${sentences.length}/6 estimated sentences.`)
  }
  return findings
}
