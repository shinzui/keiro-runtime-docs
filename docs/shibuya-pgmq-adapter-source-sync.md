# shibuya-pgmq-adapter docs ↔ source sync pointer

The `content/docs/integrations/shibuya-pgmq-adapter.mdx` page is **ported and
cross-checked** against the shibuya-pgmq-adapter source repo, not generated from
it. To keep updates efficient and predictable, pin the exact upstream commit the
docs were last reviewed against. When the adapter changes, diff from the pinned
commit to `HEAD`, update the affected page(s), then bump the pointer below.

## Status

Content-authored. The integration page now documents runtime shape,
configuration, ack mapping, dead letters, FIFO and topic helpers, envelope
mapping, operational notes, and related links. This pass replaced the bootstrap
stub and checked the prose against the 0.8.0.0 adapter source and bundled user
guides.

## Upstream source

- **Qualified name (mori):** `shinzui/shibuya-pgmq-adapter` — resolve the
  on-disk path with `mori registry show shinzui/shibuya-pgmq-adapter --full`
  instead of relying on the hard-coded path.
- **Path at last sync:** `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-pgmq-adapter`
- **What it is:** the PGMQ adapter for the shibuya queue-processing framework.
  It lets shibuya consume PGMQ queues via visibility-timeout leases, maps
  shibuya ack decisions to delete, visibility, archive, or DLQ operations,
  supports FIFO grouped reads, optional prefetch, topic bindings, and
  OpenTelemetry trace propagation.
- **Library modules reviewed:** `Shibuya.Adapter.Pgmq`,
  `Shibuya.Adapter.Pgmq.Config`, `Shibuya.Adapter.Pgmq.Convert`, and
  `Shibuya.Adapter.Pgmq.Internal`.
- **Docs reviewed:** `docs/user/pgmq-getting-started.md`,
  `docs/user/pgmq-advanced.md`, `docs/user/pgmq-dead-letter-queues.md`, and
  `docs/user/pgmq-topic-routing.md`.

## Last reviewed commit

```text
71a7b82223449d84c395b64e480c9cfe4ff274f1  (71a7b82)
2026-06-14
chore(release): 0.8.0.0
```

## Current source-backed claims

- `pgmqAdapter` returns `Adapter es Value` and requires `Pgmq`, `Error
  PgmqRuntimeError`, `IOE`, and `Tracing`.
- `PgmqAdapterConfig` includes queue name, visibility timeout, batch size,
  polling mode, poll retry settings, optional DLQ config, max retries, optional
  FIFO config, and optional prefetch config.
- `AckOk` deletes the leased message; `AckRetry` changes visibility;
  `AckDeadLetter` archives or writes a DLQ copy and removes the original;
  `AckHalt` extends visibility and stops.
- Messages whose PGMQ read count exceeds `maxRetries` are automatically
  dead-lettered as `MaxRetriesExceeded` before handler delivery.
- DLQ targets can be direct queues or topic routes. DLQ writes preserve consumer
  trace context and keep upstream trace context in `x-shibuya-upstream-*`
  headers.
- Envelope conversion lifts PGMQ id, cursor, enqueue time, trace headers, FIFO
  group, zero-based attempt, and raw JSON payload. `headers` is intentionally
  `Nothing` because PGMQ JSONB headers are not exposed as an ordered broker
  header stream.

## Previous pointers

- `8e6f6e93e729bac129d7a9f2f8917f40fa4d6d9c` (`8e6f6e9`), 2026-06-05:
  bootstrap baseline. The integration page was still a stub with a
  "Documentation in progress" callout and no source-backed behavior
  transcribed.

## Update procedure

1. List what changed since the pointer:
   ```text
   ADAPTER=$(mori registry show shinzui/shibuya-pgmq-adapter --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$ADAPTER" log --oneline 71a7b82..HEAD
   git -C "$ADAPTER" diff --stat 71a7b82..HEAD
   ```
   Also inspect `README.md`, `CHANGELOG.md`, `docs/user/`, and the source
   modules listed above. Because the adapter sits on `pgmq-hs`, check
   `docs/pgmq-hs-source-sync.md` when a change spans both packages.
2. Update `content/docs/integrations/shibuya-pgmq-adapter.mdx` and any linked
   pgmq or keiro-pgmq pages that repeat adapter behavior.
3. Replace the **Last reviewed commit** block with the new `HEAD`, and move the
   old SHA into **Previous pointers** with a one-line summary of the range.
