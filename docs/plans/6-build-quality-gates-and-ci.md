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
Markdown/MDX files into a styled Next.js website. ("fumadocs" = a set of npm packages
`fumadocs-core`, `fumadocs-ui`, `fumadocs-mdx` that wire MDX content into the Next.js
App Router. "MDX" = Markdown that can also embed React components. "Next.js" = the React
web framework whose build command is `next build`.) The site documents four Haskell
libraries (kiroku, keiro, keiki, shibuya); the site itself is TypeScript/Next.js and all
code samples shown on the pages are Haskell.

Right now the repository has no way to answer the question "is the docs site healthy?"
automatically. After this plan is implemented, a contributor can run a single command —
`pnpm run check` — locally and get a clear pass/fail across five gates: TypeScript type
checking, code linting, code-format checking, Markdown/MDX link checking, and a full
production build. The exact same gates run automatically in GitHub on every pull request
and every push to the `master` branch through a workflow file at `.github/workflows/ci.yml`,
so a broken link, a type error, or a build failure is caught before it merges. A "gate"
here just means a check that must pass; if any gate fails, the command (and CI) exits
non-zero and the failure is reported.

You can see it working three ways. (1) Locally: `pnpm run check` prints five green
sections and exits 0. (2) Deliberately break something — for example add a Markdown link
to a page that does not exist — and `pnpm run lint:links` exits non-zero and names the bad
link. (3) On GitHub: open a pull request and watch the "CI" check turn green; push a commit
with a type error and watch it turn red with the `tsc` error in the logs.

This plan also extends the Nix development shell (`flake.nix`) so every tool the gates need
is available just by entering the shell, and it records the decision to defer choosing a
hosting provider while keeping the build host-agnostic.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [ ] Milestone 0 — Confirm Plan A landed (package.json, flake.nix, next.config.mjs, content/docs exist).
- [ ] Milestone 1 — Add quality-gate dev dependencies and pnpm scripts to `package.json`.
- [ ] Milestone 2 — Add link-check + Markdown-lint configuration files.
- [ ] Milestone 3 — Add the aggregate `check` script and confirm each gate runs green locally.
- [ ] Milestone 4 — Add the host-agnostic build gate and document the static-export option.
- [ ] Milestone 5 — Extend `flake.nix` dev shell with Node 22, pnpm, gate tools, and the pragmatapro font input.
- [ ] Milestone 6 — Add `.github/workflows/ci.yml` and prove it passes on a sample PR.
- [ ] Milestone 7 — Write the deferred-hosting decision note and a future-deploy-plan stub.


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

(None yet. Candidate items to watch for, recorded in advance so the implementer is not
surprised:)

- The font flake at `/Users/shinzui/Keikaku/bokuno/fonts` has a known casing typo in its
  default attribute name and a version mismatch (built `result/` reports `0.9` while the
  flake declares `0.901`). Handle the input defensively (see Milestone 5); record the exact
  attribute name you had to use here once observed.
- `next build` may print warnings about a missing/empty content tree until Plans D and E
  populate `content/docs/`. A build with only the seed `content/docs/index.mdx` from Plan A
  must still succeed; record the observed output here.


## Decision Log

Record every decision made while working on the plan.

- Decision: Use **pnpm** as the package manager and **Node 22** as the runtime for all
  gates and CI.
  Rationale: The sibling fumadocs site `shibuya-docs` and the sibling
  `keiki-docs` both pin Node 22 via their Nix flakes and use pnpm; matching them keeps the
  family consistent. Plan A (`docs/plans/1-scaffold-the-fumadocs-documentation-app.md`)
  switches this repo's flake from bun to pnpm + Node 22, and this plan builds on that.
  Date: 2026-05-30

- Decision: Lint with **oxlint** and format-check with **oxfmt**, the tools already present
  in the current `flake.nix` dev shell, rather than introducing ESLint/Prettier/Biome.
  Rationale: The repository's existing `flake.nix` already ships `pkgs.oxlint` and
  `pkgs.oxfmt`. `shibuya-docs` ships no lint/format config at all, so there is no sibling
  convention to inherit; reusing the tools already in this repo's shell is the lowest-risk,
  fastest path and avoids a second formatter. oxlint is a fast JavaScript/TypeScript linter;
  oxfmt is its companion formatter. Both run as standalone binaries provided by Nix, so they
  do not need to be npm dependencies. (If the team later prefers ESLint or Biome, swap the
  `lint` / `format:check` scripts; the rest of this plan is unaffected.)
  Date: 2026-05-30

- Decision: The production build gate is the **host-agnostic** `next build`. Do NOT hard-wire
  Vercel, Cloudflare, Netlify, or any other host.
  Rationale: User decision 4 in the master brief defers the hosting provider. `next build`
  produces a standard Next.js build that can be served by `next start` or adapted to any
  host later. The static-export variant (`output: 'export'`) is documented as an option
  (Milestone 4 / the hosting note) but not enabled, because enabling it would impose
  constraints (no server features such as the fumadocs search API route) before a host is
  chosen.
  Date: 2026-05-30

- Decision: Implement link checking with the npm package **`linkinator`** run via
  `pnpm dlx`/a dev dependency over the locally built site, instead of porting keiki-docs's
  bespoke `site/check-links.mjs`.
  Rationale: keiki-docs is a non-fumadocs Vite static-site generator whose `check-links.mjs`
  walks its hand-rolled `site-dist/` HTML output; that script does not apply to a Next.js
  build. `linkinator` is a maintained, well-known broken-link crawler that can crawl a
  running/served site or a directory of HTML and reports broken internal and external links.
  This gives equivalent coverage ("does every link in the docs resolve?") without
  maintaining bespoke code. (See Milestone 2 for the exact invocation and how to keep it
  offline-friendly in CI by limiting it to internal links.)
  Date: 2026-05-30

- Decision: Markdown/MDX content linting uses **`remark`** with
  `remark-preset-lint-recommended` plus `remark-lint-no-dead-urls` is intentionally NOT used
  (network-dependent); link resolution is handled by linkinator instead. remark checks
  Markdown structure (heading levels, list markers, etc.).
  Rationale: remark is the de-facto Markdown linter in the unified/MDX ecosystem fumadocs
  already builds on. Keeping content-structure linting (remark) separate from link
  resolution (linkinator) makes each gate's failures easy to read.
  Date: 2026-05-30

- Decision: CI prefers the **Nix flake dev shell** (`nix develop`) to provide the toolchain;
  if the team prefers a lighter runner, a documented pnpm/Node-22 fallback job is included as
  an alternative in this plan.
  Rationale: Using `nix develop --command` guarantees CI runs the exact tool versions a
  developer gets locally (Node 22, pnpm, oxlint, oxfmt). The fallback uses
  `actions/setup-node@v4` + `pnpm/action-setup@v4` for teams not wanting Nix in CI.
  Date: 2026-05-30


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

(To be filled during and after implementation.)


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
scripts and gates that operate on the fumadocs app Plan A creates. Plan A is what scaffolds
the Next.js + fumadocs site, creates `package.json`, switches `flake.nix` from bun to pnpm +
Node 22, and seeds `content/docs/index.mdx`. This plan has SOFT dependencies on Plans B, C,
D, and E (files `docs/plans/2-...`, `docs/plans/3-...`, `docs/plans/4-...`,
`docs/plans/5-...`). "SOFT dependency" means this plan does not require them; the gates work
on whatever content and customizations exist. You can and should implement this plan
immediately after Plan A, before B/C/D/E exist.

After Plan A, the repository tree relevant to this plan looks like this (paths are
repository-relative):

```text
package.json            # created by Plan A; pnpm scripts dev/build/start; owned by Plan A
flake.nix               # switched to pnpm + Node 22 by Plan A; this plan extends it
flake.lock
.gitignore              # Plan A adds .next, .source, node_modules
next.config.mjs         # createMDX() wrapper around Next config
source.config.ts        # fumadocs-mdx collection config
tsconfig.json           # strict TS, noEmit
postcss.config.mjs
mdx-components.tsx
app/                    # Next.js App Router (layout, docs pages, api/search route)
lib/source.ts
content/docs/           # MDX content; at least index.mdx + meta.json after Plan A
public/                 # static assets
```

The current `flake.nix` (before Plan A switches it) is bun-based and already contains the
two lint/format binaries this plan reuses:

```nix
devShells.default = pkgs.mkShell {
  nativeBuildInputs = [
    pkgs.bun
    pkgs.just
    pkgs.oxlint
    pkgs.oxfmt
    pkgs.typescript
  ];
  # ...
};
```

Plan A replaces `pkgs.bun` with Node 22 + pnpm. This plan (Milestone 5) extends whatever
Plan A leaves, ensuring `pkgs.oxlint`, `pkgs.oxfmt`, Node 22, pnpm/corepack, and the
pragmatapro font input are all present.

Definitions of the gates this plan installs:

- **TypeScript typecheck** — running the TypeScript compiler in check-only mode
  (`tsc --noEmit`) so it reports type errors without producing JavaScript. For fumadocs you
  must first run `fumadocs-mdx` (which generates the `.source/` directory that `tsconfig.json`
  maps the `fumadocs-mdx:collections/*` import alias to) and `next typegen` (which generates
  Next.js route types). Without those, `tsc` reports missing-module errors. This mirrors
  shibuya-docs's own `types:check` script: `fumadocs-mdx && next typegen && tsc --noEmit`.
- **Lint** — running oxlint over the TypeScript/JavaScript source to catch suspicious code.
- **Format check** — running oxfmt in check mode to confirm files are already formatted
  (it fails, rather than rewrites, when something is unformatted).
- **Markdown/MDX lint** — running remark over `content/docs/**` to catch malformed Markdown.
- **Link check** — building the site, serving the output, and crawling it with linkinator to
  confirm no internal link is broken.
- **Build** — running `next build` to produce a production build; this is the strongest
  single signal that the whole site compiles and renders.

Integration-point contract with Plan A (state this identically wherever touched): the files
`package.json` (its `scripts` block) and `flake.nix` (the dev shell) are **owned by Plan A**.
Plan A creates them with the baseline `dev`/`build`/`start` scripts and the pnpm + Node 22
shell. This plan **extends** them additively: it adds gate scripts to `package.json` and adds
gate tools + the font input to `flake.nix`. When implementing, MERGE into the existing
blocks; never replace Plan A's content. If Plan A is not yet merged and you must implement
anyway, create the minimal `package.json`/`flake.nix` shapes shown in this plan and leave a
clear comment so Plan A's later changes merge cleanly.


## Plan of Work

The work is additive and proceeds in seven milestones. Each milestone is independently
verifiable. All commands run from the repository root
`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` unless stated otherwise.


### Milestone 0 — Confirm the foundation (Plan A) is present

Scope: a five-minute sanity check that the fumadocs app exists, so later gates have
something to operate on. At the end you will have confirmed `package.json`, `flake.nix`,
`next.config.mjs`, `tsconfig.json`, and `content/docs/index.mdx` exist.

Run:

```bash
ls package.json flake.nix next.config.mjs tsconfig.json source.config.ts
ls content/docs/index.mdx content/docs/meta.json
```

Acceptance: all files list without error. If `package.json` is missing, Plan A has not been
implemented; either implement Plan A first (`docs/plans/1-scaffold-the-fumadocs-documentation-app.md`)
or, to proceed independently, create the minimal shapes described in this plan's
Interfaces and Dependencies section.


### Milestone 1 — Add gate dev dependencies and pnpm scripts

Scope: add the npm packages the gates need and the per-gate scripts to `package.json`. At
the end, each gate is runnable individually (`pnpm run typecheck`, `pnpm run lint`, etc.),
though linkinator (Milestone 2/3) needs its config and the build needs Milestone 4.

Edit `package.json` (owned by Plan A — merge into the existing `scripts` and
`devDependencies`). Add these scripts to the `scripts` object:

```json
{
  "scripts": {
    "typecheck": "fumadocs-mdx && next typegen && tsc --noEmit",
    "lint": "oxlint .",
    "lint:fix": "oxlint --fix .",
    "format:check": "oxfmt --check .",
    "format": "oxfmt .",
    "lint:md": "remark content/docs --quiet --frail",
    "lint:links": "linkinator ./out --recurse --silent --config linkinator.config.json",
    "check": "pnpm run typecheck && pnpm run lint && pnpm run format:check && pnpm run lint:md && pnpm run build && pnpm run lint:links"
  }
}
```

Notes on each script:

- `typecheck` regenerates fumadocs types (`fumadocs-mdx`), Next route types (`next typegen`),
  then runs `tsc --noEmit`. The first two are required or `tsc` fails on the
  `fumadocs-mdx:collections/*` alias and Next route types.
- `lint`/`format:check` use the oxlint/oxfmt binaries from the Nix shell. They are not npm
  dependencies; they come from `flake.nix` (Milestone 5). If a contributor runs outside the
  Nix shell, document that they must install oxlint/oxfmt or run inside `nix develop`.
- `lint:md` runs remark over `content/docs`. `--frail` makes remark exit non-zero on
  warnings so a Markdown problem fails the gate. `--quiet` suppresses success noise.
- `lint:links` crawls the **built** site. The build script (Milestone 4) emits static HTML
  into `./out`; linkinator crawls that directory. `--recurse` follows internal links;
  `--silent` keeps output to failures; the config file (Milestone 2) restricts checking to
  internal links so CI does not depend on the public internet.
- `check` is the aggregate gate, ordered cheap-to-expensive: type → lint → format → markdown
  → build → links. The build must come before `lint:links` because linkinator needs the
  build output.

Add these to `devDependencies` (merge):

```json
{
  "devDependencies": {
    "linkinator": "^6.1.2",
    "remark-cli": "^12.0.1",
    "remark-preset-lint-recommended": "^7.0.1"
  }
}
```

(`remark-cli` provides the `remark` command; the preset is the rule set.)

Install:

```bash
pnpm install
```

Acceptance: `pnpm install` completes and `pnpm run typecheck` runs (it should pass if Plan A
left a clean tree). `pnpm run lint` and `pnpm run format:check` run (inside `nix develop` so
oxlint/oxfmt are on PATH). `pnpm run lint:md` runs over `content/docs`.


### Milestone 2 — Add link-check and Markdown-lint configuration

Scope: two small config files so the link checker stays offline-friendly and remark uses the
recommended rule set. At the end, `linkinator` and `remark` have explicit configuration.

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
deterministic and offline. (If the team later wants external-link checking, add a separate
non-blocking job; do not block merges on third-party uptime.)

Create `.remarkrc.json` at the repository root:

```json
{
  "plugins": [
    "remark-preset-lint-recommended"
  ]
}
```

Create `.remarkignore` at the repository root so remark does not lint generated or vendored
Markdown:

```text
node_modules
.next
.source
out
```

Acceptance: `pnpm run lint:md` reports either nothing (clean) or specific structural
warnings; `pnpm run lint:links` (after Milestone 4's build) checks only relative links.


### Milestone 3 — Make every gate green locally

Scope: run each gate, fix any issues in config (not in product code unless trivially this
plan's own files), and confirm `pnpm run check` passes end to end. At the end, a developer
in the Nix shell can run one command to validate the whole site.

Run inside the Nix shell so oxlint/oxfmt are available:

```bash
nix develop --command pnpm run typecheck
nix develop --command pnpm run lint
nix develop --command pnpm run format:check
nix develop --command pnpm run lint:md
```

If `format:check` fails because Plan A's files are unformatted, run `nix develop --command
pnpm run format` once to format them, review the diff, and commit it. If `lint` reports
issues in Plan A's scaffolding, prefer fixing them in a focused commit; if a rule is noisy
for generated files, add an oxlint ignore for `.source/`, `.next/`, and `out/` (oxlint reads
`.oxlintrc.json`):

Create `.oxlintrc.json` at the repository root:

```json
{
  "ignorePatterns": [
    "node_modules",
    ".next",
    ".source",
    "out"
  ]
}
```

Acceptance: each individual gate exits 0. (The aggregate `check` also runs the build and
links; those are validated in Milestone 4.)


### Milestone 4 — Host-agnostic build gate + documented static-export option

Scope: ensure `pnpm run build` produces output the link checker can crawl, while keeping the
build host-agnostic. At the end, `pnpm run build` succeeds and `pnpm run lint:links` crawls
the result; the static-export option is documented but not enabled by default.

Background: Plan A defines `build` as `next build`. A plain `next build` produces a
server-capable build (it keeps the fumadocs search API route at `app/api/search/route.ts`).
That build does not by itself emit a static directory linkinator can crawl. There are two
clean ways to give linkinator something to crawl without committing to a host:

Option 1 (recommended default) — crawl a running server. Build, start `next start` on a
port, and point linkinator at the URL. This preserves all server features. Use this when you
want maximum fidelity.

Option 2 (simplest for CI) — produce a static export into `./out` for link checking only.
Next.js can statically export a site when `output: 'export'` is set, which writes plain HTML
into `out/`. This is exactly the kind of static output `keiki-docs` checks in as its
`site-dist/` directory (its build writes static HTML, then a link checker crawls it). The
difference: keiki-docs commits `site-dist/`; we generate `out/` transiently in CI and
gitignore it.

To keep the default build host-agnostic AND give linkinator a directory, add a dedicated
export script rather than changing the main `build`. Update `package.json` scripts (merge):

```json
{
  "scripts": {
    "build": "next build",
    "build:export": "NEXT_OUTPUT=export next build",
    "lint:links": "linkinator ./out --recurse --silent --config linkinator.config.json"
  }
}
```

Then make `next.config.mjs` honour the `NEXT_OUTPUT` environment variable so a static export
is opt-in and the default `next build` stays server-capable and host-agnostic. Edit
`next.config.mjs` (owned by Plan A — merge the `output` line into the existing config object):

```js
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Host-agnostic by default. Set NEXT_OUTPUT=export to emit a static ./out
  // directory for offline link checking (see docs/plans/6-build-quality-gates-and-ci.md).
  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : undefined,
};

export default withMDX(config);
```

Important caveat to record: static export (`output: 'export'`) cannot include the dynamic
search API route at `app/api/search/route.ts`. fumadocs supports a static search mode for
exported sites; if a static export errors on that route, either (a) use Option 1 (serve
`next start` and crawl the URL) for link checking, or (b) configure fumadocs static search
per its docs. The plain `pnpm run build` (no `NEXT_OUTPUT`) is unaffected and remains the
canonical build gate. Record in Surprises & Discoveries which option you used.

Update `.gitignore` to ignore the export directory (it should already ignore `.next` and
`.source` from Plan A; add `out` if missing):

```text
out
```

Optionally wire the fumadocs search index: shibuya-docs builds its search index implicitly
through the `app/api/search/route.ts` route created by Plan A (`createFromSource`). No extra
gate is required for search to work in a server build. Only if a static export is adopted as
the deploy target later would a static search index need to be generated; that belongs to a
future deploy plan (see Milestone 7), not here.

Run and verify:

```bash
nix develop --command pnpm run build
nix develop --command pnpm run build:export
nix develop --command pnpm run lint:links
```

Acceptance: `pnpm run build` exits 0 and prints the Next.js build summary;
`pnpm run build:export` produces an `out/` directory; `pnpm run lint:links` crawls `out/`
and reports `0 broken` for internal links. Finally confirm the aggregate:

```bash
nix develop --command bash -c "pnpm run typecheck && pnpm run lint && pnpm run format:check && pnpm run lint:md && pnpm run build:export && pnpm run lint:links"
```

(Use `build:export` in the aggregate so `lint:links` has the `out/` directory. If you prefer
Option 1, replace the `build:export && lint:links` tail with a serve-and-crawl step.)


### Milestone 5 — Extend the Nix dev shell

Scope: make every gate tool available simply by entering `nix develop`, and add the
pragmatapro font flake input so the font is available locally (used by Plan B; added here so
the shell is complete). At the end, a fresh clone + `nix develop` yields Node 22, pnpm
(via corepack), oxlint, oxfmt, and the font package.

This file is owned by Plan A. Plan A switches the dev shell from bun to Node 22 + pnpm. This
milestone MERGES the additions below into whatever Plan A leaves. The shibuya-docs sibling
flake uses `nodejs_22` + corepack + pnpm; mirror that. Here is the full intended `flake.nix`
after both Plan A's switch and this plan's additions (use as the merge target):

```nix
{
  description = "Docs for keiro runtime";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  # Added by this plan (Plan F): the PragmataPro font package, consumed by Plan B.
  # The font flake has a known default-attr casing quirk and a version-string mismatch
  # (built result reports 0.9 while the flake declares 0.901). We consume it defensively:
  # do not assume `packages.<system>.default`; reference the package by its actual attr
  # name once `nix flake show /Users/shinzui/Keikaku/bokuno/fonts` reveals it.
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
        checks = {
        };

        devShells.default = pkgs.mkShell {
          nativeBuildInputs = [
            pkgs.nodejs_22      # Node 22 (Plan A)
            pkgs.corepack_22    # provides pnpm pinned to Node 22 (Plan A)
            pkgs.just
            pkgs.oxlint         # lint gate (Plan F)
            pkgs.oxfmt          # format gate (Plan F)
            pkgs.typescript
            pkgs.linkinator     # link-check gate; if absent in nixpkgs, rely on the
                                # devDependency instead and drop this line
          ] ++ (if fontPkg != null then [ fontPkg ] else [ ]);

          shellHook = ''
            export LANG=en_US.UTF-8
            corepack enable >/dev/null 2>&1 || true

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
  devDependency from Milestone 1 covers it (run via `pnpm run lint:links`). Record which
  path you used in Surprises & Discoveries.
- The font input is added here so the dev shell is complete and Plan B can consume
  `fontPkg`. If Plan B already added the input, do not duplicate it — merge.
- After editing, the `flake.lock` will update; commit it.

Run and verify:

```bash
nix flake show path:/Users/shinzui/Keikaku/bokuno/fonts
nix develop --command bash -c 'node --version && pnpm --version && oxlint --version && oxfmt --version'
```

Acceptance: `nix flake show` reveals the font package's real attribute name (update
`fontPkg` if needed); `node --version` prints `v22.*`; `pnpm --version` prints a version;
`oxlint`/`oxfmt` print versions.


### Milestone 6 — Add the GitHub Actions CI workflow

Scope: create `.github/workflows/ci.yml` so the gates run automatically on every pull
request and every push to `master`. At the end, opening a PR shows a "CI" check that runs
typecheck, lint, format-check, markdown-lint, build, and link-check, and turns green when
all pass. There is currently NO `.github/` directory in the repository; you are creating it.

Create the directory and file:

```bash
mkdir -p .github/workflows
```

Write `.github/workflows/ci.yml`. This is the **preferred** version using the Nix flake dev
shell so CI runs the exact tool versions developers use:

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
        run: nix develop --command pnpm run lint

      - name: Format check
        run: nix develop --command pnpm run format:check

      - name: Markdown lint
        run: nix develop --command pnpm run lint:md

      - name: Build (static export for link checking)
        run: nix develop --command pnpm run build:export

      - name: Link check
        run: nix develop --command pnpm run lint:links
```

If the team prefers NOT to run Nix in CI, use this **fallback** workflow instead (same gates,
plain pnpm/Node 22; note oxlint/oxfmt must then be installed as npm devDependencies or via
`pnpm dlx`, since they are otherwise only provided by the Nix shell):

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
        run: pnpm run lint

      - name: Format check
        run: pnpm run format:check

      - name: Markdown lint
        run: pnpm run lint:md

      - name: Build (static export for link checking)
        run: pnpm run build:export

      - name: Link check
        run: pnpm run lint:links
```

(If you choose the fallback, add oxlint and oxfmt to `devDependencies` in `package.json` — for
example `"oxlint": "^0.15.0"` — or replace the `lint`/`format:check` scripts with
`pnpm dlx oxlint .` / `pnpm dlx oxfmt --check .`. Record the choice in the Decision Log.)

Commit both the workflow and any `package.json` adjustments together.

Acceptance: pushing this to a branch and opening a PR against `master` triggers the CI check;
each step appears as its own line in the GitHub Actions log; the job turns green when all
gates pass.


### Milestone 7 — Document the deferred hosting decision

Scope: record, in this plan, that hosting is intentionally deferred and what a future deploy
plan would add. At the end, the plan unambiguously explains the host-agnostic stance and the
follow-on work. This milestone is documentation only.

Add the content already captured in the Decision Log (host-agnostic `next build`, static
export opt-in) and the following forward-looking note to the Validation/Interfaces sections.
The future deploy plan (not part of this plan) would:

1. Choose a host (e.g. Vercel, Cloudflare Pages, Netlify, GitHub Pages, or self-hosted
   `next start`).
2. If the host is static-only (GitHub Pages / Cloudflare Pages static), commit to
   `output: 'export'` permanently and configure fumadocs **static search** (the dynamic
   `app/api/search/route.ts` route cannot run on a static host).
3. Add a deploy job to a separate workflow (e.g. `.github/workflows/deploy.yml`) gated on the
   `master` branch and on the `CI` workflow passing, publishing the build artifact to the
   chosen host.
4. Set any host-specific config (base path for project-pages hosting, environment variables,
   CDN cache headers).

Acceptance: this section exists and a reader understands why no host is wired and what the
next plan must do.


## Concrete Steps

All commands run from `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`. Where oxlint/oxfmt
are needed, prefix with `nix develop --command` so they are on PATH.

Step 1 — confirm foundation:

```bash
ls package.json flake.nix next.config.mjs tsconfig.json source.config.ts content/docs/index.mdx
```

Expected (abbreviated):

```text
content/docs/index.mdx  flake.nix  next.config.mjs  package.json  source.config.ts  tsconfig.json
```

Step 2 — add scripts + dev deps to `package.json` (Milestone 1), then install:

```bash
pnpm install
```

Expected tail:

```text
Done in 12.3s using pnpm 9.x
```

Step 3 — create `linkinator.config.json`, `.remarkrc.json`, `.remarkignore`,
`.oxlintrc.json` (Milestones 2–3).

Step 4 — run each gate (Milestone 3):

```bash
nix develop --command pnpm run typecheck
nix develop --command pnpm run lint
nix develop --command pnpm run format:check
nix develop --command pnpm run lint:md
```

Expected (typecheck, abbreviated):

```text
> next typegen
> tsc --noEmit
(no output, exit 0)
```

Step 5 — wire the build + export + link check (Milestone 4) and run:

```bash
nix develop --command pnpm run build:export
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
9.12.0
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
git add package.json flake.nix flake.lock linkinator.config.json .remarkrc.json .remarkignore .oxlintrc.json next.config.mjs .gitignore .github/workflows/ci.yml docs/plans/6-build-quality-gates-and-ci.md
git commit -m "chore(ci): add quality gates, host-agnostic build, and CI workflow

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
   && pnpm run lint && pnpm run format:check && pnpm run lint:md && pnpm run build:export &&
   pnpm run lint:links"`. Output: exit code 0; the link-check prints `0 broken`. Verify exit
   code with `echo $?` → `0`.

2. The link gate actually catches broken links. Input: add a deliberately broken relative
   link to `content/docs/index.mdx`, e.g. `[broken](/docs/this-page-does-not-exist)`, then
   run `pnpm run build:export && pnpm run lint:links`. Output: linkinator exits non-zero and
   names the broken URL. Then remove the bad link and confirm the gate returns to green.
   This proves the gate is not a no-op.

3. The typecheck gate catches type errors. Input: introduce a type error (e.g. assign a
   `string` to a `number` in any `.ts` file), run `pnpm run typecheck`. Output: `tsc` exits
   non-zero with the error and file/line. Revert and confirm green.

4. The build gate catches build breakage. Input: introduce a syntax error in a `.tsx`
   component, run `pnpm run build`. Output: `next build` fails with the error. Revert and
   confirm green.

5. CI runs the same gates on a PR. Input: open a PR against `master`. Output: the GitHub
   Actions `CI` job runs all six steps and turns green. Push a commit with a type error and
   the `Typecheck` step turns red with the `tsc` error visible in the step log; fix it and
   the check goes green on the next push.

6. The dev shell is complete. Input: in a fresh checkout, run `nix develop --command bash -c
   'node --version && pnpm --version && oxlint --version && oxfmt --version'`. Output: Node
   prints `v22.*` and the other three print versions, proving the shell provides the whole
   toolchain.

Acceptance is the conjunction of 1–6: every gate is real (fails on bad input, passes on good
input), runs locally via `pnpm run check`, and runs in CI on PRs and pushes to `master`.


## Idempotence and Recovery

All steps are safe to repeat. `pnpm install` is idempotent. Re-running any gate has no side
effects except `pnpm run format` (which rewrites files) — prefer `pnpm run format:check`
(read-only) in gates and CI; only run `pnpm run format` intentionally and review the diff.
`pnpm run build` / `build:export` overwrite `.next/` and `out/`, both gitignored, so
rebuilding is harmless; delete them to recover from a corrupted build:

```bash
rm -rf .next out .source
nix develop --command pnpm run build:export
```

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
  `shibuya-docs` and `keiki-docs`; provided by `flake.nix` via `pkgs.nodejs_22` +
  `pkgs.corepack_22`. Owned by Plan A (`docs/plans/1-scaffold-the-fumadocs-documentation-app.md`).
- **TypeScript `tsc`** with `fumadocs-mdx` + `next typegen` — the typecheck gate. fumadocs
  requires the generated `.source/` (mapped by `tsconfig.json`'s `fumadocs-mdx:collections/*`
  alias) and Next route types before `tsc --noEmit` can succeed.
- **oxlint** / **oxfmt** — lint and format-check gates, provided by `flake.nix`
  (`pkgs.oxlint`, `pkgs.oxfmt`), already present in the current shell. Config:
  `.oxlintrc.json`.
- **remark-cli** + **remark-preset-lint-recommended** (npm devDependencies) — Markdown/MDX
  structure lint over `content/docs`. Config: `.remarkrc.json`, ignore: `.remarkignore`.
- **linkinator** (npm devDependency, optionally also a Nix package) — internal link checker
  over the built `./out` directory. Config: `linkinator.config.json` (skips external
  `http(s)` links to stay deterministic/offline).
- **Next.js `next build`** — the host-agnostic build gate; `next build` with
  `NEXT_OUTPUT=export` (via `next.config.mjs`'s `output`) emits a static `./out` for the link
  checker. Default build stays server-capable; no host is hard-wired.
- **GitHub Actions** — runs all gates on `pull_request` and `push` to `master` via
  `.github/workflows/ci.yml`. Preferred runner uses `DeterminateSystems/nix-installer-action`
  + the flake dev shell; documented fallback uses `pnpm/action-setup@v4` +
  `actions/setup-node@v4` (Node 22).

Files this plan creates or extends, with ownership:

- `package.json` — OWNED BY Plan A; this plan MERGES gate scripts (`typecheck`, `lint`,
  `lint:fix`, `format`, `format:check`, `lint:md`, `lint:links`, `build:export`, `check`) and
  devDependencies (`linkinator`, `remark-cli`, `remark-preset-lint-recommended`).
- `flake.nix` — OWNED BY Plan A; this plan MERGES gate tools (oxlint, oxfmt, optionally
  linkinator) and the `pragmatapro` font input + `fontPkg` selection. Updates `flake.lock`.
- `next.config.mjs` — OWNED BY Plan A; this plan MERGES the `output` line for opt-in static
  export.
- `.gitignore` — OWNED BY Plan A; this plan ensures `out` is ignored.
- `linkinator.config.json`, `.remarkrc.json`, `.remarkignore`, `.oxlintrc.json` — NEW, owned
  by this plan.
- `.github/workflows/ci.yml` — NEW, owned by this plan. There is no `.github/` directory
  before this plan.

Function/script signatures that must exist at the end:

- `pnpm run typecheck` → runs `fumadocs-mdx && next typegen && tsc --noEmit`; exit 0 on
  clean.
- `pnpm run lint` / `pnpm run format:check` → oxlint / oxfmt in check mode; exit 0 on clean.
- `pnpm run lint:md` → `remark content/docs --quiet --frail`; exit 0 on clean.
- `pnpm run build` → `next build` (host-agnostic); exit 0 on success.
- `pnpm run build:export` → static export into `out/`.
- `pnpm run lint:links` → `linkinator ./out ...`; prints `0 broken`; exit 0 on clean.
- `pnpm run check` → all of the above chained; the single local entry point.

Integration-point contract restated (identical wording wherever this appears): `package.json`
scripts and the `flake.nix` dev shell are owned by Plan A and extended (never replaced) by
this plan; merge additively.


## Revision Note

2026-05-30 — Initial full authoring from the skeleton. Fleshed out every section for
Plan F (Build, quality gates & CI): purpose, seven milestones, concrete commands with
expected output, full `.github/workflows/ci.yml` (preferred Nix-flake version + pnpm/Node-22
fallback), `package.json` gate scripts, link-check/markdown/oxlint config files, `flake.nix`
additions (Node 22, pnpm/corepack, oxlint, oxfmt, pragmatapro font input handled
defensively), the host-agnostic build decision with an opt-in static-export option
referencing keiki-docs's static `site-dist` precedent, and the deferred-hosting decision plus
a future-deploy-plan stub. Frontmatter preserved byte-for-byte. Reason: convert the skeleton
into a self-contained, novice-implementable ExecPlan per
`agents/skills/exec-plan/PLANS.md`.
