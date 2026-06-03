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
d6928518d955c4ca8c3987a6f27dedeb9b2f23d4  (d692851)
2026-06-03 (MasterPlan 5 close-out, EP-45 M5)
keiro 0.1.0.0 (development line; the in-tree version is still 0.1.0.0)
```

> **Note.** The `aeaafee..d692851` range ships **Phase 5 — v2 durable execution** (MasterPlan 5,
> EP-38…EP-45): the `Keiro.Workflow` module family. This is a new, first-class **shipped** feature and
> is documented across a new doc set rather than folded into existing pages:
> - **New pages:** `reference/durable-workflows.mdx`, `explanation/durable-execution.mdx`,
>   `tutorials/your-first-durable-workflow.mdx`, `how-to/write-a-durable-workflow.mdx`,
>   `how-to/run-the-workflow-resume-worker.mdx`, `cookbook/durable-order-workflow.mdx`, and the
>   nine-chapter `walkthrough/durable-execution/` tour.
> - **Surface:** the `Workflow` effect (`step` / `awaitStep`), `runWorkflow(With)` + `WorkflowRunOptions`,
>   durable `sleepNamed`/`sleep` (reusing `keiro_timers` via a payload discriminator), `awakeableNamed`
>   + `signalAwakeable`/`cancelAwakeable`, child workflows (`spawnChild`/`awaitChild`/`cancelChild`), the
>   resume worker (`resumeWorkflowsOnce` + the `WorkflowRegistry`), and `workflowStateCodec` snapshots.
> - **Schema:** three new migrations / tables — `keiro_workflow_steps`, `keiro_awakeables`,
>   `keiro_workflow_children` (now **seven** migration files, **eight** tables; folded into
>   `reference/migrations-and-schema.mdx` and the operations walkthrough).
> - **Telemetry:** six `keiro.workflow.*` instruments and the `withWorkflowSpan` run span, plus the
>   `keiro.workflow.{name,id,step}` attribute keys (folded into `reference/telemetry.mdx`).
> - **Updated to "shipped":** `explanation/workflow-roadmap.mdx` (v2 now Available),
>   `keiro/index.mdx`, and `faq.mdx`.
>
> Deferred (called out as such): continue-as-new journal rotation and the versioning/patch API.

### Previous pointers (for traceability)

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
   git -C "$KEIRO" log --oneline d692851..HEAD
   git -C "$KEIRO" diff --stat d692851..HEAD
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
     `reference/integration-event.mdx`, `reference/inbox.mdx`, `reference/outbox.mdx`,
     `reference/telemetry.mdx`, `reference/migrations-and-schema.mdx`.
   - **Walkthroughs** (line-by-line tours of the real source): every chapter under
     `walkthrough/command-cycle/`, `walkthrough/read-side/`, `walkthrough/workflow/`,
     `walkthrough/durable-execution/`, `walkthrough/operations/`, and `walkthrough/integration/`.
   - **Conceptual anchors**: `explanation/what-is-keiro.mdx`, `explanation/the-keiro-stack.mdx`,
     `explanation/the-jitsurei-example.mdx`, and `tutorials/getting-started.mdx`.
3. Replace the **Last reviewed commit** block above with the new `HEAD`, and move the old SHA into
   **Previous pointers** with a one-line summary of what the range covered.
