---
id: 15
slug: deepen-the-keiro-workflow-code-walkthrough
title: "Deepen the keiro workflow code walkthrough"
kind: exec-plan
created_at: 2026-06-02T04:47:38Z
master_plan: "docs/masterplans/2-keiro-framework-documentation-set.md"
---

# Deepen the keiro workflow code walkthrough

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, a developer who opens keiro's **workflow code walkthrough** — the tour at
`/docs/keiro/walkthrough/workflow` in this repository's documentation site — can read keiro's
shipped workflow engine **end to end** and come away able to contribute to it or trust it,
not merely skim a few excerpts. The walkthrough currently exists but is *thin*: four short
chapters that each quote one excerpt and add a paragraph. This plan reopens that subdirectory
and brings it to **contribution-grade depth** — every exported function of
`Keiro.ProcessManager` and `Keiro.Timer`, every field of every type, the timer SQL line by
line, the error/retry/duplicate edge cases, and the keiki coupling — anchored throughout to
the runnable `jitsurei` worked example.

Concretely, "keiro's workflow engine" means two cooperating pieces, both shipped at the
pinned upstream commit and both *libraries you import*, not servers you run:

- A **process manager** (keiro's name for the stateful, event-driven coordinator other
  frameworks call a *saga*): given one recorded event, it (a) steps its own private,
  event-sourced "manager" state stream keyed by a correlation id, (b) dispatches commands to
  one or more *target* aggregates, and (c) schedules durable timers. The shipped code is
  `keiro/src/Keiro/ProcessManager.hs` and its single runner `runProcessManagerOnce`.

- A **durable timer**: a row in the PostgreSQL table `keiro_timers` scheduled to become "due"
  at a future `fire_at`; a worker claims due rows and fires them. The shipped code is
  `keiro/src/Keiro/Timer.hs`, `keiro/src/Keiro/Timer/Schema.hs`, and
  `keiro/src/Keiro/Timer/Types.hs`.

The single most important fact this deepening must get *right* — and which keiro's own
in-repo notes get *wrong* — is the **transaction model**. The shipped `runProcessManagerOnce`
uses **separate transactions**: the manager-state append **and its timers** commit together
in **one** transaction, but **each** dispatched target command then commits in **its own**
separate transaction. It is **not** one atomic multi-stream commit, even though keiro's
`docs/research/*` and `docs/plans/*` notes describe one. This plan documents the shipped
reality and explains *why replay is still crash-safe* without atomicity: every write is keyed
by a `deterministicCommandId` and pre-checked with `eventAlreadyIn`, so re-running the whole
reaction appends nothing new.

You can see the result by running the docs dev server (`pnpm dev`, i.e. `vite dev`) — or a
production build with `pnpm build && pnpm start` — and browsing
`http://localhost:3000/docs/keiro/walkthrough/workflow`: the tour appears in the sidebar with
more chapters than before (this plan splits the process-manager chapter into a **dispatch
loop** chapter and a **transaction model** chapter, and splits timers into **types/schema**,
**the claim SQL**, and **the worker**), every chapter walks real source with the source path
noted above each fence, Haskell renders in PragmataPro with ligatures, and the mermaid
diagrams render interactively. The user-visible behavior enabled is **comprehension**: a
reader finishes the tour knowing every function, type, column, and edge case of the workflow
engine, and the honest gaps (e.g. no timer-cancellation SQL ships).

This is a **content-only** plan. It populates `content/docs/keiro/walkthrough/workflow/`
only. It does not touch the docs app, the highlighter, the font, the Mermaid component, the
IA/template system, or any other walkthrough subdirectory. It documents keiro **as shipped**;
where keiro's notes diverge, the source wins.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [x] M0. Preconditions verified _(2026-06-02)_ — keiro pin confirmed `94c85e2`; the four
      shipped modules and the four jitsurei anchors readable; the `keiro_timers` table and
      `keiro_timers_due_idx` present in the bootstrap migration; sibling tours
      (command-cycle, read-side) and all explanation/reference/how-to companion pages present;
      every signature/SQL block in §Context re-confirmed byte-for-byte against the source.
      (pnpm build/lint:links not run — out of this task's scope.)
- [x] M1. `00-start-here.mdx` deepened _(2026-06-02)_ — overview mermaid, the separate-
      transaction thesis stated up front, honest-gaps preview, full `<Cards>` to the five
      chapters, "what this tour assumes" prose, cross-links to the command-cycle/read-side
      tours and the explanation/reference companions (canonical slugs).
- [x] M2. `01-the-process-manager-dispatch-loop.mdx` authored _(2026-06-02)_ —
      `runProcessManagerOnce` control flow top to bottom: `correlate`/`handle`,
      `deterministicCommandId` (the `-1` emit index), the `eventAlreadyIn` forward-scan
      pre-check, `finish`/`dispatchCommands` (`zip [0 ..]`)/`dispatchCommand`, `retarget =
      coerce` (with jitsurei same-name evidence), the duplicate-classification cases, and the
      `runProcessManagerWorker` ack table.
- [x] M3. `02-the-transaction-model.mdx` authored _(2026-06-02)_ — separate transactions vs.
      the notes' atomic claim; what is atomic (manager append + timers via `scheduleTimerTx`)
      and what is not (each `runCommandWithProjections` dispatch); why deterministic ids +
      `eventAlreadyIn` + finish-runs-on-duplicate make replay converge; the `PMCommandFailed`
      hazard `<Callout type="warn">`; the Tx1-vs-Tx2…n mermaid.
- [x] M4. `03-the-types-and-config.mdx` authored _(2026-06-02)_ — a `<TypeTable>` per type for
      `ProcessManager` (7), `ProcessManagerAction` (3), `PMCommand` (2), `PMCommandResult`,
      `PMStateResult`, `ProcessManagerResult`, `TimerId`, `TimerRequest` (5), `TimerStatus`
      (4), `TimerRow` (8); the `fulfillmentProcessManager` record literal anchors the wiring.
- [x] M5. `04-the-timer-schema.mdx` authored _(2026-06-02)_ — `keiro_timers` columns +
      `keiro_timers_due_idx`; `scheduleTimerStmt` re-arm `ON CONFLICT … WHERE status =
      'scheduled'`; `claimDueTimerStmt` CTE with `FOR UPDATE SKIP LOCKED` line by line;
      `markTimerFiredStmt`; `timerRowDecoder` + `statusFromText` fallback; three honest-gap
      `<Callout>`s (no cancellation SQL, no backoff, no dead-letter).
- [x] M6. `05-the-timer-worker.mdx` authored _(2026-06-02)_ — the 9-line `runTimerWorker`
      body; at-least-once via `Firing`-then-reclaim; the `for_ fired` `Just`-marks-fired rule;
      the bare-worker reality; `runEscalationTimerWorker` and `runPaymentTimeoutWorker` as the
      `fire`-rejoins-the-command-cycle examples; recap `<Cards>`.
- [x] M7. `walkthrough/workflow/meta.json` rewritten to the six-chapter order; the three
      obsolete files (`01-the-process-manager`, old `02-the-timer-schema`, old
      `03-the-timer-worker`) deleted with `rm`; no chapter links a deleted slug.
- [~] M8. Validation — no-pnpm self-verification done _(2026-06-02)_: depth checklist returns
      `OK` for all 16 ProcessManager + 18 Timer symbols/SQL clauses; no relative links; no
      untagged fence openers (each file's tagged-open count equals its bare-close count); no
      "decide" labeling a cycle phase; separate-tx phrasing present in ch.02 and the atomic
      myth appears only as explicit denials; honest gaps present in 00/04/05; every snippet
      symbol re-confirmed in the keiro source. `pnpm typecheck/build/lint:links` deferred to
      EP-19's whole-tree gate (out of this task's scope).


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

- **Source layout: the modules live one directory deeper than §Context's paths.** §Context
  names e.g. `keiro/src/Keiro/ProcessManager.hs`, but on disk the keiro **repo root** is
  `/Users/shinzui/Keikaku/bokuno/keiro` and the package is nested, so the real path is
  `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/ProcessManager.hs` (likewise
  `keiro/jitsurei/src/...`). The in-fence source comments keep the package-relative form
  (`keiro/src/Keiro/...`, `keiro/jitsurei/src/Jitsurei/...`) to match the existing tour pages
  and the reference pages — no divergence in the docs, just a note for the next reader. Pin
  confirmed `94c85e2a3ccbdb1adb07fcb5a7ee57b964802a2f`.
- **The escalation worker's fired-event id is deterministic, not "whatever the command
  returned."** §Context summarized `runEscalationTimerWorker` as returning "a `Just
  firedEventId`." The real body discards the dispatched command's result (`_ <- runCommand …`)
  and returns `Just (EventId (namedUuid ("jitsurei-escalation-fired:" <> incidentId)))` — a
  UUIDv5 of the incident id. Chapter 05 documents the **shipped** behavior (a deterministic
  id, stable across retries), which is the more accurate and more interesting fact. The
  matching timer id is also a UUIDv5, via the same `namedUuid` helper keyed
  `"jitsurei-escalation-timer:" <> incidentId`.
- **Re-claim nuance worth stating precisely.** A `Firing` row is *not* directly re-selected by
  `claimDueTimerStmt` (its `WHERE status = 'scheduled'` excludes it); "immediately
  re-claimable" holds only once a recovery path returns the row to `scheduled`. As shipped,
  keiro provides no such recovery path or backoff timer — chapter 04's no-backoff callout
  states this explicitly rather than implying an automatic `firing → scheduled` transition.
- **Incident state machine confirms `retarget = coerce` soundness.** `incidentStream` and
  `incidentCommandStream` both resolve to `incident-<id>` (verified in `Incident.hs`), and the
  ack/escalate transitions are legal **only from `Triaging`** (`Unreported → Triaging →
  Acknowledged | Escalated → Resolved`) — the concrete evidence used in chapters 01 and 02.
- No cross-tour **prose** drift required editing a sibling subdirectory. All cross-links use
  the canonical final slug map (command-cycle `03`/`04`/`07`, read-side
  `04-projections-and-the-rebuild-path`), which the soft-dep tours are landing in parallel.


## Decision Log

Record every decision made while working on the plan.

- Decision: Renumber and split the workflow tour from four chapters into **six**:
  `00-start-here`, `01-the-process-manager-dispatch-loop`, `02-the-transaction-model`,
  `03-the-types-and-config`, `04-the-timer-schema`, `05-the-timer-worker`.
  Rationale: the master plan's Integration Point #2 (Phase-4 extension) explicitly permits a
  deepening plan to "add, renumber, and rewrite chapters inside its own subdirectory," and
  the task brief proposes splitting the process manager into a dispatch-loop chapter and a
  transaction-model chapter. The single most error-prone topic (separate vs. atomic
  transactions) earns its own chapter so it cannot be lost in a wall of code; the timer
  schema and the timer worker were already separate and stay separate; a dedicated
  types-and-config chapter gives every exported type a `<TypeTable>`-style treatment the old
  prose-only chapters lacked.
  Date: 2026-06-02
- Decision: Document the **separate-transaction** model as the headline of the tour, stated in
  `00-start-here` and fully derived in `02-the-transaction-model`, explicitly contradicting
  keiro's in-repo design notes' "one atomic multi-stream commit."
  Rationale: verified in `keiro/src/Keiro/ProcessManager.hs` at the pin — the manager append
  composes `scheduleTimerTx` into its `runCommandWithSql` continuation (one transaction),
  while `dispatchCommand` calls `runCommandWithProjections` once per command (one transaction
  each). MasterPlan #2's Surprises and EP-10's Decision Log already established this as the
  shipped reality; the deepened tour makes it unmissable. Command-cycle phrasing remains
  **Hydrate → Transduce → Append**, never "Decide."
  Date: 2026-06-02
- Decision: Keep the verified signatures and SQL **verbatim** from the pinned source and embed
  the full `runProcessManagerOnce` body across chapters 01–02 (not a paraphrase).
  Rationale: contribution-grade depth means the reader can follow every line; the function is
  ~120 lines including helpers and fits across two chapters with commentary between fences.
  Date: 2026-06-02
- Decision: Document honest gaps as first-class, in their own callouts: **no timer
  cancellation SQL ships** (the `Cancelled` enum value exists and is also the decode fallback
  for unknown status strings, but there is no `cancelTimer` function); the timer worker is
  **bare** (no loop, no clock, no supervisor; the caller supplies `now`); a `PMCommandFailed`
  **wedges** a results-inspecting worker by design; there is **no backoff column** —
  `next_attempt_at`/exponential backoff do *not* exist, only an `attempts` counter and
  immediate re-claimability of `Firing` rows.
  Rationale: the task brief calls for honest gaps; verified absent in the source. (Important
  correction to the brief: keiro 0.1.0.0 has **no** `next_attempt_at` column and **no**
  backoff schedule — the tour must say so rather than invent one.)
  Date: 2026-06-02
- Decision: Pin reference. The workflow source is identical at the MasterPlan's original pin
  `3f5dc9c` and the current telemetry-tracking pin `94c85e2`; only `Keiro.Telemetry` changed
  in that range. This plan cites the source by path and treats either pin as authoritative for
  the workflow modules.
  Rationale: `git rev-parse HEAD` in the keiro tree returns `94c85e2`; the workflow modules
  are byte-identical to `3f5dc9c`. Documenting "as shipped" is unambiguous here.
  Date: 2026-06-02
- Decision: All intra-doc links are **absolute** `/docs/keiro/...`. Forward-links to
  not-yet-shipped sibling walkthrough pages (none are required by this plan) would be parked
  on `/docs/keiro/walkthrough` and named in prose; EP-19 may upgrade them. This plan owns only
  `walkthrough/workflow/` and keeps `walkthrough/workflow/meta.json` in sync; it does not edit
  the shared hub or top-level `walkthrough/meta.json` (already lists `workflow`).
  Rationale: Integration Point #6 (absolute links) and #2 (disjoint subdirectory ownership).
  Date: 2026-06-02


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.

**M0–M7 complete; M8 self-verified without pnpm _(2026-06-02)_.** The workflow tour now walks
`Keiro.ProcessManager` and `Keiro.Timer` end to end across six chapters:

```text
00-start-here.mdx                            (rewritten)
01-the-process-manager-dispatch-loop.mdx     (new; split from old 01)
02-the-transaction-model.mdx                 (new; split from old 01)
03-the-types-and-config.mdx                  (new)
04-the-timer-schema.mdx                      (rewritten + renumbered from old 02)
05-the-timer-worker.mdx                      (rewritten + renumbered from old 03)
meta.json                                    (six chapters in order)
```

The three obsolete files (`01-the-process-manager`, old `02-the-timer-schema`, old
`03-the-timer-worker`) were removed with `rm`. The separate-transaction model is stated in
chapter 00 and derived in full in chapter 02; the atomic-multi-stream myth appears only as
explicit denials. The depth checklist returns `OK` for all 16 ProcessManager exports/ctors +
`retarget` and all 18 Timer exports/ctors/SQL clauses. Every Haskell/SQL snippet was
transcribed and re-confirmed against the keiro source at pin `94c85e2`; honest gaps (no
cancellation SQL, no backoff, no dead-letter, bare worker) are flagged in 00/04/05; all links
are absolute and use the canonical cross-tour slug map; every fence is language-tagged
(verified: per-file tagged-open count equals bare-close count).

**Gaps / deferred.** This task did not run `pnpm typecheck`/`build`/`lint:links` (out of
scope); the whole-tree build + link gate is EP-19's. The soft-dep cross-tour targets
(command-cycle `03`/`04`/`07`, read-side `04-projections-and-the-rebuild-path`) are authored in
parallel; the links resolve once those tours finish landing their final slugs.

**Lessons.** (1) The brief's "as shipped" discipline caught two §Context simplifications — the
escalation worker's deterministic fired-event id and the re-claim-requires-`scheduled` nuance —
both now documented as the real behavior. (2) Keeping the in-fence source-path comments
package-relative (matching the existing pages) avoided a churny divergence with the on-disk
nested path.


## Context and Orientation

Read this whole section before editing. It is written so that a novice with only this file
and the working tree can complete the work. Define each term on first use in the pages too.

### What you are building, and where

You are rewriting MDX content files under
`content/docs/keiro/walkthrough/workflow/` in **this** repository
(`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`). The site is a **fumadocs**
documentation app (fumadocs-ui + fumadocs-mdx) built on **TanStack Start as a static SPA**
(React 19 + MDX, TypeScript, Tailwind v4, bundled with **Vite**), built with **pnpm** on
**Node 22**. `pnpm dev` runs `vite dev`; `pnpm build` runs `vite build` and emits a static
SPA under `.output/public`; `pnpm typecheck` runs `fumadocs-mdx && tsc --noEmit`;
`pnpm lint:links` checks intra-doc links. Each content directory has a `meta.json` whose
`pages` array lists its child page slugs in display order. A page is an `.mdx` file with YAML
frontmatter (`title`, `description`) followed by an MDX body.

The documented **code samples are Haskell and SQL** (the site is TypeScript; the subject is a
Haskell library over PostgreSQL). Every Haskell snippet and every SQL block must be the
**real, shipped** code transcribed from the keiro source, re-verifiable at the pin.

**fumadocs components are global.** `Callout`, `Steps`, `Tabs`, `Cards`/`Card`, `TypeTable`
are registered in `src/components/mdx.tsx` via `getMDXComponents`, so author them **bare with
no `import` lines** (this matches every existing keiro/kiroku page). The repo ships a
copy-me code-walkthrough template at `content/docs/_templates/code-walkthrough.mdx`: numeric-
prefixed pages (`00-…`, `01-…`), a back-link `<Callout>` at the top pointing to
`00-start-here`, and excerpts with the source path noted above each block.

### The current state of this tour (what you are deepening)

The subdirectory already exists with four chapters and a `meta.json`:

```text
content/docs/keiro/walkthrough/workflow/
  00-start-here.mdx              "00 — Start here"
  01-the-process-manager.mdx     "01 — The process manager"
  02-the-timer-schema.mdx        "02 — The timer schema"
  03-the-timer-worker.mdx        "03 — The timer worker"
  meta.json                      pages: [00-start-here, 01-the-process-manager,
                                          02-the-timer-schema, 03-the-timer-worker]
```

These were authored by EP-10 and are accurate but thin (each ~80–130 MDX lines, one excerpt
plus a paragraph). The new chapter set (this plan) is:

```text
content/docs/keiro/walkthrough/workflow/
  00-start-here.mdx                            "00 — Start here"
  01-the-process-manager-dispatch-loop.mdx     "01 — The process manager: the dispatch loop"
  02-the-transaction-model.mdx                 "02 — The transaction model"
  03-the-types-and-config.mdx                  "03 — The ProcessManager types and config"
  04-the-timer-schema.mdx                      "04 — The timer schema and claim SQL"
  05-the-timer-worker.mdx                      "05 — The timer worker"
  meta.json
```

You **rewrite** `00-start-here.mdx`; you **rewrite** the old `01-the-process-manager.mdx` into
the two new files `01-the-process-manager-dispatch-loop.mdx` and `02-the-transaction-model.mdx`
(then delete the old `01-the-process-manager.mdx`); you **add** `03-the-types-and-config.mdx`;
you **rewrite and renumber** the old `02-the-timer-schema.mdx` → `04-the-timer-schema.mdx` (a
deeper rewrite) and the old `03-the-timer-worker.mdx` → `05-the-timer-worker.mdx`; and you
**delete** the old `02-the-timer-schema.mdx` and `03-the-timer-worker.mdx`. The net is six
chapters. Keep `meta.json` in sync (M7).

You own **only** this subdirectory. Do **not** touch `walkthrough/index.mdx`,
`walkthrough/meta.json` (it already contains `"workflow"`), or any sibling subdirectory.

### How this plan fits the master plan

This is **EP-15** in `docs/masterplans/2-keiro-framework-documentation-set.md` (Phase 4, the
walkthrough-deepening wave). HARD DEP: EP-7 (the walkthrough hub, jitsurei module map,
`docs/keiro-source-sync.md`, conventions) and EP-10 (the workflow tour, reference, and
explanation pages this tour links to) — both Complete. SOFT DEP: EP-13 (the command-cycle
tour this tour cross-links) and EP-14 (the read-side tour). Soft deps are non-blocking because
this plan is self-contained and uses absolute links that resolve once their targets exist (all
of EP-8…EP-12's pages already exist). EP-19 owns the final hub `<Card>` ordering and the
whole-tree gate; this plan does not.

### Sibling pages this tour links to (verified to exist; link absolute)

These pages already ship — use them as the **conceptual** and **reference** companions to the
**source** tour:

- `/docs/keiro/explanation/process-managers-and-sagas` — the explanation of process managers,
  the separate-transaction model, and the `PMCommandFailed` caveat.
- `/docs/keiro/explanation/durable-timers` — the timer lifecycle and at-least-once firing.
- `/docs/keiro/explanation/workflow-roadmap` — v1 (shipped) vs. v2 (roadmap-only).
- `/docs/keiro/reference/process-manager` — the dry signatures of `Keiro.ProcessManager`.
- `/docs/keiro/reference/timers` — the dry signatures of `Keiro.Timer` and the
  `keiro_timers` schema.
- `/docs/keiro/how-to/keep-target-commands-total` — the discipline that avoids
  `PMCommandFailed`.
- `/docs/keiro/how-to/drive-the-timer-worker` — the polling loop around `runTimerWorker`.
- Command-cycle tour (process managers dispatch *through* the command cycle):
  `/docs/keiro/walkthrough/command-cycle/00-start-here`,
  `/docs/keiro/walkthrough/command-cycle/01-the-command-processor`,
  `/docs/keiro/walkthrough/command-cycle/02-the-transactional-write-path`,
  `/docs/keiro/walkthrough/command-cycle/04-the-router` (the *stateless* contrast).
- Read-side tour (a saga/router can query a read model to pick targets, and inline
  projections run in the dispatch transaction):
  `/docs/keiro/walkthrough/read-side/02-the-read-model-query-path`,
  `/docs/keiro/walkthrough/read-side/03-projections`.
- Reference for `RunCommandOptions`, `runCommand`, `runCommandWithSql`,
  `runCommandWithProjections`: `/docs/keiro/reference/command`.

### Term definitions (define these in plain language on the pages too)

- **Event sourcing.** Persisting state as an append-only log of immutable *events*; current
  state is a fold over events.
- **Aggregate / event stream.** keiro models a consistency boundary as an `EventStream`: a
  pure decision machine (a *transducer* from the `keiki` library) married to a *codec* (how
  events serialize) and a stream name. A `Stream a` is a typed handle naming one instance
  (e.g. `incident-42`). Documented in full by the command-cycle and foundation tours.
- **Transducer / `Keiki.step`.** keiki's pure decision core, a `SymTransducer phi rs s ci co`,
  steps from `(state, registers)` plus an input command to next `(state, registers, events)`.
  The middle phase of the command cycle is **Transduce** (never "Decide"). This tour treats
  the transducer as a black box; the foundation tour (EP-17) owns it.
- **Command cycle.** The **Hydrate → Transduce → Append** loop that turns a *command* into
  appended events under optimistic concurrency. A process manager dispatches *through* this
  cycle: it calls `runCommandWithSql` (manager append + timers) and
  `runCommandWithProjections` (each target dispatch). Documented by the command-cycle tour.
- **Process manager.** A stateful, event-driven coordinator. On an incoming event it advances
  its own private event-sourced "manager" state (a real `EventStream`, keyed by a correlation
  id), dispatches commands to *target* aggregates, and schedules durable timers.
- **Saga.** Vocabulary, not a keiro primitive: a saga is a process manager whose `handle`
  emits *compensating* commands on failure events. keiro ships no separate saga type.
- **Correlation id.** A text key (an order id, an incident id) that selects *which* manager
  instance handles an event and ties the manager's state stream, its dispatched commands, and
  its timers together.
- **Durable timer.** A row in the `keiro_timers` PostgreSQL table scheduled to become "due" at
  a future `fire_at`. "Durable" = it survives process restarts because it lives in Postgres.
- **Optimistic concurrency.** Append succeeds only if the stream is still at the version the
  command read; a concurrent writer causes a retry. The command cycle handles this.
- **`FOR UPDATE SKIP LOCKED`.** A PostgreSQL row-locking clause: a query locks the rows it
  selects and *skips* rows another transaction already locked, so concurrent workers grab
  disjoint rows and never block each other.

### The subject, transcribed from the pinned source (your API cheat-sheet)

Source of truth, read-only — do **not** edit it:
`/Users/shinzui/Keikaku/bokuno/keiro`. Confirm the pin with
`cd /Users/shinzui/Keikaku/bokuno/keiro && git rev-parse HEAD` (returns `94c85e2…`; the
workflow modules are identical to the MasterPlan's `3f5dc9c`). The modules:
`keiro/src/Keiro/ProcessManager.hs`, `keiro/src/Keiro/Timer.hs`,
`keiro/src/Keiro/Timer/Schema.hs`, `keiro/src/Keiro/Timer/Types.hs`. The table lives in
`keiro-migrations/sql-migrations/2026-05-17-00-00-00-keiro-bootstrap.sql`.

**`Keiro.ProcessManager` exports** (the module export list, all must be covered):
`ProcessManager(..)`, `ProcessManagerAction(..)`, `PMCommand(..)`, `ProcessManagerResult(..)`,
`PMCommandResult(..)`, `PMStateResult(..)`, `runProcessManagerOnce`,
`runProcessManagerWorker`, `deterministicCommandId`, `eventAlreadyIn`.

The type definitions, verbatim:

```haskell
-- keiro/src/Keiro/ProcessManager.hs
data ProcessManager input phi rs s ci co targetPhi targetRs targetState targetCi targetCo = ProcessManager
  { name              :: !Text
  , correlate         :: !(input -> Text)
  , eventStream       :: !(EventStream phi rs s ci co)
  , streamFor         :: !(Text -> Stream (EventStream phi rs s ci co))
  , targetEventStream :: !(EventStream targetPhi targetRs targetState targetCi targetCo)
  , targetProjections :: !(Stream targetCi -> [InlineProjection targetCo])
  , handle            :: !(input -> ProcessManagerAction ci targetCi)
  }

data ProcessManagerAction ci targetCi = ProcessManagerAction
  { command  :: !ci                     -- advance the manager's OWN state
  , commands :: ![PMCommand targetCi]   -- dispatch to target aggregates
  , timers   :: ![TimerRequest]         -- schedule durable timers
  }

data PMCommand targetCi = PMCommand
  { target  :: !(Stream targetCi)
  , command :: !targetCi
  }

data PMCommandResult target
  = PMCommandAppended  !(CommandResult target)  -- the dispatch appended events
  | PMCommandDuplicate !EventId                 -- idempotent replay; id already existed
  | PMCommandFailed    !CommandError            -- fatal: worker retries the source event

data PMStateResult target
  = PMStateAppended  !(CommandResult target)
  | PMStateDuplicate !EventId                   -- no failure case; a real error aborts via outer Left

data ProcessManagerResult managerTarget commandTarget = ProcessManagerResult
  { managerResult   :: !(PMStateResult managerTarget)
  , commandResults  :: ![PMCommandResult commandTarget]
  , timersScheduled :: !Int
  }
```

The runner signatures, verbatim:

```haskell
runProcessManagerOnce ::
  ( HasCallStack, IOE :> es, Store :> es, Error StoreError :> es
  , BoolAlg phi (RegFile rs, ci)
  , BoolAlg targetPhi (RegFile targetRs, targetCi)
  , Eq co, Eq targetCo ) =>
  RunCommandOptions ->
  ProcessManager input phi rs s ci co targetPhi targetRs targetState targetCi targetCo ->
  RecordedEvent ->
  input ->
  Eff es (Either CommandError (ProcessManagerResult (EventStream phi rs s ci co) (EventStream targetPhi targetRs targetState targetCi targetCo)))

runProcessManagerWorker ::
  ( HasCallStack, IOE :> es, Store :> es, Error StoreError :> es
  , BoolAlg phi (RegFile rs, ci)
  , BoolAlg targetPhi (RegFile targetRs, targetCi)
  , Eq co, Eq targetCo ) =>
  RunCommandOptions ->
  ProcessManager input phi rs s ci co targetPhi targetRs targetState targetCi targetCo ->
  Adapter es msg ->
  (msg -> Maybe (RecordedEvent, input)) ->
  Eff es ()
```

The idempotency primitives, verbatim:

```haskell
-- v5 UUID over [keiro, process-manager, name, correlationId, sourceEventId, emitIndex]
-- manager-state append uses emitIndex = -1; dispatched commands start at 0
deterministicCommandId :: Text -> Text -> EventId -> Int -> EventId

eventAlreadyIn :: (Store :> es) => RunCommandOptions -> StreamName -> EventId -> Eff es Bool
```

The full `runProcessManagerOnce` body (transcribe across chapters 01–02; this is what the tour
walks):

```haskell
runProcessManagerOnce options manager sourceEvent input = do
  let correlationId  = (manager ^. #correlate) input
      action         = (manager ^. #handle) input
      managerStream  = (manager ^. #streamFor) correlationId
      managerEventId = deterministicCommandId (manager ^. #name) correlationId (sourceEvent ^. #eventId) (-1)
      managerOptions = options & #eventIds .~ [managerEventId]
      managerStreamName = ((manager ^. #eventStream) ^. #resolveStreamName) managerStream
  managerAlreadyProcessed <- eventAlreadyIn options managerStreamName managerEventId
  if managerAlreadyProcessed
    then finish correlationId (PMStateDuplicate managerEventId) action
    else do
      managerOutcome <-
        runCommandWithSql
          managerOptions
          (manager ^. #eventStream)
          managerStream
          (action ^. #command)
          (\_ -> traverse_ scheduleTimerTx (action ^. #timers))
      case managerOutcome of
        Left (StoreFailed (DuplicateEvent (Just duplicateId))) | duplicateId == managerEventId ->
          finish correlationId (PMStateDuplicate managerEventId) action
        Left (StoreFailed (DuplicateEvent Nothing)) ->
          finish correlationId (PMStateDuplicate managerEventId) action
        Left err -> pure (Left err)
        Right (managerResult, _) ->
          finish correlationId (PMStateAppended managerResult) action
  where
    finish correlationId managerResult action = do
      commandResults <- dispatchCommands correlationId (sourceEvent ^. #eventId) (action ^. #commands)
      pure $ Right ProcessManagerResult
        { managerResult   = managerResult
        , commandResults  = commandResults
        , timersScheduled = length (action ^. #timers)
        }

    dispatchCommands correlationId sourceEventId commands =
      traverse (uncurry (dispatchCommand correlationId sourceEventId)) (zip [0 ..] commands)

    dispatchCommand correlationId sourceEventId emitIndex command = do
      let commandId        = deterministicCommandId (manager ^. #name) correlationId sourceEventId emitIndex
          targetOptions    = options & #eventIds .~ [commandId]
          targetStream     = retarget (command ^. #target)
          targetStreamName = ((manager ^. #targetEventStream) ^. #resolveStreamName) targetStream
      commandAlreadyProcessed <- eventAlreadyIn options targetStreamName commandId
      if commandAlreadyProcessed
        then pure (PMCommandDuplicate commandId)
        else do
          outcome <-
            runCommandWithProjections
              targetOptions
              (manager ^. #targetEventStream)
              targetStream
              (command ^. #command)
              ((manager ^. #targetProjections) (command ^. #target))
          pure $ case outcome of
            Right result -> PMCommandAppended result
            Left (StoreFailed (DuplicateEvent (Just duplicateId))) | duplicateId == commandId -> PMCommandDuplicate commandId
            Left (StoreFailed (DuplicateEvent Nothing)) -> PMCommandDuplicate commandId
            Left err -> PMCommandFailed err

    retarget :: Stream targetCi -> Stream (EventStream targetPhi targetRs targetState targetCi targetCo)
    retarget = coerce
```

`runProcessManagerWorker` body (transcribe in chapter 01):

```haskell
runProcessManagerWorker options manager Adapter{source = adapterSource} decodeMessage =
  Streamly.fold Fold.drain $
    Streamly.mapM handleIngested adapterSource
  where
    handleIngested Ingested{envelope = Envelope{payload = message}} =
      case decodeMessage message of
        Nothing -> pure (AckHalt (HaltFatal "process-manager worker could not decode message"))
        Just (recorded, input) -> do
          outcome <- runProcessManagerOnce options manager recorded input
          pure $ case outcome of
            Right _ -> AckOk
            Left err -> AckHalt (HaltFatal (Text.pack (show err)))
```

`eventAlreadyIn` body (transcribe in chapter 01) — note it is a **forward scan** of the
stream, not an index lookup:

```haskell
eventAlreadyIn options streamName eventId =
  Streamly.fold
    (Fold.any (\recorded -> recorded ^. #eventId == eventId))
    (readStreamForwardStream streamName (StreamVersion 0) (options ^. #pageSize))
```

The relevant fields of `RunCommandOptions` (defined in `Keiro.Command`): `retryLimit :: Int`,
`pageSize :: Int32`, `eventIds :: [EventId]`, plus `beforeAppend`, `tracer`, `metadata`.
`runProcessManagerOnce` pins one id per write via `options & #eventIds .~ [theId]`.

**`Keiro.Timer` exports.** `Keiro.Timer` re-exports from `Timer.Types` and `Timer.Schema`:
`TimerId(..)`, `TimerRequest(..)`, `TimerRow(..)`, `TimerStatus(..)`, `scheduleTimerTx`,
`claimDueTimer`, `markTimerFired`, `runTimerWorker`. Types verbatim:

```haskell
-- keiro/src/Keiro/Timer/Types.hs
newtype TimerId = TimerId UUID

data TimerRequest = TimerRequest
  { timerId            :: !TimerId
  , processManagerName :: !Text
  , correlationId      :: !Text
  , fireAt             :: !UTCTime
  , payload            :: !Value
  }

-- keiro/src/Keiro/Timer/Schema.hs
data TimerStatus = Scheduled | Firing | Fired | Cancelled
  -- statusFromText maps any UNKNOWN string to Cancelled (decode fallback)

data TimerRow = TimerRow
  { timerId            :: !TimerId
  , processManagerName :: !Text
  , correlationId      :: !Text
  , fireAt             :: !UTCTime
  , payload            :: !Value
  , status             :: !TimerStatus
  , attempts           :: !Int
  , firedEventId       :: !(Maybe EventId)
  }
```

Storage operation signatures verbatim:

```haskell
scheduleTimerTx :: TimerRequest -> Tx.Transaction ()   -- composes into the manager append tx
claimDueTimer   :: (Store :> es) => UTCTime -> Eff es (Maybe TimerRow)
markTimerFired  :: (Store :> es) => TimerId -> EventId -> Eff es ()
runTimerWorker  :: (Store :> es) => UTCTime -> (TimerRow -> Eff es (Maybe EventId)) -> Eff es (Maybe TimerRow)
```

The three SQL statements, verbatim from `Timer/Schema.hs`. `scheduleTimerStmt`:

```sql
INSERT INTO keiro_timers
  (timer_id, process_manager_name, correlation_id, fire_at, payload, status)
VALUES
  ($1, $2, $3, $4, $5, $6)
ON CONFLICT (timer_id) DO UPDATE
  SET process_manager_name = EXCLUDED.process_manager_name,
      correlation_id = EXCLUDED.correlation_id,
      fire_at = EXCLUDED.fire_at,
      payload = EXCLUDED.payload,
      status = EXCLUDED.status,
      updated_at = now()
  WHERE keiro_timers.status = 'scheduled'
```

`claimDueTimerStmt`:

```sql
WITH due AS (
  SELECT timer_id
  FROM keiro_timers
  WHERE status = 'scheduled'
    AND fire_at <= $1
  ORDER BY fire_at, timer_id
  LIMIT 1
  FOR UPDATE SKIP LOCKED
)
UPDATE keiro_timers kt
SET status = 'firing',
    attempts = kt.attempts + 1,
    updated_at = now()
FROM due
WHERE kt.timer_id = due.timer_id
RETURNING kt.timer_id, kt.process_manager_name, kt.correlation_id, kt.fire_at,
  kt.payload, kt.status, kt.attempts, kt.fired_event_id
```

`markTimerFiredStmt`:

```sql
UPDATE keiro_timers
SET status = 'fired',
    fired_event_id = $2,
    updated_at = now()
WHERE timer_id = $1
```

The decoder and status maps verbatim:

```haskell
timerRowDecoder :: D.Row TimerRow
timerRowDecoder =
  TimerRow
    <$> (TimerId <$> D.column (D.nonNullable D.uuid))
    <*> D.column (D.nonNullable D.text)
    <*> D.column (D.nonNullable D.text)
    <*> D.column (D.nonNullable D.timestamptz)
    <*> D.column (D.nonNullable D.jsonb)
    <*> (statusFromText <$> D.column (D.nonNullable D.text))
    <*> (fromIntegral <$> D.column (D.nonNullable D.int8))
    <*> (fmap EventId <$> D.column (D.nullable D.uuid))

statusFromText :: Text -> TimerStatus
statusFromText = \case
  "scheduled" -> Scheduled
  "firing"    -> Firing
  "fired"     -> Fired
  "cancelled" -> Cancelled
  _           -> Cancelled
```

`runTimerWorker` body verbatim:

```haskell
runTimerWorker now fire = do
  due <- claimDueTimer now
  case due of
    Nothing -> pure Nothing
    Just timer -> do
      fired <- fire timer
      for_ fired (markTimerFired (timer ^. #timerId))
      pure (Just timer)
```

The `keiro_timers` table, verbatim from the bootstrap migration:

```sql
CREATE TABLE IF NOT EXISTS keiro_timers (
  timer_id UUID PRIMARY KEY,
  process_manager_name TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  fire_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  attempts BIGINT NOT NULL DEFAULT 0,
  fired_event_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS keiro_timers_due_idx
  ON keiro_timers (status, fire_at, process_manager_name);
```

**Honest gaps to flag (verified absent in the source):** there is **no** `cancelTimer`
function and **no** cancellation SQL — `Cancelled` exists only as the enum value and the
decode fallback for unknown status strings. There is **no** `next_attempt_at` column and **no**
backoff schedule: the only retry mechanism is that a `Firing` row left by a crash (or a `fire`
that returned `Nothing`) is immediately re-claimable on the next `claimDueTimer` pass. There is
**no** dead-letter table or max-attempts cutoff in keiro 0.1.0.0: `attempts` is recorded and
incremented but nothing acts on it — a poison timer is retried indefinitely (the analog of the
`PMCommandFailed` hazard on the process-manager side). Say all of this plainly.

### The jitsurei worked example (anchor every chapter to these)

`jitsurei` is the runnable worked-example package in the keiro repo
(`/Users/shinzui/Keikaku/bokuno/keiro/jitsurei/src/Jitsurei/`). Verified at the pin:

- **`Jitsurei/FulfillmentProcess.hs`** — `fulfillmentProcessManager`, a process manager named
  `"jitsurei-fulfillment"`. `correlate = orderIdText . eventOrderId`;
  `streamFor = fulfillmentStream . OrderId` (the manager's own `fulfillment-<orderId>`
  stream); `targetEventStream = orderEventStream`;
  `targetProjections = const [orderSummaryInlineProjection]` (so each dispatch runs the order
  summary projection in the dispatch transaction). `handle` always emits
  `ObserveFulfillmentEvent` as its own `command`, and on `PaymentApproved` dispatches one
  `PMCommand { target = orderCommandStream orderId, command = MarkPacked … }`; `timers = []`.
  Run target: `just jitsurei-fulfillment`.
- **`Jitsurei/EscalationProcess.hs`** — `escalationProcessManager`, named
  `"jitsurei-escalation"`. `correlate = incidentIdText . escalationInputIncidentId`;
  manager stream `esc-<incidentId>`; `targetEventStream = incidentEventStream`;
  `targetProjections = const []`. `handle` is a `case`: on `IncidentReported` it advances its
  own state to `Awaiting` and schedules `[escalationTimerRequest incidentId (escalationDeadline
  raisedAt severity)]` (a **severity-derived** deadline; no target command); on `ResponderAcked`
  it advances to `Settled` and dispatches `AcknowledgeIncident` to the incident.
  `escalationTimerRequest` uses a **UUIDv5 of the incident id** as `timerId`, so a redelivered
  `IncidentReported` re-arms the *same* row. `runEscalationTimerWorker` claims a due timer and
  dispatches `EscalateIncident`. Run target: `just jitsurei-escalation` (the brief's target).
- **`Jitsurei/Timers.hs`** — `paymentTimeoutRequest` (a `TimerRequest` for
  `"jitsurei-fulfillment"`) and the minimal worker
  `runPaymentTimeoutWorker now = runTimerWorker now (\_ -> pure (Just (EventId
  paymentTimeoutEventId)))` — the smallest possible `fire` shape.
- **`Jitsurei/Incident.hs`** — the incident aggregate whose transducer makes
  `AcknowledgeIncident` and `EscalateIncident` legal **only from `Triaging`** (states
  `Unreported → Triaging → Acknowledged | Escalated → Resolved`). Whichever of ack/escalate
  fires first wins; the loser is a benign `CommandRejected`, so the escalation-timer/ack race
  is safe and the timer firing is idempotent. The worked example for "keep target commands
  total." Note `incidentStream` and `incidentCommandStream` resolve to the *same* name
  `incident-<id>` — the concrete reason `retarget = coerce` is sound.

Always link these modules and the `just jitsurei-*` targets so the example reads as one story.


## Plan of Work

The work is one milestone per chapter plus preconditions and a final wiring/validation pass.
Each chapter is independently verifiable: after authoring it, `pnpm build` and
`pnpm lint:links` stay green and the chapter renders in the sidebar. Author in order; the
chapters cross-reference each other so the back-links and next-links must be updated together
in M7. Every page goes under `content/docs/keiro/walkthrough/workflow/`.

**Chapter map.** Each row: file, what it walks (source), and the key snippet/diagram it must
carry. Every Haskell/SQL block is transcribed from §Context (which is itself transcribed from
the pinned source); the reader must be able to follow the source line by line.

| File | Walks (source) | Key content |
|---|---|---|
| `00-start-here.mdx` | the whole tour | overview `mermaid`; the **separate-transaction** thesis stated up front; honest-gaps preview; `<Cards>` to all five chapters; cross-links to command-cycle + read-side tours and the explanation/reference companions |
| `01-the-process-manager-dispatch-loop.mdx` | `ProcessManager.hs` | `runProcessManagerOnce` top-to-bottom: `correlate`/`handle`, `deterministicCommandId`, the `eventAlreadyIn` forward-scan guard, `finish`/`dispatchCommands`/`dispatchCommand`, `zip [0 ..]` emit indices, `retarget = coerce`, duplicate-classification cases, and `runProcessManagerWorker` ack semantics |
| `02-the-transaction-model.mdx` | `ProcessManager.hs` (the tx structure) | **separate transactions**, not one atomic commit: `runCommandWithSql` (manager append + `scheduleTimerTx` timers in one tx) vs. `runCommandWithProjections` per dispatch (one tx each); why deterministic ids + `eventAlreadyIn` + store uniqueness make replay a no-op; the `PMStateDuplicate`-still-runs-`finish` recovery; the `PMCommandFailed`→`AckHalt`→retry-forever hazard; a `mermaid` |
| `03-the-types-and-config.mdx` | `ProcessManager.hs`, `Timer/Types.hs`, `Timer/Schema.hs` | every field of `ProcessManager` (7), `ProcessManagerAction` (3), `PMCommand` (2), the three result types, `TimerRequest` (5), `TimerRow` (8), `TimerStatus` (4 ctors), `TimerId`; how jitsurei's two managers populate each field |
| `04-the-timer-schema.mdx` | `Timer/Schema.hs`, the migration | the `keiro_timers` columns and `keiro_timers_due_idx`; `claimDueTimerStmt` CTE with `FOR UPDATE SKIP LOCKED` line by line; the `scheduleTimerStmt` re-arm `ON CONFLICT … WHERE status = 'scheduled'`; `markTimerFiredStmt`; `timerRowDecoder` + `statusFromText` fallback; the **no-cancellation-SQL** and **no-backoff/no-dead-letter** gaps |
| `05-the-timer-worker.mdx` | `Timer.hs` | `runTimerWorker` line by line; at-least-once via `Firing`-then-reclaim; `for_ fired` marks `Fired` only on `Just`; the bare-worker reality; `fire` composing with the command cycle via jitsurei's escalation + payment-timeout workers; tour recap `<Cards>` |

**Milestones.**

- **M0 — Preconditions.** Confirm the toolchain runs, EP-7/EP-10 are landed (the four existing
  chapters + `meta.json` + the explanation/reference companion pages exist), the keiro source
  is readable, and the baseline `pnpm build` + `pnpm lint:links` are green. Re-confirm every
  signature/SQL block in §Context against the source. Acceptance: see Concrete Steps M0.

- **M1 — `00-start-here.mdx` deepened.** Rewrite the landing so it (a) names the six-chapter
  arc, (b) states the separate-transaction thesis and the honest gaps up front, (c) carries an
  overview `mermaid`, (d) links every chapter via `<Cards>` (absolute hrefs), and (e) links the
  command-cycle and read-side tours and the explanation/reference companions. Acceptance:
  builds; one `mermaid`; `<Cards>` resolve; back-link discipline N/A (this is the root).

- **M2 — `01-the-process-manager-dispatch-loop.mdx`.** Walk `runProcessManagerOnce` end to end
  (the *control flow*, deferring the transaction-atomicity argument to chapter 02), plus
  `deterministicCommandId`, `eventAlreadyIn`, and `runProcessManagerWorker`. Acceptance: every
  named function/field appears; `retarget = coerce` explained with the jitsurei
  `incidentStream`/`incidentCommandStream` same-name evidence; worker ack table present.

- **M3 — `02-the-transaction-model.mdx`.** The headline chapter. State the shipped reality
  (separate transactions), contrast it with the notes' atomic claim, prove replay safety, and
  flag the `PMCommandFailed` hazard. Acceptance: the words "separate transaction(s)" / "its own
  transaction" / "not one atomic" appear; the recovery argument (duplicate still runs `finish`)
  is spelled out; a `mermaid` shows Tx1 vs. Tx2…n; links `keep-target-commands-total`.

- **M4 — `03-the-types-and-config.mdx`.** A reference-grade chapter inside the tour: one
  subsection per type with a `<TypeTable>` of its fields, each field tied to where the jitsurei
  managers set it. Acceptance: all 10 process-manager exports' *types* and all 4 timer types
  appear; every field of every record is listed; jitsurei wiring shown for `ProcessManager`.

- **M5 — `04-the-timer-schema.mdx`.** Walk the storage layer. Acceptance: the three SQL
  statements quoted verbatim with line-by-line commentary; the `FOR UPDATE SKIP LOCKED`
  mechanics explained; the re-arm guard explained; `timerRowDecoder`/`statusFromText` covered;
  the no-cancellation-SQL + no-backoff + no-dead-letter gaps each in a `<Callout>`.

- **M6 — `05-the-timer-worker.mdx`.** Walk `runTimerWorker` and how `fire` rejoins the command
  cycle. Acceptance: the 9-line body quoted; at-least-once derived from `Firing`-then-reclaim;
  the `Just`-marks-fired rule; jitsurei's `runEscalationTimerWorker` and
  `runPaymentTimeoutWorker` shown; recap `<Cards>` to the explanation/how-to pages.

- **M7 — meta.json + cross-link wiring.** Replace `walkthrough/workflow/meta.json`'s `pages`
  with the six new slugs in order; delete the three obsolete files
  (`01-the-process-manager.mdx`, `02-the-timer-schema.mdx`, `03-the-timer-worker.mdx`); fix
  every back-link/next-link to point at the new slugs. Acceptance: `meta.json` lists exactly
  the six shipped files; no chapter links to a deleted slug.

- **M8 — Validation.** Run the gate and the depth checklist (Validation and Acceptance).


## Concrete Steps

Run all commands from the repo root `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` unless
stated otherwise. The docs toolchain is **pnpm** on **Node 22**.

### M0 — Preconditions

```bash
# confirm the scaffold + EP-7/EP-10 foundation are present
test -f source.config.ts && test -f src/lib/source.ts && echo "scaffold present"
test -f content/docs/keiro/walkthrough/workflow/meta.json && echo "EP-10 workflow tour present"
test -f content/docs/keiro/explanation/process-managers-and-sagas.mdx && echo "explanation present"
test -f content/docs/keiro/reference/process-manager.mdx && echo "reference present"
ls content/docs/keiro/walkthrough/command-cycle content/docs/keiro/walkthrough/read-side >/dev/null \
  && echo "sibling tours present (for cross-links)"

# baseline build + link-check must be green BEFORE editing
pnpm install
pnpm build
pnpm lint:links
```

Expected (abridged):

```text
scaffold present
EP-10 workflow tour present
explanation present
reference present
sibling tours present (for cross-links)
✓ built in <N>s
... lint:links: OK
```

Confirm the keiro source and re-check the signatures you will transcribe:

```bash
cd /Users/shinzui/Keikaku/bokuno/keiro && git rev-parse HEAD
# expect 94c85e2… (workflow modules identical to 3f5dc9c)
ls keiro/src/Keiro/ProcessManager.hs keiro/src/Keiro/Timer.hs \
   keiro/src/Keiro/Timer/Schema.hs keiro/src/Keiro/Timer/Types.hs
ls jitsurei/src/Jitsurei/FulfillmentProcess.hs jitsurei/src/Jitsurei/EscalationProcess.hs \
   jitsurei/src/Jitsurei/Timers.hs jitsurei/src/Jitsurei/Incident.hs
grep -n 'CREATE TABLE IF NOT EXISTS keiro_timers\|keiro_timers_due_idx' \
   keiro-migrations/sql-migrations/2026-05-17-00-00-00-keiro-bootstrap.sql
```

If any precondition fails, stop and resolve it before authoring (EP-7 and EP-10 are HARD
DEPs; a red baseline build must be fixed first).

### M1–M6 — Author the chapters

Copy `content/docs/_templates/code-walkthrough.mdx` as the starting shape for each chapter.
Author components bare (no imports). Put the source path in a comment on the first line inside
every Haskell/SQL fence (e.g. `-- keiro/src/Keiro/ProcessManager.hs`), and note it in prose
above the fence. Every fence carries a language tag (`haskell`, `sql`, `mermaid`, `json`,
`text`, `bash`). Each non-root chapter opens with a back-link `<Callout>`:

```mdx
<Callout type="info">
  Part of the [workflow code walkthrough](/docs/keiro/walkthrough/workflow/00-start-here).
  Read [the previous chapter](/docs/keiro/walkthrough/workflow/0N-...) first.
</Callout>
```

Author the content per the chapter map and the milestone acceptance criteria above, drawing
every snippet from §Context. Detailed guidance per chapter:

- **`00-start-here.mdx`** — frontmatter `title: "00 — Start here"`. Open by naming the engine
  (process managers + durable timers) and the six-chapter arc. State the thesis: *the shipped
  `runProcessManagerOnce` uses separate transactions — manager state + timers commit together,
  each dispatch commits on its own — and replay is safe via deterministic ids, not atomicity.*
  Preview the honest gaps (no cancellation SQL, bare worker, no backoff/dead-letter). Include
  an overview `mermaid`:

  ````mdx
  ```mermaid
  flowchart TD
    E["source event (RecordedEvent, input)"] --> Once["runProcessManagerOnce"]
    Once --> Tx1["Tx 1: manager append + scheduleTimerTx timers (one transaction)"]
    Once --> Disp["dispatch loop: each PMCommand in its OWN transaction"]
    Tx1 --> Timers[("keiro_timers")]
    Worker["runTimerWorker (caller-driven tick)"] --> Claim["claimDueTimer: FOR UPDATE SKIP LOCKED"]
    Timers --> Claim
    Claim --> Fire["fire -> dispatch a command -> markTimerFired (only on Just)"]
  ```
  ````

  End with a `<Cards>` block linking all five chapters (absolute hrefs) and a short list of the
  source files the tour reads, plus links to
  `/docs/keiro/explanation/process-managers-and-sagas`,
  `/docs/keiro/explanation/durable-timers`,
  `/docs/keiro/walkthrough/command-cycle/00-start-here` (process managers dispatch *through*
  the command cycle), and `/docs/keiro/walkthrough/read-side/02-the-read-model-query-path`
  (sagas/routers query read models to pick targets).

- **`01-the-process-manager-dispatch-loop.mdx`** — `title: "01 — The process manager: the
  dispatch loop"`. Walk `runProcessManagerOnce` from the `let` block down, quoting it in
  chunks. Cover: `correlate input` → correlation id; `handle input` → the whole
  `ProcessManagerAction` decided purely up front; `deterministicCommandId name correlationId
  sourceEventId (-1)` (explain the **`-1`** emit index that keeps the manager append distinct
  from dispatched commands at `0,1,2,…`); `managerOptions = options & #eventIds .~
  [managerEventId]`; the `eventAlreadyIn` forward-scan pre-check (quote its body; explain it
  scans the stream from version 0 with `Fold.any`, so it is O(stream length), the reason a
  benign replay is recognized before re-running). Then `finish`/`dispatchCommands`
  (`zip [0 ..]` numbers the commands → emit index → deterministic id, so the *n*-th dispatch
  always gets the same id on replay) and `dispatchCommand` (compute `commandId`, pre-check
  `eventAlreadyIn` on the *target* stream, then `runCommandWithProjections`, then classify the
  outcome into `PMCommandAppended` / `PMCommandDuplicate` / `PMCommandFailed`). Explain
  `retarget = coerce`: a `PMCommand` names its target as `Stream targetCi` but
  `runCommandWithProjections` wants `Stream (EventStream …)`; `Stream` is a phantom newtype
  over a name, so `coerce` re-types it for free — and jitsurei's `incidentStream` and
  `incidentCommandStream` both resolve to `incident-<id>`, the concrete proof the cast is
  sound. Close with `runProcessManagerWorker`: quote the body and give the ack table —

  ````mdx
  ```text
  decode failure (Nothing)      -> AckHalt (HaltFatal "…could not decode message")
  Left err from the reaction    -> AckHalt (HaltFatal (show err))
  Right _ (any commandResults)  -> AckOk
  ```
  ````

  Note that `PMCommandFailed` lives *inside* a `Right`'s `commandResults`, so a worker that
  acks on `Right` will *not* halt on a failed dispatch — the hazard is for a higher-level loop
  that inspects results; forward-link chapter 02 and
  `/docs/keiro/how-to/keep-target-commands-total`. Defer the *atomicity* argument to chapter 02
  (say so explicitly). Next-link: `02-the-transaction-model`.

- **`02-the-transaction-model.mdx`** — `title: "02 — The transaction model"`. The headline.
  Open by stating the shipped reality and naming the divergence: keiro's in-repo
  `docs/research/*`/`docs/plans/*` notes describe "one atomic multi-stream commit," but the
  shipped code uses **separate transactions**. Quote the two call sites: the manager append's
  `runCommandWithSql managerOptions … (\_ -> traverse_ scheduleTimerTx (action ^. #timers))`
  — explain that `scheduleTimerTx :: TimerRequest -> Tx.Transaction ()` composes *into that
  same* Hasql transaction, so "advance my state and arm my timers" is **atomic together**; and
  the per-command `runCommandWithProjections targetOptions … (targetProjections …)` — explain
  that each dispatched command appends its target events **and** runs its inline projections in
  **its own** transaction, so N dispatches are N separate commits. State plainly: this is
  **not** one atomic multi-stream commit. Then derive **why replay is still safe without
  atomicity**: every write id is `deterministicCommandId(name, correlationId, sourceEventId,
  emitIndex)`, a v5 UUID that is identical on every replay of the same source event; each write
  is pre-checked by `eventAlreadyIn` and the store's `timer_id`/event-id uniqueness constraint
  collapses a duplicate to `PMStateDuplicate`/`PMCommandDuplicate`; and crucially `finish` runs
  the **whole** dispatch loop **even on `PMStateDuplicate`**, so a crash *between* the manager
  append (Tx1) and a later dispatch (Tx k) is recovered: on replay the manager append is a
  duplicate, but the dispatch loop re-runs and the missing dispatch lands. Include a `mermaid`:

  ````mdx
  ```mermaid
  sequenceDiagram
    participant R as runProcessManagerOnce
    participant DB as Postgres
    R->>DB: Tx1 — append manager state + scheduleTimerTx (all timers)
    Note over R,DB: atomic together
    R->>DB: Tx2 — dispatch PMCommand[0] (+ inline projections)
    R->>DB: Tx3 — dispatch PMCommand[1] (+ inline projections)
    Note over R,DB: each dispatch is its own commit; deterministic ids make replay a no-op
  ```
  ````

  End with the **`PMCommandFailed` hazard** as a `<Callout type="warn">`: a non-duplicate
  `CommandError` from a dispatched command becomes `PMCommandFailed`; a results-inspecting
  worker treats that as fatal and retries the source event forever, so target aggregates must
  model benign rejections as **total** transitions — link
  `/docs/keiro/how-to/keep-target-commands-total` and jitsurei's `Incident.hs` (the
  `Triaging`-only guard). Cross-link the command-cycle write-path chapter
  `/docs/keiro/walkthrough/command-cycle/02-the-transactional-write-path` for what a single
  command's transaction does, and the read-side projections chapter
  `/docs/keiro/walkthrough/read-side/03-projections` for what `targetProjections` run.
  Next-link: `03-the-types-and-config`.

- **`03-the-types-and-config.mdx`** — `title: "03 — The ProcessManager types and config"`.
  Reference-grade. One subsection per type, each with a short prose intro, the verbatim
  definition, and a `<TypeTable>` listing every field with its type and a one-line meaning.
  Cover, in order: `ProcessManager` (all 7 fields — tie each to how `fulfillmentProcessManager`
  and `escalationProcessManager` set it: `name`, `correlate`, `eventStream`, `streamFor`,
  `targetEventStream`, `targetProjections` (= `const [orderSummaryInlineProjection]` vs.
  `const []`), `handle`); `ProcessManagerAction` (`command`/`commands`/`timers`); `PMCommand`
  (`target`/`command`); `PMCommandResult` (the three ctors and when each arises);
  `PMStateResult` (note: no failure ctor — a genuine manager-append error aborts via the outer
  `Left CommandError`); `ProcessManagerResult` (`managerResult`/`commandResults`/
  `timersScheduled`); then the timer types `TimerId`, `TimerRequest` (5 fields — note
  `payload :: Value` is opaque JSON carried to `fire`, and `timerId` choice drives idempotency),
  `TimerStatus` (4 ctors; note `Cancelled` is also the decode fallback), `TimerRow` (8 fields —
  the request fields plus `status`/`attempts`/`firedEventId`). Use a `<TypeTable>` per record;
  example shape:

  ````mdx
  ```mdx
  <TypeTable
    type={{
      command:  { type: "ci",                 description: "Advance the manager's own state stream." },
      commands: { type: "[PMCommand targetCi]", description: "Dispatch to target aggregates." },
      timers:   { type: "[TimerRequest]",      description: "Durable timers to schedule." },
    }}
  />
  ```
  ````

  Anchor with a jitsurei block showing `fulfillmentProcessManager`'s record literal (from
  §jitsurei) so the reader sees real values flow into the seven fields. Next-link:
  `04-the-timer-schema`.

- **`04-the-timer-schema.mdx`** — `title: "04 — The timer schema and claim SQL"`. Lead with the
  `keiro_timers` ` ```sql ` table + `keiro_timers_due_idx` from §Context, walking each column
  (`timer_id` PK = the caller-chosen `TimerId`; `status` default `'scheduled'`; `attempts`
  default 0; `fired_event_id` nullable until fired; `payload` JSONB). Then `scheduleTimerStmt`:
  quote it and dwell on `ON CONFLICT (timer_id) DO UPDATE … WHERE keiro_timers.status =
  'scheduled'` — a conflicting row is **re-armed only while still `Scheduled`**, so a fired or
  cancelled timer is never resurrected; this is what makes "reschedule the same `timerId`"
  idempotent (jitsurei's `escalationTimerRequest` uses a UUIDv5 of the incident id precisely so
  a redelivered `IncidentReported` re-arms the same row). Then `claimDueTimerStmt`: walk the
  `due` CTE (`status = 'scheduled' AND fire_at <= $1`, `ORDER BY fire_at, timer_id` for a
  stable fair pick, `LIMIT 1`, `FOR UPDATE SKIP LOCKED`), then the outer `UPDATE … FROM due SET
  status = 'firing', attempts = attempts + 1 … RETURNING …`. Explain `SKIP LOCKED` is the whole
  trick: a concurrent worker skips a row another claim already locked and takes the next, so two
  workers never claim the same timer and no worker blocks; the `keiro_timers_due_idx (status,
  fire_at, process_manager_name)` index keeps the claim cheap. Then `markTimerFiredStmt`
  (sets `status = 'fired'`, records `fired_event_id`). Then `timerRowDecoder` + `statusFromText`
  (the four known strings plus the unknown→`Cancelled` fallback; so `Cancelled` is both
  "withdrawn" and the defensive decode default). Close with three `<Callout>` gaps:
  **no cancellation SQL** ships (no `cancelTimer`; `cancelled` rows arise only from the decode
  fallback or a future migration); **no backoff** (`attempts` is incremented but there is no
  `next_attempt_at` and no delay — a `Firing` row is immediately re-claimable); **no dead-letter
  / max-attempts** (a poison timer retries indefinitely; the operator must watch `attempts`).
  Next-link: `05-the-timer-worker`.

- **`05-the-timer-worker.mdx`** — `title: "05 — The timer worker"`. Quote the 9-line
  `runTimerWorker` body and walk it: claims **at most one** due timer via `claimDueTimer now`
  (the `SKIP LOCKED` CTE from chapter 04); returns `Nothing` immediately when nothing is due
  (the caller's loop then sleeps); otherwise runs the caller's `fire timer` and calls
  `markTimerFired` **only when `fire` returned `Just eventId`** (`for_ fired` is a no-op on
  `Nothing`). Derive **at-least-once**: a `fire` returning `Nothing`, or a crash before
  `markTimerFired`, leaves the row `Firing`, and a `Firing` row is re-claimable on a later pass
  (forward-link `/docs/keiro/explanation/durable-timers`). State the **bare-worker** reality: no
  loop, no clock (the caller passes `now`), no supervisor — the caller drives the tick (link
  `/docs/keiro/how-to/drive-the-timer-worker`). Then **how `fire` composes with the command
  cycle**: quote jitsurei's `runEscalationTimerWorker` (reads `incidentIdFromTimer` from
  `processManagerName`/`correlationId`, dispatches `EscalateIncident` via `runCommand`, returns
  a `Just firedEventId`) and the minimal `runPaymentTimeoutWorker` (`\_ -> pure (Just …)`).
  Emphasize the two compositions: **routing** (the timer carries its own
  `processManagerName`/`correlationId`/`payload`, so the worker needs no extra state) and
  **idempotency** (the dispatched command runs through the command cycle and the target's
  totality guard makes a late escalate a benign rejection — link
  `/docs/keiro/how-to/keep-target-commands-total`). End with a recap paragraph and a `<Cards>`
  to `/docs/keiro/explanation/process-managers-and-sagas`,
  `/docs/keiro/explanation/durable-timers`, and `/docs/keiro/how-to/drive-the-timer-worker`.

### M7 — meta.json + cross-link wiring

Replace `content/docs/keiro/walkthrough/workflow/meta.json` with the six-chapter order:

```json
{
  "title": "Workflow Walkthrough",
  "pages": [
    "00-start-here",
    "01-the-process-manager-dispatch-loop",
    "02-the-transaction-model",
    "03-the-types-and-config",
    "04-the-timer-schema",
    "05-the-timer-worker"
  ]
}
```

Delete the three obsolete files so no stale slug remains:

```bash
rm content/docs/keiro/walkthrough/workflow/01-the-process-manager.mdx
rm content/docs/keiro/walkthrough/workflow/02-the-timer-schema.mdx
rm content/docs/keiro/walkthrough/workflow/03-the-timer-worker.mdx
```

(The new `04-the-timer-schema.mdx` and `05-the-timer-worker.mdx` are distinct files; the
deletes above remove the **old** `02`/`03` slugs.) Then grep for any link still pointing at a
deleted slug and fix it:

```bash
grep -rn '01-the-process-manager"' content/docs/keiro/walkthrough/workflow/ \
  || echo "no stale 01 link"
grep -rn 'workflow/02-the-timer-schema\|workflow/03-the-timer-worker' content/docs/keiro/ \
  | grep -v 'workflow/04-the-timer-schema\|workflow/05-the-timer-worker' \
  || echo "no stale 02/03 workflow links"
```

Do **not** edit `content/docs/keiro/walkthrough/meta.json` (already lists `"workflow"`) or the
shared hub `walkthrough/index.mdx` (EP-19 owns the hub `<Card>`).

### M8 — Build, link-check, depth checklist

```bash
pnpm typecheck
pnpm build
pnpm lint:links
```

Then run the depth-checklist greps in Validation and Acceptance.


## Validation and Acceptance

Exercise the system and observe specific behaviors. Acceptance is phrased as what a reader can
verify, not internal attributes.

1. **The tour builds and link-checks clean.** From the repo root, `pnpm build` (`vite build`)
   exits 0 with **zero** crawler warnings (no `unhandledRejection` / `Failed to fetch` lines in
   the log), and `pnpm lint:links` exits 0. Snippets are not compiled by the docs build; their
   accuracy is guaranteed by transcription from the pinned source (step 6).

   ```text
   ✓ built in <N>s
   ... lint:links: OK (no broken internal links)
   ```

2. **Renders in the sidebar in the new order.** `pnpm dev`, open
   `http://localhost:3000/docs/keiro/walkthrough/workflow`. The "Workflow Walkthrough" group
   shows six chapters in `meta.json` order (`00-start-here` … `05-the-timer-worker`), each
   opening without a 404 and showing its frontmatter `title`. The three old slugs
   (`01-the-process-manager`, the old `02-the-timer-schema`, the old `03-the-timer-worker`) no
   longer resolve.

3. **No relative links.** Every cross-link is absolute `/docs/keiro/...`:

   ```bash
   grep -rn '\](\.\./\|\](\./' content/docs/keiro/walkthrough/workflow/
   ```

   Expected: no matches.

4. **Every fence is tagged.** No bare ```` ``` ```` opens a code block:

   ```bash
   grep -rn '^```$' content/docs/keiro/walkthrough/workflow/*.mdx
   ```

   Expected: no matches (every fence line is ` ```lang ` or a closing fence preceded by an
   opening tagged fence — inspect any hit to confirm it is a closing fence, not an untagged
   opener).

5. **Command-cycle phrasing.** The tour uses **Hydrate → Transduce → Append** and never
   "Decide" as the cycle phase name:

   ```bash
   grep -rni 'decide' content/docs/keiro/walkthrough/workflow/
   ```

   Expected: no matches naming a cycle phase (an ordinary-English "decide" is acceptable but
   prefer to avoid it; if a hit is ordinary English, confirm it is not labeling the cycle).

6. **Depth checklist — every export and the SQL are covered.** Each grep must return at least
   one hit, proving the symbol is documented somewhere in the tour:

   ```bash
   cd content/docs/keiro/walkthrough/workflow
   # ProcessManager exports
   for sym in ProcessManager ProcessManagerAction PMCommand ProcessManagerResult \
              PMCommandResult PMStateResult runProcessManagerOnce runProcessManagerWorker \
              deterministicCommandId eventAlreadyIn PMCommandAppended PMCommandDuplicate \
              PMCommandFailed PMStateAppended PMStateDuplicate retarget; do
     grep -rqn "$sym" . && echo "OK $sym" || echo "MISSING $sym"
   done
   # Timer exports + SQL
   for sym in TimerId TimerRequest TimerRow TimerStatus Scheduled Firing Fired Cancelled \
              scheduleTimerTx claimDueTimer markTimerFired runTimerWorker timerRowDecoder \
              statusFromText 'FOR UPDATE SKIP LOCKED' 'ON CONFLICT' keiro_timers \
              keiro_timers_due_idx; do
     grep -rqn "$sym" . && echo "OK $sym" || echo "MISSING $sym"
   done
   ```

   Acceptance: every line prints `OK …`, no `MISSING …`. (If a `MISSING` appears, the
   corresponding type/function/SQL is not yet walked — author it before declaring the milestone
   done.)

7. **The separate-transaction model is stated, not the atomic myth.** Chapter 02 must say the
   model is separate transactions:

   ```bash
   grep -rni 'separate transaction\|its own transaction\|not.*atomic\|two transaction' \
     content/docs/keiro/walkthrough/workflow/02-the-transaction-model.mdx
   ```

   Expected: matches present. Conversely, no chapter should claim a single atomic multi-stream
   commit:

   ```bash
   grep -rni 'atomic multi-stream\|single atomic commit\|one atomic commit across' \
     content/docs/keiro/walkthrough/workflow/
   ```

   Expected: no matches (any "atomic" hit must be the *manager-append + timers* atomicity or a
   sentence explicitly denying multi-stream atomicity).

8. **Honest gaps are present.** The no-cancellation-SQL, bare-worker, and no-backoff/dead-letter
   gaps are documented:

   ```bash
   grep -rni 'no cancel\|cancelTimer\|bare worker\|no backoff\|dead.?letter\|no loop' \
     content/docs/keiro/walkthrough/workflow/
   ```

   Expected: matches in chapters 04 and 05 (and the preview in 00).

9. **Names match the pinned source.** Spot-check that every symbol used in a snippet exists in
   the keiro source at the pin:

   ```bash
   cd /Users/shinzui/Keikaku/bokuno/keiro
   grep -rn 'runProcessManagerOnce ::\|runProcessManagerWorker ::\|deterministicCommandId ::\|eventAlreadyIn ::' keiro/src/Keiro/ProcessManager.hs
   grep -rn 'runTimerWorker ::\|claimDueTimer ::\|markTimerFired ::\|scheduleTimerTx ::' keiro/src/Keiro/Timer.hs keiro/src/Keiro/Timer/Schema.hs
   grep -rn 'FOR UPDATE SKIP LOCKED\|ON CONFLICT (timer_id)' keiro/src/Keiro/Timer/Schema.hs
   ```

   Acceptance: every function/type/SQL clause named in a snippet appears in the source with the
   signature/text transcribed in §Context. Optionally, `cabal build jitsurei` for extra
   assurance the worked-example anchors compile.


## Idempotence and Recovery

All steps are file authoring and safe to repeat. Re-running `pnpm typecheck` / `pnpm build` /
`pnpm lint:links` / `pnpm dev` is idempotent; editing or recreating an `.mdx` or `meta.json`
overwrites it. The `rm` of the three obsolete chapters (M7) is the only destructive step: it is
safe because their content is fully subsumed by the new six-chapter set, and it is recoverable
from git (`git checkout -- content/docs/keiro/walkthrough/workflow/<file>` restores a deleted
chapter if needed). No database or keiro source is modified — the keiro tree is opened
read-only for cross-checking.

Recovery:
- If a page breaks the build, the error names the offending `.mdx` file and line; fix the MDX
  (most often an untagged fence, a stray `<` in prose, or a component used with an `import`) and
  rebuild.
- If `lint:links` reports a broken link, it is almost always a chapter linking a deleted slug
  (M7) or a typo'd absolute path — fix the link, never switch to a relative path.
- If the sidebar order is wrong, edit `walkthrough/workflow/meta.json`'s `pages` array; this
  plan owns that file outright.
- If a snippet diverges from the source at the pin, fix the snippet to match the source (the
  source is authoritative over this plan's transcription) and record the divergence in Surprises
  & Discoveries.
- If a forward-link to a not-yet-shipped sibling walkthrough page is needed, park it on
  `/docs/keiro/walkthrough` and name the target in prose; do not author a link to a missing
  page (it would trip the crawler). EP-19 may upgrade such parked links. (No such parked link is
  required by this plan — every sibling page it links already exists.)


## Interfaces and Dependencies

**Documented subject (Haskell + SQL), verified at the keiro pin (`94c85e2`; workflow modules
identical to `3f5dc9c`):**

- `Keiro.ProcessManager` (`keiro/src/Keiro/ProcessManager.hs`) — `ProcessManager`,
  `ProcessManagerAction`, `PMCommand`, `PMCommandResult`, `PMStateResult`,
  `ProcessManagerResult`, `runProcessManagerOnce`, `runProcessManagerWorker`,
  `deterministicCommandId`, `eventAlreadyIn`.
- `Keiro.Timer` / `Keiro.Timer.Types` / `Keiro.Timer.Schema`
  (`keiro/src/Keiro/Timer.hs`, `Timer/Types.hs`, `Timer/Schema.hs`) — `TimerId`,
  `TimerRequest`, `TimerRow`, `TimerStatus`, `scheduleTimerTx`, `claimDueTimer`,
  `markTimerFired`, `runTimerWorker`, and the internal statements `scheduleTimerStmt`,
  `claimDueTimerStmt`, `markTimerFiredStmt`, `timerRowDecoder`, `statusFromText`.
- The `keiro_timers` table + `keiro_timers_due_idx`
  (`keiro-migrations/sql-migrations/2026-05-17-00-00-00-keiro-bootstrap.sql`).
- Lower primitives a process manager dispatches through, defined in `Keiro.Command` /
  `Keiro.Projection`: `RunCommandOptions` (`retryLimit`, `pageSize`, `eventIds`, …),
  `runCommand`, `runCommandWithSql`, `runCommandWithProjections`, `InlineProjection`. Referenced
  and linked to `/docs/keiro/reference/command` and the command-cycle/read-side tours; **not**
  re-documented here (owned by EP-8/EP-9/EP-13/EP-14).
- `jitsurei` (`keiro/jitsurei/src/Jitsurei/{FulfillmentProcess,EscalationProcess,Timers,Incident}.hs`)
  — worked-example anchors; run targets `just jitsurei-fulfillment`, `just jitsurei-escalation`.

**Sibling-plan / sibling-tour dependencies (link absolute):**
- HARD DEP on EP-7 (`docs/plans/7-…`): the walkthrough hub, the jitsurei module map,
  `docs/keiro-source-sync.md`, and the shared conventions (absolute links; the `walkthrough/`
  subdirectory layout). Complete.
- HARD DEP on EP-10 (`docs/plans/10-…`): the workflow tour subdirectory and its
  explanation/reference/how-to companion pages this tour links to
  (`/docs/keiro/explanation/process-managers-and-sagas`,
  `/docs/keiro/explanation/durable-timers`, `/docs/keiro/explanation/workflow-roadmap`,
  `/docs/keiro/reference/process-manager`, `/docs/keiro/reference/timers`,
  `/docs/keiro/how-to/keep-target-commands-total`, `/docs/keiro/how-to/drive-the-timer-worker`).
  Complete.
- SOFT DEP on EP-13 (`docs/plans/13-…`, command-cycle tour) and EP-14 (`docs/plans/14-…`,
  read-side tour): process managers dispatch through the command cycle and may query read
  models; this tour cross-links those tours' chapters (all of which already exist from EP-8/EP-9
  and are deepened in-place by EP-13/EP-14). Non-blocking.
- INTEGRATION with EP-19 (`docs/plans/19-…`): EP-19 owns the shared
  `walkthrough/index.mdx` hub `<Card>` and the top-level `walkthrough/meta.json` ordering and
  runs the whole-tree gate. This plan does **not** touch those; it only keeps
  `walkthrough/workflow/meta.json` in sync.

**Tooling / app (TypeScript, the docs site — TanStack Start static SPA):** fumadocs
(`fumadocs-core`, `fumadocs-ui`, `fumadocs-mdx`) — MDX + sidebar from `meta.json`; built-in
components `Callout`, `Steps`, `Tabs`, `Cards`/`Card`, `TypeTable` registered in
`src/components/mdx.tsx` (author bare, no imports). `pnpm dev` = `vite dev`; `pnpm build` =
`vite build` (static SPA in `.output/public`); `pnpm typecheck` = `fumadocs-mdx && tsc
--noEmit`; `pnpm lint:links` = the intra-doc link checker. pnpm + Node 22.

**Files this plan creates/owns (all under `content/docs/keiro/walkthrough/workflow/`):**

```text
00-start-here.mdx                            (rewritten;  "00 — Start here")
01-the-process-manager-dispatch-loop.mdx     (new;        "01 — The process manager: the dispatch loop")
02-the-transaction-model.mdx                 (new;        "02 — The transaction model")
03-the-types-and-config.mdx                  (new;        "03 — The ProcessManager types and config")
04-the-timer-schema.mdx                      (rewritten;  "04 — The timer schema and claim SQL")
05-the-timer-worker.mdx                      (rewritten;  "05 — The timer worker")
meta.json                                    (rewritten;  six chapters in order)
```

**Files this plan deletes:** the obsolete `01-the-process-manager.mdx`,
`02-the-timer-schema.mdx`, `03-the-timer-worker.mdx` (their content subsumed by the new set).

**Files this plan does NOT touch:** `content/docs/keiro/walkthrough/index.mdx`,
`content/docs/keiro/walkthrough/meta.json` (already lists `"workflow"`), every sibling
walkthrough subdirectory, and every page outside `walkthrough/workflow/`.

**Postconditions / interfaces that must exist at the end of the plan:**
- The six chapter files and `meta.json` exist; the three old chapter files are gone.
- `pnpm typecheck` is clean; `pnpm build` exits 0 with zero crawler warnings; `pnpm lint:links`
  exits 0.
- The workflow subtree renders in the sidebar in the new six-chapter order.
- Every `Keiro.ProcessManager` and `Keiro.Timer` export and all three timer SQL statements are
  covered (Validation step 6 returns all `OK`).
- The separate-transaction model is stated in chapters 00 and 02 and the atomic-multi-stream
  myth appears nowhere (Validation step 7); the honest gaps are documented (Validation step 8).
- Every Haskell/SQL snippet uses only names present in the keiro source at the pin (Validation
  step 9); every cross-link is absolute; every fence is language-tagged.
