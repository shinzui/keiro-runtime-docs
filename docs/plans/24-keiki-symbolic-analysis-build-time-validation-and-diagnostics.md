---
id: 24
slug: keiki-symbolic-analysis-build-time-validation-and-diagnostics
title: "Keiki symbolic analysis, build-time validation, and diagnostics"
kind: exec-plan
created_at: 2026-06-07T04:53:26Z
master_plan: "docs/masterplans/3-keiki-framework-documentation-set.md"
---

# Keiki symbolic analysis, build-time validation, and diagnostics

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, the keiki documentation set under `content/docs/keiki/` in this
repository (`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`) gains a complete, accurate,
navigable slice covering **keiki's symbolic analysis, build-time validation, and
command-rejection diagnostics** — the three machineries that let a developer prove an
aggregate or process-manager *transducer* is well-formed **before** it ships, and explain
*why* a command was rejected at runtime.

A reader who lands on these pages can:

- understand the **single-valuedness property** — at every reachable control vertex, at most
  one outgoing edge's guard is satisfiable for any input — and how keiki **decides** it with
  an SMT solver (z3, driven through the Haskell `sbv` library): for each vertex, for each
  distinct pair of outgoing edges, it asks the solver whether the conjunction of the two
  guards is unsatisfiable. This is the property that guarantees `step` is deterministic, so
  the derived `decide` and `evolve` cannot silently disagree;
- look up the exact Haskell signatures of the symbolic surface (`Keiki.Symbolic` — the `Sym`
  typeclass and its register-type registry, `SymEnv`/`translatePred`, the `SymPred` newtype
  and its `BoolAlg`/`Sat` instances, `symIsBot`/`symSatExt`, `isSingleValuedSym`,
  `checkTransitionDeterminismSym`/`checkDeadEdgesSym`) in a **reference** page;
- look up the **build-time validation umbrella** — `validateTransducer` and its
  `ValidationOptions`, the four warning kinds (`HiddenInput`, `NondeterministicPair`,
  `PossiblyDeadEdge`, `OpaqueGuard`), and the per-component checks that feed it — in a
  reference page that **disambiguates** keiki's transducer validator (which lives in
  **`Keiki.Core`**) from the unrelated `Keiki.Render.Validate` Mermaid-diagram text checker;
- look up the **runtime diagnostics** — `stepEither`, the three-variant `StepFailure`,
  `EdgeRef`, `RejectedEdgeSummary`, `MatchedEdgeSummary` — and understand how they contrast
  with the failure-collapsing `step`;
- read **explanation** essays on what single-valuedness is and how the keiki decision
  procedure proves it (`the-symbolic-ci-gate`), and on the deeper property — soundness vs
  precision, the curated-types / opaque-escape caveats, the Unknown-conservative rule, and
  memoization (`single-valuedness-and-soundness`), which **links to** EP-20's theory page
  `/docs/keiki/explanation/why-smt` rather than re-deriving the SMT motivation;
- complete two focused **how-to** tasks: assert a transducer is well-formed in CI (the
  microsecond pure `validateTransducer defaultValidationOptions t == []` assertion, the
  opaque-guard audit, and the opt-in z3-backed escalation) and diagnose a rejected command
  (swap `step` for `stepEither` and pattern-match `StepFailure`); and
- follow an ordered **code walkthrough** (`walkthrough/symbolic-and-validation/`) that reads
  the real `Keiki.Symbolic` and the `validateTransducer`/`stepEither` surface of
  `Keiki.Core` end to end — the `Sym` registry, the `translatePred` SBV translation with its
  memo cache, `symIsBot`/`symSatExt`, the single-valuedness gate, the validation umbrella,
  opaque guards, the solver-backed checks, and the runtime-rejection mirror.

You can see the result by running the docs dev server from the repo root with `pnpm dev` and
browsing `http://localhost:3000/docs/keiki`: the symbolic/validation pages appear in the
sidebar in the order their `meta.json` files define; the `walkthrough/symbolic-and-validation`
tour is reachable from the sidebar; Haskell snippets render in PragmataPro with ligatures
(`->`, `=>`, `<-`, `::`, `>>=`, `<$>` shown as glyphs); and a `mermaid` diagram (the
per-pair-per-vertex single-valuedness decision loop) renders as a diagram.

This is a **content** plan. It populates `content/docs/keiki/` only. It does not build the
app, the highlighter, the font, the Mermaid component, or the IA/template system — those are
owned by sibling plans and are already complete. It documents keiki **as shipped at the
pinned upstream commit `344c4ca` (keiki `0.1.0.0`)**.

A load-bearing operational fact stated on every relevant page: **z3 (and the `sbv` Haskell
binding) is needed only at build/CI time**, when you run the symbolic checks. It is **not** a
runtime dependency: the per-event hot path (`delta`/`omega`/`step`/`stepEither`/`reconstitute`)
decides every guard with concrete evaluation (`models (guard e) (regs, ci)`), never z3.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [x] M0. Preconditions verified (2026-06-06) — toolchain present, section subdirs exist, EP-20
      foundation landed, baseline `pnpm build` clean, keiki source readable at `344c4ca`,
      `walkthrough/symbolic-and-validation/` subdir created.
- [x] M1. Reference + explanation set authored (2026-06-06) (`reference/symbolic.mdx`,
      `reference/validate.mdx` with the `Keiki.Render.Validate` disambiguation, `reference/step-failure.mdx`
      with no `StepResult`, `explanation/the-symbolic-ci-gate.mdx` with the decision-loop `mermaid`,
      `explanation/single-valuedness-and-soundness.mdx`). z3/`sbv` framed build-time-only throughout.
- [x] M2. How-to set authored (2026-06-06) (`how-to/assert-a-transducer-is-well-formed-in-ci.mdx`,
      `how-to/diagnose-a-rejected-command.mdx`).
- [x] M3. Code walkthrough authored under `walkthrough/symbolic-and-validation/` (2026-06-06)
      (`00-start-here` + chapters `01`–`10`) + its `meta.json`.
- [x] M4. Section `meta.json` files appended; `walkthrough/meta.json` lists `symbolic-and-validation`;
      `pnpm typecheck` clean; `pnpm build` exits 0 with zero crawler warnings; `pnpm lint:links` exits
      0 (283 files); Haskell-name audit passes. (2026-06-06)


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

- **A forward link to EP-25's not-yet-authored `walkthrough/rendering` tripped the crawler.** Chapter
  07's `Keiki.Render.Validate` disambiguation linked `/docs/keiki/walkthrough/rendering` (EP-25's
  tour), which does not exist yet — `pnpm build` emitted one `Failed to fetch`. Per the
  soft-dependency rule, demoted it to a plain `/docs/keiki/reference` link. (The stray-harness-tag
  grep added after EP-23 passed clean here, so that failure mode did not recur.)
  Date: 2026-06-06


## Decision Log

Record every decision made while working on the plan.

- Decision: Document the build-time validation umbrella (`validateTransducer`,
  `ValidationOptions`, `TransducerValidationWarning` and its four constructors, and the
  per-component checks) from **`Keiki.Core`**, and include one disambiguating sentence on
  **every** validate page stating that `Keiki.Render.Validate` is a *different*, unrelated
  module (a heuristic Mermaid-diagram / atlas text checker exporting `validateMermaidDiagram`
  / `validateMermaidAtlas`, owned by EP-25), not keiki's transducer validator.
  Rationale: the parent MasterPlan's Surprises & Discoveries records that the two "validate"
  surfaces are easy to conflate; verified at `344c4ca` that `validateTransducer` is exported
  from `src/Keiki/Core.hs` (lines ~150-162) and `Keiki.Render.Validate` exports only
  `validateMermaidDiagram` / `validateMermaidAtlas` (`src/Keiki/Render/Validate.hs` lines
  18-23). Accuracy and self-containment are explicit acceptance criteria.
  Date: 2026-06-07
- Decision: Do **not** invent a `StepResult` wrapper type. The successful result of
  `step`/`stepEither` is the bare triple `(s, RegFile rs, [co])`; `stepEither` returns
  `Either (StepFailure s) (s, RegFile rs, [co])`.
  Rationale: the parent MasterPlan's Surprises & Discoveries states there is no `StepResult`
  type; verified at `344c4ca` that `stepEither :: BoolAlg phi (RegFile rs, ci) =>
  SymTransducer phi rs s ci co -> (s, RegFile rs) -> ci -> Either (StepFailure s) (s, RegFile
  rs, [co])` in `src/Keiki/Core.hs` (lines ~1010-1056). Inventing a wrapper would make every
  snippet uncompilable.
  Date: 2026-06-07
- Decision: State on every relevant page that **z3 (and `sbv`) is a build/CI-time-only
  dependency**, never a runtime dependency. Emphasize that the per-event hot path
  (`delta`/`omega`/`step`/`stepEither`/`reconstitute`) decides guards by **concrete**
  evaluation (`models (guard e) (regs, ci)` = `evalPred`), never by calling the solver.
  Rationale: a reader who believes z3 is on the hot path would wrongly reject keiki for a
  low-latency service; the symbolic checks are an opt-in CI gate. Verified that the
  `BoolAlg`/`Sat` instances route to the solver only via `isBot`/`sat`, and `stepEither`
  uses `models`.
  Date: 2026-06-07
- Decision: Defer the *theory* of "why an SMT solver" to **EP-20**'s
  `/docs/keiki/explanation/why-smt`. This plan's explanation pages **link to** that page and
  go deep on the **keiki-specific decision procedure** (the per-pair-per-vertex
  decomposition, `translatePred`, `symIsBot`, witness extraction via `symSatExt`, soundness
  vs precision, the opaque-escape caveats). Author a deeper
  `explanation/single-valuedness-and-soundness.mdx` instead of duplicating a `why-smt`.
  Rationale: per the parent MasterPlan's Dependency Graph, EP-24 soft-depends on EP-20 and
  EP-21; EP-20 ports the `why-smt` theory essay. Re-deriving it here would duplicate content
  and risk drift.
  Date: 2026-06-07
- Decision: Place this plan's walkthrough in a **new `walkthrough/symbolic-and-validation/`
  subdirectory** with its own `meta.json`, `00-start-here.mdx`, and 10 numbered chapters,
  rather than adding chapters to a shared sequence; append `"symbolic-and-validation"` to
  `walkthrough/meta.json` without reordering; do **not** add a hub `<Card href>` (EP-26 adds
  it during finalization).
  Rationale: the parent MasterPlan's Integration Point #2 assigns EP-24 the disjoint
  subdirectory `walkthrough/symbolic-and-validation/`; disjoint subdirs let the five Phase-2
  plans run in parallel without colliding on chapter numbering, and the hub-href-less rule
  keeps every intermediate `pnpm build` crawler-clean.
  Date: 2026-06-07


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

**Outcome (2026-06-06).** EP-24 is complete: 18 pages — three reference (`symbolic`, `validate`,
`step-failure`), two explanations (`the-symbolic-ci-gate`, `single-valuedness-and-soundness`), two
how-tos (`assert-a-transducer-is-well-formed-in-ci`, `diagnose-a-rejected-command`), and the
eleven-file `walkthrough/symbolic-and-validation/` tour. The whole keiki tree builds clean (`pnpm
build` exit 0, zero crawler warnings) and link-checks (283 files); every quoted Haskell identifier was
audited against the pinned source `344c4ca`. The two accuracy corrections held throughout:
`validateTransducer` is documented from `Keiki.Core` with the `Keiki.Render.Validate` disambiguation
on every validate surface, and there is no `StepResult` (the bare triple). z3/`sbv` is framed as a
build/CI-time-only dependency, with the concrete-evaluation hot path stated on every relevant page.


## Context and Orientation

Read this whole section before editing. It is written so that a novice with only this file
and the working tree can complete the work.

### What you are building

You are writing MDX content files under `content/docs/keiki/` in **this** repository
(`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`). The site is a **fumadocs**
documentation app built on **TanStack Start as a static SPA** (React 19 + MDX, TypeScript,
Tailwind v4, bundled with Vite), built and served with **pnpm** on **Node 22**. `pnpm dev`
runs the dev server; `pnpm build` builds the static SPA and **prerenders** every page,
emitting crawler link-check warnings if any internal link is broken; `pnpm typecheck` runs
`fumadocs-mdx && tsc --noEmit`; `pnpm lint:links` checks internal links and exits non-zero on
a broken link. Content lives under `content/docs/`. Each directory has a `meta.json` whose
`pages` array lists child page slugs / nested directory names in display order. A page is an
`.mdx` file with YAML frontmatter (`title`, `description`) followed by an MDX body. The
documented **code samples are Haskell** (the site is TypeScript; the subject is a Haskell
library). Every Haskell snippet must use keiki's real API, transcribed below.

The fumadocs-ui components (`<Callout>`, `<Cards>`/`<Card>`, `<Steps>`, `<Tabs>`,
`<TypeTable>`, `<Mermaid>`) are registered **globally** by the docs app, so author them
**bare** — do not add `import` lines. Verify this once before authoring by reading
`src/components/mdx.tsx` (look for `getMDXComponents`). Use **absolute** doc links
(`/docs/keiki/...`, `/docs/keiro/...`) for every cross-page link, never relative `./` or
`../` (relative MDX links resolve wrong in the static SPA and trip the prerender crawler).
Every fenced code block MUST carry a language tag (` ```haskell `, ` ```text `, ` ```bash `,
` ```json `, ` ```mermaid `); never write a bare ```` ``` ````. Hand-authored MDX in this
repo does **not** pass `oxfmt --check` cleanly repo-wide — match the neighbouring
`content/docs/keiro/*` file style and do **not** reformat existing files.

The repo ships copy-me MDX templates under `content/docs/_templates/`: `reference.mdx`,
`explanation.mdx`, `theory-explainer.mdx`, `how-to.mdx`, `code-walkthrough.mdx`,
`tutorial.mdx`, `cookbook-recipe.mdx`, `faq.mdx`. Match each page to its mode and copy that
template's frontmatter + section skeleton. Look at the existing keiro pages for tone and
shape (e.g. a keiro reference page under `content/docs/keiro/reference/`, a keiro explanation
page, and a keiro walkthrough chapter under `content/docs/keiro/walkthrough/`).

Some non-obvious terms used throughout, defined in plain language:

- **Transducer** — keiki's one formalism, `SymTransducer phi rs s ci co`: a finite-state
  machine whose edges are labelled by **predicates** (`phi`) over an infinite input domain,
  carrying a typed **register file** (`rs`) of data memory alongside the finite control
  **state** (`s`). `ci` is the input-command type, `co` the output type. EP-21 owns the
  canonical conceptual treatment of this model; this plan links to it rather than re-deriving
  it.
- **Guard** — the predicate on an edge. In the v1 (concrete) world it is an `HsPred rs ci`, a
  small first-order predicate language (`PTop`, `PBot`, `PAnd`, `POr`, `PNot`, `PEq`,
  `PInCtor`, `PCmp`, built over `Term`s like register projections, command-constructor fields,
  literals, and arithmetic). EP-21 introduces `HsPred`, the `BoolAlg`/`Sat` classes, and the
  `stepEither`/`StepFailure` diagnostics surface (they all live in `Keiki.Core`); **this plan
  documents the diagnostics deeply** and the *symbolic* re-tagging of that surface.
- **Single-valuedness** — the property that at every reachable control vertex, at most one
  outgoing edge's guard is satisfiable for any one input. It is what makes `step`
  deterministic and guarantees the derived `decide` and `evolve` cannot disagree.
- **SMT solver** — a program (here **z3**) that decides whether a logical formula is
  satisfiable. keiki drives z3 through the Haskell `sbv` library (`Data.SBV`). It is used
  only at build/CI time.
- **Satisfiable / unsatisfiable** — a formula is *satisfiable* if some assignment of values
  makes it true; *unsatisfiable* if no assignment does. The single-valuedness check asks
  whether the conjunction of two edge guards is **unsatisfiable** (they can never both fire).
- **Bottom (`isBot`)** — in keiki's `BoolAlg` algebra, a predicate is "bottom" when it is
  unsatisfiable (logically false everywhere). The symbolic `isBot` asks z3.
- **Over-approximation / under-approximation** — an *over-approximating* check may report a
  problem that does not really exist (a false positive); an *under-approximating* check never
  reports a false positive but may miss a real problem (a false negative). keiki's pure
  determinism check under-approximates; its raw-`HsPred` syntactic check over-approximates.
- **Opaque term** — a guard sub-expression keiki cannot translate to a precise symbolic
  formula (a Haskell function application `TApp1`/`TApp2` lifted through a closure, most often
  a collection-content condition). The symbolic translation maps it to a **fresh free
  variable**, which silently *under-verifies* (the solver treats it as "anything"). keiki can
  optionally *audit* for these (the `OpaqueGuard` warning).
- **Witness** — a concrete counterexample. When two guards *can* both fire, `symSatExt`
  reconstructs a concrete `(RegFile rs, ci)` that satisfies their conjunction, so a developer
  sees exactly which input breaks single-valuedness.

### Sibling plans and how this plan depends on them

This plan is **EP-24** in the master plan
`docs/masterplans/3-keiki-framework-documentation-set.md`, Phase 2.

- **HARD DEP — EP-20**
  (`docs/plans/20-keiki-foundation-theory-getting-started-and-the-worked-example-spine.md`):
  the keiki foundation. After EP-20 lands, `content/docs/keiki/index.mdx` (the overview), the
  getting-started tutorial, the foundations/theory explanation essays (including
  `/docs/keiki/explanation/why-smt`), the `jitsurei` worked-example module map, the
  `docs/keiki-source-sync.md` source-of-truth pointer, the walkthrough hub
  (`walkthrough/index.mdx` + initial `walkthrough/meta.json`), and the shared authoring
  conventions all exist. **You cannot author internally-consistent pages until EP-20 is
  Complete.** Your `explanation/single-valuedness-and-soundness.mdx` links to EP-20's
  `/docs/keiki/explanation/why-smt`.
- **SOFT DEP — EP-21**
  (`docs/plans/21-keiki-transducer-core-and-authoring-aggregates.md`): the transducer core +
  builder. The guard language `HsPred`, the `BoolAlg`/`Sat` classes, and the
  `stepEither`/`StepFailure` diagnostics live in `Keiki.Core`, which EP-21 documents. EP-21
  owns the canonical conceptual treatment of the `SymTransducer` model
  (`/docs/keiki/explanation/the-symtransducer`, `/docs/keiki/explanation/registers-vs-state`)
  and the `Keiki.Core` reference (`/docs/keiki/reference/core`, which introduces `HsPred`,
  `BoolAlg`/`Sat`, and `stepEither`/`StepFailure` at the surface level). **This plan
  documents the symbolic re-tagging and the validation/diagnostics machinery deeply** and
  links back to EP-21's pages for the model and the guard language. Because EP-21 is a *soft*
  dep, you author your pages now with absolute links to EP-21's pages; they resolve once
  EP-21 lands. If a target page does not yet exist, the link still renders text; do not block
  on it.

Soft deps are non-blocking because every page is self-contained (it embeds the source context
it needs) and uses absolute links that resolve once the target page exists.

### Integration points this plan participates in (from the parent MasterPlan)

- **Integration Point #1 — section `meta.json` ordering.** Each section's per-section
  `meta.json` `pages` array is **appended to** by several plans. Rule: this plan appends only
  its own page slugs and never reorders or removes another plan's entries. **EP-26 owns the
  final ordering pass.** The section `meta.json` files currently read `{"title": ..., "pages":
  ["index"]}` (only the placeholder landing). You append your slugs after `index`.
- **Integration Point #2 — the `walkthrough/` tree.** EP-20 creates `walkthrough/index.mdx`
  and `walkthrough/meta.json`. This plan owns the **disjoint subdirectory
  `walkthrough/symbolic-and-validation/`** with its own `meta.json`, a `00-start-here.mdx`,
  and 10 numbered chapters. When you create the subdir, **append** `"symbolic-and-validation"`
  to `walkthrough/meta.json` (without reordering other entries) and author a real
  `00-start-here.mdx` so the tour is sidebar-navigable. Do **not** add the hub `<Card href>` —
  **EP-26 finalizes** the hub `<Card href>`s during the finalization pass.
- **Integration Point #5 — the transducer model and the guard-language surface.** EP-21 owns
  the canonical conceptual treatment of `SymTransducer`, state-vs-registers, and the
  `Keiki.Core` guard language (`HsPred`, `BoolAlg`/`Sat`, `stepEither`/`StepFailure`). This
  plan **links to** EP-21's `/docs/keiki/explanation/the-symtransducer`,
  `/docs/keiki/explanation/registers-vs-state`, and `/docs/keiki/reference/core` rather than
  re-deriving them. EP-21 introduces these surfaces; **EP-24 documents the diagnostics and
  the symbolic/validation machinery deeply.**
- **Integration Point #6 — the Decider façade framing.** Where any page mentions deciding, use
  ordinary-English "decide" verbs or point at EP-22's façade page; never present `toDecider`
  as the default way to run an aggregate. The recommended surface is the transducer itself
  (`step`/`stepEither`/`delta`/`omega`/`reconstitute`).
- **Integration Point #7 — shared authoring rules.** Absolute cross-links only; author every
  Haskell snippet against the real shipped signatures at `344c4ca` and cross-check the source;
  every fenced code block declares a language tag; match neighbouring `content/docs/keiro/*`
  style and do not reformat.

### TWO accuracy corrections this plan MUST encode

These are the two facts most likely to be gotten wrong; encode them verbatim where noted.

1. **`validateTransducer` and its warning types live in `Keiki.Core`, NOT
   `Keiki.Render.Validate`.** `Keiki.Render.Validate` is a *different*, unrelated module — a
   heuristic Mermaid-diagram / atlas **text** checker exporting `validateMermaidDiagram` /
   `validateMermaidAtlas` (owned by EP-25). **Include one disambiguating sentence on every
   validate page** (`reference/validate.mdx`, the walkthrough validation chapters, and the
   CI how-to): "keiki's transducer validator (`validateTransducer`) lives in `Keiki.Core`;
   `Keiki.Render.Validate` is an unrelated Mermaid-diagram text checker (documented under
   rendering) — do not confuse the two."

2. **There is NO `StepResult` type.** `stepEither`'s success is the **bare triple** `(s,
   RegFile rs, [co])`. Never write or imply a `StepResult` wrapper. The full signature is
   `stepEither :: BoolAlg phi (RegFile rs, ci) => SymTransducer phi rs s ci co -> (s, RegFile
   rs) -> ci -> Either (StepFailure s) (s, RegFile rs, [co])`.

### The subject: keiki symbolic analysis, validation, and diagnostics, transcribed from source

Source of truth on disk (read-only — do **not** edit it). The keiki repo is at
`/Users/shinzui/Keikaku/bokuno/keiki` (confirm with `mori registry show shinzui/keiki
--full`; expect `Path: /Users/shinzui/Keikaku/bokuno/keiki`). The pinned commit is `344c4ca`.
The `jitsurei` worked-example package is **inside** that repo at
`/Users/shinzui/Keikaku/bokuno/keiki/jitsurei/`. The facts below are transcribed from these
files; treat this subsection as your API cheat-sheet and re-open the files to confirm a
detail before quoting it:

```text
src/Keiki/Symbolic.hs                  -- the symbolic surface (re-exports all of Keiki.Core)
src/Keiki/Core.hs                      -- validateTransducer + ValidationOptions + warnings;
                                          stepEither/StepFailure; the per-component checks
src/Keiki/Render/Validate.hs           -- UNRELATED Mermaid checker (EP-25 owns) — for disambiguation only
test/Keiki/SymbolicSpec.hs             -- Sym/SymRep, translation, memo, SymPred BoolAlg
test/Keiki/ValidationSpec.hs           -- validateTransducer, the four warnings, solver-backed checks
test/Keiki/StepEitherSpec.hs           -- stepEither / StepFailure
test/Keiki/RecomputeVerifySpec.hs      -- recompute-and-verify-derived-outputs (optional ch. 11)
jitsurei/test/Jitsurei/UserRegistrationSymbolicSpec.hs   -- single-valuedness gate over a real aggregate
jitsurei/test/Jitsurei/OrderCartSymbolicSpec.hs          -- witnesses over a collection-tally aggregate
jitsurei/test/Jitsurei/LoanApplicationSymbolicSpec.hs    -- threshold-guard symbolic domain
```

#### The symbolic surface (`Keiki.Symbolic`)

`Keiki.Symbolic` **re-exports all of `Keiki.Core`** and adds the symbolic machinery. The
solver-facing pieces:

```haskell
-- src/Keiki/Symbolic.hs

-- The register-type registry: which Haskell types keiki can translate to SBV symbolics.
class (SBV.SymVal (SymRep a), Typeable a) => Sym a where
  type SymRep a
  toSym      :: a -> SymRep a
  fromSym    :: SymRep a -> a
  symDefault :: a              -- consumed by symSatExt when the model omits a slot

-- Instances: Bool, Integer, Int, Word64/32/16/8, Int64/32 (ALL as unbounded Integer —
-- a sound over-approximation: no machine-word wraparound is modelled), Text as SString,
-- UTCTime as epoch-seconds Integer.

-- Runtime dispatch from Typeable evidence to a Sym dictionary:
data SymDict r where SymDict :: Sym r => SymDict r
discoverSym    :: Typeable r => Maybe (SymDict r)
discoverSymOrd :: Typeable r => Maybe (SymOrdDict r)   -- Sym r + SBV.OrdSymbolic (numeric/time)
discoverSymNum :: Typeable r => Maybe (SymNumDict r)   -- Sym r + Num
symLit  :: Sym a => a      -> SBV.SBV (SymRep a)
symFree :: Sym a => String -> SBV.Symbolic (SBV.SBV (SymRep a))

-- Translation environment + walkers:
data SymEnv = SymEnv
  { seInputCtor :: SBV.SBV String                 -- the shared symbolic input-constructor tag
  , seVarCache  :: IORef (Map String SomeSBV) }   -- memo: one variable per named slot
mkSymEnv         :: SBV.Symbolic SymEnv
translateTermSym :: Sym r => SymEnv -> Term rs ci ifs r -> SBV.Symbolic (SBV.SBV (SymRep r))
translatePred    :: SymEnv -> HsPred rs ci -> SBV.Symbolic SBV.SBool

-- The symbolic predicate newtype and its algebra:
newtype SymPred rs ci = SymPred { unSymPred :: HsPred rs ci }
type SymGuarded rs s ci co = SymTransducer (SymPred rs ci) rs s ci co
instance BoolAlg (SymPred rs ci) (RegFile rs, ci)
  -- structural top/bot/conj/disj/neg; models = the v1 concrete evalPred; isBot = symIsBot (z3)
instance (ExtractRegFile rs, KnownInCtors ci) => Sat (SymPred rs ci) (RegFile rs, ci)
  -- sat = symSatExt (full witness extraction)

-- The two NOINLINE solver-call wrappers (pure API over an IO solver call):
{-# NOINLINE symIsBot #-}
symIsBot :: HsPred rs ci -> Bool
-- = unsafePerformIO $ SBV.sat (mkSymEnv >>= translatePred) >>= \res -> pure (not (modelExists res))

{-# NOINLINE symSatExt #-}
symSatExt :: (ExtractRegFile rs, KnownInCtors ci) => HsPred rs ci -> Maybe (RegFile rs, ci)
-- full witness extraction: reconstructs a concrete (RegFile rs, ci) from the solver model

-- Witness-extraction evidence classes:
class ExtractRegFile rs where extractRegFile :: ...
data SomeInCtor ci where SomeInCtor :: ExtractRegFile ifs => InCtor ci ifs -> SomeInCtor ci
class KnownInCtors ci where allInCtors :: [SomeInCtor ci]

-- The single-valuedness gate and the SymPred lift:
isSingleValuedSym :: (BoolAlg phi (RegFile rs, ci), Bounded s, Enum s)
                  => SymTransducer phi rs s ci co -> Bool
withSymPred :: SymTransducer (HsPred rs ci) rs s ci co
            -> SymTransducer (SymPred rs ci) rs s ci co

-- Solver-backed validation (z3), each = the pure check run on the SymPred-lifted transducer:
checkTransitionDeterminismSym :: (Bounded s, Enum s, Show s)
                              => SymTransducer (HsPred rs ci) rs s ci co -> [DeterminismWarning s]
-- = checkTransitionDeterminism . withSymPred
checkDeadEdgesSym :: (Bounded s, Enum s, Ord s, Show s)
                  => SymTransducer (HsPred rs ci) rs s ci co -> [DeadEdgeWarning s]
```

How `translatePred` walks an `HsPred` (state this in `the-symbolic-ci-gate` and the
translation walkthrough chapter): `PTop`/`PBot` → `sTrue`/`sFalse`; `PAnd`/`POr`/`PNot` →
`.&&`/`.||`/`sNot`; `PEq` tries `discoverSym` → `(.==)` or a fresh `SBool` if the type is not
in the registry; `PInCtor ic` → `seInputCtor .== literal (icName ic)` (the **shared input
tag** makes constructor mutual-exclusion decidable); `PCmp` tries `discoverSymOrd`; arithmetic
(`TArith`) → real `+`/`-`/`*` via `discoverSymNum`; `TApp1`/`TApp2` → a fresh `SBV.free`
(**opaque**, under-verifies). Repeated reads of the same slot share **one** variable via the
`seVarCache` memo, so `proj #x .== proj #x` is **valid** (true in every model), not merely
satisfiable. Cost is roughly 10 ms per warm `isBot` call; an `Unknown`/timeout result is
treated **conservatively** (`isBot` → `False`, i.e. "assume satisfiable / assume a possible
overlap").

Witness extraction (`symSatExt`): reconstructs a concrete `(RegFile rs, ci)`. `extractRegFile`
reads each register slot by name `"reg/<slot>"` via `readModel` (falling back to `symDefault`
when the model omits it); `pickCi` matches the `inputCtor` tag against `allInCtors`, reading
the constructor fields `"inp/<ctor>/<field>"` and rebuilding via `icBuild`. Round-trip
property: `models p witness == True` (modulo opaque terms).

#### The build-time validation umbrella (in `Keiki.Core`)

```haskell
-- src/Keiki/Core.hs  (validateTransducer lives HERE, not in Keiki.Render.Validate)

data TransducerValidationWarning s
  = HiddenInput          { tvwEdge :: EdgeRef s, tvwInCtor :: Maybe String
                         , tvwMissingSlots :: [String], tvwDetail :: ... }
  | NondeterministicPair { tvwSource :: s, tvwEdgeA :: Int, tvwEdgeB :: Int
                         , tvwInCtor :: ..., tvwDetail :: ... }
  | PossiblyDeadEdge     { tvwEdge :: EdgeRef s, tvwDetail :: ... }
  | OpaqueGuard          { tvwEdge :: EdgeRef s, tvwDetail :: ... }

data ValidationOptions = ValidationOptions
  { failOnEpsilonReadsInput :: Bool   -- emit HiddenInput
  , checkDeterminism        :: Bool   -- emit NondeterministicPair
  , checkReachability       :: Bool   -- emit PossiblyDeadEdge
  , warnOpaqueGuards        :: Bool }  -- emit OpaqueGuard (OFF by default)

defaultValidationOptions :: ValidationOptions
-- = ValidationOptions { failOnEpsilonReadsInput = True, checkDeterminism = True
--                     , checkReachability = True, warnOpaqueGuards = False }

validateTransducer :: (Bounded s, Enum s, Ord s, Show s)
                   => ValidationOptions -> SymTransducer (HsPred rs ci) rs s ci co
                   -> [TransducerValidationWarning s]

hiddenInputWarnings :: ... -> [TransducerValidationWarning s]
opaqueGuardWarnings :: ... -> [TransducerValidationWarning s]

-- The per-component checks validateTransducer concatenates:
data DeterminismWarning s = DeterminismWarning { dwSource :: s, dwEdgeA :: Int, dwEdgeB :: Int, dwDetail :: ... }
checkTransitionDeterminism     :: BoolAlg phi (RegFile rs, ci) => SymTransducer phi rs s ci co -> [DeterminismWarning s]
  -- BoolAlg-polymorphic; over-approximates on raw HsPred — only meaningful on SymPred
checkTransitionDeterminismPure :: ...  -- (see note) under-approximates; no false positives; may miss

data DeadEdgeOptions = DeadEdgeOptions { deoFlagBotGuards :: Bool }
defaultDeadEdgeOptions :: DeadEdgeOptions   -- flags unreachable-source AND literal PBot
data DeadEdgeWarning s = DeadEdgeWarning { dewEdge :: EdgeRef s, dewReason :: ... }
checkDeadEdges :: (Bounded s, Enum s, Ord s, Show s) => DeadEdgeOptions -> SymTransducer phi rs s ci co -> [DeadEdgeWarning s]
```

> Note: the pure determinism function `validateTransducer` calls is the
> **under-approximating** one (`checkTransitionDeterminismPure` — verify the exact name in
> `src/Keiki/Core.hs` when you author the page; it is the one that produces **no false
> positives** but may miss real overlaps). The `BoolAlg`-polymorphic
> `checkTransitionDeterminism` **over-approximates** on a raw `HsPred` and is only meaningful
> when run on a `SymPred` (i.e. through `checkTransitionDeterminismSym`). State this gotcha on
> the validate reference page and in the relevant walkthrough chapters.

How `validateTransducer` builds its result (state on the validate reference page): it
concatenates the **enabled** checks —

- **hidden-input** (`failOnEpsilonReadsInput` → `HiddenInput`): an edge reads command
  information its output does not emit, so the event is **un-replayable** — replaying the
  recorded output cannot reproduce the transition. (This is the deliberately broken
  `UserRegistrationV0` teaching foil.)
- **determinism** (`checkDeterminism` → `NondeterministicPair` via the **pure**
  `provablyOverlap`): emitted only when two guards **provably** overlap — true only when both
  guards are `PTop`, or both are the same `PInCtor` — a **conservative** test with **no false
  positives**. The z3-backed escalation (`checkTransitionDeterminismSym`) proves the overlaps
  this pure test cannot.
- **dead-edge** (`checkReachability` → `PossiblyDeadEdge`): the edge's source vertex is
  unreachable from the initial vertex (computed by a `reachableVertices` fixpoint), or the
  guard is a literal `PBot`.
- **opaque-guard audit** (`warnOpaqueGuards`, **OFF by default** → `OpaqueGuard` via
  `predHasOpaqueTerm`/`termHasOpaqueApp`): the edge branches on an opaque `TApp` that the
  symbolic analyses translate to a free variable and therefore **silently under-verify** —
  most often a collection-content condition lifted through a closure. Call this "the
  collection-slot opaque-mutation signpost": it tells you exactly where the symbolic gate's
  guarantee weakens.

`validateTransducer` is **pure** — no z3 — and runs in microseconds. The z3-backed checks
(`checkTransitionDeterminismSym`, `checkDeadEdgesSym`) are the opt-in, slower escalation that
needs z3 on PATH.

#### The runtime diagnostics (in `Keiki.Core`)

```haskell
-- src/Keiki/Core.hs
data EdgeRef s             = EdgeRef             { edgeSource :: s, edgeIndex :: Int }
data RejectedEdgeSummary s = RejectedEdgeSummary { rejectedEdge :: EdgeRef s, rejectedTarget :: s, rejectedGuard :: Bool }
data MatchedEdgeSummary s  = MatchedEdgeSummary  { matchedEdge :: EdgeRef s, matchedTarget :: s }

data StepFailure s
  = NoOutgoingEdges s                          -- the source vertex is terminal / has no edges
  | NoMatchingEdge  s [RejectedEdgeSummary s]  -- candidate edges, but none matched (wrong ctor or false guard)
  | AmbiguousEdges  s [MatchedEdgeSummary s]   -- >= 2 guards matched — a single-valuedness VIOLATION (a defect)

stepEither :: BoolAlg phi (RegFile rs, ci)
           => SymTransducer phi rs s ci co
           -> (s, RegFile rs) -> ci
           -> Either (StepFailure s) (s, RegFile rs, [co])
```

`step` collapses every failure to `Nothing`. `stepEither` is **purely additive**: it returns
the reason on `Left` and the **identical** success triple `(s, RegFile rs, [co])` on `Right`.
`NoOutgoingEdges` = the vertex is terminal / has no edges; `NoMatchingEdge` = there were
candidate edges but none matched (wrong constructor or a false guard) — these two are ordinary
**rejections**; `AmbiguousEdges` = two or more guards matched the same command, which is a
**single-valuedness violation** and therefore the **runtime witness of the build-time
`NondeterministicPair`** (they share the `EdgeRef` vocabulary). **Treat `AmbiguousEdges` as a
DEFECT, not an ordinary rejection** — it means the transducer is non-deterministic and the CI
gate should have caught it.

Critically (state on the step-failure page and the CI/diagnose how-tos): `delta`, `omega`,
`step`, and `stepEither` all decide guards via `models (guard e) (regs, ci)` — **concrete**
`evalPred`, **never z3**. The solver only appears in the symbolic build-time checks.

#### Build-time validation CI wiring

The canonical CI assertion (microseconds, no solver): place
`validateTransducer defaultValidationOptions t == []` in an hspec/HUnit case per aggregate and
per process manager. Add an opaque-audit case with `warnOpaqueGuards = True` to surface the
collection-slot signposts. Optionally add a slower group that escalates to the z3-backed
`checkTransitionDeterminismSym t == []` / `checkDeadEdgesSym t == []` — these need **z3 on
PATH** in CI. The test anchors `test/Keiki/ValidationSpec.hs`,
`jitsurei/test/Jitsurei/UserRegistrationSymbolicSpec.hs`, and
`jitsurei/test/Jitsurei/OrderCartSymbolicSpec.hs` show the shape; cross-check them.

### Fence/formatting rules (hard requirement)

Every fenced code block MUST carry a language tag. Use ` ```haskell ` for Haskell,
` ```json ` for `meta.json`, ` ```mermaid ` for diagrams, ` ```bash ` for shell, ` ```text `
for plain transcripts. Never write a bare ```` ``` ````. Include at least one ` ```mermaid `
diagram (the per-pair-per-vertex single-valuedness decision loop, on
`explanation/the-symbolic-ci-gate.mdx` or `walkthrough/symbolic-and-validation/00-start-here.mdx`)
and Haskell snippets containing ligature-bearing operators (`->`, `=>`, `<-`, `::`, `>>=`,
`<$>`) so the ligature rendering is exercised.


## Plan of Work

The work is grouped into four milestones, each independently verifiable by building the site
and viewing the pages. Author pages in IA order. The final milestone wires the sidebar
(`meta.json` files) and runs the full acceptance checks. All pages live under
`content/docs/keiki/`. Every page opens with a one-line "what this is" sentence and links back
to the keiki overview (`/docs/keiki`) and to the relevant reference page. Every page that
mentions an SMT solver states that z3/`sbv` is build/CI-time only and that the hot path uses
concrete evaluation.

**Page set (file → Diátaxis type → slug → test anchor → key content):**

| File | Type | Slug | Test anchor | Key content |
|---|---|---|---|---|
| `reference/symbolic.mdx` | Reference | `symbolic` | `test/Keiki/SymbolicSpec.hs` | the `Keiki.Symbolic` API: `Sym`/`SymRep` + the type registry (Integer over-approx, Text/UTCTime), `discoverSym`/`Ord`/`Num`, `SymEnv`/`mkSymEnv`/`translateTermSym`/`translatePred`, `SymPred`/`SymGuarded` + the `BoolAlg`/`Sat` instances, `symIsBot`/`symSatExt`, `ExtractRegFile`/`SomeInCtor`/`KnownInCtors`, `isSingleValuedSym`/`withSymPred`, `checkTransitionDeterminismSym`/`checkDeadEdgesSym` |
| `reference/validate.mdx` | Reference | `validate` | `test/Keiki/ValidationSpec.hs` | `validateTransducer` + `ValidationOptions`/`defaultValidationOptions` + the four `TransducerValidationWarning` constructors + the component checks (`checkTransitionDeterminism`(`Pure`)/`DeterminismWarning`, `checkDeadEdges`/`DeadEdgeOptions`/`DeadEdgeWarning`, `hiddenInputWarnings`/`opaqueGuardWarnings`). **Disambiguate from `Keiki.Render.Validate`.** |
| `reference/step-failure.mdx` | Reference | `step-failure` | `test/Keiki/StepEitherSpec.hs` | `stepEither`, `StepFailure` (3 variants), `EdgeRef`, `RejectedEdgeSummary`, `MatchedEdgeSummary`; contrast with `step`/`delta`/`omega`; **no `StepResult`** — the bare triple |
| `explanation/the-symbolic-ci-gate.mdx` | Explanation | `the-symbolic-ci-gate` | `jitsurei/test/Jitsurei/UserRegistrationSymbolicSpec.hs` | what single-valuedness is; how `isSingleValuedSym` + `symIsBot` decide it via z3; the per-pair-per-vertex decomposition; witnesses; soundness vs precision; build-time-only / not-hot-path; the `mermaid` decision-loop diagram |
| `explanation/single-valuedness-and-soundness.mdx` | Explanation (theory) | `single-valuedness-and-soundness` | `jitsurei/test/Jitsurei/OrderCartSymbolicSpec.hs` | the property formally; soundness vs precision; the curated-types / opaque-escape caveats; `Unknown`-conservative; memoization; **links to** EP-20's `/docs/keiki/explanation/why-smt` |
| `how-to/assert-a-transducer-is-well-formed-in-ci.mdx` | How-To | `assert-a-transducer-is-well-formed-in-ci` | `test/Keiki/ValidationSpec.hs`, `jitsurei/.../UserRegistrationSymbolicSpec.hs` | `validateTransducer defaultValidationOptions t == []` in a spec; toggle `ValidationOptions`; opt-in `warnOpaqueGuards`; escalate to z3-backed `checkTransitionDeterminismSym`/`checkDeadEdgesSym`; the z3-on-PATH CI requirement. **Disambiguate from `Keiki.Render.Validate`.** |
| `how-to/diagnose-a-rejected-command.mdx` | How-To | `diagnose-a-rejected-command` | `test/Keiki/StepEitherSpec.hs` | swap `step` → `stepEither`; pattern-match `StepFailure`; surface `NoOutgoingEdges`/`NoMatchingEdge` as rejections and `AmbiguousEdges` as a defect; map back to the build-time `NondeterministicPair` |
| `walkthrough/symbolic-and-validation/00-start-here.mdx` … `10-...` | Walkthrough | (subdir) | (per chapter, below) | the ordered source tour (11 files) |

### Milestones

- **M0 — Preconditions.** Confirm the toolchain, the keiki content tree, the EP-20
  foundation, and z3/`sbv` on PATH (for the build-time checks the examples reference) are
  present, and that the empty site builds. At the end: `pnpm build` succeeds before you add
  any EP-24 page; the keiki source is readable at `344c4ca` for cross-checking. Acceptance:
  see Concrete Steps.

- **M1 — Reference + explanation set** (3 reference pages under `reference/` + 2 explanation
  pages under `explanation/`). At the end: a reader can look up every symbolic, validation,
  and diagnostics signature, and understand the single-valuedness property and its decision
  procedure conceptually. **Scope:** `reference/symbolic.mdx`, `reference/validate.mdx`,
  `reference/step-failure.mdx`, `explanation/the-symbolic-ci-gate.mdx`,
  `explanation/single-valuedness-and-soundness.mdx`. **Work:** transcribe every signature from
  Context, copy-exact; use `<TypeTable>` for the `ValidationOptions` fields, the four warning
  constructors, the three `StepFailure` variants, and the `Sym` typeclass members; write the
  per-pair-per-vertex `mermaid` diagram on `the-symbolic-ci-gate.mdx`. **Commands:** `pnpm
  build` then `pnpm lint:links`. **Acceptance:** all five pages build and render; every
  validate page (here: `reference/validate.mdx`, plus the CI how-to in M2 and the validation
  walkthrough chapters in M3) carries the disambiguating sentence about `Keiki.Render.Validate`;
  no page mentions a `StepResult` type; every page that mentions z3 states it is build/CI-time
  only and the hot path uses concrete eval; `explanation/single-valuedness-and-soundness.mdx`
  links to `/docs/keiki/explanation/why-smt`; `reference/step-failure.mdx` shows the bare
  triple `(s, RegFile rs, [co])`.

- **M2 — How-to set** (2 pages under `how-to/`). At the end: a reader can put the pure
  `validateTransducer defaultValidationOptions t == []` assertion in a CI spec, toggle the
  options, opt into the opaque-guard audit, escalate to the z3-backed checks, and swap `step`
  for `stepEither` to diagnose a rejection. **Scope:**
  `how-to/assert-a-transducer-is-well-formed-in-ci.mdx`,
  `how-to/diagnose-a-rejected-command.mdx`. **Work:** real-API snippets anchored to
  `ValidationSpec`/`UserRegistrationSymbolicSpec` and `StepEitherSpec`; state the z3-on-PATH CI
  requirement; map `AmbiguousEdges` (runtime) back to `NondeterministicPair` (build-time).
  **Commands:** `pnpm build` then `pnpm lint:links`. **Acceptance:** both build; the CI guide
  shows the microsecond pure assertion **and** the opt-in z3 escalation and the
  `Keiki.Render.Validate` disambiguation; the diagnose guide pattern-matches all three
  `StepFailure` variants and frames `AmbiguousEdges` as a defect, not an ordinary rejection.

- **M3 — Code walkthrough** (`walkthrough/symbolic-and-validation/`: `00-start-here` + 10
  numbered chapters) + `walkthrough/symbolic-and-validation/meta.json`. At the end: an ordered,
  source-faithful tour over the real `Keiki.Symbolic` and the
  `validateTransducer`/`stepEither` surface of `Keiki.Core`, walked end to end at
  contribution-grade depth (every exported function/type, the key algorithms — the SBV
  translation in `translatePred`, the solver call in `symIsBot`, the witness reconstruction in
  `symSatExt`, the per-pair-per-vertex loop in `isSingleValuedSym` — and the test anchors that
  prove each). **Scope & chapter list (each chapter names its source file and its test
  anchor):**
  - `00-start-here.mdx` — the tour overview + reading order + the single-valuedness `mermaid`
    decision-loop diagram (if not placed on the explanation page); links to EP-21's model
    pages and EP-20's `why-smt`. Anchor: the whole tour.
  - `01-the-bug-and-the-property.mdx` — the non-determinism bug and the single-valuedness
    property that fixes it; the motivation. Ports the motivation that EP-20's `why-smt` §1
    states; anchor `jitsurei/test/Jitsurei/LoanApplicationSymbolicSpec.hs`.
  - `02-the-sym-typeclass-and-registry.mdx` — `Sym`/`SymRep`, the Integer over-approximation,
    `discoverSym`/`Ord`/`Num`. Anchor `test/Keiki/SymbolicSpec.hs`.
  - `03-translation-and-the-memo-cache.mdx` — `SymEnv`/`mkSymEnv`, `translateTermSym` naming
    (`reg/…`, `inp/…`), the `seVarCache` memo (why `proj #x .== proj #x` is valid). Anchor
    `test/Keiki/SymbolicSpec.hs` (memoization).
  - `04-sympred-and-the-boolalg-instance.mdx` — `SymPred`, the structural ops, `models` =
    concrete `evalPred`, `isBot` = `symIsBot`. Anchor `test/Keiki/SymbolicSpec.hs`.
  - `05-symisbot-and-witness-extraction.mdx` — `symIsBot`, `symSatExt`,
    `ExtractRegFile`/`pickCi`/`readModel`, the `Sat` instance. Anchor
    `jitsurei/test/Jitsurei/OrderCartSymbolicSpec.hs`.
  - `06-the-single-valuedness-gate.mdx` — `isSingleValuedSym`, `withSymPred`, the
    per-pair-per-vertex loop. Anchor `jitsurei/test/Jitsurei/UserRegistrationSymbolicSpec.hs`.
  - `07-build-time-validation-umbrella.mdx` — `validateTransducer`, `ValidationOptions`, the
    four warnings, `provablyOverlap`/`reachableVertices`. **Disambiguate from
    `Keiki.Render.Validate`.** Anchor `test/Keiki/ValidationSpec.hs`.
  - `08-opaque-guards-and-the-signpost.mdx` — `OpaqueGuard`,
    `predHasOpaqueTerm`/`termHasOpaqueApp`, the collection-content closure case. Anchor
    `test/Keiki/ValidationSpec.hs` (opaque-guard audit).
  - `09-solver-backed-diagnostics.mdx` — `checkTransitionDeterminismSym`/`checkDeadEdgesSym`
    (the answers the pure path cannot prove); the gotchas (pure determinism
    under-approximates; raw-`HsPred` `checkTransitionDeterminism` over-approximates;
    `checkDeadEdgesSym` flags only guards unsat in isolation, not unreachable register configs).
    Anchor `test/Keiki/ValidationSpec.hs` (the `PTop`-vs-`PInCtor` overlap case).
  - `10-runtime-rejection-diagnostics.mdx` — `stepEither`/`StepFailure`, the shared `EdgeRef`
    vocabulary, the build-time↔runtime mirror (`NondeterministicPair` ↔ `AmbiguousEdges`).
    Anchor `test/Keiki/StepEitherSpec.hs`.
  - **Optional `11-recompute-and-verify-derived-outputs.mdx`** — include **only if** it
    strengthens the tour (the `RecomputeVerifySpec` recompute-and-verify property). Anchor
    `test/Keiki/RecomputeVerifySpec.hs`. If included, append its slug to the subdir `meta.json`.

  **Work:** copy `content/docs/_templates/code-walkthrough.mdx`; each chapter quotes a short,
  source-faithful excerpt naming its file path; cross-chapter links are absolute. **Commands:**
  `pnpm build` then `pnpm lint:links`. **Acceptance:** the chapters build; each excerpt names
  its source file; cross-chapter links are absolute; the validation chapters carry the
  `Keiki.Render.Validate` disambiguation; the tour is navigable.

- **M4 — Sidebar + full acceptance.** Append EP-24 slugs to the section `meta.json` files;
  create `walkthrough/symbolic-and-validation/meta.json`; append `"symbolic-and-validation"`
  to `walkthrough/meta.json`. Acceptance: see Validation and Acceptance.


## Concrete Steps

Run all commands from the repo root `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` unless
stated otherwise. The docs toolchain is **pnpm** on **Node 22**.

### M0 — Preconditions

```bash
# confirm the scaffold + IA are present
test -f source.config.ts && test -f src/lib/source.ts && echo "app scaffold present"

# confirm the EP-20 keiki foundation has landed (hard dep)
test -f content/docs/keiki/index.mdx && echo "keiki overview present"
test -f content/docs/keiki/explanation/why-smt.mdx && echo "why-smt theory page present"
test -f docs/keiki-source-sync.md && echo "source-sync pointer present"
test -f content/docs/keiki/walkthrough/meta.json && echo "walkthrough hub present"

# confirm the section subdirectories exist
for d in explanation reference how-to walkthrough; do
  test -d "content/docs/keiki/$d" && echo "keiki/$d dir present"
done

# install + verify the site builds before you start
pnpm install
pnpm build
pnpm lint:links
```

Expected (abridged):

```text
app scaffold present
keiki overview present
why-smt theory page present
source-sync pointer present
walkthrough hub present
keiki/explanation dir present
...
✓ built in <N>s
```

If `content/docs/keiki/index.mdx` or `docs/keiki-source-sync.md` is missing, EP-20 has not
landed; stop and finish EP-20 first (it is a HARD DEP). If `why-smt.mdx` is missing, the
`single-valuedness-and-soundness` page still authors with the absolute link
`/docs/keiki/explanation/why-smt` (it resolves once EP-20 lands; do not block on it).

Confirm the keiki source path and the pinned commit for cross-checking (read-only; do not
edit), and confirm z3 + `sbv` are available for the build-time checks the examples reference:

```bash
mori registry show shinzui/keiki --full
# expect Path: /Users/shinzui/Keikaku/bokuno/keiki
ls /Users/shinzui/Keikaku/bokuno/keiki/src/Keiki/Symbolic.hs
ls /Users/shinzui/Keikaku/bokuno/keiki/src/Keiki/Core.hs
ls /Users/shinzui/Keikaku/bokuno/keiki/test/Keiki/ValidationSpec.hs
ls /Users/shinzui/Keikaku/bokuno/keiki/test/Keiki/StepEitherSpec.hs
ls /Users/shinzui/Keikaku/bokuno/keiki/jitsurei/test/Jitsurei/UserRegistrationSymbolicSpec.hs
z3 --version    # build/CI-time only; NOT a runtime dependency of the docs site
```

Read the source modules before transcribing any signature:

```bash
# the symbolic surface
grep -n "^class\|^data\|^newtype\|^type\|symIsBot\|symSatExt\|isSingleValuedSym\|withSymPred\|checkTransitionDeterminismSym\|checkDeadEdgesSym\|translatePred\|translateTermSym\|mkSymEnv\|SymPred\|ExtractRegFile\|KnownInCtors\|discoverSym" \
  /Users/shinzui/Keikaku/bokuno/keiki/src/Keiki/Symbolic.hs

# the validate umbrella + diagnostics (in Keiki.Core)
grep -n "validateTransducer\|ValidationOptions\|TransducerValidationWarning\|HiddenInput\|NondeterministicPair\|PossiblyDeadEdge\|OpaqueGuard\|defaultValidationOptions\|data StepFailure\|stepEither ::\|EdgeRef\|RejectedEdgeSummary\|MatchedEdgeSummary\|checkTransitionDeterminism\|checkDeadEdges\|DeterminismWarning\|DeadEdgeWarning\|provablyOverlap\|reachableVertices\|predHasOpaqueTerm\|termHasOpaqueApp" \
  /Users/shinzui/Keikaku/bokuno/keiki/src/Keiki/Core.hs

# confirm Keiki.Render.Validate is the UNRELATED Mermaid checker (for the disambiguation)
grep -n "validateMermaidDiagram\|validateMermaidAtlas\|module Keiki.Render.Validate" \
  /Users/shinzui/Keikaku/bokuno/keiki/src/Keiki/Render/Validate.hs
```

Confirm the MDX component registry so you author components bare (no imports):

```bash
grep -n "getMDXComponents\|Callout\|TypeTable\|Cards\|Steps\|Mermaid" src/components/mdx.tsx
```

### M1 — Reference + explanation set

Copy `content/docs/_templates/reference.mdx` for the three reference pages and
`content/docs/_templates/explanation.mdx` / `theory-explainer.mdx` for the two explanation
pages. Author the pages described in Plan of Work, transcribing every signature copy-exact
from Context (re-open the source to confirm). On `reference/validate.mdx`, the CI how-to, and
the validation walkthrough chapters, include the disambiguating sentence about
`Keiki.Render.Validate`. On `reference/step-failure.mdx`, show the bare triple and never a
`StepResult`. On `explanation/single-valuedness-and-soundness.mdx`, link to
`/docs/keiki/explanation/why-smt`. Then:

```bash
pnpm build
pnpm lint:links
```

### M2 — How-to set

Copy `content/docs/_templates/how-to.mdx`. Author the two how-tos described in Plan of Work.
Then `pnpm build` and `pnpm lint:links`.

### M3 — Code walkthrough

Copy `content/docs/_templates/code-walkthrough.mdx`. Author `00-start-here.mdx` + the 10
numbered chapters (and the optional 11th only if it strengthens the tour). Then `pnpm build`
and `pnpm lint:links`.

### M4 — Sidebar + full acceptance

Append this plan's slugs to the section `meta.json` files (after `index`, never reordering
existing entries). For example, `content/docs/keiki/reference/meta.json` becomes:

```json
{
  "title": "Reference",
  "pages": ["index", "symbolic", "validate", "step-failure"]
}
```

`content/docs/keiki/explanation/meta.json` gains `"the-symbolic-ci-gate"` and
`"single-valuedness-and-soundness"`; `content/docs/keiki/how-to/meta.json` gains
`"assert-a-transducer-is-well-formed-in-ci"` and `"diagnose-a-rejected-command"`. (Other plans
also append to these files; add only your slugs.)

Create `content/docs/keiki/walkthrough/symbolic-and-validation/meta.json` listing the chapters
in order:

```json
{
  "title": "Symbolic analysis & validation",
  "pages": [
    "00-start-here",
    "01-the-bug-and-the-property",
    "02-the-sym-typeclass-and-registry",
    "03-translation-and-the-memo-cache",
    "04-sympred-and-the-boolalg-instance",
    "05-symisbot-and-witness-extraction",
    "06-the-single-valuedness-gate",
    "07-build-time-validation-umbrella",
    "08-opaque-guards-and-the-signpost",
    "09-solver-backed-diagnostics",
    "10-runtime-rejection-diagnostics"
  ]
}
```

(If you included the optional 11th chapter, append `"11-recompute-and-verify-derived-outputs"`.)

Append `"symbolic-and-validation"` to `content/docs/keiki/walkthrough/meta.json` without
reordering existing entries — for example:

```json
{
  "title": "Code Walkthrough",
  "pages": ["index", "symbolic-and-validation"]
}
```

Do **not** add a hub `<Card href>` in `walkthrough/index.mdx` — EP-26 finalizes the hub hrefs.

Run the full acceptance gate:

```bash
pnpm typecheck
pnpm build
pnpm lint:links
```


## Validation and Acceptance

The change is a documentation-content change; "working" means the pages build, render,
link-check clean, and accurately reflect the shipped keiki source at `344c4ca`.

1. **Build is clean.** From the repo root, `pnpm typecheck` completes with no errors, and
   `pnpm build` exits 0 with **zero** crawler / `Failed to fetch` link-check warnings.
2. **Links resolve.** `pnpm lint:links` exits 0 (no broken internal links). Every cross-page
   link is absolute (`/docs/keiki/...`, `/docs/keiro/...`). The
   `single-valuedness-and-soundness` page links to `/docs/keiki/explanation/why-smt`; the
   symbolic/validate/step-failure pages link back to EP-21's
   `/docs/keiki/explanation/the-symtransducer`, `/docs/keiki/explanation/registers-vs-state`,
   and `/docs/keiki/reference/core`.
3. **Sidebar navigability.** Run `pnpm dev` and browse `http://localhost:3000/docs/keiki`. The
   three reference pages, two explanation pages, and two how-tos appear under their sections;
   the `walkthrough/symbolic-and-validation` tour appears in the walkthrough sidebar with all
   chapters in order and is reachable from the sidebar (even though the hub `<Card href>` is
   not yet wired — EP-26 does that).
4. **Signature accuracy.** Spot-check that every Haskell name and signature on the pages
   matches the source: `validateTransducer`, `ValidationOptions` (its four fields),
   `defaultValidationOptions`, the four `TransducerValidationWarning` constructors, the
   per-component checks, `stepEither`'s full signature, the three `StepFailure` variants, and
   the `Keiki.Symbolic` surface (`Sym`/`SymRep`, `symIsBot`/`symSatExt`, `isSingleValuedSym`,
   `withSymPred`, `checkTransitionDeterminismSym`/`checkDeadEdgesSym`). Re-open
   `src/Keiki/Core.hs` and `src/Keiki/Symbolic.hs` to confirm.
5. **The two accuracy corrections hold.** (a) `reference/validate.mdx`, the CI how-to, and the
   validation walkthrough chapters each contain one sentence disambiguating
   `validateTransducer` (in `Keiki.Core`) from `Keiki.Render.Validate` (the unrelated Mermaid
   checker, EP-25's). Grep for it: `grep -rl "Keiki.Render.Validate" content/docs/keiki`
   should list those pages. (b) No page introduces a `StepResult` type: `grep -rn "StepResult"
   content/docs/keiki` returns nothing; `reference/step-failure.mdx` shows the bare triple
   `(s, RegFile rs, [co])`.
6. **Hot-path / build-time framing.** Every page that mentions z3 or `sbv` states it is a
   **build/CI-time-only** dependency and that the per-event hot path
   (`delta`/`omega`/`step`/`stepEither`/`reconstitute`) decides guards by **concrete**
   evaluation, never the solver.
7. **Diagrams and ligatures.** At least one `mermaid` diagram renders (the
   per-pair-per-vertex single-valuedness loop). Haskell snippets contain ligature-bearing
   operators (`->`, `=>`, `::`, `>>=`).

A focused way to prove the change beyond compilation: before this plan, browsing
`/docs/keiki/reference/validate` returns a 404 / "coming soon"; after, it renders the
`validateTransducer` reference with the disambiguation, and the
`/docs/keiki/walkthrough/symbolic-and-validation` tour walks the real symbolic source end to
end.


## Idempotence and Recovery

All steps are additive and safe to repeat. Authoring a page is creating/overwriting one `.mdx`
file under `content/docs/keiki/`; re-running `pnpm build` / `pnpm lint:links` is
non-destructive. The only shared files this plan edits are the section `meta.json` files and
`walkthrough/meta.json`, which are **append-only** here: add only this plan's slugs, never
reorder or remove another plan's entries, so concurrent Phase-2 plans do not conflict. If a
`meta.json` append is duplicated by a re-run, de-duplicate the `pages` array (each slug appears
once). If `pnpm build` emits a crawler warning for a not-yet-authored target, it is a soft-dep
link (EP-20/EP-21 page) that resolves once that plan lands — confirm the link is absolute and
spelled correctly; do not add a `<Card href>` to the walkthrough hub (that is EP-26's job and
would otherwise emit a `Failed to fetch` warning).


## Interfaces and Dependencies

**Libraries / tools used at build/CI time only (not site runtime):** z3 (the SMT solver) and
the `sbv` Haskell binding (`Data.SBV`), referenced by the examples' build-time checks. The
docs site itself is fumadocs + TanStack Start (pnpm, Node 22); it has **no** solver
dependency.

**Source modules cross-checked (read-only, at `344c4ca`):**
`/Users/shinzui/Keikaku/bokuno/keiki/src/Keiki/Symbolic.hs` (the symbolic surface, re-exports
`Keiki.Core`); `/Users/shinzui/Keikaku/bokuno/keiki/src/Keiki/Core.hs` (`validateTransducer`,
`ValidationOptions`, the four warnings, the component checks, `stepEither`/`StepFailure`/`EdgeRef`/
`RejectedEdgeSummary`/`MatchedEdgeSummary`);
`/Users/shinzui/Keikaku/bokuno/keiki/src/Keiki/Render/Validate.hs` (the **unrelated** Mermaid
checker — read only to confirm the disambiguation; EP-25 documents it). Test anchors:
`test/Keiki/SymbolicSpec.hs`, `test/Keiki/ValidationSpec.hs`, `test/Keiki/StepEitherSpec.hs`,
`test/Keiki/RecomputeVerifySpec.hs`, and `jitsurei/test/Jitsurei/{UserRegistration,OrderCart,
LoanApplication}SymbolicSpec.hs`.

**Pages this plan authors (full path → slug → primary test anchor):**

- `content/docs/keiki/reference/symbolic.mdx` → `symbolic` → `test/Keiki/SymbolicSpec.hs`
- `content/docs/keiki/reference/validate.mdx` → `validate` → `test/Keiki/ValidationSpec.hs`
- `content/docs/keiki/reference/step-failure.mdx` → `step-failure` → `test/Keiki/StepEitherSpec.hs`
- `content/docs/keiki/explanation/the-symbolic-ci-gate.mdx` → `the-symbolic-ci-gate` →
  `jitsurei/test/Jitsurei/UserRegistrationSymbolicSpec.hs`
- `content/docs/keiki/explanation/single-valuedness-and-soundness.mdx` →
  `single-valuedness-and-soundness` → `jitsurei/test/Jitsurei/OrderCartSymbolicSpec.hs`
- `content/docs/keiki/how-to/assert-a-transducer-is-well-formed-in-ci.mdx` →
  `assert-a-transducer-is-well-formed-in-ci` → `test/Keiki/ValidationSpec.hs`,
  `jitsurei/test/Jitsurei/UserRegistrationSymbolicSpec.hs`
- `content/docs/keiki/how-to/diagnose-a-rejected-command.mdx` → `diagnose-a-rejected-command`
  → `test/Keiki/StepEitherSpec.hs`
- `content/docs/keiki/walkthrough/symbolic-and-validation/00-start-here.mdx` and
  `01-the-bug-and-the-property.mdx` … `10-runtime-rejection-diagnostics.mdx` (+ optional
  `11-recompute-and-verify-derived-outputs.mdx`) → anchors per the chapter list in Plan of
  Work.

**`meta.json` edits:**

- `content/docs/keiki/reference/meta.json` — append `"symbolic"`, `"validate"`,
  `"step-failure"`.
- `content/docs/keiki/explanation/meta.json` — append `"the-symbolic-ci-gate"`,
  `"single-valuedness-and-soundness"`.
- `content/docs/keiki/how-to/meta.json` — append `"assert-a-transducer-is-well-formed-in-ci"`,
  `"diagnose-a-rejected-command"`.
- `content/docs/keiki/walkthrough/meta.json` — append `"symbolic-and-validation"`.
- `content/docs/keiki/walkthrough/symbolic-and-validation/meta.json` — **new file**, listing
  the chapters in order.

**Cross-plan links (absolute, resolve once the target plan lands):**

- To **EP-21**: `/docs/keiki/explanation/the-symtransducer`,
  `/docs/keiki/explanation/registers-vs-state` (the `SymTransducer` model, state-vs-registers),
  and `/docs/keiki/reference/core` (the `HsPred` guard language, `BoolAlg`/`Sat`, and the
  `stepEither`/`StepFailure` surface at the introductory level — EP-21 introduces these; this
  plan documents the diagnostics deeply).
- To **EP-20**: `/docs/keiki/explanation/why-smt` (the SMT theory — linked from
  `single-valuedness-and-soundness`, **not** duplicated) and `/docs/keiki` (the overview).
- **Note for EP-25**: `Keiki.Render.Validate` (the Mermaid-diagram text checker) is EP-25's to
  document under rendering; this plan only disambiguates it from `validateTransducer`.
- **Note for EP-26**: this plan does **not** add the walkthrough hub `<Card href>`; EP-26
  wires it and runs the final whole-tree `meta.json` ordering pass.
