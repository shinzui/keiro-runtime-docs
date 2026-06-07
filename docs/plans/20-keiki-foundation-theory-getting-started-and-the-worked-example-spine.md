---
id: 20
slug: keiki-foundation-theory-getting-started-and-the-worked-example-spine
title: "Keiki foundation: theory, getting started, and the worked-example spine"
kind: exec-plan
created_at: 2026-06-07T04:53:26Z
master_plan: "docs/masterplans/3-keiki-framework-documentation-set.md"
---

# Keiki foundation: theory, getting started, and the worked-example spine

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, a reader who lands on `/docs/keiki` in this repository's documentation site
finds a real, accurate **foundation** for the **keiki** documentation set — not the "docs in
progress" placeholder that is there today. **keiki** (継起, "successive occurrence") is a pure,
dependency-free, IO-free Haskell **library you import** whose single formalism — the
**symbolic-register finite-state transducer**, written `SymTransducer phi rs s ci co` — models
event sourcing, workflow engines, and durable execution as **one** mathematical object. From one
declaration of that object keiki **mechanically derives** the command/replay machinery (a
decider, input/output acceptors, per-vertex views, composition combinators, and an opt-in SBV+z3
single-valuedness CI gate), so the "decide" half and the "evolve/replay" half of an aggregate
**cannot silently disagree**.

Concretely, after this plan a reader can:

- understand what keiki *is* and where it sits in the keiro runtime family — keiki is the
  **pure-semantics decision core**, distinct from **kiroku** (記録, the append-only PostgreSQL
  event store), **shibuya** (the supervised subscription/worker substrate), and **keiro** (経路,
  the framework that composes all three; keiro's `EventStream` literally marries a keiki
  `SymTransducer` to a codec, an initial state, and a snapshot policy);
- read the **theory foundation** as a thread of seven short explanation essays that build the
  formalism from the ground up: why one formalism instead of three runtimes; event sourcing and
  the decider pattern; finite automata and transducers (DFA → Mealy → FST); how event sourcing
  is *derived* from a transducer's projections; why data-carrying domains force predicates
  (Symbolic Finite Transducers) and registers (Streaming String Transducers); where keiki's
  `SymTransducer` sits in the Mealy-vs-FST hierarchy; and why an SMT solver (z3) is the only
  honest way to prove a guard set is unambiguous;
- follow a hands-on **getting-started tutorial** that builds the smallest useful aggregate —
  `EmailDelivery`, a two-vertex state machine — end to end with the `Keiki.Builder` DSL, feeds a
  command through the derived `step`/`delta`/`omega`, and watches `reconstitute` recover state
  with **no hand-written `evolve`** (the payoff), all against the **real** keiki API at the
  pinned commit;
- meet the **`jitsurei`** worked-example package (shipped *inside* the keiki repo at
  `jitsurei/src/Jitsurei/*.hs`) and read the canonical capability → module → test map that every
  other keiki doc page links into; and
- navigate the **Code Walkthrough hub** that introduces the five (still-unauthored) source tours.

You can see the result by running the docs dev server from the repo root
`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`: `pnpm dev` (which runs `vite dev`) and
browsing `http://localhost:3000/docs/keiki`. The keiki landing renders without the "in progress"
callout, shows a `<Cards>` index of the sections, and renders a `mermaid` diagram of the keiro
family; the sidebar carries seven theory essays under Explanation, a "Your first aggregate"
tutorial under Tutorials, and a Code Walkthrough hub that introduces the five tours.

This is the **foundation** plan (EP-20) of the keiki documentation MasterPlan
(`docs/masterplans/3-keiki-framework-documentation-set.md`). Every other keiki plan
(EP-21 … EP-26) hard-depends on it. Besides authoring its own pages, EP-20 is the **canonical
home of the shared authoring conventions** every downstream plan must obey (the absolute
cross-link rule, the source-over-notes snippet rule, the `walkthrough/` subdirectory layout, the
section-`meta.json` append protocol, the canonical jitsurei module map, and the
`docs/keiki-source-sync.md` source pointer) and it **owns the page-to-plan `meta.json` append
assignment summary** (the authoritative map of which plan appends which slugs to which section).
Those conventions are restated in full in this plan so EP-21 … EP-26 can cite EP-20 rather than
re-derive them from the MasterPlan.

This plan populates a subset of `content/docs/keiki/` and creates one repo-root file
(`docs/keiki-source-sync.md`). It does **not** build the docs app, the highlighter, the font, the
Mermaid component, or the IA/template system — those already exist and are owned by other
MasterPlans.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [x] M0. Preconditions verified (2026-06-06) — Node v22.22.3 + pnpm 11.4.0 on PATH, `node_modules`
      present, keiki stub tree present, baseline `pnpm typecheck` clean and `pnpm build` exits 0 with
      zero crawler warnings, keiki source readable at pinned commit `344c4ca` (keiki `0.1.0.0`,
      keiki-codec-json `0.1.0.0`).
- [x] M1. Landing overwritten (`content/docs/keiki/index.mdx`, "in progress" callout removed,
      section `<Cards>` index, keiro-family `mermaid`, "A taste" snippet) + the seven theory essays
      authored under `explanation/`: `why-one-formalism`, `event-sourcing-and-the-decider`,
      `finite-automata-and-transducers`, `deriving-event-sourcing`, `data-carrying-alphabets`,
      `mealy-vs-fst`, `why-smt`; `explanation/meta.json` appended. (2026-06-06)
- [x] M2. Getting-started tutorial authored (`tutorials/your-first-aggregate.mdx`): domain types
      → register slots + command/event records → TH derivations → builder block → `cabal build`
      → run a command through `step` → `reconstitute` recovers state with no hand-written
      `evolve`; `tutorials/meta.json` appended. Matches `jitsurei/src/Jitsurei/EmailDelivery.hs`.
      (2026-06-06)
- [x] M3. Source-sync pointer authored (`docs/keiki-source-sync.md`); walkthrough hub authored
      (`content/docs/keiki/walkthrough/index.mdx`, href-LESS `<Cards>`) + `walkthrough/meta.json`
      left at `["index"]`; the canonical jitsurei module map + shared conventions + the
      page-to-plan `meta.json` assignment summary fixed in this plan. (2026-06-06)
- [x] Final. `pnpm typecheck` clean; `pnpm build` exits 0 prerendering all new pages (60 keiki
      routes) with zero crawler warnings; `pnpm lint:links` exits 0 (204 files, no broken links);
      Haskell names cross-checked against pinned source `344c4ca`; no relative `./`/`../` cross-links
      in the keiki tree. (2026-06-06)


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

(None yet.)


## Decision Log

Record every decision made while working on the plan.

- Decision: **Port the keiki `docs/foundations/*` essays as theory-explainer EXPLANATION pages**,
  folding the orientation files `00-reading-guide.md` and `06-where-to-go-next.md` into the
  sidebar navigation and the landing/cross-links rather than authoring them as standalone pages.
  Rationale: the foundations files are already an ordered conceptual thread, but the reading-guide
  and where-next files are pure navigation — in a fumadocs site that role is served by `meta.json`
  ordering and `<Cards>`, so reproducing them as pages would duplicate the sidebar. Each remaining
  numbered file maps to exactly one explanation page (`01`→`why-one-formalism`,
  `02`→`event-sourcing-and-the-decider`, `03`→`finite-automata-and-transducers`,
  `04`→`deriving-event-sourcing`, `05`→`data-carrying-alphabets`), plus two companion notes
  (`docs/research/formalism-choice-…`→`mealy-vs-fst`, `docs/guide/why-smt.md`→`why-smt`).
  Date: 2026-06-07

- Decision: **The theory essays introduce the *formalism* and link FORWARD to EP-21's concrete
  model rather than re-deriving it.** EP-20's essays cover automata, projections, data-carrying
  alphabets, and the SMT motivation; the concrete `SymTransducer phi rs s ci co` treatment —
  what each type parameter means, control state `s` vs register file `rs`, and the
  `delta`/`omega`/`step`/`reconstitute` semantics — is **owned by EP-21**
  (`explanation/the-symtransducer.mdx`, `explanation/registers-vs-state.mdx`, Integration Point 5
  of the MasterPlan). EP-20 ends each essay's "lands on keiki" turn with an absolute forward link
  to those EP-21 pages so the two read as one thread without duplication.
  Rationale: a single owner per concept prevents the two plans from drifting into contradictory
  descriptions of the model; the MasterPlan's Dependency Graph already assigns the concrete model
  to EP-21.
  Date: 2026-06-07

- Decision: **Ship the walkthrough hub `<Cards>` WITHOUT `href`s** and set
  `content/docs/keiki/walkthrough/meta.json` to `["index"]` only.
  Rationale: the prerender crawler follows `<Card href>`s; a hub that forward-links to the five
  not-yet-authored tour pages (`walkthrough/core-and-builder/00-start-here`, etc.) makes
  `pnpm build` emit `[unhandledRejection] Failed to fetch …` crawler warnings even though the
  build exits 0, violating this plan's own "zero crawler warnings" gate — the hard-won lesson
  recorded in MasterPlan #2 (keiro EP-7) and in MasterPlan #3 Integration Point 2. The hub still
  ships as a `<Cards>` structure (titles + descriptions) so EP-26's finalization is a minimal diff
  (add five `href`s). Each Phase-2 plan appends its own subdir folder name to `walkthrough/meta.json`
  when it creates its subdir; **EP-26 adds the five hub `href`s** once every tour exists.
  Date: 2026-06-07

- Decision: **Document keiki as shipped at the pinned commit `344c4ca` (keiki `0.1.0.0`,
  keiki-codec-json `0.1.0.0`); trust the shipped source over the in-repo notes.** keiki's own
  `docs/research/*`, `docs/historical/*`, and `docs/plans/*` notes predate or diverge from the
  implementation (e.g. the `Keiki.Decider` record is now **five** fields with **two** state
  parameters — `decide`, `evolve`, `evolveStreaming`, `initialState`, `isTerminal` — not the
  four-field Chassaing record still quoted in the module haddock and the research notes). Where
  notes and source disagree, the source wins; cross-check every Haskell name.
  Date: 2026-06-07

- Decision: **Present any "decider" as the legacy/naive shape, not as the recommended API.** The
  theory essays may show a `decide :: c -> s -> [e]` / `evolve :: s -> e -> s` pair to motivate
  the formalism, but EP-20 frames it as the prior-art "decider pattern" and never promotes
  keiki's `Keiki.Decider` façade (`toDecider`) as the everyday way to run an aggregate. The
  recommended surface is the transducer itself (`step`/`delta`/`omega`/`reconstitute`). The full
  Decider-as-compatibility-façade framing is owned by EP-22 (MasterPlan Integration Point 6).
  Rationale: mirrors MasterPlan #2's "Decide → Transduce" lesson; the word "Decider" names a
  legacy shape, not keiki's preferred entry point.
  Date: 2026-06-07


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

**Outcome (2026-06-06).** EP-20 is complete and meets its purpose: `/docs/keiki` now opens on a real
overview (positioning paragraph, keiro-family `mermaid`, "A taste" snippet, section `<Cards>`), the
Explanation sidebar carries the seven theory essays in foundations order, Tutorials carries "Your
first aggregate", and the Code Walkthrough hub introduces the five tours with href-less cards. The
repo-root `docs/keiki-source-sync.md` pins `344c4ca`. The whole keiki tree builds clean (`pnpm build`
exit 0, zero crawler warnings, 60 keiki routes prerendered), typechecks, and link-checks (204 files,
no broken internal links).

**What went well.** The seven essays are ports of keiki's own `docs/foundations/*` thread, so the
source material was already an ordered conceptual sequence; the tutorial maps 1:1 onto
`jitsurei/src/Jitsurei/EmailDelivery.hs` so every name is source-verified. The href-less walkthrough
hub and the inline-code (non-link) forward references to EP-21's not-yet-authored
`the-symtransducer`/`registers-vs-state` pages kept the intermediate build crawler-clean — the
hard-won MasterPlan #2 lesson held.

**Hand-off to Phase 2.** The shared conventions, the canonical jitsurei module map, and the
page-to-plan `meta.json` append assignment summary are fixed in this plan's Context section; EP-21 …
EP-26 cite EP-20 rather than re-deriving them. EP-21 owns the concrete `SymTransducer` model pages
that `data-carrying-alphabets` points forward to.


## Context and Orientation

Read this whole section before editing. It is written so that a novice with only this file and
the working tree can complete the work.

### What you are building

You are writing MDX content files under `content/docs/keiki/` in **this** repository
(`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`) plus one Markdown file at the repo-root docs
directory (`docs/keiki-source-sync.md`). The site is a **fumadocs** documentation app
(fumadocs-ui + fumadocs-mdx) built on **TanStack Start as a static SPA** (React 19 + MDX,
TypeScript, Tailwind, bundled with **Vite**), built and served with **pnpm** on **Node 22**.
`pnpm dev` runs `vite dev` (port 3000); `pnpm build` runs `vite build` and emits a static SPA
that is prerendered by a crawler; `pnpm typecheck` runs `fumadocs-mdx && tsc --noEmit`;
`pnpm lint:links` is the repo's internal link checker (must exit 0). MDX is compiled by
fumadocs-mdx and rendered client-side.

Content lives under `content/docs/`. Each directory has a `meta.json` whose `pages` array lists
child page slugs (and nested directory names) in sidebar display order. A page is an `.mdx` file
with YAML frontmatter (`title`, `description`) followed by an MDX body.

The documented **code samples are Haskell** (the site is TypeScript, the subject is a Haskell
library). Every Haskell snippet must use keiki's real API, transcribed below and cross-checked
against the source at the pinned commit.

Two terms used throughout, defined once:

- **Diátaxis** is a documentation framework that sorts pages into four modes — Tutorial
  (learning-oriented, do-this-then-that), How-To Guide (task-oriented), Reference
  (information-oriented), and Explanation (understanding-oriented prose). EP-20 authors only
  Explanation pages (the theory essays) and one Tutorial; copy-me templates for each mode live
  under `content/docs/_templates/` (`tutorial.mdx`, `explanation.mdx`, `theory-explainer.mdx`,
  `reference.mdx`, `how-to.mdx`, `cookbook-recipe.mdx`, `code-walkthrough.mdx`, `faq.mdx`). The
  theory essays use the **`theory-explainer.mdx`** template specifically.
- **jitsurei** (実例, "worked example") is the runnable example package shipped *inside* the
  keiki repo at `jitsurei/` (not a sibling top-level repo). Its modules under
  `jitsurei/src/Jitsurei/*.hs` and their specs under `jitsurei/test/Jitsurei/*Spec.hs` are driven
  by the test suite. EP-20 introduces it; every later keiki page links into the same jitsurei
  modules.

### The current state of the keiki doc tree (what exists, what you change)

The keiki tree has already been scaffolded with placeholder pages. Running
`find content/docs/keiki -type f` today shows the landing (`index.mdx` + `meta.json`), a `faq.mdx`,
and the six section directories (`tutorials/ how-to/ reference/ explanation/ cookbook/
walkthrough/`), each with a stub `index.mdx` ("coming soon") and a `meta.json` whose `pages`
holds only `["index"]`. EP-20 touches only these:

```text
content/docs/keiki/index.mdx               <- OVERWRITE (remove "docs in progress" stub; real overview)
content/docs/keiki/meta.json               <- leave as-is (already lists the six sections + faq)
content/docs/keiki/explanation/index.mdx   <- leave as-is (EP-26 replaces "coming soon" with <Cards>)
content/docs/keiki/explanation/meta.json   <- APPEND your seven essay slugs (keep "index" first)
content/docs/keiki/tutorials/index.mdx     <- leave as-is (EP-26 replaces "coming soon")
content/docs/keiki/tutorials/meta.json     <- APPEND "your-first-aggregate" (keep "index")
content/docs/keiki/walkthrough/index.mdx   <- OVERWRITE (hub introducing the five tours; href-LESS)
content/docs/keiki/walkthrough/meta.json   <- OVERWRITE to {"title":"Code Walkthrough","pages":["index"]}
```

You will additionally **create** seven explanation pages, one tutorial page, and one repo-root
pointer file:

```text
content/docs/keiki/explanation/why-one-formalism.mdx              <- NEW
content/docs/keiki/explanation/event-sourcing-and-the-decider.mdx <- NEW
content/docs/keiki/explanation/finite-automata-and-transducers.mdx<- NEW
content/docs/keiki/explanation/deriving-event-sourcing.mdx        <- NEW
content/docs/keiki/explanation/data-carrying-alphabets.mdx        <- NEW
content/docs/keiki/explanation/mealy-vs-fst.mdx                   <- NEW
content/docs/keiki/explanation/why-smt.mdx                        <- NEW
content/docs/keiki/tutorials/your-first-aggregate.mdx             <- NEW
docs/keiki-source-sync.md                                         <- NEW (repo ROOT docs/, NOT content/)
```

The current `content/docs/keiki/meta.json` already lists the sections (do **not** change it):

```json
{
  "title": "keiki",
  "pages": ["index", "tutorials", "how-to", "reference", "explanation", "cookbook", "walkthrough", "faq"]
}
```

Note the section directory is `how-to/` (its sidebar title is "How-To Guides"); the tutorial
lives under `tutorials/`. Do not invent a parallel tree.

### The available MDX components (use them bare, no imports)

`src/components/mdx.tsx` registers these globally via `getMDXComponents`: `Callout`, `Step`,
`Steps`, `Tab`, `Tabs`, `Card`, `Cards`, `Accordion`, `Accordions`, `TypeTable`, and `Mermaid`.
Author MDX that uses them with **no `import` line**. A ` ```mermaid ` fence renders as an
interactive diagram. House conventions from the existing keiro/kiroku pages: lowercase-kanji
product names in prose ("keiki (継起)", "keiro (経路)", "kiroku (記録)"); the task-section nav
label is "How-To Guides"; prefer fumadocs-ui built-ins over custom components. Frontmatter on
every page is a `title:` plus a one-sentence `description:`.

### Fence/formatting rule (hard requirement)

Every fenced code block MUST carry a language tag: ` ```haskell `, ` ```mermaid `, ` ```json `,
` ```bash `, ` ```text `. Never write a bare ```` ``` ````. The landing must contain at least one
` ```mermaid ` diagram (the keiro family); every theory essay that shows a state machine must
render it as ` ```mermaid ` (re-draw any ASCII state diagram from the keiki notes as mermaid).
Haskell snippets must contain ligature-bearing operators (`->`, `=>`, `<-`, `::`, `>>=`, `<$>`)
so the highlighter's ligature support is exercised. Cross-page links are **absolute**
(`/docs/keiki/...`), never relative `./` or `../` (see the conventions section for why).

**Note on formatting:** hand-authored MDX in this repo does **not** pass `oxfmt --check` cleanly
repo-wide; do not reformat. Match the neighbouring `content/docs/keiro/*` file style.

### The subject: keiki, transcribed from source (use these REAL names)

Source of truth on disk (read-only; resolve the path with `mori registry show shinzui/keiki
--full`; the path at authoring time is `/Users/shinzui/Keikaku/bokuno/keiki`). The facts below are
transcribed from that tree at commit `344c4ca` (keiki `0.1.0.0`). Treat this subsection as your
API cheat-sheet; open the source only to confirm a detail.

**What keiki is.** keiki (継起, "successive occurrence") is a **pure, dependency-free, IO-free**
Haskell **library you import** — the decision core of the keiro runtime. Its one formalism is the
**symbolic-register finite-state transducer**, `SymTransducer phi rs s ci co`, a **hybrid** of two
classical ideas:

- a **Symbolic Finite Transducer (SFT)** — instead of one edge per input *symbol* (which fails for
  infinite domains like email addresses or money amounts), an edge is labelled by a **predicate**
  over the input; and
- a **Streaming String Transducer (SST)** — alongside the finite control **state** the machine
  carries a typed, copyless **register file** (data memory) updated as it transitions.

From one `SymTransducer` declaration keiki **mechanically derives** the Chassaing-shape `Decider`
(decide/evolve/evolveStreaming/initialState/isTerminal), the input/output `Acceptor`s, per-vertex
B-presentation projections (views), the composition combinators (`compose`/feedback/alternative),
the profunctor/Category/Strong/Choice/Arrow tower, and an opt-in **SBV+z3** single-valuedness CI
gate. The runtime evaluators (`delta`/`omega`/`applyEvent`/`reconstitute`) use **concrete**
predicate evaluation — there is **no solver in the hot path**; z3 is a **build-time, optional**
check only.

In the keiro family, keiki is the foundation for **pure semantics**, distinct from **kiroku**
(the append-only PostgreSQL event store), **shibuya** (the worker substrate), and **keiro** (the
framework). keiro's `EventStream` marries a keiki `SymTransducer` to a codec + initial state +
snapshot policy. keiki ships JSON via the sibling package **`keiki-codec-json`** (`0.1.0.0`).
keiki requires **GHC 9.12**; `nix develop` in the keiki repo provides ghc 9.12, cabal, and z3.

**The packages.** The keiki repo ships two library packages plus the example:

```text
keiki            -- the pure core library. Modules: Keiki.Core, Keiki.Builder, Keiki.Operators,
                 --   Keiki.Generics (+ Keiki.Generics.TH), Keiki.Decider, Keiki.Acceptor,
                 --   Keiki.Composition, Keiki.Profunctor, Keiki.Symbolic, Keiki.Shape,
                 --   Keiki.Render.{Mermaid,Markdown,Inspector,Pretty,Validate}, Keiki.NoThunks,
                 --   Keiki.Internal.Slots
keiki-codec-json -- the sibling JSON codec package (RegFile + event JSON)
jitsurei         -- the runnable worked-example package (inside the keiki repo): src/Jitsurei/*.hs,
                 --   test/Jitsurei/*Spec.hs
```

Both library packages are version `0.1.0.0`.

**The core type (`Keiki.Core`, verbatim record).** A `SymTransducer` is four fields — the
per-state out-edges, the initial control state, the initial register file, and the finality
predicate:

```haskell
data SymTransducer phi rs s ci co = SymTransducer
  { edgesOut    :: s -> [Edge phi rs ci co s]
  , initial     :: s
  , initialRegs :: RegFile rs
  , isFinal     :: s -> Bool
  }
```

Two readable aliases collapse the common predicate carrier (you will see both `HsPred` and the
alias in real code):

```haskell
type Pred    rs ci       = HsPred rs ci                              -- the v1 guard carrier
type Guarded rs s ci co   = SymTransducer (HsPred rs ci) rs s ci co  -- a transducer over HsPred
```

`HsPred rs ci` is keiki's guard language: a predicate over a register file and a command. `Edge`,
`Update`, `Term`, `OutTerm`, and `HsPred` are all defined in `Keiki.Core`; the **concrete model**
of these (parameter-by-parameter) is owned by EP-21 and is **not** re-derived in EP-20 — EP-20's
essays only need to *name* where the formalism lands.

**The runtime evaluators (`Keiki.Core`, verbatim signatures by name).** These are pure, concrete,
solver-free:

```haskell
delta       :: ...   -- one step: (s, RegFile rs) under a command -> Maybe (s, RegFile rs)
omega       :: ...   -- the output of one step: emitted events [co]
step        :: ...   -- delta + omega together: -> (s, RegFile rs, [co]) on success
applyEvent  :: ...   -- fold one event into (s, RegFile rs) — the replay step
reconstitute:: ...   -- replay a whole event log: [co] -> Maybe (s, RegFile rs)
```

The successful result of `step` is the bare triple `(s, RegFile rs, [co])` — there is **no**
`StepResult` wrapper type. `reconstitute` returns `Nothing` when an event log cannot be replayed
(for example, the deliberately-broken `UserRegistrationV0` foil, whose event schema drops a field
the replay needs — see the spine below).

**The authoring DSL (`Keiki.Builder`, verbatim names used in the EmailDelivery example).** You
build a transducer with `buildTransducer` and a `QualifiedDo` block of builder statements:

```haskell
B.buildTransducer initialState initialRegs isFinalPredicate do
  B.from <vertex> do
    B.onCmd <inCtor> $ \d -> B.do
      B.slot @"<slotName>" .= <expr from d>   -- (.=) is re-exported from Keiki.Builder
      ...
      B.emit <wireCtor> <TermFields>{ ... }
      B.goto <targetVertex>
```

`Guarded EmailRegs EmailVertex EmailCmd EmailEvent` is the type of the resulting transducer.

**The Template Haskell derivations (`Keiki.Generics.TH`, verbatim names).** From the command,
register-file, and event type names you derive the per-constructor input projections and guards,
the wire (event) constructors, and the per-vertex views:

```haskell
deriveAggregateCtors ''Cmd  ''Regs   [ ("CmdCtor", "CmdCtor"), ... ]   -- inCtorX, inpX, isX, ...
deriveWireCtors      ''Event         [ ("EvtCtor", "EvtCtor"), ... ]   -- wireX, ...TermFields
deriveView           ''Vertex ''Regs "SVertex" "View" "view" [ (vertex, [liveSlots]), ... ]
deriveAggregate      ''Cmd ''Regs ''Event ...                          -- the fused all-in-one splice
```

`Keiki.Generics.emptyRegFile :: RegFile rs` builds an initial register file in which each slot is
pre-bound to a deferred `"uninit: <slot>"` error (the EmailDelivery example aliases it as
`emptyEmailRegs`). The fused `deriveAggregate` bundles the three splices above; the EmailDelivery
example uses the three individually, which is the clearer teaching shape for the tutorial.

**The README "A taste" (verbatim, the getting-started seed).** The keiki README shows the smallest
useful aggregate in full — this is the exact shape the tutorial reproduces, and it matches
`jitsurei/src/Jitsurei/EmailDelivery.hs`:

```haskell
emailDelivery
  :: SymTransducer (HsPred EmailRegs EmailCmd)
                   EmailRegs EmailVertex EmailCmd EmailEvent
emailDelivery = B.buildTransducer EmailPending emptyRegFile
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

The README's closing line is the "aha": *"`Decider`, `Acceptor`, replay, and the per-vertex view
are all derived from this one declaration."* The register file shape is:

```haskell
type EmailRegs =
  '[ '("emailRecipient", Email)
   , '("emailSubject",   Subject)
   , '("emailSentAt",    UTCTime)
   ]
```

**The Decider façade (`Keiki.Decider`, verbatim — present as legacy/compat only).** `toDecider`
projects a `SymTransducer` onto the Chassaing-shape record. The shipped record has **five** fields
and **two** state parameters (the in-repo notes still quote a four-field record — trust the
source):

```haskell
data Decider c e s s_streaming = Decider
  { decide          :: ...
  , evolve          :: ...
  , evolveStreaming :: s_streaming -> e -> Maybe s_streaming
  , initialState    :: s
  , isTerminal      :: s -> Bool
  }

toDecider :: ... -> Decider c e (s, RegFile rs) (s, RegFile rs)
```

Per the Decision Log, EP-20 mentions the decider *pattern* only to motivate the formalism and
**never** promotes `toDecider` as the recommended API; the full façade framing is EP-22's.

**The symbolic gate (`Keiki.Symbolic`, by name).** `isSingleValuedSym` is the opt-in SBV+z3
single-valuedness check: it proves no two guards out of a vertex can both fire on the same input
with different outputs (the guard-overlap non-determinism bug). It costs roughly ten milliseconds
per call and runs at **build/CI time only**; z3 must be on `PATH` when it is invoked. EP-20's
`why-smt` essay explains *why* this matters (an EXPLANATION); the CI-wiring how-to is owned by
EP-24, and the concrete `Keiki.Symbolic` reference is EP-24's.

### The foundations essays → pages map (what to port, from where)

The keiki repo's `docs/foundations/*` files (read them before authoring — see Concrete Steps) are
the source for the theory thread. The mapping EP-20 follows:

```text
docs/foundations/00-reading-guide.md                      -> navigation only (NOT a page)
docs/foundations/01-problem-space.md                      -> explanation/why-one-formalism.mdx
docs/foundations/02-event-sourcing-and-the-decider.md     -> explanation/event-sourcing-and-the-decider.mdx
docs/foundations/03-finite-automata-and-transducers.md    -> explanation/finite-automata-and-transducers.mdx
docs/foundations/04-projections-and-deriving-event-sourcing.md -> explanation/deriving-event-sourcing.mdx
docs/foundations/05-data-carrying-alphabets.md            -> explanation/data-carrying-alphabets.mdx
docs/foundations/06-where-to-go-next.md                   -> navigation only (NOT a page)
docs/research/formalism-choice-mealy-machines-vs-finite-state-transducers.md -> explanation/mealy-vs-fst.mdx
docs/guide/why-smt.md                                     -> explanation/why-smt.mdx (port nearly verbatim)
```

The load-bearing facts each essay must carry (all verified against source at `344c4ca`):

- **why-one-formalism** — the three problems usually solved by three different runtimes (an event
  store, a workflow engine, a durable-execution engine) and the four seams between them (no single
  formal model; no mechanical derivation between command-handling and replay; opaque workflows;
  ad-hoc composition). The **keiki bet**: one formalism covers all three.
- **event-sourcing-and-the-decider** — event log vs current state; replay as
  `foldl evolve initial events`; the aggregate as a consistency boundary; the **decider pattern**
  `decide :: c -> s -> [e]` / `evolve :: s -> e -> s`; and the **hidden event-determinism
  contract**: `foldl evolve s (decide cmd s)` must equal the intended next state, or decide and
  replay silently disagree. Present the decider as the prior-art/naive shape (Decision Log).
- **finite-automata-and-transducers** — DFA → Mealy machine → finite-state transducer (FST), with
  **partiality** = invariants (a missing edge rejects), **ε-output** = silent transitions (a step
  that emits no event), and **final states** = lifecycle termination. Render the state diagrams as
  ` ```mermaid `.
- **deriving-event-sourcing** — the input/output **projections** π₁ (drop events → the command
  language) and π₂ (drop commands → the event language); **THE KEY RESULT** (verified in the
  source note at `docs/foundations/04` line 104): *the output projection's transition function IS
  `evolve`*, so replay is `foldlM evolve initialState`, and `decide` is ω restricted to valid
  commands. Why mechanical derivation by enumeration needs a **finite** command alphabet — which is
  exactly the constraint the next essay breaks.
- **data-carrying-alphabets** — infinite input domains (emails, money) break enumeration; the
  rejected EFSM/opaque-context attempt; the fix = **predicates not symbols** (Symbolic Finite
  Transducers) plus **registers** (Streaming String Transducers). Lands on keiki's
  `Edge`/`SymTransducer`/`Update`/`Term`/`OutTerm`/`HsPred` and the hidden-input check, and **links
  forward** to EP-21's `explanation/the-symtransducer.mdx` and `explanation/registers-vs-state.mdx`.
- **mealy-vs-fst** — the formalism hierarchy; SymTransducer = a **partial deterministic letter-FST
  with ε-output + final states + symbolic guards + a register file**. Where it sits and why.
- **why-smt** — port nearly verbatim from `docs/guide/why-smt.md`: the guard-overlap
  non-determinism bug, why ordinary tests miss it, what SMT/z3 is, `isSingleValuedSym`, the
  ~10ms-per-call cost, and the curated-types caveat. Keep it an EXPLANATION — the CI-wiring how-to
  is EP-24's.

**ACCURACY RULE.** Author every snippet against the shipped source at `344c4ca`. keiki's in-repo
`docs/research|historical|plans/*` notes predate/diverge from the code; trust the source, not the
notes (the Decider record above is the canonical example of the divergence).

### The canonical jitsurei worked-example spine (the module map)

This is the **single source of truth** for capability → module → test; every keiki plan
(EP-21 … EP-26) links into the **same** `jitsurei/src/Jitsurei/*.hs` modules and
`jitsurei/test/Jitsurei/*Spec.hs` specs so the example reads as one coherent story. Thread **one
domain per capability** so a reader never re-learns a domain to learn a feature. All paths are under
the keiki repo (`/Users/shinzui/Keikaku/bokuno/keiki/`):

```text
EmailDelivery   (smallest aggregate: one command SendEmail, one event EmailSent, two vertices
                 EmailPending -> EmailSentVertex; builder<->AST equivalence; B-view)
  -> jitsurei/src/Jitsurei/EmailDelivery.hs
  -> jitsurei/test/Jitsurei/EmailDeliveryBuilderSpec.hs, EmailDeliveryViewSpec.hs
  -> EP-20 getting-started + EP-21 authoring anchor

OrderCart       (richer lifecycle Empty -> OpenWithItems -> Reserved -> Paid -> Shipped ->
                 Delivered + Cancelled/Refunded; collection-as-scalar-tally; deriveAggregate fused
                 splice; symbolic witnesses; the benchmark anchor)
  -> jitsurei/src/Jitsurei/OrderCart.hs
  -> jitsurei/test/Jitsurei/OrderCartBuilderSpec.hs, OrderCartSymbolicSpec.hs, OrderCartSpec.hs
  -> EP-21 authoring + EP-24 symbolic anchor

UserRegistration (canonical event-sourced aggregate: full multi-vertex lifecycle, a multi-event
                 command, an equality guard, an epsilon/noEmit edge, a register file; the running
                 example for the theory essays)
  -> jitsurei/src/Jitsurei/UserRegistration.hs
  -> jitsurei/test/Jitsurei/UserRegistrationBuilderSpec.hs, UserRegistrationGSMSpec.hs,
     UserRegistrationViewSpec.hs, UserRegistrationSymbolicSpec.hs, UserRegistrationSpec.hs
  -> EP-20 theory running example + EP-21 authoring

UserRegistrationV0 (the deliberately broken schema: AccountConfirmedDataV0 OMITS confirmCode, so
                 reconstitute returns Nothing and the hidden-input check warns; the replay-failure
                 teaching foil)
  -> jitsurei/src/Jitsurei/UserRegistrationV0.hs
  -> jitsurei/test/Jitsurei/UserRegistrationV0Spec.hs
  -> EP-24 validation + EP-26 cookbook anchor

LoanApplication (multi-field threshold guards: credit >= 650 AND employment verified AND amount <=
                 a derived cap, expressed via PCmp inside an HsPred conjunction; the realistic SMT
                 domain)
  -> jitsurei/src/Jitsurei/LoanApplication.hs
  -> jitsurei/test/Jitsurei/LoanApplicationBuilderSpec.hs, LoanApplicationSymbolicSpec.hs,
     LoanApplicationViewSpec.hs, LoanApplicationSpec.hs
  -> EP-24 symbolic + EP-26 cookbook anchor

Loan / CoreBankingSync / LoanWorkflow (the composition capstone: Loan is a tiny downstream
                 aggregate; CoreBankingSync is a Process — events-in -> commands-out, cross-context;
                 LoanWorkflow is LoanApplication |> CoreBankingSync |> Loan wired via compose)
  -> jitsurei/src/Jitsurei/{Loan,CoreBankingSync,LoanWorkflow}.hs
  -> jitsurei/test/Jitsurei/{LoanSpec,CoreBankingSyncSpec,LoanWorkflowSpec}.hs
  -> EP-23 composition anchor + EP-26 process-manager tutorial
```

### The shared conventions EP-20 fixes for all downstream plans

These are the MasterPlan Integration Points, restated here so EP-20 is their canonical home. Every
keiki plan (EP-21 … EP-26) must obey them.

1. **Absolute cross-links only.** Cross-page links use absolute doc paths (`/docs/keiki/...`,
   `/docs/keiro/...`), never relative `./sibling` or `../section/page`. Reason (the hard-won
   kiroku/keiro lesson): in the static SPA the prerender crawler resolves a relative link against
   the *current path as a directory*, producing a nonexistent nested route — the build still exits
   0 but emits `[unhandledRejection] Failed to fetch …` for every such link and the link 404s for
   users. Always write the full `/docs/keiki/...` path.
2. **Source-over-notes snippet accuracy.** Author every Haskell snippet against the **shipped**
   keiki source at the pinned commit `344c4ca`. The in-repo `docs/research/*`, `docs/historical/*`,
   and `docs/plans/*` notes predate the implementation and diverge (renamed types, extra exports,
   the four-vs-five-field Decider). Trust the source; cross-check every name.
3. **The `walkthrough/` subdirectory layout.** Each Phase-2 plan owns a **disjoint** subdirectory
   under `content/docs/keiki/walkthrough/`, each with its own `meta.json`, a `00-start-here.mdx`,
   and numbered chapter files: EP-21 → `walkthrough/core-and-builder/`, EP-22 →
   `walkthrough/derivations/`, EP-23 → `walkthrough/composition/`, EP-24 →
   `walkthrough/symbolic-and-validation/`, EP-25 → `walkthrough/rendering-and-codecs/`. Disjoint
   subdirs mean parallel plans never collide on a shared numbered sequence. EP-20 creates only the
   hub page and `walkthrough/meta.json = ["index"]`.
4. **The section-`meta.json` append protocol.** Inside each section, the per-section `meta.json`
   `pages` array is appended to by several plans. Each plan appends **only its own** page slugs and
   never reorders or removes another plan's entries; never remove the existing `"index"` entry.
   **EP-26 owns the final ordering pass** of every section `meta.json` and replaces each section's
   "coming soon" `index.mdx` landing with a `<Cards>` index.
5. **The canonical jitsurei module map** (above) is the authoritative capability → module → test
   table; all plans link into the same `jitsurei/src/Jitsurei/*.hs` modules and their specs.
6. **The source-sync pointer** `docs/keiki-source-sync.md` (created by this plan) pins the reviewed
   upstream commit; all plans cross-check against it, and EP-26 finalizes its "most-coupled pages"
   list once every page exists.

### The page-to-plan `meta.json` append assignment summary (EP-20 owns this)

This is the authoritative map of which plan appends which slugs to which section `meta.json`.
EP-20 records it; each plan appends only its own slugs. (Phase-2/3 slug *names* are indicative —
each child plan fixes its exact slugs in its own Interfaces section — but the **section ownership**
below is fixed.)

```text
content/docs/keiki/explanation/meta.json
  EP-20 appends: why-one-formalism, event-sourcing-and-the-decider,
                 finite-automata-and-transducers, deriving-event-sourcing,
                 data-carrying-alphabets, mealy-vs-fst, why-smt
  EP-21 appends: the-symtransducer, registers-vs-state (+ its core/builder essays)
  EP-22 appends: decider-facade-and-when-to-use-it (+ its derivation essays)
  EP-23 appends: composition essays    EP-24 appends: symbolic/validation essays
  EP-25 appends: rendering/codec essays

content/docs/keiki/tutorials/meta.json
  EP-20 appends: your-first-aggregate
  EP-21/EP-26 append: further worked-example tutorials (owned there)

content/docs/keiki/reference/meta.json   -> EP-21..EP-25 (one capability's signatures each)
content/docs/keiki/how-to/meta.json      -> EP-21..EP-25 (one capability's tasks each)
content/docs/keiki/cookbook/meta.json    -> EP-26
content/docs/keiki/walkthrough/meta.json -> EP-20 sets ["index"]; each Phase-2 plan appends its
                                            subdir folder name; EP-26 final-orders + wires hrefs
content/docs/keiki/faq.mdx               -> EP-26
```


## Plan of Work

The work is three milestones plus a final acceptance pass. Each milestone is independently
verifiable by building the site and viewing the affected pages. Author the pages in reading order;
the final pass wires the sidebar slugs, the walkthrough hub, and the source pointer, and runs the
full acceptance checks. Each milestone's acceptance is the same shape: after authoring that
milestone's pages and appending their slugs to the relevant section `meta.json`, `pnpm build`
exits 0 with **zero** crawler warnings and `pnpm lint:links` exits 0.

**M0 — Preconditions.** Confirm the toolchain and that the keiki stub tree is present, that the
baseline builds, and that the keiki source is readable at the pinned commit. At the end you can run
`pnpm dev` and browse the (placeholder) `/docs/keiki`. Acceptance: `pnpm typecheck` clean and
`pnpm build` exits 0 with zero crawler warnings *before* you add any content;
`git -C <keiki> rev-parse HEAD` shows `344c4ca…`; `keiki.cabal` shows `version: 0.1.0.0`.

**M1 — Overview + the seven theory essays.** Overwrite `content/docs/keiki/index.mdx` (remove the
"docs in progress" stub; add the positioning paragraph, a section `<Cards>` index, and a `mermaid`
diagram of the keiro family). Author the seven explanation essays from the foundations map above,
using the `theory-explainer.mdx` template: `why-one-formalism`,
`event-sourcing-and-the-decider`, `finite-automata-and-transducers`, `deriving-event-sourcing`,
`data-carrying-alphabets`, `mealy-vs-fst`, `why-smt`. The first five form the numbered foundations
thread (`01`→`05`); `mealy-vs-fst` and `why-smt` are the two companion essays. Each essay defines
its terms in plain language, renders any state machine as ` ```mermaid `, uses the
**UserRegistration** domain as the running example where it needs a concrete aggregate, presents
any "decider" as the legacy/naive shape, and ends with a forward link: `data-carrying-alphabets`
links to EP-21's `the-symtransducer`/`registers-vs-state` (owned elsewhere — do not re-derive the
concrete model here). Append the seven slugs to `explanation/meta.json` (keeping `"index"` first).
At the end: `/docs/keiki` renders without the placeholder and the seven essays render in the
Explanation sidebar in foundations order. Acceptance: build clean, link-check clean; the landing
shows the `<Cards>` index and at least one `mermaid` diagram; the essays appear in the sidebar in
order.

**M2 — The getting-started tutorial.** Author `tutorials/your-first-aggregate.mdx` following the
`tutorial.mdx` template (wrap the walkthrough in `<Steps>`). Build the smallest aggregate,
**EmailDelivery**, end to end with `Keiki.Builder`, matching
`jitsurei/src/Jitsurei/EmailDelivery.hs` exactly. The steps:

1. **Domain types** — `Email`/`Subject` aliases (both `Text`).
2. **Register-file slots + command/event records** — the `EmailRegs` type-level slot list, and the
   `SendEmailData`/`EmailCmd` + `EmailSentData`/`EmailEvent` records (each `deriving Generic`).
3. **The TH derivations** — `deriveAggregateCtors ''EmailCmd ''EmailRegs [("SendEmail","SendEmail")]`,
   `deriveWireCtors ''EmailEvent [("EmailSent","EmailSent")]`, and
   `deriveView ''EmailVertex ''EmailRegs "SEmailVertex" "EmailView" "emailView" [...]` (or note the
   fused `deriveAggregate` alternative). Explain what each splice generates (`inCtorSendEmail`,
   `inpSendEmail`, `wireEmailSent`, `EmailSentTermFields`, the view).
4. **The builder block** — `B.buildTransducer EmailPending emptyEmailRegs isFinal do B.from … B.onCmd
   inCtorSendEmail $ \d -> B.do B.slot @"emailRecipient" .= d.recipient; …; B.emit wireEmailSent
   EmailSentTermFields{…}; B.goto EmailSentVertex` — the exact README shape.
5. **`cabal build`** — compile it (inside `nix develop` for GHC 9.12).
6. **Run a command** — feed `SendEmail …` through `step` (or the derived path) from `EmailPending`
   + `emptyEmailRegs` and observe it lands in `EmailSentVertex` emitting one `EmailSent`.
7. **`reconstitute`** — `reconstitute emailDelivery [EmailSent …]` recovers `(EmailSentVertex,
   regs)` with **NO hand-written `evolve`** — the payoff. State the README line explicitly.
8. **Optional `cabal test`** — point at `EmailDeliveryBuilderSpec`.

Note that **z3 is OPTIONAL** — it is only needed for the symbolic gate; the tutorial does not run
it, so a reader without z3 can complete the whole tutorial. Source anchors:
`jitsurei/src/Jitsurei/EmailDelivery.hs`, `jitsurei/test/Jitsurei/EmailDeliveryBuilderSpec.hs`, and
the README "A taste". A natural second tutorial (a build-time guard / safety example) may be
**named** as future work but is owned conceptually by EP-21/EP-24/EP-26 — do not author it here.
Append `your-first-aggregate` to `tutorials/meta.json` (keeping `"index"`). At the end: a reader
has a copy-pasteable, real-API aggregate authored end to end with the no-hand-written-evolve
payoff. Acceptance: build clean, link-check clean; every Haskell name in the snippet matches
`jitsurei/src/Jitsurei/EmailDelivery.hs`.

**M3 — Source-sync pointer, walkthrough hub, conventions, meta.json assignment.** Create
`docs/keiki-source-sync.md` (mirroring `docs/keiro-source-sync.md` structure exactly: Upstream
source / Last reviewed commit / Previous pointers / Update procedure). Overwrite
`content/docs/keiki/walkthrough/index.mdx` as a hub: a `<Cards>` block (href-**LESS**) introducing
the five Phase-2 tours (core-and-builder, derivations, composition, symbolic-and-validation,
rendering-and-codecs), with a prose/comment note explaining why the cards are href-less (the
crawler lesson). Set `content/docs/keiki/walkthrough/meta.json` to `{"title":"Code
Walkthrough","pages":["index"]}`. The canonical jitsurei module map, the shared conventions, and
the page-to-plan `meta.json` append assignment summary are already fixed in this plan's Context
section — M3 simply ensures they are authoritative. At the end: the sidebar shows the new pages,
the walkthrough hub introduces the ordered tours, and the source pointer exists. Acceptance: see
Validation.

**Final — Whole-set acceptance.** `pnpm typecheck` clean; `pnpm build` exits 0 prerendering the new
pages with **zero** crawler warnings; `pnpm lint:links` exits 0; no relative `./`/`../` cross-link
anywhere in `content/docs/keiki/`; every Haskell name used appears in the keiki source at `344c4ca`.


## Concrete Steps

Run all commands from the repo root `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` unless
stated otherwise. The docs toolchain is **pnpm** on **Node 22**.

### M0 — Preconditions

```bash
node --version    # expect v22.x
pnpm --version    # expect a pnpm 9/10/11 line
test -d node_modules || pnpm install

# the keiki stub tree must already exist (scaffolded by an earlier plan)
test -f content/docs/keiki/index.mdx && test -f content/docs/keiki/meta.json && echo "keiki stubs present"

# baseline must be green BEFORE you add content
pnpm typecheck
pnpm build 2>&1 | grep -iE "unhandledRejection|Failed to fetch" && echo "FAIL: baseline crawler warnings" || echo "OK: baseline clean"
pnpm lint:links
```

Expected (abridged):

```text
keiki stubs present
✓ built in <N>s
OK: baseline clean
```

Resolve the keiki source path and confirm the pinned commit (this is also how you read the
foundations files in M1):

```bash
KEIKI=$(mori registry show shinzui/keiki --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
echo "$KEIKI"
git -C "$KEIKI" rev-parse HEAD                 # expect 344c4cadd55e0b997cc2c6ce0ab687851d66fa31
grep -h '^version:' "$KEIKI"/keiki.cabal       # expect: version:         0.1.0.0
ls "$KEIKI"/docs/foundations/                  # the seven 00..06 foundations files
ls "$KEIKI"/jitsurei/src/Jitsurei/             # the spine modules
```

If the keiki tree is not at `344c4ca`, check it out read-only for cross-checking
(`git -C "$KEIKI" stash` / coordinate with the owner); do **not** modify it.

### M1 — Read the foundations, then author the overview + seven essays

First read the source material (do this before writing a word of prose):

```bash
KEIKI=$(mori registry show shinzui/keiki --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
for f in 00-reading-guide 01-problem-space 02-event-sourcing-and-the-decider \
         03-finite-automata-and-transducers 04-projections-and-deriving-event-sourcing \
         05-data-carrying-alphabets 06-where-to-go-next; do
  echo "===== docs/foundations/$f.md ====="; sed -n '1,400p' "$KEIKI/docs/foundations/$f.md"
done
sed -n '1,400p' "$KEIKI/docs/research/formalism-choice-mealy-machines-vs-finite-state-transducers.md"
sed -n '1,400p' "$KEIKI/docs/guide/why-smt.md"
```

**Overwrite `content/docs/keiki/index.mdx`.** Remove the "docs in progress" stub. Frontmatter
`title: keiki`, one-sentence `description:`. Body (positioning + a keiro-family `mermaid` + a
section `<Cards>` index). The positioning paragraph states: keiki is a **pure, dependency-free,
IO-free symbolic-register FST** that is the **decision core**; a **hybrid of SFT (predicate-labelled
edges) + SST (typed register file)**; it models **event sourcing + workflow + durable execution as
ONE formalism**; and it **mechanically derives** the Decider/Acceptors/projections/composition and
the SBV CI gate so **decide & evolve cannot disagree**. Place keiki in the family: keiki = pure
semantics; kiroku = Postgres event store; shibuya = worker substrate; keiro = the framework
composing all three (keiro's `EventStream` marries a keiki `SymTransducer` to a codec + snapshot
policy). The family `mermaid` (example):

```text
flowchart TB
  keiro["keiro · framework (composes all three)"]
  keiki["keiki · pure semantics (SymTransducer)"]
  kiroku["kiroku · PostgreSQL event store"]
  shibuya["shibuya · worker substrate"]
  keiro --> keiki
  keiro --> kiroku
  keiro --> shibuya
```

The section `<Cards>` index links to each section with absolute hrefs (these section landings
already exist, so hrefs here are safe):

```text
<Card title="Tutorials"  href="/docs/keiki/tutorials" .../>
<Card title="How-To Guides" href="/docs/keiki/how-to" .../>
<Card title="Reference"  href="/docs/keiki/reference" .../>
<Card title="Explanation" href="/docs/keiki/explanation" .../>
<Card title="Cookbook"   href="/docs/keiki/cookbook" .../>
<Card title="Code Walkthrough" href="/docs/keiki/walkthrough" .../>
```

**Author the seven essays** under `content/docs/keiki/explanation/` from the `theory-explainer.mdx`
template, each with `title:` + one-sentence `description:`, following the foundations map and the
load-bearing-facts list in §Context. Render every state machine as ` ```mermaid `. Use
**UserRegistration** as the running concrete aggregate where one is needed. End
`data-carrying-alphabets` with an absolute forward link to
`/docs/keiki/explanation/the-symtransducer` and `/docs/keiki/explanation/registers-vs-state` (EP-21
owns those pages; the links resolve once EP-21 ships — that is fine, the crawler only follows live
pages, and these are prose links, not `<Card href>`s; but to keep the intermediate build clean,
phrase them as inline prose links to a `(coming soon)` page **or** omit the link target until EP-21
exists — see Idempotence). Keep `why-smt` an EXPLANATION (no CI wiring). Then append the slugs:

```json
{
  "title": "Explanation",
  "pages": ["index", "why-one-formalism", "event-sourcing-and-the-decider", "finite-automata-and-transducers", "deriving-event-sourcing", "data-carrying-alphabets", "mealy-vs-fst", "why-smt"]
}
```

Build and check:

```bash
pnpm build 2>&1 | grep -iE "unhandledRejection|Failed to fetch" && echo "FAIL: broken links" || echo "OK: no crawler warnings"
pnpm lint:links
```

### M2 — `content/docs/keiki/tutorials/your-first-aggregate.mdx`

Use the `tutorial.mdx` template; wrap the build in `<Steps>`. Frontmatter:

```text
title:       "Your first aggregate"
description: "Build the smallest keiki aggregate end to end and watch replay recover state with no hand-written evolve."
```

Before authoring, transcribe the exact EmailDelivery source so the snippet matches it:

```bash
KEIKI=$(mori registry show shinzui/keiki --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
sed -n '1,220p' "$KEIKI/jitsurei/src/Jitsurei/EmailDelivery.hs"
sed -n '1,90p'  "$KEIKI/jitsurei/test/Jitsurei/EmailDeliveryBuilderSpec.hs"
```

Author the eight `<Steps>` from the M2 Plan of Work. The load-bearing builder snippet (verbatim
from the source — every name verified) is the README "A taste" block reproduced in §Context. The
replay payoff step shows:

```haskell
-- Step 7: replay recovers state with NO hand-written evolve.
reconstitute emailDelivery [EmailSent (EmailSentData "alice@x" "Subject" t0)]
  -- => Just (EmailSentVertex, regs)   -- regs has emailRecipient/emailSubject/emailSentAt bound
```

Add a `<Callout type="info">` that z3 is **optional** (only the symbolic gate needs it; this
tutorial does not run it). Append the slug:

```json
{
  "title": "Tutorials",
  "pages": ["index", "your-first-aggregate"]
}
```

Build/check as in M1.

### M3 — Source pointer, walkthrough hub, meta.json

**Create `docs/keiki-source-sync.md`** (repo ROOT `docs/`, NOT `content/`), mirroring
`docs/keiro-source-sync.md` structure exactly (Upstream source / Last reviewed commit / Previous
pointers / Update procedure). The facts to encode:

- Qualified name (mori): `shinzui/keiki` — resolve the path with `mori registry show shinzui/keiki
  --full`. Path at last sync: `/Users/shinzui/Keikaku/bokuno/keiki`.
- Relevant packages: `keiki` (`0.1.0.0`: modules `Keiki.Core`, `Keiki.Builder`, `Keiki.Operators`,
  `Keiki.Generics` (+ `Keiki.Generics.TH`), `Keiki.Decider`, `Keiki.Acceptor`, `Keiki.Composition`,
  `Keiki.Profunctor`, `Keiki.Symbolic`, `Keiki.Shape`, `Keiki.Render.*`, `Keiki.NoThunks`); the
  sibling `keiki-codec-json` (`0.1.0.0`); and `jitsurei` (the runnable worked examples, inside the
  keiki repo).
- The pin block (a ` ```text ` fence):

```text
344c4cadd55e0b997cc2c6ce0ab687851d66fa31  (344c4ca)
2026-06-06
keiki 0.1.0.0 (pre-Hackage)
```

- The **"trust source over in-repo notes"** caveat: keiki's `docs/research/*`, `docs/historical/*`,
  and `docs/plans/*` notes predate/diverge from the shipped code (the canonical example: the
  `Keiki.Decider` record is **five** fields with **two** state params, not the four-field record the
  notes quote). Trust the shipped source.
- The **most-coupled pages** (the ones a source change most likely invalidates): the Phase-2
  walkthrough chapters; the signature-transcribing reference pages; the `data-carrying-alphabets`
  and `deriving-event-sourcing` essays; and the EmailDelivery snippet in
  `tutorials/your-first-aggregate.mdx`. Note EP-26 finalizes this list once every page exists.
- The **Update procedure**: resolve the path via mori, then
  `git -C "$KEIKI" log --oneline 344c4ca..HEAD`; update affected pages; replace the Last-reviewed
  block with the new `HEAD` and move the old SHA into **Previous pointers** with a one-line summary.

**Overwrite `content/docs/keiki/walkthrough/index.mdx`** as a hub. Frontmatter title
`Code Walkthrough`. Body: one paragraph explaining these are **ordered source tours** that read the
real keiki source, then a `<Cards>` block **without `href`s** introducing the five tours, plus a
short prose note (or an MDX comment) on *why* the cards are href-less:

````mdx
---
title: Code Walkthrough
description: "Ordered tours through keiki's real source — one per capability."
---

These are **ordered source tours**: numbered chapters that read keiki's real Haskell source to
teach how each capability is built. There is one tour per capability; the chapters for each tour are
authored by that capability's documentation plan.

{/* The cards below are intentionally href-less. The prerender crawler follows <Card href>s; linking
    to a not-yet-authored tour page makes `pnpm build` emit "Failed to fetch" crawler warnings. The
    finalization plan (EP-26) adds the hrefs once every tour exists. */}

<Cards>
  <Card title="The transducer core and builder" description="Keiki.Core, the Edge/Update/Term/HsPred surface, and the Keiki.Builder authoring DSL." />
  <Card title="The derivations" description="Keiki.Decider, Keiki.Acceptor, the Generics TH splices, and Keiki.Shape." />
  <Card title="The composition algebra" description="Keiki.Composition and Keiki.Profunctor: process managers, sagas, choreography." />
  <Card title="Symbolic analysis and validation" description="Keiki.Symbolic (the SBV/z3 gate) and the validateTransducer umbrella." />
  <Card title="Rendering and codecs" description="Keiki.Render.* and the sibling keiki-codec-json package." />
</Cards>
````

**Overwrite `content/docs/keiki/walkthrough/meta.json`** to list only the hub (each Phase-2 plan
appends its own subdir folder name when it creates its subdir):

```json
{
  "title": "Code Walkthrough",
  "pages": ["index"]
}
```

Then build and preview:

```bash
pnpm typecheck
pnpm build 2>&1 | grep -iE "unhandledRejection|Failed to fetch" && echo "FAIL: broken links" || echo "OK: no crawler warnings"
pnpm lint:links
pnpm dev    # browse http://localhost:3000/docs/keiki
```


## Validation and Acceptance

Exercise the system and observe specific behaviors (phrase acceptance as observable behavior):

1. **The set builds and typechecks.** From the repo root, `pnpm typecheck` exits 0 (so the
   generated `.source/` collection picks up the new pages) and `pnpm build` exits 0, emitting the
   static SPA. Expected tail (abridged):

   ```text
   ✓ built in <N>s
   ```

2. **No crawler warnings.** The build log contains **no** `unhandledRejection` or `Failed to fetch`
   lines (those indicate a broken/relative cross-link, or a `<Card href>` to a not-yet-authored
   page):

   ```bash
   pnpm build 2>&1 | grep -iE "unhandledRejection|Failed to fetch" && echo "FAIL: broken links" || echo "OK: no crawler warnings"
   ```

3. **Link check passes.** `pnpm lint:links` exits 0 (no broken internal links).

4. **No relative cross-links in the keiki tree.** Every cross-page link is absolute:

   ```bash
   grep -rnE "\]\(\.\.?/" content/docs/keiki && echo "FAIL: relative link present" || echo "OK: links absolute"
   ```

5. **Renders in the sidebar.** Run `pnpm dev`, open `http://localhost:3000/docs/keiki`. The landing
   renders with **no** "in progress" stub, shows the section `<Cards>` index, and renders the keiro
   family `mermaid`. Under **Explanation** the sidebar shows the seven essays in foundations order:
   "why one formalism", "event sourcing and the decider", "finite automata and transducers",
   "deriving event sourcing", "data-carrying alphabets", "Mealy vs FST", "why SMT". Under
   **Tutorials**: "Your first aggregate". The **Code Walkthrough** hub renders five **href-less**
   cards (clicking them does nothing — by design). Every page opens without a 404 and shows its
   frontmatter title.

6. **The tutorial snippet matches the source.** The EmailDelivery builder snippet in
   `tutorials/your-first-aggregate.mdx` matches `jitsurei/src/Jitsurei/EmailDelivery.hs`:

   ```bash
   KEIKI=$(mori registry show shinzui/keiki --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   grep -n "buildTransducer\|inCtorSendEmail\|wireEmailSent\|EmailSentTermFields\|emptyEmailRegs\|EmailSentVertex" \
     "$KEIKI/jitsurei/src/Jitsurei/EmailDelivery.hs"
   ```

   Acceptance: every constructor/function named in the snippet appears in the source with the same
   spelling.

7. **Snippets match the real API.** Cross-check every Haskell name used in a theory/tutorial snippet
   against the keiki source at the pinned commit:

   ```bash
   KEIKI=$(mori registry show shinzui/keiki --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   grep -n "data SymTransducer"  "$KEIKI/src/Keiki/Core.hs"
   grep -n "type Guarded"        "$KEIKI/src/Keiki/Core.hs"
   grep -n "^reconstitute ::\|^step ::\|^delta ::\|^omega ::\|^applyEvent ::" "$KEIKI/src/Keiki/Core.hs"
   grep -n "data Decider"        "$KEIKI/src/Keiki/Decider.hs"   # expect 5 fields / 2 state params
   grep -n "isSingleValuedSym"   "$KEIKI/src/Keiki/Symbolic.hs"
   ```

   Acceptance: every function/type/constructor named in a snippet appears in the keiki source with
   the signature transcribed in §Context (in particular the 5-field Decider, not 4).

8. **The source pointer exists and pins the right commit.**

   ```bash
   grep -n "344c4ca" docs/keiki-source-sync.md && echo "OK: pinned"
   ```


## Idempotence and Recovery

All steps are file authoring and are safe to repeat: re-running `pnpm typecheck`/`pnpm build`/
`pnpm lint:links`/`pnpm dev` is idempotent; editing or recreating an `.mdx`/`meta.json`/`.md` file
simply overwrites it. No database, no app code, and no keiki source is modified by this plan (the
keiki tree is opened read-only for cross-checking only).

Recovery:

- If a page breaks the build, the error names the offending `.mdx` file and line; fix the MDX (most
  often an untagged fence, an unexpected `<` in prose, or a relative link) and rebuild.
- If the sidebar order or a group is wrong, edit the relevant `meta.json` `pages` array; no rebuild
  of other pages is needed. Never remove the existing `"index"` entry; only append.
- **The forward links to EP-21's not-yet-authored pages** (`the-symtransducer`,
  `registers-vs-state`) are the one crawler hazard in EP-20. If `pnpm build` emits a `Failed to
  fetch` line for either, you wrote them as a live `<Card href>` or a link the crawler follows;
  resolve by phrasing them as plain prose ("EP-21's *the-symtransducer* page continues here") with
  the link target deferred until that page exists, exactly as the walkthrough hub defers its tour
  hrefs. The build/link-check gate (Validation 2 and 3) is the detector.
- If a snippet diverges from the real API, fix the snippet to match the keiki source (the source is
  authoritative over this plan's transcription) and record the divergence in Surprises &
  Discoveries.
- To start a page over, delete the `.mdx` and re-author it from its outline in Concrete Steps.


## Interfaces and Dependencies

**Libraries / systems referenced by the content (Haskell, the documented subject), all at keiki
`0.1.0.0` / keiki-codec-json `0.1.0.0`, commit `344c4ca`:**

- `keiki` — the pure core library. Modules named in EP-20 snippets: `Keiki.Core` (`SymTransducer`,
  `Guarded`, `Edge`, `Update`, `Term`, `OutTerm`, `HsPred`; the runtime evaluators `delta`, `omega`,
  `step`, `applyEvent`, `reconstitute`; `isFinal`/`edgesOut`); `Keiki.Builder` (`buildTransducer`,
  `from`, `onCmd`, `slot`, `emit`, `goto`, `(.=)`); `Keiki.Generics` (`emptyRegFile`) and
  `Keiki.Generics.TH` (`deriveAggregateCtors`, `deriveWireCtors`, `deriveView`, `deriveAggregate`);
  `Keiki.Decider` (`Decider`, `toDecider` — named as legacy only); `Keiki.Symbolic`
  (`isSingleValuedSym` — named in the `why-smt` essay only).
- `keiki-codec-json` — the sibling JSON codec package; named in the overview/source-sync only (its
  reference is EP-25's).
- `jitsurei` (inside the keiki repo) — the worked example; the canonical module map and the
  EmailDelivery tutorial anchor.

**Tooling / app (TypeScript, the docs site — TanStack Start static SPA):** fumadocs
(`fumadocs-core`, `fumadocs-ui`, `fumadocs-mdx`) — MDX content + sidebar from `meta.json`; built-in
components `Callout`, `Steps`, `Step`, `Cards`, `Card`, `Tabs`, `TypeTable`, `Mermaid` registered in
`src/components/mdx.tsx`. TanStack Start + Vite — `pnpm dev` = `vite dev`; `pnpm build` =
`vite build`; `pnpm typecheck` = `fumadocs-mdx && tsc --noEmit`; `pnpm lint:links` = the link
checker. pnpm + Node 22.

**Files this plan creates** (full repo-relative path + slug + scope line + source/jitsurei anchor):

```text
content/docs/keiki/explanation/why-one-formalism.mdx               slug why-one-formalism
  scope: three problems / three runtimes; the four seams; the keiki bet.
  anchor: keiki docs/foundations/01-problem-space.md.
content/docs/keiki/explanation/event-sourcing-and-the-decider.mdx  slug event-sourcing-and-the-decider
  scope: event log vs state; replay = foldl evolve; the decider pattern; the event-determinism contract.
  anchor: keiki docs/foundations/02-…; running example UserRegistration.
content/docs/keiki/explanation/finite-automata-and-transducers.mdx slug finite-automata-and-transducers
  scope: DFA -> Mealy -> FST; partiality=invariants, epsilon-output=silent steps, final states=termination.
  anchor: keiki docs/foundations/03-…; state diagrams rendered as mermaid.
content/docs/keiki/explanation/deriving-event-sourcing.mdx         slug deriving-event-sourcing
  scope: input/output projections pi1/pi2; THE KEY RESULT (pi2's transition function IS evolve);
         finite command alphabet requirement -> the data problem.
  anchor: keiki docs/foundations/04-… (key result at line 104).
content/docs/keiki/explanation/data-carrying-alphabets.mdx         slug data-carrying-alphabets
  scope: infinite alphabets break enumeration; predicates (SFT) + registers (SST);
         lands on Edge/SymTransducer/Update/HsPred + the hidden-input check. FORWARD-LINKS to EP-21.
  anchor: keiki docs/foundations/05-…; jitsurei UserRegistration / UserRegistrationV0.
content/docs/keiki/explanation/mealy-vs-fst.mdx                    slug mealy-vs-fst
  scope: the hierarchy; SymTransducer = partial deterministic letter-FST + epsilon-output + final
         states + symbolic guards + register file.
  anchor: keiki docs/research/formalism-choice-mealy-machines-vs-finite-state-transducers.md.
content/docs/keiki/explanation/why-smt.mdx                         slug why-smt
  scope: the guard-overlap bug; why tests miss it; what SMT/z3 is; isSingleValuedSym; ~10ms/call;
         curated-types caveat. EXPLANATION only (CI wiring is EP-24).
  anchor: keiki docs/guide/why-smt.md; Keiki.Symbolic.
content/docs/keiki/tutorials/your-first-aggregate.mdx              slug your-first-aggregate
  scope: build EmailDelivery end to end with Keiki.Builder; run a command via step; reconstitute
         recovers state with no hand-written evolve.
  anchor: jitsurei/src/Jitsurei/EmailDelivery.hs, jitsurei/test/Jitsurei/EmailDeliveryBuilderSpec.hs,
          README "A taste".
docs/keiki-source-sync.md                                          (repo-root pointer; not a doc page)
  scope: pins keiki 344c4ca / keiki-codec-json 0.1.0.0; Upstream/Last-reviewed/Previous/Update sections.
```

**Files this plan overwrites:**

```text
content/docs/keiki/index.mdx               title "keiki"            (landing; remove "in progress" stub; section <Cards> + family mermaid)
content/docs/keiki/walkthrough/index.mdx   title "Code Walkthrough" (hub with five href-LESS <Cards>)
content/docs/keiki/walkthrough/meta.json   {"title":"Code Walkthrough","pages":["index"]}
content/docs/keiki/explanation/meta.json   append the seven essay slugs (keep "index" first)
content/docs/keiki/tutorials/meta.json     append "your-first-aggregate" (keep "index")
```

**The meta.json edits EP-20 makes** (the append protocol; never remove `"index"`):

- `explanation/meta.json`: append `why-one-formalism`, `event-sourcing-and-the-decider`,
  `finite-automata-and-transducers`, `deriving-event-sourcing`, `data-carrying-alphabets`,
  `mealy-vs-fst`, `why-smt`.
- `tutorials/meta.json`: append `your-first-aggregate`.
- `walkthrough/meta.json`: set to `{"title":"Code Walkthrough","pages":["index"]}` (each Phase-2
  plan appends its own subdir folder name later).

The authoritative cross-section page-to-plan assignment summary is in §Context ("The page-to-plan
`meta.json` append assignment summary").

**Cross-plan forward-links (owned elsewhere).** EP-20's `data-carrying-alphabets` essay links
forward to EP-21's `/docs/keiki/explanation/the-symtransducer` and
`/docs/keiki/explanation/registers-vs-state` (the concrete `SymTransducer` model — EP-21 owns it,
EP-20 does not re-derive it). Per the Decision Log, EP-20 ships the **walkthrough hub `<Cards>`
WITHOUT `href`s**; **EP-26 adds the five hub `href`s** (one per tour, pointing at each tour's
`00-start-here`) and runs the final `walkthrough/meta.json` ordering pass once every Phase-2 tour
exists.

**Files this plan does NOT touch** (owned by other plans): `content/docs/keiki/meta.json` (already
lists the sections + faq — leave it); `content/docs/keiki/{how-to,reference,cookbook}/**`;
`content/docs/keiki/faq.mdx` (EP-26); and the section `index.mdx` "coming soon" landings under
`explanation/`, `tutorials/`, etc. (EP-26 replaces those with `<Cards>`).

**Postconditions / interfaces that must exist at the end:**

- All nine created files and all five overwritten targets exist; the site builds (`pnpm build`
  exits 0 with zero crawler warnings), typechecks (`pnpm typecheck` exits 0), and link-checks
  (`pnpm lint:links` exits 0).
- The keiki subtree renders in the sidebar with the seven Explanation essays in foundations order,
  the getting-started tutorial, and the Code Walkthrough hub (href-less cards).
- Every Haskell name in a snippet is present in the keiki source at `344c4ca` (verified per
  Validation 6–7), including the **5-field** `Keiki.Decider` record.
- No relative `./`/`../` cross-link exists anywhere under `content/docs/keiki/` (Validation 4).
- `docs/keiki-source-sync.md` exists and pins `344c4ca` (Validation 8).
- The six shared conventions, the canonical jitsurei module map, and the page-to-plan `meta.json`
  assignment summary are stated in this plan so EP-21 … EP-26 can cite EP-20.
