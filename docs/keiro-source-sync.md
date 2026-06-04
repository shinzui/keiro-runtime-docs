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
  executable and embedded schema), `keiro-test-support` (test fixtures); `jitsurei` (the runnable
  worked example).

## Last reviewed commit

```text
0730ae1533894ec5398b9dc0728989edb0f1148d  (0730ae1)
2026-06-04 (MasterPlan 6 close-out, EP-51 M4/M6; HEAD tip is a Nix-only build change)
keiro 0.1.0.0 (development line; the in-tree version is still 0.1.0.0)
```

> **Note.** The `d692851..0730ae1` range ships **Phase 5 phase-2 — v2 durable execution, continued**
> (MasterPlan 6, EP-48…EP-51) plus a doc-neutral Nix build migration at the tip (`0730ae1`). It evolves
> the existing durable-workflow doc set and adds a new **worker-scaling** doc set rather than a wholly
> separate area:
> - **Versioning & rotation (EP-48/EP-49), folded into the workflow pages:** `continueAsNew` /
>   `restoreSeed` (journal *generations*, `wf:<name>-<id>#<g>`, the `WorkflowContinuedAsNew` marker, the
>   `ContinuedAsNew` outcome, `currentGeneration`) and `patch` / `PatchId` (the `patch:` reserved prefix,
>   the `startedInFlight` decision). Touches `reference/durable-workflows.mdx`,
>   `explanation/durable-execution.mdx`, `explanation/workflow-roadmap.mdx`,
>   `how-to/write-a-durable-workflow.mdx`, `faq.mdx`, `keiro/index.mdx`, and a new walkthrough chapter
>   `walkthrough/durable-execution/09-versioning-and-rotation.mdx`.
> - **New pages — push delivery (EP-50) & sharding (EP-51):** `reference/push-delivery.mdx`
>   (`Keiro.Wake`: `WakeSignal`/`WakeReason`, `wakeSignalFromStore`, `neverWake`, `runPollLoopWith`,
>   `runWorkflowResumeWorkerPush`), `reference/subscription-sharding.mdx` (`Keiro.Subscription.Shard{,.Worker,.Schema}`:
>   `ShardLease`, `acquireOwnedBuckets`, `runShardedSubscriptionGroup`, `keiro_subscription_shards`),
>   `explanation/scaling-the-workers.mdx`, `how-to/enable-push-delivery.mdx`,
>   `how-to/run-sharded-subscriptions.mdx`, and the new five-chapter `walkthrough/scaling/` tour.
> - **Schema:** two new migrations — `keiro-workflow-generation` (ALTER `keiro_workflow_steps`: add
>   `generation`, widen PK to `(workflow_id, workflow_name, generation, step_name)`, re-index) and
>   `keiro-subscription-shards` (new `keiro_subscription_shards` table). Now **nine** migration files,
>   **nine** tables; folded into `reference/migrations-and-schema.mdx` and `how-to/run-migrations.mdx`.
>   Both MasterPlan-6 migrations carry a `SET search_path TO kiroku, pg_catalog;` pin.
> - **Tooling:** the `keiro-migrate new <description>` scaffold subcommand and the `Keiro.Migrations.New`
>   module (folded into `reference/migrations-and-schema.mdx` and `how-to/run-migrations.mdx`).
> - **Telemetry:** no new instruments in this range.
>
> Deferred (now rejected or demand-driven, no longer "additive soon"): multi-region / global ordering,
> server-side scripted projections, a schema registry, and field-level encryption.

### Previous pointers (for traceability)

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
   git -C "$KEIRO" log --oneline 0730ae1..HEAD
   git -C "$KEIRO" diff --stat 0730ae1..HEAD
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
     `reference/telemetry.mdx`, `reference/migrations-and-schema.mdx`.
   - **Walkthroughs** (line-by-line tours of the real source): every chapter under
     `walkthrough/command-cycle/`, `walkthrough/read-side/`, `walkthrough/workflow/`,
     `walkthrough/durable-execution/`, `walkthrough/scaling/`, `walkthrough/operations/`, and
     `walkthrough/integration/`.
   - **Conceptual anchors**: `explanation/what-is-keiro.mdx`, `explanation/the-keiro-stack.mdx`,
     `explanation/the-jitsurei-example.mdx`, and `tutorials/getting-started.mdx`.
3. Replace the **Last reviewed commit** block above with the new `HEAD`, and move the old SHA into
   **Previous pointers** with a one-line summary of what the range covered.
