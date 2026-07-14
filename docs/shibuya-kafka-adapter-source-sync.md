# shibuya-kafka-adapter docs ↔ source sync pointer

The `content/docs/integrations/shibuya-kafka-adapter.mdx` page is **ported and
cross-checked** against the shibuya-kafka-adapter source repo, not generated
from it. Pin the exact upstream commit used for the docs so future changes can
be reviewed by diff.

## Status

Content-authored. The integration page documents runtime shape, configuration,
offset behavior, local seek-based retry, serial-processing requirements,
consumer locking, ack mapping, envelope mapping, fatal errors, shutdown, and
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
65111ae11fdabd161b2147ce478647a5ed1737f9  (65111ae)
2026-07-05T08:47:47-07:00
chore(release): 0.8.0.1
```

The `468a218..65111ae` range is a metadata and dependency-bounds patch; the
reviewed 0.8 adapter behavior below is unchanged. The source tree was clean at
the reviewed SHA.

## Current source-backed claims

- `kafkaAdapter` returns `Adapter es (Maybe ByteString)` inside a
  `KafkaConsumer` effect.
- Config supplies topics, poll timeout, and batch size. The live Kafka
  subscription and offset-reset policy are supplied by the caller's consumer
  properties.
- `AckOk` stores offsets; `AckRetry` delays, records a retry barrier, and seeks
  the partition back to the failed offset; `AckDeadLetter` stores offsets after
  warning; `AckHalt` pauses the partition and does not store the offset.
- The adapter must run with serial message processing until it has a
  gap-tracking commit layer.
- The adapter does not publish retry-topic or DLQ records; applications that
  need durable retry/DLQ flows must do so in handlers before finalizing.
- The adapter serializes poll, seek, store, pause, and commit operations behind
  a shared consumer lock and records fatal/exhausted ack errors for the source
  stream to surface.
- Envelope conversion lifts topic, partition, offset, timestamp, trace headers,
  ordered Kafka headers including duplicates, and the raw record value.

## Previous pointers

- `468a218cb51bd494e670aea5f8fe4bf97c32a215` (`468a218`), 2026-07-04 —
  0.8.0.0 behavior baseline before the metadata-only 0.8.0.1 patch.
- `424a4c25d96333f9cf8aa13eaae3b306bbb775c5 (424a4c2)`, 2026-06-05:
  header-surfacing baseline before the 0.8 adapter break covering finalized
  safe adapter API, seek-based retry, fatal ack classification, bounded
  consumer locking, and release.

## Update procedure

1. List what changed since the pointer:
   ```text
   KAFKA=$(mori registry show shinzui/shibuya-kafka-adapter --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$KAFKA" log --oneline 65111ae..HEAD
   git -C "$KAFKA" diff --stat 65111ae..HEAD
   ```
2. Inspect source modules and `shibuya-kafka-adapter-jitsurei/app/`.
3. Update `content/docs/integrations/shibuya-kafka-adapter.mdx` and the shared
   adapter comparison when behavior changes.
4. Replace the **Last reviewed commit** block with the new `HEAD`, and move the
   old SHA into a **Previous pointers** section with a one-line summary of the
   range.
