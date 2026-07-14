---
id: 45
slug: reconcile-runtime-migrations-kiroku-pgmq-shibuya-and-adapters
title: "Reconcile runtime migrations kiroku pgmq shibuya and adapters"
kind: exec-plan
created_at: 2026-07-14T15:14:32Z
intention: "intention_01kxgjsgnse1z9r0w141akd9g2"
master_plan: "docs/masterplans/6-prepare-keiro-runtime-documentation-for-wider-announcement.md"
---

# Reconcile runtime migrations kiroku pgmq shibuya and adapters

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, the non-DSL runtime docs reflect the current Kiroku, Keiro migration, PGMQ,
Shibuya, and adapter releases and use pg-migrate consistently. Readers can compose Kiroku, Keiro,
PGMQ, and application migrations into one validated plan; upgrade predecessor ledgers without
replaying schema DDL; understand Kiroku 0.3's typed store and operator behavior; and shut down an
idle PGMQ worker without waiting forever. The result is observable through updated setup and
upgrade paths, production failure tables, and cross-library examples that name current packages,
commands, and guarantees.


## Progress

- [x] (2026-07-14T19:00:30Z) Milestone 1: replace old migration guidance with native component
  composition, explicit predecessor imports, and current operator CLIs.
- [ ] Milestone 2: refresh Kiroku 0.3 user and operator behavior.
- [ ] Milestone 3: refresh PGMQ, Shibuya, and adapter behavior.
- [ ] Milestone 4: reconcile cross-package operations and run final scoped scans.

## Surprises & Discoveries

- The clean pgmq-hs source advanced beyond the planned `8439385` boundary to
  `f4a101843ea6f5c055277fd84859ece02865eff4`. Release `0.4.0.1` adds an explicit
  `AllowUnselectedSourceRows` policy for deliberately shared predecessor ledgers while retaining
  exact selected-row evidence. The unshipped grouped-head PGMQ 1.12 plan remains excluded.
- The committed Keiro `keiro-test-support` source already has
  `withMigratedSuiteWith :: [MigrationComponent] -> ...`; it is not merely an uncommitted change.
  The fixture composes extras into one plan because a later partial plan would classify known
  shared-ledger rows as `UnknownStoredMigration`.
- Kiroku's released native manifest contains eight migrations: seven imported historical payloads
  plus the `0008-schema-management-comment` canary. Earlier prose that described seven current
  migrations counted only the predecessor prefix.
- Kiroku and PGMQ load pg-migrate's recompilation plugin in their embedding modules, but Keiro's
  committed embedding module does not. Keiro authoring guidance therefore keeps explicit
  `check --manifest` as the source-tree gate and does not promise plugin-backed rebuild detection.


## Decision Log

- Decision: Make this plan hard-dependent on
  `docs/plans/44-author-comprehensive-pg-migrate-usage-and-operations-documentation.md`.
  Rationale: Runtime-package pages must consume one already-authored vocabulary and stable link set
  for components, plans, ledgers, verification, history import, and repair.
  Date: 2026-07-14
- Decision: Audit every first-party runtime source but edit only where committed drift or a missing
  integration path exists.
  Rationale: Shibuya core and the Message DB adapter have no committed drift from their site pins;
  inventing changes would make the sweep less accurate. A no-drift audit is still valuable evidence.
  Date: 2026-07-14
- Decision: Exclude uncommitted upstream work, including pgmq-hs 1.12 planning files and the
  Message DB adapter's local `mori.dhall` edit.
  Rationale: Source pins must be reproducible and the uncommitted work belongs to the user.
  Date: 2026-07-14
- Decision: Keep source-sync pointer edits for EP-7.
  Rationale: This plan shares keiro and integration pages with other child plans. EP-7 can advance
  each pointer only after the complete tree is reconciled.
  Date: 2026-07-14


## Outcomes & Retrospective

- Milestone 1 replaced current Codd and `hasql-migration` runner instructions with native Kiroku,
  Keiro, and PGMQ components. Readers now have one Kiroku-before-Keiro plan with optional PGMQ and
  application components, standard CLI gates, exact schema ownership, a Keiro 0.1 relocation path,
  and explicit import-before-native cutovers that execute no target DDL. The Keiro test fixture
  documentation now matches its committed component-list API. Typecheck, formatting, production
  build, whitespace checks, stale-runner scans, and the 504-file internal-link scan pass.


## Context and Orientation

This repository documents the runtime family in `content/docs/keiro/`, `content/docs/kiroku/`,
`content/docs/pgmq/`, `content/docs/shibuya/`, and `content/docs/integrations/`. Each source tree has
a pointer under `docs/*-source-sync.md`. Always resolve paths with mori before reading source.

The committed review boundaries found during planning are:

- `shinzui/keiro` at `87bf3ff173b2f4ce274e36cea64923ad33817d7c`, versus site pin `601f9f3`.
- `shinzui/kiroku` at `58aff77b3a6d6093e3613753a0543aab62db9fac`, versus site pin `dac1a0b`.
- `shinzui/pgmq-hs` at `8439385b7b4fe0c33355255b9d4f4938aefeacdd`, versus site pin `973c107`.
- `shinzui/shibuya` at `172df245f40a454af46dd7f4cde855eaa4414c5a`, equal to its site pin.
- `shinzui/shibuya-pgmq-adapter` at `85931b45702faecc035d89bb5cff381e8679f793`, versus `99e997e`.
- `shinzui/shibuya-kafka-adapter` at `65111ae11fdabd161b2147ce478647a5ed1737f9`, versus `468a218`.
- `shinzui/shibuya-message-db-adapter` at
  `43072558a58d9613cce46c3624157d6fc3e5b6b0`, equal to its site pin.

Keiro 0.2 moved its framework tables from the `kiroku` schema to a dedicated `keiro` schema and
exports `Keiro.Schema.keiroSchema`. Its `keiro-migrations` package exports a native pg-migrate
component that depends on Kiroku's component. The physical schema move, upgrade/remediation path,
qualified runtime queries, application projection schemas, and operator CLI must be documented
together. At the planned committed boundary, do not document the uncommitted
`withMigratedSuiteWith [MigrationComponent]` test-support signature merely because the committed
Unreleased changelog mentions it; verify the actual committed file with `git show HEAD:<path>`.

Kiroku's `kiroku-store-migrations` 0.2/0.3 releases replace Codd execution with
`kirokuMigrations`/`kirokuMigrationPlan`, manifest-backed SQL, the standard pg-migrate CLI, Codd
history mappings, and a native canary. Version 0.3 adopts pg-migrate 1.1, `check --manifest`, runner
overrides, cleanup-issue preservation, and embedding recompilation safety. `kiroku-store` 0.3.0.1
also includes backward-pagination correction, stream-name length checks, empty-batch rejection,
typed link and transaction errors, subscription source changes, loud checkpoint-load failure,
zero-buffer rejection, logical truncate-before behavior, and preserved opaque transaction SQLSTATE
diagnostics. `kiroku-cli` 0.2 is a remote HTTP client for worker subscription status rather than a
standalone database client.

`pgmq-migration` 0.4 removes its old `hasql-migration` runner and exports only the native
`pgmqMigrations` component plus construction types. Existing `public.schema_migrations` history is
not read automatically. `Pgmq.Migration.History.HasqlMigration` supports an exact direct import and
an explicitly opted-in equivalent two-step history guarded by a read-only PGMQ 1.11 schema
contract. The first native-only comment migration proves handoff. The untracked upstream master
plan for PGMQ 1.12/grouped-head reads is future work and is not part of this committed boundary.

Shibuya core 0.8.0.1 is already fully synced in `docs/shibuya-source-sync.md`; verify rather than
rewrite its `Message` handler, `AppConfig`, batching, ordering, finalization, supervision, and
metrics claims. `shibuya-pgmq-adapter` 0.12 upgrades to pgmq-hs 0.4/pg-migrate and fixes an idle
stream so it observes shutdown. Its schema-installation examples now take connection settings and
compose a pg-migrate plan. The Kafka adapter's only committed drift is a 0.8.0.1 release metadata
update; the Message DB adapter has no committed drift. The Kiroku adapter is released with Kiroku
0.4 and must be checked for source/API changes in the Kiroku range.


## Plan of Work

Milestone 1 replaces old migration guidance with runtime component composition. Update
`content/docs/keiro/reference/migrations-and-schema.mdx`, `keiro/how-to/run-migrations.mdx`,
`keiro/walkthrough/operations/03-the-migration-runner.mdx`, and adjacent setup/test pages for the
native keiro component, Kiroku dependency, dedicated `keiro` schema, qualified DDL/runtime queries,
operator CLI, old-database upgrade, and remediation boundary. Add or rewrite Kiroku migration
reference/how-to pages under `content/docs/kiroku/` for `kirokuMigrations`,
`kirokuMigrationPlan`, Codd history import, native canary, `check --manifest`, and 1.1 execution
options. Replace `content/docs/pgmq/reference/migrations.mdx` and
`pgmq/how-to/install-or-migrate-schema.mdx` with the native `pgmqMigrations` model and predecessor
history choices. Link all three to the pg-migrate pages from EP-5. Acceptance is one application
plan whose dependency order is Kiroku before Keiro, with optional PGMQ and application components,
and no current setup path that invokes Codd or `hasql-migration` as the runner.

Milestone 2 refreshes Kiroku 0.3 user and operator behavior. Audit and update Kiroku core/store,
write-path, lifecycle, subscription, CLI, metrics, adapter, tutorial, FAQ, and walkthrough pages
against the exact `dac1a0b..58aff77` diff. Cover backward cursors, maximum stream-name bytes, empty
append batches, typed link and opaque transaction failures, truncate-before, checkpoint startup
failure, buffer validation, publisher-versus-database live sources, new effect constructors, CLI
remote URL/JSON contract, and any adapter API changes. Do not duplicate unchanged June material.
Acceptance is a store-error and operator matrix where each new failure has the correct pre-database,
transactional, subscription, or remote-client behavior and a source-backed recovery action.

Milestone 3 refreshes PGMQ/Shibuya/adapters. Update PGMQ landing, reference, topology explanation,
and migration how-to for pgmq-hs 0.4. Update
`content/docs/integrations/shibuya-pgmq-adapter.mdx` for version 0.12, pg-migrate installation,
connection-settings ownership, predecessor import, and the idle-shutdown fix; reconcile linked
`content/docs/keiro/reference/pgmq-jobs.mdx` and keiro/PGMQ integration pages where versions or setup
repeat. Audit the Shibuya tree at its equal pin and record no-drift evidence; edit only incorrect
cross-package setup. Audit Kafka, Message DB, and Kiroku adapter pages and change them only for
committed source/API drift. Acceptance is a graceful-shutdown timeline in which an empty PGMQ
source terminates on request and no page suggests the removed standalone PGMQ migration runner.

Milestone 4 reconciles cross-package operations. Update `content/docs/integrations/index.mdx`,
`keiro-with-kiroku.mdx`, `keiro-with-pgmq.mdx`, `shibuya-adapters.mdx`, and applicable installation
pages to explain who owns each migration component, who composes and runs the final plan, which
ledger import is one-time, and which runtime handles messages afterward. Add compatibility and
upgrade links to the new pg-migrate section without copying its full reference. Run scoped stale
runner/API scans and the docs build. Record exact no-drift findings and final reviewed SHAs in this
plan for EP-7.


## Concrete Steps

Work from `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`. Re-resolve all sources:

```bash
mori registry show shinzui/keiro --full
mori registry show shinzui/kiroku --full
mori registry show shinzui/pgmq-hs --full
mori registry show shinzui/shibuya --full
mori registry show shinzui/shibuya-pgmq-adapter --full
mori registry show shinzui/shibuya-kafka-adapter --full
mori registry show shinzui/shibuya-message-db-adapter --full
```

For each resolved path run `git status --short`, `git rev-parse HEAD`, `git log <site-pin>..HEAD`,
and `git diff --stat <site-pin>..HEAD`. Use committed snapshots for dirty upstream files:

```bash
git -C /Users/shinzui/Keikaku/bokuno/keiro show HEAD:keiro-test-support/src/Keiro/Test/Postgres.hs
git -C /Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs ls-files docs/masterplans docs/plans
git -C /Users/shinzui/Keikaku/work/libraries/haskell/shibuya-message-db-adapter show HEAD:mori.dhall
```

Inventory current migration surfaces and stale site claims:

```bash
rg -n 'kirokuMigrations|keiroMigrations|pgmqMigrations|MigrationComponent|migrationPlan' /Users/shinzui/Keikaku/bokuno/keiro /Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku /Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs
rg -n 'Codd|codd|hasql-migration|schema_migrations|expected-schema' content/docs/keiro content/docs/kiroku content/docs/pgmq content/docs/integrations
rg -n 'runApp|AppConfig|Message|Ingested|shutdown|pg-migrate' content/docs/shibuya content/docs/integrations
```

After each milestone run:

```bash
pnpm run typecheck
pnpm run format:check
pnpm build
node scripts/check-doc-links.mjs
git diff --check
```

Expected success is zero exit status throughout, no missing docs links, and no whitespace errors.
Do not require the dirty upstream trees to become clean; simply exclude their uncommitted changes
and record the committed SHA used.


## Validation and Acceptance

Migration acceptance requires a reader to construct one pg-migrate plan from exported Kiroku,
Keiro, PGMQ, and application components, inspect it, run it on a fresh database, and identify the
one-time history import needed for an existing Codd or PGMQ `schema_migrations` database. The docs
must say imports adopt verified history without replaying DDL and that native runners do not inspect
predecessor ledgers implicitly.

Kiroku acceptance requires accurate behavior for a too-long name, empty append, backward page,
missing link source, duplicate transaction event, broken checkpoint load, zero stream buffer,
truncate marker, and opaque SQL error. The CLI page must show `--remote-url` or
`KIROKU_REMOTE_URL`, not database credentials, for the standalone binary.

Adapter acceptance requires an idle PGMQ source to observe shutdown, schema install to use
connection settings plus a composed plan, and PGMQ 0.4 docs to avoid removed `migrate`, `upgrade`,
or `validate` calls. Shibuya core audit must confirm the existing site remains aligned at
`172df24`; no-drift is a valid result.

Run scoped stale-claim checks. Codd and `hasql-migration` mentions are allowed only in historical
import/upgrade context:

```bash
rg -n 'runKeiroMigrations|runAllKeiroMigrations|CoddSettings|KEIRO_MIGRATE_NO_CHECK|CODD_' content/docs
rg -n 'pgmq.*\b(migrate|upgrade|validate)\b|getMigrations' content/docs/pgmq content/docs/integrations
rg -n 'kiroku.*--database-url|kiroku.*--schema|kiroku.*--pool-size' content/docs/kiroku
rg -n 'pg-migrate|MigrationComponent|migrationPlan' content/docs/keiro content/docs/kiroku content/docs/pgmq content/docs/integrations
```

The first three commands should return no active-current instruction. The last must show every
runtime migration surface linked to the new canonical section. Run `pnpm run typecheck`,
`pnpm build`, `node scripts/check-doc-links.mjs`, and `git diff --check`, then record reviewed SHAs,
version facts, no-drift findings, and remaining EP-7 work.


## Idempotence and Recovery

All changes are documentation and checks are repeatable. Preserve the existing source-sync files
until EP-7. Do not clean dirty upstream repositories or absorb untracked plans. If a page mentions a
predecessor runner, label it as history-import context before removing a global stale-scan match. If
committed source advances, expand the audit from the planned SHA and update the handoff; never mix a
new package version with old migration behavior.


## Interfaces and Dependencies

This plan depends hard on the completed `content/docs/pg-migrate/` interface from plan 44. Source
projects are the seven mori-qualified repositories listed in Context. Important public migration
modules are `Keiro.Migrations`, `Kiroku.Store.Migrations`, `Pgmq.Migration`, and their documented
history adapters; confirm actual exports because names may be narrower than changelog prose.

Runtime modules include Kiroku store/subscription/CLI/metrics/OTel and adapter facades, Shibuya's
public `Shibuya` umbrella, PGMQ public core/Hasql/Effectful/config facades, and
`Shibuya.Adapter.Pgmq`. Avoid internal modules in consumer examples. Plans 41 and 42 own keiro
command/worker semantics; this plan should link rather than rewrite them. Plan 46 owns source pins,
root navigation, compatibility summaries, and final whole-site validation.
