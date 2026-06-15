---
id: 30
slug: refresh-kiroku-subscriptions-adapter-observability-and-metrics-documentation
title: "Refresh Kiroku subscriptions adapter observability and metrics documentation"
kind: exec-plan
created_at: 2026-06-15T19:08:21Z
intention: intention_01kv6bpntyeh98ta4k2famkdm9
master_plan: "docs/masterplans/4-refresh-keiro-and-kiroku-documentation-after-june-hardening.md"
---

# Refresh Kiroku subscriptions adapter observability and metrics documentation

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this plan is implemented, a Kiroku user can understand the current subscription worker, consumer-group, Shibuya adapter, metrics, and OpenTelemetry behavior from the docs site. The docs will reflect the June 2026 changes that stopped fan-out publisher work for category and consumer-group subscribers, hardened worker startup and stream termination, made adapter overflow recovery lossless, guarded throwing handlers, fixed metrics websocket replay handoff, and added or clarified event-type filtering and prefix subscription targets.

The user-visible proof is that the subscription reference, walkthrough, metrics, tracing, operator CLI, and Shibuya integration pages agree with the current source under `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store/`, `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/shibuya-kiroku-adapter/`, `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-metrics/`, and `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-otel/`.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [x] Audit Kiroku subscription, adapter, metrics, OTel, and CLI commits from `0a39598..HEAD`.
- [x] Update subscription concepts and reference docs for current targets, filters, overflow, retry, dead-letter, and consumer-group behavior.
- [x] Update subscription walkthrough pages for current FSM, worker driver, event publisher, Shibuya adapter, consumer-group policy, and tracing behavior.
- [x] Update metrics, OpenTelemetry, and operator CLI docs for current websocket replay handoff and span/event surfaces.
- [x] Update integration pages or record cross-link needs for EP-6.
- [x] Run docs validation commands and record results.


## Surprises & Discoveries

- The current store only registers publisher queues for non-group `AllStreams` subscriptions.
  `Category` subscriptions and all consumer-group members use DB-driven live loops gated by the
  publisher position, so docs must not describe unused category/group queues.
- `EventTypeFilter` and `selector` are AND-composed before handler delivery. Filtered-out events do
  not reach handlers, streams, retries, or dead letters, but checkpoint progress still advances past
  them.
- `shibuya-kiroku-adapter` now exposes `queueCapacity` and inherits Kiroku's lossless
  `PauseAndResume` overflow policy instead of setting `DropSubscription`.
- `kirokuConsumerGroupProcessors` wraps handlers with `guardKirokuHandler`, mapping synchronous
  exceptions to `AckRetry (RetryDelay 1)`, and cleans up already-opened adapters if later member
  creation fails.
- `/ws/events` attaches to live broadcast before all-stream replay and terminates the tail on replay
  or category-read errors after sending an error frame, avoiding a live handoff with a gap.


## Decision Log

Record every decision made while working on the plan.

- Decision: Keep subscription semantics and adapter semantics in one child plan.
  Rationale: The Shibuya adapter is a direct consumer of Kiroku subscription behavior; splitting them would duplicate the ack, overflow, and consumer-group explanations.
  Date: 2026-06-15
- Decision: Expand `content/docs/integrations/shibuya-kiroku-adapter.mdx` during EP-2 instead of deferring the placeholder to EP-6.
  Rationale: EP-2 has the source evidence for the adapter's delivery, overflow, filter, envelope, and consumer-group contract; EP-6 can later reconcile links and source-sync pointers rather than author the behavior from scratch.
  Date: 2026-06-15


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

Draft docs now describe the current Kiroku subscription and adapter behavior: target-specific live
sources, filter checkpointing, lossless adapter overflow, ack-coupled Shibuya checkpointing, guarded
consumer-group handlers, websocket replay handoff, and the expanded integration page. Validation
passed with `pnpm run typecheck`, `pnpm run format:check`, `pnpm build`, and `git diff --check`.
EP-6 still owns the final `docs/kiroku-source-sync.md` pointer update and any whole-site integration
reconciliation after the Keiro plans complete.


## Context and Orientation

This repository documents Kiroku under `content/docs/kiroku/` and the Kiroku/Shibuya integration under `content/docs/integrations/shibuya-kiroku-adapter.mdx`. The Kiroku source path is resolved with `mori registry show shinzui/kiroku --full`; it is currently `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku`.

A subscription is a long-running worker that reads recorded events and advances its checkpoint only after the handler outcome says the event was handled. A consumer group is a set of subscription workers that partition the event stream so each event is handled by one member. Overflow policy decides what happens when the live bridge buffer cannot keep up. Dead-lettering records an event that exhausted retries or cannot be processed. The Shibuya adapter converts Kiroku subscription deliveries into Shibuya worker envelopes.

The source files that matter for this plan are:

- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store/src/Kiroku/Store/Subscription.hs`, the public subscription functions and state views.
- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store/src/Kiroku/Store/Subscription/Types.hs`, where `EventTypeFilter`, `SubscriptionTarget`, `SubscriptionResult`, `RetryPolicy`, `OverflowPolicy`, `SubscriptionConfig`, `ConsumerGroup`, and guard conflicts are defined.
- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store/src/Kiroku/Store/Subscription/Fsm.hs`, the subscription finite-state machine.
- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store/src/Kiroku/Store/Subscription/Worker.hs`, the catch-up/live worker driver and stop classification.
- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store/src/Kiroku/Store/Subscription/EventPublisher.hs`, where the publisher fan-out behavior changed.
- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store/src/Kiroku/Store/Subscription/Stream.hs`, the bridge stream and termination behavior.
- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/shibuya-kiroku-adapter/src/Shibuya/Adapter/Kiroku.hs`, the adapter contract and overflow recovery.
- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-metrics/src/Kiroku/Metrics/WebSocket.hs` and related metrics modules.
- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-otel/src/Kiroku/Otel/Subscription.hs`, the tracing surface.
- Tests under `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store/test/`, especially `Test/SubscriptionState.hs`, `Test/EventTypeFilter.hs`, `Test/PublisherCallbackResilience.hs`, `Test/StreamBridgeTermination.hs`, `Test/PublisherIdleAdvance.hs`, `Test/ConsumerGroup.hs`, and `Test/SubscriptionRetryDeadLetter.hs`.

The docs most likely to need edits are `content/docs/kiroku/explanation/subscriptions-and-consumer-groups.mdx`, `content/docs/kiroku/explanation/tracing-subscriptions.mdx`, `content/docs/kiroku/reference/metrics.mdx`, `content/docs/kiroku/reference/opentelemetry.mdx`, `content/docs/kiroku/reference/operator-cli.mdx`, `content/docs/kiroku/how-to/enable-opentelemetry.mdx`, `content/docs/kiroku/how-to/inspect-subscriptions-with-the-cli.mdx`, `content/docs/kiroku/how-to/serve-metrics-and-health.mdx`, `content/docs/kiroku/walkthrough/01-the-state-machine.mdx`, `content/docs/kiroku/walkthrough/02-the-worker-driver.mdx`, `content/docs/kiroku/walkthrough/03-the-event-publisher.mdx`, `content/docs/kiroku/walkthrough/04-subscribe-and-lifecycle.mdx`, `content/docs/kiroku/walkthrough/05-the-shibuya-adapter.mdx`, `content/docs/kiroku/walkthrough/06-consumer-groups-and-policy.mdx`, and `content/docs/kiroku/walkthrough/07-tracing-the-subscription.mdx`.


## Plan of Work

Milestone 1 audits subscription behavior. Read the source and tests listed above and group the current behavior into subscription targets/filtering, worker lifecycle, event publisher fan-out, retry/dead-letter, bridge termination, adapter overflow, metrics, and tracing. The milestone is complete when the changed behavior has source/test evidence and the docs to edit are identified.

Milestone 2 updates conceptual and reference docs. Update the subscription and consumer-group explanation so it describes the current named subscription model, event-type filtering, prefix/fan-in target if present in source, consumer-group partitioning, no publisher fan-out for category/group subscribers, and checkpoint coupling. Update reference pages for current fields and failure modes. Acceptance is that no page implies all category or consumer-group subscribers register live publisher queues.

Milestone 3 updates walkthroughs. The walkthrough should explain the current FSM, the worker driver catch-up/live transition, stream bridge termination, publisher idle advancement, startup cleanup, callback resilience, and adapter overflow recovery. Acceptance is that the pages name the current modules and do not describe stale callback, overflow, or termination behavior.

Milestone 4 updates observability and operations pages. Update metrics websocket replay handoff language, subscription state registry references, CLI inspection guidance if affected, and OpenTelemetry span attributes. Acceptance is that the metric and tracing names match current source and tests.

Milestone 5 records integration needs and validates. If `content/docs/integrations/shibuya-kiroku-adapter.mdx` needs direct updates, make them here unless EP-6 is better positioned to reconcile cross-library prose. Record any deferred integration edits in Outcomes & Retrospective. Run the docs validation commands.


## Concrete Steps

Work from the docs repository:

```bash
cd /Users/shinzui/Keikaku/bokuno/keiro-runtime-docs
mori registry show shinzui/kiroku --full
git -C /Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku log --oneline --date=short --pretty=format:'%h %ad %s' 0a39598..HEAD
```

Expected relevant commits include:

```text
45b9438 2026-06-14 feat(shibuya-kiroku-adapter)!: use lossless overflow recovery
414867f 2026-06-14 feat(kiroku-store)!: register publisher queues only for non-group AllStreams subscriptions
9ee1840 2026-06-14 fix(kiroku-store): terminate bridge streams with worker outcome
cd75172 2026-06-14 fix(kiroku-metrics): harden websocket replay handoff
```

Search source symbols before editing:

```bash
rg "EventTypeFilter|SubscriptionTarget|OverflowPolicy|SubscriptionResult|ConsumerGroup|DeadLetter|WebSocket|deliver|stopped" /Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store/src /Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/shibuya-kiroku-adapter/src /Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-metrics/src /Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-otel/src
```

After edits:

```bash
pnpm run typecheck
pnpm run format:check
pnpm build
```


## Validation and Acceptance

Acceptance requires that the edited Kiroku subscription docs match current source and tests. The docs must cover current subscription target/filter semantics, consumer-group partitioning, no live-publisher registration for category/group subscribers, worker startup cleanup, callback resilience, stream bridge termination, retry/dead-letter behavior, Shibuya adapter throwing-handler and overflow recovery behavior, metrics websocket replay handoff, and tracing names/attributes.

Run:

```bash
pnpm run typecheck
pnpm run format:check
pnpm build
```

All commands should exit with status 0. If link validation is run later by EP-6, record any new anchors or pages added by this plan so EP-6 knows what to check.


## Idempotence and Recovery

The edits are documentation-only. Rerunning `rg`, `git log`, and docs validation is safe. Do not edit `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku` from this plan. If a source fact is ambiguous, prefer a conservative statement tied to a source module and add a note to Surprises & Discoveries rather than documenting intent from an older plan file as fact.


## Interfaces and Dependencies

Use `mori` to resolve `shinzui/kiroku` before reading source. This plan depends softly on `docs/plans/29-refresh-kiroku-write-path-schema-and-store-api-documentation.md` for stream/category and dead-letter schema terminology, but it can proceed independently by reading source.

The source interfaces to document are `Kiroku.Store.Subscription`, `Kiroku.Store.Subscription.Types`, `Kiroku.Store.Subscription.Fsm`, `Kiroku.Store.Subscription.Worker`, `Kiroku.Store.Subscription.EventPublisher`, `Kiroku.Store.Subscription.Stream`, `Shibuya.Adapter.Kiroku`, `Kiroku.Metrics.*`, and `Kiroku.Otel.Subscription`. The docs should mention concrete public types such as `SubscriptionConfig`, `SubscriptionTarget`, `EventTypeFilter`, `SubscriptionResult`, `RetryPolicy`, `OverflowPolicy`, `SubscriptionHandle`, `ConsumerGroup`, and current metrics/tracing records where exposed.
