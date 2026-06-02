---
id: 16
slug: deepen-the-keiro-integration-events-code-walkthrough
title: "Deepen the keiro integration-events code walkthrough"
kind: exec-plan
created_at: 2026-06-02T04:47:38Z
master_plan: "docs/masterplans/2-keiro-framework-documentation-set.md"
---

# Deepen the keiro integration-events code walkthrough

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, a developer who opens the integration-events code tour at
`/docs/keiro/walkthrough/integration/` can read **every** exported function, type, and SQL
statement of keiro's cross-bounded-context message path — the inbox, the outbox, and the pure
Kafka mapping — and come away able to *contribute* to `Keiro.Inbox` / `Keiro.Outbox`, not merely
recognise them. An **integration event** is a public message one service (a **bounded context** —
one service with its own database and event streams) publishes for another to consume over a
broker such as Kafka; it is distinct from a private domain event, which never leaves the service.
The **inbox** is the pattern that makes *receiving* such a message idempotent (the same delivery
runs the handler at most once); the **outbox** is the pattern that makes *publishing* durable
(the message is written into the same database transaction as the domain change, then published
later from that durable row). Together they buy an *exactly-once effect* over an at-least-once
broker.

Today the tour samples this surface: four short chapters (48–113 MDX lines each), mostly one
excerpt plus a paragraph. It shows `dedupeKeyFor`, `runInboxTransaction`, the claim CTE, and the
header mapping, but it skips the **envelope source** (`Keiro.Integration.Event` — the
`IntegrationEvent` record's sixteen fields, `integrationHeaders`, `encodeJsonIntegrationEvent` /
`decodeJsonIntegrationEvent`, the content-type round-trip, and the prefixed-TypeID message id),
the **full inbox storage surface** (`tryInsertProcessingTx`, `markCompletedTx`, the reserved
`markFailedTx`, `garbageCollectCompleted`, `lookupInbox` / `listInbox`, and the `keiro_inbox`
schema with its primary key and indexes), the **producer-mint path**
(`enqueueProducerEventTx` → `mintIntegrationEvent` → `draftToEvent`, and the
`IntegrationEventDraft` shape), the **`markOutboxFailedTx` dead-letter decision** and the backoff
curve (`nextDelay`, `ExponentialBackoffOptions`), the **`OutboxPublishSummary` counters**, and
two of the four ordering predicates (`perSourcePredicate`, and the `BestEffort` `"TRUE"` /
`StopTheLine`-reuses-`perKeyPredicate` facts).

This plan walks the whole of `keiro/src/Keiro/Inbox.hs`, `keiro/src/Keiro/Inbox/Types.hs`,
`keiro/src/Keiro/Inbox/Schema.hs` (481 lines), `keiro/src/Keiro/Inbox/Kafka.hs`,
`keiro/src/Keiro/Outbox.hs` (286 lines), `keiro/src/Keiro/Outbox/Types.hs`,
`keiro/src/Keiro/Outbox/Schema.hs` (535 lines — the claim CTE, the ordering predicates, the
mark-sent/failed/dead statements), `keiro/src/Keiro/Outbox/Kafka.hs`, and the envelope in
`keiro-core/src/Keiro/Integration/Event.hs` (295 lines) end to end, anchored to the keiro repo's
own `docs/guides/integration-events-with-kafka.md` (jitsurei ships **no** Kafka demo — see the
Decision Log — so the tour documents the API and that guide's worked producer, not a `just
jitsurei-*` target).

A reader who finishes the deepened tour can:

- **Read the `IntegrationEvent` envelope's source**: its sixteen fields and what each carries,
  the identity rule (`messageId` is the canonical dedupe key; the Kafka offset is delivery
  metadata only), `integrationPayload` / `integrationHeaders` (only-populated-headers emission),
  the JSON convenience helpers `encodeJsonIntegrationEvent` / `decodeJsonIntegrationEvent` and
  their `IntegrationEventError` failures, and the `IntegrationContentType` round-trip
  (`contentTypeText` / `parseContentType`). The *reference* for this envelope already shipped as
  `/docs/keiro/reference/integration-event` (EP-11); the tour **walks the source and links the
  reference**, it does not re-document the reference's field tables.
- **Trace a delivery through the inbox call graph**: `integrationEventFromKafka` →
  `dedupeKeyFor` (all four policy branches, including the `PreferSourceEventIdentity` fallback
  chain) → `runInboxTransaction` → `runInboxTransactionWithKey` → `tryInsertProcessingTx` (the
  `INSERT … ON CONFLICT (source, dedupe_key) DO NOTHING RETURNING TRUE`, the re-select-on-conflict
  branch, and the inserted-then-GC'd race fall-through) → handler → `markCompletedTx`, plus the
  duplicate branch (`InboxCompleted → InboxDuplicate`, etc.) and the rollback path.
- **Read the inbox's full storage surface**: `markFailedTx` (exists but *reserved* — the v1
  wrapper never calls it), `garbageCollectCompleted` (the retention window **is** the
  duplicate-detection window; failed rows are never GC'd), `lookupInbox` / `listInbox`, and the
  `keiro_inbox` table line by line (`PRIMARY KEY (source, dedupe_key)`, the columns, the
  `received_at` index and the partial `completed_at` index).
- **Trace a publish through the outbox call graph**: the producer mint
  (`enqueueProducerEventTx` → `mintIntegrationEvent` minting a prefixed TypeID → `draftToEvent`),
  the inline escape hatch (`freshOutboxId` + `enqueueIntegrationEventTx`), `enqueueOutboxTx`'s
  `INSERT … ON CONFLICT (source, message_id) DO NOTHING`, the claim CTE
  (`status IN ('pending','failed')`, `next_attempt_at <= $2`, the spliced ordering predicate,
  `ORDER BY created_at LIMIT $1 FOR UPDATE SKIP LOCKED`, then the `UPDATE … SET status =
  'publishing'`), and `drainBatch` (publish → `markOutboxSent` on success; `markOutboxFailedTx`
  on failure, deciding `OutboxDead` vs. `OutboxFailed`; the `StopTheLine` halt and `haltedOn`).
- **Tell apart all four ordering policies and their spliced SQL** — `PerKeyHeadOfLine`
  (`perKeyPredicate`), `PerSourceStream` (`perSourcePredicate`), `StopTheLine` (claims with
  `perKeyPredicate`, halts at the worker level), `BestEffort` (`"TRUE"`) — and read the
  `perKeyPredicate` / `perSourcePredicate` SQL verbatim.
- **Understand the backoff and dead-letter mechanics**: `BackoffSchedule`
  (`ConstantBackoff` / `ExponentialBackoff`), `nextDelay`'s exact formula, `defaultPublishOptions`
  (batch 32, ten attempts, two-second constant backoff, per-key head-of-line), and the
  `OutboxPublishSummary` counters (`claimed`, `published`, `retried`, `dead`, `haltedOn`).
- **Read the stale-`publishing`-row gap honestly**: the claim query selects only
  `pending`/`failed`, so a worker that crashes between claim and mark strands a row in
  `publishing` with **no automatic recovery**, and (because both head-of-line predicates treat
  `publishing` as non-terminal) that stranded row also head-of-line-blocks its key. The Haddock on
  `OutboxPublishing` that *claims* the claim query reclaims it is wrong; the tour documents the
  shipped behavior and links the manual-recovery runbook.
- **Read both Kafka mappings**: out (`outboxRowToKafkaRecord` / `integrationEventToKafkaRecord` →
  `KafkaProducerRecord`, UTF-8 key/header encoding) and in (`integrationEventFromKafka` → the six
  required headers, the numeric/UUID parse errors, the `occurredAt = receivedAt` asymmetry, and
  the poison-message rule), all pure and broker-free.

You can see the result by running the docs site from the repo root
(`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`) with `pnpm dev` (which runs `vite dev`), or a
production build with `pnpm build` (which runs `vite build` and emits a static single-page app
under `.output/public`). Browsing
`http://localhost:3000/docs/keiro/walkthrough/integration/00-start-here` shows the expanded tour
nested under "Code Walkthrough" → "Integration (inbox & outbox)" in the sidebar, with the new
chapters in `meta.json` order. The visible, demonstrable change: where the old tour had **four**
chapters totalling ~358 MDX lines, the deepened tour has **six** chapters covering every exported
`Keiro.Inbox` / `Keiro.Outbox` / `Keiro.Integration.Event` binding, all four ordering predicates,
and the dead-letter path — each function introduced with its real Haskell signature and a focused
excerpt quoted verbatim from the pinned source.

This is a **content** plan. It rewrites and adds files only under
`content/docs/keiro/walkthrough/integration/`. It does **not** build the docs app, the
highlighter, the font, the Mermaid component, or the IA/template system (MasterPlan #1 owns those;
they are complete). It does **not** re-author the integration-events reference pages
(`/docs/keiro/reference/integration-event`, `/docs/keiro/reference/inbox`,
`/docs/keiro/reference/outbox`) or the explanation/how-to pages EP-11 shipped — this tour links to
them. Every Haskell snippet and SQL block documents keiro **as shipped at the pinned upstream
commit `3f5dc9c` (keiro 0.1.0.0)**; where the keiro repo's own `docs/research/*` / `docs/plans/*`
notes or an inaccurate in-source Haddock comment diverge from the shipped code, this plan follows
the source.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here, even if
it requires splitting a partially completed task into two ("done" vs. "remaining"). This section
must always reflect the actual current state of the work.

- [x] M0. Preconditions verified — EP-11 Complete (the `walkthrough/integration/` subdir existed
      with its four current chapters + `meta.json`; `integration` is listed in
      `walkthrough/meta.json`); the cross-link targets this tour points at all exist
      (`reference/integration-event`, `reference/inbox`, `reference/outbox`, `reference/command`,
      `reference/telemetry`, the three integration explanations, the five integration how-tos
      including the `#recovering-stranded-publishing-rows` anchor at
      `choose-an-outbox-ordering-policy.mdx:57`, the consume tutorial); keiro source read at the
      pinned commit `3f5dc9c` and every transcription in this plan confirmed verbatim against the
      named files. (No `pnpm build` run — out of scope for this authoring pass.)
- [x] M1. New chapter `01-the-integration-event-envelope.mdx` authored (207 lines) — the
      `IntegrationEvent` record's sixteen fields, `IntegrationContentType` / `SchemaReference` /
      `TraceContext` / `IntegrationEventError`, `integrationPayload`, `integrationHeaders`,
      `encodeJsonIntegrationEvent` / `decodeJsonIntegrationEvent`, `contentTypeText` /
      `parseContentType`, the canonical `keiro-*` header constants, and the identity rule; links
      to `/docs/keiro/reference/integration-event` instead of re-documenting it.
- [x] M2. Chapter `02-the-inbox.mdx` rewritten (was `01-the-inbox`, plain `mv`; 210 lines) —
      `dedupeKeyFor` (all four branches), `runInboxTransaction` / `runInboxTransactionWithKey`,
      `tryInsertProcessingTx` (ON CONFLICT + re-select + race fall-through), `markCompletedTx`, the
      reserved `markFailedTx`, `garbageCollectCompleted`, `lookupInbox` / `listInbox`, the
      `InboxStatus` / `InboxResult` branches, and the `keiro_inbox` table.
- [x] M3. New chapter `03-the-outbox-enqueue-and-claim.mdx` authored (split from old
      `02-the-outbox`; 235 lines) — `freshOutboxId`, `enqueueIntegrationEventTx`,
      `IntegrationProducer`, `IntegrationEventDraft`, `mintIntegrationEvent` (prefixed TypeID),
      `draftToEvent`, `enqueueProducerEventTx`, `enqueueOutboxTx` (ON CONFLICT), the row lifecycle
      (`OutboxStatus` constructors), `lookupOutbox` / `listOutbox`, the claim CTE, all four ordering
      predicates (`policyPredicate` / `perKeyPredicate` / `perSourcePredicate`), the
      stale-`publishing` gap, and the `keiro_outbox` table.
- [x] M4. New chapter `04-the-outbox-drain-and-dead-letter.mdx` authored (split from old
      `02-the-outbox`; 159 lines) — `PublishOutcome`, `publishClaimedOutbox` / `drainBatch`,
      `markOutboxSent`, `markOutboxFailedTx` (the `OutboxDead` vs. `OutboxFailed` decision),
      `BackoffSchedule` / `ExponentialBackoffOptions` / `nextDelay`, `defaultPublishOptions`,
      `OutboxPublishOptions`, `OutboxPublishSummary`, the `StopTheLine` halt + `haltedOn`, and the
      one-pass-per-call rule.
- [x] M5. Chapter `05-kafka-mapping.mdx` rewritten (was `03-kafka-mapping`, plain `mv`; 113 lines)
      — `KafkaProducerRecord`, `outboxRowToKafkaRecord` / `integrationEventToKafkaRecord`,
      `KafkaInboundRecord`, `KafkaDecodeError`, `integrationEventFromKafka` (the six required
      headers, `requireHeader` / `parseInt` / `parseUuid` / `traverseLookup` /
      `buildSchemaReference`), the `occurredAt = receivedAt` asymmetry, and the poison-message rule.
- [x] M6. `00-start-here.mdx` updated (51 lines) — new five-card chapter list, refreshed
      source-file map (nine read modules + two migrations), the pipeline `mermaid` kept; `meta.json`
      `pages` rewritten to the six new slugs (verified in sync).
- [x] M7. Acceptance (no-pnpm pass) — depth checklist green (every `Inbox`/`Outbox`/`Integration.Event`
      export, all four ordering predicates, the dead-letter path present in the subdir AND confirmed
      verbatim in the pinned source); no relative links; every opening fence language-tagged (even
      fence counts per file); meta.json in sync; old `02-the-outbox.mdx` removed. Browser/`pnpm
      build`/`lint:links` are deferred to the finalization pass (EP-19) per this run's scope.


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during implementation.
Provide concise evidence.

- **(Carried over from EP-11, re-verify against the source while authoring.) The outbox claim
  query does NOT reclaim stale `publishing` rows — the `OutboxPublishing` Haddock is wrong.**
  `Keiro.Outbox.Types.OutboxStatus`'s comment on `OutboxPublishing` says "Rows left in this state
  after a worker crash are reclaimable through the same claim query." But
  `Keiro.Outbox.Schema.claimSql` filters `WHERE r.status IN ('pending', 'failed')` — `publishing`
  is **not** selected (confirmed at `keiro/src/Keiro/Outbox/Schema.hs` line ~306). A worker that
  crashes between `claimOutboxBatch` (which sets `status = 'publishing'`) and
  `markOutboxSent` / `markOutboxFailedTx` therefore strands the row forever, and under
  `PerKeyHeadOfLine` / `PerSourceStream` that stranded non-terminal row also head-of-line-blocks
  every later row sharing its key/source (both predicates exclude only `('sent', 'dead')`, so
  `publishing` counts as blocking — `keiro/src/Keiro/Outbox/Schema.hs` lines ~284-299). **Bearing:**
  chapters `03` and `04` document the shipped behavior (no automatic reclaim) and link the manual
  recovery runbook at
  `/docs/keiro/how-to/choose-an-outbox-ordering-policy#recovering-stranded-publishing-rows`;
  neither chapter repeats the inaccurate Haddock.

- **Re-verified against the pinned source (2026-06-02): the `OutboxPublishing` Haddock is still
  wrong.** `keiro/src/Keiro/Outbox/Types.hs` lines 50-52 still comment that crashed-`publishing`
  rows are "reclaimable through the same claim query," but `claimSql`
  (`keiro/src/Keiro/Outbox/Schema.hs` line 306) filters `WHERE r.status IN ('pending', 'failed')` —
  `publishing` is not selected — and both head-of-line predicates exclude only `('sent', 'dead')`
  (lines 289, 298), so a stranded `publishing` row also head-of-line-blocks its key. Chapters 03 and
  04 document the shipped behavior (no automatic reclaim) with a `<Callout type="warn">` and link
  the manual runbook at
  `/docs/keiro/how-to/choose-an-outbox-ordering-policy#recovering-stranded-publishing-rows`; neither
  chapter repeats the inaccurate Haddock.
- **No transcription divergences found.** Every Haskell name and SQL clause this plan transcribed
  (Section "The source you must walk, transcribed") matched the pinned tree verbatim at `3f5dc9c`,
  including: `Event.hs` (the sixteen-field record, `integrationHeaders`, the seventeen header
  constants, `encode`/`decode`, `contentTypeText`/`parseContentType`); `Inbox.hs` /
  `Inbox/Types.hs` / `Inbox/Schema.hs` (`dedupeKeyFor`, `runInboxTransaction(/WithKey)`,
  `tryInsertProcessingTx` with the `ON CONFLICT (source, dedupe_key) DO NOTHING RETURNING TRUE`,
  `markCompletedStmt`, the reserved `markFailedTx`, the `gcStmt` CTE, the `keiro_inbox` DDL);
  `Outbox.hs` / `Outbox/Types.hs` / `Outbox/Schema.hs` (the mint path, `enqueueOutboxStmt`,
  `claimSql`, `policyPredicate`/`perKeyPredicate`/`perSourcePredicate`, `markOutboxFailedTx`,
  `nextDelay`, `defaultPublishOptions`, the `keiro_outbox` DDL); and both Kafka modules. Two small
  authoring notes: (a) `markCompletedStmt`/`gcStmt` are the exact SQL (the gc statement is a
  `WITH deleted AS (DELETE … RETURNING 1) SELECT COUNT(*)` CTE — quoted accordingly in chapter 02);
  (b) the depth-checklist required six exported names the per-section outline did not explicitly
  place (`InboxStatus`, `InboxResult`, `OutboxPending`, `OutboxPublishing`, `lookupOutbox`,
  `listOutbox`) — these were woven into chapters 02 (the result/status branch prose) and 03 (a new
  one-paragraph "row lifecycle" note plus the inspection helpers) so every exported binding appears.
- **Cross-tour link to command-cycle uses `00-start-here`.** The producer-mint section (chapter 03)
  links `/docs/keiro/walkthrough/command-cycle/00-start-here` (the Hydrate → Transduce → Append write
  path that records the private events producer subscriptions map) rather than a deeper codec slug,
  since the tour root is the stable canonical entry and was confirmed present during authoring.


## Decision Log

Record every decision made while working on the plan.

- Decision: Renumber the tour from four chapters (`00`–`03`) to **six files** (`00` start-here plus
  `01`–`05`): add a dedicated **envelope** chapter (`01`) at the front, keep the inbox as one
  chapter (`02`), **split the single dense old outbox chapter into two** — *enqueue and claim*
  (`03`) and *drain and dead-letter* (`04`) — and keep the Kafka mapping as the final chapter
  (`05`).
  Rationale: the brief asks for "introduce the types, then each function with its real signature
  and a focused excerpt, then the edge cases" per chapter. The outbox alone spans enqueue/mint, a
  multi-clause claim CTE with four ordering predicates, and a drain loop with backoff and
  dead-lettering — too much for one readable chapter. The envelope deserves its own chapter because
  the brief calls it out explicitly (its source is the contract both halves serialize), even though
  the *reference* already exists and must not be re-documented. Disjoint-subdirectory ownership
  (Integration Point #2) lets EP-16 add and renumber chapters inside `walkthrough/integration/`
  freely as long as `meta.json` stays in sync.
  Date: 2026-06-02
- Decision: The envelope chapter **walks the `Keiro.Integration.Event` source but links the
  reference** (`/docs/keiro/reference/integration-event`, owned by EP-11 per MasterPlan Integration
  Point #5) for the exhaustive field tables; it does not duplicate the `<TypeTable>` reference
  content.
  Rationale: EP-11 already shipped `reference/integration-event`. A walkthrough's job is to read the
  source and explain *why* it is shaped that way, not to restate a reference. Re-documenting the
  envelope would create two sources of truth that can drift.
  Date: 2026-06-02
- Decision: Document the **stale-`publishing`-row gap honestly** as a known limitation, and do NOT
  repeat the inaccurate `OutboxPublishing` Haddock.
  Rationale: the claim query (`status IN ('pending', 'failed')`) provably does not reclaim
  `publishing` rows (see Surprises & Discoveries). Documenting the comment's claim would mislead a
  contributor and contradict the how-to runbook EP-11 shipped.
  Date: 2026-06-02
- Decision: Document the integration path **without a `just jitsurei-*` anchor**: use the API and
  the keiro repo's `docs/guides/integration-events-with-kafka.md` worked producer as the running
  example.
  Rationale: jitsurei ships no Kafka demo (MasterPlan Integration Point #3 and EP-11's Decision
  Log). Inventing a target would make the tour uncompilable to follow.
  Date: 2026-06-02
- Decision: Keep the command-cycle phrasing **Hydrate → Transduce → Append** wherever this tour
  references the write path that mints producer events; never "Decide".
  Rationale: "Decide" echoes keiki's legacy Decider façade, banned from these docs (MasterPlan
  Decision Log, 2026-06-01).
  Date: 2026-06-02


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion. Compare the
result against the original purpose.

**2026-06-02 — authoring pass complete (M0–M7, no-pnpm).** The tour grew from four chapters
(~358 MDX lines: `00`/`01-the-inbox`/`02-the-outbox`/`03-kafka-mapping`) to six chapters (975 MDX
lines) under `content/docs/keiro/walkthrough/integration/`:

- `00-start-here.mdx` (51) — five-card chapter list, source map refreshed to nine read modules + two
  migrations, pipeline `mermaid` kept.
- `01-the-integration-event-envelope.mdx` (207, new) — the envelope source, walked and linked to the
  reference (not re-documented).
- `02-the-inbox.mdx` (210, plain `mv` from `01-the-inbox`) — full inbox storage surface + schema.
- `03-the-outbox-enqueue-and-claim.mdx` (235, new, split from old `02-the-outbox`) — enqueue, mint,
  claim CTE, all four ordering predicates, stale-`publishing` gap.
- `04-the-outbox-drain-and-dead-letter.mdx` (159, new, other half of the split) — drain, backoff,
  dead-letter, `StopTheLine`.
- `05-kafka-mapping.mdx` (113, plain `mv` from `03-kafka-mapping`) — the pure broker-free boundary,
  both directions, the decode helpers, poison-message rule.

The old `02-the-outbox.mdx` was `rm`'d after the split; `meta.json` was rewritten to the six ordered
slugs and verified in sync with the files on disk.

Against the original purpose: a reader can now read **every** exported `Keiro.Inbox` /
`Keiro.Outbox` / `Keiro.Integration.Event` binding, all four ordering predicates, the dead-letter
path, and both SQL schemas — each introduced with its real Haskell signature and a verbatim excerpt
from the pinned source. The full depth checklist (Validation #6/#7) is green: every name appears in
the subdir AND in the pinned source. Every fence is language-tagged; every link is absolute; the
stale-`publishing` gap is documented honestly (the inaccurate Haddock is not repeated).

Gap / handoff: this run did not execute `pnpm build`, `pnpm lint:links`, or the browser walk (out of
scope for the authoring pass). EP-19 (walkthrough finalization) should run the full acceptance gate
(Validation #1–#3, #8) across the deepened tours. No source divergences were found, so no follow-up
on accuracy is needed.


## Context and Orientation

Read this whole section before editing. It is written so a contributor with only this file and the
working tree can complete the work. You will edit and add MDX content files under one directory;
you will not write or compile Haskell. The Haskell appears only as *quoted snippets* inside the
docs, and every snippet must match the real source transcribed below.

### What you are building, and where

This repository (`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`) is a **fumadocs**
documentation site (fumadocs-ui + fumadocs-mdx) built on **TanStack Start as a static single-page
app** (React + MDX + TypeScript, bundled with **Vite**), built and served with **pnpm** on **Node
22**. `pnpm dev` runs `vite dev`; `pnpm build` runs `vite build` and emits a static SPA under
`.output/public`; `pnpm lint:links` checks internal links. Content lives under `content/docs/`.
Each directory has a `meta.json` whose `pages` array lists child page slugs (and nested directory
names) in sidebar order. A "page" is an `.mdx` file: YAML frontmatter (`title`, `description`)
followed by an MDX body.

A **code walkthrough** (or "tour") is an ordered set of MDX chapters that reads a real source
module top to bottom in prose, quoting verbatim excerpts and explaining *why* the code is shaped
the way it is. This tour lives in `content/docs/keiro/walkthrough/integration/`. The MDX
components you use (`Callout`, `Cards`, `Card`, `Steps`, `Step`, `Tabs`, `Tab`, `TypeTable`,
`Accordion`, `Accordions`, `Mermaid`) are **registered globally** in `src/components/mdx.tsx` — so
in page bodies you use them **bare, with no `import` lines**, exactly as every existing
keiro/kiroku page does.

The **code samples are Haskell** (the site itself is TypeScript; the subject, keiro, is a Haskell
library) plus **SQL** (the inbox/outbox tables and the claim CTE). The docs build does **not**
compile Haskell or run SQL — accuracy is therefore guaranteed only by cross-checking each snippet
against the pinned source named below. Treat snippet accuracy as an acceptance criterion (see
Validation).

### This tour's place in the larger effort

This is **EP-16** in the MasterPlan `docs/masterplans/2-keiro-framework-documentation-set.md`,
**Phase 4 (walkthrough deepening)**.

- **HARD DEP — EP-11** (`docs/plans/11-keiro-integration-events-documentation-inbox-outbox-and-kafka.md`):
  EP-11 is **Complete**. It created the `walkthrough/integration/` subdir with the four current
  chapters and its `meta.json`, added `integration` to `walkthrough/meta.json`, and authored the
  integration-events explanations, references, tutorial, and how-tos this tour links to
  (`reference/integration-event` [owned by EP-11], `reference/inbox`, `reference/outbox`,
  `explanation/integration-events`, `explanation/the-inbox-pattern`,
  `explanation/the-outbox-pattern`, the five `how-to/*` guides, and
  `tutorials/consume-an-integration-event`). Verify these exist in M0.
- **HARD DEP — EP-7**: provides the overview/getting-started spine, the jitsurei module map, and
  the authoring conventions (absolute cross-links; source-over-notes accuracy).
- **SOFT — EP-13** (command-cycle tour): the producer subscription mints integration events from
  recorded private domain events, and the inline escape hatch (`enqueueIntegrationEventTx`) runs
  inside a command transaction. Where this tour needs "how a command records the private event
  these integration events are minted from," it links to
  `/docs/keiro/walkthrough/command-cycle/` and `/docs/keiro/reference/command`. Soft means
  non-blocking: those targets already exist (EP-8/EP-13).
- **INTEGRATION — EP-19**: owns the shared `walkthrough/index.mdx` hub and the *top-level*
  `walkthrough/meta.json` ordering. **This plan must not touch either** beyond what already lists
  `integration` (it is already present from EP-11; do not duplicate or reorder it).

### Hard-won house rules (apply to every page you write)

1. **Absolute doc links only.** Cross-page links use absolute doc paths
   (`/docs/keiro/reference/inbox`), never relative `./sibling` or `../section/page`. Relative MDX
   links resolve *wrong* in the static SPA and trip the prerender crawler (a recorded kiroku
   lesson: a `./01-…` link from a `00-start-here` page resolved to a nonexistent nested route and
   emitted `[unhandledRejection] Failed to fetch`). This applies to *intra-tour* chapter links
   too: write `/docs/keiro/walkthrough/integration/02-the-inbox`, never `./02-the-inbox`.
2. **Every fenced code block carries a language tag.** Use ` ```haskell `, ` ```sql `, ` ```text `,
   ` ```mermaid `, ` ```json `, ` ```bash `. Never a bare ```` ``` ````.
3. **Snippet accuracy is an acceptance criterion.** Every Haskell type, field, and function name
   and every SQL clause you quote must appear in the pinned source. The verified transcriptions are
   below; cross-check against the named files before declaring a snippet done. Quote *focused*
   excerpts (the clause that makes the point), not whole 80-line definitions — but keep them
   verbatim.
4. **No `import` lines for the MDX components.**
5. **Keep `meta.json` in sync with the files you ship.** A slug in `pages` with no file (or a file
   not in `pages`) produces a broken or missing sidebar entry, not a crash, so the build still
   exits 0 — catch it with the browser check.
6. **Document as shipped; trust the source over the notes and over inaccurate Haddock.** keiro's
   in-repo `docs/research/*` / `docs/plans/*` notes predate the implementation, and one in-source
   Haddock (on `OutboxPublishing`) is wrong. Where they disagree with the code at `3f5dc9c`, follow
   the code.

### The source you must walk, transcribed (use these REAL names)

Source of truth on disk (read-only — do **not** edit it):
`/Users/shinzui/Keikaku/bokuno/keiro`, pinned commit `3f5dc9c` (confirm the path with `mori
registry show shinzui/keiro --full`). The files this tour reads, by full repo-relative path:

```text
keiro-core/src/Keiro/Integration/Event.hs   -- 295 lines: the IntegrationEvent envelope + wire mapping
keiro/src/Keiro/Inbox.hs                     -- runInboxTransaction(/WithKey); re-exports Inbox.Types
keiro/src/Keiro/Inbox/Types.hs               -- inbox policy/status/result/error types + dedupeKeyFor
keiro/src/Keiro/Inbox/Schema.hs              -- 481 lines: tryInsert/markCompleted/markFailed/GC + the keiro_inbox SQL
keiro/src/Keiro/Inbox/Kafka.hs               -- KafkaInboundRecord, integrationEventFromKafka
keiro/src/Keiro/Outbox.hs                    -- 286 lines: producer helper + enqueue escape hatch + publishClaimedOutbox
keiro/src/Keiro/Outbox/Types.hs              -- outbox status/policy/options/summary types + nextDelay
keiro/src/Keiro/Outbox/Schema.hs             -- 535 lines: enqueue/claim CTE/mark-sent/mark-failed + the keiro_outbox SQL
keiro/src/Keiro/Outbox/Kafka.hs              -- KafkaProducerRecord, outboxRowToKafkaRecord
keiro-migrations/sql-migrations/2026-05-17-01-00-00-keiro-outbox.sql
keiro-migrations/sql-migrations/2026-05-17-02-00-00-keiro-inbox.sql
docs/guides/integration-events-with-kafka.md  -- the running worked producer (no jitsurei target)
```

What follows is the complete public-and-internal surface, transcribed verbatim from the pinned
tree. Treat it as your API cheat-sheet; the chapter outlines in Plan of Work say which bindings go
where.

**(A) `Keiro.Integration.Event` (`keiro-core/src/Keiro/Integration/Event.hs`).** Exports the
envelope `IntegrationEvent(..)`, `IntegrationContentType(..)`, `SchemaReference(..)`,
`TraceContext(..)`, `IntegrationEventError(..)`; the JSON helpers `encodeJsonIntegrationEvent`,
`decodeJsonIntegrationEvent`; the wire mapping `integrationPayload`, `integrationHeaders`,
`contentTypeText`, `parseContentType`; and the header-name constants (`headerMessageId` …
`headerTraceState`).

```haskell
data IntegrationEvent = IntegrationEvent
  { messageId :: !Text                       -- producer-minted TypeID/UUIDv7; canonical dedupe key
  , source :: !Text                          -- producing bounded context, e.g. "ordering"
  , destination :: !Text                     -- Kafka topic, e.g. "billing.orders.v1"
  , key :: !(Maybe Text)                      -- per-aggregate partition key
  , eventType :: !Text                        -- public event type, e.g. "OrderSubmitted"
  , schemaVersion :: !Int                     -- contract version
  , contentType :: !IntegrationContentType
  , schemaReference :: !(Maybe SchemaReference)
  , sourceEventId :: !(Maybe EventId)         -- private event that produced this
  , sourceGlobalPosition :: !(Maybe GlobalPosition)  -- $all position of that private event
  , payloadBytes :: !ByteString               -- the wire body (JSON in v1)
  , occurredAt :: !UTCTime
  , causationId :: !(Maybe EventId)
  , correlationId :: !(Maybe EventId)
  , traceContext :: !(Maybe TraceContext)
  , attributes :: !(Maybe Value)
  }
  deriving stock (Eq, Show, Generic)

data IntegrationContentType = ApplicationJson | OtherContentType !Text
  deriving stock (Eq, Show, Generic)

data SchemaReference = SchemaReference
  { registry :: !(Maybe Text), subject :: !(Maybe Text), version :: !(Maybe Int)
  , schemaId :: !(Maybe Int64), fingerprint :: !(Maybe Text) }
  deriving stock (Eq, Show, Generic)

data TraceContext = TraceContext { traceparent :: !Text, tracestate :: !(Maybe Text) }
  deriving stock (Eq, Show, Generic)

data IntegrationEventError
  = MalformedPayload !Text | DecodeFailed !Text | MissingField !Text | UnsupportedContentType !Text
  deriving stock (Eq, Show, Generic)
```

The wire mapping and helpers:

```haskell
integrationPayload :: IntegrationEvent -> ByteString
integrationPayload = (^. #payloadBytes)

-- The first six headers are ALWAYS present; every optional header is emitted only when its
-- source field is populated (via maybeHeader).
integrationHeaders :: IntegrationEvent -> [(Text, Text)]
integrationHeaders event =
  concat
    [ [ (headerMessageId, event ^. #messageId)
      , (headerSource, event ^. #source)
      , (headerDestination, event ^. #destination)
      , (headerEventType, event ^. #eventType)
      , (headerSchemaVersion, Text.pack (show (event ^. #schemaVersion)))
      , (headerContentType, contentTypeText (event ^. #contentType))
      ]
    , case event ^. #schemaReference of
        Nothing -> []
        Just ref -> concat [ maybeHeader headerSchemaRegistry (ref ^. #registry), … ]
    , maybeHeader headerSourceEventId (fmap (UUID.toText . eventIdToUuid) (event ^. #sourceEventId))
    , maybeHeader headerSourceGlobalPosition (fmap globalPositionText (event ^. #sourceGlobalPosition))
    , maybeHeader headerCausationId (fmap (UUID.toText . eventIdToUuid) (event ^. #causationId))
    , maybeHeader headerCorrelationId (fmap (UUID.toText . eventIdToUuid) (event ^. #correlationId))
    , case event ^. #traceContext of
        Nothing -> []
        Just tc -> (headerTraceParent, tc ^. #traceparent) : maybeHeader headerTraceState (tc ^. #tracestate)
    ]
  where maybeHeader name = maybe [] (\value -> [(name, value)])

contentTypeText :: IntegrationContentType -> Text
contentTypeText = \case { ApplicationJson -> "application/json"; OtherContentType raw -> raw }

-- Round-trips application/json to ApplicationJson (case/space-insensitive); else verbatim Other.
parseContentType :: Text -> IntegrationContentType
parseContentType raw
  | Text.toLower (Text.strip raw) == "application/json" = ApplicationJson
  | otherwise = OtherContentType raw

-- Replaces contentType with ApplicationJson and payloadBytes with value's JSON; keeps all else.
encodeJsonIntegrationEvent :: ToJSON a => IntegrationEvent -> a -> IntegrationEvent
encodeJsonIntegrationEvent envelope value =
  envelope & #contentType .~ ApplicationJson & #payloadBytes .~ Lazy.toStrict (Aeson.encode value)

-- UnsupportedContentType if not JSON; MalformedPayload if not valid JSON; DecodeFailed if FromJSON fails.
decodeJsonIntegrationEvent :: FromJSON a => IntegrationEvent -> Either IntegrationEventError a
```

The canonical header-name constants (each a `Text`), all transcribed verbatim:

```haskell
headerMessageId            = "keiro-message-id"
headerSource               = "keiro-source"
headerDestination          = "keiro-destination"
headerEventType            = "keiro-event-type"
headerSchemaVersion        = "keiro-schema-version"
headerContentType          = "content-type"
headerSchemaRegistry       = "keiro-schema-registry"
headerSchemaSubject        = "keiro-schema-subject"
headerSchemaVersionRef     = "keiro-schema-version-ref"
headerSchemaId             = "keiro-schema-id"
headerSchemaFingerprint    = "keiro-schema-fingerprint"
headerSourceEventId        = "keiro-source-event-id"
headerSourceGlobalPosition = "keiro-source-global-position"
headerCausationId          = "keiro-causation-id"
headerCorrelationId        = "keiro-correlation-id"
headerTraceParent          = "traceparent"
headerTraceState           = "tracestate"
```

**Identity rule (state prominently in chapter 01):** `messageId` (the producer-minted, time-ordered
TypeID) is the canonical dedupe key. It is stable across publish retries because it lives in the
outbox row. The Kafka topic/partition/offset are *delivery metadata only* and are NOT the dedupe
key. The *reference* page `/docs/keiro/reference/integration-event` (EP-11) carries the exhaustive
field tables — link it; do not duplicate it.

**(B) `Keiro.Inbox` (`keiro/src/Keiro/Inbox.hs`).** Re-exports `Keiro.Inbox.Types`; exports
`lookupInbox`, `listInbox`, `garbageCollectCompleted`, `runInboxTransaction`,
`runInboxTransactionWithKey`.

```haskell
runInboxTransaction ::
  forall a es. (IOE :> es, Store :> es) =>
  InboxDedupePolicy -> IntegrationEvent -> Maybe KafkaDeliveryRef ->
  (IntegrationEvent -> Tx.Transaction a) ->
  Eff es (Either InboxError (InboxResult a))
runInboxTransaction policy event kafka handler =
  case dedupeKeyFor policy event kafka of
    Left err -> pure (Left err)
    Right dedupe -> Right <$> runInboxTransactionWithKey (event ^. #source) dedupe event kafka handler

runInboxTransactionWithKey ::
  forall a es. (IOE :> es, Store :> es) =>
  Text -> Text -> IntegrationEvent -> Maybe KafkaDeliveryRef ->
  (IntegrationEvent -> Tx.Transaction a) ->
  Eff es (InboxResult a)
runInboxTransactionWithKey src dedupe event kafka handler = do
  now <- liftIO getCurrentTime
  runTransaction $ do
    inserted <- tryInsertProcessingTx src dedupe event kafka now
    case inserted of
      Right () -> do
        result <- handler event
        markCompletedTx src dedupe now
        pure (InboxProcessed result)
      Left row -> case row ^. #status of
        InboxCompleted -> pure InboxDuplicate
        InboxProcessing -> pure InboxInProgress
        InboxFailed -> pure (InboxPreviouslyFailed (row ^. #lastError))
```

**(C) `Keiro.Inbox.Types` (`keiro/src/Keiro/Inbox/Types.hs`).** Exports `InboxDedupePolicy(..)`,
`InboxStatus(..)`, `InboxResult(..)`, `InboxError(..)`, `InboxRow(..)`, `KafkaDeliveryRef(..)`,
`inboxStatusText`, `parseInboxStatus`, `dedupeKeyFor`.

```haskell
data InboxDedupePolicy
  = PreferIntegrationMessageId   -- default: dedupe on messageId
  | PreferSourceEventIdentity    -- dedupe on the producing private event's id, then global position
  | KafkaDeliveryIdentity        -- last-resort: dedupe on topic:partition:offset
  | CustomDedupeKey !Text        -- caller supplies the key
  deriving stock (Generic, Eq, Show)

data InboxStatus = InboxProcessing | InboxCompleted | InboxFailed
  deriving stock (Generic, Eq, Show)

data InboxResult a = InboxProcessed !a | InboxDuplicate | InboxInProgress | InboxPreviouslyFailed !(Maybe Text)
  deriving stock (Generic, Eq, Show)

data InboxError = DedupePolicyUnsatisfied !InboxDedupePolicy
  deriving stock (Generic, Eq, Show)

data KafkaDeliveryRef = KafkaDeliveryRef { topic :: !Text, partition :: !Int64, offset :: !Int64 }
  deriving stock (Generic, Eq, Show)

data InboxRow = InboxRow
  { source :: !Text, dedupeKey :: !Text, event :: !IntegrationEvent, kafka :: !(Maybe KafkaDeliveryRef)
  , status :: !InboxStatus, receivedAt :: !UTCTime, completedAt :: !(Maybe UTCTime)
  , failedAt :: !(Maybe UTCTime), lastError :: !(Maybe Text) }
  deriving stock (Generic, Eq, Show)

inboxStatusText  :: InboxStatus -> Text         -- processing/completed/failed
parseInboxStatus :: Text -> InboxStatus         -- unknown maps to InboxFailed (safe default)

dedupeKeyFor :: InboxDedupePolicy -> IntegrationEvent -> Maybe KafkaDeliveryRef -> Either InboxError Text
dedupeKeyFor policy event kafka = case policy of
  PreferIntegrationMessageId ->
    let mid = event ^. #messageId
     in if Text.null mid then Left (DedupePolicyUnsatisfied policy) else Right mid
  PreferSourceEventIdentity ->
    case event ^. #sourceEventId of
      Just (EventId u) -> Right (UUID.toText u)
      Nothing -> case event ^. #sourceGlobalPosition of
        Just (GlobalPosition p) -> Right (Text.pack (show p))
        Nothing -> Left (DedupePolicyUnsatisfied policy)
  KafkaDeliveryIdentity ->
    case kafka of
      Just ref -> Right ((ref ^. #topic) <> ":" <> Text.pack (show (ref ^. #partition)) <> ":" <> Text.pack (show (ref ^. #offset)))
      Nothing -> Left (DedupePolicyUnsatisfied policy)
  CustomDedupeKey k -> if Text.null k then Left (DedupePolicyUnsatisfied policy) else Right k
```

**(D) `Keiro.Inbox.Schema` (`keiro/src/Keiro/Inbox/Schema.hs`, 481 lines).** Exports
`tryInsertProcessingTx`, `markCompletedTx`, `markFailedTx`, `lookupInbox`, `listInbox`,
`garbageCollectCompleted`.

```haskell
-- Returns Right () for a NEW row; Left existingRow for a duplicate. The re-select handles the
-- ON CONFLICT no-row case; the Nothing fall-through handles an inserted-then-GC'd race as "new".
tryInsertProcessingTx :: Text -> Text -> IntegrationEvent -> Maybe KafkaDeliveryRef -> UTCTime -> Tx.Transaction (Either InboxRow ())
tryInsertProcessingTx src dedupe event kafka now = do
  inserted <- Tx.statement (toEncodedInsert src dedupe event kafka now) tryInsertStmt
  if inserted
    then pure (Right ())
    else do
      existing <- Tx.statement (src, dedupe) selectByKeyStmt
      case existing of
        Just row -> pure (Left row)
        Nothing  -> pure (Right ())   -- race: inserted then deleted between attempt and lookup

markCompletedTx :: Text -> Text -> UTCTime -> Tx.Transaction ()           -- status='completed', completed_at, last_error=NULL
markFailedTx    :: Text -> Text -> Text -> UTCTime -> Tx.Transaction ()    -- status='failed', failed_at, last_error  (RESERVED — v1 never calls it)
lookupInbox     :: (Store :> es) => Text -> Text -> Eff es (Maybe InboxRow)
listInbox       :: (Store :> es) => Text -> Eff es [InboxRow]             -- ordered by received_at, dedupe_key

-- Deletes completed rows older than keepFor; returns the count. The retention window IS the
-- duplicate-detection window; failed rows are never GC'd.
garbageCollectCompleted :: (Store :> es) => NominalDiffTime -> UTCTime -> Eff es Int
```

The two inbox SQL statements that matter most (verbatim from `tryInsertStmt` and `markCompletedStmt`;
the 25-column INSERT column list is abridged in prose but the conflict/return clauses are exact):

```sql
-- tryInsertStmt (the atomic dedupe)
INSERT INTO keiro_inbox
  ( source, dedupe_key, message_id, source_event_id, source_global_position, destination,
    event_type, schema_version, content_type, schema_registry, schema_subject, schema_version_ref,
    schema_id, schema_fingerprint, causation_id, correlation_id, traceparent, tracestate,
    kafka_topic, kafka_partition, kafka_offset, payload_bytes, attributes, occurred_at, received_at )
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
ON CONFLICT (source, dedupe_key) DO NOTHING
RETURNING TRUE

-- markCompletedStmt
UPDATE keiro_inbox SET status = 'completed', completed_at = $3, last_error = NULL
WHERE source = $1 AND dedupe_key = $2
```

The `keiro_inbox` table (`2026-05-17-02-00-00-keiro-inbox.sql`), verbatim key facts:

```sql
CREATE TABLE IF NOT EXISTS keiro_inbox (
  source TEXT NOT NULL,
  dedupe_key TEXT NOT NULL,
  message_id TEXT,
  source_event_id UUID,
  source_global_position BIGINT,
  destination TEXT,
  event_type TEXT,
  schema_version BIGINT,
  content_type TEXT NOT NULL,
  schema_registry TEXT, schema_subject TEXT, schema_version_ref BIGINT, schema_id BIGINT, schema_fingerprint TEXT,
  causation_id UUID, correlation_id UUID, traceparent TEXT, tracestate TEXT,
  kafka_topic TEXT, kafka_partition BIGINT, kafka_offset BIGINT,
  payload_bytes BYTEA NOT NULL,
  attributes JSONB,
  occurred_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'processing',
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ, failed_at TIMESTAMPTZ, last_error TEXT,
  PRIMARY KEY (source, dedupe_key)
);
CREATE INDEX IF NOT EXISTS keiro_inbox_received_idx ON keiro_inbox (received_at);
CREATE INDEX IF NOT EXISTS keiro_inbox_completed_idx ON keiro_inbox (completed_at) WHERE status = 'completed';
```

**(E) `Keiro.Inbox.Kafka` (`keiro/src/Keiro/Inbox/Kafka.hs`).** Pure; exports
`KafkaInboundRecord(..)`, `KafkaDecodeError(..)`, `integrationEventFromKafka`.

```haskell
data KafkaInboundRecord = KafkaInboundRecord
  { topic :: !Text, partition :: !Int64, offset :: !Int64
  , key :: !(Maybe Text), payload :: !ByteString, headers :: ![(Text, Text)], receivedAt :: !UTCTime }
  deriving stock (Generic, Eq, Show)

data KafkaDecodeError = MissingHeader !Text | InvalidIntHeader !Text !Text | InvalidUuidHeader !Text !Text
  deriving stock (Generic, Eq, Show)

integrationEventFromKafka :: KafkaInboundRecord -> Either KafkaDecodeError (IntegrationEvent, KafkaDeliveryRef)
integrationEventFromKafka record = do
  let hs = record ^. #headers
  source <- requireHeader hs headerSource
  destination <- requireHeader hs headerDestination
  eventType <- requireHeader hs headerEventType
  schemaVersionText <- requireHeader hs headerSchemaVersion
  schemaVersion <- parseInt headerSchemaVersion schemaVersionText
  contentTypeRaw <- requireHeader hs headerContentType
  messageId <- requireHeader hs headerMessageId
  schemaReference <- buildSchemaReference hs
  sourceEventId <- traverseLookup hs headerSourceEventId (fmap EventId . parseUuid headerSourceEventId)
  …
  let event = IntegrationEvent { …, key = record ^. #key, payloadBytes = record ^. #payload
                               , occurredAt = record ^. #receivedAt, attributes = Nothing, … }
      kafka = KafkaDeliveryRef { topic = record ^. #topic, partition = record ^. #partition, offset = record ^. #offset }
  pure (event, kafka)
```

The four decode helpers: `requireHeader hs name` → `MissingHeader name` if absent; `parseInt name
raw` (signed decimal, must consume the whole string) → `InvalidIntHeader name raw`; `parseUuid name
raw` → `InvalidUuidHeader name raw`; `traverseLookup hs name parser` returns `Right Nothing` when
absent (no error). `buildSchemaReference` reconstructs the `SchemaReference` from the five
`keiro-schema-*` headers, returning `Nothing` when all are absent. The six **required** headers are
`keiro-source`, `keiro-destination`, `keiro-event-type`, `keiro-schema-version`, `content-type`,
`keiro-message-id`. The producer does **not** emit `occurredAt` as a header, so the decoder sets
`occurredAt = record ^. #receivedAt` and `attributes = Nothing`.

**(F) `Keiro.Outbox` (`keiro/src/Keiro/Outbox.hs`, 286 lines).** Re-exports `Keiro.Outbox.Types`;
exports the storage primitives `enqueueOutboxTx`, `claimOutboxBatch`, `markOutboxSent`,
`lookupOutbox`, `listOutbox`; the inline escape hatch `freshOutboxId`, `enqueueIntegrationEventTx`;
the producer helper `IntegrationProducer(..)`, `IntegrationEventDraft(..)`, `mintIntegrationEvent`,
`draftToEvent`, `enqueueProducerEventTx`; and the worker `PublishOutcome(..)`,
`publishClaimedOutbox`.

```haskell
freshOutboxId :: (IOE :> es) => Eff es OutboxId
freshOutboxId = fmap OutboxId (liftIO V7.genUUID)

-- Inline escape hatch: enqueue inside a command/saga transaction with a STABLE OutboxId so
-- retried attempts coalesce on the (source, message_id) unique constraint.
enqueueIntegrationEventTx :: OutboxId -> IntegrationEvent -> Tx.Transaction ()
enqueueIntegrationEventTx outboxId event = enqueueOutboxTx (OutboxMessage {outboxId, event})

data IntegrationProducer e = IntegrationProducer
  { name :: !Text                 -- subscription name (checkpoint cursor)
  , source :: !Text               -- written into keiro_outbox.source
  , messageIdPrefix :: !Text      -- TypeID prefix (1-63 lowercase letters)
  , mapEvent :: !(RecordedEvent -> e -> Maybe IntegrationEventDraft) }  -- Nothing skips the event
  deriving stock (Generic)

-- IntegrationEvent minus messageId and source (those are filled in by mintIntegrationEvent).
data IntegrationEventDraft = IntegrationEventDraft
  { destination :: !Text, key :: !(Maybe Text), eventType :: !Text, schemaVersion :: !Int
  , contentType :: !IntegrationContentType, schemaReference :: !(Maybe SchemaReference)
  , sourceEventId :: !(Maybe EventId), sourceGlobalPosition :: !(Maybe GlobalPosition)
  , payloadBytes :: !ByteString, occurredAt :: !UTCTime, causationId :: !(Maybe EventId)
  , correlationId :: !(Maybe EventId), traceContext :: !(Maybe TraceContext), attributes :: !(Maybe Value) }
  deriving stock (Generic, Eq, Show)

-- Mints a fresh messageId (TypeID with the producer's prefix) and builds the full envelope.
mintIntegrationEvent :: (IOE :> es) => IntegrationProducer e -> IntegrationEventDraft -> Eff es IntegrationEvent
mintIntegrationEvent producer draft = do
  typeId <- liftIO (TypeID.genTypeID (producer ^. #messageIdPrefix))
  pure (draftToEvent (producer ^. #source) (TypeID.toText typeId) draft)

draftToEvent :: Text -> Text -> IntegrationEventDraft -> IntegrationEvent   -- pure assembly

-- The primitive a subscription worker calls per event: mint, build, return the inserting Tx.
enqueueProducerEventTx :: (IOE :> es) => IntegrationProducer e -> OutboxId -> IntegrationEventDraft -> Eff es (Tx.Transaction ())
enqueueProducerEventTx producer outboxId draft = do
  event <- mintIntegrationEvent producer draft
  pure (enqueueOutboxTx (OutboxMessage {outboxId, event}))

data PublishOutcome = PublishSucceeded | PublishFailed !Text
  deriving stock (Generic, Eq, Show)
```

The worker — **one claim pass per call** (does NOT loop; the app schedules it). The `drainBatch`
loop is the dead-letter/backoff heart of the outbox:

```haskell
publishClaimedOutbox :: (IOE :> es, Store :> es) => (OutboxRow -> Eff es PublishOutcome) -> OutboxPublishOptions -> Eff es OutboxPublishSummary
publishClaimedOutbox publish options = do
  now <- liftIO getCurrentTime
  rows <- claimOutboxBatch (options ^. #orderingPolicy) (options ^. #batchSize) now
  drainBatch rows OutboxPublishSummary {claimed = 0, published = 0, retried = 0, dead = 0, haltedOn = Nothing}
  where
    drainBatch [] acc = pure acc
    drainBatch (row : rest) acc = do
      outcome <- withProducerSpan (options ^. #tracer) (row ^. #event) (outboxRowToKafkaRecord row) $ \mSpan -> do
        out <- publish row
        … -- on PublishFailed with a span: addAttribute error_type "publish_failed"; setStatus (Error errMsg)
        pure out
      now <- liftIO getCurrentTime
      case outcome of
        PublishSucceeded -> do
          markOutboxSent (row ^. #outboxId) now
          drainBatch rest (acc & #claimed +~ 1 & #published +~ 1)
        PublishFailed errMsg -> do
          let attempt = row ^. #attemptCount
              delay = nextDelay (options ^. #backoff) attempt
          resultStatus <- runTransaction $
            markOutboxFailedTx (row ^. #outboxId) errMsg (options ^. #maxAttempts) delay now
          let bumped = acc & #claimed +~ 1
              acc' = case resultStatus of { OutboxDead -> bumped & #dead +~ 1; _ -> bumped & #retried +~ 1 }
          case options ^. #orderingPolicy of
            StopTheLine -> pure (acc' & #haltedOn ?~ row ^. #outboxId)
            _           -> drainBatch rest acc'
```

**(G) `Keiro.Outbox.Types` (`keiro/src/Keiro/Outbox/Types.hs`).** Exports `OutboxId(..)`,
`OutboxStatus(..)`, `OrderingPolicy(..)`, `BackoffSchedule(..)`, `ExponentialBackoffOptions(..)`,
`OutboxMessage(..)`, `OutboxRow(..)`, `OutboxPublishOptions(..)`, `OutboxPublishSummary(..)`,
`defaultPublishOptions`, `statusText`, `parseStatus`, `nextDelay`.

```haskell
newtype OutboxId = OutboxId { unOutboxId :: UUID }
  deriving stock (Generic, Eq, Ord, Show)   -- + ToJSON/FromJSON via UUID text

data OutboxStatus = OutboxPending | OutboxPublishing | OutboxSent | OutboxFailed | OutboxDead
  deriving stock (Generic, Eq, Show)

data OrderingPolicy = PerKeyHeadOfLine | PerSourceStream | StopTheLine | BestEffort
  deriving stock (Generic, Eq, Show)

data ExponentialBackoffOptions = ExponentialBackoffOptions
  { initial :: !NominalDiffTime, maxDelay :: !NominalDiffTime, multiplier :: !Double }
  deriving stock (Generic, Eq, Show)

data BackoffSchedule = ConstantBackoff !NominalDiffTime | ExponentialBackoff !ExponentialBackoffOptions
  deriving stock (Generic, Eq, Show)

-- 1-based attempt: 1 = first failure. delay = min maxDelay (initial * multiplier ^ (attempt - 1)).
nextDelay :: BackoffSchedule -> Int -> NominalDiffTime
nextDelay (ConstantBackoff delay) _ = delay
nextDelay (ExponentialBackoff opts) attempt =
  min (opts ^. #maxDelay) ((opts ^. #initial) * realToFrac ((opts ^. #multiplier) ** fromIntegral (max 0 (attempt - 1))))

data OutboxMessage = OutboxMessage { outboxId :: !OutboxId, event :: !IntegrationEvent }
  deriving stock (Generic, Eq, Show)

data OutboxRow = OutboxRow
  { outboxId :: !OutboxId, event :: !IntegrationEvent, status :: !OutboxStatus
  , attemptCount :: !Int, nextAttemptAt :: !UTCTime, lastError :: !(Maybe Text)
  , publishedAt :: !(Maybe UTCTime), createdAt :: !UTCTime, updatedAt :: !UTCTime }
  deriving stock (Generic, Eq, Show)

data OutboxPublishOptions = OutboxPublishOptions
  { batchSize :: !Int, maxAttempts :: !Int, backoff :: !BackoffSchedule
  , orderingPolicy :: !OrderingPolicy, tracer :: !(Maybe Tracer) }
  deriving stock (Generic)

-- published + retried + dead + halted == claimed. haltedOn populated only by StopTheLine.
data OutboxPublishSummary = OutboxPublishSummary
  { claimed :: !Int, published :: !Int, retried :: !Int, dead :: !Int, haltedOn :: !(Maybe OutboxId) }
  deriving stock (Generic, Eq, Show)

-- batch 32, ten attempts, two-second constant backoff, per-key head-of-line, no tracer.
defaultPublishOptions :: OutboxPublishOptions
defaultPublishOptions = OutboxPublishOptions
  { batchSize = 32, maxAttempts = 10, backoff = ConstantBackoff 2, orderingPolicy = PerKeyHeadOfLine, tracer = Nothing }

statusText  :: OutboxStatus -> Text    -- pending/publishing/sent/failed/dead
parseStatus :: Text -> OutboxStatus    -- unknown maps to OutboxFailed
```

> **The `OutboxPublishing` Haddock is wrong.** Its comment says crashed-`publishing` rows are
> "reclaimable through the same claim query." They are not (see `claimSql` below). Chapters 03/04
> document the shipped behavior, not the comment.

**(H) `Keiro.Outbox.Schema` (`keiro/src/Keiro/Outbox/Schema.hs`, 535 lines).** Exports
`enqueueOutboxTx`, `claimOutboxBatch`, `markOutboxSent`, `markOutboxFailedTx`, `lookupOutbox`,
`listOutbox`. The enqueue is idempotent on `(source, message_id)`:

```sql
-- enqueueOutboxStmt (22-column INSERT; column list abridged, conflict clause exact)
INSERT INTO keiro_outbox
  ( outbox_id, message_id, source, destination, message_key, event_type, schema_version, content_type,
    schema_registry, schema_subject, schema_version_ref, schema_id, schema_fingerprint, source_event_id,
    source_global_position, causation_id, correlation_id, traceparent, tracestate, payload_bytes,
    attributes, occurred_at )
VALUES ($1, …, $22)
ON CONFLICT (source, message_id) DO NOTHING
```

The claim CTE (`claimSql`), assembled from the per-policy `policyPredicate` spliced into the
`AND ( … )` slot. This is the SQL verbatim, with the predicate splice shown:

```sql
WITH ready AS (
  SELECT r.outbox_id FROM keiro_outbox r
  WHERE r.status IN ('pending', 'failed')
    AND r.next_attempt_at <= $2
    AND ( <ordering predicate> )
  ORDER BY r.created_at
  LIMIT $1
  FOR UPDATE SKIP LOCKED
)
UPDATE keiro_outbox kt
SET status = 'publishing', attempt_count = kt.attempt_count + 1, updated_at = $2
WHERE kt.outbox_id IN (SELECT outbox_id FROM ready)
RETURNING <row columns>
```

The four ordering predicates, transcribed verbatim from `policyPredicate`, `perKeyPredicate`, and
`perSourcePredicate`:

```haskell
policyPredicate = \case
  PerKeyHeadOfLine -> perKeyPredicate
  PerSourceStream  -> perSourcePredicate
  StopTheLine      -> perKeyPredicate     -- same claim predicate; halts at the worker level
  BestEffort       -> "TRUE"
```

```sql
-- perKeyPredicate: skip a row if an EARLIER same-key row is still non-terminal.
( r.message_key IS NULL OR NOT EXISTS (
    SELECT 1 FROM keiro_outbox earlier
    WHERE earlier.source = r.source
      AND earlier.message_key = r.message_key
      AND earlier.created_at < r.created_at
      AND earlier.status NOT IN ('sent', 'dead') ) )

-- perSourcePredicate: skip a row if ANY earlier row in the same source is still non-terminal.
NOT EXISTS ( SELECT 1 FROM keiro_outbox earlier
  WHERE earlier.source = r.source
    AND earlier.created_at < r.created_at
    AND earlier.status NOT IN ('sent', 'dead') )
```

The two mark statements and the dead-letter decision:

```haskell
markOutboxSent :: (Store :> es) => OutboxId -> UTCTime -> Eff es ()   -- status='sent', published_at, last_error=NULL, updated_at

-- Reads attempt_count; >= maxAttempts → OutboxDead, else OutboxFailed with next_attempt_at = now + delay.
-- Runs inside the caller's transaction to keep "read count → write status" atomic across workers.
markOutboxFailedTx :: OutboxId -> Text -> Int -> NominalDiffTime -> UTCTime -> Tx.Transaction OutboxStatus
markOutboxFailedTx outboxId errMsg maxAttempts delay now = do
  currentAttempt <- Tx.statement (unOutboxId outboxId) readAttemptCountStmt
  let attempt = fromMaybe 0 currentAttempt
      shouldDie = attempt >= maxAttempts
      nextStatus = if shouldDie then OutboxDead else OutboxFailed
      nextAttempt = addUTCTime delay now
  Tx.statement (unOutboxId outboxId, statusText nextStatus, errMsg, nextAttempt, now) markFailedStmt
  pure nextStatus
```

```sql
-- markSentStmt
UPDATE keiro_outbox SET status = 'sent', published_at = $2, last_error = NULL, updated_at = $2 WHERE outbox_id = $1
-- markFailedStmt
UPDATE keiro_outbox SET status = $2, last_error = $3, next_attempt_at = $4, updated_at = $5 WHERE outbox_id = $1
```

The `keiro_outbox` table (`2026-05-17-01-00-00-keiro-outbox.sql`), verbatim key facts:

```sql
CREATE TABLE IF NOT EXISTS keiro_outbox (
  outbox_id UUID PRIMARY KEY,
  message_id TEXT NOT NULL,
  source TEXT NOT NULL,
  destination TEXT NOT NULL,
  message_key TEXT,
  event_type TEXT NOT NULL,
  schema_version BIGINT NOT NULL,
  content_type TEXT NOT NULL,
  schema_registry TEXT, schema_subject TEXT, schema_version_ref BIGINT, schema_id BIGINT, schema_fingerprint TEXT,
  source_event_id UUID, source_global_position BIGINT, causation_id UUID, correlation_id UUID,
  traceparent TEXT, tracestate TEXT,
  payload_bytes BYTEA NOT NULL,
  attributes JSONB,
  occurred_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempt_count BIGINT NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_error TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source, message_id)
);
CREATE INDEX IF NOT EXISTS keiro_outbox_pending_idx ON keiro_outbox (status, next_attempt_at, created_at);
CREATE INDEX IF NOT EXISTS keiro_outbox_head_of_line_idx ON keiro_outbox (source, message_key, created_at)
  WHERE status NOT IN ('sent', 'dead') AND message_key IS NOT NULL;
```

**(I) `Keiro.Outbox.Kafka` (`keiro/src/Keiro/Outbox/Kafka.hs`).** Pure; exports
`KafkaProducerRecord(..)`, `outboxRowToKafkaRecord`, `integrationEventToKafkaRecord`.

```haskell
data KafkaProducerRecord = KafkaProducerRecord
  { topic :: !Text, key :: !(Maybe ByteString), payload :: !ByteString, headers :: ![(ByteString, ByteString)] }
  deriving stock (Generic, Eq, Show)

outboxRowToKafkaRecord :: OutboxRow -> KafkaProducerRecord
outboxRowToKafkaRecord row = integrationEventToKafkaRecord (row ^. #event)

integrationEventToKafkaRecord :: IntegrationEvent -> KafkaProducerRecord
integrationEventToKafkaRecord event =
  KafkaProducerRecord
    { topic = event ^. #destination
    , key = fmap TE.encodeUtf8 (event ^. #key)
    , payload = integrationPayload event
    , headers = [(TE.encodeUtf8 n, TE.encodeUtf8 v) | (n, v) <- integrationHeaders event]
    }
```

### The current tour (what you are replacing)

`content/docs/keiro/walkthrough/integration/` currently holds four files + `meta.json`:

```text
00-start-here.mdx     (48 lines)  -- pipeline mermaid + 3-card chapter list + source map
01-the-inbox.mdx     (107 lines)  -- dedupeKeyFor, runInboxTransaction, tryInsertProcessingTx ON CONFLICT
02-the-outbox.mdx    (113 lines)  -- enqueueProducerEventTx, the claim CTE, perKeyPredicate, drainBatch
03-kafka-mapping.mdx (108 lines)  -- integrationHeaders, integrationEventToKafkaRecord, integrationEventFromKafka
meta.json                         -- pages: 00-start-here .. 03-kafka-mapping
```

These are accurate as far as they go (every quoted excerpt is verbatim) but they omit the envelope
source chapter entirely, the full inbox storage surface (`markFailedTx`, `garbageCollectCompleted`,
`lookupInbox`/`listInbox`, the `keiro_inbox` schema), the producer-mint path
(`mintIntegrationEvent`/`draftToEvent`/`IntegrationProducer`/`IntegrationEventDraft`), the
`markOutboxFailedTx` dead-letter decision and the backoff curve, the `OutboxPublishSummary`
counters, two of the four ordering predicates (`perSourcePredicate`, the `BestEffort`/`StopTheLine`
facts), and the full Kafka decode helper set. The deepened tour keeps the good prose, redistributes
it across six chapters, and fills the gaps. (The existing `02-the-outbox.mdx` already references the
stale-`publishing` gap and the `#recovering-stranded-publishing-rows` how-to anchor; preserve that
honesty.)


## Plan of Work

The work is eight milestones. M0 verifies preconditions. M1–M5 author or rewrite one chapter each
and are independently verifiable by building the site and viewing the chapter. M6 updates the
start-here page and `meta.json`. M7 runs the full acceptance gate. The end-state file set under
`content/docs/keiro/walkthrough/integration/`:

```text
00-start-here.mdx                        (updated)
01-the-integration-event-envelope.mdx    (new)
02-the-inbox.mdx                         (rewrite of old 01-the-inbox)
03-the-outbox-enqueue-and-claim.mdx      (new — split from old 02-the-outbox)
04-the-outbox-drain-and-dead-letter.mdx  (new — split from old 02-the-outbox)
05-kafka-mapping.mdx                     (rewrite of old 03-kafka-mapping)
meta.json                                (rewritten pages array)
```

Implement by `git mv`-ing the two rewritten files to their new numbers first (preserves history),
then editing content; create the new files (the envelope chapter, and the two outbox halves), and
update `00` and `meta.json` last. Each chapter follows the brief's shape: **introduce the types it
touches, then each function with its real signature and a focused excerpt, then the edge cases**, in
prose-first voice matching plan #11 and the existing chapters. Every chapter opens by naming its
source file(s) and linking the previous chapter (absolute path), and closes with a "Next:" link to
the following chapter (absolute path). The final chapter closes with a `<Cards>` back to the three
integration references/explanations (as the current `03-kafka-mapping` already does).

### M0 — Preconditions

Confirm EP-11 is Complete and the cross-link targets exist. At the end you can run `pnpm build` on
the existing tree with zero errors. Acceptance: the build succeeds before you change any chapter;
the four current chapters and `meta.json` exist; `integration` is in `walkthrough/meta.json`; and
the link targets `reference/integration-event`, `reference/inbox`, `reference/outbox`, the three
`explanation/*` integration pages, the five `how-to/*` integration guides (and the
`how-to/choose-an-outbox-ordering-policy#recovering-stranded-publishing-rows` anchor), and
`tutorials/consume-an-integration-event` all resolve.

### M1 — `01-the-integration-event-envelope.mdx` (new, title "01 — The integration-event envelope")

Walks `keiro-core/src/Keiro/Integration/Event.hs` — the contract both halves serialize. **This
chapter walks the source; it links the reference and does not re-document it.** Open with a one-line
"what this is" plus a `<Callout type="info">` linking
`/docs/keiro/reference/integration-event` ("for the exhaustive field-by-field reference, see the
reference page; this chapter reads the source"). Sections, in order:

- **The envelope record** — quote the `IntegrationEvent` record (all sixteen fields). One short
  paragraph grouping the fields by role: *identity* (`messageId`), *routing* (`source`,
  `destination`, `key`), *contract* (`eventType`, `schemaVersion`, `contentType`,
  `schemaReference`), *provenance* (`sourceEventId`, `sourceGlobalPosition`, `causationId`,
  `correlationId`), *payload/time* (`payloadBytes`, `occurredAt`), and *cross-cutting*
  (`traceContext`, `attributes`). Stress the **byte-oriented `payloadBytes`** — the envelope does
  not commit to JSON, so a future schema-registry (Avro/Protobuf) needs no migration. A
  `<Callout type="warn">` states the **identity rule**: `messageId` is the canonical dedupe key,
  stable across publish retries because it lives in the outbox row; the Kafka offset is delivery
  metadata only. Do **not** add a `<TypeTable>` here (that is the reference's job) — quote the
  record and explain it in prose.
- **The supporting types** — quote `IntegrationContentType`, `SchemaReference`, `TraceContext`,
  `IntegrationEventError`. One line each. Note `SchemaReference`'s fields are all optional because
  v1 needs no registry; `IntegrationEventError`'s four constructors are the decode failures
  surfaced by `decodeJsonIntegrationEvent`.
- **The JSON convenience helpers** — quote `encodeJsonIntegrationEvent` and the
  `decodeJsonIntegrationEvent` signature. Explain encode *replaces* `contentType`/`payloadBytes`
  and keeps everything else (the caller owns identity/routing); decode returns
  `UnsupportedContentType` if the envelope is not JSON, `MalformedPayload` if the bytes are not
  JSON, `DecodeFailed` if the target `FromJSON` rejects them. Note `payloadBytes` is the wire body
  via `integrationPayload`.
- **The wire mapping: `integrationHeaders`** — quote the function (abridged, but keep the
  always-present six and the `maybeHeader`/`traceContext` shape). Explain the rule a transport
  relies on: the first six headers are always emitted; every optional header is emitted only when
  its field is populated (`maybeHeader`), so a service that captures no trace context pays no
  header for it. List the canonical `keiro-*` header constants (and the W3C `traceparent` /
  `tracestate`) in a ` ```haskell ` block. Note this is the function chapter 05 (the Kafka mapping)
  builds on.
- **Content-type round-trip** — quote `contentTypeText` / `parseContentType`; note
  `application/json` round-trips to `ApplicationJson` (case/space-insensitive) and everything else
  is preserved verbatim — the open door for future binary formats.
- **The prefixed-TypeID message id** — a short paragraph: the envelope's `messageId` is a *minted*
  value, not part of this module; chapter 03 reads `mintIntegrationEvent`, which mints it as a
  **TypeID** (a UUIDv7 with a human-readable prefix). Forward-link
  `/docs/keiro/walkthrough/integration/03-the-outbox-enqueue-and-claim`.

Cross-links: `/docs/keiro/reference/integration-event` (the reference),
`/docs/keiro/explanation/integration-events` (the concept). Opens linking
`/docs/keiro/walkthrough/integration/00-start-here`. Closes: "Next: 02 — The inbox".

### M2 — `02-the-inbox.mdx` (rewrite of old `01-the-inbox`, title "02 — The inbox")

Keep the old chapter's good `dedupeKeyFor` / `runInboxTransaction` / `tryInsertProcessingTx` prose,
but deepen it with the full storage surface and the `keiro_inbox` schema. Reads
`keiro/src/Keiro/Inbox.hs`, `Inbox/Types.hs`, `Inbox/Schema.hs`. Sections:

- **`dedupeKeyFor`: choosing the identity** — quote the whole function (the four policy branches).
  Explain each branch and **emphasise the `PreferSourceEventIdentity` fallback chain**:
  `sourceEventId`, then `sourceGlobalPosition`, then `Left`. The returned `Text`, paired with
  `source`, is the inbox row's primary key. Note `dedupeKeyFor` returns `Left
  (DedupePolicyUnsatisfied policy)` when the chosen policy's field is absent — the only `InboxError`.
  Link `/docs/keiro/how-to/choose-an-inbox-dedupe-policy`.
- **`runInboxTransaction` / `runInboxTransactionWithKey`: one transaction** — quote both. Explain
  `runInboxTransaction` resolves the key then delegates; `runInboxTransactionWithKey` is the
  lower-level variant for keys the policy cannot express. Walk the single-transaction control flow
  as the entire idempotency contract: `tryInsertProcessingTx` `Right ()` (new) → handler →
  `markCompletedTx` → `InboxProcessed`; `Left existingRow` → branch on status
  (`InboxCompleted → InboxDuplicate`, `InboxProcessing → InboxInProgress`,
  `InboxFailed → InboxPreviouslyFailed`). A `<Callout type="warn">` states the rollback rule: a
  thrown exception or `Tx.condemn` rolls back the *whole* transaction including the inbox row, so
  the next delivery starts clean.
- **`tryInsertProcessingTx`: `ON CONFLICT … RETURNING TRUE`** — quote the Haskell and the
  `tryInsertStmt` SQL (the `ON CONFLICT (source, dedupe_key) DO NOTHING RETURNING TRUE`). Explain
  the atomic dedupe: a new row returns `TRUE` (`inserted = True`); a conflict returns no row
  (`inserted = False`), triggering the re-select; and the `Nothing` fall-through handles the rare
  inserted-then-GC'd race by treating it as new.
- **The completion and the reserved failure path** — quote `markCompletedStmt`. Then note
  `markFailedTx` (and `markFailedStmt`) **exist but are reserved**: the v1 single-transaction
  wrapper never calls them, because there is no failure branch in the single-transaction path — a
  failure is a rollback. Tie this to `InboxProcessing` never escaping a transaction
  (forward/back-link `/docs/keiro/explanation/the-inbox-pattern`).
- **GC and inspection: `garbageCollectCompleted`, `lookupInbox`, `listInbox`** — quote the
  `garbageCollectCompleted` signature and the `gcStmt` (the `DELETE … WHERE status = 'completed'
  AND completed_at < $1`). Explain the retention window **is** the duplicate-detection window
  (recommend 30 days), and that **failed rows are never GC'd**. Note `lookupInbox` / `listInbox`
  are test/inspection helpers.
- **The `keiro_inbox` table** — quote the `CREATE TABLE` (in a ` ```sql ` block): the
  `PRIMARY KEY (source, dedupe_key)`, the `status` default `'processing'`, the two indexes
  (`keiro_inbox_received_idx`, the partial `keiro_inbox_completed_idx … WHERE status = 'completed'`).
  Link `/docs/keiro/reference/inbox` for the full column reference.

Closes: "Next: 03 — The outbox: enqueue and claim".

### M3 — `03-the-outbox-enqueue-and-claim.mdx` (new — split from old `02`, title "03 — The outbox: enqueue and claim")

The first outbox half: how a row gets *in* and how the worker *claims* it. Reads
`keiro/src/Keiro/Outbox.hs`, `Outbox/Types.hs`, `Outbox/Schema.hs`. Sections:

- **Two ways to enqueue** — quote `IntegrationProducer`, `IntegrationEventDraft`, and
  `freshOutboxId` / `enqueueIntegrationEventTx`. Explain the two surfaces: (a) the canonical
  **producer subscription** maps recorded private events to drafts and writes one row each; (b) the
  inline **escape hatch** lets a saga/process manager enqueue directly inside its command
  transaction, supplying a **stable `OutboxId`** so retries coalesce on `(source, message_id)`.
  Link the command transaction at `/docs/keiro/reference/command` and the producer how-to
  `/docs/keiro/how-to/publish-with-the-outbox`.
- **Minting the message id: `mintIntegrationEvent`, `draftToEvent`, `enqueueProducerEventTx`** —
  quote all three. Explain `mintIntegrationEvent` mints a fresh `messageId` as a **TypeID** (a
  UUIDv7 with the producer's `messageIdPrefix`, 1–63 lowercase letters), then `draftToEvent`
  assembles the full envelope from `source` + minted id + draft. A `<Callout type="warn">`: the
  TypeID is minted *before* the insert; if the transaction rolls back, the id is discarded and the
  next attempt mints a new one, so **row-level idempotency hinges on a stable `OutboxId`, not the
  minted message id**. Back-link the envelope's `messageId` field at
  `/docs/keiro/walkthrough/integration/01-the-integration-event-envelope`.
- **`enqueueOutboxTx`: idempotent insert** — quote the `enqueueOutboxStmt` SQL (the 22-column
  INSERT with `ON CONFLICT (source, message_id) DO NOTHING`). Explain the `UNIQUE (source,
  message_id)` constraint is what coalesces duplicate retries.
- **`claimOutboxBatch`: the claim CTE** — quote the `claimSql` (the `WITH ready AS ( … FOR UPDATE
  SKIP LOCKED ) UPDATE … SET status = 'publishing' … RETURNING …`). Call out the three load-bearing
  facts: (1) the candidate set is `status IN ('pending', 'failed')` — **`publishing` is not
  selected**; (2) `FOR UPDATE SKIP LOCKED` lets many workers claim disjoint batches without
  blocking; (3) the claim atomically flips rows to `publishing` and bumps `attempt_count`.
- **The four ordering predicates** — quote `policyPredicate` and both predicate SQL blocks
  (`perKeyPredicate`, `perSourcePredicate`). Walk each policy:
  `PerKeyHeadOfLine` (default; `perKeyPredicate` skips a row if an earlier same-key row is
  non-terminal; null-keyed rows bypass), `PerSourceStream` (`perSourcePredicate`; any earlier
  non-terminal row in the source blocks), `StopTheLine` (claims with `perKeyPredicate`, **halts at
  the worker level** — chapter 04), `BestEffort` (`"TRUE"`; no blocking). Note that `publishing`
  counts as non-terminal (both predicates exclude only `('sent', 'dead')`), which sets up the gap
  below. Link `/docs/keiro/how-to/choose-an-outbox-ordering-policy`.
- **The stale-`publishing` gap** — a `<Callout type="warn">`: because the claim selects only
  `pending`/`failed` and the head-of-line predicates treat `publishing` as non-terminal, a worker
  that crashes between claim and mark **strands** the row in `publishing` with no automatic
  recovery, and that stranded row head-of-line-blocks its key. Document this as the **shipped
  behavior** and link the manual runbook
  `/docs/keiro/how-to/choose-an-outbox-ordering-policy#recovering-stranded-publishing-rows`. Do
  **not** repeat the inaccurate `OutboxPublishing` Haddock.
- **The `keiro_outbox` table** — quote the `CREATE TABLE` (` ```sql `): `outbox_id UUID PRIMARY
  KEY`, `UNIQUE (source, message_id)`, `status` default `'pending'`, `attempt_count` default 0,
  `next_attempt_at` default `now()`, the two indexes (`keiro_outbox_pending_idx`, the partial
  `keiro_outbox_head_of_line_idx … WHERE status NOT IN ('sent','dead') AND message_key IS NOT
  NULL`). Link `/docs/keiro/reference/outbox`.

Closes: "Next: 04 — The outbox: drain and dead-letter".

### M4 — `04-the-outbox-drain-and-dead-letter.mdx` (new — split from old `02`, title "04 — The outbox: drain and dead-letter")

The second outbox half: how claimed rows are published, retried, and dead-lettered. Reads
`keiro/src/Keiro/Outbox.hs` and `Outbox/Types.hs`. Sections:

- **`publishClaimedOutbox`: one pass per call** — quote the signature, `PublishOutcome`, and the
  `publishClaimedOutbox` body (claim a batch, seed an empty `OutboxPublishSummary`, `drainBatch`).
  A `<Callout type="info">` states it processes **one claimed batch and returns** — it does NOT
  loop; the application schedules it repeatedly (e.g. once per process-compose tick). Note the
  publisher is transport-neutral: it takes a caller-supplied `OutboxRow -> Eff es PublishOutcome`.
- **`drainBatch`: publish, then mark** — quote the `drainBatch` loop. Walk it row by row: it calls
  `publish` inside `withProducerSpan` (the optional OpenTelemetry span — link
  `/docs/keiro/reference/telemetry` and the ops tour, don't expand); on `PublishSucceeded` it calls
  `markOutboxSent` and bumps `claimed`/`published`; on `PublishFailed` it computes the backoff
  delay, calls `markOutboxFailedTx`, and bumps `dead` or `retried` per the result. Note publish is
  **at-least-once** — mark a row sent only *after* the broker acknowledges; the inbox dedupes a
  double-send.
- **`markOutboxFailedTx`: the dead-letter decision** — quote the function and `markSentStmt` /
  `markFailedStmt`. Explain it reads `attempt_count`; `>= maxAttempts` → `OutboxDead` (terminal,
  stays for operator inspection), else `OutboxFailed` with `next_attempt_at = now + delay`. Note it
  runs inside the caller's transaction so "read count → write status" is atomic across workers.
- **Backoff: `BackoffSchedule`, `nextDelay`, `ExponentialBackoffOptions`** — quote
  `BackoffSchedule`, `ExponentialBackoffOptions`, and `nextDelay`. Walk the formula:
  `ConstantBackoff` is fixed; `ExponentialBackoff` is `min maxDelay (initial * multiplier ^ (attempt
  - 1))`, with `attempt` 1-based. Quote `defaultPublishOptions` (batch 32, ten attempts,
  two-second constant backoff, per-key head-of-line). Link
  `/docs/keiro/how-to/choose-an-outbox-ordering-policy` for tuning.
- **`StopTheLine` and the summary** — quote `OutboxPublishOptions` and `OutboxPublishSummary`.
  Explain `StopTheLine` halts `drainBatch` on the first failure and records `haltedOn`; the other
  policies continue. State the invariant `published + retried + dead + halted == claimed`. Note the
  stale-`publishing` gap again *briefly* (back-link chapter 03's runbook) since a crash here is how
  a row gets stranded.

Closes: "Next: 05 — Kafka mapping".

### M5 — `05-kafka-mapping.mdx` (rewrite of old `03-kafka-mapping`, title "05 — Kafka mapping")

Keep the old chapter's `integrationHeaders` / `integrationEventToKafkaRecord` /
`integrationEventFromKafka` prose; add `KafkaProducerRecord` / `KafkaInboundRecord` /
`KafkaDecodeError` up front and the four decode helpers. Reads
`keiro-core/src/Keiro/Integration/Event.hs`, `keiro/src/Keiro/Outbox/Kafka.hs`,
`keiro/src/Keiro/Inbox/Kafka.hs`. Open by noting this code is **pure and broker-free** (no
librdkafka; the integration package bridges these neutral records to the broker library). Sections:

- **Out: `KafkaProducerRecord`, `integrationEventToKafkaRecord`, `outboxRowToKafkaRecord`** — quote
  the record and both functions. Explain `topic = destination`; key and headers UTF-8-encoded to
  bytes (Kafka treats both as opaque bytes); payload passed through unchanged;
  `outboxRowToKafkaRecord` is just the row's event through the same function. Recall (back-link
  chapter 01) that `integrationHeaders` emits only populated headers.
- **In: `KafkaInboundRecord`, `KafkaDecodeError`, `integrationEventFromKafka`** — quote the record,
  the error type, and the `integrationEventFromKafka` body (abridged but keeping the six
  `requireHeader` calls and the assembly). Walk the decode helpers: `requireHeader` →
  `MissingHeader`; `parseInt` → `InvalidIntHeader`; `parseUuid` → `InvalidUuidHeader`;
  `traverseLookup` returns `Nothing` (no error) when absent; `buildSchemaReference` reconstructs
  the `SchemaReference` (or `Nothing`). List the **six required** headers explicitly.
- **The `occurredAt = receivedAt` asymmetry** — a paragraph: the producer does not emit `occurredAt`
  as a canonical header, so the decoder sets `occurredAt = record ^. #receivedAt` and `attributes =
  Nothing`; receivers that need the producer's wall-clock re-derive it from the payload.
- **The poison-message rule** — a `<Callout type="warn">`: a `KafkaDecodeError` is a poison message
  (a missing/malformed header will not appear on redelivery), so the consumer routes it straight to
  the dead-letter — link `/docs/keiro/how-to/wire-a-kafka-consumer-to-the-inbox`.
- **What you have seen** — keep the old chapter's closing summary paragraph and the `<Cards>` back
  to `/docs/keiro/reference/integration-event`, `/docs/keiro/explanation/the-inbox-pattern`,
  `/docs/keiro/explanation/the-outbox-pattern`.

Closes: back to `/docs/keiro/walkthrough/integration/00-start-here`.

### M6 — Update `00-start-here.mdx` and `meta.json`

Rewrite the `<Cards>` chapter list from three cards to **five** (the new `01`–`05` slugs/titles),
refresh the source-file map (now nine read modules + two migrations), and keep the pipeline
`mermaid` (already correct: producer → outbox → Kafka → inbox → consumer). Rewrite `meta.json`
`pages` to the new ordered list:

```json
{
  "title": "Integration (inbox & outbox)",
  "pages": [
    "00-start-here",
    "01-the-integration-event-envelope",
    "02-the-inbox",
    "03-the-outbox-enqueue-and-claim",
    "04-the-outbox-drain-and-dead-letter",
    "05-kafka-mapping"
  ]
}
```

Do **not** touch `walkthrough/meta.json` (top level) or `walkthrough/index.mdx` — EP-19 owns those;
`integration` is already listed in the top-level meta.

### M7 — Full acceptance

Run the build and audits (see Validation). Acceptance: zero crawler warnings, `lint:links` exit 0,
the depth checklist green, no relative links, every fence tagged.


## Concrete Steps

Run all commands from the repo root `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` unless stated
otherwise. The toolchain is **pnpm** on **Node 22** (enter the Nix dev shell first if the repo uses
one: `nix develop`).

### M0 — Preconditions

```bash
# The four current chapters + meta exist (HARD DEP EP-11).
ls content/docs/keiro/walkthrough/integration/
# integration is wired into the walkthrough section.
grep -q '"integration"' content/docs/keiro/walkthrough/meta.json && echo "integration listed"

# The cross-link targets this tour points at exist.
for f in reference/integration-event reference/inbox reference/outbox reference/command reference/telemetry \
         explanation/integration-events explanation/the-inbox-pattern explanation/the-outbox-pattern \
         how-to/choose-an-inbox-dedupe-policy how-to/wire-a-kafka-consumer-to-the-inbox \
         how-to/publish-with-the-outbox how-to/choose-an-outbox-ordering-policy \
         how-to/bridge-the-outbox-to-kafka tutorials/consume-an-integration-event; do
  test -f "content/docs/keiro/$f.mdx" && echo "have $f" || echo "MISSING $f"
done

# The runbook anchor the gap callouts link to exists.
grep -q "recovering-stranded-publishing-rows\|## Recovering stranded publishing rows" \
  content/docs/keiro/how-to/choose-an-outbox-ordering-policy.mdx && echo "anchor present"

pnpm install
pnpm build
```

Expected: every `have …` line present (no `MISSING`), `anchor present`, and `✓ built in <N>s` with
no `[unhandledRejection]`/`Failed to fetch`.

Optional — confirm the API names you will quote still exist at the pinned commit (read-only):

```bash
K=/Users/shinzui/Keikaku/bokuno/keiro
grep -RnE "runInboxTransaction|dedupeKeyFor|tryInsertProcessingTx|markCompletedTx|markFailedTx|garbageCollectCompleted" \
  "$K/keiro/src/Keiro/Inbox.hs" "$K/keiro/src/Keiro/Inbox/Types.hs" "$K/keiro/src/Keiro/Inbox/Schema.hs"
grep -RnE "enqueueProducerEventTx|mintIntegrationEvent|draftToEvent|publishClaimedOutbox|claimOutboxBatch|markOutboxFailedTx|nextDelay|policyPredicate|perKeyPredicate|perSourcePredicate" \
  "$K/keiro/src/Keiro/Outbox.hs" "$K/keiro/src/Keiro/Outbox/Types.hs" "$K/keiro/src/Keiro/Outbox/Schema.hs"
grep -RnE "integrationHeaders|integrationEventToKafkaRecord|integrationEventFromKafka|encodeJsonIntegrationEvent" \
  "$K/keiro-core/src/Keiro/Integration/Event.hs" "$K/keiro/src/Keiro/Outbox/Kafka.hs" "$K/keiro/src/Keiro/Inbox/Kafka.hs"
```

### M1–M5 — Author / rewrite chapters

Move the two rewritten chapters to their new numbers first (preserves git history), then edit:

```bash
cd content/docs/keiro/walkthrough/integration
git mv 01-the-inbox.mdx     02-the-inbox.mdx
git mv 03-kafka-mapping.mdx 05-kafka-mapping.mdx
# The old 02-the-outbox.mdx is SPLIT, not moved: create 03/04 fresh, then delete 02-the-outbox.mdx.
git rm 02-the-outbox.mdx
```

Then create `01-the-integration-event-envelope.mdx`, `03-the-outbox-enqueue-and-claim.mdx`,
`04-the-outbox-drain-and-dead-letter.mdx`, and edit `02`/`05` per M2/M5. (Note the `git mv` of
`01-the-inbox` → `02-the-inbox` happens *before* you create the new `01` envelope chapter, so the
two never collide on the `01` slug at the filesystem level — create the new `01` after the move.)
After each chapter, build and view it:

```bash
pnpm build
# then pnpm dev and open the chapter, e.g.
# http://localhost:3000/docs/keiro/walkthrough/integration/03-the-outbox-enqueue-and-claim
```

Each chapter's frontmatter is `title` + `description`. Example skeleton (four-backtick fence so the
inner fences survive):

````mdx
---
title: "03 — The outbox: enqueue and claim"
description: "Reading how an outbox row gets in (the producer mint, the prefixed-TypeID message id, ON CONFLICT) and how the worker claims it (the claim CTE, FOR UPDATE SKIP LOCKED, the four ordering predicates), plus the stale-publishing gap."
---

This chapter reads the outbox enqueue and claim paths in `keiro/src/Keiro/Outbox.hs`,
`keiro/src/Keiro/Outbox/Types.hs`, and `keiro/src/Keiro/Outbox/Schema.hs`. Read
[02 — The inbox](/docs/keiro/walkthrough/integration/02-the-inbox) first.

## The claim CTE

```sql
WITH ready AS (
  SELECT r.outbox_id FROM keiro_outbox r
  WHERE r.status IN ('pending', 'failed')
    AND r.next_attempt_at <= $2
    AND ( <ordering predicate> )
  ORDER BY r.created_at
  LIMIT $1
  FOR UPDATE SKIP LOCKED
)
UPDATE keiro_outbox kt
SET status = 'publishing', attempt_count = kt.attempt_count + 1, updated_at = $2
WHERE kt.outbox_id IN (SELECT outbox_id FROM ready)
RETURNING <row columns>
```

… prose explaining the candidate set, SKIP LOCKED, and the spliced predicate …

Next: [04 — The outbox: drain and dead-letter](/docs/keiro/walkthrough/integration/04-the-outbox-drain-and-dead-letter).
````

### M6 — Start-here + meta.json

Edit `00-start-here.mdx`'s `<Cards>` to the five new chapters and overwrite `meta.json` with the M6
`pages` array above.

### M7 — Build and audit

```bash
pnpm build
pnpm lint:links
```

Expected: `✓ built` with no crawler warnings; `lint:links` exits 0.


## Validation and Acceptance

Acceptance is observable behavior plus a depth audit, not "files exist".

1. **The site builds and prerenders every chapter.** From the repo root:

   ```bash
   pnpm build
   ```

   Succeeds (`✓ built`) and the log prerenders the six routes
   `/docs/keiro/walkthrough/integration/{00-start-here,01-the-integration-event-envelope,02-the-inbox,03-the-outbox-enqueue-and-claim,04-the-outbox-drain-and-dead-letter,05-kafka-mapping}`.

2. **Zero crawler warnings.**

   ```bash
   pnpm build 2>&1 | grep -E "unhandledRejection|Failed to fetch" || echo "no crawler warnings"
   ```

   Expected: `no crawler warnings`.

3. **Link check passes.**

   ```bash
   pnpm lint:links
   ```

   Expected: exit 0, no broken or relative internal links.

4. **Absolute links only** (no relative MDX links in this tour):

   ```bash
   grep -RnE "\]\((\./|\.\./)" content/docs/keiro/walkthrough/integration || echo "no relative links"
   ```

   Expected: `no relative links`.

5. **Every fence is language-tagged** (an opening fence has a language word right after the
   backticks; closing fences are bare and must be eyeballed as closers):

   ```bash
   grep -RnE "^```$" content/docs/keiro/walkthrough/integration | grep -v "```[a-z]" || echo "check closers"
   ```

6. **Depth checklist — every named binding, all four ordering predicates, and the dead-letter path
   appear in the tour.** This is the contribution-grade gate: each name below must appear somewhere
   in `content/docs/keiro/walkthrough/integration/*.mdx`:

   ```bash
   for name in \
     IntegrationEvent IntegrationContentType ApplicationJson OtherContentType SchemaReference \
     TraceContext IntegrationEventError MalformedPayload UnsupportedContentType \
     integrationPayload integrationHeaders encodeJsonIntegrationEvent decodeJsonIntegrationEvent \
     contentTypeText parseContentType messageId payloadBytes \
     headerMessageId headerSource headerDestination headerEventType headerSchemaVersion headerContentType \
     InboxDedupePolicy PreferIntegrationMessageId PreferSourceEventIdentity KafkaDeliveryIdentity CustomDedupeKey \
     InboxStatus InboxResult InboxProcessed InboxDuplicate InboxInProgress InboxPreviouslyFailed \
     InboxError DedupePolicyUnsatisfied dedupeKeyFor KafkaDeliveryRef \
     runInboxTransaction runInboxTransactionWithKey tryInsertProcessingTx markCompletedTx markFailedTx \
     garbageCollectCompleted lookupInbox listInbox keiro_inbox dedupe_key \
     OutboxId OutboxStatus OutboxPending OutboxPublishing OutboxSent OutboxFailed OutboxDead \
     OrderingPolicy PerKeyHeadOfLine PerSourceStream StopTheLine BestEffort \
     BackoffSchedule ConstantBackoff ExponentialBackoff ExponentialBackoffOptions nextDelay \
     OutboxMessage OutboxRow OutboxPublishOptions OutboxPublishSummary defaultPublishOptions \
     freshOutboxId enqueueIntegrationEventTx IntegrationProducer IntegrationEventDraft \
     mintIntegrationEvent draftToEvent enqueueProducerEventTx enqueueOutboxTx \
     claimOutboxBatch markOutboxSent markOutboxFailedTx lookupOutbox listOutbox \
     PublishOutcome PublishSucceeded PublishFailed publishClaimedOutbox \
     policyPredicate perKeyPredicate perSourcePredicate keiro_outbox \
     KafkaProducerRecord outboxRowToKafkaRecord integrationEventToKafkaRecord \
     KafkaInboundRecord KafkaDecodeError MissingHeader InvalidIntHeader InvalidUuidHeader \
     integrationEventFromKafka publishing; do
     grep -Rqs -- "$name" content/docs/keiro/walkthrough/integration && echo "ok: $name" || echo "MISSING: $name"
   done
   ```

   Expected: every line says `ok:`. (The bare `publishing` check confirms the stale-row gap is
   documented; `keiro_inbox`/`keiro_outbox`/`dedupe_key` confirm the SQL schemas are quoted; all
   four ordering-policy constructors plus `policyPredicate`/`perKeyPredicate`/`perSourcePredicate`
   confirm the predicates are covered; `OutboxDead`/`markOutboxFailedTx` confirm the dead-letter
   path.)

7. **Quoted Haskell/SQL names exist in the pinned source.** Re-run the same `for name in …` loop but
   grep `/Users/shinzui/Keikaku/bokuno/keiro/keiro
   /Users/shinzui/Keikaku/bokuno/keiro/keiro-core
   /Users/shinzui/Keikaku/bokuno/keiro/keiro-migrations` instead of the docs dir; every Haskell/SQL
   identifier must say `ok:`. (This catches a typo'd identifier the docs build cannot — Haskell
   snippets and SQL are not compiled. The conceptual words like `dedupe_key` map to the migration
   column names; `keiro_inbox`/`keiro_outbox` map to the table names.)

8. **The chapters render in a browser.** Run `pnpm dev`, open
   `http://localhost:3000/docs/keiro/walkthrough/integration/00-start-here`, and confirm the five
   chapter cards link correctly, the pipeline `mermaid` renders as a diagram, and each chapter's
   `<Callout>`s render. Walk 00 → 05 via the "Next:" links and confirm every link navigates (no
   404). Confirm the gap callouts in chapters 03/04 link to
   `/docs/keiro/how-to/choose-an-outbox-ordering-policy#recovering-stranded-publishing-rows` and
   that the anchor scrolls to the runbook section.


## Idempotence and Recovery

Every step is safe to repeat. `git mv` is idempotent in effect (re-running after the move is a no-op
or a harmless re-stage); `git rm` of the split `02-the-outbox.mdx` is a one-time delete (after which
the content lives in `03`/`04`); editing `.mdx` files is additive; re-running `pnpm build` and
`pnpm lint:links` is idempotent. If you renumber a chapter, rename the file *and* update the matching
`meta.json` slug *and* every absolute intra-tour link that pointed at the old number, in the same
change — a slug pointing at a missing file (or a file missing from `pages`) yields a broken sidebar
entry, not a crash, so the build still exits 0; catch it with acceptance #8.

If `pnpm build` reports `Failed to fetch`, the cause is almost always a relative link or a link to a
page that does not exist yet. Run acceptance #4 for relative links; for the runbook anchor, confirm
the `#recovering-stranded-publishing-rows` heading still exists in
`content/docs/keiro/how-to/choose-an-outbox-ordering-policy.mdx` (it is owned by EP-11; if EP-11
renamed it, link the section heading that ships).

Where the keiro source diverges from this plan's transcription, **follow the source** at the pinned
commit `3f5dc9c` and record the delta in Surprises & Discoveries and (if it changes an instruction)
the Decision Log. In particular, the `OutboxPublishing` Haddock is known-wrong; document the claim
query's behavior (`status IN ('pending', 'failed')`), not the comment. Do not edit the keiro tree.


## Interfaces and Dependencies

This plan hard-depends on **EP-11** (which created the tour, its `meta.json`, the
`walkthrough/meta.json` entry, the `reference/integration-event` / `reference/inbox` /
`reference/outbox` pages, the three integration explanations, the five integration how-tos, and the
consume tutorial it links) and **EP-7** (the overview/jitsurei spine and authoring conventions);
both are Complete. It soft-depends on **EP-13** (the command-cycle tour the producer-mint and inline
escape-hatch sections cross-link); the targets it links (`/docs/keiro/walkthrough/command-cycle/`,
`/docs/keiro/reference/command`) already exist. It **integration-depends** into **EP-19**, which owns
the shared `walkthrough/index.mdx` hub and the top-level `walkthrough/meta.json` ordering; this plan
must not touch either beyond the `integration` entry already present.

**Source of truth (read-only) at pinned commit `3f5dc9c`** — cross-checked while authoring:
`/Users/shinzui/Keikaku/bokuno/keiro/keiro-core/src/Keiro/Integration/Event.hs`,
`/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Inbox.hs`,
`/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Inbox/Types.hs`,
`/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Inbox/Schema.hs`,
`/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Inbox/Kafka.hs`,
`/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Outbox.hs`,
`/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Outbox/Types.hs`,
`/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Outbox/Schema.hs`,
`/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Outbox/Kafka.hs`,
`/Users/shinzui/Keikaku/bokuno/keiro/keiro-migrations/sql-migrations/2026-05-17-01-00-00-keiro-outbox.sql`,
`/Users/shinzui/Keikaku/bokuno/keiro/keiro-migrations/sql-migrations/2026-05-17-02-00-00-keiro-inbox.sql`,
and the worked producer in
`/Users/shinzui/Keikaku/bokuno/keiro/docs/guides/integration-events-with-kafka.md` (no jitsurei
target — jitsurei ships no Kafka demo).

**Files created (all under `content/docs/keiro/walkthrough/integration/`):**

- `01-the-integration-event-envelope.mdx` — title "01 — The integration-event envelope".
- `03-the-outbox-enqueue-and-claim.mdx` — title "03 — The outbox: enqueue and claim".
- `04-the-outbox-drain-and-dead-letter.mdx` — title "04 — The outbox: drain and dead-letter".

**Files renamed + rewritten (under the same directory):**

- `01-the-inbox.mdx` → `02-the-inbox.mdx` — title "02 — The inbox".
- `03-kafka-mapping.mdx` → `05-kafka-mapping.mdx` — title "05 — Kafka mapping".

**File split and removed:**

- `02-the-outbox.mdx` — its content is split into the new `03` (enqueue + claim) and `04` (drain +
  dead-letter); the old file is deleted.

**Files edited:**

- `00-start-here.mdx` — chapter `<Cards>` list (five cards) + source-file map.
- `meta.json` — `pages` rewritten to the six ordered slugs (M6).

**Do not touch:** any other `walkthrough/` subdir; `content/docs/keiro/walkthrough/index.mdx`
(EP-19); `content/docs/keiro/walkthrough/meta.json` top level (EP-19; `integration` already listed);
any reference/explanation/how-to/tutorial page (EP-11/EP-12 own those); any file outside
`content/docs/keiro/walkthrough/integration/`. The reference field tables
(`/docs/keiro/reference/integration-event` etc.) are *out of scope* to re-document — link to them
rather than restating them.

**Haskell / SQL interfaces that must be quoted correctly by the end** (present verbatim in the
pinned source): from `Keiro.Integration.Event` — `IntegrationEvent`, `IntegrationContentType`,
`SchemaReference`, `TraceContext`, `IntegrationEventError`, `integrationPayload`,
`integrationHeaders`, `encodeJsonIntegrationEvent`, `decodeJsonIntegrationEvent`, `contentTypeText`,
`parseContentType`, and the `headerMessageId … headerTraceState` constants; from `Keiro.Inbox` /
`Keiro.Inbox.Types` / `Keiro.Inbox.Schema` — `runInboxTransaction`, `runInboxTransactionWithKey`,
`InboxDedupePolicy` (four constructors), `InboxStatus`, `InboxResult` (four constructors),
`InboxError`, `KafkaDeliveryRef`, `dedupeKeyFor`, `tryInsertProcessingTx`, `markCompletedTx`,
`markFailedTx` (reserved), `garbageCollectCompleted`, `lookupInbox`, `listInbox`; from
`Keiro.Inbox.Kafka` — `KafkaInboundRecord`, `KafkaDecodeError`, `integrationEventFromKafka`; from
`Keiro.Outbox` / `Keiro.Outbox.Types` / `Keiro.Outbox.Schema` — `OutboxId`, `OutboxStatus` (five
constructors), `OrderingPolicy` (four constructors), `BackoffSchedule`, `ExponentialBackoffOptions`,
`nextDelay`, `OutboxMessage`, `OutboxRow`, `OutboxPublishOptions`, `OutboxPublishSummary`,
`defaultPublishOptions`, `freshOutboxId`, `enqueueIntegrationEventTx`, `IntegrationProducer`,
`IntegrationEventDraft`, `mintIntegrationEvent`, `draftToEvent`, `enqueueProducerEventTx`,
`enqueueOutboxTx`, `claimOutboxBatch`, `markOutboxSent`, `markOutboxFailedTx`, `lookupOutbox`,
`listOutbox`, `PublishOutcome`, `publishClaimedOutbox`, and the internal `policyPredicate` /
`perKeyPredicate` / `perSourcePredicate`; from `Keiro.Outbox.Kafka` — `KafkaProducerRecord`,
`outboxRowToKafkaRecord`, `integrationEventToKafkaRecord`; and the two SQL tables `keiro_inbox`
(`PRIMARY KEY (source, dedupe_key)`) and `keiro_outbox` (`UNIQUE (source, message_id)`) with their
indexes.
