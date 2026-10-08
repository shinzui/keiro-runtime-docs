// Render diagrams to PNG for local visual review.
//
//   node scripts/render-diagram.mjs content/diagrams/kiroku/x.svg [more.svg ...]
//     -> <out>/<product>-<name>.light.png and .dark.png
//   node scripts/render-diagram.mjs --mermaid content/docs/kiroku/index.mdx [more.mdx ...]
//     -> <out>/<page>.mermaid-<n>.png (one per ```mermaid fence, light theme)
//
// Options: --out <dir> (default .cache/diagram-previews), --theme light|dark|both.
// Uses the same SVG transform and stylesheet as the site, rendered by headless Chrome.
import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join, relative, resolve } from "node:path"

import { prepareDiagramSvg } from "../src/lib/diagram-svg.mjs"

const root = resolve(import.meta.dirname, "..")
const argv = process.argv.slice(2)
const option = (name, fallback) => {
  const i = argv.indexOf(name)
  if (i === -1) return fallback
  const [value] = argv.splice(i, 2).slice(1)
  return value
}
const out = resolve(option("--out", join(root, ".cache/diagram-previews")))
const theme = option("--theme", "both")
const mermaidMode = argv.includes("--mermaid")
const inputs = argv.filter((a) => a !== "--mermaid")
if (!inputs.length) {
  console.error(
    "usage: render-diagram.mjs [--mermaid] [--out dir] [--theme light|dark|both] <files>",
  )
  process.exit(2)
}
mkdirSync(out, { recursive: true })

// Playwright's headless shell is a fallback for when system Chrome cannot take
// screenshots (for example, right after an auto-update).
function playwrightShells() {
  const cache = join(homedir(), "Library/Caches/ms-playwright")
  if (!existsSync(cache)) return []
  return readdirSync(cache)
    .filter((d) => d.startsWith("chromium_headless_shell-"))
    .toSorted()
    .toReversed()
    .flatMap((d) =>
      readdirSync(join(cache, d))
        .filter((sub) => sub.startsWith("chrome-headless-shell-"))
        .map((sub) => join(cache, d, sub, "chrome-headless-shell")),
    )
}
const browsers = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  ...playwrightShells(),
].filter((p) => p && existsSync(p))
if (!browsers.length) {
  console.error("Chrome not found; set CHROME_PATH.")
  process.exit(2)
}

const css = readFileSync(join(root, "src/styles/diagrams.css"), "utf8")
const PAD = 16

function screenshot(html, width, height, png) {
  const page = png.replace(/\.png$/, ".html")
  writeFileSync(page, html)
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=2",
    `--window-size=${Math.ceil(width + PAD * 2)},${Math.ceil(height + PAD * 2)}`,
    `--screenshot=${png}`,
    `file://${page}`,
  ]
  // Parallel runs can collide on Chrome's profile lock (exit status 2), so retry;
  // if a browser keeps failing, move on to the next one.
  let lastError
  for (const browser of browsers) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        execFileSync(browser, args, { stdio: "ignore", timeout: 60_000 })
        console.log(relative(root, png))
        return
      } catch (error) {
        lastError = error
        execFileSync("sleep", [String(attempt)])
      }
    }
  }
  throw lastError
}

function renderSvg(file) {
  const raw = readFileSync(file, "utf8")
  const { svg, width, height } = prepareDiagramSvg(raw, "p", "preview")
  if (!width || !height) {
    console.error(`${file}: root <svg> needs a viewBox`)
    process.exitCode = 1
    return
  }
  const name = relative(join(root, "content/diagrams"), file)
    .replace(/\.svg$/, "")
    .replace(/\//g, "-")
  for (const mode of theme === "both" ? ["light", "dark"] : [theme]) {
    const bg = mode === "dark" ? "#0b0e14" : "#ffffff"
    const html = `<!doctype html><html class="${mode}"><head><meta charset="utf-8"><style>${css}
html,body{margin:0;background:${bg}}
.svg-diagram{margin:0;padding:${PAD}px;border:0;border-radius:0;background:${bg}}
.svg-diagram-frame svg{width:${width}px}</style></head>
<body><figure class="svg-diagram"><div class="svg-diagram-frame">${svg}</div></figure></body></html>`
    screenshot(html, width, height, join(out, `${name}.${mode}.png`))
  }
}

async function renderMermaid(file) {
  const { renderMermaidSVG } = await import(
    join(root, "node_modules/beautiful-mermaid/dist/index.js")
  )
  const source = readFileSync(file, "utf8")
  const charts = [...source.matchAll(/^```mermaid\s*\n([\s\S]*?)^```\s*$/gm)].map((m) => m[1])
  const page = relative(join(root, "content/docs"), file)
    .replace(/\.mdx$/, "")
    .replace(/\//g, "-")
  let n = 0
  for (const chart of charts) {
    n++
    const svg = (
      await renderMermaidSVG(chart.replace(/\n$/, ""), {
        bg: "#ffffff",
        fg: "#1e242b",
        line: "#59616d",
        accent: "#1f6f72",
        muted: "#6b7280",
        surface: "#f4f6f8",
        border: "#b7c4ce",
        font: "Inter",
        transparent: true,
        padding: 28,
        nodeSpacing: 28,
        layerSpacing: 46,
        thoroughness: 5,
      })
    ).replace(/@import url\([^)]+\);?/g, "")
    const vb = svg.match(/viewBox="([^"]+)"/)
    const [, , width, height] = vb ? vb[1].split(/\s+/).map(Number) : [0, 0, 800, 600]
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:${PAD}px;background:#fff}svg{width:${width}px;height:${height}px}</style></head><body>${svg}</body></html>`
    screenshot(html, width, height, join(out, `${page}.mermaid-${n}.png`))
  }
  if (!charts.length) console.log(`${relative(root, file)}: no mermaid fences`)
}

for (const input of inputs) {
  const file = resolve(input)
  if (mermaidMode) await renderMermaid(file)
  else renderSvg(file)
}
// beautiful-mermaid keeps the event loop alive; exit explicitly.
process.exit(process.exitCode ?? 0)
