---
id: 36
slug: document-shibuya-metrics-operations-and-recipes
title: "Document shibuya metrics operations and recipes"
kind: exec-plan
created_at: 2026-06-24T18:04:06Z
master_plan: "docs/masterplans/5-complete-shibuya-pgmq-and-adapter-documentation.md"
---

# Document shibuya metrics operations and recipes

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, shibuya users can operate workers in production with confidence. The docs show
how to expose health, JSON metrics, Prometheus metrics, and WebSocket updates; how OpenTelemetry
spans and propagation work; how to choose operational settings; and how to diagnose common worker
failures. The visible result is a populated shibuya operations layer: metrics and telemetry
reference pages, how-to guides, cookbook recipes, and a real FAQ under `content/docs/shibuya/`.

This plan depends on the core vocabulary and processing model from
`docs/plans/35-author-shibuya-foundation-core-and-walkthrough-docs.md`. It should link back to
EP-1's pages instead of redefining adapters, handlers, envelopes, ack decisions, and runner
policies.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [ ] Read EP-1's completed pages and confirm canonical shibuya terminology.
- [ ] Audit shibuya metrics, telemetry, operations docs, source modules, and tests through mori.
- [ ] Author metrics and telemetry reference pages.
- [ ] Author operational how-to pages for health, Prometheus, WebSocket, tracing, shutdown, and
  debugging worker behavior.
- [ ] Author cookbook recipes and replace `content/docs/shibuya/faq.mdx` with real answers.
- [ ] Validate with docs checks and cross-link scans against EP-1.


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

(None yet.)


## Decision Log

Record every decision made while working on the plan.

- Decision: Make this plan hard-depend on the shibuya core documentation plan.
  Rationale: Operational pages need a shared definition of processors, handlers, ack decisions,
  retries, and runner policies before they can explain metrics and telemetry without duplicating
  foundational prose.
  Date: 2026-06-24
- Decision: Treat metrics and telemetry as operational documentation, not foundation
  documentation.
  Rationale: The exported `Shibuya.Metrics.*` and `Shibuya.Telemetry.*` modules are used to run
  and observe deployed workers; they are independently verifiable through endpoint and trace
  examples.
  Date: 2026-06-24


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

(To be filled during and after implementation.)


## Context and Orientation

This repository is the documentation site. Work from
`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`. Resolve source with mori before editing:

```bash
mori registry show shinzui/shibuya --full
mori registry docs shinzui/shibuya
```

At plan creation, mori resolved `shinzui/shibuya` to
`/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya`. The current shibuya HEAD was
`3f276ee190e563fddb0bc81e01d62a96a1b31715` (`3f276ee`, 2026-06-14,
`chore(release): 0.7.1.0`). Recheck before implementation.

The metrics package is `shibuya-metrics` 0.7.1.0. Its cabal file exposes:

- `Shibuya.Metrics`
- `Shibuya.Metrics.Config`
- `Shibuya.Metrics.Health`
- `Shibuya.Metrics.JSON`
- `Shibuya.Metrics.Prometheus`
- `Shibuya.Metrics.Server`
- `Shibuya.Metrics.Types`
- `Shibuya.Metrics.WebSocket`

The telemetry modules exposed by `shibuya-core` are:

- `Shibuya.Telemetry`
- `Shibuya.Telemetry.Config`
- `Shibuya.Telemetry.Effect`
- `Shibuya.Telemetry.Propagation`
- `Shibuya.Telemetry.Semantic`

Relevant source and upstream docs:

- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/docs/user/opentelemetry.md`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/docs/JAEGER_LOCAL_TESTING.md`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/docs/operations/DEPLOYMENT.md`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/docs/operations/RUNBOOKS.md`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/docs/architecture/METRICS.md`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/docs/HS_OPENTELEMETRY_GHC912.md`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/shibuya-metrics/src/Shibuya/Metrics/*.hs`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/shibuya-core/src/Shibuya/Telemetry/*.hs`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/shibuya-core/test/Shibuya/Telemetry/*Spec.hs`

The current docs tree has `content/docs/shibuya/cookbook/index.mdx` and
`content/docs/shibuya/faq.mdx`, but these are skeletal or thin. EP-2 is responsible for replacing
those with production-grade content and for adding operational pages to `reference`, `how-to`,
`explanation`, and `cookbook` as appropriate.

Definitions for this plan:

Health endpoint means an HTTP endpoint that reports whether the shibuya metrics server is alive or
whether processors are in a state that should be considered healthy. Verify exact behavior from
`Shibuya.Metrics.Health`.

Prometheus metrics means text-format metrics exported for Prometheus scraping. Verify metric names
and labels from `Shibuya.Metrics.Prometheus` and `Shibuya.Metrics.Types`.

WebSocket metrics means a live metrics stream. Verify message shape from `Shibuya.Metrics.WebSocket`
and `Shibuya.Metrics.JSON`.

OpenTelemetry is the tracing API used by shibuya. Verify span names, attributes, and propagation
rules from `Shibuya.Telemetry.*` and the telemetry specs.


## Plan of Work

Milestone 1 audits EP-1 and upstream operational source. Read the completed pages from
`docs/plans/35-author-shibuya-foundation-core-and-walkthrough-docs.md`, then read the metrics and
telemetry modules listed above. Capture any drift from the plan creation commit in Surprises &
Discoveries.

Milestone 2 authors reference and explanation pages. Add metrics reference pages under
`content/docs/shibuya/reference/` for metrics config, server, health, JSON, Prometheus, WebSocket,
and metric types. Add telemetry reference or explanation pages for span helpers, semantic
attributes, propagation, and the no-op/traced effect runners. Add explanation pages under
`content/docs/shibuya/explanation/` for observability architecture and production supervision.

Milestone 3 authors operational tasks. Add how-to pages under `content/docs/shibuya/how-to/` for
serving metrics, scraping Prometheus, streaming metrics over WebSocket, enabling OpenTelemetry,
testing with a local Jaeger collector if the upstream docs support it, configuring graceful
shutdown, and debugging stalled or retrying processors. Each how-to must state prerequisites,
exact code/config snippets, and observable output.

Milestone 4 authors recipes and FAQ. Replace `content/docs/shibuya/cookbook/index.mdx` with cards
and add recipes for common tasks: add a health endpoint, expose processor metrics, alert on
dead-letter growth, trace a handler, diagnose retry storms, and run a local observability stack.
Replace `content/docs/shibuya/faq.mdx` with concrete answers tied to source-backed behavior.

Milestone 5 validates. Run typecheck, build, link check, and scans for stale stub text in
operational pages.


## Concrete Steps

Run all commands from `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`.

```bash
mori registry show shinzui/shibuya --full
mori registry docs shinzui/shibuya
git -C /Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya log -1 --date=short --pretty=format:%H%n%h%n%ad%n%s
```

Inspect the operational source surface:

```bash
rg --files /Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/shibuya-metrics
rg --files /Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/shibuya-core/src/Shibuya/Telemetry
sed -n '1,220p' /Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/docs/operations/RUNBOOKS.md
sed -n '1,220p' /Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/docs/user/opentelemetry.md
```

Use existing mature docs as style anchors:

```bash
sed -n '1,220p' content/docs/kiroku/how-to/serve-metrics-and-health.mdx
sed -n '1,220p' content/docs/kiroku/reference/metrics.mdx
sed -n '1,220p' content/docs/keiro/how-to/enable-opentelemetry.mdx
```

Validate:

```bash
pnpm run typecheck
pnpm build
node scripts/check-doc-links.mjs
rg -n "Documentation in progress|TODO|coming soon" content/docs/shibuya
```

If the final scan finds intentional placeholders outside EP-2 scope, record them in Outcomes &
Retrospective with the owning plan.


## Validation and Acceptance

Acceptance:

- `/docs/shibuya/reference` includes source-checked pages for `Shibuya.Metrics.*` and
  `Shibuya.Telemetry.*`.
- `/docs/shibuya/how-to` includes operational tasks for health, metrics, Prometheus, WebSocket,
  OpenTelemetry, shutdown, and debugging.
- `/docs/shibuya/cookbook` has recipes rather than a stub index.
- `/docs/shibuya/faq` answers real operational and conceptual questions.
- Pages link back to EP-1-owned core pages for processor, handler, ack, retry, dead-letter,
  ordering, and concurrency definitions.
- `pnpm run typecheck`, `pnpm build`, and `node scripts/check-doc-links.mjs` pass.
- Metric names, endpoint shapes, span names, and attribute names are traceable to local source or
  tests, not guessed from memory.


## Idempotence and Recovery

The work is additive and repeatable. Re-run mori and source reads before each implementation
session. If a metric or telemetry claim is uncertain, leave the claim out until verified from
source or tests. Do not change upstream shibuya code from this docs repo.

If docs validation fails, fix MDX syntax, imports, or links in files touched by this plan first. If
an EP-1 page was renamed or reordered, update links to the new path and record the dependency
change in Surprises & Discoveries.


## Interfaces and Dependencies

This plan depends on the `shinzui/shibuya` source tree and on completed EP-1 pages. The main
interfaces are:

- `Shibuya.Metrics`
- `Shibuya.Metrics.Config`
- `Shibuya.Metrics.Health`
- `Shibuya.Metrics.JSON`
- `Shibuya.Metrics.Prometheus`
- `Shibuya.Metrics.Server`
- `Shibuya.Metrics.Types`
- `Shibuya.Metrics.WebSocket`
- `Shibuya.Telemetry`
- `Shibuya.Telemetry.Config`
- `Shibuya.Telemetry.Effect`
- `Shibuya.Telemetry.Propagation`
- `Shibuya.Telemetry.Semantic`

The validation interfaces are the docs app commands in `package.json`: `pnpm run typecheck`,
`pnpm build`, and `node scripts/check-doc-links.mjs`. Final reconciliation and whole-site source
sync updates are owned by
`docs/plans/39-reconcile-shibuya-pgmq-integrations-navigation-and-source-sync.md`.
