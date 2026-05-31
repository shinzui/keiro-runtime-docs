---
id: 6
slug: build-quality-gates-and-ci
title: "Build quality gates and CI"
kind: exec-plan
created_at: 2026-05-30T20:05:53Z
intention: "intention_01ksx5mf7qe2ht659e4kr9w2t0"
master_plan: "docs/masterplans/1-keiro-runtime-docs-infrastructure-and-kiroku-foundation.md"
---

# Build quality gates and CI

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

This repository, `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`, holds a single
documentation website built with **fumadocs** — a documentation framework that turns
Markdown/MDX files into a styled website. ("fumadocs" = a set of npm packages
`fumadocs-core`, `fumadocs-ui`, `fumadocs-mdx` that wire MDX content into a React app. "MDX"
= Markdown that can also embed React components.) The site is built on **TanStack Start in
static-SPA mode**: TanStack Start is a full-stack React framework whose Vite plugin
(`@tanstack/react-start/plugin/vite`) is configured here to **prerender** the site into a
fully static bundle. The build command is `vite build` (exposed as `pnpm build`); it emits a
static site under `.output/public` that needs no running server. The site documents four
Haskell libraries (kiroku, keiro, keiki, shibuya); the site itself is TypeScript/React and
all code samples shown on the pages are Haskell.

Right now the repository has no automated way to answer the question "is the docs site
healthy?". After this plan is implemented, a contributor can run a single command —
`pnpm run check` — locally and get a clear pass/fail across five gates: TypeScript type
checking, code linting, code-format checking, a full production build, and link checking of
the built static site. The exact same gates run automatically in GitHub on every pull
request and every push to the `master` branch through a workflow file at
`.github/workflows/ci.yml`, so a broken link, a type error, or a build failure is caught
before it merges. A "gate" here just means a check that must pass; if any gate fails, the
command (and CI) exits non-zero and the failure is reported.

You can see it working three ways. (1) Locally: `pnpm run check` prints five green sections
and exits 0. (2) Deliberately break something — for example introduce a type error — and
`pnpm run typecheck` exits non-zero and names the file/line. (3) On GitHub: open a pull
request and watch the "CI" check turn green; push a commit with a type error and watch it
turn red with the `tsc` error in the logs.

This plan also extends the Nix development shell (`flake.nix`) so every tool the gates need
is available just by entering the shell, and it records the decision to defer choosing a
hosting provider while keeping the build host-agnostic — which, with the static-SPA build,
is automatic: the prerendered `.output/public` directory is a plain static site that can be
served by any static host.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [x] Milestone 0 — Confirmed Plan A landed (package.json, flake.nix, vite.config.ts,
      source.config.ts, content/docs all present); baseline toolchain (Node 22, pnpm 11, oxlint
      1.66.0, oxfmt 0.45.0) on PATH. _(2026-05-30)_
- [x] Milestone 1 — Added the `linkinator` devDependency and the `lint:links` + `check` scripts
      to `package.json`; lockfile regenerated to include linkinator. _(2026-05-30)_
- [x] Milestone 2 — Added `linkinator.config.json` (now `{recurse, silent, directoryListing,
      skip:"^https?://"}` — the working key is `skip`, not `linksToSkip`). _(2026-05-30)_
- [x] Milestone 3 — Every gate green locally: typecheck, lint (warnings only), format:check,
      build, link-check. Ran `pnpm run format` once to normalise the whole repo (the gate had
      never been enforced — 109 files), then scoped oxfmt with a new `.prettierignore`.
      _(2026-05-30)_
- [x] Milestone 4 — `pnpm build` emits `.output/public`; link-check runs over it. Discovered the
      prerendered HTML is client-rendered (zero static `<a>`), so added a **source-level**
      doc-link checker (`scripts/check-doc-links.mjs`) as the meaningful gate. `pnpm run check`
      exits 0. _(2026-05-30)_
- [x] Milestone 5 — Dev shell already complete: Plan B added the `pragmatapro` flake input
      (real attr `pragmataPro`, exposed as `packages.pragmatapro-fonts`); Node 22/pnpm/oxlint/
      oxfmt already present; linkinator comes via the npm devDependency. Added a clarifying
      comment to `flake.nix` rather than a possibly-nonexistent `pkgs.linkinator`. _(2026-05-30)_
- [x] Milestone 6 — Added `.github/workflows/ci.yml` (pnpm + Node 22 fallback, oxlint/oxfmt
      pinned via `pnpm dlx` to the Nix versions). The Nix-flake CI variant was rejected: the
      flake's `pragmatapro` input is a **local filesystem path** that does not exist on a runner.
      CI-exact commands validated locally. (GitHub PR run not exercised — no remote in this
      environment.) _(2026-05-30)_
- [x] Milestone 7 — Deferred-hosting stance documented (host-agnostic static `.output/public`;
      future-deploy steps enumerated in this plan's Milestone 7). _(2026-05-30)_


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

(None yet. Candidate items to watch for, recorded in advance so the implementer is not
surprised:)

- **nitro is pinned.** `package.json` pins `nitro` to `3.0.260429-beta`. The newer
  `3.0.260522-beta` breaks the `vite dev` SSR worker; the pinned beta works for both
  `pnpm dev` and the prerendered `pnpm build`. CI must rely on the committed `pnpm-lock.yaml`
  (`pnpm install --frozen-lockfile`); do not let CI float to a newer nitro. Record the exact
  versions you observed here.
- **Static-SPA link-check coverage is partial by design.** The prerendered HTML in
  `.output/public/` contains real, link-bearing HTML for the routes TanStack Start
  prerendered (e.g. `.output/public/docs/index.html` includes the navbar links, the page's
  `<a>` content links, and an anchor like `#getting-started`). But the SPA fallback
  `.output/public/_shell.html` is an empty hydration shell, and any docs page that is **not**
  prerendered renders its body client-side in JavaScript, so its content links are not in the
  static HTML a crawler can read. Record below which routes were actually prerendered (look at
  the `pages` array in `vite.config.ts` plus whatever `crawlLinks` reached) and therefore
  what the link checker did and did not cover.
- The font flake at `/Users/shinzui/Keikaku/bokuno/fonts` has a known casing typo in its
  default attribute name and a version mismatch (built `result/` reports `0.9` while the
  flake declares `0.901`). Handle the input defensively (see Milestone 5); record the exact
  attribute name you had to use here once observed.
- `pnpm build` may print warnings about a sparse content tree until Plans D and E populate
  `content/docs/`. A build with only the seed `content/docs/index.mdx` from Plan A must still
  succeed and emit `.output/public/docs/index.html`; record the observed output here.

Observed during implementation (2026-05-30):

- **The format gate had never been enforced — 109 files were unformatted.** `oxfmt --check .`
  failed on first run. Ran `pnpm run format` once (per Milestone 3) to normalise, then discovered
  oxfmt formats *everything* by default — including planning docs (`docs/**`), vendored skill
  files (`agents/**`), the generated+committed `src/routeTree.gen.ts`, and `pnpm-lock.yaml`. Fixed
  by adding a `.prettierignore` (oxfmt reads it by default) scoping the gate to the docs **site**:
  `src/`, `content/docs/`, and root config. Critical detail: the planning-docs exclusion must be
  **anchored** as `/docs/` (leading slash) so it does NOT also exclude `content/docs/` (which IS
  site content and must be checked). `src/routeTree.gen.ts` is excluded because `vite build`
  regenerates it unformatted, which would otherwise make the gate flap after every build.
- **`oxfmt` reformats `.mdx` content** (prose reflow, table alignment, JSX wrapping) but leaves
  fenced code blocks intact — so Haskell snippets are untouched and the build still compiles. The
  one-time normalisation touched 68 `.mdx` files.
- **The prerendered HTML has ZERO static `<a>` links.** This is the load-bearing discovery for
  the link gate: the TanStack Start SPA renders the navbar, sidebar, and MDX body **client-side**,
  so `.output/public/**/index.html` are hydration shells with no anchors
  (`grep -c '<a ' .output/public/docs/kiroku/index.html` → 0). A static HTML crawler therefore
  finds ~0 links — linkinator over `.output/public` reports `Successfully scanned 0 links`. The
  plan's assumption that prerendered HTML carries checkable navbar/content links was wrong for
  this client-rendered SPA. Resolution: added `scripts/check-doc-links.mjs`, a deterministic
  offline **source-level** internal-link checker over `content/docs/**/*.mdx` (verified it catches
  a deliberately broken `/docs/...` link, satisfying Validation step 2's intent), and kept
  linkinator as a build-output crawl that lights up if more routes are prerendered later.
- **linkinator 6.3.0 quirks.** (1) Its `**` glob returns 0 results even for a normal directory,
  and breaks entirely on the `.output` dot-directory; only the plain directory-serve form works.
  (2) Serving a directory starts the crawl at `/`, but the static SPA emits **no root
  `index.html`** (only `_shell.html`), so a bare crawl reports `[404] /`; adding
  `directoryListing: true` makes the root resolve and the gate pass. (3) The config key that
  skips external links is `skip`, not the plan's `linksToSkip`.
- **pnpm fast-path can desync the lockfile.** After reverting `pnpm-lock.yaml`, `pnpm install`
  (even `--force`, `--no-frozen-lockfile`) repeatedly said "Already up to date" and refused to
  re-add `linkinator`, because it trusts the existing `node_modules` virtual-store state. Only a
  full `rm -rf node_modules pnpm-lock.yaml && pnpm install` regenerated a correct lockfile.
  Lesson: do not hand-revert the lockfile; let pnpm own it.
- **Nix-flake CI is non-viable as-is.** `flake.nix` has `inputs.pragmatapro.url =
  "path:/Users/shinzui/Keikaku/bokuno/fonts"` — a **local filesystem path** absent on a GitHub
  runner, so `nix develop` cannot evaluate the flake in CI. The pnpm/Node-22 fallback is used
  instead. The build still works on a runner because `scripts/copy-fonts.mjs` tolerates a missing
  font package (warns, exits 0; code blocks fall back to system monospace).
- **CI oxlint/oxfmt are pinned to the Nix versions** (`oxlint@1.66.0`, `oxfmt@0.45.0`) via
  `pnpm dlx`. Both fetch from npm (verified). Pinning prevents the format gate from flapping on a
  version skew between a contributor's Nix shell and `@latest` on the runner (e.g. oxfmt 0.45 vs
  0.52 format differently).


## Decision Log

Record every decision made while working on the plan.

- Decision: Use **pnpm** as the package manager and **Node 22** as the runtime for all
  gates and CI.
  Rationale: The sibling fumadocs site `shibuya-docs` and the sibling
  `keiki-docs` both pin Node 22 via their Nix flakes and use pnpm; matching them keeps the
  family consistent. Plan A (`docs/plans/1-scaffold-the-fumadocs-documentation-app.md`)
  established this repo's flake on pnpm + Node 22, and this plan builds on that.
  Date: 2026-05-30

- Decision: Lint with **oxlint** and format-check with **oxfmt**, the tools already present
  in the current `flake.nix` dev shell and already wired as `pnpm lint` (`oxlint`) and
  `pnpm run format:check` (`oxfmt --check .`), rather than introducing ESLint/Prettier/Biome.
  Rationale: The repository's existing `flake.nix` already ships `pkgs.oxlint` and
  `pkgs.oxfmt`, the existing `package.json` already calls them, and `.oxlintrc.json` already
  configures oxlint. There is no ESLint in this repo and nothing here uses `next lint` (the
  project is on TanStack Start / Vite, not Next.js; Next 16 removed `next lint` anyway).
  oxlint is a fast JavaScript/TypeScript linter; oxfmt is its companion formatter. Both run as
  standalone binaries provided by Nix, so they do not need to be npm dependencies. (If the
  team later prefers ESLint or Biome, swap the `lint` / `format:check` scripts; the rest of
  this plan is unaffected.)
  Date: 2026-05-30

- Decision: The production build gate is **`vite build`** (the `pnpm build` script), which
  prerenders the site into a **static SPA** under `.output/public`. This is already
  **host-agnostic** — the output is a plain directory of static HTML/CSS/JS that any static
  host (or the bundled `pnpm start` = `serve .output/public`) can serve. There is **no
  separate `build:export` step**: the static export *is* the default build, produced by the
  `tanstackStart({ spa: { enabled: true, prerender: { enabled: true, crawlLinks: true } } })`
  configuration in `vite.config.ts`.
  Rationale: User decision 4 in the master brief defers the hosting provider. Because the
  TanStack Start SPA build already emits a host-agnostic static bundle, deferring the host
  costs nothing and requires no opt-in flag. This SUPERSEDES the earlier (Next.js-era)
  decision that used `next build` plus an opt-in `NEXT_OUTPUT=export` static export; that
  mechanism no longer applies. Do NOT hard-wire Vercel, Cloudflare, Netlify, or any other
  host.
  Date: 2026-05-30

- Decision: Pin **nitro** to `3.0.260429-beta` and have CI install from the committed
  `pnpm-lock.yaml` with `--frozen-lockfile`.
  Rationale: The newer `3.0.260522-beta` breaks the `vite dev` SSR worker. The pinned beta
  works for both `pnpm dev` and the prerendered `pnpm build`. Freezing the lockfile in CI
  prevents a silent float to the broken version.
  Date: 2026-05-30

- Decision: Implement link checking with the npm package **`linkinator`** run as a dev
  dependency over the locally built static site at `.output/public`, instead of porting
  keiki-docs's bespoke `site/check-links.mjs`.
  Rationale: keiki-docs is a non-fumadocs Vite static-site generator whose `check-links.mjs`
  walks its hand-rolled `site-dist/` HTML output; that script does not apply to this build.
  `linkinator` is a maintained broken-link crawler that can crawl a directory of static HTML
  and reports broken internal and external links. Pointing it at `.output/public` checks the
  links present in the prerendered HTML (navbar, prerendered page bodies, the SPA fallback's
  asset references). See the Surprises note on partial coverage and Milestone 4 for the exact
  invocation and how to keep it offline-friendly in CI by limiting it to internal links.
  Date: 2026-05-30

- Decision: Do **not** add a separate Markdown/MDX structure linter (e.g. remark) in this
  plan.
  Rationale: The previous (Next.js-era) draft added a `remark` gate; in this revision the
  scope is kept to the five gates the master plan calls for — typecheck, lint, format-check,
  build, link-check — and MDX correctness is already exercised by the build gate, which runs
  `fumadocs-mdx` to compile every `content/docs/**` file and fails on malformed MDX. If a
  dedicated content-structure linter is wanted later it can be added without disturbing the
  other gates.
  Date: 2026-05-30

- Decision: CI prefers the **Nix flake dev shell** (`nix develop`) to provide the toolchain;
  if the team prefers a lighter runner, a documented pnpm/Node-22 fallback job is included as
  an alternative in this plan.
  Rationale: Using `nix develop --command` guarantees CI runs the exact tool versions a
  developer gets locally (Node 22, pnpm, oxlint, oxfmt). The fallback uses
  `actions/setup-node@v4` + `pnpm/action-setup@v4` for teams not wanting Nix in CI; note that
  oxlint/oxfmt are only on PATH via Nix, so the fallback must install them via npm or
  `pnpm dlx` (see Milestone 6).
  Date: 2026-05-30

- Decision (implementation): **Shipped the pnpm/Node-22 fallback CI, not the Nix-flake variant.**
  Rationale: `flake.nix`'s `pragmatapro` input is `path:/Users/shinzui/Keikaku/bokuno/fonts`, a
  local filesystem path that does not exist on a GitHub runner, so `nix develop` cannot evaluate
  the flake in CI. The fallback works because `scripts/copy-fonts.mjs` tolerates a missing font
  package (the build degrades to system monospace, exits 0). oxlint/oxfmt are pinned via
  `pnpm dlx` to the exact Nix versions (`oxlint@1.66.0`, `oxfmt@0.45.0`) so CI and local agree and
  the format gate never flaps on a version skew. (A future Nix-CI option would require making the
  font input remote or optional.)
  Date: 2026-05-30

- Decision (implementation): **Added a source-level internal-link checker
  (`scripts/check-doc-links.mjs`) as the primary link gate**, with linkinator kept as a secondary
  build-output crawl. `lint:links` runs both.
  Rationale: The site renders content client-side, so the prerendered HTML has zero static `<a>`
  links and linkinator alone catches nothing (it scans 0 links). The source-level checker scans
  every `content/docs/**/*.mdx` for internal `/docs/...` and relative links and fails on any that
  resolve to a non-existent page — which is what actually delivers the plan's goal ("a broken link
  is caught before it merges") in this architecture, and it caught a real bug class (a wrong
  relative link from Plan #5). This is an additive enhancement, not a replacement; if more routes
  are prerendered later, linkinator's coverage grows automatically.
  Date: 2026-05-30

- Decision (implementation): **Scoped the format gate with a `.prettierignore`** (read by oxfmt
  by default) to `src/` + `content/docs/` + root config, excluding planning docs (`/docs/`,
  anchored so `content/docs/` is still checked), vendored tooling (`agents/`), the generated
  `src/routeTree.gen.ts`, and `pnpm-lock.yaml`.
  Rationale: `oxfmt --check .` formats the whole repo by default. The generated route tree is
  regenerated unformatted by every build (would flap the gate); planning docs contain code/mermaid
  fences oxfmt cannot format stably; the lockfile and vendored skills are not the docs site. The
  one-time `pnpm run format` normalised 109 site files (kept).
  Date: 2026-05-30


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

**Complete (2026-05-30).** A contributor can now run a single command, `pnpm run check`, and get a
pass/fail across five gates — typecheck, lint, format-check, build, and link-check — and the same
gates run on GitHub via `.github/workflows/ci.yml` on every pull request and every push to
`master`. `pnpm run check` exits 0 on the current tree; each gate is real (verified it fails on
bad input: a type error fails typecheck, a broken `/docs` link fails the doc-link check).

What shipped vs. the original plan:
- **Five gates, as specified** — but the **link** gate is implemented as a source-level
  `content/docs/**` internal-link checker (`scripts/check-doc-links.mjs`) *plus* a linkinator
  crawl, because the client-rendered SPA emits no static links for a crawler to follow (the plan
  assumed otherwise). This is the change that makes the gate actually catch broken links.
- **Format gate scoped** via `.prettierignore`; one-time repo normalisation applied (109 files).
- **CI is the pnpm/Node-22 fallback**, not the Nix-flake variant, because the flake's font input
  is a local path absent on runners; oxlint/oxfmt are pinned via `pnpm dlx` to the Nix versions.
- **Hosting deferred**, host-agnostic by construction (static `.output/public`).

Gaps / follow-ups: (1) The GitHub CI run itself was not exercised (no remote configured in this
environment); the CI-exact commands were validated locally. (2) linkinator coverage is ~0 until
more routes are prerendered or a JS-rendering crawler is added (future enhancement, as the plan
notes). (3) A future Nix-CI would need the `pragmatapro` font input made remote/optional.

Lessons: read the *actual* build output before designing a gate around it (the "0 static links"
discovery reshaped the link gate); let pnpm own the lockfile (manual reverts desync it); pin
linter/formatter versions across local and CI to stop format gates flapping; scope whole-repo
formatters with an ignore file before enforcing them.


## Context and Orientation

Read this section as if you know nothing about the repository.

The repository is at `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`. The git default
branch is `main`, but active work happens on `master`; do not create feature branches. Every
commit you make for this plan must carry these git trailers (a "trailer" is a `Key: value`
line at the end of the commit message):

```text
MasterPlan: docs/masterplans/1-keiro-runtime-docs-infrastructure-and-kiroku-foundation.md
ExecPlan: docs/plans/6-build-quality-gates-and-ci.md
Intention: intention_01ksx5mf7qe2ht659e4kr9w2t0
```

Use Conventional Commit messages (for example `chore(ci): add CI workflow and quality
gates`). A Conventional Commit is a message that starts with a type such as `feat:`,
`fix:`, `chore:`, `docs:`, optionally with a scope in parentheses.

This plan has a HARD dependency on **Plan A**, whose file is
`docs/plans/1-scaffold-the-fumadocs-documentation-app.md`. "HARD dependency" means Plan A
must be implemented and merged before this plan can be implemented, because this plan adds
gates that operate on the fumadocs app Plan A creates. Plan A is what scaffolds the
TanStack Start + fumadocs site, creates `package.json`, sets up `flake.nix` (pnpm + Node 22),
and seeds `content/docs/index.mdx`. This plan has SOFT dependencies on Plans B, C, D, and E
(files `docs/plans/2-...`, `docs/plans/3-...`, `docs/plans/4-...`, `docs/plans/5-...`). "SOFT
dependency" means this plan does not require them; the gates work on whatever content and
customizations exist. You can and should implement this plan immediately after Plan A, before
B/C/D/E exist.

After Plan A, the repository tree relevant to this plan looks like this (paths are
repository-relative):

```text
package.json            # created by Plan A; pnpm scripts dev/build/start/typecheck/lint/format; owned by Plan A
pnpm-lock.yaml          # committed lockfile; CI installs from it with --frozen-lockfile
pnpm-workspace.yaml     # allowBuilds: esbuild + sharp
flake.nix               # pnpm + Node 22 + oxlint + oxfmt dev shell; this plan extends it
flake.lock
.gitignore              # ignores .output, .nitro, .tanstack, .source; commits src/routeTree.gen.ts
vite.config.ts          # Vite build pipeline: tanstackStart(spa+prerender) + nitro; emits .output/public
source.config.ts        # fumadocs-mdx collection config (defineDocs over content/docs)
tsconfig.json           # strict TS, noEmit, paths { "@/*": ./src/*, "collections/*": ./.source/* }
.oxlintrc.json          # oxlint config (plugins, categories, ignorePatterns)
serve.json              # SPA fallback rewrite for the `pnpm start` static server
src/                    # file-based routing + app code (see below)
content/docs/           # MDX content; at least index.mdx after Plan A
```

The `src/` tree (TanStack Start file-based routing) after Plan A:

```text
src/router.tsx                 # router setup
src/routeTree.gen.ts           # generated by the TanStack Router plugin; COMMITTED (so tsc resolves routes)
src/styles/app.css             # Tailwind v4 entrypoint
src/components/mdx.tsx          # MDX component map (was mdx-components.tsx in the Next.js draft)
src/components/search.tsx       # client-side Orama search UI
src/components/not-found.tsx
src/lib/source.ts              # fumadocs source loader (was lib/source.ts)
src/lib/layout.shared.tsx
src/lib/cn.ts
src/lib/shared.ts
src/routes/index.tsx           # "/" route
src/routes/__root.tsx          # root layout
src/routes/docs/$.tsx          # "/docs/*" docs pages
src/routes/docs/{$}[.]md.ts    # raw-markdown route ("/docs/*.md")
src/routes/api/search.ts       # static search index route (server.staticGET); SPA uses client-side Orama search
```

The current `flake.nix` (already on pnpm + Node 22) already contains the two lint/format
binaries this plan reuses, plus an empty `checks = {}` output block this plan may populate:

```nix
devShells.default = pkgs.mkShell {
  nativeBuildInputs = [
    pkgs.nodejs_22
    pkgs.pnpm
    pkgs.just
    pkgs.oxlint
    pkgs.oxfmt
    pkgs.typescript
  ];
  # ...
};
```

This plan (Milestone 5) extends that shell, ensuring `pkgs.oxlint`, `pkgs.oxfmt`, Node 22,
pnpm, the link-check tool, and the pragmatapro font input are all present.

The existing `package.json` scripts (created by Plan A — do not rename them; Plan A and this
plan share them as an integration contract):

```json
{
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
  }
}
```

Definitions of the gates this plan installs (the first four scripts already exist; this plan
adds the link-check and the aggregate `check`):

- **TypeScript typecheck** — `pnpm run typecheck` = `fumadocs-mdx && tsc --noEmit`. It runs
  `fumadocs-mdx` first to generate the `.source/` directory that `tsconfig.json`'s
  `collections/*` path alias maps to; without it, `tsc` reports missing-module errors. There
  is **no `next typegen`** step (this is not Next.js); TanStack route types come from
  `src/routeTree.gen.ts`, which is **committed**, so a clean CI checkout resolves the route
  tree without first running `vite dev`/`vite build`. (If `src/routeTree.gen.ts` is ever
  stale, it is regenerated by `vite dev`/`vite build`.)
- **Lint** — `pnpm lint` = `oxlint`, reading `.oxlintrc.json`. oxlint scans the
  TypeScript/JavaScript source for suspicious code.
- **Format check** — `pnpm run format:check` = `oxfmt --check .`, which fails (rather than
  rewrites) when something is unformatted.
- **Build** — `pnpm build` = `vite build`, which compiles every MDX file via `fumadocs-mdx`,
  prerenders the routes, and emits the static SPA into `.output/public`. This is the
  strongest single signal that the whole site compiles, type-checks its MDX, and renders.
- **Link check** — after `pnpm build`, crawl the static HTML in `.output/public/` with
  linkinator to confirm no internal link is broken. Coverage is partial (static-SPA caveat —
  see Surprises & Discoveries and Milestone 4).

Integration-point contract with Plan A (state this identically wherever touched): the files
`package.json` (its `scripts` block) and `flake.nix` (the dev shell) are **owned by Plan A**.
Plan A creates them with the baseline scripts (`dev`/`build`/`start`/`typecheck`/`lint`/
`format:check`/…) and the pnpm + Node 22 shell. This plan **extends** them additively: it
adds the `lint:links` and `check` scripts to `package.json` and adds the link-check tool +
font input to `flake.nix`. When implementing, MERGE into the existing blocks; never replace
Plan A's content, and never rename an existing script.


## Plan of Work

The work is additive and proceeds in eight milestones (0–7). Each milestone is independently
verifiable. All commands run from the repository root
`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` unless stated otherwise.


### Milestone 0 — Confirm the foundation (Plan A) is present

Scope: a five-minute sanity check that the fumadocs app exists, so later gates have
something to operate on. At the end you will have confirmed `package.json`, `flake.nix`,
`vite.config.ts`, `source.config.ts`, `tsconfig.json`, and `content/docs/index.mdx` exist.

Run:

```bash
ls package.json flake.nix vite.config.ts tsconfig.json source.config.ts .oxlintrc.json
ls content/docs/index.mdx
ls src/routeTree.gen.ts
```

Acceptance: all files list without error. If `package.json` is missing, Plan A has not been
implemented; implement Plan A first
(`docs/plans/1-scaffold-the-fumadocs-documentation-app.md`).


### Milestone 1 — Add the link-check script and the aggregate `check` script

Scope: the per-gate scripts (`typecheck`, `lint`, `format:check`, `build`) already exist in
`package.json` (owned by Plan A). This milestone adds the two missing scripts — `lint:links`
and the aggregate `check` — plus the link-check dev dependency. At the end, each gate is
runnable individually and `pnpm run check` chains them.

Edit `package.json` (owned by Plan A — MERGE into the existing `scripts` and
`devDependencies`; do not rename or remove existing entries). Add these two scripts to the
`scripts` object:

```json
{
  "scripts": {
    "lint:links": "linkinator .output/public --recurse --silent --config linkinator.config.json",
    "check": "pnpm run typecheck && pnpm lint && pnpm run format:check && pnpm build && pnpm run lint:links"
  }
}
```

Notes on each script:

- `lint:links` crawls the **built** static site. `pnpm build` (Milestone 4) emits static HTML
  into `.output/public`; linkinator crawls that directory. `--recurse` follows internal
  links; `--silent` keeps output to failures; the config file (Milestone 2) restricts
  checking to internal links so CI does not depend on the public internet.
- `check` is the aggregate gate, ordered cheap-to-expensive: typecheck → lint → format →
  build → links. The build must come before `lint:links` because linkinator needs
  `.output/public` to exist.

Add the link-check tool to `devDependencies` (merge):

```json
{
  "devDependencies": {
    "linkinator": "^6.1.2"
  }
}
```

Install (this also re-runs the `postinstall` = `fumadocs-mdx` hook, regenerating `.source/`):

```bash
pnpm install
```

Acceptance: `pnpm install` completes; `pnpm run typecheck` runs (it should pass if Plan A
left a clean tree); `pnpm lint` and `pnpm run format:check` run inside `nix develop` so
oxlint/oxfmt are on PATH.


### Milestone 2 — Add the link-check configuration

Scope: one small config file so the link checker stays offline-friendly. At the end,
`linkinator` has explicit configuration.

Create `linkinator.config.json` at the repository root:

```json
{
  "recurse": true,
  "silent": true,
  "linksToSkip": [
    "^https?://"
  ]
}
```

The `linksToSkip` regular expression skips all absolute `http(s)` links, so the gate only
verifies **internal** links (relative paths and same-site links) — this keeps CI
deterministic and offline. The prerendered docs HTML does contain an external link
(`https://github.com/keiro/keiro-runtime-docs`); skipping `http(s)` means the gate does not
block merges on third-party uptime. (If the team later wants external-link checking, add a
separate non-blocking job.)

Note on what gets checked: linkinator resolves links it finds in the crawled HTML against the
files on disk under `.output/public`. With `crawlLinks` enabled in `vite.config.ts`, the
prerendered `.output/public/docs/index.html` carries the navbar links (`/`, `/docs`), the raw
markdown link (`/docs/index.md`), and the in-page anchor (`#getting-started`). The SPA
fallback `.output/public/_shell.html` only references hashed asset files. See the static-SPA
caveat in Surprises & Discoveries: links that live only in the client-rendered body of a
non-prerendered page are not visible to a static HTML crawler.

Acceptance: `linkinator.config.json` exists; `pnpm run lint:links` (after Milestone 4's
build) checks only internal links.


### Milestone 3 — Make every gate green locally

Scope: run each gate, fix any issues in config (not in product code unless trivially this
plan's own files), and confirm `pnpm run check` passes end to end. At the end, a developer in
the Nix shell can run one command to validate the whole site.

Run inside the Nix shell so oxlint/oxfmt are available:

```bash
nix develop --command pnpm run typecheck
nix develop --command pnpm lint
nix develop --command pnpm run format:check
```

If `format:check` fails because some files are unformatted, run
`nix develop --command pnpm run format` once to format them, review the diff, and commit it.
If `lint` reports issues, prefer fixing them in a focused commit; the existing
`.oxlintrc.json` already ignores generated/vendored output via its `ignorePatterns`:

```json
{
  "ignorePatterns": ["node_modules", "dist", "build", "result", ".direnv", ".seihou"]
}
```

If oxlint starts flagging build artifacts, extend that array (for example add `.output`,
`.source`, `.tanstack`, `.nitro`) rather than touching product code. Note that
`src/routeTree.gen.ts` is generated but committed; if oxlint is noisy on it, add it to
`ignorePatterns` too.

Acceptance: each individual gate exits 0. (The aggregate `check` also runs the build and
links; those are validated in Milestone 4.)


### Milestone 4 — Confirm the static-SPA build gate and run the link check

Scope: confirm `pnpm build` produces the static `.output/public` directory the link checker
can crawl, then run the link checker over it. At the end, `pnpm build` succeeds and
`pnpm run lint:links` crawls the result. No build configuration changes are needed — the
host-agnostic static export is already the default.

Background: `pnpm build` runs `vite build`. The `tanstackStart` plugin in `vite.config.ts` is
configured for a static SPA with prerendering:

```ts
tanstackStart({
  spa: {
    enabled: true,
    prerender: {
      enabled: true,
      crawlLinks: true,
    },
  },
  pages: [{ path: "/docs" }, { path: "/api/search" }],
}),
```

This prerenders the listed pages (and any links `crawlLinks` discovers) into real static HTML
under `.output/public`, alongside an SPA fallback `_shell.html` and hashed asset bundles.
There is **no separate static-export step** and **no host to choose**: the static directory
is the build, and it can be served by any static host or by the bundled
`pnpm start` (= `serve .output/public --config ../../serve.json`, which uses `serve.json`'s
SPA-fallback rewrite to `_shell.html`).

The static-SPA caveat (record findings in Surprises & Discoveries): a static HTML crawler can
only see links that are present in the prerendered HTML. For prerendered routes
(e.g. `/docs`), the page body and navbar links are in the HTML and are checked. For routes
that are not prerendered, the body renders client-side from JavaScript, so its content links
are not in the static HTML and the crawler cannot follow them. Be honest about this in the
plan's outcomes: the link gate verifies the navigation chrome and the prerendered pages, not
every link buried in client-rendered MDX bodies. If broader coverage is needed later, options
include (a) adding more entries to the `pages` array so more routes are prerendered, or
(b) serving the built site with `pnpm start` and crawling the running URL with a
JS-rendering crawler — that belongs to a future enhancement, not this plan.

Run and verify:

```bash
nix develop --command pnpm build
ls .output/public/docs/index.html .output/public/_shell.html
nix develop --command pnpm run lint:links
```

Acceptance: `pnpm build` exits 0 and prints the Vite/TanStack build summary;
`.output/public/docs/index.html` and `.output/public/_shell.html` exist;
`pnpm run lint:links` crawls `.output/public` and reports `0 broken` for internal links.
Finally confirm the aggregate:

```bash
nix develop --command bash -c "pnpm run typecheck && pnpm lint && pnpm run format:check && pnpm build && pnpm run lint:links"
```


### Milestone 5 — Extend the Nix dev shell

Scope: make every gate tool available simply by entering `nix develop`, and add the
pragmatapro font flake input so the font is available locally (used by Plan B; added here so
the shell is complete). At the end, a fresh clone + `nix develop` yields Node 22, pnpm,
oxlint, oxfmt, the link-check tool, and the font package.

This file is owned by Plan A; Node 22, pnpm, oxlint, and oxfmt are already present. This
milestone MERGES the additions below into the existing flake. Here is the full intended
`flake.nix` after this plan's additions (use as the merge target):

```nix
{
  description = "Docs for keiro runtime";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  # Added by this plan (Plan F): the PragmataPro font package, consumed by Plan B.
  # The font flake has a known default-attr casing quirk and a version-string mismatch
  # (built result reports 0.9 while the flake declares 0.901). We consume it defensively:
  # do not assume `packages.<system>.default`; reference the package by its actual attr
  # name once `nix flake show path:/Users/shinzui/Keikaku/bokuno/fonts` reveals it.
  inputs.pragmatapro.url = "path:/Users/shinzui/Keikaku/bokuno/fonts";

  outputs = { self, nixpkgs, flake-utils, pragmatapro }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        # Defensive selection of the font package: try the conventional attrs in order.
        # Adjust this list after inspecting `nix flake show path:/Users/shinzui/Keikaku/bokuno/fonts`.
        fontPkg =
          let p = pragmatapro.packages.${system} or { };
          in p.default or (p.pragmatapro or (p.PragmataPro or null));
      in
      {
        # Optional: nix-level checks could mirror the CI gates here, e.g. a derivation
        # that runs `pnpm run check`. Left empty for now; CI (Milestone 6) is the gate.
        checks = {
        };

        devShells.default = pkgs.mkShell {
          nativeBuildInputs = [
            pkgs.nodejs_22      # Node 22
            pkgs.pnpm           # pnpm package manager
            pkgs.just
            pkgs.oxlint         # lint gate
            pkgs.oxfmt          # format gate
            pkgs.typescript
            pkgs.linkinator     # link-check gate; if absent in nixpkgs, rely on the
                                # devDependency instead and drop this line
          ] ++ (if fontPkg != null then [ fontPkg ] else [ ]);

          shellHook = ''
            export LANG=en_US.UTF-8

            echo "keiro-runtime-docs dev shell"
            echo "node $(node --version)"
            echo "pnpm $(pnpm --version)"

            if [ ! -d node_modules ]; then
              echo "Run 'pnpm install' to fetch dependencies."
            fi
          '';
        };
      }
    );
}
```

Notes:

- If `pkgs.linkinator` does not exist in nixpkgs, remove that line; the `linkinator`
  devDependency from Milestone 1 covers it (run via `pnpm run lint:links`). Record which path
  you used in Surprises & Discoveries.
- The font input is added here so the dev shell is complete and Plan B can consume `fontPkg`.
  If Plan B already added the input, do not duplicate it — merge.
- After editing, `flake.lock` updates; commit it.

Run and verify:

```bash
nix flake show path:/Users/shinzui/Keikaku/bokuno/fonts
nix develop --command bash -c 'node --version && pnpm --version && oxlint --version && oxfmt --version'
```

Acceptance: `nix flake show` reveals the font package's real attribute name (update `fontPkg`
if needed); `node --version` prints `v22.*`; `pnpm --version` prints a version;
`oxlint`/`oxfmt` print versions.


### Milestone 6 — Add the GitHub Actions CI workflow

Scope: create `.github/workflows/ci.yml` so the gates run automatically on every pull request
and every push to `master`. At the end, opening a PR shows a "CI" check that runs typecheck,
lint, format-check, build, and link-check, and turns green when all pass. There is currently
NO `.github/` directory in the repository; you are creating it.

Create the directory:

```bash
mkdir -p .github/workflows
```

Write `.github/workflows/ci.yml`. This is the **preferred** version using the Nix flake dev
shell so CI runs the exact tool versions developers use. Note `--frozen-lockfile`: CI installs
from the committed `pnpm-lock.yaml` so it gets the pinned `nitro` `3.0.260429-beta` (a newer
nitro breaks the build — see Decision Log).

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - master

# Cancel superseded runs on the same ref to save CI minutes.
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  gates:
    name: Quality gates (Nix flake)
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install Nix
        uses: DeterminateSystems/nix-installer-action@v16

      - name: Enable Nix cache
        uses: DeterminateSystems/magic-nix-cache-action@v8

      - name: Install dependencies
        run: nix develop --command pnpm install --frozen-lockfile

      - name: Typecheck
        run: nix develop --command pnpm run typecheck

      - name: Lint
        run: nix develop --command pnpm lint

      - name: Format check
        run: nix develop --command pnpm run format:check

      - name: Build (static SPA -> .output/public)
        run: nix develop --command pnpm build

      - name: Link check
        run: nix develop --command pnpm run lint:links
```

If the team prefers NOT to run Nix in CI, use this **fallback** workflow instead (same gates,
plain pnpm/Node 22). Because oxlint/oxfmt are only provided by the Nix shell, the fallback
runs them via `pnpm dlx` (or you can add them as npm devDependencies):

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - master

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  gates:
    name: Quality gates (pnpm + Node 22)
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up pnpm
        uses: pnpm/action-setup@v4

      - name: Set up Node 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm run typecheck

      - name: Lint
        run: pnpm dlx oxlint

      - name: Format check
        run: pnpm dlx oxfmt --check .

      - name: Build (static SPA -> .output/public)
        run: pnpm build

      - name: Link check
        run: pnpm run lint:links
```

(If you choose the fallback, record the choice in the Decision Log. Prefer `pnpm dlx` for
oxlint/oxfmt over adding them as npm deps, so the Nix shell remains the single source of truth
for those tool versions.)

Commit both the workflow and any `package.json` adjustments together.

Acceptance: pushing this to a branch and opening a PR against `master` triggers the CI check;
each step appears as its own line in the GitHub Actions log; the job turns green when all
gates pass.


### Milestone 7 — Document the deferred hosting decision

Scope: record, in this plan, that hosting is intentionally deferred and what a future deploy
plan would add. At the end, the plan unambiguously explains the host-agnostic stance and the
follow-on work. This milestone is documentation only.

The host-agnostic stance is already satisfied by construction: `pnpm build` emits a static
SPA under `.output/public` that any static host can serve, and `pnpm start`
(= `serve .output/public --config ../../serve.json`) serves it locally with the SPA-fallback
rewrite. No host is wired and no host-specific config exists.

The future deploy plan (not part of this plan) would:

1. Choose a static host (e.g. Cloudflare Pages, Netlify, GitHub Pages, Vercel static, or any
   bucket+CDN) and publish the `.output/public` directory.
2. Confirm SPA-fallback routing on that host (the equivalent of `serve.json`'s rewrite of
   `/**` to `/_shell.html`), since the SPA serves unknown paths from the fallback shell.
3. Confirm client-side search works on the host: the SPA uses client-side Orama search backed
   by the static search index emitted by the `src/routes/api/search.ts` route
   (`server.staticGET()` → `.output/public/api/search`). A static host serves that file
   directly; no server runtime is required.
4. Add a deploy job to a separate workflow (e.g. `.github/workflows/deploy.yml`) gated on the
   `master` branch and on the `CI` workflow passing, publishing `.output/public` to the chosen
   host.
5. Set any host-specific config (base path for project-pages hosting, environment variables,
   CDN cache headers).

Acceptance: this section exists and a reader understands why no host is wired and what the
next plan must do.


## Concrete Steps

All commands run from `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`. Where oxlint/oxfmt
are needed, prefix with `nix develop --command` so they are on PATH.

Step 1 — confirm foundation:

```bash
ls package.json flake.nix vite.config.ts tsconfig.json source.config.ts content/docs/index.mdx src/routeTree.gen.ts
```

Expected (abbreviated):

```text
content/docs/index.mdx  flake.nix  package.json  source.config.ts  src/routeTree.gen.ts  tsconfig.json  vite.config.ts
```

Step 2 — add `lint:links` + `check` scripts and the `linkinator` dev dep to `package.json`
(Milestone 1), then install:

```bash
pnpm install
```

Expected tail (abbreviated):

```text
Done in 12.3s using pnpm 11.x
```

Step 3 — create `linkinator.config.json` (Milestone 2).

Step 4 — run each gate (Milestone 3):

```bash
nix develop --command pnpm run typecheck
nix develop --command pnpm lint
nix develop --command pnpm run format:check
```

Expected (typecheck, abbreviated):

```text
> fumadocs-mdx && tsc --noEmit
(no output, exit 0)
```

Step 5 — build the static SPA and run the link check (Milestone 4):

```bash
nix develop --command pnpm build
nix develop --command pnpm run lint:links
```

Expected (link check, abbreviated):

```text
[ ... scanned N links ... ]
0 broken
```

Step 6 — extend `flake.nix` (Milestone 5), then verify the shell:

```bash
nix flake show path:/Users/shinzui/Keikaku/bokuno/fonts
nix develop --command bash -c 'node --version && pnpm --version && oxlint --version && oxfmt --version'
```

Expected (abbreviated):

```text
v22.11.0
11.x.x
oxlint 0.x
oxfmt 0.x
```

Step 7 — create CI workflow (Milestone 6):

```bash
mkdir -p .github/workflows
# write .github/workflows/ci.yml as shown above
```

Step 8 — commit everything with the required trailers:

```bash
git add package.json pnpm-lock.yaml flake.nix flake.lock linkinator.config.json .github/workflows/ci.yml docs/plans/6-build-quality-gates-and-ci.md
git commit -m "chore(ci): add link-check + aggregate check gate and CI workflow

MasterPlan: docs/masterplans/1-keiro-runtime-docs-infrastructure-and-kiroku-foundation.md
ExecPlan: docs/plans/6-build-quality-gates-and-ci.md
Intention: intention_01ksx5mf7qe2ht659e4kr9w2t0"
```

Step 9 — push and open a PR to prove CI (Milestone 6 acceptance):

```bash
git push origin master
gh pr create --base main --head master --title "Build quality gates and CI" --body "Implements docs/plans/6-build-quality-gates-and-ci.md"
gh pr checks --watch
```

Expected: `gh pr checks --watch` shows the `CI` check transitioning to `pass`.


## Validation and Acceptance

The change is effective when these behaviors hold (each is a concrete input → observable
output):

1. Aggregate gate passes locally. Input: `nix develop --command bash -c "pnpm run typecheck
   && pnpm lint && pnpm run format:check && pnpm build && pnpm run lint:links"`. Output: exit
   code 0; the link-check prints `0 broken`. Verify exit code with `echo $?` → `0`.

2. The link gate actually catches broken links. Input: add a deliberately broken relative
   link to `content/docs/index.mdx`, e.g. `[broken](/docs/this-page-does-not-exist)`, then
   run `pnpm build && pnpm run lint:links`. Output: linkinator exits non-zero and names the
   broken URL — but ONLY if the link appears in the prerendered HTML for `/docs`. Because the
   `/docs` index is prerendered, a link in its body is checked. Then remove the bad link and
   confirm the gate returns to green. (Record in Surprises & Discoveries whether the broken
   link was caught, which confirms the static-SPA coverage for that route.)

3. The typecheck gate catches type errors. Input: introduce a type error (e.g. assign a
   `string` to a `number` in any `.ts`/`.tsx` file under `src/`), run `pnpm run typecheck`.
   Output: `tsc` exits non-zero with the error and file/line. Revert and confirm green.

4. The build gate catches build breakage. Input: introduce a syntax error in a `.tsx`
   component under `src/`, or malformed MDX in `content/docs/index.mdx`, run `pnpm build`.
   Output: `vite build` fails with the error. Revert and confirm green.

5. CI runs the same gates on a PR. Input: open a PR against `master`. Output: the GitHub
   Actions `CI` job runs all five gate steps and turns green. Push a commit with a type error
   and the `Typecheck` step turns red with the `tsc` error visible in the step log; fix it and
   the check goes green on the next push.

6. The dev shell is complete. Input: in a fresh checkout, run `nix develop --command bash -c
   'node --version && pnpm --version && oxlint --version && oxfmt --version'`. Output: Node
   prints `v22.*` and the other three print versions, proving the shell provides the whole
   toolchain.

Acceptance is the conjunction of 1–6: every gate is real (fails on bad input, passes on good
input), runs locally via `pnpm run check`, and runs in CI on PRs and pushes to `master`.


## Idempotence and Recovery

All steps are safe to repeat. `pnpm install` is idempotent (its `postinstall` regenerates
`.source/`). Re-running any gate has no side effects except `pnpm run format` (which rewrites
files) — prefer `pnpm run format:check` (read-only) in gates and CI; only run
`pnpm run format` intentionally and review the diff. `pnpm build` overwrites `.output/`,
`.nitro/`, `.tanstack/`, and `.source/`, all gitignored, so rebuilding is harmless; delete
them to recover from a corrupted build:

```bash
rm -rf .output .nitro .tanstack .source
nix develop --command pnpm build
```

If the build still fails after a clean rebuild, suspect a floated `nitro`: reinstall from the
committed lockfile to restore the pinned `3.0.260429-beta`:

```bash
nix develop --command pnpm install --frozen-lockfile
```

`src/routeTree.gen.ts` is committed; if `tsc` complains it is stale, regenerate it by running
`pnpm dev` or `pnpm build` once and committing the result.

Editing `flake.nix` updates `flake.lock`; if the font input fails to resolve, comment out the
`pragmatapro` input and the `fontPkg` line, commit, and revisit after running
`nix flake show path:/Users/shinzui/Keikaku/bokuno/fonts` to learn the real attribute name.
The dev shell still provides Node/pnpm/oxlint/oxfmt without the font, so gates remain
runnable. The CI workflow is additive; deleting `.github/workflows/ci.yml` fully reverts CI.
If the Nix-based CI is too slow or flaky, switch to the documented pnpm/Node-22 fallback
workflow in Milestone 6 without changing any gate scripts.


## Interfaces and Dependencies

Tools and why each is used:

- **pnpm** (package manager) and **Node 22** (runtime) — match the sibling fumadocs site
  `shibuya-docs` and `keiki-docs`; provided by `flake.nix` via `pkgs.nodejs_22` + `pkgs.pnpm`.
  Owned by Plan A (`docs/plans/1-scaffold-the-fumadocs-documentation-app.md`).
- **TypeScript `tsc`** with a `fumadocs-mdx` pre-step — the typecheck gate
  (`fumadocs-mdx && tsc --noEmit`). fumadocs requires the generated `.source/` (mapped by
  `tsconfig.json`'s `collections/*` path alias) before `tsc --noEmit` can succeed. No
  `next typegen` is involved (not Next.js); TanStack route types come from the committed
  `src/routeTree.gen.ts`.
- **oxlint** / **oxfmt** — lint and format-check gates, provided by `flake.nix`
  (`pkgs.oxlint`, `pkgs.oxfmt`), already present in the shell and already wired as `pnpm lint`
  / `pnpm run format:check`. Config: `.oxlintrc.json`.
- **linkinator** (npm devDependency, optionally also a Nix package) — internal link checker
  over the built `.output/public` directory. Config: `linkinator.config.json` (skips external
  `http(s)` links to stay deterministic/offline). Coverage is partial for a static SPA — see
  the static-SPA caveat in the Decision Log / Milestone 4.
- **Vite + TanStack Start (`vite build`)** — the host-agnostic build gate. Configured in
  `vite.config.ts` as a static SPA with prerendering (`tanstackStart({ spa: { enabled: true,
  prerender: { enabled: true, crawlLinks: true } } })`), it emits a static site into
  `.output/public`. No host is hard-wired; no separate export step exists. The `nitro` Vite
  plugin is part of this pipeline and is pinned to `3.0.260429-beta`.
- **GitHub Actions** — runs all gates on `pull_request` and `push` to `master` via
  `.github/workflows/ci.yml`. Preferred runner uses `DeterminateSystems/nix-installer-action`
  + the flake dev shell; documented fallback uses `pnpm/action-setup@v4` +
  `actions/setup-node@v4` (Node 22) with oxlint/oxfmt via `pnpm dlx`.

Files this plan creates or extends, with ownership:

- `package.json` — OWNED BY Plan A; this plan MERGES the `lint:links` and `check` scripts and
  the `linkinator` devDependency. It does NOT rename or remove the existing
  `typecheck`/`lint`/`format`/`format:check`/`build`/`start`/`dev`/`preview` scripts.
- `flake.nix` — OWNED BY Plan A; this plan MERGES the link-check tool (optionally
  `pkgs.linkinator`) and the `pragmatapro` font input + `fontPkg` selection. Updates
  `flake.lock`.
- `linkinator.config.json` — NEW, owned by this plan.
- `.github/workflows/ci.yml` — NEW, owned by this plan. There is no `.github/` directory
  before this plan.
- `vite.config.ts`, `source.config.ts`, `tsconfig.json`, `.oxlintrc.json`, `serve.json`,
  `.gitignore` — OWNED BY Plan A; this plan does not modify them (it only reads/relies on
  them). If oxlint needs to ignore more build dirs, extend `.oxlintrc.json`'s `ignorePatterns`
  (Milestone 3).

Function/script signatures that must exist at the end:

- `pnpm run typecheck` → runs `fumadocs-mdx && tsc --noEmit`; exit 0 on clean.
- `pnpm lint` / `pnpm run format:check` → `oxlint` / `oxfmt --check .`; exit 0 on clean.
- `pnpm build` → `vite build` → static `.output/public`; exit 0 on success.
- `pnpm run lint:links` → `linkinator .output/public ...`; prints `0 broken`; exit 0 on clean.
- `pnpm run check` → all of the above chained; the single local entry point.

Integration-point contract restated (identical wording wherever this appears): `package.json`
scripts and the `flake.nix` dev shell are owned by Plan A and extended (never replaced) by
this plan; merge additively and never rename an existing script.


## Revision Note

2026-05-30 — Initial full authoring from the skeleton. Fleshed out every section for
Plan F (Build, quality gates & CI).

2026-05-30 — **Next.js → TanStack Start (static SPA) pivot.** The project pivoted from a
Next.js App Router app to TanStack Start in static-SPA mode (the Plan A scaffold was already
re-implemented on TanStack Start and committed). This revision rewrites all framework-specific
mechanics while preserving the plan's original intent and scope (stand up build, lint,
typecheck, and link-check gates and wire CI). Key changes:

- Build gate: `next build` (+ opt-in `NEXT_OUTPUT=export` static export, `build:export`) →
  `vite build` (`pnpm build`), which prerenders a static SPA into `.output/public`. The
  static export *is* the default build now, so the separate `build:export` script and the
  `next.config.mjs` `output` toggle were removed; the build is host-agnostic by construction.
- Lint/format gates: confirmed on **oxlint** (`pnpm lint` = `oxlint`) and **oxfmt**
  (`pnpm run format:check`), reading `.oxlintrc.json` — explicitly NOT ESLint / `next lint`
  (there is no ESLint here, and this is not Next.js).
- Typecheck gate: `fumadocs-mdx && tsc --noEmit` (no `next typegen`; TanStack route types come
  from the committed `src/routeTree.gen.ts`).
- Link-check gate: crawl the prerendered static HTML in `.output/public/` (e.g.
  `.output/public/docs/index.html`, plus the `_shell.html` SPA fallback) — the keiki-docs
  `check-links.mjs` precedent and the Next.js `./out` directory no longer apply. Added an
  honest static-SPA coverage caveat (prerendered routes are checked; client-rendered bodies of
  non-prerendered routes are not visible to a static HTML crawler).
- Dropped the remark Markdown-lint gate (MDX correctness is already exercised by the build,
  which compiles every MDX file via `fumadocs-mdx`).
- File-layout references updated from Next.js (`app/`, `next.config.mjs`, `mdx-components.tsx`,
  `lib/source.ts`, `app/api/search/route.ts`) to TanStack Start (`vite.config.ts`, `src/`
  file-based routing, `src/components/mdx.tsx`, `src/lib/source.ts`, `src/routes/api/search.ts`).
- Decision Log: superseded the "build gate is `next build` / `build:export`" decision with
  "build gate is `vite build` → static `.output/public` (already host-agnostic)"; added the
  oxlint-not-ESLint decision and the nitro pin (`3.0.260429-beta`, with CI using
  `--frozen-lockfile`) decision.
- CI workflow steps updated to the five gates (typecheck, lint, format-check, build,
  link-check) over the static-SPA build; fallback runner now invokes oxlint/oxfmt via
  `pnpm dlx`. Frontmatter preserved byte-for-byte. Reason: keep the plan accurate,
  self-contained, and implementable against the pivoted TanStack Start codebase.
