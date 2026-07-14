---
id: 40
slug: refresh-keiki-0-2-correctness-replay-and-persistence-documentation
title: "Refresh keiki 0.2 correctness replay and persistence documentation"
kind: exec-plan
created_at: 2026-07-14T15:14:31Z
intention: "intention_01kxgjsgnse1z9r0w141akd9g2"
master_plan: "docs/masterplans/6-prepare-keiro-runtime-documentation-for-wider-announcement.md"
---

# Refresh keiki 0.2 correctness replay and persistence documentation

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, a reader can use keiki 0.2 without being taught the removed Decider facade or
the more permissive 0.1 construction and replay behavior. The keiki section will explain how to
build edges with explicit output intent, inspect structured builder and replay failures, validate
the stronger durable-state invariants, compose transducers without hiding poisoned boundaries, and
evolve event and snapshot wire formats safely. A human can verify the result by following the
updated first-aggregate and replay-diagnostics examples, by confirming that every referenced symbol
is exported at the reviewed source commit, and by navigating the site without links to removed
`Keiki.Decider` pages.


## Progress

- [x] (2026-07-14T15:35:24Z) Resolve `shinzui/keiki` through mori and verify the clean
  `ce5748b5f2311de1355e648db564da8b404e42f2` source boundary and 0.2.0.0 package version.
- [ ] Milestone 1: remove the dead Decider API documentation and establish explicit output intent,
  structured replay, and `InFlight`-aware acceptors.
- [ ] Milestone 2: refresh builder validation, symbolic soundness, and checked composition.
- [ ] Milestone 3: refresh shape hashes, JSON persistence evolution, and the keiro integration
  handoff.
- [ ] Run the complete EP-1 validation and stale-API scan, then record outcomes for EP-7.

## Surprises & Discoveries

(None yet.)


## Decision Log

- Decision: Treat keiki 0.2.0.0 and committed source SHA
  `ce5748b5f2311de1355e648db564da8b404e42f2` as the review boundary.
  Rationale: The current site pointer is `344c4ca`; the 68-commit range to `ce5748b` contains the
  released breaking contracts. A committed SHA is reproducible and the upstream tree was clean
  during planning.
  Date: 2026-07-14
- Decision: Remove pages that document the deleted Decider facade instead of preserving them as
  deprecated reference.
  Rationale: keiki 0.2 removed the module and facade. Keeping callable-looking reference pages
  would be actively misleading; conceptual comparisons to the Decider pattern may remain if they
  clearly describe an external pattern rather than a keiki API.
  Date: 2026-07-14
- Decision: Keep this plan within `content/docs/keiki/` plus the narrow
  `content/docs/integrations/keiro-with-keiki.mdx` handoff.
  Rationale: Keiro's runtime translation of replay and validation failures belongs to
  `docs/plans/41-refresh-keiro-command-replay-snapshot-and-read-model-reliability-documentation.md`.
  This plan owns the foundational vocabulary that plan consumes.
  Date: 2026-07-14


## Outcomes & Retrospective

(To be filled during and after implementation.)


## Context and Orientation

This repository is a Fumadocs site. Its public keiki prose is under `content/docs/keiki/`; each
subdirectory has a `meta.json` file whose `pages` array controls sidebar order. The exact upstream
source last reviewed is recorded in `docs/keiki-source-sync.md`, currently
`344c4cadd55e0b997cc2c6ce0ab687851d66fa31`. The current registered source is resolved with
`mori registry show shinzui/keiki --full`; during planning it resolved to
`/Users/shinzui/Keikaku/bokuno/keiki` at
`ce5748b5f2311de1355e648db564da8b404e42f2`, release 0.2.0.0.

Keiki models a domain as a `SymTransducer`: a symbolic, register-carrying state machine whose
forward command step emits zero or more events and whose replay path reconstructs state from those
events. A multi-event transition temporarily uses `InFlight` state while replay consumes the tail.
The 0.2 source of truth is `src/Keiki/Core.hs`, especially `ReplayStepFailure`,
`ReplayFailureReason`, `ReplayFailure`, `applyEventStreamingEither`, `replayEvents`,
`applyEventsEither`, and `reconstituteEither`. The older `Maybe`-returning replay functions remain
compatibility wrappers, but new documentation must teach the structured `Either` surface first.

Construction is defined in `src/Keiki/Builder.hs`. Every `onCmd` or `onEpsilon` body must call
`emit`, `emitWith`, or `noEmit`; reaching `goto` without declaring intent is now an eager defect.
`buildTransducerEither`, `BuilderError`, and `renderBuilderErrors` expose located failures.
Duplicate register names are rejected through `DistinctNames`, command schemas are pinned in the
edge builder, and edge validation happens when the built value is evaluated rather than when a
rare branch is later demanded.

The stronger validation contract lives in `src/Keiki/Core.hs` around
`TransducerValidationWarning`. The new default checks cover head-event recoverability, inversion
ambiguity, unguarded input reads, and state-changing silent edges. `src/Keiki/Symbolic.hs` treats
solver `Unknown` or failure conservatively rather than as proof of an empty intersection, and its
fixed-width models preserve modular behavior. `src/Keiki/Composition.hs` adds
`checkComposeAlignment` and `composeChecked`, carries poison provenance, fixes state threading, and
documents `feedback1` as a two-copy cascade. `src/Keiki/Acceptor.hs` makes `outputAcceptor`
`InFlight`-aware.

Persistence spans two packages. `src/Keiki/Shape.hs` pins built-in `CanonicalTypeName` values, which
changes every non-empty 0.1 shape hash once and intentionally causes old snapshots to miss and fall
back to full replay. `keiki-codec-json/src/Keiki/Codec/JSON/Event.hs` defines versioned event
envelopes, additive-field defaults, and migrations; `keiki-codec-json/src/Keiki/Codec/JSON.hs` and
`keiki-codec-json/src/Keiki/Codec/JSON/TH.hs` define register snapshots and derivation. The checked-in
goldens and tests under upstream `keiki-codec-json/test/` are source evidence for wire behavior.

The current site is materially stale. `content/docs/keiki/reference/decider.mdx`,
`content/docs/keiki/explanation/decider-facade-and-when-to-use-it.mdx`, and
`content/docs/keiki/walkthrough/derivations/07-decider-facade.mdx` describe a module removed in 0.2.
`content/docs/keiki/how-to/ergonomic-emit.mdx` says a missing output declaration implicitly creates
a silent edge, the opposite of the new builder contract. The core walkthroughs still present
`Maybe` replay as primary, the acceptor walkthrough is letter-only, and codec/shape pages do not yet
teach the one-time 0.2 wire and snapshot migration consequences.


## Plan of Work

Milestone 1 removes dead API documentation and establishes the 0.2 construction and replay path.
Delete the three facade-specific pages named above, remove their entries and neighboring
previous/next links from `content/docs/keiki/reference/meta.json`,
`content/docs/keiki/explanation/meta.json`, and
`content/docs/keiki/walkthrough/derivations/meta.json`, and repair all incoming cards and links.
Conceptual pages such as `content/docs/keiki/explanation/event-sourcing-and-the-decider.mdx` may
continue discussing the generic Decider pattern, but must say keiki exposes no Decider record.
Rewrite the replay sections of `content/docs/keiki/reference/core.mdx`,
`content/docs/keiki/reference/step-failure.mdx`,
`content/docs/keiki/walkthrough/core-and-builder/06-edges-and-step-semantics.mdx`, and
`content/docs/keiki/tutorials/your-first-aggregate.mdx` around the structured `Either` functions,
then present the `Maybe` wrappers as compatibility conveniences. Update the acceptor reference and
walkthrough to show its `InFlight` carrier. The milestone is accepted when a link scan finds no
facade page and the tutorial distinguishes ordinary command rejection from malformed persisted
history with an inspectable `ReplayFailureReason`.

Milestone 2 refreshes builder, validation, symbolic analysis, and composition. Update
`content/docs/keiki/reference/builder.mdx`, `content/docs/keiki/how-to/ergonomic-emit.mdx`, the
core-and-builder walkthrough, silent-edge cookbook, and affected tutorials so every edge declares
`emit`, `emitWith`, or `noEmit`, and document `buildTransducerEither` plus eager/located defects.
Update `content/docs/keiki/reference/validate.mdx`, `reference/symbolic.mdx`,
`explanation/single-valuedness-and-soundness.mdx`, `explanation/the-symbolic-ci-gate.mdx`, and the
symbolic walkthrough for the four new default warnings and conservative solver uncertainty. Update
`reference/composition.mdx`, `reference/profunctor.mdx`, `explanation/the-composition-algebra.mdx`,
the composition walkthrough, and composition how-tos for checked alignment, poison provenance,
stateful update semantics, arm exclusion, and the true two-copy `feedback1` contract. Acceptance is
an exact-symbol scan against upstream exports plus examples that show both a successful checked
composition and a rendered alignment failure.

Milestone 3 refreshes persistence and integration. Update `content/docs/keiki/reference/shape.mdx`,
`reference/codec-json.mdx`, `explanation/the-regfile-codec-and-snapshots.mdx`, the rendering/codec
walkthrough, `how-to/persist-a-register-snapshot.mdx`, `how-to/derive-a-json-event-codec.mdx`,
`cookbook/evolve-a-schema-safely.mdx`, and related cookbook entries. Explain versioned event
envelopes, pinned wire kinds, additive-field defaults, historical-envelope migration, snapshot
goldens, ambiguous persistence-shape rejection, and the one-time 0.2 shape-hash miss/full-replay
behavior. Reconcile `content/docs/keiki/index.mdx`, section indexes and FAQs, then update only the
foundational keiki claims in `content/docs/integrations/keiro-with-keiki.mdx`; defer keiro-specific
failure mapping to the child plan named in the Decision Log. The milestone is accepted when all
keiki pages build, navigation covers every remaining page exactly once, and no callable reference
remains to a removed module or symbol.


## Concrete Steps

Work from `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`. Resolve and verify the source before
editing:

```bash
mori registry show shinzui/keiki --full
KEIKI=/Users/shinzui/Keikaku/bokuno/keiki
git -C "$KEIKI" status --short
git -C "$KEIKI" rev-parse HEAD
git -C "$KEIKI" log --oneline 344c4ca..HEAD
git -C "$KEIKI" diff --stat 344c4ca..HEAD
```

At the planned boundary the SHA line is:

```text
ce5748b5f2311de1355e648db564da8b404e42f2
```

If committed `HEAD` moved, review the additional commits and update this plan's source notes before
using the new SHA. Do not include uncommitted source changes. Use targeted searches while editing:

```bash
rg -n 'Keiki\.Decider|toDecider|Decider facade' content/docs/keiki
rg -n 'reconstitute|applyEvents|applyEventStreaming|ReplayFailure' content/docs/keiki
rg -n 'noEmit|buildTransducerEither|TransducerValidationWarning' content/docs/keiki
rg -n 'CanonicalTypeName|shape hash|event envelope|composeChecked' content/docs/keiki
```

Run incremental site checks after each milestone:

```bash
pnpm run typecheck
pnpm run format:check
pnpm build
node scripts/check-doc-links.mjs
git diff --check
```

The expected successful shape is:

```text
TypeScript exits 0.
Formatting exits 0.
The static build completes.
The source link checker reports no broken /docs targets.
git diff --check emits no output.
```


## Validation and Acceptance

Acceptance is behavioral. A reader following the first-aggregate path can author explicit output
intent, build through `buildTransducerEither`, run a command, and inspect structured replay failure
without importing a removed facade. The reference accurately distinguishes forward rejection,
ambiguous inversion, queue mismatch, and truncated multi-event replay. A snapshot reader learns
that upgrading to 0.2 invalidates the old non-empty shape hash as a cache key but preserves the
event log and recovers by full replay. A codec reader can state when an additive field defaults and
when an explicit historical-envelope migration is required.

The following stale-API check must return no results except explicitly conceptual prose that does
not claim keiki exports a Decider API:

```bash
rg -n 'Keiki\.Decider|toDecider|/docs/keiki/reference/decider|07-decider-facade' content/docs
```

This check must find the new primary APIs in both reference and at least one tutorial or how-to:

```bash
rg -n 'buildTransducerEither|reconstituteEither|ReplayFailureReason|composeChecked' content/docs/keiki
```

Finally, `pnpm run typecheck`, `pnpm build`, `node scripts/check-doc-links.mjs`, and
`git diff --check` must exit zero. Record the reviewed SHA and any justified conceptual Decider
allow-list in this plan's living sections for EP-7; do not update `docs/keiki-source-sync.md` here.


## Idempotence and Recovery

All work is Markdown/MDX and JSON navigation editing, so checks are safe to repeat. Delete a stale
page only after removing all incoming links; if a build or link check fails, restore consistency by
fixing links and metadata, not by reintroducing obsolete API prose. Preserve unrelated user changes
in the working tree. If upstream committed `HEAD` changes during implementation, finish against one
explicit SHA or expand the audit and record the decision; never advance a source pointer based on a
mixed committed/uncommitted state.


## Interfaces and Dependencies

The source dependency is `shinzui/keiki`, resolved with mori. The public modules that this plan may
document are `Keiki.Core`, `Keiki.Builder`, `Keiki.Composition`, `Keiki.Profunctor`,
`Keiki.Acceptor`, `Keiki.Symbolic`, `Keiki.Shape`, `Keiki.Generics`, `Keiki.Generics.TH`,
`Keiki.Codec.JSON`, `Keiki.Codec.JSON.Event`, and `Keiki.Codec.JSON.TH`. Confirm every signature in
the module export list at the selected SHA; do not copy design-time signatures from upstream
`docs/plans/` when they disagree with source.

The integration dependency is
`docs/plans/41-refresh-keiro-command-replay-snapshot-and-read-model-reliability-documentation.md`.
That plan consumes the terms defined here but owns keiro types and pages. The final source-pointer
and announcement integration is owned by
`docs/plans/46-prepare-announcement-navigation-compatibility-and-whole-site-release-gate.md`.

No production Haskell interface is created by this documentation work. The required documentation
interface at completion is a navigable keiki section whose examples name the 0.2 public symbols,
whose metadata contains no removed page, and whose cross-library page clearly separates keiki's
structured replay contract from keiro's runtime error mapping.
