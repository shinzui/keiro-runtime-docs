# Keiki docs ↔ source sync pointer

The `content/docs/keiki/` tree is ported and cross-checked against committed
Keiki source, not generated from it. This file pins the exact upstream commit
reviewed by the documentation.

## Upstream source

- **Qualified name (mori):** `shinzui/keiki`; resolve it with
  `mori registry show shinzui/keiki --full`.
- **Path at last sync:** `/Users/shinzui/Keikaku/bokuno/keiki`.
- **Reviewed releases:** `keiki 0.9.0.0`, `keiki-codec-json 0.9.0.0`, and
  `keiki-codec-json-test 0.9.0.0`.
- **Primary modules:** `Keiki.Core`, `Keiki.Builder`, `Keiki.Operators`,
  `Keiki.Acceptor`, `Keiki.Generics`, `Keiki.Generics.TH`, `Keiki.Composition`,
  `Keiki.Profunctor`, `Keiki.Symbolic`, `Keiki.ProjectionDomain`, `Keiki.Shape`,
  `Keiki.Validate`, and the render and JSON-codec modules. **New this round (both
  internal, neither exposed):** `Keiki.Internal.WireSchema` and
  `Keiki.Internal.ConstructorEvidence`.
- **Upstream prose read this round:** `CHANGELOG.md` (both packages),
  `docs/foundations/07-replay-verification-and-trusted-events.md` (new, and the
  single best source for this range), `docs/research/full-symbolic-replay-inversion-model.md`,
  and plans 85–89.

## Last reviewed commit

```text
9714d37033c37595e3aaa3319ca0ca77466782e0  (9714d37)
2026-08-04T20:35:48-07:00
chore(release): 0.9.0.0
```

> **Current range.** The `9ee8de0..9714d37` range (40 commits) is **one release,
> 0.9.0.0, with one theme**: replace *name-based* constructor identity with
> *structural, `Generic`-derived evidence*, and seal construction so that evidence
> cannot be forged. It is breaking for anyone who hand-writes an `InCtor` or
> `WireCtor`. The JSON wire format is unchanged, and `keiki-codec-json` 0.9.0.0 is
> a bounds-only co-release — its `src` diff is empty.
>
> **1. Sealed construction (`345b37c`, breaking).** `InCtor` and `WireCtor`
> construction *and record update* now sit behind read-only patterns; the real
> constructors (`MkInCtor` / `MkWireCtor`) take a strict capability whose
> constructor lives in an unexposed module. The strict match is load-bearing and
> upstream comments say never to make it lazy: a consumer who cannot name the
> capability type can still apply the exported hook to bottom, and the match
> forces it first. Public callers get three routes — `unavailableInCtor` /
> `unavailableWireCtor` (explicitly no evidence), `renameInCtor` / `renameWireCtor`
> (relabel while preserving evidence), and the trusted `Via` / TH producers.
> `mkInCtor`, `mkInCtor0`, `mkWireCtor`, `mkWireCtor0` are **deprecated** and now
> delegate to the `unavailable*` forms.
>
> **2. Structural schemas and head classification (`2eeb428`, `fc6d240`).**
> `WireSchema` / `InCtorSchema` carry an abstract constructor path plus an ordered
> field/slot spine. Three proof-safe observers: `classifyWireHeads`,
> `classifyInputHeads`, `classifyInputWireHeads`, each returning
> `…StructurallyEqual` / `…Different` / `…Unwitnessed`. New producers
> `mkInCtorRecordVia` / `mkWireCtorRecordVia` cover direct-record constructors,
> and `mkWireCtor0Via` replaces `mkWireCtor0` — **nullary TH wires now match via
> `Generic co` instead of `Eq co`, so a quotienting custom `Eq` no longer changes
> `wcMatch`.**
>
> **3. Composition substitutes on typed alignment, not equal names (`ae2cd2b`,
> `1ca857f`).** `ComposeAlignmentWarning` gains `StructurallyDifferentInputWire`
> and `UnwitnessedInputWireAlignment`. Both fire on pairs whose *names already
> match* — name equality is now only the candidate filter, and structure decides.
> `1ca857f` removed the `unsafeCoerce` from schema alignment in favour of a typed
> `Either` prefix spine with lockstep GADT refinement.
>
> **4. Symbolic identity and the opt-in inversion checker (`cedbbc1`, `95ad1f3`,
> `de5fa58`, `d110fae`).** New `checkInversionAmbiguitySymDetailed` /
> `checkInversionAmbiguitySym` with `InversionAnalysisDetail`,
> `InversionProofVerdict`, `InversionSolverStatus`, `InversionTranslationIssue`,
> `InversionCandidate`. Verdicts join to warnings by source vertex **and both edge
> indices**, and fail closed on missing/duplicate/reordered details. Separately the
> *default* `inversionAmbiguityWarnings` stayed pure but now classifies heads
> structurally and suppresses a same-mode warning when exact integral
> register/literal conjuncts prove disjointness — **so a recompile can change the
> warning set**, and `tvwDetail` text changed.
>
> **Pages:** added `explanation/what-replay-proves.mdx` (ported from the new
> upstream foundations doc — it owns the invertible-vs-derived distinction and the
> "where trust bottoms out" argument, which no existing page covered). Updated
> `reference/core.mdx`, `reference/generics.mdx`, `reference/generics-th.mdx`,
> `reference/composition.mdx`, `reference/profunctor.mdx`, `reference/symbolic.mdx`,
> `reference/validate.mdx`, `walkthrough/core-and-builder/05-output-and-predicate.mdx`,
> `walkthrough/derivations/03-via-builders-and-sum-walk.mdx`,
> `walkthrough/composition/08-existential-wrapper-and-profunctor.mdx`,
> `how-to/derive-aggregate-constructors.mdx`, `explanation/single-valuedness-and-soundness.mdx`,
> `faq.mdx` (three new entries), `index.mdx`. Nothing retired.
>
> **Fixed while in the file (pre-existing, out of range):**
> `walkthrough/composition/08-existential-wrapper-and-profunctor.mdx` transcribed
> `contraInCtor` / `mapWireCtor` without their `#lmapped` / `#rmapped` name
> stamping. Verified against `9ee8de0` — the stamping predates this range, so the
> snippet was already wrong. Corrected and flagged on the page.
>
> **Deliberately not documented:** `Keiki.Internal.WireSchema` and
> `Keiki.Internal.ConstructorEvidence` beyond what the public surface needs — they
> are `other-modules`, deliberately unexposed, and documenting their internals
> would invite exactly the forgery the seal prevents. The `*ForTesting` exports
> (`inputWireSpineRelationsForTesting`, `inCtorSchemaPrefixRelationForTesting`,
> `wireSchemaPrefixRelationForTesting`) and `wireHeadsMayAliasForDefault` are named
> as test/future-default hooks and are not documented as user API. The four new
> improvement-requests and `docs/research/full-symbolic-replay-inversion-model.md`
> describe unshipped follow-up work — notably gating the opt-in checker in consumer
> CI — and are recorded here rather than documented.

> **Note (prior range).** The `6807aac..9ee8de0` range (38 commits) folds in **four**
> releases — 0.5.0.0, 0.6.0.0, 0.7.0.0, and 0.8.0.0 — along four threads. Three of
> the four carry breaking changes, and two of those are *semantic* fixes that change
> the answer an existing program gets rather than only its type.
>
> **1. `Natural` becomes a first-class symbolic carrier (0.5.0.0, 0.6.0.0).** 0.5.0.0
> pinned `Natural`'s `CanonicalTypeName`, admitted it to the symbolic equality and
> ordering registries, and added `Sym.constrainSymDomain` — a **defaulted** class
> method (hence PVP major, but source-compatible) that lets a refined carrier state
> the validity invariant of its representation. `Natural` is an unbounded `Integer`
> constrained `.>= 0` at every allocation site: `symFree`, structural register and
> input reads, field projections, and opaque term fallbacks. 0.5.0.0 deliberately
> kept `Natural` *out* of the arithmetic registry, because Haskell's `Natural`
> subtraction throws `Underflow` where SMT integer subtraction returns a negative.
> 0.6.0.0 closed that with a **breaking semantic fix**: `tsub` on a `Natural` is
> total monus (`a - b = max 0 (a - b)`) in *both* interpreters — concrete evaluation
> special-cases the type before calling `(-)`, the translator emits
> `ite (a .>= b) (a - b) 0` — after which `Natural` joined the numeric registry.
> Two side effects: the opt-in opaque-guard audit widened to cover a `TArith` whose
> carrier is outside the numeric registry (so its `tvwDetail` no longer names `TApp`
> specifically, and tests asserting on the text break), and the fast pure overlap
> validator models `Natural` as the exact interval `[0, ∞)`. `keiki-codec-json`
> 0.5.0.0 added `Natural` wire support: a JSON number that rejects negative and
> fractional values rather than truncating.
>
> Landed as: a `Natural` row and a monus callout in `reference/symbolic.mdx`
> (plus the `constrainSymDomain` method and a `discoverSymNum` correction), the
> `Natural` monus warning in `reference/core.mdx` and
> `walkthrough/core-and-builder/03-term-language.mdx`, a `Naturals` row in
> `reference/shape.mdx`, the widened-audit callout in `reference/validate.mdx`
> (and its interval note), the wire callout in `reference/codec-json.mdx`, the
> instance walkthrough in `walkthrough/symbolic-and-validation/02-*.mdx`, the
> registry list and representation paragraph in
> `explanation/single-valuedness-and-soundness.mdx`, and an FAQ entry.
>
> **2. Verification honesty and exact projections (0.6.0.0, 0.7.0.0).** 0.6.0.0
> added `verifyPredicate` / `predicateTranslationExact` / `PredicateVerification`,
> separating "the translation was exact" from "the solver was definite". 0.7.0.0
> then made the distinction load-bearing with a **semantic correctness fix**: a
> one-way `fieldWitness` projection is no longer treated as exact merely because
> its *result* carrier is solver-supported, so predicates containing one now report
> `UnverifiedOpaque`. Soundness did not regress — `symIsBot` still proves such
> predicates empty — but `verifyPredicate` stopped overstating.
>
> The opt-in that *does* buy exactness is the **new module `Keiki.ProjectionDomain`**
> (`ProjectionDomain`, `TextPattern`, `DomainConstructionError`,
> `maximumSmtCodePoint`, `finiteProjectionDomain`, `wholeProjectionDomain`,
> `textProjectionDomain`, `textLiteral`, `textCharSet`, `textCharRanges`,
> `textConcat`, `textAlternation`, `textRepeatBetween`, `memberProjectionDomain`,
> `matchesTextPattern` — re-exported wholesale by `Keiki.Symbolic`), plus
> `ExactFieldProjection` / `exactFieldWitness` / `ProjectionLawFailure` /
> `checkFieldProjectionOwner` / `checkFieldProjectionKey` and the read-only
> queries `fieldWitnessHasExactDomain` / `fieldWitnessDomain` /
> `fieldWitnessReconstruct` in `Keiki.Core`. `FieldWitness` is now a real record
> over private evidence, still exported abstractly. Whole-carrier exactness is
> gated by `symbolicWholeCarrierExact` and holds only for `Bool`, `Integer`,
> `Natural`, and the curated fixed-width integers — `UTCTime` clamps leap-second
> day times, `Text` exceeds SMT-LIB's U+2FFFF ceiling.
>
> Two caveats are stated everywhere a reader could land, because they are the
> whole point: exact-domain soundness is **conditional on the owner-side law**
> (keiki checks every model for domain membership, inverse success, and getter
> round trip, but cannot see a domain that *omits* a real owner's key — that
> under-declaration manufactures a false UNSAT), and per-projection exactness is
> **not** predicate-global exactness (two tags over one owner, or a direct read
> plus a projection, stay conservative; an input projection is exact only when the
> predicate implies its constructor guard, which is what the newly exported
> `predicateImpliesInCtor` decides). Also in 0.7.0.0: `symSatExt` concretely
> rechecks every candidate, so every `Just` satisfies `models` unconditionally and
> the previously-documented escape-hatch caveat is gone — at the price that
> `Nothing` now strictly means "no witness recovered". Reporting surface:
> `predicateTranslationReport`, `TranslationStrength`, the ten-constructor
> `TranslationIssue`, `verifyPredicateDetailed`, `PredicateVerificationDetail`,
> `ProjectionModel` + its typed eliminators, `ProjectionBaseKind` /
> `ProjectionBaseDescriptor` / `ProjectionDescriptor`, and the `IO`-returning
> `checkTransitionDeterminismSymDetailed` / `checkDeadEdgesSymDetailed` (which
> drop the `Show s` constraint the compatibility checks need).
>
> **ADDED:** `reference/projection-domain.mdx` — the module has fifteen exports, a
> two-interpretation design constraint, and a proof obligation a reader must look
> up member by member, so it clears the reference-page admission test rather than
> fitting inside `reference/symbolic.mdx`. Wired into `reference/meta.json`, the
> "Symbolic analysis and validation" card group in `reference/index.mdx`, and
> inbound links from `reference/core.mdx`, `reference/symbolic.mdx`, and
> `explanation/single-valuedness-and-soundness.mdx`.
>
> Also landed as: a new `### Exact projections` section and a corrected witness
> description in `reference/core.mdx`; a new `## Verification: was the answer
> actually proved?` section, a `### Whole-carrier exactness` section, the four new
> `SymEnv` fields, a `### The detailed variants` section, and a rewritten
> `constrainFieldProjection` callout in `reference/symbolic.mdx`; a new
> `### Exact projections: buying the other direction` subsection and two corrective
> callouts in `explanation/single-valuedness-and-soundness.mdx`; two callouts in
> `explanation/the-symbolic-ci-gate.mdx`; the recheck callout in
> `walkthrough/symbolic-and-validation/05-symisbot-and-witness-extraction.mdx`;
> and an FAQ entry.
>
> **3. Detailed attribution (0.7.0.0).** `stepDetailedEither` + `StepSuccess`
> became the selection and evaluation *authority*, with `stepEither` redefined as
> its erasure; `applyEventsDetailedEither` / `reconstituteDetailedEither` +
> `ReplayEventSpan` / `ReplayAttribution` / `ReplaySuccess` expose an ordered
> completed-edge factorization of a successful strict replay. Spans are zero-based
> and half-open, a multi-event edge completes **one** attribution, an epsilon-output
> edge is unobservable in replay and never appears, and the live-first phase is
> reported exactly. All replay paths now share one `applyEventKernel`, so the
> existing functions keep a nullary no-trace policy with O(1) auxiliary state.
> `EdgeRef` gained explicit documentation that it is **construction-local** and must
> not be persisted. Landed as two new sections (`### Detailed forward success`,
> `### Replay attribution`) plus an `EdgeRef` stability callout in
> `reference/core.mdx`.
>
> **4. Readable business semantics as the primary rendering contract (0.8.0.0,
> ADR-0006).** The largest doc-facing change in the range, and a **reversal** of
> what these pages previously taught. `TLit` and `lit` now require `Show`, `Term`
> gained `TOpaqueLit` / `opaqueLit`, and `prettyTerm` prints a literal's real value
> — `<lit>` is now reserved for the deliberate opaque constructor. `toMermaid` and
> **every** no-options shape renderer default to readable guards, complete register
> assignments, multiline labels, and no truncation; `toTopologyMermaid` /
> `topologyMermaidOptions` are the named policy carrying the old keiki 0.7 bytes.
> `MermaidOptions` **removed** `showWrittenSlots` and `showGuardSummary` (replaced
> by `updateMode :: MermaidUpdateMode` and the existing `guardMode`, which are now
> the sole authorities — the legacy-precedence rule is gone), and every composite,
> nested, three-way, alternative, and feedback shape gained an options-aware route.
> Semantic text is escaped once, before renderer-owned `<br/>` joins, on three
> tiers: XML entities for safe punctuation, **visible full-width forms** for
> parser-active angle brackets and backslashes, and control pictures for raw CR/LF,
> with `<lit>` entity-encoded as a known-safe carve-out.
>
> The consequence worth repeating: readable rendering **discloses `lit` values**,
> so secrets must use `opaqueLit` or the whole diagram must go through
> `topologyMermaidOptions`. The two literal constructors are executably and
> proof-wise identical — no runtime, replay, validation, pure-analysis, composition,
> or symbolic path forces `Show`.
>
> Landed as: a substantially rewritten `reference/render-mermaid.mdx` (the default
> section, `toTopologyMermaid`, both worked examples, the options-aware companion
> table, `MermaidUpdateMode`, the rewritten `MermaidOptions` with both named
> policies transcribed in full, and a new `## Escaping at the parser boundary`
> section); new `### Readable and opaque literals` and rewritten smart-constructor
> sections in `reference/core.mdx`; a rewritten literal table and examples in
> `reference/render-pretty.mdx`; a rewritten `## Readable business semantics are the
> primary contract` section with a `### Why the default was reversed` subsection in
> `explanation/diagrams-from-one-declaration.mdx`; a re-aimed
> `how-to/render-a-mermaid-diagram.mdx` (now "turn the guards back off") and
> upgrade callout in `how-to/keep-diagrams-in-sync.mdx`; rewritten
> `walkthrough/rendering-and-codecs/01-pretty-printer.mdx`,
> `02-mermaid-core.mdx`, and `03-mermaid-options-and-labels.mdx` (the last gaining
> a `## escapeSemanticText` section and losing the legacy-precedence walk);
> `TOpaqueLit` arms in the six `Term`-walker chapters; and two FAQ entries.
>
> **Version wiring.** `getting-started/compatibility-and-upgrades.mdx` moved the
> keiki row to `0.8.0.0` / `9ee8de0` and gained four new breaking-upgrade bullets;
> `content/docs/keiki/index.mdx` restates the release arc.
>
> **The version-skew callouts are deliberate.** keiki is now reviewed at 0.8.0.0
> while keiro is still pinned at `430c3d2` / `0.4.0.1`, whose bounds require
> `keiki >=0.4 && <0.5`. Rather than leave that silently contradictory, explicit
> warnings were added to `getting-started/compatibility-and-upgrades.mdx`,
> `keiki/index.mdx`, and `integrations/keiro-with-keiki.mdx`. **Retire all three
> when the keiro pointer advances** — keiro upstream has already adopted Keiki 0.8.
>
> **Corrected while here** (follow-the-source rule, not caused by this range): the
> minimal `Edge` example at the foot of `reference/core.mdx` omitted the `mode`
> field required since 0.3.0.0 and would not have compiled; the `userReg` golden in
> `reference/render-mermaid.mdx` and `walkthrough/rendering-and-codecs/02-*.mdx`
> showed an ε-output on the `RequiresConfirmation --> Deleted` edge, which upstream
> jitsurei now emits as `AccountDeleted`; and both the mermaid how-to and
> `how-to/keep-diagrams-in-sync.mdx` claimed `toMermaid loanApplication` is pinned
> verbatim — the byte golden is `toTopologyMermaid`, while `toMermaid` is checked by
> a `hasReadableSemantics` property.
>
> **NO-OP:** the CI commits (`2915efa`, `a696a50`, `796572c`, `f70b7be`), the
> `d1bdd9a`/`7849198` revert-then-restore pair for detailed attribution (net effect
> documented above), `2b3bf6a` benchmarks, `76341b8` and `a3c7662` test-only
> commits, and every `docs(plan)` / `docs(research)` / `docs(ir)` commit in the
> range — including `b7096a8`, which corrects IR-2's *implementation status* only.
>
> **Deliberately not documented:** nothing was withheld from this range. The
> upstream worktree was clean at the reviewed SHA. Note that this round covers
> **keiki only** — the keiro-side consequences of `TLit`'s `Show` constraint,
> readable diagram output, and the `Natural`/verification changes belong to the
> keiro pointer's next round.
>
> **Note (prior range).** The `ce5748b..6807aac` range (13 commits) folds in **three**
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

- `9ee8de0fece845bf12dda861604b77856782d90b` (`9ee8de0`), 2026-08-02, `keiki 0.8.0.0`
  — the baseline before the sealed-evidence round. The `9ee8de0..9714d37` range (40
  commits) landed 0.9.0.0: sealed `InCtor` / `WireCtor` construction behind a hidden
  capability, structural `Generic`-derived constructor schemas replacing name-based
  identity in composition and symbolic replay, and the opt-in
  `checkInversionAmbiguitySym` analysis. Breaking for hand-written constructors; JSON
  wire format unchanged.
- `6807aac817fe53bbcc1b11b9e1a1b226bae14413` (`6807aac`), 2026-07-28, `keiki 0.4.0.0`
  — the baseline before the four-release Natural / verification / attribution /
  readable-rendering round. The `6807aac..9ee8de0` range (38 commits) landed
  `Natural` as a curated symbolic carrier with `constrainSymDomain` and total-monus
  subtraction (0.5.0.0, 0.6.0.0, breaking), honest verification verdicts plus the new
  `Keiki.ProjectionDomain` module and `exactFieldWitness` (0.6.0.0, 0.7.0.0, breaking
  semantics), detailed forward-step and replay attribution (0.7.0.0), and readable
  business semantics as the primary rendering contract (0.8.0.0, breaking: `Show` on
  `TLit`, `TOpaqueLit`, and the `MermaidOptions` field removals).
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
   git -C "$KEIKI" log --oneline 9714d37..HEAD
   git -C "$KEIKI" diff --stat 9714d37..HEAD
   ```
2. Read changed source, tests, changelogs, and release notes. `docs/foundations/`
   is the highest-value prose here — it states trust boundaries the source only
   implies. Treat historical design notes as context only when they disagree with
   shipped modules.
3. Update affected pages, replace the reviewed SHA above, and move the prior
   pointer into the traceability list.
