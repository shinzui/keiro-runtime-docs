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
9a52aa62380c28b0ec36eeb9b517f49e40900fd8  (9a52aa6)
2026-06-24
test(kiroku-store): TruncateBefore suite + docs (M4)
```

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

## Update procedure

1. List what changed since the pointer:
   ```text
   KIROKU=$(mori registry show shinzui/kiroku --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$KIROKU" log --oneline 9a52aa6..HEAD -- shibuya-kiroku-adapter docs/user
   git -C "$KIROKU" diff --stat 9a52aa6..HEAD -- shibuya-kiroku-adapter docs/user
   ```
2. Update `content/docs/integrations/shibuya-kiroku-adapter.mdx` and any Kiroku
   pages that repeat adapter-specific behavior.
3. Replace the **Last reviewed commit** block with the new `HEAD`, and move the
   old SHA into a **Previous pointers** section with a one-line summary of the
   range.
