---
id: 4
slug: refresh-keiro-and-kiroku-documentation-after-june-hardening
title: "Refresh keiro and kiroku documentation after June hardening"
kind: master-plan
created_at: 2026-06-15T19:07:48Z
---

# Refresh keiro and kiroku documentation after June hardening

This MasterPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Vision & Scope

After this initiative, the public documentation in `content/docs/keiro/`, `content/docs/kiroku/`, and `content/docs/integrations/` describes the current June 2026 source state of `shinzui/keiro` and `shinzui/kiroku` instead of the older pins recorded in `docs/keiro-source-sync.md` and `docs/kiroku-source-sync.md`. A reader can learn the current write-path, subscription, workflow, messaging, PGMQ, schema-migration, and cross-library integration behavior without being surprised by renamed APIs, new failure modes, new migrations, or new operational semantics when they open the source.

The scope is documentation and source-sync pointer maintenance in this repository. It includes auditing the dependency source trees found with `mori`, updating existing MDX pages, adding small missing pages only when a new current behavior has no natural home, updating section `meta.json` files when new pages are added, and validating the Fumadocs site. It excludes changes to `keiro`, `kiroku`, `keiki`, `shibuya`, `pgmq-hs`, or example application source code.


## Decomposition Strategy

The work is split by user-facing functional concern, not by file. Kiroku changed in two major areas: the store write/read/schema surface and the subscription/adapter/observability surface. Keiro changed in three major areas: command/core/read-side semantics, messaging workers plus `keiro-pgmq`, and durable workflow lifecycle semantics. A final cross-library plan ties those independent updates together by reconciling integration pages, source-sync pointers, navigation, and whole-site validation.

The split keeps most child plans independently verifiable. EP-1 and EP-2 can proceed in parallel because they touch different Kiroku doc areas. EP-3, EP-4, and EP-5 can proceed after the relevant Kiroku assumptions are known, but only EP-6 has a hard dependency on all earlier work because it updates the top-level integration story and final pins. A single giant "update all docs" plan was rejected because it would make review and restart difficult. A separate plan for every changed source module was rejected because it would create too many integration edges and duplicate the same source-range analysis across plans.


## Exec-Plan Registry

| # | Title | Path | Hard Deps | Soft Deps | Status |
|---|-------|------|-----------|-----------|--------|
| EP-1 | Refresh Kiroku write path schema and store API documentation | `docs/plans/29-refresh-kiroku-write-path-schema-and-store-api-documentation.md` | None | None | Not Started |
| EP-2 | Refresh Kiroku subscriptions adapter observability and metrics documentation | `docs/plans/30-refresh-kiroku-subscriptions-adapter-observability-and-metrics-documentation.md` | None | EP-1 | Not Started |
| EP-3 | Refresh Keiro command core read side and schema documentation | `docs/plans/31-refresh-keiro-command-core-read-side-and-schema-documentation.md` | None | EP-1 | Not Started |
| EP-4 | Refresh Keiro messaging workers and PGMQ documentation | `docs/plans/32-refresh-keiro-messaging-workers-and-pgmq-documentation.md` | None | EP-2 | Not Started |
| EP-5 | Refresh Keiro durable workflow resume and lifecycle documentation | `docs/plans/33-refresh-keiro-durable-workflow-resume-and-lifecycle-documentation.md` | None | EP-3 | Not Started |
| EP-6 | Reconcile cross library integration docs and source sync pointers | `docs/plans/34-reconcile-cross-library-integration-docs-and-source-sync-pointers.md` | EP-1, EP-2, EP-3, EP-4, EP-5 | None | Not Started |

Status values: Not Started, In Progress, Complete, Cancelled.
Hard Deps and Soft Deps reference other rows by their # prefix (e.g., EP-1, EP-3).


## Dependency Graph

EP-1 and EP-2 may start immediately. EP-2 has a soft dependency on EP-1 because subscription documentation uses stream names, global positions, dead letters, and migration facts owned by the Kiroku store docs, but EP-2 can verify those facts directly from source if EP-1 is not complete.

EP-3, EP-4, and EP-5 may also start immediately if the implementer reads the current `keiro` and `kiroku` source directly. EP-3 has a soft dependency on EP-1 because Keiro command and read-side docs sit on top of Kiroku append, read, and migration behavior. EP-4 has a soft dependency on EP-2 because Keiro router/process-manager workers and sharded subscriptions consume Kiroku subscription semantics and the Shibuya adapter contract. EP-5 has a soft dependency on EP-3 because workflow resume and lifecycle docs share schema, migration, telemetry, and command/read-side consistency language.

EP-6 has hard dependencies on EP-1 through EP-5. The final integration pages and source-sync pointers must summarize the exact docs changes and final upstream commits from the earlier plans; doing that first would either duplicate all work or risk pinning stale behavior.


## Integration Points

The source-sync pointers in `docs/keiro-source-sync.md` and `docs/kiroku-source-sync.md` are shared by every plan. EP-6 owns the final pointer updates. Earlier plans should record any source facts that must appear in the pointer notes in their Outcomes & Retrospective sections.

The Kiroku stream/category and append contract is shared by EP-1, EP-2, EP-3, and EP-6. EP-1 owns the canonical documentation of `Kiroku.Store.Types.StreamName`, `CategoryName`, `categoryName`, `streamNameInCategory`, `ExpectedVersion`, `AppendResult`, `AppendConflict`, and the new oversized stream-name rejection. Other plans should link to or reuse EP-1's terminology rather than inventing parallel explanations.

The Kiroku subscription delivery contract is shared by EP-2, EP-4, and EP-6. EP-2 owns the canonical documentation of `SubscriptionTarget`, `EventTypeFilter`, `OverflowPolicy`, `SubscriptionResult`, consumer groups, dead-letter behavior, adapter overflow recovery, and metrics/trace attributes. EP-4 should consume that language when explaining Keiro router/process-manager workers and sharded subscriptions.

The Keiro migration/schema story is shared by EP-3, EP-4, EP-5, and EP-6. EP-3 owns the general `keiro-migrations` expected-schema and command/read-side schema update. EP-4 owns inbox/outbox/timer/shard worker schema changes. EP-5 owns workflow instance, wake-after, GC, child workflow, awakeable, and journal schema changes. EP-6 reconciles the summary and integration pages.

The `keiro-pgmq` queue semantics are shared by EP-4 and EP-6. EP-4 owns the reference, how-to, and tutorial updates for `Keiro.PGMQ.Job`, `Keiro.PGMQ.Codec`, `Keiro.PGMQ.Dlq`, `Keiro.PGMQ.Metrics`, and queue provisioning. EP-6 updates cross-links from integrations and landing pages.


## Progress

Track milestone-level progress across all child plans. Each entry names the child plan
and the milestone. This section provides an at-a-glance view of the entire initiative.

- [ ] EP-1: Audit the Kiroku `0a39598..HEAD` write/read/schema range and update store API, schema, write-path, and migration docs.
- [ ] EP-1: Validate Kiroku write-path docs against current source exports, tests, and source pointer notes.
- [ ] EP-2: Audit Kiroku subscription, Shibuya adapter, OpenTelemetry, metrics, and CLI changes and update the affected docs.
- [ ] EP-2: Validate subscription docs against current source, adapter tests, metrics tests, and source pointer notes.
- [ ] EP-3: Audit Keiro command, codec, stream, snapshot, projection, read-model, test-support, and migration changes and update reference/how-to/walkthrough docs.
- [ ] EP-3: Validate Keiro command/read-side docs against current source and docs app checks.
- [ ] EP-4: Audit Keiro inbox/outbox/timer/shard/process-manager/router/PGMQ changes and update messaging, worker, and background-job docs.
- [ ] EP-4: Validate worker and PGMQ docs against current source and docs app checks.
- [ ] EP-5: Audit Keiro durable workflow hardening, instance leasing, sleep/wake, child workflow, GC, and lifecycle changes and update workflow docs.
- [ ] EP-5: Validate durable workflow docs against current source and docs app checks.
- [ ] EP-6: Reconcile integration pages, landing/index pages, navigation, source-sync pointers, and cross-library terminology after EP-1 through EP-5.
- [ ] EP-6: Run whole-site validation and record final source pins.


## Surprises & Discoveries

- `mori registry docs shinzui/keiro` and `mori registry docs shinzui/kiroku` report no curated docs, so all child plans must treat the local source trees and their checked-in docs/plans as source material.
- Creating child ExecPlans in parallel exposed that `agents/skills/exec-plan/init-plan.ts` is not concurrency-safe for numbering; the duplicate skeletons were deleted immediately and recreated sequentially.
- The current `keiro` range is much larger than a small drift update: `git -C /Users/shinzui/Keikaku/bokuno/keiro diff --stat 9fa283b..HEAD` reports 502 files changed, including production hardening, new migrations, workflow instance leasing, and extended `keiro-pgmq`.
- The current `kiroku` range is also larger than a pointer bump: `git -C /Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku diff --stat 0a39598..HEAD` reports 94 files changed, including breaking store and adapter changes, append pipelining, schema hygiene, and metrics websocket replay fixes.


## Decision Log

Record every decomposition or coordination decision made while working on the master
plan.

- Decision: Split the refresh into six child ExecPlans: two Kiroku plans, three Keiro plans, and one final integration/pointer plan.
  Rationale: The source changes cluster around independently verifiable behaviors, while the final source-sync pointers require all prior documentation updates to be known.
  Date: 2026-06-15
- Decision: Make EP-6 depend hard on EP-1 through EP-5, but keep EP-1 through EP-5 mostly parallel with soft dependencies only.
  Rationale: The final integration and pointer pass cannot be correct until the domain-specific pages are updated, but the domain-specific plans can each read source directly and should not serialize unnecessarily.
  Date: 2026-06-15
- Decision: Keep this initiative documentation-only.
  Rationale: The user asked to bring docs up to date after upstream changes. The upstream libraries already contain the implementation work and tests; changing them from this repo would expand the blast radius.
  Date: 2026-06-15


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original vision.

(To be filled during and after implementation.)
