---
id: 26
slug: keiki-domain-cookbook-worked-example-tutorials-faq-and-finalization
title: "Keiki domain cookbook, worked-example tutorials, FAQ, and finalization"
kind: exec-plan
created_at: 2026-06-07T04:53:26Z
master_plan: "docs/masterplans/3-keiki-framework-documentation-set.md"
---

# Keiki domain cookbook, worked-example tutorials, FAQ, and finalization

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

**keiki** (経機) is a pure, dependency-free Haskell *library you import* — not a server, not a
runtime. Its one formalism, the **symbolic-register finite-state transducer**
`SymTransducer phi rs s ci co`, models event-sourced aggregates, process managers, and sagas as a
single mathematical object: a finite control **state** `s` (the lifecycle vertices), a typed
**register file** `rs` (data memory carried alongside the state), edges labelled by **predicates**
over an infinite input domain (not enumerated symbols), and commands-in / events-out. From one
declaration keiki mechanically derives the decider, the acceptors, per-vertex projections, the
composition combinators, and an opt-in SBV+z3 single-valuedness check — so the "decide" and
"evolve" halves of an aggregate cannot silently disagree. keiki's documentation lives under
`content/docs/keiki/` in this repository's **fumadocs** + **TanStack Start** static single-page
app (a "SPA" — a website whose pages render in the browser via JavaScript rather than being served
as finished HTML).

This plan is **EP-26**, the **last** of seven child plans under the master plan
`docs/masterplans/3-keiki-framework-documentation-set.md`. The master plan groups the seven plans
into three phases: Phase 1 is the foundation (**EP-20** — overview, theory essays, getting-started
tutorial, the `jitsurei` worked-example spine, the `docs/keiki-source-sync.md` pointer, the
walkthrough hub, and the shared authoring conventions); Phase 2 is five parallel capability plans
(**EP-21** core+builder, **EP-22** derivations, **EP-23** composition, **EP-24** symbolic+validation,
**EP-25** rendering+codecs), each shipping that capability's explanation, reference, how-tos, and a
disjoint walkthrough tour; Phase 3 is **this plan**.

This plan answers the user's central ask — **"guide developers on how to use keiki properly for
different domains."** After it, a reader who lands on `/docs/keiki` can:

- start from a **"Choosing how to model your domain"** decision guide (the cookbook landing) that
  tells them, before they write any code, when keiki is the right tool, whether to model a
  collection as a register-of-collection or a scalar tally, when a numeric threshold is a new
  vertex versus a guard, when one command should emit several events versus branch into several
  edges, when to reach for composition / a Process, and when to add the symbolic gate;
- copy from a **domain cookbook** of focused recipes (Problem → Solution → How it works), each
  anchored to a real `jitsurei` source line — modelling a collection as a scalar tally, emitting
  several events from one command, adding a silent ε-edge, guarding on an equality for idempotency,
  a multi-field threshold guard, branching a command into two outcomes, diagnosing a rejected
  command, validating a transducer at build time, fixing a hidden-input replay failure, evolving a
  schema safely, building a cross-context Process, composing aggregates into a workflow, deriving a
  lifecycle transition from a threshold, projecting a per-vertex read view, resolving the lens
  operator clash, and using `deriveAggregateCtorsAll` over manual enumeration;
- work through **worked-example tutorials** — the centrepiece — culminating in a complete
  **loan-application process manager** that intakes an application, tallies evidence documents,
  fires a silent "ready for review" ε-edge, applies a multi-field threshold approval guard,
  branches into approve/decline, drives a downstream `Loan` aggregate through a `CoreBankingSync`
  Process, and wires the three together with `compose` + `lmapMaybeCi` adapters — plus a small
  derived-lifecycle-transition tutorial for the bidirectional-threshold trap;
- get quick answers from a real **FAQ** (can I store a Map in a register? my guard branches on a
  collection and the build is green — is it verified? why does replay return Nothing? did `step`
  reject or was it ambiguous? how do I evolve a schema? `delta`+`omega` or `step`? split into a new
  aggregate or keep it in registers? `(.>)` won't compile — clashes with lens? is `compose` how the
  runtime fires cross-context flows?); and
- navigate the **whole** keiki tree with every section landing showing a `<Cards>` index (no
  "coming soon" placeholders), the walkthrough hub's five tour cards each linking to their tour, and
  every sidebar section in a deliberate reading order.

You can see it working by running the docs site from the repo root
`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`: `pnpm typecheck` is clean, `pnpm build` exits 0
and prerenders every keiki page with **zero** crawler warnings, `pnpm lint:links` exits 0, and the
in-repo doc-link checker `node scripts/check-doc-links.mjs` reports no broken internal links.
Browsing `http://localhost:3000/docs/keiki` (via `pnpm dev`, or `pnpm build && pnpm start`) shows
the cookbook recipes with a `<Cards>` index, the loan-application tutorial rendering as `<Steps>`,
the FAQ rendering as expandable accordions, every section landing showing cards, and the walkthrough
hub's five cards linking to their tours.

This plan has two kinds of work. The **original-content** milestones — the cookbook + decision guide
(M1), the worked-example tutorials (M2), and the FAQ (M3) — can be authored as soon as the foundation
plan **EP-20** is Complete, because every recipe and tutorial is anchored to a `jitsurei` module that
already exists on disk at the pinned keiki commit. The **finalization** milestone (M4) — ordering
every `meta.json`, replacing every "coming soon" landing with `<Cards>`, wiring the walkthrough hub
`<Card href>`s, upgrading parked landing-only links to precise slugs, and running the whole-tree
build + link-check gate — **must run last**, after the five Phase-2 plans (EP-21 … EP-25) are
Complete, because it touches and verifies pages those plans create.

This plan documents keiki **as shipped at the pinned upstream commit `344c4ca`** (keiki `0.1.0.0`,
with the sibling `keiki-codec-json` `0.1.0.0`). keiki's in-repo `docs/research/*`,
`docs/historical/*`, and `docs/plans/*` notes **predate the implementation and diverge from it** —
trust the source signatures, not the notes.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [x] M0. Preconditions verified (2026-06-06) — toolchain present, EP-20 Complete, keiki source on
      disk at `344c4ca`, baseline `pnpm typecheck`/`pnpm build` clean.
- [x] M1. Cookbook authored (2026-06-06) — `cookbook/index.mdx` overwritten with a `<Cards>` index +
      the "Choosing how to model your domain" decision guide and new-transducer checklist; 16
      `cookbook/*.mdx` recipes authored, each anchored to a jitsurei source line (overlapping recipes
      cross-link the Phase-2 how-tos rather than duplicating); slugs appended to `cookbook/meta.json`.
- [x] M2. Worked-example tutorials authored (2026-06-06) —
      `tutorials/a-loan-application-process-manager.mdx` (the capstone, `loanWorkflow` quoted
      verbatim, lockstep-vs-async caveat) and `tutorials/a-derived-lifecycle-transition.mdx`
      (bidirectional-threshold trap); both cross-link EP-20's EmailDelivery + EP-21's OrderCart
      tutorials; slugs appended to `tutorials/meta.json`.
- [x] M3. FAQ authored (2026-06-06) — `faq.mdx` overwritten with 9 real `<Accordions>` Q&A; the
      "coming soon" callout gone.
- [x] M4. FINALIZATION (2026-06-06; precondition EP-21 … EP-25 Complete verified). Every section
      `meta.json` ordered into a deliberate reading order; the four remaining "coming soon" section
      landings (tutorials, how-to, reference, explanation) replaced with grouped `<Cards>` (cookbook
      done in M1); the five walkthrough-hub `<Card href>`s wired to each tour's `00-start-here`;
      `docs/keiki-source-sync.md` most-coupled-pages list updated to cover the Phase-3 pages. Gate
      green: `pnpm typecheck` clean, `pnpm build` exit 0 with **zero** crawler warnings,
      `pnpm lint:links` exit 0 (322 files), `node scripts/check-doc-links.mjs` OK, no relative links,
      no "coming soon" left. **134 `.mdx` files** under `content/docs/keiki/`.


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

(None yet.)


## Decision Log

Record every decision made while working on the plan.

- Decision: The **domain cookbook** and the **worked-example tutorials** are the centerpiece of this
  plan and of the user's "different domains" ask, threaded end-to-end through the **`jitsurei`
  spine** (Integration Point 3 of the master plan): EmailDelivery → OrderCart → UserRegistration
  (+ the deliberately broken UserRegistrationV0) → LoanApplication → Loan / CoreBankingSync /
  LoanWorkflow. Every recipe and every tutorial step anchors to a real `jitsurei` module and test
  at the pinned keiki commit `344c4ca`.
  Rationale: the user's brief explicitly emphasizes guiding developers to model their own domains
  properly; concrete, source-faithful worked examples threaded through one coherent spine are the
  most effective way to teach modelling, and the spine is the established cross-plan example.
  Date: 2026-06-07

- Decision: **Cross-link rather than duplicate** the Phase-2 how-tos wherever a cookbook recipe
  overlaps an existing how-to. Where a Phase-2 plan already ships a task-oriented how-to (diagnosing
  rejected commands and build-time validation in EP-24; building a cross-context Process in EP-23;
  projecting a per-vertex view and the shape hash in EP-22; the JSON codec in EP-25), the cookbook
  recipe stays **domain-flavored and short** and links to the deeper how-to/reference rather than
  re-deriving the mechanism.
  Rationale: avoids drift between two pages documenting the same API, keeps the cookbook focused on
  *modelling decisions* rather than re-teaching mechanics, and respects the master plan's per-plan
  page ownership.
  Date: 2026-06-07

- Decision: **Finalization is owned solely by EP-26 and runs last.** EP-26 owns the final
  `meta.json` ordering pass for every section, replacing every "coming soon" section `index.mdx`
  with a `<Cards>` index, wiring the walkthrough hub `<Card href>`s (the five Phase-2 tours each
  created their subdir href-less so every intermediate build stayed clean), upgrading parked
  landing-only links to precise slugs, and running the whole-tree gate. M4 must run **after** EP-21
  … EP-25 are Complete and treats their pages as read-only inputs: M4 may **reorder** another plan's
  slugs within a section `meta.json`, but must **never delete or rename** another plan's pages.
  M1–M3 depend only on EP-20 and may proceed as soon as EP-20 is Complete.
  Rationale: mirrors the established keiro precedent (`docs/plans/12`, the keiro finalization plan),
  and the master plan's Integration Points #1 and #2 explicitly assign the whole-tree ordering, the
  section `<Cards>` landings, and the hub-href finalization to EP-26; the original content needs only
  EP-20 because every anchor already exists.
  Date: 2026-06-07

- Decision: **Lead the cookbook with a "Choosing how to model your domain" decision guide** (the
  `cookbook/index.mdx` landing), synthesized from keiki's `transducer-best-practices.md`, before any
  individual recipe.
  Rationale: the user's ask is about modelling *properly*; the highest-leverage guidance is the set
  of up-front decisions (tally vs collection, vertex vs guard, single vs multi-event, when to
  compose, when to gate symbolically) that determine whether the whole model is sound. A decision
  guide at the section landing frames every recipe that follows.
  Date: 2026-06-07

- Decision: Author MDX **without `import` lines** for `Callout` / `Cards` / `Card` / `Steps` /
  `Accordions` / `Accordion` / `TypeTable`. They are registered globally in
  `src/components/mdx.tsx` via `getMDXComponents`, and every existing keiki/keiro/kiroku page uses
  them bare. All cross-page links use **absolute** doc paths (`/docs/keiki/...`,
  `/docs/keiro/...`), never relative `./` or `../`.
  Rationale: matches the established house style (master plan Integration Point 7) and avoids the
  relative-link crawler failures that the kiroku/keiro sets paid for; the `pnpm lint:links` gate
  treats an absolute non-`/docs` internal link and a dangling relative link as broken.
  Date: 2026-06-07


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

**Outcome (2026-06-06).** EP-26 is complete, and with it the whole keiki documentation set
(MasterPlan #3). This plan added the 16-recipe domain cookbook with a "Choosing how to model your
domain" decision guide, two worked-example tutorials (the LoanApplication process-manager capstone and
the derived-lifecycle-transition trap), and a 9-question FAQ; then it ran the finalization pass —
ordering every section `meta.json`, replacing every "coming soon" landing with a grouped `<Cards>`
index, and wiring the walkthrough hub's five `<Card href>`s to their tours. The whole keiki tree
(**134 `.mdx` files**) builds clean (`pnpm build` exit 0, **zero** crawler warnings), typechecks, and
link-checks (`pnpm lint:links` + `node scripts/check-doc-links.mjs`, 322 files, no broken internal
links); no relative links and no placeholders remain. Every cookbook/tutorial snippet's distinctive
Haskell identifier was audited against the pinned source `344c4ca`. The user's central ask — guide
developers to model their own domains properly — is answered by the decision guide, the recipe set,
and the capstone tutorial, all threaded through the one `jitsurei` spine.


## Context and Orientation

Read this whole section before editing. It is written so that a novice with only this file and the
working tree can complete the work.

### Where you are working

You author MDX content files under `content/docs/keiki/` in **this** repository,
`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`. The site is a **fumadocs** documentation app
built on **TanStack Start as a static SPA** (React 19 + Vite, TypeScript), built and served with
**pnpm** on **Node 22** inside the Nix dev shell (`nix develop`). `pnpm dev` runs the dev server at
`http://localhost:3000`; `pnpm build` prerenders every doc route to a static SPA under
`.output/public`; `pnpm start` serves it.

Each directory under `content/docs/` has a `meta.json` whose `pages` array lists the child page
slugs (a *slug* is the filename without its `.mdx` extension, or a subdirectory name) **in sidebar
display order**. A page is an `.mdx` file: YAML frontmatter (`title`, `description`) then an MDX
body. Subject code samples are **Haskell** (the site is TypeScript; the documented library is
Haskell). Every fenced code block must carry a language tag — `haskell`, `bash`, `json`, `text`, or
`mermaid`. A bare ```` ``` ```` is not allowed.

The MDX components you will use — `Callout`, `Cards`, `Card`, `Steps`, `Accordions`, `Accordion`,
`TypeTable` — are **registered globally** in `src/components/mdx.tsx`, so use them **without** an
`import` line, exactly as every existing keiki/keiro/kiroku page does.

### The page templates (copy these shapes)

Copy the matching template from `content/docs/_templates/` for each page type and fill it in:

- `content/docs/_templates/cookbook-recipe.mdx` — Problem → Solution (one-screen `haskell` snippet)
  → How it works; carries the `<Callout type="info">` defining "jitsurei".
- `content/docs/_templates/tutorial.mdx` — a `<Steps>`-driven hands-on walkthrough with a final
  "what you built" recap.
- `content/docs/_templates/faq.mdx` — `<Accordions>` wrapping one `<Accordion title="...">` per
  question.

The `_templates/` directory is **skipped** by the link checker (its placeholder links like
`./00-start-here` are not real pages), so never put real content there.

### The build and link-check gate

These commands, run from the repo root, are the gate this plan must pass (defined in `package.json`):

- `pnpm typecheck` runs `fumadocs-mdx && tsc --noEmit`. The `fumadocs-mdx` step regenerates the
  `.source/` collection so newly added pages are picked up; `tsc --noEmit` type-checks the app.
  Expected tail: no errors.
- `pnpm build` runs `vite build`, prerendering every doc route. Success ends with a Vite
  `built in <N>s` line and writes `.output/public`. **Failure modes to watch:** a line containing
  `[unhandledRejection]` or `Failed to fetch` means a page links to a route that does not exist (the
  kiroku/keiro precedent: relative `./` links and `<Card href>`s to not-yet-authored pages produce
  exactly these crawler warnings). Zero such lines is an acceptance criterion.
- `pnpm lint:links` runs `node scripts/check-doc-links.mjs && linkinator .output/public ...`. The
  first script scans every `content/docs/**/*.mdx` for internal links and fails (exit 1, printing
  `✗ N broken internal doc link(s)`) if any points at a page that does not exist on disk; on success
  it prints `✓ doc links OK — checked <N> files, no broken internal links.`. It resolves a link
  beginning `/docs` by looking for `<path>.mdx` or `<path>/index.mdx` under `content/docs`, treats
  any other absolute (`/...`) internal link as **broken**, and resolves relative links against the
  file's own directory. The `linkinator` step then crawls the built SPA; because the prerendered
  HTML carries no static `<a>` tags (the SPA renders links client-side), `linkinator` reports
  `Successfully scanned 0 links` and the source scan is the meaningful in-content check.
- You can run the doc-link checker on its own with `node scripts/check-doc-links.mjs` (this is the
  command the keiro finalization used as its in-content link gate).

### The source of truth (NEVER search `/nix/store` or `/`)

The keiki source is on disk at `/Users/shinzui/Keikaku/bokuno/keiki`, pinned at commit `344c4ca`
(resolve the path with `mori registry show shinzui/keiki --full`; confirm the commit with
`git -C /Users/shinzui/Keikaku/bokuno/keiki rev-parse HEAD` →
`344c4cadd55e0b997cc2c6ce0ab687851d66fa31`). Open it read-only to cross-check names; do not edit it.
The worked-example **`jitsurei`** package lives **inside** the keiki repo at
`/Users/shinzui/Keikaku/bokuno/keiki/jitsurei/` (not a sibling repo): the eight modules are
`jitsurei/src/Jitsurei/{EmailDelivery,OrderCart,UserRegistration,UserRegistrationV0,LoanApplication,Loan,CoreBankingSync,LoanWorkflow}.hs`,
each with `jitsurei/test/Jitsurei/*Spec.hs` specs.

The `docs/keiki-source-sync.md` pointer in **this** repo (created by EP-20) records that commit and
a "most-coupled pages" list; M4 verifies that list covers the pages this plan added. (If
`docs/keiki-source-sync.md` does not exist, EP-20 has not landed — stop; this is a hard dependency.)

keiki's in-repo notes diverge from the shipped source. **Trust the source signature.** Known
divergences (from the master plan's Surprises): the shipped `Keiki.Decider` record has **five**
fields and two state parameters (`decide`, `evolve`, `evolveStreaming`, `initialState`, `isTerminal`),
not the four-field Chassaing record the haddock still quotes; the successful result of
`step`/`stepEither` is the bare triple `(s, RegFile rs, [co])` — there is no `StepResult` wrapper;
`validateTransducer` lives in **`Keiki.Core`**, not `Keiki.Render.Validate`; and `keiki-codec-json`
has **no** PII/secret redaction (its "sensitivity" is shape-hash structural-drift discrimination and
the no-silent-fallback property).

### The domain catalog (verified at `344c4ca` — your cheat-sheet for anchors)

The cookbook and tutorials thread one capability ladder. Re-open each module while authoring to
confirm a detail; the source is authoritative.

- **EmailDelivery** (`jitsurei/src/Jitsurei/EmailDelivery.hs`; `EmailDeliveryBuilderSpec`,
  `EmailDeliveryViewSpec`) — the smallest aggregate: a single edge (1 command / 1 event),
  builder↔AST equivalence, a B-view. This is **EP-20's getting-started tutorial** and **EP-21's
  authoring anchor**; the cookbook and the process-manager tutorial **cross-link** it as the
  starting rung, they do not re-author it.
- **OrderCart** (`jitsurei/src/Jitsurei/OrderCart.hs`; `OrderCartBuilderSpec`, `OrderCartSymbolicSpec`)
  — a multi-command 10-command lifecycle (Empty → OpenWithItems → Reserved → Paid → Shipped →
  Delivered, plus Cancelled / Refunded), modelling the cart's contents as a **scalar tally**
  `itemCount :: Word32` via `TApp1 (+1)` / `(subtract 1)` (no Map), self-loops, a `deriveAggregate`
  fused splice, and symbolic witnesses over Word16/Word64. **EP-21 owns the OrderCart multi-command
  tutorial**; the cookbook's tally recipe anchors here and cross-links that tutorial.
- **UserRegistration** (`jitsurei/src/Jitsurei/UserRegistration.hs`; `UserRegistrationBuilderSpec`,
  `UserRegistrationGSMSpec`, `UserRegistrationViewSpec`, `UserRegistrationSymbolicSpec`) — the full
  lifecycle PotentialCustomer → RequiresConfirmation → Confirmed → Deleted, with an equality guard
  `requireEq d.confirmCode #confirmCode`, a **multi-event** command `StartRegistration` that emits
  `[RegistrationStarted, ConfirmationEmailSent]` in one transition, an ε-edge / `noEmit` GDPR delete,
  and a code-rotation self-loop.
- **UserRegistrationV0** (`jitsurei/src/Jitsurei/UserRegistrationV0.hs`; `UserRegistrationV0Spec`) —
  the **deliberately broken** foil: `AccountConfirmedDataV0` drops the `confirmCode` field, so
  reconstitute returns `Nothing` and `checkHiddenInputs` names the missing field. The
  "emit every replay-critical field" rule is shown **failing**.
- **LoanApplication** (`jitsurei/src/Jitsurei/LoanApplication.hs`; `LoanApplicationBuilderSpec`,
  `LoanApplicationSymbolicSpec`, `LoanApplicationViewSpec`) — the realistic process-manager intake
  aggregate: **multi-field threshold guards**
  `creditScore .>= 650 .&& employmentVerified .== True .&& requestedAmount .<= creditScore .* lit 1000`
  built structurally (`PCmp` + `TArith`, solver-visible — *not* an opaque `TApp`), document-count
  tallies, a silent ε-edge via a synthetic `Continue` command (`onCmd inCtorContinue` +
  `requireGuard readyForReviewGuard` + `noEmit`), an approve/decline **branch** (two `Continue` edges
  with disjoint guards `approvalGuard` / `pnot approvalGuard`), a `Withdraw` from every vertex, and a
  six-vertex View. Slot names are prefixed (`app*`) so the aggregate composes.
- **Loan** (`jitsurei/src/Jitsurei/Loan.hs`; `LoanSpec`) — a tiny downstream aggregate LoanInitial →
  LoanAwaiting → LoanLinked, with an initially-unset slot populated later, a correlation guard
  `requireEq d.loanId #loanLoanId`, and prefixed slots for Disjoint composition.
- **CoreBankingSync** (`jitsurei/src/Jitsurei/CoreBankingSync.hs`; `CoreBankingSyncSpec`) — **the
  Process**: events-in (`LoanCreatedIn`, `LegacyCallbackReceivedIn`) → commands-out
  (`SyncToLegacyRequested` audit, `LegacyAssignmentCommanded`), idempotent by a terminal `SyncSettled`
  state plus `requireEq d.loanId #syncPendingLoanId`, with a `TApp2 buildAssign`.
- **LoanWorkflow** (`jitsurei/src/Jitsurei/LoanWorkflow.hs`; `LoanWorkflowSpec`) — the **compose
  capstone**: `loanApplication ⨾ coreBankingSync ⨾ loan` wired with `compose` + `lmapMaybeCi`
  adapters. The honest caveat: `compose` is **lockstep** (it runs the composed machines in one
  synchronous step), whereas the keiro runtime is **async** — so you model the async hand-off
  through the `lmapMaybeCi` adapter functions and test through them.

### The "Choosing how to model your domain" guidance (from `transducer-best-practices.md`)

The cookbook landing synthesizes keiki's `transducer-best-practices.md` decision guidance:

- **keiki is for durable, pure state machines** — not a JSON validator or an integration-contract
  layer. Decode and validate at the boundary, convert to service-owned commands, and let keiki own
  only the durable decision logic.
- **Collection register vs scalar tally — DEFAULT to a tally.** Model counts / sums / any / all /
  none / flags as **scalar** register slots (incremented with `.+` / `.-`); never store a Map that a
  **guard** must read into (a guard over a Map compiles to an opaque `TApp` the solver can't see).
  "Can't close while any line is open" becomes `openCount .== lit 0`.
- **State refinement vs new vertex.** Use vertices for genuine lifecycle states; use a tally + guard
  for numeric thresholds. Don't mint a vertex per count.
- **Single vs multi-event commands.** Use a **multi-event** edge when ONE transition genuinely
  produces ≥2 events (a static list, which keeps `checkHiddenInputs` decidable and respects the
  single-snapshot rule). A *different count or shape* of events depending on the input value is
  **branching** — model it as multiple disjoint-guarded edges, not a multi-event edge.
- **When to compose (a Process).** When an element has its own identity and lifecycle, give it its
  own stream and coordinate with a **Process** (events-in / commands-out) wired via `compose` +
  `lmapMaybeCi`; accept eventual consistency. `compose` is lockstep, so model the async hand-off
  through the adapter functions.
- **When to add the symbolic gate.** Keep guards in the verifiable fragment (`PEq` / `PCmp` /
  `PInCtor` over curated types) so you can assert `isSingleValuedSym` + `symSatExt`; always wire
  `validateTransducer defaultValidationOptions t == []` into CI; add `warnOpaqueGuards` if any guard
  routes through a `TApp`; reserve z3-backed checks for a slower CI group. `transducer-best-practices.md`
  ships a **new-transducer checklist** — reuse it as a cookbook appendix.

### Patterns docs and guides (rationale; the source modules are authoritative)

For background while authoring (these are *rationale*; cross-check the actual API against the
jitsurei modules): the keiki patterns notes
`/Users/shinzui/Keikaku/bokuno/keiro-runtime-patterns/keiki/*.md`
(`transducer-best-practices.md`, `collections-and-opaque-guards.md`, `operator-conflicts.md`,
`diagnosing-rejected-commands.md`, `build-time-validation.md`, `json-event-codecs.md`); and the
keiki guides `/Users/shinzui/Keikaku/bokuno/keiki/docs/guide/{user-guide,loan-application-tutorial,modeling-collections,multi-event-commands,deriving-lifecycle-transitions,symbolic-ci}.md`
plus `docs/research/schema-evolution.md`.


## Plan of Work

The work is organized as five milestones. M0 verifies preconditions. M1–M3 author the
original-content pages (the cookbook + decision guide, the worked-example tutorials, the FAQ); each
can proceed as soon as EP-20 is Complete and each appends its own slugs to the relevant section
`meta.json`. M4 is the finalization pass and must run **last**, after the five Phase-2 plans (EP-21
… EP-25) are Complete.

The pages this plan creates, all under `content/docs/keiki/`. Each row gives the full path, the slug,
the template, and the jitsurei/source anchor.

### Tutorials (template `tutorial.mdx`, `<Steps>`) — M2

| File | Slug | Scope | Anchor |
|---|---|---|---|
| `tutorials/a-loan-application-process-manager.mdx` | `a-loan-application-process-manager` | The most complete domain story: model the LoanApplication intake aggregate (prefixed `app*` slots so it composes), evidence document-count tallies, the ε-edge "ready for review" (`onCmd inCtorContinue` + `requireGuard readyForReviewGuard` + `noEmit`), the multi-field threshold approval guard (`approvalGuard`: structural `.>=`/`.<=`/`.*`), the approve/decline branch (two `Continue` edges with `approvalGuard` / `pnot approvalGuard`), a `Withdraw` from every vertex, the per-vertex View, the downstream `Loan` aggregate with a correlation guard, the `CoreBankingSync` Process (events-in / commands-out), then wire all three with `compose` + `lmapMaybeCi` adapters; close with the variance caveat (compose is lockstep, runtime is async — test through the adapter functions). Cross-links EP-20's EmailDelivery tutorial and EP-21's OrderCart tutorial as earlier rungs, and EP-23's composition how-to/reference for the mechanics. | `jitsurei/src/Jitsurei/{LoanApplication,Loan,CoreBankingSync,LoanWorkflow}.hs`; `docs/guide/loan-application-tutorial.md` §§1–11; `LoanWorkflowSpec` |
| `tutorials/a-derived-lifecycle-transition.mdx` | `a-derived-lifecycle-transition` | A smaller tutorial: a warehouse-stock NeedsReorder ⇄ Stocked lifecycle, demonstrating the **bidirectional-threshold trap** (a single threshold can't drive both directions without hysteresis / two guards). | `jitsurei`-flavored; `docs/guide/deriving-lifecycle-transitions.md` |

### Cookbook (template `cookbook-recipe.mdx`: Problem → Solution (jitsurei snippet) → How it works) — M1

Author a coherent subset of ~12–16 recipes. Recipes that overlap a Phase-2 how-to stay short and
**cross-link** rather than duplicate (see Decision Log). Recommended slugs (all under
`cookbook/`):

| Slug | Recipe | Anchor / cross-link |
|---|---|---|
| `model-a-collection-as-a-scalar-tally` | Model a collection as a scalar tally (OrderCart `itemCount`) | OrderCart; `modeling-collections.md` §3; cross-link EP-21 OrderCart tutorial |
| `emit-multiple-events-from-one-command` | Emit multiple events from one command (UserRegistration `StartRegistration` → `[RegistrationStarted, ConfirmationEmailSent]`) | UserRegistration; `multi-event-commands.md` single-snapshot rule |
| `add-a-silent-epsilon-edge` | Add a silent ε-edge (LoanApplication ready-for-review; UserRegistration GDPR `noEmit`) | LoanApplication, UserRegistration |
| `guard-on-an-equality-for-idempotency` | Guard on an equality for idempotency (`requireEq` → `PEq`) | CoreBankingSync / Loan / UserRegistration Confirm |
| `a-multi-field-threshold-guard` | A multi-field threshold guard (LoanApplication `approvalGuard`, structural `PCmp` + `TArith`, not `TApp`) | LoanApplication |
| `branch-a-command-into-two-outcomes` | Branch a command into two outcomes (LoanApplication approve/decline — two edges, disjoint guards; not multi-event) | LoanApplication |
| `diagnose-why-a-command-was-rejected` | Diagnose why a command was rejected (`stepEither` / `StepFailure`) — short, cross-link EP-24 | UserRegistration; cross-link EP-24 |
| `validate-a-transducer-at-build-time` | Validate a transducer at build time (`validateTransducer … == []`) — short, cross-link EP-24 | cross-link EP-24 |
| `fix-a-hidden-input-replay-failure` | Fix a hidden-input replay failure (UserRegistrationV0 broken vs UserRegistration fixed; `checkHiddenInputs`) | UserRegistrationV0; `schema-evolution.md` Scenario A |
| `evolve-a-schema-safely` | Evolve a schema safely (an upcaster at the event-store boundary, additive-by-convention, register-shape hash invalidates snapshots) | `schema-evolution.md`; cross-link EP-22 shape + EP-25 codec |
| `build-a-cross-context-process` | Build a cross-context Process (CoreBankingSync events-in / commands-out) — domain-flavored, cross-link EP-23 | CoreBankingSync; cross-link EP-23 |
| `compose-aggregates-into-a-workflow` | Compose aggregates into a workflow (LoanWorkflow `compose` + `lmapMaybeCi`, the lockstep caveat) — cross-link EP-23 | LoanWorkflow; cross-link EP-23 |
| `derive-a-lifecycle-transition-from-a-threshold` | Derive a lifecycle transition from a threshold | `deriving-lifecycle-transitions.md` §§4–5 |
| `project-a-per-vertex-read-view` | Project a per-vertex read view (`deriveView`) — short, cross-link EP-22 | LoanApplication / UserRegistration; cross-link EP-22 |
| `resolve-the-lens-operator-clash` | Resolve the lens operator clash (hide-and-reimport / qualified `Keiki.Operators` / `B.requireGt` verbs) | `operator-conflicts.md` |
| `use-derive-all-over-manual-enumeration` | Use `deriveAggregateCtorsAll` / `…With` over manual enumeration | OrderCart `deriveAggregate`; `transducer-best-practices.md` |

Plus the section landing:

| File | Slug | Scope |
|---|---|---|
| `cookbook/index.mdx` | `index` (overwrite stub) | Replace the "coming soon" stub with a `<Cards>` index of every recipe **plus** the "Choosing how to model your domain" decision guide synthesized from `transducer-best-practices.md` (keiki only for durable pure state machines; tally vs collection — default tally; state refinement vs new vertex; single vs multi-event; when to compose / a Process; when to add the symbolic gate; the new-transducer checklist as an appendix). |

### FAQ (template `faq.mdx`, `<Accordions>`) — M3

Overwrite the `faq.mdx` stub with ~8–9 real Q&A:

1. **Can I store a Map/list in a register?** Yes, if it arrives whole on the command; what breaks is
   **guarding on its contents** (an opaque `TApp` the solver can't see) — project to a scalar tally
   for anything a guard reads.
2. **My guard branches on a collection and the build is green — is it verified?** Probably not; run
   `warnOpaqueGuards = True` (a green build without it does not mean the guard is solver-visible).
3. **Why does my replay return Nothing?** A hidden input — an event dropped a replay-critical field;
   add the field; `checkHiddenInputs` names the edge (UserRegistrationV0).
4. **`step` returned Nothing — rejected or ambiguous?** Use `stepEither`:
   `NoOutgoingEdges` / `NoMatchingEdge` / `AmbiguousEdges` distinguish the cases.
5. **How do I evolve an event/register schema?** An explicit wire→current upcaster at the boundary,
   additive-by-convention; the register-shape hash invalidates snapshots; the library is
   version-agnostic.
6. **`delta`+`omega` or `step`?** Use `step` (and `stepEither` for the rejection reason); `delta` /
   `omega` are the lower-level halves.
7. **Split into its own aggregate or keep it in registers?** Own identity + lifecycle → promote to
   its own aggregate and coordinate with a Process; only set-level facts → a scalar tally.
8. **`(.>)` won't compile — it clashes with lens.** Use the `B.requireGt` verbs inside `B.do`, or a
   qualified `Keiki.Operators` import outside.
9. (optional) **Is `compose` how the runtime fires cross-context flows?** No — `compose` is lockstep;
   the `lmapMaybeCi` adapters model the async runtime.

### Milestones

- **M0 — Preconditions.** Confirm Node 22 + pnpm are on PATH, `node_modules` is present, and **EP-20
  is Complete** (the `content/docs/keiki/` tree exists with section `meta.json` files,
  `docs/keiki-source-sync.md` exists, the `/docs/keiki` overview + getting-started pages exist, and
  the walkthrough hub `walkthrough/index.mdx` exists). Confirm the keiki source is on disk at
  `344c4ca`. At the end: a baseline `pnpm typecheck` and `pnpm build` both succeed before you add a
  page. Acceptance: both commands exit 0 on the unmodified tree; `git -C /Users/shinzui/Keikaku/bokuno/keiki
  rev-parse HEAD` prints `344c4cadd55e0b997cc2c6ce0ab687851d66fa31`.

- **M1 — Cookbook + "Choosing how to model your domain" decision guide.** Overwrite
  `cookbook/index.mdx` with a `<Cards>` index plus the decision guide (synthesized from
  `transducer-best-practices.md`; ends with the new-transducer checklist appendix). Author ~12–16
  recipes from the cookbook template, each Problem → Solution (a one-screen jitsurei snippet) → How
  it works, anchored to a real source line. Recipes overlapping a Phase-2 how-to stay short and
  cross-link. Append every recipe slug to `cookbook/meta.json` (append only). Acceptance: every
  recipe builds; each recipe's snippet matches its jitsurei anchor at `344c4ca`; the cookbook landing
  renders a `<Cards>` index and the decision guide; build clean.

- **M2 — Worked-example tutorials.** Author `tutorials/a-loan-application-process-manager.mdx` (the
  capstone: LoanApplication intake → approval guard → approve/decline branch → downstream Loan →
  CoreBankingSync Process → `compose` + `lmapMaybeCi`, closing with the lockstep-vs-async caveat) and
  `tutorials/a-derived-lifecycle-transition.mdx` (the warehouse-stock bidirectional-threshold trap).
  Both use the tutorial template with `<Steps>`; both cross-link EP-20's EmailDelivery getting-started
  tutorial and EP-21's OrderCart multi-command tutorial as earlier rungs (those are **not** authored
  here). Append both slugs to `tutorials/meta.json`. Acceptance: both build; the `loanWorkflow`
  snippet matches `jitsurei/src/Jitsurei/LoanWorkflow.hs`; the LoanApplication guard/branch snippets
  match `LoanApplication.hs`.

- **M3 — FAQ.** Overwrite `faq.mdx` (currently a "coming soon" stub) with the ~8–9 real
  `<Accordions>` / `<Accordion>` Q&A from the FAQ list above; each answer links to the deeper page.
  Acceptance: `faq.mdx` no longer contains the "coming soon" callout; the page renders as expandable
  accordions; build clean.

- **M4 — FINALIZATION (runs LAST).** **Precondition: EP-21, EP-22, EP-23, EP-24, and EP-25 are
  Complete.** How to verify the precondition is in Concrete Steps (their walkthrough subdirs exist on
  disk and their section `meta.json` files list more than `["index"]`). Then: (a) order **every**
  section `meta.json` (`tutorials`, `how-to`, `reference`, `explanation`, `cookbook`, `walkthrough`,
  and each `walkthrough/<subdir>/meta.json`) into a deliberate reading order — append/reorder only,
  never delete another plan's slug; (b) replace **every** section `index.mdx` "coming soon" callout
  with a real `<Cards>` index of that section's pages (tutorials, how-to, reference, explanation,
  cookbook, and the walkthrough hub); (c) wire the walkthrough hub's five `<Card href>`s (one per
  tour → its `00-start-here`) and order `walkthrough/meta.json` to
  `[index, core-and-builder, derivations, composition, symbolic-and-validation, rendering-and-codecs]`;
  (d) upgrade parked landing-only links — `grep` for `](/docs/keiki/<section>)` links that name a
  now-shipped specific page in nearby prose and upgrade each to its precise slug, and sweep any
  inbound links broken by another plan; (e) verify `docs/keiki-source-sync.md`'s "most-coupled pages"
  list covers the pages this plan added; (f) run the gate. Acceptance: see Validation and Acceptance.


## Concrete Steps

Run all commands from the repo root `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` unless stated
otherwise. The toolchain is **pnpm** on **Node 22** inside the Nix dev shell.

### M0 — Preconditions

```bash
nix develop                       # enter the dev shell (pnpm + Node 22)

# EP-20 must be Complete: these must all exist.
test -d content/docs/keiki && echo "keiki tree present"
test -f docs/keiki-source-sync.md && echo "source-sync pointer present"
test -f content/docs/keiki/index.mdx && echo "overview present"
test -f content/docs/keiki/walkthrough/index.mdx && echo "walkthrough hub present"

# Confirm the keiki source commit before cross-checking snippets.
git -C /Users/shinzui/Keikaku/bokuno/keiki rev-parse HEAD
# expect: 344c4cadd55e0b997cc2c6ce0ab687851d66fa31

# Confirm the jitsurei spine modules are on disk.
ls /Users/shinzui/Keikaku/bokuno/keiki/jitsurei/src/Jitsurei/

pnpm install
pnpm typecheck
pnpm build
```

Expected (abridged):

```text
keiki tree present
source-sync pointer present
overview present
walkthrough hub present
344c4cadd55e0b997cc2c6ce0ab687851d66fa31
CoreBankingSync.hs  EmailDelivery.hs  Loan.hs  LoanApplication.hs
LoanWorkflow.hs  OrderCart.hs  UserRegistration.hs  UserRegistrationV0.hs
✓ built in <N>s
```

If `docs/keiki-source-sync.md` or `content/docs/keiki/` is missing, EP-20 has not landed — stop and
finish EP-20 first (hard dependency).

Before authoring, read the source anchors and the rationale notes (resolve the keiki path with
`mori registry show shinzui/keiki --full` if needed):

```bash
# The jitsurei spine (the snippet sources).
for m in EmailDelivery OrderCart UserRegistration UserRegistrationV0 LoanApplication Loan CoreBankingSync LoanWorkflow; do
  echo "== $m =="; sed -n '1,40p' /Users/shinzui/Keikaku/bokuno/keiki/jitsurei/src/Jitsurei/$m.hs
done

# The decision-guide and recipe rationale (cross-check API against the modules, not the notes).
ls /Users/shinzui/Keikaku/bokuno/keiro-runtime-patterns/keiki/
ls /Users/shinzui/Keikaku/bokuno/keiki/docs/guide/
```

### M1 — Cookbook + decision guide

Overwrite `content/docs/keiki/cookbook/index.mdx` with a `<Cards>` index plus the "Choosing how to
model your domain" decision guide. Create each recipe from
`content/docs/_templates/cookbook-recipe.mdx`, authoring each Solution snippet against the jitsurei
module named in its anchor row. Then append the slugs (append only — keep `index`):

```json
// content/docs/keiki/cookbook/meta.json — append the recipe slugs to pages
{
  "title": "Cookbook",
  "pages": [
    "index",
    "model-a-collection-as-a-scalar-tally",
    "emit-multiple-events-from-one-command",
    "add-a-silent-epsilon-edge",
    "guard-on-an-equality-for-idempotency",
    "a-multi-field-threshold-guard",
    "branch-a-command-into-two-outcomes",
    "diagnose-why-a-command-was-rejected",
    "validate-a-transducer-at-build-time",
    "fix-a-hidden-input-replay-failure",
    "evolve-a-schema-safely",
    "build-a-cross-context-process",
    "compose-aggregates-into-a-workflow",
    "derive-a-lifecycle-transition-from-a-threshold",
    "project-a-per-vertex-read-view",
    "resolve-the-lens-operator-clash",
    "use-derive-all-over-manual-enumeration"
  ]
}
```

Cross-check the distinctive identifiers each recipe quotes against the source:

```bash
grep -nE "itemCount|TApp1" /Users/shinzui/Keikaku/bokuno/keiki/jitsurei/src/Jitsurei/OrderCart.hs
grep -nE "RegistrationStarted|ConfirmationEmailSent|requireEq|noEmit" \
  /Users/shinzui/Keikaku/bokuno/keiki/jitsurei/src/Jitsurei/UserRegistration.hs
grep -nE "approvalGuard|readyForReviewGuard|inCtorContinue|\.>=|\.<=|\.\*" \
  /Users/shinzui/Keikaku/bokuno/keiki/jitsurei/src/Jitsurei/LoanApplication.hs
grep -nE "checkHiddenInputs|AccountConfirmedDataV0" \
  /Users/shinzui/Keikaku/bokuno/keiki/jitsurei/src/Jitsurei/UserRegistrationV0.hs
grep -nE "buildAssign|syncPendingLoanId|SyncSettled" \
  /Users/shinzui/Keikaku/bokuno/keiki/jitsurei/src/Jitsurei/CoreBankingSync.hs
```

Expected: each distinctive name prints at least one matching line. Then `pnpm typecheck && pnpm build`.

### M2 — Worked-example tutorials

Create `content/docs/keiki/tutorials/a-loan-application-process-manager.mdx` and
`content/docs/keiki/tutorials/a-derived-lifecycle-transition.mdx` from
`content/docs/_templates/tutorial.mdx`. The process-manager tutorial's capstone snippet is the
`loanWorkflow` composition — author it against the source and cross-check:

```bash
grep -nE "loanWorkflow|compose|lmapMaybeCi" \
  /Users/shinzui/Keikaku/bokuno/keiki/jitsurei/src/Jitsurei/LoanWorkflow.hs
```

Both tutorials open by pointing back to EP-20's EmailDelivery getting-started tutorial and EP-21's
OrderCart multi-command tutorial (absolute links `/docs/keiki/tutorials/...`), framing this as the
next rung up the capability ladder. Append the slugs (append only):

```json
// content/docs/keiki/tutorials/meta.json
{
  "title": "Tutorials",
  "pages": ["index", "a-loan-application-process-manager", "a-derived-lifecycle-transition"]
}
```

> Note: EP-20 and EP-21 also append their own tutorial slugs (the EmailDelivery getting-started and
> the OrderCart multi-command tutorials). Append only your two slugs here; the final ordering of all
> tutorial slugs is done in M4. If EP-20/EP-21 have already populated `pages`, keep their entries and
> append yours.

Then `pnpm typecheck && pnpm build`.

### M3 — FAQ

Overwrite `content/docs/keiki/faq.mdx`. Remove the "coming soon" `<Callout>`; author the real
`<Accordions>` block from the M3 question list, each answer linking to the deeper page with an
absolute `/docs/keiki/...` link. No `meta.json` change is needed (`faq` is already listed in the
top-level `content/docs/keiki/meta.json`). Then `pnpm typecheck && pnpm build`, and confirm the stub
callout is gone:

```bash
grep -n "coming soon" content/docs/keiki/faq.mdx || echo "stub removed"
```

Expected: `stub removed`.

### M4 — Finalization (runs LAST)

First, **verify the Phase-2 precondition** — every capability plan's walkthrough subdir must be
present and every section `meta.json` must list more than `["index"]`:

```bash
# Each Phase-2 plan owns a disjoint walkthrough subdir (EP-21…EP-25).
for d in core-and-builder derivations composition symbolic-and-validation rendering-and-codecs; do
  test -d content/docs/keiki/walkthrough/$d && echo "walkthrough/$d present" || echo "MISSING walkthrough/$d"
done

# Reference/explanation/how-to must carry subsystem pages, not just index.
for s in reference explanation how-to; do
  echo "== $s =="; cat content/docs/keiki/$s/meta.json
done
```

Expected: all five walkthrough subdirs print "present"; each section `meta.json` lists multiple
slugs. If any prints "MISSING" or only `["index"]`, a Phase-2 plan is not Complete — **stop**; M4's
precondition is not met. M1–M3 are unaffected and remain merged.

Then do the ordering pass. Edit every section `meta.json` (and each `walkthrough/<subdir>/meta.json`)
so `pages` is in a deliberate reading order. **Reorder only; never delete a slug another plan added.**
For the walkthrough hub, order `walkthrough/meta.json` to the pedagogical tour order:

```json
// content/docs/keiki/walkthrough/meta.json
{
  "title": "Code Walkthroughs",
  "pages": ["index", "core-and-builder", "derivations", "composition", "symbolic-and-validation", "rendering-and-codecs"]
}
```

Replace every section landing's "coming soon" callout with a `<Cards>` index (no imports — components
are global). The cookbook landing additionally carries the decision guide (authored in M1). The
shape for a plain section landing:

```mdx
---
title: Cookbook
description: Domain-driven recipes for modelling your own aggregates and processes.
---

Domain-driven recipes: each is a Problem → Solution → How it works, anchored to a real jitsurei
source line. Start with the decision guide below.

<Cards>
  <Card title="Model a collection as a scalar tally" href="/docs/keiki/cookbook/model-a-collection-as-a-scalar-tally" />
  <Card title="A multi-field threshold guard" href="/docs/keiki/cookbook/a-multi-field-threshold-guard" />
  {/* …one Card per recipe… */}
</Cards>
```

Wire the walkthrough hub's five `<Card href>`s in `content/docs/keiki/walkthrough/index.mdx` — each
points at that tour's `00-start-here`:

```mdx
<Cards>
  <Card title="Core and builder" href="/docs/keiki/walkthrough/core-and-builder/00-start-here" />
  <Card title="Derivations" href="/docs/keiki/walkthrough/derivations/00-start-here" />
  <Card title="Composition" href="/docs/keiki/walkthrough/composition/00-start-here" />
  <Card title="Symbolic and validation" href="/docs/keiki/walkthrough/symbolic-and-validation/00-start-here" />
  <Card title="Rendering and codecs" href="/docs/keiki/walkthrough/rendering-and-codecs/00-start-here" />
</Cards>
```

Find every landing still carrying a placeholder, and fix each:

```bash
grep -rln "coming soon" content/docs/keiki
```

Expected after the pass: no matches.

**Upgrade parked landing-only links** (the keiro EP-12 lesson). A "parked" link is one that points at
a section *landing* (`/docs/keiki/<section>`) while the prose names a now-shipped specific page —
upgrade each to its precise slug:

```bash
# Find landing-only links that probably name a specific shipped page nearby.
grep -rnE "\]\(/docs/keiki/(tutorials|how-to|reference|explanation|cookbook|walkthrough)\)" content/docs/keiki
```

For each hit, read the surrounding prose: if it names a specific page that now exists, replace the
landing link with the precise `/docs/keiki/<section>/<slug>` link. Also sweep any inbound links that
another plan left pointing at a page this plan moved or renamed.

**Verify the source-sync pointer.** Open `docs/keiki-source-sync.md` and confirm its "most-coupled
pages" list names the pages most tightly coupled to the source — including the cookbook recipes and
the loan-application tutorial this plan added (they quote jitsurei snippets verbatim). Add any
missing entries.

Run the full gate:

```bash
pnpm typecheck
pnpm build
pnpm lint:links
node scripts/check-doc-links.mjs
```

Expected (abridged):

```text
✓ built in <N>s
✓ doc links OK — checked <N> files, no broken internal links.
```

The `pnpm build` output must contain **no** `[unhandledRejection]` or `Failed to fetch` line. Confirm
no relative links anywhere under the keiki tree, and record file counts:

```bash
grep -rnE "\]\(\.\.?/" content/docs/keiki && echo "FOUND relative links" || echo "no relative links"
find content/docs/keiki -name '*.mdx' | wc -l
```

Expected: `no relative links`, and a stable `.mdx` count to record in the Progress/Outcomes notes.

Finally, snippet cross-check — every distinctive Haskell identifier used in a keiki cookbook/tutorial
snippet must exist in the source at `344c4ca`:

```bash
# Spot-check the load-bearing identifiers; extend to every distinctive name used in snippets.
grep -rnE "loanWorkflow|approvalGuard|lmapMaybeCi|checkHiddenInputs|stepEither|validateTransducer|deriveAggregate" \
  /Users/shinzui/Keikaku/bokuno/keiki
```

Acceptance: every distinctive keiki identifier quoted in a snippet resolves to a definition in the
source tree. Record any divergence in Surprises & Discoveries and fix the snippet (the source is
authoritative).


## Validation and Acceptance

Exercise the system and observe specific behaviors:

1. **Cookbook recipes build and render with a `<Cards>` index.** After M1, `pnpm typecheck` and
   `pnpm build` exit 0. Browsing `http://localhost:3000/docs/keiki/cookbook` (via `pnpm dev`) shows
   the decision guide and a `<Cards>` index; each card opens its recipe without a 404 and shows the
   Problem → Solution → How it works shape.

2. **Each recipe's snippet matches its jitsurei anchor.** Every distinctive identifier quoted in a
   recipe (`itemCount`, `RegistrationStarted`/`ConfirmationEmailSent`, `requireEq`, `approvalGuard`,
   `checkHiddenInputs`, `buildAssign`, `lmapMaybeCi`, `deriveAggregate`) appears in the named
   `jitsurei/src/Jitsurei/*.hs` module at `344c4ca` (per the M1/M4 cross-check greps).

3. **The process-manager tutorial's composition is real.** The `loanWorkflow` snippet in
   `tutorials/a-loan-application-process-manager.mdx` matches
   `jitsurei/src/Jitsurei/LoanWorkflow.hs` (the `loanApplication ⨾ coreBankingSync ⨾ loan`
   `compose` + `lmapMaybeCi` wiring), and the tutorial states the lockstep-vs-async caveat. The
   tutorial cross-links EP-20's EmailDelivery tutorial and EP-21's OrderCart tutorial, and both
   links resolve.

4. **The FAQ renders as accordions.** The FAQ page shows the `<Accordion>` questions as expandable
   rows; clicking one reveals its answer. The "coming soon" callout is gone
   (`grep -n "coming soon" content/docs/keiki/faq.mdx` prints nothing).

5. **Every section landing shows Cards (no "coming soon").** After M4,
   `grep -rln "coming soon" content/docs/keiki` prints **nothing**; each of `tutorials`, `how-to`,
   `reference`, `explanation`, `cookbook`, and `walkthrough` `index.mdx` contains a `<Cards>` block,
   and each card link resolves.

6. **The walkthrough hub cards have working hrefs.** Each of the five hub cards in
   `walkthrough/index.mdx` links to its tour's `00-start-here`, and clicking each opens that tour
   (no 404, no crawler `Failed to fetch`).

7. **The whole keiki tree builds with zero crawler warnings.** `pnpm build` exits 0 and its output
   contains no `[unhandledRejection]` and no `Failed to fetch` line:

   ```text
   ✓ built in <N>s
   ```

8. **Link-checks pass.** `pnpm lint:links` and `node scripts/check-doc-links.mjs` both exit 0;
   the latter prints `✓ doc links OK — checked <N> files, no broken internal links.`. There are no
   relative `./`/`../` links anywhere under `content/docs/keiki/**`:

   ```bash
   grep -rnE "\]\(\.\.?/" content/docs/keiki && echo "FOUND relative links" || echo "no relative links"
   ```

   Expected: `no relative links`.

9. **Snippets do not present divergent in-repo notes as the API.** No snippet quotes the four-field
   Chassaing `Decider` (the shipped record has five fields), a `StepResult` wrapper (the result is the
   bare `(s, RegFile rs, [co])` triple), or `keiki-codec-json` PII redaction (it has none). Each such
   feature, if mentioned at all, is framed per the source.


## Idempotence and Recovery

All steps are file authoring and are safe to repeat. Re-running `pnpm typecheck` / `pnpm build` /
`pnpm lint:links` / `node scripts/check-doc-links.mjs` is idempotent. Editing or recreating an
`.mdx` / `meta.json` file overwrites it; re-running a milestone simply rewrites the same files. The
M4 `meta.json` ordering and the section `<Cards>` landings are **idempotent rewrites** — re-running
M4 produces the same ordered arrays and the same landing files, so it is safe to re-run. No database,
no keiki source, and no other plan's pages are modified (the keiki tree is opened read-only for
cross-checking; M4 `meta.json` edits reorder but never delete sibling entries).

Recovery:

- If a page breaks the build, the error names the offending `.mdx` file and line; the usual causes
  are an untagged code fence, a stray `<` in prose, or a link to a non-existent route. Fix and
  rebuild.
- If `pnpm lint:links` or `node scripts/check-doc-links.mjs` fails, it prints each broken
  `file -> target`; fix the link to an existing `/docs/keiki/...` page (absolute, never relative) and
  re-run.
- If `pnpm build` emits `[unhandledRejection]` / `Failed to fetch`, a link points at a route that
  does not exist (most often a relative `./` link, or a hub `<Card href>` whose tour subdir is not
  present yet); replace it with an absolute `/docs/keiki/...` path, or — if a Phase-2 tour is missing
  — stop M4 (its precondition is not met) and finish that plan first.
- If the M4 precondition check shows a missing Phase-2 walkthrough subdir or an `["index"]`-only
  section `meta.json`, stop M4 and wait for that plan to complete; M1–M3 are unaffected and remain
  merged.
- If a snippet diverges from the source at `344c4ca`, fix the snippet (the source is authoritative)
  and record the divergence in Surprises & Discoveries.


## Interfaces and Dependencies

### Documented subject (Haskell, read-only at `/Users/shinzui/Keikaku/bokuno/keiki`, commit `344c4ca`)

- The `jitsurei` worked-example spine (inside the keiki repo at
  `/Users/shinzui/Keikaku/bokuno/keiki/jitsurei/`): `EmailDelivery.hs`, `OrderCart.hs`,
  `UserRegistration.hs`, `UserRegistrationV0.hs`, `LoanApplication.hs`, `Loan.hs`,
  `CoreBankingSync.hs`, `LoanWorkflow.hs`, each with `jitsurei/test/Jitsurei/*Spec.hs` specs. These
  are the snippet sources for every cookbook recipe and tutorial.
- The keiki library API the snippets exercise (cross-check against the module headers, not the
  in-repo notes): the builder DSL and operators (`Keiki.Builder`, `Keiki.Operators` — `requireEq`,
  `requireGuard`, `noEmit`, `onCmd`, the `.>=`/`.<=`/`.*`/`.+`/`.-`/`.==`/`.&&` operators, the
  `B.requireGt`-style verbs and the lens-clash workaround); the step API (`step`, `stepEither`,
  `StepFailure` — `NoOutgoingEdges`/`NoMatchingEdge`/`AmbiguousEdges`, the `(s, RegFile rs, [co])`
  result), `reconstitute`, `checkHiddenInputs`; the validation umbrella `validateTransducer`
  (in **`Keiki.Core`**) with `defaultValidationOptions` and `warnOpaqueGuards`; the derivations
  `deriveAggregate` / `deriveAggregateCtorsAll` / `…With` and `deriveView`; the composition algebra
  `compose` + `lmapMaybeCi`; the shape hash `regFileShapeHash` (in `Keiki.Shape`) and the
  `keiki-codec-json` RegFile codec.

### Docs tooling (TypeScript, this repo)

- fumadocs (`fumadocs-core`/`fumadocs-ui`, `fumadocs-mdx`) — MDX + sidebar from `meta.json`;
  components (`Callout`, `Cards`, `Card`, `Steps`, `Accordions`, `Accordion`, `TypeTable`) registered
  globally in `src/components/mdx.tsx` — use bare, no imports.
- TanStack Start + Vite — `pnpm dev` / `pnpm build` / `pnpm start`; `pnpm typecheck` =
  `fumadocs-mdx && tsc --noEmit`; `pnpm lint:links` = `node scripts/check-doc-links.mjs && linkinator
  .output/public …`; the standalone in-content gate is `node scripts/check-doc-links.mjs`.
- pnpm + Node 22 inside the Nix dev shell (`nix develop`).

### Files this plan CREATES / OWNS (all under `content/docs/keiki/`)

Tutorials:

- `tutorials/a-loan-application-process-manager.mdx` — title "A loan-application process manager".
- `tutorials/a-derived-lifecycle-transition.mdx` — title "A derived lifecycle transition".

Cookbook (the decision-guide landing + ~16 recipes):

- `cookbook/index.mdx` — OVERWRITE the stub; the `<Cards>` index + the "Choosing how to model your
  domain" decision guide.
- `cookbook/model-a-collection-as-a-scalar-tally.mdx`
- `cookbook/emit-multiple-events-from-one-command.mdx`
- `cookbook/add-a-silent-epsilon-edge.mdx`
- `cookbook/guard-on-an-equality-for-idempotency.mdx`
- `cookbook/a-multi-field-threshold-guard.mdx`
- `cookbook/branch-a-command-into-two-outcomes.mdx`
- `cookbook/diagnose-why-a-command-was-rejected.mdx` (short; cross-links EP-24)
- `cookbook/validate-a-transducer-at-build-time.mdx` (short; cross-links EP-24)
- `cookbook/fix-a-hidden-input-replay-failure.mdx`
- `cookbook/evolve-a-schema-safely.mdx` (cross-links EP-22 shape + EP-25 codec)
- `cookbook/build-a-cross-context-process.mdx` (domain-flavored; cross-links EP-23)
- `cookbook/compose-aggregates-into-a-workflow.mdx` (cross-links EP-23)
- `cookbook/derive-a-lifecycle-transition-from-a-threshold.mdx`
- `cookbook/project-a-per-vertex-read-view.mdx` (short; cross-links EP-22)
- `cookbook/resolve-the-lens-operator-clash.mdx`
- `cookbook/use-derive-all-over-manual-enumeration.mdx`

FAQ:

- `faq.mdx` — OVERWRITE the stub; title "keiki FAQ".

### meta.json slugs this plan APPENDS (M1–M3; append only)

- `content/docs/keiki/cookbook/meta.json` — appends all ~16 recipe slugs.
- `content/docs/keiki/tutorials/meta.json` — appends `a-loan-application-process-manager`,
  `a-derived-lifecycle-transition`.
- (`faq` is already in the top-level `content/docs/keiki/meta.json`; no append needed.)

### meta.json files this plan REORDERS in finalization (M4; reorder only, never delete)

- Top-level `content/docs/keiki/meta.json`.
- `content/docs/keiki/{tutorials,how-to,reference,explanation,cookbook,walkthrough}/meta.json`.
- Every `content/docs/keiki/walkthrough/<subdir>/meta.json` created by EP-21…EP-25
  (`core-and-builder`, `derivations`, `composition`, `symbolic-and-validation`,
  `rendering-and-codecs`). The hub `walkthrough/meta.json` is ordered to
  `[index, core-and-builder, derivations, composition, symbolic-and-validation, rendering-and-codecs]`.

### Section landings this plan REWRITES in finalization (M4)

- `content/docs/keiki/{tutorials,how-to,reference,explanation,cookbook,walkthrough}/index.mdx` —
  replace each "coming soon" `<Callout>` with a `<Cards>` index of that section's pages. The
  `cookbook/index.mdx` additionally carries the decision guide (authored in M1); the
  `walkthrough/index.mdx` carries the five hub `<Card href>`s wired in M4.

### Files this plan TOUCHES but does not own

- `docs/keiki-source-sync.md` (created by EP-20) — M4 verifies (and if needed extends) only its
  "most-coupled pages" list; it does not change the pinned commit or the update procedure.

### Dependencies on other plans

- **Hard dependency — EP-20**
  (`docs/plans/20-keiki-foundation-theory-getting-started-and-the-worked-example-spine.md`): must be
  Complete before any milestone. It creates the `content/docs/keiki/` tree (including the section
  `meta.json` files and "coming soon" landings this plan finalizes), the `/docs/keiki` overview +
  getting-started pages and the EmailDelivery getting-started tutorial every page links back to, the
  jitsurei spine module map, `docs/keiki-source-sync.md`, and the walkthrough hub. **M1–M3 depend
  only on EP-20** and may proceed as soon as EP-20 is Complete — every recipe and tutorial anchors to
  a jitsurei module that already exists at `344c4ca`.
- **Integration dependency — EP-21 … EP-25** (`docs/plans/21`–`docs/plans/25`): **M4 must run after
  all five are Complete** (verified per Concrete Steps: their walkthrough subdirs exist and their
  section `meta.json` files list more than `["index"]`). M4 reorders their slugs, rewrites their
  section landings, and wires the hub `<Card href>`s to their tours, but must **never delete or
  rename** their pages. The cookbook recipes that overlap a Phase-2 how-to (diagnosing rejected
  commands and build-time validation → EP-24; the cross-context Process and the workflow composition
  → EP-23; the per-vertex view and the shape hash → EP-22; the JSON codec / schema evolution → EP-22
  + EP-25) **cross-link** those plans' pages rather than duplicating them. The OrderCart
  multi-command tutorial is **EP-21's** and the EmailDelivery getting-started tutorial is **EP-20's**
  — the process-manager tutorial cross-links them as earlier rungs.

### Postconditions that must hold at the end

- Every file listed above exists; `pnpm typecheck`, `pnpm build`, `pnpm lint:links`, and
  `node scripts/check-doc-links.mjs` all exit 0 with the whole keiki tree present.
- `pnpm build` emits no `[unhandledRejection]` / `Failed to fetch` line (zero crawler warnings).
- No section `index.mdx` under `content/docs/keiki/` contains "coming soon"; each carries a `<Cards>`
  index whose links resolve; the walkthrough hub's five `<Card href>`s each link to a present tour.
- Every Haskell identifier quoted in a keiki cookbook/tutorial snippet exists in the keiki source at
  `344c4ca`; no snippet presents a divergent in-repo note (four-field `Decider`, `StepResult`
  wrapper, codec PII redaction) as the shipped API.
- `docs/keiki-source-sync.md`'s "most-coupled pages" list covers the pages this plan added.
