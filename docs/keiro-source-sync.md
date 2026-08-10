# Keiro docs ↔ source sync pointer

The `content/docs/keiro/` tree is **ported and cross-checked** against the keiro source repo, not
generated from it. To keep updates efficient and predictable we pin the exact upstream commit the
docs were last reviewed against. When keiro changes, diff from the pinned commit to `HEAD`, update
the affected pages, then bump the pointer below.

## Upstream source

- **Qualified name (mori):** `shinzui/keiro` — resolve the on-disk path with
  `mori registry show shinzui/keiro --full` (prefer this over the hard-coded path, which can move).
- **Path at last sync:** `/Users/shinzui/Keikaku/bokuno/keiro`
- Relevant packages: `keiro` (framework library), `keiro-core` (pure core: `Codec`, `EventStream`,
  `Stream`, `Integration.Event`, `Snapshot.Policy`), `keiro-migrations` (the `keiro-migrate`
  executable and embedded schema), `keiro-pgmq` (the typed background-job queue — `Keiro.PGMQ.*`),
  `keiro-dsl` (the typed-spec authoring toolchain + CLI — `Keiro.Dsl.*`; authoring-only, the code it
  scaffolds depends only on keiro/keiki),
  `keiro-test-support` (test fixtures). The in-repository `jitsurei` package remains a legacy source
  anchor and is not current release evidence.
- **Reviewed release:** the Keiro package family at `0.12.0.0` — the release being prepared from this
  range. Note that **no version bump had landed at the pinned commit**: every `.cabal` still reads
  `0.11.0.0` and the whole range sits under `## Unreleased`. The docs were written for 0.12.0.0 on
  the author's confirmation that this is the release being cut.
- **New package this round:** `keiro-ops` (the operational CLI — library + standalone binary).

## Last reviewed commit

```text
8d1cd74ab966cf463462430846913d23612eb607  (8d1cd74a)
2026-08-10T07:53:47-07:00
docs: close parser span scaling plan
```

> ### ⚠ Release-prep items this round surfaced but did not change
>
> These are **source** facts a release cut must reconcile; the docs already
> describe the intended post-release state.
>
> - `keiro-dsl`'s registry still marks language 5
>   `Candidate CandidateLanguage`, while language 4 remains the sole `Stable`
>   entry. The docs document language 5 as the stable contract, per the author's
>   statement that it is the release headline. Flipping it means language 4 must
>   simultaneously become `CompatibilityOnly` — `currentStableLanguageVersion`
>   `error`s unless **exactly one** entry is `Stable`.
> - No package version was bumped anywhere in the range.

> **Current range.** The `fc935b7..8d1cd74` range (**85 commits**) is the largest
> runtime round since the 0.3 line, and it **breaks the pattern of the previous
> two rounds**: those collapsed to "almost entirely keiro-dsl, no SQL". This one
> does not.
>
> **The scope checks, and why they went the other way this time.**
>
> - `git diff --name-status fc935b7..HEAD -- '*.sql'` is **NOT empty** — three
>   new migrations (`0021`, `0022`, `0023`), taking Keiro from twenty to
>   **twenty-three** component-local migrations and adding **five** tables.
>   `reference/migrations-and-schema.mdx` was updated for both counts.
> - Exposed-module diff: **two** new exposed modules in `keiro`
>   (`Keiro.Projection.Catalog`, `Keiro.Projection.Catalog.Operations`) plus a
>   whole new package, `keiro-ops`.
> - **Seven new `other-modules`** — `Keiro.DeterministicId`,
>   `Keiro.Projection.Types`, `Keiro.ReadModel.Rebuild.{Group,Runner}`,
>   `Keiro.Workflow.Child.Cancel`, `Keiro.Workflow.Instance.Schema`,
>   `Keiro.Workflow.Journal`. These are **internal**; everything they define is
>   documented at its re-exported path (`Keiro.Workflow`, `Keiro.ReadModel.Rebuild`),
>   never as an importable module. Do not regress this.
> - `git merge-base --is-ancestor fc935b7 HEAD` passes — no history rewrite this
>   round, unlike the `778c75c` round.
>
> **1. Workflow discovery and lifecycle (ADRs 0023–0025, 0027; migration 0021).**
> `findUnfinishedWorkflowIds` is now **exact**: `running`, or `suspended` with a
> due `wake_after`. Parked workflows are invisible and therefore free, and idle
> cost stops scaling with them. The price is that `keiro_workflows` becomes the
> complete wake ledger — a third-party wake source that transitions its own row
> without writing the instance row **strands its workflow permanently**. Migration
> `0021` is the only one in the whole set that rewrites live state (every legacy
> `suspended` → `running`, once).
>
> Breaking: `JournalAppendOutcome` gains `JournalRefusedTerminal !Text`;
> `markInstanceSuspended` → `markInstanceSuspendedAwaiting :: WorkflowName ->
> WorkflowId -> Int -> Text -> Eff es ()`; `recordCrashTx` returns `Maybe Int32`;
> `cancelAwakeableTx` returns `Maybe (Text, Text)`; `gcWorkflowsOnce` /
> `runWorkflowGcWorker` gain `Error StoreError :> es`; `ResumeLogEvent` gains
> `ResumeCrashRecordSkipped`; `WorkflowResumeOptions` gains
> `maxConcurrentAdvances` (default 1). A terminally *failed* workflow now stops at
> the next step boundary, not only at run entry.
>
> **2. Deterministic ids (ADR 0024).** Seeds hash as UTF-8 bytes.
> **ASCII seeds are byte-identical — no migration, no operator action.** Only
> non-ASCII seeds move, off a real collision that could wedge a journal. The
> derivation is frozen and fixture-pinned. Note `keiro-dsl`'s generated
> `namedUuid` still truncates and is deliberately out of scope.
>
> **3. Projection catalog (ADR 0026; migrations 0022, 0023).** A new ~2,100-line
> subsystem separating four identities (query model / target / rebuild group /
> projection), plus durable rebuild groups, a resumable history runner
> (`keiro/projection-replay/v1`), and an operator-neutral adapter. Reset policy is
> independent from replay policy.
>
> **4. `keiro-ops` (ADR 0028).** New package: 18 modules + a binary. Nine
> database-only domains, two hook-gated (`replay-audit`, `rebuild`). Two-phase
> preview/`--force` on every destructive command, **exit 1 on an unapplied
> preview**. Mutations refuse schema drift without `--allow-schema-drift`.
>
> **5. Telemetry.** Eight new instruments. `keiro.projection.lag` is deprecated
> in favour of `keiro.projection.global_position_distance`, and its unit changed
> `{event}` → `{position}` because it never counted events. `KeiroMetrics` gains
> eight fields (breaking for direct construction).
>
> **6. keiro-dsl language 5 — the release headline.** `syntax-profile/4`
> (`ProjectionCatalogSyntax`, `MappedConsumerSurfaceSyntax`) and
> `runtime-semantics/4` (`ProjectionCatalogRuntime`). Three new top-level nodes
> (`target`, `rebuild-group`, `projection-owner`); `readmodel` gains
> `query input`/`query result`, `group`, `targets`, and its `table`/`schema`
> become **optional**. **40 new `DiagnosticCode`s, none removed.**
> `LanguageDefinition` gains a 7th field (`definitionMaturity`) and
> `LanguageSupport` a third constructor (`Candidate`) — both breaking.
>
> **`ProjectionCatalogRuntime` contributes a fold segment**
> (`semantic-contract:keiro-dsl/projection-catalog/1`), so adopting language 5
> changes aggregate fold identity. That is a replay/snapshot concern, not just a
> grammar upgrade, and it is the single most important thing on the DSL side.
>
> Mapped consumer surfaces derive blast radius from the resolved type graph:
> `MappedConsumer` × seven `MappedRootKind`s × seven `MappedConsequence`s, which
> deliberately do **not** collapse into one severity. New generated context
> modules `StructuralConformance` and `BehaviorSourceMap`; scaffold ledgers gain an
> additive `semantic-impact` row. Every mapped service needs one regeneration —
> generated layout and evidence only; wire/fold/snapshot/behavior-key identities
> unchanged.
>
> **Pages ADDED (3):** `reference/projection-catalog.mdx`,
> `reference/keiro-ops-cli.mdx`, `how-to/write-a-custom-wake-source.mdx`,
> `how-to/operate-a-deployment-with-keiro-ops.mdx` *(4)*. All wired into
> `meta.json`, their section index cards, and inbound cross-links.
>
> **Pages UPDATED:** `reference/`{`durable-workflows` (largest share),
> `migrations-and-schema`, `telemetry`, `timers`, `command`, `projection`,
> `read-model`, `inbox`, `outbox`, `snapshot`, `subscription-sharding`,
> `keiro-dsl-language-versions`, `keiro-dsl-domain-nodes`, `keiro-dsl-mapped-types`,
> `keiro-dsl-cli`, `index`}; `explanation/`{`durable-execution`,
> `scaling-the-workers`, `projections-read-models-and-snapshots`};
> `how-to/`{`rebuild-a-read-model`, `index`};
> `walkthrough/durable-execution/`{`03`, `04`, `06`, `07`}; `keiro/index`;
> `keiro/faq`; `getting-started/`{`compatibility-and-upgrades`, `the-keiro-family`}.
>
> **Pages RETIRED:** none.
>
> **Fixed while in the files (pre-existing, out of range):**
> `reference/migrations-and-schema.mdx` claimed "Keiro package release: `0.3.0.0`"
> — nine releases stale.
>
> **Deliberately NOT documented:**
> - The in-repo `jitsurei` catalog adoption (`d9ded676`) — legacy source anchor,
>   **not** `content/docs/example-app/`, per `LIBRARIES.md`.
> - DSL parser span-capture perf (`1d4fb049`) and its benches — doc-neutral.
> - Upstream OKF capabilities bundle (`698a7617`) — upstream metadata.
> - `3a3230e7 fix(ops): defer Kiroku checkpoint commands` — a deferral; nothing
>   shipped.
>
> **Known gap for the next round:** `getting-started/compatibility-and-upgrades.mdx`
> now carries a callout saying Keiro 0.12 requires `kiroku-store >=0.4 && <0.5`
> while the **Kiroku docs are still synced to 0.3.1.0**. The kiroku pointer was not
> reviewed this round (user scoped it to keiro only). Kiroku 0.4 adds an operation
> to the exported `Store` effect — an exhaustive third-party interpreter breaks.
> Sync `docs/kiroku-source-sync.md` next.
>
> **Also unreviewed:** 8 pre-existing broken `#anchors` in `content/docs/keiki/`
> (`builder.mdx` ×2, `composition.mdx` ×1, `generics.mdx` ×5). Found by an ad-hoc
> github-slugger check; the repo has no anchor gate. Out of scope here.

> **Note (prior range).** The `f05102b..fc935b7` range (66 commits) folds in **two**
> releases, 0.10.0.0 and 0.11.0.0, and is almost entirely `keiro-dsl`.
>
> **The scope-collapsing finding, again, and it collapsed harder than last time.**
> The previous round's advice — do the SQL and export-list diffs first — paid off
> immediately:
>
> - `git diff --name-status f05102b..fc935b7 -- '*.sql'` is **empty**. No
>   migration, table, index, or column changed, so
>   `reference/migrations-and-schema.mdx` and `reference/deploy-ordering.mdx`
>   counts still hold — NO-OP.
> - `git diff --stat f05102b..fc935b7 -- keiro/src keiro-core/src keiro-pgmq/src
>   keiro-migrations keiro-test-support` is **one source file**:
>   `keiro/src/Keiro/Timer/Schema.hs`, +4/−1 (`TimerStatus` gains `Enum`/`Bounded`).
>   Everything else in 666 changed files is `keiro-dsl` (598), `docs` (47), and
>   release bookkeeping.
>
> So 0.10.0.0 is a pure lockstep release ("no changes", "no user-facing changes")
> and 0.11.0.0's runtime story is one deriving clause plus new keiki bounds.
>
> **1. keiki 0.9 bounds (breaking, but quiet).** `keiro-core`, `keiro`, and
> `keiro-dsl` require `keiki >=0.9 && <0.10`; `keiro` also `keiki-codec-json
> >=0.9`. Generated aggregates already use the trusted TH path
> (`deriveAggregateCtorsAll` / `deriveWireCtorsAll`), so **no generated source
> changes** — but `validateEventStream`, `mkEventStream`, and generated validation
> harnesses may report a *different conservative warning set* after recompilation,
> because keiki 0.9 can distinguish structural heads and prove some replay
> candidates disjoint. Runtime event execution and the JSON wire format are
> unchanged.
>
> **2. Sidecar renames + the conformance ledger format (ADR-0022, breaking,
> operational).** Role-bearing names replace the old ones, an old-name tree
> **refuses without writing**, and `scaffold --apply-name-migrations` is the
> explicit repair. `keiro-dsl-manifest.*` → `keiro-dsl-cabal-fragment.*`;
> `keiro-dsl-scaffold-record.*` → `keiro-dsl-ledger.*`;
> `keiro-dsl-conformance-record.txt` → `keiro-dsl-conformance-ledger.txt`, which
> also moves from whitespace rows to versioned `keiro-dsl conformance ledger v1`
> JSON rows. The scaffold report's own labels changed to `fragment:` and
> `ledger:` — verified in `ScaffoldRun.renderScaffoldReport`, and the docs' sample
> outputs were updated to match.
>
> **3. One checked generated-Haskell naming edition (ADR-0019, breaking).**
> `service_oncall` now generates `ServiceOncall`, not `Service_oncall`. Classified
> as `consumer-build` **advisory** — your code stops compiling, nothing stored
> moves.
>
> **4. `check`'s warning policy became honest (breaking for CI).** With
> `--coverage-report`, `--deny-warnings` used to print coverage warnings and exit
> 0. Coverage findings are now ordinary diagnostics. `--deny CODE` refuses codes
> `check` cannot emit. `RouterBenignInversion` split from `ProcessBenignInversion`.
> `coverage-report/1` spells severity `"warning"`, not `"advisory"`.
>
> **5. Refusing spec surfaces no runtime implements.** Four new codes
> (`DecodeBodyPostureUnsupported`, `DispatchOnAppendedUnsupported`,
> `TimerNotMineUnsupported`, `IntakeBindHeaderUnknown`), each warning below
> language 4 and erroring from 4 on; a process `dispatch-id` line is now checked
> as strictly as a router's. Three previously descriptive-only surfaces became
> checked. Two codes were **removed** with the models they described:
> `EmitDeriveHoleUnrealized` and `WqFieldOptionalUnsupported` (with
> `WqField.wqfRequired`) — **every workqueue payload field is required, and adding
> one is now breaking however spelled.**
>
> **6. Field aliases (ADR-0021, language 4).** `haskell <selector>` and
> `as "<wire-key>"` are independent. Language 4 therefore moved to
> **`syntax-profile/3`** — the docs still claimed `/2`, now corrected — with the
> new `FieldAliasSyntax` feature. `AggregateField` and `ContractField` gained
> fields; positional construction breaks.
>
> **Pages:** no page added or retired — this range is dense but lands almost
> entirely in pages that already exist. Updated `reference/keiro-dsl-cli.mdx`
> (largest share), `reference/keiro-dsl-language-versions.mdx`,
> `reference/keiro-dsl-runtime-nodes.mdx`, `reference/keiro-dsl-domain-nodes.mdx`,
> `reference/keiro-dsl-mapped-types.mdx`, `reference/keiro-dsl-workspaces.mdx`,
> `reference/timers.mdx`, `how-to/check-a-service-spec.mdx`,
> `how-to/scaffold-and-fill-holes.mdx`,
> `how-to/place-generated-modules-and-wire-cabal.mdx`,
> `tutorials/author-a-service-with-keiro-dsl.mdx`, `index.mdx`, plus the shared
> `getting-started/compatibility-and-upgrades.mdx`.
>
> **Fixed while in the files (pre-existing, out of range):**
> `keiro/index.mdx` announced keiro as `0.3.0.0` — eight releases stale.
> `how-to/check-a-service-spec.mdx` and `reference/keiro-dsl-domain-nodes.mdx`
> cited `IdentHaskellKeyword`, `IdentNotConstructorSafe`, and
> `DuplicateUpcasterSource`, and `reference/keiro-dsl-mapped-types.mdx` cited
> `MappedGuardUnsupported` — all four confirmed absent from `keiro-dsl/src`
> (grep count 0). Note `CodecDuplicateUpcasterSources` in `reference/codec.mdx` is
> a **different, still-live** type in `keiro-core`, and was correctly left alone.
> Renaming the CLI heading to *Sidecar files* broke an inbound anchor from
> `reference/keiro-dsl-workspaces.mdx`; repointed.
>
> **Deliberately not documented:** the two unreviewed workflow commits above. The
> `keiro-ops` operational CLI initiative (`fc935b7`) is a **plan only** — no source
> exists — so nothing was ported from it; do not transcribe signatures from that
> plan next round. ADR-0020 (*service conformance packages import one runtime-owned
> facade*) is recorded but its consumer-visible surface is the conformance ledger
> already covered above. The `.keiro-dsl-name-migrations/sidecar-v1/` backup
> layout is mentioned but not documented as a stable interface, since upstream
> treats it as a recovery artifact.

> ### ⚠ Upstream history was rewritten between these two pointers
>
> The previous pin `778c75c` is **not an ancestor of this one**. The keiro repo's
> last 15 commits at that pin were rebased/amended, diverging at
> `656a2f4` (*fix(workflow): renew leases at fresh boundaries*), and reappear
> with new SHAs — `778c75c` itself is now `71d6801`, same subject, committed 11
> hours later.
>
> **The reviewed content boundary is intact.** `git diff --stat 778c75c 71d6801`
> is empty: the two trees are byte-identical, so nothing reviewed at the old pin
> was lost or silently changed. But `git log 778c75c..HEAD` **over-reports**,
> listing 80 commits where only **65** (`71d6801..HEAD`) are genuinely new; the
> other 15 are the rewritten already-reviewed migration work (which is why
> `keiro-migrations/src` shows no diff across the whole range despite six
> migration commits appearing in the log).
>
> **For the next round:** trust `git diff <pin>..HEAD` (a tree comparison, always
> correct) over `git log <pin>..HEAD`, and check
> `git merge-base --is-ancestor <pin> HEAD` first. If it fails again, find the
> rewritten twin of the pin by subject and date and diff the two trees to confirm
> the boundary before deciding what is new.

> **Note (prior range).** The `430c3d2..f05102b` range (101 commits) folds in **five** releases —
> 0.5.0.0 through 0.9.0.0 — and is overwhelmingly `keiro-dsl`. The headline is that the DSL grew an
> explicit **source-language contract** (versions 1→4, with 4 designated the sole stable authoring
> contract) and closed the gap between what a spec *declares* and what generated code *does*.
>
> **The scope-collapsing finding, recorded so the next round does not redo it.** The raw diffstat
> (1011 files, +107k/−56k) badly overstates the runtime-side work. Two mechanical checks settle it:
>
> - `git diff --name-status 430c3d2..f05102b -- '*.sql'` is **empty**. No migration, table, index, or
>   column changed anywhere in the range, so `reference/migrations-and-schema.mdx` and
>   `reference/deploy-ordering.mdx` counts still hold — NO-OP.
> - Diffing the **module export lists** across `keiro/src`, `keiro-core/src`, and `keiro-pgmq/src`
>   yields **two new modules** and **one changed export list**. The ~30k lines of churn in those trees
>   are `c5408db` (Fourmolu template migration) and `0af4b78` (language-extension centralisation) —
>   doc-neutral. Do the export-list diff first next time; it takes a minute and collapses the round.
>
> **1. The source-language contract (0.6.0.0–0.9.0.0, ADR-16, ADR-18).** A `.keiro` file may open with
> `language keiro-dsl <N>` as its first significant clause, resolved through one registry **before**
> body parsing. A missing preamble is `LegacyUnversioned` → effective version 1 and is never silently
> rewritten. Four contracts are released; **language 4 is the sole `Stable` entry** (1–3 are
> `compatibility-only`) and every `new <kind>` skeleton starts there. Each registry row selects an
> immutable **syntax profile** (an exact named capability set, not a numeric minimum — 2, 3, and 4 all
> reuse `syntax-profile/2`) and a private, monotone **runtime capability profile**. Language 4 also
> closes accepted-but-unenforced surfaces: values that cannot lower to working generated code are
> rejected under *every* version, and language 4 additionally enforces numeric floors, duplicate and
> shadowing rules, runtime identity uniqueness, Kafka/PostgreSQL naming, intake coupling, contract
> topic aliases, and the aggregate wire convention.
>
> **ADDED:** `reference/keiro-dsl-language-versions.mdx` — the registry, both profile kinds, the five
> source-selection diagnostics, and the located-surface frontend (`Keiro.Dsl.Source`/`.Syntax`/
> `.Frontend`, 0.8.0.0). Admitted as a reference page because it is a new named module with a public
> surface a reader looks up entry by entry, and because the preamble is a grammar-level concept the
> notation page defers to. Wired into `reference/meta.json`, the `reference/index.mdx` card list, and
> inbound links from notation, workspaces, the CLI, and the toolchain explanation.
>
> **2. Behaviour ownership and conformance (0.6.0.0, 0.7.0.0, ADR-17).** Every version-2 aggregate
> transition is now **exclusively** generated-owned or explicitly `implementation hole` — ownership is
> part of the checked semantic graph, canonical rendering, diff surface, scaffold record, and fold
> fingerprint. Guards and ordered writes under generated ownership are lowered into structural Keiki
> terms and *necessarily executed*; a hole is preserved as a permanent honest escape hatch but can no
> longer silently replace behaviour the DSL claims to own. Alongside it: a typed scalar expression
> language (`reg.`/`cmd.` roots, structural paths, exact `Integer` and total-monus `Natural`
> arithmetic), `Keiro.Dsl.AggregateType` as the single resolution/capability policy, and direct
> aggregate `Time`/`Natural` fields and registers.
>
> **ADDED:** `how-to/prove-aggregate-behavior-is-complete.mdx` — the `behavior-obligations` inventory,
> the create-once `BehaviorHoles` witnesses, the nine-bucket `keiro/behavior-conformance/1` report,
> and the `--fail-on-unverified` decision. Admitted as a how-to because that last choice is a real
> decision the reference cannot settle: `unverified` is the *honest* classification for a Hole guard
> or a one-way projection, so gating on it is a policy call, not a default. Wired into
> `how-to/meta.json`, the `how-to/index.mdx` card group, and inbound links from the CLI reference and
> the scaffold how-to.
>
> **3. Nominal bindings and the enforced ID domain (0.6.0.0, 0.7.0.0).** Two new `keiro-core` modules,
> both re-exported by `keiro`: `Keiro.Codec.Nominal` (the total consumer-binding + fixture contract)
> and `Keiro.Codec.IdDomain` (the frozen `keiro-dsl/id-domain/typeid-v7/1` admission policy, whose
> `idDomainTextPattern` yields a Keiki *exact* projection domain — which is how a generated guard
> recovers a `Verified*` result). Language 3 makes generated prefix-bearing IDs **abstract** and moves
> service-level IDs and enums into one `Generated.<Ctx>.Nominals`; both are source-level breaks with
> **no** wire or identity consequence. 0.9.0.0 added `parseKindIdV7Text` / `parseKindIdV7Value`.
>
> **4. Frozen fold identity (0.9.0.0, ADR-18) — the breaking change with an operational cost.**
> Aggregate fold fingerprints widen from 16-hex FNV-1a-64 to **32-hex FNV-1a-128**, intentionally
> invalidating every DSL-generated snapshot once. Unrelated 64-bit identities (read-model shape,
> mapped-wire, behaviour keys) do **not** move. Two silent-invalidation hazards were closed with it:
> pre-hash bytes now come only from `Keiro.Dsl.CanonicalEncoding` (frozen by surface goldens) rather
> than the human-facing pretty printer, and fold segments derive from capability profiles rather than
> an unknown-identifier fallback. Fold surface construction became **total** (`FoldSurfaceError`), so
> the fold/diff/replay-impact/workspace-diff APIs return `Either` and the `Spec`-only legacy wrappers
> were removed in favour of a `CheckedService`.
>
> **5. Workspaces released.** Service workspaces shipped in **0.5.0.0**; the "Unreleased" callout on
> `reference/keiro-dsl-workspaces.mdx` and its twin in
> `getting-started/compatibility-and-upgrades.mdx` are **retired**.
>
> **6. Generated runtime surfaces close over `Text` (0.9.0.0, breaking).** Workqueue `jobOutcomeFor`,
> inbox outcome/disposition, aggregate stream categories (`<aggregate>CommandCategory`), and
> `workflowFacts` → `WorkflowFacts`. Documented on `reference/keiro-dsl-runtime-nodes.mdx` rather than
> scattered across the six runtime reference pages, because the hand-written `Keiro.*` APIs those
> pages document did **not** change — this is a regeneration break.
>
> Also landed as: two new sections in `reference/codec.mdx`; fold-widening warnings in
> `reference/snapshot.mdx`, `reference/keiro-dsl-domain-nodes.mdx`, `how-to/add-a-snapshot.mdx`, and
> `explanation/evolution-and-replayability.mdx`; `pretty`/`inspect`/`behavior-obligations` sections in
> `reference/keiro-dsl-cli.mdx`; the preamble and a new `## Aggregate transition expressions` section
> in `reference/keiro-dsl-notation.mdx`; context-level and behaviour-module sections in
> `how-to/place-generated-modules-and-wire-cabal.mdx`; ownership callouts in
> `how-to/scaffold-and-fill-holes.mdx`; a new `## What language 4 additionally rejects` section in
> `how-to/check-a-service-spec.mdx`; two new advisory rows in `how-to/gate-spec-evolution-with-diff.mdx`;
> a witness-rename warning in `reference/keiro-dsl-mapped-types.mdx`; the `RetryDelay` re-export in
> `reference/inbox.mdx`; new `## A source declares its contract` and
> `### Where the firewall moved for aggregate transitions` sections in
> `explanation/the-keiro-dsl-toolchain.mdx`; five FAQ entries; and the Keiro row, five new upgrade
> bullets, and the retired workspaces callout in `getting-started/compatibility-and-upgrades.mdx`.
>
> **Version-skew callouts retired.** The keiki round (see `docs/keiki-source-sync.md`) added explicit
> warnings to `getting-started/compatibility-and-upgrades.mdx`, `keiki/index.mdx`, and
> `integrations/keiro-with-keiki.mdx` because keiki was reviewed at 0.8 while keiro was pinned at
> 0.4.0.1. Keiro 0.9.0.0 requires `keiki >=0.8 && <0.9`, so **all three are removed**. The
> integrations page instead now carries the substantive note: Keiki 0.7 classifies a predicate
> crossing a one-way generated projection as `UnverifiedOpaque`, which changes **proof strength only**
> — concrete execution and replay are unchanged, and conformance tooling must not relabel it.
>
> **Corrected while here** (not caused by this range): five dangling `#anchor` links that the gates
> cannot see — `faq.mdx` → a non-existent `router#the-resolve-seam`;
> `cookbook/inbox-disposition-the-three-inversions.mdx` pointing at a *notation*-page anchor that
> lives on the runtime-nodes page; `how-to/back-a-rule-with-a-register.mdx` and
> `walkthrough/workflow/00-start-here.mdx` naming headings that no longer exist; and
> `walkthrough/durable-execution/00-start-here.mdx` missing the **double** hyphen github-slugger emits
> for the em dash in "This is *not* a keiki transducer — and that is deliberate".
>
> **NO-OP:** the Fourmolu template migration (`c5408db`) and language-extension centralisation
> (`0af4b78`); the internal grammar split behind the stable `Keiro.Dsl.Parser` facade (generated bytes,
> the 0.7 acceptance matrix, and rendered diagnostics all unchanged); the conformance-corpus move to
> language 4 (226 fixtures, 30 suites, 14 named exceptions — test-only); the okf profile bumps and
> RFC3339 timestamp normalisation; and every `docs/plan`, `docs/masterplan`, `docs/research`, and
> `agents/` commit. The removed unreachable grammar types (`Derivation`, `DerivStrategy`,
> `Disposition`, `DispAction`, `EnvelopeBinding`, `EnvelopeLayer`) were never documented, so their
> retirement is a no-op here.
>
> **Note on the pin.** Phase 1 surveyed `9349ae8` with 13 dirty files; upstream committed that work as
> `f05102b` (`chore(release): 0.9.0.0`) mid-round. The delta is exactly the release stamp — version
> bumps and per-package changelogs for work already reviewed — so the pointer advances to `f05102b`
> and the worktree was clean at that SHA.
>
> **Deliberately not documented:** the `keiro-dsl` service-level API churn that only affects callers
> embedding the toolchain as a library (`scaffoldContractForService`, `manifestDependenciesForService`,
> `renderManifestForService` are mentioned but not given reference entries) — the docs describe the
> CLI and the generated output, not the library API, and adding that surface is a scoping decision for
> a future round.

> **Note (prior range).** The `71d6801..430c3d2` range (65 genuinely-new commits; see the rewrite note
> above) is the **structural consumer types and service workspaces** review, plus the `0.4.0.0` /
> `0.4.0.1` releases. Source change is heavily concentrated in `keiro-dsl` — **11 new modules**,
> ~10.3k added lines — with small, high-consequence additions in `keiro-core` and `keiro`.
>
> **1. Releases `0.4.0.0` and `0.4.0.1`.** The whole family moved to `0.4.0.1`. `0.4.0.0` was tagged
> but **never published**; `0.4.0.1` is a pure packaging patch adding PVP upper bounds so
> `cabal check` is clean. The dependency floor is now **`keiki >=0.4 && <0.5`**.
>
> Nearly all of the `keiro`/`keiro-core` **0.4.0.0 changelog body was already reviewed at the previous
> pin** — `scheduleTimerOnceTx :: … -> Bool`, `ChildRow.failureReason`, the three-component snapshot
> discriminator + migration `0019`, `mkCodec` validation at the stream boundary,
> `resurrectFailedWorkflow`, `leaseHeartbeat`, `Keiro.ReplayAudit`, `seedVerifySampleRate`, and the
> keiki 0.3 `EdgeMode` adoption. This range only *released* them. Folded into
> `content/docs/getting-started/compatibility-and-upgrades.mdx` as reviewed versions, new keiki 0.3/0.4
> and Keiro 0.4 breaking-upgrade bullets, and updated reviewed-source SHAs for every library.
>
> **2. `keiro-core` structural bindings (new public modules).** `Keiro.Codec.Structural` —
> `StructuralBinding` (a **total** `bindingToShape`/`bindingFromShape` pair), `FixtureCases`
> (deterministic labelled cases, never `Arbitrary`/`Default`), both law helpers
> `bindingDomainRoundTrip`/`bindingShapeRoundTrip`, and the one-way delegation helpers
> `encodeViaBinding`/`decodeViaBinding`. Re-exported from `keiro` so a generated consumer keeps one
> direct dependency. Plus `Keiro.Codec.Structural.Generic.genericStructuralBinding`, an opt-in **exact
> nominal** adapter (identical constructor/selector names, order, arity, field types; no coercion,
> prefix-stripping, or positional options) that fails at compile time with a message directing you to
> the scaffolded binding module. The load-bearing rule: **if converting a valid shape into the
> consumer type can fail, the declaration is not structural** and must be `opaque`; and keiro never
> delegates structural encoding *to* a consumer instance.
>
> **3. `keiro-dsl` mapped consumer types.** Checked `mapped structural record|enum|union` and
> `mapped opaque` declarations with a resolved, total type-expression graph — new modules `TypeGraph`,
> `MappedConsumer`, `MappedDiff`, `ExplainBindings`, `Coverage`, `CodecCompare`, `FoldFingerprint`,
> plus large `Parser`/`Grammar`/`Validate`/`Scaffold`/`Goldens`/`Harness`/`PrettyPrint` growth.
> Resolution is the phase boundary after which missing facts and unresolved references are
> unrepresentable. 15 new resolution codes (`MappedUnresolvedName` … `MappedGuardUnsupported`) and 24
> new mapped-evolution codes (`MappedFieldAdded*` … `MappedModeCrossed`, `MappedDeclAdded/Removed`),
> plus `CoverageOpaque*` and `CodecCompare*`. Mapped register wire/binding/initial identities now
> participate in the aggregate **fold fingerprint**.
>
> **4. Per-surface compatibility vectors (`diff`).** The single tier is now *derived*. Every finding
> carries a verdict (`compatible`/`advisory`/`breaking`/`n/a`) on **six** surfaces —
> `private-history-read`, `old-binary-read-new-events`, `snapshot-hydration`, `public-consumer`,
> `persisted-identity`, `consumer-build` — plus a rollout constraint set
> (`stop-the-world`/`workers-first`/`drain-required`/`producer-last`). A non-uniform vector prints as an
> indented `vector:` line. New flags: repeatable `--gate SURFACE` (**adds** to a default gate that is
> every surface *except* `old-binary-read-new-events`; there is deliberately no way to loosen it),
> `--explain` (paths, failing directions, closed-vocabulary remedies), and `--report-out FILE`
> (schema **`keiro-dsl/diff-report/1`**, append-only vector/`paths` keys, consumers must ignore unknown
> keys).
>
> **5. New CLI surface.** `check --explain-bindings`; `check --coverage-report FILE
> [--fail-on-opaque]`; `diff --coverage-report FILE [--fail-on-opaque-increase]`; `scaffold
> --codec-comparison MAPPED-NAME --comparison-out FILE` (a paired, non-production RFC 8785
> canonical-JSON parity runner — **evidence, never a wire authority**). Coverage is
> **reporting-first**: informational unless a gate flag is passed.
>
> **6. `Keiro.Snapshot.Codec.FoldVersion` + `defaultStateCodecWithFold`.** The recommended codec for a
> **hand-written** service: `defaultStateCodec` with a hand-owned token already composed through
> `withFoldFingerprint`. `FoldVersion` is a change *detector*, not an encoding version — change it in
> the same edit that changes any guard, update, emit, or target, including helper functions the fold
> calls. Generated services keep using `withFoldFingerprint` with a spec-derived fingerprint.
>
> **7. Service workspaces (`.keiro-workspace`) — SHIPPED BUT UNRELEASED.** New `Workspace`,
> `WorkspaceAdoption`, `WorkspaceDiff`, `WorkspaceRecord`, `WorkspaceScaffold` modules; 7 new
> composition-refusal codes (`WorkspaceMemberUnreadable`, `WorkspaceMemberParseFailed`,
> `WorkspaceContextMismatch`, `WorkspaceAuthorityConflict`, `WorkspaceDuplicateDeclaration`,
> `WorkspaceDuplicateNodeName`, `WorkspacePathCollision`) plus 2 whole-workspace diff advisories
> (`OwnershipMoved`, `WorkspaceAuthorityChanged`); `Validate.nodeIdentity` now exported. All four
> commands dispatch on the `.keiro-workspace` extension.
>
> This sits in `keiro-dsl`'s **`[Unreleased]`** section — it is *not* in `0.4.0.1`. It is nonetheless
> fully landed, exported, CLI-dispatched, and acceptance-tested in committed source, and this docs tree
> is cross-checked against **source**, not releases. **Decision: documented, with an explicit
> unreleased callout** on the new page and in `compatibility-and-upgrades.mdx`. Revisit the callout when
> the next release ships.
>
> ### Pages
>
> **ADDED** — `content/docs/keiro/reference/keiro-dsl-mapped-types.mdx` (the two modes and how to
> choose, the three `wire` grammars, type expressions, `on-missing` defaults, the resolved graph and
> its 15 rejections, the `Keiro.Codec.Structural` contract, `genericStructuralBinding`, the evolution
> code families, and the generated-module inventory) and
> `content/docs/keiro/reference/keiro-dsl-workspaces.mdx` (the manifest and its set semantics, the 7
> composition refusals, multi-file `note:` diagnostics, per-command behaviour, the workspace-keyed
> record and its legacy coexistence proof, `record`/`banner` adoption evidence, and whole-workspace
> diff). Both admitted as reference pages under `TRIAGE.md` §2 — each is a new named surface a reader
> must look up field by field, and neither fits inside the CLI page without burying it.
>
> **UPDATED** — `reference/keiro-dsl-cli.mdx` (rewritten command summary with workspace dispatch; new
> `--explain-bindings`, coverage-gate, `--codec-comparison`, compatibility-vector, `--gate`,
> `--explain`, and `--report-out` sections; CI-gate block extended with the structural conformance and
> forward-versus-replay-equality assertions); `reference/snapshot.mdx` (`FoldVersion`,
> `defaultStateCodecWithFold`, a which-codec-to-use table, and mapped register identities in the
> fingerprint list); `explanation/the-keiro-dsl-toolchain.mdx` (mapped types and workspaces in *what
> the specification can own*, plus a new *why a tier is not enough* section);
> `how-to/check-a-service-spec.mdx`, `how-to/scaffold-and-fill-holes.mdx`,
> `how-to/gate-spec-evolution-with-diff.mdx` (the new flags in their task context);
> `getting-started/compatibility-and-upgrades.mdx`; `reference/index.mdx` + `reference/meta.json`.
>
> ### Deliberately not documented
>
> - **The Kafka consumer fatal-observability contract (ADR 0011, MasterPlan 23, plans 135–137).**
>   These commits are **prose-only in the keiro repo** — ADRs, masterplan, and plans; zero source. The
>   implementation lives in a *commit-pinned `hw-kafka-client` fork* and/or
>   `shibuya-kafka-adapter`, and the `shibuya-kafka-adapter` pointer is **current at `65111ae` with
>   zero drift**, so the contract is not in any tracked repo's reviewed source. The claims involved —
>   fatals reported in-band as `RdKafkaRespErrFatal` from every poll in **both** callback poll modes;
>   routine partition conditions and idle commits must **not** kill a consumer; trace context is
>   per-record; and close must never be deferred to the GC because an unclosed consumer keeps polling
>   and starves its partitions — would have to be transcribed from an ADR, which the *shipped source
>   wins* rule forbids. `content/docs/integrations/shibuya-kafka-adapter.mdx` already documents fatal
>   surfacing through the source stream and supervision, so nothing there is *wrong*; the
>   deterministic-close obligation is the notable missing piece. **Next round:** check whether the fork
>   or the adapter has landed in a tracked repo, and if so fold the close rule into that page's
>   *Errors and Shutdown* section.
> - **Upstream prose commits**, read for intent only, no doc action: the brownfield transducer-modeling
>   guide and the guarantee ledger (`docs/guides/*`), the production-status regrouping and its 0.4 /
>   Hackage refresh, the improvement-request bundle and OKF profile updates, the MasterPlan 25/26
>   plans and EP completions, and `docs/research/*`.
> - **`docs: correct user and guide inaccuracies, add a work-queues reference` + `feat(jitsurei): add a
>   work-queue example`** — upstream added a work-queues reference and backed the guide with an in-repo
>   `jitsurei` example. `content/docs/keiro/reference/pgmq-jobs.mdx` already covers the shipped
>   `Keiro.PGMQ` surface and no `keiro-pgmq/src` change accompanied these commits, so this round treated
>   them as upstream-prose NO-OPs. **Known gap:** the upstream work-queues *guide* prose was not
>   cross-read against `pgmq-jobs.mdx` for corrections it may imply.
> - The `jitsurei/` package inside the keiro repo is a legacy source anchor and not release evidence;
>   its 6 changed files were not treated as `content/docs/example-app/` input (that tree has its own
>   pointer).
>
> ### Also found
>
> **8 pre-existing broken `#anchor` links** surfaced by a hand-run heading-slug audit (anchors are
> ungated — `check-doc-links.mjs` strips them). Three had unambiguous targets and were fixed:
> `keiro/faq.mdx` → `the-keiro-dsl-toolchain#the-ownership-firewall`,
> `cookbook/notify-once-from-a-process-manager.mdx` →
> `reference/process-manager#deterministic-ids-and-duplicate-confirmation`, and
> `reference/telemetry.mdx` → `reference/projection#projection-lag`. **Five remain**, all pointing at
> headings that do not exist anywhere on the target page, so each needs a judgement call rather than a
> rename: `keiro/faq.mdx` → `reference/router#the-resolve-seam`;
> `walkthrough/durable-execution/00-start-here.mdx` →
> `02-the-effect-and-replay-loop#this-is-not-a-keiki-transducer-and-that-is-deliberate` (the real slug
> has a **double** hyphen from the em dash — exactly the trap `SKILL.md` warns about);
> `walkthrough/workflow/00-start-here.mdx` →
> `01-the-process-manager-dispatch-loop#the-payoff-the-managers-own-state-is-a-keiki-transducer`;
> `cookbook/inbox-disposition-the-three-inversions.mdx` →
> `reference/keiro-dsl-notation#contract--intake--emit--publisher`; and
> `how-to/back-a-rule-with-a-register.mdx` →
> `walkthrough/command-cycle/02-hydration#what-an-event-does-to-the-machine-output-inversion`. None
> were introduced by this range.
>
> **Note (prior range).** The `c68dcc7..778c75c` range (63 commits) is the **evolution-safety and
> durable-execution hardening** review. Two themes dominate; a third is infrastructural.
>
> **1. The transducer evolution story (MasterPlan 24, plans 138–143; ADRs 0002–0004).** Because keiki
> has one edge set for execution *and* replay, changing a guard/output/update/mode reinterprets stored
> history. The range makes that a first-class, gated concern:
> - **`replay-only` edges** (keiki 0.3 `EdgeMode = Live | ReplayOnly`, plan 143). Inversion is
>   two-phase (live first), forward-determinism checks scope to `Live`/`Live` pairs, and the static
>   inversion-ambiguity check scopes to *same-mode* pairs — which is what lets a live edge and its twin
>   through keiro's forced `mkEventStream` boundary. DSL: a `replay-only` transition prefix lowering to
>   `B.replayOnly`; validator rules `ReplayOnlyEmitsNothing` (error) and `ReplayOnlyCommandStillLive`
>   (warning). `Grammar.complementExpr` computes `old ∧ ¬new` inside the guard grammar so
>   `diff`'s `AggGuardTightened` advisory prints a **paste-ready** twin (printed, never auto-applied).
> - **Two-stage event retirement.** New `retiring event` marker (mutually exclusive with `deprecated`);
>   `DeprecatedEventReplayHazard` warns on a deprecated event with no replay-only emitter;
>   `EventRetirementInProgress` marks the safe retained shape.
> - **`Keiro.ReplayAudit` + `Keiro.ReplayDigest`** (plan 142) — the only gate that reads real stored
>   data. `AuditFull`/`AuditTargeted AffectedSet`, `AuditBudget` (parallelism, maxStreams, resumable
>   `resumeFrom`/`checkpoint`), typed `AuditTarget`/`SomeAuditTarget`/`streamInCategory`, per-stream
>   `ReplayOk`/`ReplayFailed`/`SeedDivergence`, RFC 8785 canonical bytes + SHA-256 digests,
>   `renderAuditReport`, `auditExitCode`. `Keiro.Command` now exports `Hydrated`/`hydrate`/
>   `hydrateFull`/`hydrateSeeded` so the audit compares seeded vs full without the command-serving
>   fallback. Scaffolding emits one context-wide `Generated.<Context>.ReplayAudit.auditTargets`.
> - **`Keiro.Dsl.ReplayImpact`** + `diff --replay-impact-out FILE` — machine-readable
>   `replay-neutral` / `affected {aggregates: {eventTypes, includeSnapshotStreams}}` verdict.
> - **Snapshot compatibility is now a three-component discriminator** (plan 138, ADR 0003):
>   `StateCodec` gains `stateShapeHash`; `defaultStateCodec` derives it via keiki `CanonicalStateShape`
>   (and now requires that constraint); `withFoldFingerprint` composes `<state-hash>;fold=<fp>`;
>   `Keiro.Dsl.FoldFingerprint` lowers a spec-visible fold digest into generated codecs and raises
>   `AggFoldSurfaceChanged`. Migration **`0019-keiro-snapshots-state-shape-hash.sql`** (empty default →
>   one miss per pre-existing row). Requires `keiki >= 0.3.1`.
> - **`RunCommandOptions.seedVerifySampleRate`** (default 1000) — async sampled seed-vs-full-replay
>   witness emitting the new `keiro.snapshot.seed.divergence` counter plus a structured stderr log.
> - **Codec validation at the stream boundary** (plan 139): `validateEventStreamWith` now runs
>   `mkCodec`, so bad versions/duplicate tags/duplicate or out-of-range rungs/incomplete chains fail
>   validated construction. Generated codecs lower same-version bumps into one `EventType`-dispatching
>   rung. `Keiro.Dsl.Goldens` + `diff --emit-goldens DIR` / `scaffold --goldens DIR` capture and embed
>   genuine old payloads (never overwriting a hand-captured file).
> - **New advisories:** `RouterDecideSurfaceChanged`, `ProcessDecideSurfaceChanged`,
>   `ProcessTimerPayloadChanged`. Generated workqueues emit a `QueueCodec` (versioned `keiroJobCodec`
>   envelope at schema version 1).
>
> **2. Durable-execution hardening (ADRs 0005–0008; plans 115, 130–133).**
> - `awaitStep` map-miss now consults the generation-scoped `keiro_workflow_steps` index before
>   arming/suspending, so a snapshot can no longer permanently hide a concurrently-journaled wake
>   completion.
> - Sleep timers are **generation-owned**: payload carries `gen` (legacy payloads recover it via
>   `matchSleepTimerGeneration`), firing appends through `prepareJournalAppend` to the arming
>   generation and clears `wake_after` atomically; only the winning insert writes the hint
>   (**`scheduleTimerOnceTx` now returns `Bool`** — breaking); a claimed timer whose instance is
>   terminal cancels itself; GC deletes sleep timers in **every** status.
> - Awakeables register their row **inside** the journaled allocation step; `signalAwakeable`
>   re-reads status in-transaction so a losing race against cancellation appends nothing;
>   `signalAwakeableFrom` exposed as a race-test seam.
> - Child links persist `failureReason` (**`markChildFailedTx` takes a third argument** — breaking;
>   migration **`0020-keiro-workflow-children-failure-reason.sql`**), so `awaitChild` raises
>   `WorkflowChildFailed` after the parent rotates past the original sentinel. `reviveFailedChildTx`
>   added.
> - **`resurrectFailedWorkflow`** + `ResurrectOutcome` — transactional recovery of a terminally failed
>   instance; `WorkflowFailed` events switch to store-generated UUIDv7 ids so a repeat failure on one
>   generation appends distinctly; journal history is never deleted.
> - **`LeaseHeartbeat`** + `WorkflowRunOptions.leaseHeartbeat` + `WorkflowLeaseLost`; the resume worker
>   populates it and classifies mid-run lease loss as `leaseSkipped` (no crash attempt). Leases renew
>   at fresh step/arm boundaries, so `leaseTtl` sizes to the longest *individual* action.
> - `continueAsNew` records the active patch set **atomically with the seed**.
> - New exports: `deterministicJournalId`, `clearWorkflowWakeAfterTx`.
>
> **3. Migrations, pgmq, and release hygiene.** `keiro-migrate` gains `verify-schema` (live objects vs
> embedded PG18 snapshot) and `import-codd-history`, plus an `up` codd-ledger preflight
> (`--allow-fresh-ledger-over-codd` to override). `Keiro.Migrations` adds `missingMigrations` /
> `StartupHandshake` / `handshakePassed` (per-replica boot gate), `preflightFreshLedgerOverCodd`,
> `renderCoddPreflight`. Payload integrity is now three-layered: compile-time embedder (+
> `RecompilePlugin` on GHC 9.12), a review-time `migrations.native.lock` SHA-256 suite, and the
> checksum-keyed ledger. `keiro-pgmq` one-shot `runJobOnce`/`runJobOnceWithContext` continue the
> producer's trace (one Consumer-kind `<jobName> process` span; no `shibuya.inflight.*`). `Keiro.version`
> corrected to `0.3.0.0`.
>
> Migration count: **twenty** files / twelve tables. Not documented as shipped: nothing in this range
> was left un-landed, but `keiro-dsl` still has **no payload-evolution syntax for workqueues** and no
> cross-repo contract conformance — both are recorded as explicit gaps.

> **Note (prior range).** The `601f9f3..c68dcc7` review covers the final validated command boundary,
> typed hydration/replay/snapshot/read-model failures, target-scoped orchestration idempotency,
> sharded at-least-once delivery, durable worker outcomes, workflow versioning and rotation, the
> complete keiro-dsl 0.2 authoring surface, native Kiroku-before-Keiro migration components in the
> `keiro` schema, and the 0.3 package release. The upstream tree had one user-untracked
> `mori.automation.dhall`; it was excluded from review and left untouched.

> **Note (prior range).** The `a9cecda..601f9f3` range contains the breaking validated-stream API change and its
> follow-up release/documentation work. Public command-side runners now accept
> `ValidatedEventStream` instead of a bare `EventStream`; `Keiro.EventStream.Validate` exports
> `ValidatedEventStream`, `unvalidated`, `mkEventStream`, `mkEventStreamWith`, and
> `mkEventStreamOrThrow`; and the top-level `Keiro` module re-exports the validation surface.
> `mkEventStream` now combines keiki's hidden-input/determinism/dead-edge validation with keiro's
> snapshot-policy coherence check, rejecting any snapshotting policy with `stateCodec = Nothing`.
> The docs folded this into `reference/event-stream-and-stream.mdx`, `reference/command.mdx`,
> `reference/projection.mdx`, the command-cycle explanation and walkthrough, the keiro landing page,
> `integrations/keiro-with-keiki.mdx`, first-command/read-model/process-manager tutorials,
> snapshot/router/transaction how-tos, keiro-dsl guide pages, and the source-code walkthroughs for
> `EventStream`, `runCommand`, routers, process managers, and snapshot hydration.
>
> The same range also adds codec construction validation (`mkCodec`, `CodecConfigError`) and updates
> generated/jitsurei stream definitions to produce `ValidatedEventStream` values via
> `mkEventStreamOrThrow`. These changes are part of the replay-safety story: unchecked streams cannot
> reach command runners, incoherent snapshots fail before hydration, and malformed codec/upcaster
> chains can be caught at construction time.

> **Note.** The `f1d67a0..a9cecda` range covers the post-hardening changes through the inbox/outbox
> throughput overhaul and review follow-up fixes.
>
> - **`keiro-dsl` ergonomics:** the CLI now supports module placement via `module` / `layout` clauses
>   and `--module-root` / `--collocate`, writes a Cabal-pasteable scaffold manifest, self-checks the
>   generated firewall, supports `check --emit`, and has `new <kind>` skeleton generation. The
>   existing notation, tutorial, how-to, and toolchain pages were already mostly current; this sync
>   leaves them as the documented DSL surface.
> - **Outbox throughput and semantics:** `publishClaimedOutbox` now accepts a batch-shaped publisher
>   (`[OutboxRow] -> Eff es [(OutboxId, PublishOutcome)]`), claims contiguous publish runs, bulk-marks
>   successful rows sent, groups publish outcomes by `(source, key)` or source as appropriate, and
>   skips ordered suffix rows without consuming attempts after a failed pivot. Stale publishing-row
>   reclaim and backlog gauge sampling moved off the publish hot path to `outboxMaintenancePass` /
>   `sampleOutboxBacklog`. The docs now reflect the batch callback, the maintenance split, the
>   `keiro_outbox_claim_order_idx` migration, and the fixed `PerSourceStream` outcome grouping.
> - **Inbox throughput and semantics:** fresh successful intake now inserts completed rows directly,
>   `sampleInboxBacklog` owns backlog gauge sampling, `runInboxTransactionBatch` amortizes a batch in
>   one transaction with per-message fallback on failure or condemned transaction, and
>   `InboxPersistence` adds `PersistDedupeOnly` for success-path slim storage. The docs now reflect the
>   new `runInboxTransactionWith` / `runInboxTransactionWithRetriesWith` / batch signatures, the
>   single-insert completed path, the dropped `keiro_inbox_received_idx`, and the condemned-batch
>   fallback fix.
> - **Diagrams:** inbox and outbox reference/explanation/walkthrough pages now include Mermaid mode
>   diagrams for dedupe, persistence, batch intake, ordering policy, publish outcome grouping, and
>   maintenance/sampling split.
> - **Not live yet:** the untracked Keiro plan
>   `docs/plans/83-delegated-idempotence-inbox-intake-bypass-the-keiro-inbox-table-when-the-downstream-state-machine-already-dedupes.md`
>   is still planning material, so this docs sync intentionally does **not** document delegated
>   idempotence as a shipped API.
>
> **Note (prior range).** The `9fa283b..f1d67a0` range is the June production-readiness hardening refresh. It
> changed the runtime surface across command execution, projections, messaging workers, PGMQ jobs,
> durable workflows, schema, telemetry, and test support; this docs repo folded those source changes
> into the keiro reference, how-to, tutorial, cookbook, walkthrough, integration, FAQ, and source-sync
> pages.
>
> - **Command/core/read side:** strong-consistency waits now track the store head; the codec surface is
>   `EventType`-aware and upcasting examples call out unknown-version handling; command retry and
>   snapshot failures expose advisory-lock and migration/schema drift failures; async projections
>   gained dedupe and expected-schema drift handling; test support grew wait helpers.
> - **Messaging, workers, and PGMQ:** inbox poison/failure metrics, outbox stale `publishing` reclaim
>   plus sent GC, timer stale-firing requeue, shard-reader survival hooks, process-manager/router
>   transient-vs-deterministic acks, and `PoisonPolicy` were documented. `keiro-pgmq` now covers
>   `RetryDefault`, classified decode errors, retry/tuning validation, header/batch/traced/group
>   producers, queue provisioning/FIFO setup, DLQ read/redrive/archive/purge, metrics, and retention.
> - **Workflows:** the docs now reflect `keiro_workflows` lifecycle rows, leases/backoff, `wake_after`,
>   journal append serialization, random/journaled awakeable ids, atomic wake and child paths, child
>   failure envelopes, active patch sets, and workflow GC.
> - **Schema and telemetry:** the page set was updated for the new messaging crash-recovery,
>   projection-dedupe, workflow-GC/wake-after migrations, and the expanded workflow/messaging
>   instruments. This source-sync pointer is the final integration record for that range.
>
> **Note (prior range).** The `f8950f4..9fa283b` range is a **one-line convention change**: compound
> aggregate/saga stream categories are now written in **camelCase** (e.g. `hospitalSurge`,
> `incidentEscalation`) instead of snake_case with `_`. Rationale: reads better and avoids mixing the
> join `_` with the `_` that TypeID id segments already carry. `:` stays reserved for the workflow
> family (`wf:<name>`). **Validation is unchanged** — `category` still rejects only `-`, `$all`, and
> the empty string, so no API or type changed; this is purely a documented authoring convention
> (`3ba633c`, touching the `StreamCategory` docstring, the category test, and ExecPlan #66). Folded
> into `reference/event-stream-and-stream.mdx` (the `StreamCategory` warn callout) and `faq.mdx` (the
> "build an aggregate's stream name safely" entry) — the only two pages that spelled out the old `_`
> join. The trailing commit `9fa283b` is a plan-doc status update only.
>
> **Note (prior range).** The `f6ebb16..f8950f4` range is **MasterPlan 8 — `keiro-dsl`** (a brand-new authoring
> package + CLI) plus **plan 66**, the `Keiro.Stream` `StreamCategory` API. The only **library** source
> change in the range is `keiro-core/src/Keiro/Stream.hs` (verified: `keiro-core/src` and `keiro/src`
> diff is Stream.hs only, +96 lines); everything else is the new `keiro-dsl/` package, the in-repo
> `jitsurei/` refactor onto the new API, docs/plans, and a `keiro/test/Main.hs` smoke test. So **no
> existing keiro reference/explanation page describing the v1/v2 runtime was invalidated** — this round
> is the StreamCategory fold + an additive new "Service DSL" doc area.
> - **`StreamCategory` API (`27dc22a`, `b99fbb8`; plan 66):** `Keiro.Stream` adds a validated,
>   phantom-typed stream **category** — `StreamCategory a`, `category`/`categoryUnsafe`,
>   `CategoryError`, `categoryName`, `StreamIdSegment`, `entityStream`/`entityStreamId` — so an author
>   declares a category once and derives both per-entity streams and the `CategoryName`. `category`
>   rejects the empty string, `$all`, and any text containing `-` (kiroku's category/id boundary),
>   turning the silent saga-prefix mis-parse into a fail-stop. The name mechanics delegate to kiroku's
>   `streamNameInCategory` (kiroku plan #55), keeping the category rule single-sourced in the store.
>   The in-repo `jitsurei/OrderStream.hs` was refactored onto it (`5af73f9`). Folded into
>   `reference/event-stream-and-stream.mdx` (new "Safe, category-based construction" section),
>   `walkthrough/foundation/01-the-stream-handle.mdx` (the source it tours changed),
>   `walkthrough/command-cycle/06-the-typed-handles.mdx`, and a new `faq.mdx` entry. Note: the
>   `example-app/` (hospital-capacity, incident-command) pages were **not** touched — those belong to
>   the separately-pinned `keiro-runtime-jitsurei` app, which was not refactored in this range.
> - **`keiro-dsl` package (MasterPlan 8, plans 58–66):** a typed-spec toolchain. A `.keiro` file is the
>   source of truth; `keiro-dsl` `check`s it, `scaffold`s the symbol-free `-- @generated` deterministic
>   layer + typed holes, emits a harness that pins behaviour, and `diff --since` gates evolution. The
>   load-bearing **firewall invariant**: no generated module ever contains a keiki symbolic operator —
>   the symbolic transducer is a hole, not generated. Covers all seven node families (`aggregate`,
>   `process`+`timer`, `contract`/`intake`/`emit`/`publisher`, `workqueue`/`dispatch`,
>   `workflow`/`operation`) + evolution. The spec extension is `.keiro` (renamed from `.kdsl` at
>   `2d59f54`). Documented as a new **Service DSL** subsystem under `content/docs/keiro/`:
>   `explanation/the-keiro-dsl-toolchain.mdx`, `reference/keiro-dsl-notation.mdx` (notation + CLI),
>   `tutorials/author-a-service-with-keiro-dsl.mdx` (the write→check→scaffold→fill→harness→diff loop),
>   three how-tos (`check-a-service-spec`, `scaffold-and-fill-holes`, `gate-spec-evolution-with-diff`),
>   one cookbook recipe (`inbox-disposition-the-three-inversions`), two `faq.mdx` entries, the keiro
>   `index.mdx` callout, the `getting-started` family/choosing pages, and the five section index
>   cards + meta.json wiring. Authoring source: the in-repo `agents/skills/keiro-dsl-authoring/`
>   (SKILL/NOTATION/LOOP/WALKTHROUGH) and `docs/corpus/keiro-dsl-corpus.md`.
> - **Schema:** no new keiro migrations — keiro-dsl emits no tables (read-model migrations are
>   delegated to `codd`); still **nine** migration files / **nine** tables.
> - **Telemetry:** no new keiro instruments in this range.

> **Note (prior range).** The `ac197da..f6ebb16` range is **MasterPlan 7 — `keiro-pgmq`**, a brand-new package, plus
> doc-only plan/masterplan entries. The keiro/keiro-core libraries are byte-identical across this range
> (verified: the diff is `keiro-pgmq/`, `docs/`, and keiro's own `cabal.project`/`mori.dhall` only) —
> so no existing keiro doc page was invalidated; this round is **additive**.
> - **New package `keiro-pgmq` (`445b658`, `cdab7b4`, `0498587`):** a typed background-job queue over
>   PGMQ + shibuya. Two layers — `Keiro.PGMQ.Runtime` (`QueueRef`/`queueRef`, `JobRuntime`,
>   `withJobRuntime`, `runJobEff`) and `Keiro.PGMQ.Job` (`Job`, `JobOutcome`, `RetryPolicy`,
>   `defaultRetryPolicy`, `enqueue`/`enqueueWithDelay`, `ensureJobQueue`, `jobProcessor`,
>   `runJobWorkers`, `runJobOnce`) — plus `Keiro.PGMQ.Codec` (`JobCodec`, `aesonJobCodec`,
>   `keiroJobCodec`) and the `Keiro.PGMQ` umbrella. EP-1 (plan 55) complete; five-scenario integration
>   test passes. Two API refinements vs the masterplan's Integration Point 1: `RetryDelay` is
>   re-exported from `Keiro.PGMQ` (import it there, not `Shibuya.Core.Ack`), and `enqueueWithDelay`'s
>   delay is `Int32` (seconds). Documented as a new "Background jobs" subsystem:
>   `reference/pgmq-jobs.mdx`, `explanation/background-jobs-with-pgmq.mdx`,
>   `tutorials/your-first-background-job.mdx`, four how-tos (`declare-a-background-job`,
>   `choose-a-job-run-cadence`, `version-a-job-payload`, `dead-letter-and-retry-jobs`), two cookbook
>   recipes (`scheduled-job-drain`, `transactional-job-enqueue`), two `faq.mdx` entries, the
>   `getting-started` family/choosing pages, a new `integrations/keiro-with-pgmq` composition page
>   (+ index card), and the `integrations/shibuya-pgmq-adapter` cross-link.
> - **Consumer migrations (EP-2 `rei`, EP-3 `hospital-capacity`):** the migration *code* lives in
>   other repos (`rei-project/rei`, `keiro-runtime-jitsurei`), not in keiro — only their plan docs
>   (56, 57) are in this range. They are the source of the docs' real worked examples: `rei`'s
>   continuous `runJobWorkers` over four queues (`aesonJobCodec`, no DLQ) and `hospital-capacity`'s
>   one-shot `runJobOnce` drain (literal `JobCodec`, DLQ, store-failure→`Retry`/rejected→`Dead`).
>   Notable real-world caveat folded into the docs: `enqueue` is **not** transactional with a domain
>   write — `rei`'s live producer sends via raw SQL in the same transaction, so the package covers the
>   consumer side and the transactional-enqueue cookbook documents the inline-SQL pattern.
>   The `keiro-runtime-jitsurei` application is now documented in full under
>   `content/docs/example-app/` and pinned separately — see
>   [`keiro-runtime-jitsurei-source-sync.md`](keiro-runtime-jitsurei-source-sync.md) for that app's
>   own source pointer.
> - **Schema:** keiro's own migrations are unchanged (still **nine** files / **nine** tables).
>   `keiro-pgmq` owns no keiro tables — it uses PGMQ's `pgmq.q_*` / `pgmq.q_*_dlq` queue tables, which
>   PGMQ (not keiro) creates.
> - **Telemetry:** no new keiro instruments; `keiro-pgmq` threads an optional OpenTelemetry tracer
>   through the shibuya `Tracing` effect and the `pgmq` interpreter.

> **Note (prior range).** The `0730ae1..ac197da` range was a **release-hardening** pass: no new doc area, a handful of
> additive/correctness changes folded into existing pages. (Two `chore:` commits — a whole-tree
> `format code` reflow and `prepare package metadata` — account for most of the diff line count but
> are doc-neutral.)
> - **Replay-safety validation (EP, `ac197da`):** new module `Keiro.EventStream.Validate`
>   (`keiro-core`) — `validateEventStream` / `validateEventStreamWith` lift keiki's pure
>   `validateTransducer` (hidden-input + determinism + dead-edge) to the `EventStream` boundary and
>   return labelled `EventStreamWarning`s; `mkEventStream` was introduced as a fail-fast smart
>   constructor returning `Left [EventStreamWarning]`. Requires `(Bounded s, Enum s, Ord s, Show s)`.
>   Superseded by the `a9cecda..601f9f3` note above: this surface is now re-exported from `Keiro`,
>   and `mkEventStream` returns `ValidatedEventStream`. Folded into
>   `reference/event-stream-and-stream.mdx` (new "Replay-safety validation" section),
>   `explanation/why-symtransducer-not-decider.mdx` (new "What the framework can prove" section), and
>   `faq.mdx`.
> - **keiki EP-56 dep bump (`26ba0b8`):** pins `keiki` to the commit shipping `validateTransducer` +
>   the structured `TransducerValidationWarning` the validation surface builds on (also updates the
>   demo Envelope for shibuya 0.7). Doc-relevant only as the dependency note above.
> - **Runtime idempotency hardening (`4537fe2`):** (a) process-manager **timers survive a no-op
>   manager command** — when a duplicate manager append can't schedule them inline, they go in a
>   follow-up transaction (`ProcessManager.hs`); (b) **deterministic outbox claim ordering** —
>   `claimOutboxBatch` and the head-of-line "earlier sibling" predicate now break ties on
>   `(created_at, outbox_id)`, and the claim re-orders its `UPDATE … RETURNING` rows via a CTE
>   (`Outbox/Schema.hs`). Folded into `reference/process-manager.mdx` and `reference/outbox.mdx`.
> - **Idempotent external workflow journal appends (`efaafde`):** `appendJournalEntry` /
>   `appendJournalEntryReturningId` now pre-check the deterministic entry id (`journalEntryExists`) and
>   re-check after a racing insert, so a concurrent/repeated external completion (e.g. a double
>   `signalAwakeable`) coalesces instead of duplicating (`Workflow.hs`). Folded into
>   `reference/durable-workflows.mdx` (the awakeable re-append note).
> - **Schema:** no new migrations — still **nine** migration files, **nine** tables.
> - **Telemetry:** no new instruments in this range.
>
> Router note: `Keiro/Router.hs` saw only a cosmetic export-list/import reflow in this range (no
> functional change). The Router *documentation* was nonetheless substantially expanded this round on
> direct request (developers were still confused): new `explanation/routers-and-content-based-dispatch.mdx`,
> new `cookbook/event-fan-out-with-routers.mdx`, deepened `reference/router.mdx` (the `resolve` seam +
> `targetProjections`) and `how-to/route-events-to-commands.mdx`, two new `faq.mdx` entries, and
> section index/meta wiring. Likewise the **keiki** diagram docs gained a new
> `how-to/keep-diagrams-in-sync.mdx` (golden test + in-place regeneration + text validators), with
> cross-links from the render/atlas how-tos and the diagrams explanation — unrelated to the keiro
> source range, requested in the same round.
>
> Deferred (now rejected or demand-driven, no longer "additive soon"): multi-region / global ordering,
> server-side scripted projections, a schema registry, and field-level encryption.

### Previous pointers (for traceability)

- `fc935b790b3f9665d352f2b0de46bc3daeca9f2b` (`fc935b7`, 2026-08-05, Keiro 0.11.0.0) — the baseline
  before the 0.12.0.0 release review. The `fc935b7..8d1cd74` range (85 commits) is the largest
  runtime round since the 0.3 line: exact workflow discovery and the wake-ledger contract
  (ADRs 0023/0025/0027, migration `0021` — the only migration that rewrites live state), frozen
  UTF-8 deterministic ids (ADR 0024, ASCII-identical so no migration), the typed projection catalog
  (ADR 0026, migrations `0022`/`0023`, five new tables), the new `keiro-ops` package (ADR 0028), eight
  new telemetry instruments with `keiro.projection.lag` deprecated, and **keiro-dsl language 5** —
  `syntax-profile/4` plus a `ProjectionCatalogRuntime` capability that **contributes a fold segment**
  and therefore changes aggregate fold identity. Added `reference/projection-catalog.mdx`,
  `reference/keiro-ops-cli.mdx`, `how-to/write-a-custom-wake-source.mdx`, and
  `how-to/operate-a-deployment-with-keiro-ops.mdx`. Migration count 20 → 23. Nothing retired.
- `f05102bab0db447c1b653309f43f075739fc8747` (`f05102b`, 2026-08-02, Keiro 0.9.0.0) — the baseline
  before the keiro-dsl adoption-hardening review. The `f05102b..fc935b7` range (66 commits) landed
  0.10.0.0 (pure lockstep, no user-facing changes) and 0.11.0.0: role-bearing scaffold sidecars with
  a refusing old-name tree and `--apply-name-migrations`, one checked generated-Haskell naming
  edition, an honest `check --deny-warnings` gate, four refused accepted-but-unimplemented spec
  surfaces, required-only workqueue payload fields, language-4 field aliases on `syntax-profile/3`,
  and keiki `>=0.9` bounds. Runtime-side source changed in exactly one file
  (`Keiro/Timer/Schema.hs`: `TimerStatus` gains `Enum`/`Bounded`); no SQL migration changed anywhere
  in the range.

- `430c3d2cca0f491697d7e67a85362b78718a50be` (`430c3d2`, 2026-07-29, Keiro 0.4.0.1) — the baseline
  before the source-language-contract review. The `430c3d2..f05102b` range (101 commits) landed five
  releases, 0.5.0.0 through 0.9.0.0: service workspaces released (0.5.0.0), the `language keiro-dsl N`
  preamble with nominal consumer bindings and typed scalar aggregate expressions (0.6.0.0), the
  enforced TypeID-v7 id domain with abstract generated IDs and complete behaviour conformance
  (0.7.0.0), the modular located frontend (0.8.0.0), and language 4 as the sole stable contract with
  FNV-1a-128 fold fingerprints, capability-profile runtime semantics, and closed generated runtime
  surfaces (0.9.0.0). No SQL migration changed anywhere in the range.

- `778c75ce60398bf44d12b81d563a7870deb4d3f5` (`778c75c`, 2026-07-23, Keiro 0.3.0.0) — the baseline
  before the structural-consumer-types and service-workspaces review. **This SHA no longer exists on
  `master`:** upstream rewrote history after it, and its content-identical rewritten twin is
  `71d680155725e66f2f2f683910e21749bb7125d5` (`71d6801`, 2026-07-24, same subject). The
  `71d6801..430c3d2` range (65 commits) landed `keiro-core`'s `Keiro.Codec.Structural` binding API and
  its exact-nominal generic adapter, `keiro-dsl` mapped structural/opaque consumer types with a
  resolved type graph and ~39 new diagnostic codes, six-surface compatibility vectors with `--gate` /
  `--explain` / `--report-out`, reporting-first coverage with opt-in opacity gates, the historical
  codec-comparison engine, `FoldVersion` / `defaultStateCodecWithFold`, unreleased `.keiro-workspace`
  service workspaces, and the `0.4.0.0` / `0.4.0.1` releases onto keiki 0.4.
- `c68dcc7b9cea8d9c180d1c04254a72aa43804cac` (`c68dcc7`, 2026-07-14, Keiro 0.3.0.0) — the baseline
  before the evolution-safety and durable-execution hardening review. The `c68dcc7..778c75c` range
  (63 commits) landed replay-only edges and the computed guard-tightening twin, two-stage event
  retirement, the real-log `Keiro.ReplayAudit`, the DSL replay-impact verdict and old-payload goldens,
  the three-component snapshot discriminator plus fold fingerprint and sampled seed witness, codec
  validation at the stream boundary, workflow wake-source/sleep-generation/lease/resurrection
  hardening, migrations `0019`/`0020` with `verify-schema` + startup handshake + lockfile integrity,
  and pgmq one-shot trace continuity.
- `601f9f36f016d6c9f3f762cda093f65f7dea5225` (`601f9f3`, 2026-07-05, Keiro
  0.1 development line) — baseline before the 127-commit reliability, keiro-dsl, native migration,
  dependency-upgrade, and 0.3 release review recorded above.
- `f1d67a01b7457387a4861e7268d1c521ef82287d` (`f1d67a0`, 2026-06-15, keiro 0.1.0.0) — the baseline
  before the post-hardening `keiro-dsl` ergonomics pass and the July inbox/outbox throughput
  overhaul. The `f1d67a0..a9cecda` range changed `keiro-dsl` placement/manifest/firewall/new-command
  ergonomics, made outbox publishing batch-shaped with off-hot-path maintenance and a claim-order
  index, made inbox intake single-insert/batched/slim with off-hot-path backlog sampling, and fixed
  review follow-ups around `PerSourceStream` outcome grouping and condemned batch transactions.
- `9fa283b6cfbf3734367f3bef4801001e6b19abfc` (`9fa283b`, 2026-06-10, keiro 0.1.0.0) — the baseline
  before the June production-readiness hardening. The `9fa283b..f1d67a0` range updated command,
  projection/read-side, messaging workers, `keiro-pgmq`, durable workflows, schema, telemetry, and
  test-support behavior; this documentation refresh reconciled those source changes across the keiro
  and integration docs.
- `f8950f46511f2e9505d8bb5aed9731e3e1d09f03` (`f8950f4`, 2026-06-10, keiro 0.1.0.0) — the baseline
  before the camelCase convention change. The `f8950f4..9fa283b` range only restyled the **compound
  stream category** convention from snake_case (`hospital_surge`) to camelCase (`hospitalSurge`) in the
  `StreamCategory` docstring + test (`3ba633c`); validation is unchanged (still rejects only
  `-`/`$all`/empty). The docs round retouched the two pages that spelled out the old `_` join —
  `reference/event-stream-and-stream.mdx` and `faq.mdx`. No source/API/migration change.
- `f6ebb162446f0ad6ae4b37498f77968c594a5c4c` (`f6ebb16`, 2026-06-07, keiro 0.1.0.0) — the baseline
  before MasterPlan 8. The `f6ebb16..f8950f4` range added the **`keiro-dsl`** typed-spec toolchain (a
  new authoring package + CLI: `check`/`scaffold`/`harness`/`diff` over a `.keiro` spec, the firewall
  invariant, all seven node families) and the **`Keiro.Stream` `StreamCategory` API** (plan 66 —
  validated, phantom-typed stream categories; the in-repo `jitsurei` was refactored onto it). The only
  library source change is `keiro-core/src/Keiro/Stream.hs`; the docs round folded StreamCategory into
  the event-stream/stream pages and added an additive **Service DSL** doc area. No new
  migrations/tables (still nine/nine).
- `ac197da3b2b11aae2e00ce2e4587a7fb99b9ffc1` (`ac197da`, 2026-06-06, keiro 0.1.0.0) — the baseline
  before MasterPlan 7. The `ac197da..f6ebb16` range added the **`keiro-pgmq`** package (the typed
  background-job queue — `Keiro.PGMQ.Runtime`/`.Codec`/`.Job` + umbrella; EP-1/plan 55) and the two
  consumer-migration plan docs (EP-2 `rei`, EP-3 `hospital-capacity`; the migration code lives in
  those repos, not keiro). keiro/keiro-core libraries are byte-identical across the range; the docs
  round was purely additive (a new "Background jobs" subsystem). No new keiro migrations/tables (still
  nine/nine).
- `0730ae1533894ec5398b9dc0728989edb0f1148d` (`0730ae1`, 2026-06-04, keiro 0.1.0.0) — the baseline
  before the release-hardening pass. The `0730ae1..ac197da` range added the `Keiro.EventStream.Validate`
  replay-safety surface (`validateEventStream`/`mkEventStream`, on keiki EP-56's `validateTransducer`),
  hardened runtime idempotency (PM timers on a no-op manager command; deterministic
  `(created_at, outbox_id)` outbox claim ordering; idempotent external workflow journal appends), and
  bumped the keiki pin — plus two doc-neutral `chore:` commits (whole-tree format reflow, package
  metadata). No new migrations/tables (still nine/nine).
- `d6928518d955c4ca8c3987a6f27dedeb9b2f23d4` (`d692851`, 2026-06-03, keiro 0.1.0.0) — the baseline
  before Phase 5 phase-2. The `d692851..0730ae1` range added continue-as-new journal rotation
  (`continueAsNew`/`restoreSeed`, EP-48), the versioning/patch API (`patch`, EP-49), LISTEN/NOTIFY push
  delivery (`Keiro.Wake` + `runWorkflowResumeWorkerPush`, EP-50), consumer-group sharding for category
  subscriptions (`Keiro.Subscription.Shard`, EP-51), the two new migrations/tables, and the
  `keiro-migrate new` scaffold — plus a Nix-only build migration at the tip.
- `aeaafee8861840750475e7d48b2c5cb0ae71beab` (`aeaafee`, 2026-06-03, keiro 0.1.0.0) — the baseline
  before Phase 5. The `aeaafee..d692851` range added the `Keiro.Workflow` durable-execution runtime
  (named-step journaling/replay, durable sleep, awakeables, child workflows, the crash-recovery resume
  worker, journal snapshots, and `keiro.workflow.*` telemetry), the three workflow migrations/tables,
  and the jitsurei `workflow` demo (`Jitsurei.DurableWorkflow`).
- `94c85e2a3ccbdb1adb07fcb5a7ee57b964802a2f` (`94c85e2`, 2026-06-01, keiro 0.1.0.0) — the baseline
  before Phase 2's observability/recovery work. The `94c85e2..aeaafee` range added the
  `KeiroMetrics` metrics surface, instrumented the four background workers, shipped the timer
  recovery API (`Dead` state, `maxAttempts`, `last_error`, timer-recovery migration), and added
  `recordProjectionLag` / `countInboxBacklog` / `countOutboxBacklog` / `readSubscriptionPosition`.
  Worker entry-point signatures changed (`runTimerWorker`, `runInboxTransaction(WithKey)`,
  `publishClaimedOutbox`, `runQuery(With)` / `waitFor` all take the metrics handle); existing callers
  pass `Nothing`.
- `3f5dc9c1fa90f6358cebb9e85d92dde4c325db48` (`3f5dc9c`, 2026-05-31, keiro 0.1.0.0) — the baseline the
  keiro doc set was first authored against. The `3f5dc9c..94c85e2` range covered the OpenTelemetry
  1.40 / hs-opentelemetry 1.0 upgrade (folded into `reference/telemetry.mdx`) and the docs-driven
  `Keiro.Command` "Transduce" comment fix.

## Update procedure

1. List what changed since the pointer:
   ```text
   KEIRO=$(mori registry show shinzui/keiro --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$KEIRO" log --oneline 8d1cd74a..HEAD
   git -C "$KEIRO" diff --stat 8d1cd74a..HEAD

   # Do these two FIRST — they are cheap and they SIZE the round either way.
   # They collapsed the f05102b and fc935b7 rounds to "keiro-dsl only, no SQL";
   # they blew the 8d1cd74 round wide open (3 migrations, 2 new exposed modules,
   # a new package). Do not assume the collapsing outcome.
   git -C "$KEIRO" diff --name-status 8d1cd74a..HEAD -- '*.sql'
   git -C "$KEIRO" diff --stat 8d1cd74a..HEAD -- keiro/src keiro-core/src keiro-pgmq/src

   # And check the cabal files — a new package is invisible to the two above:
   git -C "$KEIRO" diff 8d1cd74a..HEAD -- '*.cabal' | grep -E '^[-+].*(exposed-modules|other-modules|^\+name:)'
   ```
   keiro's own `docs/adr/*` is now the fastest way to read a decision's *rationale and consequences*
   (ADRs 0001–0028 cover pgmq telemetry, live schema verification, codd-ledger guarding, replay-only
   edges, the snapshot discriminator, gate placement, the four workflow lifecycle rules, Kafka
   consumer fatal observability, one schema authority with total bindings, reporting-first coverage
   with opt-in opacity gates, the two workspace ADRs, and — new in the 0.12 round — exact workflow
   discovery and the wake ledger (0023), frozen UTF-8 deterministic ids (0024), the worker-loop
   contract (0025), projection catalogs (0026), append-only lifecycle markers (0027), and the
   operator-command boundary (0028); `docs/adr/log.md` is the per-date index).
   keiro also keeps its own `docs/`, `CHANGELOG.md`, and `docs/plans|masterplans` entries — the
   prose diff there is the fastest way to understand intent before touching the source. Note that
   keiro's in-repo `docs/research/*` and `docs/plans/*` notes **predate the implementation and
   diverge from it** (renamed types, different SQL columns, unimplemented features); trust the
   shipped source over the notes.
2. Update the affected pages under `content/docs/keiro/`. The pages most coupled to the source
   surface (transcribe exact Haskell signatures, SQL column shapes, or option-record fields, so a
   source change is most likely to invalidate them) are:
   - **Reference pages** (verbatim signatures and SQL): `reference/command.mdx`,
     `reference/event-stream-and-stream.mdx`, `reference/codec.mdx`, `reference/router.mdx`,
     `reference/projection.mdx`, `reference/read-model.mdx`, `reference/snapshot.mdx`,
     `reference/process-manager.mdx`, `reference/timers.mdx`, `reference/durable-workflows.mdx`,
     `reference/push-delivery.mdx`, `reference/subscription-sharding.mdx`,
     `reference/integration-event.mdx`, `reference/inbox.mdx`, `reference/outbox.mdx`,
     `reference/pgmq-jobs.mdx`, `reference/replay-audit.mdx`, `reference/deploy-ordering.mdx`,
     `reference/telemetry.mdx`, `reference/migrations-and-schema.mdx`.
   - **The evolution area** (upstream sources: `docs/guides/evolution-and-replayability.md`,
     `docs/user/deploy-ordering.md`, `docs/user/replay-safety.md`, `docs/user/snapshots.md`,
     `docs/adr/0002`–`0004`): `explanation/evolution-and-replayability.mdx`,
     `reference/replay-audit.mdx`, `reference/deploy-ordering.mdx`,
     `how-to/retire-an-event-type.mdx`, `how-to/tighten-a-guard-with-a-replay-only-twin.mdx`,
     `how-to/audit-real-logs-before-a-deploy.mdx`.
   - **Walkthroughs** (line-by-line tours of the real source): every chapter under
     `walkthrough/command-cycle/`, `walkthrough/read-side/`, `walkthrough/workflow/`,
     `walkthrough/durable-execution/`, `walkthrough/scaling/`, `walkthrough/operations/`, and
     `walkthrough/integration/`.
   - **Conceptual anchors**: `explanation/what-is-keiro.mdx`, `explanation/the-keiro-stack.mdx`,
     `explanation/the-jitsurei-example.mdx`, and `tutorials/getting-started.mdx`.
3. Replace the **Last reviewed commit** block above with the new `HEAD`, and move the old SHA into
   **Previous pointers** with a one-line summary of what the range covered.
