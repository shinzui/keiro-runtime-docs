# Source sync — 2026-10-27

Library and release review. Runtime catalog publication is independent.

## Commit ledger

Each row retains its own review outcome; pending rows prevent a pointer advance.

### `mori://shinzui/shibuya-kafka-adapter`

Target: `9a1bce84c1a537de5b1ef64d968505b2e8321ea0`. Baseline: `a3c9de8033801214c979864554b405ef1f56006f`.

| Commit | Change | Action |
| --- | --- | --- |
| `9a1bce84c1a537de5b1ef64d968505b2e8321ea0` | docs: refresh README usage and runtime guidance | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `52a63a1353487da589b5e56468c9193147f448a7` | chore(release): 0.12.0.0 | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `ac1fa3326e1664081617b5551938325be5a6c664` | docs: plan source wakeups after rdkafka-hs migration | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `a8febe77064a1bebdc7052a788760168550ac423` | docs(plans): record completed live Kafka retry acceptance | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `10a28b28dc4d5de7bd4d93728653dd93e0e0d06e` | test(kafka): use project-local Redpanda for integration tests | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `e80745214021f528fe8a83debc6fc8fa020cb282` | fix(kafka)!: skip buffered successors until a retried record resolves | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `49788ef05d77c306e2ac1e3896c689624723041b` | fix(kafka): retain replayed successors behind pending retries | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `b15d8417806edae6f41a34575831216dcae4df79` | docs(plan): tighten consumer queue drain correctness checks | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `79333a2aa1277f39af8e72bee0d3d45674be647b` | docs(plan): correct superseded delivery implementation plan | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `2fb92a22d0a1a3ee7817a20bf15d4c7ef5be4842` | docs(plans): validate retry source gate implementation plan | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `7fed1e2efb385247051bb604104d9b551101d877` | chore(seihou): upgrade nix-haskell-flake to 0.35.0 | NO-OP — build and agent tooling |
| `2fb49b6ec1827763bb31275a49fa6e4e4845df9e` | chore(seihou): apply agent-gitignore, exec-plan, master-plan updates | NO-OP — build and agent tooling |
| `f17025cd1edf4ef6c50ef266378643813e00479d` | chore(deps)!: upgrade Shibuya to 0.11.0.0 | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |

### `mori://shinzui/keiro`

Target: `beb9ef03a630fc508f116ae352d9d94da1e3680f`. Baseline: `e6ef560b0a8db0dc091d0f8d7da1bb08c29155be`.

| Commit | Change | Action |
| --- | --- | --- |
| `beb9ef03a630fc508f116ae352d9d94da1e3680f` | docs: refresh guides and user documentation for 0.22 | UPDATE — release/API guidance updated; full source closure pending |
| `3490d16432e4332c4aeeee5aad35783e94e2c9d8` | test(release): retain resumable workflow acceptance evidence | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `522fd54c86727c5e770bbf4e070c31e9e56aae02` | fix(release): retry truncated Hackage metadata with bounded backoff | UPDATE — release/API guidance updated; full source closure pending |
| `82ad8439ba118826673d36b04bb552370dc473c6` | fix(release): preserve receipts across execution-plan progress updates | UPDATE — release/API guidance updated; full source closure pending |
| `5b54849002aabd1e833d0d37708cc4aa9813cec3` | fix(release): verify the published upstream blueprint payload | UPDATE — release/API guidance updated; full source closure pending |
| `2599c884c99a2b586724d0aadf794db77e919ce3` | chore(release): finish the repeatable release procedure | UPDATE — release/API guidance updated; full source closure pending |
| `f3dbcf0bfdcb7ff04bc0e2aded86e24ac9ec8d76` | fix(release): complete input checks and batch documentation builds | UPDATE — release/API guidance updated; full source closure pending |
| `b63acb6b440a19b65a1a440cc6df40b0639f127b` | feat(release): preflight and resume verified release stages | UPDATE — release/API guidance updated; full source closure pending |
| `b28201f2063fa4f6dcb724cbf474959107e36b74` | chore(release): reconcile the published release candidate | UPDATE — release/API guidance updated; full source closure pending |
| `fb6e3cff120e4035269ca9e34cbe9715092bd5c8` | chore(release): 0.22.0.0 | UPDATE — release/API guidance updated; full source closure pending |
| `d106a92c41308fe5d6485b58885fe1cc669b0461` | chore(release): 0.22.0.0 | UPDATE — release/API guidance updated; full source closure pending |
| `e88ae813277c8d23c678731fd72e64a745cc3fd6` | fix(dsl): compile and sample consumer enum literal guards by canonical key | UPDATE — release/API guidance updated; full source closure pending |
| `fcf1cee111c7a8d2cdd86b83a6ff48c6b4605d33` | fix(dsl): sample literal-guarded structural enum commands by wire key | UPDATE — release/API guidance updated; full source closure pending |
| `9e9fbc8554a0e8f38f202ff6770501e0ab2287d9` | docs: complete structural enum equality execution plan | UPDATE — release/API guidance updated; full source closure pending |
| `93482cb5784dcb692194b4408589f400a6c9a99c` | test(dsl): qualify structural enum equality and replay identity | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `613fe4455176644ab4084bed315ba03a72dfbeda` | feat(dsl): support exact mapped structural enum equality | UPDATE — release/API guidance updated; full source closure pending |
| `aa16e404dfe1b80d4424dc381e5f734c9f44b260` | docs: plan category consumer discovery | UPDATE — release/API guidance updated; full source closure pending |
| `96d863ebeb2a5a1dbe077a1d9bc96e9276c86c2a` | docs(inspection): accept measured overhead and complete manager discovery | UPDATE — release/API guidance updated; full source closure pending |
| `f7e7b867369fc0b8f9e39c530b15bd6f751c829e` | test(inspection): retain final gates and unresolved performance evidence | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `bc4799c33f953dada4685031020aa898591c23c6` | perf(inspection): bound direct encoding of manager type responses | UPDATE — release/API guidance updated; full source closure pending |
| `96ba2d7d6fbd30fc12009af83a34cbe1aa41829f` | test(inspection): retain discovery checks and pre-change guard logs | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `40126be1239811c3a2034a76b7fbfd8cf83ef9bc` | feat(inspection): list mounted process manager types | UPDATE — release/API guidance updated; full source closure pending |
| `50869edbe22ef49080712f29d948b58cc1b9cd7a` | docs: plan workflow status counts with performance gates | UPDATE — release/API guidance updated; full source closure pending |
| `c3c73edf2c4b246b18d6daebb856a4ddcc3745d1` | docs: strengthen legacy retirement safety and performance plan | UPDATE — release/API guidance updated; full source closure pending |
| `d61aabcfdaa4af14aef59712f10deb4826f0e99b` | docs: clarify MP-45 release closeout milestones | UPDATE — release/API guidance updated; full source closure pending |
| `dcedc6802b8cb9c94274addab3d62acf1f789661` | docs: plan mounted process-manager discovery and link IR-56 | UPDATE — release/API guidance updated; full source closure pending |
| `64faafcfbffd5fca49f4c72b8f2d3ea13a30b80e` | docs(dsl): plan mapped structural enum equality | UPDATE — release/API guidance updated; full source closure pending |
| `e1d45f21d544178023ca953c91af4986afd40f08` | docs(keiro): refresh inspection cohort release handoff | UPDATE — release/API guidance updated; full source closure pending |
| `47f3e99d5a9de14c2943b845dea3edc530c78cc6` | docs: request mapped structural enum equality support | UPDATE — release/API guidance updated; full source closure pending |
| `063ef583196305b1535e4acd8dec6c85751a89d5` | docs: complete REV-20 remediation with full release-gate evidence | UPDATE — release/API guidance updated; full source closure pending |
| `a4332cfe9d6160a69c2d57005892c5f03a8a9ef3` | docs(bench): accept attributed baselines and three complete guard passes | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `4f2b4b69fdfd1231282e453b79ee95d1b5c36199` | fix(bench): make acceptance controls portable in the Nix shell | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `03e76d106ffded200d4ed071f39a422932b6de48` | fix(bench): compare adjacent producer workloads at the existing ceiling | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `dfa9944c3d29accefa0133af9c14e966a3af713b` | feat(bench): record attributed durable baseline medians | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `b8695a0d050c5b0db2f251887d43182da2b47eed` | feat(bench): attribute fresh producer work before baseline recording | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `fb2419945a4cdf472dd75333ec610e3ec21a6712` | docs(bench): accept the isolated fixed-workload harness | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `ee2f2667dcf66058661e4baa4a12b7d3e946edeb` | fix(bench): settle checkpoint work before selected warm-up | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `cfc5704639804fa34623a15efa10afee08bed0b1` | fix(bench): compare projection controls at adjacent growth points | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `3eca81972091dc9517873fc93114f10cdb93da17` | fix(bench): verify retained work and establish read-model statistics | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `847b395c9383b6b532fd5332ac11be7505f09016` | docs(inspection): qualify the URI parser dependency reference | UPDATE — release/API guidance updated; full source closure pending |
| `9a5ffc5fe402ecec1394aa859a4d10f89ab1c6ec` | fix(bench): align sampled statistics, work bounds and guard settings | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `3f79b221a2cb19cd831348009deba48f2ed9e9d8` | feat(inspection): inspect reaction state and reconcile release guidance | UPDATE — release/API guidance updated; full source closure pending |
| `c4901cd6311dff408268bc7fcf8ae28c45721992` | fix(bench): bound rebuild bookkeeping independently of replay work | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `4f20bb64b25e3a668a2c75829507f17e1da82939` | fix(inspection): bound workflow browsing and HTTP delivery | UPDATE — release/API guidance updated; full source closure pending |
| `fa2e1d7aeed002a89f454860bc55e8dad786f34f` | fix(bench): use durable fixtures and expose reset cost probes | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `85fbdce647bbc361e600c607c386f23c267a8a40` | refactor(bench): isolate selected fixtures and fix rebuild input | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `f3603a821be9e1011ed581e8b261d0be4ea9eb2b` | docs(improvement-requests): request four inspection reads from the console (IR-56..59) | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `7ee722a7e3f7da4820b46389cfa4baa81cd898ed` | docs(improvement-requests): request a jitsurei-backed inspection host (IR-55) | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `b63ed846fc314ece2f68b0a7156bea484fea2f6b` | docs(plans): address master plan 46 review findings | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `8d247663f6f8a6ea0de47f2cb4dfd02f6125ec12` | docs(plans): add plan 321 to isolate the keiro-bench harness | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `77de4930565d8bd1d010a766ccac4a3984f7d441` | docs(plans): attribute the command-guard slowdown to the benchmark harness | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `031619241c2f94797e6b0567a234c48c279527c4` | build(verify): run every benchmark guard and gate releases on them | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `f242fc2e96dcf7cc8e7163c292457c076824a60b` | docs(plans): plan the REV-20 follow-ups as MasterPlan 46 | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `f22596572ebcf1c36ab4de4b2af10e3957a80150` | docs(reviews): record REV-20 for 0.20, 0.21 and the unreleased cohort | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `a62850d33f47db60c55e91012f24c9a2a9e0ed3b` | docs(inspection): record final core-path acceptance | UPDATE — release/API guidance updated; full source closure pending |
| `5893c7eb30383eec152eaf8cdee8eaaf0f919b34` | perf(inspection): keep workflow browsing off the writer schema | UPDATE — release/API guidance updated; full source closure pending |
| `88b56fc1e301c84fb63c4666af2debc2e5930b97` | fix(ops-http): release completed connection handles promptly | UPDATE — release/API guidance updated; full source closure pending |
| `8b8785c97d94f369e1c3e163ea1ccf2683ec4654` | feat(inspection): compose allocated applications under prefixes | UPDATE — release/API guidance updated; full source closure pending |
| `df2d588d3a41c6c94a9f5e575017c19a9ea8f077` | feat(inspection): share bounded websocket views | UPDATE — release/API guidance updated; full source closure pending |
| `a5e0addc4d8b31a51caee790db98aa0e5cc0768a` | feat(inspection): page projection status before reading owner views | UPDATE — release/API guidance updated; full source closure pending |
| `ee637be51cfcdd0762c060df3d719d4a877ce5c6` | feat(inspection): expose manager timer and shard observations | UPDATE — release/API guidance updated; full source closure pending |
| `e181cd46f78f594e8561da94cd115d04db1a68c5` | feat(inspection): add explicit bounded legacy reaction provenance | UPDATE — release/API guidance updated; full source closure pending |
| `d1db53761b725208d00a74e0a11be2354e001da2` | feat(inspection): expose aggregate state and snapshot reads | UPDATE — release/API guidance updated; full source closure pending |
| `842535ac4396815f259b4079bf85246b065c77ae` | perf(inspection): reuse exact bounded header presentations | UPDATE — release/API guidance updated; full source closure pending |
| `5f5cafccc28bc17bd796546c3ed4133a953f1810` | perf(inspection): guard workflow indexes and bound wide-key reads | UPDATE — release/API guidance updated; full source closure pending |
| `e80a7ee72c4707fd1de4bf7833f479171c2dea9b` | fix(inspection): bound outgoing workflow continuations | UPDATE — release/API guidance updated; full source closure pending |
| `f24f569d02301b7faa48b5fc12a0b674bdb855b3` | perf(ops-http): compare live schema in PostgreSQL | UPDATE — release/API guidance updated; full source closure pending |
| `d9960626341532d39653b0a335335c6858d8f716` | feat(workflow): add bounded inspection pages and operator routes | UPDATE — release/API guidance updated; full source closure pending |
| `37d3567bab45275cf757925b4df9973a867dc9b1` | feat(ops-http): serve bounded operations with explicit mutation confirmation | UPDATE — release/API guidance updated; full source closure pending |
| `e0343d1a8e57928d09a29dcca2ff4b9bc4603300` | feat(ops): export the command tree and schema verifier session | UPDATE — release/API guidance updated; full source closure pending |
| `3bf3ac229f21d6c95179ce49b5e8f6323322f99b` | chore(seihou): update link-skill to v0.4.0 | NO-OP — build and agent tooling |
| `3c4e3563c379eb49b380469e4a81226090abb21a` | build(nix): upgrade shared flake template to 0.33.0 | NO-OP — build and agent tooling |
| `ea6cbc874456a96bf7663332ed07c36bd1a35c59` | chore(seihou): apply agent-gitignore, exec-plan, master-plan | NO-OP — build and agent tooling |

### `mori://shinzui/keiro-runtime-jitsurei`

Target: `b9bcf3c12597575545d641ca830aea65738cfd7b`. Baseline: `e3c800eb9d010289e05aa00390a38973a1ac239d`.

| Commit | Change | Action |
| --- | --- | --- |

### `mori://shinzui/kiroku`

Target: `53c43e9fbc282886841e044630bd3fb99da4f85c`. Baseline: `ad866f925ac11484a2ee758fe235035840c85c0a`.

| Commit | Change | Action |
| --- | --- | --- |
| `53c43e9fbc282886841e044630bd3fb99da4f85c` | docs(upgrade): publish the Store 0.12 namespace cutover edge | UPDATE — release/API guidance updated; full source closure pending |
| `22d103e4f424caab06c6a2b76ad92b408c262bc0` | chore(release): kiroku-store 0.12.0.0, kiroku-store-migrations 0.7.2.0, kiroku-otel 0.3.0.0, kiroku-cli 0.2.0.11, kiroku-metrics 0.4.0.0, shibuya-kiroku-adapter 0.7.0.0 | UPDATE — release/API guidance updated; full source closure pending |
| `5a847ccae83a13cde9c4da3744d8639a3fa210e1` | chore(deps): upgrade Shibuya to 0.12.0.0 | UPDATE — release/API guidance updated; full source closure pending |
| `bfec8dc634e1b91c5e4eefbc03a6daa26c55e699` | docs(plan): close namespace subscriptions with practical acceptance | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `5dd9389133e2d0154dfc9d4fe8df93eda748c9b5` | docs(perf): retain verified namespace comparisons and acceptance limits | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `ad4e52746e707ed3574eaa6cbe467d52db7b4f2f` | fix(bench): record complete Kenshou steady load windows | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `319adb8f99d85e6da490b7bf1e813471d000defc` | bench(store): prepare matched Kenshou namespace comparison | UPDATE — release/API guidance updated; full source closure pending |
| `94c2839f4b9a51bff2bfead57b8e587389a7875f` | docs(perf): prefer Kenshou for namespace release evidence | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `2f24acdc21469b09db62f93e9aead2a6b1bfb76a` | docs(ops): record verified Yujin cell SSH access | UPDATE — release/API guidance updated; full source closure pending |
| `a9b84f38dbdbe3f0d4a980bb07096789a672125e` | docs(store): retain namespace evidence and blocked performance acceptance | UPDATE — release/API guidance updated; full source closure pending |
| `c5ca341f42904870070877ebb9d446e114d85de3` | bench(store): add focused namespace comparison to inspection probe | UPDATE — release/API guidance updated; full source closure pending |
| `9e1efe1b3c503b8e902b0720e4c767f1d9dcb66d` | perf(store): avoid payload probes for empty namespace windows | UPDATE — release/API guidance updated; full source closure pending |
| `df5d9735040dc812bb09165c57bc5ec4a8bfa7ba` | feat(store): add bounded category namespace subscriptions | UPDATE — release/API guidance updated; full source closure pending |
| `dca39a386b7cfb1647fd0003099eb1b904e1575a` | docs(plan): refresh namespace subscription design and cost controls | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `2d9ad5153cc4b2edeb8212d6cab17ce9bdec5262` | chore(deps): upgrade Shibuya to 0.11.0.0 | UPDATE — release/API guidance updated; full source closure pending |
| `9f1ecbadcf3419a916be0e975220450974625176` | docs(improvement-requests): reconcile status metadata and plan links | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `b42d7ba91a4e87749f07f23d5d3862a1aae6b1d9` | docs(plans): remove archived unnumbered legacy plans | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `adb7b429d9b373117a315e7c411445cc356b27ba` | docs(plans): archive unnumbered legacy plans | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `757093a8b56ec032f9be030234b6f440973f0c15` | docs(plans): defer transactional subscriptions and close category-read work | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `1464fc4dc139be02b35c6cabdc3a1d123c723069` | docs(plans): reconcile completed append and subscription plans | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `f32aec32c00ea97cae76b13653f31ee90ce357f4` | docs: defer incomplete legacy group recovery and correct guidance | UPDATE — release/API guidance updated; full source closure pending |
| `c09279d06033f0a862cc3d7b3459f26a3b30704b` | docs: reconcile the 0.10 and 0.11 release surface | UPDATE — release/API guidance updated; full source closure pending |
| `9d8a9e8642946299918e34ec1fd3ae116db4bc31` | fix(store)!: close subscription startup and recovery gaps | UPDATE — release/API guidance updated; full source closure pending |
| `8cb2d01e80ef500589f31eef8321cfe7429f1401` | docs(plans): narrow legacy recovery scope and reconcile release plan | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `c3c12493261073c4a484b15ad6699d113e760cc8` | fix(inspect): classify startup failures and force repeated-signal exit | UPDATE — release/API guidance updated; full source closure pending |
| `f520c19e125c5c44d9195c6f28338aa1fcad3dc1` | docs(metrics): explain default WebSocket refusal and proxy migration | UPDATE — release/API guidance updated; full source closure pending |
| `8149084df19269d61ee5746f7d065ea19d56f3a8` | fix(metrics): refuse Origin-bearing upgrades when CORS is disabled | UPDATE — release/API guidance updated; full source closure pending |
| `c6e07f7eb8bcd971ea44664dd3ad8ce8925f90c3` | docs(plan): address subscription hardening review findings | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `f36148aae02b6754d3dedc126a354cd7e3b22769` | docs(plan): address inspection hardening review findings | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `c7fd9cc0d0187f612c89b312bd6686a17e525106` | docs(plan): clarify legacy consumer group resize recovery | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `93ef392ae4606820efe81e48b22ec3d36d0c8047` | fix(perf): complete the accepted category append workload gate | UPDATE — release/API guidance updated; full source closure pending |
| `22ac4debd152e0769b09c4f943320b8d33be0f8d` | docs(perf): accept category-read write-cost compromise | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `87ca2efa5e8e0fcb6d080fc80e7a8098e94baab9` | test(bench): retain bounded single-event append probes | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `92860a128f72ac999446cb8f357119cfdca9cd10` | test(bench): diagnose category append cost with balanced controls | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `657d116f51fa5fb03fadcd77c70fa52893e5858c` | fix(bench): reject invalid append-category workload measurements | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `bbd84ccc1b9d0f7489ed21711d0236d37477385a` | chore(nix): adopt nix-haskell-flake 0.35.0 upstream changes | NO-OP — build and agent tooling |
| `b2257240b3533b0926fe281676b5bc8fffbc8978` | chore(seihou): apply exec-plan and master-plan module updates | NO-OP — build and agent tooling |
| `5e4a54bb0bcfb8bc76d97e40d2f283e123687643` | docs(improvement-requests): request global positions on single-stream reads (IR-20) | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `ea364cf65bda1d067927668f00cf4eaabc279657` | docs: plan the subscription worker observability and decode-filter fixes | UPDATE — release/API guidance updated; full source closure pending |
| `6070a9f988e0b14b60e59adea2fb96c69775ca5a` | docs: plan the 0.10 and 0.11 release-surface reconciliation | UPDATE — release/API guidance updated; full source closure pending |
| `20303a5b3d1339deb95f5325e8ed5c4a2e2a7271` | docs: plan Origin-bearing upgrade refusal and kiroku-inspect hardening | UPDATE — release/API guidance updated; full source closure pending |
| `0837936ccd3718522f560271a274e80129ecb61e` | docs: plan a seeded resize for legacy consumer groups (BUG-5) | UPDATE — release/API guidance updated; full source closure pending |
| `f59721e3fc99863e7e0968b400678cad9ffb54f2` | docs: plan the append-category-column cell repair and 0012 write-cost measurement | UPDATE — release/API guidance updated; full source closure pending |
| `5c03fb270cfbb1f3cab31e175a967076b4443275` | docs(reviews): record REV-1 to REV-4 for the 0.9 to 0.11.0.1 cohorts and file BUG-5 | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `e2cdc892b9052e4aaca8944c0db5d38d566b613a` | chore: apply seihou agent-gitignore, exec-plan, master-plan modules | UPDATE — release/API guidance updated; full source closure pending |
| `75aafca913483ef08f741d6414f9e8734481f712` | docs: complete structured error release verification | UPDATE — release/API guidance updated; full source closure pending |
| `084fd8359850342447cdda8e632b7dc456c7fca4` | chore(release): kiroku-store 0.11.0.1, kiroku-metrics 0.3.0.1 | UPDATE — release/API guidance updated; full source closure pending |
| `03cedaa2f394c9bfdcf05d3488625702c1cc7953` | docs: record structured error validation and release readiness | UPDATE — release/API guidance updated; full source closure pending |
| `f7b48b129acfbfcf1128f16281d60590a899e7ac` | fix(store): preserve structured script session errors | UPDATE — release/API guidance updated; full source closure pending |
| `b152a4a367399a881d81385ad6f6bc3def4a4608` | docs: plan structured script session error preservation | UPDATE — release/API guidance updated; full source closure pending |
| `4bd90fd0ca5be8b7bc4e683b1a218e622304df08` | docs(improvement-requests): request structured script error preservation | NO-OP — plans, tests or benchmark evidence; no public API claim |

### `mori://shinzui/pgmq-hs`

Target: `88afb93802f790c1ecfbd3ed8bcce196c4430d13`. Baseline: `48a1ed0f92c6d52e8009f396fe21d380c364ab14`.

| Commit | Change | Action |
| --- | --- | --- |
| `88afb93802f790c1ecfbd3ed8bcce196c4430d13` | chore(release): release 0.7.0.0 | UPDATE — release/API guidance updated; full source closure pending |
| `db754e02346f9e6dd55256c81019ae1565e15a77` | docs(release): record 0.7.0.0 acceptance and close master plan 6 | UPDATE — release/API guidance updated; full source closure pending |
| `5bbb311d962edc17cd805f90eea5d4a8e2242773` | chore(release): prepare the six-package 0.7.0.0 candidate | UPDATE — release/API guidance updated; full source closure pending |
| `fe2804f87115c8b5bcd20dfe29596e0f3f996674` | feat(pgmq-config)!: report collisions and unsupported partition notifications | UPDATE — release/API guidance updated; full source closure pending |
| `96ef53816b13b0d5837d8467a0f045b7e3c29e8b` | test(pgmq-config): reproduce collision and partition notify mutations | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `2748f074f640985fef268a197b1684aad32d4e39` | docs(pgmq-migration): announce notification guard migration | UPDATE — release/API guidance updated; full source closure pending |
| `4b9585e5eae7425fb8970fe7c5c386e7566c6fdc` | fix(pgmq-migration): restrict notification fail-open to ordinary queues | UPDATE — release/API guidance updated; full source closure pending |
| `dba390f003cc4e13c094422191b137e2f9edaae9` | test(pgmq-hasql): reproduce partition notification storms | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `523e6f12329fe4659b410339393dc6042ae77dd9` | docs(plans): refresh notification release acceptance | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `5cb33cfd600766f1fb6f1856c78c9a5c92d12ce7` | docs(plans): correct notification and release acceptance gaps | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `ef1b99c07c6a92e81d5e0107da2120f8bfb0011d` | chore(nix): upgrade nix-haskell-flake 0.24.0 -> 0.35.0 | NO-OP — build and agent tooling |
| `d66c73558e39eaeb97751c9e361c96e954956128` | chore(seihou): apply agent-gitignore, exec-plan, master-plan modules | NO-OP — build and agent tooling |
| `d6750a6e0cd166ed9924da211c653c076326376a` | fix(inspect): align CLI bounds and complete master plan acceptance | UPDATE — release/API guidance updated; full source closure pending |
| `96e7abe89ed7d6d0d89402210a6f500908ff53d7` | feat(inspect): ship standalone server and OpenAPI adoption contract | UPDATE — release/API guidance updated; full source closure pending |
| `ca36e865d777794ded9902cd9d52d30b9f3f8a4b` | docs(inspect): publish live feed contract and complete EP-4 | UPDATE — release/API guidance updated; full source closure pending |
| `c5daf9bbddd4ce69461968b5c93e9c376672efd3` | feat(inspect): add reconnecting shared notification listener | UPDATE — release/API guidance updated; full source closure pending |
| `2555f0e435d840026df063b0db175b4c79630fcd` | feat(inspect): add shared poll-driven WebSocket feed | UPDATE — release/API guidance updated; full source closure pending |
| `47f2cdb75fd19b0c79dbd9945c304c283dda19df` | feat(inspect): wire HTTP package and publish its contract | UPDATE — release/API guidance updated; full source closure pending |
| `6db2238c186b0e21648359b5e6cb4ba57d2919d5` | feat(inspect): add bounded read-only HTTP inspection | UPDATE — release/API guidance updated; full source closure pending |
| `38a2c07da1f46d855fa655ab11a96a1190ca9ccd` | docs(json): publish the wire policy and complete EP-2 | UPDATE — release/API guidance updated; full source closure pending |
| `cb3c047749d88bc5cd3805245df9414246cd43d1` | feat(json): add stable inspection record codecs | UPDATE — release/API guidance updated; full source closure pending |
| `7439370fd9b71b7d0e8dacd98cf7917cd576b498` | test(hasql): verify inspection paging and partition costs | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `947413de7bb63d711d314abf37e1da6ab6af67fb` | docs(inspect): revise API contracts and performance acceptance | UPDATE — release/API guidance updated; full source closure pending |

### `mori://shinzui/shibuya-pgmq-adapter`

Target: `e549451978f93f28ccb39912404be9a8a3fea4d7`. Baseline: `237575e70c10bb2e53fe19bb2c6efcd9cda6b2c1`.

| Commit | Change | Action |
| --- | --- | --- |
| `e549451978f93f28ccb39912404be9a8a3fea4d7` | chore(release): 0.18.0.0 | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `c0aadaafdd073f0b23316d18efbf1021837caae5` | docs(dlq): record final validation and source-package handoff | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `e3cc194a145da6fe73354f0961c0ef4e01c18971` | fix(bench): right-size the FIFO source fixture for acknowledgement sampling | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `cce7e0f6ba30706e188d51740fda2caf6945d5b3` | docs(perf): distinguish FIFO uncertainty from a demonstrated regression | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `17376883651edc7c0cd3861d2aa06edfa0ad0a93` | refactor(bench): remove one-off performance extension workflows | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `081ad7fc6a5566638d60a3b3ac2ceaf6735a2abc` | docs(dlq): finalize implementation evidence and retain open performance gate | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `6e99c40e8a2eb77e90b0a5d3223b691e2738d85b` | feat(bench): preserve complete encoding comparisons in fixed extensions | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `b85da6c1cd4a36f85d7f7eaafac7c68474e431cf` | fix(bench): resume retained evidence with sufficient FIFO load samples | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `7dc3976fbbb1dd9eb5ce29c7ac38cbcbabbd1f0f` | feat(bench): retain all worker pairs in fixed-count reassessments | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `d4dfba17d0be431ed6b7f7e30ad7f8722b4166d8` | fix(bench): measure short worker latencies with raw monotonic time | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `131d1386a1f13d17b3eb329f1e3460437c2c6d4c` | fix(bench): complete fixture maintenance before paired measurements | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `a4de66428a67e81a12dc15971c617517fc2e8546` | fix(bench): count original worker completions by source message ID | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `25cb5198313ef0d4a84e0d33d76e4134e9dc8f63` | feat(dlq): enable managed administration and add performance acceptance runner | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `6241ed8b052c57ccbd3fe70681730d8e5735445b` | chore(deps): upgrade shibuya to 0.12.0.0 | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `e5f26b7e428c4e85dbf2be5c8c180b68decb0f54` | chore(deps): upgrade pgmq-hs packages to 0.7.0.0 | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `51f05d8bbc7007c911054d4438a68110aaeca627` | feat(dlq): add managed browse and gated redrive preview | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `d3d714f70357cdf54e1e889af4e4e247fe7a615b` | docs(plan): require DLQ performance regression gates | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `e06e64b268055aca4eff78caabd1b0eb73aa1cd1` | docs(plan): plan DLQ browse and gated redrive | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `96e23fc25549c8558892cc66b42ddb014c0e7a14` | docs(plan): validate deferred legacy DLQ field removal | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `59231d20af8985187ca05e8784bde590873b1275` | build(nix): adopt nix-haskell-flake 0.35.0 and track module .envrc | NO-OP — build and agent tooling |
| `c6c69e42f599477f1a0f29cb83bd2dda8db1b1e9` | chore(seihou): apply agent-gitignore, exec-plan, master-plan updates | NO-OP — build and agent tooling |
| `41d977a9a122094840cf54cc8b1c6e68565b105a` | chore(deps)!: upgrade Shibuya to 0.11.0.0 | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |

Excluded uncommitted work: benchmark and performance evidence; no dirty source imported.

### `mori://shinzui/pg-migrate`

Target: `13865052bef62688c40576ad36889221a0ba7e08`. Baseline: `13865052bef62688c40576ad36889221a0ba7e08`.

| Commit | Change | Action |
| --- | --- | --- |

### `mori://shinzui/keiki`

Target: `b6a60c25ad5cdaa50c79d7592790a1b073ba7846`. Baseline: `b6a60c25ad5cdaa50c79d7592790a1b073ba7846`.

| Commit | Change | Action |
| --- | --- | --- |

### `mori://shinzui/keiro-runtime-patterns`

Target: `62531b00b415785be61584a3c44b569fdfb35c4e`. Baseline: `5957590e4370f6a791ef1f7480c00c3809526f6c`.

| Commit | Change | Action |
| --- | --- | --- |
| `62531b00b415785be61584a3c44b569fdfb35c4e` | docs(patterns): reconcile October runtime releases | UPDATE — separate publication review pending; no generated output imported |
| `7bddf50219f2cf57582bb88e7d153c52b9571310` | chore(seihou): apply agent-gitignore, exec-plan, master-plan updates | NO-OP — build and agent tooling |

### `mori://shinzui/shibuya`

Target: `19b9ad54d15a2e942b181c8490b9f517ebf12888`. Baseline: `0967f450b659b48d24cb49f199718451a65d2d48`.

| Commit | Change | Action |
| --- | --- | --- |
| `19b9ad54d15a2e942b181c8490b9f517ebf12888` | docs: refresh README for 0.12.0.0 | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `14f35d8995cc3dc3e2671e4d2505abf9bf4f5a9e` | chore(release): 0.12.0.0 | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `f340e30dafb90161fc0a606bdb2989ed02668686` | test(core): cover queued delivery admission across concurrent keys | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `160697554b3eee8138689350fa0a667017e46610` | docs(core): record accepted delivery-status allocation cost | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `e21e823462cc14a4471eedb159354d22704a554f` | feat(core)!: skip superseded deliveries before handler admission | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `a4b2b8e3e876f550b7fa08fb8d5a94975a0cc9da` | chore(release): 0.11.0.0 | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `532bd364dece8f5199e2d0cf3fc6970bc4300b45` | perf(runtime): coordinate serial intake startup handoff | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `20c0821a4f2149f86d5b8215ad1ebd27d8b2a436` | perf(runtime): avoid nested transactions when draining intake | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `7460b781ca31d2fb9f3c1607bf338b8001974114` | docs(perf): record critical-path scheduling regression evidence | NO-OP — plans, tests or benchmark evidence; no public API claim |
| `848eb31cbc385e6805a52b249ff56d10c51d362f` | fix(telemetry): preserve ingestion cancellation across SDK callbacks | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `016576f92855f134f96f3efcfa3146fbed4998b1` | chore(release): 0.11.0.0 | UPDATE — released reference/integration contracts and walkthroughs; see outcome below |
| `9b0e750af44cc3584899ff73541b86cfbae9aafa` | chore(nix): upgrade nix-haskell-flake to 0.35.0 and track .envrc | NO-OP — build and agent tooling |
| `4f3c2d8c349c043b1e36e76053bf86fe5216bc99` | chore(seihou): apply agent-gitignore, exec-plan, master-plan modules | NO-OP — build and agent tooling |
| `7adbd946a8d403e50e91c246af42d57e1799a5ca` | docs(improvement-requests): request a long-running detailed-metrics example (IR-9) | NO-OP — plans, tests or benchmark evidence; no public API claim |

### `mori://shinzui/shibuya-message-db-adapter`

Target: `51a36348ee31bd97eea595b34533ca8cfa931f82`. Baseline: `51a36348ee31bd97eea595b34533ca8cfa931f82`.

| Commit | Change | Action |
| --- | --- | --- |

## Release ledger

| Package | Version | Action |
| --- | --- | --- |
| `mori://shinzui/shibuya-kafka-adapter/packages/shibuya-kafka-adapter` | 0.12.0.0 | ADD published history |
| `mori://shinzui/keiro/packages/keiro-core` | 0.22.0.0 | ADD published history |
| `mori://shinzui/keiro/packages/keiro-dsl` | 0.22.0.0 | ADD published history |
| `mori://shinzui/keiro/packages/keiro-migrations` | 0.22.0.0 | ADD published history |
| `mori://shinzui/keiro/packages/keiro-ops-http` | 0.22.0.0 | ADD published history |
| `mori://shinzui/keiro/packages/keiro-ops` | 0.22.0.0 | ADD published history |
| `mori://shinzui/keiro/packages/keiro-pgmq` | 0.22.0.0 | ADD published history |
| `mori://shinzui/keiro/packages/keiro-test-support` | 0.22.0.0 | ADD published history |
| `mori://shinzui/keiro/packages/keiro` | 0.22.0.0 | ADD published history |
| `mori://shinzui/kiroku/packages/kiroku-cli` | 0.2.0.11 | ADD published history |
| `mori://shinzui/kiroku/packages/kiroku-metrics` | 0.4.0.0 | ADD published history |
| `mori://shinzui/kiroku/packages/kiroku-metrics` | 0.3.0.1 | ADD published history |
| `mori://shinzui/kiroku/packages/kiroku-otel` | 0.3.0.0 | ADD published history |
| `mori://shinzui/kiroku/packages/kiroku-store-migrations` | 0.7.2.0 | ADD published history |
| `mori://shinzui/kiroku/packages/kiroku-store` | 0.12.0.0 | ADD published history |
| `mori://shinzui/kiroku/packages/kiroku-store` | 0.11.0.1 | ADD published history |
| `mori://shinzui/kiroku/packages/shibuya-kiroku-adapter` | 0.7.0.0 | ADD published history |
| `mori://shinzui/pgmq-hs/packages/pgmq-config` | 0.7.0.0 | ADD published history |
| `mori://shinzui/pgmq-hs/packages/pgmq-core` | 0.7.0.0 | ADD published history |
| `mori://shinzui/pgmq-hs/packages/pgmq-effectful` | 0.7.0.0 | ADD published history |
| `mori://shinzui/pgmq-hs/packages/pgmq-hasql` | 0.7.0.0 | ADD published history |
| `mori://shinzui/pgmq-hs/packages/pgmq-inspect` | 0.7.0.0 | ADD published history |
| `mori://shinzui/pgmq-hs/packages/pgmq-migration` | 0.7.0.0 | ADD published history |
| `mori://shinzui/shibuya-pgmq-adapter/packages/shibuya-pgmq-adapter` | 0.18.0.0 | ADD published history |
| `mori://shinzui/shibuya/packages/shibuya-core` | 0.12.0.0 | ADD published history |
| `mori://shinzui/shibuya/packages/shibuya-core` | 0.11.0.0 | ADD published history |
| `mori://shinzui/shibuya/packages/shibuya-metrics` | 0.12.0.0 | ADD published history |
| `mori://shinzui/shibuya/packages/shibuya-metrics` | 0.11.0.0 | ADD published history |

## Independent boundaries

The example-app checkout is an ancestor of the existing reviewed pointer, not a new range. The missing baseline was fetched without changing its worktree. Retain that pointer and do not import the older checkout.

Catalog owner `mori://shinzui/keiro-runtime-patterns` has two commits after published `5957590e4370f6a791ef1f7480c00c3809526f6c`; target `62531b00b415785be61584a3c44b569fdfb35c4e`. Potentially affected subjects: inspection, messaging, configuration, subscriptions, migration/deployment, DSL and architecture. No catalog or owner watermarks advance in this library round.

## Review outcome

| Owner | Range | Outcome |
| --- | --- | --- |
| `mori://shinzui/shibuya` | 14 commits | Complete: 0.11/0.12 publication, delivery admission, cancellation and intake scheduling; reference, walkthrough, explanation, guide and integration updates. |
| `mori://shinzui/shibuya-kafka-adapter` | 13 commits | Complete: retry source gate, missing-offset abandonment, buffered delivery admission, rebalance/batch limits and 0.12 release. |
| `mori://shinzui/shibuya-pgmq-adapter` | 22 commits | Complete committed API range: managed DLQ browse/fetch/redrive, authoritative source envelopes and 0.18 dependencies; retain incomplete performance acceptance and exclude dirty benchmark work. |
| `mori://shinzui/keiro` | 73 commits | Partial source closure: eight-package releases, new HTTP package area, hooks/options, structural enum equality, inspection and migration adoption documented. Complete exported inspection type/field inventory and all affected source tours still require review; pointer retained. |
| `mori://shinzui/kiroku` | 51 commits | Partial source closure: release history, namespace cutover, typed failures, retry filtering, legacy recovery warning, Origin policy and adapter guidance updated. Formatting-heavy source range and all low-level exported records/tours still need closure; both store and adapter pointers retained. |
| `mori://shinzui/pgmq-hs` | 23 commits | Partial source closure: six-package release history, full inspection package area, JSON/paging qualification, reconciliation refusals and migration 0007 documented. Full source-code/CLI/resource-contract closure remains pending; pointer retained. |
| `mori://shinzui/keiki` | 0 commits | Release recheck complete; no new source range. SCXML remains unreleased. |
| `mori://shinzui/pg-migrate` | 0 commits | Release recheck complete; coupled migration recipe updated. No API boundary change. |
| `mori://shinzui/shibuya-message-db-adapter` | 0 commits | Archived source retained; Hackage HTTP 404 reconfirmed. |
| `mori://shinzui/keiro-runtime-jitsurei` | checkout older than reviewed boundary | Fetched the missing reviewed object and verified HEAD is its ancestor; no rollback or pointer change. |

No pages retired. New areas follow the page templates and wire metadata, section cards and inbound links. No Haskell implementation tests or deployment were attempted; documentation compilation cannot establish consumer compilation, runtime behavior or performance.

The catalog owner's source ledger was inspected at `mori://shinzui/keiro-runtime-patterns`, project-relative `agents/skills/update-patterns/sources.json` (artifact-level URI pending). Its October release reconciliation already includes the released cohort (Keiro through the 0.22 publication tag, Kiroku/Shibuya at captured heads); the site's generated publication is still two commits behind. Publishing requires its independent concept, visual, product-page and browser review, and is not represented as completed here.

## Validation and boundaries

`KEIRO_DOCS_SKIP_FONTS=1 nix develop -c bun run check` passed after the content edits: 12 pattern/status tests and 7 prose tests, catalog consistency, prose and terminology, TypeScript/MDX, lint/format, navigation, diagrams, static build, and source link checks. All 631 published files passed link checks. The static-output crawler scanned zero links, so source links provide the relevant integrity check. Existing optional-font and bundle-size warnings do not fail the build. Licensed fonts were deliberately skipped through the supported build switch.

The Shibuya, Kafka and PGMQ-adapter API boundaries advanced only after this gate. All other API boundaries remain unchanged as described above. The release evidence date advances independently to 2026-10-27. New heading anchors were checked against their emitted spelling; renamed source-qualified headings and all inbound links were reconciled. No generated pattern bytes, owner library watermarks, upstream worktrees or external deployments were changed.

### Static publication correction

Manual emitted-anchor verification found three truncated long references (runtime nodes, durable workflows and mapped types), despite a successful original static gate. TanStack's crawler admitted fragment URLs separately while resolving them to the same output filename. Filtering fragment/query crawl entries produced complete HTML for all 631 documents and restored the new structural-enum anchor. The static-output gate now requires closing HTML on every generated documentation page, plus the shell and baseline artifacts. A negative control truncating the long mapped-types artifact was rejected; the original artifact was restored. This corrects publication integrity without changing dependency versions.

After pointer edits, all 12 pattern/status tests passed again. Mechanical status confirms zero commits behind for Shibuya, the Kafka adapter and the PGMQ adapter; the latter still reports its 13 excluded dirty benchmark files. The strengthened aggregate gate passes, including all 631 complete HTML documents. All old Hackage links were preserved and 28 new package-version entries were added across the 35-package inventory. Fourteen content pages were added; none were retired.
