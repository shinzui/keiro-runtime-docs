# Keiki docs ↔ source sync pointer

The `content/docs/keiki/` tree is ported and cross-checked against committed
Keiki source, not generated from it. This file pins the exact upstream commit
reviewed by the documentation.

## Upstream source

- **Qualified name (mori):** `shinzui/keiki`; resolve it with
  `mori registry show shinzui/keiki --full`.
- **Path at last sync:** `/Users/shinzui/Keikaku/bokuno/keiki`.
- **Reviewed releases:** `keiki 0.4.0.0`, `keiki-codec-json 0.4.0.0`, and
  `keiki-codec-json-test 0.4.0.0`.
- **Primary modules:** `Keiki.Core`, `Keiki.Builder`, `Keiki.Operators`,
  `Keiki.Acceptor`, `Keiki.Generics`, `Keiki.Generics.TH`, `Keiki.Composition`,
  `Keiki.Profunctor`, `Keiki.Symbolic`, `Keiki.Shape`, `Keiki.Validate`, and the
  render and JSON-codec modules.

## Last reviewed commit

```text
6807aac817fe53bbcc1b11b9e1a1b226bae14413  (6807aac)
2026-07-28T06:32:08-07:00
docs(plan): record 0.4.0.0 release
```

> **Current range.** The `ce5748b..6807aac` range (13 commits) folds in **three**
> releases at once — 0.3.0.0, 0.3.1.0, and 0.4.0.0. None of them had reached the
> `content/docs/keiki/` tree before this round, even though the keiro pointer had
> already described `EdgeMode` from *keiro's* side; a grep for `EdgeMode`,
> `CanonicalStateShape`, and `FieldProjection` across `content/docs/keiki/` came
> back empty at the old pin. Two of the three carry breaking constructor
> additions.
>
> **1. keiki 0.3.0.0 — `EdgeMode` (breaking).** `Edge` gained
> `mode :: EdgeMode` (`Live | ReplayOnly`), with `Live` as the `Monoid` identity
> and `ReplayOnly` absorbing, so a composite edge is `Live` only when every
> component is. A `ReplayOnly` edge is invisible to forward stepping (`delta`,
> `omega`, `step`, `stepEither` all carry `mode e == Live`) and participates in
> inversion only when no live edge attributes the observed event — `applyEvent`
> is now **two-phase**, with ambiguity judged *within* the phase that produced
> candidates. `Keiki.Builder.replayOnly` sets the flag (idempotent,
> position-independent; `PartialEdge` gained `peMode`, seeded `Live`). Static
> checks became mode-aware: the determinism family scopes to `Live`/`Live` pairs,
> `inversionAmbiguityWarnings` to *same-mode* pairs, everything else applies
> unchanged — and structural reachability deliberately still traverses
> replay-only targets, so a vertex reachable only through one stays live for
> replay continuation.
>
> Landed as: a new `### Edge mode` section in `reference/core.mdx`; a new
> `## Edge mode — replayOnly` section in `reference/builder.mdx`; a new
> `## Edge mode and the static checks` table in `reference/validate.mdx`; the
> `mode` field, the "one edge set serves execution and replay" rationale, the
> `delta` filter, and a new `### Inversion is two-phase` section in
> `walkthrough/core-and-builder/06-edges-and-step-semantics.mdx`; a new
> `## Edge mode: replayOnly` section in
> `walkthrough/core-and-builder/08-builder-edge-body.mdx`; mode-scoping callouts
> in `walkthrough/symbolic-and-validation/07-build-time-validation-umbrella.mdx`;
> and `Live`/`ReplayOnly` scoping in
> `explanation/single-valuedness-and-soundness.mdx`.
>
> **ADDED:** `how-to/tighten-a-guard-without-breaking-replay.mdx` — the
> guard-tightening task, the twin recipe, the three verification steps, and the
> deletion condition (every stream containing the region's events terminal or
> truncated). Admitted as a how-to because the decision it settles — *whether you
> need a twin, and when you may remove it* — is not settled by the reference.
> Wired into `how-to/meta.json`, the "Symbolic analysis and validation" card group
> in `how-to/index.mdx`, plus inbound links from the core/builder/validate
> references, the two walkthrough chapters, `cookbook/evolve-a-schema-safely.mdx`
> (which is the *wire* half of evolution, not the behavioural half), and two new
> FAQ entries.
>
> **2. keiki 0.3.1.0 — control-state shape hashes.**
> `Keiki.Shape.CanonicalStateShape` / `stateShapeCanonical` / `stateShapeHash`
> give a generic, deterministic discriminator for the control-state datatype:
> datatype name, constructor names **and order**, and each field's
> `CanonicalTypeName`, rendered `state:<D>{<C>|<C>(<f>,<f>)}` and SHA-256'd.
> Opt in with an empty instance over `Generic`. It records **no** field names,
> values, instances, or fold semantics — so a semantic fold change is invisible
> to it, which is exactly why keiro composes it with a fold fingerprint into a
> three-component discriminator. Folded into `reference/shape.mdx` (whose intro
> and `description` now cover both hashes; the old `## The model` heading became
> `## The register-file model`), a new `## The other half of the state` section in
> `walkthrough/derivations/09-shape-hash.mdx`, and pointer callouts in
> `walkthrough/rendering-and-codecs/09-shape-hash-and-snapshots.mdx` and
> `how-to/persist-a-register-snapshot.mdx` (both of which describe a
> *two*-discriminant rule for the register-file half and now say so explicitly).
>
> **3. keiki 0.4.0.0 — typed symbolic field projections (breaking).** The
> headline feature: a guard can read **one scalar out of a consumer-owned value**
> whose type has no symbolic representation at all, as long as the *result* type
> is in the curated registry. Surface: `FieldProjection` (with `FieldName` /
> `FieldOwner` / `FieldResult` / `fieldShapeId` / `projectFieldValue`), the
> nominal-role `FieldWitness` + `fieldWitness`, the deliberately restricted
> `ProjBase` (`PBReg` / `PBInp` only — no computed bases), `regProj` / `inpProj`,
> `fieldProjectionPath`, `fieldWitnessAgrees`, and the documented internals
> `fieldWitnessGet` / `indexPosition`.
> `Keiki.Symbolic.constrainFieldProjection` binds a memoized projection variable
> to a concrete getter result. **Breaking:** `Term` gained `TFieldProj`;
> `TransducerValidationWarning` gained `ProjectionResultUnsupported`,
> `ProjectionOrderingUnsupported`, `ProjectionOutsideGuard` (all three
> *unconditional*, not gated by `ValidationOptions`); `ComposeAlignmentWarning`
> gained `NonStructuralProjectionBoundary`; and **`checkComposeAlignment` now
> requires `WeakenR rs1`** (`composeChecked` already did, so only direct callers
> break).
>
> Two properties are load-bearing and easy to get wrong, so they are stated in
> every place a reader might land: identity is **structural** (the tag's
> `TypeRep`, plus the base path *and* `indexPosition`; caller-controlled
> diagnostic strings never determine solver identity, and the SBV label is a
> generated `proj/<ordinal>` from the new `seProjectionOrdinal`), and agreement is
> **one-way** (a concrete owner can bind a matching symbolic value; an arbitrary
> symbolic model need not correspond to a constructible owner — `symSatExt` does
> not reconstruct owners). Composition classifies each downstream projection as
> preserved (direct register/input owner), folded (literal owner), or lowered to
> an opaque `TApp1` (computed owner); raw `compose` accepts all three,
> `composeChecked` rejects the lowering case with reason
> `"upstream computed output"` or `"pending write"`.
>
> Landed as: a new `## Field projections` section in `reference/core.mdx`; a
> corrected `SymEnv`, the `SymVarKey`/`ProjectionBaseKey` sums, and a new
> `### constrainFieldProjection` section in `reference/symbolic.mdx`; the three
> findings in `reference/validate.mdx`; a new
> `### Field projections across a boundary` section in `reference/composition.mdx`;
> `TFieldProj` in `walkthrough/core-and-builder/03-term-language.mdx`; the keying
> scheme, `projectionVarKey`, and the key-vs-label split in
> `walkthrough/symbolic-and-validation/03-translation-and-the-memo-cache.mdx`; a
> new `### Field projections: precision without symbolizing the owner` subsection
> in `explanation/single-valuedness-and-soundness.mdx`; a new
> `## Guarding on a consumer-owned field` section in `how-to/drop-down-to-the-ast.mdx`
> (the hand-authoring home); and an FAQ entry.
>
> **Pre-existing inaccuracies corrected this round** (per the follow-the-source
> rule, not caused by this range): `reference/symbolic.mdx` and
> `walkthrough/symbolic-and-validation/03-*.mdx` both omitted `SymEnv`'s
> `seInputArm` field, which predates the old pin (verified against
> `git show ce5748b:src/Keiki/Symbolic.hs`). Both now transcribe the full record.
>
> **`how-to/drop-down-to-the-ast.mdx` was silently broken** by 0.3.0.0 and is
> fixed: every hand-written `Edge` record on that page omitted the now-required
> `mode` field and would not have compiled. `## The four Edge fields` is now
> `## The five Edge fields` with a `### mode` entry.
>
> **NO-OP:** the `discoverSym` / `discoverSymOrd` / `discoverSymNum` refactor to
> dispatch through the new internal `Keiki.Internal.SymbolicTypes.SymbolicType`
> is behaviour-preserving — the curated registry contents are unchanged type for
> type, so the registry lists in `explanation/single-valuedness-and-soundness.mdx`
> and `reference/symbolic.mdx` still hold. Also NO-OP: `Keiki.Render.Pretty` (a
> `TFieldProj` render case, no public-surface change), the seihou/agents module
> syncs, the GHC 9.12 toolchain release note, and the `docs/improvement-requests/`
> + `docs/plans/79` + `docs/research/field-projection-design.md` prose (intent
> only; the shipped source is what was transcribed).
>
> **Deliberately not documented:** nothing in this range. The source tree was
> clean at the reviewed SHA.

## Most-coupled pages

- Exact signatures under `content/docs/keiki/reference/`.
- Source tours under `content/docs/keiki/walkthrough/`.
- Persistence and upgrade pages for snapshots, shape hashes, and JSON codecs.
- Composition, validation, and solver explanations and recipes.

## Previous pointers

- `ce5748b5f2311de1355e648db564da8b404e42f2` (`ce5748b`), 2026-07-13, `keiki 0.2.0.0`
  — the baseline before the three-release evolution-and-projection round. The
  `ce5748b..6807aac` range (13 commits) landed `EdgeMode` + `replayOnly` (0.3.0.0,
  breaking), the `CanonicalStateShape` control-state hash (0.3.1.0), and typed
  symbolic field projections (0.4.0.0, breaking). The `344c4ca..ce5748b` review
  covered the 0.2 release: removal of the Decider facade, structured command and
  replay failures, explicit builder output intent, located construction errors,
  stricter replay validation, checked composition, exact symbolic models, pinned
  shape identities, snapshot compatibility, and versioned JSON event envelopes.
- `344c4cadd55e0b997cc2c6ce0ab687851d66fa31` (`344c4ca`), 2026-06-06 —
  Keiki 0.1 baseline before the 0.2 correctness, composition, persistence, and
  codec review.

## Update procedure

1. Resolve the source with mori and inspect committed drift:
   ```text
   KEIKI=$(mori registry show shinzui/keiki --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$KEIKI" log --oneline 6807aac..HEAD
   git -C "$KEIKI" diff --stat 6807aac..HEAD
   ```
2. Read changed source, tests, changelogs, and release notes. Treat historical
   design notes as context only when they disagree with shipped modules.
3. Update affected pages, replace the reviewed SHA above, and move the prior
   pointer into the traceability list.
