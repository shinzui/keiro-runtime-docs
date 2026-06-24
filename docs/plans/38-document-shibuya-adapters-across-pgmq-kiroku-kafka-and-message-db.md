---
id: 38
slug: document-shibuya-adapters-across-pgmq-kiroku-kafka-and-message-db
title: "Document shibuya adapters across pgmq kiroku kafka and message db"
kind: exec-plan
created_at: 2026-06-24T18:04:14Z
master_plan: "docs/masterplans/5-complete-shibuya-pgmq-and-adapter-documentation.md"
---

# Document shibuya adapters across pgmq kiroku kafka and message db

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, readers can understand and compare the first-party shibuya adapters. They can
see how pgmq, kiroku, Kafka, and Message DB sources become shibuya envelopes; what each adapter
does with acknowledgements, retries, dead letters, checkpointing or offsets, trace propagation, and
ordering; and which adapter to choose for background jobs, event-store subscriptions, broker
streams, or Message DB event streams.

The visible result is a real adapter documentation set under `content/docs/integrations/` and
cross-linked shibuya pages. The current `content/docs/integrations/shibuya-pgmq-adapter.mdx` stub
becomes a source-checked integration guide, and the existing shibuya-kiroku page is reconciled with
current kiroku/shibuya behavior. New pages are added for Kafka and Message DB if they do not yet
exist.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [x] Resolve adapter source locations with mori and audit current source/docs.
- [x] Author or update the shibuya-pgmq adapter integration guide and related shibuya/pgmq links.
- [x] Reconcile the shibuya-kiroku adapter guide with current kiroku adapter source.
- [x] Add shibuya-kafka and shibuya-message-db adapter integration pages if absent.
- [x] Add adapter comparison/reference/how-to pages and walkthroughs where appropriate.
- [x] Validate source claims, navigation, links, and stale stub removal.


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

- The adapter source heads still match the plan baseline: `shibuya-pgmq-adapter` at `71a7b82`,
  `kiroku` at `9a52aa6`, `shibuya-kafka-adapter` at `424a4c2`, and
  `shibuya-message-db-adapter` at `4307255`.
- `shibuya-message-db-adapter.cabal` still describes some checkpoint/retry/DLQ/partitioning work
  as future or stubbed, but current source and `docs/user/` implement durable contiguous-prefix
  checkpoints, bounded in-process retries, deterministic DLQ writes, and static consumer groups.
  The docs were written from source modules and user guides rather than the stale cabal summary.
- The Kafka adapter intentionally does not publish retry or dead-letter records. `AckRetry` and
  `AckDeadLetter` store offsets, while `AckHalt` pauses the partition and leaves the offset
  uncommitted.


## Decision Log

Record every decision made while working on the plan.

- Decision: Cover all first-party shibuya adapters in one plan.
  Rationale: The user explicitly asked to include the shibuya adapters, and adapter docs share a
  common comparison matrix, ack/delivery vocabulary, and integration page area.
  Date: 2026-06-24
- Decision: Make EP-1 a hard dependency and EP-3 a soft dependency.
  Rationale: Every adapter maps external messages into shibuya terms from EP-1. The pgmq adapter
  benefits from EP-3's pgmq substrate pages, but it can still be implemented by reading pgmq-hs
  source directly.
  Date: 2026-06-24


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

Completed on 2026-06-24.

The integrations section now has source-checked pages for all four first-party shibuya adapters:
`shibuya-pgmq-adapter`, `shibuya-kiroku-adapter`, `shibuya-kafka-adapter`, and
`shibuya-message-db-adapter`. A shared `shibuya-adapters` comparison page explains source type,
payload shape, progress ownership, ack mapping, retry and DLQ behavior, ordering, envelope fields,
and adapter choice. The integrations landing page and `meta.json` include all adapter pages, and
the shibuya adapter reference links back to the comparison page.

The PGMQ adapter stub was replaced with a full guide covering `PgmqAdapterConfig`, visibility
leases, polling, max retries, DLQ routing, FIFO reads, topic helpers, envelope mapping, and
operational notes. `docs/shibuya-pgmq-adapter-source-sync.md` now pins the content-authored page to
upstream commit `71a7b82` and records the old `8e6f6e9` bootstrap pointer as historical.

Kafka and Message DB do not yet have dedicated source-sync pointer files. This plan records their
reviewed upstream commits in its Context and Surprises sections; EP-5 owns the final pointer
strategy across integrations.

Validation passed:

- `pnpm run typecheck`
- `pnpm build`
- `node scripts/check-doc-links.mjs`
- `rg -n "Documentation in progress|TODO|coming soon" content/docs/integrations content/docs/shibuya`


## Context and Orientation

This repository is the documentation site. Work from
`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`. This plan depends on completed shibuya core
terminology from `docs/plans/35-author-shibuya-foundation-core-and-walkthrough-docs.md`. It has a
soft dependency on pgmq substrate language from
`docs/plans/37-author-pgmq-hs-queue-substrate-documentation.md`.

Resolve each dependency with mori before editing:

```bash
mori registry show shinzui/shibuya-pgmq-adapter --full
mori registry show shinzui/kiroku --full
mori registry show shinzui/shibuya-kafka-adapter --full
mori registry show shinzui/shibuya-message-db-adapter --full
mori registry show shinzui/pgmq-hs --full
mori registry show shinzui/shibuya --full
```

At plan creation, mori and git showed:

- `shinzui/shibuya-pgmq-adapter` at
  `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-pgmq-adapter`, HEAD
  `71a7b82223449d84c395b64e480c9cfe4ff274f1` (`71a7b82`, 2026-06-14,
  `chore(release): 0.8.0.0`).
- `shinzui/kiroku` at `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku`, HEAD
  `9a52aa62380c28b0ec36eeb9b517f49e40900fd8` (`9a52aa6`, 2026-06-24,
  `test(kiroku-store): TruncateBefore suite + docs (M4)`). The adapter package is
  `shibuya-kiroku-adapter`.
- `shinzui/shibuya-kafka-adapter` at
  `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-kafka-adapter`, HEAD
  `424a4c25d96333f9cf8aa13eaae3b306bbb775c5` (`424a4c2`, 2026-06-05,
  `feat!: surface Kafka headers on Envelope and require shibuya-core 0.7`).
- `shinzui/shibuya-message-db-adapter` at
  `/Users/shinzui/Keikaku/work/libraries/haskell/shibuya-message-db-adapter`, HEAD
  `43072558a58d9613cce46c3624157d6fc3e5b6b0` (`4307255`, 2026-06-03,
  `build(nix): migrate flake to flake-parts dev shell on the haskell-nix-dev base flake`).

Recheck all commits before implementation and record drift.

Current docs:

- `content/docs/integrations/shibuya-pgmq-adapter.mdx` is a short pgmq adapter stub with a callout
  saying keiro users usually use `keiro-pgmq`.
- `content/docs/integrations/shibuya-kiroku-adapter.mdx` exists and may already contain more than a
  stub. Re-read it before editing.
- `content/docs/integrations/meta.json` currently lists shibuya-kiroku, shibuya-pgmq, keiro with
  kiroku, keiro with keiki, and keiro with pgmq. It does not list Kafka or Message DB adapter pages
  at plan creation.

Adapter source surfaces:

For pgmq:

- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-pgmq-adapter/shibuya-pgmq-adapter/src/Shibuya/Adapter/Pgmq.hs`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-pgmq-adapter/shibuya-pgmq-adapter/src/Shibuya/Adapter/Pgmq/Config.hs`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-pgmq-adapter/shibuya-pgmq-adapter/src/Shibuya/Adapter/Pgmq/Convert.hs`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-pgmq-adapter/shibuya-pgmq-adapter/src/Shibuya/Adapter/Pgmq/Internal.hs`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-pgmq-adapter/docs/user/pgmq-getting-started.md`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-pgmq-adapter/docs/user/pgmq-advanced.md`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-pgmq-adapter/docs/user/pgmq-dead-letter-queues.md`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-pgmq-adapter/docs/user/pgmq-topic-routing.md`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-pgmq-adapter/shibuya-pgmq-example/`

For kiroku:

- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/shibuya-kiroku-adapter/src/Shibuya/Adapter/Kiroku.hs`
- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/shibuya-kiroku-adapter/src/Shibuya/Adapter/Kiroku/Convert.hs`
- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/docs/user/shibuya-adapter.md`
- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/docs/user/subscriptions.md`
- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/docs/user/consumer-groups.md`

For Kafka:

- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-kafka-adapter/shibuya-kafka-adapter/src/Shibuya/Adapter/Kafka.hs`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-kafka-adapter/shibuya-kafka-adapter/src/Shibuya/Adapter/Kafka/Config.hs`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-kafka-adapter/shibuya-kafka-adapter/src/Shibuya/Adapter/Kafka/Convert.hs`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-kafka-adapter/shibuya-kafka-adapter/src/Shibuya/Adapter/Kafka/Internal.hs`
- `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-kafka-adapter/shibuya-kafka-adapter-jitsurei/app/`

For Message DB:

- `/Users/shinzui/Keikaku/work/libraries/haskell/shibuya-message-db-adapter/shibuya-message-db-adapter/src/Shibuya/Adapter/MessageDb.hs`
- `/Users/shinzui/Keikaku/work/libraries/haskell/shibuya-message-db-adapter/shibuya-message-db-adapter/src/Shibuya/Adapter/MessageDb/Config.hs`
- `/Users/shinzui/Keikaku/work/libraries/haskell/shibuya-message-db-adapter/shibuya-message-db-adapter/src/Shibuya/Adapter/MessageDb/Convert.hs`
- `/Users/shinzui/Keikaku/work/libraries/haskell/shibuya-message-db-adapter/shibuya-message-db-adapter/src/Shibuya/Adapter/MessageDb/Internal.hs`
- `/Users/shinzui/Keikaku/work/libraries/haskell/shibuya-message-db-adapter/shibuya-message-db-adapter/src/Shibuya/Adapter/MessageDb/Internal/Dlq.hs`
- `/Users/shinzui/Keikaku/work/libraries/haskell/shibuya-message-db-adapter/shibuya-message-db-adapter/src/Shibuya/Adapter/MessageDb/Internal/InflightState.hs`
- `/Users/shinzui/Keikaku/work/libraries/haskell/shibuya-message-db-adapter/docs/user/*.md`
- `/Users/shinzui/Keikaku/work/libraries/haskell/shibuya-message-db-adapter/shibuya-message-db-adapter-jitsurei/app/`


## Plan of Work

Milestone 1 audits adapter source and current docs. Re-run all mori commands, inspect adapter
README files, user docs, cabal exposed modules, source modules, and tests. Build a comparison table
for each adapter: source system, delivery/cursor model, envelope metadata and headers, ack mapping,
retry and dead-letter behavior, ordering/concurrency constraints, example package, observability,
and intended use case.

Milestone 2 authors pgmq adapter docs. Replace `content/docs/integrations/shibuya-pgmq-adapter.mdx`
with a full integration guide. Add pages under `content/docs/shibuya/how-to/` or
`content/docs/shibuya/walkthrough/` if a longer adapter setup or source tour would overload the
integration page. Link to EP-3's pgmq pages for queue operations and to EP-1's shibuya pages for
envelopes and ack decisions.

Milestone 3 reconciles kiroku adapter docs. Update `content/docs/integrations/shibuya-kiroku-adapter.mdx`
against current `Shibuya.Adapter.Kiroku` and `Shibuya.Adapter.Kiroku.Convert`. Make sure it agrees
with existing kiroku subscription docs under `content/docs/kiroku/` and source-sync notes.

Milestone 4 adds Kafka and Message DB adapter pages. Create
`content/docs/integrations/shibuya-kafka-adapter.mdx` and
`content/docs/integrations/shibuya-message-db-adapter.mdx` if still absent. Update
`content/docs/integrations/meta.json` and `content/docs/integrations/index.mdx` cards. These pages
should be honest about whether the docs site treats them as first-class runtime docs or ecosystem
adapters, but they must include enough source-backed content to be useful.

Milestone 5 authors shared adapter comparison and walkthrough material. Add a shibuya explanation
or reference page comparing adapter responsibilities and a source walkthrough if the adapter
contracts benefit from a unified tour. Keep shared language under shibuya, and keep package-specific
wiring under integrations.

Milestone 6 validates and updates sync notes. Update `docs/shibuya-pgmq-adapter-source-sync.md`
from skeleton status to content-authored status. If Kafka or Message DB need source-sync pointers,
create them or explicitly record in Outcomes & Retrospective that EP-5 will decide the pointer
strategy.


## Concrete Steps

Run all commands from `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`.

```bash
mori registry show shinzui/shibuya-pgmq-adapter --full
mori registry show shinzui/kiroku --full
mori registry show shinzui/shibuya-kafka-adapter --full
mori registry show shinzui/shibuya-message-db-adapter --full
mori registry docs shinzui/shibuya-pgmq-adapter
mori registry docs shinzui/shibuya-message-db-adapter
```

Inspect current source heads:

```bash
git -C /Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-pgmq-adapter log -1 --date=short --pretty=format:%H%n%h%n%ad%n%s
git -C /Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku log -1 --date=short --pretty=format:%H%n%h%n%ad%n%s
git -C /Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-kafka-adapter log -1 --date=short --pretty=format:%H%n%h%n%ad%n%s
git -C /Users/shinzui/Keikaku/work/libraries/haskell/shibuya-message-db-adapter log -1 --date=short --pretty=format:%H%n%h%n%ad%n%s
```

Inspect docs and source:

```bash
sed -n '1,240p' content/docs/integrations/shibuya-pgmq-adapter.mdx
sed -n '1,240p' content/docs/integrations/shibuya-kiroku-adapter.mdx
rg --files /Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-pgmq-adapter/shibuya-pgmq-adapter/src
rg --files /Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/shibuya-kiroku-adapter/src
rg --files /Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-kafka-adapter/shibuya-kafka-adapter/src
rg --files /Users/shinzui/Keikaku/work/libraries/haskell/shibuya-message-db-adapter/shibuya-message-db-adapter/src
```

Validate:

```bash
pnpm run typecheck
pnpm build
node scripts/check-doc-links.mjs
rg -n "Documentation in progress|TODO|coming soon" content/docs/integrations content/docs/shibuya
```


## Validation and Acceptance

Acceptance:

- `/docs/integrations/shibuya-pgmq-adapter` is a full source-checked guide, not a stub.
- `/docs/integrations/shibuya-kiroku-adapter` agrees with current kiroku adapter and subscription
  behavior.
- Kafka and Message DB adapter pages exist under `/docs/integrations/` or the plan records a
  source-backed reason for not adding one.
- The integrations landing page includes cards for every adapter page this plan creates or updates.
- A reader can compare pgmq, kiroku, Kafka, and Message DB adapters by source type, delivery model,
  ack mapping, retry/dead-letter semantics, ordering, observability, and example availability.
- `docs/shibuya-pgmq-adapter-source-sync.md` no longer says only a skeleton has been authored.
- `pnpm run typecheck`, `pnpm build`, and `node scripts/check-doc-links.mjs` pass.


## Idempotence and Recovery

This plan is safe to repeat. Re-run mori before each session because adapter repos may move or
release independently. Add new integration pages once and add their slugs once to
`content/docs/integrations/meta.json`.

If source behavior differs from current docs, update docs to source and record the discrepancy in
Surprises & Discoveries. If a source tree is unavailable, stop the affected adapter work and record
the blocker rather than guessing API behavior.


## Interfaces and Dependencies

This plan depends on:

- EP-1 shibuya core pages for adapter, envelope, handler, ack, retry, dead-letter, ordering, and
  concurrency vocabulary.
- EP-3 pgmq pages for queue substrate links and pgmq operation semantics.
- `Shibuya.Adapter.Pgmq`, `Shibuya.Adapter.Pgmq.Config`, `Shibuya.Adapter.Pgmq.Convert`
- `Shibuya.Adapter.Kiroku`, `Shibuya.Adapter.Kiroku.Convert`
- `Shibuya.Adapter.Kafka`, `Shibuya.Adapter.Kafka.Config`, `Shibuya.Adapter.Kafka.Convert`
- `Shibuya.Adapter.MessageDb`, `Shibuya.Adapter.MessageDb.Config`,
  `Shibuya.Adapter.MessageDb.Convert`

The final page ordering, source-sync pointer consistency, landing-page language, and whole-site
validation are owned by
`docs/plans/39-reconcile-shibuya-pgmq-integrations-navigation-and-source-sync.md`.
