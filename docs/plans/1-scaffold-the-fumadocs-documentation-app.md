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

## Purpose & Big Picture

This plan stands up the **foundation** of the keiro-runtime-docs documentation
platform: a single [Next.js](https://nextjs.org) (App Router) application at the
repository root, powered by [fumadocs](https://fumadocs.dev) (a documentation
framework that turns MDX files into a fully-featured docs site with navigation,
search, a table of contents, and theming).

When this plan is complete you will be able to run one command (`pnpm dev`),
open `http://localhost:3000/docs` in a browser, and see a **styled, working
documentation shell** that renders a single seeded MDX page. Nothing fancy
renders yet (no custom fonts, no Mermaid diagrams, no real content) — but the
entire machine is wired together and green.

This is **Plan A**, the root of a five-plan master plan
(`0-keiro-runtime-docs-documentation-platform`). Every other plan builds on the
files this plan creates:

- **Plan B** (`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs/docs/plans/2-pragmatapro-font-and-shiki-code-ligatures.md`)
  wires the PragmataPro font + Shiki code-block ligatures. It extends the
  **Shiki seam** this plan leaves in `source.config.ts` and the **font seam**
  in `app/global.css`.
- **Plan C** (`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs/docs/plans/3-beautiful-mermaid-diagrams-with-zoom-and-pan.md`)
  adds Mermaid diagrams. It extends the **component seam** in
  `mdx-components.tsx`.
- **Plan D** (`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs/docs/plans/4-documentation-information-architecture-and-authoring-system.md`)
  defines the content tree + navigation taxonomy. It extends the **content
  tree seam** at `content/docs/` and `lib/source.ts`.
- **Plan E** (`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs/docs/plans/5-kiroku-foundation-documentation-set.md`)
  authors the kiroku docs on top of Plan D's IA.

**Capabilities delivered by this plan (observable):**

1. A reproducible Nix dev shell that provides **pnpm** and **Node 22** (the repo
   currently ships a bun-based shell; this plan replaces it).
2. A Next.js + fumadocs app whose dependencies install cleanly with
   `pnpm install`.
3. A docs route (`/docs`) that renders seeded MDX with fumadocs styling, a left
   navigation sidebar, and a right-hand table of contents.
4. Working search wiring (the fumadocs search API route).
5. Clearly-marked **seams** so Plans B–E can extend the app without re-architecting it.

---

## Context & Orientation

### Where we are starting from

The repo root is:

```text
/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs
```

Today it contains **no application code** — only:

- `flake.nix` / `flake.lock` — a Nix dev shell (currently bun-based).
- `docs/plans/` — the ExecPlan markdown files (this planning system).
- `agents/skills/` — vendored skill definitions.
- `.gitignore`, `.envrc`, Nix config.

This plan introduces the application code **at the repo root** (this is a single
app, **not** a monorepo): `package.json`, `app/`, `content/`, `lib/`,
`source.config.ts`, etc. all live directly under the repo root.

### The reference project: shibuya-docs

We are copying and adapting a known-good fumadocs project that lives at:

```text
/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-docs
```

Every file in this plan is adapted from that project. You do **not** need to
open shibuya-docs — all required file contents are quoted in full below.

### Domain vocabulary (read this if fumadocs is new to you)

- **MDX** — Markdown plus JSX. A `.mdx` file is Markdown that can also embed
  React components. fumadocs renders these into pages.
- **`source.config.ts`** — fumadocs-mdx's build-time config. It declares a
  *collection* of docs rooted at `content/docs/`. When you run the dev server
  (or the `postinstall` hook), fumadocs-mdx parses every MDX file and generates
  a hidden `.source/` directory containing typed exports of your content. You
  never edit `.source/` by hand; it is generated and git-ignored.
- **`lib/source.ts`** — wraps the generated `.source` export in a fumadocs
  `loader()`. The loader gives you `source.pageTree` (the navigation tree) and
  `source.getPage(slug)` (look up one page), all served under the `/docs` base
  URL.
- **`mdx-components.tsx`** — a central map of which React components render which
  MDX elements. `getMDXComponents()` merges fumadocs' defaults with any
  overrides. This is the seam Plan C uses to inject Mermaid.
- **`next.config.mjs`** — wraps the Next.js config with `createMDX()` so Next
  knows how to process MDX through fumadocs-mdx.
- **`app/layout.tsx`** — the root React layout; wraps everything in fumadocs'
  `RootProvider` (theme, search, sidebar state) and imports global CSS.
- **`app/layout.config.tsx`** — shared layout options (the nav title, etc.).
- **`app/docs/layout.tsx`** + **`app/docs/[[...slug]]/page.tsx`** — render the
  docs sidebar and the individual docs pages.
- **`app/(home)/page.tsx`** — a placeholder landing page at `/`. The `(home)`
  folder is a Next.js *route group* (parentheses mean "group, do not add a URL
  segment").
- **`app/api/search/route.ts`** — the search backend, generated from the source.
- **Tailwind v4** — the CSS framework. v4 is configured almost entirely in CSS
  (via `app/global.css`), not in a JS config file. fumadocs ships a Tailwind
  *preset* you `@import`.

### Exact stack (pinned — do not float these versions)

These versions are quoted verbatim from the reference report and MUST be matched
exactly:

```text
next            16.0.1
react           19.2.0
react-dom       19.2.0
fumadocs-ui     16.6.17
fumadocs-core   16.6.17
fumadocs-mdx    14.2.10   (devDependency)
tailwindcss     4.1.16
@tailwindcss/postcss  4.1.16
postcss         8.5.6
typescript      5.9.3
@types/node     24.10.1
@types/react    19.2.6
@types/react-dom 19.2.0
```

Toolchain: **pnpm** + **Node 22** (provided by the Nix dev shell). Do **not**
use bun or npm.

### Patterns to follow / anti-patterns to avoid

- **Follow:** the exact directory layout below. fumadocs relies on convention
  (file-system routing, the `content/docs/` collection path, the `@/*` import
  alias). Deviating breaks the magic.
- **Avoid:** editing `.source/` (generated), committing `node_modules` /
  `.next` / `.source`, floating dependency versions, or introducing a monorepo
  layout.

### Assumptions, constraints, non-goals

- **Assumption:** Nix + direnv are available (the repo already uses them).
- **Assumption:** the reader can run a terminal at the repo root.
- **Constraint:** single app at repo root; pnpm + Node 22 only.
- **Non-goal:** custom fonts/ligatures (Plan B), Mermaid (Plan C), real IA /
  content taxonomy (Plan D), kiroku content (Plan E). This plan seeds **one**
  placeholder page only.

### Target directory layout (what this plan produces)

```text
keiro-runtime-docs/
├── app/
│   ├── (home)/
│   │   └── page.tsx
│   ├── docs/
│   │   ├── layout.tsx
│   │   └── [[...slug]]/
│   │       └── page.tsx
│   ├── api/
│   │   └── search/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── layout.config.tsx
│   └── global.css
├── content/
│   └── docs/
│       ├── index.mdx
│       └── meta.json
├── lib/
│   └── source.ts
├── source.config.ts
├── mdx-components.tsx
├── next.config.mjs
├── package.json
├── tsconfig.json
├── postcss.config.mjs
├── flake.nix            (modified: bun → pnpm + Node 22)
└── .gitignore           (modified: add .next, .source, node_modules)
```

> Note on `layout.config.tsx`: in the shibuya-docs reference it lives under
> `app/` (as `app/layout.config.tsx`). We keep it there so the relative import
> `../layout.config` in `app/docs/layout.tsx` resolves correctly.

---

## Plan of Work

The work is split into **six ordered milestones**. Each one leaves the repo in a
working, verifiable state.

```text
M1  Nix dev shell: bun → pnpm + Node 22        (toolchain is green)
M2  package.json + install                      (deps resolve)
M3  fumadocs core wiring                         (source/config/mdx files exist)
M4  Tailwind v4 + App Router pages               (the app compiles)
M5  Seed content + run the dev server            (browser shows the docs shell)
M6  Seams + .gitignore + production build         (extension points; build passes)
```

Dependencies are strictly linear: M2 needs M1's pnpm; M3–M4 need M2's installed
deps; M5 needs M3–M4; M6 hardens everything. You can stop after any milestone
and have a coherent (if incomplete) repo.

---

## Concrete Steps

> **Conventions for every step below:**
> All commands are run from the repo root unless stated otherwise:
> ```bash
> cd /Users/shinzui/Keikaku/bokuno/keiro-runtime-docs
> ```
> Every file path is given relative to that root. Create parent directories as
> needed (the file-creation commands below do this for you).

---

### Milestone 1 — Switch the Nix dev shell from bun to pnpm + Node 22

**Goal:** `nix develop` (or `direnv allow`) provides `pnpm` and `node` (v22).

The current `flake.nix` is:

```nix
{
  description = "keiro-runtime-docs - Documentation platform";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { self
    , nixpkgs
    , flake-utils
    ,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            bun
            git
          ];

          shellHook = ''
            echo "keiro-runtime-docs dev shell"
            echo "bun $(bun --version)"
          '';
        };
      }
    );
}
```

**Step 1.1** — Replace `flake.nix` with the version below. The change is: swap
`bun` for `nodejs_22` and `pnpm`, and update the `shellHook` echo lines.

```nix
{
  description = "keiro-runtime-docs - Documentation platform";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { self
    , nixpkgs
    , flake-utils
    ,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_22
            pnpm
            git
          ];

          shellHook = ''
            echo "keiro-runtime-docs dev shell"
            echo "node $(node --version)"
            echo "pnpm $(pnpm --version)"
          '';
        };
      }
    );
}
```

For reference, the unified diff of the change is:

```diff
         devShells.default = pkgs.mkShell {
           buildInputs = with pkgs; [
-            bun
+            nodejs_22
+            pnpm
             git
           ];

           shellHook = ''
             echo "keiro-runtime-docs dev shell"
-            echo "bun $(bun --version)"
+            echo "node $(node --version)"
+            echo "pnpm $(pnpm --version)"
           '';
         };
```

> Note: `pnpm` in nixpkgs is built against a recent Node and works with the
> `nodejs_22` provided here. If you prefer to pin pnpm's own version, you can
> later add a `corepack`-based approach, but the plain `pnpm` package is
> sufficient and simpler.

**Step 1.2** — Reload the dev shell. With direnv:

```bash
direnv allow /Users/shinzui/Keikaku/bokuno/keiro-runtime-docs
```

Or without direnv:

```bash
nix develop /Users/shinzui/Keikaku/bokuno/keiro-runtime-docs
```

**Milestone 1 acceptance** — inside the reloaded shell:

```bash
node --version && pnpm --version
```

Expected: a line beginning with `v22.` (for example `v22.11.0`) followed by a
pnpm version line (for example `9.x.x` or `10.x.x`). The exact patch numbers
depend on nixpkgs; only the Node **major** must be 22.

---

### Milestone 2 — Create package.json and install dependencies

**Goal:** `pnpm install` completes and `node_modules/` is populated with the
pinned versions.

**Step 2.1** — Create `package.json` at the repo root. This is adapted from the
shibuya-docs `package.json` quoted in the report, with two changes required by
this plan: the `name` is `keiro-runtime-docs`, and a `lint` script is added
(the brief requires `dev`/`build`/`start`/`lint` scripts).

```json
{
  "name": "keiro-runtime-docs",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "fumadocs-mdx"
  },
  "dependencies": {
    "next": "16.0.1",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "fumadocs-ui": "16.6.17",
    "fumadocs-core": "16.6.17"
  },
  "devDependencies": {
    "@types/node": "24.10.1",
    "@types/react": "19.2.6",
    "@types/react-dom": "19.2.0",
    "typescript": "5.9.3",
    "@tailwindcss/postcss": "4.1.16",
    "tailwindcss": "4.1.16",
    "fumadocs-mdx": "14.2.10",
    "postcss": "8.5.6"
  }
}
```

> **What `postinstall: "fumadocs-mdx"` does:** after every install, fumadocs-mdx
> runs and generates the `.source/` directory from your `content/docs/`. On a
> fresh clone with no content it still creates the scaffolding. We seed content
> in M5; running install again then regenerates `.source/` to include it.

**Step 2.2** — Install. From the repo root, inside the Nix shell:

```bash
pnpm install
```

Expected: pnpm resolves and links the packages, then runs the `postinstall`
hook (`fumadocs-mdx`). You will see fumadocs-mdx report that it processed the
content (it may warn that `content/docs` is empty/absent at this point — that is
fine; we create it in M5). A `pnpm-lock.yaml` and `node_modules/` are created.

> If `postinstall` errors because `source.config.ts` does not exist yet, that is
> expected at this point — proceed to M3, which creates it, then re-run
> `pnpm install` (or `pnpm fumadocs-mdx`) afterward. To avoid the error entirely,
> you may create the files in M3 *before* running `pnpm install`. Either order
> converges.

**Milestone 2 acceptance:**

```bash
pnpm ls next react fumadocs-ui fumadocs-core fumadocs-mdx
```

Expected: each package listed at the pinned version (`next 16.0.1`,
`react 19.2.0`, `fumadocs-ui 16.6.17`, `fumadocs-core 16.6.17`,
`fumadocs-mdx 14.2.10`).

---

### Milestone 3 — Wire fumadocs core (source, config, MDX)

**Goal:** the four files that make fumadocs work exist and are correct:
`source.config.ts`, `lib/source.ts`, `mdx-components.tsx`, `next.config.mjs`.

**Step 3.1** — Create `source.config.ts` at the repo root. This declares the
docs collection rooted at `content/docs/`. **It includes the Shiki seam for
Plan B** — Plan B will pass MDX/rehype options (a custom Shiki highlighter) to
`defineConfig` here.

```ts
import { defineDocs, defineConfig } from "fumadocs-mdx/config";

// Docs collection: every .mdx under content/docs/ becomes a page.
// SEAM (Plan D): the content tree under content/docs/ is owned by Plan D's IA.
export const docs = defineDocs({
  dir: "content/docs",
});

// SEAM (Plan B — Shiki): Plan B replaces the bare defineConfig() below with a
// configured one, e.g.:
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

**Step 3.2** — Create `lib/source.ts`. This wraps the generated `.source`
export in a fumadocs `loader()` served under `/docs`.

```ts
import { docs } from "@/.source";
import { loader } from "fumadocs-core/source";

// SEAM (Plan D): Plan D may extend the loader (e.g. icon resolution,
// additional page-tree transforms) here once the IA is defined.
export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});
```

> `@/.source` resolves via the `@/*` path alias (configured in `tsconfig.json`
> in M4). The `.source` directory is **generated** by fumadocs-mdx; do not
> create it by hand and do not commit it.

**Step 3.3** — Create `mdx-components.tsx` at the repo root. This is the central
MDX component map. **It includes the component seam for Plan C (Mermaid) and
Plan D (custom UI components).**

```tsx
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

// getMDXComponents() merges fumadocs' default MDX components with any overrides.
//
// SEAM (Plan C — Mermaid): Plan C registers a `Mermaid` component (and/or a
// `pre`/code override that detects ```mermaid fences) by spreading it into the
// returned map below.
//
// SEAM (Plan D — UI components): Plan D registers custom authoring components
// (callouts, cards, tabs, etc.) the same way.
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    // ...Plan C / Plan D components go here...
    ...components,
  };
}
```

**Step 3.4** — Create `next.config.mjs` at the repo root. This wraps the Next
config with `createMDX()` so MDX is processed by fumadocs-mdx.

```js
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
};

export default withMDX(config);
```

**Milestone 3 acceptance** — regenerate `.source` and confirm it appears:

```bash
pnpm fumadocs-mdx && ls .source
```

Expected: the command completes without errors and `.source/` contains an
`index.ts` (the generated content index). If `content/docs/` does not exist
yet, fumadocs-mdx still generates the `.source` scaffolding (the page list is
just empty until M5).

---

### Milestone 4 — Tailwind v4 + App Router pages (the app compiles)

**Goal:** all App Router files, TypeScript config, and Tailwind/PostCSS config
exist, and `pnpm build` type-checks/compiles (it may report zero pages of
content until M5, which is fine).

**Step 4.1** — Create `tsconfig.json` at the repo root (verbatim from the
report). The `@/*` path alias and the `.source/**/*.ts` include are essential.

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "preserve",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    },
    "plugins": [{ "name": "next" }]
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "next-env.d.ts",
    ".source/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

**Step 4.2** — Create `postcss.config.mjs` at the repo root (verbatim). Tailwind
v4 runs as a PostCSS plugin.

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

**Step 4.3** — Create `app/global.css`. This imports Tailwind v4, the fumadocs
neutral color theme, and the fumadocs preset, then declares the fumadocs UI dist
as a Tailwind `@source` so its classes are scanned. **It includes the font /
ligature CSS seam for Plan B.**

```css
@import "tailwindcss";
@import "fumadocs-ui/css/neutral.css";
@import "fumadocs-ui/css/preset.css";

@source "../node_modules/fumadocs-ui/dist/**/*.js";

/*
 * SEAM (Plan B — fonts & ligatures):
 * Plan B adds the PragmataPro @font-face declarations here and sets the
 * monospace font + font-feature-settings (ligatures: calt/liga/dlig) for
 * code blocks. Leave this block empty until Plan B fills it in.
 */
```

**Step 4.4** — Create `app/layout.tsx` (root layout; verbatim from the report).

```tsx
import "./global.css";
import { RootProvider } from "fumadocs-ui/provider";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
```

**Step 4.5** — Create `app/layout.config.tsx`. This holds shared layout options.
**Adapt the nav title for keiro branding** (the report's reference used
"Shibuya Docs"). The brief calls for nav naming covering **kiroku / keiro /
keiki / shibuya**; we set the site title to "keiro runtime docs" and stub the
top-level nav links for those four areas. Plan D owns the final IA, so these are
seeded placeholders pointing at `/docs/<area>` paths.

```tsx
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

/**
 * Shared layout configuration (nav title + top-level links).
 *
 * SEAM (Plan D): the navigation taxonomy below is a placeholder. Plan D defines
 * the real information architecture; it will replace these links and may move
 * naming into the content tree (meta.json) instead of hard-coded nav links.
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: "keiro runtime docs",
  },
  links: [
    { text: "kiroku", url: "/docs/kiroku" },
    { text: "keiro", url: "/docs/keiro" },
    { text: "keiki", url: "/docs/keiki" },
    { text: "shibuya", url: "/docs/shibuya" },
  ],
};
```

> The four links point at sections that do not exist yet — that is intentional.
> They render in the top nav; clicking one before Plan D/E author content will
> show a 404. They exist so the nav naming is established now and downstream
> plans only fill in content.

**Step 4.6** — Create `app/docs/layout.tsx` (docs sidebar layout; verbatim from
the report — it imports `../layout.config`, which is why `layout.config.tsx`
lives under `app/`).

```tsx
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "../layout.config";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={source.pageTree} {...baseOptions}>
      {children}
    </DocsLayout>
  );
}
```

**Step 4.7** — Create `app/docs/[[...slug]]/page.tsx` (renders one docs page;
verbatim from the report). The `[[...slug]]` optional catch-all matches `/docs`
and `/docs/anything/nested`.

```tsx
import { source } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDXContent = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDXContent components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}
```

**Step 4.8** — Create `app/(home)/page.tsx` (placeholder landing page at `/`).
Adapted from the report; copy tweaked for keiro.

```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center text-center">
      <h1 className="mb-4 text-2xl font-bold">keiro runtime docs</h1>
      <p className="text-fd-muted-foreground">
        Open{" "}
        <Link
          href="/docs"
          className="text-fd-foreground font-semibold underline"
        >
          /docs
        </Link>{" "}
        to read the documentation.
      </p>
    </main>
  );
}
```

**Step 4.9** — Create `app/api/search/route.ts` (search backend; verbatim from
the report). This exposes a `GET` search endpoint built from the source.

```ts
import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";

export const { GET } = createFromSource(source);
```

**Milestone 4 acceptance** — type-check the project (no build of content needed
yet):

```bash
pnpm exec tsc --noEmit
```

Expected: completes with no type errors. (If `@/.source` is reported as missing,
run `pnpm fumadocs-mdx` first to regenerate it, then re-run.)

---

### Milestone 5 — Seed content and run the dev server

**Goal:** `pnpm dev` serves a styled docs shell at `http://localhost:3000/docs`
rendering the seeded page.

**Step 5.1** — Create `content/docs/index.mdx`. This is the single seeded page
(the docs landing). Adapted from the shibuya-docs placeholder; rebranded for
keiro. **The `content/docs/` tree is the seam Plan D and Plan E own** — this is
the only file we seed.

```mdx
---
title: keiro runtime docs
description: Documentation for the keiro runtime.
---

Welcome to the **keiro runtime documentation**.

## Getting started

This is a placeholder landing page. The real information architecture and
content arrive in later plans:

- Navigation taxonomy and authoring conventions — Plan D.
- The kiroku foundation documentation set — Plan E.

For now, this page confirms the docs app is wired together and rendering MDX
with fumadocs styling, a left sidebar, and a table of contents on the right.
```

**Step 5.2** — Create `content/docs/meta.json`. fumadocs uses `meta.json` files
to control the order, title, and grouping of a folder in the sidebar. Seeding
one here gives the docs root a defined title and ordering. **This file is part
of the content-tree seam Plan D extends.**

```json
{
  "title": "Documentation",
  "pages": ["index"]
}
```

**Step 5.3** — Regenerate `.source` so it picks up the new content, then start
the dev server:

```bash
pnpm fumadocs-mdx && pnpm dev
```

Expected: Next.js prints something like
`▲ Next.js 16.0.1` and `- Local: http://localhost:3000`, then `Ready in ...`.

**Step 5.4** — In a browser, open:

```text
http://localhost:3000/docs
```

Expected (observable): a styled fumadocs page titled **"keiro runtime docs"**
with:
- a left sidebar containing the docs tree (the seeded `index` page),
- the top nav showing the title "keiro runtime docs" and the links
  kiroku / keiro / keiki / shibuya,
- the page body rendering the MDX (heading + paragraphs),
- a light/dark theme toggle and a search box (fumadocs chrome).

Also confirm the landing page renders:

```text
http://localhost:3000/
```

Expected: the "keiro runtime docs" heading with a working link to `/docs`.

**Milestone 5 acceptance:** both URLs above render the described styled output.
Stop the dev server with `Ctrl-C` when done.

---

### Milestone 6 — Seams, .gitignore, and production build

**Goal:** generated artifacts are git-ignored, the seams are documented in-code
(done in M3/M4), and `pnpm build` produces a production build successfully.

**Step 6.1** — Update `.gitignore`. The current repo `.gitignore` contains:

```text
# Nix
/result
/result-*

# direnv
.direnv

# macOS
.DS_Store

# Editor
*.swp
*.swo
*~
```

Append a Node/Next/fumadocs block so generated output is never committed. The
three required additions are `node_modules`, `.next`, and `.source`; we add the
other usual suspects too.

```text
# Node / Next.js / fumadocs
node_modules
.next
.source
out
build
dist
next-env.d.ts
pnpm-debug.log*
.env*
```

> Do **not** ignore `pnpm-lock.yaml` — the lockfile must be committed so installs
> are reproducible.

**Step 6.2** — Verify the seams are present (a quick self-audit). Confirm each
file contains its seam comment:

```bash
grep -n "SEAM" source.config.ts app/global.css mdx-components.tsx app/layout.config.tsx lib/source.ts
```

Expected: at least one `SEAM` marker in each file — Shiki in `source.config.ts`,
font/ligature in `app/global.css`, Mermaid + UI components in
`mdx-components.tsx`, IA in `app/layout.config.tsx` and `lib/source.ts`.

**Step 6.3** — Produce a production build:

```bash
pnpm build
```

Expected: Next.js compiles, type-checks, generates the `/docs` and `/`
routes plus the `/api/search` route, and finishes with a route summary table.
No errors.

**Step 6.4** (optional smoke test) — serve the production build:

```bash
pnpm start
```

Expected: `http://localhost:3000/docs` renders the same styled shell as in M5.
Stop with `Ctrl-C`.

**Milestone 6 acceptance:** `git status` shows `node_modules/`, `.next/`, and
`.source/` as **ignored** (not listed as untracked), and `pnpm build` exits 0.

```bash
git status --short && git check-ignore node_modules .next .source
```

Expected: `git check-ignore` echoes back `node_modules`, `.next`, `.source`
(proving they match an ignore rule), and `git status` does not list them.

---

## Validation & Acceptance

The plan is **done** when all of the following hold, run from
`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` inside the Nix dev shell:

1. **Toolchain:**
   ```bash
   node --version && pnpm --version
   ```
   Node major version is `22`; pnpm prints a version.

2. **Dependencies pinned:**
   ```bash
   pnpm ls next react react-dom fumadocs-ui fumadocs-core fumadocs-mdx
   ```
   Shows `next 16.0.1`, `react 19.2.0`, `react-dom 19.2.0`,
   `fumadocs-ui 16.6.17`, `fumadocs-core 16.6.17`, `fumadocs-mdx 14.2.10`.

3. **Types clean:**
   ```bash
   pnpm exec tsc --noEmit
   ```
   No errors.

4. **Dev server:**
   ```bash
   pnpm dev
   ```
   `http://localhost:3000/docs` shows the styled fumadocs shell (sidebar +
   TOC + nav title "keiro runtime docs" + kiroku/keiro/keiki/shibuya links),
   rendering `content/docs/index.mdx`. `http://localhost:3000/` shows the
   landing page.

5. **Production build:**
   ```bash
   pnpm build
   ```
   Exits 0 with a route table including `/`, `/docs/[[...slug]]`, and
   `/api/search`.

6. **Ignore rules:**
   ```bash
   git check-ignore node_modules .next .source
   ```
   Echoes all three paths.

7. **Seams present:**
   ```bash
   grep -rl "SEAM" source.config.ts app/global.css mdx-components.tsx app/layout.config.tsx lib/source.ts
   ```
   Lists all five files.

**Quality gate:** there should be no committed `node_modules`, `.next`, or
`.source`; `pnpm-lock.yaml` IS committed.

---

## Idempotence & Recovery

This plan is designed to converge no matter how many times you re-run it.

- **Creating files** (`package.json`, configs, app files): overwriting them with
  the exact contents above is safe and idempotent. Re-applying produces the same
  bytes.
- **`flake.nix` edit:** re-applying the same edit is a no-op (the diff is already
  present). If `nix develop` errors, run `nix flake update` is **not** required;
  the only change is the dev-shell package list.
- **`pnpm install`:** idempotent. Re-running reconciles `node_modules` to the
  lockfile. Safe to repeat.
- **`pnpm fumadocs-mdx` / `.source` generation:** fully regenerable. If `.source`
  is stale, missing, or corrupt, delete it and regenerate:
  ```bash
  rm -rf .source && pnpm fumadocs-mdx
  ```
- **`.next` build cache:** disposable. If a build behaves oddly, clear it:
  ```bash
  rm -rf .next && pnpm build
  ```
- **`.gitignore` edit:** if you accidentally append the block twice, remove the
  duplicate — duplicate ignore rules are harmless but untidy.

**Detecting partial application:**

- Missing `node_modules` → M2 not run; run `pnpm install`.
- `@/.source` import error in `tsc`/build → run `pnpm fumadocs-mdx`.
- `/docs` 404s but `/` works → `content/docs/index.mdx` missing or `.source`
  stale; create the file (M5) and regenerate `.source`.
- Unstyled page (raw HTML) → `app/global.css` missing its Tailwind/fumadocs
  imports, or `postcss.config.mjs` missing; recheck Steps 4.2–4.3.
- `node` is not v22 / `pnpm` not found → M1 dev-shell edit not applied or shell
  not reloaded; re-run `direnv allow` / `nix develop`.

**Common failure modes:**

- *`bun: command not found` or wrong tools after edit* — you are in a stale
  shell; reload with `direnv allow` or exit and re-enter `nix develop`.
- *`postinstall` fails on first install* — `source.config.ts` not yet created;
  create M3 files then re-run `pnpm install` (or `pnpm fumadocs-mdx`).
- *Port 3000 in use* — run `pnpm dev -- -p 3001` and use that port.

---

## Interfaces & Dependencies

### Public interfaces introduced

- **Routes:** `/` (landing), `/docs` and `/docs/[[...slug]]` (docs pages),
  `/api/search` (GET search endpoint).
- **`source`** (`lib/source.ts`): exposes `source.pageTree` and
  `source.getPage(slug)`; base URL `/docs`.
- **`getMDXComponents()`** (`mdx-components.tsx`): the MDX component map.
- **`baseOptions`** (`app/layout.config.tsx`): nav title + top-level links.
- **`docs` collection** (`source.config.ts`): rooted at `content/docs/`.

### Upstream dependencies (pinned)

`next@16.0.1`, `react@19.2.0`, `react-dom@19.2.0`, `fumadocs-ui@16.6.17`,
`fumadocs-core@16.6.17`, `fumadocs-mdx@14.2.10`, `tailwindcss@4.1.16`,
`@tailwindcss/postcss@4.1.16`, `postcss@8.5.6`, `typescript@5.9.3`,
`@types/node@24.10.1`, `@types/react@19.2.6`, `@types/react-dom@19.2.0`.
Toolchain: Node 22 + pnpm via Nix.

### Extension points (SEAMS) for downstream plans

| Seam | File | Consumed by | What it enables |
|---|---|---|---|
| Shiki | `source.config.ts` (`defineConfig`) | Plan B (`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs/docs/plans/2-pragmatapro-font-and-shiki-code-ligatures.md`) | Custom Shiki highlighter/themes/transformers for code ligatures |
| Font / ligature CSS | `app/global.css` (commented block) | Plan B | PragmataPro `@font-face` + `font-feature-settings` |
| Mermaid component | `mdx-components.tsx` (`getMDXComponents`) | Plan C (`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs/docs/plans/3-beautiful-mermaid-diagrams-with-zoom-and-pan.md`) | Register a `Mermaid` renderer / code-fence override |
| UI components | `mdx-components.tsx` (`getMDXComponents`) | Plan D (`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs/docs/plans/4-documentation-information-architecture-and-authoring-system.md`) | Register custom authoring components |
| IA / nav taxonomy | `app/layout.config.tsx` (`baseOptions.links`), `lib/source.ts` (`loader`) | Plan D | Replace placeholder nav, extend the loader |
| Content tree | `content/docs/` (`index.mdx`, `meta.json`) | Plan D, Plan E (`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs/docs/plans/5-kiroku-foundation-documentation-set.md`) | Author the real docs tree and metadata |

### Downstream

Plans B, C, D, E all depend on this plan being complete and green. They must not
break the routes, `source`, `getMDXComponents()`, or the build.

---

## Decision Log

- **2025-12-09 — Single app at repo root (not a monorepo).** The brief mandates
  a single Next.js app with `package.json`, `app/`, `content/`, `lib/` at the
  root. Simpler for a docs-only repo; avoids workspace tooling overhead.
- **2025-12-09 — Copy/adapt shibuya-docs verbatim where possible.** shibuya-docs
  is a known-good fumadocs project at the exact target versions. Reusing its
  files minimizes risk; only branding, the `lint` script, the nav links, and the
  seam comments diverge.
- **2025-12-09 — pnpm + Node 22 via Nix, replacing bun.** The brief requires
  pnpm/Node 22. We swap the dev-shell packages rather than keeping bun, so the
  whole team gets a reproducible, consistent toolchain.
- **2025-12-09 — Pin all dependency versions exactly (no `^`/`~`).** The report
  quotes exact versions; floating ranges risk pulling incompatible fumadocs /
  Next majors. Reproducibility over auto-upgrades.
- **2025-12-09 — `layout.config.tsx` lives under `app/`.** Matches the reference
  so `app/docs/layout.tsx`'s `../layout.config` import resolves; avoids needless
  divergence.
- **2025-12-09 — Seed nav links for kiroku/keiro/keiki/shibuya now, content
  later.** Establishes the naming the brief calls for immediately; Plan D owns
  the final IA and may relocate naming into `meta.json`.
- **2025-12-09 — Seed exactly one page (`index.mdx`) + one `meta.json`.** Enough
  to prove the app renders MDX; the real content tree is Plan D/E's job.

## Progress Log

<!-- Dated entries appended as work proceeds. -->

## Surprises & Discoveries

<!-- Deviations from expectations. -->

## Outcomes & Retrospective

<!-- What shipped, what's left, lessons learned. -->
