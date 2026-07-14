---
id: 42
slug: refresh-keiro-orchestration-delivery-and-operations-reliability-documentation
title: "Refresh keiro orchestration delivery and operations reliability documentation"
kind: exec-plan
created_at: 2026-07-14T15:14:31Z
intention: "intention_01kxgjsgnse1z9r0w141akd9g2"
master_plan: "docs/masterplans/6-prepare-keiro-runtime-documentation-for-wider-announcement.md"
---

# Refresh keiro orchestration delivery and operations reliability documentation

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, the keiro docs explain what happens when asynchronous coordination succeeds,
retries, rejects, dead-letters, rebalances, or resumes after a crash. Readers can choose explicit
process-manager and router rejection policies, understand target-scoped idempotency, run
acknowledgement-aware sharded subscriptions, replay durable dead letters, and operate workflows and
worker telemetry without relying on behavior that the 0.2 runtime changed. The result is visible in
end-to-end failure-path recipes and walkthroughs whose outcomes match source tests: no checkpoint
passes an unprocessed event, no cross-stream duplicate is silently accepted, and post-commit
workflow snapshot failure does not undo durable journal progress.


## Progress



## Surprises & Discoveries

(None yet.)


## Decision Log

- Decision: Use committed keiro SHA `87bf3ff173b2f4ce274e36cea64923ad33817d7c` and exclude
  upstream working-tree modifications.
  Rationale: The source boundary must be reproducible and shared with the other keiro plans.
  Date: 2026-07-14
- Decision: Group process managers, routers, sharded subscriptions, dead letters, workflows, and
  worker operations by delivery guarantee rather than by module.
  Rationale: These features share acknowledgement, retry, idempotency, poison-event, and telemetry
  semantics; a user needs one coherent failure taxonomy across them.
  Date: 2026-07-14
- Decision: Preserve `RejectedHalt` as the documented conservative default and present skip and
  dead-letter as explicit policies with tradeoffs.
  Rationale: The source defaults do not silently discard rejected target commands. Documentation
  must not make a convenience example less safe than the shipped default.
  Date: 2026-07-14


## Outcomes & Retrospective

(To be filled during and after implementation.)


## Context and Orientation

The keiro documentation tree is `content/docs/keiro/`; its source pointer is
`docs/keiro-source-sync.md`, currently at `601f9f3`. Resolve the registered source with
`mori registry show shinzui/keiro --full`. During planning it resolved to
`/Users/shinzui/Keikaku/bokuno/keiro`, committed at `87bf3ff`, with unrelated uncommitted files that
must not be used as documentation evidence.

A process manager is an event-sourced coordinator that observes one stream and emits commands to
other aggregates. A router is a stateless, effectful fan-out coordinator. Their implementation is
in `keiro/src/Keiro/ProcessManager.hs` and `keiro/src/Keiro/Router.hs`. Keiro 0.2 adds
`RejectedCommandPolicy`: `RejectedHalt`, `RejectedDeadLetter`, or `RejectedSkip`.
`PMCommandFailed` and `DispatchFailure` retain the target `StreamName`, and
`confirmBenignDuplicate` checks the intended target before a duplicate event ID is accepted.
Routers derive deterministic command IDs from target stream identity and same-stream occurrence,
not list position. The transition probe for legacy positional IDs is an upgrade bridge, not a
permanent exactly-once claim when both deployment code and resolver output change together.

Durable rejected dispatches live in `keiro/src/Keiro/DeadLetter.hs` and
`Keiro/DeadLetter/Schema.hs`. They are separate from Kiroku subscription dead letters.
`Keiro/DeadLetter/Replay.hs` provides `replaySubscriptionDeadLetters` for Kiroku-owned rows without
deleting those rows. The distinction matters operationally: a rejected target command, an exhausted
subscription event, a poison payload, and a transient store failure require different remediation.

Sharded subscription workers are in `keiro/src/Keiro/Subscription/Shard/Worker.hs`.
`runShardedSubscriptionGroupAck` delivers a `ShardDelivery` and expects `ShardAck`. Its
`ShardedWorkerOptions` includes `handlerRetryDelay` and bounded `retryPolicy`. Checkpoints advance
only after the handler acknowledges, so bucket shedding or rebalance cannot checkpoint over an
unfinished event. Retry exhaustion goes through the configured Kiroku dead-letter path. The older
`runShardedSubscriptionGroup` remains a compatibility wrapper for handlers that always succeed.

Workflow reliability is centered in `keiro/src/Keiro/Workflow.hs`, `Workflow/Resume.hs`,
`Workflow/Snapshot.hs`, `Workflow/Child.hs`, and `Workflow/Types.hs`. `runWorkflow`,
`runWorkflowWith`, and child workflow execution require `Error StoreError` so a post-commit
snapshot failure is caught inside the typed channel. Journal appends remain durable truth; snapshot
writes after steps, completion, and `continueAsNew` rotation are advisory and counted. Existing
resume, lease, sleep, awakeable, child, patch, and rotation behavior remains relevant and must be
checked for signature drift rather than rewritten gratuitously.

Operations cross the inbox, outbox, timer, and telemetry modules. The 0.2 source documents that
inbox deduplication ends after completed-row garbage collection, outbox timestamps are transaction
start time and ordering is best-effort without caller serialization, default timer processing has
no attempt ceiling and requeues `Firing` rows after five minutes, and process-manager correlation
must be order-insensitive. `Keiro.Telemetry.kirokuEventBridge` observes terminal subscription retry
exhaustion, and counters include dispatch/subscription dead letters plus snapshot and replay
failures.

The most coupled docs are the process-manager, router, subscription-sharding, durable-workflow,
inbox, outbox, timers, and telemetry reference pages; worker, routing, dead-letter, workflow, and
OpenTelemetry how-tos; matching explanations and cookbook recipes; and the workflow, scaling,
integration, durable-execution, and operations walkthroughs.


## Plan of Work

Milestone 1 refreshes process-manager and router delivery. Update
`content/docs/keiro/reference/process-manager.mdx`, `reference/router.mdx`,
`explanation/process-managers-and-sagas.mdx`, `explanation/routers-and-content-based-dispatch.mdx`,
`how-to/run-a-process-manager-as-a-subscription.mdx`, `how-to/route-events-to-commands.mdx`, and the
related cookbook and walkthrough pages. Document target-bearing failures, the three rejection
policies, durable dispatch dead letters, target-scoped duplicate confirmation, target-derived router
IDs, and the upgrade-window caveat. Add a concrete operator path that locates a dead-lettered target,
distinguishes an aggregate ambiguity from transient infrastructure failure, and decides whether to
repair/replay or retain the witness. Acceptance is an example where an unconfirmed cross-stream
collision halts or dead-letters instead of being acknowledged as benign.

Milestone 2 refreshes sharded delivery and subscription dead-letter operations. Update
`content/docs/keiro/reference/subscription-sharding.mdx`,
`explanation/scaling-the-workers.mdx`, `how-to/run-sharded-subscriptions.mdx`, scaling walkthroughs,
telemetry pages, and any enqueue-from-subscription recipe. Teach `ShardDelivery`, `ShardAck`, handler
retry delay, bounded policy, retry exhaustion, acknowledgement-coupled checkpointing, and the
compatibility wrapper. Add a how-to or cookbook section for `replaySubscriptionDeadLetters` that
states rows are not deleted and cursors are opaque. Acceptance is a rebalance/handler-retry
timeline showing that an event is either acknowledged and checkpointed, retried, or durably
dead-lettered—never checkpointed first.

Milestone 3 refreshes workflow and cross-worker operations. Update
`content/docs/keiro/reference/durable-workflows.mdx`, `reference/inbox.mdx`,
`reference/outbox.mdx`, `reference/timers.mdx`, `reference/telemetry.mdx`,
`explanation/durable-execution.mdx`, workflow and durable-execution walkthroughs, workflow how-tos
and recipes, and `faq.mdx`. Explain the required typed store-error channel, journal-versus-snapshot
commit boundary, advisory workflow snapshot failures, and telemetry. Audit inbox GC, outbox ordering,
timer retry, and correlation claims against source and add prominent production caveats where the
old docs leave dangerous defaults implicit. Acceptance is an operations checklist that tells a
reader what is durable, what can be retried, what can be dropped only by explicit policy, and which
metric or dead-letter table proves each terminal outcome.


## Concrete Steps

Work from `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` and verify source before edits:

```bash
mori registry show shinzui/keiro --full
KEIRO=/Users/shinzui/Keikaku/bokuno/keiro
git -C "$KEIRO" status --short
git -C "$KEIRO" rev-parse HEAD
git -C "$KEIRO" log --oneline 601f9f3..HEAD
```

The planned committed SHA is:

```text
87bf3ff173b2f4ce274e36cea64923ad33817d7c
```

Use targeted source checks rather than relying on names from memory:

```bash
rg -n 'data RejectedCommandPolicy|data DispatchFailure|confirmBenignDuplicate' "$KEIRO/keiro/src/Keiro/ProcessManager.hs"
rg -n 'deterministicRouterCommandId|confirmBenignDuplicate' "$KEIRO/keiro/src/Keiro/Router.hs"
rg -n 'data ShardAck|runShardedSubscriptionGroupAck|retryPolicy' "$KEIRO/keiro/src/Keiro/Subscription/Shard/Worker.hs"
rg -n 'replaySubscriptionDeadLetters|continueAsNew|snapshot.*failure|kirokuEventBridge' "$KEIRO/keiro/src"
```

After each milestone run:

```bash
pnpm run typecheck
pnpm run format:check
pnpm build
node scripts/check-doc-links.mjs
git diff --check
```

Each command must exit zero. The link checker should report no missing `/docs` target and
`git diff --check` should emit no output.


## Validation and Acceptance

The docs are accepted when readers can answer, from one consistent failure taxonomy, all of these
questions: which command failures are retryable; why ambiguity is not ordinary rejection; how a
duplicate is confirmed against its intended stream; where rejected dispatches and exhausted
subscription events are stored; when a shard checkpoint advances; what happens during rebalance;
and why a workflow snapshot failure after journal commit does not roll the workflow back.

Run these focused checks and inspect every match:

```bash
rg -n 'RejectedCommandPolicy|RejectedDeadLetter|confirmBenignDuplicate|deterministicRouterCommandId' content/docs/keiro
rg -n 'runShardedSubscriptionGroupAck|ShardAck|handlerRetryDelay|retryPolicy' content/docs/keiro
rg -n 'replaySubscriptionDeadLetters|keiro\.dispatch\.deadlettered|keiro\.subscription\.deadlettered' content/docs/keiro
rg -n 'post-commit|advisory snapshot|snapshot.write.failures' content/docs/keiro
```

At least one task-oriented page, one reference page, and one explanation or walkthrough must cover
each major delivery surface. Run `pnpm run typecheck`, `pnpm build`,
`node scripts/check-doc-links.mjs`, and `git diff --check`. Record the reviewed SHA, affected pages,
and handoffs to EP-4 and EP-7 in the living sections; do not advance `docs/keiro-source-sync.md`.


## Idempotence and Recovery

Documentation edits and validation commands are repeatable. Keep examples additive until all
incoming links and navigation entries are correct. If two plans touch a shared page, preserve both
source-backed concerns and reconcile terminology rather than overwriting one. Never edit or clean
the upstream working tree. If a claim about exactly-once delivery cannot be proven from source and
tests, state the narrower at-least-once/idempotency contract.


## Interfaces and Dependencies

The source dependency is `shinzui/keiro`, with supporting contracts in `shinzui/kiroku` and
`shinzui/shibuya`, all resolved through mori. Public modules in scope are `Keiro.ProcessManager`,
`Keiro.Router`, `Keiro.DeadLetter`, `Keiro.DeadLetter.Replay`,
`Keiro.Subscription.Shard.Worker`, `Keiro.Workflow`, `Keiro.Workflow.Resume`,
`Keiro.Workflow.Snapshot`, `Keiro.Inbox`, `Keiro.Outbox`, `Keiro.Timer`, and `Keiro.Telemetry`.
Confirm all signatures at the selected SHA.

This plan has a soft dependency on
`docs/plans/41-refresh-keiro-command-replay-snapshot-and-read-model-reliability-documentation.md`
for command error terminology. Its worker policies are consumed by
`docs/plans/43-rebuild-keiro-dsl-0-2-authoring-and-evolution-documentation.md`. Migration and final
source-pointer updates belong to plans 45 and 46. The completed documentation interface is a
consistent set of task and reference pages where delivery outcomes, durable records, acknowledgement
points, retries, and telemetry use the same names everywhere.
