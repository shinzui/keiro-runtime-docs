# Source sync — 2026-10-14

This review uses fixed committed upstream targets resolved through Mori. It covers 220 distinct
library commits plus two catalog commits. The independent adapter pointer reviews the same 82 Kiroku
commits again: 304 pointer-range commit reviews in total. No upstream checkout was pulled or changed.
The standalone example remains at its prior SHA; its one dirty file was excluded.

## Review boundaries

| Owner / pointer | Previous | Reviewed | Commits |
| --- | --- | --- | ---: |
| `mori://shinzui/keiki` / `keiki` | `3ed37eb08bde38ab8af8c0855d9e8cca87db7f4e` | `b6a60c25ad5cdaa50c79d7592790a1b073ba7846` | 8 |
| `mori://shinzui/keiro-runtime-jitsurei` / `keiro-runtime-jitsurei` | `e3c800eb9d010289e05aa00390a38973a1ac239d` | `e3c800eb9d010289e05aa00390a38973a1ac239d` | 0 |
| `mori://shinzui/keiro` / `keiro` | `945529d46fd2967994270eb94e22c80908df4d14` | `e6ef560b0a8db0dc091d0f8d7da1bb08c29155be` | 91 |
| `mori://shinzui/kiroku` / `kiroku` | `36b75510220393b9791d9167ca7817f22fbc848b` | `ad866f925ac11484a2ee758fe235035840c85c0a` | 82 |
| `mori://shinzui/pg-migrate` / `pg-migrate` | `13865052bef62688c40576ad36889221a0ba7e08` | `13865052bef62688c40576ad36889221a0ba7e08` | 0 |
| `mori://shinzui/pgmq-hs` / `pgmq-hs` | `f4bdd91437ccf9c1981983fb1c6fd99dcc3c10f6` | `48a1ed0f92c6d52e8009f396fe21d380c364ab14` | 1 |
| `mori://shinzui/keiro-runtime-patterns` / `runtime-patterns` | `2102ba1cce26d0f7ccfee775f5fc8bc60fada58e` | `5957590e4370f6a791ef1f7480c00c3809526f6c` | 2 |
| `mori://shinzui/shibuya-kafka-adapter` / `shibuya-kafka-adapter` | `c04758990927bbda6d0616ae9609c263ec73758b` | `a3c9de8033801214c979864554b405ef1f56006f` | 1 |
| `mori://shinzui/kiroku` / `shibuya-kiroku-adapter` | `36b75510220393b9791d9167ca7817f22fbc848b` | `ad866f925ac11484a2ee758fe235035840c85c0a` | 82 |
| `mori://shinzui/shibuya-message-db-adapter` / `shibuya-message-db-adapter` | `1701c0441649dfa49152e0718c5295d554069816` | `51a36348ee31bd97eea595b34533ca8cfa931f82` | 1 |
| `mori://shinzui/shibuya-pgmq-adapter` / `shibuya-pgmq-adapter` | `65af8ed8cd8a0ff7a89682346c3769f088a64732` | `237575e70c10bb2e53fe19bb2c6efcd9cda6b2c1` | 4 |
| `mori://shinzui/shibuya` / `shibuya` | `02cf260604341c1a4e3a22a62fbf67d3c715f81c` | `0967f450b659b48d24cb49f199718451a65d2d48` | 32 |

## Commit classification

A NO-OP records the scope of the actual change; it does not claim an upstream plan shipped.
Kiroku rows also account for the independently reviewed adapter range. All source changes are
reconciled against committed implementation, with released and unreleased boundaries kept separate.

### `mori://shinzui/keiki`

| Commit and change | Kind | Action | Local documentation / reason |
| --- | --- | --- | --- |
| `c0758b2779` chore(seihou): apply exec-plan and master-plan template updates | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `5911f5d7b4` docs(plan): plan descriptive SCXML state-chart export | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `127d348a37` style(cabal): apply cabal-gild formatting to keiki.cabal | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `695090fbde` feat(render): export descriptive SCXML state charts | Source API / behavior | ADD / UPDATE | `keiki/reference/render-scxml.mdx`, renderer index, Mermaid reference and FAQ; explicitly unreleased |
| `1664f5fc65` test(render): cover SCXML edge views, hostile text, and malformed enumerations | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `50d371b17c` docs(render): document and gate the descriptive SCXML export | User guidance | UPDATE | Reconcile corresponding reference, upgrade and operating instructions against the implemented source; no plan-derived API |
| `5f84604f70` fix(render): keep SCXML event labels sound and unshadowed | Source API / behavior | ADD / UPDATE | `keiki/reference/render-scxml.mdx`, renderer index, Mermaid reference and FAQ; explicitly unreleased |
| `b6a60c25ad` docs(guide): adopt OKF user-documentation profile with DOC-N handles | Documentation profile | NO-OP | DOC-N metadata conversion; SCXML technical content already accounted for |

### `mori://shinzui/keiro`

| Commit and change | Kind | Action | Local documentation / reason |
| --- | --- | --- | --- |
| `ac092fedf8` docs(bug-reports): report inconsistent read-model keyword names | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `87b997f591` docs: report keiro-ops flagging the external-read binding view as drift (BUG-9) | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `82988ae6fe` docs(bug-reports): report a parent stranded by a child completion crash | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `4b01af10aa` docs(bug-reports): report the derived-Show DLQ message id in keiro-ops JSON | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `d790efb515` build(deps): admit effectful 2.7 alongside 2.6 | Dependency/release | UPDATE | Compatibility, installation and package/source boundaries; published history already covers the release |
| `9b215c1121` chore(release): 0.19.0.1 | Dependency/release | UPDATE | Compatibility, installation and package/source boundaries; published history already covers the release |
| `470b4555eb` docs(plan): reuse DSL conformance builds and pilot Buck2 | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `b5ad9d571a` docs: plan pre-1.0 Language 6 compatibility retirement | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `212da9b22c` docs(improvement-requests): file IR-53 on list fields in integration contracts | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `2c3a538935` feat(subscription): adopt published Kiroku hardening and atomic shard resize | Source API / behavior | UPDATE | sharding reference/how-to and scaling walkthrough; router/process-manager retry guidance |
| `2a38ee169d` docs(requests): propose atomic catalog command preconditions | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `e05f7b8064` docs: plan guarded synchronous catalog commands | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `36af358b11` docs: default query models to asynchronous projections | User guidance | UPDATE | Reconcile corresponding reference, upgrade and operating instructions against the implemented source; no plan-derived API |
| `68d5364597` docs(plan): strengthen guarded catalog correctness and performance validation | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `8a711f5383` docs(plan): plan latest shibuya and pgmq-hs upgrade | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `a0a2bd81ac` build(deps)!: adopt the released Kiroku 0.11 cohort | Dependency/release | UPDATE | Compatibility, installation and package/source boundaries; published history already covers the release |
| `b873414b2d` docs: record Kiroku adoption review and correct retry guidance | Source API / behavior | UPDATE | router/process-manager retry guidance |
| `627e9b7dd4` docs(plans): revise plan 307 shibuya and pgmq-hs upgrade | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `0ebee300bf` chore(deps): require current shibuya and pgmq-hs releases | Dependency/release | UPDATE | Compatibility, installation and package/source boundaries; published history already covers the release |
| `6de33cedf4` test(pgmq): assert clean idle-worker shutdown | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `ad78efae0d` docs(deps): record verified shibuya and pgmq-hs support | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `0efa3d2a45` feat(projection): add fenced transactional catalog preconditions | Source API / behavior | UPDATE | projection reference, guarded-command how-to, read-side explanation; PostgreSQL fixture guide: same-database resource pools and durable benchmark scope |
| `22c6f696d6` test(projection): prove guarded catalog retries and serving lifecycles | Source API / behavior | UPDATE | PostgreSQL fixture guide: same-database resource pools and durable benchmark scope |
| `158268953c` test(projection): record guarded lock diagnostics and baseline drift | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `6dac225226` test(projection): retain paired catalog budget failures | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `66e7d62fbc` test(projection): gate complete guarded catalog evidence | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `ff1126d42f` test(projection): require durable guarded catalog measurements | Source API / behavior | UPDATE | PostgreSQL fixture guide: same-database resource pools and durable benchmark scope |
| `7233bd1ea0` test(projection): verify paired catalog builds and host activity | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `215c6c5b6a` test(projection): validate durable catalog evidence and build holds | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `c4a3f96776` test(projection): package catalog matrix for leased cells | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `bb64e28a9b` fix(bench): preserve catalog cell payload source names | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `cee0c63b94` fix(bench): include native libraries in catalog payload | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `099972f8cc` test(projection): retain leased catalog run and replay health | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `28b311a5ba` fix(bench): parse Haskell catalog arrival-rate report names | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `9a1379fec5` docs(projection): reconcile guarded catalog release notes | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `f6be4cfd51` docs(plan): retain full catalog performance release gate | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `5fdd646e88` docs(plan): stop exhaustive catalog performance execution | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `655707372f` docs(plan): complete guarded catalog command implementation | User guidance | UPDATE | Reconcile corresponding reference, upgrade and operating instructions against the implemented source; no plan-derived API |
| `d1492d748f` chore(release): 0.20.0.0 | Dependency/release | UPDATE | Compatibility, installation and package/source boundaries; published history already covers the release |
| `a069372b36` docs(bugs): report history-dependent initial hole harness failures | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `cc8e4b13e2` docs(plan): plan witness-backed initial hole probes to fix BUG-10 | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `0f81c1bbf1` docs(bug-reports): merge PR #6 reporting keyword-segment name mismatch as BUG-11 | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `96f360a15c` docs(plan): confirm BUG-11 and plan whole-name stems for keyword segments | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `06caf3549c` docs(plan): keep whole-name stems byte-identical in plan 310 | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `fa3bd86b3d` docs(bug-reports): merge PR #7 reporting ops schema drift on binding views as BUG-12 | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `1580c85d76` docs(plan): plan registry-aware schema verification to fix BUG-12 | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `bf7db963b1` docs(plan): harden plan 311 registry lookup, owner filter, and pending fixture | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `977ee434f6` docs(improvement-requests): merge PR #8 requesting list fields in integration contracts as IR-54 | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `2508e81a4d` docs(plans): plan list fields in integration contracts as ExecPlan 312 and accept IR-54 | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `b6d704e44b` docs(plan): record the accepted API break and sequencing in plan 312 | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `89a5455c76` test(dsl): reproduce history-dependent initial hole harness failures | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `2766591686` fix(dsl): prove hole-owned initial edges through behavior witnesses | Source API / behavior | UPDATE | DSL CLI, mapped/domain/runtime/Language 6 references and replay guidance |
| `8fe77c6c89` test(dsl): add initial-hole witness mutation evidence | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `6b364d4858` test(dsl): complete contract corpus regeneration and wire witness proof | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `8833b64fd7` docs(dsl): document witness-backed initial hole probes | User guidance | UPDATE | Reconcile corresponding reference, upgrade and operating instructions against the implemented source; no plan-derived API |
| `6e3fa3b6de` test(dsl): register the history-dependent proof in fixture inventories | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `80c5273ece` docs(dsl): refresh checked record inventories for witness-backed proofs | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `dd7244f43a` docs(bugs): mark BUG-10 fixed pending release | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `f94562be25` docs(plan): correct list contract implementation and validation | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `cbcc593df2` docs(plan): correct BUG-11 implementation and validation plan | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `27a12e3e2a` docs(plan): correct schema verification plan after review | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `6b9f08efe7` docs(inspection): tighten correctness and hot-path performance gates | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `3081a9b2e6` fix(dsl): derive generated names from whole declarations | Source API / behavior | UPDATE | DSL CLI, mapped/domain/runtime/Language 6 references and replay guidance |
| `e44bc1399a` docs(dsl): refresh generated record inventories | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `b82e308eb3` docs(dsl): close BUG-11 after full verification | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `58a5d15545` test(keiro): add pending binding-view drift fixture and confirm BUG-12 | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `b13d814d98` fix(migrations): treat registry-recorded runtime read objects as expected schema | Source API / behavior | UPDATE | migration/schema reference and deploy ordering |
| `943a2a095b` test(ops): prove registered binding views no longer trip schema verification | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `2c076f5f1f` docs: record registry-aware schema verification and close BUG-12 | User guidance | UPDATE | Reconcile corresponding reference, upgrade and operating instructions against the implemented source; no plan-derived API |
| `8802f37295` refactor(dsl)!: separate contract scalar types from field shape | Source API / behavior | UPDATE | DSL CLI, mapped/domain/runtime/Language 6 references and replay guidance |
| `f3b9062ed4` feat(dsl): lower scalar contract lists with strict array codecs | Source API / behavior | UPDATE | DSL CLI, mapped/domain/runtime/Language 6 references and replay guidance |
| `70abd843b4` feat(dsl): gate public contract list syntax on Language 6 | Source API / behavior | UPDATE | DSL CLI, mapped/domain/runtime/Language 6 references and replay guidance |
| `14db635011` feat(dsl): reject contract list identity keys and verify evolution | Source API / behavior | UPDATE | DSL CLI, mapped/domain/runtime/Language 6 references and replay guidance |
| `c6e66749bd` test(dsl): compile and exercise public contract list codecs | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `c01c3612bc` docs(dsl): refresh migration inventories for contract list support | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `a0c82a4202` docs(dsl): document contract list support and complete IR-54 | User guidance | UPDATE | Reconcile corresponding reference, upgrade and operating instructions against the implemented source; no plan-derived API |
| `23937a40bc` docs(plan): plan contract parser corrections | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `4b48b0f0de` docs(plan): plan IR-50 removal diff correction | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `6570272511` docs: reconcile improvement request statuses and plan links | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `2dc028d682` docs: correct mapped-register construction plan for release | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `3d8760dfb3` fix(dsl): parse contextual contract IDs and exact List applications | Source API / behavior | UPDATE | DSL CLI, mapped/domain/runtime/Language 6 references and replay guidance |
| `d3f89f354b` docs(dsl): record contextual contract grammar and plan 313 validation | User guidance | UPDATE | Reconcile corresponding reference, upgrade and operating instructions against the implemented source; no plan-derived API |
| `3cd98914dc` fix(dsl): classify command and event removals | Source API / behavior | UPDATE | DSL CLI, mapped/domain/runtime/Language 6 references and replay guidance |
| `5945658f44` docs(dsl): complete IR-50 acceptance | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `912d9f7e58` feat(dsl): add safe declared mapped register construction | Source API / behavior | UPDATE | DSL CLI, mapped/domain/runtime/Language 6 references and replay guidance |
| `aa7fc53cfc` chore(dsl): register mapped construction corpus provenance | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `052296b248` fix(dsl): classify complete initial writes without ambiguity | Source API / behavior | UPDATE | DSL CLI, mapped/domain/runtime/Language 6 references and replay guidance |
| `6692f43ec5` docs(dsl): record mapped construction verification and inventories | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `bade340b0e` fix(dsl): qualify contract list index constructors | Source API / behavior | UPDATE | DSL CLI, mapped/domain/runtime/Language 6 references and replay guidance |
| `8017b779fc` docs(plan): record contract list collision fix verification | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `e6ef560b0a` chore(release): 0.21.0.0 | Dependency/release | UPDATE | Compatibility, installation and package/source boundaries; published history already covers the release |

### `mori://shinzui/kiroku`

| Commit and change | Kind | Action | Local documentation / reason |
| --- | --- | --- | --- |
| `9688ed0ac2` docs(improvement-requests): add stream head position request (IR-18) | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `e6ea66433c` docs(improvement-requests): record IR-18 performance evaluation | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `4d9b68e31d` docs(plans): refresh subscription hardening and protect write performance | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `ec9a43141b` feat(subscription)!: persist group topology and resize without gaps | Source API / behavior | UPDATE | `kiroku/reference/schema-migrations.mdx`, installation and deploy order; subscription explanation, resize/rebind runbook, source walkthroughs, metrics and OTel references; `kiroku/reference/inspection.mdx`, metrics and tail-recovery guide; Store effect, core types, inspection and error semantics; adapter integration, Kiroku how-to/walkthrough and compatibility |
| `15c21e8a7b` test(subscription): retain inconclusive control calibration evidence | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `5b22a77815` test(subscription): add matched Kenshou cell payloads | Source API / behavior | UPDATE | Kiroku subscription and inspection references; implementation detail follows documented behavior |
| `e6b0520cff` test(subscription): enforce durable cell backlog and capacity accounting | Source API / behavior | UPDATE | Kiroku subscription and inspection references; implementation detail follows documented behavior |
| `bc57b313fc` docs(perf): scope subscription hardening measurements to PostgreSQL 18 | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `597dc6e071` test(perf): correct arrival timing and retain cell calibration evidence | Source API / behavior | UPDATE | Kiroku subscription and inspection references; implementation detail follows documented behavior |
| `e072f86aba` test(perf): enforce the frozen subscription hardening matrix | Source API / behavior | UPDATE | Kiroku subscription and inspection references; implementation detail follows documented behavior |
| `6f67012011` fix(perf): bind the matrix planner to the compiled control cohort | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `7bcd31a6cb` docs(perf): record the published matrix payloads and queued validation | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `3d1c148f46` test(perf): focus topology regression assurance on affected write paths | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `14158e9b77` docs(perf): record the focused pipeline and superseded diagnostic cancellation | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `dca304b610` fix(perf): resume interrupted capacity pilots from verified journals | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `470a767b61` docs(perf): record stopped-cell delay and verified startup recovery | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `e4dfd08538` fix(perf): bound benchmark work and make experiment cost explicit | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `23a03a1b8b` fix(perf): finish topology hardening with proportional evidence | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `d2a4032eea` feat(subscriptions): bind checkpoint targets and preserve live reconnect progress | Source API / behavior | UPDATE | `kiroku/reference/schema-migrations.mdx`, installation and deploy order; subscription explanation, resize/rebind runbook, source walkthroughs, metrics and OTel references; `kiroku/reference/inspection.mdx`, metrics and tail-recovery guide; Store effect, core types, inspection and error semantics; adapter integration, Kiroku how-to/walkthrough and compatibility |
| `66125237a7` perf(subscriptions): avoid encoding constant checkpoint target parameters | Source API / behavior | UPDATE | subscription explanation, resize/rebind runbook, source walkthroughs, metrics and OTel references; Store effect, core types, inspection and error semantics |
| `7aadc125d7` docs(subscriptions): retain EP2 evidence and unresolved write cost | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `7bd37df3de` docs(bench): clarify the mixed probe uses four category group members | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `f7ddbe18fd` chore(bench): identify the EP2 source for the focused Linux verification | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `489baf32d1` docs(bench): retain bounded EP2 Linux timings and checkpoint trade-off | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `e94093aa9a` docs(bench): track the retained quick verification transcripts | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `7e9c7a2d10` docs(masterplan): accept EP2 and begin focused decode hardening | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `eb58104eb8` fix(store): contain typed decode failures per subscription | Source API / behavior | UPDATE | subscription explanation, resize/rebind runbook, source walkthroughs, metrics and OTel references; `kiroku/reference/inspection.mdx`, metrics and tail-recovery guide; Store effect, core types, inspection and error semantics |
| `67332399a0` test(store): retain focused decode hardening evidence | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `96c7d4fc32` feat(subscription): add opt-in handler stall diagnostics and adapter retry policy | Source API / behavior | UPDATE | subscription explanation, resize/rebind runbook, source walkthroughs, metrics and OTel references; `kiroku/reference/inspection.mdx`, metrics and tail-recovery guide; Store effect, core types, inspection and error semantics; adapter integration, Kiroku how-to/walkthrough and compatibility |
| `250d446931` test(subscription): retain focused acknowledgement liveness evidence | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `5805117edf` fix(store): classify unique constraints by exact identity | Source API / behavior | UPDATE | Store effect, core types, inspection and error semantics |
| `cc13408bf8` docs(plan): complete unique-violation hardening acceptance | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `904a066085` test(bench): prepare focused cumulative hardening comparison | Source API / behavior | UPDATE | Kiroku subscription and inspection references; implementation detail follows documented behavior |
| `b8ec42d661` test(bench): use verified head identity for diagnostic payload | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `13fd8a6433` test(bench): retain stopped EP6 comparison and release proposal | Source API / behavior | UPDATE | Kiroku subscription and inspection references; implementation detail follows documented behavior |
| `f7273083f1` fix(bench): validate checkpoints against live delivery batches | Source API / behavior | UPDATE | Kiroku subscription and inspection references; implementation detail follows documented behavior |
| `f77c564abd` test(bench): retain bounded EP6 follow-up and uncertainty | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `60429e0184` test(bench): retain EP6 tail repeat and unresolved release gates | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `a2afb5df80` test(bench): include ignored sealed EP6 logs | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `bf2ad0d490` docs(release): record practical EP6 performance acceptance | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `364ffa8213` chore(release): publish subscription hardening package cohort | Dependency/release | UPDATE | Compatibility, installation and package/source boundaries; published history already covers the release |
| `f1a02097b3` docs(master-plan): complete hardening release and downstream adoption | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `1c55efc03b` docs(plans): harden inspection API and performance contracts | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `a0537cfcbc` feat(kiroku-metrics)!: add configurable CORS to inspection servers | Source API / behavior | UPDATE | `kiroku/reference/inspection.mdx`, metrics and tail-recovery guide |
| `6e3024abec` fix(kiroku-metrics): finish portable CORS validation and documentation | Source API / behavior | UPDATE | `kiroku/reference/inspection.mdx`, metrics and tail-recovery guide |
| `5fffd5aee1` feat(kiroku-metrics): serve durable checkpoints through supervised providers | Source API / behavior | UPDATE | `kiroku/reference/inspection.mdx`, metrics and tail-recovery guide |
| `b6d06cab0e` docs(plans): complete checkpoint inspection EP-2 | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `635efb4cda` test(store): record rejected browse SQL promotion prototype | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `450f173a44` test(store): evaluate category-scoped browse reads on existing indexes | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `d63190ee3e` docs(store): coordinate prefix access and cumulative write costs | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `60896759bb` test(store): evaluate name-range browsing with TypeID fixtures | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `1c6905f61d` test(store): research shared category index and benchmark coverage | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `06c70b3954` test(store): prepare matched category index write comparison | Source API / behavior | UPDATE | Kiroku subscription and inspection references; implementation detail follows documented behavior |
| `c7b85ad859` fix(bench): generate valid UUIDv7 comparison plan IDs | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `455fc8c7bb` docs(bench): record verified lifecycle and bounded comparison coverage | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `85bd1f5880` test(bench): retain matched category index cost evidence | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `229f6e5988` fix(bench): separate sparse browse diagnostics from append grading | Source API / behavior | UPDATE | Kiroku subscription and inspection references; implementation detail follows documented behavior |
| `2d73f951d0` test(bench): record corrected observer cost comparison | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `229ce7be0b` test(store): prove shared browse and namespace access prototype | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `9717120a04` feat(inspection): add bounded byte-ordered stream browsing and event reads | Source API / behavior | UPDATE | `kiroku/reference/schema-migrations.mdx`, installation and deploy order; `kiroku/reference/inspection.mdx`, metrics and tail-recovery guide; Store effect, core types, inspection and error semantics |
| `52527bce33` perf(inspection): compare the selected byte-name index with the original layout | Source API / behavior | UPDATE | Kiroku subscription and inspection references; implementation detail follows documented behavior |
| `1224410e00` fix(bench): import only the stream name field for browsing | Source API / behavior | UPDATE | Kiroku subscription and inspection references; implementation detail follows documented behavior |
| `63ed721a35` fix(bench): report throughput changes and slowdown bounds directly | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `b8f1f43477` perf(inspection): retain selected name-index costs and uncertainty | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `c725aac30b` feat(inspection): expose bounded subscription dead-letter reads | Source API / behavior | UPDATE | subscription explanation, resize/rebind runbook, source walkthroughs, metrics and OTel references; `kiroku/reference/inspection.mdx`, metrics and tail-recovery guide; Store effect, core types, inspection and error semantics |
| `ac1d65504f` feat(metrics): converge WebSocket inspection delivery | Source API / behavior | UPDATE | subscription explanation, resize/rebind runbook, source walkthroughs, metrics and OTel references; `kiroku/reference/inspection.mdx`, metrics and tail-recovery guide |
| `1b208dbf84` docs(plan): plan opt-in stream head metadata read | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `7f9e4f05b0` feat(metrics): serve self-describing standalone inspection | Source API / behavior | UPDATE | `kiroku/reference/inspection.mdx`, metrics and tail-recovery guide |
| `d7d740d7a3` docs(inspection): retain standalone evidence and close EP-6 | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `30307c1ed1` perf(metrics): bound tail cache misses by requested stream ids | Source API / behavior | UPDATE | `kiroku/reference/inspection.mdx`, metrics and tail-recovery guide |
| `109d58f57d` chore(release): prepare inspection cohort and retain failed gates | Source API / behavior | UPDATE | Kiroku subscription and inspection references; implementation detail follows documented behavior |
| `25b0b8e581` test(store): freeze stream metadata compatibility and cost baseline | Source API / behavior | UPDATE | Kiroku subscription and inspection references; implementation detail follows documented behavior |
| `daae3f1ab6` feat(store): expose originated stream heads through an opt-in read | Source API / behavior | UPDATE | Store effect, core types, inspection and error semantics |
| `b68cdae0e5` test(inspection): strengthen validation and verify workload gates | Source API / behavior | UPDATE | Kiroku subscription and inspection references; implementation detail follows documented behavior |
| `b55ea74f7e` test(store): record bounded remote stream head evidence | Source API / behavior | UPDATE | Kiroku subscription and inspection references; implementation detail follows documented behavior |
| `05a11baab7` test(store): replace short metadata comparisons with paired release gate | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `b4f044a99a` test(store): accept stream metadata performance with paired evidence | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `89d99bd694` test(perf): retain MP13 paired validation and release hold | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `7394055de4` chore(release): publish the inspection cohort | Dependency/release | UPDATE | Compatibility, installation and package/source boundaries; published history already covers the release |
| `ff113e96bb` docs(release): close MP13 with verified publication evidence | User guidance | UPDATE | Reconcile corresponding reference, upgrade and operating instructions against the implemented source; no plan-derived API |
| `76ffe79804` docs(upgrade): add the subscription hardening migration edge | User guidance | UPDATE | Reconcile corresponding reference, upgrade and operating instructions against the implemented source; no plan-derived API |
| `ad866f925a` docs(improvement-requests): reconcile statuses and plan links | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |

### `mori://shinzui/pgmq-hs`

| Commit and change | Kind | Action | Local documentation / reason |
| --- | --- | --- | --- |
| `48a1ed0f92` fix(test): adopt ephemeral PostgreSQL stable cleanup roots | Test fixture | NO-OP | Stable per-user ephemeral PostgreSQL roots and test-only bounds; production source unchanged |

### `mori://shinzui/keiro-runtime-patterns`

| Commit and change | Kind | Action | Local documentation / reason |
| --- | --- | --- | --- |
| `63d1a9b031` docs(patterns): reconcile published runtime cohorts | Committed normative catalog | ADD / UPDATE | Generated catalog, source ledger, 41 visual assessments and 13 figure reviews |
| `5957590e43` docs(keiro): document mapped construction in DSL adoption guide | Committed normative catalog | ADD / UPDATE | DSL adoption guide: mapped initial/lift construction and retained Hole limits |

### `mori://shinzui/shibuya-kafka-adapter`

| Commit and change | Kind | Action | Local documentation / reason |
| --- | --- | --- | --- |
| `a3c9de8033` docs(plans): point OTel audit reference to consolidated EP-9 | Plan reference | NO-OP | Canonical OTel audit citation only; no adapter source change |

### `mori://shinzui/shibuya-message-db-adapter`

| Commit and change | Kind | Action | Local documentation / reason |
| --- | --- | --- | --- |
| `51a36348ee` fix(test): preserve PostgreSQL settings with stable cleanup roots | Test fixture | NO-OP | Stable per-user ephemeral PostgreSQL roots and test-only bounds; production source unchanged |

### `mori://shinzui/shibuya-pgmq-adapter`

| Commit and change | Kind | Action | Local documentation / reason |
| --- | --- | --- | --- |
| `c443ac349a` fix(test): adopt ephemeral PostgreSQL stable cleanup roots | Tests / plan references | NO-OP | Stable PostgreSQL fixtures, DLQ trace-context proof, default-config fixture repair and canonical plan link; production adapter source unchanged |
| `62d98e3b16` docs(plans): point OTel audit reference to consolidated EP-9 | Tests / plan references | NO-OP | Stable PostgreSQL fixtures, DLQ trace-context proof, default-config fixture repair and canonical plan link; production adapter source unchanged |
| `341c2a903a` test(telemetry): prove consumer context survives DLQ delivery | Tests / plan references | NO-OP | Stable PostgreSQL fixtures, DLQ trace-context proof, default-config fixture repair and canonical plan link; production adapter source unchanged |
| `237575e70c` test: preserve core config defaults in adapter lifecycle fixtures | Tests / plan references | NO-OP | Stable PostgreSQL fixtures, DLQ trace-context proof, default-config fixture repair and canonical plan link; production adapter source unchanged |

### `mori://shinzui/shibuya`

| Commit and change | Kind | Action | Local documentation / reason |
| --- | --- | --- | --- |
| `de42f07a87` chore(release): 0.10.0.1 | Dependency/release | UPDATE | Compatibility, installation and package/source boundaries; published history already covers the release |
| `454257abdd` docs(plans): correct inspection APIs and performance gates | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `02cfcddb8c` feat(metrics): add stable HTTP error codes | Source API / behavior | UPDATE | `shibuya/reference/metrics.mdx`, `app-supervision.mdx`, `telemetry.mdx`, inspection/control how-to and observability explanation; post-tag work explicitly unreleased |
| `b10dd190b9` feat(metrics): add opt-in HTTP cross-origin policy | Source API / behavior | UPDATE | `shibuya/reference/metrics.mdx`, `app-supervision.mdx`, `telemetry.mdx`, inspection/control how-to and observability explanation; post-tag work explicitly unreleased |
| `61648cf83c` feat(metrics): validate WebSocket upgrade origins | Source API / behavior | UPDATE | `shibuya/reference/metrics.mdx`, `app-supervision.mdx`, `telemetry.mdx`, inspection/control how-to and observability explanation; post-tag work explicitly unreleased |
| `87119f1bbe` feat(metrics): finish browser access contract and documentation | Source API / behavior | UPDATE | `shibuya/reference/metrics.mdx`, `app-supervision.mdx`, `telemetry.mdx`, inspection/control how-to and observability explanation; post-tag work explicitly unreleased |
| `30258cc3c6` docs(plans): complete EP-47 with browser access evidence | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `7a2527be72` feat(metrics): report WebSocket protocol errors in-band | Source API / behavior | UPDATE | `shibuya/reference/metrics.mdx`, `app-supervision.mdx`, `telemetry.mdx`, inspection/control how-to and observability explanation; post-tag work explicitly unreleased |
| `0a95fb1c2f` feat(metrics): bound WebSocket delivery through one writer | Source API / behavior | UPDATE | `shibuya/reference/metrics.mdx`, `app-supervision.mdx`, `telemetry.mdx`, inspection/control how-to and observability explanation; post-tag work explicitly unreleased |
| `e1fbebdcc5` test(metrics): make observer captures reproducible and exact | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `ead6436023` perf(metrics): avoid waking writers for empty terminal batches | Source API / behavior | UPDATE | `shibuya/reference/metrics.mdx`, `app-supervision.mdx`, `telemetry.mdx`, inspection/control how-to and observability explanation; post-tag work explicitly unreleased |
| `1e8b9f3d20` fix(metrics): suspend deltas after terminal admission evicts updates | Source API / behavior | UPDATE | `shibuya/reference/metrics.mdx`, `app-supervision.mdx`, `telemetry.mdx`, inspection/control how-to and observability explanation; post-tag work explicitly unreleased |
| `db8e783a47` docs(metrics): close IR-5 with bounded WebSocket acceptance evidence | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `b7567a2b73` feat(metrics): add opt-in latency and oldest in-flight inspection | Source API / behavior | UPDATE | `shibuya/reference/metrics.mdx`, `app-supervision.mdx`, `telemetry.mdx`, inspection/control how-to and observability explanation; post-tag work explicitly unreleased |
| `67f00eca09` perf(metrics): specialize basic workers without detail closures | Source API / behavior | UPDATE | `shibuya/reference/metrics.mdx`, `app-supervision.mdx`, `telemetry.mdx`, inspection/control how-to and observability explanation; post-tag work explicitly unreleased |
| `3384dc5d03` chore(metrics): remove generated audits and summarize verification | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `7468580c01` fix(bench): stabilize full-inbox memory and reject unstable captures | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `aea73a373e` feat(metrics): expose bounded acknowledged cursor progress | Source API / behavior | UPDATE | `shibuya/reference/metrics.mdx`, `app-supervision.mdx`, `telemetry.mdx`, inspection/control how-to and observability explanation; post-tag work explicitly unreleased |
| `529282701d` feat(core): add atomic processor intake pause and resume | Source API / behavior | UPDATE | `shibuya/reference/metrics.mdx`, `app-supervision.mdx`, `telemetry.mdx`, inspection/control how-to and observability explanation; post-tag work explicitly unreleased |
| `ca61711ef7` feat(metrics): expose gated processor intake control | Source API / behavior | UPDATE | `shibuya/reference/metrics.mdx`, `app-supervision.mdx`, `telemetry.mdx`, inspection/control how-to and observability explanation; post-tag work explicitly unreleased |
| `1d646fe720` docs(plans): record remote quick comparison preparation blockers | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `a161614463` docs(plans): record autonomous fast-lane preparation repair | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `ea85f853da` docs(plans): complete browser inspection and control delivery | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `49e785e124` docs(plans): archive unnumbered and deprecated MessageDB plans | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `3fcfb36799` docs(plans): remove archived legacy and MessageDB plans | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `d2b1f44b62` docs: require approval for benchmark scope expansion | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `e7bb21863f` docs(plans): consolidate EP-9 and reconcile implementation status | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `fcd03b5bf3` feat(telemetry): trace processor lifetimes and define disabled context behavior | Source API / behavior | UPDATE | `shibuya/reference/metrics.mdx`, `app-supervision.mdx`, `telemetry.mdx`, inspection/control how-to and observability explanation; post-tag work explicitly unreleased |
| `8a99b091ab` docs(plans): close OpenTelemetry audit with integration evidence | Supporting evidence | NO-OP | Tests/benchmarks, plans, requests, or build metadata; no additional documented runtime contract |
| `7ddb516bcc` revert(telemetry): remove remaining plan 9 implementation | Source API / behavior | UPDATE | `shibuya/reference/metrics.mdx`, `app-supervision.mdx`, `telemetry.mdx`, inspection/control how-to and observability explanation; post-tag work explicitly unreleased |
| `cbdd362225` fix: restore mistakenly reverted telemetry implementation | Source API / behavior | UPDATE | `shibuya/reference/metrics.mdx`, `app-supervision.mdx`, `telemetry.mdx`, inspection/control how-to and observability explanation; post-tag work explicitly unreleased |
| `0967f450b6` fix(telemetry): preserve shutdown cancellation across span callbacks | Source API / behavior | UPDATE | `shibuya/reference/metrics.mdx`, `app-supervision.mdx`, `telemetry.mdx`, inspection/control how-to and observability explanation; post-tag work explicitly unreleased |

## Releases and metadata

Requeried all 33 package identities on 2026-10-14: 31 published packages and two confirmed
Hackage 404 declarations. The latest three versions per published package remain the 93 versions
already listed in [release evidence](changelog-release-review.md). All 57 remote/local tag rows
covering those 93 package releases match their peeled full commits; changelog notes were read at
those commits. The latest 31 Cabal files have no metadata revision (`x-revision` absent/zero).

| Release action | Outcome |
| --- | --- |
| New published version | NO-OP: none missing from the existing histories |
| Latest package metadata | NO-OP: all 31 packages remain at revision 0 |
| Source-only/archived declarations | NO-OP: Kiroku test support and Message DB adapter still return confirmed HTTP 404 |

## Deliberate exclusions and independent boundaries

- Keiki SCXML and Shibuya browser/control/detail/progress/telemetry additions are documented as
  committed, unreleased APIs. Candidate Language 6 remains candidate in published Keiro 0.21.
- PGMQ inspection/disconnect fixes remain unreleased. Keiro/adapter server long polling still
  has the documented pool-starvation/client-disconnect defects; planned client polling is not asserted.
- Proposed DSL compatibility retirement, version-aware source upgrade tooling, outbox fencing,
  parent/child crash recovery and ops message-ID remediation are not inferred from requests or plans.
- Finite benchmark evidence adds no general throughput, latency, or memory guarantee. No remote
  benchmark or upstream Haskell suite was run for this documentation pass.
- The catalog publication moves to `mori://shinzui/keiro-runtime-patterns` at
  `5957590e4370f6a791ef1f7480c00c3809526f6c`. It preserves all eight owner watermarks; the owner
  retains Keiki at `127d348a`, Shibuya at `de42f07a`, and PGMQ at `696b6bd2` because later work is
  unpublished. The exact captured ledger, rather than the site API pointers, defines those boundaries.

## Verification and page accounting

The final `KEIRO_DOCS_SKIP_FONTS=1 nix develop -c bun run check` passed. Licensed font copying was
skipped; the production build and static-output guard still completed. The gate includes all
19 tests, pattern integrity, prose and terminology checks, TypeScript, lint, formatting, navigation,
diagrams, production prerendering, and link checks. Prose reported zero errors and 2,773 editorial
findings; lint retained three existing warnings and zero errors. Navigation checked 65 metadata
files and 617 pages; all 259 SVG assets are referenced. The dedicated internal-link checker checked
617 files with no broken links. Linkinator exited successfully but scanned zero links, so it adds
no coverage claim. A separate anchor review checked all 110 internal anchors in changed authored
pages; generated pattern anchors are checked by the importer.

All 13 affected pattern figures passed expansion/close checks on desktop and at an actual
390-pixel frame width, including horizontal scrolling. Both light and dark SVG renders were
inspected, including the updated Kiroku migration manifest. Browser checks covered all six new
product pages, the two new standards, search discovery, source details, scoped history, and copied
and opened Markdown. See [publication evidence](patterns/publication-review.md) for the figure
and browser results. The temporary responsive-test page was removed.

| Page group | Added | Updated | Retired |
| --- | ---: | ---: | ---: |
| Keiki | 1 | 3 | 0 |
| Keiro | 1 | 20 | 0 |
| Kiroku | 3 | 17 | 0 |
| Shibuya | 1 | 9 | 0 |
| Shared getting started | 0 | 2 | 0 |
| Shared integrations | 0 | 5 | 0 |
| pg-migrate composition | 0 | 1 | 0 |
| Generated runtime patterns | 2 | 97 | 0 |
| **Total** | **8** | **154** | **0** |

These are unique MDX pages, excluding navigation JSON, evidence files and SVGs. Generated updates
include immutable provenance changes: 39 existing concepts materially changed, two concepts were
added, and 49 concepts retained their prior material content. All 41 changed/new concepts were
reassessed for presentation; the catalog now has 90 concepts, 16 reserved files, and 740 graph
edges. The independent Kiroku adapter review is reflected in shared integration and source-tour
pages rather than counted twice. PGMQ, Kafka adapter, PGMQ adapter, and archived Message DB adapter
changes require no additional product pages; their test/plan-only changes have explicit NO-OP
rows above. pg-migrate and the standalone example have no new upstream commits; the composition
page changes only because the imported runtime migration inventory changed.

The final Mori-resolved status reports all 12 boundaries at their committed heads, with the
catalog publication marked `reviewed` and no review issues. Ten pointers advanced; the two
already-current pointers stayed fixed. No missing published release remains. Remaining source-only
and proposal gaps are explicitly qualified above. The catalog's `--check-upstream --ref` comparison
also passes at the full selected SHA and reports a clean owner checkout. `git diff --check` is clean.
