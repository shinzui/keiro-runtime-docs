---
id: 1
slug: scaffold-the-fumadocs-documentation-app
title: "Scaffold the fumadocs documentation app"
kind: exec-plan
created_at: 2026-05-30T20:05:53Z
intention: "intention_01ksx5mf7qe2ht659e4kr9w2t0"
master_plan: "docs/masterplans/1-keiro-runtime-docs-infrastructure-and-kiroku-foundation.md"
---

# Scaffold the fumadocs documentation app

> **Status: COMPLETE (2026-05-30).** This plan was first implemented on Next.js,
> then **re-implemented on TanStack Start (static SPA)** when the framework
> requirement changed. This document describes the TanStack Start build that is
> actually committed. See the Decision Log and the revision note at the bottom
> for the pivot history.

## Purpose & Big Picture

This plan stands up the **foundation** of the keiro-runtime-docs documentation
platform: a single React application at the repository root, powered by
[fumadocs](https://fumadocs.dev) (a documentation framework that turns MDX files
into a docs site with navigation, search, a table of contents, and theming) and
running on **[TanStack Start](https://tanstack.com/start)** — a Vite-based,
full-stack React framework built on **TanStack Router**. The site is shipped as
a **static SPA**: `vite build` prerenders the pages into plain static files under
`.output/public`, which can be served by any static file host (no server
required).

Two terms used throughout:

- **MDX** — Markdown that can also embed React components. fumadocs renders
  `.mdx` files into pages.
- **SPA (single-page app)** — the browser loads one HTML shell plus JavaScript,
  and the client-side router renders pages. We *prerender* (statically generate)
  real HTML for known pages at build time so the first paint is fast and the
  output is host-agnostic.

When this plan is complete you can:

- run `pnpm dev` and open `http://localhost:3000/docs` to see a styled, working
  docs shell rendering a seeded MDX page;
- run `pnpm build` to produce a static site in `.output/public`, then `pnpm
  start` to serve it (all routes return HTTP 200, with an SPA fallback for
  unknown paths);
- run `pnpm exec tsc --noEmit` with zero type errors.

Nothing fancy renders yet (no custom fonts, no Mermaid, no real content) — but
the whole machine is wired and green, with clearly-marked **seams** so the
downstream plans extend it without re-architecting.

This is **Plan A**, the root of the master plan
`docs/masterplans/1-keiro-runtime-docs-infrastructure-and-kiroku-foundation.md`.
Every other plan builds on the files this plan creates:

- **Plan B** (`docs/plans/2-pragmatapro-font-and-shiki-code-ligatures.md`) wires
  the PragmataPro font + Shiki code-block ligatures. It extends the **Shiki seam**
  in `source.config.ts` and the **font seam** in `src/styles/app.css`.
- **Plan C** (`docs/plans/3-beautiful-mermaid-diagrams-with-zoom-and-pan.md`) adds
  Mermaid diagrams. It extends the **component seam** in `src/components/mdx.tsx`.
- **Plan D** (`docs/plans/4-documentation-information-architecture-and-authoring-system.md`)
  defines the content tree + navigation taxonomy. It owns the **nav seam** in
  `src/lib/layout.shared.tsx`, extends `src/lib/source.ts`, and registers
  authoring components in `src/components/mdx.tsx`.
- **Plan E** (`docs/plans/5-kiroku-foundation-documentation-set.md`) authors the
  kiroku docs on top of Plan D's IA, under `content/docs/`.
- **Plan F** (`docs/plans/6-build-quality-gates-and-ci.md`) adds the
  build/lint/typecheck/link-check gates and CI on top of the pnpm scripts.

**Capabilities delivered by this plan (observable):**

1. A reproducible Nix dev shell providing **pnpm** and **Node 22** (the repo
   originally shipped a bun-based shell; this plan replaced it).
2. A TanStack Start + fumadocs app whose dependencies install with `pnpm install`.
3. A docs route (`/docs/$`) that renders seeded MDX with fumadocs styling, a left
   sidebar, and a table of contents.
4. Client-side search (Orama) and a static search index at `/api/search`.
5. A raw-markdown route (`/docs/<slug>.md`) backing fumadocs' "copy/view as
   markdown" controls.
6. Clearly-marked **seams** so Plans B–F extend the app cleanly.

---

## Context & Orientation

### Where we started, and the reference

The repo root is `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`. Before this
plan it contained only Nix files (`flake.nix`, `flake.lock`), the planning docs
under `docs/`, vendored skills under `.claude/`, a bun-flavoured `package.json`
and `tsconfig.json` from scaffolding, `.oxlintrc.json`, and `.gitignore`.

The known-good reference is the official fumadocs **`tanstack-start-spa`**
example at:

```text
/Users/shinzui/Keikaku/fumadocs-project/fumadocs/examples/tanstack-start-spa
```

Every file below is adapted from that example (branding + seam comments are the
only intentional divergences). You may read it for cross-reference, but all
required contents are reproduced here.

### Domain vocabulary (read if TanStack Start / fumadocs is new)

- **TanStack Start** — a full-stack React framework on top of **TanStack Router**
  and **Vite**. Routes are files under `src/routes/`. Server endpoints and
  "server functions" are supported; in SPA mode most rendering happens in the
  browser.
- **Vite** — the build tool / dev server. Config lives in `vite.config.ts`
  (there is **no** `next.config.mjs`). Plugins wire in React, Tailwind, fumadocs,
  TanStack Start, and Nitro.
- **Nitro** — the server/build engine TanStack Start uses. For a static SPA it
  drives the prerender that emits `.output/public`.
- **`source.config.ts`** — fumadocs-mdx's build-time config. It declares a
  *collection* of docs rooted at `content/docs/`. The `fumadocs-mdx/vite` plugin
  parses every MDX file and generates a hidden `.source/` directory of typed
  exports (`server.ts`, `browser.ts`, …). You never edit `.source/`; it is
  generated and git-ignored. The tsconfig alias `collections/*` → `.source/*`
  makes it importable as `collections/server` / `collections/browser`.
- **`src/lib/source.ts`** — wraps the generated collection in a fumadocs
  `loader()` served under `/docs`, exposing `source.getPage(slugs)`,
  `source.getPageTree()`, `source.serializePageTree(...)`, etc.
- **`src/components/mdx.tsx`** — the central MDX-to-React component map
  (`getMDXComponents` / `useMDXComponents`). The seam Plan C (Mermaid) and Plan D
  (authoring components) extend.
- **`src/routes/__root.tsx`** — the root document (html/head/body), loads global
  CSS, and wraps everything in fumadocs' `RootProvider`
  (`fumadocs-ui/provider/tanstack`) with the search dialog.
- **`src/routes/index.tsx`** — the landing page at `/`.
- **`src/routes/docs/$.tsx`** — the docs catch-all. It uses a **client loader**
  (`createClientLoader` from `collections/browser`) so the MDX body renders in
  the browser; the page tree comes from a static server function.
- **`src/routes/docs/{$}[.]md.ts`** — serves the raw processed markdown for a
  page at `/docs/<slug>.md` (the literal filename uses TanStack Router's escaping:
  `{$}` is the splat, `[.]md` is a literal `.md`).
- **`src/routes/api/search.ts`** — the static search index endpoint (Orama).
- **`src/lib/layout.shared.tsx`** — shared layout options (`baseOptions()`): nav
  title and (later, via Plan D) the top-level library links.
- **Tailwind v4** — configured in CSS (`src/styles/app.css`) via the
  `@tailwindcss/vite` plugin; fumadocs ships a preset you `@import`.

### Exact stack (pinned in `package.json`; lockfile committed)

```text
@tanstack/react-router                 1.170.9
@tanstack/react-start                  1.168.16
@tanstack/start-static-server-functions 1.167.10
fumadocs-core                          16.9.3
fumadocs-ui                            16.9.3
fumadocs-mdx                           15.0.10
react / react-dom                      ^19.2.6
vite                                   ^8.0.14
@vitejs/plugin-react                   ^6.0.2
@tailwindcss/vite / tailwindcss        ^4.3.0
nitro                                  3.0.260429-beta   (see Decision Log — NOT the latest beta)
@orama/orama                           ^3.1.18
lucide-react                           ^1.17.0
tailwind-merge                         ^3.6.0
serve                                  ^14.2.6
srvx                                   ^0.11.16
typescript                             ^6.0.3
@types/mdx                             2.0.13
@types/node / @types/react / @types/react-dom  ^25.9.1 / ^19.2.15 / ^19.2.3
```

Toolchain: **pnpm** + **Node 22** via the Nix dev shell. Do not use bun or npm.

### Target layout (what this plan produces)

```text
keiro-runtime-docs/
├── src/
│   ├── components/
│   │   ├── mdx.tsx              # MDX component registry (SEAM: Plan C, Plan D)
│   │   ├── search.tsx          # Orama client search dialog
│   │   └── not-found.tsx
│   ├── lib/
│   │   ├── source.ts           # fumadocs loader (SEAM: Plan D)
│   │   ├── layout.shared.tsx   # baseOptions() nav (SEAM: Plan D)
│   │   ├── shared.ts           # appName, docsRoute, gitConfig
│   │   └── cn.ts
│   ├── routes/
│   │   ├── __root.tsx          # root document + RootProvider
│   │   ├── index.tsx           # landing page /
│   │   ├── api/search.ts       # static search index
│   │   └── docs/
│   │       ├── $.tsx           # docs page (client loader)
│   │       └── {$}[.]md.ts     # raw markdown route
│   ├── styles/app.css          # Tailwind + fumadocs CSS (SEAM: Plan B fonts)
│   ├── router.tsx
│   └── routeTree.gen.ts        # generated by TanStack Router; COMMITTED
├── content/docs/
│   ├── index.mdx               # seeded page (SEAM: Plan D/E content tree)
│   └── meta.json
├── source.config.ts            # fumadocs-mdx config (SEAM: Plan B Shiki)
├── vite.config.ts              # Vite + plugins (replaces next.config.mjs)
├── serve.json                  # SPA rewrite for `serve`
├── tsconfig.json
├── package.json
├── pnpm-workspace.yaml         # pnpm 11 allowBuilds (esbuild, sharp)
├── flake.nix                   # modified: bun → pnpm + Node 22
└── .gitignore                  # ignores .output/.nitro/.tanstack/.source
```

Notes: `.source/`, `.output/`, `.nitro/`, `.tanstack/` are generated and
git-ignored. `src/routeTree.gen.ts` is generated by the TanStack Router plugin
but **committed**, so `tsc --noEmit` resolves the route tree on a clean checkout.
`pnpm-lock.yaml` is committed for reproducibility.

---

## Plan of Work

The work is six milestones; each leaves the repo in a working state.

```text
M1  Nix dev shell: bun → pnpm + Node 22            (toolchain green)
M2  package.json + pnpm install                     (deps resolve)
M3  fumadocs + Vite wiring                           (source.config.ts, vite.config.ts, src/lib, src/components)
M4  TanStack Start routes + Tailwind                 (src/routes/*, src/styles/app.css)
M5  Seed content + dev/build/serve                   (browser shows the docs shell)
M6  Seams + .gitignore + production build            (extension points; static build passes)
```

Dependencies are linear: M2 needs M1's pnpm; M3–M4 need M2's deps; M5 needs
M3–M4; M6 hardens everything. `routeTree.gen.ts` and `.source/` are first
generated by the M5 `vite dev`/`vite build`.

---

## Concrete Steps

> All commands run from `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`
> inside the Nix dev shell. Enter it with `nix develop` (or `direnv allow`).
> Every file path is repo-root-relative.

### Milestone 1 — Nix dev shell: bun → pnpm + Node 22

The repo's `flake.nix` dev shell originally provided `bun` plus
`just`/`oxlint`/`oxfmt`/`typescript`. Swap `pkgs.bun` for `pkgs.nodejs_22` +
`pkgs.pnpm`, keep the rest (they serve Plan F's CI), and update the `shellHook`:

```diff
         devShells.default = pkgs.mkShell {
           nativeBuildInputs = [
-            pkgs.bun
+            pkgs.nodejs_22
+            pkgs.pnpm
             pkgs.just
             pkgs.oxlint
             pkgs.oxfmt
             pkgs.typescript
           ];

           shellHook = ''
             export LANG=en_US.UTF-8
+
+            echo "keiro-runtime-docs dev shell"
+            echo "node $(node --version)"
+            echo "pnpm $(pnpm --version)"

-            if [ ! -d node_modules ]; then
-              echo "Run 'just install' (bun install) to fetch dependencies."
+            if [ ! -d node_modules ]; then
+              echo "Run 'pnpm install' to fetch dependencies."
             fi
           '';
         };
```

**Acceptance:** `nix develop --command bash -c 'node --version && pnpm --version'`
prints a `v22.*` line and a pnpm version (observed: `v22.22.3`, `pnpm 11.4.0`).

### Milestone 2 — package.json and install

Create `package.json` (merging the fumadocs/TanStack deps with the repo's
existing oxlint/oxfmt scripts):

```json
{
  "name": "keiro-runtime-docs",
  "version": "0.1.0",
  "description": "Docs for keiro runtime",
  "type": "module",
  "private": true,
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
    "postinstall": "fumadocs-mdx"
  },
  "dependencies": {
    "@orama/orama": "^3.1.18",
    "@tanstack/react-router": "1.170.9",
    "@tanstack/react-start": "1.168.16",
    "@tanstack/start-static-server-functions": "1.167.10",
    "fumadocs-core": "16.9.3",
    "fumadocs-mdx": "15.0.10",
    "fumadocs-ui": "16.9.3",
    "lucide-react": "^1.17.0",
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "tailwind-merge": "^3.6.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.0",
    "@types/mdx": "2.0.13",
    "@types/node": "^25.9.1",
    "@types/react": "^19.2.15",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.2",
    "nitro": "3.0.260429-beta",
    "serve": "^14.2.6",
    "srvx": "^0.11.16",
    "tailwindcss": "^4.3.0",
    "typescript": "^6.0.3",
    "vite": "^8.0.14"
  }
}
```

pnpm 11 no longer reads a `pnpm` field in `package.json` and blocks unapproved
native build scripts. Create `pnpm-workspace.yaml` to approve the two we need:

```yaml
allowBuilds:
  esbuild: true
  sharp: true
```

Install:

```bash
pnpm install
```

> `@types/mdx` is a **direct** devDependency on purpose: pnpm's strict
> `node_modules` does not hoist it, so `import type { MDXComponents } from
> "mdx/types"` would not resolve otherwise. If install prints `Abort trap: 6`
> (an intermittent sandbox artifact), simply re-run `pnpm install` — it is
> idempotent and converges.

**Acceptance:**
`pnpm ls @tanstack/react-start fumadocs-ui fumadocs-mdx vite` shows the pinned
versions.

### Milestone 3 — fumadocs + Vite wiring

Create `source.config.ts` (the **Shiki seam** for Plan B):

```ts
import { defineConfig, defineDocs } from "fumadocs-mdx/config";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

// SEAM (Plan B — Shiki): Plan B extends defineConfig with
// mdxOptions.rehypeCodeOptions (Haskell-aware Shiki + ligature transformers).
export default defineConfig();
```

Create `vite.config.ts` (replaces `next.config.mjs`):

```ts
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import mdx from "fumadocs-mdx/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  server: { port: 3000 },
  plugins: [
    mdx(),
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
        prerender: { enabled: true, crawlLinks: true },
      },
      pages: [{ path: "/docs" }, { path: "/api/search" }],
    }),
    react(),
    nitro(),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: { tslib: "tslib/tslib.es6.js" },
  },
});
```

Create `tsconfig.json` (note the `@/*` and `collections/*` path aliases):

```json
{
  "include": ["**/*.ts", "**/*.tsx"],
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "types": ["vite/client"],
    "isolatedModules": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "target": "ES2022",
    "allowJs": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./src/*"],
      "collections/*": ["./.source/*"]
    },
    "noEmit": true
  }
}
```

Create `src/lib/shared.ts`, `src/lib/cn.ts`, `src/lib/source.ts`,
`src/lib/layout.shared.tsx`, and `src/components/mdx.tsx`,
`src/components/search.tsx`, `src/components/not-found.tsx`. The full contents
are committed in the repo; the load-bearing seams are:

`src/lib/source.ts` (imports the generated `collections/server`; the **Plan D**
loader seam):

```ts
import { loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { docs } from "collections/server";
import { docsRoute } from "./shared";

// SEAM (Plan D): extend the loader (icons, page-tree transforms) here.
export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: docsRoute,
  plugins: [lucideIconsPlugin()],
});
// + slugsToMarkdownPath / markdownPathToSlugs / getLLMText helpers (raw-md route)
```

`src/lib/layout.shared.tsx` (the **Plan D** nav seam — title only for now):

```tsx
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { appName, gitConfig } from "./shared";

// SEAM (Plan D): add the per-library top-level `links` (kiroku/keiro/keiki/
// shibuya) here. The scaffold ships only the title so the SPA prerenderer does
// not crawl links to pages that do not exist yet.
export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: appName },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
```

`src/components/mdx.tsx` (the **Plan C / Plan D** component seam):

```tsx
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

// SEAM (Plan C — Mermaid) / SEAM (Plan D — UI components): merge components in.
export function getMDXComponents(components?: MDXComponents) {
  return { ...defaultMdxComponents, ...components } satisfies MDXComponents;
}
export const useMDXComponents = getMDXComponents;
declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
```

**Acceptance:** files exist; type errors are expected until M4/M5 generate
`.source/` and `routeTree.gen.ts`.

### Milestone 4 — TanStack Start routes + Tailwind

Create `src/styles/app.css` (the **Plan B** font/ligature seam):

```css
@import "tailwindcss";
@import "fumadocs-ui/css/neutral.css";
@import "fumadocs-ui/css/preset.css";

html { scrollbar-gutter: stable; }
html > body[data-scroll-locked] {
  margin-right: 0px !important;
  --removed-body-scroll-bar-size: 0px !important;
}

/* SEAM (Plan B — fonts & ligatures): PragmataPro @font-face + --fd-font-mono. */
```

Create `src/router.tsx`, `src/routes/__root.tsx` (root document; `RootProvider`
from `fumadocs-ui/provider/tanstack`, loads `@/styles/app.css?url`),
`src/routes/index.tsx` (landing page), `src/routes/docs/$.tsx` (docs catch-all
using the **client loader** pattern with `useMDXComponents()`),
`src/routes/docs/{$}[.]md.ts` (raw-markdown route), and `src/routes/api/search.ts`
(static Orama search). Full contents are committed; they are adapted verbatim
from the `tanstack-start-spa` example with keiro branding.

Also create `serve.json` (SPA fallback for the static `serve`):

```json
{
  "rewrites": [{ "source": "/**", "destination": "/_shell.html" }]
}
```

**Acceptance:** after M5 generates `.source/` and `routeTree.gen.ts`,
`pnpm exec tsc --noEmit` exits 0.

### Milestone 5 — Seed content; dev, build, serve

Create `content/docs/index.mdx`:

```mdx
---
title: keiro runtime docs
description: Documentation for the keiro runtime.
---

Welcome to the **keiro runtime documentation**.

## Getting started

This is a placeholder landing page. The real information architecture and
content arrive in later plans (Plan D / Plan E).
```

Create `content/docs/meta.json`:

```json
{ "title": "Documentation", "pages": ["index"] }
```

Generate and run. The first `vite dev`/`vite build` generates `.source/` (via
the fumadocs-mdx plugin) and `src/routeTree.gen.ts` (via the TanStack Router
plugin):

```bash
pnpm build      # vite build → prerenders to .output/public
pnpm dev        # vite dev server on http://localhost:3000
```

**Acceptance (observed):** `pnpm build` prints
`[prerender] Prerendered 4 pages:` (`/`, `/docs`, `/docs/index.md`,
`/api/search`). `pnpm dev` serves `http://localhost:3000/docs`, `/`, and
`/api/search` with HTTP 200. Because the docs body renders **client-side**, the
MDX content appears in the browser (and in the static search index and the raw
`/docs/index.md`), not in the prerendered HTML shell.

### Milestone 6 — Seams, .gitignore, production serve

Update `.gitignore` to ignore the generated Vite/TanStack/Nitro/fumadocs dirs
(and the TS build cache) while **committing** `src/routeTree.gen.ts`:

```text
# Vite / TanStack Start / Nitro / fumadocs (generated)
.output
.nitro
.tanstack
.cache
.vercel
.source
out
pnpm-debug.log*
tsconfig.tsbuildinfo
# src/routeTree.gen.ts is committed (so tsc works on a clean checkout).
```

Serve the static build:

```bash
pnpm start      # serve .output/public --config ../../serve.json
```

**Acceptance (observed):** every route returns HTTP 200 —
`/`, `/docs`, `/docs/index.md`, `/api/search`, and an unknown path
(`/unknown` → 200, SPA fallback to `_shell.html`). `git check-ignore .output
.nitro .tanstack .source node_modules` echoes them; none are tracked.

---

## Validation & Acceptance

Run from the repo root inside the Nix dev shell. The plan is **done** when:

1. **Toolchain:** `node --version` is `v22.*`; `pnpm --version` prints.
2. **Deps pinned:** `pnpm ls @tanstack/react-start fumadocs-ui fumadocs-mdx vite`
   shows `1.168.16`, `16.9.3`, `15.0.10`, `8.x`.
3. **Types clean:** `pnpm exec tsc --noEmit` exits 0. (Run `pnpm exec fumadocs-mdx`
   first if `.source` is missing; `src/routeTree.gen.ts` is committed.)
4. **Dev server:** `pnpm dev` → `http://localhost:3000/docs` shows the styled
   fumadocs shell rendering `content/docs/index.mdx`; `/` shows the landing page.
5. **Static build:** `pnpm build` prerenders 4 pages into `.output/public`.
6. **Static serve:** `pnpm start` serves all routes 200, with SPA fallback.
7. **Ignore rules:** `git check-ignore .output .nitro .tanstack .source` echoes
   them; `pnpm-lock.yaml` and `src/routeTree.gen.ts` ARE committed.
8. **Seams present:** `grep -rl "SEAM" source.config.ts src/styles/app.css
   src/components/mdx.tsx src/lib/layout.shared.tsx src/lib/source.ts` lists all
   five.

---

## Idempotence & Recovery

- **Creating files / configs:** overwriting with the contents above is
  idempotent.
- **`flake.nix`:** re-applying the same edit is a no-op. If `nix develop` errors,
  reload the shell; no `nix flake update` is needed.
- **`pnpm install`:** idempotent; reconciles `node_modules` to the lockfile. If
  it prints `Abort trap: 6` (sandbox artifact), just re-run.
- **`.source/` (generated):** `rm -rf .source && pnpm exec fumadocs-mdx`.
- **`src/routeTree.gen.ts` (generated, committed):** regenerated by any
  `vite dev`/`vite build`. If stale, run `pnpm build` and commit the result.
- **`.output` / `.nitro` build caches:** disposable; `rm -rf .output .nitro` then
  `pnpm build`.

Detecting partial application: missing `node_modules` → run `pnpm install`;
`collections/server` import error in tsc → run `pnpm exec fumadocs-mdx`; unstyled
page → `src/styles/app.css` not imported in `src/routes/__root.tsx`; `node` not
v22 → reload the Nix shell.

**Known rough edge:** `pnpm dev`'s `/docs/<slug>.md` route returns 404 in dev,
though the prerendered static build serves it (200). It is a dev-only quirk and
does not affect the shipped artifact.

---

## Interfaces & Dependencies

### Public interfaces introduced

- **Routes:** `/` (landing), `/docs/$` (docs pages), `/docs/<slug>.md` (raw
  markdown), `/api/search` (static search index).
- **`source`** (`src/lib/source.ts`): `source.getPage(slugs)`,
  `source.getPageTree()`, `source.serializePageTree(...)`, base URL `/docs`.
- **`getMDXComponents()` / `useMDXComponents()`** (`src/components/mdx.tsx`).
- **`baseOptions()`** (`src/lib/layout.shared.tsx`): nav title (+ GitHub link).
- **`docs` collection** (`source.config.ts`): rooted at `content/docs/`.

### Extension points (SEAMS) for downstream plans

| Seam | File | Consumed by | Enables |
|---|---|---|---|
| Shiki | `source.config.ts` (`defineConfig`) | Plan B (`docs/plans/2-...md`) | Haskell Shiki / themes / transformers via `mdxOptions.rehypeCodeOptions` |
| Font / ligature CSS | `src/styles/app.css` | Plan B | PragmataPro `@font-face` (CSS, not `next/font`) + `--fd-font-mono` |
| MDX components | `src/components/mdx.tsx` (`getMDXComponents`) | Plan C (`docs/plans/3-...md`), Plan D (`docs/plans/4-...md`) | Register `Mermaid` / authoring components |
| Nav / IA | `src/lib/layout.shared.tsx`, `src/lib/source.ts` | Plan D | Add per-library nav `links`; extend the loader |
| Content tree | `content/docs/` (`index.mdx`, `meta.json`) | Plan D, Plan E (`docs/plans/5-...md`) | Author the real docs tree |
| pnpm scripts + flake | `package.json`, `flake.nix` | Plan F (`docs/plans/6-...md`) | Build/lint/typecheck/link-check gates + CI |

### Downstream

Plans B–F depend on this plan being green. They must not break the routes,
`source`, `getMDXComponents()`, the static build, or the committed
`src/routeTree.gen.ts`.

---

## Decision Log

- **2025-12-09 — Single app at repo root (not a monorepo).** Simpler for a
  docs-only repo; avoids workspace tooling overhead.
- **2025-12-09 — Pin dependency versions; commit the lockfile.** Reproducibility
  over auto-upgrades.
- **2026-05-30 — pnpm + Node 22 via Nix, replacing bun.** The whole team gets a
  reproducible toolchain. Kept `just`/`oxlint`/`oxfmt`/`typescript` in the shell
  for Plan F.
- **2026-05-30 — _Framework: TanStack Start (static SPA), not Next.js._** The
  requirement changed mid-implementation. The scaffold was re-implemented on
  TanStack Start (Vite + TanStack Router), shipped as a static SPA. The reference
  skeleton is the fumadocs `tanstack-start-spa` example (replacing shibuya-docs,
  which is Next.js-based). The SPA variant was chosen because its static
  `.output/public` is host-agnostic — aligned with the master plan's
  deferred-host decision.
- **2026-05-30 — Keep `oxlint` as `lint` (not `next lint`/ESLint).** The repo +
  flake already ship oxlint/oxfmt; there is no ESLint and Next is gone.
- **2026-05-30 — Add `@types/mdx` as a direct devDependency.** pnpm's strict
  layout does not hoist it, so `mdx/types` would not resolve.
- **2026-05-30 — Approve native builds via `pnpm-workspace.yaml`.** pnpm 11 no
  longer reads the `package.json` `pnpm` field; approve `esbuild` and `sharp`.
- **2026-05-30 — Pin `nitro@3.0.260429-beta`.** The latest beta
  (`3.0.260522-beta`) breaks the Vite dev SSR worker (`pnpm dev` → 500s,
  `Vite environment "ssr" is unavailable`); the prior beta works for both dev and
  the prerendered build.
- **2026-05-30 — Commit `src/routeTree.gen.ts`.** Generated by the TanStack
  Router plugin, but committing it lets `tsc --noEmit` resolve the route tree on
  a clean checkout (matching the reference example).
- **2026-05-30 — Defer the per-library nav links to Plan D.** The scaffold ships
  only the site title so the SPA prerenderer (`crawlLinks: true`) does not crawl
  links to pages that do not exist yet. Plan D owns the nav taxonomy.

## Progress Log

- **2026-05-30 — All milestones complete on TanStack Start (static SPA).**
  - M1: `flake.nix` bun → `nodejs_22` + `pnpm`; `nix develop` reports
    `v22.22.3` / `pnpm 11.4.0`.
  - M2: `package.json` + `pnpm-workspace.yaml`; `pnpm install` resolves the
    pinned tree (added `@types/mdx`; approved `esbuild`/`sharp`).
  - M3/M4: `source.config.ts`, `vite.config.ts`, `tsconfig.json`, `src/lib/*`,
    `src/components/*`, `src/routes/*`, `src/styles/app.css`, `serve.json`.
  - M5: seeded `content/docs/index.mdx` + `meta.json`; `pnpm build` prerenders 4
    pages; `pnpm dev` serves `/`, `/docs`, `/api/search` (200);
    `pnpm exec tsc --noEmit` → exit 0.
  - M6: `.gitignore` updated; `pnpm start` serves the static output (all routes
    200, SPA fallback for unknown paths); seams verified.

## Surprises & Discoveries

- **Initial scaffold was Next.js; pivoted to TanStack Start.** The first build
  followed a Next.js plan whose quoted file contents were already stale for
  fumadocs 16.x (e.g. `.source` had no `index.ts`; `fumadocs-ui/provider` is not
  a bare export). That work was discarded when the framework requirement changed.
- **fumadocs ships official TanStack Start examples.** `tanstack-start`,
  `tanstack-start-spa`, and `tanstack-start-min` under
  `/Users/shinzui/Keikaku/fumadocs-project/fumadocs/examples/` — the SPA example
  is the reference used here (replacing shibuya-docs).
- **`nitro@3.0.260522-beta` (latest) breaks `vite dev`.** `Vite environment
  "ssr" is unavailable` on every request; not a sandbox issue (it fails
  unsandboxed too, and Vite itself starts fine). `nitro@3.0.0` (stable) fixes dev
  but breaks the build prerender. `nitro@3.0.260429-beta` works for **both** — so
  it is pinned.
- **The SPA renders MDX client-side.** The docs page uses
  `createClientLoader` + `clientLoader.useContent(...)`, so prerendered HTML is a
  hydration shell; the MDX body lives in a JS chunk and the search index. Verify
  rendered content in a browser / via the static search index / via the raw
  `/docs/<slug>.md` route — not by grepping `.output/public/docs/index.html`.
- **`pnpm install` intermittently aborts (signal 6) under the sandbox.** A
  re-run always converged; no special handling needed.

## Outcomes & Retrospective

**Shipped:** a single-root fumadocs documentation site on **TanStack Start**,
built as a **static SPA**. `pnpm build` prerenders `/`, `/docs`,
`/docs/index.md`, and the static `/api/search` index into `.output/public`;
`pnpm start` serves it (all routes 200, SPA fallback); `pnpm dev` runs the Vite
dev server; `pnpm exec tsc --noEmit` is clean; the Nix dev shell reproducibly
provides Node 22 + pnpm. All seams for Plans B–F are present and marked.

**Lessons for downstream plans:** (1) the fumadocs `tanstack-start-spa` example
is the source of truth for wiring at these versions; (2) MDX renders client-side
— verify in a browser, not in static HTML; (3) keep nitro pinned to
`3.0.260429-beta` until a newer release fixes the dev SSR worker; (4) the build
is already host-agnostic static output, so Plan F's build gate is plain `pnpm
build` with no separate static-export step.

---

## Revision note — Next.js → TanStack Start pivot (2026-05-30)

This plan was originally authored and partially implemented for **Next.js**
(App Router, `next.config.mjs`, `app/`, copying the shibuya-docs skeleton). The
project requirement then changed to **TanStack Start**. The scaffold was
re-implemented as a **static SPA** using the fumadocs `tanstack-start-spa`
example as the reference, and this entire plan document was rewritten to match
the committed TanStack Start implementation: the file layout moved from `app/` to
`src/routes/` + `src/lib/` + `src/components/`; the build tool moved from `next
build` to `vite build` (static `.output/public`); `next.config.mjs` became
`vite.config.ts`; the MDX registry moved to `src/components/mdx.tsx`; global CSS
moved to `src/styles/app.css`; and the nav seam moved to
`src/lib/layout.shared.tsx`. All sections (Purpose, Context, Milestones,
Validation, Interfaces, Decision Log, living sections) were updated. The Nix
dev-shell switch (pnpm + Node 22) and the `content/docs/` seed carried over
unchanged. The parent master plan and sibling plans #2–#6 were updated in the
same pass.
