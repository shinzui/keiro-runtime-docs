---
id: 44
slug: author-comprehensive-pg-migrate-usage-and-operations-documentation
title: "Author comprehensive pg-migrate usage and operations documentation"
kind: exec-plan
created_at: 2026-07-14T15:14:32Z
intention: "intention_01kxgjsgnse1z9r0w141akd9g2"
master_plan: "docs/masterplans/6-prepare-keiro-runtime-documentation-for-wider-announcement.md"
---

# Author comprehensive pg-migrate usage and operations documentation

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, pg-migrate has a first-class, extensive documentation section in this site. A
library author can embed and export an ordered migration component; an application author can
compose dependency-ordered components, mount the reusable CLI, and ship one migration artifact; an
operator can inspect, apply, verify, import, repair, and audit history with explicit safety
boundaries. Readers can see the system work by following a fresh-database tutorial, rerunning the
same plan idempotently, composing a second library component, and using the documented reports and
failure classes to decide whether deployment may proceed.


## Progress

- [x] (2026-07-14T18:24:38Z) Milestone 1: created the top-level pg-migrate section and a
  fresh-database tutorial covering embedding, CLI mounting, apply, verify, rerun, and append.
- [x] (2026-07-14T18:34:02Z) Milestone 2: documented authoring, composition, CLI integration,
  testing, and the public reference surface.
- [x] (2026-07-14T18:40:31Z) Milestone 3: documented production execution, verification, cleanup,
  and recovery.
- [ ] Milestone 4: document predecessor imports, practical recipes, FAQ, and final navigation.

## Surprises & Discoveries

- The planned pg-migrate boundary is still the clean committed repository head:
  `f39d64e354818999667d345a1452f33eb4857fc1` (`1.1.0.0`). No source-boundary adjustment is
  required.
- The documentation site's Shiki configuration has no `cabal` language lexer. Cabal stanzas use
  plain `text` fences so production rendering remains deterministic without changing their syntax.
- The CLI facade exposes every command and options constructor but intentionally has no
  `commandOutputFormat` helper. Applications select the renderer with an exhaustive
  `MigrationCommand` match, so a newly added command becomes a compile-time integration task.
- Read-only `status` and `verify` use a dedicated provider connection but intentionally neither
  acquire the migration advisory lock nor initialize the ledger. They observe history; only
  execution, repair, and import establish the serialized mutation lifecycle.
- Strict `verify` always reports foreign rows even when `RunOptions` allows them for execution and
  `status`. An intentionally shared ledger therefore needs an explicit foreign-row inventory; an
  application requiring empty strict verification should use its own ledger schema.


## Decision Log

- Decision: Create `content/docs/pg-migrate/` as a top-level product section with tutorial,
  how-to, reference, explanation, cookbook, and FAQ content.
  Rationale: pg-migrate is a reusable six-package family used by several runtime projects, not a
  keiro implementation detail. The user explicitly requested extensive usage documentation.
  Date: 2026-07-14
- Decision: Review pg-migrate 1.1.0.0 at committed SHA
  `f39d64e354818999667d345a1452f33eb4857fc1`.
  Rationale: This is the current release boundary and includes the CLI/parser override fixes,
  cleanup-success preservation, embedding hardening, SQL diagnostics, policy alignment, and import
  audit fixes that affect user guidance.
  Date: 2026-07-14
- Decision: Teach safe common paths through public facades and keep `Internal` modules out of user
  examples.
  Rationale: The upstream release policy explicitly excludes internal modules from semantic
  compatibility. Documentation should strengthen, not bypass, the supported boundary.
  Date: 2026-07-14
- Decision: Separate strict plan/ledger verification from live-schema drift detection.
  Rationale: `verifyMigrationPlan` proves durable history is a valid prefix with matching identity,
  checksum, kind, and transaction mode; it does not inspect tables or indexes. Conflating the two
  would make an announcement-facing operations guide unsafe.
  Date: 2026-07-14


## Outcomes & Retrospective

- Milestone 1 added pg-migrate to top-level navigation with stable tutorial, how-to, reference, and
  explanation homes. The first tutorial follows one `accounts` manifest from compile-time exact-byte
  embedding through plan/list/check, fresh apply, strict verify, `AlreadyApplied` rerun, and atomic
  `new` authoring. It imports only public facades and makes the absence of runtime file discovery
  explicit. Formatting, MDX/TypeScript, production build, `git diff --check`, and the 465-file link
  scan pass.
- Milestone 2 added seven focused authoring, composition, CLI, CI, and test how-tos plus six public
  reference pages for the package map, core API, embedding/manifest v1, CLI/JSON v1, reports, and
  compatibility. Library components stay library-owned while final plan order, connection policy,
  rendering, and exit behavior remain application-owned. The upstream public build and all 110 unit
  tests pass; formatting, MDX/TypeScript, production build, `git diff --check`, and the 478-file link
  scan pass.
- Milestone 3 added seven production how-tos and five explanations spanning the deployment gate,
  lock/timeouts, verification, shared-ledger policy, nontransactional repair, cleanup, failure
  triage, ownership, connection lifecycle, execution state machines, schema drift, and forward-only
  recovery. The guidance retains JSON evidence, forbids automatic ambiguous retry and ledger edits,
  and preserves durable success when cleanup has issues. Formatting, MDX/TypeScript, production
  build, `git diff --check`, and the 490-file link scan pass.


## Context and Orientation

This docs site currently has no pg-migrate section and `mori.dhall` does not yet declare
`shinzui/pg-migrate` as a dependency. The upstream project is registered; run
`mori registry show shinzui/pg-migrate --full` and `mori registry docs shinzui/pg-migrate` before
editing. During planning it resolved to `/Users/shinzui/Keikaku/bokuno/pg-migrate`, release
1.1.0.0 at `f39d64e`. The six packages are `pg-migrate`, `pg-migrate-embed`, `pg-migrate-cli`,
`pg-migrate-import-codd`, `pg-migrate-import-hasql-migration`, and
`pg-migrate-test-support`.

A migration is an immutable, named database change with exact SQL bytes. A `MigrationComponent` is
the library-owned unit: a stable component name, a non-empty ordered migration list, and component
dependencies. A `MigrationPlan` is the application-owned, validated ordering of all components.
Migration identity is component-local, such as `accounts/0001-create-accounts`; components prevent
unrelated libraries from competing for one global filename namespace.

`pg-migrate-embed` reads an ordered `manifest` at compile time, validates membership and SQL, and
embeds exact bytes. On GHC 9.12 the embedding module loads
`Database.PostgreSQL.Migrate.Embed.RecompilePlugin` so added or removed sibling SQL files trigger
validation. Production never discovers migration files at runtime. Historical files are immutable;
normal evolution appends a new file and manifest entry.

The core runner in `Database.PostgreSQL.Migrate` acquires one dedicated Hasql connection and one
session-level PostgreSQL advisory lock for the whole plan. It initializes/upgrades ledger schema v1,
verifies history, and advances in order. Transactional SQL and its ledger row commit atomically.
Nontransactional SQL records durable `Running`, `Applied`, or `Failed` state and requires explicit,
evidence-backed repair after ambiguity; the library never retries or repairs automatically.

Strict verification compares the declared plan with the `pgmigrate` ledger. It checks stored
positions, identities, checksums, kinds, and transaction modes and, by default, rejects stored rows
outside the active plan. `withUnknownMigrationsPolicy` can deliberately allow shared-ledger rows
without relaxing verification of active-plan rows. Verification does not compare the live schema to
SQL intent.

The reusable CLI package parses and handles `plan`, `list`, `check`, `status`, `verify`, `up`,
`repair`, and `new`, then renders text or JSON v1 outcomes. The application owns configuration,
logging, stdout/stderr, and process exit. In 1.1, `check` takes `--manifest PATH`; execution flags
such as wait and statement-timeout overrides preserve configured defaults when omitted.

Existing databases can import history without replaying SQL. The core generic history model
validates source evidence and target prefixes. Optional Codd and `hasql-migration` adapters read
their predecessor ledgers and produce evidence. Import writes target ledger plus audit rows
atomically. It is not an implicit fallback in the native runner.

Durable success is not erased by cleanup trouble. Successful migration, repair, and import reports
carry `cleanupIssues`; a non-empty list means the primary change committed but unlock or timeout
restoration needs investigation. `CleanupFailed` is reserved for a primary failure plus cleanup
failure and contains both. This distinction must appear in operations guidance and automation.

The upstream curated prose is under `docs/user/`, `docs/operations/`, and `docs/reference/`;
`examples/basic/` is the runnable composition example. Source facades live in
`pg-migrate/src/Database/PostgreSQL/Migrate.hs`, `pg-migrate-embed/src/Database/PostgreSQL/Migrate/Embed.hs`,
`pg-migrate-cli/src/Database/PostgreSQL/Migrate/CLI.hs`, the two history-adapter facades, and
`pg-migrate-test-support/src/Database/PostgreSQL/Migrate/Test.hs`. Use those as source of truth and
port concepts in the site's own voice rather than copying upstream documents wholesale.


## Plan of Work

Milestone 1 creates the section and fresh-database spine. Add `content/docs/pg-migrate/index.mdx` and
`meta.json`, plus `tutorials/index.mdx`, `tutorials/meta.json`, and
`tutorials/your-first-migration-plan.mdx`. The tutorial starts with a Cabal executable, manifest and
SQL file, creates an embedded component and plan, mounts the public CLI, runs plan/list/check,
applies to a fresh database, verifies, reruns idempotently, and appends a second migration with
`new`. Add `how-to/index.mdx`, `reference/index.mdx`, `explanation/index.mdx`, and their metadata so
every later page has a stable home. Add the new top-level entry to `content/docs/meta.json` for
buildability; EP-7 may reorder it. Acceptance is one linear tutorial with exact commands and
expected first-run versus rerun outcomes, no `Internal` import, and no runtime filesystem
dependency.

Milestone 2 documents authoring, composition, and CLI integration. Add how-tos for authoring a
manifest, exporting a library component, composing multiple components, integrating the CLI,
checking in CI, authoring a new migration, and testing with `pg-migrate-test-support`. Add reference
pages for the package map, public core API, embedding/manifest v1, CLI/JSON v1, errors/events/reports,
and compatibility. Explain smart constructors, `DefinitionError`, `PlanError`, dependency order,
provider/run options, exact-byte checksums, source-distribution files, output formats, exit-class
mapping, and the module-local GHC plugin. Acceptance is a library-plus-application example in which
the library exports only its component and the application owns final plan order and process policy.

Milestone 3 documents production execution and recovery. Add how-tos or operations pages for the
deployment gate, lock/wait/statement-timeout configuration, strict verification, unknown stored
migrations, nontransactional repair, cleanup issues, and troubleshooting. Add explanation pages for
component ownership, the dedicated-connection/advisory-lock lifecycle, transactional versus
nontransactional state machines, verification versus schema drift, and why down migrations,
automatic repair, arbitrary IO migrations, and runtime discovery are excluded. Include backups,
quiescing, pre/post verification, JSON evidence retention, and forward-only recovery. Acceptance is
an operator runbook that makes no destructive or ambiguous repair automatic and preserves a
durably successful report even if cleanup has issues.

Milestone 4 documents predecessor cutovers and practical recipes. Add how-tos for generic history
import, Codd import, and `hasql-migration` import; explain evidence graphs, exact checksums,
equivalent-history opt-in, audit rows, source identifiers, and atomic target writes. Add cookbook
recipes for a service composed from Kiroku/Keiro/PGMQ components, a pre-deploy migration job, a
shared-ledger policy, a CI manifest gate, and a failure-triage decision tree. Add
`content/docs/pg-migrate/faq.mdx`. Reconcile all section indexes and metadata. Acceptance is that a
reader can identify whether a fresh apply, direct import, explicitly equivalent import, repair, or
manual investigation is correct without being told to edit ledger rows.


## Concrete Steps

Work from `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`. Resolve and verify upstream first:

```bash
mori registry show shinzui/pg-migrate --full
mori registry docs shinzui/pg-migrate
PG_MIGRATE=/Users/shinzui/Keikaku/bokuno/pg-migrate
git -C "$PG_MIGRATE" status --short
git -C "$PG_MIGRATE" rev-parse HEAD
git -C "$PG_MIGRATE" log -1 --oneline
```

Expected source boundary:

```text
f39d64e354818999667d345a1452f33eb4857fc1
f39d64e chore(release): 1.1.0.0
```

Inventory public source and upstream evidence:

```bash
rg --files "$PG_MIGRATE/docs" "$PG_MIGRATE/examples" | sort
rg -n '^module Database\.PostgreSQL\.Migrate' "$PG_MIGRATE"/pg-migrate*/src
rg -n 'MigrationComponent|MigrationPlan|runMigrationPlan|verifyMigrationPlan|repairMigration|importMigrationHistory' "$PG_MIGRATE/pg-migrate/src"
rg -n 'cleanupIssues|CleanupFailed|UnknownMigrationsPolicy|jsonSchemaVersion|manifestFormatVersion' "$PG_MIGRATE"
```

Use templates from `content/docs/_templates/` when adding each Diataxis page. After each milestone,
run:

```bash
pnpm run typecheck
pnpm run format:check
pnpm build
node scripts/check-doc-links.mjs
git diff --check
```

To confirm source examples still compile without changing upstream, run from the pg-migrate repo if
the local toolchain is available:

```bash
cd "$PG_MIGRATE"
nix develop -c cabal build all
nix develop -c just unit
```

Expected success is exit zero from the docs checks, source build, and unit suite. A database-backed
acceptance run is not required to author prose, but any transcript included in the site must come
from upstream checked-in acceptance evidence or a real local run, never invented output.


## Validation and Acceptance

The fresh tutorial is accepted when the first `status` shows one pending migration, `up` applies it,
strict `verify` succeeds, and a second `up` reports the migration as already applied. The component
example must show library-local identity and application-owned ordering. The CLI page must cover all
eight commands and both output formats at the 1.1 syntax, including `check --manifest`.

Production docs are accepted when they distinguish four independent contracts: package API
version, ledger schema v1, manifest format v1, and JSON schema v1. Compatibility must state GHC
9.12.4 project tooling, PostgreSQL 17/18, and Hasql `>=1.10 && <1.11` at the reviewed release. It
must also state that strict verification does not prove live-schema equality.

Recovery docs are accepted when transactional failure, interrupted nontransactional execution,
source-history import, unknown stored rows, cleanup issues after durable success, and primary-plus-
cleanup failure each lead to different, explicit operator actions. No page may recommend manual
ledger editing, checksum bypass, automatic retry of ambiguous SQL, or partial-plan deployment.

Run focused coverage scans:

```bash
rg -n 'MigrationComponent|MigrationPlan|manifest|component' content/docs/pg-migrate
rg -n 'plan|list|check|status|verify|up|repair|new' content/docs/pg-migrate
rg -n 'Codd|hasql-migration|history import|nontransactional|cleanupIssues|CleanupFailed' content/docs/pg-migrate
rg -n 'PostgreSQL 17|PostgreSQL 18|GHC 9\.12|ledger.*v1|manifest.*v1|JSON.*v1' content/docs/pg-migrate
```

Every category must appear in reference and at least one task-oriented page. `pnpm run typecheck`,
`pnpm build`, `node scripts/check-doc-links.mjs`, and `git diff --check` must exit zero. Record the
final page inventory and reviewed SHA for EP-6 and EP-7. EP-7 owns `docs/pg-migrate-source-sync.md`
and the final mori/README registration.


## Idempotence and Recovery

Documentation generation and checks are repeatable. Create pages additively, register them in the
nearest metadata file, then run the link checker. Do not run migration commands against a user or
production database while authoring docs. Use upstream test fixtures or a disposable ephemeral
database for any live transcript. If the upstream release moves, either retain the explicit 1.1
boundary or audit the new commit and update all compatibility claims together.


## Interfaces and Dependencies

Use the stable facades `Database.PostgreSQL.Migrate`, `Database.PostgreSQL.Migrate.Embed`,
`Database.PostgreSQL.Migrate.CLI`, `Database.PostgreSQL.Migrate.History.Codd`,
`Database.PostgreSQL.Migrate.History.HasqlMigration`, and
`Database.PostgreSQL.Migrate.Test`. Do not present modules containing `Internal` as supported user
interfaces. PostgreSQL is the runtime service; Hasql connection settings are passed to runner
operations because the runner owns its dedicated connection.

This plan has no hard child dependency. Its completed terminology is a hard dependency of
`docs/plans/45-reconcile-runtime-migrations-kiroku-pgmq-shibuya-and-adapters.md`, which documents
the ecosystem components, and of plan 46, which owns discovery and source pointers. The
documentation interface is the complete `content/docs/pg-migrate/` tree, registered in navigation,
with stable links that runtime-package pages can consume.
