---
id: 22
slug: keiki-derivations-decider-acceptors-projections-and-generics
title: "Keiki derivations: decider, acceptors, projections, and generics"
kind: exec-plan
created_at: 2026-06-07T04:53:26Z
master_plan: "docs/masterplans/3-keiki-framework-documentation-set.md"
---

# Keiki derivations: decider, acceptors, projections, and generics

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, the keiki documentation set under `content/docs/keiki/` in this repository
gains a complete, accurate, navigable **derivations** slice. "Derivations" is the keiki story
that the user gains the most leverage from: from **one** declaration — a single symbolic-register
finite-state transducer, written as a value of the type `SymTransducer phi rs s ci co` — keiki
**mechanically produces** every secondary artifact an aggregate needs, so those artifacts can
never silently disagree with the source declaration. This plan documents each of those derived
artifacts and the Template-Haskell ("TH" — code that runs at compile time and emits more Haskell
source) machinery that emits the boilerplate.

To make the vocabulary self-contained: a **transducer** here is a finite-state machine whose edges
not only move between control states but also *emit output*. "Symbolic" means its edges are
labelled by *predicates* over an infinite input domain (for example "amount > 1000") rather than
by one enumerated symbol per edge. "Register" means it carries a typed **register file**
(`RegFile rs` — a small typed key/value memory, one named slot per `rs` entry) alongside the
finite control **state** `s`. The five type parameters of `SymTransducer phi rs s ci co` are: `phi`
the guard/predicate language, `rs` the register-file slot list, `s` the finite control state, `ci`
the **command input** alphabet, and `co` the **event output** alphabet. The full conceptual
treatment of that type — what each parameter means, the difference between control state `s` and
register file `rs`, and the `delta`/`omega`/`step`/`reconstitute` semantics — is **owned by the
sibling plan EP-21** and lives at `/docs/keiki/explanation/the-symtransducer` and
`/docs/keiki/explanation/registers-vs-state`. This plan **links to** those pages and never
re-derives the model. (EP-21 is checked into this same repo at
`docs/plans/21-keiki-transducer-core-and-authoring-aggregates.md`; this plan does not assume it is
finished, only that its page slugs are stable — see Idempotence and Recovery for the fallback if
they are not yet authored.)

A reader who finishes this slice can:

- **Read a derived `Decider` correctly — as a legacy compatibility façade, not the recommended
  API.** A "Decider" is Jérémie Chassaing's *Functional Event Sourcing* record — a `decide`
  function (command + state → events) plus an `evolve` function (state + event → state). keiki can
  **project** a transducer down to such a record with `toDecider`, so a developer migrating from a
  hand-written naive-decider codebase has a familiar shape to land on. The docs teach this **as a
  migration-smoothing façade only**: the recommended everyday surface is the transducer itself
  (`step`/`stepEither`/`delta`/`omega`/`reconstitute`, owned by EP-21). The docs also teach a sharp,
  deliberate **gap**: the façade silently does nothing on a transducer's empty-output ("ε") edges
  (explained below), so anyone who needs ε transitions, strict `Maybe` replay, or streaming must use
  the transducer directly.
- **Know the shipped `Decider` record has FIVE fields and two state parameters, not the
  four-field Chassaing record that keiki's own module haddock and `docs/research/*` notes still
  quote.** The shipped record is
  `Decider c e s s_streaming = Decider { decide, evolve, evolveStreaming, initialState, isTerminal }`.
  The docs document the *shipped* record and explicitly note the stale haddock.
- **Read the two derived `Acceptor`s** — `inputAcceptor` (recognises valid command sequences) and
  `outputAcceptor` (recognises replayable event logs) — and understand that they are the two
  *projections* (π₁ over the command language, π₂ over the event language) of the same transducer,
  sharing the state carrier `(s, RegFile rs)`.
- **Read the generic ("`Generics`") and Template-Haskell ("`Generics.TH`") layer** that turns a
  plain Haskell command/event/register data declaration into the typed constructors, wires, and
  per-vertex views the builder DSL consumes — and the **zero-enumeration** splices (`*All`,
  `deriveAggregate`) that derive *every* constructor from a declaration without the author naming
  each one.
- **Read a per-vertex "B-presentation view"** — a typed projection that, for a given lifecycle
  vertex, exposes *only the register slots that are live at that vertex* and makes reading a
  wrong-vertex field a compile-time type error.
- **Understand the shape hash** — `regFileShapeHash` — the GHC-upgrade-stable fingerprint of a
  register file's *structure* that a snapshot persister keys on to decide whether an old snapshot is
  still compatible. This plan **owns the shape-hash model** and **links forward to EP-25** for "how
  an eligible register file is actually serialized to JSON" (the `keiki-codec-json` package); it does
  **not** document the JSON codec itself.

You can see it working by running the docs dev server from the repo root
(`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`) with `pnpm dev`, or a production build with
`pnpm build`. Browsing `http://localhost:3000/docs/keiki` shows the new derivations pages in the
sidebar: three explanation essays, five reference pages, two how-to guides, and a ten-part code
walkthrough under `walkthrough/derivations/` (a `00-start-here.mdx` plus nine numbered chapters).
Haskell snippets render and the tour is navigable.

This is a **content** plan. It populates `content/docs/keiki/` only. It does **not** build the app,
the highlighter, the font, the Mermaid component, or the IA/template system — those are owned by
MasterPlan #1's plans and are already complete. Every Haskell snippet documents keiki **as shipped
at the pinned upstream commit `344c4ca` (keiki `0.1.0.0`)**; where keiki's own `docs/research/*`,
`docs/historical/*`, or module-haddock notes diverge from the shipped code, this plan follows the
**source**.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [x] M0. Preconditions verified (2026-06-06) — EP-20 artifacts present; toolchain present; section
      dirs exist; baseline `pnpm build` clean; keiki source readable at `344c4ca`; the 5-field
      `Decider` record confirmed in `src/Keiki/Decider.hs`; `walkthrough/derivations/` subdir created.
- [x] M1. Reference + explanation pages authored (2026-06-06): `reference/{decider,acceptor,generics,
      generics-th,shape}.mdx` and `explanation/{what-gets-derived,b-presentation-views,
      decider-facade-and-when-to-use-it}.mdx`. Decider framed strictly as legacy/compat (warn
      Callout); 5-field record documented with stale-haddock note; Shape page links forward to EP-25
      via inline-code path. Signatures transcribed from source.
- [x] M2. How-to guides authored (2026-06-06): `how-to/{derive-aggregate-constructors,
      read-a-per-vertex-view}.mdx`.
- [x] M3. Walkthrough authored (2026-06-06) (`walkthrough/derivations/` subdir + its `meta.json`:
      `00-start-here.mdx` plus chapters `01`–`09`).
- [x] M4. meta.json appends done (section `meta.json`s + `"derivations"` appended to
      `walkthrough/meta.json`); full `pnpm build` exit 0 with zero crawler warnings; `pnpm lint:links`
      exits 0 (246 files); Haskell-name audit passes; no relative links. (2026-06-06)


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

(None yet.)


## Decision Log

Record every decision made while working on the plan.

- Decision: Document the **shipped five-field `Decider` record**
  (`decide`, `evolve`, `evolveStreaming`, `initialState`, `isTerminal`) with two state parameters,
  and explicitly note that keiki's own module haddock and `docs/research/*` notes still quote a
  stale four-field Chassaing record.
  Rationale: self-containment and accuracy (MasterPlan Integration Point 6 + Decision Log). The
  shipped `data Decider c e s s_streaming` in `src/Keiki/Decider.hs` at `344c4ca` has five fields;
  documenting the stale four-field shape would make every example wrong and the migration story
  misleading. Verified against `src/Keiki/Decider.hs` lines 70–76.
  Date: 2026-06-07
- Decision: Present `Keiki.Decider` **strictly as a legacy/compatibility migration façade**, never
  as keiki's recommended everyday API; the recommended surface is the transducer
  (`step`/`stepEither`/`delta`/`omega`/`reconstitute`, EP-21). EP-22 owns `reference/decider.mdx`
  and `explanation/decider-facade-and-when-to-use-it.mdx` (MasterPlan Integration Point 6).
  Rationale: mirrors MasterPlan #2's "Decide → Transduce" lesson — "Decider" names a legacy shape;
  presenting `toDecider` as the default would contradict the rest of the keiki set and bury the
  recommended transducer surface.
  Date: 2026-06-07
- Decision: **EP-22 owns the shape-hash MODEL** (`reference/shape.mdx` + the why), **EP-25 owns the
  JSON codec** (`keiki-codec-json`). The shape page links **forward** to EP-25 for "how an eligible
  RegFile is serialized"; it does **not** document the codec (MasterPlan Integration Point 5b).
  Rationale: the snapshot/persistence boundary genuinely spans two packages (`keiki`'s `Keiki.Shape`,
  which has no aeson dependency, vs `keiki-codec-json`); a single owner per half with cross-links
  keeps the snapshot story coherent without duplication.
  Date: 2026-06-07
- Decision: The derivations **build on EP-21's `SymTransducer` model** — every page that needs "what
  is a transducer / state vs registers / delta/omega/step" **links to** EP-21's
  `explanation/the-symtransducer.mdx` and `explanation/registers-vs-state.mdx` rather than
  re-deriving the model (MasterPlan Integration Point 5a + Dependency Graph soft-dep EP-21).
  Rationale: avoids two pages drifting apart on the most-shared concept; EP-21 is the single
  conceptual owner.
  Date: 2026-06-07


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

**Outcome (2026-06-06).** EP-22 is complete: 20 pages — five reference pages (`decider`, `acceptor`,
`generics`, `generics-th`, `shape`), three explanations (`what-gets-derived`, `b-presentation-views`,
`decider-facade-and-when-to-use-it`), two how-tos, and the ten-file `walkthrough/derivations/` tour.
The whole keiki tree builds clean (`pnpm build` exit 0, zero crawler warnings) and link-checks (246
files); every quoted Haskell identifier was audited against the pinned source `344c4ca`. The shipped
five-field `Decider` record is documented (with the stale-haddock note), the Decider is framed
strictly as a legacy façade with the ε-edge gap, and `reference/shape.mdx` owns the shape-hash model
and links forward to EP-25 for the JSON codec via an inline-code path (no live link, since EP-25 is
not yet authored). No build or crawler issues this milestone — the JSX-attribute and forward-link
hazards learned in EP-21 were pre-empted in the agent briefs.


## Context and Orientation

Read this whole section before editing. It is written so a novice with only this file and the
working tree can complete the work. You will write MDX content files; you will not write or compile
Haskell. The Haskell appears only as *quoted snippets* inside the docs, and every snippet must match
the real source transcribed below.

### What you are building, and where

This repository (`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`) is a **fumadocs** documentation
site (fumadocs-ui + fumadocs-mdx) built on **TanStack Start as a static single-page app** (React +
MDX + TypeScript, bundled with **Vite**), built and served with **pnpm** on **Node 22**. `pnpm dev`
runs the dev server; `pnpm build` runs the production build and prerenders every route; `pnpm
typecheck` runs the TypeScript checker; `pnpm lint:links` checks internal links and exits non-zero
on a broken one. Content lives under `content/docs/`. Each directory has a `meta.json` whose `pages`
array lists child page slugs (and nested directory names) in sidebar order. A "page" is an `.mdx`
file: YAML frontmatter (`title`, `description`) followed by an MDX body.

The documented **code samples are Haskell** (the site is TypeScript; the subject, keiki, is a Haskell
library). MDX components (`Callout`, `Cards`, `Card`, `Steps`, `Step`, `Tabs`, `Tab`, `TypeTable`,
`Accordion`, `Accordions`, and `Mermaid`) are **registered globally** — so in page bodies you use
them **bare, with no `import` lines**. This matches every existing keiro/kiroku page. Do not add
`import` statements for these.

### Where this plan sits in the larger effort (reference by path)

This is **EP-22** in the MasterPlan `docs/masterplans/3-keiki-framework-documentation-set.md`. It is
**Phase 2**.

- **HARD DEP — EP-20** (`docs/plans/20-keiki-foundation-theory-getting-started-and-the-worked-example-spine.md`):
  EP-20 must be **Complete** before you start. EP-20 creates the `/docs/keiki` overview and
  getting-started pages your pages link back to, the foundations/theory explanation essays, the
  introduction of the `jitsurei` worked-example spine and its module map, the
  `docs/keiki-source-sync.md` source-of-truth pointer, the `walkthrough/index.mdx` hub and
  `walkthrough/meta.json`, and the shared authoring conventions. Verify EP-20 is done in M0; if
  `content/docs/keiki/index.mdx` or `docs/keiki-source-sync.md` is missing, stop and finish EP-20
  first.
- **SOFT DEP — EP-21** (`docs/plans/21-keiki-transducer-core-and-authoring-aggregates.md`): the
  transducer-core / authoring slice. Everything this plan documents is *derived from* the
  `SymTransducer` EP-21 introduces. Soft means non-blocking: you author absolute links to EP-21's
  conceptual pages (`/docs/keiki/explanation/the-symtransducer` and
  `/docs/keiki/explanation/registers-vs-state`); they resolve once EP-21 lands. If you cannot confirm
  an EP-21 page's exact slug, link to the section landing (`/docs/keiki/explanation`) and note the
  intended target in prose (see Idempotence and Recovery).

### Hard-won house rules (apply to every page you write)

1. **Absolute doc links only.** Cross-page links use absolute doc paths
   (`/docs/keiki/reference/decider`), never relative `./sibling` or `../section/page`. Relative MDX
   links resolve *wrong* in the static SPA and trip the prerender crawler (a kiroku/keiro lesson:
   a `./01-…` link from a `…/walkthrough/00-start-here` page resolved to a nonexistent nested route
   and emitted a `Failed to fetch` crawler error). This applies even to the code-walkthrough
   template's `[00 — Start here](./00-start-here)` line — when you copy that template, **rewrite the
   link to an absolute path** (e.g. `/docs/keiki/walkthrough/derivations/00-start-here`).
2. **Every fenced code block carries a language tag.** Use ` ```haskell `, ` ```text `,
   ` ```mermaid `, ` ```bash `, ` ```json `. Never a bare ```` ``` ````.
3. **Snippet accuracy is an acceptance criterion.** Every Haskell type, field, and function name you
   quote must appear in the pinned source at `344c4ca`. The verified transcription is below;
   cross-check against the files named before declaring a snippet done. Where the keiki source
   diverges from any in-repo design note, **trust the source** (the most load-bearing instance: the
   five-field `Decider`).
4. **No `import` lines for the MDX components** (see above).
5. **Do not reformat neighbours.** Hand-authored MDX in this repo does not pass `oxfmt --check`
   cleanly repo-wide; match the style of the neighbouring `content/docs/keiro/*` files, do not
   reformat them or your own files to satisfy a formatter.

### The subject, transcribed from source (use these REAL names)

Source of truth on disk (read-only — do **not** edit it): `/Users/shinzui/Keikaku/bokuno/keiki`,
pinned commit `344c4ca` (keiki `0.1.0.0`). The worked-example package `jitsurei` lives **inside**
that repo at `/Users/shinzui/Keikaku/bokuno/keiki/jitsurei/`. Resolve the on-disk path at any time
with `mori registry show shinzui/keiki --full`. The facts below are transcribed verbatim from that
tree at the pinned commit. Treat this as your API cheat-sheet; the files to cross-check are named
inline.

The unifying idea: every artifact below is **derived from one `SymTransducer`** (do not re-explain
what a `SymTransducer` is — link to EP-21's `/docs/keiki/explanation/the-symtransducer`). The
transducer's primitive operations that the derivations call into are `delta` (the symbolic step
relation over the command language), `omega` (the output/event function), `applyEvent` (the
letter-only inverse used to replay one event), `applyEventStreaming` (the `Maybe`-explicit streaming
replay that threads an in-flight value across multi-event edges), `applyEvents`/`reconstitute`
(fold a whole log), and the predicates `initial`/`initialRegs`/`isFinal`. All of those are owned and
explained by EP-21; this plan shows how the derivations are *built out of* them.

**(A) DECIDER — the legacy compatibility façade** (`src/Keiki/Decider.hs`). The shipped record has
**FIVE fields and TWO state parameters** (`s` for the ordinary letter-replay carrier, `s_streaming`
for the streaming carrier):

```haskell
-- src/Keiki/Decider.hs (lines 70-76 at 344c4ca)
data Decider c e s s_streaming = Decider
  { decide          :: c -> s -> [e]
  , evolve          :: s -> e -> s
  , evolveStreaming :: s_streaming -> e -> Maybe s_streaming
  , initialState    :: s
  , isTerminal      :: s -> Bool
  }
```

The projection:

```haskell
-- src/Keiki/Decider.hs (toDecider, line ~107)
toDecider ::
  (BoolAlg phi (RegFile rs, ci), Eq co) =>
  SymTransducer phi rs s ci co ->
  Decider ci co (s, RegFile rs) (InFlight s co, RegFile rs)
```

How `toDecider t` is built, field by field (this is the derivation to teach):

- The letter-replay **state carrier is the PAIR `(s, RegFile rs)`** — the control state *and* the
  register file — because guards read registers, so replay must carry both.
- `decide (s, regs) command = omega t s regs command` — it returns the **full event list directly**.
  (Historical note to teach: a prior `toMultiDecider`/state-refinement path was *retired*; EP-19's
  output-widening let one command yield two or more events, so `decide` returns `[e]` straight from
  `omega`.)
- `evolve (s, regs) ev` is built on `applyEvent` (the **letter-only inverse**: replay exactly one
  event). It is **defensive**: it returns the input state **unchanged** if replay fails. It handles
  output length 0 and length 1; for length-2-and-up edges it **falls back** (see the ε-edge gap
  below).
- `evolveStreaming (w, regs) ev` is built on `applyEventStreaming` — the **`Maybe`-explicit** replay
  that threads an `InFlight s co` value across the length-2-and-up edges so a multi-event edge can be
  reconstructed event by event.
- `initialState = (initial t, initialRegs t)`; `isTerminal (s, _) = isFinal t s`.

**THE DELIBERATE ε-EDGE GAP to teach honestly.** An "ε-edge" (epsilon edge) is a transition that
**emits no output** — `omega` returns `[]`. The transducer's `delta` *does* advance across such an
edge, but the façade cannot: `decide` returns `[]`, and `evolve []` has no event to replay, so it is
a **no-op** and **leaves the state untouched** even though `delta` would transition. Therefore: use
the transducer directly (`delta`/`step`/`omega`/`applyEvents`) when ε transitions matter, when you
need strict `Maybe` replay semantics, or when you need streaming. The test `test/Keiki/DeciderSpec.hs`
proves the canonical round-trip, the multi-event first command
(`[RegistrationStarted, ConfirmationEmailSent]`), the ε-edge limitation **cross-checked against
`delta`**, and the `evolveStreaming` `InFlight` cases.

**(B) ACCEPTOR — the two recogniser projections** (`src/Keiki/Acceptor.hs`).

```haskell
-- src/Keiki/Acceptor.hs (lines 72-76 at 344c4ca)
data Acceptor a s = Acceptor
  { aStep    :: s -> a -> Maybe s
  , aInitial :: s
  , aIsFinal :: s -> Bool
  }

-- inputAcceptor: the π₁ projection over the COMMAND language.
inputAcceptor ::
  BoolAlg phi (RegFile rs, ci) =>
  SymTransducer phi rs s ci co ->
  Acceptor ci (s, RegFile rs)

-- outputAcceptor: the π₂ projection over the EVENT language (replayable logs).
outputAcceptor ::
  (BoolAlg phi (RegFile rs, ci), Eq co) =>
  SymTransducer phi rs s ci co ->
  Acceptor co (s, RegFile rs)

runAcceptor :: Acceptor a s -> [a] -> Maybe s
accepts     :: Acceptor a s -> [a] -> Bool
```

Both share the carrier `(s, RegFile rs)` and use `isFinal` as `aIsFinal`. `inputAcceptor`'s `aStep`
is `delta` (so it recognises valid **command** sequences); `outputAcceptor`'s `aStep` is `applyEvent`
(so it recognises replayable **event** logs). The teachable round-trip property:
`fmap fst (runAcceptor (outputAcceptor t) log) == fmap fst (reconstitute t log)` — the output
acceptor's state agrees with `reconstitute` on the same log. `runAcceptor` folds a list to a final
`Maybe s`; `accepts` is `runAcceptor` then "ended in a final state". Because both carriers contain
closures and a `RegFile`, there is **no `Show`/`Eq`** for an `Acceptor`; tests assert via
`runAcceptor`/`accepts`, not on the record. Anchor: `test/Keiki/AcceptorSpec.hs`.

**(C) GENERICS — the GHC-generics bridge** (`src/Keiki/Generics.hs`). This is the layer that turns a
plain Haskell data declaration (your command, event, or register-payload type) into the typed
constructors/wires/families the builder DSL consumes. The exported surface:

```haskell
-- Builders (input/command side):
mkInCtor     :: ...            -- typed command constructor from a record payload
mkInCtor0    :: ...            -- empty-payload (no fields) command constructor; needs Eq
mkInCtorVia  :: forall name .. -- by constructor name via one type application: mkInCtorVia @"Ctor"

-- Builders (wire/event side):
mkWireCtor   :: ...
mkWireCtor0  :: ...            -- empty-payload event constructor
mkWireCtorVia :: forall name ..  -- mkWireCtorVia @"Ctor"

-- Field families (let signatures read naturally):
type FieldsOf    d = FieldsOfRep    (Rep d)
type RegFieldsOf d = RegFieldsOfRep (Rep d)
-- e.g. a signature can read: InCtor UserCmd (RegFieldsOf StartRegistrationData)
```

The machinery classes (walked in the walkthrough chapters 02 and 03):

- `GRecord` — converts between a type's GHC-generics `Rep` and a typed `RegFile`, concatenating
  product fields via `Append` and splitting via `SplitRegFile`.
- `GTuple` — converts between a `Rep` and a nested-pair tuple via `ConcatT`/`SplitT`.
- `GHasCtor` / `NameInRep` / `GHasCtorIf` — walk a sum (`:+:`) `Rep` to resolve a *named*
  constructor's payload, with a functional dependency `name rep -> d`.
- `EmptyRegFile` — builds a `RegFile` whose every slot is a **deferred** `error "uninit: <name>"`
  (so a slot you never read is never forced; this is what makes B-views safe to project — see below).
- `Append` / `appendRegFile` / `SplitRegFile` — the type-level and value-level concat/split used by
  `GRecord`.

**Accuracy note (MasterPlan Surprises):** `Keiki.Generics` exports **more** than its design note
lists — including `mkInCtor0`, `mkWireCtor0`, and `RegFieldsOf`. Document the *shipped* exports.

**(D) GENERICS.TH — the Template-Haskell splices** (`src/Keiki/Generics/TH.hs`). "Template Haskell"
runs at compile time and emits Haskell source; a `$( … )` call site is a "splice" and the functions
below produce the `[Dec]` (list of top-level declarations) it expands to. The seven splices and two
options records:

```haskell
-- src/Keiki/Generics/TH.hs at 344c4ca
deriveAggregateCtors     :: Name -> Name -> [(String, String)] -> Q [Dec]   -- explicit (ctor, short) specs
deriveAggregateCtorsAll  :: Name -> Name -> Q [Dec]                          -- enumerate ALL ctors, short = ctor name
deriveAggregateCtorsWith :: Name -> Name -> DeriveCtorOptions -> Q [Dec]     -- overrides + excludes
deriveWireCtors          :: Name -> [(String, String)] -> Q [Dec]
deriveWireCtorsAll       :: Name -> Q [Dec]
deriveWireCtorsWith      :: Name -> DeriveWireOptions -> Q [Dec]
deriveAggregate          :: Name -> Name -> Name -> Q [Dec]                  -- FUSED: ctors + wires in one splice
deriveView               :: Name -> Name -> String -> String -> String -> [(String, [String])] -> Q [Dec]

data DeriveCtorOptions = DeriveCtorOptions
  { suffixOverrides :: Map String String    -- per-ctor short-name override
  , excludeCtors    :: Set String }
defaultDeriveCtorOptions :: DeriveCtorOptions

data DeriveWireOptions = DeriveWireOptions
  { suffixOverridesW :: Map String String
  , excludeCtorsW    :: Set String }
defaultDeriveWireOptions :: DeriveWireOptions
```

What `deriveAggregateCtors` emits, per command constructor:

- For a **record-payload** ctor it emits **three** top-level declarations: `inCtor<Short> ::
  InCtor <Cmd> (RegFieldsOf <Pay>)` (defined as `mkInCtorVia`), `inp<Short>` (a `TInpCtorField
  inCtor<Short>`), and `is<Short> :: HsPred` (defined as `matchInCtor`, a guard predicate that
  recognises that constructor).
- For a **singleton** (no-field) ctor it emits only `inCtor<Short>` (as `mkInCtor0`) and
  `is<Short>`.

What `deriveWireCtors` emits, per event constructor:

- For a **record-payload** event ctor: `wire<Short> :: WireCtor <Evt> (FieldsOf <Pay>)` (as
  `mkWireCtorVia`), **plus** a field-keyed `<Short>TermFields` record and its `ToOutFields`
  instance (these let the event's fields be written positionally on an output term).
- For a **singleton** event ctor: just `wire<Short>`.

The `*All` variants enumerate every constructor, defaulting each short name to the constructor's own
name. The `*With` variants **validate** that every override/exclude key names a real constructor and
**reject duplicate resolved short names** (a clash *aborts the splice* at compile time). `deriveView`
runs five compile-time validations then emits the per-vertex view (see (E)). `deriveAggregate` is the
**fused** splice: `deriveAggregateCtors` + `deriveWireCtors` enumerated together in one call. Real
call sites in the worked example:
`jitsurei/src/Jitsurei/UserRegistration.hs` (lines ~210, ~238, ~263),
`jitsurei/src/Jitsurei/EmailDelivery.hs` (lines ~112, ~126, ~140), and
`jitsurei/src/Jitsurei/OrderCart.hs` (line ~323, the fused `deriveAggregate`). The test
`jitsurei`/keiki `Generics/THSpec` (the THSpec) exercises these; quote these call-site examples
verbatim:

```haskell
$( deriveAggregateCtors ''ToyCmd ''ToyRegs [ ("DoIt", "DoIt"), ("NoArgs", "NoArgs") ] )

$(deriveAggregate ''FusedCmd ''FusedRegs ''FusedEvent)

$( deriveAggregateCtorsWith ''OverCmd ''OverRegs defaultDeriveCtorOptions
     { suffixOverrides = Map.fromList [("LongCommandName", "Brief")]
     , excludeCtors    = Set.fromList ["Skipped"] } )
```

**(E) B-PRESENTATION VIEWS** (emitted by `deriveView`; anchored by
`jitsurei/test/Jitsurei/{UserRegistration,EmailDelivery,LoanApplication}ViewSpec.hs`). Vocabulary:
the register file is the **C-foundation** (the *complete* memory, every slot, some uninitialised at a
given vertex); a **B-presentation view** is a *vertex-indexed projection* exposing **only the slots
that are live at that vertex**. `deriveView` emits three things:

1. a **singletons GADT** indexed by the promoted vertex (e.g. `SUserVertex 'PotentialCustomer`,
   `SUserVertex 'Confirmed`, …) — a runtime token that names which vertex you are at;
2. a **per-vertex `View` GADT**, one constructor per vertex, each carrying only that vertex's **live**
   slots as record fields (e.g. `ConfirmedV { cEmail, cConfirmedAt }`);
3. the projection function, e.g. `userView :: SUserVertex v -> RegFile rs -> UserView v`, which reads
   the live slots via `Core.(!)` with `OverloadedLabels` (e.g. `regs ! #email`).

The **field-naming rule**: each field is `<prefix><CapitalisedSlot>`, where the prefix is
`filter isUpper >>> map toLower` of the vertex name — so `RequiresConfirmation` → prefix `rc`,
`Confirmed` → prefix `c`. The **"ignores stale slots" property** to teach: `userView` never forces
slots outside the spec, so the `EmptyRegFile`'s deferred `error "uninit: …"` thunks are **safe** to
project from. And because the `View` GADT is **indexed by the promoted vertex**, reading a field that
belongs to the wrong vertex is a **compile-time type error**.

**(F) SHAPE — the snapshot discriminator** (`src/Keiki/Shape.hs`). This plan **owns** this model.

```haskell
-- src/Keiki/Shape.hs at 344c4ca
class CanonicalTypeName a where
  canonicalTypeName :: Proxy a -> Text
  default canonicalTypeName :: Typeable a => Proxy a -> Text  -- via renderStableTypeRep

class KnownRegFileShape (rs :: [Slot]) where
  regFileShapeCanonical :: Proxy rs -> Text

regFileShapeHash    :: KnownRegFileShape rs => Proxy rs -> Text
renderStableTypeRep :: SomeTypeRep -> Text
sha256Hex           :: ... -> Text
```

The model, exactly:

- `regFileShapeHash p` = a **SHA-256 hex digest** over a **single** canonical "pre-hash" string. The
  string is built slot by slot, in order, as `<slotSymbol> ":" <renderStableTypeRep tr> ";"` per
  slot; the **empty** slot list is anchored at the literal `"regfile:0"`. So *n* slots produce **one**
  canonical string and **one** SHA-256 — not one hash per slot.
- `renderStableTypeRep tr` = `<tyConModule> "." <tyConName>`, with applied type arguments
  parenthesised. It uses **only** `tyConModule`/`tyConName`/`splitApps` — **never** `tyConPackage`,
  `Show`, or any `Fingerprint`. That is *why* the hash is **byte-stable across GHC patch/minor
  releases and across machines**: it depends only on the structural module-qualified type name, not
  on package-version hashes or printer output.
- `CanonicalTypeName` has **built-in instances** for `()`, `Bool`, `Char`, `Int`/`Int8`…`Int64`,
  `Integer`, `Word`/`Word8`…`Word64`, `Double`, `Float`, `Text`, `UTCTime`, `Day`, and (with
  `Typeable`-bounded element/arg types) `Maybe`, `[]`, `Either`, and tuples. It is the per-type
  **escape hatch**: override `canonicalTypeName` to keep an old hash stable across an incidental type
  rename.

**WHY it exists (the model to teach):** the shape hash is the **GHC-upgrade-safe discriminator** a
snapshot persister keys on. It is **sensitive** to *structural* change — a slot rename, add, remove,
**reorder**, or type change all flip the hash (so an incompatible old snapshot is correctly rejected)
— and **insensitive** to *incidental* change (a GHC patch bump, a different machine). **LINK FORWARD
to EP-25** (`keiki-codec-json`) for "how an eligible `RegFile` is actually serialized to JSON" and the
*two-discriminant* snapshot-eligibility rule (a snapshot is eligible iff **both** the
`state_codec_version` and the `regfile_shape_hash` match). This plan documents the hash **model**
only; it does **not** document the JSON codec. Anchor: `test/Keiki/ShapeSpec.hs` (a golden
`renderStableTypeRep`, the `"regfile:0"` anchor, pinned SHA-256 digests, and the
slot-order-sensitivity proof).

### The pages this plan authors (all under `content/docs/keiki/`)

References: `reference/decider.mdx`, `reference/acceptor.mdx`, `reference/generics.mdx`,
`reference/generics-th.mdx`, `reference/shape.mdx`. Explanations:
`explanation/what-gets-derived.mdx`, `explanation/b-presentation-views.mdx`,
`explanation/decider-facade-and-when-to-use-it.mdx`. How-tos:
`how-to/derive-aggregate-constructors.mdx`, `how-to/read-a-per-vertex-view.mdx`. Walkthrough (new
subdir): `walkthrough/derivations/00-start-here.mdx` plus nine numbered chapters (listed in M3) and
`walkthrough/derivations/meta.json`.

### Templates to copy from

Per Diátaxis type, copy the matching template's frontmatter + skeleton from
`content/docs/_templates/`: `reference.mdx`, `explanation.mdx`, `how-to.mdx`, `code-walkthrough.mdx`.
Good in-repo exemplars to imitate for tone and component usage are the keiro pages under
`content/docs/keiro/reference/`, `content/docs/keiro/explanation/`, and
`content/docs/keiro/walkthrough/read-side/` (authored by MasterPlan #2's EP-9, checked in at
`docs/plans/9-keiro-read-side-documentation-projections-read-models-and-snapshots.md`). Use
`<TypeTable>` for record fields (the `Decider`, `Acceptor`, `DeriveCtorOptions`, `DeriveWireOptions`
records).


## Plan of Work

The work is five milestones. M0 verifies preconditions. M1–M3 each author one page-group and are
independently verifiable by building the site and viewing the new pages. M4 wires the sidebar and
runs the full acceptance gate. Author in the order below; the references establish the exact
signatures the explanations and how-tos lean on, and the walkthrough comes last because it quotes
source the earlier pages already introduced.

### M0 — Preconditions

Confirm EP-20 is Complete and the toolchain/tree are ready. At the end you can run `pnpm build` on
the existing keiki tree with zero errors. Acceptance: the build succeeds before you add any EP-22
page; `docs/keiki-source-sync.md` and `content/docs/keiki/index.mdx` exist; the section dirs
(`explanation`, `reference`, `how-to`, `walkthrough`) exist; and the five-field `Decider` record is
present in `src/Keiki/Decider.hs` at `344c4ca`.

### M1 — Reference set (5 pages) + explanation set (3 pages)

The references transcribe the exact signatures; the explanations build the mental model on top of
them. Author the references first.

`reference/decider.mdx` (title `"Decider"`): document the **five-field** `Decider` record (with a
`<TypeTable>`), `toDecider`, the `(s, RegFile rs)` letter-replay carrier and the
`(InFlight s co, RegFile rs)` streaming carrier, and the **ε-edge gap**. Frame the whole page as a
**legacy compatibility façade** in a `<Callout type="warn">` at the top, and point readers at the
transducer surface (`/docs/keiki/explanation/the-symtransducer`) as the recommended API. Note the
stale four-field module haddock explicitly. Anchor: `src/Keiki/Decider.hs`,
`test/Keiki/DeciderSpec.hs`.

`reference/acceptor.mdx` (title `"Acceptor"`): document the `Acceptor` record (`<TypeTable>`),
`inputAcceptor` (π₁ over commands, `aStep = delta`), `outputAcceptor` (π₂ over events,
`aStep = applyEvent`, with the `reconstitute` round-trip property), `runAcceptor`, `accepts`, the
shared `(s, RegFile rs)` carrier, and the no-`Show`/`Eq` testing note. Anchor: `src/Keiki/Acceptor.hs`,
`AcceptorSpec`.

`reference/generics.mdx` (title `"Generics"`): document the `mk*`/`mk*Via`/`mk*0` builders, the
`FieldsOf`/`RegFieldsOf` families, and the machinery families (`GRecord`, `GTuple`,
`GHasCtor`/`NameInRep`/`GHasCtorIf`, `EmptyRegFile`, `Append`/`appendRegFile`/`SplitRegFile`).
Include the accuracy note that the shipped module exports `mkInCtor0`/`mkWireCtor0`/`RegFieldsOf`
beyond its design note. Anchor: `src/Keiki/Generics.hs`, `Generics/THSpec`.

`reference/generics-th.mdx` (title `"Generics (Template Haskell)"`): document the seven splices and
the two options records (`<TypeTable>` for `DeriveCtorOptions`/`DeriveWireOptions`), exactly what
each splice emits (the three-decl / one-decl record-vs-singleton rule for ctors; the
`wire<Short>` + `<Short>TermFields` + `ToOutFields` rule for wires), the `*All` enumeration default,
the `*With` validation/abort behaviour, and the fused `deriveAggregate`. Quote the three THSpec
call-site examples from Context. Anchor: `src/Keiki/Generics/TH.hs`, `Generics/THSpec`.

`reference/shape.mdx` (title `"Shape"`, **Integration Point 5b owner**): document
`CanonicalTypeName`, `KnownRegFileShape`, `regFileShapeHash`, `renderStableTypeRep`, `sha256Hex`, the
single-canonical-string-then-one-SHA-256 construction, the `"regfile:0"` anchor, the
`tyConModule`/`tyConName`-only stability rule, and the built-in `CanonicalTypeName` instance list.
Put the snapshot-discriminator rationale (sensitive to structural change, insensitive to incidental
change) in a `<Callout>`, and **link forward to EP-25** (`/docs/keiki/reference/regfile-json-codec`
if that is EP-25's slug, else the section landing `/docs/keiki/reference` with the intended target
named in prose) for "how an eligible RegFile is serialized" and the two-discriminant eligibility
rule. Anchor: `src/Keiki/Shape.hs`, `ShapeSpec`.

Then the explanations:

`explanation/what-gets-derived.mdx` (title `"What gets derived from one declaration"`): the full
derivation tree from a single declaration — the `Decider`, the two `Acceptor`s, the B-presentation
views, the ctors/wires, and the shape hash — plus the **zero-enumeration** `*All`/`deriveAggregate`
story (you do not name each constructor). Carry a `mermaid` diagram with the one `SymTransducer`
declaration at the root and the derived artifacts as leaves. Anchor:
`jitsurei/src/Jitsurei/OrderCart.hs` (the single fused `deriveAggregate` splice). Link to EP-21's
`/docs/keiki/explanation/the-symtransducer` for the source model.

`explanation/b-presentation-views.mdx` (title `"B-presentation views"`): the C-foundation vs
B-presentation distinction, the indexed `View` GADTs, and the "ignores stale slots" property (why
projecting from an `EmptyRegFile` with deferred `error "uninit"` thunks is safe). Anchor:
`jitsurei/test/Jitsurei/UserRegistrationViewSpec.hs`.

`explanation/decider-facade-and-when-to-use-it.mdx` (title `"The Decider façade, and when to use
it"`, **Integration Point 6 owner**): the Chassaing shape, façade-vs-transducer-direct, and the
ε-edge / letter-only / streaming trade-offs — framed as **legacy**. Open with a `<Callout type="warn">`
that the recommended surface is the transducer; present `toDecider` only as a migration aid. Anchor:
`DeciderSpec`.

At the end of M1: all eight pages build and render; every quoted signature matches the source.
Acceptance: `pnpm build` prerenders all eight with no crawler warnings; the Haskell-name audit (M4)
finds every quoted identifier in the pinned source.

### M2 — How-to guides (2 pages)

`how-to/derive-aggregate-constructors.mdx` (title `"Derive aggregate constructors"`): when to use
`deriveAggregateCtors` (explicit specs) vs `*All` (enumerate everything) vs `*With`
(overrides/excludes) vs the fused `deriveAggregate` (ctors + wires in one splice); the record-payload
vs singleton-payload distinction (three decls vs one); and the compile-time abort on a duplicate
resolved short name. Quote the three THSpec call-site examples. Anchor: `Generics/THSpec`.

`how-to/read-a-per-vertex-view.mdx` (title `"Read a per-vertex view"`): author a `deriveView` spec,
consume it (`userView SConfirmed regs`), apply the field-name prefix rule
(`filter isUpper >>> map toLower`), and recognise the five compile-time validation failures
`deriveView` raises. Anchor: `jitsurei/src/Jitsurei/UserRegistration.hs`, `LoanApplicationViewSpec`.

At the end: each guide solves its one task with real-API snippets. Acceptance: both build;
signatures match M1's references.

### M3 — Walkthrough (`walkthrough/derivations/`, 10 pages + meta.json)

A ten-part ordered tour over the real source: `00-start-here.mdx` plus nine numbered chapters. The
through-line is "one declaration → every derived artifact". **You OWN this subdir** — create it, its
`meta.json`, the `00-start-here.mdx`, and every numbered chapter; **append `"derivations"`** to
`walkthrough/meta.json`; do **not** add a hub `<Card href>` (EP-26 finalizes the hub hrefs). The
chapters, in order:

- `01-symtransducer-and-regfile.mdx` (title `"01 — The input declaration"`): the single declaration
  the rest derives from (the `SymTransducer` + `RegFile`). Anchor: `jitsurei/src/Jitsurei/
  UserRegistration.hs` (`userRegAST`); for the AST shape, the keiki guide
  `docs/guide/ast-drop-down.md`. Link to EP-21's `/docs/keiki/explanation/the-symtransducer` rather
  than re-deriving the model.
- `02-generic-record-walk.mdx` (title `"02 — The generic record walk"`):
  `GRecord`/`GTuple`/`RegFieldsOf`/`FieldsOf`. Anchor: `Generics/THSpec`.
- `03-via-builders-and-sum-walk.mdx` (title `"03 — Via-builders and the sum walk"`):
  `mkInCtorVia`/`mkWireCtorVia`, `GHasCtor`/`NameInRep`.
- `04-th-ctor-wire-splices.mdx` (title `"04 — The ctor and wire splices"`):
  `deriveAggregateCtors`/`deriveWireCtors` codegen, including `genTermFieldsRecord`. Anchor:
  `Generics/THSpec`.
- `05-zero-enumeration-and-fused.mdx` (title `"05 — Zero-enumeration and the fused splice"`): `*All`,
  `*With`/`resolveCtorSpecs`, and `deriveAggregate`. Anchor: `jitsurei/src/Jitsurei/OrderCart.hs`
  (line ~323).
- `06-deriveview-b-presentation.mdx` (title `"06 — deriveView and B-presentation"`): the four-phase
  `deriveView` (reify the vertex enum, reify the slot list, validate, codegen). Anchor:
  `UserRegistrationViewSpec`.
- `07-decider-facade.mdx` (title `"07 — The Decider façade"`): `toDecider` over
  `omega`/`applyEvent`/`applyEventStreaming`. Anchor: `DeciderSpec`. Restate the legacy framing.
- `08-acceptor-projections.mdx` (title `"08 — The acceptor projections"`): π₁/π₂ as `delta`/
  `applyEvent` wrappers. Anchor: `AcceptorSpec`.
- `09-shape-hash.mdx` (title `"09 — The shape hash"`): the canonical string + the single SHA-256, and
  the snapshot-keying rationale; link forward to EP-25 for the codec. Anchor: `ShapeSpec`.

At the end: the subdir exists with its own `meta.json` and is sidebar-navigable. Acceptance: all ten
build; internal links are absolute.

### M4 — meta.json appends + full acceptance

Append EP-22's slugs to the section `meta.json`s, create `walkthrough/derivations/meta.json`, append
`"derivations"` to `walkthrough/meta.json`, then run the full build and audits. Acceptance: see
Validation and Acceptance.


## Concrete Steps

Run all commands from the repo root `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` unless stated
otherwise. The toolchain is **pnpm** on **Node 22** (enter the Nix dev shell first if the repo uses
one: `nix develop`).

### M0 — Preconditions

```bash
# Confirm EP-20's artifacts exist (HARD DEP). If either is missing, finish EP-20 first.
test -f content/docs/keiki/index.mdx && echo "keiki overview present"
test -f docs/keiki-source-sync.md && echo "source-sync pointer present"

# Confirm the section dirs you will write into exist.
for d in explanation reference how-to walkthrough; do
  test -d "content/docs/keiki/$d" && echo "have content/docs/keiki/$d"
done

# Install deps and confirm the existing site builds before you add pages.
pnpm install
pnpm build
```

Expected (abridged):

```text
keiki overview present
source-sync pointer present
have content/docs/keiki/explanation
have content/docs/keiki/reference
have content/docs/keiki/how-to
have content/docs/keiki/walkthrough
✓ built in <N>s
```

Resolve the keiki source path and confirm the **five-field `Decider`** at the pinned commit
(read-only; do not edit the keiki tree):

```bash
mori registry show shinzui/keiki --full     # prints Path: /Users/shinzui/Keikaku/bokuno/keiki
git -C /Users/shinzui/Keikaku/bokuno/keiki log --oneline -1   # expect 344c4ca at HEAD
grep -nA6 "^data Decider" /Users/shinzui/Keikaku/bokuno/keiki/src/Keiki/Decider.hs
```

Expected: the `data Decider c e s s_streaming` block lists **five** fields
(`decide`, `evolve`, `evolveStreaming`, `initialState`, `isTerminal`). If it shows four, stop — the
pin moved; re-verify before quoting.

Create the walkthrough subdir you will populate in M3:

```bash
mkdir -p content/docs/keiki/walkthrough/derivations
```

Optional but recommended — confirm the API names you will quote still exist at the pinned commit:

```bash
grep -RnE "toDecider|inputAcceptor|outputAcceptor|runAcceptor|deriveAggregate|deriveView|regFileShapeHash|renderStableTypeRep|mkInCtorVia|RegFieldsOf" \
  /Users/shinzui/Keikaku/bokuno/keiki/src/Keiki
```

### M1 — Reference + explanation pages

Author the five reference files from `content/docs/_templates/reference.mdx`, then the three
explanation files from `explanation.mdx`. Use the exact signatures transcribed in Context. Use
`<TypeTable>` for the records. Example `<TypeTable>` for the five-field `Decider`:

```mdx
<TypeTable
  type={{
    decide: { type: "c -> s -> [e]", description: "Command + state to the full event list (from omega)" },
    evolve: { type: "s -> e -> s", description: "Letter-only replay of one event; defensive (no-op on failure)" },
    evolveStreaming: { type: "s_streaming -> e -> Maybe s_streaming", description: "Maybe-explicit streaming replay; threads InFlight across multi-event edges" },
    initialState: { type: "s", description: "(initial t, initialRegs t)" },
    isTerminal: { type: "s -> Bool", description: "isFinal t on the control state" },
  }}
/>
```

Each reference page leads with a one-paragraph "derived from one `SymTransducer`" framing that links
to `/docs/keiki/explanation/the-symtransducer` (EP-21). `reference/decider.mdx` and
`explanation/decider-facade-and-when-to-use-it.mdx` open with a `<Callout type="warn">`:

```mdx
<Callout type="warn">
The `Decider` is a **legacy compatibility façade** for developers migrating from a hand-written
"decider" codebase — not keiki's recommended API. For everyday use, drive the transducer directly
(`step` / `stepEither` / `delta` / `omega` / `reconstitute`). The façade also silently no-ops on
empty-output (ε) edges; see the gap below.
</Callout>
```

`reference/shape.mdx` ends with the forward link to EP-25:

```mdx
<Callout>
This page documents the shape-hash **model** — the GHC-upgrade-stable discriminator a snapshot
persister keys on. For **how an eligible register file is serialized to JSON** (and the
two-discriminant eligibility rule — a snapshot is eligible only when *both* the state codec version
and the `regfile_shape_hash` match), see the `keiki-codec-json` reference at
[/docs/keiki/reference/regfile-json-codec](/docs/keiki/reference/regfile-json-codec).
</Callout>
```

(If EP-25 has not yet fixed that slug, point the link at the section landing `/docs/keiki/reference`
and name the intended target in prose — see Idempotence and Recovery.)

### M2 — How-to guides

Author the two files from `content/docs/_templates/how-to.mdx`. `derive-aggregate-constructors.mdx`
quotes the three THSpec call sites from Context and contrasts the four splice flavours;
`read-a-per-vertex-view.mdx` shows authoring a `deriveView` spec, consuming `userView SConfirmed
regs`, the prefix rule, and the five validation failures.

### M3 — Walkthrough

Copy `content/docs/_templates/code-walkthrough.mdx` for each of the ten files under
`content/docs/keiki/walkthrough/derivations/`. **Rewrite the template's `./00-start-here` link to the
absolute path** `/docs/keiki/walkthrough/derivations/00-start-here`. Each chapter quotes the real
source (note the file path above each block) and walks it in prose; cross-links between chapters are
absolute (e.g. `/docs/keiki/walkthrough/derivations/02-generic-record-walk`). Then create
`content/docs/keiki/walkthrough/derivations/meta.json`:

```json
{
  "title": "Derivations",
  "pages": [
    "00-start-here",
    "01-symtransducer-and-regfile",
    "02-generic-record-walk",
    "03-via-builders-and-sum-walk",
    "04-th-ctor-wire-splices",
    "05-zero-enumeration-and-fused",
    "06-deriveview-b-presentation",
    "07-decider-facade",
    "08-acceptor-projections",
    "09-shape-hash"
  ]
}
```

### M4 — meta.json appends + acceptance

Append **only** EP-22's slugs; never reorder or remove other plans' entries. After editing, the
relevant `pages` arrays should read like the following (existing entries kept, EP-22 entries appended
— other Phase-2 plans may have added their own slugs too, which you must preserve):

`content/docs/keiki/reference/meta.json` — append `decider`, `acceptor`, `generics`, `generics-th`,
`shape`:

```json
{
  "title": "Reference",
  "pages": ["index", "decider", "acceptor", "generics", "generics-th", "shape"]
}
```

`content/docs/keiki/explanation/meta.json` — append `what-gets-derived`, `b-presentation-views`,
`decider-facade-and-when-to-use-it`:

```json
{
  "title": "Explanation",
  "pages": ["index", "what-gets-derived", "b-presentation-views", "decider-facade-and-when-to-use-it"]
}
```

`content/docs/keiki/how-to/meta.json` — append `derive-aggregate-constructors`,
`read-a-per-vertex-view`:

```json
{
  "title": "How-To Guides",
  "pages": ["index", "derive-aggregate-constructors", "read-a-per-vertex-view"]
}
```

`content/docs/keiki/walkthrough/meta.json` — append `"derivations"` (the subdirectory name):

```json
{
  "title": "Code Walkthrough",
  "pages": ["index", "derivations"]
}
```

Then build and audit:

```bash
pnpm typecheck
pnpm build
pnpm lint:links
```

Expected: `pnpm typecheck` clean; `pnpm build` ends `✓ built in <N>s` with no `[unhandledRejection]`
/ `Failed to fetch` lines; `pnpm lint:links` exits 0.


## Validation and Acceptance

Acceptance is observable behavior, not just "files exist".

1. **The site builds and prerenders the new pages.** From the repo root:

   ```bash
   pnpm build
   ```

   Succeeds (`✓ built`) and the log shows the twenty new routes prerendered: the five
   `/docs/keiki/reference/{decider,acceptor,generics,generics-th,shape}`, the three
   `/docs/keiki/explanation/{what-gets-derived,b-presentation-views,decider-facade-and-when-to-use-it}`,
   the two `/docs/keiki/how-to/{derive-aggregate-constructors,read-a-per-vertex-view}`, and the ten
   `/docs/keiki/walkthrough/derivations/*` routes.

2. **Zero crawler warnings.**

   ```bash
   pnpm build 2>&1 | grep -E "unhandledRejection|Failed to fetch" || echo "no crawler warnings"
   ```

   Expected: `no crawler warnings`.

3. **Links pass the link-checker.**

   ```bash
   pnpm lint:links
   ```

   Expected: exit code 0 (no broken internal links).

4. **Absolute links only.** No relative MDX links in the pages you added:

   ```bash
   grep -RnE "\]\((\./|\.\./)" content/docs/keiki/reference content/docs/keiki/explanation \
     content/docs/keiki/how-to content/docs/keiki/walkthrough/derivations \
     || echo "no relative links"
   ```

   Expected: `no relative links`.

5. **Quoted Haskell names exist in the pinned source.** Every key identifier you quoted appears in
   `/Users/shinzui/Keikaku/bokuno/keiki`:

   ```bash
   for name in Decider toDecider decide evolve evolveStreaming initialState isTerminal \
               Acceptor inputAcceptor outputAcceptor runAcceptor accepts \
               mkInCtor mkInCtor0 mkInCtorVia mkWireCtor mkWireCtor0 mkWireCtorVia \
               FieldsOf RegFieldsOf GRecord GTuple GHasCtor NameInRep EmptyRegFile \
               deriveAggregateCtors deriveAggregateCtorsAll deriveAggregateCtorsWith \
               deriveWireCtors deriveWireCtorsAll deriveWireCtorsWith deriveAggregate deriveView \
               DeriveCtorOptions DeriveWireOptions \
               CanonicalTypeName KnownRegFileShape regFileShapeHash renderStableTypeRep sha256Hex; do
     grep -Rqs "$name" /Users/shinzui/Keikaku/bokuno/keiki/src/Keiki \
       && echo "ok: $name" || echo "MISSING: $name"
   done
   ```

   Expected: every line says `ok:`.

6. **The five-field Decider is documented (not the stale four-field one).** The decider reference must
   name all five fields and must not present a four-field record as the shipped shape:

   ```bash
   for f in decide evolve evolveStreaming initialState isTerminal; do
     grep -q "$f" content/docs/keiki/reference/decider.mdx && echo "ok: $f" || echo "MISSING: $f"
   done
   ```

   Expected: all five `ok:`. Eyeball the page to confirm `evolveStreaming` is present (it is the field
   the stale haddock omits) and that the legacy-façade `<Callout>` is at the top.

7. **The shape page links forward to EP-25.** The shape reference mentions `keiki-codec-json` /
   the JSON codec and the two-discriminant eligibility rule:

   ```bash
   grep -nE "keiki-codec-json|regfile-json-codec|two-discriminant|state codec version" \
     content/docs/keiki/reference/shape.mdx || echo "MISSING forward link to EP-25"
   ```

   Expected: at least one match.

8. **Every fence is language-tagged.** No bare opening fences in the new pages:

   ```bash
   grep -RnE "^```$" content/docs/keiki/reference content/docs/keiki/explanation \
     content/docs/keiki/how-to content/docs/keiki/walkthrough/derivations \
     | grep -v "^.*```[a-z]" || echo "all fences tagged"
   ```

   (Closing fences are bare ```` ``` ````; eyeball any hits to confirm they are closers, not untagged
   openers.)

9. **The pages render in a browser.** Run `pnpm dev`, open
   `http://localhost:3000/docs/keiki/reference/decider`, and confirm the `<TypeTable>` renders all
   five fields, the legacy-façade warning callout shows, and the derivations walkthrough appears
   nested under "Code Walkthrough" → "Derivations" in the sidebar.


## Idempotence and Recovery

Every step is safe to repeat. Authoring `.mdx` files is additive; re-running `pnpm build`,
`pnpm typecheck`, and `pnpm lint:links` is idempotent. If a page name needs to change, rename the
file *and* update the matching `meta.json` slug in the same edit — a slug pointing at a missing file
(or a file missing from `pages`) yields a broken sidebar entry, not a crash, so the build still exits
0; catch it with the browser check (acceptance #9) and `pnpm lint:links`.

If `pnpm build` reports a `Failed to fetch` for a link, or `pnpm lint:links` reports a broken link,
the cause is almost always a relative link or a link to a page that does not exist yet. Run
acceptance check #4 to find relative links and fix them to absolute paths. For the **soft-dep links
into EP-21** (`/docs/keiki/explanation/the-symtransducer`, `/docs/keiki/explanation/registers-vs-state`)
and the **forward link into EP-25** (`/docs/keiki/reference/regfile-json-codec`): if the target slug
is not yet authored and `lint:links` fails on it, point the link at the section landing
(`/docs/keiki/explanation` or `/docs/keiki/reference`) and name the intended target in prose, then
restore the precise slug once the sibling plan lands. Because these are cross-plan links by design,
EP-26's finalization pass re-verifies them.

Where the keiki source diverges from this plan's transcription, **follow the source** at the pinned
commit `344c4ca` and record the delta in Surprises & Discoveries and (if it changes an instruction)
the Decision Log. Do not edit the keiki tree. The single most important instance: the `Decider`
record is **five fields** — if a future pin changes that, update `reference/decider.mdx`, the
`<TypeTable>`, and acceptance check #6 together.


## Interfaces and Dependencies

This plan depends on EP-20 (HARD) and EP-21 (SOFT), both in MasterPlan
`docs/masterplans/3-keiki-framework-documentation-set.md`. EP-20 must be Complete (it provides the
overview/getting-started pages, the jitsurei module map, `docs/keiki-source-sync.md`, the
`walkthrough/` hub + `walkthrough/meta.json`, and the authoring conventions). EP-21
(`docs/plans/21-keiki-transducer-core-and-authoring-aggregates.md`) owns the canonical conceptual
treatment of the `SymTransducer` model; this plan **links to** EP-21's
`/docs/keiki/explanation/the-symtransducer` and `/docs/keiki/explanation/registers-vs-state` rather
than re-deriving it. EP-25 (`docs/plans/25-keiki-rendering-diagrams-and-json-codecs.md`) owns the
JSON `RegFile` codec; this plan's `reference/shape.mdx` **links forward** to it for serialization.
Both are absolute links that resolve once the sibling plan lands (non-blocking).

**Cross-plan ownership (MasterPlan Integration Points):**

- **#2 — the `walkthrough/` tree.** This plan **OWNS** `walkthrough/derivations/`: its `meta.json`,
  its `00-start-here.mdx`, and its nine numbered chapters. It **APPENDS** `"derivations"` to
  `walkthrough/meta.json`. It does **not** add a hub `<Card href>` (EP-26 adds it during
  finalization).
- **#5a — the transducer model.** This plan **LINKS TO** EP-21's `explanation/the-symtransducer.mdx`
  and `explanation/registers-vs-state.mdx` for the model; it does **not** re-derive it.
- **#5b — the shape-hash model.** This plan **OWNS** `reference/shape.mdx` and the shape-hash MODEL
  (`regFileShapeHash`, `renderStableTypeRep`, why it is the snapshot discriminator). It **LINKS
  FORWARD** to EP-25 for "how an eligible RegFile is serialized" (`keiki-codec-json`); it does **not**
  document the JSON codec.
- **#6 — the Decider façade framing.** This plan **OWNS** `reference/decider.mdx` and
  `explanation/decider-facade-and-when-to-use-it.mdx`, presenting the Decider **strictly as a
  legacy/compatibility migration façade**, never the recommended API (which is the transducer
  surface).

**Source of truth (read-only) at pinned commit `344c4ca`** — cross-checked while authoring:
`/Users/shinzui/Keikaku/bokuno/keiki/src/Keiki/Decider.hs`,
`.../src/Keiki/Acceptor.hs`, `.../src/Keiki/Generics.hs`, `.../src/Keiki/Generics/TH.hs`,
`.../src/Keiki/Shape.hs`, the tests
`.../test/Keiki/{DeciderSpec,AcceptorSpec,ShapeSpec}.hs` and the `Generics/THSpec`, and the
worked-example modules
`.../jitsurei/src/Jitsurei/{UserRegistration,EmailDelivery,OrderCart,LoanApplication}.hs` with
`.../jitsurei/test/Jitsurei/{UserRegistration,EmailDelivery,LoanApplication}ViewSpec.hs`. The keiki
guide `.../docs/guide/ast-drop-down.md` is referenced for the AST shape in walkthrough chapter 01.

**Files created (all under `content/docs/keiki/`):**

- `reference/decider.mdx` — title "Decider".
- `reference/acceptor.mdx` — title "Acceptor".
- `reference/generics.mdx` — title "Generics".
- `reference/generics-th.mdx` — title "Generics (Template Haskell)".
- `reference/shape.mdx` — title "Shape".
- `explanation/what-gets-derived.mdx` — title "What gets derived from one declaration".
- `explanation/b-presentation-views.mdx` — title "B-presentation views".
- `explanation/decider-facade-and-when-to-use-it.mdx` — title "The Decider façade, and when to use it".
- `how-to/derive-aggregate-constructors.mdx` — title "Derive aggregate constructors".
- `how-to/read-a-per-vertex-view.mdx` — title "Read a per-vertex view".
- `walkthrough/derivations/00-start-here.mdx` — title "00 — Start here".
- `walkthrough/derivations/01-symtransducer-and-regfile.mdx` — title "01 — The input declaration".
- `walkthrough/derivations/02-generic-record-walk.mdx` — title "02 — The generic record walk".
- `walkthrough/derivations/03-via-builders-and-sum-walk.mdx` — title "03 — Via-builders and the sum walk".
- `walkthrough/derivations/04-th-ctor-wire-splices.mdx` — title "04 — The ctor and wire splices".
- `walkthrough/derivations/05-zero-enumeration-and-fused.mdx` — title "05 — Zero-enumeration and the fused splice".
- `walkthrough/derivations/06-deriveview-b-presentation.mdx` — title "06 — deriveView and B-presentation".
- `walkthrough/derivations/07-decider-facade.mdx` — title "07 — The Decider façade".
- `walkthrough/derivations/08-acceptor-projections.mdx` — title "08 — The acceptor projections".
- `walkthrough/derivations/09-shape-hash.mdx` — title "09 — The shape hash".
- `walkthrough/derivations/meta.json` — new (title "Derivations"; the ten chapter slugs in order).

**Files edited (meta.json appends only — never reorder/remove other plans' slugs):**

- `content/docs/keiki/reference/meta.json` — append `decider`, `acceptor`, `generics`, `generics-th`, `shape`.
- `content/docs/keiki/explanation/meta.json` — append `what-gets-derived`, `b-presentation-views`, `decider-facade-and-when-to-use-it`.
- `content/docs/keiki/how-to/meta.json` — append `derive-aggregate-constructors`, `read-a-per-vertex-view`.
- `content/docs/keiki/walkthrough/meta.json` — append `derivations` (the subdirectory name).

**Do not touch** other plans' pages or slugs, the top-level `content/docs/keiki/meta.json` (EP-20/
EP-26 own it), or any file outside `content/docs/keiki/`.

**Haskell interfaces that must be quoted correctly by the end** (present verbatim in the pinned
source; full signatures are in Context): from `Keiki.Decider` — `Decider` (five fields:
`decide`, `evolve`, `evolveStreaming`, `initialState`, `isTerminal`), `toDecider`; from
`Keiki.Acceptor` — `Acceptor`, `inputAcceptor`, `outputAcceptor`, `runAcceptor`, `accepts`; from
`Keiki.Generics` — `mkInCtor`, `mkInCtor0`, `mkInCtorVia`, `mkWireCtor`, `mkWireCtor0`,
`mkWireCtorVia`, `FieldsOf`, `RegFieldsOf`, `GRecord`, `GTuple`, `GHasCtor`, `NameInRep`,
`EmptyRegFile`, `Append`, `appendRegFile`, `SplitRegFile`; from `Keiki.Generics.TH` —
`deriveAggregateCtors`, `deriveAggregateCtorsAll`, `deriveAggregateCtorsWith`, `deriveWireCtors`,
`deriveWireCtorsAll`, `deriveWireCtorsWith`, `deriveAggregate`, `deriveView`, `DeriveCtorOptions`,
`defaultDeriveCtorOptions`, `DeriveWireOptions`, `defaultDeriveWireOptions`; from `Keiki.Shape` —
`CanonicalTypeName`, `KnownRegFileShape`, `regFileShapeHash`, `renderStableTypeRep`, `sha256Hex`.
