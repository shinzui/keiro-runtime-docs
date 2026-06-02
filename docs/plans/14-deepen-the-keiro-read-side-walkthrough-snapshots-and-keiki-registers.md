---
id: 14
slug: deepen-the-keiro-read-side-walkthrough-snapshots-and-keiki-registers
title: "Deepen the keiro read-side walkthrough: snapshots and keiki registers"
kind: exec-plan
created_at: 2026-06-02T04:47:38Z
master_plan: "docs/masterplans/2-keiro-framework-documentation-set.md"
---

# Deepen the keiro read-side walkthrough: snapshots and keiki registers

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, a developer who opens keiro's **read-side code walkthrough** at
`/docs/keiro/walkthrough/read-side/` can follow keiro's read side through its *real* Haskell
source, end to end, and come away able to contribute to it — not merely skim a few excerpts.
Today the tour exists but is thin: four chapters, mostly one source excerpt plus a paragraph
each. The single most important thing it glosses is the one the user asked us to make
first-class: **snapshots, and specifically how a snapshot persists keiki's `(state, registers)`
pair.** This plan rewrites the read-side tour to contribution-grade depth and gives snapshots
and the symbolic-register pair the detailed, source-faithful treatment they deserve.

"keiro" is a Haskell *library you import* (not a server you run) that turns an append-only
PostgreSQL event log into an event-sourcing and workflow framework. Its decision core is a
**keiki `SymTransducer`** — a pure symbolic-register finite-state transducer. The phrase
"symbolic registers" is a term of art and it is the crux of this plan, so define it up front:
a keiki transducer carries two pieces of runtime that evolve as events are applied. One is the
**control state** `s` — the vertex of the state machine (for an order: `Placed`, `Paid`,
`Shipped`). The other is the **register file** `rs` — an auxiliary, typed bank of named slots
(`RegFile rs` in `Keiki.Core`) that the machine reads and writes on its edges to remember
*values* that are not encoded in the vertex alone (a running total, a deadline, a captured id).
The registers are **not** derived from the control state; they are independent runtime that the
machine threads alongside it. Stepping the machine — `Keiki.step` in
`/Users/shinzui/Keikaku/bokuno/keiki/src/Keiki/Core.hs` — takes the **pair** `(s, RegFile rs)`
and a command, and returns the next `(s, RegFile rs, [events])`. keiro's command path calls it
as `Keiki.step (eventStream ^. #transducer) (state current, registers current) command`
(`/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Command.hs`).

A **snapshot** is precisely the cache that serializes that whole pair at a known stream version
so hydration can start there instead of replaying every event. The reason this plan stresses it:
because the register file is independent runtime, **a snapshot that persisted only the folded
control state `s` and dropped the registers `rs` would silently corrupt hydration** — the
restored machine would resume with empty/garbage registers and make wrong decisions. keiro's
snapshot codec (`Keiro.Snapshot.Codec.defaultStateCodec`) therefore encodes **both** halves as
JSON `{ "state": …, "registers": … }`, and the read-back path (`hydrateWithSnapshot`) decodes
both before seeding the replay. The user called this out specifically; the deepened tour makes
it the spine of the snapshot chapters.

What a reader can do after this change that they could not before:

- **Read the snapshot codec line by line** and explain why both `state` and `registers` are in
  the JSON, how the codec's `shapeHash` (a SHA-256 over the register-file *shape*) and
  `stateCodecVersion` gate which snapshots are even eligible to load, and why a shape or version
  change silently invalidates old snapshots rather than decoding stale bytes.
- **Trace the synchronous inline snapshot write** in `Keiro.Command.writeSnapshotIfNeeded`:
  after a successful append, keiro re-folds the just-emitted events to the post-append
  `(state, registers)` pair with `Keiki.applyEvents`, asks the `SnapshotPolicy` (via
  `shouldSnapshot`) whether to persist, and if so calls `writeSnapshot` — all *inside the
  command's own effect*, not as a fire-and-forget background task.
- **Follow hydration's fast path** in `Keiro.Command.hydrate`: load the latest compatible
  snapshot, seed the replay from its `(state, registers, streamVersion)`, fold only the *newer*
  events forward, and fall back to a full replay (`hydrateFull`) on any miss — proving a snapshot
  can never make hydration *wrong*, only faster.
- **Read the `keiro_snapshots` schema and its two SQL statements** (`lookupSnapshot`,
  `writeSnapshotRow`) and explain the compatibility filter, the `ORDER BY stream_version DESC
  LIMIT 1`, and the monotonicity guard (`WHERE keiro_snapshots.stream_version <= EXCLUDED.…`)
  that stops a late or replayed write from regressing the snapshot.
- **Walk the read-model query path** (`runQueryWith` → `ensureReadModel`/`validateMetadata` →
  `waitIfNeeded`/`waitFor` → `query`) and the registry schema, including the sharp gotcha that
  `Strong` and `Eventual` are behaviorally identical (both skip waiting) and the failure-mode
  asymmetry (schema drift hard-fails; a snapshot miss silently replays).
- **Distinguish the two projection flavors** at the source level: the inline path
  (`runCommandWithProjections` riding the append transaction) versus the async boundary
  (`applyAsyncProjection` handing back a bare `Tx`, with **no shipped worker**) — and the
  honestly-documented gaps (no async worker loop; rebuild is skeleton-only, no shadow-table swap).

You can see the result by running the docs site from the repo root
(`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`): `pnpm dev` (i.e. `vite dev`) and browsing
`http://localhost:3000/docs/keiro/walkthrough/read-side`, or a production build with `pnpm build`.
The read-side tour appears in the sidebar under "Code Walkthrough" → "Read side" with its new,
longer chapter list; every Haskell and SQL fence renders; and the snapshot chapters carry the
register-pair story as their through-line. This is a **content** plan: it edits only MDX and one
`meta.json` under `content/docs/keiro/walkthrough/read-side/`. It writes and compiles no Haskell;
the Haskell appears only as quoted snippets that must match the pinned source.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [x] M0. Preconditions verified _(2026-06-02)_ — EP-9's four thin read-side chapters +
      `walkthrough/read-side/meta.json` confirmed present; `"read-side"` listed in
      `walkthrough/meta.json`; keiro/keiki source readable at the pinned commit (all quoted bindings
      cross-checked). At authoring start the foundation tour
      (`/docs/keiro/walkthrough/foundation/00-start-here`, EP-17) was ABSENT, so foundation links
      were parked; EP-17 then shipped during this work, so the parked links were upgraded to direct
      foundation slugs (see Surprises). `pnpm build` not run here (central gate per orchestration).
- [x] M1. `00-start-here.mdx` rewritten _(2026-06-02)_ — register-pair framing, five-chapter map,
      the "what a snapshot persists" `<Callout type="warn">`, and an overview `mermaid` of the
      write → read flow. Foundation links now direct (foundation `04`/`05`).
- [x] M2. `01-the-snapshot-codec-and-the-register-pair.mdx` authored _(2026-06-02)_ — walks
      `defaultStateCodec`, `decodeSnapshotValue`, the `StateCodec` record, `SnapshotPolicy`/
      `EventStream`, `SnapshotSeed`, `hydrateWithSnapshot` (three benign-miss cases), `writeSnapshot`,
      and the shape-hash/codec-version gating, register-pair as the through-line.
- [x] M3. `02-snapshots-in-the-command-and-hydration-path.mdx` authored _(2026-06-02)_ — `hydrate`
      (snapshot seed → `replayFrom` forward-replay → `hydrateFull` fallback), `Hydrated rs s`,
      `writeSnapshotIfNeeded` (synchronous inline write; `Keiki.applyEvents` re-fold; `Keiki.isFinal`
      terminality; `shouldSnapshot`), the `runCommand` call site, `evaluateCommand` (Transduce),
      the `keiro_snapshots` schema + two SQL statements + monotonicity guard, and the
      `just jitsurei-snapshots` "Every 2 → version 2" transcript with the `'[]` honesty note.
- [x] M4. `03-the-read-model-query-path.mdx` rewritten _(2026-06-02)_ — `ReadModel`/
      `ConsistencyMode`/`PositionWaitOptions`/`ReadModelError`, `runQueryWith`, `validateMetadata`,
      `waitIfNeeded`, `waitFor`'s `subscriptions.last_seen` poll, the `keiro_read_models` registry
      (idempotent `registerReadModel`, `statusFromText → Paused`), and the `Strong == Eventual`
      gotcha in a warn callout.
- [x] M5. `04-projections-and-the-rebuild-path.mdx` authored _(2026-06-02)_ —
      `InlineProjection`/`AsyncProjection`, `runCommandWithProjections` (in-transaction) vs
      `applyAsyncProjection` (bare `Tx`, no worker), and the `rebuild`/`promote`/`abandonRebuild`
      skeleton with the no-worker / no-shadow-table gaps stated honestly in callouts.
- [x] M6. `walkthrough/read-side/meta.json` updated to the five-chapter `pages` array; the three
      superseded files deleted (plain `rm`). Local audits clean: no relative links, no untagged
      opening fences (all bare fences are closers; fence counts even), every quoted binding present
      in pinned source, every cross-link resolves to an existing file. `pnpm build`/`pnpm lint:links`
      deferred to the central gate (not run here per orchestration scope).


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

- **Source divergence — the jitsurei base stream is `orderEventStream`, not `baseOrderEventStream`.**
  The Context transcription showed `snapshotOrderEventStream = baseOrderEventStream { … }`. The pinned
  source names the base `orderEventStream` and `snapshotOrderEventStream` is a record update over it.
  Evidence (`jitsurei/src/Jitsurei/OrderStream.hs:41–56`):

  ```haskell
  orderEventStream :: OrderEventStream
  orderEventStream = EventStream { …, snapshotPolicy = Never, stateCodec = Nothing }

  snapshotOrderEventStream :: OrderEventStream
  snapshotOrderEventStream =
    orderEventStream
      { snapshotPolicy = Every 2
      , stateCodec = Just (defaultStateCodec @OrderRegs @OrderState 1)
      }
  ```

  Resolution: chapter 02 quotes `orderEventStream` (the real name) and adds a one-line note that it
  is the non-snapshotting base (`Never` / `Nothing`). _(2026-06-02)_
- **Minor — `decodeSnapshotValue` is internal; `defaultStateCodec` is re-exported by `Keiro.Snapshot`.**
  `Keiro.Snapshot.Codec`'s export list is `( defaultStateCodec )` only — `decodeSnapshotValue` is a
  module-local helper (still quoted accurately as the `decode` field). `Keiro.Snapshot` re-exports
  `Keiro.Snapshot.Codec` (and `.Schema`), so callers reach `defaultStateCodec` via either module.
  Chapter 01 adds an info callout noting `decodeSnapshotValue` is internal and you wire snapshots by
  passing `defaultStateCodec`. No snippet inaccuracy. _(2026-06-02)_
- **Cross-tour timing — EP-17 and EP-13 shipped during this work.** The foundation tour
  (`/docs/keiro/walkthrough/foundation/04-the-symtransducer-and-step`,
  `…/05-threading-state-and-registers`) and the renumbered command-cycle tour
  (`…/command-cycle/02-hydration`, `…/04-the-transactional-write-path`) became present mid-authoring,
  so the parked landing links were upgraded to direct slugs per the canonical slug map. All targets
  verified to exist as files. _(2026-06-02)_


## Decision Log

Record every decision made while working on the plan.

- Decision: Split the snapshot material into **two** chapters — one for the *codec and the
  register pair* (`01-the-snapshot-codec-and-the-register-pair`) and one for *the command and
  hydration path* (`02-snapshots-in-the-command-and-hydration-path`) — rather than keeping the
  single thin `01-snapshots-in-the-command-path` chapter EP-9 shipped.
  Rationale: the user asked for snapshots and the register pair to be first-class. The codec
  (what is serialized, and *why both halves*) is a distinct concern from where the read/write
  fire in the command path; one combined chapter cannot give either the depth a contributor
  needs. The split is permitted within our owned subdir (Integration Point #2, Phase-4 extension).
  Date: 2026-06-02
- Decision: **Link to EP-17's foundation tour for "what registers are"** instead of re-deriving
  the register model; cite the same keiki source modules EP-17 cites.
  Rationale: Integration Point #7 splits ownership — EP-17 owns the conceptual register model,
  EP-14 owns its persistence. Re-deriving would risk contradicting EP-17 and duplicate work. The
  read-side tour gives just enough of a one-paragraph reminder (registers are independent runtime,
  not derived from state) to make the snapshot story self-contained, then links out.
  Date: 2026-06-02
- Decision: Park the forward link to the foundation tour on the walkthrough section landing
  `/docs/keiro/walkthrough` until EP-17 ships, then **upgrade in place** once its pages exist.
  Rationale: the prerender crawler follows `<Card href>`/inline links and fails the build with
  `Failed to fetch` when a target route does not yet exist (the hard-won kiroku/EP-7 lesson). EP-17
  was authored in parallel; the chapters were first written with parked landing links. EP-17 then
  shipped during this work (foundation `04-the-symtransducer-and-step` and
  `05-threading-state-and-registers` now exist), so per Integration Point #7 the parked references
  were upgraded to those direct slugs and verified to resolve to real files. The command-cycle
  hydration cross-link was likewise upgraded to `…/command-cycle/02-hydration` once EP-13 landed it.
  Date: 2026-06-02
- Decision: Merge the read-model **rebuild path** into the projections chapter
  (`04-projections-and-the-rebuild-path`) and document it **as a skeleton** — `rebuild`/`promote`/
  `abandonRebuild` are thin status-transition wrappers with **no** shadow-table swap and **no**
  automated replay.
  Rationale: `Keiro.ReadModel.Rebuild` is genuinely three wrappers over `markRebuilding`/`markLive`/
  `markAbandoned` and nothing more; the keiro research notes' eight-step rebuild protocol is not
  implemented. Honesty about the gap is required by Integration Point #6(b). It is a small surface,
  so it rides with projections rather than getting its own chapter.
  Date: 2026-06-02
- Decision: Document the read side **as shipped at the pinned commit `3f5dc9c` (keiro 0.1.0.0)**;
  treat the keiro repo's `docs/research/*` and `docs/plans/*` notes as history where they diverge.
  Rationale: self-containment and accuracy (Integration Point #6(b)); the notes describe a
  fire-and-forget snapshot write and an implemented rebuild protocol that the shipped code does not
  match.
  Date: 2026-06-02


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

**Implementation complete _(2026-06-02)_.** The read-side tour is now five chapters, all
contribution-grade and source-faithful to the pinned commit `3f5dc9c`.

Final chapter list and line counts:

```text
00-start-here.mdx                                    92
01-the-snapshot-codec-and-the-register-pair.mdx     257
02-snapshots-in-the-command-and-hydration-path.mdx  292
03-the-read-model-query-path.mdx                    186
04-projections-and-the-rebuild-path.mdx             116
                                              total  943
```

`meta.json` lists the five slugs in order; the three superseded EP-9 files
(`01-snapshots-in-the-command-path.mdx`, `02-the-read-model-query-path.mdx`, `03-projections.mdx`)
were deleted.

Depth checklist: all items satisfied — the codec persists the `(state, registers)` pair (ch.01); the
keiki register pair is treated explicitly and linked to the now-shipped foundation tour (ch.00/01);
the `keiro_snapshots` schema, the two SQL statements, and the monotonicity guard are shown (ch.02);
`shouldSnapshot` + the four policy constructors and the `Every 2 → version 2` firing are shown
(ch.02); the synchronous inline write (`writeSnapshotIfNeeded` + call site) is walked with the
research-notes correction (ch.02); hydration reads the latest snapshot then folds only newer events
with the three benign-miss cases (ch.01/02); the read-model query path with the `Strong == Eventual`
gotcha (ch.03); inline-vs-async projections with the no-worker gap (ch.04); the rebuild gap stated
honestly (ch.04).

Local audits (the docs build does not compile Haskell, so these are the guard): no relative links; no
untagged opening fences (all bare fences are closers, fence counts even per file); every quoted
Haskell/SQL binding verified present in the pinned keiro/keiki source; every cross-link resolves to an
existing file. `pnpm build` / `pnpm lint:links` were deferred to the central walkthrough gate (EP-19)
per the orchestration scope and were not run from this plan.

Foundation link: **upgraded** (not left parked) — EP-17 shipped during this work, so the references
now point directly at foundation `04-the-symtransducer-and-step` and
`05-threading-state-and-registers`. The command-cycle hydration link was likewise upgraded to
`…/command-cycle/02-hydration` once EP-13 landed it.

Source divergences from this plan's transcriptions: one substantive (the jitsurei base stream is
`orderEventStream`, not `baseOrderEventStream` — corrected in ch.02) and two minor (`decodeSnapshotValue`
is internal; `defaultStateCodec` re-exported via `Keiro.Snapshot`). All recorded in Surprises &
Discoveries with evidence. No snippet inaccuracies remain.


## Context and Orientation

Read this whole section before editing. It is written so a novice with only this file and the
working tree can complete the work. You will edit MDX content files and one `meta.json`; you will
not write or compile Haskell. The Haskell appears only as *quoted snippets* inside the docs, and
every snippet must match the real source transcribed below.

### What you are building, and where

This repository (`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`) is a **fumadocs**
documentation site (fumadocs-ui + fumadocs-mdx) built on **TanStack Start as a static
single-page app** (React + MDX + TypeScript, bundled with **Vite**), built and served with
**pnpm** on **Node 22**. `pnpm dev` runs `vite dev`; `pnpm build` runs `vite build` and emits a
static SPA under `.output/public`. Content lives under `content/docs/`. Each directory has a
`meta.json` whose `pages` array lists child page slugs (and nested directory names) in sidebar
order. A "page" is an `.mdx` file: YAML frontmatter (`title`, `description`) then an MDX body.

The documented code samples are **Haskell** (the site is TypeScript; the subject, keiro, is a
Haskell library). MDX components (`Callout`, `Cards`, `Card`, `Steps`, `Step`, `Tabs`, `Tab`,
`TypeTable`, `Accordion`, `Accordions`, `Mermaid`) are **registered globally** in
`src/components/mdx.tsx`, so in page bodies you use them **bare, with no `import` lines**. Do not
add `import` statements for these.

### Where this plan sits in the larger effort

This is **EP-14** in the MasterPlan
`docs/masterplans/2-keiro-framework-documentation-set.md`. It is **Phase 4 — Walkthrough
deepening**. Phase 4 reopens the `walkthrough/` tree (which Phases 1–3 shipped thin) and brings
each tour to contribution-grade depth.

- **HARD DEP — EP-9** (`docs/plans/9-keiro-read-side-documentation-projections-read-models-and-snapshots.md`,
  Complete): EP-9 created the read-side tour you are deepening (`walkthrough/read-side/` with its
  `00-start-here` + three chapters + `meta.json`) and the read-side reference/explanation pages your
  chapters link to (`/docs/keiro/reference/snapshot`, `/docs/keiro/reference/read-model`,
  `/docs/keiro/reference/projection`, `/docs/keiro/explanation/consistency-and-snapshots`). Those
  pages already exist, so links to them resolve directly.
- **HARD DEP — EP-7** (Complete): the `/docs/keiro` overview/getting-started spine, the jitsurei
  module map, `docs/keiro-source-sync.md`, and the `walkthrough/` hub + `walkthrough/meta.json`.
- **SOFT DEP — EP-17** (`docs/plans/17-keiro-foundation-code-walkthrough-eventstream-stream-codec-and-the-keiki-transducer-step.md`,
  being authored in parallel): the **new** foundation tour at `/docs/keiro/walkthrough/foundation/`
  owns the *conceptual* register model — what a `SymTransducer` is, what `registers` (`rs`) are
  versus `state` (`s`), and how `Keiki.step` threads `(state, registers)`. Per **Integration Point
  #7**, your snapshot chapters **link to** that model rather than re-deriving it. Soft means
  non-blocking: if EP-17's `…/foundation/00-start-here` page does not yet exist when you build,
  **park** the forward reference on the section landing `/docs/keiro/walkthrough` and name the
  foundation tour in prose (see the crawler rule below). EP-19 finalization may upgrade the parked
  link once EP-17 lands.
- **SOFT DEP — EP-13** (command-cycle tour deepening): the read-side tour cross-links the
  command-cycle tour for the write-path mechanics (`/docs/keiro/walkthrough/command-cycle/…`). EP-9
  already linked the command-cycle chapters that exist; keep those absolute links.

### Hard-won house rules (apply to every page you write)

1. **Absolute doc links only.** Cross-page links use absolute doc paths
   (`/docs/keiro/walkthrough/read-side/02-snapshots-in-the-command-and-hydration-path`), never
   relative `./sibling` or `../section/page`. Relative MDX links resolve *wrong* in the static SPA
   and trip the prerender crawler (the kiroku/EP-7 lesson: a `./01-…` link emitted
   `[unhandledRejection] Failed to fetch`). This applies to any inter-chapter link.
2. **Forward-links to not-yet-shipped pages are parked on the section landing.** If a page you want
   to link does not exist yet (notably EP-17's `/docs/keiro/walkthrough/foundation/00-start-here`),
   link the existing landing `/docs/keiro/walkthrough` and name the intended target in prose. A
   premature link to a missing route fails the build with `Failed to fetch`.
3. **Every fenced code block carries a language tag** — ` ```haskell `, ` ```sql `, ` ```json `,
   ` ```mermaid `, ` ```bash `, ` ```text `. Never a bare ```` ``` ````.
4. **Snippet accuracy is an acceptance criterion.** Every Haskell/SQL type, field, and function
   name you quote must appear verbatim in the pinned source. The verified transcription is below;
   cross-check against the named files before declaring a snippet done. Haskell snippets are **not**
   compiled — accuracy comes only from matching the pinned source.
5. **No `import` lines for the MDX components.**
6. **Command-cycle phrasing is "Hydrate → Transduce → Append", never "Decide".** The middle phase
   is the `Keiki.step` transducer step; do not call it "Decide" (that echoes keiki's legacy Decider
   façade, which must not appear).

### Source of truth (read-only) — the subject, transcribed

Source of truth on disk: `/Users/shinzui/Keikaku/bokuno/keiro`, pinned commit `3f5dc9c`, plus the
keiki dependency at `/Users/shinzui/Keikaku/bokuno/keiki`. Do **not** edit either tree. The facts
below are transcribed verbatim and are your API cheat-sheet. The exact files are named inline so a
reader can re-verify each snippet.

#### The register pair (one-paragraph reminder; full model is EP-17's)

A keiki `SymTransducer` is defined in `/Users/shinzui/Keikaku/bokuno/keiki/src/Keiki/Core.hs`:

```haskell
-- keiki/src/Keiki/Core.hs
data SymTransducer phi rs s ci co = SymTransducer
  { edgesOut    :: s -> [Edge phi rs ci co s]
  , initial     :: s
  , initialRegs :: RegFile rs
  , isFinal     :: s -> Bool
  }
```

`s` is the control state (the vertex); `RegFile rs` is the **register file** — an independent,
typed bank of named slots the machine reads/writes on its edges. `RegFile` is a GADT keyed by a
type-level list of slots, so each slot has a compile-time name and value type:

```haskell
-- keiki/src/Keiki/Core.hs
data RegFile (rs :: [Slot]) where
  RNil  :: RegFile '[]
  RCons :: KnownSymbol s => Proxy s -> r -> RegFile rs -> RegFile ('(s, r) ': rs)
```

Stepping the machine threads the **pair** and is the operation keiro's command path uses:

```haskell
-- keiki/src/Keiki/Core.hs
step
  :: BoolAlg phi (RegFile rs, ci)
  => SymTransducer phi rs s ci co
  -> (s, RegFile rs)        -- the pair: control state AND registers
  -> ci                     -- the command input
  -> Maybe (s, RegFile rs, [co])   -- next state, next registers, emitted events
```

Replay helpers fold *events* (not commands) back over the pair and are what hydration and the
snapshot write use:

```haskell
-- keiki/src/Keiki/Core.hs
applyEvents
  :: (BoolAlg phi (RegFile rs, ci), Eq co)
  => SymTransducer phi rs s ci co
  -> (s, RegFile rs)        -- start pair
  -> [co]                   -- events to fold forward
  -> Maybe (s, RegFile rs)  -- post-fold pair (Nothing if the log can't replay)

applyEventStreaming
  :: (BoolAlg phi (RegFile rs, ci), Eq co)
  => SymTransducer phi rs s ci co
  -> InFlight s co -> RegFile rs -> co
  -> Maybe (InFlight s co, RegFile rs)
```

`InFlight s co` is keiki's replay wrapper: `Settled s` is the state at a stable vertex,
`InFlight s [queued]` is mid-chain through a multi-event edge. `isFinal` is the
`SymTransducer` field above; keiro calls it as `Keiki.isFinal transducer s`.

**The load-bearing fact for this whole plan:** the register file is independent runtime, not a
view of `s`. So persisting only `s` and dropping `rs` would resume the machine with the wrong
registers. That is *why* the snapshot codec serializes both halves.

#### The snapshot codec — `Keiro.Snapshot.Codec` (this plan's centerpiece)

File: `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Snapshot/Codec.hs`. Note this lives
in the `keiro` package (not `keiro-core`) at the pinned commit — verify the path before quoting.

```haskell
-- keiro/src/Keiro/Snapshot/Codec.hs
defaultStateCodec ::
  forall rs s.
  (FromJSON s, KnownRegFileShape rs, RegFileToJSON rs, ToJSON s) =>
  Int ->
  StateCodec (s, RegFile rs)
defaultStateCodec version = StateCodec
  { stateCodecVersion = version
  , shapeHash = regFileShapeHash (Proxy @rs)
  , encode = \(state, registers) ->
      object
        [ "state" Aeson..= state
        , "registers" Aeson..= regFileToJSON registers
        ]
  , decode = decodeSnapshotValue
  }

decodeSnapshotValue ::
  forall rs s.
  (FromJSON s, RegFileToJSON rs) =>
  Value ->
  Either Text (s, RegFile rs)
decodeSnapshotValue value =
  case parseEither parser value of
    Left message -> Left (Text.pack message)
    Right pair -> Right pair
  where
    parser = withObject "Keiro snapshot" $ \objectValue -> do
      stateValue <- objectValue .: "state"
      registerValue <- objectValue .: "registers"
      state <- case Aeson.fromJSON stateValue of
        Error message -> fail ("state: " <> message)
        Success decoded -> pure decoded
      registers <- case regFileFromJSON @rs registerValue of
        Left message -> fail ("registers: " <> message)
        Right decoded -> pure decoded
      pure (state, registers)
```

Key teaching points (all verifiable in the snippet):
- The codec is over the **pair** `(s, RegFile rs)`. The JSON is `{ "state": …, "registers": … }`.
  The `state` half uses the domain type's `ToJSON`/`FromJSON`; the `registers` half uses keiki's
  `regFileToJSON`/`regFileFromJSON` (from `Keiki.Codec.JSON` at
  `/Users/shinzui/Keikaku/bokuno/keiki/keiki-codec-json/src/Keiki/Codec/JSON.hs`).
- `shapeHash = regFileShapeHash (Proxy @rs)` is a **SHA-256 over the register-file shape** (from
  `Keiki.Shape`, `regFileShapeHash :: KnownRegFileShape rs => Proxy rs -> Text`). It is computed
  from the *type-level* slot list, so any change to the register layout changes the hash.
- `stateCodecVersion` is the caller-supplied `Int` — bump it when the encoding changes in a way
  the shape hash does not capture (e.g. the state's JSON shape changes).
- Decode failure is `Either Text` — a `Left` message, not an exception. The hydration path treats
  it as a benign miss (see below).

The `StateCodec` record it builds is defined in `Keiro.EventStream`
(`/Users/shinzui/Keikaku/bokuno/keiro/keiro-core/src/Keiro/EventStream.hs`):

```haskell
-- keiro-core/src/Keiro/EventStream.hs
data StateCodec state = StateCodec
  { stateCodecVersion :: !Int
  , shapeHash :: !Text
  , encode :: !(state -> Value)
  , decode :: !(Value -> Either Text state)
  }
```

And the per-stream snapshot configuration lives on the `EventStream` itself (same file):

```haskell
-- keiro-core/src/Keiro/EventStream.hs
data SnapshotPolicy state
  = Never
  | Every !Int
  | OnTerminal
  | Custom !(state -> StreamVersion -> Bool)

data EventStream phi rs s ci co = EventStream
  { transducer        :: !(SymTransducer phi rs s ci co)
  , initialState      :: !s
  , initialRegisters  :: !(RegFile rs)
  , eventCodec        :: !(Codec co)
  , resolveStreamName :: !(Stream (EventStream phi rs s ci co) -> StreamName)
  , snapshotPolicy    :: !(SnapshotPolicy (s, RegFile rs))
  , stateCodec        :: !(Maybe (StateCodec (s, RegFile rs)))   -- Nothing disables snapshots
  }
```

Note `snapshotPolicy` and `stateCodec` are both over the **pair** `(s, RegFile rs)`, and
`stateCodec = Nothing` disables snapshotting regardless of `snapshotPolicy`.

#### `Keiro.Snapshot` — the hydration seed and the write

File: `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Snapshot.hs`.

```haskell
-- keiro/src/Keiro/Snapshot.hs
data SnapshotSeed rs s = SnapshotSeed
  { state         :: !s
  , registers     :: !(RegFile rs)
  , streamVersion :: !StreamVersion
  }

hydrateWithSnapshot ::
  (Store :> es) =>
  StreamName ->
  StateCodec (s, RegFile rs) ->
  Eff es (Maybe (SnapshotSeed rs s))
hydrateWithSnapshot streamName codec = do
  streamId <- lookupStreamId streamName
  case streamId of
    Nothing -> pure Nothing
    Just foundStreamId -> do
      row <- lookupSnapshot foundStreamId (codec ^. #stateCodecVersion) (codec ^. #shapeHash)
      pure $ do
        snapshot <- row
        (state, registers) <- either (const Nothing) Just ((codec ^. #decode) (snapshot ^. #state))
        pure SnapshotSeed
          { state = state
          , registers = registers
          , streamVersion = snapshot ^. #streamVersion
          }

writeSnapshot ::
  (Store :> es) =>
  StreamId ->
  StreamVersion ->
  StateCodec state ->
  state ->
  Eff es ()
writeSnapshot streamId streamVersion codec state =
  writeSnapshotRow SnapshotWrite
    { streamId          = streamId
    , streamVersion     = streamVersion
    , state             = (codec ^. #encode) state
    , stateCodecVersion = codec ^. #stateCodecVersion
    , regfileShapeHash  = codec ^. #shapeHash
    }
```

`SnapshotSeed` carries the decoded **pair** plus the version it captures. `hydrateWithSnapshot`
returns `Nothing` (a benign miss → "replay from the beginning") in three cases: the stream has no
id yet, `lookupSnapshot` found no compatible row, or `decode` failed (the `either (const Nothing)
Just` line). `writeSnapshot` encodes the pair and upserts via `writeSnapshotRow`.

#### `Keiro.Snapshot.Schema` — the `keiro_snapshots` table and its two statements

File: `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Snapshot/Schema.hs`.

```haskell
-- keiro/src/Keiro/Snapshot/Schema.hs
data SnapshotRow = SnapshotRow
  { streamId          :: !StreamId
  , streamVersion     :: !StreamVersion
  , state             :: !Value
  , stateCodecVersion :: !Int
  , regfileShapeHash  :: !Text
  , createdAt         :: !UTCTime
  , updatedAt         :: !UTCTime
  }

data SnapshotWrite = SnapshotWrite
  { streamId          :: !StreamId
  , streamVersion     :: !StreamVersion
  , state             :: !Value
  , stateCodecVersion :: !Int
  , regfileShapeHash  :: !Text
  }

lookupSnapshot   :: (Store :> es) => StreamId -> Int -> Text -> Eff es (Maybe SnapshotRow)
writeSnapshotRow :: (Store :> es) => SnapshotWrite -> Eff es ()
```

The two SQL statements (quote them in the chapter — they are the heart of compatibility +
monotonicity):

```sql
-- lookupSnapshotStmt: newest compatible row only
SELECT stream_id, stream_version, state, state_codec_version, regfile_shape_hash, created_at, updated_at
FROM keiro_snapshots
WHERE stream_id = $1
  AND state_codec_version = $2
  AND regfile_shape_hash = $3
ORDER BY stream_version DESC
LIMIT 1
```

```sql
-- writeSnapshotStmt: upsert with a monotonicity guard
INSERT INTO keiro_snapshots
  (stream_id, stream_version, state, state_codec_version, regfile_shape_hash)
VALUES
  ($1, $2, $3, $4, $5)
ON CONFLICT (stream_id) DO UPDATE
  SET stream_version = EXCLUDED.stream_version,
      state = EXCLUDED.state,
      state_codec_version = EXCLUDED.state_codec_version,
      regfile_shape_hash = EXCLUDED.regfile_shape_hash,
      updated_at = now()
  WHERE keiro_snapshots.stream_version <= EXCLUDED.stream_version
```

Teaching points: the lookup filters on `state_codec_version` **and** `regfile_shape_hash`, so an
incompatible snapshot is simply *not found* (the gating happens in SQL, before any decode). The
write is one row per stream (PK `stream_id`); the `WHERE … stream_version <= EXCLUDED.stream_version`
on the `DO UPDATE` is the **monotonicity guard** — a late or replayed write whose version is older
than the stored one is a no-op, so the snapshot never regresses.

The DDL (from `keiro-migrations/sql-migrations/2026-05-17-00-00-00-keiro-bootstrap.sql`):

```sql
CREATE TABLE IF NOT EXISTS keiro_snapshots (
  stream_id           BIGINT PRIMARY KEY,
  stream_version      BIGINT NOT NULL,
  state               JSONB NOT NULL,
  state_codec_version BIGINT NOT NULL,
  regfile_shape_hash  TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS keiro_snapshots_compat_idx
  ON keiro_snapshots (stream_id, state_codec_version, regfile_shape_hash, stream_version DESC);
```

The `keiro_snapshots_compat_idx` index exactly backs the `lookupSnapshot` filter + ordering.

#### `Keiro.Snapshot.Policy` — `shouldSnapshot`

File: `/Users/shinzui/Keikaku/bokuno/keiro/keiro-core/src/Keiro/Snapshot/Policy.hs` (this one is
in `keiro-core`).

```haskell
-- keiro-core/src/Keiro/Snapshot/Policy.hs
shouldSnapshot :: SnapshotPolicy state -> Bool -> state -> StreamVersion -> Bool
shouldSnapshot Never _ _ _ = False
shouldSnapshot (Every interval) _ _ (StreamVersion version)
  | interval <= 0 = False
  | otherwise = version `Prelude.mod` Prelude.fromIntegral interval == 0
shouldSnapshot OnTerminal terminal _ _ = terminal
shouldSnapshot (Custom decide) _ state version = decide state version
```

The `Bool` second argument is the **terminality flag** (passed in from `Keiki.isFinal`); `Every n`
fires when the post-append version is a positive multiple of `n`; `OnTerminal` mirrors the
terminality flag.

#### The command-path integration — `Keiro.Command`

File: `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Command.hs`.

`hydrate` tries a snapshot seed first and falls back to a full replay on any miss:

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
  where
    snapshotSeed =
      case eventStream ^. #stateCodec of
        Nothing -> pure Nothing
        Just codec ->
          hydrateWithSnapshot ((eventStream ^. #resolveStreamName) targetStream) codec
```

`replayFrom seed` resumes the transducer from the seed's `(state, registers, streamVersion)` and
folds **only the events after `streamVersion`** forward via `Keiki.applyEventStreaming`, finishing
only if the machine ends `Settled` (an `InFlight` machine at the end yields
`HydrationReplayFailed`, which trips the `Left _ -> hydrateFull` fallback). `hydrateFull` replays
from `StreamVersion 0` using `initialState`/`initialRegisters`. The relevant types:

```haskell
-- keiro/src/Keiro/Command.hs
data Hydrated rs s = Hydrated
  { state          :: !s
  , registers      :: !(RegFile rs)
  , streamVersion  :: !StreamVersion
  , globalPosition :: !(Maybe GlobalPosition)
  }
```

The synchronous write fires after a successful append, inside the command's own effect:

```haskell
-- keiro/src/Keiro/Command.hs
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

Walk this carefully in the chapter: `current` is the **pre-append** `Hydrated rs s` (its `state`
and `registers` are the pair *before* this command's events). `Keiki.applyEvents transducer (state
current, registers current) events` re-folds the just-emitted `events` forward to the
**post-append pair** `finalState :: (s, RegFile rs)`. `Prelude.fst finalState` is the post-append
control state, fed to `Keiki.isFinal` for the terminality flag. `shouldSnapshot` then decides, and
`writeSnapshot` persists the **whole pair** at `finalVersion`. This is called inline from both
`appendOnce` (in `runCommand`) and `appendWithSqlOnce` (in `runCommandWithSqlEvents`), each
immediately after a `Right appendResult` — i.e. **synchronously, on the command's effect**, not a
post-commit background task. (The keiro research notes describe a fire-and-forget write; the
shipped code does not do that.)

For orientation, the call site in `runCommand`'s append step:

```haskell
-- keiro/src/Keiro/Command.hs
case appended of
  Right appendResult -> do
    writeSnapshotIfNeeded eventStream current events appendResult
    pure (Right (appendedResult targetStream appendResult (Prelude.length encoded)))
  Left (_, storeError) ->
    retryOrFail options attempt remaining storeError
```

And the transducer step the command path uses (the `(state current, registers current)` pair
threaded into `Keiki.step`), in `evaluateCommand`:

```haskell
-- keiro/src/Keiro/Command.hs
evaluateCommand eventStream current command =
  case Keiki.step (eventStream ^. #transducer) (state current, registers current) command of
    Nothing -> Left CommandRejected
    Just (_, _, events) -> Right events
```

#### `Keiro.ReadModel` — the query path

File: `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/ReadModel.hs`.

```haskell
-- keiro/src/Keiro/ReadModel.hs
data ReadModel q r = ReadModel
  { name               :: !Text
  , tableName          :: !Text
  , subscriptionName   :: !Text
  , version            :: !Int
  , shapeHash          :: !Text
  , defaultConsistency :: !ConsistencyMode
  , query              :: !(q -> Tx.Transaction r)
  }

data ConsistencyMode = Strong | Eventual | PositionWait !PositionWaitOptions
  deriving stock (Generic, Eq, Show)

data PositionWaitOptions = PositionWaitOptions
  { target        :: !(Maybe GlobalPosition)   -- Nothing => skip waiting
  , timeoutMicros :: !Int
  , pollMicros    :: !Int
  }

data ReadModelError
  = ReadModelStaleSchema !Text !Int !Int !Text !Text
  | ReadModelWaitTimeout !Text !GlobalPosition !GlobalPosition
  | ReadModelNotLive     !Text !ReadModelStatus
  deriving stock (Generic, Eq, Show)

runQuery     :: (IOE :> es, Store :> es) => ReadModel q r -> q -> Eff es (Either ReadModelError r)
runQueryWith :: (IOE :> es, Store :> es) => ConsistencyMode -> ReadModel q r -> q -> Eff es (Either ReadModelError r)
waitFor      :: (IOE :> es, Store :> es) => PositionWaitOptions -> ReadModel q r -> GlobalPosition -> Eff es (Either ReadModelError ())
```

`runQueryWith` does, in order: `ensureReadModel` → on `Right ()`, `waitIfNeeded consistency` → on
`Right ()`, run `query` in a transaction:

```haskell
-- keiro/src/Keiro/ReadModel.hs
runQueryWith consistency readModel input = do
  schemaCheck <- ensureReadModel readModel
  case schemaCheck of
    Left err -> pure (Left err)
    Right () -> do
      waitResult <- waitIfNeeded consistency readModel
      case waitResult of
        Left err -> pure (Left err)
        Right () -> Right <$> runTransaction ((readModel ^. #query) input)

validateMetadata readModel metadata
  | metadata ^. #version /= readModel ^. #version = stale
  | metadata ^. #shapeHash /= readModel ^. #shapeHash = stale
  | metadata ^. #status /= Live = Left (ReadModelNotLive (readModel ^. #name) (metadata ^. #status))
  | otherwise = Right ()

waitIfNeeded Strong _ = pure (Right ())
waitIfNeeded Eventual _ = pure (Right ())
waitIfNeeded (PositionWait options) readModel =
  case options ^. #target of
    Nothing -> pure (Right ())
    Just targetPosition -> waitFor options readModel targetPosition
```

**The gotcha to teach:** `Strong` and `Eventual` are the **same** — both return `Right ()`
immediately. Only `PositionWait` with a `Just target` calls `waitFor`, which polls
`subscriptions.last_seen` until the target `GlobalPosition` is reached or `timeoutMicros` elapses
(→ `ReadModelWaitTimeout`). `waitFor`'s poll loop SQL:

```sql
SELECT last_seen
FROM subscriptions
WHERE subscription_name = $1
```

(The `subscriptions` table is **kiroku-owned**, not in keiro's migration.)

#### `Keiro.ReadModel.Schema` — the registry

File: `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/ReadModel/Schema.hs`.

```haskell
-- keiro/src/Keiro/ReadModel/Schema.hs
data ReadModelStatus = Live | Rebuilding | Paused | Abandoned
  deriving stock (Generic, Eq, Show)

data ReadModelMetadata = ReadModelMetadata
  { name        :: !Text
  , version     :: !Int
  , shapeHash   :: !Text
  , lastBuiltAt :: !(Maybe UTCTime)
  , status      :: !ReadModelStatus
  }

registerReadModel :: (Store :> es) => Text -> Int -> Text -> Eff es ReadModelMetadata
lookupReadModel   :: (Store :> es) => Text -> Eff es (Maybe ReadModelMetadata)
markRebuilding    :: (Store :> es) => Text -> Int -> Text -> Eff es ReadModelMetadata
markLive          :: (Store :> es) => Text -> Int -> Text -> Eff es ReadModelMetadata
markAbandoned     :: (Store :> es) => Text -> Int -> Text -> Eff es ReadModelMetadata
```

`registerReadModel`'s statement is an idempotent `INSERT … ON CONFLICT (name) DO NOTHING` that
returns the existing row unchanged via a `UNION ALL` — it **never overwrites** the stored
`version`/`shapeHash`. That is exactly what lets `validateMetadata` detect drift. The status
transitions all go through one `transitionReadModelStmt` upsert; `statusFromText` decodes an
unrecognized status to `Paused` defensively. The DDL:

```sql
CREATE TABLE IF NOT EXISTS keiro_read_models (
  name          TEXT PRIMARY KEY,
  version       BIGINT NOT NULL,
  shape_hash    TEXT NOT NULL,
  last_built_at TIMESTAMPTZ,
  status        TEXT NOT NULL,           -- no CHECK constraint on status
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `Keiro.ReadModel.Rebuild` — skeleton only

File: `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/ReadModel/Rebuild.hs`. Three thin
wrappers that thread `name`/`version`/`shapeHash` into the status transitions:

```haskell
-- keiro/src/Keiro/ReadModel/Rebuild.hs
rebuild        :: (Store :> es) => ReadModel q r -> Eff es ReadModelMetadata  -- -> markRebuilding
promote        :: (Store :> es) => ReadModel q r -> Eff es ReadModelMetadata  -- -> markLive
abandonRebuild :: (Store :> es) => ReadModel q r -> Eff es ReadModelMetadata  -- -> markAbandoned
```

**No shadow-table swap and no automated replay.** Repopulating the table from the event log
between `rebuild` and `promote` is the caller's job; while not `Live`, `runQuery` rejects with
`ReadModelNotLive`. Document this gap honestly.

#### `Keiro.Projection` — inline vs async

File: `/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Projection.hs`.

```haskell
-- keiro/src/Keiro/Projection.hs
data InlineProjection co = InlineProjection
  { name  :: !Text
  , apply :: !(co -> RecordedEvent -> Tx.Transaction ())
  }

data AsyncProjection = AsyncProjection
  { name             :: !Text
  , subscriptionName :: !Text
  , applyRecorded    :: !(RecordedEvent -> Tx.Transaction ())
  , idempotencyKey   :: !(RecordedEvent -> EventId)
  }

runCommandWithProjections options eventStream targetStream command projections = do
  result <-
    runCommandWithSqlEvents options eventStream targetStream command
      ( \pairs _appendResult ->
          traverse_
            ( \projection ->
                traverse_
                  (\(event, recorded) -> (projection ^. #apply) event recorded)
                  pairs
            )
            projections
      )
  pure (fmap Prelude.fst result)

applyAsyncProjection :: AsyncProjection -> RecordedEvent -> Tx.Transaction ()
applyAsyncProjection projection recorded =
  (projection ^. #applyRecorded) recorded
```

`runCommandWithProjections` delegates to `runCommandWithSqlEvents` (EP-8/EP-13's
`Keiro.Command`): the callback runs **inside the append transaction**, so read-model rows and
events commit atomically — a projection exception aborts the whole command. `applyAsyncProjection`
is the *entire* async runtime keiro ships: it hands back the `Tx` for one event. **There is no
subscription worker loop, no checkpoint advance, no dedupe** — wiring it is the caller's job, and
because delivery is at-least-once, `applyRecorded` must be idempotent (keyed off
`idempotencyKey`). Document this gap honestly.

### The jitsurei anchor (your runnable example)

The order-fulfillment domain in `jitsurei` is the read-side anchor.

`jitsurei/src/Jitsurei/Snapshots.hs` re-exports `snapshotOrderEventStream` from
`Jitsurei/OrderStream.hs`, which configures snapshotting:

```haskell
-- jitsurei/src/Jitsurei/OrderStream.hs (re-exported by Jitsurei/Snapshots.hs)
type OrderRegs = '[]   -- this order machine carries an empty register file

snapshotOrderEventStream :: OrderEventStream
snapshotOrderEventStream =
  baseOrderEventStream
    { snapshotPolicy = Every 2
    , stateCodec     = Just (defaultStateCodec @OrderRegs @OrderState 1)
    }
```

The non-snapshotting `baseOrderEventStream` uses `snapshotPolicy = Never`, `stateCodec = Nothing`.
**Honesty note for the chapter:** the jitsurei order machine's register list is `'[]` (empty), so
its snapshots serialize `{ "state": …, "registers": [] }`. Use jitsurei to show the *mechanism*
(the codec runs over the pair, the policy fires `Every 2`), and use the codec source +
register-pair framing to explain *why both halves are serialized* in the general non-empty case —
do **not** claim jitsurei demonstrates a populated register bank, because it does not.

`jitsurei/src/Jitsurei/ReadModels.hs` defines the inline projection
`orderSummaryInlineProjection :: InlineProjection OrderEvent` (writing `jitsurei_order_summary`)
and the read model `orderSummaryReadModel :: ReadModel OrderSummaryQuery (Maybe OrderSummary)` with
`defaultConsistency = Strong`, `version = 1`, `shapeHash = "jitsurei-order-summary-v1"`,
`subscriptionName = "jitsurei-order-summary-inline"`.

Run targets (from the keiro repo root, `/Users/shinzui/Keikaku/bokuno/keiro`):

```bash
just jitsurei-snapshots     # depends on just jitsurei-migrate; runs the snapshot demo
just jitsurei-fulfillment   # the inline-projection / read-model demo
```

The snapshot demo (`jitsurei/app/Main.hs`, `runSnapshotsDemo`) appends `PlaceOrder` then
`ApprovePayment` through `snapshotOrderEventStream`; because the policy is `Every 2`, a row lands
in `keiro_snapshots` at stream version 2. Its console banner is literally:
`[jitsurei:snapshots] appending ApprovePayment; Every 2 writes keiro_snapshots at stream version 2`.
Use that as the observable proof in chapter 02.

### The pages this plan owns (under `content/docs/keiro/walkthrough/read-side/`)

EP-9 shipped: `00-start-here.mdx`, `01-snapshots-in-the-command-path.mdx`,
`02-the-read-model-query-path.mdx`, `03-projections.mdx`, `meta.json`. This plan **renumbers and
expands** to a five-chapter tour:

- `00-start-here.mdx` — rewritten (register-pair framing + new chapter map).
- `01-the-snapshot-codec-and-the-register-pair.mdx` — **new**.
- `02-snapshots-in-the-command-and-hydration-path.mdx` — **new** (replaces/deepens the old `01-…`).
- `03-the-read-model-query-path.mdx` — rewritten from the old `02-…`.
- `04-projections-and-the-rebuild-path.mdx` — **new** (merges the old `03-projections` + rebuild).
- `meta.json` — updated to the five chapter slugs in order.

Delete the two now-renamed old files (`01-snapshots-in-the-command-path.mdx`,
`03-projections.mdx`) and the old `02-the-read-model-query-path.mdx` only after the new files exist
and `meta.json` points at the new slugs (see Idempotence and Recovery).


## Plan of Work

The work is one tour-deepening effort in six milestones (M0 preconditions; M1–M5 author/rewrite
one chapter each; M6 wires `meta.json` and runs the full gate). Author in chapter order so the
register-pair vocabulary established in `00`/`01` is available to later chapters. Each chapter is a
real source walk: quote the pinned source (with the file path commented above each fence), then
explain *why* the code is shaped that way in prose, in the voice of plan #9's walkthrough chapters.

### M0 — Preconditions

Confirm EP-9's read-side tour exists, the toolchain builds, and the keiro/keiki source is readable
at the pinned commit. Confirm whether EP-17's `/docs/keiro/walkthrough/foundation/00-start-here`
page exists yet (it likely does not — park the forward link if so). At the end: `pnpm build` is
clean on the existing tree.

### M1 — `00-start-here.mdx` (rewrite)

Reframe the tour around the `(state, registers)` pair and lay out the five-chapter map. Add a
short, plain-language reminder of what registers are (independent runtime, not derived from state)
and **link to the foundation tour** for the full model — parked on `/docs/keiro/walkthrough` if
EP-17 has not shipped, naming the foundation tour in prose. Add a `<Callout>` stating the plan's
thesis: *a snapshot persists the whole pair; dropping registers would corrupt hydration.* Keep an
overview `mermaid` placing snapshots, read models, and projections on the write→read flow. At the
end: the page builds; its `<Cards>` link the five chapters with absolute hrefs. Acceptance: build
prerenders it with no crawler warnings.

### M2 — `01-the-snapshot-codec-and-the-register-pair.mdx` (new)

The centerpiece. Walk `Keiro.Snapshot.Codec.defaultStateCodec` and `decodeSnapshotValue` line by
line: the JSON `{ "state", "registers" }`, `regFileToJSON`/`regFileFromJSON` for the register half,
`shapeHash = regFileShapeHash (Proxy @rs)` (SHA-256 over the register *shape*), and the
caller-supplied `stateCodecVersion`. Then the `StateCodec` record (from `Keiro.EventStream`),
`SnapshotSeed`, `hydrateWithSnapshot` (the three benign-miss cases), and `writeSnapshot`. Hammer
the through-line: **both halves are persisted because the registers are independent runtime.** Link
to EP-17's foundation tour (parked if needed) for the register model, and to
`/docs/keiro/reference/snapshot` for the lookup table of signatures. At the end: every quoted name
matches source. Acceptance: build clean; depth-checklist "codec + register pair" item satisfied.

### M3 — `02-snapshots-in-the-command-and-hydration-path.mdx` (new; deepens old `01`)

Walk `hydrate` (snapshot seed → `replayFrom` forward-replay → `Left _ -> hydrateFull` fallback),
showing the `Hydrated rs s` record and that the seed carries the pair. Then `writeSnapshotIfNeeded`
end to end: `current` is the pre-append pair; `Keiki.applyEvents transducer (state current,
registers current) events` re-folds to the post-append pair `finalState`; `Keiki.isFinal …
(Prelude.fst finalState)` gives the terminality flag; `shouldSnapshot` (quote `Keiro.Snapshot.Policy`)
decides; `writeSnapshot` persists the pair. Show the inline call site (after `Right appendResult`)
and state plainly the write is **synchronous, on the command's effect** (correct the research
notes' fire-and-forget claim). Then the `keiro_snapshots` schema, the two SQL statements, the
compatibility filter, and the monotonicity guard. Close with the `just jitsurei-snapshots`
transcript and the "Every 2 → version 2" banner as observable proof; add the honesty note that
jitsurei's `OrderRegs = '[]` so its registers serialize as `[]`. At the end: the chapter proves a
snapshot can never make hydration wrong. Acceptance: build clean; depth-checklist "schema",
"policy", "synchronous inline write", and "hydration folds only newer events" items satisfied.

### M4 — `03-the-read-model-query-path.mdx` (rewrite of old `02`)

Walk `runQueryWith` (validate → wait → query), `ensureReadModel`/`validateMetadata` (drift is a
hard `ReadModelStaleSchema`; non-`Live` is `ReadModelNotLive`), `waitIfNeeded` (the `Strong ==
Eventual` no-wait branches; `PositionWait (Just _)` → `waitFor`), and `waitFor`'s poll loop over
`subscriptions.last_seen`. Quote the `keiro_read_models` registry (`ReadModelStatus`,
`ReadModelMetadata`, the idempotent `registerReadModel` that never overwrites stored
version/shapeHash, the `transitionReadModelStmt` upsert, the `statusFromText` → `Paused` default)
and the DDL. Put the `Strong == Eventual` gotcha in a `<Callout type="warn">`. Cross-link
`/docs/keiro/reference/read-model` and `/docs/keiro/how-to/choose-a-consistency-mode`. At the end:
the read-model failure modes are clear. Acceptance: build clean; depth-checklist "read-model query
path" item satisfied.

### M5 — `04-projections-and-the-rebuild-path.mdx` (new; merges old `03` + rebuild)

Contrast the inline path (`runCommandWithProjections` riding `runCommandWithSqlEvents`'s append
transaction — atomic, strongly consistent, a projection exception aborts the command) with the
async boundary (`applyAsyncProjection` = a bare `Tx`, **no worker**). Then the rebuild skeleton
(`rebuild`/`promote`/`abandonRebuild` over the status transitions; **no shadow-table swap, no
automated replay**; `runQuery` returns `ReadModelNotLive` mid-rebuild). State both gaps honestly in
callouts. Cross-link `/docs/keiro/reference/projection`,
`/docs/keiro/how-to/make-an-async-projection-idempotent`, and
`/docs/keiro/how-to/rebuild-a-read-model`. At the end: a reader knows exactly what keiro ships vs.
what they must wire. Acceptance: build clean; depth-checklist "projection" and "rebuild gap" items
satisfied.

### M6 — `meta.json` + full acceptance

Rewrite `walkthrough/read-side/meta.json` `pages` to the five new slugs in order. Delete the three
old now-superseded files. Run the full build + link-check + audits and tick the depth checklist.
Acceptance: see Validation and Acceptance.


## Concrete Steps

Run all commands from the repo root `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` unless
stated otherwise. The toolchain is **pnpm** on **Node 22** (enter the Nix dev shell first if the
repo uses one: `nix develop`).

### M0 — Preconditions

```bash
# EP-9's read-side tour must already exist (HARD DEP).
ls content/docs/keiro/walkthrough/read-side/
# expect: 00-start-here.mdx 01-snapshots-in-the-command-path.mdx
#         02-the-read-model-query-path.mdx 03-projections.mdx meta.json

# "read-side" must already be listed in the walkthrough section meta.
grep -n '"read-side"' content/docs/keiro/walkthrough/meta.json

# Is EP-17's foundation tour live yet? If this path is absent, PARK the forward link.
test -f content/docs/keiro/walkthrough/foundation/00-start-here.mdx \
  && echo "foundation tour present — link directly" \
  || echo "foundation tour ABSENT — park the link on /docs/keiro/walkthrough"

# Baseline build must be clean before you edit.
pnpm install
pnpm build
```

Confirm the API names you will quote still exist at the pinned commit (read-only; do not edit the
keiro/keiki trees):

```bash
grep -RnE "defaultStateCodec|decodeSnapshotValue|hydrateWithSnapshot|writeSnapshot|SnapshotSeed|shouldSnapshot|writeSnapshotIfNeeded|runQueryWith|validateMetadata|waitIfNeeded|registerReadModel|runCommandWithProjections|applyAsyncProjection" \
  /Users/shinzui/Keikaku/bokuno/keiro/keiro /Users/shinzui/Keikaku/bokuno/keiro/keiro-core
grep -RnE "^step ::|^applyEvents ::|^applyEventStreaming ::|regFileShapeHash|regFileToJSON|regFileFromJSON|data SymTransducer|data RegFile" \
  /Users/shinzui/Keikaku/bokuno/keiki/src /Users/shinzui/Keikaku/bokuno/keiki/keiki-codec-json/src
```

Every grep should hit. If any name is missing or its signature differs, **follow the source**,
quote the real version, and record the delta in Surprises & Discoveries.

### M1–M5 — author the chapters

Author each `.mdx` under `content/docs/keiro/walkthrough/read-side/` using the transcriptions in
Context and Orientation. Copy the chapter shape from the existing EP-9 chapters for tone (frontmatter
`title`/`description`, a `Read [previous chapter](…)` line with an **absolute** link, source fences
with a `-- keiro/src/…` path comment, prose explaining *why*, `<Callout>`s for gotchas/gaps, and a
`Next: [chapter](…)` line). Every inter-chapter link is absolute, e.g.:

```text
/docs/keiro/walkthrough/read-side/00-start-here
/docs/keiro/walkthrough/read-side/01-the-snapshot-codec-and-the-register-pair
/docs/keiro/walkthrough/read-side/02-snapshots-in-the-command-and-hydration-path
/docs/keiro/walkthrough/read-side/03-the-read-model-query-path
/docs/keiro/walkthrough/read-side/04-projections-and-the-rebuild-path
```

For the foundation-tour reference, use this parked form (until EP-17 ships its page):

```mdx
For the full model of what these registers are — the `SymTransducer`, the `RegFile`, and how
`Keiki.step` threads the `(state, registers)` pair — see the foundation tour under
[Code Walkthrough](/docs/keiro/walkthrough) (the *foundation* tour; its dedicated start page lands
with EP-17).
```

Once EP-17 has shipped `…/foundation/00-start-here`, EP-19 (or this plan, if EP-17 lands first) may
upgrade that to a direct `[the foundation tour](/docs/keiro/walkthrough/foundation/00-start-here)`
link.

### M6 — `meta.json` + delete old files + acceptance

Rewrite `content/docs/keiro/walkthrough/read-side/meta.json`:

```json
{
  "title": "Read side",
  "pages": [
    "00-start-here",
    "01-the-snapshot-codec-and-the-register-pair",
    "02-snapshots-in-the-command-and-hydration-path",
    "03-the-read-model-query-path",
    "04-projections-and-the-rebuild-path"
  ]
}
```

Then remove the three superseded files (only after the five new files exist and `meta.json` lists
the new slugs):

```bash
git rm content/docs/keiro/walkthrough/read-side/01-snapshots-in-the-command-path.mdx \
       content/docs/keiro/walkthrough/read-side/02-the-read-model-query-path.mdx \
       content/docs/keiro/walkthrough/read-side/03-projections.mdx
```

Build and audit:

```bash
pnpm build
pnpm lint:links
```

Expected: `✓ built in <N>s` with no `[unhandledRejection]` / `Failed to fetch` lines, and
`lint:links` exit 0.


## Validation and Acceptance

Acceptance is observable behavior plus a content-depth checklist, not merely "files exist".

1. **The site builds and prerenders the five chapters.** From the repo root:

   ```bash
   pnpm build
   ```

   Succeeds (`✓ built`) and prerenders `/docs/keiro/walkthrough/read-side/00-start-here` and the
   four numbered chapter routes (`01-the-snapshot-codec-and-the-register-pair`,
   `02-snapshots-in-the-command-and-hydration-path`, `03-the-read-model-query-path`,
   `04-projections-and-the-rebuild-path`).

2. **Zero crawler warnings.**

   ```bash
   pnpm build 2>&1 | grep -E "unhandledRejection|Failed to fetch" || echo "no crawler warnings"
   ```

   Expected: `no crawler warnings`. (If the foundation forward-link was *not* parked and EP-17 has
   not shipped, this is exactly where it would fail — park it.)

3. **Link-check passes.**

   ```bash
   pnpm lint:links
   ```

   Expected: exit 0, no broken or relative internal links.

4. **Absolute links only** in the chapters you touched:

   ```bash
   grep -RnE "\]\((\./|\.\./)" content/docs/keiro/walkthrough/read-side || echo "no relative links"
   ```

   Expected: `no relative links`.

5. **Every fence is language-tagged** (no bare opening fences):

   ```bash
   grep -RnE "^```$" content/docs/keiro/walkthrough/read-side | grep -v "^.*```[a-z]" || echo "all fences tagged"
   ```

   Eyeball any hits to confirm they are closers, not untagged openers.

6. **Quoted names exist in the pinned source.**

   ```bash
   for name in defaultStateCodec decodeSnapshotValue hydrateWithSnapshot writeSnapshot SnapshotSeed \
               SnapshotRow SnapshotWrite lookupSnapshot writeSnapshotRow shouldSnapshot \
               writeSnapshotIfNeeded runQueryWith validateMetadata waitIfNeeded waitFor \
               registerReadModel runCommandWithProjections applyAsyncProjection rebuild promote; do
     grep -Rqs "$name" /Users/shinzui/Keikaku/bokuno/keiro/keiro /Users/shinzui/Keikaku/bokuno/keiro/keiro-core \
       && echo "ok: $name" || echo "MISSING: $name"
   done
   for name in step applyEvents applyEventStreaming regFileShapeHash regFileToJSON regFileFromJSON; do
     grep -Rqs "$name" /Users/shinzui/Keikaku/bokuno/keiki \
       && echo "ok: $name" || echo "MISSING: $name"
   done
   ```

   Expected: every line says `ok:`.

7. **Depth checklist (the heart of this plan).** Confirm by reading the rendered tour that each of
   the following is covered, with the named source quoted and explained — not merely mentioned:

   - [ ] **The snapshot codec persists the `(state, registers)` pair.** `defaultStateCodec`/
     `decodeSnapshotValue` are walked; the JSON `{ "state", "registers" }` is shown; it is stated
     and justified that *both* halves are serialized because the registers are independent runtime,
     and that dropping them would corrupt hydration. (Chapter 01.)
   - [ ] **The keiki register pair is treated explicitly and linked to EP-17.** The one-paragraph
     register reminder is present and links the foundation tour (parked or direct); nothing
     contradicts EP-17's register model. (Chapters 00, 01.)
   - [ ] **The `keiro_snapshots` schema is covered.** `SnapshotRow`/`SnapshotWrite`, the DDL, the
     `lookupSnapshot` compatibility filter + `ORDER BY … DESC LIMIT 1`, and the `writeSnapshotRow`
     monotonicity guard are all shown and explained. (Chapter 02.)
   - [ ] **The snapshot policy is covered.** `shouldSnapshot` and the four `SnapshotPolicy`
     constructors are quoted; `Every 2` → version-2 firing is explained. (Chapter 02.)
   - [ ] **The synchronous inline write in the command path is shown.** `writeSnapshotIfNeeded` is
     walked (pre-append `current`, `Keiki.applyEvents` re-fold, `Keiki.isFinal` terminality,
     `shouldSnapshot`, `writeSnapshot`), the inline call site is shown, and the write is stated to be
     synchronous (research-notes correction). (Chapter 02.)
   - [ ] **Hydration reads the latest snapshot then folds only newer events.** `hydrate` →
     `hydrateWithSnapshot` → `replayFrom` forward-replay → `hydrateFull` fallback is walked; the
     three benign-miss cases are listed. (Chapters 01–02.)
   - [ ] **The read-model query path is covered.** `runQueryWith` → `ensureReadModel`/
     `validateMetadata` → `waitIfNeeded`/`waitFor` → `query`, the registry schema, and the
     `Strong == Eventual` gotcha. (Chapter 03.)
   - [ ] **Projections (inline vs async) are covered.** `runCommandWithProjections` vs
     `applyAsyncProjection`; the no-worker gap stated honestly. (Chapter 04.)
   - [ ] **The rebuild gap is documented honestly.** `rebuild`/`promote`/`abandonRebuild` are
     skeleton status transitions; no shadow-table swap, no automated replay. (Chapter 04.)

8. **End-to-end anchor renders.** Run `pnpm dev`, open
   `http://localhost:3000/docs/keiro/walkthrough/read-side/01-the-snapshot-codec-and-the-register-pair`,
   and confirm the codec fences render and the read-side tour shows five chapters nested under
   "Code Walkthrough" → "Read side" in the sidebar.

The Haskell snippets are not compiled anywhere; their accuracy rests entirely on matching the
pinned source (check #6 and a manual diff against the files named in Context).


## Idempotence and Recovery

Authoring and rewriting `.mdx` files is additive and safe to repeat; `pnpm build` and
`pnpm lint:links` are idempotent. The one ordering hazard is the rename: create the five new
chapter files and point `meta.json` at the new slugs **before** deleting the three superseded files
(`01-snapshots-in-the-command-path.mdx`, the old `02-the-read-model-query-path.mdx`,
`03-projections.mdx`). If you delete first, the build still exits 0 (a `meta.json` slug pointing at
a missing file yields a broken sidebar entry, not a crash), but inter-chapter links to the missing
routes will fail `pnpm lint:links` — re-add or rename, then re-run the gate. A safe sequence: (1)
write all five new files, (2) update `meta.json`, (3) `pnpm build` + `pnpm lint:links`, (4) only
then `git rm` the three old files, (5) re-run the gate.

If `pnpm build` reports `Failed to fetch`, the cause is almost always a relative link or a link to
a not-yet-shipped page — run acceptance check #4 for relative links and check #2 to find the
offending route. For the EP-17 foundation forward-link specifically: if EP-17 has not shipped
`…/foundation/00-start-here`, the link **must** be parked on `/docs/keiro/walkthrough`; un-parking
it before EP-17 lands is the most likely way to break the build.

Where the keiro/keiki source diverges from this plan's transcription, **follow the source** at the
pinned commit `3f5dc9c` (keiki at its companion pin), quote the real version, and record the delta
in Surprises & Discoveries and (if it changes an instruction) the Decision Log. Do not edit the
keiro or keiki trees.


## Interfaces and Dependencies

This plan depends on EP-9 (HARD), EP-7 (HARD), EP-17 (SOFT), and EP-13 (SOFT), all in MasterPlan
`docs/masterplans/2-keiro-framework-documentation-set.md`.

- **EP-9** (Complete) created the read-side tour this plan deepens and the read-side
  reference/explanation pages the chapters link (`/docs/keiro/reference/snapshot`,
  `/docs/keiro/reference/read-model`, `/docs/keiro/reference/projection`,
  `/docs/keiro/explanation/consistency-and-snapshots`, `/docs/keiro/how-to/choose-a-consistency-mode`,
  `/docs/keiro/how-to/make-an-async-projection-idempotent`,
  `/docs/keiro/how-to/rebuild-a-read-model`) — these resolve directly.
- **EP-7** (Complete) provides the `/docs/keiro` spine, the jitsurei module map,
  `docs/keiro-source-sync.md`, and the `walkthrough/` hub + `walkthrough/meta.json`.
- **EP-17** (parallel) owns the foundation tour and the conceptual register model. Per Integration
  Point #7, this plan **links to** EP-17 for "what registers are" and must not contradict it. The
  link resolves once EP-17 ships `/docs/keiro/walkthrough/foundation/00-start-here`; until then it
  is parked on `/docs/keiro/walkthrough` and EP-19 finalization may upgrade it.
- **EP-13** (parallel) deepens the command-cycle tour; read-side chapters cross-link
  `/docs/keiro/walkthrough/command-cycle/…` for the write-path mechanics. Keep EP-9's existing
  absolute links to the command-cycle chapters.

**Integration Point #7 (snapshots + keiki registers) — this plan's half.** This plan owns the
*persistence* of the `(state, registers)` pair: the snapshot codec
(`/Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Snapshot/Codec.hs`), the `keiro_snapshots`
schema (`…/keiro/src/Keiro/Snapshot/Schema.hs`), the snapshot policy
(`…/keiro-core/src/Keiro/Snapshot/Policy.hs`), and the synchronous inline write in the command path
(`…/keiro/src/Keiro/Command.hs`, `writeSnapshotIfNeeded`). It emphasizes that the codec encodes and
rehydrates **both** `state` and `registers`. EP-17 owns the conceptual register model; the two
cross-reference each other (EP-17's transducer chapter links forward here for "how the pair is
persisted").

**Source of truth (read-only) at pinned commit `3f5dc9c`** — cross-checked while authoring:
`…/keiro/src/Keiro/Snapshot.hs`, `…/keiro/src/Keiro/Snapshot/Codec.hs`,
`…/keiro/src/Keiro/Snapshot/Schema.hs`, `…/keiro-core/src/Keiro/Snapshot/Policy.hs`,
`…/keiro-core/src/Keiro/EventStream.hs`, `…/keiro/src/Keiro/Command.hs`,
`…/keiro/src/Keiro/ReadModel.hs`, `…/keiro/src/Keiro/ReadModel/Schema.hs`,
`…/keiro/src/Keiro/ReadModel/Rebuild.hs`, `…/keiro/src/Keiro/Projection.hs`,
`…/keiro-migrations/sql-migrations/2026-05-17-00-00-00-keiro-bootstrap.sql`,
`…/jitsurei/src/Jitsurei/{Snapshots,OrderStream,ReadModels}.hs`, `…/jitsurei/app/Main.hs`
(`runSnapshotsDemo`); and in keiki at `/Users/shinzui/Keikaku/bokuno/keiki`:
`src/Keiki/Core.hs` (`SymTransducer`, `RegFile`, `step`, `applyEvents`, `applyEventStreaming`,
`InFlight`, `isFinal`), `src/Keiki/Shape.hs` (`regFileShapeHash`), and
`keiki-codec-json/src/Keiki/Codec/JSON.hs` (`regFileToJSON`/`regFileFromJSON`).

**Files created (under `content/docs/keiro/walkthrough/read-side/`):**

- `01-the-snapshot-codec-and-the-register-pair.mdx` — title "01 — The snapshot codec and the register pair".
- `02-snapshots-in-the-command-and-hydration-path.mdx` — title "02 — Snapshots in the command and hydration path".
- `04-projections-and-the-rebuild-path.mdx` — title "04 — Projections and the rebuild path".

**Files rewritten (same path, expanded content):**

- `00-start-here.mdx` — title "00 — Start here".
- `03-the-read-model-query-path.mdx` — title "03 — The read-model query path" (was `02-…`).
- `meta.json` — `pages` set to the five new slugs in order.

**Files deleted (superseded by the renumbered tour):**

- `01-snapshots-in-the-command-path.mdx`, `02-the-read-model-query-path.mdx`, `03-projections.mdx`.

**Do not touch** any other walkthrough subdir, the shared `walkthrough/index.mdx`, or the top-level
`walkthrough/meta.json` (EP-19 owns the hub `<Card>`s and the top-level ordering). `"read-side"` is
already listed in `walkthrough/meta.json` (EP-9 added it); leave it. Do not touch any file outside
`content/docs/keiro/walkthrough/read-side/`.

**Haskell/SQL interfaces that must be quoted correctly by the end** (verbatim in the pinned source;
full signatures in Context and Orientation): from `Keiro.Snapshot.Codec` — `defaultStateCodec`,
`decodeSnapshotValue`; from `Keiro.EventStream` — `StateCodec`, `SnapshotPolicy`, `EventStream`;
from `Keiro.Snapshot` — `SnapshotSeed`, `hydrateWithSnapshot`, `writeSnapshot`; from
`Keiro.Snapshot.Schema` — `SnapshotRow`, `SnapshotWrite`, `lookupSnapshot`, `writeSnapshotRow` (and
the two SQL statements); from `Keiro.Snapshot.Policy` — `shouldSnapshot`; from `Keiro.Command` —
`hydrate`, `hydrateFull`, `Hydrated`, `writeSnapshotIfNeeded`, `evaluateCommand`; from
`Keiro.ReadModel` — `ReadModel`, `ConsistencyMode`, `PositionWaitOptions`, `ReadModelError`,
`runQuery`, `runQueryWith`, `waitFor`, `validateMetadata`, `waitIfNeeded`; from
`Keiro.ReadModel.Schema` — `ReadModelStatus`, `ReadModelMetadata`, `registerReadModel`,
`lookupReadModel`, `markRebuilding`, `markLive`, `markAbandoned`; from `Keiro.ReadModel.Rebuild` —
`rebuild`, `promote`, `abandonRebuild`; from `Keiro.Projection` — `InlineProjection`,
`AsyncProjection`, `runCommandWithProjections`, `applyAsyncProjection`; from keiki `Keiki.Core` —
`SymTransducer`, `RegFile`, `step`, `applyEvents`, `applyEventStreaming`, `InFlight`, `isFinal`;
from `Keiki.Shape` — `regFileShapeHash`; from `Keiki.Codec.JSON` — `regFileToJSON`,
`regFileFromJSON`.
