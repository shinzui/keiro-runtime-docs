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
supervision, stream helpers, metrics, health, JSON, Prometheus, WebSocket,
OpenTelemetry, operational how-tos, recipes, FAQ, and source walkthroughs.

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
3f276ee190e563fddb0bc81e01d62a96a1b31715  (3f276ee)
2026-06-14
chore(release): 0.7.1.0
```

## Current source-backed claims

- `Adapter` is the source/shutdown/backend boundary; handlers return
  `AckDecision` and the runner finalizes through `AckHandle`.
- `Envelope` carries normalized message identity, cursor, partition, enqueue
  time, trace context, optional headers, attempt, attributes, and payload.
- Runner policy owns ordering, concurrency, bounded inboxes, backpressure,
  handler invocation, ack finalization, tracing, and graceful shutdown.
- Metrics and health surfaces come from `shibuya-metrics`; Prometheus,
  WebSocket, JSON, and health endpoints are documented from current source.
- Current telemetry span naming uses `processSpanName destination = destination
  <> " process"`; older upstream notes that mention
  `shibuya.process.message` are stale.

## Update procedure

1. List what changed since the pointer:
   ```text
   SHIBUYA=$(mori registry show shinzui/shibuya --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$SHIBUYA" log --oneline 3f276ee..HEAD
   git -C "$SHIBUYA" diff --stat 3f276ee..HEAD
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
