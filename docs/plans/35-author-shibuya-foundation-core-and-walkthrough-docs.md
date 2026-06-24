---
id: 35
slug: author-shibuya-foundation-core-and-walkthrough-docs
title: "Author shibuya foundation core and walkthrough docs"
kind: exec-plan
created_at: 2026-06-24T18:04:03Z
master_plan: "docs/masterplans/5-complete-shibuya-pgmq-and-adapter-documentation.md"
---

# Author shibuya foundation core and walkthrough docs

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, `/docs/shibuya` is no longer a skeleton. A reader can learn what shibuya is,
run or follow a first worker example, understand the core abstractions, look up the exported
`shibuya-core` API, and read source walkthroughs that explain how adapters, handlers, ack
decisions, retry policy, runner supervision, ordering, and concurrency fit together.

The visible result is a populated `content/docs/shibuya/` tree: the landing page points to real
content instead of "Documentation in progress"; the Tutorial, Reference, How-To, Explanation, and
Walkthrough sections contain source-checked MDX pages; and the docs build plus link check pass.
Operational metrics, health, Prometheus, WebSocket, and FAQ material are intentionally left for
`docs/plans/36-document-shibuya-metrics-operations-and-recipes.md`.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [x] Resolve current shibuya source with mori and audit source/docs from the upstream repo. Completed 2026-06-24T18:28:42Z.
- [x] Replace the shibuya section skeleton with real overview and tutorial content. Completed 2026-06-24T18:28:42Z.
- [x] Author core explanation and reference pages for adapters, envelopes, handlers, ack decisions,
  retry policy, runner configuration, ordering, concurrency, and stream helpers.
- [x] Author source walkthroughs for `Shibuya.Core.*`, `Shibuya.Adapter`, `Shibuya.Handler`,
  `Shibuya.Policy`, `Shibuya.Runner.*`, and `Shibuya.Stream`.
- [x] Update shibuya `meta.json` files so every new page appears in the intended sidebar order. Completed 2026-06-24T18:28:42Z.
- [x] Validate with docs typecheck, build, link check, and a stale-stub scan. Completed 2026-06-24T18:28:42Z.


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

- `mori registry show shinzui/shibuya --full` and the upstream git log still resolve shibuya to
  `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya` at
  `3f276ee190e563fddb0bc81e01d62a96a1b31715` (`chore(release): 0.7.1.0`), matching the plan's
  recorded source pin, so no source-drift changes were needed.
- The stale-stub scan still finds `content/docs/shibuya/faq.mdx` and
  `content/docs/shibuya/cookbook/index.mdx`. Those pages are outside EP-1's declared scope and are
  owned by the later operations, FAQ, and recipes plan.
- `pnpm build` initially failed because `content/docs/shibuya/walkthrough/index.mdx` had an
  unquoted YAML frontmatter description containing a colon. Quoting the description fixed the
  parse error and the full production build then completed.


## Decision Log

Record every decision made while working on the plan.

- Decision: EP-1 owns the canonical shibuya vocabulary for all later plans.
  Rationale: Metrics, adapters, and integration pages all depend on the same meaning for envelope,
  adapter, handler, ack, retry, dead letter, runner, processor, ordering, and concurrency.
  Date: 2026-06-24
- Decision: Keep metrics, health, Prometheus, WebSocket, and operational recipes out of this plan.
  Rationale: Those exported modules and user workflows form a separate independently verifiable
  surface owned by `docs/plans/36-document-shibuya-metrics-operations-and-recipes.md`.
  Date: 2026-06-24


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

(To be filled during and after implementation.)

EP-1 completed on 2026-06-24. The shibuya section now has a real landing page; tutorial cards and
pages for a first worker, handler decisions, and mock-adapter testing; explanation pages for the
processing model, ack/retry/dead-letter/halt, ordering/concurrency/backpressure, and the adapter
contract; reference pages for core envelope values, adapters, handlers, ack decisions, policies,
runners, retry, stream helpers, and app supervision; how-to pages for policy choice, handler
authoring, retry backoff, dead-letter vs halt, and mock-adapter testing; and a source-ordered
walkthrough from core types through ingestion, handler execution, ack, tracing, supervision, and
shutdown.

Validation evidence:

```text
$ pnpm run typecheck
$ fumadocs-mdx && tsc --noEmit
[MDX] generated files in 1.6835420000000454ms
```

```text
$ node scripts/check-doc-links.mjs
✓ doc links OK — checked 407 files, no broken internal links.
```

```text
$ pnpm build
...
✓ built in 1.46s
ℹ Generated .output/nitro.json
```

```text
$ rg -n "Documentation for shibuya is in progress|Documentation in progress|Pages in this section are coming soon" content/docs/shibuya
content/docs/shibuya/faq.mdx:9:  Documentation for shibuya is in progress. Questions and answers will land here as the shibuya
content/docs/shibuya/cookbook/index.mdx:9:  Pages in this section are coming soon. When a new page is added it will appear here in the sidebar
```

The remaining matches are intentionally deferred to
`docs/plans/36-document-shibuya-metrics-operations-and-recipes.md`.


## Context and Orientation

This repository is the documentation site, not the shibuya source repo. Work from
`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`. The shibuya source must be resolved through
mori before editing docs:

```bash
mori registry show shinzui/shibuya --full
mori registry docs shinzui/shibuya
```

At plan creation, mori resolved `shinzui/shibuya` to
`/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya`. Current HEAD was
`3f276ee190e563fddb0bc81e01d62a96a1b31715` (`3f276ee`, 2026-06-14,
`chore(release): 0.7.1.0`). Recheck before implementation and document any drift in
Surprises & Discoveries.

The current docs tree under `content/docs/shibuya/` is skeletal. `content/docs/shibuya/index.mdx`
defines shibuya as a supervised queue-processing framework and links to the kiroku and pgmq
adapter integration pages, but it still says written content will arrive later. Section folders
already exist: `tutorials`, `how-to`, `reference`, `explanation`, `cookbook`, `walkthrough`, and
`faq.mdx`. Their `index.mdx` files are stubs. Every folder has a `meta.json` where the `pages`
array controls sidebar order.

Vocabulary for this plan:

An adapter is the boundary object that lets shibuya consume a backend queue or event source. The
source modules are `Shibuya.Adapter` and the mock test adapter `Shibuya.Adapter.Mock`.

An envelope is the message container delivered by an adapter. In shibuya-core 0.7.x it carries a
payload plus metadata such as attempt count and optional headers. The source modules are
`Shibuya.Core.Types`, `Shibuya.Core.Ingested`, and `Shibuya.Core.Lease`.

An ack decision is the handler's result: process successfully, retry after a delay, dead-letter, or
halt. The source modules are `Shibuya.Core.Ack`, `Shibuya.Core.AckHandle`, `Shibuya.Core.Retry`,
and `Shibuya.Core.Error`.

A runner is the supervised machinery that moves messages from adapters through handlers under an
ordering/concurrency policy. The source modules are `Shibuya.Runner.Master`,
`Shibuya.Runner.Supervised`, `Shibuya.Runner.Metrics`, and the internal modules
`Shibuya.Runner.Halt`, `Shibuya.Runner.Ingester`, `Shibuya.Runner.Processor`, and
`Shibuya.Runner.Serial`.

The main source files to read are:

- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/README.md`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/docs/user/getting-started.md`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/docs/user/README.md`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/docs/BROADWAY_COMPARISON.md`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/docs/UNIFIED_ARCHITECTURE.md`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/docs/architecture/CORE_TYPES.md`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/docs/architecture/MESSAGE_FLOW.md`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/docs/architecture/CONCURRENCY.md`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/shibuya-core/src/Shibuya/*.hs`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/shibuya-core/src/Shibuya/Core/*.hs`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/shibuya-core/src/Shibuya/Runner/*.hs`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/shibuya-example/app/Main.hs`

The exposed `shibuya-core` modules at plan creation were `Shibuya.Adapter`,
`Shibuya.Adapter.Mock`, `Shibuya.App`, `Shibuya.Core`, `Shibuya.Core.Ack`,
`Shibuya.Core.AckHandle`, `Shibuya.Core.Error`, `Shibuya.Core.Ingested`,
`Shibuya.Core.Lease`, `Shibuya.Core.Retry`, `Shibuya.Core.Types`, `Shibuya.Handler`,
`Shibuya.Policy`, `Shibuya.Prelude`, `Shibuya.Runner.Master`, `Shibuya.Runner.Metrics`,
`Shibuya.Runner.Supervised`, `Shibuya.Stream`, `Shibuya.Telemetry`,
`Shibuya.Telemetry.Config`, `Shibuya.Telemetry.Effect`, `Shibuya.Telemetry.Propagation`, and
`Shibuya.Telemetry.Semantic`. This plan documents the non-metrics foundation modules and leaves
telemetry details for EP-2.


## Plan of Work

Milestone 1 audits source and replaces stubs with a real section spine. Read the mori output,
current upstream README/user docs, cabal exposed modules, source modules, and tests. Update
`content/docs/shibuya/index.mdx` to remove the in-progress callout and describe the learning path.
Update `content/docs/shibuya/tutorials/index.mdx`, `content/docs/shibuya/reference/index.mdx`,
`content/docs/shibuya/how-to/index.mdx`, `content/docs/shibuya/explanation/index.mdx`, and
`content/docs/shibuya/walkthrough/index.mdx` so they introduce real pages with `<Cards>`.

Milestone 2 authors the first-user path. Add tutorial pages under `content/docs/shibuya/tutorials/`
for a first worker, handler decisions, and local mock or example-driven processing. Use the
upstream `shibuya-example/app/Main.hs` and README examples, but verify signatures against source
before copying any snippet. Update `content/docs/shibuya/tutorials/meta.json`.

Milestone 3 authors core explanation and reference pages. Add explanation pages under
`content/docs/shibuya/explanation/` for the processing model, backpressure, ordering/concurrency,
and the ack/retry/dead-letter model. Add reference pages under `content/docs/shibuya/reference/`
for the exported core API: `Shibuya.Core`, adapters, handlers, ack decisions, retry helpers,
policies, runner entrypoints, stream helpers, and app supervision. Keep reference pages factual and
signature-oriented. Use `<TypeTable>` only if neighboring pages already use it cleanly for similar
API facts.

Milestone 4 authors task pages and walkthroughs. Add how-to pages under `content/docs/shibuya/how-to/`
for choosing ordering/concurrency, writing a handler, using retry with backoff, handling dead
letters, and testing with the mock adapter. Add walkthrough subdirectories or pages under
`content/docs/shibuya/walkthrough/` that tour the source from types to adapter ingestion to runner
dispatch to handler ack. These pages should resemble the deeper keiro and kiroku walkthroughs:
source-faithful, ordered, and explicit about every exported type or function they rely on.

Milestone 5 validates. Run the docs checks, scan for remaining "Documentation in progress" in the
shibuya core pages this plan owns, and update Progress, Surprises & Discoveries, Decision Log, and
Outcomes & Retrospective.


## Concrete Steps

Run all commands from `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`.

```bash
mori registry show shinzui/shibuya --full
mori registry docs shinzui/shibuya
git -C /Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya log -1 --date=short --pretty=format:%H%n%h%n%ad%n%s
```

Expected shape:

```text
3f276ee190e563fddb0bc81e01d62a96a1b31715
3f276ee
2026-06-14
chore(release): 0.7.1.0
```

List current docs and source files before editing:

```bash
find content/docs/shibuya -maxdepth 3 -type f | sort
rg --files /Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya/shibuya-core
```

Use the existing page style as templates:

```bash
sed -n '1,220p' content/docs/keiro/walkthrough/foundation/00-start-here.mdx
sed -n '1,220p' content/docs/kiroku/walkthrough/00-start-here.mdx
sed -n '1,180p' content/docs/keiki/reference/core.mdx
```

After editing, validate:

```bash
pnpm run typecheck
pnpm build
node scripts/check-doc-links.mjs
rg -n "Documentation for shibuya is in progress|Documentation in progress" content/docs/shibuya
```

The final `rg` command should print no matches in pages owned by this plan. If EP-2 has not run
yet, matches in operations, metrics, cookbook, or FAQ pages can remain only if this plan explicitly
records that they are owned by EP-2.


## Validation and Acceptance

Acceptance is user-visible documentation behavior:

- Browsing `/docs/shibuya` shows real section copy and cards, not a stub callout.
- Browsing `/docs/shibuya/tutorials` exposes at least one runnable or source-faithful first-worker
  tutorial.
- Browsing `/docs/shibuya/reference` exposes reference pages for the core exported modules listed
  in Context and Orientation, excluding metrics/telemetry details owned by EP-2.
- Browsing `/docs/shibuya/walkthrough` gives a source-ordered tour of shibuya-core, including
  adapter ingestion, envelope construction, handler execution, ack processing, retry/dead-letter
  behavior, and runner supervision.
- `pnpm run typecheck`, `pnpm build`, and `node scripts/check-doc-links.mjs` pass.
- New pages are listed in the relevant `meta.json` files and appear in sidebar order.
- No page authored by this plan claims APIs from memory; every signature and module name is
  traceable to the local shibuya source tree resolved through mori.


## Idempotence and Recovery

This plan is additive and safe to rerun. Re-reading mori output and source files is idempotent.
MDX edits can be repeated as long as each new file is added once to the nearest `meta.json`.

If validation fails, fix only the pages this plan touched unless the failure is a broken link from a
page this plan created into an existing page. If upstream shibuya moved since plan creation, record
the new commit in Surprises & Discoveries, update any affected source claims, and continue. Do not
change upstream shibuya code from this docs repo.


## Interfaces and Dependencies

This plan depends on the registered `shinzui/shibuya` source tree. Use `mori registry show
shinzui/shibuya --full` and `mori registry docs shinzui/shibuya` before relying on any API. The
docs app depends on Fumadocs MDX, TanStack Start, and the existing global MDX components.

The shibuya core API documented here comes from:

- `Shibuya.Adapter`
- `Shibuya.Adapter.Mock`
- `Shibuya.App`
- `Shibuya.Core`
- `Shibuya.Core.Ack`
- `Shibuya.Core.AckHandle`
- `Shibuya.Core.Error`
- `Shibuya.Core.Ingested`
- `Shibuya.Core.Lease`
- `Shibuya.Core.Retry`
- `Shibuya.Core.Types`
- `Shibuya.Handler`
- `Shibuya.Policy`
- `Shibuya.Runner.Master`
- `Shibuya.Runner.Supervised`
- `Shibuya.Stream`

At the end of this plan, later plans can link to stable pages for shibuya vocabulary and core
concepts. EP-2 consumes those pages for metrics and operations. EP-4 consumes them for adapter
delivery guarantees and conversion narratives. EP-5 consumes them for final landing-page and
integration-page reconciliation.
