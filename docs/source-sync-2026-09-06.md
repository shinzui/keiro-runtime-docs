# Source sync — 2026-09-06

All ranges below are committed local upstream trees resolved through Mori. Release choices were
checked against Hackage preferred versions and upstream release tags. The shared Kiroku repository
is reviewed separately for its store and adapter pointers: 111 distinct commits, 138 pointer-range
commit reviews. No pages retired; three runbooks added. The example-app re-port closes the
previously deferred source-tour gap without upgrading the application dependencies.

## Page accounting

Counts cover MDX pages, including section indexes. Shared compatibility is one additional updated
page. The adapter's two Kiroku pages overlap the Kiroku count and must not be summed twice.
Total: 3 pages added, 64 updated, 0 retired; navigation metadata updated separately.

| Library | Commits reviewed | Added | Updated | Retired |
| --- | ---: | ---: | ---: | ---: |
| Keiki | 9 | 0 | 3 | 0 |
| Keiro | 46 | 2 | 21 | 0 |
| Kiroku | 27 | 1 | 8 | 0 |
| Example app | 20 | 0 | 30 | 0 |
| Shibuya–Kiroku adapter | 27 | 0 | 3 (2 shared) | 0 |
| pg-migrate | 4 | 0 | 0 | 0 |
| pgmq-hs | 2 | 0 | 0 | 0 |
| Shibuya | 1 | 0 | 0 | 0 |
| Shibuya–PGMQ adapter | 1 | 0 | 0 | 0 |
| Shibuya–Kafka adapter | 1 | 0 | 0 | 0 |
| Shibuya–Message DB adapter (already current) | 0 | 0 | 0 | 0 |

## Verification

Link/navigation checks, typecheck and production build passed before pointer advancement.
Rendered anchors and stale spellings were checked separately. Application examples were read
against committed source; no live service/database reset or Haskell application test run is claimed.

## keiki

Project `mori://shinzui/keiki`: `04296a74..97d8b07e` (9 commits).

Plan/proof tests, review profiles and release documentation add no further public API. Arbitrary finite carriers remain unsupported; only standard Bool is admitted.

| Commit and change | Action | Documentation result |
| --- | --- | --- |
| `92bd43d0` docs(improvement-requests): request disjointness proof over Bool registers | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `a9cd105f` docs(plan): specify exact Bool inversion proof | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `457189fa` test(replay): pin Bool candidate proof baseline | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `fce28321` feat(validation): prove disjoint Bool candidates | UPDATE | Default exact Bool candidate proof → validation reference and replay explanation |
| `601da5ac` test(validation): exhaust Bool candidate relations | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `4f28b73f` docs(validation): define exact Bool proof boundary | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `f359475f` docs(plan): complete exact Bool inversion proof | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `15bc83b1` chore(release): 0.9.1.0 | UPDATE | Released 0.9.1 cohort → compatibility and pointer versions |
| `97d8b07e` docs(okf): bootstrap review profile | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |

## keiro-runtime-jitsurei

Project `mori://shinzui/keiro-runtime-jitsurei`: `04420ed1..e3c800eb` (20 commits).

Plan/archive prose, identity/replay tests and symbolic test additions support the reviewed implementation without new runtime APIs. The dirty .gitignore is excluded. The app remains on its committed July dependency cohort; one-shot PGMQ remote-parent extraction is not claimed. Upstream README still describes the old rpk-container prerequisite, but committed process-compose source now checks the shared broker.

| Commit and change | Action | Documentation result |
| --- | --- | --- |
| `7470f190` fix(hospital-capacity): add keiro-pgmq to service-local cabal.project | UPDATE | Pinned service dependency selections → overview and app baseline |
| `fd1b02bf` feat(tracing): propagate W3C trace context across kafka, commands, and pgmq | UPDATE | W3C propagation and endpoint handling → outbox and telemetry tours |
| `18076e78` test(hospital-capacity): add optional SBV/z3 symbolic transducer verification | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `3e391505` chore(mori): bootstrap mori project identity and package config | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `b192c94a` docs(plans): add ExecPlan 10 — prove keiro-dsl parity on both services | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `8157bf1a` refactor!: build streams via StreamCategory; rename compound saga categories | UPDATE | Category-based stream identity and compound category renames → aggregate/process tours |
| `a98df6f0` docs(observability): add distributed-tracing requirements and trace-link guidance | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `a3c51193` docs(dsl): add consolidated grammar and vertical-slice DSL proofs | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `0cd1bbf0` chore(deps): align the July runtime baseline | UPDATE | Pinned service dependency selections → overview and app baseline |
| `d4558cc2` feat(dsl): capture current service behavior | UPDATE | Permanent specs, generated/hand-owned split, validated runtime, resource lifetime, Eventual models and typed jobs → service tours and ownership overview |
| `f9c8971f` test(dsl): gate scaffold and evolution drift | UPDATE | Permanent specs, generated/hand-owned split, validated runtime, resource lifetime, Eventual models and typed jobs → service tours and ownership overview |
| `a771d877` docs(plan): complete the DSL baseline plan | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `bbf10aee` feat(migrations): compose service-owned pg-migrate plans | UPDATE | Service-owned native migration plans → setup, architecture and wiring |
| `9a263873` feat(incident-command): adopt validated runtime boundaries | UPDATE | Permanent specs, generated/hand-owned split, validated runtime, resource lifetime, Eventual models and typed jobs → service tours and ownership overview |
| `8415cad0` test(incident-command): prove runtime replay safety | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `cc1076b7` feat(hospital-capacity): adopt validated runtime and pgmq jobs | UPDATE | Permanent specs, generated/hand-owned split, validated runtime, resource lifetime, Eventual models and typed jobs → service tours and ownership overview |
| `e2ee5e14` feat(kafka): adopt shibuya application lifecycles | UPDATE | Shibuya runApp lifecycles and durable Kafka poison → consuming and worker chapters |
| `a29f8586` feat(runtime): complete documentation-grade validation | UPDATE | Documentation-grade registration/rebuild/workflow evidence → projections, scenarios, setup and verification |
| `b9bcf3c1` fix(observability): honor OTLP trace endpoint semantics | UPDATE | W3C propagation and endpoint handling → outbox and telemetry tours |
| `e3c800eb` chore(dev): use the shared Redpanda cluster instead of starting one | UPDATE | Shared Redpanda reachability replaces broker lifecycle → setup |

## keiro

Project `mori://shinzui/keiro`: `93ada2d4..de574cdc` (46 commits).

Blueprint publication, Mori metadata, inventory/test gates, release review and prose are doc-neutral after the source-backed changes above. Transition-family diff, aggregate guard classification, mapped-register construction and UI inspection proposals are not shipped. Private generated-language and checked/prepared implementation internals are not public APIs.

| Commit and change | Action | Documentation result |
| --- | --- | --- |
| `16594c50` docs(release): record 0.12.0.0 publication | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `4dba5871` docs(capabilities): reconcile catalog with 0.12 features | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `1f04784d` chore(mori): migrate dependencies to package grain with typed refs | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `92d257ef` chore(mori): realign schema pin with the embedded schema | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `33c557ab` feat(deps)!: adopt kiroku-store 0.8.0.0 and kiroku-store-migrations 0.4.0.0 | UPDATE | Kiroku 0.8 retry classification and migration cohort → command/process-manager references and compatibility |
| `4175ada7` feat(blueprints): publish keiro-upgrade with an entailed kiroku edge | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `1eef4b2f` chore(release): 0.13.0.0 | UPDATE | Kiroku 0.8 retry classification and migration cohort → command/process-manager references and compatibility |
| `898c2944` docs(release): require the entailed upstream edge to be pushed, not just declared | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `15d00486` docs(blueprints): teach the 0.12->0.13 edge about solver-level blockers | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `b0645cd4` docs(okf): file keiro-ui inspection endpoint improvement requests | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `aaaf117c` feat(outbox): add terminal rejection outcome | UPDATE | Terminal outbox rejection and migration 0031 → reference, telemetry, ops, explanation, runbook, ordering and integration tours |
| `c237424a` feat(outbox): persist rejected publication state | UPDATE | Terminal outbox rejection and migration 0031 → reference, telemetry, ops, explanation, runbook, ordering and integration tours |
| `ba1c3676` feat(outbox): integrate rejected publication handling | UPDATE | Terminal outbox rejection and migration 0031 → reference, telemetry, ops, explanation, runbook, ordering and integration tours |
| `a2c93027` feat(outbox): complete terminal rejection rollout | UPDATE | Terminal outbox rejection and migration 0031 → reference, telemetry, ops, explanation, runbook, ordering and integration tours |
| `0bdd4b7d` chore(release): 0.14.0.0 | UPDATE | Terminal outbox rejection and migration 0031 → reference, telemetry, ops, explanation, runbook, ordering and integration tours |
| `ad0c04da` feat(release): publish keiro-test-support and correct the release skill | UPDATE | Published test-support → compatibility |
| `29fea955` docs(okf): request idempotent aggregate guard diffs | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `6466ca71` docs(okf): request a guarded transition that writes a mapped register | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `e33706aa` docs(plan): add transition-family diff plan | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `dee67ecf` docs(plan): add aggregate guard proof plan | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `27398705` docs(okf): review IR-33 and narrow plan 266 to structural guard classification | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `300fd8ad` docs: validate mapped-register construction request | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `919bb7c9` docs(plan-267): add validation gaps and decision log | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `be5377dc` docs(dsl): revive record modernization plan | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `0773172d` test(dsl): freeze record migration inventories | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `fe3f3697` fix(dsl): inventory inline record declarations | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `7b06bc52` feat(dsl): modernize record APIs and generated edition | UPDATE | Concise record APIs, explicit idiomatic-v2 migration, conservative ledger handling, recovery and private checked construction → DSL references and adoption guide |
| `3eb72ea2` fix(dsl): complete idiomatic-v2 consumer migration | UPDATE | Concise record APIs, explicit idiomatic-v2 migration, conservative ledger handling, recovery and private checked construction → DSL references and adoption guide |
| `8a880558` docs(dsl): complete record modernization plan | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `acb9ee6c` docs(user): adopt shared OKF profile | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `1a3bfc26` docs(reviews): record the pre-0.15.0.0 release review | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `2d0ebc9e` docs(plan): add generated-edition gate hardening plan | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `61248a13` docs(plans): retire transferred Kiroku hardening plans | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `aa95a1b2` feat(dsl): gate every pre-current generated edition | UPDATE | Concise record APIs, explicit idiomatic-v2 migration, conservative ledger handling, recovery and private checked construction → DSL references and adoption guide |
| `7fc14af3` feat(dsl): compose legacy scaffold migrations | UPDATE | Concise record APIs, explicit idiomatic-v2 migration, conservative ledger handling, recovery and private checked construction → DSL references and adoption guide |
| `9598d613` feat(dsl): harden edition remediation and recovery | UPDATE | Concise record APIs, explicit idiomatic-v2 migration, conservative ledger handling, recovery and private checked construction → DSL references and adoption guide |
| `7be14128` docs(dsl): document complete idiomatic-v2 adoption gate | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `ab610f72` fix(dsl): keep generated rewriter in code state | UPDATE | Concise record APIs, explicit idiomatic-v2 migration, conservative ledger handling, recovery and private checked construction → DSL references and adoption guide |
| `4f131312` fix(dsl): require combined flags for sidecar-only legacy | UPDATE | Concise record APIs, explicit idiomatic-v2 migration, conservative ledger handling, recovery and private checked construction → DSL references and adoption guide |
| `5ff92aae` docs(review): approve generated edition migration | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `0a74e29b` docs(plan): restore keiro-dsl abstraction boundaries | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `89b89b0a` fix(dsl): restore checked construction boundaries | UPDATE | Concise record APIs, explicit idiomatic-v2 migration, conservative ledger handling, recovery and private checked construction → DSL references and adoption guide |
| `073be11b` refactor(dsl): privatize generated language internals | UPDATE | Concise record APIs, explicit idiomatic-v2 migration, conservative ledger handling, recovery and private checked construction → DSL references and adoption guide |
| `5f5d9c49` test(dsl): add exact compatibility byte proofs | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `42c7eb93` chore(dsl): enforce restored record boundaries | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `de574cdc` chore(release): 0.15.0.0 | UPDATE | Concise record APIs, explicit idiomatic-v2 migration, conservative ledger handling, recovery and private checked construction → DSL references and adoption guide |

## kiroku

Project `mori://shinzui/kiroku`: `b9aecf3a..7051b123` (27 commits).

Build/test cleanup, blueprints, metadata and review prose are doc-neutral. Selective compaction, source-before-$all lock-order redesign, hardening master plans and UI endpoint requests remain unshipped.

| Commit and change | Action | Documentation result |
| --- | --- | --- |
| `7b143cab` docs(improvement-requests): complete IR-3 and IR-4 | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `6660200b` feat(shibuya-kiroku-adapter): upgrade to shibuya-core 0.9.0.0 | UPDATE | ApplicationFailure mapping → adapter reference and walkthrough |
| `a3233c69` test(shibuya-kiroku-adapter): make the consumer-group policy check total | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `da688150` build(shibuya-kiroku-adapter): fail the build on incomplete pattern matches | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `216c7aec` build: -Wall -Werror=incomplete-patterns in every package | UPDATE | Defensive Retrying worker arm → worker walkthrough; remaining warning cleanup is doc-neutral |
| `aa386138` chore(release): kiroku-store 0.7.0.1 and the -Wall cohort | UPDATE | Released cohort versions → compatibility |
| `2695c1d0` test: clear the remaining -Wall warnings in test and bench sources | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `08d3358a` docs(bug-reports): report the unqualified uuidv7 default in migration 0010 | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `8a49b33a` fix(migrations)!: resolve uuidv7 through the kiroku schema | UPDATE | Corrected 0010, forward 0011 and checksum fixup → schema reference and recovery guide |
| `87f74483` test(migrations): cover upgrades of already-bootstrapped databases | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `7b64e2fe` docs: record the BUG-1 fix and the kiroku.uuidv7 rule | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `7c8f2dac` chore(release): kiroku-store-migrations 0.4.0.0 | UPDATE | Released cohort versions → compatibility |
| `ce55dfc4` build: add PostgreSQL 17 and 18 acceptance shells | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `0de2717a` test(migrations): pin the uuidv7 route to the running major | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `bbce9be5` fix(store)!: type transient transaction failures as retryable | UPDATE | Typed transaction aborts and surviving fresh-stream deadlocks → core/store references |
| `13599d99` fix(store): correct the multi-stream deadlock claim and its test | UPDATE | Typed transaction aborts and surviving fresh-stream deadlocks → core/store references |
| `8ff6c07a` docs(improvement-requests): add IR-7 for source-before-$all lock order | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `239f60f1` chore(release): prepare kiroku-store 0.8.0.0 | UPDATE | Released cohort versions → compatibility |
| `7726d230` chore(release): kiroku-otel 0.2.0.7, kiroku-cli 0.2.0.6, kiroku-metrics 0.1.0.8, shibuya-kiroku-adapter 0.5.1.1 | UPDATE | Released cohort versions → compatibility |
| `b89670c3` feat(blueprints): publish kiroku-upgrade as an entailable cohort blueprint | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `c2d0328b` refactor(mori): migrate dependencies to typed package-grained refs | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `8f03c19e` docs(okf): add UI endpoint improvement requests from keiro-ui | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `2cfd10a8` docs: request selective event compaction | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `146533ab` docs(plans): add MasterPlan 11 for manifest-driven selective event compaction | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `bf738397` docs(plans): adopt Kiroku hardening master plan | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `ebd69b88` docs(okf): bootstrap review bundle | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `7051b123` docs(plans): address MasterPlan 11 pre-implementation review findings | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |

## pg-migrate

Project `mori://shinzui/pg-migrate`: `f39d64e3..8a528b67` (4 commits).

All four commits change Seihou manifests, development module pins and agent skill instructions; no library source, migrations or runtime API changed.

| Commit and change | Action | Documentation result |
| --- | --- | --- |
| `188a2229` chore(manifest): add origin tracking to seihou modules | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `356933e4` chore(seihou): update manifest for master-plan module | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `41c41736` chore(seihou): sync exec-plan skill with ADR workflow guide | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `8a528b67` chore(seihou): update nix-haskell-flake to 0.13.2 and exec-plan to 0.8.0 | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |

## pgmq-hs

Project `mori://shinzui/pgmq-hs`: `9ee9a2f3..590a46f3` (2 commits).

Only OKF registration, documentation checks and proposed non-destructive inspection/JSON/HTTP-WebSocket endpoints changed. None of those proposals is shipped.

| Commit and change | Action | Documentation result |
| --- | --- | --- |
| `32b3c1e4` docs(okf): bootstrap the improvement-requests bundle | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
| `590a46f3` docs(okf): add UI inspection improvement requests from keiro-ui | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |

## shibuya-kafka-adapter

Project `mori://shinzui/shibuya-kafka-adapter`: `89e8026b..28625bea` (1 commit).

Static membership deployment work is a plan, not implemented consumer behavior.

| Commit and change | Action | Documentation result |
| --- | --- | --- |
| `28625bea` docs: plan Kafka static membership deployments | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |

## shibuya-kiroku-adapter

Project `mori://shinzui/kiroku`: `b9aecf3a..7051b123` (27 commits).

Build/test cleanup, blueprints, metadata and review prose are doc-neutral. Selective compaction, source-before-$all lock-order redesign, hardening master plans and UI endpoint requests remain unshipped.

| Commit and change | Action | Documentation result |
| --- | --- | --- |
| `7b143cab` docs(improvement-requests): complete IR-3 and IR-4 | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `6660200b` feat(shibuya-kiroku-adapter): upgrade to shibuya-core 0.9.0.0 | UPDATE | Structured ApplicationFailure translation → integration page and adapter walkthrough |
| `a3233c69` test(shibuya-kiroku-adapter): make the consumer-group policy check total | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `da688150` build(shibuya-kiroku-adapter): fail the build on incomplete pattern matches | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `216c7aec` build: -Wall -Werror=incomplete-patterns in every package | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `aa386138` chore(release): kiroku-store 0.7.0.1 and the -Wall cohort | UPDATE | Shibuya 0.9 adapter cohort → compatibility |
| `2695c1d0` test: clear the remaining -Wall warnings in test and bench sources | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `08d3358a` docs(bug-reports): report the unqualified uuidv7 default in migration 0010 | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `8a49b33a` fix(migrations)!: resolve uuidv7 through the kiroku schema | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `87f74483` test(migrations): cover upgrades of already-bootstrapped databases | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `7b64e2fe` docs: record the BUG-1 fix and the kiroku.uuidv7 rule | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `7c8f2dac` chore(release): kiroku-store-migrations 0.4.0.0 | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `ce55dfc4` build: add PostgreSQL 17 and 18 acceptance shells | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `0de2717a` test(migrations): pin the uuidv7 route to the running major | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `bbce9be5` fix(store)!: type transient transaction failures as retryable | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `13599d99` fix(store): correct the multi-stream deadlock claim and its test | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `8ff6c07a` docs(improvement-requests): add IR-7 for source-before-$all lock order | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `239f60f1` chore(release): prepare kiroku-store 0.8.0.0 | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `7726d230` chore(release): kiroku-otel 0.2.0.7, kiroku-cli 0.2.0.6, kiroku-metrics 0.1.0.8, shibuya-kiroku-adapter 0.5.1.1 | UPDATE | Kiroku Store 0.8 bound → compatibility |
| `b89670c3` feat(blueprints): publish kiroku-upgrade as an entailable cohort blueprint | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `c2d0328b` refactor(mori): migrate dependencies to typed package-grained refs | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `8f03c19e` docs(okf): add UI endpoint improvement requests from keiro-ui | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `2cfd10a8` docs: request selective event compaction | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `146533ab` docs(plans): add MasterPlan 11 for manifest-driven selective event compaction | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `bf738397` docs(plans): adopt Kiroku hardening master plan | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `ebd69b88` docs(okf): bootstrap review bundle | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |
| `7051b123` docs(plans): address MasterPlan 11 pre-implementation review findings | NO-OP | Other store/package work is outside the adapter surface; remaining docs/tests/build metadata add no adapter behavior. |

## shibuya-pgmq-adapter

Project `mori://shinzui/shibuya-pgmq-adapter`: `fee9b3a8..1d882238` (1 commit).

Only proposed adapter inspection endpoints changed; no adapter runtime or API changed.

| Commit and change | Action | Documentation result |
| --- | --- | --- |
| `1d882238` docs(okf): file keiro-ui inspection improvement requests | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |

## shibuya

Project `mori://shinzui/shibuya`: `7158f3e1..bf2cff1e` (1 commit).

Only proposed metrics/inspection HTTP-WebSocket endpoint work changed; no worker runtime or API changed.

| Commit and change | Action | Documentation result |
| --- | --- | --- |
| `bf2cff1e` docs(okf): file keiro-ui inspection improvement requests | NO-OP | No additional shipped public behavior; source changes or unshipped intent are accounted for in the range note above. |
