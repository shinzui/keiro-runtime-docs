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

- **Reviewed release:** adapter `0.9.1.0`. Hackage and upstream release tags checked 2026-10-02.

## Last reviewed commit

```text
c04758990927bbda6d0616ae9609c263ec73758b  (c047589)
2026-09-30T13:43:44-07:00
docs(kafka): confirm the buffered-retry stall and ordering reports
```

> **Current range.** `74fed7e8..c0475899` (**17 commits**). Reviewed published adapter 0.9.1.0 with Shibuya 0.10. Promoted lifecycle remediation from the prior candidate boundary: unresolved retry barriers, assignment-generation fencing when the rebalance handler is installed, and synchronous typed acknowledgement failure. Updated `content/docs/integrations/shibuya-kafka-adapter.mdx`, the adapter comparison and compatibility matrix. Serial execution remains a caller contract. Reported buffered-retry stalls and ordering failures remain unresolved; do not claim planned remediation or broker-restart improvements are implemented.
> No pages added or retired; existing pages were extended. Every commit is classified in [the sync ledger](source-sync-2026-10-02.md). All upstream worktrees were clean.

> **Note (prior range).** `6c0cd3fc..74fed7e8` (**7 commits**). Reviewed lifecycle acknowledgement/remediation candidate and evidence. Published behavior remains 0.9.0.1; candidate 0.9.0.2 is unpublished. Updated integration and compatibility boundaries, without presenting candidate acknowledgements as released behavior.
> No pages retired. Every commit is classified in [the sync ledger](source-sync-2026-09-21.md).

> **Note (prior range).** `28625bea..6c0cd3fc` (**6 commits**). Release 0.9.0.1 adds effectful-core 2.7 build support; adapter API and runtime behavior are unchanged. Remaining commits are formatting, metadata and development configuration.
> No pages retired. Every commit is classified in [the sync ledger](source-sync-2026-09-17.md).

> **Note (prior range).** The `65111ae..89e8026` range (**3 commits**, 16 files) is the
> **0.9.0.0 release**, up from `0.8.0.1`. `git diff --stat 65111ae..HEAD -- '*/src'` touches **no
> source**: the release is a `shibuya-core ^>=0.9.0.0` bound bump plus dev tooling.
>
> Nothing here destructured `DeadLetterReason`, so the new `ApplicationFailure` constructor needed
> no adapter code change — but the release **forces consumers onto the new core major**, and their
> own matches must be reviewed. Upstream filed it under Breaking Changes to match the precedent
> `0.8.0.0` set for a core-major bound bump.
>
> One visible behaviour change: the `AckDeadLetter` stderr warning renders through
> `renderDeadLetterReason` instead of derived `Show`, so an application failure that used to log as
> `ApplicationFailure (DeadLetterCode "my.app.code") "detail"` now logs as `my.app.code: detail` —
> the same spelling the PGMQ adapter writes into DLQ payloads, so one grep finds both.
>
> Also in range: the dev environment now uses a shared Redpanda cluster rather than starting one, and
> the OKF capabilities bundle (upstream metadata).
>
> **Pages UPDATED:** `integrations/shibuya-kafka-adapter.mdx`, `integrations/shibuya-adapters.mdx`,
> `getting-started/compatibility-and-upgrades.mdx`.
>
> **Pages ADDED / RETIRED:** none.

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
  a shared consumer lock. Fatal or exhausted acknowledgement errors also throw
  `KafkaAcknowledgementException` synchronously so failure does not depend on another source pull.
- Assignment-generation fencing requires the rebalance handler to be installed before consumer
  construction and its state shared with the adapter. Buffered retry and ordering reports remain open.
- Envelope conversion lifts topic, partition, offset, timestamp, trace headers,
  ordered Kafka headers including duplicates, and the raw record value.

## Previous pointers

- `74fed7e8df366072b0587c4bdae8d4e92317c8a3` (`74fed7e8`, 2026-09-21) — baseline before the October 2 review (17 commits); see [the ledger](source-sync-2026-10-02.md).

- `6c0cd3fc840c9f5ba48558ca94c7d826a3da6c9f` (`6c0cd3fc`, 2026-09-15) — baseline before the 7-commit September 21 review; see [the ledger](source-sync-2026-09-21.md).

- `28625beaf68ac35474c6635a8f71d7f10da33425` (`28625bea`) — baseline before the
  `28625bea..6c0cd3fc` review (6 commits). The range moved to effectful-core 2.7 and released
  0.9.0.1 without changing the adapter API; see the [2026-09-17 ledger](source-sync-2026-09-17.md).

- `89e8026b3aeb7ebca9ff93482fa7f0195be06f63` (`89e8026b`) — baseline before the `89e8026b..28625bea` review (1 commit); see [2026-09-06 ledger](source-sync-2026-09-06.md).

- `65111ae11fdabd161b2147ce478647a5ed1737f9` (`65111ae`, 2026-07-05, shibuya-kafka-adapter 0.8.0.1) — the baseline before the 0.9.0.0 review. The `65111ae..89e8026` range (3 commits) is a `shibuya-core ^>=0.9.0.0` bound bump touching no adapter source, plus one visible change: the `AckDeadLetter` stderr warning now renders via `renderDeadLetterReason`, so a dead-letter code greps identically here and in PGMQ DLQ payloads.
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
   git -C "$KAFKA" log --oneline c0475899..HEAD
   git -C "$KAFKA" diff --stat c0475899..HEAD
   ```
2. Inspect source modules and `shibuya-kafka-adapter-jitsurei/app/`.
3. Update `content/docs/integrations/shibuya-kafka-adapter.mdx` and the shared
   adapter comparison when behavior changes.
4. Replace the **Last reviewed commit** block with the new `HEAD`, and move the
   old SHA into a **Previous pointers** section with a one-line summary of the
   range.
