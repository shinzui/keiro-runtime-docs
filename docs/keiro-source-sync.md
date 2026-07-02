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
  `keiro-test-support` (test fixtures); `jitsurei` (the runnable worked example).

## Last reviewed commit

```text
a9cecda2e15c18ba44cc887ebe5eba6b58fa4b85  (a9cecda)
2026-07-01T19:52:44-07:00
docs(masterplan): record post-implementation review and follow-up fixes
keiro 0.1.0.0 development line; docs reviewed against the post-throughput-overhaul HEAD
```

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
>   return labelled `EventStreamWarning`s; `mkEventStream` is a fail-fast smart constructor returning
>   `Left [EventStreamWarning]`. Requires `(Bounded s, Enum s, Ord s, Show s)`; **not** re-exported
>   from `Keiro` (reference it as `Keiro.EventStream.Validate`). Folded into
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
   git -C "$KEIRO" log --oneline a9cecda..HEAD
   git -C "$KEIRO" diff --stat a9cecda..HEAD
   ```
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
     `reference/pgmq-jobs.mdx`, `reference/telemetry.mdx`, `reference/migrations-and-schema.mdx`.
   - **Walkthroughs** (line-by-line tours of the real source): every chapter under
     `walkthrough/command-cycle/`, `walkthrough/read-side/`, `walkthrough/workflow/`,
     `walkthrough/durable-execution/`, `walkthrough/scaling/`, `walkthrough/operations/`, and
     `walkthrough/integration/`.
   - **Conceptual anchors**: `explanation/what-is-keiro.mdx`, `explanation/the-keiro-stack.mdx`,
     `explanation/the-jitsurei-example.mdx`, and `tutorials/getting-started.mdx`.
3. Replace the **Last reviewed commit** block above with the new `HEAD`, and move the old SHA into
   **Previous pointers** with a one-line summary of what the range covered.
