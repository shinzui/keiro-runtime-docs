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
58aff77b3a6d6093e3613753a0543aab62db9fac  (58aff77)
2026-07-14T07:09:19-07:00
chore(release): kiroku-store 0.3.0.1, kiroku-store-migrations 0.3.0.0
```

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

- `9a52aa62380c28b0ec36eeb9b517f49e40900fd8` (`9a52aa6`), 2026-06-24 —
  adapter baseline before the Kiroku 0.3 and Shibuya adapter 0.4 review.

## Update procedure

1. List what changed since the pointer:
   ```text
   KIROKU=$(mori registry show shinzui/kiroku --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$KIROKU" log --oneline 58aff77..HEAD -- shibuya-kiroku-adapter docs/user
   git -C "$KIROKU" diff --stat 58aff77..HEAD -- shibuya-kiroku-adapter docs/user
   ```
2. Update `content/docs/integrations/shibuya-kiroku-adapter.mdx` and any Kiroku
   pages that repeat adapter-specific behavior.
3. Replace the **Last reviewed commit** block with the new `HEAD`, and move the
   old SHA into a **Previous pointers** section with a one-line summary of the
   range.
