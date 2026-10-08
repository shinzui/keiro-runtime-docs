# Diagram authoring guide

The docs use two kinds of diagrams. Choose by what the picture must show.

## Mermaid or SVG?

Use a **Mermaid** fence (```` ```mermaid ````) when the content is a graph of named things and
connections, and automatic layout is good enough:

- control flow and decision trees (`flowchart`)
- message order between participants (`sequenceDiagram`)
- lifecycle states and transitions (`stateDiagram-v2`)
- type or table relationships (`classDiagram`, `erDiagram`)

The renderer is beautiful-mermaid. It supports only `flowchart`/`graph`, `stateDiagram-v2`,
`sequenceDiagram`, `classDiagram`, `erDiagram`, and `xychart-beta`. Do not use `pie`, `gantt`,
`timeline`, `journey`, `mindmap`, or `block-beta`.
Known renderer limits: a `[` inside a quoted flowchart label breaks the node, and state
descriptions (`S: label`) do not render. The renderer reports no syntax errors, so always look
at the preview. Decision diamonds with long labels grow very large; use a short
diamond label, or a rectangle node for the question.

Use a **hand-authored SVG** when position carries meaning, and automatic layout would hide it:

- data layout: table rows, junction rows, pages, cursors, offsets, register files
- time axes: timelines, retries, leases, timers, lag, interleaving of streams
- layers and boundaries: architecture stacks, transaction scopes, process or package boundaries
- before/after or side-by-side comparisons
- composition wiring (products, feedback loops, parallel lanes) where the shape is the idea
- anything where a reader must compare sizes, order, or alignment

When in doubt, prefer Mermaid for flows and SVG for structure.

## Embedding an SVG

Put the file at `content/diagrams/<product>/<area>/<name>.svg` (or `<product>/<name>.svg`) and
reference it without the extension:

```mdx
<Diagram
  src="kiroku/all-log-placements"
  alt="Six events in three source streams. Each event also has a row in the $all log."
  caption="Each event has a source stream version and a $all position."
/>
```

- `alt` is required. It describes what the picture shows, in full sentences, for a reader who
  cannot see it.
- `caption` is optional. It states the one idea the reader should take away.
- Both are checked by the prose linter (`bun run lint:docs`): use short sentences (25 words or
  fewer), no contractions, no "in order to", "prior to", "utilize", "happy path", "gotcha".
- Introduce every diagram with a sentence in the prose, and place it next to the text it explains.

## SVG file contract

`bun run lint:diagrams` enforces most of this.

- Root: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 W H">`. No `width`/`height`.
- **Width: W ≤ 680.** The content column is about 620 px wide, so wider diagrams shrink their text.
  Use a taller layout instead of a wider one. H is free.
- **No colors in the file.** No `fill="#…"`, `stroke="red"`, `style="…"`, and no `<style>`. Use
  the classes below. `fill="none"` is fine. The classes switch automatically between light and
  dark themes.
- Arrowheads: `marker-end="url(#arrow)"` or `url(#arrow-<tone>)`. Dots: `url(#dot)`,
  `url(#dot-<tone>)`. These markers are injected; do not define them. Markers use
  `orient="auto-start-reverse"`, so `marker-start="url(#arrow)"` points backward.
- Your own ids are allowed (for `<clipPath>`, `<use>`). They are prefixed per instance.
- Escape `&`, `<`, `>` in text as `&amp;`, `&lt;`, `&gt;`.
- Every file must be used by a page. One idea per diagram.

### Classes (from `src/styles/diagrams.css`)

Tones: `accent` (teal, the main subject), `amber` (warnings, retries, side effects), `violet`
(a second category), `rose` (errors, failures, rejection), `green` (success, committed),
`muted` (background or out-of-scope things). Use color to encode meaning, and keep it consistent
within a diagram. Most shapes should stay neutral.

| Element                   | Class                            | Effect                                                    |
| ------------------------- | -------------------------------- | --------------------------------------------------------- |
| `rect`, `circle`, `path`  | `node` (+ tone)                  | Box: surface fill, border stroke (tone: tinted fill)      |
|                           | `node dashed`; `node ghost`      | Dashed border; no fill (combine: `node ghost dashed`)     |
| `rect`, `path`            | `group` (+ tone)                 | Dashed container outline, no fill (boundaries, scopes)    |
| `rect`                    | `band` (+ tone)                  | Filled region without stroke (lanes, rows); tone adds stroke |
| `path`, `line`            | `edge` (+ tone)                  | Connector line                                            |
|                           | `edge dashed`, `edge dotted`, `edge thick` | Line styles                                     |
| `line`, `path`            | `axis` (+ tone, `dashed`)        | Thin muted rule for scales, dividers, time axes           |
| `circle`                  | `dot` (+ tone)                   | Filled point                                              |
| `text`                    | (none)                           | 13 px sans, foreground color                              |
|                           | `title`                          | 14 px semibold                                            |
|                           | `heading`                        | 12 px uppercase muted label for a region                  |
|                           | `small`                          | 11.5 px                                                   |
|                           | `code`                           | Monospace 12.5 px (identifiers, types, SQL)               |
|                           | `bold`, `italic`                 | Weight and style                                          |
|                           | `muted` or a tone                | Text color                                                |
|                           | `halo`                           | Background outline, for a label that crosses a line       |

Combine classes: `<text class="code small accent">`, `<rect class="node rose dashed">`.

### Layout tips

- Use a grid. Align boxes on shared x/y values, and keep equal gaps.
- Box text: center it with `text-anchor="middle"`; the baseline sits about 4–5 px below the
  vertical center for 13 px text. Box height 30–36 for one line.
- Give text room: about 7.5 px per character for 13 px sans, 7.6 px for 12.5 px code. Leave
  about 15% slack, because fonts differ by platform.
- Keep labels off lines. Put edge labels beside the line, or use `halo` on a solid line. `halo`
  covers only the glyphs, so a dashed line still shows between words.
- Prefer orthogonal connectors (`M x y H x2 V y2`). Stop arrows a few px before the target box.

## Preview and check

```sh
node scripts/render-diagram.mjs content/diagrams/kiroku/all-log-placements.svg
# -> .cache/diagram-previews/kiroku-all-log-placements.{light,dark}.png
node scripts/render-diagram.mjs --mermaid content/docs/kiroku/index.mdx
# -> one PNG per mermaid fence on that page
bun run lint:diagrams
bun run lint:docs
```

Look at both PNGs before you finish. Check for clipped or overlapping text, labels on lines,
arrows that miss their target, and contrast in the dark theme.
