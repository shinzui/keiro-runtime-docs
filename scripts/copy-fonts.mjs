// Copies the four PragmataPro ligature Mono OTFs into public/fonts/ so they can be
// served as static assets and referenced by @font-face in src/styles/app.css.
// Tolerant by design: if the licensed font package is unavailable on this machine,
// it warns and exits 0 so dev/build still proceed (site falls back to system monospace).
import { execFileSync } from "node:child_process"
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  realpathSync,
  rmSync,
} from "node:fs"
import { join } from "node:path"

const repoRoot = process.cwd()
const targetDir = join(repoRoot, "public", "fonts")
const FONT_ATTR = process.env.PRAGMATAPRO_ATTR || "pragmataPro"
const REGISTRY_FLAKE = "pragmatapro"
// Match the ligature Mono OTFs and capture the style letter. The version token
// (e.g. `09` or `0901`) varies between font releases, so we never hard-code it:
// we glob it here and rename to a stable, version-independent filename below so
// the @font-face URLs in src/styles/app.css never need to change.
const LIGA_GLOB = /_Mono_([RBIZ])_liga_.*\.otf$/
const STYLE_NAMES = { R: "Regular", B: "Bold", I: "Italic", Z: "BoldItalic" }

function existingFontDir(path) {
  try {
    const real = realpathSync(path)
    const nested = join(real, "share", "fonts", "opentype")
    if (existsSync(nested)) return nested
    if (existsSync(real)) return real
  } catch {
    // fall through
  }
  return null
}

function buildFontFlake(ref) {
  try {
    const out = execFileSync(
      "nix",
      ["build", "--no-link", "--print-out-paths", `${ref}#${FONT_ATTR}`],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim()
    return existingFontDir(out)
  } catch {
    return null
  }
}

function resolveFontDir() {
  // 1) Direct directory override. Accept either the font directory itself or a
  // package output containing share/fonts/opentype.
  if (process.env.PRAGMATAPRO_FONT_DIR) {
    const dir = existingFontDir(process.env.PRAGMATAPRO_FONT_DIR)
    if (dir) return dir
    console.warn(
      `[copy-fonts] PRAGMATAPRO_FONT_DIR does not exist: ${process.env.PRAGMATAPRO_FONT_DIR}`,
    )
  }

  // 2) Per-repo or per-shell flake override, e.g. path:/Users/me/fonts.
  if (process.env.PRAGMATAPRO_FLAKE) {
    const dir = buildFontFlake(process.env.PRAGMATAPRO_FLAKE)
    if (dir) return dir
    console.warn(
      `[copy-fonts] Could not build ${process.env.PRAGMATAPRO_FLAKE}#${FONT_ATTR}; trying registry alias.`,
    )
  }

  // 3) Team default: a local registry alias. Public users will not have this,
  // so failure is expected and falls back to system monospace.
  const dir = buildFontFlake(REGISTRY_FLAKE)
  if (dir) return dir

  return null
}

const sourceDir = resolveFontDir()
if (!sourceDir) {
  console.warn(
    "[copy-fonts] PragmataPro package not available on this machine; " +
      "code blocks will use the system monospace fallback (no ligatures). " +
      "Licensed users can set PRAGMATAPRO_FLAKE, PRAGMATAPRO_FONT_DIR, or a local " +
      "`pragmatapro` Nix registry alias.",
  )
  process.exit(0)
}

const ligas = readdirSync(sourceDir)
  .filter((f) => !f.startsWith("._"))
  .map((f) => ({ name: f, m: f.match(LIGA_GLOB) }))
  .filter((e) => e.m)
if (ligas.length === 0) {
  console.warn(`[copy-fonts] No *_Mono_*_liga_*.otf found in ${sourceDir}; skipping.`)
  process.exit(0)
}

mkdirSync(targetDir, { recursive: true })
for (const { name, m } of ligas) {
  const dest = join(targetDir, `PragmataProMono-${STYLE_NAMES[m[1]]}.otf`)
  // The source lives in the read-only Nix store, so copies inherit mode 0444.
  // Remove any prior copy and re-chmod so re-runs (predev/prebuild) don't hit
  // EACCES overwriting a read-only destination.
  rmSync(dest, { force: true })
  copyFileSync(join(sourceDir, name), dest)
  chmodSync(dest, 0o644)
}
console.log(`[copy-fonts] Copied ${ligas.length} OTF(s) into public/fonts/.`)
