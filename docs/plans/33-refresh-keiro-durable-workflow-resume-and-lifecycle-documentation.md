---
id: 33
slug: refresh-keiro-durable-workflow-resume-and-lifecycle-documentation
title: "Refresh Keiro durable workflow resume and lifecycle documentation"
kind: exec-plan
created_at: 2026-06-15T19:08:34Z
intention: intention_01kv6bpntyeh98ta4k2famkdm9
master_plan: "docs/masterplans/4-refresh-keiro-and-kiroku-documentation-after-june-hardening.md"
---

# Refresh Keiro durable workflow resume and lifecycle documentation

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this plan is implemented, Keiro users can understand the current durable workflow lifecycle: workflow identity construction, journal replay, step deduplication, instance leasing, resume isolation, sleep and wake-after behavior, awakeables, child workflow cancellation, continue-as-new rotation, patch classification, and garbage collection. The docs will reflect the June 15 hardening wave after the older durable-workflow docs, including workflow instance table lifecycle, resume failure isolation, serialized journal appends, atomic completion wake paths, child cancel crash-window fixes, stable generation-aware wake sources, sleeper wake-time preservation, recorded step round-trip behavior, active-set patch classification, and GC/prune behavior.

The user-visible proof is that `content/docs/keiro/reference/durable-workflows.mdx`, workflow how-tos, tutorials, and durable-execution walkthroughs match the current modules under `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Workflow/`.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [x] Audit Keiro durable workflow commits from `9fa283b..HEAD`.
- [x] Update durable workflow reference and tutorial docs for current identity, run options, journal, step, sleep, awakeable, child, patch, and continue-as-new semantics.
- [x] Update durable-execution walkthrough pages for current resume loop, instance leasing, wake-after, generation, and GC behavior.
- [x] Update migration/schema and operations cross-links or record finalization needs for EP-6.
- [x] Run docs validation commands and record results.


## Surprises & Discoveries

- Awakeable allocation is no longer generally deterministic. New `awakeableNamed` allocations journal
  an opaque random id under `awkid:<label>`; `deterministicAwakeableId` remains only for legacy
  generation-0 adoption, so docs needed to stop telling signallers to recompute ids.
- Workflow resume discovery is now centered on the `keiro_workflows` instance row, not an anti-join
  over step rows. That row carries status, attempts, lease owner/expiry, next attempt, wake-after,
  and GC timestamps.
- Resume workers are lease-first and append-safe: live foreign leases increment `leaseSkipped`,
  crashes increment attempts with exponential backoff, and the journal append path still serializes
  same-step races after lease expiry.
- Patch classification now comes from the recorded active patch set at generation start, not a
  `startedInFlight` heuristic over ordinary step keys.
- `WorkflowGc` deletes terminal instances by lifecycle row while preserving completed children whose
  parent is still non-terminal.


## Decision Log

Record every decision made while working on the plan.

- Decision: Keep all durable workflow lifecycle changes in one plan.
  Rationale: Instance leasing, journal serialization, wake-after, child workflows, patches, and GC are tightly coupled; splitting them would make each plan incomplete for a reader implementing or operating workflows.
  Date: 2026-06-15


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

Completed on 2026-06-15 against `shinzui/keiro` commit
`f1d67a01b7457387a4861e7268d1c521ef82287d`. The updated docs cover validated workflow identity
constructors, `Failed` outcomes, `activePatches`, journal append serialization, instance leasing,
resume crash backoff, `wake_after` sleep filtering, random journaled awakeable ids, atomic awakeable
and child wake paths, child failure envelopes, continue-as-new rotation, active-set patch decisions,
workflow GC, schema migrations, and workflow telemetry counters.

Validation passed with `pnpm run typecheck`, `pnpm run format:check`, `pnpm build`, `git diff
--check`, and a focused stale-claim scan for superseded deterministic-awakeable, advisory-lock,
step-row-discovery, step at-most-once, and patch-classification wording. EP-6 still owns final
source-sync pointer updates and cross-library integration reconciliation.


## Context and Orientation

This repository documents Keiro durable workflows under `content/docs/keiro/`. Resolve source with `mori registry show shinzui/keiro --full`; the current local source path is `/Users/shinzui/Keikaku/bokuno/keiro`.

A durable workflow is an effectful program that records named step results so it can resume after a crash without repeating completed work. A journal is the persisted sequence of workflow events. A generation is the counter used when a workflow rotates or continues as new. An awakeable is an external completion point. A child workflow is a workflow started and awaited by another workflow. A resume worker scans persisted workflow state and advances work that is ready. A lease prevents multiple workers from advancing the same instance at the same time. Wake-after is a timestamp that prevents sleeping workflows from being resumed before their due time.

The source files that matter for this plan are:

- `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Workflow.hs`, the main workflow effect, `WorkflowRunOptions`, `WorkflowError`, `runWorkflow`, `runWorkflowWith`, journal append behavior, and step replay.
- `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Workflow/Types.hs`, where `WorkflowName`, `WorkflowId`, `WorkflowIdentityError`, `StepName`, `PatchId`, `WorkflowJournalEvent`, `WorkflowState`, and `WorkflowOutcome` are defined.
- `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Workflow/Schema.hs`, the workflow step journal schema.
- `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Workflow/Instance.hs`, instance lifecycle and leasing.
- `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Workflow/Resume.hs`, resume options, registry, worker, push loop, and failure isolation.
- `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Workflow/Sleep.hs`, sleep and workflow timer behavior.
- `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Workflow/Awakeable.hs` and `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Workflow/Awakeable/Schema.hs`.
- `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Workflow/Child.hs` and `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Workflow/Child/Schema.hs`.
- `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Workflow/Snapshot.hs` and `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Workflow/Gc.hs`.
- Migration files under `/Users/shinzui/Keikaku/bokuno/keiro/keiro-migrations/sql-migrations/`, especially `2026-06-11-00-00-04-keiro-workflows-instances.sql`, `2026-06-15-22-10-00-keiro-workflow-gc-index.sql`, and `2026-06-15-22-20-00-keiro-workflows-wake-after.sql`.
- Workflow tests in `/Users/shinzui/Keikaku/bokuno/keiro/keiro/test/Main.hs`.

The docs most likely to need edits are `content/docs/keiro/reference/durable-workflows.mdx`, `content/docs/keiro/reference/push-delivery.mdx`, `content/docs/keiro/reference/migrations-and-schema.mdx`, `content/docs/keiro/explanation/durable-execution.mdx`, `content/docs/keiro/explanation/workflow-roadmap.mdx`, `content/docs/keiro/tutorials/your-first-durable-workflow.mdx`, `content/docs/keiro/how-to/write-a-durable-workflow.mdx`, `content/docs/keiro/how-to/run-the-workflow-resume-worker.mdx`, `content/docs/keiro/cookbook/durable-order-workflow.mdx`, and every page under `content/docs/keiro/walkthrough/durable-execution/`.


## Plan of Work

Milestone 1 audits workflow source and tests. Read workflow modules and the June 15 commit log, then map each changed behavior to a page. The milestone is complete when source evidence exists for identity constructors, journal deduplication, instance leasing, resume isolation, sleep/wake behavior, child cancellation, patch classification, and GC.

Milestone 2 updates reference and tutorial docs. Update durable workflow reference, tutorial, how-to, and cookbook pages for current public APIs and behavior. The docs should explain what a workflow instance row is, how leasing works, how `wake_after` affects resume, how external completions and child completions append atomically, how generation-aware wake sources avoid stale wakeups, and how patches are classified from the recorded active set. Acceptance is that the pages no longer describe resume as only a journal scan without instance lifecycle.

Milestone 3 updates walkthrough and operations docs. Update durable-execution walkthrough chapters for types, replay loop, step index, sleep, awakeables, children, resume worker, snapshots/telemetry, and versioning/rotation. Update migration/schema docs for workflow instance, wake-after, and GC indexes. Acceptance is that a reader can follow the current source files in order and see the same tables and worker behavior.

Milestone 4 validates and records finalization needs. Run docs validation and record any cross-plan edits needed by EP-6, especially source-sync pointer summary text and integration links.


## Concrete Steps

Work from this repository:

```bash
cd /Users/shinzui/Keikaku/bokuno/keiro-runtime-docs
mori registry show shinzui/keiro --full
git -C /Users/shinzui/Keikaku/bokuno/keiro log --oneline --date=short --pretty=format:'%h %ad %s' 9fa283b..HEAD
```

Expected relevant commits include:

```text
9719c82 2026-06-15 feat(keiro): add workflow instance table lifecycle
96b7249 2026-06-15 feat(keiro): isolate workflow resume failures
e90487c 2026-06-15 feat(keiro): lease workflow resume instances
fa714d6 2026-06-15 feat(keiro): serialize workflow journal appends
361a92d 2026-06-15 fix(keiro): make workflow completion wake paths atomic
e2fc731 2026-06-15 fix(keiro): close workflow child cancel crash windows
9ccff86 2026-06-15 refactor(workflow): add identity constructors and stable dedup
```

Search source before editing:

```bash
rg "WorkflowRunOptions|WorkflowIdentityError|claimInstance|wake_after|ResumeSummary|runWorkflowResumeWorker|JournalAppendOutcome|continueAsNew|patch|generation|WorkflowGc" /Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Workflow /Users/shinzui/Keikaku/bokuno/keiro/keiro/test/Main.hs /Users/shinzui/Keikaku/bokuno/keiro/keiro-migrations/sql-migrations
```

After edits:

```bash
pnpm run typecheck
pnpm run format:check
pnpm build
```


## Validation and Acceptance

Acceptance requires that durable workflow docs match current source for workflow identity validation, run options, journal append idempotence and serialization, instance row lifecycle, leasing, resume failure isolation, push/poll behavior, sleep/wake-after, awakeables, child cancellation, continue-as-new, patch classification, and GC.

Run:

```bash
pnpm run typecheck
pnpm run format:check
pnpm build
```

All commands should exit with status 0. If a source behavior appears tested but not public, describe it as operational behavior rather than an API guarantee unless the source docs or exported type make it public.


## Idempotence and Recovery

The plan is documentation-only. Do not edit the Keiro source repository. If the workflow docs need large restructuring, keep the existing walkthrough order and update chapter bodies first; navigation changes should be minimal and recorded so EP-6 can check links.


## Interfaces and Dependencies

Use `mori` to resolve `shinzui/keiro`. This plan has a soft dependency on `docs/plans/31-refresh-keiro-command-core-read-side-and-schema-documentation.md` for general migration and telemetry language.

The interfaces to document are `Keiro.Workflow`, `Keiro.Workflow.Types`, `Keiro.Workflow.Schema`, `Keiro.Workflow.Instance`, `Keiro.Workflow.Resume`, `Keiro.Workflow.Sleep`, `Keiro.Workflow.Awakeable`, `Keiro.Workflow.Awakeable.Schema`, `Keiro.Workflow.Child`, `Keiro.Workflow.Child.Schema`, `Keiro.Workflow.Snapshot`, and `Keiro.Workflow.Gc`. The schema dependencies are the workflow SQL migrations under `/Users/shinzui/Keikaku/bokuno/keiro/keiro-migrations/sql-migrations/` and the expected schema under `/Users/shinzui/Keikaku/bokuno/keiro/keiro-migrations/expected-schema/`.
