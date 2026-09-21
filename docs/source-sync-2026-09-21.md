# Source sync ledger — 2026-09-21

Review frozen committed heads; no upstream working-tree edits are included. Actions below distinguish published packages from unpublished candidate work.

Release checks: Hackage preferred-version JSON and upstream remote release tags, checked 2026-09-21. Keiro 0.18.0.0, pg-migrate 1.2.0.0, Kiroku store 0.8.0.1 / migrations 0.5.0.0 / OTel 0.2.0.8 / adapter 0.5.1.2, and Shibuya 0.9.0.3 are published. Shibuya 0.10.0.0 and lifecycle adapter candidates are not published.

No pages retired. Two unchanged pointers (pgmq-hs and the standalone example app) require no new source review.

## keiki

Source: `mori://shinzui/keiki`; `79337c57967db09c6ef7e27d68d349fe25e4b92b..3ed37eb08bde38ab8af8c0855d9e8cca87db7f4e` (3 commits).

| Commit / upstream change | Kind | Action / target |
| --- | --- | --- |
| `ad0c00f` chore(seihou): apply exec-plan and master-plan provenance updates | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `c6f1064` chore(nix): migrate nix-haskell-flake 0.8.0 -> 0.24.0 | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `3ed37eb` docs: add OKF terminology bundle | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |

## keiro

Source: `mori://shinzui/keiro`; `11e0bba4f634ac6fa4526e2814bd5a8177e3f050..c68dbdd7d1a76a67212067012dcf2321efba1e11` (46 commits).

| Commit / upstream change | Kind | Action / target |
| --- | --- | --- |
| `9fb54d56` build(deps): upgrade ephemeral-pg to 0.3.1 and use a stable temporary root | test dependency / fixture | UPDATE — PostgreSQL fixture how-to and compatibility. |
| `26360258` fix(automation): watch keiro-dsl Parser/ modules for the syntax signal | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `749a570b` docs(improvement-requests): request a shared keiro terminology catalog | terminology | UPDATE — prose uses scaffold ledger and conformance ledger; preserve literal serialized headers. |
| `c1417260` feat(terminology): publish keiro's controlled vocabulary as a TERM catalog | terminology | UPDATE — prose uses scaffold ledger and conformance ledger; preserve literal serialized headers. |
| `a5cc779b` docs: replace retired scaffold record and manifest wording with ledger names | terminology | UPDATE — prose uses scaffold ledger and conformance ledger; preserve literal serialized headers. |
| `b284379c` docs(terminology): clarify definitions and expand categorized glossary | terminology | UPDATE — prose uses scaffold ledger and conformance ledger; preserve literal serialized headers. |
| `98f07213` docs: request expanded mapped type support | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `ba36ce58` docs: plan replay-safe checked value mappings | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `29022c5e` docs(plans): apply replay-soundness review to MasterPlan 44 | evolution evidence / intent | UPDATE — retained-history adoption guidance; no general retirement authorization inferred. |
| `32f2e3f7` docs: strengthen pre-1.0 DSL replay and retirement plans | evolution evidence / intent | UPDATE — retained-history adoption guidance; no general retirement authorization inferred. |
| `d8ac86c6` feat(test-support): define replay compatibility evidence | replay evidence API | ADD — replay compatibility reference and adoption how-to; UPDATE evolution and workflow guidance. |
| `dc75e84e` feat(replay): enforce cross-build compatibility evidence | replay evidence API | ADD — replay compatibility reference and adoption how-to; UPDATE evolution and workflow guidance. |
| `a6110a94` feat(dsl): add checked bare container mappings | checked mapping / codec | UPDATE — mapped types, Candidate Language 6, language versions, notation, coverage map, codec reference, compatibility. |
| `b171f8cc` test(dsl): add bare container conformance corpus | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `2b7b658c` docs(adr): record bare mapping authority | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `eab7ce10` test(dsl): register bare container baseline | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `d7706e68` docs(plan): complete bare container mappings | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `3797db0a` feat(codec): add frozen calendar day policy | checked mapping / codec | UPDATE — mapped types, Candidate Language 6, language versions, notation, coverage map, codec reference, compatibility. |
| `6b92bd52` feat(dsl): lower checked calendar day mappings | checked mapping / codec | UPDATE — mapped types, Candidate Language 6, language versions, notation, coverage map, codec reference, compatibility. |
| `5c214b70` test(dsl): prove calendar day replay compatibility | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `082382ab` docs(adr): record calendar day mapping contract | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `eb1064fc` test(dsl): pin calendar profile capability | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `ec901331` docs(plan): record calendar day validation | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `01ba6c58` feat(dsl): add checked structural text sets | checked mapping / codec | UPDATE — mapped types, Candidate Language 6, language versions, notation, coverage map, codec reference, compatibility. |
| `1a16e386` docs(plan): complete structural text set rollout | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `e548fffd` feat(dsl): add checked base16 byte refinements | checked mapping / codec | UPDATE — mapped types, Candidate Language 6, language versions, notation, coverage map, codec reference, compatibility. |
| `30052d43` docs(plan): complete base16 refinement rollout | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `6b89cb51` feat(dsl): add explicit UUID admission domains | checked mapping / codec | UPDATE — mapped types, Candidate Language 6, language versions, notation, coverage map, codec reference, compatibility. |
| `af28b737` test(dsl): integrate checked mapping replay evidence | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `4bf274ca` docs(dsl): gate checked mapping publication | evolution evidence / intent | UPDATE — retained-history adoption guidance; no general retirement authorization inferred. |
| `37188564` feat(dsl): prove checked mapping adoption | checked mapping / codec | UPDATE — mapped types, Candidate Language 6, language versions, notation, coverage map, codec reference, compatibility. |
| `d0e0dfbd` docs(dsl): record checked mapping retirement blockers | evolution evidence / intent | UPDATE — retained-history adoption guidance; no general retirement authorization inferred. |
| `8ed4442c` test(dsl): track checked mapping workspace record | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `67b1ab00` docs(dsl): record checked mapping validation | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `ac6b187d` fix(dsl): preserve omitted checked optional fields | checked mapping / codec | UPDATE — mapped types, Candidate Language 6, language versions, notation, coverage map, codec reference, compatibility. |
| `06451949` docs(dsl): close checked mapping adoption rehearsal | evolution evidence / intent | UPDATE — retained-history adoption guidance; no general retirement authorization inferred. |
| `0e0b2d90` fix(dsl): refresh optional mapping corpus | checked mapping / codec | UPDATE — mapped types, Candidate Language 6, language versions, notation, coverage map, codec reference, compatibility. |
| `c38f7bde` fix(dsl): align checked mapping conformance assertions with retained history | checked mapping / codec | UPDATE — mapped types, Candidate Language 6, language versions, notation, coverage map, codec reference, compatibility. |
| `f225de38` chore(dsl): refresh record-field and generated-edition manifests | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `b12bbdd7` chore(release): 0.18.0.0 | release | UPDATE — published release matrix, landing page and source coverage boundary. |
| `b19a3278` fix(migrations): restore caller timeouts after guarded cutover attempts | reverted migration | NO-OP — fix and revert cancel; no migration 0033 at reviewed head. |
| `4c661556` test(release): enforce keiro re-exports of generated-code imports | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `dd7b6ea7` Revert "fix(migrations): restore caller timeouts after guarded cutover attempts" | reverted migration | NO-OP — fix and revert cancel; no migration 0033 at reviewed head. |
| `32d3b8c0` docs(improvement-requests): record IR-47 cutover budget leak | known limitation | UPDATE — versioned rebuild and pointer retain transaction-local timeout leak; no shipped fix. |
| `0d7cea6c` docs(masterplan): close checked mapping initiative | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `c68dbdd7` docs: refresh safe mapped-register construction plan | metadata / tests | NO-OP — unshipped mapped-register constructor plan; explicit pointer gap. |

## kiroku

Source: `mori://shinzui/kiroku`; `07cd034aafc0d88b6c55abdf3509e25b9d69e63d..246a27b6e7ac55fbd7c7a66e8ad84a3b3f46237e` (7 commits).

| Commit / upstream change | Kind | Action / target |
| --- | --- | --- |
| `2a12052` chore(deps): upgrade pg-migrate to 1.2 and ephemeral-pg to 0.3.1 | published dependencies / release | UPDATE — migrations 0.5 on pg-migrate 1.2, test root and published package matrix; SQL unchanged. |
| `758b81a` chore(release): kiroku-store 0.8.0.1, kiroku-store-migrations 0.5.0.0, kiroku-otel 0.2.0.8, shibuya-kiroku-adapter 0.5.1.2 | published dependencies / release | UPDATE — migrations 0.5 on pg-migrate 1.2, test root and published package matrix; SQL unchanged. |
| `eb67688` fix(subscriptions): make adapter ownership exception safe | unpublished lifecycle candidate | NO-OP for released API pages — record ownership, dependency-bound and candidate gaps in pointer / compatibility. |
| `a1de2bf` test(adapter): add live Kiroku lifecycle soak fixture | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `0dcd092` chore(deps): support effectful 2.6 and 2.7 | unpublished lifecycle candidate | NO-OP for released API pages — record ownership, dependency-bound and candidate gaps in pointer / compatibility. |
| `f91bb05` build(deps): exclude regressed effectful-core releases | unpublished lifecycle candidate | NO-OP for released API pages — record ownership, dependency-bound and candidate gaps in pointer / compatibility. |
| `246a27b` chore(release): prepare lifecycle candidate packages | unpublished lifecycle candidate | NO-OP for released API pages — record ownership, dependency-bound and candidate gaps in pointer / compatibility. |

## pg-migrate

Source: `mori://shinzui/pg-migrate`; `8a528b67641608dd92b70369e3b61d587a8aa505..13865052bef62688c40576ad36889221a0ba7e08` (8 commits).

| Commit / upstream change | Kind | Action / target |
| --- | --- | --- |
| `0d99dfa` chore(seihou): update exec-plan and master-plan to 0.10.0 | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `6d68d42` chore(seihou): update nix-haskell-flake to 0.24.0 | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `4cde81f` chore(nix): prune orphaned flake.lock inputs after 0.24.0 upgrade | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `741942c` feat(test-support): pin ephemeral-pg temporaryRoot to a stable per-user root | test helper / release | UPDATE — test helper signature/default, 1.2 compatibility, tutorial bounds and shared matrix. |
| `6715d45` docs(test-support): document the stable per-user ephemeral-pg temporary root | test helper / release | UPDATE — test helper signature/default, 1.2 compatibility, tutorial bounds and shared matrix. |
| `39793b6` docs: adopt the OKF user-documentation profile for user and reference docs | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `b8ce2b3` docs(readme): trim maintainer detail and fix the ledger schema name | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `1386505` chore(release): 1.2.0.0 | test helper / release | UPDATE — test helper signature/default, 1.2 compatibility, tutorial bounds and shared matrix. |

## shibuya-kafka-adapter

Source: `mori://shinzui/shibuya-kafka-adapter`; `6c0cd3fc840c9f5ba48558ca94c7d826a3da6c9f..74fed7e8df366072b0587c4bdae8d4e92317c8a3` (7 commits).

| Commit / upstream change | Kind | Action / target |
| --- | --- | --- |
| `554c969` fix(kafka): fence acknowledgement recovery boundaries | unpublished adapter candidate | NO-OP for released API pages — record finalization/recovery and core-0.10 candidate gaps. |
| `796dc07` docs(kafka): specify acknowledgement fencing contract | unpublished adapter candidate | NO-OP for released API pages — record finalization/recovery and core-0.10 candidate gaps. |
| `0e27645` test(bench): add live Kafka lifecycle soak fixture | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `d2725ba` test(kafka): raise reference-model release budget | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `35a3e41` fix(nix): build the published Kafka adapter | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `1c455b5` build(deps): exclude regressed effectful-core releases | unpublished adapter candidate | NO-OP for released API pages — record finalization/recovery and core-0.10 candidate gaps. |
| `74fed7e` chore(release): prepare 0.9.0.2 candidate | unpublished adapter candidate | NO-OP for released API pages — record finalization/recovery and core-0.10 candidate gaps. |

## shibuya-kiroku-adapter

Source: `mori://shinzui/kiroku`; `07cd034aafc0d88b6c55abdf3509e25b9d69e63d..246a27b6e7ac55fbd7c7a66e8ad84a3b3f46237e` (7 commits).

| Commit / upstream change | Kind | Action / target |
| --- | --- | --- |
| `2a12052` chore(deps): upgrade pg-migrate to 1.2 and ephemeral-pg to 0.3.1 | published dependencies / release | UPDATE — migrations 0.5 on pg-migrate 1.2, test root and published package matrix; SQL unchanged. |
| `758b81a` chore(release): kiroku-store 0.8.0.1, kiroku-store-migrations 0.5.0.0, kiroku-otel 0.2.0.8, shibuya-kiroku-adapter 0.5.1.2 | published dependencies / release | UPDATE — migrations 0.5 on pg-migrate 1.2, test root and published package matrix; SQL unchanged. |
| `eb67688` fix(subscriptions): make adapter ownership exception safe | unpublished lifecycle candidate | NO-OP for released API pages — record ownership, dependency-bound and candidate gaps in pointer / compatibility. |
| `a1de2bf` test(adapter): add live Kiroku lifecycle soak fixture | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `0dcd092` chore(deps): support effectful 2.6 and 2.7 | unpublished lifecycle candidate | NO-OP for released API pages — record ownership, dependency-bound and candidate gaps in pointer / compatibility. |
| `f91bb05` build(deps): exclude regressed effectful-core releases | unpublished lifecycle candidate | NO-OP for released API pages — record ownership, dependency-bound and candidate gaps in pointer / compatibility. |
| `246a27b` chore(release): prepare lifecycle candidate packages | unpublished lifecycle candidate | NO-OP for released API pages — record ownership, dependency-bound and candidate gaps in pointer / compatibility. |

## shibuya-message-db-adapter

Source: `mori://shinzui/shibuya-message-db-adapter`; `fa7b958462a34b9ac12cf26995f93625d4fcd2ef..1701c0441649dfa49152e0718c5295d554069816` (1 commits).

| Commit / upstream change | Kind | Action / target |
| --- | --- | --- |
| `1701c04` chore: mark shibuya-message-db-adapter as archived | lifecycle | UPDATE — mark adapter archived in integration page and compatibility/comparison. |

## shibuya-pgmq-adapter

Source: `mori://shinzui/shibuya-pgmq-adapter`; `392f7545af32ef893c24139fd194d16ec1172f75..9c709d76b8c1e66a45148888970d5518cc3c0d7e` (7 commits).

| Commit / upstream change | Kind | Action / target |
| --- | --- | --- |
| `130b250` fix(pgmq): make dead-letter finalization recoverable | unpublished adapter candidate | NO-OP for released API pages — record finalization/recovery and core-0.10 candidate gaps. |
| `611bcd8` docs(pgmq): specify acknowledgement recovery contract | unpublished adapter candidate | NO-OP for released API pages — record finalization/recovery and core-0.10 candidate gaps. |
| `1b58ea9` docs(pgmq): record capability review provenance | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `fe26ce9` test(pgmq): cover repeated graceful shutdown | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `7a47ab7` test(bench): harden PGMQ lifecycle soak fixture | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `9247388` build(deps): support safe effectful-core families | unpublished adapter candidate | NO-OP for released API pages — record finalization/recovery and core-0.10 candidate gaps. |
| `9c709d7` chore(release): prepare 0.16.0.1 candidate | unpublished adapter candidate | NO-OP for released API pages — record finalization/recovery and core-0.10 candidate gaps. |

## shibuya

Source: `mori://shinzui/shibuya`; `cb3c4a9ae91de946fa17a6287241ca91699f7c50..efbe2a87268a759e825f388e238343a83badd6da` (70 commits).

| Commit / upstream change | Kind | Action / target |
| --- | --- | --- |
| `193a5c9` test(core): reproduce bare waitApp GC crash and refresh EP-33 | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `9e2a038` docs(claude): trim project context to non-derivable facts | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `c353a7d` fix(core): remove idle linked master loop | published liveness fix | UPDATE — app supervision, walkthrough, FAQ and published matrix; no linked idle master actor or caller-linked supervisor. |
| `afdf42e` docs: update master architecture descriptions | published liveness fix | UPDATE — app supervision, walkthrough, FAQ and published matrix; no linked idle master actor or caller-linked supervisor. |
| `851c7c9` docs(review): capture lifecycle findings and audit progress | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `472973a` docs(audit): record lifecycle findings and diagnostic probes | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `d27448e` chore(release): 0.9.0.2 | published liveness fix | UPDATE — app supervision, walkthrough, FAQ and published matrix; no linked idle master actor or caller-linked supervisor. |
| `216e755` docs(release): record 0.9.0.2 publication | published liveness fix | UPDATE — app supervision, walkthrough, FAQ and published matrix; no linked idle master actor or caller-linked supervisor. |
| `7e70051` docs(plan): define lifecycle remediation and release assurance | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `d99c920` docs(architecture): close master liveness plan | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `fb51805` docs(plan): add EP-46 and record REV-16 supervisor-link findings | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `883b56a` docs(masterplan): revise lifecycle remediation plan after review | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `afa8889` test(core): reproduce the supervisor-link defects before fixing them | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `f64964e` fix(core): start the NQE supervisor without linking it to the caller | published liveness fix | UPDATE — app supervision, walkthrough, FAQ and published matrix; no linked idle master actor or caller-linked supervisor. |
| `87060e4` docs(core): record the unlinked supervisor in ADR 0001 and the guides | published liveness fix | UPDATE — app supervision, walkthrough, FAQ and published matrix; no linked idle master actor or caller-linked supervisor. |
| `4925f65` docs(plan): record EP-46 release candidate validation | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `0e15282` test(core): harden the supervisor-link regressions before release | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `7512b5c` chore(release): 0.9.0.3 | published liveness fix | UPDATE — app supervision, walkthrough, FAQ and published matrix; no linked idle master actor or caller-linked supervisor. |
| `a521903` docs(release): record 0.9.0.3 publication and close EP-46 | published liveness fix | UPDATE — app supervision, walkthrough, FAQ and published matrix; no linked idle master actor or caller-linked supervisor. |
| `011c3cc` docs(masterplan): make EP-39 close the metrics package's test gap | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `80cfca8` docs(audit): establish lifecycle evidence inventory | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `c56f75a` feat(audit): enforce lifecycle evidence gates | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `058f36f` docs(audit): define candidate evidence workflow | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `886f591` feat(bench): add lifecycle performance evidence harness | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `ea0625e` docs(perf): capture pre-remediation lifecycle baseline | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `28a11e0` fix(core): make lifecycle termination exception safe | unpublished lifecycle candidate | NO-OP for released API pages — record core, health, WebSocket, ownership and dependency changes as candidate gaps. |
| `37d547a` perf(core): preserve lifecycle ownership throughput | unpublished lifecycle candidate | NO-OP for released API pages — record core, health, WebSocket, ownership and dependency changes as candidate gaps. |
| `2a16c52` perf(core): keep terminal wakeups off the hot path | unpublished lifecycle candidate | NO-OP for released API pages — record core, health, WebSocket, ownership and dependency changes as candidate gaps. |
| `3095be3` perf(core): keep populated inbox transactions branch free | unpublished lifecycle candidate | NO-OP for released API pages — record core, health, WebSocket, ownership and dependency changes as candidate gaps. |
| `a26d606` perf(core): avoid duplicate empty inbox transactions | unpublished lifecycle candidate | NO-OP for released API pages — record core, health, WebSocket, ownership and dependency changes as candidate gaps. |
| `81501f8` perf(core): isolate terminal wake publication | unpublished lifecycle candidate | NO-OP for released API pages — record core, health, WebSocket, ownership and dependency changes as candidate gaps. |
| `a7af0db` fix(core): restore child interruptibility after spawn | unpublished lifecycle candidate | NO-OP for released API pages — record core, health, WebSocket, ownership and dependency changes as candidate gaps. |
| `2108292` perf(core): classify lifecycle outcomes at the IO boundary | unpublished lifecycle candidate | NO-OP for released API pages — record core, health, WebSocket, ownership and dependency changes as candidate gaps. |
| `80a4b59` docs(core): certify lifecycle remediation evidence | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `e9397ab` docs(core): retain raw lifecycle evidence logs | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `1c6682d` docs(metrics): start lifecycle observability remediation | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `4d59034` test(metrics): characterize published endpoint contracts | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `682003e` docs(metrics): record contract mutation evidence | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `82a8e90` fix(metrics): make health lifecycle and progress aware | unpublished lifecycle candidate | NO-OP for released API pages — record core, health, WebSocket, ownership and dependency changes as candidate gaps. |
| `98bbede` docs(metrics): retain lifecycle health evidence | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `75d99fc` fix(metrics): make WebSocket lifecycle explicit | unpublished lifecycle candidate | NO-OP for released API pages — record core, health, WebSocket, ownership and dependency changes as candidate gaps. |
| `686bfe2` docs(metrics): retain WebSocket lifecycle evidence | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `6535a03` fix(metrics): normalize dependency check failures | unpublished lifecycle candidate | NO-OP for released API pages — record core, health, WebSocket, ownership and dependency changes as candidate gaps. |
| `67ce56d` docs(assurance): complete EP-39 metrics lifecycle evidence | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `96992df` docs(assurance): start EP-40 Kafka remediation | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `dc75c0e` feat(audit): validate external regression references | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `cd8bc70` docs(lifecycle): complete Kafka acknowledgement remediation | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `4f11f02` docs(assurance): start EP-41 PGMQ remediation | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `1ac9fe2` docs(lifecycle): complete PGMQ recovery remediation | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `a4ae429` docs(lifecycle): retain PGMQ recovery transcripts | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `b2b0332` docs(assurance): start EP-43 Kiroku remediation | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `bd9edd4` docs(lifecycle): complete Kiroku ownership remediation | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `f295c5c` perf(core): preserve lifecycle release throughput | unpublished lifecycle candidate | NO-OP for released API pages — record core, health, WebSocket, ownership and dependency changes as candidate gaps. |
| `6f5f5e2` test(perf): measure graceful drain under backlog | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `c25a918` perf(core): scope supervised child unmasking | unpublished lifecycle candidate | NO-OP for released API pages — record core, health, WebSocket, ownership and dependency changes as candidate gaps. |
| `6461c74` perf(core): unmask serial processing once | unpublished lifecycle candidate | NO-OP for released API pages — record core, health, WebSocket, ownership and dependency changes as candidate gaps. |
| `b183861` test(perf): add live lifecycle release fixtures | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `0a9a21b` fix(perf): clamp empirical memory envelope intercept | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `6ccec8c` test(release): enforce lifecycle execution budgets | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `b0aeb21` test(perf): publish lifecycle candidate verdict | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `7079c30` docs(release): record Kafka candidate gates | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `16625ff` build(deps): exclude regressed effectful-core releases | unpublished lifecycle candidate | NO-OP for released API pages — record core, health, WebSocket, ownership and dependency changes as candidate gaps. |
| `a1bf986` docs(release): benchmark dependency-bound changes | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `df24b8a` docs(deps): record effectful bound gates | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `d4d8d3d` docs(release): record core compatibility gate | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `5466b22` docs(deps): record adapter compatibility gates | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `aa5d50a` docs(release): record adapter candidate gates | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `ecccecc` chore(release): prepare 0.10.0.0 candidate | unpublished lifecycle candidate | NO-OP for released API pages — record core, health, WebSocket, ownership and dependency changes as candidate gaps. |
| `1c99d1d` test(release): record frozen candidate matrix | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |
| `efbe2a8` test(release): retain candidate test transcripts | metadata / tests | NO-OP — intent, evidence, or maintainer tooling; no separate public contract. |

## Verification and boundaries

All 149 unique upstream commits are classified above (156 rows because the Kiroku repository has two independently tracked pointers). Nine pointers advance to the frozen committed heads; pgmq-hs and the standalone example application remain unchanged. No upstream working-tree changes are included.

The published package checks used Hackage preferred-version metadata and Cabal descriptions, plus each owning repository’s remote release tags. Published maxima are not a jointly solvable dependency set: Keiro 0.18 retains pg-migrate 1.1 / Kiroku migrations 0.4 bounds. The compatibility page records unpublished lifecycle candidates separately. Migration 0033 was added and reverted in the reviewed Keiro range; it is not an available repair.

Passed internal links (538 files), navigation (62 metadata files / 538 pages), TypeScript and production build. Typechecking initially exposed missing allowImportingTsExtensions for existing Bun skill scripts; enabled it with the existing noEmit configuration. The initial build rejected an unsupported cabal fence; changed it to text. Final checks pass. All 94 anchor links in changed pages were checked against rendered HTML IDs. No content formatter was run.

## Page accounting

| Library / area | Added | Updated | Retired |
| --- | ---: | ---: | ---: |
| keiki | 0 | 0 | 0 |
| keiro | 2 | 28 | 0 |
| kiroku | 0 | 3 | 0 |
| pg-migrate | 0 | 8 | 0 |
| shibuya | 0 | 3 | 0 |
| integrations | 0 | 6 | 0 |
| getting-started | 0 | 2 | 0 |

Integration updates include one page for each of the four adapters, the adapter comparison, and Keiro/Keiki composition. Keiki’s own pages have no semantic change. Navigation metadata for both new Keiro pages was updated.
