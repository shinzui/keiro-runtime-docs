# Kiroku docs ↔ source sync pointer

The `content/docs/kiroku/` tree is **ported and cross-checked** against the kiroku
source repo, not generated from it. To keep updates efficient and predictable we pin the
exact upstream commit the docs were last reviewed against. When kiroku changes, diff from
the pinned commit to `HEAD`, update the affected pages, then bump the pointer below.

## Upstream source

- **Qualified name (mori):** `shinzui/kiroku` — resolve the on-disk path with
  `mori registry show shinzui/kiroku --full` (prefer this over the hard-coded path, which
  can move).
- **Path at last sync:** `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku`
- Relevant packages: `kiroku-store` (core store + subscription FSM), `shibuya-kiroku-adapter`
  (worker adapter); the source tree also carries the metrics, CLI, and OpenTelemetry packages
  documented below.
- **Reviewed releases:** `kiroku-store 0.8.0.0`, migrations `0.4.0.0`,
  `kiroku-otel 0.2.0.7`, `kiroku-cli 0.2.0.6`, `kiroku-metrics 0.1.0.8`, and
  `shibuya-kiroku-adapter 0.5.1.1`. Hackage and upstream release tags checked 2026-09-17.

## Last reviewed commit

```text
07cd034aafc0d88b6c55abdf3509e25b9d69e63d  (07cd034a)
2026-09-16T21:01:15-07:00
chore(seihou): apply exec-plan and master-plan module updates
```

> **Current range.** `7051b123..07cd034a` (**11 commits**). Plans, ADRs, review metadata, provenance and Seihou module updates only. No package source, Cabal release, migration, store API, or adapter behavior changed.
> No pages retired. Every commit is classified in [the sync ledger](source-sync-2026-09-17.md).

> **Note (prior range).** The `3009dda..b9aecf3` range (**51 commits**, 151 files,
> +15,323/−996) lands **four releases** — `kiroku-store` `0.4`, `0.5`, `0.6`, and `0.7` — taking the
> store from `0.3.1.0` to `0.7.0.0` and `kiroku-store-migrations` from `0.3.0.0` to `0.3.2.0`. Keiro
> 0.12 requires this whole span (`kiroku-store >=0.7 && <0.8`).
>
> ⚠ The upstream worktree was **dirty (3 files)**; the committed tree only was reviewed.
>
> **The exported `Store` effect gains eight constructors across the four releases**, and every one
> is breaking for an exhaustive custom or mock interpreter:
>
> | Release | Added to `Store` | Surface |
> | --- | --- | --- |
> | `0.4` | `GetSubscriptionCheckpointInventory` | `subscriptionCheckpointInventory`; public `SubscriptionCheckpoint` / `SubscriptionCheckpointInventory` records |
> | `0.5` | `InitializeSubscriptionCheckpoint` | `initializeSubscriptionCheckpoint` + closed `MissingCheckpointPolicy` |
> | `0.6` | `GetVisibleGlobalHeadPosition` | `visibleGlobalHeadPosition` |
> | `0.7` | `AcquireHistoryRetentionLease`, `RenewHistoryRetentionLease`, `ReleaseHistoryRetentionLease`, `GetHistoryRetentionLeaseInventory`, `PruneHistoryRetentionLeases` | `Kiroku.Store.HistoryRetention` (+`.Types`) |
>
> **1. Missing-checkpoint policy (0.5).** `FromBeginning` (default) durably seeds zero,
> `FromCurrentHead` atomically seeds the current `$all` position, `FailIfMissing` refuses startup
> with `SubscriptionCheckpointMissing` **before handler delivery**. Existing rows always win and
> concurrent initializers converge. Breaking: `SubscriptionConfigM` gains `missingCheckpointPolicy`;
> `KirokuEvent` gains `KirokuEventSubscriptionCheckpointResolved` and `…Missing`.
>
> **2. Visible head (0.6).** `visibleGlobalHeadPosition` returns the greatest global position still
> visible in `$all`, or zero, via a payload-free scalar query — no decode hook runs. **It can
> regress** when the visible tail is hard-deleted, while the authoritative append frontier stays
> monotonic. This is what Keiro's consistency waits and projection distance now measure from.
>
> **3. History-retention leases (0.7).** Validated, durable, **database-time-derived** leases for
> stable long rebuilds, with owner-aware acquire/renew/release/inventory/prune shared by transaction
> combinators and mockable wrappers. `lockStreamHistoryForReplayTx` + `readStreamForwardTx` read
> exact ordered history under one transaction-scoped guard; append, link, lifecycle mutation, and
> every supported hard delete serialize behind it. Supported hard delete now checks retention
> **before** mutation and locks affected streams in ascending stream-ID order, **including streams
> holding links to target-originated events**. Breaking: `StoreError` gains `HistoryRetentionActive`;
> `KirokuEvent` gains retention acquisition/renewal/release/prune and hard-delete-conflict events.
>
> **4. Migrations 8 → 10.** `0009.sql` publishes the frozen owner-rights view
> `kiroku.subscription_checkpoints_v1`; `0010.sql` creates
> `kiroku.history_retention_coordinator`, `kiroku.history_retention_leases`,
> `ix_history_retention_leases_unreleased_expiry`, and the
> `kiroku.protect_replay_history_from_destruction` guard.
>
> **Pages UPDATED:** `reference/store-effect.mdx` (new visible-head, subscription-checkpoint, and
> history-retention sections + the breaking-constructor table), `reference/schema-migrations.mdx`
> (8 → 10 entries, versions), `explanation/subscriptions-and-consumer-groups.mdx` (the
> missing-checkpoint policy).
>
> **Pages ADDED / RETIRED:** none — the new surface extends pages that already existed.
>
> **Deliberately NOT documented:** upstream `docs/plans/*` and `.seihou/` scaffolding commits
> (intent, not surface); test-only and benchmark commits; the 3 dirty worktree files.
>
> **Known gap:** this pointer and `docs/shibuya-kiroku-adapter-source-sync.md` share a repository but
> advance independently — both were reviewed this round.

> **Note (prior range).** The `58aff77..3009dda` range (3 commits, 5 files) is the
> **kiroku-store 0.3.1.0 point release**. One new API, one corrected metric
> description, one upstream-README fix that this tree had already got right.
>
> - **`Kiroku.Store.Effect.Resource.runKirokuStoreWith`** installs an
>   already-acquired `KirokuStore` into the effect stack without acquiring or
>   releasing it — the caller owns the handle's lifetime, unlike the bracketing
>   `withKirokuStore`. Motivation: a caller that held one open store but ran many
>   actions through it paid for a pool, a dedicated `LISTEN` connection, and a
>   publisher thread per action (one CLI went 5 connections → 3). It still
>   requires `IOE` because `KirokuStoreResource` is `Static WithSideEffects` and
>   `evalStaticRep` demands `IOE` for those. Documented as a new **"The store
>   resource"** section in `content/docs/kiroku/reference/store-effect.mdx` —
>   `KirokuStoreResource`, `getKirokuStore`, and both runners were previously
>   undocumented in this tree (only keiro pages referenced `withKirokuStore`),
>   so the section covers the whole module. Cross-linked from
>   `content/docs/keiro/reference/command.mdx`.
> - **`kiroku_events_appended_total` help text corrected** from "Total events
>   appended store-wide (gap-free global position)." to "Current store global
>   position (opaque; not guaranteed dense)." The name still reads like an append
>   counter, so `content/docs/kiroku/reference/metrics.mdx` gained a warning
>   callout against `rate()`-ing it or differencing samples for an event count.
>   `explanation/all-stream-and-global-order.mdx` already said positions are not
>   dense and needed no change.
> - **NO-OP:** the upstream `README.md` change (spelling out
>   `kiroku-store-migrate up --database-url`, the `DATABASE_URL` fallback, and
>   the full eight-command set) brings the upstream README in line with what
>   `content/docs/kiroku/reference/schema-migrations.mdx` already documents. No
>   doc change.
>
> `shibuya-kiroku-adapter` and `docs/user/` were untouched in this range, so the
> adapter pointer advanced independently as doc-neutral. The source tree was
> clean at the reviewed SHA.
>
> **Note (prior range).** The `dac1a0b..58aff77` review covers Kiroku 0.3: corrected backward reads,
> eager stream and batch validation, typed link and transaction failures, close-the-book markers,
> explicit subscription live sources, loud checkpoint failures, crash-aware adapter termination,
> updated CLI/metrics/OTel packages, and the native pg-migrate component plus predecessor-history
> cutover. The source tree was clean at the reviewed SHA.
>
> **Note (prior range).** The `4312aa8..dac1a0b` range is the July lifecycle refresh. It added the
> reversible per-stream `truncateBefore` marker plus `setStreamTruncateBefore` /
> `clearStreamTruncateBefore`, documented here as close-the-book logical compaction.
> Ordered per-stream reads honor the marker; `$all`, category reads, subscriptions,
> causation/correlation queries, and existence probes still see the full append-only log.
> `StreamInfo` now exposes `truncateBefore`, and the migration set adds
> `2026-06-24-09-42-22-stream-truncate-before.sql` while renaming older SQL migrations to
> real commit-date timestamps.
>
> **Note (prior range).** The `0a39598..4312aa8` range is the June hardening refresh. It updated the
> store write path, stream/category validation, subscriptions, adapter behavior, observability, and
> operator docs; this documentation repo folded those changes into the Kiroku reference, how-to,
> walkthrough, integration, FAQ, and source-sync pages.
>
> - **Store/write path:** stream/category constructors, oversize stream-name rejection, typed
>   append/link failures, empty-batch rejection, backward-read fixes, `eventExistsInStream`,
>   transaction duplicate surfacing, pipelined multi-stream append, and migration/schema hygiene were
>   incorporated.
> - **Subscriptions and adapters:** `SubscriptionTarget`, `EventTypeFilter`, `OverflowPolicy`,
>   `SubscriptionResult`, consumer groups, dead-letter behavior, `PauseAndResume`, `queueCapacity`,
>   synchronous handler exception retries, websocket replay/read failures, metrics websocket replay
>   fixes, OpenTelemetry/metrics/CLI docs, and shibuya-kiroku-adapter lossless overflow behavior were
>   reconciled.
>
> **Note (prior range).** Released versions at this pin: `kiroku-store` **0.2.0.0**, `kiroku-store-migrations`
> **0.1.1.0**, `kiroku-otel` **0.2.0.0**, `kiroku-cli` **0.1.0.0** (new), `kiroku-metrics` **0.1.0.0**
> (new), `shibuya-kiroku-adapter` **0.2.0.0**. The `98f46b3..0a39598` range added two **new
> packages** — `kiroku-metrics` (`reference/metrics.mdx`, `how-to/serve-metrics-and-health.mdx`) and
> `kiroku-cli` (`reference/operator-cli.mdx`, `how-to/inspect-subscriptions-with-the-cli.mdx`) — plus
> the **OpenTelemetry 1.0 / semantic-conventions 1.40 and Shibuya 0.6 upgrade** (kiroku-otel deliver
> and db-error spans now also carry `messaging.*` / `db.*` semantic-convention attributes; folded into
> `reference/opentelemetry.mdx`). The subscription registry, `deliver`/`stopped` spans, and
> ack-coupled checkpointing were already documented at the prior pin.

### Previous pointers (for traceability)

- `7051b12342b3002659e39061b03bee2e37275099` (`7051b123`) — baseline before the
  `7051b123..07cd034a` review (11 commits). The range changed plans, ADRs, provenance and review
  metadata only; no released source or documentation contract changed. See the
  [2026-09-17 ledger](source-sync-2026-09-17.md).

- `3009dda7238f7d05b1d0c97b04ec5d4c55031304` (`3009dda`, 2026-07-22, kiroku-store 0.3.1.0) — the baseline before the 0.4–0.7 review. The `3009dda..b9aecf3` range (51 commits) landed four releases: the durable subscription checkpoint inventory (0.4), the closed `MissingCheckpointPolicy` (0.5), the visible-head surface (0.6), and renewable history-retention leases with a stream replay guard (0.7). Eight new `Store` constructors, new `KirokuEvent`s, and `StoreError.HistoryRetentionActive` — all breaking for exhaustive interpreters. Migrations 8 → 10. Updated `reference/store-effect.mdx`, `reference/schema-migrations.mdx`, and `explanation/subscriptions-and-consumer-groups.mdx`. Nothing added or retired.
- `58aff77b3a6d6093e3613753a0543aab62db9fac` (`58aff77`, 2026-07-14,
  `kiroku-store 0.3.0.1`) — the baseline before the 0.3.1.0 point release. The
  `58aff77..3009dda` range (3 commits) added `runKirokuStoreWith`, corrected the
  `kiroku_events_appended_total` help text to describe an opaque global position,
  and fixed the upstream README's migration command guidance.
- `dac1a0b5ff39f400ad512e826265a0d24553b4a9` (`dac1a0b`, 2026-07-05) — baseline
  before the 0.3 behavior, operations, native migration, and release review.
- `4312aa8cc3e4f6ab0d19fc8bb12d0dd9f8cc164a` (`4312aa8`, 2026-06-14, event existence lookup) —
  baseline before the July lifecycle refresh. The `4312aa8..dac1a0b` range added close-the-book
  stream compaction via `truncateBefore`, `setStreamTruncateBefore`, and
  `clearStreamTruncateBefore`, plus the SQL migration timestamp rename.
- `0a39598a4a9614528316f6c9c63842cc1d55d313` (`0a39598`, 2026-06-01, released versions) — the
  baseline before the June hardening refresh. The `0a39598..4312aa8` range updated the store write
  path, validation, subscription/consumer-group behavior, shibuya adapter behavior, observability,
  metrics, CLI, and websocket error handling.
- `98f46b368e9d4e73d05e849703bbbe6cec3aeaff` (`98f46b3`, 2026-05-31, pre-release) — baseline before
  the metrics/CLI packages and the OTel-1.0/Shibuya-0.6 upgrade. The `98f46b3..0a39598` range added
  `kiroku-metrics` and `kiroku-cli`, bumped the release versions above, and upgraded the
  OpenTelemetry/Shibuya dependencies (adding `messaging.*` / `db.*` semantic-convention attributes to
  the subscription spans).
- `0f33d72` (2026-05-31 07:21) — baseline before the state-tracking / OpenTelemetry
  overhaul. The `0f33d72..98f46b3` range is what the older pages reflect; it introduced
  the central subscription-state registry (`subscriptionStates`, `currentState ::
  m (Maybe SubscriptionState)`), the per-batch `kiroku.subscription.deliver` span
  (replacing `kiroku.subscription.fetch`), the always-emitted
  `kiroku.subscription.stopped` span, and the striped lock-free span registry in
  `kiroku-otel`.

## Update procedure

1. List what changed since the pointer:
   ```sh
   KIROKU=$(mori registry show shinzui/kiroku --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$KIROKU" log --oneline 07cd034a..HEAD
   git -C "$KIROKU" diff --stat 07cd034a..HEAD
   ```
   Kiroku also keeps its own `docs/`, `CHANGELOG.md` files, and `docs/plans|masterplans`
   entries — the prose diff there is the fastest way to understand intent before touching
   the source. The `kiroku-metrics/example/Main.hs` and `kiroku-cli/test/Main.hs` are
   self-verifying usage references for the two newer packages.
2. Update the affected pages under `content/docs/kiroku/`. The pages most coupled to the
   subscription/observability surface are:
   - `explanation/tracing-subscriptions.mdx`, `explanation/subscriptions-and-consumer-groups.mdx`
   - `reference/opentelemetry.mdx`, `reference/core-types.mdx`
   - `reference/metrics.mdx` (kiroku-metrics), `reference/operator-cli.mdx` (kiroku-cli)
   - `how-to/serve-metrics-and-health.mdx`, `how-to/inspect-subscriptions-with-the-cli.mdx`
   - `walkthrough/01-the-state-machine.mdx`, `walkthrough/03-subscribe-and-lifecycle.mdx`,
     `walkthrough/05-consumer-groups-and-policy.mdx`, `walkthrough/06-tracing-the-subscription.mdx`
   - `tutorials/getting-started.mdx`, `how-to/enable-opentelemetry.mdx`
3. Replace the **Last reviewed commit** block above with the new `HEAD`, and move the old
   SHA into **Previous pointers** with a one-line summary of what the range covered.
