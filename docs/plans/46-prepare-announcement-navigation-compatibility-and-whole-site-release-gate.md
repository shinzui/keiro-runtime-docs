---
id: 46
slug: prepare-announcement-navigation-compatibility-and-whole-site-release-gate
title: "Prepare announcement navigation compatibility and whole-site release gate"
kind: exec-plan
created_at: 2026-07-14T15:14:32Z
intention: "intention_01kxgjsgnse1z9r0w141akd9g2"
master_plan: "docs/masterplans/6-prepare-keiro-runtime-documentation-for-wider-announcement.md"
---

# Prepare announcement navigation compatibility and whole-site release gate

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, the documentation site is ready to be linked from a wider public announcement.
New readers can understand the runtime family, choose packages, find compatible release lines,
follow installation and upgrade paths, and distinguish production-supported contracts from the
example application that still awaits modernization. Every domain page is reachable from
navigation, every source-backed tree records its reviewed commit, stale API claims are either
removed or explicitly historical, and one whole-site command proves types, formatting, build, links,
and navigation integrity.


## Progress

- [x] (2026-07-14T19:29:05Z) Milestone 1: build the announcement-facing discovery and
  compatibility path.
- [x] (2026-07-14T19:36:25Z) Milestone 2: reconcile integrations and
  example-status language.
- [x] (2026-07-14T19:41:48Z) Milestone 3: update repository metadata and source
  ledgers.
- [ ] Milestone 4: establish and run the whole-site release gate. The automated gate is complete;
  the required manual preview remains pending after three browser-backed attempts all found no
  available browser backend.

## Surprises & Discoveries

- `shibuya-message-db-adapter 0.1.0.0` remains bounded to `shibuya-core ^>=0.5.0.0`; it is not a
  compatible member of the current 0.8 adapter set. Its behavior documentation remains source-backed
  at the unchanged reviewed commit, but announcement pages must label the release-line mismatch
  rather than imply it can be selected alongside Shibuya 0.8.
- Every final child-plan SHA still equals its upstream `HEAD`. Keiro has only the previously excluded
  untracked `mori.automation.dhall`; Message DB has only the user's existing `mori.dhall` edit. Both
  remain outside the evidence boundary and untouched.
- The first navigation-coverage run found two root-level pages that Fumadocs built but
  `content/docs/meta.json` omitted: `diagram-demo.mdx` and `ligature-check.mdx`. Registering both made
  the metadata inventory complete at 62 metadata files and 506 pages.
- The stale-claim audit found two forms of current-tense drift: four Keiki pages still pinned their
  source notes to 0.1/`344c4ca`, and two Keiro/PGMQ pages taught Shibuya's old public
  `Ingested -> AckDecision` handler shape. They now use Keiki 0.2/`ce5748b` and
  `Message -> AckDecision`. Remaining scan matches are explicit removed-API notes, predecessor
  history imports, physical Keiro table names, or the deliberately excluded example subtree.
- The in-app browser runtime reported no available browser backend after its required setup and
  troubleshooting checks. Automated prerendering and search-index generation succeed, but the plan's
  manual sidebar/search/component inspection cannot be claimed until a browser is available.
- A continuation attempt at 2026-07-14T19:56:58Z repeated the complete browser setup and required
  troubleshooting flow; browser discovery again returned an empty list. The accompanying completion
  audit reconfirmed all prerequisite plans closed, all nine upstream HEADs equal their ledgers, the
  two excluded dirty upstream files unchanged, and no initiative diff under `content/docs/example-app/`
  or `docs/keiro-runtime-jitsurei-source-sync.md`.
- A third browser-backed attempt at 2026-07-14T20:00:07Z started the healthy Vite preview, repeated
  the required setup and troubleshooting flow, and again returned an empty browser inventory. The
  rendered acceptance check is blocked on external browser availability; no repository change can
  substitute for the required direct sidebar, search, and component inspection.


## Decision Log

- Decision: Make this plan hard-dependent on child plans 40 through 45.
  Rationale: Announcement-facing summaries and source pointers can only be accurate after every
  domain tree and the new pg-migrate section are complete.
  Date: 2026-07-14
- Decision: Add a visible pending-modernization note for keiro-runtime-jitsurei without editing
  `content/docs/example-app/` or advancing its source pointer.
  Rationale: The user explicitly excluded the stale example repository, but wider-announcement
  readers must not mistake it for current release validation.
  Date: 2026-07-14
- Decision: Add a repeatable navigation coverage check to the repository quality gate if no
  equivalent check exists at implementation time.
  Rationale: A large documentation sweep can build successfully while leaving pages orphaned from
  `meta.json`; announcement readiness requires discoverability as well as compilation.
  Date: 2026-07-14
- Decision: Advance source pointers only after reviewing each child plan's recorded SHA and final
  page inventory.
  Rationale: A pointer claims the whole documented surface was reviewed, so it must not be bumped
  merely because one child plan touched part of a tree.
  Date: 2026-07-14


## Outcomes & Retrospective

- Milestone 1 rebuilt the landing and onboarding path around five runtime libraries plus pg-migrate,
  with direct choose → compatibility → installation routes. The compatibility page records exact
  package releases and source SHAs, current adapter pairings, breaking source changes, database
  cutover order, pre-1.0 stability limits, the Message DB/Shibuya mismatch, and the excluded example
  status. Typecheck, formatting, production build, whitespace checks, and the 506-file internal-link
  scan pass.
- Milestone 2 reconciled every integration page and product landing around current package lines,
  schema ownership, and adapter failure boundaries. The integrations path now distinguishes the
  three Shibuya 0.8 pairings from the Message DB adapter's 0.5-core bound, and the legacy jitsurei
  page is an explicit architecture/status route rather than a runnable release claim. All positive
  `just jitsurei-*` and `cabal run jitsurei` instructions were removed from announcement-reachable
  Keiro paths; `content/docs/example-app/` and its source pointer remain unchanged. The existing
  whole-site check passes with four pre-existing lint warnings, a production chunk-size warning,
  and 506 source files with no broken internal links.
- Milestone 3 registered `shinzui/pg-migrate` and the local pg-migrate documentation tree in
  `mori.dhall`, and updated the README's product map, layout, and example status. A new pg-migrate
  source ledger records the clean 1.1.0.0 boundary, while the Keiki, Keiro, Kiroku, pgmq-hs,
  Shibuya, and adapter ledgers now record the exact final reviewed SHAs and concise source-backed
  range summaries. The jitsurei pointer remains byte-for-byte unchanged. `mori show --full`
  resolves all seven dependencies and ten local documentation references; formatting and whitespace
  checks pass.
- Milestone 4's automated release gate is implemented and green. `pnpm check` now verifies types,
  lint, formatting, navigation metadata, the production build, and links; navigation covers 62
  metadata files and all 506 pages, and the internal-link scan reports no broken links. The run has
  the same four pre-existing lint warnings plus the existing production chunk-size warning.
  `git diff --check` is clean and `mori show --full` resolves seven dependencies and ten docs. The
  milestone remains open solely for the required rendered preview and six-product search check.
- The continuation audit reran the exact current-tree gate successfully: navigation still covers 62
  metadata files and 506 pages, internal links remain unbroken, source pointers still match current
  upstream commits, and the repository worktree remains clean. This strengthens every non-visual
  acceptance claim but does not substitute for the outstanding rendered preview.
- The third preview attempt reproduced the same empty browser inventory while the development
  server was healthy. Milestone 4 remains open, and further progress requires a browser backend to
  become available so the direct rendered checks can be completed.


## Context and Orientation

The site root is `content/docs/index.mdx`; top-level navigation is
`content/docs/meta.json`. Onboarding is under `content/docs/getting-started/`, library integration
guides are under `content/docs/integrations/`, and the product trees are keiki, keiro, kiroku,
shibuya, pgmq, and—after EP-5—pg-migrate. Each directory's `meta.json` lists pages in sidebar order.
The app is built by Fumadocs/TanStack Start with commands in `package.json`; `pnpm check` currently
runs type generation/checking, lint, formatting, static build, and source/built link checks.

Repository identity and documented dependencies live in `mori.dhall`. It currently describes five
runtime libraries and a worked example, declares six source dependencies but not pg-migrate, and
exposes documentation references through `mori show --full`. `README.md` repeats the product map,
authoring conventions, and quality commands. Both must be reconciled with the final site without
claiming that the excluded example app is current.

Source-sync pointer files under `docs/` are review ledgers, not generated API docs. The child plans
must hand off their exact committed source boundaries. The planned boundaries are keiki `ce5748b`,
keiro `87bf3ff`, pg-migrate `f39d64e`, Kiroku `58aff77`, pgmq-hs `8439385`, Shibuya `172df24`,
Shibuya PGMQ adapter `85931b4`, Kafka adapter `65111ae`, and Message DB adapter `4307255`. Recheck
them at implementation time and use child Outcomes/Surprises to decide whether later committed
drift was included. Upstream uncommitted state is never part of a pointer.

`docs/keiro-runtime-jitsurei-source-sync.md` and `content/docs/example-app/` represent an older
example application. They remain untouched in this initiative. Announcement-facing pages that
link to them must add a clear pending-upgrade note and must not call their builds or scenarios proof
of the current 0.2/0.3/1.1 package set.

The current quality gate checks links but does not clearly guarantee that every content page occurs
exactly once in its nearest navigation metadata. Before adding a script, inspect
`scripts/check-doc-links.mjs`, `source.config.ts`, and the generated source behavior. If no
equivalent exists, add `scripts/check-doc-navigation.mjs`, a read-only check that ignores
`content/docs/_templates/`, validates each `meta.json` entry resolves, reports duplicate entries,
and reports non-index MDX pages omitted from the nearest metadata file. Wire it to `package.json`
and `pnpm check`.


## Plan of Work

Milestone 1 builds the announcement-facing discovery and compatibility path. Rewrite
`content/docs/index.mdx`, `content/docs/getting-started/index.mdx`,
`getting-started/the-keiro-family.mdx`, `getting-started/choosing-a-library.mdx`, and
`getting-started/installation.mdx` to represent the final product map, current package roles, and
the new pg-migrate section. Add `content/docs/getting-started/compatibility-and-upgrades.mdx` and
register it in `getting-started/meta.json`. This page owns the tested/reviewed release matrix,
breaking-upgrade order, migration-engine cutover links, and a plain statement of what remains early
or pending. It must avoid promising stability beyond upstream release notes. Acceptance is that a
new reader can choose a starting package and reach a current install, migration, and upgrade path in
two navigation steps.

Milestone 2 reconciles integration and example-status language. Review every page under
`content/docs/integrations/`, plus keiro/keiki/kiroku/shibuya/pgmq/pg-migrate landing and index
pages, for naming, versions, component ownership, failure terminology, and links. Add a consistent
pending-modernization callout wherever announcement paths point to `content/docs/example-app/` or
describe keiro-runtime-jitsurei as current. Do not edit that subtree. Reconcile
`content/docs/meta.json` ordering and all nearest metadata files. Acceptance is that product and
integration cards lead to current docs while the stale example remains accessible but explicitly
not release evidence.

Milestone 3 updates repository metadata and source ledgers. Add `shinzui/pg-migrate` to
`mori.dhall` dependencies and add a pg-migrate documentation reference; update the project
description and `README.md` product/layout sections. Create `docs/pg-migrate-source-sync.md` with
the same review-pointer structure as other source-backed trees. Update the keiki, keiro, Kiroku,
pgmq-hs, Shibuya, and adapter pointer files from child-plan evidence, retaining previous pointers
and concise source-backed range summaries. Leave the jitsurei pointer unchanged. Run
`mori show --full` and ensure it resolves every declared dependency and doc path. Acceptance is one
reproducible committed SHA per reviewed tree and no pointer that includes upstream working-tree
changes.

Milestone 4 establishes and runs the release gate. Inspect existing scripts; implement the
navigation coverage script described in Context only if needed, add a `lint:nav` or equivalent
package command, and include it in `pnpm check`. Run scoped stale-claim scans for removed keiki
Decider APIs, old Codd/hasql-migration runners, old keiro schema locations, old Shibuya handler/app
APIs, removed PGMQ migration calls, and old DSL syntax. Historical/import explanations may be
allow-listed with a reason. Run the full site gate, inspect the built navigation/search manually in
the local preview, and record warnings versus failures. Acceptance is a clean gate, complete
navigation, working search for each product, and no unqualified current-tense stale API claim.


## Concrete Steps

Work from `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`. First verify every child is complete in
the MasterPlan registry and read each child plan's Outcomes, Surprises, and recorded source SHA.
Then inspect repository state and metadata:

```bash
git status --short
mori show --full
sed -n '1,260p' mori.dhall
sed -n '1,260p' package.json
sed -n '1,320p' scripts/check-doc-links.mjs
rg --files content/docs | sort
```

Re-resolve source boundaries before pointer edits:

```bash
mori registry show shinzui/keiki --full
mori registry show shinzui/keiro --full
mori registry show shinzui/pg-migrate --full
mori registry show shinzui/kiroku --full
mori registry show shinzui/pgmq-hs --full
mori registry show shinzui/shibuya --full
mori registry show shinzui/shibuya-pgmq-adapter --full
mori registry show shinzui/shibuya-kafka-adapter --full
mori registry show shinzui/shibuya-message-db-adapter --full
```

For each path, run `git status --short`, `git rev-parse HEAD`, and compare the reviewed range. Never
advance a pointer to dirty content. Run focused stale scans, treating matches as an audit list rather
than blindly deleting historical context:

```bash
rg -n 'Keiki\.Decider|toDecider|/docs/keiki/reference/decider' content/docs
rg -n 'CoddSettings|runKeiroMigrations|runAllKeiroMigrations|KEIRO_MIGRATE_NO_CHECK|CODD_' content/docs
rg -n 'hasql-migration tracks|pgmq.*\b(migrate|upgrade|validate)\b|getMigrations' content/docs
rg -n 'handler.*Ingested|runApp[[:space:]]+IgnoreFailures|saga .*stream=' content/docs
rg -n 'keiro_(snapshots|timers|outbox|inbox)' content/docs/keiro content/docs/integrations
```

Run the complete gate after edits:

```bash
pnpm run check
git diff --check
mori show --full
```

Expected completion is:

```text
Type generation and TypeScript checking pass.
Lint and formatting checks pass, apart from any explicitly recorded pre-existing warnings.
Static build completes.
Source and built link checks report no broken links.
Navigation coverage reports no missing, duplicate, or invalid page entry.
git diff --check emits no output.
mori show --full lists pg-migrate and all local documentation references.
```

For a manual content check, run `pnpm dev`, open the URL Vite prints, and inspect the landing page,
compatibility page, pg-migrate section, representative source walkthroughs, search results, and the
jitsurei pending-upgrade callout. Stop the server normally after inspection.


## Validation and Acceptance

The site is announcement-ready when a first-time reader can answer from the landing/onboarding path:
what each package does; which package to install first; how pg-migrate relates to runtime schemas;
which current release lines the prose reviewed; which changes are breaking; how to reach production
operations; and why the bundled example is not yet current evidence.

Every MDX page outside `_templates` and the explicitly handled index convention must be reachable
exactly once from its nearest metadata file. Every source-sync pointer must name an exact full SHA,
date, range summary, and mori-qualified project. The new pg-migrate pointer must record 1.1.0.0 and
the complete docs pass. The jitsurei pointer and subtree must have no diff from this initiative.

Stale scans are accepted only when every remaining match is either a conceptual comparison, a
predecessor-history import instruction, or an explicit upgrade note, and that context is clear on
the same page. Current setup/tutorial/reference pages must use the new APIs. `pnpm run check`, the
navigation check, `git diff --check`, and `mori show --full` must succeed. The manual preview must
show working sidebars, search hits for keiki/keiro/kiroku/shibuya/pgmq/pg-migrate, and no visibly
broken MDX component or diagram.


## Idempotence and Recovery

All checks and metadata reads are repeatable. The navigation checker must be read-only. Preserve
unrelated user changes and never clean upstream dirty trees. Update pointers last so an interrupted
implementation cannot claim an incomplete review. If final validation exposes a domain error,
return ownership to the appropriate child plan, update its living sections, fix the domain page,
then rerun this full reconciliation. Do not work around a broken link by hiding a valid page.


## Interfaces and Dependencies

Hard dependencies are plans 40 through 45, referenced by their paths in the MasterPlan registry.
This plan consumes their final page inventories, terminology, versions, and SHAs. It owns shared
files: `content/docs/index.mdx`, `content/docs/meta.json`, `content/docs/getting-started/`,
`content/docs/integrations/`, `README.md`, `mori.dhall`, `package.json`, any navigation-check script,
and every source-sync pointer.

The site interfaces are Fumadocs MDX, nearest-directory `meta.json` navigation, TanStack static
build output, the source link checker, and mori's project/doc registry. No upstream production API
changes are authorized. The completed coordination interface is a single `pnpm run check` quality
gate and a consistent public discovery path over all completed domain docs.


## Revision Note

2026-07-14T20:00:07Z — Recorded the third consecutive unavailable-browser result and the resulting
external blocker. Milestone 4 remains open because automated evidence cannot prove the explicitly
required rendered sidebar, search, and MDX-component behavior.
