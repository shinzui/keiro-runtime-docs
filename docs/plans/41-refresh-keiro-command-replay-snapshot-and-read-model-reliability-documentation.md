---
id: 41
slug: refresh-keiro-command-replay-snapshot-and-read-model-reliability-documentation
title: "Refresh keiro command replay snapshot and read-model reliability documentation"
kind: exec-plan
created_at: 2026-07-14T15:14:31Z
intention: "intention_01kxgjsgnse1z9r0w141akd9g2"
master_plan: "docs/masterplans/6-prepare-keiro-runtime-documentation-for-wider-announcement.md"
---

# Refresh keiro command replay snapshot and read-model reliability documentation

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, readers can build and operate the keiro 0.2 command and read side with the
failure semantics the runtime actually enforces. The docs will show typed hydration failures and
command ambiguity, append-time replay verification, event enrichment in transactional runners,
advisory snapshot failure behavior, explicit read-model registration, category-scoped strong reads,
atomic rebuild fencing, and schema-qualified projection tables. A reader can verify the result by
running the updated command and read-model examples, seeing the documented outcomes and telemetry,
and finding the same types and defaults in the reviewed keiro source.


## Progress

- [x] (2026-07-14T16:37:38Z) Resolve `shinzui/keiro` through mori and review the clean committed
  `c68dcc7b9cea8d9c180d1c04254a72aa43804cac` boundary. The two commits after the planned SHA release
  the package set at 0.3.0.0 but make no source change to `keiro` or `keiro-core`; EP-2's 0.2 state
  integrity contracts are unchanged.
- [x] (2026-07-14T16:49:29Z) Milestone 1: refresh event-stream validation, hydration, and command
  failures. Documented keiro's forced validation floor, unchecked boundary, typed replay reasons,
  truncation gaps, command ambiguity, no-op positions, post-commit replay evidence, and resource-aware
  transactional enrichment; added the command/replay diagnosis how-to.
- [x] (2026-07-14T16:56:24Z) Milestone 2: refresh snapshot correctness and recovery behavior.
  Documented observable lookup reasons, forced initial/post-command encoding, advisory failure
  outcomes, rollback-aware row replacement, the keiki 0.2 one-time shape miss, and the complete
  snapshot/replay telemetry surface.
- [x] (2026-07-14T17:05:09Z) Milestone 3: refresh read models, projections, and rebuild operations.
  Documented explicit startup registration, application-schema qualification, strong scopes,
  fenced async outcomes, dedup retention, and the atomic start/unfenced-replay/guarded-finish
  lifecycle.
- [x] (2026-07-14T17:05:09Z) Run the complete EP-2 validation and stale-claim scans, then record the
  EP-7 handoff. All site gates passed; the only `globalPosition.*GlobalPosition 0` scan match is the
  intentional warning not to fabricate that value for no-op results.

## Surprises & Discoveries

- The old source tour carried a removed `Replay` accumulator and a `globalPosition` field on
  `Hydrated`. Current hydration delegates page replay to keiki's structured `replayEvents` and tracks
  only per-stream version, which is why no-op results must use `globalPosition = Nothing` even for a
  non-empty stream.
- `runCommand` and the SQL runners share enrichment behavior but not the same interpreter constraint:
  only `runCommandWithSql` and `runCommandWithSqlEvents` require `KirokuStoreResource`. The guide now
  shows `withKirokuStore` plus `runStoreResource` without incorrectly adding the resource to the
  append-only signature.
- Snapshot stream-version non-regression is not global. The upsert ignores a lower version only when
  codec version and shape hash are unchanged; an incompatible row may replace a newer one so a
  rolled-back binary can reclaim the single cache slot. Mixed-version deployments can therefore
  thrash cache rows while preserving event-log correctness.
- `finishRebuild` is a narrow catastrophic-empty-replay guard, not proof of replay completeness. It
  counts newly recreated dedup keys and prevents promotion only when the log advanced beyond
  `replayFrom` but named async projections applied nothing. Operators still verify the application
  table and subscription cursor before promotion.
- The read-model `schema` is application runtime configuration, not stored registry identity.
  Keiro's metadata and dedup tables stay in `keiro`, Kiroku's store and cursor tables stay in
  `kiroku`, and all application projection SQL must qualify its separate data schema.


## Decision Log

- Decision: Review committed keiro SHA `c68dcc7b9cea8d9c180d1c04254a72aa43804cac`.
  Rationale: The source advanced cleanly by two commits after the planned `87bf3ff` boundary. The
  0.3.0.0 release realigns migration/PGMQ dependencies and test-support migration setup, but its
  changelog explicitly records no user-facing or source changes to `keiro` or `keiro-core`. The
  command, snapshot, and read-side contracts in this plan remain the 0.2 APIs at a newer reproducible
  release boundary.
  Date: 2026-07-14
- Decision: Split keiro 0.2 documentation by failure domain.
  Rationale: Command hydration, replay, snapshots, projections, and read models form a state
  integrity path that is independently teachable and testable. Worker coordination and durable
  delivery belong to `docs/plans/42-refresh-keiro-orchestration-delivery-and-operations-reliability-documentation.md`.
  Date: 2026-07-14
- Decision: Document read-model schema qualification here but defer the pg-migrate component,
  operator CLI, and physical framework-schema cutover to
  `docs/plans/45-reconcile-runtime-migrations-kiroku-pgmq-shibuya-and-adapters.md`.
  Rationale: Application query qualification affects the read-side API; migration ownership is a
  cross-package operational concern.
  Date: 2026-07-14


## Outcomes & Retrospective

- Milestone 1 established one failure taxonomy across reference, explanation, tutorial, how-to, FAQ,
  and source walkthrough pages. `CommandRejected` is a no-match domain outcome;
  `CommandAmbiguous` is a definition defect; stored-history problems retain their replay reason or
  gap coordinates; and append-time divergence is explicitly post-commit telemetry evidence.
- Milestone 1 validation passed `pnpm run typecheck`, `pnpm run format:check`, `pnpm build`, the
  448-file internal-link scan, and `git diff --check`.
- Milestone 2 added a committed-state/result/fallback/metric matrix and made the distinction between
  benign lookup fallback, post-commit snapshot failure, and poisoned-stream replay divergence
  consistent across reference, explanation, how-to, FAQ, telemetry, and source walkthrough pages.
  Validation again passed typecheck, formatting, production build, the 448-file link scan, and
  `git diff --check`.
- Milestone 3 replaced the obsolete auto-registration, bare async transaction, and status-only
  rebuild stories across 12 reference, tutorial, how-to, explanation, integration, and source-tour
  pages. The canonical live-worker disposition is now `AsyncApplied`/`AsyncDuplicate` => acknowledge
  and checkpoint, `AsyncFenced` => fail or park without checkpoint; the canonical rebuild is
  `startRebuild`, replay through `applyAsyncProjectionUnfenced`, verify, then guarded
  `finishRebuild`.
- Final EP-2 validation passed `pnpm run typecheck`, `pnpm run format:check`, `pnpm build`, the
  448-file internal-link scan, and `git diff --check`. The EP-7 handoff is source boundary
  `c68dcc7b9cea8d9c180d1c04254a72aa43804cac`; announcement vocabulary should retain
  `CommandAmbiguous`, typed `HydrationReplayReason`, post-commit replay evidence, advisory snapshot
  fallback, `ReadModelUnregistered`, `StrongScope`, and the three `AsyncApplyOutcome` constructors.


## Context and Orientation

The docs site keeps keiro content under `content/docs/keiro/` and its last source review in
`docs/keiro-source-sync.md`, currently pinned to
`601f9f36f016d6c9f3f762cda093f65f7dea5225`. Resolve source with
`mori registry show shinzui/keiro --full`; during planning it was
`/Users/shinzui/Keikaku/bokuno/keiro`. The committed range to `c68dcc7` contains 127 commits and the
0.2.0.0 state-integrity release followed by a dependency-only 0.3.0.0 package-set release, so this is
not a pointer-only refresh.

`keiro-core/src/Keiro/EventStream/Validate.hs` is the durable boundary between keiki and keiro.
`ValidatedEventStream` construction now force-enables keiki 0.2's head-recoverability and
state-changing-silent-edge checks, and treats all validation warnings as startup rejection. The
unsafe constructor is for tests and forensics only. The keiki meanings are owned by
`docs/plans/40-refresh-keiki-0-2-correctness-replay-and-persistence-documentation.md`; this plan
documents how keiro exposes them.

`keiro/src/Keiro/Command.hs` owns hydration, command decision, append, retry, and snapshots.
`CommandError` now includes `CommandAmbiguous`; `HydrationReplayFailed` carries a typed
`HydrationReplayReason` for no inverse, ambiguous inverse, queue mismatch, or truncated multi-event
history; and per-stream truncation can produce `HydrationGapDetected` unless a snapshot covers the
hidden prefix. `RunCommandOptions.verifyReplayOnAppend` defaults to `True`, replaying the committed
batch from the pre-command state and recording divergence without falsely turning an already
committed command into failure. A no-op command reports `CommandResult.globalPosition = Nothing`.
Transactional command variants require `KirokuStoreResource` so Kiroku's `enrichEvent` hook is
applied consistently before append and before callbacks observe events.

Snapshots are an advisory cache, not durable truth. `keiro/src/Keiro/Snapshot.hs` and
`keiro/src/Keiro/Snapshot/Codec.hs` retain miss and decode reasons; incompatible codec versions or
shape hashes fall back to event replay. Initial and post-command encodes are forced. A post-commit
encode or store failure is swallowed and counted because the event append already succeeded.
`keiro/src/Keiro/Telemetry.hs` names the hit, miss, decode, encode, write, and replay-divergence
instruments. The keiki 0.2 stable shape-name change causes a one-time benign miss for old non-empty
snapshot hashes.

The read side spans `keiro/src/Keiro/ReadModel.hs`, `Keiro/ReadModel/Schema.hs`,
`Keiro/ReadModel/Rebuild.hs`, `Keiro/Projection.hs`, and `Keiro/Connection.hs`. A `ReadModel` now has
an application table `schema` and `strongScope`; `CategoryHead category` prevents unrelated global
traffic from blocking strong reads. Applications must call `registerReadModel` at startup; queries
return `ReadModelUnregistered` instead of mutating the registry. `AsyncProjection` names its read
model, and `applyAsyncProjection` returns `AsyncApplied`, `AsyncDuplicate`, or `AsyncFenced`; a live
worker must not checkpoint `AsyncFenced`. A rebuild uses atomic `startRebuild`, replays through
`applyAsyncProjectionUnfenced`, and calls guarded `finishRebuild`. `qualifiedTableName`,
`qualifyTable`, `withProjectionSchema`, and related helpers keep application tables out of the
framework schema.

The most coupled pages are `content/docs/keiro/reference/command.mdx`,
`reference/event-stream-and-stream.mdx`, `reference/snapshot.mdx`, `reference/projection.mdx`,
`reference/read-model.mdx`, `reference/telemetry.mdx`, the command-cycle and read-side walkthroughs,
and the matching tutorials, how-tos, explanations, cookbook recipes, FAQ, and integration pages.
They currently predate part or all of these 0.2 contracts.


## Plan of Work

Milestone 1 refreshes event-stream validation, hydration, and the command result/error model. Update
`content/docs/keiro/reference/event-stream-and-stream.mdx`, `reference/command.mdx`,
`explanation/the-command-cycle.mdx`, and the command-cycle/foundation walkthroughs to teach the
keiki 0.2 validation floor, typed replay reasons, ambiguity, truncation gaps, no-op positions, and
the unsafe-constructor boundary. Update `how-to/run-a-command-in-a-transaction.mdx` and any
transactional tutorial for `withKirokuStore`, `KirokuStoreResource`, `runStoreResource`, and
enrichment consistency. Add or expand a replay-safety how-to that shows how to classify an ordinary
rejection, an aggregate-definition ambiguity, corrupt/incomplete history, and append replay
divergence. Acceptance requires that the documented patterns match the source constructors and that
the reader is never told an ambiguous command is a benign rejection.

Milestone 2 refreshes snapshot behavior. Update `content/docs/keiro/reference/snapshot.mdx`,
`explanation/consistency-and-snapshots.mdx`, `how-to/add-a-snapshot.mdx`, the command-cycle and
read-side snapshot walkthroughs, `faq.mdx`, and telemetry reference. Explain initial codec
validation, forced encode timing, advisory post-commit failures, detailed lookup outcomes, the
scope of version non-regression, rollback replacement, keiki 0.2 shape-hash misses, and
`verifyReplayOnAppend`. Include an operator-facing table mapping failures to committed state,
caller-visible result, fallback, and metric. Acceptance is a scenario in which an incompatible or
undecodable snapshot is a miss followed by full replay, while a post-commit write failure leaves the
command successful and increments the documented counter.

Milestone 3 refreshes read models, projections, and rebuilds. Update
`content/docs/keiro/reference/read-model.mdx`, `reference/projection.mdx`,
`explanation/projections-read-models-and-snapshots.mdx`, `explanation/consistency-and-snapshots.mdx`,
`tutorials/your-first-read-model.mdx`, `how-to/choose-a-consistency-mode.mdx`,
`how-to/make-an-async-projection-idempotent.mdx`, `how-to/rebuild-a-read-model.mdx`, and the
read-side walkthrough. Teach explicit registration, `schema`, `StrongScope`, category-head waits,
qualified application SQL, writer fencing, outcomes, and the start/replay/finish rebuild protocol.
Update the keiro-with-kiroku and keiro-with-keiki integration pages only where this state-integrity
path requires it. Acceptance is a complete lifecycle: register, process live events, start a rebuild
atomically, refuse/fence concurrent live writes without checkpointing them, replay unfenced, finish
guardedly, then serve a strong category-scoped query.


## Concrete Steps

Work from `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`. Verify the source boundary first:

```bash
mori registry show shinzui/keiro --full
KEIRO=/Users/shinzui/Keikaku/bokuno/keiro
git -C "$KEIRO" status --short
git -C "$KEIRO" rev-parse HEAD
git -C "$KEIRO" log --oneline 601f9f3..HEAD
git -C "$KEIRO" diff --stat 601f9f3..HEAD
```

At planning time the committed SHA was:

```text
87bf3ff173b2f4ce274e36cea64923ad33817d7c
```

Implementation reviewed the clean successor `c68dcc7b9cea8d9c180d1c04254a72aa43804cac`; its two
additional commits do not alter `keiro` or `keiro-core` source. Use these source and docs searches to
build the edit map:

```bash
rg -n 'data CommandError|data HydrationReplayReason|data RunCommandOptions' "$KEIRO/keiro/src/Keiro/Command.hs"
rg -n 'data StrongScope|data AsyncApplyOutcome|registerReadModel|startRebuild|finishRebuild' "$KEIRO/keiro/src"
rg -n 'HydrationReplay|CommandAmbiguous|verifyReplayOnAppend|ReadModelUnregistered|AsyncFenced' content/docs/keiro
rg -n 'snapshot.*failure|StrongScope|registerReadModel|qualifiedTableName' content/docs/keiro
```

After each milestone run:

```bash
pnpm run typecheck
pnpm run format:check
pnpm build
node scripts/check-doc-links.mjs
git diff --check
```

Expected success is exit status zero from every command, no broken `/docs` target, and no whitespace
diagnostic from `git diff --check`.


## Validation and Acceptance

The command documentation is accepted when a reader can predict these outcomes: one matching edge
may append; no matching edge is rejection; multiple matching edges are `CommandAmbiguous`; a hidden
prefix without a covering snapshot is `HydrationGapDetected`; a malformed persisted multi-event
chain reports a typed hydration reason; a no-op has no global position; and a replay divergence
after commit is telemetry evidence, not a rollback claim.

The snapshot documentation is accepted when it never treats snapshot storage as the source of
truth and accurately separates pre-append validation from post-commit advisory failures. The read
side is accepted when every example registers models explicitly, includes `schema` and
`strongScope`, qualifies application SQL, handles all three `AsyncApplyOutcome` constructors, and
does not advance a live checkpoint on `AsyncFenced`.

Run focused stale-claim scans. These should return no obsolete claim; any occurrence must be
explained in the plan's Surprises section:

```bash
rg -n 'missing read models are automatically registered|globalPosition.*GlobalPosition 0' content/docs/keiro
rg -n 'applyAsyncProjection.*Bool|checkpoint.*AsyncFenced.*continue' content/docs/keiro
rg -n 'HydrationReplayFailed[^\n]*version only|ambiguous.*CommandRejected' content/docs/keiro
```

Run `pnpm run typecheck`, `pnpm build`, `node scripts/check-doc-links.mjs`, and
`git diff --check`. Record the reviewed SHA and a concise handoff of page changes and new canonical
terms for EP-7. Do not update `docs/keiro-source-sync.md` in this plan because EP-3, EP-4, and EP-6
also edit the keiro story.


## Idempotence and Recovery

The work changes documentation only and every check is repeatable. Preserve unrelated user edits.
When two milestones touch the same page, finish the page against both source modules rather than
reverting the earlier milestone. If source moves, pin one committed boundary and record it. If a
sample cannot be verified from a public export or upstream test, omit or narrow the sample rather
than guessing. Do not edit the upstream keiro repository.


## Interfaces and Dependencies

Source dependencies are `shinzui/keiro`, `shinzui/keiki`, and `shinzui/kiroku`, resolved through
mori. The public modules in scope are `Keiro.EventStream.Validate`, `Keiro.Command`,
`Keiro.Snapshot`, `Keiro.Snapshot.Codec`, `Keiro.ReadModel`, `Keiro.ReadModel.Schema`,
`Keiro.ReadModel.Rebuild`, `Keiro.Projection`, `Keiro.Connection`, and `Keiro.Telemetry`. Confirm
signatures from their export lists at the selected SHA.

This plan has an integration dependency on
`docs/plans/40-refresh-keiki-0-2-correctness-replay-and-persistence-documentation.md` for keiki
terminology and a soft handoff to
`docs/plans/42-refresh-keiro-orchestration-delivery-and-operations-reliability-documentation.md` for
worker failure dispositions. Migration runners and source pins belong to
`docs/plans/45-reconcile-runtime-migrations-kiroku-pgmq-shibuya-and-adapters.md` and
`docs/plans/46-prepare-announcement-navigation-compatibility-and-whole-site-release-gate.md`.

No Haskell interface changes. The documentation interface must present consistent constructor
names, lifecycle order, and observable outcomes across reference, tutorial, how-to, explanation,
cookbook, and walkthrough pages.
