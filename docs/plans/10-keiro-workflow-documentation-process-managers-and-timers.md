---
id: 10
slug: keiro-workflow-documentation-process-managers-and-timers
title: "Keiro workflow documentation: process managers and timers"
kind: exec-plan
created_at: 2026-06-01T17:36:29Z
master_plan: "docs/masterplans/2-keiro-framework-documentation-set.md"
---

# Keiro workflow documentation: process managers and timers

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, the keiro documentation set (under `content/docs/keiro/` in this
repository — a fumadocs + TanStack Start static-SPA + MDX site) gains a complete, accurate,
navigable slice for keiro's **workflow engine**: **process managers** (keiro's name for the
stateful, event-driven coordinator that some frameworks call a *saga*) and **durable
timers** (rows in a PostgreSQL table that a worker wakes up at a future time). A reader who
lands on `/docs/keiro` and follows the workflow pages can:

- **understand** what a process manager *is* — a coordinator that, when it sees an incoming
  event, (a) steps its own private, event-sourced "manager" state stream keyed by a
  correlation id, (b) dispatches commands to one or more *target* aggregates, and (c)
  schedules durable timers — and how it differs from keiro's stateless content-based router
  (`Keiro.Router`, documented by EP-8); learn that keiro ships **no separate saga
  primitive** (a saga is just a process manager whose `handle` emits compensating commands);
  and understand keiro's durable-timer lifecycle (`Scheduled → Firing → Fired/Cancelled`),
  its at-least-once firing guarantee, and the `FOR UPDATE SKIP LOCKED` claim that lets many
  workers share one timer table;
- **look up** the exact Haskell signatures of `Keiro.ProcessManager`
  (`ProcessManager`, `ProcessManagerAction`, `PMCommand`, the result types,
  `runProcessManagerOnce`, `runProcessManagerWorker`, `deterministicCommandId`,
  `eventAlreadyIn`) and `Keiro.Timer` (`TimerId`, `TimerRequest`, `TimerRow`, `TimerStatus`,
  `scheduleTimerTx`, `claimDueTimer`, `markTimerFired`, `runTimerWorker`) plus the
  `keiro_timers` table schema, in **reference** pages;
- **follow a tutorial** that defines a `correlate` function, a manager `EventStream` and a
  target `EventStream`, and a `handle` that emits one command, then runs
  `runProcessManagerOnce` against a fresh store — anchored to the real
  `jitsurei/src/Jitsurei/FulfillmentProcess.hs` and the `just jitsurei-fulfillment` target;
- **complete how-to tasks**: run a process manager as a live subscription over a shibuya
  kiroku adapter; write a saga with compensation; build a polling loop around the bare timer
  worker and bind a fired timer back to a process manager; and keep target commands *total*
  so a benign rejection never wedges the worker;
- **read a code walkthrough** — an ordered tour over the real
  `keiro/keiro/src/Keiro/ProcessManager.hs` and `Keiro/Timer/*.hs` source — covering the
  `runProcessManagerOnce` control flow and dispatch loop, the timer claim SQL and re-arm
  guard, and how `runTimerWorker` composes with the command cycle.

You can see it working by running the docs dev server (`pnpm dev`, i.e. `vite dev`) — or a
production build with `pnpm build && pnpm start` — and browsing
`http://localhost:3000/docs/keiro`: the workflow explanation, reference, how-to, tutorial,
and `walkthrough/workflow/` pages appear in the sidebar in `meta.json` order; Haskell
snippets render in PragmataPro with ligatures; and the process-manager and timer mermaid
diagrams render interactively.

This is a **content** plan. It populates `content/docs/keiro/` only — it does not build the
app, the highlighter, the font, the Mermaid component, or the IA/template system (those are
owned by MasterPlan #1's plans, already complete). Crucially, it documents keiro **as
shipped at the pinned upstream commit `3f5dc9c` (keiro 0.1.0.0)**: where the keiro repo's own
`docs/research/*` and `docs/plans/*` notes diverge from the shipped code, this plan trusts
the **source**. The planned v2 durable-execution workflow engine (`Keiro.Workflow`, named
steps, `keiro_workflow_steps`/`keiro_awakeables` tables) **does not exist** in the tree and
is documented only as a clearly labelled roadmap, never as a real API.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [ ] M0. Preconditions verified — toolchain present, baseline build clean, EP-7 Complete
      (keiro landing/getting-started/core-concepts pages, the jitsurei module map, and
      `docs/keiro-source-sync.md` exist; `walkthrough/` lists `workflow` or will be added),
      keiro source readable at commit `3f5dc9c`.
- [ ] M1. Explanation pages authored (`process-managers-and-sagas`, `durable-timers`,
      `workflow-roadmap`).
- [ ] M2. Reference pages authored (`process-manager`, `timers`).
- [ ] M3. Tutorial authored (`your-first-process-manager`).
- [ ] M4. How-to guides authored (`run-a-process-manager-as-a-subscription`,
      `write-a-saga-with-compensation`, `drive-the-timer-worker`, `keep-target-commands-total`).
- [ ] M5. Walkthrough authored under `walkthrough/workflow/` (`00-start-here`,
      `01-the-process-manager`, `02-the-timer-schema`, `03-the-timer-worker`) + its `meta.json`.
- [ ] M6. meta.json appends done (explanation/reference/how-to/tutorials section files +
      new `walkthrough/workflow/meta.json` + `workflow` present in `walkthrough/meta.json`);
      `pnpm typecheck` clean; `pnpm build` exits 0 with zero crawler warnings; snippet/framing
      checks pass; v2 roadmap page shows no shipped-looking v2 API.


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

(None yet. Record here any further divergence between the keiro repo's notes and the shipped
source discovered while authoring — the Decision Log already records the ones found during
research.)


## Decision Log

Record every decision made while working on the plan.

- Decision: Document the workflow subsystem **as shipped at commit `3f5dc9c` (keiro
  0.1.0.0)**, trusting the source over the keiro repo's `docs/research/*` and `docs/plans/*`
  notes, which predate the implementation and diverge from it.
  Rationale: self-containment and accuracy; the notes describe an earlier design. Concrete
  confirmed deltas are listed below.
  Date: 2026-06-01
- Decision: The `ProcessManager` API is a single `handle :: input -> ProcessManagerAction ci
  targetCi`, **not** the design note's `pmStep :: s -> eIn -> (s, [cmd])`. The manager's own
  state advance is expressed as the `command :: ci` field of `ProcessManagerAction`, applied
  to the manager's own `eventStream`; the target dispatches are the `commands :: [PMCommand
  targetCi]` field; timers are `timers :: [TimerRequest]`.
  Rationale: verified verbatim in `keiro/keiro/src/Keiro/ProcessManager.hs` at `3f5dc9c`.
  Date: 2026-06-01
- Decision: Document the **two-transaction model** honestly, contradicting the design note's
  "one atomic multi-stream commit". In `runProcessManagerOnce`, the manager-state append
  **and its timers** commit together in **one** transaction (via
  `Keiro.Command.runCommandWithSql`, with `scheduleTimerTx` composed into that transaction's
  SQL); **each** dispatched `PMCommand` then commits in **its own** transaction (via
  `Keiro.Projection.runCommandWithProjections`). They are NOT one atomic multi-stream commit.
  Rationale: verified in `ProcessManager.hs` (the `runCommandWithSql` call schedules timers
  in the same `\_ -> traverse_ scheduleTimerTx …` continuation; `dispatchCommand` calls
  `runCommandWithProjections` per command). The docs must say so and explain why replay is
  still safe (next decision).
  Date: 2026-06-01
- Decision: Crash-safety is documented as resting **entirely** on
  `deterministicCommandId` + `eventAlreadyIn` + the store's uniqueness constraint, not on a
  multi-stream atomic commit. `deterministicCommandId` is a v5 UUID over
  `[keiro, process-manager, name, correlationId, sourceEventId, emitIndex]`; the
  manager-state write uses `emitIndex = -1` and dispatched commands start at `0`.
  `runProcessManagerOnce` re-runs the whole dispatch loop **even on `PMStateDuplicate`**, so a
  crash between the state append and a later command dispatch is recovered on replay.
  Rationale: verified in `ProcessManager.hs` (`finish` runs `dispatchCommands` regardless of
  whether the manager append was `PMStateAppended` or `PMStateDuplicate`).
  Date: 2026-06-01
- Decision: Document the **`PMCommandFailed`-wedges-the-worker** caveat as a first-class
  hazard, and devote a how-to (`keep-target-commands-total`) to avoiding it. A
  `PMCommandFailed` (a non-duplicate `CommandError` from a dispatched command) makes
  `runProcessManagerWorker` finalize `AckHalt (HaltFatal …)`, so the source event is retried
  forever by design. Target aggregates should model benign rejections as **total**
  transitions so they never surface as `PMCommandFailed`.
  Rationale: verified in `ProcessManager.hs` `handleIngested` (`Left err -> AckHalt
  (HaltFatal …)`) and the module haddock; `jitsurei/src/Jitsurei/Incident.hs` is the
  worked example of a total guard (ack/escalate legal only from `Triaging`).
  Date: 2026-06-01
- Decision: Document timers exactly as the **bare worker** they are: `runTimerWorker` claims
  **at most one** due timer per call, runs the caller's `fire`, and marks it `Fired` **only
  if** `fire` returns `Just eventId`. There is **no** loop, **no** clock, **no** supervisor,
  and **no cancellation SQL** ships (the `Cancelled` enum value exists and is also the decode
  fallback for unknown status strings, but there is no `cancelTimer` function). The caller
  drives the worker on a tick and supplies `now`. A fired timer is bound back to a process
  manager only by convention (`processManagerName` / `correlationId` / `payload`).
  Rationale: verified in `keiro/keiro/src/Keiro/Timer.hs` and `Keiro/Timer/Schema.hs` — the
  module exports `scheduleTimerTx`, `claimDueTimer`, `markTimerFired`, `runTimerWorker` and
  no cancel function; `statusFromText` maps unknown strings to `Cancelled`.
  Date: 2026-06-01
- Decision: Document the `keiro_timers` schema and `TimerRow` as shipped — columns
  `timer_id UUID PK, process_manager_name TEXT, correlation_id TEXT, fire_at TIMESTAMPTZ,
  payload JSONB, status TEXT DEFAULT 'scheduled', attempts BIGINT DEFAULT 0,
  fired_event_id UUID, created_at, updated_at`, index `keiro_timers_due_idx(status, fire_at,
  process_manager_name)`, status strings `scheduled|firing|fired|cancelled`. The design
  notes' `owner_stream` column and `pending|fired|cancelled` statuses did **not** ship.
  Rationale: verified in
  `keiro/keiro-migrations/sql-migrations/2026-05-17-00-00-00-keiro-bootstrap.sql` and
  `Keiro/Timer/Schema.hs`.
  Date: 2026-06-01
- Decision: Present keiro's **v2 durable execution** (`Keiro.Workflow`, `step`/`sleep`/
  `awakeable`, `keiro_workflow_steps`/`keiro_awakeables` tables) **only** as a clearly
  labelled roadmap on `explanation/workflow-roadmap.mdx`. Show no v2 API as if it were real
  or compilable.
  Rationale: verified absent from the tree at `3f5dc9c` (no `Keiro/Workflow.hs`, no such
  tables in the migration); mirrors the MasterPlan's standing decision.
  Date: 2026-06-01
- Decision: Mirror the **kiroku documentation set** (`docs/plans/5`) and EP-7's keiro
  conventions for depth, house style, Diátaxis mapping, and source-of-truth checks; use
  **absolute** doc links (`/docs/keiro/...`), never relative `./` or `../` ones (a hard-won
  kiroku lesson: relative MDX links resolve wrong in the static SPA and trip the prerender
  crawler).
  Rationale: established, accepted precedent in this repo (see `docs/plans/5` Surprises).
  Date: 2026-06-01


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

(To be filled during and after implementation. Compare against Purpose: a complete, accurate
workflow slice — process managers and durable timers — that builds and link-checks cleanly,
with the two-transaction model and the v2-roadmap-only framing documented honestly.)


## Context and Orientation

Read this whole section before editing. It is written so that a novice with only this file
and the working tree can complete the work.

### What you are building

You are writing MDX content files under `content/docs/keiro/` in **this** repository
(`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`). The site is a **fumadocs**
documentation app (fumadocs-ui 16.9.3 + fumadocs-mdx 15.0.10) built on **TanStack Start as a
static SPA** (React 19 + MDX, TypeScript, Tailwind v4, bundled with **Vite**), built and
served with **pnpm** on **Node 22** inside the Nix dev shell (`nix develop`). `pnpm dev` runs
`vite dev`; `pnpm build` runs `vite build` and emits a static SPA under `.output/public`;
`pnpm typecheck` runs `fumadocs-mdx && tsc --noEmit`. MDX is compiled by fumadocs-mdx and
rendered client-side. Each content directory has a `meta.json` whose `pages` array lists its
child page slugs / nested directory names in display order. A page is an `.mdx` file with
YAML frontmatter (`title`, `description`) followed by an MDX body.

The documented **code samples are Haskell** (the site is TypeScript; the subject is a Haskell
library). Every Haskell snippet must use keiro's real, shipped API, transcribed below and
re-verifiable in the keiro source.

**Term definitions (define these in plain language on first use in the pages too):**

- **Event sourcing.** Persisting state as an append-only log of immutable *events* rather
  than as mutable rows; current state is a fold over the events.
- **Aggregate / event stream.** keiro models a consistency boundary as an `EventStream`: a
  pure decision machine (a *transducer* from the `keiki` library) married to a *codec* (how
  events serialize) and a stream name. A `Stream a` is a typed handle naming one instance
  (e.g. `incident-42`). EP-8 documents these fully; this plan reuses them.
- **Command cycle.** The Hydrate → Decide → Append loop that turns a *command* into appended
  events under optimistic concurrency. EP-8 documents `Keiro.Command`. This plan uses
  `runCommandWithSql` and `runCommandWithProjections` as the lower primitives a process
  manager dispatches through.
- **Process manager.** A stateful, event-driven coordinator. On an incoming event it steps
  its own private event-sourced "manager" state (a real `EventStream`, keyed by a correlation
  id), dispatches commands to *target* aggregates, and schedules durable timers.
- **Saga.** Vocabulary, not a keiro primitive: a saga is a process manager whose `handle`
  emits *compensating* commands (undo-style commands) on failure events. keiro ships no
  separate saga type — `ProcessManager` is the only primitive.
- **Router (contrast).** keiro's `Keiro.Router` (EP-8) is the *stateless* counterpart: it
  resolves command targets from a read model and holds no state. A process manager is the
  *stateful* counterpart that folds the events it has seen into durable manager state.
- **Durable timer.** A row in the `keiro_timers` PostgreSQL table scheduled to become "due"
  at a future `fire_at`. A worker claims due timers and fires them. "Durable" = survives
  process restarts because it lives in Postgres.
- **Correlation id.** A text key (e.g. an order id, an incident id) that selects *which*
  manager instance handles an event and ties a manager's state stream, its dispatched
  commands, and its timers together.

### How this plan fits the master plan and its dependencies (reference by path only)

This plan is **EP-10** in `docs/masterplans/2-keiro-framework-documentation-set.md` (Phase 2,
the subsystem wave).

- **HARD DEP — EP-7** (`docs/plans/7-keiro-overview-getting-started-and-the-jitsurei-example-spine.md`):
  the foundation. After EP-7 is **Complete**, these exist and you link into them:
  `content/docs/keiro/index.mdx` (overview), a getting-started tutorial, a core-concepts
  explanation, the jitsurei worked-example introduction + module map, the
  `docs/keiro-source-sync.md` source pointer, the `walkthrough/index.mdx` hub, and the shared
  authoring conventions (absolute cross-links; the jitsurei module map; the `walkthrough/`
  subdirectory layout; the section-`meta.json` append protocol). EP-7 lists `workflow` as a
  walkthrough subdirectory. **Do not start before EP-7 is Complete** — verify in M0.
- **SOFT DEP — EP-8** (`docs/plans/8-keiro-command-cycle-and-write-path-documentation.md`):
  the command cycle and the content-based router. Process managers **dispatch commands
  through the command cycle**: `runProcessManagerOnce` calls `runCommandWithSql` (manager
  append + timers) and `runCommandWithProjections` (each target dispatch). When EP-8's pages
  exist, link to them with absolute paths (e.g.
  `/docs/keiro/reference/command`, `/docs/keiro/explanation/the-content-based-router`); if a
  link target is not yet authored, the link is still authored now and resolves once EP-8
  lands. EP-8 is **soft** because this plan is self-contained (the signatures it needs are
  embedded below).
- **SOFT DEP — EP-9** (`docs/plans/9-keiro-read-side-documentation-projections-read-models-and-snapshots.md`):
  the read side. A saga and a router can read a read model to pick targets; the
  `keep-target-commands-total` how-to references the read-model/consistency concepts. Link
  to EP-9 pages where natural; non-blocking.

Because EP-8 and EP-9 are soft deps, author your cross-links now (absolute) regardless; they
light up once those pages exist.

### The shared content tree and the meta.json append protocol (read carefully)

`content/docs/keiro/**` + `meta.json` is the shared keiro content tree. EP-7 structured it.
The current shape (verified) is:

```text
content/docs/keiro/
  index.mdx                meta.json          faq.mdx
  tutorials/   index.mdx   meta.json
  how-to/      index.mdx   meta.json   (title "How-To Guides")
  reference/   index.mdx   meta.json
  explanation/ index.mdx   meta.json
  cookbook/    index.mdx   meta.json
  walkthrough/ index.mdx   meta.json   (title "Code Walkthrough")
```

The top-level `content/docs/keiro/meta.json` already lists the sections
(`index, tutorials, how-to, reference, explanation, cookbook, walkthrough, faq`) — **do not
touch it**. Each per-section `meta.json` currently has `"pages": ["index"]` (or similar).
**Rule (shared with the other Phase-2 plans):** this plan **appends only its own page slugs**
to the relevant section `meta.json` `pages` array; it never reorders or removes another
plan's entries. EP-12 owns the final ordering pass. So in M6 you append EP-10's slugs after
`"index"` (or after whatever entries other Phase-2 plans have already appended) — you do not
rewrite the arrays from scratch. The exact appends are listed in **Interfaces and
Dependencies**.

The `walkthrough/` tree gives each Phase-2 plan a **disjoint subdirectory** with its own
`meta.json`, so parallel plans never collide on a numbered sequence. EP-10 owns
`walkthrough/workflow/`. You create `walkthrough/workflow/meta.json` and ensure the string
`"workflow"` appears in `content/docs/keiro/walkthrough/meta.json`'s `pages` array (EP-7 may
already list it; if so, change nothing there).

### The Diátaxis templates (copy the matching one)

The repo ships copy-me MDX templates under `content/docs/_templates/`:
`tutorial.mdx`, `how-to.mdx`, `reference.mdx`, `explanation.mdx`, `code-walkthrough.mdx`,
`cookbook-recipe.mdx`, `faq.mdx`, `theory-explainer.mdx`. Match each page to its mode and
copy that template's frontmatter + section skeleton, then fill it. Prefer fumadocs-ui
built-ins (`Callout`, `Steps`, `Tabs`, `Cards`, `TypeTable`) — they are registered globally
in `src/components/mdx.tsx` via `getMDXComponents`, so **author them bare, with no `import`
lines** (this matches every existing keiro/kiroku page). Diátaxis modes:

- **Explanation** (understanding-oriented): discursive background and rationale; no steps.
- **Reference** (information-oriented): dry, exhaustive, accurate; `<TypeTable>` for fields;
  one subsection per type/operation; signatures copied verbatim from source, never
  paraphrased.
- **Tutorial** (learning-oriented): a guided do-this-then-that lesson with a guaranteed
  outcome; wrap the walkthrough in `<Steps>`.
- **How-To Guide** (task-oriented): solves one real problem for someone who knows the basics.
- **Code walkthrough**: an ordered tour over the real source; numeric-prefixed pages
  (`00-…`, `01-…`); a `<Callout>` at the top pointing back to `00-start-here`; excerpts with
  the source path noted above each block.

### Fence/formatting rules (hard requirement)

Every fenced code block MUST carry a language tag: ` ```haskell ` for Haskell, ` ```sql ` for
SQL, ` ```mdx ` for MDX page bodies, ` ```json ` for `meta.json`, ` ```mermaid ` for
diagrams, ` ```bash ` for shell, ` ```text ` for plain transcripts. Never write a bare
```` ``` ````. Include at least one ` ```mermaid ` diagram per explanation page and
ligature-bearing Haskell operators (`->`, `=>`, `<-`, `::`, `>>=`, `<$>`) in snippets so the
font/highlighter pipeline is exercised.

### The subject: keiro's workflow engine, transcribed from source (use these REAL names)

Source of truth on disk (read-only — do **not** edit it):
`/Users/shinzui/Keikaku/bokuno/keiro`, pinned at commit `3f5dc9c` (confirm with
`cd /Users/shinzui/Keikaku/bokuno/keiro && git rev-parse HEAD`). The workflow modules live
under `keiro/keiro/src/Keiro/`. The facts below are transcribed verbatim at `3f5dc9c`. Treat
this as your API cheat-sheet; open the source to confirm a detail.

**The process manager (`keiro/keiro/src/Keiro/ProcessManager.hs`).** The type is parameterised
over the manager's own aggregate (`phi rs s ci co`) and the *target* aggregate
(`targetPhi targetRs targetState targetCi targetCo`); `input` is the incoming event type:

```haskell
-- module Keiro.ProcessManager
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
```

Note the shape is a single `handle :: input -> ProcessManagerAction`, NOT the design note's
`pmStep :: s -> eIn -> (s, [cmd])`. The manager's own state advance is the `command :: ci`
field, applied to `eventStream`.

**Result types (verbatim):**

```haskell
data PMCommandResult target
  = PMCommandAppended  !(CommandResult target)  -- the dispatch appended events
  | PMCommandDuplicate !EventId                 -- idempotent replay; the id already existed
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

**Runners (verbatim signatures):**

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

**Idempotency primitives (verbatim):**

```haskell
-- v5 UUID over [keiro, process-manager, name, correlationId, sourceEventId, emitIndex]
-- manager-state append uses emitIndex = -1; dispatched commands start at 0
deterministicCommandId :: Text -> Text -> EventId -> Int -> EventId

eventAlreadyIn :: (Store :> es) => RunCommandOptions -> StreamName -> EventId -> Eff es Bool
```

`RunCommandOptions` (defined in `Keiro.Command`, EP-8) carries — among other fields —
`pageSize :: Int32` and `eventIds :: [EventId]`; `runProcessManagerOnce` sets `eventIds` to
the single deterministic id for each write (`options & #eventIds .~ [theId]`).

**Control flow & the key gotcha (transcribe into the explanation + walkthrough).**
`runProcessManagerOnce`:

1. Computes `correlationId = correlate input`, `action = handle input`, the manager stream
   from `streamFor correlationId`, and `managerEventId = deterministicCommandId name
   correlationId sourceEventId (-1)`.
2. Pre-checks `eventAlreadyIn` for the manager stream. If already present, short-circuits to
   `PMStateDuplicate managerEventId` but **still calls `finish`** (which runs the dispatch
   loop).
3. Otherwise calls `runCommandWithSql managerOptions eventStream managerStream
   (action.command) (\_ -> traverse_ scheduleTimerTx action.timers)` — the manager-state
   append **and its timers commit in one transaction**. A `DuplicateEvent` matching
   `managerEventId` (or `Nothing`) is folded to `PMStateDuplicate`; any other `Left err`
   returns `Left err` (aborts the whole reaction); a `Right` is `PMStateAppended`.
4. `finish` then runs `dispatchCommands`: for each `PMCommand` at emit index `0,1,2,…`,
   compute its `commandId`, pre-check `eventAlreadyIn` on the target stream (→
   `PMCommandDuplicate` if present), else `runCommandWithProjections targetOptions
   targetEventStream targetStream (command.command) (targetProjections command.target)` —
   **each dispatch commits in its OWN transaction**. A matching `DuplicateEvent` →
   `PMCommandDuplicate`; any other `Left` → `PMCommandFailed`.

So the manager append + timers are atomic together, but each target dispatch is a separate
commit. This is **NOT** one atomic multi-stream commit (contradicting the design note — say
so explicitly). Crash-safety comes entirely from `deterministicCommandId` + `eventAlreadyIn`
+ the store's uniqueness constraint; that is why the dispatch loop re-runs even on
`PMStateDuplicate`.

`runProcessManagerWorker` drains a shibuya `Adapter es msg`, decodes each message with the
caller's `msg -> Maybe (RecordedEvent, input)`, and: a decode failure → `AckHalt (HaltFatal
"…")`; a `Left err` from `runProcessManagerOnce` → `AckHalt (HaltFatal (show err))`; a
`Right _` → `AckOk`. **`PMCommandFailed` is inside a `Right`'s `commandResults`** — but
because the worked design treats a failed dispatch as fatal, a process manager that produces
`PMCommandFailed` and is run via a higher-level loop that inspects results will retry the
source event forever. The honest framing: **target aggregates should model benign rejections
as TOTAL transitions** so they never surface as `PMCommandFailed` and wedge progress.

**Durable timers (`keiro/keiro/src/Keiro/Timer.hs`, `Timer/Types.hs`, `Timer/Schema.hs`).**

```haskell
-- Keiro.Timer.Types
newtype TimerId = TimerId UUID

data TimerRequest = TimerRequest
  { timerId            :: !TimerId
  , processManagerName :: !Text
  , correlationId      :: !Text
  , fireAt             :: !UTCTime
  , payload            :: !Value
  }

-- Keiro.Timer.Schema
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

scheduleTimerTx :: TimerRequest -> Tx.Transaction ()   -- composes into the manager append tx
claimDueTimer   :: (Store :> es) => UTCTime -> Eff es (Maybe TimerRow)
markTimerFired  :: (Store :> es) => TimerId -> EventId -> Eff es ()

-- Keiro.Timer
runTimerWorker ::
  (Store :> es) => UTCTime -> (TimerRow -> Eff es (Maybe EventId)) -> Eff es (Maybe TimerRow)
```

`scheduleTimerTx` is an `INSERT … ON CONFLICT (timer_id) DO UPDATE … WHERE status =
'scheduled'` — it **re-arms only while still `Scheduled`** (a fired/cancelled timer is not
resurrected). `claimDueTimer` is a `WITH due AS (SELECT … WHERE status = 'scheduled' AND
fire_at <= $1 ORDER BY fire_at, timer_id LIMIT 1 FOR UPDATE SKIP LOCKED) UPDATE … SET status
= 'firing', attempts = attempts + 1 …` — concurrent workers each get a **distinct** timer.
`runTimerWorker` claims **at most one** due timer, runs `fire`, and calls `markTimerFired`
**only if `fire` returns `Just`**; a `Nothing` (or a crash) leaves the timer `Firing`, so it
becomes claimable again → **at-least-once firing**. It is a **bare** worker: no loop, no
clock (the caller supplies `now`), no supervisor, and **no cancellation SQL ships**. A fired
timer is bound back to a process manager only by convention via `processManagerName` /
`correlationId` / `payload`.

**The `keiro_timers` table (verbatim, from the bootstrap migration):**

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

(The design notes' `owner_stream` column and `pending|fired|cancelled` statuses did NOT ship.
Use the schema above.)

**v2 durable execution is DESIGN-ONLY.** There is no `Keiro.Workflow` module, no
`step`/`sleep`/`awakeable`, and no `keiro_workflow_steps`/`keiro_awakeables` tables in the
tree at `3f5dc9c`. Present these only as a clearly labelled roadmap; show no v2 API as real.

### The jitsurei worked example (anchor pages to these — verified at `3f5dc9c`)

`jitsurei` is the runnable worked-example package in the keiro repo
(`/Users/shinzui/Keikaku/bokuno/keiro/jitsurei/src/Jitsurei/`). EP-7 introduces it and owns
the canonical module map; this plan reuses the workflow rows:

- **`Jitsurei/FulfillmentProcess.hs`** — a process manager named `"jitsurei-fulfillment"`
  that `correlate`s on the order id, observes order events into its own
  `fulfillment-<orderId>` state stream, and on `PaymentApproved` dispatches one `PMCommand`:
  `MarkPacked` to the order aggregate (`targetProjections = const [orderSummaryInlineProjection]`).
  `handle` returns `ProcessManagerAction { command = ObserveFulfillmentEvent …, commands =
  [PMCommand …] (only on PaymentApproved), timers = [] }`. Run target: `just jitsurei-fulfillment`.
- **`Jitsurei/EscalationProcess.hs`** — a process manager named `"jitsurei-escalation"` that
  `correlate`s on the incident id, keeps an `esc-<incidentId>` state stream, and on
  `IncidentReported` schedules a **severity-derived** escalation timer
  (`escalationTimerRequest`, `escalationDeadline raisedAt severity`); on `ResponderAcked`
  dispatches `AcknowledgeIncident` to the incident. `runEscalationTimerWorker` claims a due
  timer and dispatches `EscalateIncident`. The timer id is a UUIDv5 of the incident id, so a
  redelivered `IncidentReported` re-arms the same row. Run target: `just jitsurei-escalation`.
- **`Jitsurei/Timers.hs`** — `paymentTimeoutRequest` (a `TimerRequest` for
  `"jitsurei-fulfillment"`) and `runPaymentTimeoutWorker now = runTimerWorker now (\_ -> pure
  (Just (EventId paymentTimeoutEventId)))` — the minimal `fire` shape.
- **`Jitsurei/Incident.hs`** — the incident aggregate whose transducer makes
  `AcknowledgeIncident` and `EscalateIncident` legal **only from `Triaging`**. Whichever
  happens first wins; the loser is a benign `CommandRejected` (a `CommandError` variant), so
  the escalation-timer/ack race is benign and the timer firing is idempotent. This is the
  worked example for the `keep-target-commands-total` how-to.
- **`Jitsurei/OncallRoster.hs`** — a read model mapping a service to on-call responders;
  referenced when explaining how a saga/router can read state to pick targets. (The paging
  router that reads it lives in `Jitsurei/Paging.hs`, documented by EP-8.)

Always link to these modules and the `just jitsurei-*` targets so the example reads as one
coherent story across the keiro set.


## Plan of Work

The work is grouped into milestones, each independently verifiable by building the site and
viewing the pages. Author pages in IA order; the final milestone wires the `meta.json` files
and runs the full acceptance checks. Every page goes under `content/docs/keiro/`.

**Page set and file map.** Each entry gives the file path, Diátaxis type (→ template), the
keiro source it documents, and the key snippet/diagram it must contain.

| File (under `content/docs/keiro/`) | Diátaxis → template | Documents (source) | Key snippet/diagram |
|---|---|---|---|
| `explanation/process-managers-and-sagas.mdx` | Explanation | `Keiro.ProcessManager` | stateful coordinator vs stateless router; PM-as-event-sourced-aggregate; saga vocabulary; the **two-transaction** model + why replay is safe (deterministic ids); the `PMCommandFailed`-wedges-the-worker caveat; a ` ```mermaid ` |
| `explanation/durable-timers.mdx` | Explanation | `Keiro.Timer`, `Timer/Schema` | the `Scheduled → Firing → Fired/Cancelled` lifecycle; at-least-once firing; `FOR UPDATE SKIP LOCKED`; the bare-worker reality; a ` ```mermaid ` state diagram |
| `explanation/workflow-roadmap.mdx` | Explanation (roadmap) | (v1 shipped vs v2 design-only) | v1 = PMs + timers (shipped); v2 = named-step durable execution (DEFERRED); clearly labelled; **no v2 API shown as real** |
| `reference/process-manager.mdx` | Reference | `Keiro.ProcessManager` | `ProcessManager`, `ProcessManagerAction`, `PMCommand`, result types, `runProcessManagerOnce`/`Worker`, `deterministicCommandId`, `eventAlreadyIn` |
| `reference/timers.mdx` | Reference | `Keiro.Timer`, `Timer/Types`, `Timer/Schema`, migration | `TimerId`, `TimerRequest`, `TimerRow`, `TimerStatus`, `scheduleTimerTx`/`claimDueTimer`/`markTimerFired`/`runTimerWorker`, the `keiro_timers` table + index |
| `tutorials/your-first-process-manager.mdx` | Tutorial | `Jitsurei/FulfillmentProcess.hs` | define `correlate` + manager/target `EventStream`s + `handle` emitting one command; run `runProcessManagerOnce` on a fresh store; `just jitsurei-fulfillment` |
| `how-to/run-a-process-manager-as-a-subscription.mdx` | How-To | `runProcessManagerWorker` | wire it to a shibuya kiroku adapter with a `decodeMessage :: msg -> Maybe (RecordedEvent, input)` |
| `how-to/write-a-saga-with-compensation.mdx` | How-To | `Keiro.ProcessManager` | author compensation commands in `handle` on failure events (no separate saga primitive) |
| `how-to/drive-the-timer-worker.mdx` | How-To | `runTimerWorker`, `Jitsurei/EscalationProcess.hs`, `Timers.hs` | a polling loop (clock source, cadence, multi-worker SKIP LOCKED) binding a fired timer back to a PM via `payload`; `just jitsurei-escalation` |
| `how-to/keep-target-commands-total.mdx` | How-To | `Jitsurei/Incident.hs` | model benign rejections as total transitions to avoid `PMCommandFailed` wedging the worker |
| `walkthrough/workflow/00-start-here.mdx` | Walkthrough | (tour overview) | what the tour covers + overview ` ```mermaid `; `<Cards>` to the parts |
| `walkthrough/workflow/01-the-process-manager.mdx` | Walkthrough | `Keiro/ProcessManager.hs` | `runProcessManagerOnce` control flow + dispatch loop + `retarget`/`coerce` |
| `walkthrough/workflow/02-the-timer-schema.mdx` | Walkthrough | `Keiro/Timer/Schema.hs` | the claim CTE, the re-arm guard, the row decoder |
| `walkthrough/workflow/03-the-timer-worker.mdx` | Walkthrough | `Keiro/Timer.hs` | `runTimerWorker` + how it composes with the command cycle |
| `walkthrough/workflow/meta.json` | (sidebar config) | — | the four chapters in order |

**Milestones.**

- **M0 — Preconditions.** Confirm the toolchain runs, EP-7 has landed (its pages and
  conventions exist), and the keiro source is readable at `3f5dc9c`. At the end: `pnpm build`
  succeeds on the current tree before you add any EP-10 page. Acceptance: see Concrete Steps.

- **M1 — Explanation set** (3 pages under `explanation/`). At the end: the process-manager,
  durable-timers, and workflow-roadmap explanation pages render. Acceptance: all build; each
  of the first two carries a ` ```mermaid `; the roadmap page shows no v2 API as real; the
  process-manager page states the two-transaction model and the `PMCommandFailed` caveat.

- **M2 — Reference set** (`reference/process-manager.mdx`, `reference/timers.mdx`).
  Acceptance: every signature is copy-exact from §Context; `<TypeTable>` lists every field of
  `ProcessManagerAction`/`PMCommand`/`TimerRequest`/`TimerRow`; the `keiro_timers` ` ```sql `
  matches the migration.

- **M3 — Tutorial** (`tutorials/your-first-process-manager.mdx`). At the end: a reader can
  define `correlate` + manager/target `EventStream`s + a one-command `handle` and run
  `runProcessManagerOnce` against a fresh store, anchored to `FulfillmentProcess.hs` and
  `just jitsurei-fulfillment`. Acceptance: page builds; snippets match §Context.

- **M4 — How-to guides** (4 pages under `how-to/`). Acceptance: each solves its one task
  end-to-end with real-API snippets; the subscription guide uses `runProcessManagerWorker`
  with a `decodeMessage`; the timer guide builds a polling loop around `runTimerWorker`; the
  saga guide shows compensation in `handle`; the totality guide uses `Jitsurei/Incident.hs`.

- **M5 — Walkthrough** (`walkthrough/workflow/` + its `meta.json`). Acceptance: four
  numbered chapters build; `00-start-here` carries the back-link `<Callout>` and a
  ` ```mermaid `; chapters cite the real source paths; `02` quotes the claim CTE and re-arm
  guard verbatim.

- **M6 — meta.json appends + full acceptance.** Append EP-10's slugs to the section
  `meta.json` files, create `walkthrough/workflow/meta.json`, ensure `"workflow"` is in
  `walkthrough/meta.json`. Acceptance: see Validation and Acceptance.


## Concrete Steps

Run all commands from the repo root `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` unless
stated otherwise. The docs toolchain is **pnpm** on **Node 22** inside the Nix dev shell.

### M0 — Preconditions

```bash
# enter the Nix dev shell (pnpm + Node 22) first
nix develop

# confirm the scaffold + EP-7 foundation are present
test -f source.config.ts && test -f src/lib/source.ts && test -f vite.config.ts && echo "scaffold present"
test -f content/docs/keiro/index.mdx && echo "EP-7 overview present"
test -f docs/keiro-source-sync.md && echo "EP-7 source pointer present"
test -f content/docs/keiro/walkthrough/index.mdx && echo "EP-7 walkthrough hub present"

# install + verify the current tree builds before you start
pnpm install
pnpm build
```

Expected (abridged):

```text
scaffold present
EP-7 overview present
EP-7 source pointer present
EP-7 walkthrough hub present
✓ built in <N>s
```

If the EP-7 artifacts are missing, EP-7 is not Complete — stop and finish EP-7 first (it is a
HARD DEP). If `pnpm build` fails on the current tree, fix that before adding pages.

Confirm the keiro source is at the pinned commit and the workflow modules exist:

```bash
cd /Users/shinzui/Keikaku/bokuno/keiro && git rev-parse HEAD
# expect: 3f5dc9c1fa90f6358cebb9e85d92dde4c325db48
ls keiro/src/Keiro/ProcessManager.hs keiro/src/Keiro/Timer.hs \
   keiro/src/Keiro/Timer/Schema.hs keiro/src/Keiro/Timer/Types.hs
ls jitsurei/src/Jitsurei/FulfillmentProcess.hs jitsurei/src/Jitsurei/EscalationProcess.hs \
   jitsurei/src/Jitsurei/Timers.hs jitsurei/src/Jitsurei/Incident.hs
```

Create the workflow walkthrough subdirectory you will populate (idempotent):

```bash
mkdir -p content/docs/keiro/walkthrough/workflow
```

### M1 — Explanation pages

Copy `content/docs/_templates/explanation.mdx` for each. Author bare components (no imports).

- **`explanation/process-managers-and-sagas.mdx`** — frontmatter
  `title: "Understanding process managers and sagas"`. Open with the question "how do I
  coordinate work across several aggregates in response to events?". Define *process manager*
  and contrast it with the stateless `Keiro.Router` (link absolute:
  `/docs/keiro/explanation/the-content-based-router`, owned by EP-8 — author the link now).
  Explain the PM-as-event-sourced-aggregate idea (its own `EventStream` keyed by correlation
  id). Explain **saga vocabulary**: a saga is a PM whose `handle` emits compensating commands;
  keiro ships no separate saga type. Then the **two-transaction model**: manager-state append
  + its timers commit in one transaction; each dispatched `PMCommand` commits in its own —
  **not** one atomic multi-stream commit — and replay is safe only because
  `deterministicCommandId` + `eventAlreadyIn` + the store's uniqueness make re-running the
  whole dispatch loop a no-op. End with the **`PMCommandFailed` caveat**. Include a
  ` ```mermaid ` like:

  ````mdx
  ```mermaid
  flowchart TD
    E["Incoming event (RecordedEvent, input)"] --> C["correlate -> correlationId"]
    C --> H["handle input -> ProcessManagerAction"]
    H --> M["Tx 1: append manager state + scheduleTimerTx (one transaction)"]
    H --> D["Tx 2..n: dispatch each PMCommand (own transaction each)"]
    M --> R["ProcessManagerResult"]
    D --> R
  ```
  ````

- **`explanation/durable-timers.mdx`** — `title: "Understanding durable timers"`. Define a
  durable timer (a `keiro_timers` row). Explain the `Scheduled → Firing → Fired/Cancelled`
  lifecycle, that `Cancelled` is also the decode fallback, at-least-once firing (a crash
  leaves `Firing` → re-claimable), `FOR UPDATE SKIP LOCKED` (many workers, distinct timers),
  and the **bare-worker reality** (no loop/clock/supervisor, no cancellation SQL — the caller
  drives it on a tick with `now`). Include a ` ```mermaid stateDiagram-v2 ` of the lifecycle.

- **`explanation/workflow-roadmap.mdx`** — `title: "The keiro workflow roadmap: v1 and v2"`.
  Open with a `<Callout type="warn">` stating v2 durable execution is **not shipped** at
  keiro 0.1.0.0 and the rest of the page is a roadmap. Section **"v1 — shipped today"**: PMs +
  timers (link the explanation/reference pages). Section **"v2 — planned (not shipped)"**:
  describe named-step durable execution *conceptually only* (e.g. "a workflow would be made of
  durable steps and sleeps") with **no Haskell signatures presented as real**. If you mention
  module/table names, prefix them clearly as hypothetical (e.g. "a future `Keiro.Workflow`
  module") and never put them in a ` ```haskell ` block that looks compilable.

### M2 — Reference pages

Copy `content/docs/_templates/reference.mdx`. Copy signatures **verbatim** from §Context.

- **`reference/process-manager.mdx`** — `title: "Keiro.ProcessManager"`. One subsection per
  type/function: `ProcessManager` (with a `<TypeTable>` for its seven fields), `ProcessManagerAction`
  (`<TypeTable>` for `command`/`commands`/`timers`), `PMCommand`, `PMCommandResult`,
  `PMStateResult`, `ProcessManagerResult`, `runProcessManagerOnce`, `runProcessManagerWorker`,
  `deterministicCommandId`, `eventAlreadyIn`. Add a `<Callout type="warn">` on the
  two-transaction model and a second on `PMCommandFailed → AckHalt → retried forever`.

- **`reference/timers.mdx`** — `title: "Keiro.Timer"`. Subsections: `TimerId`, `TimerRequest`
  (`<TypeTable>`), `TimerStatus` (note the `Cancelled` decode fallback), `TimerRow`
  (`<TypeTable>`), `scheduleTimerTx` (note the `ON CONFLICT … WHERE status = 'scheduled'`
  re-arm), `claimDueTimer` (note `FOR UPDATE SKIP LOCKED`), `markTimerFired`, `runTimerWorker`
  (note: at-most-one, marks `Fired` only on `Just`). End with the `keiro_timers` ` ```sql `
  table + index from §Context and a `<Callout type="info">` that no cancellation SQL ships.

### M3 — Tutorial

Copy `content/docs/_templates/tutorial.mdx`; wrap the steps in `<Steps>`.
`tutorials/your-first-process-manager.mdx`, `title: "Your first process manager"`. Anchor to
`Jitsurei/FulfillmentProcess.hs`. Steps: (1) define `correlate` (order id → text); (2) define
the manager `EventStream` and the target `EventStream` (reuse the jitsurei shapes; link EP-8's
EventStream reference absolute: `/docs/keiro/reference/event-stream`); (3) write a `handle`
that returns a `ProcessManagerAction` emitting one `PMCommand` on `PaymentApproved` (mirror
the real `fulfillmentProcessManager`); (4) run it with `runProcessManagerOnce options manager
recorded event` against a fresh store and inspect the `ProcessManagerResult`; (5) "what you
built / run it for real" → `just jitsurei-fulfillment`. Use the real snippet shape:

```haskell
fulfillmentProcessManager :: FulfillmentProcessManager
fulfillmentProcessManager = ProcessManager
  { name = "jitsurei-fulfillment"
  , correlate = orderIdText . eventOrderId
  , eventStream = fulfillmentEventStream
  , streamFor = fulfillmentStream . OrderId
  , targetEventStream = orderEventStream
  , targetProjections = const [orderSummaryInlineProjection]
  , handle = \event ->
      ProcessManagerAction
        { command  = ObserveFulfillmentEvent (ObserveFulfillmentEventData (eventOrderId event) (fulfillmentStatus event))
        , commands = case event of
            PaymentApproved{} -> [ PMCommand (orderCommandStream (eventOrderId event)) (MarkPacked (MarkPackedData (eventOrderId event))) ]
            _ -> []
        , timers   = []
        }
  }
```

### M4 — How-to guides

Copy `content/docs/_templates/how-to.mdx` for each.

- **`how-to/run-a-process-manager-as-a-subscription.mdx`** — `title: "Run a process manager
  as a subscription"`. Show wiring `runProcessManagerWorker options manager adapter
  decodeMessage` over a shibuya kiroku adapter, where `decodeMessage :: msg -> Maybe
  (RecordedEvent, input)`. Explain ack semantics (decode failure / `Left err` → `AckHalt
  (HaltFatal …)`; success → `AckOk`) and that deterministic ids make the forced retry safe.
  Link the shibuya-adapter how-to (EP-7/EP-8 territory; link absolute).

- **`how-to/write-a-saga-with-compensation.mdx`** — `title: "Write a saga with
  compensation"`. Explain that keiro has **no saga primitive**; a saga is a `ProcessManager`
  whose `handle` matches failure events and emits compensating `PMCommand`s (e.g. on a
  `PaymentFailed`-style event, dispatch a `CancelOrder`/refund command). Show a `handle`
  `case` returning compensation commands, contrasted with the happy-path command.

- **`how-to/drive-the-timer-worker.mdx`** — `title: "Drive the timer worker"`. Build a
  polling loop around `runTimerWorker now fire`: choose a clock source (`getCurrentTime`),
  a cadence (e.g. tick every N seconds), note that multiple workers are safe because of `FOR
  UPDATE SKIP LOCKED`, and show binding a fired timer back to a PM by reading
  `processManagerName` / `correlationId` / `payload` and dispatching a command (mirror
  `runEscalationTimerWorker` and `Jitsurei/Timers.hs`'s `runPaymentTimeoutWorker`). Anchor to
  `just jitsurei-escalation`. Real `fire` shape:

  ```haskell
  runEscalationTimerWorker options now =
    runTimerWorker now $ \timer ->
      case incidentIdFromTimer timer of
        Nothing         -> pure Nothing
        Just incidentId -> do
          _ <- runCommand options incidentEventStream (incidentStream incidentId)
                 (EscalateIncident (EscalateIncidentData incidentId))
          pure (Just firedEventId)
  ```

- **`how-to/keep-target-commands-total.mdx`** — `title: "Keep target commands total"`. Explain
  that a `PMCommandFailed` makes the worker `AckHalt` and retry the source event forever, so
  benign rejections must be modelled as **total** transitions. Use `Jitsurei/Incident.hs`:
  `AcknowledgeIncident`/`EscalateIncident` are legal only from `Triaging`; whichever happens
  first wins and the loser is a benign `CommandRejected`, making the ack/escalate race safe.
  Show the relevant transducer guard.

### M5 — Walkthrough under `walkthrough/workflow/`

Copy `content/docs/_templates/code-walkthrough.mdx`. Each page's top `<Callout>` links back to
`/docs/keiro/walkthrough/workflow/00-start-here` (absolute). Note the real source path above
each excerpt.

- **`00-start-here.mdx`** — `title: "00 — Start here"`. Overview of the tour, an overview
  ` ```mermaid `, and a `<Cards>` block linking the three chapters (absolute hrefs).
- **`01-the-process-manager.mdx`** — `title: "01 — The process manager"`. Walk
  `runProcessManagerOnce` (source: `keiro/keiro/src/Keiro/ProcessManager.hs`): the
  correlate/handle setup, the manager append + timers in one transaction, the `finish`/
  `dispatchCommands` loop, the per-command `eventAlreadyIn` guard and
  `runCommandWithProjections`, and the `retarget = coerce` cast that re-types a `Stream
  targetCi` as a `Stream (EventStream …)`.
- **`02-the-timer-schema.mdx`** — `title: "02 — The timer schema"`. Walk
  `keiro/keiro/src/Keiro/Timer/Schema.hs`: the `claimDueTimerStmt` CTE (` ```sql ` excerpt),
  the `scheduleTimerStmt` re-arm guard (`WHERE keiro_timers.status = 'scheduled'`), and
  `timerRowDecoder` (incl. `statusFromText` mapping unknown → `Cancelled`).
- **`03-the-timer-worker.mdx`** — `title: "03 — The timer worker"`. Walk
  `keiro/keiro/src/Keiro/Timer.hs` `runTimerWorker` and explain how it composes with the
  command cycle (the `fire` action typically calls `runCommand` to dispatch back into a PM's
  target, then returns the produced `EventId` so the timer is marked `Fired`).

Create `walkthrough/workflow/meta.json`:

```json
{
  "title": "Workflow Walkthrough",
  "pages": [
    "00-start-here",
    "01-the-process-manager",
    "02-the-timer-schema",
    "03-the-timer-worker"
  ]
}
```

### M6 — meta.json appends + build

Append EP-10's slugs to the existing section `meta.json` `pages` arrays (append after the
existing entries; do not reorder or remove others). For example,
`content/docs/keiro/explanation/meta.json` becomes (assuming only `index` was there):

```json
{
  "title": "Explanation",
  "pages": [
    "index",
    "process-managers-and-sagas",
    "durable-timers",
    "workflow-roadmap"
  ]
}
```

Apply the analogous append to `reference/meta.json`
(`"process-manager"`, `"timers"`), `how-to/meta.json`
(`"run-a-process-manager-as-a-subscription"`, `"write-a-saga-with-compensation"`,
`"drive-the-timer-worker"`, `"keep-target-commands-total"`), and `tutorials/meta.json`
(`"your-first-process-manager"`). Ensure `content/docs/keiro/walkthrough/meta.json` lists
`"workflow"` in its `pages` (EP-7 may already; if so, change nothing there) — append it if
absent:

```json
{
  "title": "Code Walkthrough",
  "pages": ["index", "workflow"]
}
```

Then build:

```bash
pnpm typecheck
pnpm build
pnpm dev   # then browse http://localhost:3000/docs/keiro
```


## Validation and Acceptance

Exercise the system and observe specific behaviors:

1. **Section builds.** From the repo root, `pnpm typecheck` is clean and `pnpm build`
   (`vite build`) exits 0 with the EP-10 pages present; it emits the static SPA under
   `.output/public`. Expected tail (abridged):

   ```text
   ✓ built in <N>s
   .output/public/...
   ```

2. **Zero crawler warnings; absolute links.** The build log contains no
   `unhandledRejection` / `Failed to fetch` lines (these flag broken/relative links). Confirm
   no relative cross-links were authored:

   ```bash
   grep -rn '\](\.\./\|\](\./' content/docs/keiro/explanation/process-managers-and-sagas.mdx \
     content/docs/keiro/explanation/durable-timers.mdx \
     content/docs/keiro/explanation/workflow-roadmap.mdx \
     content/docs/keiro/reference/process-manager.mdx \
     content/docs/keiro/reference/timers.mdx \
     content/docs/keiro/tutorials/your-first-process-manager.mdx \
     content/docs/keiro/how-to/run-a-process-manager-as-a-subscription.mdx \
     content/docs/keiro/how-to/write-a-saga-with-compensation.mdx \
     content/docs/keiro/how-to/drive-the-timer-worker.mdx \
     content/docs/keiro/how-to/keep-target-commands-total.mdx \
     content/docs/keiro/walkthrough/workflow/*.mdx
   ```

   Expected: no matches (all cross-links are absolute `/docs/keiro/...`). The
   walkthrough back-link `<Callout>` is the one place to double-check is absolute.

3. **Renders in the sidebar.** `pnpm dev` (or `pnpm build && pnpm start`), open
   `http://localhost:3000/docs/keiro`. The sidebar shows the new workflow pages under
   Explanation (3), Reference (2), How-To Guides (4), Tutorials (1), and a "Workflow
   Walkthrough" group under Code Walkthrough (4 chapters), each opening without a 404 and
   showing its frontmatter `title`.

4. **Haskell names are present in the pinned source.** Cross-check every API name used in a
   snippet against the keiro source at `3f5dc9c`:

   ```bash
   cd /Users/shinzui/Keikaku/bokuno/keiro
   grep -rn 'data ProcessManager\|data ProcessManagerAction\|data PMCommand\|runProcessManagerOnce ::\|runProcessManagerWorker ::\|deterministicCommandId ::\|eventAlreadyIn ::' keiro/src/Keiro/ProcessManager.hs
   grep -rn 'newtype TimerId\|data TimerRequest\|data TimerRow\|data TimerStatus\|scheduleTimerTx ::\|claimDueTimer ::\|markTimerFired ::\|runTimerWorker ::' keiro/src/Keiro/Timer.hs keiro/src/Keiro/Timer/Types.hs keiro/src/Keiro/Timer/Schema.hs
   grep -rn 'CREATE TABLE IF NOT EXISTS keiro_timers\|keiro_timers_due_idx' keiro-migrations/sql-migrations/2026-05-17-00-00-00-keiro-bootstrap.sql
   ```

   Acceptance: every function/type/constructor named in a snippet appears in the source with
   the signature transcribed in §Context. Optionally compile the example for extra assurance:

   ```bash
   cd /Users/shinzui/Keikaku/bokuno/keiro && cabal build jitsurei
   ```

5. **The v2 roadmap shows NO shipped-looking v2 API.** Confirm the roadmap page presents no
   compilable-looking v2 API and is clearly labelled not-shipped:

   ```bash
   grep -n 'Keiro.Workflow\|keiro_workflow_steps\|keiro_awakeables\|awakeable' \
     content/docs/keiro/explanation/workflow-roadmap.mdx
   ```

   Acceptance: any matches are inside prose clearly marked hypothetical/future, never inside a
   ` ```haskell ` block presented as real. Confirm no v2 module/table exists in the source:

   ```bash
   cd /Users/shinzui/Keikaku/bokuno/keiro && ls keiro/src/Keiro/Workflow.hs 2>&1 | grep -q 'No such file' && echo "v2 absent (correct)"
   ```

6. **Framing is correct.** The process-manager explanation must state the **two-transaction**
   model (not a single atomic multi-stream commit) and the `PMCommandFailed`-wedges-the-worker
   caveat:

   ```bash
   grep -ni 'two transaction\|own transaction\|PMCommandFailed\|AckHalt' \
     content/docs/keiro/explanation/process-managers-and-sagas.mdx \
     content/docs/keiro/reference/process-manager.mdx
   ```

   Expected: matches present in both pages.


## Idempotence and Recovery

All steps are file authoring and are safe to repeat: re-running `pnpm typecheck` /
`pnpm build` / `pnpm dev` is idempotent; editing or recreating an `.mdx` / `meta.json` file
simply overwrites it; `mkdir -p content/docs/keiro/walkthrough/workflow` is idempotent. No
database or keiro source is modified — the keiro tree is opened read-only for cross-checking.

Recovery:
- If a page breaks the build, the error names the offending `.mdx` file and line; fix the MDX
  (most often an untagged fence, an unregistered component used with an `import`, or a stray
  `<` in prose) and rebuild.
- If the sidebar order or a group is wrong, edit the relevant `meta.json` `pages` array; only
  append your own slugs and do not disturb other plans' entries.
- To start a page over, delete the `.mdx` and re-author it from its row in the file map.
- If you discover a snippet diverges from the real API at `3f5dc9c`, fix the snippet to match
  the source (the source is authoritative over this plan's transcription) and record the
  divergence in Surprises & Discoveries.
- If a cross-link target page (EP-8/EP-9) does not yet exist, the absolute link is still
  correct and will resolve once that page lands; do not change it to a relative link.


## Interfaces and Dependencies

**Libraries / systems referenced by the content (Haskell, the documented subject), verified
at keiro commit `3f5dc9c`:**

- `Keiro.ProcessManager` (`keiro/keiro/src/Keiro/ProcessManager.hs`) — `ProcessManager`,
  `ProcessManagerAction`, `PMCommand`, `PMCommandResult`, `PMStateResult`,
  `ProcessManagerResult`, `runProcessManagerOnce`, `runProcessManagerWorker`,
  `deterministicCommandId`, `eventAlreadyIn`.
- `Keiro.Timer` / `Keiro.Timer.Types` / `Keiro.Timer.Schema`
  (`keiro/keiro/src/Keiro/Timer.hs`, `Timer/Types.hs`, `Timer/Schema.hs`) — `TimerId`,
  `TimerRequest`, `TimerRow`, `TimerStatus`, `scheduleTimerTx`, `claimDueTimer`,
  `markTimerFired`, `runTimerWorker`.
- `keiro_timers` table + `keiro_timers_due_idx`
  (`keiro/keiro-migrations/sql-migrations/2026-05-17-00-00-00-keiro-bootstrap.sql`).
- `jitsurei` (`keiro/jitsurei/src/Jitsurei/{FulfillmentProcess,EscalationProcess,Timers,Incident,OncallRoster}.hs`)
  — worked-example anchors; run targets `just jitsurei-fulfillment`, `just jitsurei-escalation`.

**Dependency on sibling plans (build-on relationships, link absolute):**
- Process-manager dispatch **builds on EP-8** (`docs/plans/8-…`): `runProcessManagerOnce`
  dispatches each target command via `Keiro.Projection.runCommandWithProjections` and appends
  manager state via `Keiro.Command.runCommandWithSql`; the content-based **router** (EP-8) is
  the stateless contrast for a process manager. Cross-links to EP-8 pages (e.g.
  `/docs/keiro/reference/command`, `/docs/keiro/reference/event-stream`,
  `/docs/keiro/explanation/the-content-based-router`) are authored now and resolve when EP-8
  lands.
- Sagas/routers may read a **read model** (EP-9, `docs/plans/9-…`) to pick targets; the
  totality how-to references read-model/consistency framing. Cross-links non-blocking.
- HARD DEP on EP-7 (`docs/plans/7-…`) for the overview/getting-started/core-concepts pages,
  the jitsurei module map, `docs/keiro-source-sync.md`, the walkthrough hub, and the shared
  conventions.

**Tooling / app (TypeScript, the docs site — TanStack Start static SPA):**
- fumadocs (`fumadocs-core` 16.9.3, `fumadocs-ui` 16.9.3, `fumadocs-mdx` 15.0.10) — MDX
  content + sidebar from `meta.json`; built-in components `Callout`, `Steps`, `Tabs`,
  `Cards`, `TypeTable`, registered in `src/components/mdx.tsx` (author bare, no imports).
  Loader/config in `src/lib/source.ts` and `source.config.ts`.
- TanStack Start + Vite — `pnpm dev` = `vite dev`; `pnpm build` = `vite build` (static SPA in
  `.output/public`); `pnpm start` serves it; `pnpm typecheck` = `fumadocs-mdx && tsc --noEmit`.
- pnpm + Node 22 inside the Nix dev shell (`nix develop`).

**Files this plan creates/owns (all under `content/docs/keiro/`):**

```text
explanation/process-managers-and-sagas.mdx        (title "Understanding process managers and sagas")
explanation/durable-timers.mdx                     (title "Understanding durable timers")
explanation/workflow-roadmap.mdx                   (title "The keiro workflow roadmap: v1 and v2")
reference/process-manager.mdx                      (title "Keiro.ProcessManager")
reference/timers.mdx                               (title "Keiro.Timer")
tutorials/your-first-process-manager.mdx           (title "Your first process manager")
how-to/run-a-process-manager-as-a-subscription.mdx (title "Run a process manager as a subscription")
how-to/write-a-saga-with-compensation.mdx          (title "Write a saga with compensation")
how-to/drive-the-timer-worker.mdx                  (title "Drive the timer worker")
how-to/keep-target-commands-total.mdx              (title "Keep target commands total")
walkthrough/workflow/00-start-here.mdx             (title "00 — Start here")
walkthrough/workflow/01-the-process-manager.mdx    (title "01 — The process manager")
walkthrough/workflow/02-the-timer-schema.mdx       (title "02 — The timer schema")
walkthrough/workflow/03-the-timer-worker.mdx       (title "03 — The timer worker")
walkthrough/workflow/meta.json                     (title "Workflow Walkthrough")
```

**meta.json slugs EP-10 appends (append only; never reorder/remove others):**

```text
explanation/meta.json   += "process-managers-and-sagas", "durable-timers", "workflow-roadmap"
reference/meta.json     += "process-manager", "timers"
how-to/meta.json        += "run-a-process-manager-as-a-subscription", "write-a-saga-with-compensation",
                           "drive-the-timer-worker", "keep-target-commands-total"
tutorials/meta.json     += "your-first-process-manager"
walkthrough/meta.json   += "workflow"   (only if not already present — EP-7 may have added it)
```

**Files this plan touches but does not own:** the per-section `meta.json` files above
(shared; append-only) and `walkthrough/meta.json` (shared; ensure `"workflow"` present). The
top-level `content/docs/keiro/meta.json` is **not** touched.

**Postconditions / interfaces that must exist at the end:**
- Every file above exists and the site builds (`pnpm build` exits 0, `pnpm typecheck` clean).
- The workflow subtree renders in the sidebar in `meta.json` order.
- Each Haskell snippet uses only names present in the keiro source at `3f5dc9c` (verified per
  Validation step 4).
- The process-manager and durable-timer explanation pages each carry a ` ```mermaid `
  diagram; the workflow-roadmap page shows no v2 API as real (Validation step 5); the
  two-transaction model and `PMCommandFailed` caveat are documented (Validation step 6).
