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

Concretely, the user-visible outcome is: build and serve the static site (`pnpm build`
then `pnpm start`, default `http://localhost:3000`) — or run the dev server with
`pnpm dev` — open the page that contains the Haskell sample added by this plan, and
observe (1) the monospace font is PragmataPro (its distinctive shapes — e.g. the dotted
zero, the wide glyphs — are obvious), (2) the sequences `->`, `>>=`, `<-`, `::`, `/=`
are drawn as single ligature glyphs, and (3) toggling the site theme between light and
dark keeps both the font and the ligatures, only changing the syntax colors.

Terms used throughout:

- **"Shiki"** is the syntax highlighter that fumadocs uses at *build time* to turn
  fenced code blocks into colored HTML. fumadocs-core bundles Shiki internally; we do
  not add a separate `shiki` dependency.
- **"fumadocs"** is the MDX documentation framework this site is built on. In this repo
  it runs on **TanStack Start** (a Vite-based React full-stack framework) producing a
  **static SPA**, not on Next.js.
- **"MDX"** is Markdown that can embed React components.
- **"Ligature CSS"** means the CSS properties `font-feature-settings` and
  `font-variant-ligatures`, which ask the browser to turn on the font's ligature and
  contextual-alternate features (`calt`/`liga`/`dlig`).
- **"Static SPA"** means the build (`vite build`) emits a fully static site under
  `.output/public` that any static file server can host; there is no Node server at
  runtime. Each docs page renders its MDX **client-side** via a client loader, so the
  prerendered HTML is a shell and the actual code-block markup (with ligature-friendly
  font + Shiki coloring) appears once the page hydrates in the browser.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented
here, even if it requires splitting a partially completed task into two ("done" vs.
"remaining"). This section must always reflect the actual current state of the work.

- [ ] Milestone 1 — Add the `/bokuno/fonts` PragmataPro package as a flake input and a
      `copy-fonts` step that places the four `_liga_` Mono OTFs into `public/fonts/`.
- [ ] Milestone 2 — Declare the four `@font-face` rules and set `--fd-font-mono` +
      ligature CSS in `src/styles/app.css` (filling Plan A's font seam). There is no
      `next/font` step — TanStack Start/Vite has no `next/font`.
- [ ] Milestone 3 — Configure Shiki (themes + langs including `haskell`) in
      `source.config.ts` (filling Plan A's Shiki seam).
- [ ] Milestone 4 — Add a Haskell verification page and confirm ligatures render in both
      themes in the browser.


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

Caveats about the `/bokuno/fonts` package were found during research and are designed
around defensively in this plan (so they are noted here up front rather than discovered
painfully later):

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
  `src = ./fonts-archive/PragmataPro-${version}.zip;` and `{ pkgs, ... }` wiring (NOT
  `callPackage` + `requireFile`). Consequence: the package builds without any manual
  `nix-store --add-fixed` step on any machine that has the fonts flake checked out with
  its `fonts-archive/` zip. The build evaluates under the fonts flake's own
  `config.allowUnfree = true`, so no extra unfree opt-in is needed on the consumer side.
  The `result/` symlink in the fonts repo was confirmed (2026-05-30) to contain the
  eight Mono OTFs (R/B/I/Z in plain and `_liga_` variants), each ~2.8 MB, plus macOS
  `._`-prefixed AppleDouble stubs (~163 B) that the copy step must ignore.

- **No `next/font` in this stack.** Confirmed by reading `package.json`,
  `vite.config.ts`, and `src/routes/__root.tsx`: this repo runs on TanStack Start +
  Vite, not Next.js. There is no `next/font/local`, no `app/layout.tsx`, no
  `next.config.mjs`. Fonts must be loaded with plain CSS `@font-face` in
  `src/styles/app.css`, referencing static assets served from `public/`. (See the
  Decision Log entry dated 2026-05-30.)

- **The body font is NOT Inter here.** Unlike a Next.js fumadocs starter, the TanStack
  Start SPA scaffold does not import Inter. `src/routes/__root.tsx` ships no body-font
  import; the body uses fumadocs' default font stack. This plan does NOT add a body
  font — it only governs the monospace (code) font. Do not assume an Inter import
  exists.

(More to be added during implementation.)


## Decision Log

Record every decision made while working on the plan.

- Decision: Switch font loading from `next/font/local` to plain CSS `@font-face` in
  `src/styles/app.css`.
  Rationale: The project pivoted from Next.js to TanStack Start (Vite). TanStack
  Start/Vite has no `next/font` API and no `app/layout.tsx`. The framework-agnostic way
  to self-host a font in a Vite/TanStack Start app is `@font-face` rules in CSS that
  reference static assets served from the repo-root `public/` directory by absolute URL
  (e.g. `url("/fonts/PragmataPro_Mono_R_liga_09.otf")`). This keeps the original intent
  (PragmataPro on code blocks with ligatures) and only changes the mechanics.
  Date: 2026-05-30

- Decision: Consume the existing Nix font package at `/Users/shinzui/Keikaku/bokuno/fonts`
  as a flake input rather than committing font binaries to this repo.
  Rationale: PragmataPro is a paid, licensed (unfree) font; checking the binaries into
  the docs repo risks redistributing them. The Nix package wraps a zip vendored inside
  the fonts flake (`fonts-archive/PragmataPro-0.901.zip`) and is the team's established
  distribution mechanism. We copy the OTFs into `public/fonts/` at dev/build time (the
  directory is git-ignored), so the binaries are never committed to THIS repo.
  Date: 2026-05-30

- Decision: Reference the OTFs from `public/fonts/` by absolute URL in `@font-face`
  (`src: url("/fonts/PragmataPro_Mono_R_liga_09.otf")`) rather than importing them as
  Vite module assets.
  Rationale: Files placed under the repo-root `public/` directory in a Vite/TanStack
  Start app are copied verbatim to the site root and are addressable at `/<name>`. This
  is the simplest approach for a novice, requires no import statements, and works
  identically in `vite dev` and the prerendered static build. Converting to woff2 first
  is an optional later size optimization, not required for correctness — the browser
  loads OTF fine.
  Date: 2026-05-30

- Decision: Reference the package by `packages.${system}.pragmataPro` (capital P), never
  `.#default`, and glob the OTF filenames rather than hard-coding the version.
  Rationale: Works around the two caveats documented in Surprises & Discoveries.
  Date: 2026-05-30

- Decision: Configure Shiki with an explicit `themes` (light/dark) and `langs` list that
  includes `haskell`, `nix`, `cabal`, `bash`, `json`, in `source.config.ts` via
  `defineConfig({ mdxOptions: { rehypeCodeOptions: { ... } } })`.
  Rationale: All samples are Haskell; relying on fumadocs' on-demand defaults risks a
  missing grammar and gives no control over the theme pair. Setting `themes` overrides
  fumadocs' default theme pair; we deliberately do NOT set `transformers`, so fumadocs'
  default code transformers (notation highlight/diff/focus) are preserved.
  Date: 2026-05-30


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

(To be filled during and after implementation.)


## Context and Orientation

You are working in the repository at `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`.
This repo contains a single fumadocs documentation site, built on **TanStack Start**
(Vite) as a **static SPA**, at the repository root. Treat yourself as new to this repo:
everything you need is in this file plus the working tree.

All commands in this plan run from `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`
inside the Nix dev shell. Enter the dev shell first:

```bash
nix develop
```

The dev shell provides Node 22 and pnpm (and `just`, `oxlint`, `oxfmt`, `tsc`). If you
have `direnv` configured, `cd` into the repo and the shell loads automatically via
`.envrc`. If dependencies are not installed yet, run `pnpm install`.

### Hard dependency: Plan A (the scaffold) must be done first

This plan extends an app that another plan already scaffolds. That plan lives at
`docs/plans/1-scaffold-the-fumadocs-documentation-app.md` (referenced here by path
only; it is sometimes called "Plan A" or "Plan #1"). The scaffold has already been
implemented on TanStack Start and committed. Before starting, confirm these files exist
and that `pnpm dev` serves a styled, empty docs site:

- `source.config.ts` — fumadocs-mdx configuration (the file Shiki is configured in).
- `src/styles/app.css` — base Tailwind v4 + fumadocs CSS imports (the file fonts and
  ligature CSS go in). This is the TanStack Start equivalent of a Next.js
  `app/global.css`.
- `src/routes/__root.tsx` — the root HTML document/layout for the SPA. It loads
  `src/styles/app.css` via `import appCss from "@/styles/app.css?url"` and a `<link>`
  tag. This is the TanStack Start equivalent of a Next.js `app/layout.tsx`. This plan
  does **not** edit this file (no font import is needed here — the font is loaded via
  CSS `@font-face`).
- `src/components/mdx.tsx` — the MDX component registry (not touched by this plan).
- `src/lib/source.ts`, `vite.config.ts`, `tsconfig.json`, `package.json`, `justfile`,
  and `flake.nix` at the repo root.

If those do not exist yet, stop and implement the scaffold plan first.

The TypeScript path alias is `@/* -> ./src/*` (declared in `tsconfig.json`), so e.g.
`@/styles/app.css` resolves to `src/styles/app.css`.

### Next.js → TanStack Start file/command mapping (orientation)

If you have seen the original Next.js draft of this plan, here is how the pieces map.
You do not need Next.js knowledge; this is only to prevent confusion:

```text
Next.js (old)                          TanStack Start (this repo)
------------------------------------   ------------------------------------------
app/layout.tsx (root layout)         → src/routes/__root.tsx (NOT edited by this plan)
app/global.css                       → src/styles/app.css (the font + ligature seam)
mdx-components.tsx                   → src/components/mdx.tsx (not touched here)
lib/source.ts                        → src/lib/source.ts
next.config.mjs                      → vite.config.ts
next dev   / pnpm dev                → vite dev   (still `pnpm dev`)
next build / pnpm build              → vite build (still `pnpm build`); STATIC SPA
next start / pnpm start              → serve .output/public (still `pnpm start`)
next/font/local                      → CSS @font-face in src/styles/app.css
RootProvider from fumadocs-ui/.../next → RootProvider from fumadocs-ui/provider/tanstack
```

### The seams the scaffold leaves for this plan

The scaffold intentionally leaves clearly-marked extension points ("seams") that this
plan fills. A "seam" is a spot in a file the scaffold owns where it placed a comment
marking exactly where this plan should insert its code, so the two plans share files
without conflicting. The contract is: **fill the seam in place; do not delete the
scaffold's surrounding code.** The two seams this plan fills are:

1. In `source.config.ts`, the scaffold left a commented block above the
   `export default defineConfig();` line (quoted verbatim from disk on 2026-05-30):

   ```text
   // SEAM (Plan B — Shiki): Plan B extends the config below with the Haskell-aware
   // Shiki highlighter + ligature-friendly transformers, e.g.:
   //
   //   export default defineConfig({
   //     mdxOptions: {
   //       rehypeCodeOptions: {
   //         // custom Shiki highlighter / themes / transformers for ligatures
   //       },
   //     },
   //   });
   //
   // Until then, the default config gives plain (un-ligatured) syntax highlighting.
   export default defineConfig();
   ```

   This plan replaces the bare `defineConfig()` call with one that passes
   `mdxOptions.rehypeCodeOptions` (themes + langs). Leave the `defineDocs(...)` export
   above it intact.

2. In `src/styles/app.css`, after the Tailwind/fumadocs imports, the scaffold left
   (quoted verbatim from disk on 2026-05-30):

   ```text
   /*
    * SEAM (Plan B — fonts & ligatures):
    * Plan B adds the PragmataPro @font-face declarations here and sets the
    * monospace font + font-feature-settings (ligatures: calt/liga/dlig) for
    * code blocks. Leave this block empty until Plan B fills it in.
    */
   ```

   This plan replaces that comment block with the `@font-face` rules, the
   `--fd-font-mono` override, and the ligature CSS.

`src/components/mdx.tsx` and the `content/docs/` tree carry seams owned by other plans
(Plan C — Mermaid, Plan D — IA/UI), not this one. Leave them alone except for the one
nav entry this plan appends in Milestone 4.

### Versions you can rely on (repeated here so you need not open the scaffold plan)

From `package.json` and `vite.config.ts` on 2026-05-30:

- `@tanstack/react-router` `1.170.9`, `@tanstack/react-start` `1.168.16`,
  `@tanstack/start-static-server-functions` `1.167.10`.
- `fumadocs-core` `16.9.3`, `fumadocs-ui` `16.9.3`, `fumadocs-mdx` `15.0.10`.
- `react` / `react-dom` `^19.2.6`.
- Vite `^8.0.14`, `@tailwindcss/vite` `^4.3.0`, `tailwindcss` `^4.3.0` (Tailwind v4),
  `nitro` pinned to `3.0.260429-beta`.
- TypeScript `^6.0.3`.
- Package manager **pnpm**; Node **22** (provided by the repo `flake.nix` dev shell).

fumadocs-mdx processes the MDX build through its Vite plugin (`mdx()` in
`vite.config.ts`), which reads `source.config.ts`. fumadocs-core bundles **Shiki**
internally (Shiki v4.1.0 in this lockfile) and exposes its options through
`mdxOptions.rehypeCodeOptions` in `source.config.ts`. We do **not** add a separate
`shiki` dependency. The bundled Shiki grammar set includes `haskell`, `nix`, `cabal`,
`bash`, and `json` — the five we pin.

Verification of the option shape (read from
`node_modules/fumadocs-core/dist/mdx-plugins/` and `node_modules/fumadocs-mdx/dist/` on
2026-05-30): `rehypeCodeOptions?: RehypeCodeOptions | false`, where `RehypeCodeOptions`
extends Shiki's `CodeOptionsThemes` (providing `themes: { light, dark }`) and accepts a
`langs` array of grammar names. fumadocs' default options also set `transformers`
(notation highlight/diff/focus); because we do **not** pass `transformers`, those
defaults are preserved.

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
  `$out/share/fonts/opentype/`. The build output (verified on this machine on 2026-05-30
  via the `result` symlink in `/Users/shinzui/Keikaku/bokuno/fonts`) contains these eight
  Mono OTFs (each ~2.8 MB), plus proportional variants we do not use and macOS `._`
  AppleDouble stubs we ignore:

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
  instead so the plan survives a version bump or a token change.

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

The repo currently has no `public/` directory; this plan creates `public/fonts/`. In a
Vite/TanStack Start app, files under the repo-root `public/` directory are served at the
site root (so `public/fonts/X.otf` is reachable at the URL `/fonts/X.otf`), which is why
the `@font-face` rules in Milestone 2 use absolute URLs like
`url("/fonts/PragmataPro_Mono_R_liga_09.otf")`.

The repo `flake.nix` (owned by the scaffold; it provides the Node 22 + pnpm dev shell)
gains the font flake as an input and a small package output so the OTFs are reachable at
a stable Nix store path. Add the input under `inputs` and reference the package by its
**working** attribute `pragmataPro` (capital P) — never `default`. Full edits are in
Concrete Steps.

Now add a copy script. Create `scripts/copy-fonts.mjs` at the repo root. It resolves the
font package's output directory, finds the four ligature Mono OTFs by glob, and copies
them into `public/fonts/`. It must be tolerant: if the font store path cannot be
resolved (the licensed zip is not on this machine), it prints a warning and exits 0 so
dev/build still proceed (the site then falls back to the system monospace, without
ligatures). Full file contents are in Concrete Steps.

Wire the script into pnpm so it runs automatically before dev and build via pnpm's
`pre*` lifecycle hooks (`predev` runs before `dev`, `prebuild` before `build`). Also
ensure `public/fonts/` is git-ignored so the licensed binaries are never committed.

### Milestone 2 — Load the font and enable ligatures (CSS only)

Scope: declare the four PragmataPro `@font-face` rules in `src/styles/app.css`, point
`--fd-font-mono` at the resulting font family, and add the ligature CSS to all code
surfaces. **There is no `next/font` step and no edit to `src/routes/__root.tsx`** — in
TanStack Start the font is loaded purely through CSS `@font-face` that references the
static assets under `public/fonts/`. At the end, code on every docs page renders in
PragmataPro with ligatures. Acceptance: in browser devtools, a `<pre>`/`code` inside
`.shiki` shows `font-family` resolving to `PragmataPro Mono` and `font-feature-settings`
reading `"liga" 1, "calt" 1`.

In `src/styles/app.css`, replace the font/ligature seam comment with `@font-face` rules
naming a single family `PragmataPro Mono` (with normal/bold × roman/italic faces), an
`--fd-font-mono` override on `:root`, and ligature rules on every code surface. The exact
CSS is in Concrete Steps. The `@font-face` `src` URLs are absolute (`/fonts/...`) because
the files live in `public/fonts/`.

### Milestone 3 — Configure Shiki (themes + Haskell-aware langs)

Scope: fill the `source.config.ts` seam with `rehypeCodeOptions` that pin a light/dark
theme pair and a language list including `haskell`. At the end, Haskell, Nix, Cabal,
Bash, and JSON fences are highlighted with the chosen themes. Acceptance: a Haskell
fence on a page shows colored tokens (keywords, types, operators) and the colors change
when the site theme toggles.

Replace the bare `export default defineConfig();` (the seam) with a call that passes
`mdxOptions.rehypeCodeOptions` carrying a `themes` pair and a `langs` list. The exact
edit is in Concrete Steps. `themes` is a light/dark pair; fumadocs renders both and CSS
shows the right one per theme. `langs` preloads exactly the grammars our docs use:
`haskell` (essential — every sample is Haskell), `cabal` (`.cabal`/`cabal.project`
snippets), `nix` (flake snippets), `bash` (shell commands), `json` (config). Markdown
authors should tag Haskell fences with ` ```haskell ` (the canonical Shiki grammar name).

### Milestone 4 — Verification page proving the whole chain

Scope: add one docs page containing a Haskell code block crafted to exercise the target
ligatures, then visually confirm the font + ligatures + highlighting in both themes in a
browser. At the end, there is a reproducible, human-verifiable demonstration. Acceptance
is in Validation and Acceptance.

Create `content/docs/ligature-check.mdx` (a temporary verification page; it may be
removed once the content plans land, or kept as a living smoke test). Its body includes
a Haskell fence using every target operator: `->`, `>>=`, `<-`, `::`, `/=`. The exact
file is in Concrete Steps. Also add it to the docs nav so it is reachable — append
`"ligature-check"` to the `pages` array in `content/docs/meta.json` (created by the
scaffold); do not remove existing entries.

Because docs pages render MDX **client-side** in this static SPA, you must verify in a
browser (the prerendered HTML is only a shell). Use `pnpm dev` for fast iteration, or
`pnpm build` + `pnpm start` to verify the production static output.


## Concrete Steps

All commands run from the repository root
`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` inside the Nix dev shell
(`nix develop`) unless stated otherwise. Steps are written to be safe to re-run.

### Step 1 — Add the flake input and package output

Edit the repo `flake.nix`. The current file (verbatim, 2026-05-30) declares its inputs
as separate `inputs.*` attributes and uses `flake-utils.lib.eachDefaultSystem`. Add the
font flake as an input:

```nix
inputs.pragmatapro.url = "path:/Users/shinzui/Keikaku/bokuno/fonts";
```

Add `pragmatapro` to the `outputs` lambda argument list so it is in scope, and expose a
package output that points at the capital-P attribute. Apply this diff:

```diff
   inputs.nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
   inputs.flake-utils.url = "github:numtide/flake-utils";
+  inputs.pragmatapro.url = "path:/Users/shinzui/Keikaku/bokuno/fonts";

-  outputs = { self, nixpkgs, flake-utils }:
+  outputs = { self, nixpkgs, flake-utils, pragmatapro }:
     flake-utils.lib.eachDefaultSystem (system:
       let
         pkgs = import nixpkgs { inherit system; };
       in
       {
         checks = {
         };

+        packages.pragmatapro-fonts = pragmatapro.packages.${system}.pragmataPro;
+
         devShells.default = pkgs.mkShell {
```

(Here `pragmatapro` is the input we declared and `pragmataPro` is its capital-P package
attribute. Never use `pragmatapro.packages.${system}.default` — that path is broken by
the casing typo documented above.)

Then update the lock. On current Nix:

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
// Copies the four PragmataPro ligature Mono OTFs into public/fonts/ so they can be
// served as static assets and referenced by @font-face in src/styles/app.css.
// Tolerant by design: if the licensed font package is unavailable on this machine,
// it warns and exits 0 so dev/build still proceed (site falls back to system monospace).
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  realpathSync,
} from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const targetDir = join(repoRoot, "public", "fonts");
const FONTS_FLAKE = "/Users/shinzui/Keikaku/bokuno/fonts";
const LIGA_GLOB = /_Mono_.*_liga_.*\.otf$/;

function resolveFontDir() {
  // 1) Preferred: ask Nix to build the capital-P package attribute (never #default).
  try {
    const out = execFileSync(
      "nix",
      [
        "build",
        "--no-link",
        "--print-out-paths",
        `path:${FONTS_FLAKE}#pragmataPro`,
      ],
      { encoding: "utf8" },
    ).trim();
    const dir = join(out, "share", "fonts", "opentype");
    if (existsSync(dir)) return dir;
  } catch {
    // fall through
  }
  // 2) Fallback: the fonts repo's own `result` symlink, if someone already built it.
  try {
    const dir = join(
      realpathSync(join(FONTS_FLAKE, "result")),
      "share",
      "fonts",
      "opentype",
    );
    if (existsSync(dir)) return dir;
  } catch {
    // fall through
  }
  return null;
}

const sourceDir = resolveFontDir();
if (!sourceDir) {
  console.warn(
    "[copy-fonts] PragmataPro package not available on this machine; " +
      "code blocks will use the system monospace fallback (no ligatures).",
  );
  process.exit(0);
}

const ligas = readdirSync(sourceDir).filter(
  (f) => LIGA_GLOB.test(f) && !f.startsWith("._"),
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

Note: the `._`-prefixed entries in the source directory are macOS AppleDouble
resource-fork stubs (~163 B each); the `!f.startsWith("._")` filter ignores them so only
the four real ~2.8 MB OTFs are copied.

### Step 3 — Wire pnpm scripts and gitignore

Apply this diff to `package.json` (add only; keep the scaffold's existing scripts —
`dev`, `build`, `start`, `preview`, `typecheck`, `lint`, `format`, `postinstall`, etc.).
The scaffold's `dev` is `vite dev` and `build` is `vite build`; pnpm runs `predev`
automatically before `dev` and `prebuild` before `build`:

```diff
   "scripts": {
     "dev": "vite dev",
     "build": "vite build",
     "start": "serve .output/public --config ../../serve.json",
     "preview": "vite preview",
     "typecheck": "fumadocs-mdx && tsc --noEmit",
     "lint": "oxlint",
     "lint:fix": "oxlint --fix",
     "format": "oxfmt --write .",
     "format:check": "oxfmt --check .",
-    "postinstall": "fumadocs-mdx"
+    "postinstall": "fumadocs-mdx",
+    "copy-fonts": "node scripts/copy-fonts.mjs",
+    "predev": "pnpm run copy-fonts",
+    "prebuild": "pnpm run copy-fonts"
   },
```

Apply this diff to `.gitignore` (add the line if absent; the repo already ignores
`.output`, `.source`, `node_modules`, etc.):

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

### Step 4 — Declare `@font-face`, set `--fd-font-mono`, enable ligatures in `src/styles/app.css`

Open `src/styles/app.css`. It currently begins with the three imports and the
scrollbar rules, then ends with the font/ligature seam comment block. Replace the
**entire seam comment block** (the `/* SEAM (Plan B — fonts & ligatures): ... */`
comment) with the CSS below. Do not touch the imports or the `html` rules above it.

```css
/*
 * Plan B (PragmataPro + Haskell ligatures).
 *
 * The OTFs are copied into public/fonts/ by scripts/copy-fonts.mjs (a predev/prebuild
 * hook). In a Vite / TanStack Start app, files under public/ are served at the site
 * root, so public/fonts/X.otf is reachable at the URL /fonts/X.otf. We self-host the
 * font with plain @font-face (TanStack Start/Vite has no next/font). Only the `_liga_`
 * faces ligate; we deliberately use those four.
 */
@font-face {
  font-family: "PragmataPro Mono";
  src: url("/fonts/PragmataPro_Mono_R_liga_09.otf") format("opentype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "PragmataPro Mono";
  src: url("/fonts/PragmataPro_Mono_B_liga_09.otf") format("opentype");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "PragmataPro Mono";
  src: url("/fonts/PragmataPro_Mono_I_liga_09.otf") format("opentype");
  font-weight: 400;
  font-style: italic;
  font-display: swap;
}
@font-face {
  font-family: "PragmataPro Mono";
  src: url("/fonts/PragmataPro_Mono_Z_liga_09.otf") format("opentype");
  font-weight: 700;
  font-style: italic;
  font-display: swap;
}

/* Route fumadocs' monospace at PragmataPro (ligature build) with system fallbacks. */
:root {
  --fd-font-mono: "PragmataPro Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
}

/* Enable PragmataPro + Haskell ligatures on every code surface, including fumadocs'
   Shiki output (.shiki) and inline/block code. */
code,
pre,
kbd,
samp,
.shiki,
.shiki code,
pre code {
  font-family: "PragmataPro Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  font-feature-settings: "liga" 1, "calt" 1;
  font-variant-ligatures: contextual common-ligatures;
}
```

Notes on these selectors and properties: `"liga" 1` turns on standard ligatures and
`"calt" 1` turns on contextual alternates — together they drive the Haskell operator
ligatures (`->`, `>>=`, `<-`, `::`, `/=`, `=>`, `<>`, `<$>`). `font-variant-ligatures`
is the higher-level CSS equivalent included for browsers/cases that prefer it. `.shiki`
and `.shiki code` are the elements fumadocs' Shiki highlighter emits; `pre`, `pre code`,
inline `code`, `kbd`, and `samp` cover non-highlighted and inline code. The font-family
fallback chain ensures readable monospace even when PragmataPro is absent (only the
ligatures are lost in that case). No edit to `src/routes/__root.tsx` is needed — it
already loads this stylesheet via its `<link rel="stylesheet">`.

### Step 5 — Configure Shiki in `source.config.ts`

Replace the bare default-config line (the seam target). Apply this diff:

```diff
-// Until then, the default config gives plain (un-ligatured) syntax highlighting.
-export default defineConfig();
+// Plan B: Haskell-aware Shiki. `themes` pins a light/dark pair (fumadocs renders both
+// and CSS shows the right one per theme). `langs` preloads the exact grammars the docs
+// use. We do NOT pass `transformers`, so fumadocs' default code transformers
+// (notation highlight/diff/focus) are preserved.
+export default defineConfig({
+  mdxOptions: {
+    rehypeCodeOptions: {
+      themes: { light: "github-light", dark: "github-dark" },
+      langs: ["haskell", "nix", "cabal", "bash", "json"],
+    },
+  },
+});
```

Keep the `defineDocs({ dir: "content/docs", ... })` export above it (and the `// SEAM
(Plan D)` comment) unchanged. You may also delete the multi-line `// SEAM (Plan B —
Shiki): ...` example comment block immediately above, since this plan now fills it;
leaving it is harmless but tidying it is preferred.

### Step 6 — Add the verification page

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

Append it to the nav. The scaffold's `content/docs/meta.json` (verbatim, 2026-05-30) is
`{ "title": "Documentation", "pages": ["index"] }`. Edit it so the verify page is
reachable; keep the existing entry:

```diff
 {
   "title": "Documentation",
-  "pages": ["index"]
+  "pages": ["index", "ligature-check"]
 }
```

(If the `pages` array already has more entries by the time you reach this step, just add
`"ligature-check"` to the end.)


## Validation and Acceptance

All commands run from the repo root inside `nix develop`.

### Option A — dev server (fast iteration)

```bash
pnpm dev
```

Expected console: the `predev` hook runs `copy-fonts` first (printing
`[copy-fonts] Copied 4 OTF(s) into public/fonts/.` or the warning), then Vite starts and
prints a local URL such as `http://localhost:3000`.

### Option B — production static build (what ships)

```bash
pnpm build
pnpm start
```

Expected: `prebuild` runs `copy-fonts`, then `vite build` prerenders the SPA into
`.output/public` without font-resolution errors and without "language not found"
warnings for `haskell`/`nix`/`cabal`/`bash`/`json`. `pnpm start` serves
`.output/public` (default `http://localhost:3000`).

### What to check in the browser

Open `http://localhost:3000/docs/ligature-check`. Remember the docs page renders MDX
**client-side**, so wait for the page to hydrate (the code block appears with colors and
the correct font once JS runs — the raw prerendered HTML is only a shell). Acceptance,
all of which a human can verify by looking:

1. **Font.** The Haskell code block renders in PragmataPro Mono (distinctive shapes;
   clearly not the default UI monospace). Confirm in devtools: select a token inside the
   code block, and in the Computed panel `font-family` resolves to `"PragmataPro Mono"`
   and `font-feature-settings` reads `"liga" 1, "calt" 1`. In the Network panel you
   should see `PragmataPro_Mono_R_liga_09.otf` (and possibly the B/I/Z faces) loaded
   from `/fonts/`.

2. **Ligatures.** In the Haskell block, these sequences are each drawn as a single
   ligature glyph: `->` (arrow), `>>=` (bind), `<-` (left arrow), `::` (double colon),
   `/=` (not-equal). To prove the underlying text is unchanged, select and copy a line
   containing `>>=` and paste into a plain text editor — it must paste back as the
   literal characters `>>=`.

3. **Both themes.** Toggle the site theme (the light/dark switch in the fumadocs UI). In
   both themes the font and ligatures persist; only the syntax colors change
   (`github-light` vs `github-dark`). This proves the Shiki `themes` pair and the
   theme-independent font/ligature CSS both work.

4. **Highlighting + Haskell grammar.** In the Haskell block, keywords (`module`,
   `import`, `do`, `where`), the type signature, and string literals are colored
   distinctly — confirming the `haskell` grammar is loaded, not a plain-text fallback.
   The `nix` block is also colored, confirming the extra langs.

### Type check (the scaffold's gate, must stay green)

```bash
pnpm run typecheck
```

Expected: no TypeScript errors introduced by the `source.config.ts` edit. (This runs
`fumadocs-mdx` then `tsc --noEmit`; the `src/styles/app.css`, `package.json`,
`flake.nix`, `.gitignore`, and MDX edits are not TypeScript and do not affect it.)


## Idempotence and Recovery

Every step is safe to re-run:

- `pnpm run copy-fonts` overwrites the OTFs in `public/fonts/` each time; re-running is
  harmless. `mkdirSync(..., { recursive: true })` and `copyFileSync` never fail on an
  existing directory or file.
- The `package.json`, `.gitignore`, `flake.nix`, `src/styles/app.css`,
  `source.config.ts`, `content/docs/meta.json`, and `content/docs/ligature-check.mdx`
  edits are all additive/replacing-a-known-seam and idempotent; re-applying a diff that
  is already present is a no-op (the diff will simply not match, which is fine).

Recovery from the most common failure — **the licensed font is not on this machine**:
`copy-fonts` warns and exits 0, leaving `public/fonts/` empty. Unlike the old Next.js
approach (`next/font/local`, which fails to compile when its `src` files are missing),
the CSS `@font-face` approach used here does NOT break the build: the browser simply
fails to load the missing OTF and the `font-family` fallback chain
(`ui-monospace, SFMono-Regular, Menlo, monospace`) provides a readable system monospace
(without ligatures). Nothing in `src/styles/app.css` needs to be commented out. Once the
font is available (a clone of `/Users/shinzui/Keikaku/bokuno/fonts` with its vendored
`fonts-archive/PragmataPro-0.901.zip` is present, so `nix build .#pragmataPro` succeeds),
re-run `pnpm run copy-fonts`, reload the page, and ligatures return. Document the
temporary fallback in Surprises & Discoveries if you hit it.

Rollback: revert the edits to `flake.nix`, `flake.lock`, `package.json`, `.gitignore`,
`src/styles/app.css`, `source.config.ts`, and `content/docs/meta.json`; delete
`scripts/copy-fonts.mjs`, `content/docs/ligature-check.mdx`, and `public/fonts/`. Because
`public/fonts/` is git-ignored and the font input is `path:`-based, nothing licensed is
ever committed.


## Interfaces and Dependencies

No new npm dependencies are added. The font and highlighter capabilities come from the
stack the scaffold already provides:

- **CSS `@font-face` + the repo-root `public/` static-asset convention** (Vite /
  TanStack Start) — replaces `next/font/local`. The four `@font-face` rules in
  `src/styles/app.css` register one family, `"PragmataPro Mono"`, across
  normal/bold × roman/italic, each pointing at `/fonts/PragmataPro_Mono_*_liga_09.otf`
  (served from `public/fonts/`). There is no `next/font` API in this stack and no edit to
  the root document `src/routes/__root.tsx`.
- **fumadocs-mdx `15.0.10`** — `defineConfig({ mdxOptions: { rehypeCodeOptions } })` in
  `source.config.ts`, processed by the `mdx()` plugin in `vite.config.ts`.
  `rehypeCodeOptions` (verified against the installed types,
  `node_modules/fumadocs-mdx/dist/core-*.d.ts` and
  `node_modules/fumadocs-core/dist/mdx-plugins/`) is `RehypeCodeOptions | false`;
  `RehypeCodeOptions` extends Shiki's `CodeOptionsThemes` (`themes: { light, dark }`) and
  accepts a `langs: string[]`. The contract at the end of Milestone 3 is: `langs`
  includes `'haskell'` (and `'nix'`, `'cabal'`, `'bash'`, `'json'`), and `themes` is
  `{ light: 'github-light', dark: 'github-dark' }`. We do not set `transformers`, so
  fumadocs' default transformers are kept.
- **fumadocs-ui `16.9.3`** — consumes the CSS custom property `--fd-font-mono`, which
  this plan sets in `src/styles/app.css` to
  `"PragmataPro Mono", ui-monospace, SFMono-Regular, Menlo, monospace`. fumadocs-core
  `16.9.3` bundles Shiki `4.1.0`, whose grammar set includes the five langs we pin.

External (non-npm) dependency: the Nix flake at
`/Users/shinzui/Keikaku/bokuno/fonts`, consumed as a flake input named `pragmatapro` and
referenced by its capital-P package attribute `pragmataPro` (its
`share/fonts/opentype/` output directory supplies the four
`PragmataPro_Mono_*_liga_*.otf` files).

Shared integration points (the contract with the scaffold — fill the seam, never replace
surrounding code):

- `source.config.ts` — owner: scaffold (Plan A); this plan fills the Shiki seam by
  passing `mdxOptions.rehypeCodeOptions`. Leave the `defineDocs` export intact.
- `src/styles/app.css` — owner: scaffold; this plan fills the fonts & ligatures seam with
  the `@font-face` rules, the `--fd-font-mono` override, and the ligature CSS. Leave the
  Tailwind/fumadocs imports and the `html` rules intact.
- `src/routes/__root.tsx` — owner: scaffold; **not edited by this plan** (no font import
  needed; it already loads `src/styles/app.css`).
- `package.json` / `flake.nix` / `.gitignore` — owner: scaffold; this plan adds scripts,
  a flake input + package output, and an ignore line, all additively.


## Revision History

- 2026-05-30: Initial full draft of this plan (then assuming a Next.js app) fleshed out
  from the skeleton, the canonical brief, the reference docs report, and direct
  inspection of `/Users/shinzui/Keikaku/bokuno/fonts` and Plan A's published seams.

- 2026-05-30: **Pivot rewrite — Next.js → TanStack Start (static SPA).** The project
  pivoted from Next.js to TanStack Start (Vite), and the scaffold (Plan A /
  `docs/plans/1-scaffold-the-fumadocs-documentation-app.md`) was re-implemented on
  TanStack Start and committed. This plan was comprehensively rewritten against the real
  current working tree to preserve its intent (PragmataPro + Haskell-aware Shiki
  ligatures on code blocks) while replacing every Next.js mechanism with its TanStack
  Start equivalent. Concretely:
  - Font loading switched from `next/font/local` in `app/layout.tsx` to plain CSS
    `@font-face` in `src/styles/app.css` (Milestone 2 / Step 4), because TanStack
    Start/Vite has no `next/font` API. `src/routes/__root.tsx` is no longer edited. The
    OTFs are now referenced by absolute URL from the repo-root `public/fonts/` static
    directory.
  - The Shiki seam moved from `source.config.ts`'s `mdxOptions: {}` placeholder (Next
    draft) to the scaffold's actual `export default defineConfig()` seam, filled via
    `defineConfig({ mdxOptions: { rehypeCodeOptions: { themes, langs } } })`; the option
    shape was re-verified against the installed `fumadocs-mdx 15.0.10` /
    `fumadocs-core 16.9.3` (Shiki 4.1.0) types. We now explicitly avoid overriding
    fumadocs' default `transformers`.
    The CSS file path moved `app/global.css` → `src/styles/app.css`; the root layout
    `app/layout.tsx` → `src/routes/__root.tsx`; build pipeline `next.config.mjs` →
    `vite.config.ts`.
  - Commands updated: `next dev`→`vite dev` (still `pnpm dev`), `next build`→`vite build`
    (still `pnpm build`, now emitting a static SPA in `.output/public`),
    `next start`→`pnpm start` (`serve .output/public`); type-check is now
    `pnpm run typecheck` (`fumadocs-mdx && tsc --noEmit`, the scaffold's gate).
  - Acceptance reworded as observable browser behavior, noting MDX renders client-side
    so verification must happen in a hydrated browser page (the prerendered HTML is a
    shell), via `pnpm dev` or `pnpm build` + `pnpm start`.
  - Recovery simplified: the CSS `@font-face` fallback chain degrades gracefully when the
    licensed font is absent (no build break), unlike `next/font/local` which fails to
    compile on missing `src` files.
  - Version references updated to the installed set (TanStack Router/Start, fumadocs
    `16.9.3`/`15.0.10`, React 19.2.6, Vite 8, Tailwind v4, nitro beta). The
    `/bokuno/fonts` Nix facts (casing typo, version-token glob, vendored zip, eight Mono
    OTFs) are unchanged and re-confirmed on disk on 2026-05-30.
  Reason: keep the plan self-contained and implementable against the new stack so a
  novice can deliver PragmataPro + Haskell-aware Shiki ligatures using only this file and
  the working tree.
