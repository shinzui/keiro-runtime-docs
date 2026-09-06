# shibuya-kiroku-adapter docs ↔ source sync pointer

The `content/docs/integrations/shibuya-kiroku-adapter.mdx` page is **ported and
cross-checked** against the `shibuya-kiroku-adapter` package inside the Kiroku
repo. This pointer is adapter-specific; the broader Kiroku documentation tree
has its own `docs/kiroku-source-sync.md` pointer.

## Status

Content-authored. The integration page documents runtime shape, Kiroku-owned
subscription semantics, filters, ack mapping, ordering, backpressure, envelope
mapping, consumer groups, and handler exception behavior.

## Upstream source

- **Qualified name (mori):** `shinzui/kiroku` — resolve the on-disk path with
  `mori registry show shinzui/kiroku --full`.
- **Path at last sync:** `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku`
- **Package reviewed:** `shibuya-kiroku-adapter`.
- **Modules reviewed:** `Shibuya.Adapter.Kiroku` and
  `Shibuya.Adapter.Kiroku.Convert`.
- **Docs reviewed:** `docs/user/shibuya-adapter.md`,
  `docs/user/subscriptions.md`, and `docs/user/consumer-groups.md`.

## Last reviewed commit

```text
7051b12342b3002659e39061b03bee2e37275099  (7051b123)
2026-08-29T06:52:44-07:00
docs(plans): address MasterPlan 11 pre-implementation review findings
```

> **Current range.** `b9aecf3a..7051b123` (**27 commits**). Reviewed the adapter independently within the shared Kiroku range. Adapter 0.5.1 maps Shibuya ApplicationFailure to DeadLetterOther with canonical code: detail summary and structured code/detail JSON; existing framework reasons keep their encoding. Adapter 0.5.1.1 requires Kiroku Store 0.8 without adding error-matching/retry logic. Updated the integration page, adapter walkthrough/how-to and shared compatibility. Other store/migration commits were reviewed for coupling but add no adapter API; proposed UI/compaction/hardening work remains unshipped.
> No pages retired. Every commit is classified in [the sync ledger](source-sync-2026-09-06.md).

> **Note (prior range).** The `3009dda..b9aecf3` range (**51 commits** in the shared
> kiroku repository, of which **4 files** touch `shibuya-kiroku-adapter`) takes the adapter from
> `0.4.0.0` to `0.5.0.2`, alongside `kiroku-store` `0.3.1.0` → `0.7.0.0`.
>
> The adapter change is `4c05bab fix(observability): handle retention events in adapters`: Kiroku
> 0.7 added committed history-retention acquisition, renewal, release, pruning, and
> hard-delete-conflict events to `KirokuEvent`, and the adapter's observability handling now covers
> them. Exhaustive `KirokuEvent` handlers elsewhere must do the same.
>
> **Pages UPDATED:** `integrations/shibuya-kiroku-adapter.mdx` (pairing now
> `shibuya-kiroku-adapter 0.5.0.2`, `kiroku-store 0.7`, `shibuya-core 0.9`, with the retention-event
> note), `integrations/shibuya-adapters.mdx`,
> `getting-started/compatibility-and-upgrades.mdx`.
>
> **Pages ADDED / RETIRED:** none.
>
> ⚠ The upstream worktree was **dirty (3 files)**; the committed tree only was reviewed.
>
> **Note:** this pointer and `docs/kiroku-source-sync.md` share a repository and advance
> independently. Both were reviewed and bumped this round; the store-side surface changes are
> summarized in the kiroku pointer, not here.

The `58aff77..3009dda` range (3 commits) is **doc-neutral for this page**:
`git diff --stat 58aff77..3009dda -- shibuya-kiroku-adapter docs/user` is empty.
The range touched only `kiroku-store` (the new `runKirokuStoreWith` runner),
`kiroku-metrics` (a corrected Prometheus help string), and the repo `README.md`
— all folded in through
[`kiroku-source-sync.md`](kiroku-source-sync.md). The adapter is still at
`0.4.0.0` and every claim below still holds. The source tree was clean at the
reviewed SHA.

The `9a52aa6..58aff77` review covers `shibuya-kiroku-adapter 0.4.0.0`, including
the 0.3 Kiroku dependency, explicit live-source selection, guarded synchronous
handler failures, loud checkpoint failure, and crash-aware stream termination.
The source tree was clean at the reviewed SHA.

## Current source-backed claims

- The adapter is ack-coupled to Kiroku `subscriptionAckStream`; Kiroku owns
  checkpoints, retries, dead letters, filters, and consumer-group routing.
- `AckOk` maps to `Continue`, `AckRetry` maps to Kiroku retry, `AckDeadLetter`
  maps to Kiroku dead-letter, and `AckHalt` cancels without checkpointing the
  in-flight event.
- `eventTypeFilter` and `selector` run before shibuya sees events; filtered
  events are skipped and checkpointed past by Kiroku.
- Envelope conversion lifts event id, global position, created time, trace
  metadata, redelivery attempt, attributes, and raw `RecordedEvent` payload.
- Consumer-group helpers require serial member execution and present the group
  as partitioned in-order.

## Previous pointers

- `b9aecf3a0f50911388c62df0d250fe5096afbfa4` (`b9aecf3a`) — baseline before the `b9aecf3a..7051b123` review (27 commits); see [2026-09-06 ledger](source-sync-2026-09-06.md).

- `3009dda7238f7d05b1d0c97b04ec5d4c55031304` (`3009dda`, 2026-07-22, shibuya-kiroku-adapter 0.4.0.0) — the baseline before the Kiroku 0.7 review. The `3009dda..b9aecf3` range (51 shared-repo commits, 4 touching the adapter) took the adapter to `0.5.0.2` and taught its observability handling the new Kiroku history-retention events.
- `58aff77b3a6d6093e3613753a0543aab62db9fac` (`58aff77`), 2026-07-14 — the
  baseline before the kiroku-store 0.3.1.0 point release. The `58aff77..3009dda`
  range (3 commits) left the adapter package and `docs/user/` untouched; bumped
  as doc-neutral.
- `9a52aa62380c28b0ec36eeb9b517f49e40900fd8` (`9a52aa6`), 2026-06-24 —
  adapter baseline before the Kiroku 0.3 and Shibuya adapter 0.4 review.

## Update procedure

1. List what changed since the pointer:
   ```text
   KIROKU=$(mori registry show shinzui/kiroku --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$KIROKU" log --oneline 7051b123..HEAD -- shibuya-kiroku-adapter docs/user
   git -C "$KIROKU" diff --stat 7051b123..HEAD -- shibuya-kiroku-adapter docs/user
   ```
2. Update `content/docs/integrations/shibuya-kiroku-adapter.mdx` and any Kiroku
   pages that repeat adapter-specific behavior.
3. Replace the **Last reviewed commit** block with the new `HEAD`, and move the
   old SHA into a **Previous pointers** section with a one-line summary of the
   range.
