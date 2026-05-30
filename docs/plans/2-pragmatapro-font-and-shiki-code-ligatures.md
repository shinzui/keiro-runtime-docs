---
id: 2
slug: pragmatapro-font-and-shiki-code-ligatures
title: "PragmataPro font and Shiki code ligatures"
kind: exec-plan
created_at: 2026-05-30T20:05:53Z
intention: "intention_01ksx5mf7qe2ht659e4kr9w2t0"
master_plan: "docs/masterplans/1-keiro-runtime-docs-infrastructure-and-kiroku-foundation.md"
---

# PragmataPro font and Shiki code ligatures

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

This documentation site documents the **keiro runtime**, a family of four Haskell
libraries. Every code sample in the docs is Haskell, and Haskell reads dramatically
better when its operators are rendered as *ligatures*: a "ligature" is a single drawn
glyph that replaces a fixed sequence of characters. With a ligature-aware monospace
font, the two characters `-` and `>` are drawn as a single arrow glyph `→`, `>>=`
becomes a bind glyph, `<-` becomes a left arrow, `::` becomes a clean double colon,
and `/=` becomes a not-equal glyph. The characters in the file never change — only how
they are *painted* — so copy/paste still yields `->`, `>>=`, `<-`, `::`, `/=`.

After this change, a reader opening any documentation page that contains a Haskell
fenced code block will see that code rendered in **PragmataPro Mono** (a paid
programmer's font the team already licenses and packages with Nix) with those
ligatures visibly active, in **both the light and the dark theme**. They will also see
Haskell (and Nix, Cabal, Bash, JSON) syntax-highlighted with correct, theme-matched
colors, because we explicitly configure the Shiki syntax highlighter that fumadocs
uses with a pinned language list that includes `haskell`.

Concretely, the user-visible outcome is: run `pnpm dev`, open the page that contains
the Haskell sample added by this plan, and observe (1) the monospace font is
PragmataPro (its distinctive shapes — e.g. the dotted zero, the wide glyphs — are
obvious), (2) the sequences `->`, `>>=`, `<-`, `::`, `/=` are drawn as single
ligature glyphs, and (3) toggling the site theme between light and dark keeps both the
font and the ligatures, only changing the syntax colors.

"Shiki" is the syntax highlighter that fumadocs uses at build time to turn fenced code
blocks into colored HTML. "fumadocs" is the Next.js + MDX documentation framework this
site is built on. "MDX" is Markdown that can embed React components. "Ligature CSS"
means the CSS properties `font-feature-settings` and `font-variant-ligatures`, which
ask the browser to turn on the font's ligature and contextual-alternate features.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented
here, even if it requires splitting a partially completed task into two ("done" vs.
"remaining"). This section must always reflect the actual current state of the work.

- [ ] Milestone 1 — Add the `/bokuno/fonts` PragmataPro package as a flake input and a
      `copy-fonts` step that places the four `_liga_` Mono OTFs into `public/fonts/`.
- [ ] Milestone 2 — Load PragmataPro via `next/font/local` in `app/layout.tsx` and wire
      `--fd-font-mono` + ligature CSS into `app/global.css` (extending Plan A's seams).
- [ ] Milestone 3 — Configure Shiki (themes + langs including `haskell`) in
      `source.config.ts` (extending Plan A's seam).
- [ ] Milestone 4 — Add a Haskell verification page and confirm ligatures render in both
      themes.


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

Two caveats about the `/bokuno/fonts` package were found during research and are
designed around defensively in this plan (so they are noted here up front rather than
discovered painfully later):

- **Casing typo in the fonts flake's `default` output.** In
  `/Users/shinzui/Keikaku/bokuno/fonts/flake.nix`, the package is declared as
  `pragmataPro` (capital P) but `default = self.packages.${system}.pragmatapro;`
  references the all-lowercase name. Evaluating `.#default` therefore fails. This plan
  always references the package by its working attribute path
  `packages.${system}.pragmataPro` (capital P), never `.#default`.

- **Version string mismatch (declared `0.901`, shipped filenames say `09`).** The
  derivation in `/Users/shinzui/Keikaku/bokuno/fonts/pragmataPro.nix` sets
  `version = "0.901"`, but the actual installed OTF filenames use the token `09`
  (e.g. `PragmataPro_Mono_R_liga_09.otf`). This plan never hard-codes a version into a
  path; the copy step globs for `*_Mono_*_liga_*.otf` so it survives a version bump.

- **The licensed zip is vendored, not `requireFile`-gated.** Direct inspection of
  `/Users/shinzui/Keikaku/bokuno/fonts/pragmataPro.nix` on 2026-05-30 shows
  `src = ./fonts-archive/PragmataPro-${version}.zip;` and `{ pkgs, ... }` /
  `import ./pragmataPro.nix { inherit pkgs; }` wiring (NOT `callPackage` + `requireFile`,
  which an earlier reference report had guessed). Consequence: the package builds without
  any manual `nix-store --add-fixed` step on any machine that has the fonts flake checked
  out with its `fonts-archive/` zip. The build evaluates under the fonts flake's own
  `config.allowUnfree = true`, so no extra unfree opt-in is needed on the consumer side.
  The `result/` symlink in the fonts repo was confirmed to contain the eight Mono OTFs
  (R/B/I/Z in plain and `_liga_` variants).

(More to be added during implementation.)


## Decision Log

Record every decision made while working on the plan.

- Decision: Consume the existing Nix font package at `/Users/shinzui/Keikaku/bokuno/fonts`
  as a flake input rather than committing font binaries to this repo.
  Rationale: PragmataPro is a paid, licensed (unfree) font; checking the binaries into
  the docs repo risks redistributing them. The Nix package wraps a zip vendored inside
  the fonts flake (`fonts-archive/PragmataPro-0.901.zip`) and is the team's established
  distribution mechanism. We copy the OTFs into `public/fonts/` at dev/build time (the
  directory is git-ignored), so the binaries are never committed to THIS repo.
  Date: 2026-05-30

- Decision: Load the OTF files directly via `next/font/local` instead of converting to
  woff2 first.
  Rationale: Fewest moving parts for a novice; `next/font/local` accepts OTF, and Next
  self-hosts and optimizes the font. Converting to woff2 is an optional later size
  optimization, not required for correctness.
  Date: 2026-05-30

- Decision: Reference the package by `packages.${system}.pragmataPro` (capital P), never
  `.#default`, and glob the OTF filenames rather than hard-coding the version.
  Rationale: Works around the two caveats documented in Surprises & Discoveries.
  Date: 2026-05-30

- Decision: Configure Shiki with an explicit `themes` (light/dark) and `langs` list that
  includes `haskell`, `nix`, `cabal`, `bash`, `json`.
  Rationale: All samples are Haskell; relying on fumadocs' on-demand defaults risks a
  missing grammar and gives no control over the theme pair.
  Date: 2026-05-30


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

(To be filled during and after implementation.)


## Context and Orientation

You are working in the repository at `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`.
This repo contains a single fumadocs (Next.js) documentation site at the repository
root. Treat yourself as new to this repo: everything you need is in this file plus the
working tree.

### Hard dependency: Plan A must be done first

This plan extends an app that another plan already scaffolds. That plan lives at
`docs/plans/1-scaffold-the-fumadocs-documentation-app.md` (referenced here by path
only). Before starting, confirm Plan A is complete by checking that these files exist
and that `pnpm dev` serves a styled, empty docs site:

- `source.config.ts` — fumadocs-mdx configuration (the file Shiki is configured in).
- `app/layout.tsx` — the root layout; loads the body font Inter via
  `next/font/google` and applies `inter.variable` to the `<html>` element.
- `app/global.css` — base Tailwind v4 + fumadocs CSS imports.
- `mdx-components.tsx` — the MDX component registry (not touched by this plan).
- `lib/source.ts`, `next.config.mjs`, `tsconfig.json`, `postcss.config.mjs`,
  `package.json`, and `flake.nix` at the repo root.
- A `public/` directory (Plan A creates `public/`; this plan creates `public/fonts/`).

If those do not exist yet, stop and implement Plan A first.

### The seams Plan A leaves for this plan

Plan A intentionally leaves three clearly-marked extension points ("seams") that this
plan fills. A "seam" is a spot in a file Plan A owns where it placed a comment marking
exactly where Plan B should insert its code, so the two plans share files without
conflicting. The contract is: **extend the seam in place; do not delete Plan A's
surrounding code.** The seams are:

1. In `source.config.ts`, the `defineConfig` call has `mdxOptions: {}` with a comment:

   ```text
   // SEAM(Plan B): rehypeCodeOptions — Shiki themes + langs (haskell, nix, ...)
   ```

   Plan B replaces the empty `{}` with an object containing `rehypeCodeOptions`.

2. In `app/global.css`, after the Tailwind/fumadocs imports, Plan A left:

   ```text
   /* SEAM(Plan B): PragmataPro @font-face / --fd-font-mono / ligature CSS */
   ```

   and a `:root { /* SEAM(Plan B): --fd-font-mono override */ }` block. Plan B adds the
   `--fd-font-mono` override and the ligature rules here.

3. In `app/layout.tsx`, Plan A loads Inter via `next/font/google` and applies
   `inter.variable` to `<html>`. Plan B adds a `next/font/local` PragmataPro font next
   to Inter and appends its variable class to the same `<html>` element.

`mdx-components.tsx` is a fourth seam but is extended by other plans, not this one.

### Versions you can rely on (repeated here so you need not open Plan A)

Plan A pins these and this plan assumes them:

- Next `^16.1.6`, React `^19.2.4`, react-dom `^19.2.4`.
- fumadocs-core `^16.6.17`, fumadocs-ui `^16.6.17`, fumadocs-mdx `^14.2.10`.
- Tailwind v4 (`tailwindcss ^4.1.18`, `@tailwindcss/postcss ^4.1.18`).
- Package manager **pnpm**; Node **22** (provided by the repo `flake.nix` dev shell).
- TypeScript `^5.9.3`.

fumadocs-core bundles **Shiki** internally and exposes its options through
`mdxOptions.rehypeCodeOptions` in `source.config.ts`; we do **not** add a separate
`shiki` dependency. fumadocs-core `^16.6.17` bundles Shiki v3 (the `themes`/`langs`
option shape used below). The set of grammars fumadocs can load is Shiki's bundled
grammar set, which includes `haskell`, `nix`, `cabal`, `bash`, and `json` — the five
we pin. (For reference, the standalone-Shiki sites in the team — keiki-docs and
mina-ui — use `shiki ^4.0.2` with `langs: ['haskell', ...]`; we mirror that language
intent through fumadocs' bundled Shiki instead of adding our own dependency.)

### The font package at `/Users/shinzui/Keikaku/bokuno/fonts`

This is a separate Nix flake whose job is to package PragmataPro. Its
`flake.nix` (quoted verbatim from disk on 2026-05-30) is:

```nix
{
  description = "Private fonts";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;  # Add this line
        };
      in
      {
        packages = {
          pragmataPro = import ./pragmataPro.nix { inherit pkgs; };
          default = self.packages.${system}.pragmatapro;
        };
      }
    );
}
```

Note the `default = self.packages.${system}.pragmatapro;` line: it refers to
`pragmatapro` (all lowercase) but the actual attribute is `pragmataPro` (capital P).
So `nix build /path/to/fonts#default` fails with an "attribute 'pragmatapro' missing"
error; you must use the capital-P attribute `pragmataPro`. This casing typo is real and
confirmed on disk — it is the first of the two caveats this plan works around.

Also note `config.allowUnfree = true;`: PragmataPro is a paid (unfree) font, so the
package's `meta.license = licenses.unfree`. Building it requires unfree packages to be
allowed. The fonts flake already sets this for itself; when this repo's flake consumes
the package as an input, the package is already evaluated under that flake's permissive
config, so no extra `allowUnfree` is needed on the consumer side. If you ever build the
package directly with a bare `nix build` and hit an "unfree" refusal, prefix the command
with `NIXPKGS_ALLOW_UNFREE=1` and add `--impure`.

Its `pragmataPro.nix` (quoted verbatim from disk on 2026-05-30) is:

```nix
{ pkgs, ... }:

let
  stdenv = pkgs.stdenvNoCC;
  lib = pkgs.lib;
in
stdenv.mkDerivation rec {
  pname = "pragmatapro";
  version = "0.901";

  src = ./fonts-archive/PragmataPro-${version}.zip;

  buildInputs = [ pkgs.unzip ];

  dontConfigure = true;
  phases = [ "unpackPhase" "installPhase" ];

  unpackPhase = ''
    unzip $src
  '';

  installPhase = ''
    install_path=$out/share/fonts/opentype
    mkdir -p $install_path
    find . -name "*.otf" -exec cp {} $install_path \;
  '';

  meta = with lib; {
    description = "PragmataPro font by Fabrizio Schiavi";
    homepage = "https://fsd.it/shop/fonts/pragmatapro/";
    license = licenses.unfree;
    platforms = platforms.all;
    maintainers = [ ];
  };
}
```

Important: the licensed source archive is **vendored inside the fonts flake** at
`fonts-archive/PragmataPro-0.901.zip` (`src = ./fonts-archive/PragmataPro-${version}.zip;`).
It is NOT fetched with `requireFile` and does NOT need to be added to the Nix store by
hand. This means the package builds successfully on any machine that has a clone of
`/Users/shinzui/Keikaku/bokuno/fonts` (with its `fonts-archive/` zip present). If you are
on a machine where that flake/zip is absent, the build will fail and the copy step in
this plan falls back gracefully (see Idempotence and Recovery).

Two things to internalize:

- The derivation installs **every** `.otf` it finds into
  `$out/share/fonts/opentype/`. The build output (verified on this machine via the
  `result` symlink in `/Users/shinzui/Keikaku/bokuno/fonts`) contains these eight Mono
  OTFs (plus proportional variants we do not use):

  ```text
  PragmataPro_Mono_R_09.otf        PragmataPro_Mono_R_liga_09.otf
  PragmataPro_Mono_B_09.otf        PragmataPro_Mono_B_liga_09.otf
  PragmataPro_Mono_I_09.otf        PragmataPro_Mono_I_liga_09.otf
  PragmataPro_Mono_Z_09.otf        PragmataPro_Mono_Z_liga_09.otf
  ```

  `R` = regular, `B` = bold, `I` = italic, `Z` = bold-italic. The `_liga_` variants are
  the ones with ligatures baked into the font; the plain variants do **not** ligate even
  with the CSS turned on. **We use the four `_Mono_*_liga_*` files.**

- The declared `version` is `0.901` but the shipped filenames carry the token `09`
  (e.g. `PragmataPro_Mono_R_liga_09.otf`, not `..._0901.otf`). This is the second of the
  two caveats. Do not put a version number in any path; glob `*_Mono_*_liga_*.otf`
  instead so the plan survives a version bump or a token change. (The canonical brief
  phrased this as "built result 0.9 vs declared 0.901"; the precise on-disk token is
  `09`. Either way: never hard-code the version into a filename.)

The source zip is vendored inside the fonts flake (`fonts-archive/PragmataPro-0.901.zip`),
so the build is self-contained and needs no manual `nix-store --add-fixed` step. The only
machines where the build fails are those that do not have a copy of
`/Users/shinzui/Keikaku/bokuno/fonts` at all — there the copy step warns and exits 0; see
Idempotence and Recovery for the graceful fallback (the site still works with a system
monospace, just without ligatures).

### Why `--fd-font-mono`

fumadocs-ui drives the monospace font for code via a CSS custom property named
`--fd-font-mono`. Setting it to PragmataPro makes fumadocs use our font everywhere it
already uses monospace (code blocks, inline code, the `.shiki` highlighter output)
without us having to chase every selector. We additionally set the font and ligature
features directly on `code`, `pre`, `kbd`, `samp`, `.shiki`, and `.shiki code` as a
belt-and-suspenders measure, because `--fd-font-mono` alone does not turn on the
ligature OpenType features — those need `font-feature-settings`/`font-variant-ligatures`.


## Plan of Work

The work proceeds in four milestones. Each is independently verifiable.

### Milestone 1 — Make the font OTFs available to the app

Scope: add `/Users/shinzui/Keikaku/bokuno/fonts` as a flake input named `pragmatapro`,
and add a `copy-fonts` mechanism that copies the four `_Mono_*_liga_*.otf` files into
`public/fonts/` before dev and before build. At the end, `public/fonts/` contains
`PragmataPro_Mono_R_liga_09.otf` and its B/I/Z siblings, and `pnpm dev`/`pnpm build`
refresh them automatically. Acceptance: `ls public/fonts/` shows the four OTFs.

The repo `flake.nix` (owned and switched to pnpm+Node 22 by Plan A) gains the input and
a small package/app reference so the OTFs are reachable. Add the input under `inputs`:

```nix
inputs.pragmatapro.url = "path:/Users/shinzui/Keikaku/bokuno/fonts";
```

We point the input at the package by its **working** attribute `pragmataPro` (capital
P) wherever we reference it — never `default`. Expose it from the flake's `outputs` so
the copy script has a stable path. In the `eachDefaultSystem`/`perSystem` body of the
repo `flake.nix`, add:

```nix
packages.pragmatapro-fonts = pragmatapro.packages.${system}.pragmataPro;
```

(Here `pragmatapro` is the input we just declared and `pragmataPro` is its capital-P
package attribute. If the repo flake uses `flake-parts`/`perSystem`, `system` is already
in scope; if it uses raw `eachDefaultSystem`, `system` is the lambda argument. Either
way the right-hand side is identical.)

Now add a copy script. Create `scripts/copy-fonts.mjs` at the repo root. It resolves the
font package's output directory, finds the four ligature Mono OTFs by glob, and copies
them into `public/fonts/`. It must be tolerant: if the font store path cannot be
resolved (the licensed zip is not on this machine), it prints a warning and exits 0 so
dev/build still proceed (the site then falls back to the system monospace, without
ligatures). Full file contents are in Concrete Steps.

Wire the script into pnpm so it runs automatically. In `package.json` (owned by Plan A),
add a `copy-fonts` script and make `dev` and `build` depend on it via `pre*` hooks:

```json
{
  "scripts": {
    "copy-fonts": "node scripts/copy-fonts.mjs",
    "predev": "pnpm run copy-fonts",
    "prebuild": "pnpm run copy-fonts"
  }
}
```

Do not remove or rename Plan A's existing `dev`, `build`, `start`, or `types:check`
scripts; only add the three above. pnpm runs `predev` automatically before `dev` and
`prebuild` before `build`.

Finally, ensure `public/fonts/` is git-ignored so the licensed binaries are never
committed. In `.gitignore`, add:

```text
/public/fonts/
```

### Milestone 2 — Load the font and enable ligatures

Scope: register PragmataPro as a local font in `app/layout.tsx` via `next/font/local`,
apply its CSS variable to `<html>`, point `--fd-font-mono` at it in `app/global.css`,
and add the ligature CSS to all code surfaces. At the end, code on every docs page
renders in PragmataPro with ligatures. Acceptance: in the browser devtools, a `<pre>`
inside `.shiki` shows `font-family` resolving to the PragmataPro face and
`font-feature-settings: "liga" 1, "calt" 1`.

In `app/layout.tsx`, next to Plan A's existing Inter import, add a `next/font/local`
font. The exact edit is shown as a diff in Concrete Steps. The font declaration is:

```tsx
import localFont from 'next/font/local';

const pragmata = localFont({
  src: [
    { path: '../public/fonts/PragmataPro_Mono_R_liga_09.otf', weight: '400', style: 'normal' },
    { path: '../public/fonts/PragmataPro_Mono_B_liga_09.otf', weight: '700', style: 'normal' },
    { path: '../public/fonts/PragmataPro_Mono_I_liga_09.otf', weight: '400', style: 'italic' },
    { path: '../public/fonts/PragmataPro_Mono_Z_liga_09.otf', weight: '700', style: 'italic' },
  ],
  variable: '--font-pragmata',
  display: 'swap',
});
```

Then append `${pragmata.variable}` to the `<html>` element's `className`, keeping
whatever Plan A already put there (e.g. `inter.variable` / `inter.className`):

```tsx
<html lang="en" className={`${inter.variable} ${pragmata.variable}`} suppressHydrationWarning>
```

(If Plan A used `inter.className` instead of `inter.variable`, keep that exact token and
just add `${pragmata.variable}` to the same string.)

`next/font/local` reads the OTFs from `public/fonts/` at build time. Because
`public/fonts/` is populated by the `predev`/`prebuild` hook from Milestone 1, the
files are present before Next compiles. `--font-pragmata` is the CSS variable Next emits
that resolves to the actual generated font-family name.

In `app/global.css`, fill the two seams Plan A left. Replace the `--fd-font-mono` seam
inside `:root`, and the block-level seam after the imports, with the exact CSS shown in
Concrete Steps. The CSS sets `--fd-font-mono` to the PragmataPro variable with
fallbacks, and applies the font plus ligature features to every code surface, including
`.shiki` and fumadocs' `pre`/`code`.

### Milestone 3 — Configure Shiki (themes + Haskell-aware langs)

Scope: fill the `source.config.ts` seam with `rehypeCodeOptions` that pin a light/dark
theme pair and a language list including `haskell`. At the end, Haskell, Nix, Cabal,
Bash, and JSON fences are highlighted with the chosen themes. Acceptance: a Haskell
fence on a page shows colored tokens (keywords, types, operators) and the colors change
when the site theme toggles.

Replace the empty `mdxOptions: {}` (the seam) with:

```ts
mdxOptions: {
  rehypeCodeOptions: {
    themes: { light: 'github-light', dark: 'github-dark' },
    langs: ['haskell', 'nix', 'cabal', 'bash', 'json'],
  },
},
```

`themes` is a light/dark pair; fumadocs renders both and CSS shows the right one per
theme. `langs` preloads exactly the grammars our docs use. `haskell` is essential
because every sample is Haskell. `cabal` covers `.cabal`/`cabal.project` snippets; `nix`
covers flake snippets; `bash` covers shell commands; `json` covers config. Markdown
authors should tag Haskell fences with ` ```haskell ` (the canonical Shiki name). If
authors prefer ` ```hs ` or ` ```cabal-for-haskell `, note that Shiki's bundled grammar
key is `haskell`; use `haskell` to be safe.

### Milestone 4 — Verification page proving the whole chain

Scope: add one docs page containing a Haskell code block crafted to exercise the target
ligatures, then visually confirm the font + ligatures + highlighting in both themes. At
the end, there is a reproducible, human-verifiable demonstration. Acceptance is in
Validation and Acceptance.

Create `content/docs/ligature-check.mdx` (a temporary verification page; it may be
removed once the content plans land, or kept as a living smoke test). Its body includes
a Haskell fence using every target operator: `->`, `>>=`, `<-`, `::`, `/=`. The exact
file is in Concrete Steps. Also add it to the docs nav so it is reachable — append
`"ligature-check"` to the `pages` array in `content/docs/meta.json` (created by Plan A);
do not remove existing entries.


## Concrete Steps

All commands run from the repository root
`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` unless stated otherwise. Steps are
written to be safe to re-run.

### Step 1 — Add the flake input and package output

Edit the repo `flake.nix`. Under the existing `inputs` block, add:

```nix
inputs.pragmatapro.url = "path:/Users/shinzui/Keikaku/bokuno/fonts";
```

In the per-system outputs, add the package reference (use the capital-P attribute):

```nix
packages.pragmatapro-fonts = pragmatapro.packages.${system}.pragmataPro;
```

Ensure `pragmatapro` is also listed among the `outputs` lambda arguments (alongside
`self`, `nixpkgs`, etc.) so it is in scope. Then update the lock. On current Nix use:

```bash
nix flake update pragmatapro
```

On older Nix (pre-2.19) the equivalent is `nix flake lock --update-input pragmatapro`.
Either way the result is the same.

Expected: `flake.lock` gains a `pragmatapro` node pointing at the `path:` source
(`/Users/shinzui/Keikaku/bokuno/fonts`). If `nix` is not on this machine, you may skip
the flake wiring entirely and rely on the fallback path in Step 2 (the copy script also
locates the OTFs via the fonts repo's own `result` symlink if someone has already run
`nix build` there). The flake wiring is the clean path; the fallback keeps a novice
unblocked.

### Step 2 — Create `scripts/copy-fonts.mjs`

Create the file `scripts/copy-fonts.mjs` with exactly this content:

```javascript
// Copies the four PragmataPro ligature Mono OTFs into public/fonts/ for next/font/local.
// Tolerant by design: if the licensed font package is unavailable on this machine,
// it warns and exits 0 so dev/build still proceed (site falls back to system monospace).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, copyFileSync, realpathSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = process.cwd();
const targetDir = join(repoRoot, 'public', 'fonts');
const FONTS_FLAKE = '/Users/shinzui/Keikaku/bokuno/fonts';
const LIGA_GLOB = /_Mono_.*_liga_.*\.otf$/;

function resolveFontDir() {
  // 1) Preferred: ask Nix to build the capital-P package attribute (never #default).
  try {
    const out = execFileSync(
      'nix',
      ['build', '--no-link', '--print-out-paths', `path:${FONTS_FLAKE}#pragmataPro`],
      { encoding: 'utf8' },
    ).trim();
    const dir = join(out, 'share', 'fonts', 'opentype');
    if (existsSync(dir)) return dir;
  } catch {
    // fall through
  }
  // 2) Fallback: the fonts repo's own `result` symlink, if someone already built it.
  try {
    const dir = join(realpathSync(join(FONTS_FLAKE, 'result')), 'share', 'fonts', 'opentype');
    if (existsSync(dir)) return dir;
  } catch {
    // fall through
  }
  return null;
}

const sourceDir = resolveFontDir();
if (!sourceDir) {
  console.warn(
    '[copy-fonts] PragmataPro package not available on this machine; ' +
      'code blocks will use the system monospace fallback (no ligatures).',
  );
  process.exit(0);
}

const ligas = readdirSync(sourceDir).filter(
  (f) => LIGA_GLOB.test(f) && !f.startsWith('._'),
);
if (ligas.length === 0) {
  console.warn(`[copy-fonts] No *_Mono_*_liga_*.otf found in ${sourceDir}; skipping.`);
  process.exit(0);
}

mkdirSync(targetDir, { recursive: true });
for (const name of ligas) {
  copyFileSync(join(sourceDir, name), join(targetDir, name));
}
console.log(`[copy-fonts] Copied ${ligas.length} OTF(s) into public/fonts/.`);
```

Note: the `._`-prefixed entries that may appear in the source directory are macOS
AppleDouble resource-fork stubs; the filter ignores them.

### Step 3 — Wire pnpm scripts and gitignore

Apply this diff to `package.json` (add only; keep Plan A's existing scripts):

```diff
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "next start",
-    "types:check": "fumadocs-mdx && next typegen && tsc --noEmit"
+    "types:check": "fumadocs-mdx && next typegen && tsc --noEmit",
+    "copy-fonts": "node scripts/copy-fonts.mjs",
+    "predev": "pnpm run copy-fonts",
+    "prebuild": "pnpm run copy-fonts"
   },
```

Apply this diff to `.gitignore` (add the line if absent):

```diff
+/public/fonts/
```

Run the copy step once to populate the directory now:

```bash
pnpm run copy-fonts
```

Expected (when the font is available):

```text
[copy-fonts] Copied 4 OTF(s) into public/fonts/.
```

Verify:

```bash
ls public/fonts/
```

Expected:

```text
PragmataPro_Mono_B_liga_09.otf  PragmataPro_Mono_I_liga_09.otf
PragmataPro_Mono_R_liga_09.otf  PragmataPro_Mono_Z_liga_09.otf
```

(If the font is unavailable you will instead see the `[copy-fonts]` warning and an empty
or absent `public/fonts/`; continue — the rest of the plan still wires correctly and the
site uses the fallback monospace.)

### Step 4 — Load the font in `app/layout.tsx`

Apply this diff (the exact surrounding lines come from Plan A; match its actual
formatting, but the additions are these):

```diff
 import { RootProvider } from 'fumadocs-ui/provider/next';
 import './global.css';
 import { Inter } from 'next/font/google';
+import localFont from 'next/font/local';

 const inter = Inter({
   subsets: ['latin'],
+  variable: '--font-inter',
 });
+
+const pragmata = localFont({
+  src: [
+    { path: '../public/fonts/PragmataPro_Mono_R_liga_09.otf', weight: '400', style: 'normal' },
+    { path: '../public/fonts/PragmataPro_Mono_B_liga_09.otf', weight: '700', style: 'normal' },
+    { path: '../public/fonts/PragmataPro_Mono_I_liga_09.otf', weight: '400', style: 'italic' },
+    { path: '../public/fonts/PragmataPro_Mono_Z_liga_09.otf', weight: '700', style: 'italic' },
+  ],
+  variable: '--font-pragmata',
+  display: 'swap',
+});

 export default function Layout({ children }: LayoutProps<'/'>) {
   return (
-    <html lang="en" className={inter.className} suppressHydrationWarning>
+    <html lang="en" className={`${inter.variable} ${pragmata.variable}`} suppressHydrationWarning>
       <body className="flex flex-col min-h-screen">
         <RootProvider>{children}</RootProvider>
       </body>
     </html>
   );
 }
```

If Plan A's layout already sets `inter.variable` and a className string, just add
`import localFont from 'next/font/local';`, the `pragmata` declaration, and
`${pragmata.variable}` into the existing className — do not duplicate the Inter setup.

If `public/fonts/` is empty (font unavailable on this machine), `next/font/local` will
fail to compile because the `src` paths do not exist. In that case, comment out the
`pragmata` declaration and its `${pragmata.variable}` usage so the app still builds; the
CSS fallbacks in Step 5 then provide a system monospace. (See Idempotence and Recovery.)

### Step 5 — Ligature CSS in `app/global.css`

Plan A left two seams. Fill them with exactly this CSS.

Replace the `:root` seam:

```diff
 :root {
-  /* SEAM(Plan B): --fd-font-mono override */
+  /* Plan B: route fumadocs' monospace at PragmataPro (ligature build) with fallbacks. */
+  --fd-font-mono: var(--font-pragmata), ui-monospace, SFMono-Regular, Menlo, monospace;
 }
```

Replace the block-level seam (after the imports):

```diff
-/* SEAM(Plan B): PragmataPro @font-face / --fd-font-mono / ligature CSS */
+/* Plan B: enable PragmataPro + Haskell ligatures on every code surface, including
+   fumadocs' Shiki output (.shiki) and inline/block code. The font itself is loaded
+   via next/font/local in app/layout.tsx, which exposes --font-pragmata. */
+code,
+pre,
+kbd,
+samp,
+.shiki,
+.shiki code,
+pre code {
+  font-family: var(--font-pragmata), ui-monospace, SFMono-Regular, Menlo, monospace;
+  font-feature-settings: "liga" 1, "calt" 1;
+  font-variant-ligatures: contextual common-ligatures;
+}
```

Notes on these selectors and properties: `"liga" 1` turns on standard ligatures and
`"calt" 1` turns on contextual alternates — together they drive the Haskell operator
ligatures (`->`, `>>=`, `<-`, `::`, `/=`, `=>`, `<>`, `<$>`). `font-variant-ligatures`
is the higher-level CSS equivalent included for browsers/cases that prefer it.
`.shiki` and `.shiki code` are the elements fumadocs' Shiki highlighter emits; `pre`,
`pre code`, inline `code`, `kbd`, and `samp` cover non-highlighted and inline code. The
font-family fallback chain ensures readable monospace even when PragmataPro is absent
(only the ligatures are lost in that case).

### Step 6 — Configure Shiki in `source.config.ts`

Apply this diff to the `defineConfig` call:

```diff
 export default defineConfig({
-  mdxOptions: {
-    // SEAM(Plan B): rehypeCodeOptions — Shiki themes + langs (haskell, nix, ...)
-  },
+  mdxOptions: {
+    rehypeCodeOptions: {
+      themes: { light: 'github-light', dark: 'github-dark' },
+      langs: ['haskell', 'nix', 'cabal', 'bash', 'json'],
+    },
+  },
 });
```

Keep the rest of `source.config.ts` (the `defineDocs({ dir: 'content/docs', ... })`
export Plan A wrote) unchanged.

### Step 7 — Add the verification page

Create `content/docs/ligature-check.mdx` with exactly this content:

````mdx
---
title: Ligature Check
description: Smoke test for PragmataPro + Shiki Haskell ligatures.
---

This page verifies that Haskell code blocks render in PragmataPro with ligatures in
both the light and dark theme. The operators below should each render as a single
ligature glyph: `->`, `>>=`, `<-`, `::`, `/=`.

```haskell
{-# LANGUAGE OverloadedStrings #-}
module LigatureCheck where

import Control.Monad (when)

-- A function type signature exercises :: and ->
appendEvent :: StreamName -> EventData -> IO RecordedEvent
appendEvent name dat = do
  recorded <- store name dat        -- <- (left arrow)
  when (recorded /= mempty) $        -- /= (not equal)
    pure ()
  store name dat >>= \r -> pure r    -- >>= (bind) and -> (arrow)
```

```nix
{ pragmatapro }: pragmatapro.packages.${system}.pragmataPro
```
````

Append it to the nav. Edit `content/docs/meta.json` (created by Plan A) so the verify
page is reachable; keep existing entries:

```diff
 {
-  "pages": ["index"]
+  "pages": ["index", "ligature-check"]
 }
```

(If Plan A's `pages` array already has more entries, just add `"ligature-check"` to the
end.)


## Validation and Acceptance

Run the app from the repo root:

```bash
pnpm dev
```

Expected console: the `predev` hook runs `copy-fonts` first (printing
`[copy-fonts] Copied 4 OTF(s) into public/fonts/.` or the warning), then Next starts and
prints a local URL such as `http://localhost:3000`.

Open `http://localhost:3000/docs/ligature-check` in a browser. Acceptance, all of which
a human can verify by looking:

1. **Font.** The Haskell code block renders in PragmataPro Mono (distinctive shapes;
   clearly not the default UI monospace). Confirm in devtools: select a token inside
   the code block, and in the Computed panel `font-family` resolves through
   `--font-pragmata` to the generated PragmataPro face name; `font-feature-settings`
   reads `"liga" 1, "calt" 1`.

2. **Ligatures.** In the Haskell block, these sequences are each drawn as a single
   ligature glyph: `->` (arrow), `>>=` (bind), `<-` (left arrow), `::` (double colon),
   `/=` (not-equal). To prove the underlying text is unchanged, select and copy a line
   containing `>>=` and paste into a plain text editor — it must paste back as the
   literal characters `>>=`.

3. **Both themes.** Toggle the site theme (the light/dark switch in the fumadocs UI).
   In both themes the font and ligatures persist; only the syntax colors change
   (`github-light` vs `github-dark`). This proves the Shiki `themes` pair and the
   theme-independent font/ligature CSS both work.

4. **Highlighting + Haskell grammar.** In the Haskell block, keywords (`module`,
   `import`, `do`, `where`), the type signature, and string literals are colored
   distinctly — confirming the `haskell` grammar is loaded, not a plain-text fallback.
   The `nix` block is also colored, confirming the extra langs.

Production build check:

```bash
pnpm build
```

Expected: `prebuild` runs `copy-fonts`, then `next build` completes without font
resolution errors and without "language not found" warnings for `haskell`/`nix`/
`cabal`/`bash`/`json`.

Type check (Plan A's gate, must stay green):

```bash
pnpm run types:check
```

Expected: no TypeScript errors introduced by the `app/layout.tsx` and `source.config.ts`
edits.


## Idempotence and Recovery

Every step is safe to re-run:

- `pnpm run copy-fonts` overwrites the OTFs in `public/fonts/` each time; re-running is
  harmless. `mkdirSync(..., { recursive: true })` and `copyFileSync` never fail on an
  existing directory or file.
- The `package.json`, `.gitignore`, `flake.nix`, `app/layout.tsx`, `app/global.css`,
  `source.config.ts`, `content/docs/meta.json`, and `content/docs/ligature-check.mdx`
  edits are all additive and idempotent; re-applying a diff that is already present is a
  no-op (the diff will simply not match, which is fine).

Recovery from the most common failure — **the licensed font is not on this machine**:
`copy-fonts` warns and exits 0, leaving `public/fonts/` empty. Then `next/font/local`
in `app/layout.tsx` cannot compile because its `src` paths do not exist. To keep the app
running, comment out the `pragmata` declaration and the `${pragmata.variable}` token in
`app/layout.tsx`. The CSS in `app/global.css` already lists
`ui-monospace, SFMono-Regular, Menlo, monospace` as fallbacks after `var(--font-pragmata)`,
so code blocks remain readable in a system monospace (without ligatures). Once the font
is available (a clone of `/Users/shinzui/Keikaku/bokuno/fonts` with its vendored
`fonts-archive/PragmataPro-0.901.zip` is present, so `nix build .#pragmataPro` succeeds),
re-run `pnpm run copy-fonts`, un-comment the `pragmata` lines, and ligatures return.
Document the temporary fallback in Surprises & Discoveries if you hit it.

Rollback: revert the six edited files and delete `scripts/copy-fonts.mjs`,
`content/docs/ligature-check.mdx`, and `public/fonts/`. Because `public/fonts/` is
git-ignored and the font input is `path:`-based, nothing licensed is ever committed.


## Interfaces and Dependencies

No new npm dependencies are added. The font and highlighter capabilities come from
packages Plan A already provides:

- `next/font/local` (from `next ^16.1.6`) — `localFont({ src, variable, display })`
  returns an object exposing `.variable` (a CSS class that defines `--font-pragmata`).
  Used in `app/layout.tsx`. The `src` entries are `{ path, weight, style }` records
  pointing at `public/fonts/PragmataPro_Mono_*_liga_09.otf`.
- fumadocs-mdx `^14.2.10` — `defineConfig({ mdxOptions: { rehypeCodeOptions } })` in
  `source.config.ts`. `rehypeCodeOptions` accepts `themes: { light, dark }` and
  `langs: string[]`, forwarded to fumadocs' bundled Shiki (v3). The contract at the end
  of Milestone 3 is: `langs` includes `'haskell'` (and `'nix'`, `'cabal'`, `'bash'`,
  `'json'`), and `themes` is `{ light: 'github-light', dark: 'github-dark' }`.
- fumadocs-ui `^16.6.17` — consumes the CSS custom property `--fd-font-mono`, which this
  plan sets in `app/global.css` to `var(--font-pragmata), ui-monospace, SFMono-Regular,
  Menlo, monospace`.

External (non-npm) dependency: the Nix flake at
`/Users/shinzui/Keikaku/bokuno/fonts`, consumed as a flake input named `pragmatapro`
and referenced by its capital-P package attribute `pragmataPro` (its `share/fonts/
opentype/` output directory supplies the four `PragmataPro_Mono_*_liga_*.otf` files).

Shared integration points (the contract with Plan A — extend, never replace):

- `source.config.ts` — owner Plan A; this plan fills the `rehypeCodeOptions` seam inside
  `mdxOptions`. Leave the `defineDocs` export intact.
- `app/global.css` — owner Plan A; this plan fills the `--fd-font-mono` seam in `:root`
  and the ligature-CSS seam after the imports. Leave Tailwind/fumadocs imports intact.
- `app/layout.tsx` — owner Plan A; this plan adds a `next/font/local` font and appends
  its variable to the existing `<html>` className. Leave the Inter setup intact.
- `package.json` / `flake.nix` / `.gitignore` — owner Plan A; this plan adds scripts, an
  input + package output, and an ignore line, all additively.


## Revision History

- 2026-05-30: Initial full draft of Plan B fleshed out from the skeleton, the canonical
  brief, the reference docs report, and direct inspection of
  `/Users/shinzui/Keikaku/bokuno/fonts` (`flake.nix`, `pragmataPro.nix`, and the built
  `result/` OTF listing) and Plan A's published seams. Reason: make the plan
  self-contained so a novice can implement PragmataPro + Haskell-aware Shiki ligatures
  end-to-end using only this file and the working tree.
