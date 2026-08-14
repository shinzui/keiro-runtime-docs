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
7158f3e1fa67b46eedebaf94f7f44ac43cf24e80  (7158f3e)
2026-08-10T18:59:22-07:00
docs(okf): register the improvement-requests bundle
```

> **Current range.** The `172df24..7158f3e` range (**10 commits**, 43 files,
> +2,777/−22) is the **0.9.0.0 release**: `shibuya-core` and `shibuya-metrics` move from `0.8.0.1`
> to `0.9.0.0`.
>
> **The one user-facing change is application-defined dead-letter reasons.** `DeadLetterReason`
> gains a fourth constructor, `ApplicationFailure !DeadLetterCode !Text`, for a syntactically valid
> message permanently rejected by **application policy** — distinct from a poison pill, a decode
> failure, or an exhausted retry budget. **Breaking for exhaustive matches.**
>
> `DeadLetterCode` is validated on construction by `mkDeadLetterCode`: non-empty, ≤128 ASCII
> characters, at least two dot-separated segments, every segment matching `[a-z][a-z0-9_]*`. The
> application owns the code's stability; the detail is transported **verbatim** to operators and must
> not carry secrets, unrestricted backend errors, raw SQL, or full payloads. Telemetry exposes the
> reason code, and total public projections (`deadLetterReasonCode`, `deadLetterReasonDetail`,
> `renderDeadLetterReason`) let downstream packages stop duplicating the constructor renderer.
>
> Also in range: `docs/okf` capability and improvement-request bundles (upstream metadata, no
> surface), and a benchmark for dead-letter reason operations.
>
> **Pages UPDATED:** `reference/adapters-handlers-and-ack.mdx` (the constructor plus a new
> *Application-defined dead-letter reasons* section), `how-to/dead-letter-or-halt.mdx` (when to reach
> for it, with a validated-code example), `tutorials/handler-decisions.mdx`.
>
> **Pages ADDED / RETIRED:** none.
>
> **Downstream:** every adapter took a core-major bump for this — see the kafka and pgmq adapter
> pointers. Keiro 0.12's declarative router selection publishes five `keiro.router.selection.*`
> codes through this surface.
>
> **Deliberately NOT documented:** IR-1 (a *request* for a public worker probe contract, not shipped
> surface) and the OKF bundle registrations.

EP-6 rechecked the complete Shibuya 0.8 documentation against this unchanged
committed boundary and found no later behavioral drift. The source tree was
clean at the reviewed SHA.

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
- `AckHandle.finalize` may be retried with the same `AckDecision` after a
  transient finalizer failure. Adapters must make finalization idempotent or
  phase-tracked for a single delivery.
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
   git -C "$SHIBUYA" log --oneline 7158f3e..HEAD
   git -C "$SHIBUYA" diff --stat 7158f3e..HEAD
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

- `172df245f40a454af46dd7f4cde855eaa4414c5a` (`172df24`, 2026-07-04, shibuya 0.8.0.1) — the baseline before the 0.9.0.0 review. The `7158f3e..7158f3e` range (10 commits) added application-defined dead-letter reasons: `DeadLetterReason.ApplicationFailure`, the validated `DeadLetterCode`, telemetry reason codes, and total public reason projections. Breaking for exhaustive matches. Updated `reference/adapters-handlers-and-ack.mdx`, `how-to/dead-letter-or-halt.mdx`, and `tutorials/handler-decisions.mdx`.
- `f5c921f862d1b0d2b035801c3b7cfe339f0b5125 (f5c921f)` — pointer before the
  0.8.0.1 follow-up range covering the release migration guide, README refresh,
  runner allocation work, and docs alignment for the finalized 0.8 public API.
- `3f276ee190e563fddb0bc81e01d62a96a1b31715 (3f276ee)` — 0.7.1.0 release
  pointer before the 0.8 changes covering first-class batching, `AppConfig`,
  handler-facing `Message`, `OrderingPolicy`, internalized runner modules,
  metrics cleanup, and supervision/finalization fixes.
