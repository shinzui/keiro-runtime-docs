# Source sync — 2026-10-02

This ledger reviews 122 distinct upstream commits across six repositories. Kiroku and its Shibuya adapter have separate pointers and share the same 26-commit range. Review committed source only; all six worktrees were clean. Language 6 remains the only supported DSL language.

## Review boundaries

| Project | Previous commit | Reviewed commit | Commits |
| --- | --- | --- | --- |
| `mori://shinzui/keiro` | `c68dbdd7d1a76a67212067012dcf2321efba1e11` | `945529d46fd2967994270eb94e22c80908df4d14` | 39 |
| `mori://shinzui/kiroku` | `246a27b6e7ac55fbd7c7a66e8ad84a3b3f46237e` | `36b75510220393b9791d9167ca7817f22fbc848b` | 26 |
| `mori://shinzui/shibuya` | `efbe2a87268a759e825f388e238343a83badd6da` | `02cf260604341c1a4e3a22a62fbf67d3c715f81c` | 20 |
| `mori://shinzui/shibuya-kafka-adapter` | `74fed7e8df366072b0587c4bdae8d4e92317c8a3` | `c04758990927bbda6d0616ae9609c263ec73758b` | 17 |
| `mori://shinzui/shibuya-pgmq-adapter` | `9c709d76b8c1e66a45148888970d5518cc3c0d7e` | `65af8ed8cd8a0ff7a89682346c3769f088a64732` | 6 |
| `mori://shinzui/pgmq-hs` | `8fff5fb154a754252116c1a8c3ff1c6cd3b6e25e` | `f4bdd91437ccf9c1981983fb1c6fd99dcc3c10f6` | 14 |

## Release and scope decisions

Verify published package versions with the Hackage package JSON endpoints and upstream release tags. Use Keiro 0.19.0.0, Kiroku store 0.9.0.1 / migrations 0.6.0.0, Shibuya 0.10.0.0, PGMQ family 0.6.1.1, and the corresponding released adapters. The PGMQ inspection reads and disconnect classification changes landed after the 0.6.1.1 release. Document those changes under explicit unreleased sections; do not add them to the installation package set.

No public Keiro DSL source changed in this range. The Language 6 requirement and refreshed terminology were already applied by the release-writing pass. Do not restore retired example-app or older-language pages. Browser inspection/control, runtime HTTP/live feeds, consumer-group lifetime guards, version-aware DSL linting, client-side job long polling, outbox claim-generation fencing, and tracing/correlation changes remain plans or requests. Do not describe them as implemented.

## Commit classification

### `mori://shinzui/keiro`

| Commit and change | Kind | Action | Documentation |
| --- | --- | --- | --- |
| `366b978c` docs(ir): request version-aware DSL linting | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `2241a0be` docs: plan checked DSL source upgrades and fleet planning | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `fd7a09e7` docs(plan): rescope source upgrades to a tested check-and-diff recipe | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `e3d90afb` docs(ir): narrow IR-48 linting to Languages 5 and 6 | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `c6f59db2` feat(okf): bootstrap bug report bundle | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `bc4537f9` docs(okf): file Keiro runtime heap reports | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `4b102c2d` docs(plans): plan heap-retention attribution and fixes for BUG-1 and BUG-2 | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `64063b10` docs(okf): record job queue worker defects | Reported job-worker defects | UPDATE | Job polling limitations; fixes remain planned |
| `f48a5114` docs(keiro): report shard count mismatch poisoning | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `f2292e32` docs(improvement-requests): file IR-50 on diff classification of removed command and event | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `f6a37412` docs(outbox): report stale publisher finalization race | Reported stale outbox finalization | UPDATE | Outbox claim ownership limitation |
| `9d13a5de` docs: report long-poll runtime pool starvation | Reported long-poll pool starvation | UPDATE | Job/adapter operations; recommend PollEvery control |
| `53dc3d9a` docs: report missing process span for pre-handler dead letter | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `b565982d` docs(plans): refine heap retention attribution | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `ca651686` chore(deps): upgrade event store and migration cohort | Dependency cohort | UPDATE | Compatibility, installation, migration composition |
| `c33a9b69` test(retention): add post-major heap probe and baseline | Runtime regression gate | UPDATE | PostgreSQL fixture: upstream retention and re-export verification |
| `b62ac7b1` test(retention): add isolated store and worker legs | Runtime regression gate | UPDATE | PostgreSQL fixture: upstream retention and re-export verification |
| `8e5de54f` test(retention): gate isolated worker heap trends | Runtime regression gate | UPDATE | PostgreSQL fixture: upstream retention and re-export verification |
| `8094e423` docs(retention): attribute worker heap growth to Kiroku publisher | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `dc1f7606` docs(plan): connect command soak to Kiroku publisher retention | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `57997fd8` test(retention): isolate command heap across long histories | Runtime regression gate | UPDATE | PostgreSQL fixture: upstream retention and re-export verification |
| `dc22e893` fix(command): bound sampled snapshot verification per process | Command option and metrics | UPDATE | Command, snapshot, telemetry, read-side walkthrough, snapshot how-tos |
| `0cf34a73` fix(deps): require released Kiroku retention fix | Retention fix required | UPDATE | Compatibility and command operations |
| `b3a7778d` chore: stop tracking Python bytecode | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `648c18d4` chore(release): 0.19.0.0 | Published release | UPDATE | Compatibility, installation, package references |
| `2d7eb940` docs(improvement-requests): file IR-51 on explicit timer fire outcomes | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `6b9f5b38` docs(research): evaluate recursion schemes in keiro-dsl | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `451b885b` docs(dsl): document candidate Language 6 in the DSL reference | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `c76797aa` docs(dsl): split the DSL reference into topic pages | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `c904c410` docs(dsl): drop deprecated Languages 1-4 from user docs and guides | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `621cca26` docs(keiro-dsl-authoring): adopt Language 6 as the required language version | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `0d43f401` docs(plans): plan the outbox claim-generation fence for BUG-5 | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `9cdcc2e2` docs(plans): plan client-side long polling for job workers to fix BUG-4 and BUG-6 | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `4dec23a5` docs(bug-reports): record accurate status and plan coverage | Accurate current defect status | UPDATE | Current limitations; do not claim planned fixes |
| `e5bf80a3` docs(plans): plan tracing pre-handler dead letters on the continuous job worker to fix BUG-7 | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `9ba732e0` docs(bug-reports): track BUG-7 with ExecPlan 301 | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `35d88961` docs(masterplans): coordinate the keiro-ui inspection surface cohort as MasterPlan 45 | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `1c2bcabe` docs(improvement-requests): add IR-52 for correlation and causation id threading | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `945529d4` docs(terminology): adopt simplified technical definitions | Terminology already synchronized in dcd7cfc | NO-OP | Glossary snapshot and approved technical terms already match |

### `mori://shinzui/kiroku`

| Commit and change | Kind | Action | Documentation |
| --- | --- | --- | --- |
| `d4b7a422` test(release): add Kiroku delivery identity ledger | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `407cb223` test(release): externalize Kiroku delivery ledger | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `c96194c4` fix(release): isolate lifecycle fixture from adapter sdist | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `2fb35349` docs(improvement-requests): file IR-15 for a lifetime-held consumer-group guard | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `0a15b006` docs(kiroku): request prompt publisher retries after pool errors | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `12d50d5a` docs(bug-reports): report partitioned category reads scanning every stream (BUG-2) | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `6c6b1589` docs(plans): plan the evaluation and fix of BUG-2 partitioned category reads | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `4b065940` chore(build): drop codd and resolve pinned companions from Hackage | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `58a79daa` test(bench): measure category reads against category stream count (BUG-2) | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `3da3b4f1` feat(migrations): denormalize category onto $all junction rows (0012) | Schema migration 0012 and SQL codec exports | UPDATE | Kiroku schema and store references, database preparation, Keiro deploy ordering |
| `35c8eeac` fix(store): serve category reads from the $all category index (BUG-2) | Category index reads and SQL codec exports | UPDATE | Kiroku store reference, subscription explanation and walkthrough |
| `95ee5c5a` chore(release): prepare kiroku-store 0.9.0.0 and kiroku-store-migrations 0.6.0.0 | Release preparation | UPDATE | Schema and category-index reference |
| `94cba285` docs: record the category index for category reads (ADR-10, BUG-2 fixed) | Category-index decision | UPDATE | Schema and category reads |
| `0ef96991` perf(subscription): wake consumer-group category members on their category only | Category member wakeups | UPDATE | Kiroku subscriptions and Shibuya integration |
| `c66a4e83` feat(blueprints): add the kiroku-upgrade 0.8.0.2 -> 0.9.0.0 edge | Schema preparation procedure | UPDATE | Database preparation; retain only current release setup |
| `691c6efe` chore(release): kiroku-store 0.9.0.0, kiroku-store-migrations 0.6.0.0, kiroku-otel 0.2.0.9, kiroku-cli 0.2.0.7, kiroku-metrics 0.1.0.9, shibuya-kiroku-adapter 0.5.1.4 | Published Kiroku cohort | UPDATE | Compatibility, schema, adapter integration |
| `9e876a80` docs(kiroku): report publisher position heap retention | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `69a1a2bb` fix(store): force idle publisher position before TVar write | Idle publisher retention fix | UPDATE | Kiroku subscriptions and compatibility |
| `94e11392` chore(release): publish Kiroku retention fix and dependent patches | Published retention patch cohort | UPDATE | Compatibility and adapter integration |
| `104b5d68` docs(bugs): record Kiroku publisher fix release | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `1bde5575` docs(bugs): note schema cutover for Kiroku retention fix | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `8713dad1` docs(kiroku): request adapter member guard | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `dd2ad473` docs: record fixed Kiroku adapter acquisition defect | Acquisition defect already fixed | UPDATE | Kiroku adapter lifecycle ownership |
| `bc244a86` docs(plans): plan the lifetime member guard and its Shibuya adapter exposure | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `d83cdc20` docs(masterplans): coordinate the keiro-ui inspection surface cohort as MasterPlan 13 | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `36b75510` docs(improvement-requests): cite MasterPlan 13 from IR-9, IR-10, and IR-11 | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |

### `mori://shinzui/shibuya`

| Commit and change | Kind | Action | Documentation |
| --- | --- | --- | --- |
| `359ddf9b` fix(release): close candidate assurance gaps | Published lifecycle/metrics surface | UPDATE | Shibuya references, explanations, how-tos, walkthroughs, recipes, FAQ |
| `e28a9589` perf(core): amortize keyed scheduler masking | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `f3de2cdb` docs(release): assemble exact RC2 assurance dossier | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `694daf72` docs(release): approve RC2 for publication | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `e44caa43` docs(release): record lifecycle cohort publication | Cohort publication | UPDATE | Remove candidate notices from Shibuya and all supported adapters |
| `2ed6ef93` docs(masterplan): refresh MP5 to published state | Published dependency exclusion | UPDATE | Compatibility and adapter bounds |
| `d5e7c342` docs(metrics): report transient handler readiness failure | Known readiness limitation | UPDATE | Health reference and operational guidance |
| `3ceebeaa` docs(metrics): cite sealed IR-7 reproductions | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `49040a1c` docs(metrics): request a separate retry decision count | Retry counter semantics | UPDATE | Metrics reference retains processed/retry distinction |
| `8de4f878` docs(metrics): cite sealed retry-counter observations | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `43fbcee7` docs(shibuya): report late finalization after forced stop | Known forced-stop limitation | UPDATE | Shutdown reference, how-to and walkthrough |
| `d2487c53` docs(bug-reports): record duplicate processor ID handle loss | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `35d00403` docs(bug-reports): record historical concurrency bound violation | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `e119503e` docs(bug-reports): record historical idle halt hang | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `f46ef7ce` docs(bug-reports): record historical finalizer failure masking | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `4d6d749f` docs(bug-reports): record historical shutdown cleanup loss | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `da47da6c` docs(bug-reports): record historical false health responses | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `496d6083` docs(bug-reports): record historical WebSocket defects | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `5789b0ff` docs(bug-reports): record evidence-backed status review | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `02cf2606` docs(plan): plan the browser-ready inspection and control surface | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |

### `mori://shinzui/shibuya-kafka-adapter`

| Commit and change | Kind | Action | Documentation |
| --- | --- | --- | --- |
| `6d0b15de` test(release): add Kafka delivery identity ledger | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `adadf9f5` test(release): externalize Kafka delivery ledger | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `f4fe97f1` docs(kafka): report buffered retry commit stall | Reported current adapter limitations | UPDATE | Kafka integration: distinguish reports from implemented recovery |
| `0f19f929` docs(kafka): report buffered successor order inversion | Reported current adapter limitations | UPDATE | Kafka integration: distinguish reports from implemented recovery |
| `ea5963d3` docs(kafka): add batch size control to ordering report | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `73bd3e65` docs(kafka): report adapter exit after broker restart | Reported current adapter limitations | UPDATE | Kafka integration: distinguish reports from implemented recovery |
| `62fc5719` docs(kafka): confirm broker restart failure with rebalance handler | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `d6e2417d` docs(kafka): report adapter exits during group rebalance | Reported current adapter limitations | UPDATE | Kafka integration: distinguish reports from implemented recovery |
| `5339857a` docs(kafka): add network partition reproduction to rebalance report | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `0d559b16` docs(kafka): report seek barrier overwrite data loss | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `bef1328f` docs(kafka): report rebalance offset order reversal | Reported current adapter limitations | UPDATE | Kafka integration: distinguish reports from implemented recovery |
| `bdcc2955` docs(kafka): mark seek barrier overwrite report fixed in 0.9.1.0 | Seek barrier fixed in published cohort | UPDATE | Kafka acknowledgment recovery contract |
| `c68204c9` docs(kafka): report slow finalization of a caught-up consumer | Reported current adapter limitations | UPDATE | Kafka integration: distinguish reports from implemented recovery |
| `596ea317` docs: plan the buffered-retry commit stall and ordering fixes | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `eebd4286` docs: plan a consumer-queue drain that never blocks under the lock | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `d3da5152` docs(mori): track the missing hw-kafka-client queue notification | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `c0475899` docs(kafka): confirm the buffered-retry stall and ordering reports | Buffered-retry stalls/order defects | UPDATE | Kafka adapter limitations; fixes remain planned |

### `mori://shinzui/shibuya-pgmq-adapter`

| Commit and change | Kind | Action | Documentation |
| --- | --- | --- | --- |
| `4825d18a` test(release): add PGMQ delivery identity ledger | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `6ce44abb` test(release): externalize PGMQ delivery ledger | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `beb8a04e` docs(pgmq): report long-poll acknowledgement starvation | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `290c762c` docs(pgmq): confirm acknowledgement starvation on 0.16.1.0 | Long-poll starvation in released adapter | UPDATE | PGMQ adapter limitations |
| `663bc4c4` docs: record fixed acknowledgement and dead-letter defects | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `65af8ed8` docs(pgmq): record BUG-4 and document BUG-1 root cause with fix plan | Current adapter defects | UPDATE | PGMQ adapter limitations |

### `mori://shinzui/pgmq-hs`

| Commit and change | Kind | Action | Documentation |
| --- | --- | --- | --- |
| `f794786b` docs(pgmq): request retryable disconnect classification | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `a572abdb` docs(pgmq): request safe concurrent reconciliation reports | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `7babd46a` docs(okf): request a deadline for blackholed PGMQ calls | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `081dc8b0` docs(pgmq): record verified runtime defects | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `cf569c55` build: adopt pg-migrate 1.2 and pin every test cluster to the stable root | Migration dependency family | UPDATE | PGMQ schema reference and fixture setup |
| `696b6bd2` Release 0.6.1.1 | Published 0.6.1.1 | UPDATE | PGMQ package references and compatibility |
| `e16c43d2` docs(plans): plan the transient classification fix for receive-side disconnects | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `a00fcebd` docs(plans): add isAmbiguousReply and bounded sticky retry guidance to plan 26 | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `c4f3148d` docs(plans): plan the queue inspection reads, JSON codecs, and pgmq-inspect surface | Evidence, tests, build metadata, or unimplemented intent | NO-OP | No exported behavior change; retain the implementation boundary above |
| `83e3c737` fix(pgmq-effectful): classify receive-side disconnects as transient | Unreleased disconnect classification | UPDATE | Effectful API and transient-error recipe, explicitly unreleased |
| `4360f7ad` docs(pgmq): record the disconnect classification rules and close BUG-1 | Disconnect contract | UPDATE | Effectful API and ambiguous-reply guidance |
| `75d22e4d` feat(hasql): add non-destructive peek, archive, and lookup reads | Unreleased inspection reads | UPDATE | Core types, Hasql API, queue inspection recipe |
| `da41609b` feat(effectful)!: expose the inspection reads through the Pgmq effect | Five new effect constructors | UPDATE | Effectful API, explicitly unreleased |
| `f4bdd914` docs: record the inspection read contract and close IR-1 | Inspection contract | UPDATE | Inspection reference and cursor/non-leasing rules |

## Validation

`nix develop -c pnpm check` passed after the final content edits:

- Six documentation-check tests passed.
- Prose check: 508 pages/templates, zero blocking errors, 2,769 editorial review findings.
- Terminology: the glossary matches all 64 canonical upstream terms.
- Typecheck, lint, formatting, navigation and production build passed. Lint retains four existing warnings in unchanged application code.
- Navigation checked 56 metadata files and 500 pages. Local links checked 500 files with no broken links.
- Checked all 24 added Markdown heading links against their target headings. The static linkinator crawl scans zero links; it does not verify browser anchors.
- Hackage package JSON and upstream release tags confirm the published versions, including `keiro-test-support 0.19.0.0`. The PGMQ inspection and classifier changes are after the published tag.
- The ledger includes every one of the 122 distinct upstream commits exactly once. Seven pointers advance only after the documentation gates pass.

The prose checker is a review aid. Formal ASD-STE100 compliance remains unverified until the official dictionary and rules receive a complete review. Existing editorial findings remain visible; this sync does not waive them.
