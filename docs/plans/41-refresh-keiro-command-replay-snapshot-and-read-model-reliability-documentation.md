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



## Surprises & Discoveries

(None yet.)


## Decision Log

- Decision: Review committed keiro SHA `87bf3ff173b2f4ce274e36cea64923ad33817d7c`, while
  excluding its four uncommitted files observed during planning.
  Rationale: Source-sync documentation must be reproducible and must not absorb the user's
  in-progress changes to `cabal.project`, `keiro-pgmq`, or test support.
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

(To be filled during and after implementation.)


## Context and Orientation

The docs site keeps keiro content under `content/docs/keiro/` and its last source review in
`docs/keiro-source-sync.md`, currently pinned to
`601f9f36f016d6c9f3f762cda093f65f7dea5225`. Resolve source with
`mori registry show shinzui/keiro --full`; during planning it was
`/Users/shinzui/Keikaku/bokuno/keiro`. The committed range to `87bf3ff` contains 125 commits and the
0.2.0.0 release, so this is not a pointer-only refresh.

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

The upstream status included four user-owned modifications. Do not read those diffs as released
API. If the changes become committed before implementation, extend the review deliberately and
record the new SHA. Use these source and docs searches to build the edit map:

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
