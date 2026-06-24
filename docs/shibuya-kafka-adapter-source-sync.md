# shibuya-kafka-adapter docs ↔ source sync pointer

The `content/docs/integrations/shibuya-kafka-adapter.mdx` page is **ported and
cross-checked** against the shibuya-kafka-adapter source repo, not generated
from it. Pin the exact upstream commit used for the docs so future changes can
be reviewed by diff.

## Status

Content-authored. The integration page documents runtime shape, configuration,
offset behavior, ack mapping, envelope mapping, fatal errors, shutdown, and
runnable examples.

## Upstream source

- **Qualified name (mori):** `shinzui/shibuya-kafka-adapter` — resolve the
  on-disk path with `mori registry show shinzui/shibuya-kafka-adapter --full`.
- **Path at last sync:** `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-kafka-adapter`
- **Modules reviewed:** `Shibuya.Adapter.Kafka`,
  `Shibuya.Adapter.Kafka.Config`, `Shibuya.Adapter.Kafka.Convert`, and
  `Shibuya.Adapter.Kafka.Internal`.
- **Examples reviewed:** `shibuya-kafka-adapter-jitsurei/app/`.

## Last reviewed commit

```text
424a4c25d96333f9cf8aa13eaae3b306bbb775c5  (424a4c2)
2026-06-05
feat!: surface Kafka headers on Envelope and require shibuya-core 0.7
```

## Current source-backed claims

- `kafkaAdapter` returns `Adapter es (Maybe ByteString)` inside a
  `KafkaConsumer` effect.
- Config supplies topics, poll timeout, batch size, and offset reset policy.
- `AckOk`, `AckRetry`, and `AckDeadLetter` store offsets; `AckHalt` pauses the
  partition and does not store the offset.
- The adapter does not publish retry-topic or DLQ records; applications that
  need those flows must do so in handlers before finalizing.
- Envelope conversion lifts topic, partition, offset, timestamp, trace headers,
  ordered Kafka headers including duplicates, and the raw record value.

## Update procedure

1. List what changed since the pointer:
   ```text
   KAFKA=$(mori registry show shinzui/shibuya-kafka-adapter --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$KAFKA" log --oneline 424a4c2..HEAD
   git -C "$KAFKA" diff --stat 424a4c2..HEAD
   ```
2. Inspect source modules and `shibuya-kafka-adapter-jitsurei/app/`.
3. Update `content/docs/integrations/shibuya-kafka-adapter.mdx` and the shared
   adapter comparison when behavior changes.
4. Replace the **Last reviewed commit** block with the new `HEAD`, and move the
   old SHA into a **Previous pointers** section with a one-line summary of the
   range.
