# shibuya docs ↔ source sync pointer

The `content/docs/shibuya/` tree is **ported and cross-checked** against the
shibuya source repo, not generated from it. To keep updates efficient and
predictable, pin the exact upstream commit the docs were last reviewed against.
When shibuya changes, diff from the pinned commit to `HEAD`, update affected
pages, then bump this pointer.

## Status

Content-authored. The shibuya section now documents the core worker model,
adapter contract, envelopes, ingested messages, handlers, ack decisions, retry,
dead letters, halt, runner policies, ordering, concurrency, backpressure,
first-class batching, supervision, stream helpers, metrics, health, JSON,
Prometheus, WebSocket, OpenTelemetry, operational how-tos, recipes, FAQ, and
source walkthroughs.

## Upstream source

- **Qualified name (mori):** `shinzui/shibuya` — resolve the on-disk path with
  `mori registry show shinzui/shibuya --full`.
- **Path at last sync:** `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya`
- **Packages reviewed:** `shibuya-core`, `shibuya-metrics`, and
  `shibuya-example`.
- **Docs reviewed:** upstream `README.md`, `CHANGELOG.md`, and
  `docs/architecture/`.

## Last reviewed commit

```text
f5c921f862d1b0d2b035801c3b7cfe339f0b5125  (f5c921f)
2026-07-02T15:41:34-07:00
docs(plans): record Kafka live validation results
```

## Current source-backed claims

- Public application code should import the `Shibuya` umbrella module.
  `Shibuya.Core` remains a deprecated compatibility re-export for the 0.8
  line.
- `Adapter` is the source/shutdown/backend boundary; adapters construct
  `Ingested` values, handlers receive read-only `Message` values, return
  `AckDecision`, and the runner owns finalization through `AckHandle`.
- `Envelope` carries normalized message identity, cursor, partition, enqueue
  time, trace context, optional headers, attempt, attributes, and payload.
- `mkEnvelope` and `mkIngested` are the preferred construction helpers for
  adapter and test code.
- Runner policy owns ordering, concurrency, bounded inboxes, backpressure,
  handler invocation, ack finalization, tracing, and graceful shutdown.
- `Ordering` is now `OrderingPolicy`; `PartitionedInOrder` with `Ahead` or
  `Async` is enforced for single-message processors.
- `runApp` takes `AppConfig`, validates `inboxSize`, and returns
  `AppConfigInvalid (InvalidInboxSize n)` for invalid sizes.
- `Shibuya.Batch` provides first-class batch processors, keyed accumulation,
  size/timeout/flush triggers, and deterministic `BatchAck` resolution.
- Metrics and health surfaces come from `shibuya-metrics`; Prometheus,
  WebSocket, JSON, and health endpoints are documented from current source.
  `StreamStats.dropped` and `shibuya_messages_dropped_total` were removed.
- Current telemetry span naming uses `processSpanName destination = destination
  <> " process"`; older upstream notes that mention
  `shibuya.process.message` are stale.

## Update procedure

1. List what changed since the pointer:
   ```text
   SHIBUYA=$(mori registry show shinzui/shibuya --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$SHIBUYA" log --oneline f5c921f..HEAD
   git -C "$SHIBUYA" diff --stat f5c921f..HEAD
   ```
2. Inspect changed modules under `shibuya-core/`, `shibuya-metrics/`, and
   `shibuya-example/`, plus `README.md`, `CHANGELOG.md`, and
   `docs/architecture/`.
3. Update affected pages under `content/docs/shibuya/`. The pages most coupled
   to source are the Reference quadrant, operational how-tos, and source
   walkthroughs.
4. Replace the **Last reviewed commit** block with the new `HEAD`, and move the
   old SHA into a **Previous pointers** section with a one-line summary of the
   range.

## Previous pointers

- `3f276ee190e563fddb0bc81e01d62a96a1b31715 (3f276ee)` — 0.7.1.0 release
  pointer before the 0.8 changes covering first-class batching, `AppConfig`,
  handler-facing `Message`, `OrderingPolicy`, internalized runner modules,
  metrics cleanup, and supervision/finalization fixes.
