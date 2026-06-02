---
id: 13
slug: deepen-the-keiro-command-cycle-code-walkthrough
title: "Deepen the keiro command-cycle code walkthrough"
kind: exec-plan
created_at: 2026-06-02T04:47:38Z
master_plan: "docs/masterplans/2-keiro-framework-documentation-set.md"
---

# Deepen the keiro command-cycle code walkthrough

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, a developer who opens the command-cycle code tour at
`/docs/keiro/walkthrough/command-cycle/` can read **every** exported function of keiro's write
path, the types and record fields it threads, and its edge cases — and come away able to
*contribute* to `Keiro.Command`, not merely recognise it. Today the tour samples the module: four
short chapters (48–116 MDX lines each), mostly one source excerpt plus a paragraph. It shows
`runCommand`, `runCommandWithSqlEvents`, the codec boundary, and the router, but it skips the
hydration machine (`hydrate`/`hydrateFull` and their replay fold), the command-plan types
(`Hydrated`, `Replay`, `CommandPlan`), the full `CommandError` taxonomy, the telemetry seam
(`recordCommandOutcome`, `commandErrorClass`), `assignEventIds`, `encodeEvents`, and the snapshot
write's exact firing rule. This plan walks the whole of `keiro/src/Keiro/Command.hs` (657 lines) end
to end, plus the codec boundary in `keiro-core/src/Keiro/Codec.hs`, the typed handles in
`keiro-core/src/Keiro/EventStream.hs` and `keiro-core/src/Keiro/Stream.hs`, and the content-based
router in `keiro/src/Keiro/Router.hs`.

The "command cycle" is keiro's **write path**: the half of an event-sourcing system that *changes*
state. "Event sourcing" means the system stores an append-only log of **events** (facts that
happened, like `OrderPlaced`) rather than a mutable row of current state; current state is *derived*
by folding the events. An **aggregate** is one consistency boundary — one entity whose events live
in a single ordered **stream** (for example all events for `order-42`). A **command** is an
instruction such as "place this order"; keiro turns it into zero or more events and appends them.
keiro runs every command as one three-phase pipeline, named in the module's own Haddock and in the
shipped docs as **Hydrate → Transduce → Append**:

1. **Hydrate** — replay the stream's stored events (optionally fast-forwarding from a snapshot)
   through the keiki transducer to recover the current `(state, registers)` pair and the stream's
   current `StreamVersion`.
2. **Transduce** — step the transducer with the command. The shipped operation is `Keiki.step` on a
   `SymTransducer` (keiki's symbolic-register finite-state transducer). A `Nothing` is a rejection
   (`CommandRejected`); a `Just (state', registers', events)` with an empty `events` list is a
   *no-op*; a non-empty list is an *accepted* transition.
3. **Append** — encode the emitted events with the stream's `Codec` and append them at the expected
   version. A concurrency conflict triggers a bounded re-hydrate-and-retry; exhausting the budget
   yields `RetryExhausted`.

A reader who finishes the deepened tour can:

- **Trace a command through the real call graph**, not a diagram: `runCommand` → `attempt` →
  `hydrate` (→ `snapshotSeed` / `replayFrom` / `hydrateFull`) → `prepareCommandPlan` (→
  `evaluateCommand` → `Keiki.step`, then `encodeEvents` → `assignEventIds`) → `appendOnce` (→
  `expectedVersion`, `appendToStream`, `writeSnapshotIfNeeded`) → `retryOrFail` →
  `isRetryableConflict`, and the success/no-op result constructors `appendedResult` / `noOpResult`.
- **Read the command-plan and hydration types** the runner threads internally — `Hydrated rs s`,
  `Replay rs s co`, `CommandPlan target rs s co` (`CommandNoOp` vs. `CommandAppend`) — and see how
  the keiki `InFlight`/`Settled` replay state distinguishes a stream that ended mid-ε-walk from one
  that settled.
- **Tell apart the six `CommandError` constructors and the three caller-visible outcomes** — a
  *rejection* (`CommandRejected`), a *no-op* (a `Right CommandResult` with `eventsAppended = 0`),
  and a *store failure* (`StoreFailed` / `RetryExhausted`) — including the two hydration-time errors
  (`HydrationDecodeFailed`, `HydrationReplayFailed`) and the encode error (`EncodeFailed`).
- **Understand `RunCommandOptions` field by field** (`retryLimit`, `pageSize`, `eventIds`,
  `beforeAppend`, `tracer`, `metadata`) and what `defaultRunCommandOptions` sets each to.
- **Understand optimistic concurrency precisely**: how `expectedVersion` maps `StreamVersion 0` to
  `NoStream` and any other version to `ExactVersion v`, and the sharp, easily-missed fact that the
  retryable-conflict set is `{WrongExpectedVersion, StreamAlreadyExists}` — so a lost new-stream
  race is *silently retried*, never surfaced.
- **Read the codec boundary** end to end: `encodeForAppend` / `encodeForAppendWithMetadata` /
  `metadataFor` on write (the `schemaVersion` stamp that always wins), and `decodeRecorded` →
  `extractSchemaVersion` → `decodeRaw` → `migrateToCurrent` on read (fatal-on-unknown event type,
  the ascending-contiguous upcaster chain, the six `CodecError` constructors), anchored to the real
  `jitsurei` v1→v2 `OrderPlaced` upcaster.
- **Read the typed handles**: `EventStream`'s seven fields and what each does, `SnapshotPolicy`'s
  four constructors, `StateCodec`'s reuse gate (`stateCodecVersion` + `shapeHash`), and the
  phantom-typed `Stream a` (`stream` / `streamName` / `mapStreamName`).
- **Read the router** in full: `Router`'s five fields, `RouterResult`, `runRouterOnce`'s
  `dispatchCommand` (deterministic id → `eventAlreadyIn` pre-check → `runCommandWithProjections` →
  `DuplicateEvent` fold), and `runRouterWorker`'s decode/dispatch/ack policy over a shibuya adapter.

You can see the result by running the docs site from the repo root
(`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`) with `pnpm dev` (which runs `vite dev`), or a
production build with `pnpm build` (which runs `vite build` and emits a static single-page app under
`.output/public`). Browsing `http://localhost:3000/docs/keiro/walkthrough/command-cycle/00-start-here`
shows the expanded tour nested under "Code Walkthrough" → "The command cycle" in the sidebar, with
the new chapters in `meta.json` order. The visible, demonstrable change: where the old tour had
**four** chapters totalling ~376 MDX lines, the deepened tour has **seven** chapters covering every
exported `Keiro.Command` binding, every `Keiro.Codec` function, and the router — each function
introduced with its real Haskell signature and a focused excerpt quoted verbatim from the pinned
source.

This is a **content** plan. It rewrites and adds files only under
`content/docs/keiro/walkthrough/command-cycle/`. It does **not** build the docs app, the
highlighter, the font, the Mermaid component, or the IA/template system (MasterPlan #1 owns those;
they are complete). It does **not** re-derive snapshot read/write mechanics, the read-model query
path, or consistency modes — those belong to the read-side tour and references; this tour links to
them. Every Haskell snippet documents keiro **as shipped at the pinned upstream commit `3f5dc9c`
(keiro 0.1.0.0)**; where the keiro repo's own `docs/research/*` / `docs/plans/*` notes diverge from
the shipped code, this plan follows the source.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here, even if
it requires splitting a partially completed task into two ("done" vs. "remaining"). This section
must always reflect the actual current state of the work.

- [x] M0. Preconditions verified _(2026-06-02)_ — EP-8 Complete (the `walkthrough/command-cycle/`
      subdir held its five current chapters + `meta.json`; `command-cycle` listed in
      `walkthrough/meta.json`); all cross-link targets resolve (`reference/{command,codec,event-stream-and-stream,router,snapshot,process-manager,projection,telemetry}`,
      `explanation/{the-command-cycle,codec-and-schema-evolution,why-symtransducer-not-decider}`,
      `how-to/{make-commands-idempotent,configure-concurrency-retries,run-a-command-in-a-transaction,evolve-an-event-schema,choose-a-consistency-mode}`).
      keiro source read at the pinned commit `3f5dc9c` via `git show`. (Build/lint gate is run centrally
      by the integration owner per this run's scope — not invoked here.)
- [x] M1. New chapter `01-command-types-and-errors.mdx` authored _(2026-06-02)_ — `CommandResult`,
      `CommandError` (all six constructors), `RunCommandOptions` (all six fields) +
      `defaultRunCommandOptions`, and the internal plan/hydration types `Hydrated`, `Replay`,
      `CommandPlan`. TypeTables for the result and options records; the three-outcomes callout.
- [x] M2. New chapter `02-hydration.mdx` authored _(2026-06-02)_ — `hydrate` (snapshot-seed branch +
      silent fallback), `hydrateFull`, the `applyRecorded`/`applyEvent` replay fold, `decodeRecorded`
      on the hydrate path, the `Keiki.Settled` vs. `Keiki.InFlight` finish rule, and a replay-fold
      mermaid.
- [x] M3. Chapter `03-the-command-processor.mdx` rewritten _(2026-06-02)_ (was
      `01-the-command-processor`) — `runCommand`, `attempt`, `runPlan`, `prepareCommandPlan`,
      `evaluateCommand`, `encodeEvents`, `assignEventIds`, `expectedVersion`, `appendOnce`,
      `writeSnapshotIfNeeded`, `retryOrFail`, `isRetryableConflict`, `appendedResult`/`noOpResult`, and
      the telemetry seam (`withCommandSpan`, `recordCommandOutcome`, `commandErrorClass`).
- [x] M4. Chapter `04-the-transactional-write-path.mdx` rewritten _(2026-06-02)_ (was
      `02-the-transactional-write-path`) — all three runner signatures, the `runCommandWithSql`
      wrapper body, `appendWithSqlOnce`, `Tx.condemn`, `reconstructRecorded`, the `[(co, RecordedEvent)]`
      pairing.
- [x] M5. Chapter `05-the-codec-on-the-boundary.mdx` rewritten _(2026-06-02)_ (was
      `03-the-codec-on-the-boundary`) — `Codec`/`Upcaster` + a TypeTable, all six `CodecError`
      constructors, `encodeForAppend`/`encodeForAppendWithMetadata`/`metadataFor`,
      `decodeRecorded`/`extractSchemaVersion`/`decodeRaw`/`migrateToCurrent`, the jitsurei v1→v2
      upcaster, and the `pageCodec` contrast.
- [x] M6. New chapter `06-the-typed-handles.mdx` authored _(2026-06-02)_ — `EventStream` (seven
      fields + TypeTable), `SnapshotPolicy` (four constructors), `StateCodec` (reuse gate), `Stream a`
      + `stream`/`streamName`/`mapStreamName`, anchored to `orderEventStream`/`snapshotOrderEventStream`
      and `orderStream`.
- [x] M7. Chapter `07-the-router.mdx` rewritten _(2026-06-02)_ (was `04-the-router`) — `Router` (five
      fields), `RouterResult`, `runRouterOnce`/`dispatchCommand`, `runRouterWorker`/`ackDecisionFor`,
      `pagingRouter` anchor.
- [x] M8. `00-start-here.mdx` updated _(2026-06-02)_ — new `<Cards>` list (all seven chapters),
      refreshed five-file source map; overview mermaid kept (already Hydrate → Transduce → Append).
      `meta.json` `pages` rewritten to the eight ordered slugs.
- [x] M9. Self-verification done _(2026-06-02)_ — depth checklist (Validation #6) green: every named
      binding present across the eight chapters; source-name check (Validation #7) green against the
      `3f5dc9c` corpus; no relative links; every opening fence language-tagged (per-file
      `lang_opens == bare_closes`). The `pnpm build` / `pnpm lint:links` gate is run centrally by the
      integration owner for this run.


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during implementation.
Provide concise evidence.

- **The keiro working tree had drifted past the pinned commit `3f5dc9c`.** `git rev-parse --short HEAD`
  in `/Users/shinzui/Keikaku/bokuno/keiro` returned `94c85e2`, four commits ahead of `3f5dc9c`. I
  therefore read every quoted file via `git show 3f5dc9c:<path>` rather than the checkout, honoring the
  plan's "documents keiro as shipped at `3f5dc9c`" rule. Evidence: `git log --oneline 3f5dc9c -1`
  resolves to `fix(telemetry): restore context detach on otel 1`; HEAD is
  `docs(command): name the middle phase "Transduce", not "Decide"`.
- **At `3f5dc9c`, `Keiro.Command`'s own Haddock still names the middle phase "Decide".** The module
  doc reads `2. /Decide/ — step the transducer with the command`. The very next-in-history upstream
  commit (`94c85e2`) renames it to "Transduce" — confirming the plan's house rule. I followed the plan
  (and that later upstream fix): all prose uses **Hydrate → Transduce → Append**, and I did *not* quote
  the "Decide" Haddock line. No source code identifiers were affected; the binding names are identical
  at both commits.
- **The read-side snapshot chapter slug in the plan is stale.** The plan (Decision Log, M2) links
  `/docs/keiro/walkthrough/read-side/01-snapshots-in-the-command-path`, and that file does currently
  exist on disk under the old name. Per this run's canonical cross-tour slug map, the read-side tour is
  being renumbered so the snapshot chapter lands at
  `02-snapshots-in-the-command-and-hydration-path`. I linked the canonical target in chapters 02 and
  06. Evidence: the slug map supplied for this run overrides the plan; the read-side dir today holds
  `01-snapshots-in-the-command-path.mdx` (pre-renumber).
- **The foundation tour was not yet on disk at authoring time.** `content/docs/keiro/walkthrough/foundation/`
  was empty when I authored. Per the run's slug map (these pages are authored in parallel), chapter 02
  forward-links `/docs/keiro/walkthrough/foundation/04-the-symtransducer-and-step` alongside the
  always-present `/docs/keiro/explanation/why-symtransducer-not-decider`, so the conceptual link is
  durable whichever lands first.


## Decision Log

Record every decision made while working on the plan.

- Decision: Renumber the tour from five chapters (`00`–`04`) to **eight files** (`00` start-here plus
  `01`–`07`) and split the single dense `01-the-command-processor` into three chapters — *command
  types and errors* (`01`), *hydration* (`02`), and *the command processor* (`03`) — rather than
  growing one chapter past readability.
  Rationale: the brief asks for "introduce types, then each function with its real signature and a
  focused excerpt, then the edge cases" per chapter; the hydration machine alone (`hydrate`,
  `hydrateFull`, the replay fold, `Settled`/`InFlight`) is a chapter's worth of material the old tour
  omitted entirely. Disjoint-subdirectory ownership (Integration Point #2) lets EP-13 add and
  renumber chapters inside `walkthrough/command-cycle/` freely as long as `meta.json` stays in sync.
  Date: 2026-06-02
- Decision: Keep the cycle name **Hydrate → Transduce → Append** in all prose and the overview
  mermaid; never "Decide".
  Rationale: "Decide" echoes keiki's legacy **Decider façade**, which is banned from these docs
  (MasterPlan Decision Log, 2026-06-01). The shipped middle step is `Keiki.step` on a
  `SymTransducer` — a *transducer step*, so "Transduce" is the source-honest name.
  Date: 2026-06-02
- Decision: Treat **snapshot read/write mechanics and consistency modes as out of scope** for this
  tour; link out instead of re-deriving them.
  Rationale: the snapshot codec (`Keiro.Snapshot`, `Keiro.Snapshot.Codec`, `Keiro.Snapshot.Policy`)
  and the read-model `ConsistencyMode` (`Keiro.ReadModel`) live on the read side and are owned by
  EP-9 / EP-14 (Integration Point #7). The command-cycle source touches snapshots only at one *call
  site* (`writeSnapshotIfNeeded`), which this tour walks while linking the mechanics to
  `/docs/keiro/reference/snapshot` and `/docs/keiro/walkthrough/read-side/01-snapshots-in-the-command-path`.
  Date: 2026-06-02
- Decision: Document `runCommandWithSql` explicitly as a *thin wrapper* over
  `runCommandWithSqlEvents` (it passes `\_ appendResult -> afterAppend appendResult`, discarding the
  `[(co, RecordedEvent)]` first argument), so all three runners are accounted for.
  Rationale: the brief requires "every exported function"; the old tour showed only
  `runCommandWithSqlEvents`. The wrapper relationship is itself a teachable point (one primitive,
  three ergonomic surfaces).
  Date: 2026-06-02
- Decision: Link the read-side snapshot chapter at its **canonical renumbered slug**
  `/docs/keiro/walkthrough/read-side/02-snapshots-in-the-command-and-hydration-path`, not the stale
  `…/01-snapshots-in-the-command-path` this plan's body cites; and forward-link the
  SymTransducer/register model at `/docs/keiro/walkthrough/foundation/04-the-symtransducer-and-step`.
  Rationale: the read-side and foundation tours are being renumbered/authored in parallel under their
  own disjoint subdir owners; the central slug map for this run is authoritative over the plan's
  earlier transcription. The always-present `/docs/keiro/explanation/why-symtransducer-not-decider` is
  cited alongside the foundation link as the durable fallback.
  Date: 2026-06-02


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion. Compare the
result against the original purpose.

**Completion entry _(2026-06-02)_.** The command-cycle tour now runs `00`–`07`: eight files where the
old tour had five (four content chapters + start-here). The dense old `01-the-command-processor` was
split into three — *command types and errors* (`01`), *hydration* (`02`), *the command processor*
(`03`) — and two genuinely new chapters were added: *the typed handles* (`06`) and the up-front
command/error vocabulary (`01`). Every exported `Keiro.Command` binding (`CommandResult`,
`CommandError`, `RunCommandOptions`/`defaultRunCommandOptions`, all three runners) and the internals the
brief named (`hydrate`/`hydrateFull`, the `applyRecorded`/`applyEvent` fold, `finishReplay`,
`prepareCommandPlan`/`evaluateCommand`, `encodeEvents`/`assignEventIds`, `expectedVersion`,
`appendOnce`/`appendWithSqlOnce`, `writeSnapshotIfNeeded`, `retryOrFail`/`isRetryableConflict`,
`reconstructRecorded`, the telemetry seam, `noOpResult`/`appendedResult`), every `Keiro.Codec` function
and all six `CodecError` constructors, the four `EventStream`/`Stream` types, and the `Keiro.Router`
surface now each appear with a real signature and a verbatim excerpt. Result vs. purpose: the original
gap list — hydration machine, plan/hydration types, full error taxonomy, telemetry seam,
`assignEventIds`/`encodeEvents`, `runCommand`-vs-`runCommandWithSql`, the typed handles, the missing
`CodecError` constructors — is fully closed.

**Verification.** Self-checks passed without the build: depth checklist (Validation #6) green across the
eight chapters; source-name check (Validation #7) green against a `git show 3f5dc9c` corpus of all eight
quoted files (1848 lines); zero relative links; every opening fence language-tagged (per-file
`lang_opens == bare_closes`, and `total == opens + closes`). The `pnpm build` / `pnpm lint:links` gate
is owned and run centrally by the integration owner for this run, so it was not invoked here.

**Lessons.** (1) The keiro checkout had moved past the pin — always read quoted source via
`git show <pin>:<path>`, never the working tree. (2) The pinned Haddock said "Decide"; the prose rule
and the next upstream commit both say "Transduce" — quoting *focused* excerpts (signatures, bodies)
rather than module docs kept the divergence out of the docs entirely. (3) Cross-tour slugs for
parallel-authored tours must come from the central slug map, not a plan body written before the
renumber.

**Remaining / handoff.** None within this subdir. EP-19 (walkthrough finalization) owns the central
build/lint gate and the top-level `walkthrough/` hub + `meta.json`, both untouched here.


## Context and Orientation

Read this whole section before editing. It is written so a contributor with only this file and the
working tree can complete the work. You will edit and add MDX content files under one directory; you
will not write or compile Haskell. The Haskell appears only as *quoted snippets* inside the docs, and
every snippet must match the real source transcribed below.

### What you are building, and where

This repository (`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`) is a **fumadocs** documentation
site (fumadocs-ui + fumadocs-mdx) built on **TanStack Start as a static single-page app** (React +
MDX + TypeScript, bundled with **Vite**), built and served with **pnpm** on **Node 22**. `pnpm dev`
runs `vite dev`; `pnpm build` runs `vite build` and emits a static SPA under `.output/public`.
Content lives under `content/docs/`. Each directory has a `meta.json` whose `pages` array lists child
page slugs (and nested directory names) in sidebar order. A "page" is an `.mdx` file: YAML
frontmatter (`title`, `description`) followed by an MDX body.

A **code walkthrough** (or "tour") is an ordered set of MDX chapters that reads a real source module
top to bottom in prose, quoting verbatim excerpts and explaining *why* the code is shaped the way it
is. This tour lives in `content/docs/keiro/walkthrough/command-cycle/`. The MDX components you use
(`Callout`, `Cards`, `Card`, `Steps`, `Step`, `Tabs`, `Tab`, `TypeTable`, `Accordion`, `Accordions`,
`Mermaid`) are **registered globally** in `src/components/mdx.tsx` — so in page bodies you use them
**bare, with no `import` lines**, exactly as every existing keiro/kiroku page does.

The **code samples are Haskell** (the site itself is TypeScript; the subject, keiro, is a Haskell
library). The docs build does **not** compile Haskell — accuracy is therefore guaranteed only by
cross-checking each snippet against the pinned source named below. Treat snippet accuracy as an
acceptance criterion (see Validation).

### This tour's place in the larger effort

This is **EP-13** in the MasterPlan `docs/masterplans/2-keiro-framework-documentation-set.md`,
**Phase 4 (walkthrough deepening)**.

- **HARD DEP — EP-8** (`docs/plans/8-keiro-command-cycle-and-write-path-documentation.md`): EP-8 is
  **Complete**. It created the `walkthrough/command-cycle/` subdir with the five current chapters and
  its `meta.json`, added `command-cycle` to `walkthrough/meta.json`, and authored the
  command-cycle explanations and references this tour links to (`reference/command`, `reference/codec`,
  `reference/event-stream-and-stream`, `reference/router`, `explanation/the-command-cycle`,
  `explanation/codec-and-schema-evolution`, `explanation/why-symtransducer-not-decider`). Verify these
  exist in M0.
- **HARD DEP — EP-7**: provides the overview/getting-started spine, the jitsurei module map, and the
  authoring conventions (absolute cross-links; source-over-notes accuracy).
- **SOFT — EP-17** (foundation tour): owns the conceptual `SymTransducer` / register model. Where this
  tour needs "what `Keiki.step` is" or "what registers are," it links forward to
  `/docs/keiro/walkthrough/foundation/` (or, until that tour lands, to the existing
  `/docs/keiro/explanation/why-symtransducer-not-decider`). Soft means non-blocking: if a foundation
  chapter slug is unconfirmed at authoring time, link the existing explanation page and name the
  intended target in prose.
- **INTEGRATION — EP-19**: owns the shared `walkthrough/index.mdx` hub and the *top-level*
  `walkthrough/meta.json` ordering. **This plan must not touch either** beyond what already lists
  `command-cycle` (it is already present from EP-8; do not duplicate or reorder it).

### Hard-won house rules (apply to every page you write)

1. **Absolute doc links only.** Cross-page links use absolute doc paths
   (`/docs/keiro/reference/command`), never relative `./sibling` or `../section/page`. Relative MDX
   links resolve *wrong* in the static SPA and trip the prerender crawler (a recorded kiroku lesson:
   a `./01-…` link from a `00-start-here` page resolved to a nonexistent nested route and emitted
   `[unhandledRejection] Failed to fetch`). This applies to *intra-tour* chapter links too: write
   `/docs/keiro/walkthrough/command-cycle/02-hydration`, never `./02-hydration`.
2. **Every fenced code block carries a language tag.** Use ` ```haskell `, ` ```text `, ` ```mermaid `,
   ` ```json `, ` ```bash `. Never a bare ```` ``` ````.
3. **Snippet accuracy is an acceptance criterion.** Every Haskell type, field, and function name you
   quote must appear in the pinned source. The verified transcriptions are below; cross-check against
   the named files before declaring a snippet done. Quote *focused* excerpts (the clause that makes
   the point), not whole 80-line definitions — but keep them verbatim.
4. **No `import` lines for the MDX components.**
5. **Keep `meta.json` in sync with the files you ship.** A slug in `pages` with no file (or a file not
   in `pages`) produces a broken or missing sidebar entry, not a crash, so the build still exits 0 —
   catch it with the browser check.

### The source you must walk, transcribed (use these REAL names)

Source of truth on disk (read-only — do **not** edit it):
`/Users/shinzui/Keikaku/bokuno/keiro`, pinned commit `3f5dc9c`. The files this tour reads, by full
repo-relative path:

```text
keiro/src/Keiro/Command.hs          -- 657 lines: the three runners and ALL their internals
keiro-core/src/Keiro/Codec.hs       -- the encode/decode/migrate boundary
keiro-core/src/Keiro/EventStream.hs -- EventStream, SnapshotPolicy, StateCodec
keiro-core/src/Keiro/Stream.hs      -- the phantom-typed Stream handle
keiro/src/Keiro/Router.hs           -- stateless content-based dispatch
```

jitsurei anchors (runnable; `just jitsurei-fulfillment`, `just jitsurei-paging`, both depend on
`just jitsurei-migrate`):

```text
jitsurei/src/Jitsurei/Domain.hs      -- OrderCommand/OrderEvent/OrderState
jitsurei/src/Jitsurei/OrderStream.hs -- orderEventStream, snapshotOrderEventStream, orderCodec, upcastOrderPlacedV1, orderStream
jitsurei/src/Jitsurei/Paging.hs      -- pagingRouter (the content-based router worked example)
```

What follows is the complete public-and-internal surface, transcribed verbatim from the pinned tree.
Treat it as your API cheat-sheet; the chapter outlines in Plan of Work say which bindings go where.

**(A) `Keiro.Command` (`keiro/src/Keiro/Command.hs`).** The module exports exactly:
`CommandResult(..)`, `CommandError(..)`, `RunCommandOptions(..)`, `defaultRunCommandOptions`,
`runCommand`, `runCommandWithSql`, `runCommandWithSqlEvents`. Everything else (`hydrate`,
`hydrateFull`, `prepareCommandPlan`, `evaluateCommand`, `encodeEvents`, `assignEventIds`,
`expectedVersion`, `writeSnapshotIfNeeded`, `retryOrFail`, `isRetryableConflict`,
`reconstructRecorded`, `recordCommandOutcome`, `commandErrorClass`, `resolvedStreamName`,
`noOpResult`, `appendedResult`, `mapLeft`, and the types `Hydrated`, `Replay`, `CommandPlan`) is a
module-internal helper that the walkthrough quotes to explain the runners.

Result and error types:

```haskell
-- The outcome of a successfully handled command. eventsAppended is 0 for a no-op.
data CommandResult target = CommandResult
  { target :: !(Stream target)
  , streamVersion :: !StreamVersion
  , globalPosition :: !(Maybe GlobalPosition)
  , eventsAppended :: !Int
  }
  deriving stock (Generic, Eq, Show)

-- Why a command did not complete.
data CommandError
  = HydrationDecodeFailed !CodecError    -- a stored event could not be decoded while rehydrating
  | HydrationReplayFailed !StreamVersion -- replay stalled: the machine rejected a committed event
  | CommandRejected                      -- the transducer rejected the command in the hydrated state
  | EncodeFailed !CodecError             -- an emitted event could not be encoded for append
  | StoreFailed !StoreError              -- the store rejected the append (non-retryable)
  | RetryExhausted !Int !StoreError      -- optimistic-concurrency retries ran out (limit, last error)
  deriving stock (Generic, Eq, Show)
```

Options record and defaults (six fields):

```haskell
data RunCommandOptions = RunCommandOptions
  { retryLimit :: !Int            -- rehydrate-and-replay attempts after a conflict
  , pageSize :: !Int32            -- read-batch size during hydration
  , eventIds :: ![EventId]        -- caller-supplied ids assigned to emitted events, in order
  , beforeAppend :: !(IO ())      -- hook run immediately before each append attempt (test seam)
  , tracer :: !(Maybe Tracer)     -- optional OpenTelemetry tracer; Nothing emits no spans
  , metadata :: !(Maybe Value)    -- optional JSON merged into every event's metadata
  }
  deriving stock (Generic)

-- 3 retries, 256-event read pages, no caller ids, no-op hook, no tracer, no metadata.
defaultRunCommandOptions :: RunCommandOptions
defaultRunCommandOptions = RunCommandOptions
  { retryLimit = 3, pageSize = 256, eventIds = []
  , beforeAppend = pure (), tracer = Nothing, metadata = Nothing }
```

Internal threading types:

```haskell
data Hydrated rs s = Hydrated
  { state :: !s
  , registers :: !(RegFile rs)
  , streamVersion :: !StreamVersion
  , globalPosition :: !(Maybe GlobalPosition)
  }

data Replay rs s co = Replay
  { replayHydrated :: !(Hydrated rs s)
  , replayState :: !(Keiki.InFlight s co)   -- keiki's settled-or-in-flight replay state
  , lastObservedStreamVersion :: !StreamVersion
  }

data CommandPlan target rs s co
  = CommandNoOp !(CommandResult target)              -- transducer emitted [] → append nothing
  | CommandAppend !(Hydrated rs s) ![co] ![EventData] -- transducer emitted events → encode + append
```

The three runner signatures (the public surface):

```haskell
runCommand ::
  forall phi rs s ci co es.
  (HasCallStack, IOE :> es, Store :> es, Error StoreError :> es, BoolAlg phi (RegFile rs, ci), Eq co) =>
  RunCommandOptions ->
  EventStream phi rs s ci co ->
  Stream (EventStream phi rs s ci co) ->
  ci ->
  Eff es (Either CommandError (CommandResult (EventStream phi rs s ci co)))

runCommandWithSql ::
  forall phi rs s ci co a es.
  (HasCallStack, IOE :> es, Store :> es, Error StoreError :> es, BoolAlg phi (RegFile rs, ci), Eq co) =>
  RunCommandOptions ->
  EventStream phi rs s ci co ->
  Stream (EventStream phi rs s ci co) ->
  ci ->
  (AppendResult -> Tx.Transaction a) ->
  Eff es (Either CommandError (CommandResult (EventStream phi rs s ci co), Maybe a))

runCommandWithSqlEvents ::
  forall phi rs s ci co a es.
  (HasCallStack, IOE :> es, Store :> es, Error StoreError :> es, BoolAlg phi (RegFile rs, ci), Eq co) =>
  RunCommandOptions ->
  EventStream phi rs s ci co ->
  Stream (EventStream phi rs s ci co) ->
  ci ->
  ([(co, RecordedEvent)] -> AppendResult -> Tx.Transaction a) ->
  Eff es (Either CommandError (CommandResult (EventStream phi rs s ci co), Maybe a))
```

`runCommandWithSql` is literally a wrapper:

```haskell
runCommandWithSql options eventStream targetStream command afterAppend =
  runCommandWithSqlEvents options eventStream targetStream command
    (\_ appendResult -> afterAppend appendResult)
```

`runCommand`'s body (the append-only runner):

```haskell
runCommand options eventStream targetStream command =
  withCommandSpan (options ^. #tracer) (resolvedStreamName eventStream targetStream) Nothing $ \mSpan -> do
    result <- attempt (options ^. #retryLimit)
    recordCommandOutcome mSpan (^. #eventsAppended) result
    pure result
  where
    attempt remaining = do
      hydrated <- hydrate options eventStream targetStream
      either (pure . Left) (runPlan remaining) hydrated

    runPlan remaining current =
      case prepareCommandPlan options eventStream targetStream current command of
        Left err -> pure (Left err)
        Right (CommandNoOp result) -> pure (Right result)
        Right (CommandAppend current' events encoded) ->
          appendOnce remaining current' events encoded

    appendOnce remaining current events encoded = do
      liftIO (options ^. #beforeAppend)
      appended <- tryError @StoreError $
        appendToStream
          ((eventStream ^. #resolveStreamName) targetStream)
          (expectedVersion (current ^. #streamVersion))
          encoded
      case appended of
        Right appendResult -> do
          writeSnapshotIfNeeded eventStream current events appendResult
          pure (Right (appendedResult targetStream appendResult (Prelude.length encoded)))
        Left (_, storeError) ->
          retryOrFail options attempt remaining storeError
```

`hydrate` (the snapshot-seed front door) and `hydrateFull` (full replay). `hydrate` reads a snapshot
seed when the stream has a `stateCodec`, replays forward from it, and **silently falls back to
`hydrateFull` on any replay error**:

```haskell
hydrate options eventStream targetStream =
  snapshotSeed >>= \case
    Nothing -> hydrateFull options eventStream targetStream
    Just seed -> do
      replayed <- replayFrom seed
      case replayed of
        Left _ -> hydrateFull options eventStream targetStream   -- silent fallback
        Right hydrated -> pure (Right hydrated)
  where
    snapshotSeed =
      case eventStream ^. #stateCodec of
        Nothing -> pure Nothing
        Just codec ->
          hydrateWithSnapshot ((eventStream ^. #resolveStreamName) targetStream) codec
    -- replayFrom seeds a Replay from the snapshot's (state, registers, streamVersion)
    -- and folds the events after it; finishReplay rejects a stream that ends InFlight.
```

`hydrateFull` folds the whole stream from `StreamVersion 0`:

```haskell
hydrateFull options eventStream targetStream =
  finishReplay
    <$> Streamly.fold
      (Fold.foldlM' applyRecorded (pure (Right initialReplay)))
      (readStreamForwardStream ((eventStream ^. #resolveStreamName) targetStream) (StreamVersion 0) (options ^. #pageSize))
  where
    initialReplay = Replay
      { replayHydrated = Hydrated
          { state = eventStream ^. #initialState
          , registers = eventStream ^. #initialRegisters
          , streamVersion = StreamVersion 0
          , globalPosition = Nothing }
      , replayState = Keiki.Settled (eventStream ^. #initialState)
      , lastObservedStreamVersion = StreamVersion 0 }

    finishReplay = \case
      Left err -> Left err
      Right replayed ->
        case replayState replayed of
          Keiki.Settled{} -> Right (replayHydrated replayed)
          Keiki.InFlight{} -> Left (HydrationReplayFailed (lastObservedStreamVersion replayed))
```

The per-event step of the replay fold (the same shape in `hydrate`'s `replayFrom` and in
`hydrateFull`): decode the recorded event, then step the transducer with
`Keiki.applyEventStreaming`. A decode failure is `HydrationDecodeFailed`; a transducer rejection is
`HydrationReplayFailed (recorded ^. #streamVersion)`:

```haskell
    applyRecorded (Left err) _ = pure (Left err)
    applyRecorded (Right current) recorded =
      case decodeRecorded (eventStream ^. #eventCodec) recorded of
        Left err -> pure (Left (HydrationDecodeFailed err))
        Right event -> pure (applyEvent current recorded event)

    applyEvent current recorded event =
      case Keiki.applyEventStreaming
        (eventStream ^. #transducer)
        (replayState current)
        (registers (replayHydrated current))
        event of
        Nothing -> Left (HydrationReplayFailed (recorded ^. #streamVersion))
        Just (nextReplayState, nextRegisters) ->
          Right current { replayHydrated = updateHydrated nextReplayState nextRegisters
                        , replayState = nextReplayState
                        , lastObservedStreamVersion = recorded ^. #streamVersion }
```

`prepareCommandPlan` runs Transduce + encode and chooses no-op vs. append:

```haskell
prepareCommandPlan options eventStream targetStream current command =
  case evaluateCommand eventStream current command of
    Left err -> Left err
    Right events -> toPlan events
  where
    toPlan [] = Right (CommandNoOp (noOpResult targetStream current))
    toPlan events =
      CommandAppend current events
        . assignEventIds (options ^. #eventIds)
        <$> encodeEvents (eventStream ^. #eventCodec) (options ^. #metadata) events

evaluateCommand eventStream current command =
  case Keiki.step (eventStream ^. #transducer) (state current, registers current) command of
    Nothing -> Left CommandRejected
    Just (_, _, events) -> Right events

encodeEvents :: Codec co -> Maybe Value -> [co] -> Either CommandError [EventData]
encodeEvents codec md =
  Prelude.mapM (mapLeft EncodeFailed . encodeForAppendWithMetadata codec md)

-- Caller ids are assigned POSITIONALLY (zip-style). [] is identity.
assignEventIds :: [EventId] -> [EventData] -> [EventData]
assignEventIds [] events = events
assignEventIds _ [] = []
assignEventIds (supplied : suppliedRest) (event : eventRest) =
  (event & #eventId .~ Just supplied) : assignEventIds suppliedRest eventRest

expectedVersion :: StreamVersion -> ExpectedVersion
expectedVersion (StreamVersion 0) = NoStream
expectedVersion version = ExactVersion version
```

The snapshot write (a *call site* only; mechanics belong to the read side):

```haskell
writeSnapshotIfNeeded eventStream current events appendResult =
  case eventStream ^. #stateCodec of
    Nothing -> pure ()
    Just codec ->
      case Keiki.applyEvents (eventStream ^. #transducer) (state current, registers current) events of
        Nothing -> pure ()
        Just finalState -> do
          let finalVersion = appendResult ^. #streamVersion
              terminal = Keiki.isFinal (eventStream ^. #transducer) (Prelude.fst finalState)
          when (shouldSnapshot (eventStream ^. #snapshotPolicy) terminal finalState finalVersion) $
            writeSnapshot (appendResult ^. #streamId) finalVersion codec finalState
```

The retry loop and its predicate:

```haskell
retryOrFail options retry remaining storeError
  | isRetryableConflict storeError, remaining > 0 = retry (remaining - 1)
  | isRetryableConflict storeError = pure (Left (RetryExhausted (options ^. #retryLimit) storeError))
  | otherwise = pure (Left (StoreFailed storeError))

isRetryableConflict = \case
  WrongExpectedVersion{} -> True
  StreamAlreadyExists{} -> True   -- a lost new-stream race is RETRIED, not surfaced
  _ -> False
```

The transactional runner's per-attempt body, the conflict path, and `reconstructRecorded`:

```haskell
    appendWithSqlOnce remaining current events encoded = do
      liftIO (options ^. #beforeAppend)
      prepared <- prepareEventsIO encoded
      now <- liftIO getCurrentTime
      let streamName = (eventStream ^. #resolveStreamName) targetStream
          expected = expectedVersion (current ^. #streamVersion)
          body = do
            appended <- appendToStreamTx streamName expected prepared now
            case appended of
              Left conflict ->
                Tx.condemn $> Left (appendConflictToStoreError conflict)   -- roll the whole tx back
              Right appendResult -> do
                let recordeds = reconstructRecorded appendResult now prepared
                userValue <- afterAppend (Prelude.zip events recordeds) appendResult
                pure (Right (appendResult, userValue))
      outcome <- tryError @StoreError (runTransaction body)
      ...   -- on success: writeSnapshotIfNeeded then appendedResult; on conflict: retryOrFail

-- Event i (0-based) of a count-event batch gets (last - count + 1 + i) for BOTH
-- stream version and global position; derived from kiroku's WITH ORDINALITY numbering.
reconstructRecorded appendResult now prepared =
  Prelude.zipWith mk [0 ..] prepared
  where
    count = Prelude.length prepared
    StreamVersion lastSv = appendResult ^. #streamVersion
    GlobalPosition lastGp = appendResult ^. #globalPosition
    firstSv = lastSv - Prelude.fromIntegral count + 1
    firstGp = lastGp - Prelude.fromIntegral count + 1
    mk i prepared' = RecordedEvent { ..., streamVersion = StreamVersion (firstSv + i)
                                        , globalPosition = GlobalPosition (firstGp + i), ... }
```

The telemetry seam (so the tour accounts for the span-wrapping bookends of every runner):

```haskell
-- runCommand/runCommandWithSqlEvents wrap the attempt loop in withCommandSpan and call
-- recordCommandOutcome afterwards. recordCommandOutcome is a no-op without a span.
recordCommandOutcome Nothing _ _ = pure ()
recordCommandOutcome (Just sp) eventsOf result = do
  addAttribute sp (unkey db_system_name) ("postgresql" :: Text)
  case result of
    Right v  -> addAttribute sp (unkey keiro_events_appended) (Prelude.fromIntegral (eventsOf v) :: Int64)
    Left err -> do
      addAttribute sp (unkey error_type) (commandErrorClass err)
      setStatus sp (Error (Text.pack (show err)))

-- Low-cardinality error.type classifier on the command span.
commandErrorClass = \case
  HydrationDecodeFailed{} -> "hydration_decode_failed"
  HydrationReplayFailed{} -> "hydration_replay_failed"
  CommandRejected -> "command_rejected"
  EncodeFailed{} -> "encode_failed"
  StoreFailed{} -> "store_failed"
  RetryExhausted{} -> "retry_exhausted"
```

The two result constructors (`runPlan`'s and `appendOnce`'s exit points):

```haskell
noOpResult targetStream current = CommandResult
  { target = targetStream, streamVersion = current ^. #streamVersion
  , globalPosition = current ^. #globalPosition, eventsAppended = 0 }

appendedResult targetStream appendResult count = CommandResult
  { target = targetStream, streamVersion = appendResult ^. #streamVersion
  , globalPosition = Just (appendResult ^. #globalPosition), eventsAppended = count }
```

**(B) `Keiro.Codec` (`keiro-core/src/Keiro/Codec.hs`).** Exports `Codec(..)`, `Upcaster`,
`CodecError(..)`, `encodeForAppend`, `encodeForAppendWithMetadata`, `decodeRecorded`, `decodeRaw`,
`migrateToCurrent`, `extractSchemaVersion`, `metadataFor`.

```haskell
type Upcaster = (Int, Value -> Either Text Value)  -- (source version, pure migration)

data Codec e = Codec
  { eventTypes :: !(NonEmpty Text)          -- the complete event-type allow-list this codec owns
  , eventType :: !(e -> Text)               -- project a domain value to its wire tag
  , schemaVersion :: !Int                   -- current payload version; must be >= 1
  , encode :: !(e -> Value)                 -- current-version JSON serialization
  , decode :: !(Value -> Either Text e)     -- only ever sees payloads migrated to schemaVersion
  , upcasters :: ![Upcaster]                -- migrations keyed by source version
  }
  deriving stock (Generic)

data CodecError
  = UnknownEventType !EventType ![Text]   -- tag not in eventTypes (offending tag, allowed set)
  | InvalidSchemaVersion !Int             -- schemaVersion is not >= 1
  | UnknownVersion !Int                   -- stored version < 1, or beyond the chain
  | UpcasterError !Int !Text              -- an upcaster rejected its input (source version, msg)
  | DecodeFailed !Text                    -- the current decode rejected a migrated payload
  | GapInUpcasterChain !Int !Int          -- reached version n, next rung starts later
  deriving stock (Generic, Eq, Show)
```

Write side — the schema-version stamp always wins:

```haskell
encodeForAppend codec value = encodeForAppendWithMetadata codec Nothing value

encodeForAppendWithMetadata codec metadata value = do
  unless (codec ^. #schemaVersion > 0) $ Left (InvalidSchemaVersion (codec ^. #schemaVersion))
  let selectedType = codec ^. #eventType $ value
  unless (selectedType `List.elem` NonEmpty.toList (codec ^. #eventTypes)) $
    Left (UnknownEventType (EventType selectedType) (NonEmpty.toList (codec ^. #eventTypes)))
  pure EventData { eventId = Nothing, eventType = EventType selectedType
                 , payload = codec ^. #encode $ value
                 , metadata = Just (metadataFor (codec ^. #schemaVersion) metadata)
                 , causationId = Nothing, correlationId = Nothing }

metadataFor version existing =
  Object $ baseObject existing & KeyMap.insert schemaVersionKey (Number (fromIntegral version))
  where baseObject (Just (Object object)) = object
        baseObject _ = KeyMap.empty
```

Read side — fatal-on-unknown, then migrate, then decode:

```haskell
decodeRecorded codec recorded = do
  unless (isKnownEventType (recorded ^. #eventType) codec) $
    Left (UnknownEventType (recorded ^. #eventType) (NonEmpty.toList (codec ^. #eventTypes)))
  decodeRaw codec (extractSchemaVersion recorded) (recorded ^. #payload)

decodeRaw codec version payload = do
  migrated <- migrateToCurrent codec version payload
  case codec ^. #decode $ migrated of
    Right value -> Right value
    Left message -> Left (DecodeFailed message)

migrateToCurrent codec sourceVersion payload
  | sourceVersion >= codec ^. #schemaVersion = Right payload
  | sourceVersion < 1 = Left (UnknownVersion sourceVersion)
  | otherwise = go sourceVersion payload
  where
    go version current
      | version >= codec ^. #schemaVersion = Right current
      | otherwise = case Prelude.lookup version (codec ^. #upcasters) of
          Nothing -> case nextChainStart version of
            Just nextVersion -> Left (GapInUpcasterChain version nextVersion)
            Nothing -> Left (UnknownVersion version)
          Just upcast -> case upcast current of
            Left message -> Left (UpcasterError version message)
            Right next -> go (version + 1) next

-- Defaults to 1 when metadata is absent, not an object, lacks the key, or is non-integer.
extractSchemaVersion recorded =
  fromMaybe 1 $ do
    Object object <- recorded ^. #metadata
    Number number <- KeyMap.lookup schemaVersionKey object
    Scientific.toBoundedInteger number
```

The jitsurei v1→v2 example (`jitsurei/src/Jitsurei/OrderStream.hs`): `orderCodec :: Codec OrderEvent`
has `schemaVersion = 2`, `upcasters = [(1, upcastOrderPlacedV1)]`, and
`eventTypes = "OrderPlaced" :| ["PaymentApproved","OrderPacked","OrderShipped","OrderCancelled"]`.
The upcaster rewrites a v1 `OrderPlaced` (which used `"qty"` and an optional `"sku"`) into the v2
shape (required `"quantity"`, `"sku"` defaulted to `"UNKNOWN"`):

```haskell
upcastOrderPlacedV1 value =
  case parseEither parser value of
    Right migrated -> Right migrated
    Left message -> Left (Text.pack message)
  where
    parser = withObject "OrderPlacedV1" $ \objectValue -> do
      orderId  <- objectValue .: "orderId"
      sku      <- objectValue .:? "sku"
      quantity <- objectValue .: "qty"
      pure (object [ "kind" .= ("OrderPlaced" :: Text), "orderId" .= (orderId :: Text)
                   , "sku" .= maybe "UNKNOWN" id (sku :: Maybe Text), "quantity" .= (quantity :: Int) ])
```

The contrasting `pageCodec` (`jitsurei/src/Jitsurei/Paging.hs`) has `schemaVersion = 1`,
`upcasters = []` — a codec with no migration history.

**(C) `Keiro.EventStream` (`keiro-core/src/Keiro/EventStream.hs`).** Exports `EventStream(..)`,
`SnapshotPolicy(..)`, `StateCodec(..)`:

```haskell
data EventStream phi rs s ci co = EventStream
  { transducer :: !(SymTransducer phi rs s ci co)   -- the pure keiki decision machine
  , initialState :: !s                              -- starting control state (empty-stream hydrate)
  , initialRegisters :: !(RegFile rs)               -- starting register file
  , eventCodec :: !(Codec co)                       -- serialize/migrate the emitted events
  , resolveStreamName :: !(Stream (EventStream phi rs s ci co) -> StreamName)  -- typed handle → physical name
  , snapshotPolicy :: !(SnapshotPolicy (s, RegFile rs))      -- when to snapshot the (state, registers) pair
  , stateCodec :: !(Maybe (StateCodec (s, RegFile rs)))      -- how to serialize it; Nothing disables snapshotting
  }
  deriving stock (Generic)

data SnapshotPolicy state
  = Never                                  -- never snapshot; always replay the full log
  | Every !Int                             -- snapshot when the version is a positive multiple of n
  | OnTerminal                             -- snapshot only at a final state
  | Custom !(state -> StreamVersion -> Bool)
  deriving stock (Generic)

data StateCodec state = StateCodec
  { stateCodecVersion :: !Int   -- bumped when the snapshot encoding changes incompatibly
  , shapeHash :: !Text          -- digest of the folded-state shape; guards snapshot reuse
  , encode :: !(state -> Value)
  , decode :: !(Value -> Either Text state)
  }
  deriving stock (Generic)
```

The jitsurei order stream shows both ends: `orderEventStream` uses `snapshotPolicy = Never`,
`stateCodec = Nothing` (no snapshotting); `snapshotOrderEventStream` overrides them to
`snapshotPolicy = Every 2`, `stateCodec = Just (defaultStateCodec @OrderRegs @OrderState 1)`. Both
set `resolveStreamName = Stream.streamName`, `initialState = NotStarted`, `initialRegisters = RNil`.
The runtime snapshot mechanics (`writeSnapshot`, `hydrateWithSnapshot`, `defaultStateCodec`,
`shouldSnapshot`, the `keiro_snapshots` table) are owned by the read side
(`/docs/keiro/reference/snapshot`) — link, do not re-derive.

**(D) `Keiro.Stream` (`keiro-core/src/Keiro/Stream.hs`).** Exports `Stream(..)`, `stream`,
`streamName`, `mapStreamName`:

```haskell
newtype Stream a = Stream { name :: StreamName }    -- phantom-typed handle
  deriving stock (Generic, Eq, Ord, Show)

stream :: Text -> Stream a               -- stream name = Stream { name = StreamName name }
streamName :: Stream a -> StreamName     -- recover the underlying StreamName
mapStreamName :: (StreamName -> StreamName) -> Stream a -> Stream a  -- transform name, keep the tag
```

jitsurei: `orderStream orderId = stream ("order-" <> orderIdText orderId)`. The phantom `a` lets the
framework demand a `Stream OrderEventStream` rather than a bare `StreamName`. (The design notes' old
name for this type was `AggregateId a`; the shipped type is `Stream a` — trust the source.)

**(E) `Keiro.Router` (`keiro/src/Keiro/Router.hs`).** Exports `Router(..)`, `RouterResult(..)`,
`runRouterOnce`, `runRouterWorker`:

```haskell
data Router input targetPhi targetRs targetState targetCi targetCo es = Router
  { name :: !Text                                   -- part of every command's deterministic id
  , key :: !(input -> Text)                         -- correlation string for the source event
  , resolve :: !(input -> Eff es [PMCommand targetCi])  -- effectful target set (e.g. runQuery)
  , targetEventStream :: !(EventStream targetPhi targetRs targetState targetCi targetCo)
  , targetProjections :: !(Stream targetCi -> [InlineProjection targetCo])
  }
  deriving stock (Generic)

newtype RouterResult target = RouterResult { commandResults :: [PMCommandResult target] }
  deriving stock (Generic, Eq, Show)
```

`runRouterOnce` resolves the targets and dispatches one command per target with a deterministic id:

```haskell
runRouterOnce options router sourceEvent input = do
  let correlationId = (router ^. #key) input
  commands <- (router ^. #resolve) input
  results <- traverse
    (\(emitIndex, command) -> dispatchCommand correlationId (sourceEvent ^. #eventId) emitIndex command)
    (zip [0 ..] commands)
  pure (RouterResult results)
  where
    dispatchCommand correlationId sourceEventId emitIndex command = do
      let commandId = deterministicCommandId (router ^. #name) correlationId sourceEventId emitIndex
          targetOptions = options & #eventIds .~ [commandId]
          targetStream = retarget (command ^. #target)
          targetStreamName = (targetEventStream ^. #resolveStreamName) targetStream
      commandAlreadyProcessed <- eventAlreadyIn options targetStreamName commandId
      if commandAlreadyProcessed
        then pure (PMCommandDuplicate commandId)
        else do
          outcome <- runCommandWithProjections targetOptions targetEventStream targetStream
                       (command ^. #command) ((router ^. #targetProjections) (command ^. #target))
          pure $ case outcome of
            Right result -> PMCommandAppended result
            Left (StoreFailed (DuplicateEvent (Just duplicateId))) | duplicateId == commandId -> PMCommandDuplicate commandId
            Left (StoreFailed (DuplicateEvent Nothing)) -> PMCommandDuplicate commandId
            Left err -> PMCommandFailed err
```

`runRouterWorker` drains a shibuya `Adapter` and finalizes each message's `AckHandle`:

```haskell
runRouterWorker options router Adapter{source = adapterSource} decodeMessage =
  Streamly.fold Fold.drain $ Streamly.mapM handleIngested adapterSource
  where
    handleIngested Ingested{envelope = Envelope{payload = message}, ack = AckHandle finalizeAck} = do
      decision <- case decodeMessage message of
        Nothing -> pure (AckHalt (HaltFatal "router worker could not decode message"))
        Just (recorded, input) -> do
          RouterResult results <- runRouterOnce options router recorded input
          pure (ackDecisionFor results)
      finalizeAck decision
      pure decision

    ackDecisionFor results =
      case [err | PMCommandFailed err <- results] of
        (err : _) -> AckHalt (HaltFatal (Text.pack (show err)))
        [] -> AckOk
```

`PMCommand`, `PMCommandResult`, `deterministicCommandId`, `eventAlreadyIn` come from
`Keiro.ProcessManager` (`/docs/keiro/reference/process-manager`); `InlineProjection` and
`runCommandWithProjections` from `Keiro.Projection` (`/docs/keiro/reference/projection`); the shibuya
`Adapter`/`AckHandle`/`AckDecision` types from the shibuya layer. Link to those references; do not
re-document them. The jitsurei anchor is `pagingRouter` (`jitsurei/src/Jitsurei/Paging.hs`): for each
`IncidentRaisedData` it `runQuery`s `serviceOncallReadModel` and dispatches one `SendPage` per
responder, with `targetProjections = const []`.

### The current tour (what you are replacing)

`content/docs/keiro/walkthrough/command-cycle/` currently holds five files + `meta.json`:

```text
00-start-here.mdx                    (48 lines)  -- overview mermaid + 4-card chapter list
01-the-command-processor.mdx         (116 lines) -- runCommand/runPlan/evaluateCommand/appendOnce/retryOrFail
02-the-transactional-write-path.mdx  (76 lines)  -- runCommandWithSqlEvents/Tx.condemn/reconstructRecorded
03-the-codec-on-the-boundary.mdx     (61 lines)  -- metadataFor/decodeRecorded
04-the-router.mdx                    (75 lines)  -- dispatchCommand/runRouterWorker
meta.json                                        -- pages: 00..04
```

These are accurate as far as they go (every quoted excerpt is verbatim) but they omit the hydration
machine, the command/plan types, the full error taxonomy, the telemetry seam, `assignEventIds` /
`encodeEvents`, `runCommand` vs. `runCommandWithSql`, the typed handles, and several `CodecError`
constructors. The deepened tour keeps the good prose, redistributes it across more chapters, and
fills the gaps.


## Plan of Work

The work is ten milestones. M0 verifies preconditions. M1–M7 author or rewrite one chapter each and
are independently verifiable by building the site and viewing the chapter. M8 updates the start-here
page and `meta.json`. M9 runs the full acceptance gate. The end-state file set under
`content/docs/keiro/walkthrough/command-cycle/`:

```text
00-start-here.mdx                       (updated)
01-command-types-and-errors.mdx         (new)
02-hydration.mdx                        (new)
03-the-command-processor.mdx            (rewrite of old 01)
04-the-transactional-write-path.mdx     (rewrite of old 02)
05-the-codec-on-the-boundary.mdx        (rewrite of old 03)
06-the-typed-handles.mdx                (new)
07-the-router.mdx                       (rewrite of old 04)
meta.json                               (rewritten pages array)
```

Implement by `git mv`-ing the three rewritten files to their new numbers first (preserves history),
then editing content; create the three new files; update `00` and `meta.json` last. Each chapter
follows the brief's shape: **introduce the types it touches, then each function with its real
signature and a focused excerpt, then the edge cases**, in prose-first voice matching plan #8 and the
existing chapters. Every chapter opens by naming its source file and linking the previous chapter
(absolute path), and closes with a "Next:" link to the following chapter (absolute path).

### M0 — Preconditions

Confirm EP-8 is Complete and the cross-link targets exist. At the end you can run `pnpm build` on the
existing tree with zero errors. Acceptance: the build succeeds before you change any chapter; the
five current chapters and `meta.json` exist; `command-cycle` is in `walkthrough/meta.json`; and the
link targets `reference/command`, `reference/codec`, `reference/event-stream-and-stream`,
`reference/router`, `reference/snapshot`, `reference/process-manager`, `reference/projection`, the
three `explanation/*` command-cycle pages, and the read-side walkthrough chapters all resolve.

### M1 — `01-command-types-and-errors.mdx` (new, title "01 — Command types and errors")

Walks the *vocabulary* every later chapter uses. Sections, in order:

- **`CommandResult`** — quote the record; explain `eventsAppended = 0` means no-op; note
  `globalPosition` is `Maybe` because a no-op carries the hydrated position, which may be `Nothing` on
  an empty stream. Use a `<TypeTable>` for the four fields.
- **`CommandError`** — quote all six constructors; group them by phase (`HydrationDecodeFailed` /
  `HydrationReplayFailed` from Hydrate; `CommandRejected` from Transduce; `EncodeFailed` /
  `StoreFailed` / `RetryExhausted` from Append). A `<Callout type="warn">` draws the three
  caller-visible outcomes: rejection (`Left CommandRejected`), no-op (`Right CommandResult` with
  `eventsAppended = 0`), store failure (`Left (StoreFailed …)` / `Left (RetryExhausted …)`).
- **`RunCommandOptions` + `defaultRunCommandOptions`** — a `<TypeTable>` for the six fields with the
  defaults; one sentence each on `beforeAppend` (a test seam for injecting concurrent writes) and
  `metadata` (merged into every event's metadata; the codec's `schemaVersion` key always wins —
  forward-link to chapter 05).
- **Internal threading types** — quote `Hydrated`, `Replay` (note `replayState :: Keiki.InFlight s co`
  is keiki's settled-or-in-flight type, forward-link to chapter 02), and `CommandPlan` (`CommandNoOp`
  vs. `CommandAppend`). Explain these never escape the module — they are how the runner threads
  `(state, registers, version)` through hydrate → plan → append.

Cross-links: `/docs/keiro/reference/command` (the reference for the public surface),
`/docs/keiro/walkthrough/command-cycle/02-hydration` (next). Opens linking
`/docs/keiro/walkthrough/command-cycle/00-start-here`.

### M2 — `02-hydration.mdx` (new, title "02 — Hydration")

Walks the rebuild-state-from-events machine the old tour skipped. Sections:

- **The two doors: `hydrate` and `hydrateFull`** — quote `hydrate`; explain `snapshotSeed` returns
  `Nothing` when `stateCodec = Nothing` (so a stream without a state codec always takes `hydrateFull`),
  and that on a seed it `replayFrom`s the snapshot then folds the later events. Emphasise the **silent
  fallback**: any `Left` from `replayFrom` drops to `hydrateFull` (a stale or shape-changed snapshot
  never wedges hydration). Link the snapshot read mechanics to `/docs/keiro/reference/snapshot` and
  the read-side chapter `/docs/keiro/walkthrough/read-side/01-snapshots-in-the-command-path`.
- **The replay fold** — quote `hydrateFull`'s `Streamly.fold` over
  `readStreamForwardStream … (StreamVersion 0) (pageSize)` and the `initialReplay` seed. Quote
  `applyRecorded` / `applyEvent`: decode with `decodeRecorded` (a decode error is
  `HydrationDecodeFailed`), then step with `Keiki.applyEventStreaming` (a `Nothing` is
  `HydrationReplayFailed (recorded ^. #streamVersion)`). Explain the cheap, page-by-page streaming
  read (`pageSize` batches) and that registers are threaded even across `InFlight` steps.
- **`Settled` vs. `InFlight` — the finish rule** — quote `finishReplay`. Define the terms: keiki's
  replay state is `Settled s` (the machine has come to rest in a control state) or `InFlight` (mid
  ε-walk, between consuming events). A stream that *ends* `InFlight` is corrupt — the log stopped
  partway through a multi-event transition — so `finishReplay` returns
  `HydrationReplayFailed (lastObservedStreamVersion …)`. This is a genuinely subtle invariant a
  contributor needs; spend a paragraph on it. Forward-link the conceptual `SymTransducer`/`step` model
  to `/docs/keiro/explanation/why-symtransducer-not-decider` (and, once it exists,
  `/docs/keiro/walkthrough/foundation/`).

Closes: "Next: 03 — The command processor". A small `mermaid` of the replay fold (read page → decode →
step → settled?) is optional but encouraged.

### M3 — `03-the-command-processor.mdx` (rewrite of old `01`, title "03 — The command processor")

Keep the old chapter's good `runCommand`/`runPlan`/`evaluateCommand`/`appendOnce`/`retryOrFail` prose,
but now that hydration lives in chapter 02, deepen the *post-hydrate* path and add the gaps. Sections:

- **`runCommand`: span, attempt loop, outcome** — quote the `withCommandSpan` body and `attempt`.
  Introduce the telemetry bookends here (don't bury them): `withCommandSpan` opens an optional span
  (`Nothing` tracer → no span), and `recordCommandOutcome` stamps `db.system.name`,
  `keiro.events.appended`, or (on failure) `error.type` via `commandErrorClass` + span status `Error`.
  Quote `recordCommandOutcome` and `commandErrorClass`. Note that telemetry is *cross-cutting*; the
  operations tour (`/docs/keiro/walkthrough/operations/`, EP-18) and `/docs/keiro/reference/telemetry`
  own the full span story — link, don't expand.
- **`runPlan` → `prepareCommandPlan`: Transduce, then encode** — quote `prepareCommandPlan`,
  `evaluateCommand`, `encodeEvents`, `assignEventIds`. Walk the no-op-vs-rejected boundary precisely:
  a rejection is a `Left CommandRejected` *out of `evaluateCommand`*, while a no-op is a *successful*
  `Right (CommandNoOp …)` from `toPlan []`. Explain `encodeEvents` maps each event through
  `encodeForAppendWithMetadata` (lifting a `CodecError` to `EncodeFailed`; forward-link chapter 05),
  and that `assignEventIds` assigns caller ids **positionally** (zip-style; `[]` is identity) — the
  basis of idempotent appends (link `/docs/keiro/how-to/make-commands-idempotent`).
- **`appendOnce`: optimistic append, then maybe a snapshot** — quote `appendOnce` and
  `expectedVersion`. Explain `tryError @StoreError` captures (not throws) the store error, and that on
  success `writeSnapshotIfNeeded` runs **synchronously, inline in the command effect**. Quote
  `writeSnapshotIfNeeded` and walk its guard chain (`stateCodec = Nothing` → no-op; re-fold via
  `Keiki.applyEvents`; terminality via `Keiki.isFinal`; fire only when `shouldSnapshot` says so) but
  link the policy/codec mechanics to `/docs/keiro/reference/snapshot`. Quote `noOpResult` /
  `appendedResult` as the two `CommandResult` exits.
- **`retryOrFail` + `isRetryableConflict`: the bounded conflict loop** — quote both. The
  `{WrongExpectedVersion, StreamAlreadyExists}` gotcha gets a `<Callout type="warn">` (a lost
  new-stream race is retried, never surfaced). Link `/docs/keiro/how-to/configure-concurrency-retries`.

Closes: "Next: 04 — The transactional write path".

### M4 — `04-the-transactional-write-path.mdx` (rewrite of old `02`, title "04 — The transactional write path")

Keep the old chapter's `Tx.condemn` and `reconstructRecorded` prose; add the two missing runners.
Sections:

- **Three runners, one primitive** — quote the three signatures and the `runCommandWithSql` wrapper
  body. Explain `runCommand` appends only; `runCommandWithSql` runs `afterAppend :: AppendResult ->
  Tx.Transaction a` in the same transaction; `runCommandWithSqlEvents` is the most general — the
  callback also gets `[(co, RecordedEvent)]` — and the other two are conveniences over it. Note this
  is the primitive projections, process managers, and the router build on.
- **One transaction: append, then the callback** — quote `appendWithSqlOnce`'s `body`. Explain the
  shared `body`: a conflict calls `Tx.condemn` (marks the Hasql transaction for rollback) and hands
  `appendConflictToStoreError conflict` to `retryOrFail`, so the read-model write never lands without
  its events; a success runs `afterAppend (Prelude.zip events recordeds) appendResult` *inside* the
  transaction, then (back in the effect) `writeSnapshotIfNeeded` and `appendedResult`. Note the no-op
  case returns `(result, Nothing)` — the callback does not run.
- **Why `reconstructRecorded` instead of a re-read** — quote it. Explain the arithmetic: the append
  returns only the *last* version/position; event `i` (0-based) of a `count`-event batch gets
  `last - count + 1 + i` for both counters, derivable because kiroku inserts the batch as one
  contiguous `WITH ORDINALITY` run — so the callback sees each event's persisted identity with no
  second query in the hot transaction. Link `/docs/keiro/reference/projection` (the inline-projection
  consumer) and `/docs/keiro/how-to/run-a-command-in-a-transaction`.

Closes: "Next: 05 — The codec on the boundary".

### M5 — `05-the-codec-on-the-boundary.mdx` (rewrite of old `03`, title "05 — The codec on the boundary")

Keep the old `metadataFor`/`decodeRecorded` prose; add the type, all six `CodecError` constructors,
`encodeForAppend`, `decodeRaw`, `migrateToCurrent` in full, and the jitsurei upcaster. Sections:

- **The `Codec` record and `CodecError`** — quote both. Stress it is a **value-level record**, not a
  typeclass (so one event type can carry several codecs and upcasters are first-class data). Map each
  `CodecError` constructor to where it is raised. `<TypeTable>` for the six `Codec` fields.
- **Write: stamp the schema version** — quote `encodeForAppend`, `encodeForAppendWithMetadata`,
  `metadataFor`. The schema-key-always-wins rule gets a callout; note `InvalidSchemaVersion` guards a
  misconfigured codec and `UnknownEventType` guards a tag outside `eventTypes`.
- **Read: check tag, migrate, decode** — quote `decodeRecorded`, `extractSchemaVersion`, `decodeRaw`,
  `migrateToCurrent`. Walk `migrateToCurrent`'s loop: at/above current → unchanged; below 1 →
  `UnknownVersion`; otherwise look up the rung keyed by the current version, apply it (`Left` →
  `UpcasterError`), recurse; a missing rung with a later one available → `GapInUpcasterChain`.
  `extractSchemaVersion` defaults to `1`, so pre-stamp events still decode. Fatal-on-unknown gets a
  callout (no "skip unknown" path; one unknown event aborts the whole hydrate replay — tie back to
  chapter 02's `HydrationDecodeFailed`).
- **The jitsurei v1→v2 upcaster** — quote `orderCodec`'s `schemaVersion`/`upcasters` and
  `upcastOrderPlacedV1`; contrast `pageCodec` (`schemaVersion = 1`, `upcasters = []`). Link
  `/docs/keiro/explanation/codec-and-schema-evolution` and
  `/docs/keiro/how-to/evolve-an-event-schema`.

Closes: "Next: 06 — The typed handles".

### M6 — `06-the-typed-handles.mdx` (new, title "06 — The typed handles")

Walks the records the runners are parameterised over — the structure every chapter has been
threading. Sections:

- **`EventStream`: the seven fields** — quote the record; one paragraph per field, emphasising that
  `EventStream` *marries* a pure keiki `SymTransducer` to the durable-store concerns
  (`eventCodec`, `resolveStreamName`, `snapshotPolicy`, `stateCodec`). `<TypeTable>` for the seven
  fields. Note `stateCodec = Nothing` disables snapshotting regardless of `snapshotPolicy`.
- **`SnapshotPolicy`: four constructors** — quote them; one line each (`Never`, `Every n`,
  `OnTerminal`, `Custom`); link the evaluation rules (`shouldSnapshot`) to
  `/docs/keiro/reference/snapshot`.
- **`StateCodec`: the reuse gate** — quote it; explain `stateCodecVersion` + `shapeHash` together gate
  whether a stored snapshot is loaded (a mismatch forces a clean rehydrate). Link the persistence story
  to the read-side tour `/docs/keiro/walkthrough/read-side/01-snapshots-in-the-command-path`.
- **`Stream a`: the phantom-typed handle** — quote the newtype and `stream`/`streamName`/`mapStreamName`;
  explain the phantom `a` prevents passing one aggregate's name where another is expected; note the
  design-notes rename (`AggregateId a` → `Stream a`).
- jitsurei anchor: `orderEventStream` vs. `snapshotOrderEventStream`, and `orderStream`.

Closes: "Next: 07 — The router".

### M7 — `07-the-router.mdx` (rewrite of old `04`, title "07 — The router")

Keep the old `dispatchCommand`/`runRouterWorker` prose; add `Router`'s five fields and `RouterResult`
up front. Sections:

- **`Router` and `RouterResult`** — quote both; one line per `Router` field; note the router is the
  *stateless* sibling of the process manager (no state stream, no `correlate`), whose one new power is
  that `resolve` runs in `Eff es` so the fan-out set can be *looked up* (typically `runQuery`).
- **`runRouterOnce` / `dispatchCommand`** — quote both; walk the two idempotency layers
  (`eventAlreadyIn` pre-check + store-level `DuplicateEvent` fold) and the deterministic id
  `deterministicCommandId (name) correlation sourceEventId emitIndex`. Note a failure is a
  `PMCommandFailed` *element*, never an outer `Left`.
- **`runRouterWorker` / `ackDecisionFor`** — quote both; the ack policy (undecodable → `AckHalt`; all
  appended/duplicate → `AckOk`; any `PMCommandFailed` → `AckHalt`, retried safely). The benign-rejection
  pitfall gets a `<Callout type="warn">` (model rejections as total transitions). Note that
  `PMCommand`/`deterministicCommandId`/`eventAlreadyIn` are `Keiro.ProcessManager`'s and
  `runCommandWithProjections` is `Keiro.Projection`'s — link `/docs/keiro/reference/process-manager`
  and `/docs/keiro/reference/projection`.

Closes: back to `/docs/keiro/walkthrough/command-cycle/00-start-here` and on to
`/docs/keiro/reference/router`. jitsurei anchor: `pagingRouter` (`just jitsurei-paging`).

### M8 — Update `00-start-here.mdx` and `meta.json`

Rewrite the `<Cards>` chapter list to seven cards (the new slugs/titles), refresh the source-file map
(now four read modules: Command, Codec, EventStream/Stream, Router), and keep the overview mermaid
(Hydrate → Transduce → Append, already correct). Rewrite `meta.json` `pages` to the new ordered list:

```json
{
  "title": "The command cycle",
  "pages": [
    "00-start-here",
    "01-command-types-and-errors",
    "02-hydration",
    "03-the-command-processor",
    "04-the-transactional-write-path",
    "05-the-codec-on-the-boundary",
    "06-the-typed-handles",
    "07-the-router"
  ]
}
```

Do **not** touch `walkthrough/meta.json` (top level) or `walkthrough/index.mdx` — EP-19 owns those;
`command-cycle` is already listed in the top-level meta.

### M9 — Full acceptance

Run the build and audits (see Validation). Acceptance: zero crawler warnings, `lint:links` exit 0,
the depth checklist green, no relative links, every fence tagged.


## Concrete Steps

Run all commands from the repo root `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` unless stated
otherwise. The toolchain is **pnpm** on **Node 22** (enter the Nix dev shell first if the repo uses
one: `nix develop`).

### M0 — Preconditions

```bash
# The five current chapters + meta exist (HARD DEP EP-8).
ls content/docs/keiro/walkthrough/command-cycle/
# command-cycle is wired into the walkthrough section.
grep -q '"command-cycle"' content/docs/keiro/walkthrough/meta.json && echo "command-cycle listed"

# The cross-link targets this tour points at exist.
for f in reference/command reference/codec reference/event-stream-and-stream reference/router \
         reference/snapshot reference/process-manager reference/projection reference/telemetry \
         explanation/the-command-cycle explanation/codec-and-schema-evolution \
         explanation/why-symtransducer-not-decider \
         walkthrough/read-side/01-snapshots-in-the-command-path \
         how-to/make-commands-idempotent how-to/configure-concurrency-retries \
         how-to/run-a-command-in-a-transaction how-to/evolve-an-event-schema; do
  test -f "content/docs/keiro/$f.mdx" && echo "have $f" || echo "MISSING $f"
done

pnpm install
pnpm build
```

Expected: every `have …` line present (no `MISSING`), and `✓ built in <N>s` with no
`[unhandledRejection]`/`Failed to fetch`.

Optional — confirm the API names you will quote still exist at the pinned commit (read-only):

```bash
grep -RnE "hydrate|hydrateFull|prepareCommandPlan|evaluateCommand|encodeEvents|assignEventIds|expectedVersion|writeSnapshotIfNeeded|retryOrFail|isRetryableConflict|reconstructRecorded|recordCommandOutcome|commandErrorClass|noOpResult|appendedResult" \
  /Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Command.hs
```

### M1–M7 — Author / rewrite chapters

Move the three rewritten chapters to their new numbers first (preserves git history), then edit:

```bash
cd content/docs/keiro/walkthrough/command-cycle
git mv 01-the-command-processor.mdx        03-the-command-processor.mdx
git mv 02-the-transactional-write-path.mdx 04-the-transactional-write-path.mdx
git mv 03-the-codec-on-the-boundary.mdx    05-the-codec-on-the-boundary.mdx
git mv 04-the-router.mdx                   07-the-router.mdx
```

Then create `01-command-types-and-errors.mdx`, `02-hydration.mdx`, `06-the-typed-handles.mdx`, and
edit all chapters per M1–M7. After each chapter, build and view it:

```bash
pnpm build
# then pnpm dev and open the chapter, e.g.
# http://localhost:3000/docs/keiro/walkthrough/command-cycle/02-hydration
```

Each chapter's frontmatter is `title` + `description`. Example skeleton (four-backtick fence so the
inner fences survive):

````mdx
---
title: "02 — Hydration"
description: "Reading hydrate and hydrateFull: rebuilding (state, registers, version) from the event log, the snapshot-seed fast path with silent fallback, and the Settled-vs-InFlight finish rule."
---

This chapter reads the hydration machine in `keiro/src/Keiro/Command.hs`. Read
[01 — Command types and errors](/docs/keiro/walkthrough/command-cycle/01-command-types-and-errors)
first.

## The two doors: `hydrate` and `hydrateFull`

```haskell
-- keiro/src/Keiro/Command.hs
hydrate options eventStream targetStream =
  snapshotSeed >>= \case
    Nothing -> hydrateFull options eventStream targetStream
    Just seed -> do
      replayed <- replayFrom seed
      case replayed of
        Left _ -> hydrateFull options eventStream targetStream
        Right hydrated -> pure (Right hydrated)
```

… prose explaining the silent fallback …

Next: [03 — The command processor](/docs/keiro/walkthrough/command-cycle/03-the-command-processor).
````

### M8 — Start-here + meta.json

Edit `00-start-here.mdx`'s `<Cards>` to the seven new chapters and overwrite `meta.json` with the M8
`pages` array above.

### M9 — Build and audit

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

   Succeeds (`✓ built`) and the log prerenders the eight routes
   `/docs/keiro/walkthrough/command-cycle/{00-start-here,01-command-types-and-errors,02-hydration,03-the-command-processor,04-the-transactional-write-path,05-the-codec-on-the-boundary,06-the-typed-handles,07-the-router}`.

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
   grep -RnE "\]\((\./|\.\./)" content/docs/keiro/walkthrough/command-cycle || echo "no relative links"
   ```

   Expected: `no relative links`.

5. **Every fence is language-tagged** (an opening fence has a language word right after the
   backticks; closing fences are bare and must be eyeballed as closers):

   ```bash
   grep -RnE "^```$" content/docs/keiro/walkthrough/command-cycle | grep -v "```[a-z]" || echo "check closers"
   ```

6. **Depth checklist — every named binding appears in the tour.** This is the contribution-grade gate:
   each name below must appear somewhere in
   `content/docs/keiro/walkthrough/command-cycle/*.mdx`:

   ```bash
   for name in CommandResult CommandError HydrationDecodeFailed HydrationReplayFailed CommandRejected \
               EncodeFailed StoreFailed RetryExhausted RunCommandOptions defaultRunCommandOptions \
               retryLimit pageSize eventIds beforeAppend tracer metadata \
               Hydrated Replay CommandPlan CommandNoOp CommandAppend \
               runCommand runCommandWithSql runCommandWithSqlEvents \
               hydrate hydrateFull applyRecorded applyEvent finishReplay Settled InFlight \
               prepareCommandPlan evaluateCommand encodeEvents assignEventIds expectedVersion \
               appendOnce writeSnapshotIfNeeded retryOrFail isRetryableConflict \
               WrongExpectedVersion StreamAlreadyExists noOpResult appendedResult \
               recordCommandOutcome commandErrorClass withCommandSpan \
               appendWithSqlOnce reconstructRecorded \
               Codec Upcaster CodecError UnknownEventType InvalidSchemaVersion UnknownVersion \
               UpcasterError DecodeFailed GapInUpcasterChain \
               encodeForAppend encodeForAppendWithMetadata metadataFor decodeRecorded decodeRaw \
               migrateToCurrent extractSchemaVersion \
               EventStream SnapshotPolicy Never Every OnTerminal Custom StateCodec stateCodecVersion \
               shapeHash Stream stream streamName mapStreamName \
               Router RouterResult runRouterOnce runRouterWorker dispatchCommand ackDecisionFor \
               deterministicCommandId eventAlreadyIn runCommandWithProjections \
               orderCodec upcastOrderPlacedV1 orderEventStream snapshotOrderEventStream pagingRouter; do
     grep -Rqs -- "$name" content/docs/keiro/walkthrough/command-cycle && echo "ok: $name" || echo "MISSING: $name"
   done
   ```

   Expected: every line says `ok:`.

7. **Quoted Haskell names exist in the pinned source.** Re-run the same `for name in …` loop but grep
   `/Users/shinzui/Keikaku/bokuno/keiro/keiro /Users/shinzui/Keikaku/bokuno/keiro/keiro-core
   /Users/shinzui/Keikaku/bokuno/keiro/jitsurei` instead of the docs dir; every line must say `ok:`.
   (This catches a typo'd identifier the docs build cannot: Haskell snippets are not compiled.)

8. **The chapters render in a browser.** Run `pnpm dev`, open
   `http://localhost:3000/docs/keiro/walkthrough/command-cycle/00-start-here`, and confirm the seven
   chapter cards link correctly, the overview `mermaid` renders as a diagram, and each chapter's
   `<TypeTable>`s and `<Callout>`s render. Walk 00 → 07 via the "Next:" links and confirm every link
   navigates (no 404).


## Idempotence and Recovery

Every step is safe to repeat. `git mv` is idempotent in effect (re-running after the move is a no-op
or a harmless re-stage); editing `.mdx` files is additive; re-running `pnpm build` and `pnpm
lint:links` is idempotent. If you renumber a chapter, rename the file *and* update the matching
`meta.json` slug *and* every absolute intra-tour link that pointed at the old number, in the same
change — a slug pointing at a missing file (or a file missing from `pages`) yields a broken sidebar
entry, not a crash, so the build still exits 0; catch it with acceptance #8.

If `pnpm build` reports `Failed to fetch`, the cause is almost always a relative link or a link to a
page that does not exist yet. Run acceptance #4 for relative links; for a cross-tour forward-link
whose slug is unconfirmed (a not-yet-authored EP-17 foundation chapter), link the existing
`/docs/keiro/explanation/why-symtransducer-not-decider` and name the intended target in prose until
that tour lands.

Where the keiro source diverges from this plan's transcription, **follow the source** at the pinned
commit `3f5dc9c` and record the delta in Surprises & Discoveries and (if it changes an instruction)
the Decision Log. Do not edit the keiro tree.


## Interfaces and Dependencies

This plan hard-depends on **EP-8** (which created the tour, its `meta.json`, the
`walkthrough/meta.json` entry, and the reference/explanation pages it links) and **EP-7** (the
overview/jitsurei spine and authoring conventions); both are Complete. It soft-depends on **EP-17**
(the foundation tour that will own the conceptual `SymTransducer`/`Keiki.step`/register model) — link
forward where natural, falling back to `/docs/keiro/explanation/why-symtransducer-not-decider` until
EP-17 lands. It **integration-depends** into **EP-19**, which owns the shared
`walkthrough/index.mdx` hub and the top-level `walkthrough/meta.json` ordering; this plan must not
touch either beyond the `command-cycle` entry already present.

**Source of truth (read-only) at pinned commit `3f5dc9c`** — cross-checked while authoring:
`/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Command.hs`,
`/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Router.hs`,
`/Users/shinzui/Keikaku/bokuno/keiro/keiro-core/src/Keiro/Codec.hs`,
`/Users/shinzui/Keikaku/bokuno/keiro/keiro-core/src/Keiro/EventStream.hs`,
`/Users/shinzui/Keikaku/bokuno/keiro/keiro-core/src/Keiro/Stream.hs`, and the jitsurei anchors
`/Users/shinzui/Keikaku/bokuno/keiro/jitsurei/src/Jitsurei/Domain.hs`,
`.../Jitsurei/OrderStream.hs`, `.../Jitsurei/Paging.hs`.

**Files created (all under `content/docs/keiro/walkthrough/command-cycle/`):**

- `01-command-types-and-errors.mdx` — title "01 — Command types and errors".
- `02-hydration.mdx` — title "02 — Hydration".
- `06-the-typed-handles.mdx` — title "06 — The typed handles".

**Files renamed + rewritten (under the same directory):**

- `01-the-command-processor.mdx` → `03-the-command-processor.mdx` — title "03 — The command processor".
- `02-the-transactional-write-path.mdx` → `04-the-transactional-write-path.mdx` — title "04 — The transactional write path".
- `03-the-codec-on-the-boundary.mdx` → `05-the-codec-on-the-boundary.mdx` — title "05 — The codec on the boundary".
- `04-the-router.mdx` → `07-the-router.mdx` — title "07 — The router".

**Files edited:**

- `00-start-here.mdx` — chapter `<Cards>` list (seven cards) + source-file map.
- `meta.json` — `pages` rewritten to the eight ordered slugs (M8).

**Do not touch:** any other `walkthrough/` subdir; `content/docs/keiro/walkthrough/index.mdx` (EP-19);
`content/docs/keiro/walkthrough/meta.json` top level (EP-19; `command-cycle` already listed); any
reference/explanation/how-to page (EP-8/EP-9/EP-12 own those); any file outside
`content/docs/keiro/walkthrough/command-cycle/`. Snapshot read/write mechanics, the read-model query
path, and consistency modes are *out of scope* — link to `/docs/keiro/reference/snapshot`,
`/docs/keiro/walkthrough/read-side/`, and `/docs/keiro/how-to/choose-a-consistency-mode` rather than
re-deriving them.

**Haskell interfaces that must be quoted correctly by the end** (present verbatim in the pinned
source): from `Keiro.Command` — `CommandResult`, `CommandError`, `RunCommandOptions`,
`defaultRunCommandOptions`, `runCommand`, `runCommandWithSql`, `runCommandWithSqlEvents`, and the
internals `Hydrated`, `Replay`, `CommandPlan`, `hydrate`, `hydrateFull`, `applyRecorded`, `applyEvent`,
`finishReplay`, `prepareCommandPlan`, `evaluateCommand`, `encodeEvents`, `assignEventIds`,
`expectedVersion`, `appendOnce`, `appendWithSqlOnce`, `writeSnapshotIfNeeded`, `retryOrFail`,
`isRetryableConflict`, `reconstructRecorded`, `recordCommandOutcome`, `commandErrorClass`,
`noOpResult`, `appendedResult`; from `Keiro.Codec` — `Codec`, `Upcaster`, `CodecError`,
`encodeForAppend`, `encodeForAppendWithMetadata`, `metadataFor`, `decodeRecorded`, `decodeRaw`,
`migrateToCurrent`, `extractSchemaVersion`; from `Keiro.EventStream` — `EventStream`, `SnapshotPolicy`,
`StateCodec`; from `Keiro.Stream` — `Stream`, `stream`, `streamName`, `mapStreamName`; from
`Keiro.Router` — `Router`, `RouterResult`, `runRouterOnce`, `runRouterWorker`; and the jitsurei
anchors `orderCodec`, `upcastOrderPlacedV1`, `orderEventStream`, `snapshotOrderEventStream`,
`orderStream`, `pagingRouter`.
