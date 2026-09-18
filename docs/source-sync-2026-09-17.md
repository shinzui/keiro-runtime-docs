# Source sync — 2026-09-17

All ranges below are committed upstream trees resolved through Mori. Every commit is classified even when its only action is an explicit no-op. Release selections were verified against Hackage and upstream tags. Cross-repository sources use canonical Mori project URIs.

## Documentation actions

- **Added (2 files):** guarded dead-timer resume runbook and this audit ledger.
- **Updated (50 files):** Keiro timers, migrations, deploy ordering, process managers, inbox, outbox, PGMQ jobs, telemetry, DSL Language 6, walkthroughs, integration compatibility, pgmq-hs 0.6, Shibuya adapter pages, and eight source pointers.
- **Retired:** none.
- **No-op ranges:** Keiki metadata; Kiroku plans/ADRs/provenance; shared Shibuya–Kiroku pointer.

## Verification boundary

Production build, formatting, lint, navigation (534 pages), internal-link checks (534 files), rendered-heading anchor inspection, pointer status, and `git diff --check` passed. The repository's unmodified `tsconfig.json` rejects three existing planning-skill imports that end in `.ts`; `tsc --noEmit --allowImportingTsExtensions` passed, isolating that baseline configuration failure from the documentation changes. This ledger claims source/API documentation review, not live service or database execution.

## keiki

Project `mori://shinzui/keiki`: `97d8b07e..79337c57` (1 commit).

Metadata-only Mori update; no API or behavior change.

| Commit and change | Action | Documentation result |
| --- | --- | --- |
| `79337c57` chore(mori): declare every package and its dependencies | NO-OP | No shipped documentation delta beyond the range summary. |

## keiro

Project `mori://shinzui/keiro`: `de574cdc..11e0bba4` (142 commits).

Keiro 0.16–0.17: guarded timers, deterministic producer identity, reactions, delegated inbox, PGMQ/DLQ hardening, and candidate Language 6.

| Commit and change | Action | Documentation result |
| --- | --- | --- |
| `3a7cb57b` feat(automation): record release facts from observed tags | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `c3c935c6` refactor(automation): adopt the automation/ layout | NO-OP | No shipped documentation delta beyond the range summary. |
| `7ffd2519` docs: request dead timer inspection and guarded resume | NO-OP | No shipped documentation delta beyond the range summary. |
| `b571b26a` docs(plan): define reason-bearing dead timer reads | NO-OP | No shipped documentation delta beyond the range summary. |
| `c486404c` feat(timer): expose reason-bearing inspection and bounded dead reads | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `627b1243` docs(timer): define inspection pagination and authorization contracts | NO-OP | No shipped documentation delta beyond the range summary. |
| `aa24d2ca` fix(automation): give release recording a timeout that fits nix develop | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `801f8bc0` docs(plan): record completed dead timer read validation | NO-OP | No shipped documentation delta beyond the range summary. |
| `e7e963cc` docs: plan atomic guarded dead timer resume | NO-OP | No shipped documentation delta beyond the range summary. |
| `c351fceb` feat(timer): add atomic guarded dead timer resume | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `6df9c5b4` fix(timer): refuse resume when the initial row lock finds no timer | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `11b326b2` test(timer): prove guarded bulk requeue exclusion and record acceptance | NO-OP | No shipped documentation delta beyond the range summary. |
| `2da45585` chore(release): 0.16.0.0 | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `85878b60` refactor(automation): narrow the release selector with refRegexes | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `924f0361` fix(nix): provide git in the dev shell | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `240e7203` docs: close timer recovery requests with release and consumer evidence | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `a39cb266` fix(read-model): hold rebuild locks through native query execution | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `3ce69d58` feat(outbox): replay inspected dead deliveries with an attempt fence | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `763a4fec` chore(release): prepare 0.17.0.0 | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `250d3007` revert: undo native query fencing, outbox replay, and 0.17 release | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `5e406797` docs: request investigation of Koyomi runtime contracts | NO-OP | No shipped documentation delta beyond the range summary. |
| `f5f148d0` docs: separate read-model and outbox library requests | NO-OP | No shipped documentation delta beyond the range summary. |
| `74bd0b1e` docs(plans): plan first-class process-manager reactions for keiro-dsl | NO-OP | No shipped documentation delta beyond the range summary. |
| `99e16724` docs: request first-class process-manager reactions in keiro-dsl | NO-OP | No shipped documentation delta beyond the range summary. |
| `fdffd3e2` docs(plans): plan cursor-paged workflow inspection reads for IR-30 | NO-OP | No shipped documentation delta beyond the range summary. |
| `9fca0e02` docs: record ExecPlan 277 in the improvement-request log | NO-OP | No shipped documentation delta beyond the range summary. |
| `4d3113f0` docs(improvement-requests): log the IR-26 planning entry | NO-OP | No shipped documentation delta beyond the range summary. |
| `0d861a89` docs(plans): plan aggregate inspection read APIs for IR-28 | NO-OP | No shipped documentation delta beyond the range summary. |
| `3837e1ea` docs(adr): record the inspection-UI boundary in ADR-40 and close IR-32 | NO-OP | No shipped documentation delta beyond the range summary. |
| `7644a740` docs(plans): separate process-manager API hardening from DSL delivery | NO-OP | No shipped documentation delta beyond the range summary. |
| `9ea5eacd` feat(plans): add provenance tracking to execution and master plans | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `e03e92df` fix(bench): use current scaffold and parser record fields | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `e4ec781b` chore(deps): adopt pgmq 0.6 release candidate | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `330ee965` docs(plans): plan process-manager inspection reads for IR-29 | NO-OP | No shipped documentation delta beyond the range summary. |
| `6fcd9878` docs(improvement-requests): reconcile request status and plan links | NO-OP | No shipped documentation delta beyond the range summary. |
| `63797e51` docs: validate process-manager reaction API plan | NO-OP | No shipped documentation delta beyond the range summary. |
| `503475fa` chore: apply seihou exec-plan and master-plan scaffolding updates | NO-OP | No shipped documentation delta beyond the range summary. |
| `58682e63` chore(nix): migrate nix-haskell-flake to v0.21.0 and relocate customizations | NO-OP | No shipped documentation delta beyond the range summary. |
| `c337e183` style(cabal): reformat cabal files with cabal-gild | NO-OP | No shipped documentation delta beyond the range summary. |
| `9b93112b` docs(plans): relocate MasterPlan 17's upstream scope to pgmq-hs | NO-OP | No shipped documentation delta beyond the range summary. |
| `14dd9036` docs(plan): record reaction API dependency blocker | NO-OP | No shipped documentation delta beyond the range summary. |
| `0ab397f7` docs(plans): align MasterPlan 17 with client-only ordering and additive indexes | NO-OP | No shipped documentation delta beyond the range summary. |
| `73926a56` docs(plan): plan pgmq-hs 0.6 upgrade completion | NO-OP | No shipped documentation delta beyond the range summary. |
| `1198316e` docs(plan): record blocked pgmq adapter release gate | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `a46d0880` docs(plan): clear pgmq adapter release gate | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `9b595352` chore(deps): complete pgmq-hs 0.6 adoption | NO-OP | No shipped documentation delta beyond the range summary. |
| `10a0c52f` docs(plan): complete pgmq-hs 0.6 upgrade | NO-OP | No shipped documentation delta beyond the range summary. |
| `a6181781` test(process-manager): prove reaction API feasibility | NO-OP | No shipped documentation delta beyond the range summary. |
| `98c5df42` feat(process-manager): add reaction identity primitives | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `4fce07ad` feat(process-manager): add reaction once runner | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `b6181fd5` feat(process-manager): add reaction worker | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `edd142c1` docs(process-manager): close reaction runtime plan | NO-OP | No shipped documentation delta beyond the range summary. |
| `20f2f378` docs(plan): refresh producer outbox identity implementation status | NO-OP | No shipped documentation delta beyond the range summary. |
| `56fa99ff` docs(plan): align reaction DSL plan with completed runtime | NO-OP | No shipped documentation delta beyond the range summary. |
| `3cdbe90a` fix(outbox): derive replay-safe producer identities and reject content drift | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `d38ff077` docs: reconcile backlog and record next release scope | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `844d3062` perf(outbox): reduce replay allocations and guard producer enqueue costs | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `ed3741c8` docs: correct backlog handoffs and Decider disposition | NO-OP | No shipped documentation delta beyond the range summary. |
| `97c1c27a` docs(outbox): complete replay identity validation and API guidance | NO-OP | No shipped documentation delta beyond the range summary. |
| `1a508a6c` docs(inbox): refresh delegated idempotence plan | NO-OP | No shipped documentation delta beyond the range summary. |
| `fb362bad` docs(changelog): reconcile unreleased entries across packages | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `9d2dd536` feat(inbox): add delegated idempotence runtime | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `42d54f09` test(inbox): prove delegated command durability | NO-OP | No shipped documentation delta beyond the range summary. |
| `1f294d3d` test(inbox): prove delegated inbox table denial | NO-OP | No shipped documentation delta beyond the range summary. |
| `7e10a8e5` docs(improvement-requests): audit open request statuses against plans | NO-OP | No shipped documentation delta beyond the range summary. |
| `6b16d217` feat(dsl): add delegated intake idempotence mode | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `256b2595` docs(plan): refresh DLQ work after pgmq-hs upgrade | NO-OP | No shipped documentation delta beyond the range summary. |
| `73231189` perf(inbox): add delegated intake evidence | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `5a567729` docs(inbox): define delegated receipt ownership | NO-OP | No shipped documentation delta beyond the range summary. |
| `348f1ad3` docs: refresh transition-family diff execution plan | NO-OP | No shipped documentation delta beyond the range summary. |
| `7e4da3cb` docs(plan): complete delegated inbox execution | NO-OP | No shipped documentation delta beyond the range summary. |
| `afd7f449` docs(plan): refresh EP-266 APIs and replay remedy contracts | NO-OP | No shipped documentation delta beyond the range summary. |
| `1858365b` fix(dsl): make transition family diffs deterministic | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `32e59a2c` test(dsl): register transition family fixtures | NO-OP | No shipped documentation delta beyond the range summary. |
| `a5b77f84` docs(plan): record EP-265 prerequisite completion | NO-OP | No shipped documentation delta beyond the range summary. |
| `4ccbdbfc` feat(dsl): classify complete replay body unions | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `52c74be4` feat(dsl): validate replay body remedies | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `2f3729a4` fix(dsl): validate workspace guard remedies | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `f27149ef` docs(dsl): record guard union contract | NO-OP | No shipped documentation delta beyond the range summary. |
| `a468e671` chore(nix): apply seihou nix-haskell-flake module scaffolding | NO-OP | No shipped documentation delta beyond the range summary. |
| `1032279f` feat(dsl): add first-class process reactions | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `3fd78ba8` fix(dsl): register reaction conformance corpus | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `7d09d55b` fix(dsl): isolate reaction text imports | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `3661c006` docs(plan): complete reaction worker milestone | NO-OP | No shipped documentation delta beyond the range summary. |
| `5b52b684` feat(dsl): generate process reaction effects | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `32063e46` test(dsl): complete reaction conformance evidence | NO-OP | No shipped documentation delta beyond the range summary. |
| `bb19e4d3` fix(dsl): compile scaling reaction harness | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `1bd182d7` feat(dsl): classify process reaction evolution | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `708aa215` test(dsl): record legacy process coordination | NO-OP | No shipped documentation delta beyond the range summary. |
| `987f8f92` docs(dsl): complete process reaction guidance | NO-OP | No shipped documentation delta beyond the range summary. |
| `6cd55f45` docs(improvement-requests): record refresh reviews on every request | NO-OP | No shipped documentation delta beyond the range summary. |
| `d6230333` fix(pgmq): preserve headers on DLQ redrive | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `bf54dd3f` fix(pgmq): guard DLQ purge after inspection | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `0a6a8f12` docs(pgmq): define visibility-safe DLQ operations | NO-OP | No shipped documentation delta beyond the range summary. |
| `3064b783` docs(exec-plan): refresh FIFO ordering plan | NO-OP | No shipped documentation delta beyond the range summary. |
| `b334414b` docs(masterplan): refresh pgmq-hs ownership status | NO-OP | No shipped documentation delta beyond the range summary. |
| `d9c92ed8` docs(plans): refresh pgmq retention and FIFO performance work | NO-OP | No shipped documentation delta beyond the range summary. |
| `da5e2469` feat(keiro-pgmq)!: enforce declared FIFO consumption contracts | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `fa6b66b2` feat(pgmq): validate partition retention configuration | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `a51d2a11` docs(reviews): record REV-17 keiro 0.17.0.0 release readiness | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `95017444` docs(plans): plan the REV-17 0.17.0.0 release remediation as MasterPlan 43 | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `4ce9f253` docs: request nested nominal ID support in structural mappings | NO-OP | No shipped documentation delta beyond the range summary. |
| `3da4d437` docs(improvement-requests): merge IR-40 nested nominal ID request (#1) | NO-OP | No shipped documentation delta beyond the range summary. |
| `f4ef5a9e` docs(plans): plan nested nominal ID support as ExecPlan 287 and accept IR-40 | NO-OP | No shipped documentation delta beyond the range summary. |
| `ae28a399` docs(plans): widen plan 287 to queue and read-model roots and plan the remaining nominal ID gaps as 288 | NO-OP | No shipped documentation delta beyond the range summary. |
| `71cecf1e` docs(plans): correct nominal leaf plan and record qualification review | NO-OP | No shipped documentation delta beyond the range summary. |
| `6b7debb5` docs: add identifier-keyed maps to plan 288 and record the contract-container decision as RES-18 | NO-OP | No shipped documentation delta beyond the range summary. |
| `9ea97606` chore(research): regenerate the notes index so okf index is idempotent | NO-OP | No shipped documentation delta beyond the range summary. |
| `d54890b2` docs(plans): align plan 288 with the review corrections applied to plan 287 | NO-OP | No shipped documentation delta beyond the range summary. |
| `28d522ce` docs(plans): record plan 288 correctness review | NO-OP | No shipped documentation delta beyond the range summary. |
| `15aec29b` docs(plans): refine nominal support scope and release priorities | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `d00412a9` test(dsl): capture nominal leaf resolver baseline | NO-OP | No shipped documentation delta beyond the range summary. |
| `7d235121` feat(dsl): resolve nominal structural leaves | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `d2961ed0` feat(dsl): enforce nominal structural admission | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `69516f31` feat(dsl): classify nested nominal boundaries | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `4459d1fe` test(dsl): prove workspace nominal leaf ownership | NO-OP | No shipped documentation delta beyond the range summary. |
| `c0f346b1` test(dsl): align workspace nominal baseline | NO-OP | No shipped documentation delta beyond the range summary. |
| `539a0580` docs(dsl): document nominal structural leaves | NO-OP | No shipped documentation delta beyond the range summary. |
| `a54a2010` docs(plans): refresh nominal support implementation plan | NO-OP | No shipped documentation delta beyond the range summary. |
| `74b9206b` feat(dsl): support nominal enum structural leaves | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `82fcd25b` docs(plans): record nominal enum milestone | NO-OP | No shipped documentation delta beyond the range summary. |
| `6effec8d` feat(dsl): support declared IDs in contracts | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `9d42710c` docs(plan): record declared contract ID evidence | NO-OP | No shipped documentation delta beyond the range summary. |
| `99450583` feat(dsl): support nested nominal expressions | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `815a6c71` chore(dsl): regenerate projection corpus | NO-OP | No shipped documentation delta beyond the range summary. |
| `08afd229` docs(plan): record nested nominal evidence | NO-OP | No shipped documentation delta beyond the range summary. |
| `d5ff8e3f` feat(dsl): add identifier-keyed structural maps | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `b7831b85` fix(dsl): localize keyed map helpers | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `099b6246` docs(plan): record keyed nominal closure | NO-OP | No shipped documentation delta beyond the range summary. |
| `acda7fc0` chore(dsl): refresh record migration manifests | NO-OP | No shipped documentation delta beyond the range summary. |
| `e6183397` docs(plans): refresh release gate plan against current tree | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `c6740014` docs(plans): complete the release gate remediation | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `d6e27af4` docs(blueprint): add the 0.17 upgrade edge | NO-OP | No shipped documentation delta beyond the range summary. |
| `041d73b1` docs(changelog): reconcile 0.17 release notes | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `c1196760` feat(dsl)!: gate ordering fifo-heads to Language 6 | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `21f54093` docs(dsl): finish the fifo-heads language gate | NO-OP | No shipped documentation delta beyond the range summary. |
| `79d137db` fix(dsl): harden candidate reaction identity | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `f8c8b78d` docs(dsl): refresh reaction candidate contracts | NO-OP | No shipped documentation delta beyond the range summary. |
| `af37b955` fix: close carried release readiness follow-ups | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `20c21d2d` docs(plans): complete release readiness master plan | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |
| `d74818fa` docs: refresh user docs and guides for 0.17.0.0 | NO-OP | No shipped documentation delta beyond the range summary. |
| `11e0bba4` chore(release): 0.17.0.0 | UPDATE | Reflected in the Keiro 0.16–0.17 reference, guides, compatibility, or DSL coverage. |

## kiroku

Project `mori://shinzui/kiroku`: `7051b123..07cd034a` (11 commits).

Plans, ADRs, review metadata, and provenance only; no shipped package source or API change.

| Commit and change | Action | Documentation result |
| --- | --- | --- |
| `70b7661f` chore: apply seihou exec-plan and master-plan provenance scaffolding | NO-OP | No shipped documentation delta beyond the range summary. |
| `ac8b7508` docs(plans): adopt performance and design review decisions for MasterPlan 12 | NO-OP | No shipped documentation delta beyond the range summary. |
| `579451dc` docs(plans): apply MasterPlan 11 second review with provenance | NO-OP | No shipped documentation delta beyond the range summary. |
| `44d3e197` docs(plans): adopt 1.0 API conventions for MasterPlan 12 and add ADR-8 | NO-OP | No shipped documentation delta beyond the range summary. |
| `6a1f397f` docs(plans): plan durable subscription checkpoints over HTTP | NO-OP | No shipped documentation delta beyond the range summary. |
| `e118094b` docs(improvement-requests): accept IR-10 and link it to ExecPlan 87 | NO-OP | No shipped documentation delta beyond the range summary. |
| `09b70053` docs(plans): plan the REST browse read API for IR-8 | NO-OP | No shipped documentation delta beyond the range summary. |
| `4a1b98a4` docs(adr): record HTTP and WebSocket wire-format stability in ADR-9 | NO-OP | No shipped documentation delta beyond the range summary. |
| `c34a5f97` docs(plans): plan the public dead-letter read API for IR-9 | NO-OP | No shipped documentation delta beyond the range summary. |
| `0fc08220` docs(plans): plan configurable CORS support for IR-11 | NO-OP | No shipped documentation delta beyond the range summary. |
| `07cd034a` chore(seihou): apply exec-plan and master-plan module updates | NO-OP | No shipped documentation delta beyond the range summary. |

## pgmq-hs

Project `mori://shinzui/pgmq-hs`: `590a46f3..8fff5fb1` (41 commits).

PGMQ 1.12/1.13 support, grouped heads, premake, metrics, migrations, and effectful-core 2.7 support.

| Commit and change | Action | Documentation result |
| --- | --- | --- |
| `b9988295` chore(.seihou): add origin tracking to module manifest | NO-OP | No shipped documentation delta beyond the range summary. |
| `6b8587b2` chore(agents): apply seihou exec-plan and master-plan modules | NO-OP | No shipped documentation delta beyond the range summary. |
| `49216529` chore(nix): adopt nix-haskell-flake seihou module at v0.16.0 | NO-OP | No shipped documentation delta beyond the range summary. |
| `84404745` docs(claude): trim CLAUDE.md to non-obvious guidance | NO-OP | No shipped documentation delta beyond the range summary. |
| `c4ecde8b` chore(mori): adopt typed dependency refs at package grain | NO-OP | No shipped documentation delta beyond the range summary. |
| `7956160d` chore: reformat Cabal files with nix fmt | NO-OP | No shipped documentation delta beyond the range summary. |
| `35105fa7` docs(plans): expand PGMQ support to 1.12 and 1.13 | NO-OP | No shipped documentation delta beyond the range summary. |
| `52897ccd` docs(plans): correct model attribution to gpt-6-astra | NO-OP | No shipped documentation delta beyond the range summary. |
| `df43accc` chore(mori): drop the readme DocRef from the manifest | NO-OP | No shipped documentation delta beyond the range summary. |
| `8d2553fe` feat(mori): record release facts from version tags | UPDATE | Reflected in pgmq-hs 0.6 API, schema, migration, or compatibility coverage. |
| `4873c993` chore(mori): repair the mori-schema pin to the embedded commit | NO-OP | No shipped documentation delta beyond the range summary. |
| `36fd41fe` chore(okf): repin the improvement-request profile to v0.12.0 | NO-OP | No shipped documentation delta beyond the range summary. |
| `5d58892b` Squashed 'vendor/pgmq/' changes from ae5d34e..32c075b | NO-OP | No shipped documentation delta beyond the range summary. |
| `91370481` chore(vendor): update PGMQ to v1.13.0 | NO-OP | No shipped documentation delta beyond the range summary. |
| `c8b9c2b1` chore(skills): update planning modules to 0.10.0 | NO-OP | No shipped documentation delta beyond the range summary. |
| `1e47b0a9` feat(migration): upgrade native PGMQ to 1.13 with partition recovery | UPDATE | Reflected in pgmq-hs 0.6 API, schema, migration, or compatibility coverage. |
| `8888b9b5` chore(test): preserve byte-exact upstream fixture whitespace | NO-OP | No shipped documentation delta beyond the range summary. |
| `b756f7e7` feat(hasql): add grouped heads and PGMQ 1.13 partition APIs | UPDATE | Reflected in pgmq-hs 0.6 API, schema, migration, or compatibility coverage. |
| `5bc31fa5` docs(plans): complete EP-10 validation and handoff | NO-OP | No shipped documentation delta beyond the range summary. |
| `3d329bb6` feat(config)!: expose grouped heads and creation-time premake through effects | UPDATE | Reflected in pgmq-hs 0.6 API, schema, migration, or compatibility coverage. |
| `1b638faf` docs: complete EP-11 and record the release handoff | UPDATE | Reflected in pgmq-hs 0.6 API, schema, migration, or compatibility coverage. |
| `a9e0790c` feat!: prepare pgmq 0.6 grouped reads and partition controls | UPDATE | Reflected in pgmq-hs 0.6 API, schema, migration, or compatibility coverage. |
| `3cad647a` docs(plans): reconcile hardening with PGMQ 1.12 and 1.13 | NO-OP | No shipped documentation delta beyond the range summary. |
| `1119ce85` docs: complete pgmq 0.6 release candidate acceptance | UPDATE | Reflected in pgmq-hs 0.6 API, schema, migration, or compatibility coverage. |
| `7269f4de` chore: release 0.6.0.0 | UPDATE | Reflected in pgmq-hs 0.6 API, schema, migration, or compatibility coverage. |
| `7a316b81` fix(nix): provide git in the dev shell | UPDATE | Reflected in pgmq-hs 0.6 API, schema, migration, or compatibility coverage. |
| `f2122c4f` docs(release): require a GitHub release for every version | UPDATE | Reflected in pgmq-hs 0.6 API, schema, migration, or compatibility coverage. |
| `2902f19a` docs(plans): own the FIFO ordering, index, and retention findings relocated from keiro | NO-OP | No shipped documentation delta beyond the range summary. |
| `cad63d9d` chore(nix): migrate nix-haskell-flake 0.16.0 -> 0.21.0 | NO-OP | No shipped documentation delta beyond the range summary. |
| `2ae22674` docs: validate FIFO ordering and retention plans against repository | NO-OP | No shipped documentation delta beyond the range summary. |
| `8a704c33` docs: align FIFO plans with upstream SQL ownership | NO-OP | No shipped documentation delta beyond the range summary. |
| `562b32e3` build!: support effectful-core 2.7 and drop 2.5 | UPDATE | Reflected in pgmq-hs 0.6 API, schema, migration, or compatibility coverage. |
| `d73ec202` build(nix): pin effectful-core 2.7.1.2 and run the effectful tests | UPDATE | Reflected in pgmq-hs 0.6 API, schema, migration, or compatibility coverage. |
| `494fabbb` docs: record the supported effectful-core range | NO-OP | No shipped documentation delta beyond the range summary. |
| `973faa62` docs(adr): record the dependency bound and Nix pin policy | NO-OP | No shipped documentation delta beyond the range summary. |
| `928746e8` chore(nix): migrate nix-haskell-flake to 0.24.0 | NO-OP | No shipped documentation delta beyond the range summary. |
| `c4fc316f` test: pin ephemeral clusters to a stable temporary root | NO-OP | No shipped documentation delta beyond the range summary. |
| `d7ecc8b9` build: adopt ephemeral-pg 0.3.1.0 and key the temporary root by uid | NO-OP | No shipped documentation delta beyond the range summary. |
| `163413b3` Release 0.6.1.0 | UPDATE | Reflected in pgmq-hs 0.6 API, schema, migration, or compatibility coverage. |
| `d023daa3` docs(plans): plan the follow-ups to the 0.4.0.1..0.6.1.0 review | NO-OP | No shipped documentation delta beyond the range summary. |
| `8fff5fb1` docs(reviews): record the v0.4.0.1..v0.6.1.0 review as REV-1 through REV-5 | NO-OP | No shipped documentation delta beyond the range summary. |

## shibuya-kafka-adapter

Project `mori://shinzui/shibuya-kafka-adapter`: `28625bea..6c0cd3fc` (6 commits).

Effectful-core 2.7 build compatibility; no runtime API change.

| Commit and change | Action | Documentation result |
| --- | --- | --- |
| `ec2d4399` chore(seihou): track module origins and bump manifest version | NO-OP | No shipped documentation delta beyond the range summary. |
| `d7b5bf0c` chore(seihou): apply exec-plan and master-plan scaffolding | NO-OP | No shipped documentation delta beyond the range summary. |
| `a858476e` chore(nix): migrate nix-haskell-flake to 0.24.0 | NO-OP | No shipped documentation delta beyond the range summary. |
| `2904fffc` style: reformat with fourmolu and cabal-gild | NO-OP | No shipped documentation delta beyond the range summary. |
| `fe684fd5` refactor(mori): migrate dependencies to typed package-grained refs | NO-OP | No shipped documentation delta beyond the range summary. |
| `6c0cd3fc` build(deps): support effectful-core 2.7 | UPDATE | Reflected in released-version and effectful-core 2.7 compatibility coverage. |

## shibuya-kiroku-adapter

Project `mori://shinzui/kiroku`: `7051b123..07cd034a` (11 commits).

Shared Kiroku range; no adapter source change.

| Commit and change | Action | Documentation result |
| --- | --- | --- |
| `70b7661f` chore: apply seihou exec-plan and master-plan provenance scaffolding | NO-OP | No shipped documentation delta beyond the range summary. |
| `ac8b7508` docs(plans): adopt performance and design review decisions for MasterPlan 12 | NO-OP | No shipped documentation delta beyond the range summary. |
| `579451dc` docs(plans): apply MasterPlan 11 second review with provenance | NO-OP | No shipped documentation delta beyond the range summary. |
| `44d3e197` docs(plans): adopt 1.0 API conventions for MasterPlan 12 and add ADR-8 | NO-OP | No shipped documentation delta beyond the range summary. |
| `6a1f397f` docs(plans): plan durable subscription checkpoints over HTTP | NO-OP | No shipped documentation delta beyond the range summary. |
| `e118094b` docs(improvement-requests): accept IR-10 and link it to ExecPlan 87 | NO-OP | No shipped documentation delta beyond the range summary. |
| `09b70053` docs(plans): plan the REST browse read API for IR-8 | NO-OP | No shipped documentation delta beyond the range summary. |
| `4a1b98a4` docs(adr): record HTTP and WebSocket wire-format stability in ADR-9 | NO-OP | No shipped documentation delta beyond the range summary. |
| `c34a5f97` docs(plans): plan the public dead-letter read API for IR-9 | NO-OP | No shipped documentation delta beyond the range summary. |
| `0fc08220` docs(plans): plan configurable CORS support for IR-11 | NO-OP | No shipped documentation delta beyond the range summary. |
| `07cd034a` chore(seihou): apply exec-plan and master-plan module updates | NO-OP | No shipped documentation delta beyond the range summary. |

## shibuya-pgmq-adapter

Project `mori://shinzui/shibuya-pgmq-adapter`: `1d882238..392f7545` (7 commits).

pgmq-hs 0.6 adoption and strict HeadPerGroup FIFO reads.

| Commit and change | Action | Documentation result |
| --- | --- | --- |
| `2b67a65d` chore(deps): adopt pgmq 0.6 release candidate | UPDATE | Reflected in strict grouped-head FIFO and compatibility coverage. |
| `22f5c4da` chore(release): 0.15.0.0 | UPDATE | Reflected in strict grouped-head FIFO and compatibility coverage. |
| `b2b98609` feat(pgmq)!: add grouped-head FIFO polling | UPDATE | Reflected in strict grouped-head FIFO and compatibility coverage. |
| `e10355a5` test(pgmq): prove grouped-head FIFO semantics | UPDATE | Reflected in strict grouped-head FIFO and compatibility coverage. |
| `1900911a` bench(pgmq): measure safe grouped-head drains | UPDATE | Reflected in strict grouped-head FIFO and compatibility coverage. |
| `7472c776` chore(release): prepare 0.16.0.0 | UPDATE | Reflected in strict grouped-head FIFO and compatibility coverage. |
| `392f7545` docs(plan): complete grouped-head adapter release | UPDATE | Reflected in strict grouped-head FIFO and compatibility coverage. |

## shibuya

Project `mori://shinzui/shibuya`: `bf2cff1e..cb3c4a9a` (7 commits).

Effectful-core 2.7 compatibility and 0.9.0.1 release; no public API change.

| Commit and change | Action | Documentation result |
| --- | --- | --- |
| `04f2c6b2` build(deps): support effectful 2.7 | UPDATE | Reflected in released-version and effectful-core 2.7 compatibility coverage. |
| `104bb049` chore(manifest): add origin tracking to seihou modules | NO-OP | No shipped documentation delta beyond the range summary. |
| `28ddf897` chore(agents): apply seihou exec-plan and master-plan modules | NO-OP | No shipped documentation delta beyond the range summary. |
| `43e478e3` chore(nix): adopt seihou nix-haskell-flake module | NO-OP | No shipped documentation delta beyond the range summary. |
| `a7f78930` chore(release): 0.9.0.1 | UPDATE | Reflected in released-version and effectful-core 2.7 compatibility coverage. |
| `a32eabdc` docs(plan): plan the removal of the idle linked master loop | NO-OP | No shipped documentation delta beyond the range summary. |
| `cb3c4a9a` docs(plans): add post-0.9 review remediation master plan and three child exec plans | NO-OP | No shipped documentation delta beyond the range summary. |
