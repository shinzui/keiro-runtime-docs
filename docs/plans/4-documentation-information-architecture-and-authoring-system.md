---
id: 4
slug: documentation-information-architecture-and-authoring-system
title: "Documentation information architecture and authoring system"
kind: exec-plan
created_at: 2026-05-30T20:05:53Z
intention: "intention_01ksx5mf7qe2ht659e4kr9w2t0"
master_plan: "docs/masterplans/1-keiro-runtime-docs-infrastructure-and-kiroku-foundation.md"
---

# Documentation information architecture and authoring system

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

This repository (`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`) is becoming a
single documentation website built with **fumadocs** — a documentation framework —
running on **TanStack Start** (a React full-stack framework, here configured as a
**static single-page app / SPA**) and built with **Vite** (the bundler/dev server).
It renders **MDX** files (Markdown files that may also contain React components). The
site documents the **keiro runtime**, which is not one program but a *family* of four
Haskell libraries: **kiroku**, **keiro**, **keiki**, and **shibuya** (each is described
in the Context section below). The website itself is written in TypeScript/React; the
*code samples inside the docs* are Haskell.

A note on the framework: an earlier draft of this plan assumed **Next.js** (the App
Router). The project has since **pivoted to TanStack Start as a static SPA**, and the
scaffold (`docs/plans/1-scaffold-the-fumadocs-documentation-app.md`) is already
re-implemented and committed on that stack. This plan has been rewritten so that every
file path and command targets the TanStack Start codebase. The *content* this plan
produces — the `content/docs/**` tree and the `meta.json` navigation files — is
framework-agnostic and is unchanged by the pivot; only the two integration seams (the
MDX component registry and the navigation taxonomy) and the build/run commands change.

Before this plan, the site can render but has no organized place to put documentation
and no rules for how to write it. **After this plan, the site has a complete, empty
"information architecture" (IA)** — a folder-and-navigation skeleton that arranges
every page into a predictable shape — **plus a set of copy-paste page templates and a
written style guide**, so any contributor can add a correct page without inventing
structure. "Information architecture" simply means the deliberate arrangement of
content into sections and a navigation menu so readers can find things; in fumadocs
this is expressed by the folder layout under `content/docs/` plus small `meta.json`
files that order the sidebar.

The organizing principle for the content is **Diátaxis** — a widely used documentation
framework that says every doc serves exactly one of four needs:

- **Tutorials** — learning-oriented, hold-your-hand lessons for a beginner.
- **How-To Guides** — task-oriented recipes that assume some knowledge ("how do I X?").
- **Reference** — information-oriented dry facts (APIs, types, configuration).
- **Explanation** — understanding-oriented essays about *why* and *how it works*.

We also add four extra page types the team wants: **Cookbook** (short focused
recipes), **Code Walkthrough** (an ordered tour that reads the real source code),
**FAQ** (frequently asked questions), and **Theory** (deeper conceptual/mathematical
essays, which live inside Explanation).

You can **see it working** by running the Vite dev server (`pnpm dev`) — or by building
the static SPA (`pnpm build`) and serving it (`pnpm start`) — and opening
`http://localhost:3000/docs` in a browser. MDX is compiled at build time and rendered
**client-side** (the docs route hydrates and renders the page through
`useMDXComponents()`). The left sidebar shows the products (getting-started, kiroku,
keiro, keiki, shibuya, integrations); each product expands to show the Diátaxis
sections; every section has a landing page; and a contributor can copy a template file,
drop it into the right folder, add one line to a `meta.json`, and watch the new page
appear in the sidebar and build without errors. In addition, this plan adds a
**top-level navigation bar** (the kiroku / keiro / keiki / shibuya taxonomy) that the
scaffold deliberately left out.

Scope boundary: **only kiroku gets real written content**, and that content is written
in a separate plan (`docs/plans/5-kiroku-foundation-documentation-set.md`). This plan
*creates the empty kiroku folders and landing pages* but does not fill the tutorials,
how-tos, etc. The other three products (keiro, keiki, shibuya) get a landing page and
"coming soon" placeholders only.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [x] Milestone 1 — Register shared MDX UI components in `src/components/mdx.tsx` (merge into `getMDXComponents`, do not replace) and confirm the site still builds. Added the six fumadocs-ui families (Callout, Step/Steps, Tab/Tabs, Card/Cards, Accordion/Accordions, TypeTable) alongside the existing `Mermaid`; kept `...defaultMdxComponents`, the trailing `...components`, the `useMDXComponents` re-export, and the `MDXProvidedComponents` global. _(2026-05-30)_
- [x] Milestone 2 — Create the root `content/docs/meta.json` and the top-level landing `content/docs/index.mdx`. Root meta is the seven-entry family allow-list (hides `_templates`); landing states both "foundation" framings with a `<Cards>` grid and a mermaid dependency diagram. _(2026-05-30)_
- [x] Milestone 3 — Create `getting-started/` (landing + 4 pages + meta.json). index, the-keiro-family (with dependency diagram), choosing-a-library, installation, contributing. _(2026-05-30)_
- [x] Milestone 4 — Create the kiroku section skeleton: all Diátaxis + extra folders, each with an `index.mdx` and `meta.json`, plus `faq.mdx`. Real landing with maturity banner; `how-to/meta.json` titled "How-To Guides". _(2026-05-30)_
- [x] Milestone 5 — Create placeholder landings + skeletons for keiro, keiki, shibuya. Same seven-section shape; keiki landing emphasizes walkthrough/explanation, shibuya emphasizes reference. _(2026-05-30)_
- [x] Milestone 6 — Create `integrations/` (landing + 3 placeholder pages + meta.json). _(2026-05-30)_
- [x] Milestone 7 — Create the templates library under `content/docs/_templates/` (one MDX per doc type) and exclude it from navigation. Eight templates; absent from every `meta.json` `pages`, so 0 nav pages prerendered. _(2026-05-30)_
- [x] Milestone 8 — Write the authoring/style/contribution guide page under `getting-started/contributing.mdx`. Full guide incl. per-type voice, naming, where-each-type-lives table, code/diagram conventions, and the ordered "how to add a new page" checklist. _(2026-05-30)_
- [x] Milestone 9 — Add the top-level navigation taxonomy (`links`) to `baseOptions()` in `src/lib/layout.shared.tsx` (now that the target sections exist). Six `{ text, url }` items; all targets resolve, so the prerender crawl succeeds. _(2026-05-30)_
- [x] Milestone 10 — Run the full verification (`pnpm build` + `pnpm start` sidebar and nav inspection) and record evidence. `pnpm typecheck` clean; `pnpm build` prerenders 86 pages (42 docs HTML) with no errors and no dead-link crawl failures; `pnpm start` serves 12/12 representative routes 200; `_templates` produces 0 nav pages. Visual sidebar/nav ordering confirmation is a light browser pass (see Surprises). _(2026-05-30)_


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

- **Unquoted frontmatter `description` containing `": "` breaks the YAML parse.** The
  first draft of the four `reference/index.mdx` files had
  `description: Information-oriented facts: the APIs, …`. The colon-space in "facts: the"
  made js-yaml read it as a nested mapping → `pnpm build` failed with
  `YAMLException: bad indentation of a mapping entry (2:40)` on all four reference
  landings. Fix: reword to use an em-dash ("facts —") **and** quote the value. Lesson for
  #5's authors and #6's CI: frontmatter `title`/`description` should be quoted whenever
  they may contain `:`, `#`, `[`, or other YAML-significant characters. A cheap CI gate
  would be to assert every `content/docs/**/*.mdx` parses its frontmatter. _(2026-05-30)_
- **`_templates/` is hidden from the sidebar but still appears in the search index.**
  `meta.json` `pages` controls only the sidebar tree; the fumadocs/Orama search collection
  indexes every `.mdx` in `content/docs/` regardless. Evidence: `_templates` produces 0
  prerendered nav pages (`find .output/public/docs/_templates -name '*.html'` → 0) yet the
  prerendered `/api/search` index contains `_templates`. This matches the plan's stated
  acceptance (sidebar/nav exclusion) and its deliberate choice to keep templates in the
  collection so the build validates them — but readers searching e.g. "tutorial" could see
  a template hit. **Known gap / follow-up for #6:** if undesirable, exclude `_templates`
  from search (e.g. a frontmatter flag the search route filters on, or moving templates out
  of the indexed collection) — out of scope here since it does not affect the IA. _(2026-05-30)_
- **The Plan #2/#3 demo pages (`ligature-check.mdx`, `diagram-demo.mdx`) became nav
  orphans.** They were in the old root `meta.json` `pages`; the new family allow-list does
  not list them, so they no longer appear in the sidebar and are no longer crawled/prerendered
  (the prerender list has no `diagram-demo`/`ligature-check`). The files remain in the tree
  and still resolve via the SPA fallback. Left in place deliberately — they belong to sibling
  plans (#2/#3) as verification artifacts; deleting them is out of this plan's scope. See the
  Decision Log. _(2026-05-30)_


## Decision Log

Record every decision made while working on the plan.

- Decision: Use a **product-first** top level (`getting-started/`, `kiroku/`, `keiro/`,
  `keiki/`, `shibuya/`, `integrations/`) and repeat the Diátaxis sections *inside* each
  product, rather than a Diátaxis-first top level.
  Rationale: Readers arrive thinking about a product ("I'm using kiroku"), not about a
  documentation quadrant. The family report recommends this. It also keeps each
  product's docs self-contained and lets us ship kiroku fully while others stay empty.
  Date: 2026-05-30

- Decision: Standardize the task-oriented quadrant's display label as **"How-To
  Guides"** site-wide, even though the folder on disk is `how-to/`.
  Rationale: Some Diátaxis materials say "guides"; the family report calls for one
  consistent label to avoid confusing how-tos with tutorials. The folder stays short
  (`how-to`) for clean URLs; the sidebar label comes from the folder's `meta.json`.
  Date: 2026-05-30

- Decision: Prefer **fumadocs-ui built-in MDX components** (Callout, Steps/Step,
  Tabs/Tab, Cards/Card, Accordions/Accordion, TypeTable) over hand-written ones.
  Rationale: They are already styled, theme-aware (light/dark), accessible, and ship
  with fumadocs-ui — no extra dependency or maintenance. We only register them.
  Date: 2026-05-30

- Decision: Keep the copy-paste templates *inside* the content tree at
  `content/docs/_templates/` but exclude them from navigation.
  Rationale: Authors find them next to the content they are writing, and the build can
  still validate that the templates are themselves valid MDX. The leading underscore
  plus an explicit `pages` allow-list in each parent `meta.json` keeps them out of the
  sidebar.
  Date: 2026-05-30

- Decision: Carry the family naming conventions verbatim: product names are always
  **lowercase** (kiroku, keiro, keiki, shibuya) with the kanji + gloss on first mention
  per page; runnable worked examples are called **"jitsurei"** (実例, "worked example").
  Rationale: Matches every project README and keeps the family voice consistent.
  Date: 2026-05-30

- Decision: Register the shared UI components by **merging into `getMDXComponents` in
  `src/components/mdx.tsx`** (the TanStack Start MDX registry), not the Next.js
  `mdx-components.tsx`.
  Rationale: The project pivoted from Next.js to TanStack Start (static SPA). On this
  stack the MDX-to-React component map lives in `src/components/mdx.tsx`; the docs route
  (`src/routes/docs/$.tsx`) renders MDX client-side via the fumadocs client loader and
  reads the map through `useMDXComponents()`. Registering anywhere else would have no
  effect. We still merge (preserve `...defaultMdxComponents`, any Mermaid entry, and the
  trailing `...components` override) and never overwrite the file.
  Date: 2026-05-30

- Decision: Leave the Plan #2/#3 demo pages (`content/docs/ligature-check.mdx`,
  `content/docs/diagram-demo.mdx`) in the tree but **omit them from the new root
  `meta.json`**, so they drop out of the sidebar and the prerender crawl.
  Rationale: This plan owns the root `meta.json` and replaces it with the family
  allow-list. The demo pages are sibling plans' verification artifacts, not part of the
  product IA; deleting them is out of scope and would erase #2/#3's evidence. Hiding them
  via the allow-list (the same mechanism that hides `_templates`) keeps the reader-facing
  IA clean while preserving the files. They still resolve by direct URL via the SPA
  fallback.
  Date: 2026-05-30

- Decision: Reword the four `reference/index.mdx` `description` fields to avoid a literal
  `": "` and quote all frontmatter values that could contain YAML-significant characters.
  Rationale: An unquoted `description` containing `facts: the` parsed as a nested YAML
  mapping and failed the build (see Surprises & Discoveries). Quoting + em-dash is the
  minimal, robust fix and sets the convention for #5's content.
  Date: 2026-05-30

- Decision: Own the **top-level navigation taxonomy** (kiroku / keiro / keiki / shibuya)
  in `baseOptions()` in `src/lib/layout.shared.tsx`, adding it as the `links` array of
  `BaseLayoutProps`, and add it **last** (Milestone 9) — only after the corresponding
  content sections exist.
  Rationale: The scaffold deliberately shipped only the site title in `baseOptions()` so
  the static-SPA prerenderer (Vite `tanstackStart({ spa: { prerender: { crawlLinks:
  true } } })` in `vite.config.ts`) would not crawl links to pages that do not exist yet
  and fail the build. Adding the nav links only after the product landing pages exist
  keeps `crawlLinks` happy. This seam is the TanStack Start equivalent of the Next.js
  `app/layout.config.tsx`.
  Date: 2026-05-30


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

**Implemented (2026-05-30).** The site now has a complete, navigable, *empty* information
architecture plus a templates library and a written authoring guide — exactly the purpose.

- **IA tree:** product-first top level (`getting-started/`, `kiroku/`, `keiro/`, `keiki/`,
  `shibuya/`, `integrations/`) with the seven repeated sections inside each product, every
  folder carrying an `index.mdx` landing and a `meta.json`. kiroku has a real landing with a
  maturity banner; keiro/keiki/shibuya have placeholder landings; integrations has a landing +
  three placeholders.
- **Authoring system:** six fumadocs-ui component families registered in `src/components/mdx.tsx`
  (merged with `Mermaid`); eight copy-paste templates under `_templates/` (hidden from nav);
  a full `getting-started/contributing.mdx` style/contribution guide with the "how to add a
  new page" checklist.
- **Navigation:** the top-level `links` taxonomy added to `baseOptions()` last, after every
  target landing existed, so the static-SPA `crawlLinks` prerender passes cleanly.

**Evidence:** `pnpm typecheck` clean; `pnpm build` prerenders 86 pages (42 docs HTML) with no
errors and no dead-link failures; `pnpm start` serves 12/12 representative routes 200;
`_templates` yields 0 nav pages; all 8 templates compile (proving the component registration).

**Gaps / follow-ups (for #6):** (1) templates are excluded from the *sidebar* but still appear
in the *search* index — add a search-exclusion if undesirable; (2) a frontmatter-parse CI gate
would have caught the `reference/index.mdx` YAML bug immediately; (3) the visual confirmation of
sidebar grouping/ordering and the "How-To Guides" label is a light browser pass (the structure
is proven by the build + meta.json, but on-screen ordering was not automatable here). This plan
unblocks #5 (kiroku content), which populates the `kiroku/<section>/` seams created here.


## Context and Orientation

Read this section as if you know nothing about the repository. It repeats everything
you need so you can implement this plan from this file alone.

### What this repository is

`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` is a Git repository. Work on the
`master` branch; do not create feature branches. A fumadocs documentation app — built
on **TanStack Start** as a **static SPA** and bundled with **Vite** — is scaffolded
into it by a separate, already-checked-in plan:
`docs/plans/1-scaffold-the-fumadocs-documentation-app.md` (referred to below as **the
scaffold plan**). This current plan has a **hard dependency** on that scaffold plan: it
must be implemented first, because this plan edits files the scaffold plan creates and
adds content into the tree the scaffold plan establishes. This plan has **soft
dependencies** on two other plans: `docs/plans/2-pragmatapro-font-and-shiki-code-ligatures.md`
(PragmataPro font + Haskell-aware code highlighting) and
`docs/plans/3-beautiful-mermaid-diagrams-with-zoom-pan.md` (interactive Mermaid
diagrams). "Soft dependency" means this plan does not require them to function, but
the templates this plan produces *reference* their features (Haskell code blocks and
`mermaid` fences), and those features only fully render once those plans are done.
If they are not yet done, code blocks and diagrams still render with fumadocs'
defaults — nothing breaks.

### The technology, in plain terms

- **fumadocs** — a documentation site generator. The pieces you will touch:
  - `content/docs/` — the folder where all documentation lives. Each `.mdx` file is one
    page. Subfolders become navigation groups.
  - `meta.json` — a small JSON file you place in a folder to control the sidebar: which
    pages appear, in what order, and what the group is called. Its main field is
    `pages`, an ordered array of file/folder names (without the `.mdx` extension).
  - `index.mdx` — by fumadocs convention, the landing page of a folder (the page shown
    when a reader clicks the folder/section itself).
  - **MDX** — Markdown plus the ability to use React components as if they were HTML
    tags (e.g. `<Callout>...</Callout>`). The set of components available inside MDX is
    declared in one file. On this TanStack Start stack that file is
    `src/components/mdx.tsx` (the equivalent of the Next.js `mdx-components.tsx`). It
    exports `getMDXComponents` / `useMDXComponents`.
- **fumadocs-ui** — a companion package (version **16.9.3** here) that ships ready-made,
  styled React components for docs (Callout, Steps, Tabs, Cards, Accordions, TypeTable).
  We import these and register them so MDX pages can use them.
- **frontmatter** — the block at the very top of an MDX file delimited by `---` lines.
  It carries metadata; fumadocs reads `title` and `description` from it.
- **TanStack Start / Vite / static SPA** — TanStack Start is the React framework hosting
  the app; Vite is its bundler and dev server. The app is configured as a **static SPA**
  (`vite.config.ts` → `tanstackStart({ spa: { enabled: true, prerender: { enabled: true,
  crawlLinks: true } } })`): `pnpm build` emits a fully static site under
  `.output/public` that needs no running server. The dev server is `pnpm dev`; the built
  site is served with `pnpm start`. MDX pages are compiled at build time and rendered
  **client-side** by the docs route `src/routes/docs/$.tsx`, which calls
  `useMDXComponents()` from `src/components/mdx.tsx`.

### Key files this plan reads or edits (full repository-relative paths)

- `src/components/mdx.tsx` — the MDX component registry (the TanStack Start equivalent of
  Next.js's `mdx-components.tsx`). It exports `getMDXComponents(components?:
  MDXComponents)` and re-exports it as `useMDXComponents`. The scaffold plan creates it;
  this plan **extends** it (adds component registrations). It is *shared*: the scaffold
  plan owns it, `docs/plans/3-...` adds a `Mermaid` component to it, and this plan adds
  the fumadocs-ui UI components. **Always merge into the object returned by
  `getMDXComponents`; never overwrite the file.** The registered components reach pages
  because the docs route `src/routes/docs/$.tsx` passes `useMDXComponents()` to the MDX
  renderer.
- `src/lib/layout.shared.tsx` — the navigation / IA seam. It exports `baseOptions():
  BaseLayoutProps` (the equivalent of Next.js's `app/layout.config.tsx`). The scaffold
  ships only `nav.title`; **this plan adds the top-level `links`** (the kiroku / keiro /
  keiki / shibuya taxonomy). `baseOptions()` is consumed by the docs layout in
  `src/routes/docs/$.tsx` (passed into `<DocsLayout {...baseOptions()} … />`).
- `src/lib/source.ts` — the fumadocs `loader()` that turns the content collection into a
  page tree. This plan does **not** need to change it (the IA is expressed purely by the
  folder layout and `meta.json` files). It is listed here only as the seam that turns
  `content/docs/**` into navigation; touch it only if you choose to add per-folder icons
  via `meta.json` `icon` fields (optional, out of scope).
- `content/docs/` (repo root) — the content tree. The scaffold plan seeds it with a
  single `index.mdx` and `meta.json`; this plan **replaces those with the full IA** and
  adds every folder, landing page, `meta.json`, and the templates library. This tree is
  framework-agnostic and is unaffected by the Next.js → TanStack Start pivot.
- `package.json` (repo root) — defines the commands you run. On this stack it defines
  `dev` (`vite dev`), `build` (`vite build`), `start` (`serve .output/public …`),
  `typecheck` (`fumadocs-mdx && tsc --noEmit`), and `lint` (`oxlint`). This plan does not
  change `package.json`.
- `source.config.ts` (repo root) — defines the `docs` collection (`dir:
  "content/docs"`). Unchanged by this plan; it already points at the tree this plan
  fills.

### The four products (so you can write accurate landing copy)

- **kiroku** (記録, "record") — an append-only **PostgreSQL event store** written in
  Haskell. An "event store" is a database that keeps an immutable, ordered log of
  things that happened ("events") instead of overwriting current state; you rebuild
  state by replaying the log. kiroku is the **persistence foundation** the other
  libraries write through. It is the **first and only product to get full content
  now**. Source lives at `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku`. It
  carries an "active development / APIs may change" maturity warning, so its landing
  page must show a stability banner.
- **keiro** (経路, "route/path") — an event-sourcing framework and workflow engine; the
  top of the stack that depends on the other three. Placeholder only for now.
- **keiki** (継起, "successive occurrence") — a pure, dependency-free mathematical core
  (a "symbolic-register transducer", i.e. a kind of state machine). Placeholder only.
  Its existing docs are an ordered code walkthrough, which is why keiki's skeleton
  emphasizes the `walkthrough/` and `explanation/` (theory) sections.
- **shibuya** — a supervised queue-processing framework (think: reliably consuming a
  message queue). Placeholder only. Its existing docs are auto-generated API reference,
  which is why shibuya's skeleton emphasizes `reference/`.

There is **no `keiro-runtime` package**; "keiro runtime" is an umbrella name for the
family. kiroku is "the foundation" in the *persistence* sense; keiki is "the
foundation" in the *pure-semantics* sense. The top-level landing page should state both
framings.

### Naming and voice conventions to carry into every page

- Product names are always **lowercase**: kiroku, keiro, keiki, shibuya. On the first
  mention of a product on any page, gloss it once: "kiroku (記録, an append-only
  PostgreSQL event store)".
- Use **"jitsurei"** (実例) for runnable worked examples / example collections.
- Voice is **problem-first**: open with the problem the reader has, then the mechanism.
  Em-dashes are the house punctuation style.
- The task-oriented Diátaxis quadrant is always labelled **"How-To Guides"** in the UI.


## Plan of Work

The work is a sequence of additive file creations plus one careful edit to a shared
file. Nothing here deletes user data or runs migrations, so every step is safe to
repeat. Below, first read the **Target tree** and **meta.json reference** (the
authoritative artifacts you are producing), then the **page templates**, then the
**shared components**, then the **milestones** that sequence the work.

### The complete target `content/docs/` tree

This is exactly what `content/docs/` must contain at the end of this plan. Folders end
with `/`. Every folder has an `index.mdx` (its landing page) and a `meta.json` (its
sidebar order) unless noted. Pages marked `[placeholder]` contain a short "coming soon"
body; pages under `kiroku/` are **empty section landings** that
`docs/plans/5-kiroku-foundation-documentation-set.md` will populate. The
`_templates/` folder holds copy-paste templates and is hidden from navigation.

```text
content/docs/
  index.mdx                      # Keiro Runtime family landing (both "foundation" framings)
  meta.json                      # root sidebar order (see meta.json reference)

  getting-started/
    index.mdx                    # what the keiro runtime is, how to read these docs
    the-keiro-family.mdx         # the four products + how they relate (dependency graph)
    choosing-a-library.mdx       # which library solves which problem
    installation.mdx             # prerequisites + how to get the libraries (placeholder-ish)
    contributing.mdx             # the AUTHORING & STYLE GUIDE (written in Milestone 8)
    meta.json

  kiroku/                        # FOUNDATION — full content later (Plan 5); structure now
    index.mdx                    # what kiroku is + maturity banner (real landing)
    tutorials/
      index.mdx                  # section landing (empty list now)
      meta.json
    how-to/
      index.mdx                  # section landing; label "How-To Guides"
      meta.json
    reference/
      index.mdx                  # section landing
      meta.json
    explanation/
      index.mdx                  # section landing (theory essays live here too)
      meta.json
    cookbook/
      index.mdx                  # section landing (short recipes)
      meta.json
    walkthrough/                 # ordered code walkthrough (numbered pages)
      index.mdx                  # section landing
      meta.json
    faq.mdx                      # frequently asked questions (single page)
    meta.json

  keiro/                         # PLACEHOLDER landing + same skeleton
    index.mdx
    tutorials/      (index.mdx + meta.json)
    how-to/         (index.mdx + meta.json)
    reference/      (index.mdx + meta.json)
    explanation/    (index.mdx + meta.json)
    cookbook/       (index.mdx + meta.json)
    walkthrough/    (index.mdx + meta.json)
    faq.mdx
    meta.json

  keiki/                         # PLACEHOLDER landing + skeleton (theory-heavy)
    index.mdx
    tutorials/      (index.mdx + meta.json)
    how-to/         (index.mdx + meta.json)
    reference/      (index.mdx + meta.json)
    explanation/    (index.mdx + meta.json)
    cookbook/       (index.mdx + meta.json)
    walkthrough/    (index.mdx + meta.json)
    faq.mdx
    meta.json

  shibuya/                       # PLACEHOLDER landing + skeleton (reference-heavy)
    index.mdx
    tutorials/      (index.mdx + meta.json)
    how-to/         (index.mdx + meta.json)
    reference/      (index.mdx + meta.json)
    explanation/    (index.mdx + meta.json)
    cookbook/       (index.mdx + meta.json)
    walkthrough/    (index.mdx + meta.json)
    faq.mdx
    meta.json

  integrations/                  # cross-package glue (placeholders now)
    index.mdx
    shibuya-kiroku-adapter.mdx   # the headline cross-package adapter
    keiro-with-kiroku.mdx        # persisting keiro through kiroku
    keiro-with-keiki.mdx         # pairing the durable runtime with the pure core
    meta.json

  _templates/                    # copy-paste page templates (HIDDEN from nav)
    tutorial.mdx
    how-to.mdx
    reference.mdx
    explanation.mdx
    faq.mdx
    code-walkthrough.mdx
    cookbook-recipe.mdx
    theory-explainer.mdx
    (no meta.json; excluded via root meta.json `pages` allow-list)
```

Why this shape: the top level is the products plus two cross-cutting sections
(`getting-started/` for onboarding, `integrations/` for family glue). Inside each
product the same seven sections repeat — the four Diátaxis quadrants
(`tutorials/`, `how-to/`, `reference/`, `explanation/`) plus `cookbook/` and
`walkthrough/`, plus a single `faq.mdx`. Theory explainers are not a separate folder;
they live inside `explanation/` because a theory essay *is* an explanation. This keeps
the sidebar shallow and predictable.

### meta.json reference (every nav file as a code block)

A `meta.json` controls one folder's slice of the sidebar. The two fields you use:

- `title` (optional) — the label shown for this group in the sidebar. If omitted,
  fumadocs derives a title from the folder name.
- `pages` (required for ordering) — an ordered array of entry names. An entry is either
  a page file name without `.mdx` (e.g. `"installation"`) or a subfolder name (e.g.
  `"tutorials"`). **Only names listed here appear in the sidebar**, and they appear in
  this order. The literal string `"..."` (three dots) means "then append any remaining
  pages not explicitly listed"; we avoid it here so the templates and `_templates/` can
  never leak into the sidebar.

Root — `content/docs/meta.json`. Note `_templates` is deliberately **absent** from
`pages`, which hides the whole templates folder from navigation:

```json
{
  "pages": [
    "index",
    "getting-started",
    "kiroku",
    "keiro",
    "keiki",
    "shibuya",
    "integrations"
  ]
}
```

`content/docs/getting-started/meta.json`:

```json
{
  "title": "Getting Started",
  "pages": [
    "index",
    "the-keiro-family",
    "choosing-a-library",
    "installation",
    "contributing"
  ]
}
```

`content/docs/kiroku/meta.json` (the same structure is used for `keiro/`, `keiki/`,
`shibuya/` — change only the `title`):

```json
{
  "title": "kiroku",
  "pages": [
    "index",
    "tutorials",
    "how-to",
    "reference",
    "explanation",
    "cookbook",
    "walkthrough",
    "faq"
  ]
}
```

`content/docs/keiro/meta.json`:

```json
{
  "title": "keiro",
  "pages": [
    "index",
    "tutorials",
    "how-to",
    "reference",
    "explanation",
    "cookbook",
    "walkthrough",
    "faq"
  ]
}
```

`content/docs/keiki/meta.json`:

```json
{
  "title": "keiki",
  "pages": [
    "index",
    "tutorials",
    "how-to",
    "reference",
    "explanation",
    "cookbook",
    "walkthrough",
    "faq"
  ]
}
```

`content/docs/shibuya/meta.json`:

```json
{
  "title": "shibuya",
  "pages": [
    "index",
    "tutorials",
    "how-to",
    "reference",
    "explanation",
    "cookbook",
    "walkthrough",
    "faq"
  ]
}
```

The per-section `meta.json` files. The crucial one is `how-to/meta.json`, whose
`title` is the agreed **"How-To Guides"** label. Each is placed inside the matching
section folder of **every** product (kiroku, keiro, keiki, shibuya). While the
sections are empty, list only `"index"`; authors add page names here as they create
pages.

`content/docs/<product>/tutorials/meta.json`:

```json
{
  "title": "Tutorials",
  "pages": ["index"]
}
```

`content/docs/<product>/how-to/meta.json`:

```json
{
  "title": "How-To Guides",
  "pages": ["index"]
}
```

`content/docs/<product>/reference/meta.json`:

```json
{
  "title": "Reference",
  "pages": ["index"]
}
```

`content/docs/<product>/explanation/meta.json`:

```json
{
  "title": "Explanation",
  "pages": ["index"]
}
```

`content/docs/<product>/cookbook/meta.json`:

```json
{
  "title": "Cookbook",
  "pages": ["index"]
}
```

`content/docs/<product>/walkthrough/meta.json`:

```json
{
  "title": "Code Walkthrough",
  "pages": ["index"]
}
```

`content/docs/integrations/meta.json`:

```json
{
  "title": "Integrations",
  "pages": [
    "index",
    "shibuya-kiroku-adapter",
    "keiro-with-kiroku",
    "keiro-with-keiki"
  ]
}
```

### Page templates (one tagged ```mdx fence per doc type)

These eight templates go into `content/docs/_templates/`. They are also the canonical
shape every author copies. Each begins with frontmatter (`title` and `description` are
read by fumadocs). The bracketed `[…]` parts are placeholders the author replaces. The
templates demonstrate the shared UI components and the conventions (problem-first
voice, "jitsurei" for examples, Haskell code blocks, ```mermaid fences). When the soft
dependencies (`docs/plans/2-...`, `docs/plans/3-...`) are done, the Haskell blocks get
PragmataPro ligatures and the ```mermaid fences become zoomable diagrams; until then
they render with fumadocs defaults.

**No per-page `import` lines.** Because the UI components are registered **globally** in
`getMDXComponents` (`src/components/mdx.tsx`, see "Shared MDX UI components" below), MDX
pages use `<Callout>`, `<Steps>`, `<Cards>`, etc. directly — there is **no** need to
`import { Callout } from 'fumadocs-ui/components/callout'` at the top of each page (that
was the Next.js-era habit; the reference TanStack Start example confirms components are
used without per-page imports). The templates below therefore omit import lines. (Adding
an explicit import would still work, but it is redundant and we keep templates clean.)

Tutorial — `content/docs/_templates/tutorial.mdx`:

````mdx
---
title: "[Tutorial title — start with a verb, e.g. Build your first event stream]"
description: "[One sentence: what the reader will have built by the end.]"
---

[Open with the outcome. In two or three sentences tell a beginner what they will
build and why it matters — the problem first, then the payoff. Use the second person
("you"). Promise a concrete, working result.]

<Callout type="info">
  This is a tutorial: a guided lesson. Follow every step in order. You do not need
  prior knowledge of [product] beyond [the one prerequisite]. By the end you will have
  [the concrete artifact].
</Callout>

## What you will build

[Describe the end state in one short paragraph. If a picture helps, include a diagram.]

## Before you begin

[List the exact prerequisites: tools installed, a running PostgreSQL, etc. Keep it
short; link to installation rather than re-explaining it.]

## Steps

<Steps>
<Step>

### [First action, phrased as an instruction]

[Tell the reader exactly what to do. Show the code they must write or run.]

```haskell
-- A minimal, copy-pasteable Haskell snippet.
-- Every snippet must reflect the real API.
main :: IO ()
main = putStrLn "replace with the real first step"
```

[Tell the reader what they should observe so they know it worked.]

</Step>
<Step>

### [Second action]

[Continue. Build strictly on the previous step. Never skip.]

</Step>
</Steps>

## What you built

[Recap the working result in two sentences, then point to the next tutorial or to a
relevant How-To Guide.]
````

How-To Guide — `content/docs/_templates/how-to.mdx`:

````mdx
---
title: "[How to <do the specific task>]"
description: "[One sentence stating the task this guide accomplishes.]"
---

[State the task and the assumption. A how-to guide is for someone who already knows the
basics and has a specific goal. One or two sentences, problem-first: "You need to X.
This guide shows the shortest reliable way."]

<Callout type="info">
  Assumes you already [have a configured store / completed the first tutorial / …].
  If not, start with [link to the relevant tutorial].
</Callout>

## Goal

[One sentence restating exactly what you will achieve.]

## Steps

1. [First imperative step.]

   ```haskell
   -- real, minimal snippet for this step
   ```

2. [Second imperative step.]

## Verify it worked

[Give the reader an observable check: an output line, a query result, a log message.]

## Related

- [Link to a sibling how-to or the reference page for the API used here.]
````

Reference — `content/docs/_templates/reference.mdx`:

````mdx
---
title: "[Name of the API / module / configuration being documented]"
description: "[One sentence naming what this page is a reference for.]"
---

[One short paragraph stating, factually, what this reference covers. Reference pages are
dry and complete: no tutorials, no opinions, no "why". Just the facts the reader looks
up.]

## [Type or function name]

[The exact signature, copied from the source — never paraphrased.]

```haskell
appendToStream :: (Store :> es) => StreamName -> ExpectedVersion -> [EventData] -> Eff es AppendResult
```

[One or two sentences describing behavior, constraints, and failure modes.]

### Fields / parameters

<TypeTable
  type={{
    field: {
      description: 'What this field means.',
      type: 'TheHaskellType',
      default: 'Nothing',
    },
  }}
/>

<Callout type="warn">
  [Note any sharp edge: an exception thrown, a reserved value, an ordering requirement.]
</Callout>
````

Explanation — `content/docs/_templates/explanation.mdx`:

````mdx
---
title: "[Understanding <the concept> — phrase as a topic, not a task]"
description: "[One sentence naming the idea this page explains.]"
---

[Open with the question the reader is really asking — "why does X work this way?" or
"how should I think about Y?". Explanation pages build understanding; they do not give
step-by-step instructions and they do not list every API.]

## The idea

[Explain the concept in plain language. Define every term of art on first use.]

## How it fits together

[A diagram is often the clearest explanation. The ```mermaid fence below renders as an
interactive, zoomable diagram once the diagram support is in place.]

```mermaid
flowchart LR
  A[Producer] -->|append| S[(Event store)]
  S -->|subscribe| C[Consumer]
```

## Trade-offs

[Be honest about limits and alternatives. Explanation is where nuance lives.]
````

FAQ — `content/docs/_templates/faq.mdx`:

````mdx
---
title: "[Product] FAQ"
description: "Answers to frequently asked questions about [product]."
---

[One sentence: "Short answers to the questions people ask most about [product]." Keep
each answer to a few sentences; link out for depth.]

<Accordions>
  <Accordion title="[A real question, in the words a user would type]">
    [A direct answer. Link to the tutorial/how-to/reference that goes deeper.]
  </Accordion>
  <Accordion title="[Another common question]">
    [A direct answer.]
  </Accordion>
</Accordions>
````

Code Walkthrough — `content/docs/_templates/code-walkthrough.mdx`:

````mdx
---
title: "[NN — Section title]"
description: "[One sentence: which part of the source this part of the tour covers.]"
---

[A code walkthrough is an ordered tour that reads the real source code to teach how the
library is built. Name pages with a two-digit numeric prefix so they sort
(`00-start-here.mdx`, `01-…`). This page is part [NN] of the tour.]

<Callout type="info">
  This is part of an ordered walkthrough. If you are new, start at
  [00 — Start here](./00-start-here).
</Callout>

## What this part covers

[Name the file(s) and the concept this part teaches.]

## The code

```haskell
-- An excerpt from the real source, with the path noted above the block.
-- src/Kiroku/Store/Append.hs
appendToStream :: (Store :> es) => StreamName -> ExpectedVersion -> [EventData] -> Eff es AppendResult
```

[Walk through the excerpt line by line in prose. Explain the *why*, not just the *what*.]

## Next

[Link to the next numbered part.]
````

Cookbook recipe — `content/docs/_templates/cookbook-recipe.mdx`:

````mdx
---
title: "[Recipe — <the outcome>, e.g. Idempotent append with a supplied event id]"
description: "[One sentence: the concrete result this recipe produces.]"
---

[A cookbook recipe is a short, self-contained, copy-paste solution to one common
problem. Shorter and more focused than a how-to. State the problem in one sentence.]

## Problem

[One sentence.]

## Solution

```haskell
-- The complete, minimal recipe. It should run as written (a jitsurei — a worked
-- example). Keep it to one screen if possible.
```

<Callout type="info">
  "jitsurei" (実例) is the family's word for a runnable worked example.
</Callout>

## How it works

[Two or three sentences explaining the key line(s). Link to reference for full detail.]
````

Theory explainer — `content/docs/_templates/theory-explainer.mdx`:

````mdx
---
title: "[Theory — <the formal idea>, e.g. Streams, categories, and the $all log]"
description: "[One sentence naming the formal concept developed here.]"
---

[A theory explainer is a deeper conceptual or mathematical essay. It lives in the
`explanation/` folder (theory IS explanation). Use it for the formal model behind a
library. Still define every symbol and term.]

<Callout type="info">
  This page goes deeper than the surrounding explanation pages. You can use the library
  fully without reading it; read it to understand the model precisely.
</Callout>

## The model

[Develop the formal idea. Introduce notation gently. A diagram often helps.]

```mermaid
flowchart TB
  e0[event 0] --> e1[event 1] --> e2[event 2]
```

## Why it matters in practice

[Connect the theory back to something the reader can do or rely on.]
````

### Shared MDX UI components (which to register, and how)

MDX pages can only use components that are registered in the single file
`src/components/mdx.tsx` (the TanStack Start MDX registry; the Next.js equivalent was
`mdx-components.tsx`). fumadocs-ui ships a set of ready-made, theme-aware components; we
register the ones our templates use. Registering means importing them and adding them to
the object returned by `getMDXComponents`. The docs route `src/routes/docs/$.tsx`
renders MDX client-side and passes this map in via `useMDXComponents()` (re-exported from
the same file), so a component is usable in any page the moment it appears in the
returned object.

The components we register, what they are, and where each import comes from (the
sub-paths below are verified against the installed **fumadocs-ui 16.9.3** in
`node_modules/fumadocs-ui/dist/components/`):

- **Callout** — a colored note box (info / warning / error). From
  `fumadocs-ui/components/callout`. Used by almost every template.
- **Steps / Step** — a vertical numbered stepper for tutorials. From
  `fumadocs-ui/components/steps`.
- **Tabs / Tab** — tabbed panels (e.g. show the same thing two ways). From
  `fumadocs-ui/components/tabs`.
- **Cards / Card** — a grid of link cards, good for landing pages. From
  `fumadocs-ui/components/card`.
- **Accordions / Accordion** — collapsible question/answer rows for FAQs. From
  `fumadocs-ui/components/accordion`.
- **TypeTable** — a table for documenting a type's fields/parameters. From
  `fumadocs-ui/components/type-table`.

These import paths are the fumadocs-ui convention (each component has its own
sub-module under `fumadocs-ui/components/`) and have been confirmed present for the
installed **16.9.3**: `callout`, `steps`, `tabs`, `card`, `accordion`, and `type-table`
all exist under `node_modules/fumadocs-ui/dist/components/`, exporting respectively
`Callout`; `Step`/`Steps`; `Tab`/`Tabs`; `Card`/`Cards`; `Accordion`/`Accordions`; and
`TypeTable`. If a future fumadocs-ui version exposes a different path, the build error
(`Cannot find module 'fumadocs-ui/components/…'`) will name the missing module; in that
case open `node_modules/fumadocs-ui/dist/components/` to find the exact sub-path and
adjust the import. Do not invent paths.

**Critical integration rule:** `src/components/mdx.tsx` is shared. The scaffold plan
created it (its current body returns `{ ...defaultMdxComponents, ...components }` and
re-exports `getMDXComponents` as `useMDXComponents`); `docs/plans/3-...` adds a `Mermaid`
entry to it. You must **merge** — add your imports and add your component names into the
object returned by `getMDXComponents`, preserving `...defaultMdxComponents`, the trailing
`...components` spread (the per-call override, which must stay last), the
`useMDXComponents` re-export, the `MDXProvidedComponents` global declaration, and any
`Mermaid` already present. Never replace the file wholesale.

The scaffold ships this file with explanatory `SEAM (Plan D)` comments and an empty
`// ...Plan C / Plan D components go here...` slot; replace that slot with the
registrations. The end state should look like this (your additions are the six
fumadocs-ui imports and the component names in the returned object; `Mermaid` may or may
not already be present depending on whether `docs/plans/3-...` has run; keep the
`useMDXComponents` re-export and the `declare global` block that the scaffold added):

```tsx
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Callout } from "fumadocs-ui/components/callout";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { Card, Cards } from "fumadocs-ui/components/card";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { TypeTable } from "fumadocs-ui/components/type-table";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Callout,
    Step,
    Steps,
    Tab,
    Tabs,
    Card,
    Cards,
    Accordion,
    Accordions,
    TypeTable,
    // Mermaid,  // present only after docs/plans/3-... has been implemented
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
```

A usage example for each, for the style guide and for authors to copy:

```mdx
<Callout type="warn">kiroku is in active development; APIs may change.</Callout>

<Steps>
  <Step>### First do this</Step>
  <Step>### Then do that</Step>
</Steps>

<Tabs items={['hasql', 'raw SQL']}>
  <Tab value="hasql">The hasql way.</Tab>
  <Tab value="raw SQL">The raw SQL way.</Tab>
</Tabs>

<Cards>
  <Card title="Tutorials" href="/docs/kiroku/tutorials" />
  <Card title="How-To Guides" href="/docs/kiroku/how-to" />
</Cards>

<Accordions>
  <Accordion title="Does kiroku run my migrations?">No — migrate first.</Accordion>
</Accordions>

<TypeTable type={{ poolSize: { description: 'Connection pool size.', type: 'Int', default: '10' } }} />
```

Note: `Tabs` takes an `items` array and each `Tab` a matching `value`; `Cards`/`Card`
build a link grid; `Accordion` needs a `title`. These are the fumadocs-ui prop
conventions; if a prop name differs in your version the build will warn and you can
correct it against the installed component's types.

### Top-level navigation taxonomy (the `links` seam)

The scaffold's `src/lib/layout.shared.tsx` exports `baseOptions(): BaseLayoutProps` with
only `nav.title` and `githubUrl`. **This plan adds the top-level navigation bar** — the
per-library taxonomy — by adding a `links` array to the object `baseOptions()` returns.
`links` is the `BaseLayoutProps` field (`links?: LinkItemType[]`); the entries we use are
**main** link items, whose shape is `{ text: ReactNode; url: string; … }` (note the
field is `url`, not `href`). `baseOptions()` is spread into `<DocsLayout
{...baseOptions()} … />` in `src/routes/docs/$.tsx`, so adding `links` makes them appear
in the docs layout's top navigation.

The end state of `src/lib/layout.shared.tsx` (preserve the existing `appName`/`gitConfig`
import and the `nav`/`githubUrl` fields; add `links`):

```tsx
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { appName, gitConfig } from "./shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: appName,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    links: [
      { text: "Getting Started", url: "/docs/getting-started" },
      { text: "kiroku", url: "/docs/kiroku" },
      { text: "keiro", url: "/docs/keiro" },
      { text: "keiki", url: "/docs/keiki" },
      { text: "shibuya", url: "/docs/shibuya" },
      { text: "Integrations", url: "/docs/integrations" },
    ],
  };
}
```

**Prerender / crawl implication (why this is the last milestone).** The app builds as a
static SPA with `tanstackStart({ spa: { prerender: { enabled: true, crawlLinks: true } }
})` in `vite.config.ts`. With `crawlLinks: true`, the prerenderer starts from the pages
listed in `vite.config.ts` (`/docs`, `/api/search`) and follows links it finds to
prerender more pages. The scaffold deliberately shipped `baseOptions()` **without**
`links` so the crawler would not follow nav links to product pages that did not yet
exist (a dead link would fail or produce empty prerendered HTML). Therefore add the
`links` array **only after** Milestones 2–6 have created every target landing
(`/docs/getting-started`, `/docs/kiroku`, `/docs/keiro`, `/docs/keiki`,
`/docs/shibuya`, `/docs/integrations`). Each `url` above must resolve to a real
`index.mdx` by the time you add it — which is why this is Milestone 9, after the content
tree is in place. If a `pnpm build` fails or warns about a link that cannot be crawled,
the corresponding `content/docs/<segment>/index.mdx` is missing; create it (or remove the
link) and rebuild.

### Authoring, style, and contribution guide (content for `getting-started/contributing.mdx`)

Milestone 8 writes a real page (not a placeholder) that encodes the rules below. Put
this content into `content/docs/getting-started/contributing.mdx` using the explanation
template's frontmatter. The page must cover, in prose with short examples:

- **Voice and tense per Diátaxis type.** Tutorials: second person, present/imperative,
  encouraging ("you will build…", "now run…"). How-To Guides: imperative, terse,
  goal-first ("To do X, …"). Reference: neutral, factual, present tense, no second
  person, no narrative. Explanation: reflective, may use "we"/"you", discusses
  trade-offs and *why*. Cookbook: like how-to but shorter and self-contained.
  Walkthrough: narrative past/present, reads the source and explains intent. Theory:
  precise, defines all notation, lives in `explanation/`.
- **File naming.** Lowercase, hyphen-separated, `.mdx` (e.g. `appending-events.mdx`).
  Walkthrough pages take a two-digit numeric prefix to force order
  (`00-start-here.mdx`). A folder's landing page is always `index.mdx`.
- **Where each doc type lives.** Tutorials → `<product>/tutorials/`; how-tos →
  `<product>/how-to/`; reference → `<product>/reference/`; explanations and theory →
  `<product>/explanation/`; recipes → `<product>/cookbook/`; walkthrough →
  `<product>/walkthrough/`; FAQ → `<product>/faq.mdx`. Cross-product integration pages
  → `integrations/`.
- **How to add a navigation entry.** Open the `meta.json` in the folder where your page
  lives and add the page's file name (without `.mdx`) to the `pages` array, in the
  position you want it to appear. If you add a whole new subfolder, add the folder name
  to the *parent* folder's `meta.json` `pages` array too.
- **Code-block conventions.** Always tag the fence with a language. Haskell samples use
  the `haskell` tag and must reflect the real API (no invented functions). Other tags in
  use: `bash`, `sql`, `json`, `nix`, `text`. (The PragmataPro font and Haskell-aware
  highlighting come from `docs/plans/2-...`; you do not configure them here — just use
  the tags.)
- **Diagram conventions.** Use a `mermaid` fence for diagrams; keep them small and
  labelled. (Interactive zoom/pan rendering comes from `docs/plans/3-...`.)
- **"How to add a new page" checklist** (put this as an explicit ordered list on the
  page): (1) pick the doc type and copy the matching template from
  `content/docs/_templates/`; (2) save it under the correct
  `<product>/<section>/` folder with a lowercase-hyphenated name; (3) fill the
  frontmatter `title` and `description`; (4) write the body following the voice for that
  type; (5) add the file name to that folder's `meta.json` `pages`; (6) run the build
  and confirm the page appears in the sidebar and compiles.
- **Naming conventions to repeat:** lowercase product names with a kanji+gloss on first
  mention; "jitsurei" for worked examples; "How-To Guides" as the task-quadrant label.

### Landing-page content guidance (so landings are not blank)

Every `index.mdx` must have real (if brief) content, never an empty body, or the page
looks broken. Guidance per landing:

- `content/docs/index.mdx` — name the family, state both "foundation" framings (kiroku =
  persistence foundation; keiki = pure-semantics foundation), and use `<Cards>` linking
  to each product and to getting-started. A small ```mermaid dependency diagram is
  appropriate (keiro → keiki, kiroku, shibuya).
- `getting-started/index.mdx` — explain what the keiro runtime is and how to read these
  docs (the Diátaxis sections). Link onward with `<Cards>`.
- `getting-started/the-keiro-family.mdx` — describe the four products and how they
  relate; include the dependency relationships.
- `kiroku/index.mdx` — a real landing: one paragraph on what kiroku is (記録,
  append-only PostgreSQL event store), a `<Callout type="warn">` maturity banner, and a
  `<Cards>` grid linking to its sections. (Plan 5 deepens everything beneath it.)
- `keiro/index.mdx`, `keiki/index.mdx`, `shibuya/index.mdx` — one paragraph describing
  the product (with kanji+gloss where applicable) and a `<Callout type="info">` saying
  documentation is in progress; a `<Cards>` grid to the (empty) sections is fine.
- Each `<product>/<section>/index.mdx` — one or two sentences saying what this section
  is for (using the Diátaxis definition), and a note that pages are coming. For kiroku
  these are the seams Plan 5 fills.
- `integrations/index.mdx` and its three pages — one paragraph each describing the
  integration; mark them `<Callout type="info">` "documentation in progress".

### Milestones

**Milestone 1 — Register the shared UI components.** Scope: the single edit to
`src/components/mdx.tsx`. At the end, the six fumadocs-ui component families are usable
inside any MDX page, the file still contains everything the scaffold and any Mermaid work
added (the `...defaultMdxComponents` spread, the trailing `...components` override, the
`useMDXComponents` re-export, and the `MDXProvidedComponents` global), and the site
builds. Commands: from the repo root, `pnpm build` (or `pnpm dev` and load a page).
Acceptance: build succeeds; a page using `<Callout>` renders without an "unknown
component" error.

**Milestone 2 — Root landing + sidebar.** Scope: replace the scaffold's seed
`content/docs/index.mdx` and `content/docs/meta.json` with the family landing page and
the root `meta.json` from the reference above. At the end the docs **sidebar** shows the
seven top-level entries in order. (The top **navigation bar** links come later, in
Milestone 9.) Acceptance: `pnpm dev`, open `http://localhost:3000/docs`, see the family
landing and the seven-item sidebar.

**Milestone 3 — getting-started.** Scope: create the `getting-started/` folder with its
five pages and `meta.json`. `contributing.mdx` can be a stub here (Milestone 8 fills
it). Acceptance: the Getting Started group appears with five ordered entries.

**Milestone 4 — kiroku skeleton.** Scope: create `kiroku/` with the real landing
(maturity banner) and all six section folders, each with an `index.mdx` and `meta.json`,
plus `faq.mdx` and `kiroku/meta.json`. Acceptance: kiroku expands in the sidebar to
seven sections in order; each section landing opens.

**Milestone 5 — keiro / keiki / shibuya skeletons.** Scope: replicate the kiroku
skeleton three times with placeholder landings and the per-product `meta.json` (only
the `title` differs). Acceptance: all three appear with the same seven-section shape.

**Milestone 6 — integrations.** Scope: create `integrations/` with its landing, three
placeholder pages, and `meta.json`. Acceptance: Integrations group shows four ordered
entries.

**Milestone 7 — templates library.** Scope: create `content/docs/_templates/` with the
eight templates. Because the root `meta.json` does not list `_templates`, the folder
must not appear in the sidebar. Acceptance: building succeeds (templates are valid MDX),
and `_templates` is absent from the sidebar.

**Milestone 8 — authoring/style guide.** Scope: write the real
`getting-started/contributing.mdx` from the guide content above, including the
"how to add a new page" checklist. Acceptance: the page renders with the checklist and
the per-type voice rules.

**Milestone 9 — top-level navigation taxonomy.** Scope: add the `links` array to
`baseOptions()` in `src/lib/layout.shared.tsx` (see "Top-level navigation taxonomy"
above). This must come after Milestones 2–6 so every `links` target
(`/docs/getting-started`, `/docs/kiroku`, `/docs/keiro`, `/docs/keiki`,
`/docs/shibuya`, `/docs/integrations`) resolves to a real `index.mdx` — otherwise the
static-SPA prerenderer's `crawlLinks` would follow a dead link. Acceptance: `pnpm build`
succeeds (no dead-link crawl failures); `pnpm start` (or `pnpm dev`), open
`http://localhost:3000/docs`, and see the six links in the top navigation bar, each
landing on its product/section.

**Milestone 10 — full verification.** Scope: run the build (static SPA), serve it, and
inspect both the top navigation and the sidebar. Acceptance: see the Validation section.


## Concrete Steps

All commands run from the repository root
`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` unless stated. The package manager
is **pnpm** and Node is **22**, both provided by the repo's **Nix dev shell**. Enter the
shell first so the toolchain is on `PATH`:

```bash
nix develop
```

Run all subsequent `pnpm` commands inside that shell.

1. Confirm the scaffold is present (this plan depends on it). Expect to see the files:

   ```bash
   ls src/components/mdx.tsx src/lib/layout.shared.tsx content/docs/index.mdx content/docs/meta.json package.json
   ```

   Expected: all five paths print with no "No such file" error. If any are missing,
   stop and implement `docs/plans/1-scaffold-the-fumadocs-documentation-app.md` first.

2. Install dependencies if you have not already, then confirm the dev server runs:

   ```bash
   pnpm install
   pnpm dev
   ```

   Expected transcript (abridged; exact wording depends on the Vite/TanStack Start
   versions):

   ```text
   > vite dev
   VITE vX.Y.Z  ready in NNN ms
   ➜  Local:   http://localhost:3000/
   ```

   Open `http://localhost:3000/docs` to see the current (scaffold) state, then stop the
   server with Ctrl-C before editing.

3. **Milestone 1.** Edit `src/components/mdx.tsx` to add the six fumadocs-ui imports and
   add their components into the object returned by `getMDXComponents`, preserving
   `...defaultMdxComponents`, the trailing `...components` spread, the `useMDXComponents`
   re-export, and the `MDXProvidedComponents` global declaration (and any existing
   `Mermaid`). Use the end-state shown in the "Shared MDX UI components" subsection above
   as the target.

4. Verify Milestone 1 by type-checking and building:

   ```bash
   pnpm run typecheck
   pnpm build
   ```

   Expected: `typecheck` (which runs `fumadocs-mdx && tsc --noEmit`) reports no errors,
   and `build` (`vite build`) completes and emits the static SPA under `.output/public`,
   with no "Cannot find module 'fumadocs-ui/components/…'" error. If you see such an
   error, the import sub-path differs in your fumadocs-ui version; find the correct path
   under `node_modules/fumadocs-ui/dist/components/` and fix the import (do not guess).

5. **Milestone 2.** Overwrite `content/docs/meta.json` with the root meta.json from the
   reference, and overwrite `content/docs/index.mdx` with the family landing (follow the
   landing-page guidance; include a `<Cards>` grid and optionally a ```mermaid diagram).

6. **Milestone 3.** Create the folder and files:

   ```bash
   mkdir -p content/docs/getting-started
   ```

   Then create `content/docs/getting-started/meta.json` (from the reference) and the
   five pages `index.mdx`, `the-keiro-family.mdx`, `choosing-a-library.mdx`,
   `installation.mdx`, and a stub `contributing.mdx` (real content lands in Milestone 8).

7. **Milestone 4.** Create the kiroku skeleton:

   ```bash
   mkdir -p content/docs/kiroku/tutorials content/docs/kiroku/how-to \
     content/docs/kiroku/reference content/docs/kiroku/explanation \
     content/docs/kiroku/cookbook content/docs/kiroku/walkthrough
   ```

   Create `content/docs/kiroku/index.mdx` (real landing with maturity banner),
   `content/docs/kiroku/faq.mdx`, `content/docs/kiroku/meta.json`, and in each of the
   six section folders an `index.mdx` (one-sentence section description) and a
   `meta.json` (from the per-section reference; remember `how-to/meta.json` has
   `"title": "How-To Guides"`).

8. **Milestone 5.** Repeat the kiroku skeleton for keiro, keiki, shibuya. The fastest
   safe approach is to copy the kiroku skeleton folder-by-folder and then edit the
   landing copy and the per-product `meta.json` `title`:

   ```bash
   for p in keiro keiki shibuya; do
     mkdir -p content/docs/$p/tutorials content/docs/$p/how-to \
       content/docs/$p/reference content/docs/$p/explanation \
       content/docs/$p/cookbook content/docs/$p/walkthrough
   done
   ```

   Then create each product's `index.mdx` (placeholder landing), `faq.mdx`,
   `meta.json`, and the six section `index.mdx` + `meta.json` files. The section
   `meta.json` files are identical across products; the product `meta.json` differs only
   by `title`.

9. **Milestone 6.** Create integrations:

   ```bash
   mkdir -p content/docs/integrations
   ```

   Create `index.mdx`, `shibuya-kiroku-adapter.mdx`, `keiro-with-kiroku.mdx`,
   `keiro-with-keiki.mdx` (placeholders), and `meta.json` (from the reference).

10. **Milestone 7.** Create the templates:

    ```bash
    mkdir -p content/docs/_templates
    ```

    Create the eight `.mdx` files from the "Page templates" subsection. Do **not** add a
    `meta.json` here and do **not** list `_templates` in the root `meta.json` — that is
    what keeps it out of the sidebar.

11. **Milestone 8.** Replace `content/docs/getting-started/contributing.mdx` with the
    full authoring/style/contribution guide (from the guide content above), including
    the "how to add a new page" checklist as an explicit ordered list.

12. **Milestone 9.** Now that every product/section landing exists, add the top-level
    navigation. Edit `src/lib/layout.shared.tsx` and add the `links` array to the object
    `baseOptions()` returns, using the six entries from the "Top-level navigation
    taxonomy" subsection above (`{ text, url }` items, `url` pointing at
    `/docs/<segment>`). Preserve the existing `nav` and `githubUrl` fields and the
    `appName`/`gitConfig` import.

13. **Milestone 10.** Build the static SPA and verify (see Validation):

    ```bash
    pnpm run typecheck
    pnpm build
    pnpm start
    ```


## Validation and Acceptance

The plan succeeds when the empty IA renders correctly, the top navigation works, and
every template builds. Run these inside the Nix dev shell (`nix develop`).

1. **The static SPA builds with the full tree.** From the repo root:

   ```bash
   pnpm build
   ```

   Expected: a successful `vite build` with no MDX parse errors and no "unknown
   component" errors, emitting the static site under `.output/public`. A template that
   uses `<Steps>`, `<Callout>`, `<TypeTable>`, etc. compiling is the proof that Milestone
   1's registration worked. The build also prerenders the crawled pages; a failure here
   that names a link target means a `links` entry (Milestone 9) points at a missing
   landing. If the build fails, the error names the offending file and
   component/import/link; fix that and re-run. The build is idempotent.

2. **The navigation and sidebar show the correct grouping and order.** Serve the built
   SPA (or use the dev server) and open the docs:

   ```bash
   pnpm start
   ```

   (`pnpm start` serves `.output/public`; alternatively `pnpm dev` runs the Vite dev
   server. Either way the page is at `http://localhost:3000/docs`.) Then check:

   - The **top navigation bar** lists the six links added in Milestone 9: **Getting
     Started**, **kiroku**, **keiro**, **keiki**, **shibuya**, **Integrations**. Each
     navigates to its `/docs/<segment>` landing.
   - The **docs sidebar** lists, in this order: the home/index page, **Getting
     Started**, **kiroku**, **keiro**, **keiki**, **shibuya**, **Integrations**.
   - Expanding **kiroku** shows, in order: its landing, **Tutorials**, **How-To
     Guides**, **Reference**, **Explanation**, **Cookbook**, **Code Walkthrough**, and
     **FAQ**. The task-quadrant label reads exactly "How-To Guides" (not "How-To" and
     not "Guides").
   - keiro, keiki, and shibuya each expand to the same seven sections.
   - **`_templates` does NOT appear anywhere in the sidebar or navigation.** This proves
     the templates are validated by the build but hidden from readers.

3. **Each section landing opens.** Click each section's landing (e.g. open
   `/docs/kiroku/tutorials`) and confirm a page renders client-side with its one-sentence
   description rather than a 404.

4. **Each template builds and renders.** Temporarily copy one template into a real
   section to prove it renders end-to-end, then remove the copy:

   ```bash
   cp content/docs/_templates/tutorial.mdx content/docs/kiroku/tutorials/sample.mdx
   ```

   Add `"sample"` to `content/docs/kiroku/tutorials/meta.json` `pages`, run `pnpm dev`,
   open `http://localhost:3000/docs/kiroku/tutorials/sample`, and confirm the `<Steps>`
   and `<Callout>` render. Then delete the copy and revert the `meta.json` line:

   ```bash
   rm content/docs/kiroku/tutorials/sample.mdx
   ```

   This is the behavioral proof that the templates are usable and the registration is
   complete. Record the observation in Progress and Outcomes.

5. **Type / MDX check.** Run the scaffold's check script (defined in `package.json` as
   `typecheck` = `fumadocs-mdx && tsc --noEmit`):

   ```bash
   pnpm run typecheck
   ```

   Expected: no type errors. (`fumadocs-mdx` regenerates the `.source/` collection from
   `content/docs/`, then `tsc --noEmit` type-checks the project.)


## Idempotence and Recovery

Every step here is additive file creation or a single, well-bounded edit, so the plan is
safe to run repeatedly. Re-creating a folder that already exists with `mkdir -p` is a
no-op. Re-writing a `meta.json` or `index.mdx` simply overwrites it with the same
intended content. There are two edits to shared files: `src/components/mdx.tsx` (the MDX
registry) and `src/lib/layout.shared.tsx` (the `links` nav). For
`src/components/mdx.tsx`, if you run it twice, ensure you do not add duplicate import
lines or duplicate component keys — if you accidentally do, the type-check/build error
names the duplicate and you remove the extra line; always keep the trailing
`...components` spread last and the `useMDXComponents` re-export. For
`src/lib/layout.shared.tsx`, re-adding `links` simply overwrites the array. To roll back
any step, delete the files you created (or `git checkout -- <path>` to restore a tracked
file). Because nothing here touches application data, a database, or any external
service, there is no destructive operation to guard against. If the dev server shows a
stale tree after large changes, stop it and restart `pnpm dev`; if the generated
fumadocs collection seems out of date, delete the generated `.source/` directory (it is
regenerated by `fumadocs-mdx` on the next `pnpm install` postinstall, `pnpm run
typecheck`, or `pnpm build`) and rebuild.


## Interfaces and Dependencies

This plan produces and depends on the following contracts. Reference sibling plans only
by path; do not assume their internal details beyond what is stated here.

- **`src/components/mdx.tsx`** — the MDX component registry (TanStack Start equivalent of
  Next.js's `mdx-components.tsx`). *Contract:* it exports `getMDXComponents(components?:
  MDXComponents)` which returns an object spreading `...defaultMdxComponents`, then the
  registered components, then a trailing `...components` override, and re-exports
  `getMDXComponents` as `useMDXComponents`. The docs route `src/routes/docs/$.tsx` calls
  `useMDXComponents()` and passes the result to the MDX renderer, so registered
  components are available to every page. This file is **shared**: owned/created by
  `docs/plans/1-scaffold-the-fumadocs-documentation-app.md`; extended by
  `docs/plans/3-beautiful-mermaid-diagrams-with-zoom-pan.md` (which adds a `Mermaid`
  component for ```mermaid fences); extended by **this plan** (which adds the six
  fumadocs-ui component families). All extenders **merge** into the returned object and
  preserve each other's additions (and the trailing `...components` spread). At the end
  of this plan the returned object must include `Callout`, `Step`, `Steps`, `Tab`,
  `Tabs`, `Card`, `Cards`, `Accordion`, `Accordions`, and `TypeTable`, in addition to
  whatever the scaffold and Mermaid work contributed.

- **`src/lib/layout.shared.tsx`** — the navigation / IA seam (TanStack Start equivalent
  of Next.js's `app/layout.config.tsx`). *Contract:* it exports `baseOptions():
  BaseLayoutProps`. The scaffold returns only `nav.title` and `githubUrl`; **this plan
  adds `links: LinkItemType[]`** — the six main link items pointing at
  `/docs/getting-started`, `/docs/kiroku`, `/docs/keiro`, `/docs/keiki`,
  `/docs/shibuya`, `/docs/integrations` (each `{ text, url }`, where the field is `url`,
  not `href`). `baseOptions()` is spread into `<DocsLayout {...baseOptions()} … />` in
  `src/routes/docs/$.tsx`. Because the build prerenders with `crawlLinks: true`, every
  `links` `url` must resolve to an existing landing before the links are added (Milestone
  9, after the content tree exists).

- **`content/docs/**` + `meta.json`** — the content tree and its navigation. *Contract:*
  this plan **structures** the tree (creates every folder, every landing `index.mdx`,
  every `meta.json`, the `faq.mdx` files, the `integrations/` pages, and the
  `_templates/` library). `docs/plans/5-kiroku-foundation-documentation-set.md`
  **populates** the kiroku branch: it adds real pages under `content/docs/kiroku/<section>/`
  and appends their names to the matching `meta.json` `pages` arrays. The `meta.json`
  schema is `{ "title"?: string, "pages": string[] }` where each entry is a page file
  name without `.mdx` or a subfolder name, listed in display order. Hiding a folder from
  navigation is achieved by **omitting** it from the parent `meta.json` `pages` (this is
  how `_templates/` stays hidden).

- **fumadocs-ui** (`fumadocs-ui/components/*`) — the source of the registered UI
  components: Callout, Steps/Step, Tabs/Tab, Cards/Card, Accordions/Accordion,
  TypeTable. We depend on it because it ships styled, theme-aware, accessible components,
  removing the need to build or maintain our own. Exact import sub-paths are listed in
  the "Shared MDX UI components" subsection; if a path differs in the installed version,
  resolve it against the installed package, not from memory.

- **pnpm + Node 22 (Nix dev shell)** — the toolchain, provided by the repo's Nix dev
  shell (enter with `nix develop`). Commands used here: `pnpm install`, `pnpm dev` (`vite
  dev`), `pnpm build` (`vite build`, emits the static SPA to `.output/public`), `pnpm
  start` (`serve .output/public`), and `pnpm run typecheck` (`fumadocs-mdx && tsc
  --noEmit`). This plan does not modify `package.json`. The build is a **static SPA**
  (`tanstackStart({ spa: … })` in `vite.config.ts`); there is no Next.js App Router and
  no `next build`.

- Hard dependency: `docs/plans/1-scaffold-the-fumadocs-documentation-app.md` (must be
  done first). Soft dependencies (features the templates reference but that are not
  required for this plan to build):
  `docs/plans/2-pragmatapro-font-and-shiki-code-ligatures.md` (Haskell code
  highlighting + PragmataPro ligatures) and
  `docs/plans/3-beautiful-mermaid-diagrams-with-zoom-pan.md` (zoomable Mermaid
  diagrams).


## Revision Note

2026-05-30 — Initial full authoring of this ExecPlan from the skeleton. Filled every
section with the concrete IA tree, all `meta.json` files, eight per-doc-type page
templates, the shared fumadocs-ui component registration contract, the authoring/style
guide content, milestones, concrete commands, and behavioral validation. The frontmatter
was preserved unchanged. Why: the master brief
(`docs/masterplans/1-keiro-runtime-docs-infrastructure-and-kiroku-foundation.md`)
requires Plan D to deliver a navigable empty IA plus copy-paste templates and a style
guide so that `docs/plans/5-...` can populate kiroku, and so any contributor can add a
correct page without inventing structure.

2026-05-30 — **Next.js → TanStack Start (static SPA) pivot rewrite.** The project moved
off Next.js (App Router) onto **TanStack Start configured as a static SPA**, built with
**Vite**; the scaffold (`docs/plans/1-scaffold-the-fumadocs-documentation-app.md`) is
already re-implemented and committed on that stack. This revision rewrote every
framework-specific mechanic while preserving the plan's intent and scope (the Diátaxis
information architecture under `content/docs/`, the `meta.json` ordering, the page
templates, and the authoring/style guide are all unchanged). Key changes:
  - MDX component registry path: `mdx-components.tsx` → **`src/components/mdx.tsx`**
    (merge into `getMDXComponents`; preserve `...defaultMdxComponents`, the trailing
    `...components` override, the `useMDXComponents` re-export, and the
    `MDXProvidedComponents` global). Verified the six fumadocs-ui sub-paths and exports
    against installed **fumadocs-ui 16.9.3** (`callout`, `steps`, `tabs`, `card`,
    `accordion`, `type-table`).
  - Navigation / IA seam: `app/layout.config.tsx` → **`src/lib/layout.shared.tsx`**, with
    the top-level taxonomy added as the `links` array of `BaseLayoutProps` (`{ text, url
    }` main items, `url` not `href`). Added a new **Milestone 9** to add `links` *after*
    the content tree exists, because the static-SPA prerenderer
    (`tanstackStart({ spa: { prerender: { crawlLinks: true } } })` in `vite.config.ts`)
    crawls links — the scaffold intentionally shipped only the title to avoid crawling
    dead links. The old verification milestone is now Milestone 10.
  - Commands: `next dev`/`next build` → **`pnpm dev`** (`vite dev`) / **`pnpm build`**
    (`vite build`, static SPA in `.output/public`) / **`pnpm start`** (serve the built
    SPA); type check is **`pnpm run typecheck`** (`fumadocs-mdx && tsc --noEmit`), not
    `next typegen`. All commands run inside the Nix dev shell (`nix develop`).
  - Rendering note: MDX renders **client-side** via the docs route `src/routes/docs/$.tsx`
    (fumadocs client loader + `useMDXComponents()`).
  - Templates: dropped the per-page `import { … } from 'fumadocs-ui/components/…'` lines,
    since components are registered globally in `getMDXComponents` (matching the reference
    `examples/tanstack-start-spa`); pages now use `<Callout>`, `<Cards>`, etc. directly.
  - The `content/docs/**` tree, all `meta.json` files, the eight page templates' bodies,
    the landing-page guidance, and the authoring/style guide content are framework-
    agnostic and were left intact. The YAML frontmatter was preserved unchanged.
