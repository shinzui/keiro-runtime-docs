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
ac197da3b2b11aae2e00ce2e4587a7fb99b9ffc1  (ac197da)
2026-06-06 (post-MasterPlan-6: replay-safety validation + runtime idempotency hardening + keiki EP-56 pin)
keiro 0.1.0.0 (development line; in-tree version still 0.1.0.0, CHANGELOG now carries an [Unreleased] section)
```

> **Note.** The `0730ae1..ac197da` range is a **release-hardening** pass: no new doc area, a handful of
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
   git -C "$KEIRO" log --oneline ac197da..HEAD
   git -C "$KEIRO" diff --stat ac197da..HEAD
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
