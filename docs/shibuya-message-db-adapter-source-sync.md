# shibuya-message-db-adapter docs ↔ source sync pointer

The `content/docs/integrations/shibuya-message-db-adapter.mdx` page is **ported
and cross-checked** against the shibuya-message-db-adapter source repo, not
generated from it. Pin the exact upstream commit used for the docs so future
changes can be reviewed by diff.

## Status

Content-authored. The integration page documents runtime shape, configuration,
checkpointing, ack mapping, retries, dead letters, envelope mapping, static
consumer groups, and runnable examples.

## Upstream source

- **Qualified name (mori):** `shinzui/shibuya-message-db-adapter` — resolve the
  on-disk path with `mori registry show shinzui/shibuya-message-db-adapter --full`.
- **Path at last sync:** `/Users/shinzui/Keikaku/work/libraries/haskell/shibuya-message-db-adapter`
- **Modules reviewed:** `Shibuya.Adapter.MessageDb`,
  `Shibuya.Adapter.MessageDb.Config`, `Shibuya.Adapter.MessageDb.Convert`,
  `Shibuya.Adapter.MessageDb.Internal`,
  `Shibuya.Adapter.MessageDb.Internal.Dlq`, and
  `Shibuya.Adapter.MessageDb.Internal.InflightState`.
- **Docs reviewed:** `docs/user/README.md`, `configuration.md`,
  `checkpointing.md`, `handler-decisions.md`, `consumer-groups.md`, and
  `examples.md`.

## Last reviewed commit

```text
43072558a58d9613cce46c3624157d6fc3e5b6b0  (4307255)
2026-06-03
build(nix): migrate flake to flake-parts dev shell on the haskell-nix-dev base flake
```

## Current source-backed claims

- `messageDbAdapter` returns `Adapter es MessageDb.Message` and requires
  `MessageDb`, `CheckpointStore`, `Concurrent`, `IOE`, and `Error SessionError`.
- The adapter maintains an in-memory ledger and stores only the longest
  contiguous completed prefix as the durable checkpoint.
- `AckRetry` schedules an in-process delayed retry; buffer overflow downgrades
  to `AckDeadLetter MaxRetriesExceeded`.
- DLQ strategies are `DlqSkipAndLog` and `DlqWriteToStream`; write-to-stream
  uses deterministic UUIDv5 message ids for idempotent replay.
- Static consumer groups hash category names to members and use partitioned
  subscription names.

## Notes

The package cabal description at this commit still frames checkpoint, retry,
DLQ, and partitioning behavior as future or stubbed. The integration page was
therefore written from source modules and upstream `docs/user/`, which implement
those behaviors.

## Update procedure

1. List what changed since the pointer:
   ```text
   MDB=$(mori registry show shinzui/shibuya-message-db-adapter --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$MDB" log --oneline 4307255..HEAD
   git -C "$MDB" diff --stat 4307255..HEAD
   ```
2. Inspect source modules, `docs/user/`, and
   `shibuya-message-db-adapter-jitsurei/app/`.
3. Update `content/docs/integrations/shibuya-message-db-adapter.mdx` and the
   shared adapter comparison when behavior changes.
4. Replace the **Last reviewed commit** block with the new `HEAD`, and move the
   old SHA into a **Previous pointers** section with a one-line summary of the
   range.
