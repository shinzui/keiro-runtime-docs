---
id: 32
slug: refresh-keiro-messaging-workers-and-pgmq-documentation
title: "Refresh Keiro messaging workers and PGMQ documentation"
kind: exec-plan
created_at: 2026-06-15T19:08:29Z
intention: intention_01kv6bpntyeh98ta4k2famkdm9
master_plan: "docs/masterplans/4-refresh-keiro-and-kiroku-documentation-after-june-hardening.md"
---

# Refresh Keiro messaging workers and PGMQ documentation

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this plan is implemented, Keiro users can operate and document the current messaging and worker surfaces: inbox, outbox, timer, subscription shards, router/process-manager delivery, and `keiro-pgmq` background jobs. The docs will reflect the June 2026 hardening range that added worker option validation, crash recovery, poison-message accounting, stranded outbox reclamation, sent-row pruning, stale timer requeueing, shard reader survival across lease errors, process-manager/router delivery correctness, PGMQ decode classification, retry tuning validation, headers, batch enqueue, trace propagation, queue provisioning, FIFO ordering via message groups, DLQ inspection/redrive, queue metrics, archive/retention APIs, and delivery semantics.

The user-visible proof is that the messaging reference, how-to, cookbook, tutorial, and walkthrough pages under `content/docs/keiro/` describe the current source under `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/` and `/Users/shinzui/Keikaku/bokuno/keiro/keiro-pgmq/src/Keiro/PGMQ/`.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [x] Audit the Keiro messaging and `keiro-pgmq` commits from `9fa283b..HEAD`.
- [x] Update inbox, outbox, timer, shard, router, and process-manager worker docs for current delivery and crash-recovery behavior.
- [x] Update PGMQ reference/tutorial/how-to/cookbook docs for current queue, codec, retry, headers, FIFO, DLQ, metrics, and retention APIs.
- [x] Update integration docs or record cross-link needs for EP-6.
- [x] Run docs validation commands and record results.


## Surprises & Discoveries

- The outbox no longer needs a manual stranded-publishing runbook for ordinary worker crashes. Current
  `publishClaimedOutbox` reclaims stale `Publishing` rows before claiming new work, and
  `garbageCollectSent` handles sent-row pruning.
- `keiro-pgmq` grew from a small typed job wrapper into a broader queue toolkit: `RetryDefault`,
  classified `JobDecodeError`, `JobTuning`, producer headers, batch enqueue, trace propagation,
  FIFO message groups, queue provisioning, DLQ inspection/redrive/archive, and queue metrics all
  needed first-class documentation.
- Router and process-manager workers now classify transient store/command failures for retry while
  halting deterministic failures. Their ack handles are finalized exactly once, so older docs that
  treated any `PMCommandFailed` as fatal were stale.
- Sharded subscription workers survive lease and reader errors via `onShardError` reporting and
  reconciliation, while the inbox retry wrapper separately records failed handler attempts and
  poisoned messages.


## Decision Log

Record every decision made while working on the plan.

- Decision: Keep `keiro-pgmq` and core worker hardening together.
  Rationale: Both are operational messaging surfaces with overlapping retry, dead-letter, trace propagation, queue, and delivery-semantics language.
  Date: 2026-06-15


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

Completed on 2026-06-15 against `shinzui/keiro` commit
`f1d67a01b7457387a4861e7268d1c521ef82287d`. The updated docs cover current inbox retry
accounting, outbox stale-publishing reclaim and sent-row GC, sharded reader recovery,
router/process-manager delivery classification, telemetry counters, and the expanded `keiro-pgmq`
surface for codec errors, retry tuning, producer metadata, queue provisioning, FIFO ordering, DLQ
operations, and metrics.

Validation passed with `pnpm run typecheck`, `pnpm run format:check`, `pnpm build`, `git diff
--check`, and a focused stale-claim scan for superseded stranded-outbox, decode, queue-metric, and
process-manager failure wording. EP-6 still owns final source-sync pointer updates and broad
integration reconciliation.


## Context and Orientation

This repository documents Keiro under `content/docs/keiro/`. Resolve source with `mori registry show shinzui/keiro --full`; the current local source path is `/Users/shinzui/Keikaku/bokuno/keiro`.

The inbox pattern records inbound integration messages so duplicate deliveries can be ignored or retried safely. The outbox pattern records outbound integration messages inside the same transaction as domain work and publishes them later. A timer worker claims due timer rows and fires process-manager timer events. A shard worker uses leased database rows to divide subscription work across workers. A router maps an input event to zero or more target commands. A process manager is a stateful workflow over events that may issue commands and timers. PGMQ is a PostgreSQL-backed message queue used by `keiro-pgmq` for typed background jobs.

The source files that matter for core messaging and workers are:

- `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Inbox.hs`, `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Inbox/Types.hs`, `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Inbox/Schema.hs`, and `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Inbox/Kafka.hs`.
- `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Outbox.hs`, `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Outbox/Types.hs`, `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Outbox/Schema.hs`, and `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Outbox/Kafka.hs`.
- `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Timer.hs`, `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Timer/Types.hs`, and `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Timer/Schema.hs`.
- `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Subscription/Shard.hs`, `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Subscription/Shard/Worker.hs`, and `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Subscription/Shard/Schema.hs`.
- `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Router.hs` and `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/ProcessManager.hs`.
- `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Telemetry.hs` for worker metrics.

The `keiro-pgmq` files are `/Users/shinzui/Keikaku/bokuno/keiro/keiro-pgmq/src/Keiro/PGMQ.hs`, `Runtime.hs`, `Codec.hs`, `Job.hs`, `Dlq.hs`, and `Metrics.hs`, plus `/Users/shinzui/Keikaku/bokuno/keiro/keiro-pgmq/test/Main.hs`.

The docs most likely to need edits are `content/docs/keiro/reference/inbox.mdx`, `content/docs/keiro/reference/outbox.mdx`, `content/docs/keiro/reference/timers.mdx`, `content/docs/keiro/reference/subscription-sharding.mdx`, `content/docs/keiro/reference/router.mdx`, `content/docs/keiro/reference/process-manager.mdx`, `content/docs/keiro/reference/pgmq-jobs.mdx`, `content/docs/keiro/reference/telemetry.mdx`, `content/docs/keiro/explanation/background-jobs-with-pgmq.mdx`, `content/docs/keiro/explanation/the-inbox-pattern.mdx`, `content/docs/keiro/explanation/the-outbox-pattern.mdx`, `content/docs/keiro/explanation/scaling-the-workers.mdx`, `content/docs/keiro/how-to/declare-a-background-job.mdx`, `content/docs/keiro/how-to/dead-letter-and-retry-jobs.mdx`, `content/docs/keiro/how-to/version-a-job-payload.mdx`, `content/docs/keiro/how-to/choose-a-job-run-cadence.mdx`, `content/docs/keiro/how-to/publish-with-the-outbox.mdx`, `content/docs/keiro/how-to/choose-an-outbox-ordering-policy.mdx`, `content/docs/keiro/how-to/choose-an-inbox-dedupe-policy.mdx`, `content/docs/keiro/how-to/run-sharded-subscriptions.mdx`, `content/docs/keiro/tutorials/your-first-background-job.mdx`, `content/docs/keiro/cookbook/scheduled-job-drain.mdx`, `content/docs/keiro/cookbook/transactional-job-enqueue.mdx`, and walkthroughs under `content/docs/keiro/walkthrough/integration/`, `workflow/`, and `scaling/`.


## Plan of Work

Milestone 1 audits source and tests. Read the modules listed above and group changes into inbox/outbox crash recovery, timer/shard recovery, router/process-manager delivery, telemetry, and PGMQ queue semantics. The milestone is complete when every current behavior to document has source or test evidence.

Milestone 2 updates core messaging worker docs. Update inbox, outbox, timer, shard, router, and process-manager pages for worker option validation, poison retry accounting, outbox stranded-row reclamation and sent pruning, stale timer requeueing, shard lease error survival, and corrected delivery semantics. Acceptance is that operations and walkthrough pages no longer imply workers die silently or require manual cleanup in paths now handled by source.

Milestone 3 updates PGMQ docs. Update `reference/pgmq-jobs.mdx`, background-job explanations, tutorials, how-tos, and cookbook recipes for `JobDecodeError`, `RetryPolicyConfigError`, `JobTuning`, headers, trace propagation, batch enqueue, FIFO/message groups, queue provisioning, DLQ inspection/redrive, queue metrics, archive/retention APIs, and delivery semantics. Acceptance is that all public `Keiro.PGMQ.*` exports in docs are current.

Milestone 4 updates cross-links and validates. Update local cross-links from worker docs to PGMQ docs and record integration-page edits for EP-6 if broader pages need reconciliation. Run docs validation.


## Concrete Steps

Work from this repository:

```bash
cd /Users/shinzui/Keikaku/bokuno/keiro-runtime-docs
mori registry show shinzui/keiro --full
git -C /Users/shinzui/Keikaku/bokuno/keiro log --oneline --date=short --pretty=format:'%h %ad %s' 9fa283b..HEAD
```

Expected relevant commits include:

```text
f4cd651 2026-06-15 fix(migrations): add messaging crash recovery schema
6aadd25 2026-06-15 fix(inbox): add poison-message retry accounting
f91fff7 2026-06-15 fix(outbox): reclaim stranded publishing rows
41b6b76 2026-06-15 fix(timer): requeue stale firing timers
28b5ce1 2026-06-15 fix(shards): keep readers alive across lease errors
7127672 2026-06-15 fix(keiro): harden process manager and router delivery
dd9a36b 2026-06-13 feat(keiro-pgmq): add producer headers, batch enqueue, and trace propagation
41371e7 2026-06-13 feat(keiro-pgmq): add FIFO ordered delivery via message groups
399e3d7 2026-06-13 feat(keiro-pgmq): add queue metrics and archive/retention API
```

Search symbols before editing:

```bash
rg "Poison|attempt_count|reclaim|prune|requeue|ShardedWorkerOptions|WorkerOptions|JobDecodeError|RetryPolicyConfigError|enqueueBatch|enqueueTraced|enqueueToGroup|QueueProvision|Dlq|Retention|archive" /Users/shinzui/Keikaku/bokuno/keiro/keiro/src /Users/shinzui/Keikaku/bokuno/keiro/keiro-pgmq/src /Users/shinzui/Keikaku/bokuno/keiro/keiro-pgmq/test
```

After edits:

```bash
pnpm run typecheck
pnpm run format:check
pnpm build
```


## Validation and Acceptance

Acceptance requires that the docs accurately describe current core worker recovery and PGMQ behavior. The edited pages must mention current retry/dead-letter and crash recovery semantics, the new or changed configuration error types, the queue provisioning and FIFO APIs, batch/header/tracing enqueue APIs, DLQ inspection/redrive, queue metrics and retention APIs, and the difference between transactional outbox publishing and PGMQ job enqueueing.

Run:

```bash
pnpm run typecheck
pnpm run format:check
pnpm build
```

All commands should exit with status 0. Any newly added pages must be registered in the relevant `meta.json` file before validation.


## Idempotence and Recovery

The edits are documentation-only and can be repeated safely. Do not edit `/Users/shinzui/Keikaku/bokuno/keiro`. If PGMQ source and older docs disagree, document the source and record the mismatch in Surprises & Discoveries. If a command fails because dependencies are missing, run the documented Nix or package-manager setup used by this repo only after checking the existing `README.md` and `package.json`.


## Interfaces and Dependencies

Use `mori` to resolve `shinzui/keiro`. This plan has a soft dependency on `docs/plans/30-refresh-kiroku-subscriptions-adapter-observability-and-metrics-documentation.md` for subscription and Shibuya adapter terminology.

The interfaces to document are `Keiro.Inbox`, `Keiro.Inbox.Types`, `Keiro.Inbox.Kafka`, `Keiro.Outbox`, `Keiro.Outbox.Types`, `Keiro.Outbox.Kafka`, `Keiro.Timer`, `Keiro.Timer.Types`, `Keiro.Subscription.Shard`, `Keiro.Subscription.Shard.Worker`, `Keiro.Router`, `Keiro.ProcessManager`, `Keiro.Telemetry`, `Keiro.PGMQ`, `Keiro.PGMQ.Runtime`, `Keiro.PGMQ.Codec`, `Keiro.PGMQ.Job`, `Keiro.PGMQ.Dlq`, and `Keiro.PGMQ.Metrics`.
