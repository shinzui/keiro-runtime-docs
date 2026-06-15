---
id: 31
slug: refresh-keiro-command-core-read-side-and-schema-documentation
title: "Refresh Keiro command core read side and schema documentation"
kind: exec-plan
created_at: 2026-06-15T19:08:24Z
intention: intention_01kv6bpntyeh98ta4k2famkdm9
master_plan: "docs/masterplans/4-refresh-keiro-and-kiroku-documentation-after-june-hardening.md"
---

# Refresh Keiro command core read side and schema documentation

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this plan is implemented, Keiro users can read the command, codec, stream, snapshot, projection, read-model, and schema documentation and see behavior that matches the current June 2026 source. The docs will cover the hardening range after `9fa283b`, including breaking `keiro-core` codec/stream contract changes, command retry and snapshot failure handling, strong read-model consistency, projection deduplication, snapshot policy boundary behavior, test-support database isolation, and expected-schema migration drift checks.

The user-visible proof is that the reference pages and walkthroughs under `content/docs/keiro/` describe the current exported modules under `/Users/shinzui/Keikaku/bokuno/keiro/keiro-core/`, `/Users/shinzui/Keikaku/bokuno/keiro/keiro/`, and `/Users/shinzui/Keikaku/bokuno/keiro/keiro-migrations/`, and the docs site validates.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [x] Audit the Keiro `9fa283b..HEAD` source range for command/core/read-side/schema changes.
- [x] Update command, stream, codec, snapshot, and replay-safety reference and foundation walkthrough docs.
- [x] Update projection and read-model docs for strong consistency and async projection deduplication.
- [x] Update migration/schema docs for expected-schema drift checks and the current schema shape relevant to this plan.
- [x] Update tests/fixture guidance for the current Postgres fixture behavior if needed.
- [x] Run docs validation commands and record results.


## Surprises & Discoveries

- `Strong` read-model consistency is implemented now. It captures the current store head and waits for
  the subscription position to catch up; it is no longer behaviorally equivalent to `Eventual`.
- The hardened codec API makes both `decode` and upcasters `EventType`-aware. Malformed
  `schemaVersion` metadata is an error when present, and the default to version 1 applies only when
  the metadata object or key is absent.
- Command execution retries optimistic conflicts by rehydrating and replanning, but `DuplicateEvent`
  is non-retryable. Snapshot write failure after a successful append is advisory: it is counted by
  metrics and does not fail the command.
- Async projection idempotency moved into the centralized
  `kiroku.keiro_projection_dedup` table. Projection examples should not tell every projection to own
  a duplicate `source_event_id` table solely for framework-level replay protection.
- `keiro-migrations` now has an expected-schema drift gate and a `keiro-write-expected-schema`
  helper. The shared Postgres fixture uses no-check migration application for fixture setup; strict
  schema drift checking belongs to `keiro-migrations-test`.


## Decision Log

Record every decision made while working on the plan.

- Decision: Put core command/read-side and general schema documentation in one plan.
  Rationale: Command execution, snapshots, projections, read models, and schema validation share the same `Store` and migration assumptions; documenting them together avoids inconsistent consistency and schema language.
  Date: 2026-06-15


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

Completed on 2026-06-15 against `shinzui/keiro` commit
`f1d67a01b7457387a4861e7268d1c521ef82287d`. The Keiro command, codec, stream, snapshot,
projection, read-model, migration/schema, fixture, and matching walkthrough docs now describe the
June hardening behavior: event-type-aware codecs and upcasters, stricter schema-version metadata,
snapshot boundary handling, conflict retries and snapshot failure accounting, strong consistency
waits, centralized async projection deduplication, expected-schema drift checks, and the current
test fixture model.

Validation passed with `pnpm run typecheck`, `pnpm run format:check`, `pnpm build`,
`git diff --check`, and a stale-claim `rg` scan for the old strong-consistency, codec,
migration-count, and projection-dedup wording. EP-6 still owns the final
`docs/keiro-source-sync.md` pointer update.


## Context and Orientation

This repository documents Keiro under `content/docs/keiro/`. The source-sync pointer is `docs/keiro-source-sync.md`, which currently says the Keiro docs were last reviewed at commit `9fa283b6cfbf3734367f3bef4801001e6b19abfc` from 2026-06-10. Resolve the current source with `mori registry show shinzui/keiro --full`; it is currently `/Users/shinzui/Keikaku/bokuno/keiro`.

Keiro is an event-sourcing framework on top of Kiroku. A command is an input handled against a stream state and persisted as events. A codec turns typed events or state into bytes and back. A snapshot is a stored copy of derived state used to shorten hydration. A projection is a side effect or read-model update derived from recorded events. A read model is a queryable table or view built from events. Strong consistency means a query waits until the read model has caught up to a required event position.

The source files that matter for this plan are:

- `/Users/shinzui/Keikaku/bokuno/keiro/keiro-core/src/Keiro/Codec.hs`, `/Users/shinzui/Keikaku/bokuno/keiro/keiro-core/src/Keiro/EventStream.hs`, `/Users/shinzui/Keikaku/bokuno/keiro/keiro-core/src/Keiro/EventStream/Validate.hs`, `/Users/shinzui/Keikaku/bokuno/keiro/keiro-core/src/Keiro/Stream.hs`, and `/Users/shinzui/Keikaku/bokuno/keiro/keiro-core/src/Keiro/Snapshot/Policy.hs`.
- `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro.hs`, the umbrella export module.
- `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Command.hs`, including `RunCommandOptions`, `CommandResult`, `CommandError`, `runCommand`, `runCommandWithSql`, and `runCommandWithSqlEvents`.
- `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Snapshot.hs`, `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Snapshot/Codec.hs`, and `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Snapshot/Schema.hs`.
- `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Projection.hs`, `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/ReadModel.hs`, `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/ReadModel/Rebuild.hs`, and `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/ReadModel/Schema.hs`.
- `/Users/shinzui/Keikaku/bokuno/keiro/keiro-migrations/README.md`, `/Users/shinzui/Keikaku/bokuno/keiro/keiro-migrations/src/Keiro/Migrations.hs`, and `/Users/shinzui/Keikaku/bokuno/keiro/keiro-migrations/expected-schema/`.
- `/Users/shinzui/Keikaku/bokuno/keiro/keiro/test/Main.hs` for behavior coverage and `/Users/shinzui/Keikaku/bokuno/keiro/keiro-test-support/src/Keiro/Test/Postgres.hs` for fixture guidance.

The docs most likely to need edits are `content/docs/keiro/reference/command.mdx`, `content/docs/keiro/reference/event-stream-and-stream.mdx`, `content/docs/keiro/reference/codec.mdx`, `content/docs/keiro/reference/snapshot.mdx`, `content/docs/keiro/reference/projection.mdx`, `content/docs/keiro/reference/read-model.mdx`, `content/docs/keiro/reference/migrations-and-schema.mdx`, `content/docs/keiro/reference/telemetry.mdx` if command/read metrics changed, `content/docs/keiro/how-to/choose-a-consistency-mode.mdx`, `content/docs/keiro/how-to/make-an-async-projection-idempotent.mdx`, `content/docs/keiro/how-to/rebuild-a-read-model.mdx`, `content/docs/keiro/how-to/test-with-the-postgres-fixture.mdx`, and walkthroughs under `content/docs/keiro/walkthrough/foundation/`, `command-cycle/`, `read-side/`, and `operations/`.


## Plan of Work

Milestone 1 audits the source range. Read the current modules and relevant tests, using the commit log to group changes into command execution, core contracts, snapshot behavior, projection/read-model behavior, and migrations. The milestone is complete when every updated doc page has a matching source file and test or migration evidence.

Milestone 2 updates core contracts. Update stream, event-stream, codec, and snapshot policy docs to reflect the current breaking `keiro-core` contract changes. Do not paste large code blocks from source; prefer concise signatures and prose. Acceptance is that `Keiro.Codec`, `Keiro.EventStream`, `Keiro.EventStream.Validate`, `Keiro.Stream`, and `Keiro.Snapshot.Policy` docs match source exports.

Milestone 3 updates command and read-side docs. Update command reference and walkthrough pages for retry and snapshot failure handling. Update projection/read-model pages for strong consistency, async projection deduplication, rebuild behavior, and wait options. Acceptance is that a reader can identify when to use eventual versus strong consistency and how deduplication is stored.

Milestone 4 updates migration/schema and fixture guidance. Update `content/docs/keiro/reference/migrations-and-schema.mdx` and operations walkthroughs for embedded codd migrations, expected-schema drift checks, `keiro-write-expected-schema`, and the dedicated `kiroku` schema. Update test fixture docs if the current `Keiro.Test.Postgres` behavior changed. Acceptance is that migration docs no longer imply a loose unchecked schema process.

Milestone 5 validates and records source-pointer needs. Run docs validation. If EP-6 will update `docs/keiro-source-sync.md`, record the command/core/read-side summary text in Outcomes & Retrospective; otherwise update the pointer directly with the final `HEAD`.


## Concrete Steps

Work from this repository:

```bash
cd /Users/shinzui/Keikaku/bokuno/keiro-runtime-docs
mori registry show shinzui/keiro --full
git -C /Users/shinzui/Keikaku/bokuno/keiro log --oneline --date=short --pretty=format:'%h %ad %s' 9fa283b..HEAD
git -C /Users/shinzui/Keikaku/bokuno/keiro diff --stat 9fa283b..HEAD
```

Expected relevant commits include:

```text
80c3f86 2026-06-14 feat(keiro-core)!: harden codec and stream contracts
7578117 2026-06-14 fix(command): harden retry and snapshot failure handling
7f6ee93 2026-06-14 fix(read-model): implement strong consistency
625c4fd 2026-06-14 fix(projection): deduplicate async application
fd8336c 2026-06-13 test(migrations): enforce expected schema drift checks
```

Search source before editing:

```bash
rg "RunCommandOptions|CommandError|Strong|ConsistencyMode|projection_dedup|StateCodec|SnapshotPolicy|validateEventStream|expected-schema" /Users/shinzui/Keikaku/bokuno/keiro/keiro-core/src /Users/shinzui/Keikaku/bokuno/keiro/keiro/src /Users/shinzui/Keikaku/bokuno/keiro/keiro-migrations /Users/shinzui/Keikaku/bokuno/keiro/keiro/test
```

After edits:

```bash
pnpm run typecheck
pnpm run format:check
pnpm build
```


## Validation and Acceptance

Acceptance requires that edited Keiro docs match current source for command retry/snapshot failure handling, codec and stream contracts, snapshot policy boundaries, strong read-model consistency, projection deduplication, migration drift checks, and test fixture behavior. Any Haskell signatures in docs must be copied from current source or reduced to prose if the exact type is too long.

Run:

```bash
pnpm run typecheck
pnpm run format:check
pnpm build
```

All commands should exit with status 0. Record any failure output in Surprises & Discoveries and fix before marking the plan complete.


## Idempotence and Recovery

This plan changes docs only and is safe to repeat. Do not edit the Keiro source repository. If a doc page becomes too broad, prefer splitting with a focused subsection in the same page first; add a new page only when navigation already has a natural slot or the topic is missing entirely.


## Interfaces and Dependencies

Use `mori` to resolve `shinzui/keiro` and read source directly. This plan has a soft dependency on `docs/plans/29-refresh-kiroku-write-path-schema-and-store-api-documentation.md` for Kiroku stream, append, and migration terminology.

The interfaces to document are `Keiro.Codec`, `Keiro.EventStream`, `Keiro.EventStream.Validate`, `Keiro.Stream`, `Keiro.Snapshot.Policy`, `Keiro.Command`, `Keiro.Snapshot`, `Keiro.Projection`, `Keiro.ReadModel`, `Keiro.ReadModel.Rebuild`, `Keiro.ReadModel.Schema`, `Keiro.Migrations`, and `Keiro.Test.Postgres`. The migration surface includes `keiro-migrate`, `keiro-write-expected-schema`, the `keiro-migrations/expected-schema` tree, and the forward-only SQL files under `/Users/shinzui/Keikaku/bokuno/keiro/keiro-migrations/sql-migrations/`.
