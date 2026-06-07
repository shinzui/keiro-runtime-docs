---
id: 23
slug: keiki-composition-process-managers-sagas-and-choreography
title: "Keiki composition: process managers, sagas, and choreography"
kind: exec-plan
created_at: 2026-06-07T04:53:26Z
master_plan: "docs/masterplans/3-keiki-framework-documentation-set.md"
---

# Keiki composition: process managers, sagas, and choreography

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, the keiki documentation set (under `content/docs/keiki/` in this
repository — a fumadocs + TanStack Start static-SPA + MDX site) gains a complete, accurate,
navigable slice for keiki's **composition algebra**: the way two or more aggregates are
**wired together** into a single, still-verifiable transducer. This is the **process
managers** capability the user named explicitly. A reader who lands on `/docs/keiki` and
follows the composition pages learns the one insight that unlocks the whole subject:

> A **process manager** (also called an orchestrator, a saga, a policy, or a reactor) is
> **just a transducer with its input and output alphabets flipped**. An *aggregate* consumes
> **Commands** and emits **Events** (`Commands → Events`). A process manager consumes
> **Events** and emits **Commands** (`Events → Commands`). Both are the *same kind of object*
> — a `SymTransducer` — and keiki's finite-state-transducer formalism does not distinguish
> them. So you author a process manager **exactly the way you author an aggregate** (with the
> `Keiki.Builder` DSL), then **compose** it into a multi-aggregate system with the same
> combinators you would use for any pipeline.

Concretely, a reader who follows this slice can:

- **understand** the `Events → Commands` symmetry and how each classic orchestration
  pattern — *choreography*, *process manager*, *saga / compensation*, *policy / reactor*,
  *feedback loop* — is **a specific chain of three composition combinators** (`compose`,
  `alternative`, `feedback1`), and why those three are the minimal closed set;

- **look up** the exact Haskell signatures and preconditions of `Keiki.Composition`
  (`Composite`, `compose`, `alternative`, `feedback1`, the `weaken`/`subst`/`lift` families,
  the n-ary injectors) and `Keiki.Profunctor` (`SomeSymTransducer`, the four variance
  combinators `lmapCi`/`lmapMaybeCi`/`rmapCo`/`dimapTransducer`, all six typeclass instances,
  `CategoryOverlapError`, and the **forward-only variance contract**) in **reference** pages;

- **complete how-to tasks**: compose two transducers (align the middle alphabets, satisfy the
  `Disjoint` slot-name constraint, verify the composite); model a saga with single-round
  compensation via `feedback1`; and **build a cross-context process** — author a process
  manager aggregate (Events in, Commands out, progress registers, an idempotency guard),
  bridge mismatched alphabets with `lmapMaybeCi`, chain it with `compose`, and run it durably
  by driving the underlying aggregates through the adapter functions;

- **read a deep code walkthrough** — an ordered, source-faithful tour over the real
  `keiki` source (`src/Keiki/Composition.hs`, `src/Keiki/Profunctor.hs`) and the capstone
  worked example (`jitsurei/src/Jitsurei/{CoreBankingSync,Loan,LoanWorkflow}.hs`), covering the
  composite vertex, weakening, the substitution that eliminates the middle alphabet, `compose`,
  the `Either`-lifters and `alternative`, `feedback1`, n-ary families, the existential wrapper
  and the profunctor/category/choice/strong/arrow instances, and the cross-context process tour.

Two caveats are documented **prominently** because they govern whether the reader uses the
library correctly:

1. **`compose` is lockstep, not asynchronous.** Every non-ε composite edge fires **both legs
   simultaneously** in one transition. A real cross-context flow is *asynchronous* (observe an
   approval, then a separate transactional step issues a command, then later a callback
   arrives). So a `compose` chain is largely a **type-level wiring diagram and a verification
   artifact**; the `Maybe`-returning adapters make an all-legs-aligned firing "essentially
   never." The way you actually *run* such a system is to drive each aggregate directly through
   the adapter functions — which is exactly what the capstone test does. The durable async loop
   itself is a **keiro runtime concern**, not a keiki one.

2. **`feedback1`'s stateless-aggregate restriction is real.** `feedback1` reduces to two stacked
   `compose`s and its slot-disjointness precondition collapses to "`rs1` disjoint from itself",
   which is satisfiable **only when the fed-back aggregate has no registers** (`rs1 ~ '[]`). The
   page presents this honestly and gives the workarounds (a stateless policy is the normal case;
   multi-round is nested `feedback1`; unbounded "until quiescence" belongs to keiro).

You can see it working by running the docs dev server (`pnpm dev`) — or a production build with
`pnpm build && pnpm start` — and browsing `http://localhost:3000/docs/keiki`: the composition
explanation, reference, how-to, and `walkthrough/composition/` pages appear in the sidebar in
`meta.json` order; Haskell snippets render in PragmataPro with ligatures; and the
composition/process-manager mermaid diagrams render interactively.

This is a **content** plan. It populates `content/docs/keiki/` only — it does not build the app,
the highlighter, the font, the Mermaid component, or the IA/template system (those are owned by
MasterPlan #1's plans, already complete). It documents keiki **as shipped at the pinned upstream
commit `344c4ca` (keiki 0.1.0.0)**: where the keiki repo's own `docs/research/*`,
`docs/historical/*`, and `docs/plans/*` notes diverge from the shipped code, this plan trusts the
**source**.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [x] M0. Preconditions verified (2026-06-06) — toolchain present, baseline `pnpm build` exits 0,
      EP-20 Complete, keiki source readable at `344c4ca`, the `walkthrough/composition/` subdir created.
- [x] M1. References + explanations authored (2026-06-06) (`reference/composition`,
      `reference/profunctor`, `explanation/process-managers-sagas-choreography-as-transducers`,
      `explanation/the-composition-algebra`). Lockstep-vs-async + forward-only-variance caveats present.
- [x] M2. How-to guides authored (2026-06-06) (`how-to/compose-two-transducers`,
      `how-to/model-a-saga-with-feedback` with the stateless-aggregate restriction stated honestly,
      `how-to/build-a-cross-context-process` with the verbatim `loanWorkflow` chain).
- [x] M3. Walkthrough authored under `walkthrough/composition/` (2026-06-06) (`00-start-here` + 11
      chapters) + its `meta.json`.
- [x] M4. meta.json appends done; `pnpm typecheck` clean; `pnpm build` exits 0 with zero crawler
      warnings; `pnpm lint:links` exits 0 (265 files); name audit passes. (2026-06-06)


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

- **Authoring agents can leak harness control tags into a file.** Six of the twelve composition
  walkthrough chapters were written with a trailing `</content>` (and one `</invoke>`) line — stray
  closing tags from the agent's tool-call format that bled into the file body. `pnpm build` failed
  with `Unexpected closing slash "/" in tag, expected an open tag first` at the end of each file. Fix:
  strip any line matching `^</(content|invoke|antml:…)>$`. Added a grep for stray harness tags to the
  per-plan acceptance routine so this is caught before the build for the remaining plans.
  Date: 2026-06-06


## Decision Log

Record every decision made while working on the plan.

- Decision: Frame the **entire** composition capability around the single insight that a
  **process manager is a transducer with its alphabets flipped** (`Aggregate: Commands → Events`
  vs `Process manager: Events → Commands`), and lead the two explanation pages with it.
  Rationale: this is the capability the user named explicitly ("type-safe aggregates and process
  managers"), and the keiki FST formalism genuinely does not distinguish the two — so the
  teaching payoff is that a reader authors a process manager with the *same* `Keiki.Builder` DSL
  they already learned for aggregates (EP-21), then wires it with the *same* combinators. The
  source confirms there is no separate "process manager" type; `jitsurei/.../CoreBankingSync.hs`
  is an ordinary `Guarded` transducer whose input alphabet is events and output alphabet is
  commands.
  Date: 2026-06-07
- Decision: Document the **lockstep-vs-async caveat** as a first-class hazard on the
  process-manager explanation, the cross-context how-to, and the capstone walkthrough chapter.
  The honest framing: `compose` builds a **type-level wiring diagram + verification artifact**;
  every non-ε composite edge fires both legs in one transition, which is *not* how real
  cross-context flows behave; you test and run the system by driving the aggregates **through the
  adapter functions** (as `jitsurei/test/Jitsurei/LoanWorkflowSpec.hs` does), and the durable
  async loop is a keiro runtime concern.
  Rationale: a reader who believes `compose` produces a runnable async orchestrator will build the
  wrong thing. The source (`compose` fuses two edges into one transition; the `lmapMaybeCi`
  adapters in `loanWorkflow` filter all-but-one input to `Nothing`) makes the lockstep reality
  unavoidable; documenting it prevents misuse.
  Date: 2026-06-07
- Decision: Present `feedback1`'s **stateless-aggregate restriction** honestly rather than
  glossing it. The precondition `Disjoint (Names rs1) (Names (Append rs2 rs1))` reduces to "`rs1`
  disjoint from itself", satisfiable only when `rs1 ~ '[]`. The how-to states this plainly and
  gives workarounds (stateless policy is the normal case; multi-round = nested `feedback1`;
  unbounded loops belong to keiro).
  Rationale: source-accurate. The combinator's type makes the constraint inescapable; hiding it
  would produce uncompilable examples.
  Date: 2026-06-07
- Decision: **Link** EP-21 (the `SymTransducer` model and `Guarded` alias) and EP-22 (the
  preserved derivations — `solveOutput`, `checkHiddenInputs`, single-valuedness) rather than
  re-deriving either. The composition pages assert *that* the three guarantees are preserved
  under composition and cross-link EP-22 for *why* each holds; they cross-link EP-21's
  `explanation/the-symtransducer.mdx` and `explanation/registers-vs-state.mdx` for the model.
  Rationale: MasterPlan #3 Integration Points 5 and 5a/5/6 assign these owners; duplicating the
  derivations would risk drift and violate the single-owner rule. Absolute links resolve once the
  target pages land.
  Date: 2026-06-07
- Decision: Document the composition subsystem **as shipped at commit `344c4ca` (keiki 0.1.0.0)**,
  trusting the source over the keiki repo's `docs/research/composition-combinators-design.md` and
  `docs/historical/*` notes where they diverge.
  Rationale: MasterPlan #3 standing decision; the notes predate the implementation.
  Date: 2026-06-07
- Decision: Own the `walkthrough/composition/` subdirectory (its own `meta.json`,
  `00-start-here`, and 11 numbered chapters), append `"composition"` to `walkthrough/meta.json`,
  and **not** add a walkthrough-hub `<Card href>` (EP-26 wires those in finalization).
  Rationale: MasterPlan #3 Integration Point 2 — a `<Card href>` to a not-yet-final hub trips the
  crawler; the disjoint-subdir rule lets the five Phase-2 plans run in parallel without colliding
  on a numbered sequence.
  Date: 2026-06-07


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

**Outcome (2026-06-06).** EP-23 is complete: 19 pages — two reference (`composition`, `profunctor`),
two explanations (`process-managers-sagas-choreography-as-transducers`, `the-composition-algebra`),
three how-tos (`compose-two-transducers`, `model-a-saga-with-feedback`, `build-a-cross-context-process`),
and the twelve-file `walkthrough/composition/` tour. The whole keiki tree builds clean (`pnpm build`
exit 0, zero crawler warnings) and link-checks (265 files); every quoted Haskell identifier was
audited against the pinned source `344c4ca`. The process-manager-as-flipped-transducer framing, the
lockstep-vs-async caveat, the forward-only variance contract, and `feedback1`'s stateless-aggregate
restriction are all documented prominently; the `loanWorkflow` capstone chain is quoted verbatim. The
only issue was the stray-harness-tag leak recorded in Surprises, fixed before the gate passed.


## Context and Orientation

Read this whole section before editing. It is written so that a novice with only this file and
the working tree can complete the work.

### What you are building

You are writing MDX content files under `content/docs/keiki/` in **this** repository
(`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`). The site is a **fumadocs** documentation
app (fumadocs-ui + fumadocs-mdx) built on **TanStack Start as a static SPA** (React 19 + MDX,
TypeScript, Tailwind v4, bundled with **Vite**), built and served with **pnpm** on **Node 22**.
`pnpm dev` runs the dev server; `pnpm build` emits a static SPA; `pnpm typecheck` runs
`fumadocs-mdx && tsc --noEmit`; `pnpm lint:links` checks internal links and must exit 0. Each
content directory has a `meta.json` whose `pages` array lists its child page slugs / nested
directory names in display order. A page is an `.mdx` file with YAML frontmatter (`title`,
`description`) followed by an MDX body.

The documented **code samples are Haskell** (the site is TypeScript; the subject is the Haskell
library **keiki**). Every Haskell snippet must use keiki's real, shipped API, transcribed below
and re-verifiable in the keiki source at commit `344c4ca`.

**Term definitions (define these in plain language on first use in the pages too):**

- **Transducer.** keiki's one formalism: `SymTransducer phi rs s ci co` — a finite-state machine
  whose edges are labelled by *predicates* (`phi`) over an infinite input domain and which
  carries a typed **register file** `rs` (data memory) alongside the finite control **state** `s`.
  It maps an input alphabet `ci` to an output alphabet `co`. EP-21 owns the canonical conceptual
  treatment (`explanation/the-symtransducer.mdx`, `explanation/registers-vs-state.mdx`); link to
  those rather than re-deriving the model.
- **`Guarded` alias.** keiki ships `type Guarded rs s ci co = SymTransducer (HsPred rs ci) rs s ci
  co` (in `src/Keiki/Core.hs`) — the everyday transducer shape where the predicate is the standard
  Haskell-predicate guard language. Quote this alias in the reference pages.
- **Aggregate.** A transducer that consumes **Commands** and emits **Events** (`ci = commands`,
  `co = events`). The "type-safe aggregates" heart is EP-21's subject.
- **Process manager (orchestrator / policy / reactor).** A transducer that consumes **Events** and
  emits **Commands** (`ci = events`, `co = commands`) — *the same kind of object as an aggregate,
  with the input/output alphabets flipped*. keiki ships **no separate process-manager type**.
- **Saga.** Vocabulary, not a separate primitive: a process manager whose edges include
  *compensating* commands (undo-style commands) on failure events. Single-round compensation also
  fits the `feedback1` combinator.
- **Choreography.** Two aggregates wired so one's events drive the other — exactly `compose t1 t2`.
- **Composition combinator.** A function that wires transducers into a bigger transducer. keiki
  ships exactly three (`compose`, `alternative`, `feedback1`) plus a profunctor variance layer.
- **Middle alphabet (`mid`).** In `compose t1 t2`, the output alphabet of `t1` *is* the input
  alphabet of `t2`; that shared type is the "middle" and it never escapes the composite.
- **Slot / register name.** Each register in `rs` has a type-level string name. Combining two
  transducers requires their register-name sets to be **`Disjoint`** so the merged register file
  has no name clashes.
- **Variance / profunctor combinator.** A function that reshapes a transducer's input or output
  alphabet *at the boundary* (rename, newtype, upcast, filter) without rebuilding its edges.
- **Adapter function.** A plain Haskell function (often `ci' -> Maybe ci`) that bridges one
  aggregate's alphabet to another's. `lmapMaybeCi` lifts such a function onto a transducer; the
  same functions are what you call to **drive** the aggregates at runtime.

### How this plan fits the master plan and its dependencies (reference by path only)

This plan is **EP-23** in `docs/masterplans/3-keiki-framework-documentation-set.md` (Phase 2, the
capability wave).

- **HARD DEP — EP-20**
  (`docs/plans/20-keiki-foundation-theory-getting-started-and-the-worked-example-spine.md`): the
  foundation. After EP-20 is **Complete**, these exist and you link into them: the `/docs/keiki`
  overview, the getting-started tutorial, the foundations/theory explanation essays, the
  `jitsurei` worked-example spine + canonical module map, `docs/keiki-source-sync.md` (the pinned
  `344c4ca` pointer), the walkthrough hub (`walkthrough/index.mdx`), and the shared authoring
  conventions (absolute cross-links; the jitsurei module map; the `walkthrough/` subdirectory
  layout; the section-`meta.json` append protocol). EP-20 lists `composition` as a walkthrough
  subdirectory. **Do not start before EP-20 is Complete** — verify in M0.
- **SOFT DEP — EP-21**
  (`docs/plans/21-keiki-transducer-core-and-authoring-aggregates.md`): the transducer core and the
  authoring DSL. A composite is built from the *same* `SymTransducer` model and `Guarded` alias
  EP-21 documents; a process manager is authored with the *same* `Keiki.Builder` DSL. Link to
  EP-21's `explanation/the-symtransducer.mdx` and `explanation/registers-vs-state.mdx` (absolute)
  rather than re-deriving the model. Soft because this plan is self-contained.
- **SOFT DEP — EP-22**
  (`docs/plans/22-keiki-derivations-decider-acceptors-projections-and-generics.md`): the
  derivations. Composition **preserves** the three derivations — `solveOutput` (replay /
  output-solving), `checkHiddenInputs`, and single-valuedness (`isSingleValuedSym`). This plan
  asserts *that* they are preserved and cross-links EP-22's pages for *why*; it does not re-derive
  them. Soft.

Because EP-21 and EP-22 are soft deps, author your cross-links now (absolute); they light up once
those pages exist.

### The shared content tree and the meta.json append protocol (read carefully)

`content/docs/keiki/**` + `meta.json` is the shared keiki content tree. EP-20 structured it. The
current shape (verified) is:

```text
content/docs/keiki/
  index.mdx                meta.json          faq.mdx
  tutorials/   index.mdx   meta.json
  how-to/      index.mdx   meta.json
  reference/   index.mdx   meta.json
  explanation/ index.mdx   meta.json
  cookbook/    index.mdx   meta.json
  walkthrough/ index.mdx   meta.json   (title "Code Walkthrough")
```

The top-level `content/docs/keiki/meta.json` already lists the sections — **do not touch it**.
**Rule (shared with the other Phase-2 plans):** this plan **appends only its own page slugs** to
the relevant section `meta.json` `pages` array; it never reorders or removes another plan's
entries. **EP-26 owns the final ordering pass.** So in M4 you append EP-23's slugs after whatever
entries are already present — you do not rewrite the arrays from scratch. The exact appends are
listed in **Interfaces and Dependencies**.

The `walkthrough/` tree gives each Phase-2 plan a **disjoint subdirectory** with its own
`meta.json`, so parallel plans never collide on a numbered sequence. EP-23 owns
`walkthrough/composition/`. You create `walkthrough/composition/meta.json`, author its
`00-start-here.mdx` + 11 chapters, and ensure the string `"composition"` appears in
`content/docs/keiki/walkthrough/meta.json`'s `pages` array. You do **not** add a walkthrough-hub
`<Card href>` for the composition tour — **EP-26** wires those in finalization (a `<Card href>` to
a not-yet-final hub trips the prerender crawler).

### The Diátaxis templates (copy the matching one)

The repo ships copy-me MDX templates under `content/docs/_templates/`: `tutorial.mdx`,
`how-to.mdx`, `reference.mdx`, `explanation.mdx`, `code-walkthrough.mdx`, `cookbook-recipe.mdx`,
`faq.mdx`, `theory-explainer.mdx`. Match each page to its mode and copy that template's frontmatter
+ section skeleton, then fill it. Prefer fumadocs-ui built-ins (`Callout`, `Steps`, `Tabs`,
`Cards`/`Card`, `TypeTable`) — they are registered globally, so **author them bare, with no
`import` lines** (this matches every existing keiro/keiki page). Diátaxis modes:

- **Explanation** (understanding-oriented): discursive background and rationale; no steps; at least
  one ` ```mermaid ` diagram.
- **Reference** (information-oriented): dry, exhaustive, accurate; `<TypeTable>` for fields; one
  subsection per type/operation; signatures copied **verbatim** from source, never paraphrased.
- **How-To Guide** (task-oriented): solves one real problem for someone who knows the basics.
- **Code walkthrough**: an ordered tour over the real source; numeric-prefixed pages (`00-…`,
  `01-…`); a `<Callout>` at the top of each chapter linking back to `00-start-here`; excerpts with
  the source path noted above each block.

### Fence/formatting rules (hard requirement)

Every fenced code block MUST carry a language tag: ` ```haskell ` for Haskell, ` ```text ` for
trees/transcripts, ` ```mdx ` for MDX page bodies, ` ```json ` for `meta.json`, ` ```mermaid ` for
diagrams, ` ```bash ` for shell. Never write a bare ```` ``` ````. Include at least one
` ```mermaid ` diagram per explanation page and ligature-bearing Haskell operators (`->`, `=>`,
`<-`, `::`, `>>=`, `<$>`) in snippets so the font/highlighter pipeline is exercised. Do not
reformat existing files; match the neighbouring `content/docs/keiro/*` style (hand-authored MDX in
this repo does not pass `oxfmt --check` cleanly repo-wide — that is expected; do not "fix" it).

### The subject: keiki's composition algebra, transcribed from source (use these REAL names)

Source of truth on disk (read-only — do **not** edit it): `/Users/shinzui/Keikaku/bokuno/keiki`,
pinned at commit `344c4ca` (confirm with `cd /Users/shinzui/Keikaku/bokuno/keiki && git rev-parse
HEAD`; resolve the path with `mori registry show shinzui/keiki --full`). The composition modules
live at `src/Keiki/Composition.hs` and `src/Keiki/Profunctor.hs`; the keiki package's own tests are
under `test/Keiki/`; the worked-example package `jitsurei` lives **inside** the keiki repo at
`jitsurei/`. The facts below are transcribed verbatim at `344c4ca`. Treat this as your API
cheat-sheet; open the source to confirm a detail.

**Recall the everyday transducer shape (from `src/Keiki/Core.hs`):**

```haskell
type Guarded rs s ci co = SymTransducer (HsPred rs ci) rs s ci co
```

#### `Keiki.Composition` (`src/Keiki/Composition.hs`) — the three combinators

The composite control state is a strict product vertex:

```haskell
data Composite s1 s2 = Composite !s1 !s2
```

`Composite` carries hand-rolled `Bounded`, a **column-major** `Enum`, and a `NoThunks` instance —
hand-rolled to avoid the orphan instances a derived enumeration would require. (The walkthrough
explains why column-major; the reference need only note the instances exist.)

The three combinators, with their **full** signatures and constraints (quote verbatim in the
reference):

```haskell
compose
  :: (WeakenR rs1, Disjoint (Names rs1) (Names rs2))
  => SymTransducer (HsPred rs1 ci1) rs1 s1 ci1 mid
  -> SymTransducer (HsPred rs2 mid) rs2 s2 mid co
  -> SymTransducer (HsPred (Append rs1 rs2) ci1) (Append rs1 rs2) (Composite s1 s2) ci1 co

alternative
  :: (WeakenR rs1, Disjoint (Names rs1) (Names rs2))
  => SymTransducer (HsPred rs1 ci1) rs1 s1 ci1 co1
  -> SymTransducer (HsPred rs2 ci2) rs2 s2 ci2 co2
  -> SymTransducer (HsPred (Append rs1 rs2) (Either ci1 ci2)) (Append rs1 rs2)
       (Composite s1 s2) (Either ci1 ci2) (Either co1 co2)

feedback1
  :: ( WeakenR rs1, WeakenR rs2
     , Disjoint (Names rs2) (Names rs1)
     , Disjoint (Names rs1) (Names (Append rs2 rs1)) )
  => SymTransducer (HsPred rs1 ci) rs1 s1 ci co
  -> SymTransducer (HsPred rs2 co) rs2 s2 co ci
  -> SymTransducer (HsPred (Append rs1 (Append rs2 rs1)) ci) (Append rs1 (Append rs2 rs1))
       (Composite s1 (Composite s2 s1)) ci co

-- defined as:
feedback1 t f = compose t (compose f t)
```

**`compose` = SEQUENTIAL composition (choreography / pipeline).** `t1`'s output alphabet `mid` is
`t2`'s input alphabet; their slot-name sets must be `Disjoint`; the `WeakenR rs1` instance lifts
`t2`'s register reads across the `rs1` prefix so they index into the merged register file. It
**fuses two stages into one transition** (composite input `ci1`, composite output `co`; `mid`
never escapes). The composite vertex is `Composite s1 s2`; the merged registers are `Append rs1
rs2`. For each `t1`-edge × `t2`-edge it builds a composite edge whose guard is `PAnd
(weakenLPred g1) (substPred g2 o1)`, whose update is `UCombine (weakenLUpdate u1) (substUpdate u2
o1)`, and whose output is `substOut o2 o1`. `t1` ε-edges (silent, no output) become composite
ε-edges that advance only `s1`; multi-event `t1` edges drive a `PartialPath`/`expandPaths` chain
expansion (this subsumes the Kleisli/sequential composition of the older `crem` design). The
**substitution core** is `substTerm`: it rewrites a `t2` term `TInpCtorField ic2 ix2` into a
*structural read of `t1`'s output fields* at index `ix2` when `icName ic2 == wcName wc1` (the
constructor names match); a mismatch collapses to `PBot`/error. `substOut` re-tags the composite's
output package (`OPack`) with `t1`'s input constructor so the preserved `solveOutput` derivation
can rebuild `ci1`.

**`alternative` = disjoint-input dispatch (sibling aggregates).** No middle-alphabet alignment.
`Left ci1` routes to `t1` (with `s2` frozen); `Right ci2` routes to `t2` (with `s1` frozen).
Independent parallel state lives on a **product** vertex `Composite s1 s2`. `isFinal` requires
**both** arms final. Cross-arm single-valuedness is *vacuous*: `leftInCtor`/`rightInCtor` make a
`Left` guard unsatisfiable on a `Right` input and vice versa.

**`feedback1` = single-step feedback (aggregate ↔ stateless policy).** One round per external
command: `aggregate → policy → aggregate`, emitting the **second** `co`. The **hard** constraint
`Disjoint (Names rs1) (Names (Append rs2 rs1))` reduces to "`rs1` disjoint from itself", which is
satisfiable **only when `rs1 ~ '[]`** — i.e. the fed-back aggregate `t` must be **stateless** (no
registers). The policy `f` *may* be stateful but usually is not. Multi-round feedback is
**nested**: `feedback1 (feedback1 t f) f`. There is no `feedbackN`. Unbounded "run until
quiescence" is a **keiro runtime** concern, not a `feedback1` one.

**N-ARY composition.** Sequential composition folds left: `compose (compose t1 t2) t3` gives vertex
`Composite (Composite s1 s2) s3`. To wire transducers that each carry several event families, the
module ships injectors that thread a family into the right place in a right-nested `Either` sum:
`wireCtor3At{1,2,3}`, `inCtor3At{1,2,3}`, `outTerm3At{1,2,3}`. **Name-uniqueness obligation:**
`solveOutput` matches by `icName`/`wcName` *string equality*, so summed families must have
**pairwise-distinct constructor names**.

**Advanced surface exposed (walkthrough-relevant).** The `WeakenR` class plus the
`weakenL*`/`weakenR*` family; the substitution family `substTerm`/`substPred`/`substUpdate`/
`substOut`/`substOutFields`; the `Either`-lifters `leftInCtor`/`rightInCtor`/`leftWireCtor`/
`rightWireCtor` and the `liftL*Alt`/`liftR*Alt` family. **Internal (walkthrough only):** the
`PartialPath` existential and `SomeTerm`/`nthTerm`/`unsafeCoerceTerm`.

#### `Keiki.Profunctor` (`src/Keiki/Profunctor.hs`) — the existential wrapper + variance

To put a transducer into the standard Haskell `Profunctor`/`Category`/`Choice`/`Strong`/`Arrow`
hierarchy, keiki hides the register-file and state type parameters behind an existential wrapper
that exposes only the input/output alphabets (`ci`/`co`):

```haskell
data SomeSymTransducer ci co where
  SomeSymTransducer
    :: (WeakenR rs, KnownSlotNames rs, Bounded s, Enum s)
    => SymTransducer (HsPred rs ci) rs s ci co
    -> SomeSymTransducer ci co
  SomeSymIdentity :: SomeSymTransducer a a
```

`SomeSymIdentity` is a **sentinel** for `Cat.id`: a *generic* identity transducer cannot satisfy
`compose`'s `icName == wcName` substitution requirement (it has no constructor names to match), so
`Cat.id` is represented as this sentinel and short-circuited in `(.)`.

**Standalone variance combinators** operate on the concrete `SymTransducer` (not the wrapper):

```haskell
lmapCi      :: (ci' -> ci)       -> SymTransducer (HsPred rs ci) rs s ci co
                                 -> SymTransducer (HsPred rs ci') rs s ci' co
lmapMaybeCi :: (ci' -> Maybe ci) -> SymTransducer (HsPred rs ci) rs s ci co
                                 -> SymTransducer (HsPred rs ci') rs s ci' co  -- the filtering adapter
rmapCo      :: (co -> co')       -> SymTransducer (HsPred rs ci) rs s ci co
                                 -> SymTransducer (HsPred rs ci) rs s ci co'
dimapTransducer :: (ci' -> ci) -> (co -> co')
                                 -> SymTransducer (HsPred rs ci) rs s ci co
                                 -> SymTransducer (HsPred rs ci') rs s ci' co'

identityTransducer :: SymTransducer (HsPred '[] a) '[] IdVertex a a
arrTransducer      :: (a -> b) -> SymTransducer (HsPred '[] a) '[] IdVertex a b

data CategoryOverlapError = CategoryOverlapError { coeSlots :: [String] }  -- an Exception
```

`lmapMaybeCi` is **THE workflow bridge**: a `ci' -> Maybe ci` both **renames/upcasts** and
**filters** — inputs mapped to `Nothing` are dropped, which is how a process manager observes only
the events it cares about.

**Typeclass instances (all on `SomeSymTransducer`):**

- `Profunctor` — `dimap`/`lmap`/`rmap` delegate to `dimapTransducer`/`lmapCi`/`rmapCo`.
- `Functor` — `fmap = rmap`.
- `Category` — `id = SomeSymIdentity`; `(.)` short-circuits the sentinel, else calls
  `composeWrappers`, which performs a **runtime slot-overlap check** and either raises
  `CategoryOverlapError` or proceeds via `unsafeCoerceDisjointness` + `compose`.
- `Choice` — `left' = alternative t identityTransducer`; `right' = alternative identity t`.
- `Strong` — `first' = firstSym t`; `second' = lmapCi swap . rmapCo swap . firstSym`.
- `Arrow` — `arr = arrTransducer`; `first`/`second` delegate to `Strong`.

**The FORWARD-ONLY variance contract (document prominently in the reference + walkthrough).**
`lmapCi` poisons `icBuild` and `rmapCo` sets `wcMatch = const Nothing`, so the preserved
`solveOutput`/replay derivation becomes **lossy on rewritten edges** (the forward `delta`/`omega`
semantics are unaffected). Two consequences: (1) `Choice` **preserves** the `solveOutput`
round-trip because it is built on `alternative` + `identity` over `rs ~ '[]`, not on the lossy
maps; (2) `arr f >>> arr g` does **not** fuse — `arrTransducer`'s `WireCtor "arr"` does not match
the next stage's `"Identity"` read, so the substitution collapses to `PBot`; use `arr` standalone,
not chained through `compose`.

**Internal AST rewriters (walkthrough only):** `contraInCtor`/`contraTerm`/`contraPred`/
`contraUpdate`/`contraOutTerm`, `mapWireCtor`, and `firstSym`/`firstInCtor`/`firstWireCtor`.

**What each categorical instance buys (use to motivate the reference subsections):**

- **Profunctor** — reshape the input/output alphabet at the boundary (rename / newtype / upcast)
  without rebuilding edges; **forward-only**.
- **Category** — pipeline `t3 . t2 . t1`; id laws by the sentinel; runtime slot-overlap check.
- **Choice** — `Either` routing: dispatch a sum slice to a specific aggregate, identity passes the
  other arm; **preserves `solveOutput`**.
- **Strong** — thread an unrelated value (correlation ids / metadata) `(ci, c) -> (co, c)`; lossy
  `solveOutput`.
- **Arrow** — lift a pure function (an adapter) with `arr`; `arr` does not fuse through `compose`.

#### Process managers, sagas, and choreography as transducers (the framing)

Background note: `docs/historical/orchestration-sagas-choreography-and-feedback-loops-as-transducers.md`
(history — trust the source). The **core insight**: an aggregate is `Commands → Events`; an
orchestrator / process manager / saga / policy is `Events → Commands`. Both are transducers; the
FST formalism does not distinguish them. The mapping from orchestration pattern to combinator chain:

- **Choreography** = `compose t1 t2`. The composition *is* the choreography. Anchor:
  `test/Keiki/CompositionSpec.hs` (`AlertSource ⨾ EmailDelivery`).
- **Process manager** = a stateful transducer `Events_A → Commands_B`; the full system is
  `compose A (compose pm B)`. **The textbook PM is `jitsurei/src/Jitsurei/CoreBankingSync.hs`**:
  its `SyncInput` alphabet is *events* (`LoanCreatedIn`, `LegacyCallbackReceivedIn`) and its
  `SyncOutput` alphabet is an audit record (`SyncToLegacyRequested`) plus a *command*
  (`LegacyAssignmentCommanded` wrapping a `LoanCmd'`); it keeps `SyncRegs` progress state across
  `SyncIdle`/`SyncRequested`/`SyncSettled` vertices and is idempotent by the terminal
  `SyncSettled` vertex plus a `requireEq d.loanId #syncPendingLoanId` guard.
- **Saga / compensation** = a transducer with failure → compensation edges; single-round
  compensation also fits `feedback1`. Anchor: `test/Keiki/CompositionFeedback1Spec.hs` (a toggle ↔
  echo feedback pair).
- **Policy / reactor** = a one-vertex `Event → Maybe Command` transducer (the `f` argument to
  `feedback1`).
- **Feedback loop** = one round of `feedback1`; multi-round = nested; unbounded "until quiescence"
  is a keiro runtime concern, not `feedback1`.

**THE CAPSTONE — `jitsurei/src/Jitsurei/LoanWorkflow.hs`, the `loanWorkflow` value (quote verbatim;
verified at `344c4ca`):**

```haskell
loanWorkflow =
  loanApplication
    `compose`
  lmapMaybeCi loanEventToSyncInput
    (coreBankingSync `compose` lmapMaybeCi syncOutputToLoanCmd loan)
```

It is a **3-aggregate `compose` chain** — `LoanApplication ⨾ CoreBankingSync ⨾ Loan` — joined by
two `lmapMaybeCi` adapters that **bridge mismatched alphabets AND filter**:
`loanEventToSyncInput` maps only `ApplicationApproved → LoanCreatedIn` (everything else →
`Nothing`), and `syncOutputToLoanCmd` unwraps only `LegacyAssignmentCommanded`.

**CRITICAL CAVEAT (document prominently).** `compose` is **lockstep**: every non-ε composite edge
fires **both legs simultaneously**. Real cross-context flows are **asynchronous** (observe an
approval → a separate transactional step issues a command → a later callback settles it). So the
composite is largely a **type-level wiring diagram + verification artifact**; the `Maybe`-adapters
make an all-legs-aligned firing "essentially never." `jitsurei/test/Jitsurei/LoanWorkflowSpec.hs`
drives each aggregate **directly through the adapter functions** — which is exactly how the runtime
behaves. **Teaching point:** keiki composition gives you the formal wiring + verification; a durable
**async** process manager runs through **keiro**, driving aggregates via the adapter functions.
Supporting anchors: `jitsurei/test/Jitsurei/LoanSpec.hs` (downstream `Loan` replay),
`jitsurei/test/Jitsurei/CoreBankingSyncSpec.hs` (PM happy path, idempotent duplicate-callback
replay, mismatched-`loanId` guard).

### The jitsurei worked example (anchor pages to these — verified at `344c4ca`)

`jitsurei` is the runnable worked-example package **inside** the keiki repo
(`/Users/shinzui/Keikaku/bokuno/keiki/jitsurei/`). EP-20 introduces it and owns the canonical
module map; this plan reuses the composition rows:

- **`jitsurei/src/Jitsurei/CoreBankingSync.hs`** + `jitsurei/test/Jitsurei/CoreBankingSyncSpec.hs`
  — the textbook process manager (events in, commands out).
- **`jitsurei/src/Jitsurei/Loan.hs`** + `jitsurei/test/Jitsurei/LoanSpec.hs` — the downstream
  aggregate the PM commands.
- **`jitsurei/src/Jitsurei/LoanApplication.hs`** — the upstream aggregate whose `ApplicationApproved`
  event triggers the chain (also EP-21/EP-24's symbolic anchor; reuse, do not re-document).
- **`jitsurei/src/Jitsurei/LoanWorkflow.hs`** + `jitsurei/test/Jitsurei/LoanWorkflowSpec.hs` — the
  3-stage `compose` + `lmapMaybeCi` capstone.

The keiki package's own composition/profunctor tests (anchors for the reference + walkthrough)
live under `test/Keiki/`: `CompositionSpec.hs`, `CompositionAlternativeSpec.hs`,
`CompositionFeedback1Spec.hs`, `CompositionMultiEventSpec.hs`, `CompositionNarySpec.hs`,
`ProfunctorSpec.hs`, `CategorySpec.hs`, `ChoiceSpec.hs`, `StrongSpec.hs`, `ArrowSpec.hs`.


## Plan of Work

The work is grouped into milestones, each independently verifiable by building the site and viewing
the pages. Author pages in IA order; the final milestone wires the `meta.json` files and runs the
full acceptance checks. Every page goes under `content/docs/keiki/`.

**Page set and file map.** Each entry gives the file path, slug, Diátaxis type (→ template), the
keiki source/test it documents, and the key snippet/diagram it must contain.

| File (under `content/docs/keiki/`) | Diátaxis → template | Documents (source) | jitsurei/test anchor |
|---|---|---|---|
| `reference/composition.mdx` | Reference | `Keiki.Composition` | `test/Keiki/CompositionSpec.hs`, `CompositionNarySpec.hs` |
| `reference/profunctor.mdx` | Reference | `Keiki.Profunctor` | `test/Keiki/ProfunctorSpec.hs` |
| `explanation/process-managers-sagas-choreography-as-transducers.mdx` | Explanation | the `Events → Commands` framing | `jitsurei/.../CoreBankingSync.hs`, `test/Keiki/CompositionFeedback1Spec.hs` (+ `LoanWorkflowSpec.hs`) |
| `explanation/the-composition-algebra.mdx` | Explanation | the minimal closed set + preserved guarantees | `docs/research/composition-combinators-design.md`, `test/Keiki/CompositionMultiEventSpec.hs` |
| `how-to/compose-two-transducers.mdx` | How-To | `compose` + `Disjoint` | `test/Keiki/CompositionSpec.hs` |
| `how-to/model-a-saga-with-feedback.mdx` | How-To | `feedback1` | `test/Keiki/CompositionFeedback1Spec.hs` |
| `how-to/build-a-cross-context-process.mdx` | How-To | PM authoring + `lmapMaybeCi` + `compose` | `jitsurei/.../{CoreBankingSync,Loan,LoanWorkflow}.hs`, `LoanWorkflowSpec.hs` |
| `walkthrough/composition/00-start-here.mdx` … `11-…` | Walkthrough | `src/Keiki/{Composition,Profunctor}.hs` + capstone | per-chapter (below) |
| `walkthrough/composition/meta.json` | (sidebar config) | — | the 12 entries in order |

**Page slugs (verbatim — used in the meta.json appends in M4):**

- `reference/` += `composition`, `profunctor`
- `explanation/` += `process-managers-sagas-choreography-as-transducers`, `the-composition-algebra`
- `how-to/` += `compose-two-transducers`, `model-a-saga-with-feedback`, `build-a-cross-context-process`
- `walkthrough/` += `composition` (the subdirectory)

### Milestones

- **M0 — Preconditions.** Confirm the toolchain runs, EP-20 has landed (its pages and conventions
  exist), and the keiki source is readable at `344c4ca`. At the end: `pnpm build` succeeds on the
  current tree before you add any EP-23 page, and the `walkthrough/composition/` subdir exists.
  Acceptance: see Concrete Steps.

- **M1 — References + explanations** (`reference/composition.mdx`, `reference/profunctor.mdx`,
  `explanation/process-managers-sagas-choreography-as-transducers.mdx`,
  `explanation/the-composition-algebra.mdx`). At the end: all four pages render. The two
  explanations **lead with the `Events → Commands`/flipped-alphabet framing**; the references quote
  signatures **verbatim** from `src/Keiki/{Composition,Profunctor}.hs`. Acceptance: every signature
  copy-exact from §Context; `<TypeTable>`s list `Composite`/`SomeSymTransducer`/`CategoryOverlapError`
  fields; each explanation carries a ` ```mermaid `; the lockstep-vs-async caveat and the preserved
  three guarantees appear; EP-21/EP-22 cross-links are absolute.

- **M2 — How-to guides** (`how-to/compose-two-transducers.mdx`, `how-to/model-a-saga-with-feedback.mdx`,
  `how-to/build-a-cross-context-process.mdx`). At the end: each solves its one task end-to-end with
  real-API snippets. `compose-two-transducers` aligns mid-alphabets and satisfies `Disjoint`;
  `model-a-saga-with-feedback` states the stateless-aggregate restriction honestly with workarounds;
  `build-a-cross-context-process` authors a PM aggregate, bridges with `lmapMaybeCi`, chains with
  `compose`, and **drives through the adapter functions at runtime (lockstep caveat)**. Acceptance:
  the `loanWorkflow` snippet matches `jitsurei/src/Jitsurei/LoanWorkflow.hs`; build clean.

- **M3 — Walkthrough** (`walkthrough/composition/` + its `meta.json`). At the end: `00-start-here`
  plus 11 numbered chapters build; `00-start-here` carries a `<Cards>` overview and a ` ```mermaid `;
  every chapter's top `<Callout>` links back to `00-start-here` (absolute) and notes its real source
  path; chapters cite the test anchors listed below. Acceptance: navigable; chapter 11 reproduces the
  `loanWorkflow` snippet + the lockstep caveat.

- **M4 — meta.json appends + full acceptance.** Append EP-23's slugs to the section `meta.json`
  files, create `walkthrough/composition/meta.json`, ensure `"composition"` is in
  `walkthrough/meta.json`. Then `pnpm typecheck` clean, `pnpm build` exits 0 with zero crawler
  warnings, `pnpm lint:links` exits 0. Acceptance: see Validation and Acceptance.

**The walkthrough chapter list (12 files; ordered; each cites the noted source + test anchor):**

1. `00-start-here.mdx` — "00 — Start here": what the tour covers; an overview ` ```mermaid `; a
   `<Cards>` block linking the 11 chapters (absolute hrefs).
2. `01-composite-vertex.mdx` — `Composite` + its hand-rolled `Bounded`/column-major `Enum`/`NoThunks`
   (source: `src/Keiki/Composition.hs`). Anchor: `CompositionSpec`.
3. `02-weakening.mdx` — the `WeakenR` class + the `weakenL*`/`weakenR*` family (how `t2`'s reads lift
   across the `rs1` prefix). Anchor: `CompositionSpec`.
4. `03-substitution.mdx` — `substTerm`/`substPred`/`substUpdate`/`substOut` mid-elimination; the
   `icName == wcName` invariant and the `unsafeCoerce` justification. Anchor: `CompositionSpec`.
5. `04-compose.mdx` — `epsilonEdge`/`productEdge`; multi-event `PartialPath`/`expandPaths`/`stepPath`/
   `finalizePath`. Anchors: `CompositionSpec`, `CompositionMultiEventSpec`.
6. `05-either-lifters-and-alternative.mdx` — `leftInCtor`/`liftL*Alt` + `alternative`'s
   `liftEdgeL`/`liftEdgeR`. Anchor: `CompositionAlternativeSpec`.
7. `06-feedback1.mdx` — the two-stacked-`compose` reduction + the stateless-aggregate constraint.
   Anchor: `CompositionFeedback1Spec`.
8. `07-nary-families.mdx` — `wireCtor3At*`/`inCtor3At*`/`outTerm3At*` + the name-uniqueness
   obligation. Anchor: `CompositionNarySpec`.
9. `08-existential-wrapper-and-profunctor.mdx` — `SomeSymTransducer`, the variance combinators, the
   forward-only caveat, the AST rewriters. Anchor: `ProfunctorSpec`.
10. `09-category-and-overlap-check.mdx` — the `SomeSymIdentity` sentinel, `composeWrappers`, the
    runtime overlap check + `unsafeCoerceDisjointness`. Anchor: `CategorySpec`.
11. `10-choice-strong-arrow.mdx` — `left'`/`right'` via `alternative` + identity; `firstSym`;
    `arrTransducer`; `arr` non-fusion. Anchors: `ChoiceSpec`, `StrongSpec`, `ArrowSpec`.
12. `11-cross-context-process-tour.mdx` — read `CoreBankingSync` (the PM) → `Loan` → `LoanWorkflow`
    (the 3-stage `compose` with `lmapMaybeCi` adapters) + the lockstep-vs-async caveat. Anchor:
    `jitsurei/test/Jitsurei/LoanWorkflowSpec.hs`.


## Concrete Steps

Run all commands from the repo root `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` unless
stated otherwise. The docs toolchain is **pnpm** on **Node 22**.

### M0 — Preconditions

```bash
# confirm the scaffold + EP-20 foundation are present
test -f content/docs/keiki/index.mdx && echo "EP-20 overview present"
test -f docs/keiki-source-sync.md && echo "EP-20 source pointer present"
test -f content/docs/keiki/walkthrough/index.mdx && echo "EP-20 walkthrough hub present"
test -d content/docs/_templates && echo "templates present"

# install + verify the current tree builds before you start
pnpm install
pnpm build
pnpm lint:links
```

Expected (abridged):

```text
EP-20 overview present
EP-20 source pointer present
EP-20 walkthrough hub present
templates present
✓ built in <N>s
```

If the EP-20 artifacts are missing, EP-20 is not Complete — stop and finish EP-20 first (HARD DEP).
If `pnpm build` or `pnpm lint:links` fails on the current tree, fix that before adding pages.

Resolve the keiki source path and confirm the pinned commit + the composition modules:

```bash
mori registry show shinzui/keiki --full   # Path: /Users/shinzui/Keikaku/bokuno/keiki
cd /Users/shinzui/Keikaku/bokuno/keiki && git rev-parse HEAD
# expect: 344c4cadd55e0b997cc2c6ce0ab687851d66fa31
ls src/Keiki/Composition.hs src/Keiki/Profunctor.hs
ls jitsurei/src/Jitsurei/CoreBankingSync.hs jitsurei/src/Jitsurei/Loan.hs \
   jitsurei/src/Jitsurei/LoanWorkflow.hs jitsurei/src/Jitsurei/LoanApplication.hs
ls test/Keiki/CompositionSpec.hs test/Keiki/ProfunctorSpec.hs test/Keiki/CategorySpec.hs \
   test/Keiki/ChoiceSpec.hs test/Keiki/StrongSpec.hs test/Keiki/ArrowSpec.hs \
   test/Keiki/CompositionAlternativeSpec.hs test/Keiki/CompositionFeedback1Spec.hs \
   test/Keiki/CompositionMultiEventSpec.hs test/Keiki/CompositionNarySpec.hs
ls jitsurei/test/Jitsurei/CoreBankingSyncSpec.hs jitsurei/test/Jitsurei/LoanSpec.hs \
   jitsurei/test/Jitsurei/LoanWorkflowSpec.hs
```

Create the composition walkthrough subdirectory you will populate (idempotent):

```bash
mkdir -p content/docs/keiki/walkthrough/composition
```

### M1 — References + explanations

Copy `content/docs/_templates/reference.mdx` and `content/docs/_templates/explanation.mdx`. Author
bare components (no imports). Copy signatures **verbatim** from §Context (cross-check against the
source files named there).

- **`reference/composition.mdx`** — `title: "Keiki.Composition"`. One subsection per type/operation:
  `Composite` (note the hand-rolled `Bounded`/column-major `Enum`/`NoThunks`), `compose`,
  `alternative`, `feedback1` (each with its full signature + a plain-English statement of every
  constraint, especially `feedback1`'s "satisfiable only when `rs1 ~ '[]`"), the `WeakenR` +
  `weakenL*`/`weakenR*` family, the `subst*` family, the `Either`-lifters, and the n-ary injectors
  (`wireCtor3At*`/`inCtor3At*`/`outTerm3At*` + the name-uniqueness obligation). Open by quoting the
  `Guarded` alias from `src/Keiki/Core.hs` and link EP-21's `the-symtransducer.mdx`. State that
  `compose`/`alternative`/`feedback1` each **preserve** `solveOutput`, `checkHiddenInputs`, and
  single-valuedness, and link EP-22 for why.

- **`reference/profunctor.mdx`** — `title: "Keiki.Profunctor"`. Subsections: `SomeSymTransducer`
  (the GADT + the `SomeSymIdentity` sentinel), `lmapCi`, `lmapMaybeCi` (flag it as **the workflow
  bridge**), `rmapCo`, `dimapTransducer`, `identityTransducer`/`arrTransducer`,
  `CategoryOverlapError` (a `<TypeTable>` for `coeSlots`), and the six instances
  (`Profunctor`/`Functor`/`Category`/`Choice`/`Strong`/`Arrow`) each with the one-line "what it
  buys" from §Context. Add a `<Callout type="warn">` for the **forward-only variance contract**
  (lmap poisons `icBuild`, rmap sets `wcMatch = const Nothing` → lossy `solveOutput` on rewritten
  edges; `Choice` preserves the round-trip; `arr` does not fuse through `compose`).

- **`explanation/process-managers-sagas-choreography-as-transducers.mdx`** — `title:
  "Process managers, sagas, and choreography as transducers"`. **Lead with the `Events → Commands`
  symmetry**: an aggregate is `Commands → Events`; a process manager is the same object with the
  alphabets flipped, authored with the same `Keiki.Builder` DSL (link EP-21). Then map each
  orchestration pattern to its combinator chain (choreography → `compose`; PM → `compose A (compose
  pm B)`; saga → failure→compensation edges, also `feedback1`; policy → one-vertex `Event → Maybe
  Command`; feedback loop → `feedback1`). Walk `jitsurei/.../CoreBankingSync.hs` as the textbook PM.
  End with the **lockstep-vs-async caveat** prominently (a `<Callout type="warn">`): `compose` is a
  type-level wiring diagram; you run an async PM through keiro by driving aggregates via the adapter
  functions. Include a ` ```mermaid ` like:

  ````mdx
  ```mermaid
  flowchart LR
    A["Aggregate A: Commands -> Events"] -->|events| PM["Process manager: Events -> Commands"]
    PM -->|commands| B["Aggregate B: Commands -> Events"]
    PM -. lmapMaybeCi adapters bridge + filter .-> A
  ```
  ````

- **`explanation/the-composition-algebra.mdx`** — `title: "The composition algebra"`. Explain why
  `compose`/`alternative`/`feedback1` are the **minimal closed set**; how `compose` subsumes the
  older Sequential + Kleisli combinators (the `PartialPath`/`expandPaths` multi-event expansion);
  and the **three preserved guarantees** under composition (`solveOutput`, `checkHiddenInputs`,
  `isSingleValuedSym`) — assert preservation here and link EP-22 for the derivations rather than
  re-deriving. Anchor to `docs/research/composition-combinators-design.md` (history) and
  `test/Keiki/CompositionMultiEventSpec.hs`. Include a ` ```mermaid ` of the three combinators'
  vertex shapes.

### M2 — How-to guides

Copy `content/docs/_templates/how-to.mdx` for each.

- **`how-to/compose-two-transducers.mdx`** — `title: "Compose two transducers"`. The task: align the
  middle alphabets (`t1`'s output type = `t2`'s input type), satisfy the `Disjoint (Names rs1)
  (Names rs2)` slot-name constraint (rename a register if it clashes), call `compose t1 t2`, and
  verify the composite (its single-valuedness/replay guarantees survive — link EP-22). Anchor to
  `test/Keiki/CompositionSpec.hs` (`AlertSource ⨾ EmailDelivery`).

- **`how-to/model-a-saga-with-feedback.mdx`** — `title: "Model a saga with feedback"`. The task:
  single-round compensation via `feedback1 t f`. State the **stateless-aggregate restriction**
  honestly: the precondition collapses to "`rs1` disjoint from itself", so `t` must have `rs1 ~ '[]`;
  the policy `f` may be stateful but usually is not. Workarounds: keep the fed-back aggregate
  stateless (the normal case); for multi-round, nest `feedback1 (feedback1 t f) f`; for unbounded
  "until quiescence", that is a keiro runtime loop, not `feedback1`. Anchor to
  `test/Keiki/CompositionFeedback1Spec.hs`.

- **`how-to/build-a-cross-context-process.mdx`** — `title: "Build a cross-context process"`. The full
  PM recipe, wrapped in `<Steps>`: (1) author a **process manager aggregate** with the
  `Keiki.Builder` DSL — events in, commands out, progress registers, an idempotency guard — mirroring
  `jitsurei/.../CoreBankingSync.hs`; (2) **bridge** the mismatched alphabets with `lmapMaybeCi`
  (rename + filter, mapping uninteresting inputs to `Nothing`); (3) **chain** with `compose` into the
  full system (quote the `loanWorkflow` snippet from §Context verbatim); (4) **drive through the
  adapter functions at runtime** — show that `jitsurei/test/Jitsurei/LoanWorkflowSpec.hs` exercises
  each aggregate directly through the adapters, and explain the **lockstep caveat** (the composite is
  a wiring/verification artifact; the durable async loop runs through keiro). Anchors:
  `jitsurei/.../{CoreBankingSync,Loan,LoanWorkflow}.hs`, `LoanWorkflowSpec.hs`.

### M3 — Walkthrough under `walkthrough/composition/`

Copy `content/docs/_templates/code-walkthrough.mdx`. Each chapter's top `<Callout>` links back to
`/docs/keiki/walkthrough/composition/00-start-here` (absolute). Note the real source path above each
excerpt. Author the 12 files listed in **Plan of Work → walkthrough chapter list**, each citing the
noted source module and test anchor.

Create `walkthrough/composition/meta.json`:

```json
{
  "title": "Composition Walkthrough",
  "pages": [
    "00-start-here",
    "01-composite-vertex",
    "02-weakening",
    "03-substitution",
    "04-compose",
    "05-either-lifters-and-alternative",
    "06-feedback1",
    "07-nary-families",
    "08-existential-wrapper-and-profunctor",
    "09-category-and-overlap-check",
    "10-choice-strong-arrow",
    "11-cross-context-process-tour"
  ]
}
```

### M4 — meta.json appends + build

Append EP-23's slugs to the existing section `meta.json` `pages` arrays (append after existing
entries; do not reorder or remove others). For example,
`content/docs/keiki/reference/meta.json` becomes (assuming only `index` plus prior Phase-2 appends
were there — append, do not rewrite):

```json
{
  "title": "Reference",
  "pages": [
    "index",
    "composition",
    "profunctor"
  ]
}
```

Apply the analogous append to `explanation/meta.json`
(`"process-managers-sagas-choreography-as-transducers"`, `"the-composition-algebra"`) and
`how-to/meta.json` (`"compose-two-transducers"`, `"model-a-saga-with-feedback"`,
`"build-a-cross-context-process"`). Ensure `content/docs/keiki/walkthrough/meta.json` lists
`"composition"` in its `pages` (append it if absent):

```json
{
  "title": "Code Walkthrough",
  "pages": ["index", "composition"]
}
```

Then build and link-check:

```bash
pnpm typecheck
pnpm build
pnpm lint:links
pnpm dev   # then browse http://localhost:3000/docs/keiki
```


## Validation and Acceptance

Exercise the system and observe specific behaviors:

1. **Section builds.** From the repo root, `pnpm typecheck` is clean and `pnpm build` exits 0 with
   the EP-23 pages present. Expected tail (abridged):

   ```text
   ✓ built in <N>s
   ```

2. **Zero crawler warnings; link check passes.** The build log contains no `unhandledRejection` /
   `Failed to fetch` lines (these flag broken/relative links), and `pnpm lint:links` exits 0.
   Confirm no relative cross-links were authored:

   ```bash
   grep -rn '\](\.\./\|\](\./' \
     content/docs/keiki/reference/composition.mdx \
     content/docs/keiki/reference/profunctor.mdx \
     content/docs/keiki/explanation/process-managers-sagas-choreography-as-transducers.mdx \
     content/docs/keiki/explanation/the-composition-algebra.mdx \
     content/docs/keiki/how-to/compose-two-transducers.mdx \
     content/docs/keiki/how-to/model-a-saga-with-feedback.mdx \
     content/docs/keiki/how-to/build-a-cross-context-process.mdx \
     content/docs/keiki/walkthrough/composition/*.mdx
   ```

   Expected: no matches (all cross-links are absolute `/docs/keiki/...` or `/docs/keiro/...`). The
   walkthrough back-link `<Callout>`s are the place to double-check are absolute.

3. **Renders in the sidebar.** `pnpm dev` (or `pnpm build && pnpm start`), open
   `http://localhost:3000/docs/keiki`. The sidebar shows the new composition pages under Reference
   (2), Explanation (2), How-To (3), and a "Composition Walkthrough" group under Code Walkthrough
   (00-start-here + 11 chapters), each opening without a 404 and showing its frontmatter `title`.

4. **Signatures match the source.** Cross-check every signature against the keiki source at
   `344c4ca`:

   ```bash
   cd /Users/shinzui/Keikaku/bokuno/keiki
   grep -nE 'data Composite|^compose|^alternative|^feedback1|wireCtor3At|inCtor3At|outTerm3At' \
     src/Keiki/Composition.hs
   grep -nE 'SomeSymTransducer|SomeSymIdentity|^lmapCi|^lmapMaybeCi|^rmapCo|^dimapTransducer|^arrTransducer|^identityTransducer|CategoryOverlapError|instance' \
     src/Keiki/Profunctor.hs
   grep -n 'type Guarded' src/Keiki/Core.hs
   ```

   Acceptance: every function/type/constructor/constraint named in a snippet appears in the source
   with the signature transcribed in §Context (including `feedback1`'s reduction `feedback1 t f =
   compose t (compose f t)`). Optionally compile for extra assurance:

   ```bash
   cd /Users/shinzui/Keikaku/bokuno/keiki && cabal build keiki jitsurei
   ```

5. **The capstone snippet is faithful.** The `loanWorkflow` snippet in
   `build-a-cross-context-process.mdx` and `walkthrough/composition/11-cross-context-process-tour.mdx`
   matches `jitsurei/src/Jitsurei/LoanWorkflow.hs` verbatim:

   ```bash
   cd /Users/shinzui/Keikaku/bokuno/keiki
   grep -nA5 'loanWorkflow =' jitsurei/src/Jitsurei/LoanWorkflow.hs
   ```

   Expected: the `compose` / `lmapMaybeCi loanEventToSyncInput` / `lmapMaybeCi syncOutputToLoanCmd`
   shape matches what the pages show.

6. **Framing is correct.** The process-manager explanation **leads with** the `Events → Commands`
   symmetry and documents the **lockstep-vs-async** caveat; the `feedback1` how-to states the
   **stateless-aggregate** restriction:

   ```bash
   grep -niE 'Events .*Commands|flipped|lockstep|async|adapter function' \
     content/docs/keiki/explanation/process-managers-sagas-choreography-as-transducers.mdx \
     content/docs/keiki/how-to/build-a-cross-context-process.mdx
   grep -niE "stateless|rs1 ~ '\[\]|disjoint from itself" \
     content/docs/keiki/how-to/model-a-saga-with-feedback.mdx
   ```

   Expected: matches present in each named page.


## Idempotence and Recovery

All steps are file authoring and are safe to repeat: re-running `pnpm typecheck` / `pnpm build` /
`pnpm lint:links` / `pnpm dev` is idempotent; editing or recreating an `.mdx` / `meta.json` file
simply overwrites it; `mkdir -p content/docs/keiki/walkthrough/composition` is idempotent. No
database or keiki source is modified — the keiki tree is opened read-only for cross-checking.

Recovery:
- If a page breaks the build, the error names the offending `.mdx` file and line; fix the MDX (most
  often an untagged fence, an unregistered component used with an `import`, or a stray `<` in prose)
  and rebuild.
- If the sidebar order or a group is wrong, edit the relevant `meta.json` `pages` array; only append
  your own slugs and do not disturb other plans' entries.
- To start a page over, delete the `.mdx` and re-author it from its row in the file map.
- If a snippet diverges from the real API at `344c4ca`, fix the snippet to match the source (the
  source is authoritative over this plan's transcription) and record the divergence in Surprises &
  Discoveries.
- If a cross-link target page (EP-21/EP-22) does not yet exist, the absolute link is still correct
  and resolves once that page lands; do not change it to a relative link.


## Interfaces and Dependencies

**Libraries / systems referenced by the content (Haskell, the documented subject), verified at keiki
commit `344c4ca`:**

- `Keiki.Composition` (`/Users/shinzui/Keikaku/bokuno/keiki/src/Keiki/Composition.hs`) — `Composite`,
  `compose`, `alternative`, `feedback1`, the `WeakenR` + `weakenL*`/`weakenR*` family, the
  `substTerm`/`substPred`/`substUpdate`/`substOut`/`substOutFields` family, the
  `leftInCtor`/`rightInCtor`/`leftWireCtor`/`rightWireCtor` + `liftL*Alt`/`liftR*Alt` lifters, and
  the n-ary injectors `wireCtor3At{1,2,3}`/`inCtor3At{1,2,3}`/`outTerm3At{1,2,3}`.
- `Keiki.Profunctor` (`.../src/Keiki/Profunctor.hs`) — `SomeSymTransducer` (+ `SomeSymIdentity`),
  `lmapCi`, `lmapMaybeCi`, `rmapCo`, `dimapTransducer`, `identityTransducer`, `arrTransducer`,
  `CategoryOverlapError`, and the `Profunctor`/`Functor`/`Category`/`Choice`/`Strong`/`Arrow`
  instances.
- `Keiki.Core` (`.../src/Keiki/Core.hs`) — the `Guarded rs s ci co` alias (quoted in references).
- `jitsurei` (`.../jitsurei/src/Jitsurei/{CoreBankingSync,Loan,LoanApplication,LoanWorkflow}.hs`;
  tests `.../jitsurei/test/Jitsurei/{CoreBankingSyncSpec,LoanSpec,LoanWorkflowSpec}.hs`) —
  worked-example anchors.
- keiki package tests (`.../test/Keiki/{CompositionSpec,CompositionAlternativeSpec,
  CompositionFeedback1Spec,CompositionMultiEventSpec,CompositionNarySpec,ProfunctorSpec,CategorySpec,
  ChoiceSpec,StrongSpec,ArrowSpec}.hs`) — reference/walkthrough anchors.

**Dependency on sibling plans (link absolute):**

- **HARD DEP — EP-20** (`docs/plans/20-…`): the overview/getting-started/foundations pages, the
  jitsurei module map, `docs/keiki-source-sync.md`, the walkthrough hub, and the shared conventions.
- **SOFT DEP — EP-21** (`docs/plans/21-…`): link to its model pages
  `/docs/keiki/explanation/the-symtransducer` and `/docs/keiki/explanation/registers-vs-state` rather
  than re-deriving the `SymTransducer` model or the `Guarded` alias. A process manager is authored
  with EP-21's `Keiki.Builder` DSL.
- **SOFT DEP — EP-22** (`docs/plans/22-…`): the composition pages assert that `solveOutput`,
  `checkHiddenInputs`, and single-valuedness (`isSingleValuedSym`) are **preserved** under
  composition and link EP-22's derivation pages for *why*; they do not re-derive them.
- **INTEGRATION — EP-26** (`docs/plans/26-…`): owns the final `meta.json` ordering pass and wires the
  walkthrough-hub `<Card href>` for the composition tour (this plan ships the tour href-less).

**Tooling / app (TypeScript, the docs site — TanStack Start static SPA):** fumadocs (MDX content +
sidebar from `meta.json`; built-in components `Callout`, `Steps`, `Tabs`, `Cards`/`Card`,
`TypeTable`, authored bare with no imports); TanStack Start + Vite (`pnpm dev`, `pnpm build`,
`pnpm start`, `pnpm typecheck`, `pnpm lint:links`); pnpm + Node 22.

**Files this plan creates/owns (all under `content/docs/keiki/`):**

```text
reference/composition.mdx                                            (title "Keiki.Composition")
reference/profunctor.mdx                                             (title "Keiki.Profunctor")
explanation/process-managers-sagas-choreography-as-transducers.mdx   (title "Process managers, sagas, and choreography as transducers")
explanation/the-composition-algebra.mdx                              (title "The composition algebra")
how-to/compose-two-transducers.mdx                                   (title "Compose two transducers")
how-to/model-a-saga-with-feedback.mdx                                (title "Model a saga with feedback")
how-to/build-a-cross-context-process.mdx                             (title "Build a cross-context process")
walkthrough/composition/00-start-here.mdx                            (title "00 — Start here")
walkthrough/composition/01-composite-vertex.mdx                      (title "01 — The composite vertex")
walkthrough/composition/02-weakening.mdx                             (title "02 — Weakening")
walkthrough/composition/03-substitution.mdx                          (title "03 — Substitution")
walkthrough/composition/04-compose.mdx                               (title "04 — compose")
walkthrough/composition/05-either-lifters-and-alternative.mdx        (title "05 — Either lifters and alternative")
walkthrough/composition/06-feedback1.mdx                             (title "06 — feedback1")
walkthrough/composition/07-nary-families.mdx                         (title "07 — N-ary families")
walkthrough/composition/08-existential-wrapper-and-profunctor.mdx    (title "08 — The existential wrapper and profunctor")
walkthrough/composition/09-category-and-overlap-check.mdx            (title "09 — Category and the overlap check")
walkthrough/composition/10-choice-strong-arrow.mdx                   (title "10 — Choice, Strong, Arrow")
walkthrough/composition/11-cross-context-process-tour.mdx            (title "11 — A cross-context process tour")
walkthrough/composition/meta.json                                    (title "Composition Walkthrough")
```

**meta.json slugs EP-23 appends (append only; never reorder/remove others):**

```text
reference/meta.json     += "composition", "profunctor"
explanation/meta.json   += "process-managers-sagas-choreography-as-transducers", "the-composition-algebra"
how-to/meta.json        += "compose-two-transducers", "model-a-saga-with-feedback", "build-a-cross-context-process"
walkthrough/meta.json   += "composition"   (only if not already present)
```

**Files this plan touches but does not own:** the per-section `meta.json` files above (shared;
append-only) and `walkthrough/meta.json` (shared; ensure `"composition"` present). The top-level
`content/docs/keiki/meta.json` is **not** touched. The walkthrough-hub `<Card href>` for the
composition tour is **not** added (EP-26 wires it).

**Postconditions / interfaces that must exist at the end:**
- Every file above exists; `pnpm typecheck` clean, `pnpm build` exits 0 with zero crawler warnings,
  `pnpm lint:links` exits 0.
- The composition subtree renders in the sidebar in `meta.json` order.
- Each Haskell snippet uses only names present in the keiki source at `344c4ca` (Validation step 4);
  the `loanWorkflow` snippet matches `jitsurei/src/Jitsurei/LoanWorkflow.hs` (Validation step 5).
- The two explanation pages each carry a ` ```mermaid `; the process-manager explanation leads with
  the `Events → Commands` symmetry and documents the lockstep-vs-async caveat; the `feedback1`
  how-to states the stateless-aggregate restriction (Validation step 6).


## Commit trailers

When committing work for this plan, include these trailers:

```text
MasterPlan: docs/masterplans/3-keiki-framework-documentation-set.md
ExecPlan: docs/plans/23-keiki-composition-process-managers-sagas-and-choreography.md
```
