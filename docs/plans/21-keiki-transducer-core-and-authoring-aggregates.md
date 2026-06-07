---
id: 21
slug: keiki-transducer-core-and-authoring-aggregates
title: "Keiki transducer core and authoring aggregates"
kind: exec-plan
created_at: 2026-06-07T04:53:26Z
master_plan: "docs/masterplans/3-keiki-framework-documentation-set.md"
---

# Keiki transducer core and authoring aggregates

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, the **keiki** documentation set under `content/docs/keiki/` in this
repository gains its load-bearing middle slice: the complete, accurate, navigable
documentation of **keiki's transducer core and authoring DSL** — the "type-safe aggregates"
heart of the framework. A reader who lands here learns what keiki's one formalism *is* and
how to *write* one by hand.

keiki (経木) is a **pure, dependency-free Haskell library you import** — not a server, not a
runtime. Its single formalism is the **symbolic-register finite-state transducer**, the
Haskell type `SymTransducer phi rs s ci co`. "Transducer" means a machine that consumes
inputs and *emits outputs* (here: consumes commands, emits events) while moving between
states — as opposed to an *acceptor*, which only says yes/no. "Symbolic" means its edges are
labelled by **predicates over an infinite input domain** (e.g. "the amount is greater than
the credit limit") rather than by an enumerated finite alphabet of literal symbols.
"Register" means the machine carries a typed **register file** — a heterogeneous bag of named
data slots — alongside its finite control state, so it can remember unbounded data (a running
total, a recipient address) that a plain finite-state machine could not. Putting those
together: keiki is a hybrid of *Symbolic Finite Transducers* (predicate-labelled edges) and
*Streaming String Transducers* (a register file threaded through the run). One declaration of
this object models an event-sourced aggregate: the control state is the lifecycle stage, the
registers are the remembered data, the input sum is the command set, and the output sum is the
event set.

Today, after the Phase-1 foundation plan (EP-20) lands, a reader can find the `/docs/keiki`
overview, the theory-foundations essays, the getting-started tutorial that builds the smallest
aggregate (`EmailDelivery`), the `jitsurei` worked-example map, and the walkthrough hub. But
the foundation essays deliberately stop at the *formalism* and **link forward** to the
concrete model. This plan authors that concrete model and the authoring surface that produces
it. After this slice exists, a reader can:

- **Understand the `SymTransducer phi rs s ci co` model exactly** — its four fields
  (`edgesOut`, `initial`, `initialRegs`, `isFinal`), what each of the five type parameters
  means, and the load-bearing distinction this plan *owns* as the canonical conceptual model:
  the difference between the finite **control state `s`** (the lifecycle vertices, a small
  `Bounded`/`Enum` enum) and the typed **register file `rs`** (unbounded data memory carried
  alongside and evolved by edge updates). These are the pages
  `/docs/keiki/explanation/the-symtransducer` and `/docs/keiki/explanation/registers-vs-state`,
  which *every other* Phase-2 capability plan links to rather than re-deriving.
- **Look up the exact signatures** of the three public modules — `Keiki.Core` (the AST,
  the concrete evaluators, and the run entry points `step`/`stepEither`/`delta`/`omega`/
  `reconstitute`), `Keiki.Builder` (the monadic DSL: `buildTransducer`, `from`, `onCmd`,
  `onEpsilon`, `slot`, `.=`, `emit`, `goto`, the `require*` guards), and `Keiki.Operators`
  (the `.`-prefixed operator table and the qualified-import recipe for projects that also use
  `lens`/`generic-lens`) — plus the type-level write-set machinery in `Keiki.Internal.Slots`.
- **Author a real aggregate** by hand: write a multi-event command (multiple `emit`s under the
  single-snapshot rule), model a collection as a scalar tally instead of a register-resident
  `Map`, use the ergonomic field-keyed emit records, and — when needed — drop down to the bare
  `Edge`/`SymTransducer` AST and understand exactly what they keep and lose by doing so.
- **Read a contribution-grade source tour** — the nine-chapter `walkthrough/core-and-builder/`
  tree that reads the real `Keiki.Internal.Slots` → `Keiki.Core` → `Keiki.Builder` →
  `Keiki.Operators` source end to end, anchored to the `CoreSpec`/`BuilderSpec` tests that
  prove the builder and the hand-written AST produce identical `delta`/`omega`/`reconstitute`
  behaviour.

You can see the result by running the docs dev server from the repo root
(`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`) with `pnpm dev` (which runs `vite dev`),
or a production build with `pnpm build`. Browsing `http://localhost:3000/docs/keiki` shows the
new pages in the sidebar: two model-owner explanation essays plus a third guards/emit essay,
four reference pages (core, builder, operators, slots), five how-to guides, one tutorial, and a
ten-file `walkthrough/core-and-builder/` tour (a `00-start-here` plus nine numbered chapters).
Haskell snippets render in PragmataPro with ligatures; `mermaid` diagrams render interactively.

This is a **content** plan. It populates `content/docs/keiki/` only. It does **not** build the
app, the highlighter, the font, the Mermaid component, or the IA/template system — those are
owned by MasterPlan #1's plans and are already complete. Every Haskell snippet documents keiki
**as shipped at the pinned upstream commit `344c4ca` (keiki `0.1.0.0`)**; where keiki's in-repo
`docs/research/*`, `docs/historical/*`, or `docs/plans/*` design notes diverge from the shipped
code, this plan follows the source.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [x] M0. Preconditions verified (2026-06-06) — EP-20 Complete; keiki source readable at `344c4ca`;
      section subdirs exist; baseline `pnpm build` clean; `walkthrough/core-and-builder/` subdir created.
- [x] M1. Model-owner explanation pages + reference pages authored (2026-06-06)
      (`explanation/the-symtransducer.mdx` with EmailDelivery `mermaid`, `explanation/registers-vs-state.mdx`,
      `explanation/guards-and-emit.mdx`; `reference/core.mdx`, `reference/builder.mdx`,
      `reference/operators.mdx`, `reference/slots.mdx`).
- [x] M2. How-to guides + the tutorial authored (2026-06-06)
      (`how-to/write-a-multi-event-command.mdx`, `how-to/model-a-collection.mdx`,
      `how-to/ergonomic-emit.mdx`, `how-to/drop-down-to-the-ast.mdx`;
      `tutorials/a-multi-command-lifecycle.mdx`).
- [x] M3. Walkthrough authored (2026-06-06) (`walkthrough/core-and-builder/` subdir + its `meta.json`:
      `00-start-here.mdx` + `01-internal-slots` … `09-operators-and-namespacing`).
- [x] M4. meta.json appends done (section `meta.json`s + `walkthrough/core-and-builder/meta.json`
      + `"core-and-builder"` appended to `walkthrough/meta.json`); full `pnpm build` exits 0 with
      zero crawler warnings; `pnpm lint:links` exits 0 (226 files); Haskell-name audit passes
      (all identifiers found in source). (2026-06-06)


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

(None yet.)


## Decision Log

Record every decision made while working on the plan.

- Decision: EP-21 **owns the canonical conceptual treatment** of the `SymTransducer` model and
  of the state-vs-registers distinction, on the two pages
  `explanation/the-symtransducer.mdx` and `explanation/registers-vs-state.mdx`.
  Rationale: MasterPlan Integration Point #5a fixes this ownership so the five Phase-2 plans do
  not contradict each other. Every other Phase-2 plan links to these two pages rather than
  re-deriving the model, and EP-20's theory essays link *forward* to them. Authoring them here,
  first (in M1), guarantees the link targets exist before the how-tos and walkthrough reference
  them.
  Date: 2026-06-07
- Decision: Recommend the **transducer surface** (`step`/`stepEither`/`delta`/`omega`/
  `reconstitute`) as keiki's everyday API; present `Keiki.Decider` only as a legacy/compatibility
  façade and **cross-link** to its pages (owned by EP-22) rather than documenting `toDecider`
  here.
  Rationale: MasterPlan Integration Point #6 and Decision (the "Decide → Transduce" lesson
  inherited from MasterPlan #2). The Decider record is owned by EP-22's `reference/decider.mdx`
  and `explanation/decider-facade-and-when-to-use-it.mdx`; EP-21 must not present `toDecider` as
  the default way to run an aggregate.
  Date: 2026-06-07
- Decision: `stepEither` and `StepFailure` are **introduced** in `reference/core.mdx` (they live
  in `Keiki.Core`, which this plan documents) but **deeply documented by EP-24** (diagnostics);
  EP-21 cross-links to EP-24's diagnostics page rather than duplicating the rejection taxonomy.
  Rationale: MasterPlan Integration Point #5b / Dependency Graph — `stepEither`/`StepFailure`
  are part of the core run surface (so they must appear in the core reference for completeness)
  but the *interpretation* of each failure constructor belongs with the validation/diagnostics
  capability (EP-24). Documenting the names without re-explaining each failure mode keeps the two
  plans non-contradictory.
  Date: 2026-06-07
- Decision: Teach slot writes with `slot @"name"` (TypeApplication-pinned), **not** `#name`.
  Rationale: GHC's `IsLabel` head has two positions; an `IndexN`-typed slot write through the
  overloaded-label syntax `#name` is rejected at the use site, so the builder DSL provides
  `slot @"name"` as the write-position form (`#name` works only for *reads*, e.g. `regs.#name`
  / `r ! #name`). Documenting the wrong form would make every authoring snippet fail to compile.
  Date: 2026-06-07


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

**Outcome (2026-06-06).** EP-21 is complete: 22 pages authored — three explanation pages (the two
canonical model-owner pages `the-symtransducer` + `registers-vs-state`, plus `guards-and-emit`),
four reference pages (`core`, `builder`, `operators`, `slots`), four how-tos, one tutorial
(`a-multi-command-lifecycle`, OrderCart), and the ten-file `walkthrough/core-and-builder/` source
tour. The whole keiki tree builds clean (`pnpm build` exit 0, zero crawler warnings), and link-check
passes (226 files). Every Haskell identifier used was audited against the pinned source `344c4ca`.

**Surprises.** (1) A `<Card description="… slot @\"name\" …">` with backslash-escaped quotes broke
the MDX build — JSX *attribute* values cannot use backslash escapes (unlike YAML frontmatter and JSX
`{…}` expressions, where `\"` is valid). Fixed by rephrasing the attribute text. (2) The builder
reference initially carried live markdown links to `reference/composition` (EP-23) and
`reference/symbolic` (EP-24), which do not exist yet — the crawler flagged them. Per the
soft-dependency rule, demoted them to plain inline code. Both are recorded for sibling plans.

**Hand-off.** `explanation/the-symtransducer` and `explanation/registers-vs-state` now exist as the
canonical model pages every other Phase-2 plan links to. `reference/core` introduces
`stepEither`/`StepFailure` for completeness and defers the per-failure taxonomy to EP-24.


## Context and Orientation

Read this whole section before editing. It is written so a novice with only this file and the
working tree can complete the work. You will write MDX content files; you will not write or
compile Haskell. The Haskell appears only as *quoted snippets* inside the docs, and every
snippet must match the real source transcribed below.

### What you are building, and where

This repository (`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`) is a **fumadocs**
documentation site (fumadocs-ui + fumadocs-mdx) built on **TanStack Start as a static
single-page app** (React + MDX + TypeScript, bundled with **Vite**), built and served with
**pnpm** on **Node 22**. `pnpm dev` runs `vite dev`; `pnpm build` runs `vite build` and emits a
static SPA. Content lives under `content/docs/`. Each directory has a `meta.json` whose `pages`
array lists child page slugs (and nested directory names) in sidebar order. A "page" is an
`.mdx` file: YAML frontmatter (`title`, `description`) followed by an MDX body.

The documented **code samples are Haskell** (the site is TypeScript; the subject, keiki, is a
Haskell library). The MDX components (`Callout`, `Cards`, `Card`, `Steps`, `Step`, `Tabs`,
`Tab`, `TypeTable`, `Accordion`, `Accordions`, and `Mermaid`) are **registered globally** — so
in page bodies you use them **bare, with no `import` lines**. This matches every existing
keiro/kiroku page. Do not add `import` statements for these components.

### Where this plan sits in the larger effort (reference by path)

This is **EP-21** in the MasterPlan `docs/masterplans/3-keiki-framework-documentation-set.md`.
It is a **Phase-2 capability plan**. It documents one cohesive slice of the keiki source: the
transducer core and authoring DSL (`Core`, `Builder`, `Operators`, `Internal.Slots`).

- **HARD DEP — EP-20**
  (`docs/plans/20-keiki-foundation-theory-getting-started-and-the-worked-example-spine.md`):
  EP-20 must be **Complete** before you start. EP-20 creates the `/docs/keiki` overview and
  getting-started pages your pages link back to, the foundations/theory explanation essays your
  conceptual pages lean on (and which link *forward* to this plan's model pages), the
  introduction of the `jitsurei` worked example and its canonical module map, the
  `docs/keiki-source-sync.md` source-of-truth pointer, the `walkthrough/index.mdx` hub and
  `walkthrough/meta.json`, and the shared authoring conventions. Verify EP-20 is done in M0; if
  `content/docs/keiki/index.mdx` or `docs/keiki-source-sync.md` is missing, stop and finish
  EP-20 first.
- **SOFT — EP-22, EP-23, EP-24, EP-25.** The other Phase-2 plans link *into* this plan's pages:
  EP-22 (derivations) links to `explanation/the-symtransducer` and `explanation/registers-vs-state`
  rather than re-deriving the model; EP-23 (composition) reuses the same `SymTransducer` model
  and `Guarded` alias; EP-24 (symbolic/validation) deeply documents the `stepEither`/`StepFailure`
  diagnostics this plan only introduces, and the `HsPred`/`BoolAlg`/`Sat` surface this plan
  references; EP-25 (rendering) projects the same `Edge`/`SymTransducer` surface. Soft means
  non-blocking: you author absolute forward-links to those plans' pages where the narrative needs
  them, and they resolve once those plans land. If you cannot confirm a target page's exact slug,
  link to the section landing (`/docs/keiki/reference` or `/docs/keiki/explanation`) and name the
  intended target in prose. (This is the hard-won crawler lesson: a `<Card href>` or MDX link to
  a not-yet-authored page emits `Failed to fetch` and fails the build gate.)

### Hard-won house rules (apply to every page you write)

1. **Absolute doc links only.** Cross-page links use absolute doc paths
   (`/docs/keiki/reference/core`), never relative `./sibling` or `../section/page`. Relative MDX
   links resolve *wrong* in the static SPA and trip the prerender crawler. This applies even to
   the code-walkthrough template's `[00 — Start here](./00-start-here)` line — when you copy that
   template, **rewrite the link to an absolute path**
   (`/docs/keiki/walkthrough/core-and-builder/00-start-here`).
2. **Every fenced code block carries a language tag.** Use ` ```haskell `, ` ```mermaid `,
   ` ```text `, ` ```bash `, ` ```json `. Never a bare ```` ``` ````.
3. **Snippet accuracy is an acceptance criterion.** Every Haskell type, field, and function name
   you quote must appear in the pinned source. The verified transcription is below; cross-check
   against the named files before declaring a snippet done. The `EmailDelivery`/`OrderCart`
   snippets must compile-match the `jitsurei` source.
4. **No `import` lines for the MDX components** (see above).
5. **Do not reformat with oxfmt.** Hand-authored MDX in this repo does not pass `oxfmt --check`
   cleanly repo-wide; match the neighbouring `content/docs/keiro/*` file style, do not reformat.
6. **Every page has frontmatter** with a `title:` and a `description:`.
7. **Commit trailers.** Every commit carries the trailers
   `MasterPlan: docs/masterplans/3-keiki-framework-documentation-set.md` and
   `ExecPlan: docs/plans/21-keiki-transducer-core-and-authoring-aggregates.md`.

### The subject, transcribed from source (use these REAL names)

Source of truth on disk (read-only — do **not** edit it): `/Users/shinzui/Keikaku/bokuno/keiki`,
pinned commit `344c4ca` (keiki `0.1.0.0`); resolve the path with
`mori registry show shinzui/keiki --full`. The `jitsurei` worked-example package lives **inside**
that repo at `jitsurei/src/Jitsurei/*.hs` with its specs at `jitsurei/test/Jitsurei/*.hs`. The
facts below are transcribed from that tree — treat this as your API cheat-sheet, and re-read the
named modules before transcribing a signature into a reference page.

**Module layering (read in this order).** `Keiki.Internal.Slots` (type-level write-set
machinery) ← `Keiki.Core` (the AST, the concrete evaluators, the run entry points) ← both
`Keiki.Builder` (the monadic authoring DSL) and `Keiki.Operators` (a qualified re-export shim of
the Core operators). The walkthrough tours them bottom-up in exactly this order.

**(A) `Keiki.Core` — the `SymTransducer` model** (`src/Keiki/Core.hs`; tests
`test/Keiki/CoreSpec.hs`).

The central type and its four fields:

```haskell
data SymTransducer phi rs s ci co = SymTransducer
  { edgesOut    :: s -> [Edge phi rs ci co s]   -- outgoing edges for a control vertex
  , initial     :: s                            -- the start vertex
  , initialRegs :: RegFile rs                   -- the start register file
  , isFinal     :: s -> Bool                    -- which vertices are terminal
  }
```

The five type parameters: `phi` is the **guard carrier** — an effective Boolean algebra over
predicates; authoring uses `HsPred rs ci` (aliased `Pred`), and the everyday transducer alias is
`type Guarded rs s ci co = SymTransducer (HsPred rs ci) rs s ci co`. `rs :: [Slot]` is the
**register-file schema** — a type-level list of `(Symbol, Type)` pairs naming each data slot and
its type. `s` is the **finite control vertex** type (a small enum, `Bounded`/`Enum`/`Eq`/`Show`).
`ci` is the **command/input** sum, and `co` is the **event/output** sum.

State vs registers — the distinction this plan *owns* conceptually: the control vertex `s` is the
**finite control** (the lifecycle stages, e.g. `EmailPending`/`EmailSentVertex`); the register
file `rs` is the **unbounded typed data memory** carried alongside and evolved by edge updates
(e.g. the recipient, subject, and timestamp slots).

The register file is a typed heterogeneous GADT:

```haskell
data RegFile rs where
  RNil  :: RegFile '[]
  RCons :: Proxy name -> r -> RegFile rest -> RegFile ('(name, r) ': rest)
```

The slot-value field is intentionally **lazy**: `emptyRegFile` (re-exported through
`Keiki.Generics`, used as the builder's start file) seeds each slot with a deferred
`error "uninit: <slot>"` sentinel; a write forces the slot to WHNF; a read is via
`(!) :: RegFile rs -> Index rs r -> r` (`infixl 9`) or the `#name` overloaded label.

An edge bundles a guard, an update, an output list, and a target vertex:

```haskell
data Edge phi rs ci co s = Edge
  { guard  :: phi
  , update :: Update rs w ci
  , output :: [OutTerm rs ci co]
  , target :: s
  }
```

The guard predicate language (the `HsPred rs ci` constructors): `PTop`/`PBot` (always/never),
`PAnd`/`POr`/`PNot` (Boolean combination), `PEq` (term equality), `PInCtor` (match the input
constructor), and `PCmp Cmp` where `Cmp = CmpLt | CmpLe | CmpGt | CmpGe` (ordered comparison).

The term language `Term rs ci ifs r` (with smart constructors): `TLit` (literal; `lit`), `TReg`
(read a register; `proj`), `TInpCtorField` (read a field of the *matched input constructor* — this
constructor **pins** the input-field schema `ifs`; `inpCtor`), the two opaque escape hatches
`TApp1`/`TApp2` (apply an arbitrary Haskell function — **solver-blind**), and `TArith NumOp` where
`NumOp = OpAdd | OpSub | OpMul` (**structural**, solver-visible arithmetic; `tadd`/`tsub`/`tmul`).
The `ifs` parameter (input-field schema) is the term's 4th parameter; it is pinned by
`TInpCtorField` and existentially hidden everywhere else, and it is what lets `solveOutput` invert
an output back to its inputs.

```haskell
data InCtor ci ifs = InCtor
  { icName  :: Text
  , icMatch :: ci -> Maybe (RegFile ifs)   -- match an input and project its fields
  , icBuild :: RegFile ifs -> ci           -- rebuild the input from its fields
  }
```

The update language `Update rs w ci` (`w` is the *write set* — the type-level list of slot names
this update touches): `UKeep` (no-op), `USet (IndexN s rs r) Term` (write one slot), and
`UCombine` (sequence two updates). The combinator `combine :: Disjoint w1 w2 => …` *statically*
rejects writing the same slot twice.

Output assembly: a wire constructor describes one event shape; `OutFields` is a heterogeneous
field list built with `(*:)` (`infixr 5`) and `oNil`; `OutTerm = OPack InCtor WireCtor OutFields`
and `pack` assembles one:

```haskell
data WireCtor co fields = WireCtor
  { wcName  :: Text
  , wcMatch :: co -> Maybe (RegFile fields)
  , wcBuild :: RegFile fields -> co
  }
```

Operators defined in Core (also re-exported by `Keiki.Operators`): `.==`/`./=` (`infix 4`),
`.<`/`.<=`/`.>`/`.>=` (`infix 4`), `.&&` (`infixr 3`), `.||` (`infixr 2`), `pnot`, and the
arithmetic `.+`/`.-` (`infixl 6`), `.*` (`infixl 7`).

The Boolean-algebra plumbing: class `BoolAlg phi a` (`top`/`bot`/`conj`/`disj`/`neg`/`models`/
`isBot`) with `instance BoolAlg (HsPred rs ci) (RegFile rs, ci)` whose `models = evalPred` — a
**concrete** evaluator, no SMT solver involved. Class `Sat phi a` adds `sat`.

The **concrete** evaluators (no solver): `evalTerm`, `evalOut`, `evalPred`, `runUpdate`, `delta`,
`omega`. Here `delta` is the unique-matching-edge state transition (it yields `Nothing` when zero
or more than one edge matches), and `omega` is the output of the unique active edge.

The **run entry points**:

```haskell
step :: BoolAlg phi (RegFile rs, ci)
     => SymTransducer phi rs s ci co
     -> (s, RegFile rs) -> ci
     -> Maybe (s, RegFile rs, [co])

stepEither :: BoolAlg phi (RegFile rs, ci)
           => SymTransducer phi rs s ci co
           -> (s, RegFile rs) -> ci
           -> Either (StepFailure s) (s, RegFile rs, [co])

reconstitute :: BoolAlg phi (RegFile rs, ci)
             => SymTransducer phi rs s ci co
             -> [ci] -> Maybe (s, RegFile rs)
-- reconstitute t = applyEvents t (initial t, initialRegs t)   -- the replay fold
```

There is **no `StepResult` type** — a successful step is the bare triple
`(s, RegFile rs, [co])`. The streaming/folding helpers are `applyEvent`,
`applyEventStreaming` (with `data InFlight s co = Settled !s | InFlight !s ![co]`), `applyEvents`,
and `reconstitute`. The diagnostics types are:

```haskell
data StepFailure s
  = NoOutgoingEdges s
  | NoMatchingEdge s [RejectedEdgeSummary s]
  | AmbiguousEdges s [MatchedEdgeSummary s]

data EdgeRef s = EdgeRef { edgeSource :: s, edgeIndex :: Int }
```

`stepEither`/`StepFailure` are **introduced** in `reference/core.mdx` (for completeness — they
are part of the run surface) but **deeply documented by EP-24** (the diagnostics capability):
cross-link, do not re-explain each failure constructor.

**(B) `Keiki.Builder` — the authoring DSL** (`src/Keiki/Builder.hs`; tests
`test/Keiki/BuilderSpec.hs`). Three monad layers:

1. `VertexBuilder` (a plain `Monad`, ordinary `do`) — the `buildTransducer` body; `from` writes a
   `(vertex, edges)` entry.
2. `EdgeListBuilder` (a plain `Monad`) — one per source vertex; `onCmd`/`onEpsilon` prepend an
   edge.
3. `EdgeBuilder rs ci co v (w :: [Symbol]) (w' :: [Symbol]) a` (an **indexed** monad, driven by
   `B.do` via `QualifiedDo`) — one per edge; the `w`/`w'` indices track the slots written so far,
   so a **duplicate write fails to compile**.

The entry point:

```haskell
buildTransducer
  :: (Bounded v, Enum v, Eq v, Show v)
  => v                     -- the initial vertex
  -> RegFile rs            -- the initial RegFile (usually emptyRegFile)
  -> (v -> Bool)           -- isFinal
  -> VertexBuilder rs v ci co ()   -- the body
  -> SymTransducer (HsPred rs ci) rs v ci co
```

Inside the body: `from v` opens a vertex's edge list; `onCmd ic (\d -> body)` opens a
command-triggered edge (`d` is a `PayloadProj`; `d.field` reads a field of the matched input via
`HasField` → `inpCtor`); `onEpsilon` opens an ε-edge (one that fires without a command). Slot
writes use `slot @"name"` (a TypeApplication-pinned `IndexN`; **`#name` is rejected by GHC's
two-position `IsLabel` head at a write site — you must use `slot @"name"`**) with `.=` or its
lens-clash-free synonym `=:` (`infixr 6`); the RHS is a `Term`; the indexed monad's `Disjoint
'[name] w` constraint turns a duplicate write into a compile error. Emission uses
`emit wc rec` (where `rec` is a field-keyed `<Ctor>TermFields` record and the `InCtor` is
recovered from the enclosing `onCmd`), `emitWith ic wc rec` (an explicit `InCtor`, needed inside
`onEpsilon` where there is no enclosing command), or `noEmit` (ε output); both `emit` forms also
accept a positional `(t1 *: t2 *: oNil)` via the `ToOutFields` class. Guards are the verbs
`requireGuard`/`requireEq`/`requireCmp`/`requireLt`/`requireLe`/`requireGt`/`requireGe`. Each edge
body ends with `goto v` exactly once (a missing or duplicate `goto` is caught at finalize time as
a runtime error).

Required language pragmas to quote when showing a full module: `BlockArguments`, `QualifiedDo`,
`OverloadedLabels`, `OverloadedRecordDot`, `TypeApplications`, `DataKinds`, `DeriveGeneric`,
`GADTs`, `TemplateHaskell`; plus `import Keiki.Builder ((.=))`.

The **minimal worked example** — quote it **verbatim** from
`jitsurei/src/Jitsurei/EmailDelivery.hs` (lines 153–168 at the pinned commit; verified
transcription):

```haskell
emailDelivery
  :: Guarded EmailRegs EmailVertex EmailCmd EmailEvent
emailDelivery = B.buildTransducer EmailPending emptyEmailRegs
                  (\case EmailSentVertex -> True; _ -> False) do

    B.from EmailPending do
      B.onCmd inCtorSendEmail $ \d -> B.do
        B.slot @"emailRecipient" .= d.recipient
        B.slot @"emailSubject"   .= d.subject
        B.slot @"emailSentAt"    .= d.at
        B.emit wireEmailSent EmailSentTermFields
          { recipient = d.recipient
          , subject   = d.subject
          , at        = d.at
          }
        B.goto EmailSentVertex
```

Multi-event behaviour: multiple `emit`s in one `onCmd` body **snoc-append** to the edge's output
list (so the edge emits ≥ 2 events). The **single-snapshot rule**: every `emit` evaluates against
the *same* pre-transition `(regs, ci)`, and the update applies once at the edge level — so a later
`emit` must read its values from `d.field` (the command payload), **not** from `#slot` (which still
holds the pre-write value). Branching (different events for different values) is **not** a
multi-event command — model it as several disjoint-guarded edges.

Collections: project to the **scalar facts** the guards need rather than storing a container in a
register. `OrderCart` (`jitsurei/src/Jitsurei/OrderCart.hs`) keeps an `itemCount :: Word32` slot
maintained with `.+`/`.-`; a `Map` in a register is a smell because content-dependent guards
become opaque `TApp` terms the solver cannot see. The idiom "can't close while any item is open"
becomes the structural guard `openCount .== lit 0`. The shipped audit that flags opaque guards is
`warnOpaqueGuards`.

**(C) `Keiki.Operators` — namespacing shim** (`src/Keiki/Operators.hs`). It re-exports the Core
operators so a project that already re-exports `lens`/`generic-lens` can
`import qualified Keiki.Operators as K` and write `x K..> y` — the sharpest clash being `.>`
(lens optic composition). The third option for guard authoring is the builder verb
`B.requireGt`. Reminder for the operators page: `TArith`/`PCmp` are **structural** (solver-visible);
`TApp1`/`TApp2` are **opaque** (translated to fresh SBV variables, so they silently *under-verify*)
— `warnOpaqueGuards` is the audit. The `jitsurei` anchor for an operator-built guard is
`LoanApplication.hs`'s `approvalGuard`.

**(D) `Keiki.Internal.Slots` — type-level write-set machinery** (`src/Keiki/Internal/Slots.hs`).
The type families `Concat`, `Member`, `Disjoint` (whose `TypeError` names the duplicate slot), and
`Names`; the slot-name-tagged index `IndexN s rs r` with constructors `IZ`/`IS`; the `HasIndexN`
class and `instance HasIndexN … => IsLabel s (IndexN s rs r)`; and the helpers `indexNToInt` and
`indexNName`. This is the machinery behind both `slot @"name"` (a pinned `IndexN`) and the
compile-time duplicate-write rejection.

### The jitsurei worked examples (your anchors for explanations + how-tos)

`jitsurei` (実例, "worked example") is a runnable package shipped *inside* the keiki repo. EP-21
anchors to (all under `/Users/shinzui/Keikaku/bokuno/keiki/jitsurei/`):

- **EmailDelivery** — `src/Jitsurei/EmailDelivery.hs`; specs
  `test/Jitsurei/EmailDeliveryBuilderSpec.hs`. The smallest aggregate (single command, single
  event); the minimal builder example above. The first *tutorial* (build EmailDelivery) is EP-20's
  getting-started; this plan **cross-links** to it.
- **OrderCart** — `src/Jitsurei/OrderCart.hs`; specs `test/Jitsurei/OrderCartBuilderSpec.hs`. The
  multi-command lifecycle and the collection-as-scalar-tally pattern; the anchor for this plan's
  tutorial and for `how-to/model-a-collection`.
- **UserRegistration** — `src/Jitsurei/UserRegistration.hs`; specs
  `test/Jitsurei/UserRegistrationBuilderSpec.hs`, `UserRegistrationGSMSpec.hs`. The full lifecycle,
  multi-event command, ε-edge/`noEmit`, equality guard; the anchor for
  `how-to/write-a-multi-event-command` and the builder-edge-body walkthrough chapter.
- **EmailDelivery / EmailDelivery** ε-emit — the `emitWith`-for-ε example for
  `how-to/ergonomic-emit` is anchored to `EmailDelivery.hs`'s field-keyed `<Ctor>TermFields` record.

The builder↔AST equivalence specs
(`{EmailDelivery,UserRegistration,OrderCart}BuilderSpec.hs`) prove that both authoring paths (the
DSL and the hand-written AST) produce **identical** `delta`/`omega`/`reconstitute` behaviour — the
proof the `drop-down-to-the-ast` how-to and the walkthrough lean on.

In-repo keiki guide docs that carry the prose this plan paraphrases (rationale/history only — trust
the *source* for signatures): `docs/guide/output-invertibility.md`,
`docs/guide/multi-event-commands.md`, `docs/guide/modeling-collections.md`,
`docs/guide/ast-drop-down.md`, `docs/guide/generic-lens-and-label-reads.md`.

### The pages this plan authors (all under `content/docs/keiki/`)

Explanations: `explanation/the-symtransducer.mdx`, `explanation/registers-vs-state.mdx`,
`explanation/guards-and-emit.mdx`. References: `reference/core.mdx`, `reference/builder.mdx`,
`reference/operators.mdx`, `reference/slots.mdx`. How-tos:
`how-to/write-a-multi-event-command.mdx`, `how-to/model-a-collection.mdx`,
`how-to/ergonomic-emit.mdx`, `how-to/drop-down-to-the-ast.mdx`. Tutorial:
`tutorials/a-multi-command-lifecycle.mdx`. Walkthrough (new subdir):
`walkthrough/core-and-builder/00-start-here.mdx` plus `01-internal-slots.mdx`,
`02-regfile-and-index.mdx`, `03-term-language.mdx`, `04-update-language.mdx`,
`05-output-and-predicate.mdx`, `06-edges-and-step-semantics.mdx`, `07-builder-three-layers.mdx`,
`08-builder-edge-body.mdx`, `09-operators-and-namespacing.mdx`, plus
`walkthrough/core-and-builder/meta.json`.

### Templates to copy from

Per Diátaxis type, copy the matching template's frontmatter + skeleton from
`content/docs/_templates/`: `explanation.mdx`, `theory-explainer.mdx` (a good fit for the two
model-owner pages), `reference.mdx`, `how-to.mdx`, `tutorial.mdx`, `code-walkthrough.mdx`. Good
in-repo exemplars for tone and component usage: the neighbouring `content/docs/keiro/*` pages —
e.g. `content/docs/keiro/explanation/the-command-cycle.mdx`,
`content/docs/keiro/reference/command.mdx`, and a `content/docs/keiro/walkthrough/*` chapter.


## Plan of Work

The work is five milestones. M0 verifies preconditions. M1–M3 each author one page-group and are
independently verifiable by building the site and viewing the new pages. M4 wires the sidebar and
runs the full acceptance gate. Author in the order below: M1 authors the **model-owner**
explanation pages *first* (they are the link targets every later page and every sibling plan
depends on), then the reference pages that the how-tos and walkthrough quote.

### M0 — Preconditions

Confirm EP-20 is Complete and the toolchain/tree are ready. At the end you can run `pnpm build` on
the existing keiki tree with zero errors, and the `walkthrough/core-and-builder/` subdir exists.
Acceptance: the build succeeds before you add any EP-21 page, `docs/keiki-source-sync.md` +
`content/docs/keiki/index.mdx` + `content/docs/keiki/walkthrough/index.mdx` exist, and the keiki
source is readable at the pinned commit `344c4ca`.

### M1 — Model-owner explanation + reference set (7 pages)

This is the heart of the plan and is authored first because everything else links to it.

`explanation/the-symtransducer.mdx` (Integration Point 5a — you OWN it): explain
`SymTransducer phi rs s ci co` — the four fields, the five type parameters, the `Guarded` alias,
the GSM-style output **widening** (an edge emits a *list* `[OutTerm]`, not a single output), and
that all evaluators are **concrete** (no SMT solver runs at `step` time). Carry one `mermaid`
diagram of a tiny two-vertex transducer (the EmailDelivery shape). Recommend the transducer
surface (`step`/`stepEither`/`delta`/`omega`/`reconstitute`); mention `Keiki.Decider` only as a
legacy façade and cross-link to EP-22's pages in prose (do not present `toDecider`).

`explanation/registers-vs-state.mdx` (Integration Point 5a — you OWN it): the vertex `s` (finite
control) vs the register file `rs` (data memory) distinction; `emptyRegFile`'s deferred
`error "uninit: <slot>"` sentinels and the lazy-slot/WHNF-on-write discipline; and the per-vertex
**B-view** projection (the live-slot subset visible at a given vertex). Anchor to
`jitsurei/src/Jitsurei/UserRegistration.hs`.

`explanation/guards-and-emit.mdx`: the `HsPred` guard fragment; the **structural vs opaque** term
split (`TArith`/`PCmp` are solver-visible; `TApp1`/`TApp2` are opaque); `OPack` output
**invertibility** and `solveOutput`'s recompute-and-verify; and why opaque guards under-verify
(`warnOpaqueGuards`). Anchor to `docs/guide/output-invertibility.md`.

`reference/core.mdx`: the `Keiki.Core` export surface — `SymTransducer`/`Edge`/`RegFile`/`Index`,
the term language (`Term`/`NumOp`/smart constructors), `InCtor`, the update language
(`Update`/`combine`/`UCombine`), output assembly (`WireCtor`/`OutFields`/`OPack`/`pack`/`(*:)`/
`oNil`), the predicate language (`HsPred`/`Cmp`), the operator table, `BoolAlg`/`Sat`, the concrete
evaluators (`evalTerm`/`evalOut`/`evalPred`/`runUpdate`/`delta`/`omega`), and the run entry points
(`step`/`stepEither`/`StepFailure`/`EdgeRef`/`applyEvent`/`applyEventStreaming`/`InFlight`/
`applyEvents`/`reconstitute`). Use `<TypeTable>` for the records and verbatim signatures for the
functions. State plainly that there is **no `StepResult`** (success is the bare triple) and
cross-link `stepEither`/`StepFailure` to EP-24's diagnostics page. Anchor `src/Keiki/Core.hs`,
`test/Keiki/CoreSpec.hs`.

`reference/builder.mdx`: the DSL surface — the three monad layers, `buildTransducer`/`from`/`onCmd`/
`onEpsilon`, `slot @"name"`/`.=`/`=:`, `emit`/`emitWith`/`noEmit`/`ToOutFields`, the `require*`
verbs, `goto`, `PayloadProj`/`d.field`, and the required pragmas. Quote the EmailDelivery example
verbatim. Anchor `src/Keiki/Builder.hs`, `test/Keiki/BuilderSpec.hs`.

`reference/operators.mdx`: the full `.`-operator table with **fixities**, and the qualified-import
recipe (`import qualified Keiki.Operators as K`; the `.>` lens clash) plus the third option
`B.requireGt`. Anchor `src/Keiki/Operators.hs`, `jitsurei/src/Jitsurei/LoanApplication.hs`
(`approvalGuard`).

`reference/slots.mdx` (internals): `IndexN`/`HasIndexN`/`Disjoint`/`Concat`/`Names` write-set
machinery and the `IsLabel`/`slot @"name"` story. Anchor `src/Keiki/Internal/Slots.hs`.

At the end: all seven pages build and render; the two model-owner explanation pages are linkable
at `/docs/keiki/explanation/the-symtransducer` and `/docs/keiki/explanation/registers-vs-state`.
Acceptance: `pnpm build` prerenders them with no crawler warnings; the M1 slugs appended to
`reference/meta.json` and `explanation/meta.json`.

### M2 — How-to guides + tutorial (5 pages)

`how-to/write-a-multi-event-command.mdx`: multiple `emit`s, the single-snapshot rule, and chunk vs
streaming replay. Anchor `docs/guide/multi-event-commands.md`,
`jitsurei/src/Jitsurei/UserRegistration.hs`, `UserRegistrationGSMSpec.hs`.

`how-to/model-a-collection.mdx`: tally vs promote-to-aggregate, and the opaque-guard trap. Anchor
`docs/guide/modeling-collections.md`, `jitsurei/src/Jitsurei/OrderCart.hs`.

`how-to/ergonomic-emit.mdx`: field-keyed `<Ctor>TermFields` records vs the positional
`(*:)`/`oNil`, and `emitWith` for an ε-edge. Anchor `docs/guide/output-invertibility.md`,
`jitsurei/src/Jitsurei/EmailDelivery.hs`.

`how-to/drop-down-to-the-ast.mdx`: hand-author an `Edge`/`SymTransducer` and what you keep/lose
versus the DSL. Anchor `docs/guide/ast-drop-down.md` and the `*AST` forms in the jitsurei modules.

`tutorials/a-multi-command-lifecycle.mdx`: the OrderCart happy path plus its branches — copy from
`tutorial.mdx`. Cross-link to EP-20's minimal first tutorial (EmailDelivery). Anchor
`jitsurei/src/Jitsurei/OrderCart.hs`, `OrderCartBuilderSpec.hs`.

At the end: each guide solves its one task and the tutorial runs end to end in prose. Acceptance:
all build; the M2 slugs appended to `how-to/meta.json` and `tutorials/meta.json`.

### M3 — Walkthrough (`walkthrough/core-and-builder/`, 10 files + meta.json)

A `00-start-here.mdx` (the tour's real entry page) plus nine numbered chapters that read the
source bottom-up. Each chapter quotes the relevant excerpt verbatim, names its source line refs,
and points to its test anchor:

- `01-internal-slots.mdx` — `src/Keiki/Internal/Slots.hs` (the type families, `IndexN`, the
  `IsLabel` instance).
- `02-regfile-and-index.mdx` — `Core.hs`: `Slot`/`RegFile`/`Index`/`(!)`/`HasIndex`, the lazy
  `uninit` + WHNF-on-write path; `CoreSpec`.
- `03-term-language.mdx` — `NumOp`/`Term`/`InCtor`/`AssembleRegFile`, the `ifs` schema, the smart
  constructors, `evalTerm`.
- `04-update-language.mdx` — `Update`/`combine`/`UCombine`/`runUpdate`, the `Disjoint` static
  check.
- `05-output-and-predicate.mdx` — `WireCtor`/`OutFields`/`OPack`/`pack`/`(*:)`/`oNil`,
  `HsPred`/`Cmp`, `BoolAlg`/`Sat`, the operators, `evalOut`/`evalPred`.
- `06-edges-and-step-semantics.mdx` — `Edge`/`SymTransducer`/`Guarded`, `delta`/`omega`/`step`/
  `stepEither`/`StepFailure`, `applyEvent`/`applyEventStreaming`/`InFlight`/`applyEvents`/
  `reconstitute`; `CoreSpec`.
- `07-builder-three-layers.mdx` — `VertexBuilder`/`EdgeListBuilder`/`EdgeBuilder`,
  `buildTransducer`/`from`/`onCmd`/`onEpsilon`/`finalizeEdge`, the indexed `>>=`; `BuilderSpec`.
- `08-builder-edge-body.mdx` — `slot`/`reg`/`.=`/`=:`, `emit`/`emitWith`/`ToOutFields`, the
  `require*` verbs, `goto`, `PayloadProj`'s `d.field`; `jitsurei/.../UserRegistration.hs`,
  `UserRegistrationBuilderSpec.hs`.
- `09-operators-and-namespacing.mdx` — `Operators.hs`; `docs/guide/generic-lens-and-label-reads.md`.

`00-start-here.mdx` frames the bottom-up reading order with an overview `mermaid` of the module
layering, and closes by noting the builder↔AST equivalence specs prove both authoring paths agree.
At the end: the subdir exists with its own `meta.json`. Acceptance: all ten files build; internal
links are absolute.

### M4 — meta.json appends + full acceptance

Append EP-21's slugs to the section `meta.json`s, create
`walkthrough/core-and-builder/meta.json`, append `"core-and-builder"` to `walkthrough/meta.json`
(do **not** add a hub `<Card href>` — EP-26 finalizes hub hrefs), then run the full build and
audits. Acceptance: see Validation and Acceptance.


## Concrete Steps

Run all commands from the repo root `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` unless
stated otherwise. The toolchain is **pnpm** on **Node 22**.

### M0 — Preconditions

```bash
# Confirm EP-20's artifacts exist (HARD DEP). If any is missing, finish EP-20 first.
test -f content/docs/keiki/index.mdx && echo "keiki overview present"
test -f docs/keiki-source-sync.md && echo "source-sync pointer present"
test -f content/docs/keiki/walkthrough/index.mdx && echo "walkthrough hub present"

# Confirm the section dirs you will write into exist.
for d in explanation reference how-to tutorials walkthrough; do
  test -d "content/docs/keiki/$d" && echo "have content/docs/keiki/$d"
done

# Resolve the keiki source path and confirm the pinned commit.
mori registry show shinzui/keiki --full | grep -i path
git -C /Users/shinzui/Keikaku/bokuno/keiki log --oneline -1   # expect 344c4ca

# Install deps and confirm the existing site builds before you add pages.
pnpm install
pnpm build
```

Expected (abridged):

```text
keiki overview present
source-sync pointer present
walkthrough hub present
have content/docs/keiki/explanation
...
344c4ca docs(guide): ...
✓ built in <N>s
```

Create the walkthrough subdir you will populate in M3:

```bash
mkdir -p content/docs/keiki/walkthrough/core-and-builder
```

Optional but recommended — confirm the API names you will quote still exist at the pinned commit
(read-only; do **not** edit the keiki tree):

```bash
grep -RnE "data SymTransducer|^step ::|stepEither ::|reconstitute|data StepFailure|emptyRegFile|buildTransducer|onEpsilon|warnOpaqueGuards" \
  /Users/shinzui/Keikaku/bokuno/keiki/src/Keiki
```

### M1–M3 — Authoring

Copy the matching template from `content/docs/_templates/` for each page, give it a `title:` +
`description:` frontmatter, and author the body from the transcription in Context. Run an
incremental dev server while authoring so you can eyeball each page:

```bash
pnpm dev   # then browse http://localhost:3000/docs/keiki
```

When you copy the `code-walkthrough.mdx` template, **rewrite its `[00 — Start here](./00-start-here)`
relative link to the absolute form** `/docs/keiki/walkthrough/core-and-builder/00-start-here`.

### M4 — meta.json appends + acceptance

Append this plan's slugs to each section `meta.json` `pages` array (append only — never reorder or
remove another plan's entries):

- `content/docs/keiki/reference/meta.json` → add `"core"`, `"builder"`, `"operators"`, `"slots"`.
- `content/docs/keiki/explanation/meta.json` → add `"the-symtransducer"`, `"registers-vs-state"`,
  `"guards-and-emit"`.
- `content/docs/keiki/how-to/meta.json` → add `"write-a-multi-event-command"`,
  `"model-a-collection"`, `"ergonomic-emit"`, `"drop-down-to-the-ast"`.
- `content/docs/keiki/tutorials/meta.json` → add `"a-multi-command-lifecycle"`.

Create `content/docs/keiki/walkthrough/core-and-builder/meta.json`:

```json
{
  "title": "Core & Builder",
  "pages": [
    "00-start-here",
    "01-internal-slots",
    "02-regfile-and-index",
    "03-term-language",
    "04-update-language",
    "05-output-and-predicate",
    "06-edges-and-step-semantics",
    "07-builder-three-layers",
    "08-builder-edge-body",
    "09-operators-and-namespacing"
  ]
}
```

Append `"core-and-builder"` to `content/docs/keiki/walkthrough/meta.json`'s `pages` array (it is
currently `["index"]` → `["index", "core-and-builder"]`). Do **not** add a hub `<Card href>` in
`walkthrough/index.mdx` — EP-26 owns the final hub-href pass.

Then run the full acceptance gate (see next section).


## Validation and Acceptance

Acceptance is phrased as observable behavior. Run from the repo root.

```bash
pnpm typecheck      # expect: clean
pnpm build          # expect: exits 0; prerenders all new keiki routes;
                    #         NO "unhandledRejection" / "Failed to fetch" crawler warnings
pnpm lint:links     # expect: exit 0 (no broken internal links)
```

Specific things to observe:

1. **Signatures match source.** Every Haskell signature on `reference/core.mdx`,
   `reference/builder.mdx`, `reference/operators.mdx`, and `reference/slots.mdx` appears verbatim
   in `src/Keiki/{Core,Builder,Operators}.hs` and `src/Keiki/Internal/Slots.hs` at `344c4ca`. Spot
   check with a name audit:

   ```bash
   grep -RnE "SymTransducer|stepEither|StepFailure|buildTransducer|onEpsilon|requireGt|IndexN|warnOpaqueGuards" \
     content/docs/keiki | head
   ```

   Then confirm each grepped identifier exists in the keiki source. The audit reports **0 missing**.

2. **The worked-example snippets compile-match jitsurei.** The EmailDelivery builder block on
   `reference/builder.mdx`, `how-to/ergonomic-emit.mdx`, and `walkthrough/.../08-builder-edge-body.mdx`
   matches `jitsurei/src/Jitsurei/EmailDelivery.hs` lines 153–168 character-for-character (modulo
   surrounding prose). The OrderCart tutorial's tally guard (`openCount .== lit 0`,
   `itemCount` via `.+`/`.-`) matches `jitsurei/src/Jitsurei/OrderCart.hs`.

3. **The model-owner pages render and are linkable.** Browsing
   `http://localhost:3000/docs/keiki/explanation/the-symtransducer` and
   `http://localhost:3000/docs/keiki/explanation/registers-vs-state` renders each page (with its
   `mermaid` diagram on the-symtransducer), and a link from another keiki page to either resolves
   without a crawler warning. These are the pages every other Phase-2 plan links to.

4. **The walkthrough tour is sidebar-navigable.** After the `walkthrough/meta.json` append, the
   "Core & Builder" tour appears nested under "Code Walkthrough" in the sidebar with its ten files
   in order, and navigating `00-start-here` → `01` … `09` works — **without** any hub `<Card href>`
   (that is EP-26's). No dead link is introduced.

5. **Build cleanliness.** `pnpm build` shows zero `unhandledRejection`/`Failed to fetch` lines, and
   `pnpm lint:links` exits 0. No relative `./`/`../` cross-links anywhere in the new pages:

   ```bash
   grep -RnE "\]\(\.\.?/" content/docs/keiki/explanation content/docs/keiki/reference \
     content/docs/keiki/how-to content/docs/keiki/tutorials content/docs/keiki/walkthrough/core-and-builder \
     && echo "FOUND relative links — fix them" || echo "no relative links"
   ```


## Idempotence and Recovery

Authoring MDX files is **additive and idempotent**: re-running the dev server or `pnpm build`
recomputes the same output, and re-writing a page from the template overwrites it cleanly. There
is no migration and nothing destructive.

The one place to be careful is the shared `meta.json` files: **append only**. Before editing a
section `meta.json`, re-read it — another Phase-2 plan running in parallel may have appended its
own slugs first. Never reorder or remove another plan's entries; only add your own (EP-26 owns the
final ordering pass). If a build fails with a crawler `Failed to fetch`, the cause is almost always
a link (or a `<Card href>`) to a page that does not yet exist: replace it with a link to the
existing section landing (`/docs/keiki/reference` or `/docs/keiki/explanation`) and name the
intended target in prose, exactly as the soft-dependency rule prescribes. Re-running `pnpm build`
after the fix is safe.

If you stop midway, the Progress checklist records which milestone is done; each milestone is
independently buildable, so you can resume by re-reading the named source module and continuing
with the next page. The walkthrough subdir and its `meta.json` can be (re)created at any time; the
`"core-and-builder"` entry in `walkthrough/meta.json` is safe to add once the subdir has real
chapter pages (adding it earlier, before the chapters exist, would make the sidebar list an empty
tour but is not destructive).


## Interfaces and Dependencies

This plan consumes the keiki source at the pinned commit `344c4ca` (resolve the path with
`mori registry show shinzui/keiki --full`) and the docs toolchain (`pnpm`, Node 22). It produces
MDX pages only; no Haskell is written or compiled. Every page below is named by its full path,
slug, scope, and source/test anchor.

### Pages authored (full path · slug · scope · anchor)

Explanations (under `content/docs/keiki/explanation/`):

- `the-symtransducer.mdx` · `the-symtransducer` · the `SymTransducer phi rs s ci co` model: four
  fields, five type parameters, the `Guarded` alias, GSM output widening, concrete (no-solver)
  evaluation · **Integration Point 5a owner**. Anchor `src/Keiki/Core.hs`.
- `registers-vs-state.mdx` · `registers-vs-state` · vertex `s` (finite control) vs register file
  `rs` (data memory), `emptyRegFile` uninit sentinels, the per-vertex B-view projection ·
  **Integration Point 5a owner**. Anchor `jitsurei/src/Jitsurei/UserRegistration.hs`.
- `guards-and-emit.mdx` · `guards-and-emit` · the `HsPred` fragment, structural vs opaque terms,
  `OPack` output invertibility, `solveOutput` recompute-and-verify. Anchor
  `docs/guide/output-invertibility.md`.

References (under `content/docs/keiki/reference/`):

- `core.mdx` · `core` · the `Keiki.Core` export surface (AST + evaluators + entry points). Anchor
  `src/Keiki/Core.hs`, `test/Keiki/CoreSpec.hs`.
- `builder.mdx` · `builder` · the `Keiki.Builder` DSL surface. Anchor `src/Keiki/Builder.hs`,
  `test/Keiki/BuilderSpec.hs`.
- `operators.mdx` · `operators` · the `.`-operator table + fixities + qualified-import recipe.
  Anchor `src/Keiki/Operators.hs`, `jitsurei/src/Jitsurei/LoanApplication.hs` (`approvalGuard`).
- `slots.mdx` · `slots` · the `IndexN`/`HasIndexN`/`Disjoint`/`Concat`/`Names` write-set machinery
  (internals). Anchor `src/Keiki/Internal/Slots.hs`.

How-tos (under `content/docs/keiki/how-to/`):

- `write-a-multi-event-command.mdx` · `write-a-multi-event-command` · multiple `emit`s, the
  single-snapshot rule, chunk vs streaming replay. Anchor `docs/guide/multi-event-commands.md`,
  `jitsurei/src/Jitsurei/UserRegistration.hs`, `UserRegistrationGSMSpec.hs`.
- `model-a-collection.mdx` · `model-a-collection` · tally vs promote-to-aggregate, the opaque-guard
  trap. Anchor `docs/guide/modeling-collections.md`, `jitsurei/src/Jitsurei/OrderCart.hs`.
- `ergonomic-emit.mdx` · `ergonomic-emit` · field-keyed `<Ctor>TermFields` vs `(*:)`/`oNil`,
  `emitWith` for ε. Anchor `docs/guide/output-invertibility.md`,
  `jitsurei/src/Jitsurei/EmailDelivery.hs`.
- `drop-down-to-the-ast.mdx` · `drop-down-to-the-ast` · hand-author `Edge`/`SymTransducer`, what you
  keep/lose. Anchor `docs/guide/ast-drop-down.md`, the `*AST` forms in jitsurei.

Tutorial (under `content/docs/keiki/tutorials/`):

- `a-multi-command-lifecycle.mdx` · `a-multi-command-lifecycle` · OrderCart happy path + branches;
  cross-links to EP-20's EmailDelivery getting-started. Anchor `jitsurei/src/Jitsurei/OrderCart.hs`,
  `OrderCartBuilderSpec.hs`.

Walkthrough (new subdir `content/docs/keiki/walkthrough/core-and-builder/`): `00-start-here.mdx`
plus `01-internal-slots.mdx` (`src/Keiki/Internal/Slots.hs`), `02-regfile-and-index.mdx`
(`Core.hs`; `CoreSpec`), `03-term-language.mdx`, `04-update-language.mdx`,
`05-output-and-predicate.mdx`, `06-edges-and-step-semantics.mdx` (`CoreSpec`),
`07-builder-three-layers.mdx` (`BuilderSpec`), `08-builder-edge-body.mdx`
(`jitsurei/.../UserRegistration.hs`, `UserRegistrationBuilderSpec.hs`),
`09-operators-and-namespacing.mdx` (`Operators.hs`;
`docs/guide/generic-lens-and-label-reads.md`), plus its own `meta.json`.

### meta.json edits (the append protocol)

Append only, never reorder/remove another plan's entries (EP-26 owns the final ordering pass):

- `content/docs/keiki/reference/meta.json` `pages` += `core`, `builder`, `operators`, `slots`.
- `content/docs/keiki/explanation/meta.json` `pages` += `the-symtransducer`, `registers-vs-state`,
  `guards-and-emit`.
- `content/docs/keiki/how-to/meta.json` `pages` += `write-a-multi-event-command`,
  `model-a-collection`, `ergonomic-emit`, `drop-down-to-the-ast`.
- `content/docs/keiki/tutorials/meta.json` `pages` += `a-multi-command-lifecycle`.
- new `content/docs/keiki/walkthrough/core-and-builder/meta.json` listing the ten chapter slugs in
  order.
- `content/docs/keiki/walkthrough/meta.json` `pages` += `core-and-builder`.

### The forward-link contract (ownership and cross-links)

- You **OWN** `explanation/the-symtransducer.mdx` and `explanation/registers-vs-state.mdx`
  (Integration Point 5a). Every other Phase-2 plan links to these rather than re-deriving the
  model, and EP-20's theory essays link *forward* to them. They must exist (M1) before any later
  page or sibling plan references them.
- You **append** `"core-and-builder"` to `walkthrough/meta.json` and author a real
  `00-start-here.mdx`, but you do **not** add a hub `<Card href>` — EP-26 adds the hub href in its
  finalization pass (Integration Point 2). Adding it now would emit a crawler `Failed to fetch`
  while the hub is still href-less elsewhere.
- `Keiki.Decider` is **EP-22's** (`reference/decider.mdx`,
  `explanation/decider-facade-and-when-to-use-it.mdx`). Present it only as a legacy/compatibility
  façade and cross-link to those pages; do **not** present `toDecider` as the default way to run an
  aggregate. The recommended surface is the transducer itself (`step`/`stepEither`/`delta`/`omega`/
  `reconstitute`). If those EP-22 pages are not yet authored when you link, point at the section
  landing `/docs/keiki/reference` (or `/docs/keiki/explanation`) and name the target in prose.
- `stepEither`/`StepFailure` appear in `reference/core.mdx` for completeness but are **deeply
  documented by EP-24** (diagnostics); cross-link to EP-24's diagnostics page, do not duplicate the
  per-failure taxonomy. Same fallback applies if EP-24's page is not yet authored.

### Types and functions that must exist at the end (used in this plan's pages)

From `Keiki.Core` (`src/Keiki/Core.hs`): `SymTransducer`, `Edge`, `RegFile`, `Index`/`(!)`,
`Term`/`NumOp`/`lit`/`proj`/`inpCtor`/`tadd`/`tsub`/`tmul`, `InCtor`, `Update`/`combine`/`UCombine`,
`WireCtor`/`OutFields`/`OPack`/`pack`/`(*:)`/`oNil`, `HsPred`/`Cmp`, the operators
`.==`/`./=`/`.<`/`.<=`/`.>`/`.>=`/`.&&`/`.||`/`pnot`/`.+`/`.-`/`.*`, `BoolAlg`/`Sat`,
`evalTerm`/`evalOut`/`evalPred`/`runUpdate`/`delta`/`omega`, `step`,
`stepEither`/`StepFailure`/`EdgeRef`, `applyEvent`/`applyEventStreaming`/`InFlight`/`applyEvents`/
`reconstitute`, `Guarded`. From `Keiki.Builder` (`src/Keiki/Builder.hs`): `buildTransducer`,
`from`, `onCmd`, `onEpsilon`, `slot`, `.=`/`=:`, `emit`/`emitWith`/`noEmit`/`ToOutFields`,
`requireGuard`/`requireEq`/`requireCmp`/`requireLt`/`requireLe`/`requireGt`/`requireGe`, `goto`,
`PayloadProj`. From `Keiki.Operators` (`src/Keiki/Operators.hs`): the re-exported operator set
(qualified-import shim). From `Keiki.Internal.Slots` (`src/Keiki/Internal/Slots.hs`):
`Concat`/`Member`/`Disjoint`/`Names`, `IndexN`/`IZ`/`IS`, `HasIndexN`, the `IsLabel` instance,
`indexNToInt`/`indexNName`.
