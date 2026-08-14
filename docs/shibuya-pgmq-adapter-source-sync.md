# shibuya-pgmq-adapter docs ↔ source sync pointer

The `content/docs/integrations/shibuya-pgmq-adapter.mdx` page is **ported and
cross-checked** against the shibuya-pgmq-adapter source repo, not generated from
it. To keep updates efficient and predictable, pin the exact upstream commit the
docs were last reviewed against. When the adapter changes, diff from the pinned
commit to `HEAD`, update the affected page(s), then bump the pointer below.

## Status

Content-authored. The integration page now documents runtime shape,
environment callbacks, configuration validation, split poll/ack retry policies,
ack mapping, idempotent finalization, dead letters, FIFO and topic helpers,
envelope mapping, optional prefetch, operational notes, and related links. This
pass checked the prose against the 0.12.0.0 adapter source and bundled user
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
fee9b3a8670e41baaa41388cfe9235aa03a5caf2  (fee9b3a)
2026-08-10T14:28:12-07:00
docs(plans): complete structured DLQ rollout
```

> **Current range.** The `85931b4..fee9b3a` range (**13 commits**, 55 files,
> +4,372/−130) lands **two releases**, `0.13.0.0` and `0.14.0.0`, taking the adapter from `0.12.0.0`.
> The adapter's own public Haskell function and record signatures are **unchanged** in both.
>
> **`0.13.0.0` — the pgmq-hs 0.5 upgrade.** Requires the `pgmq-*` 0.5 family, up from 0.4.
>
> ⚠ **Operator prerequisite:** the re-exported `parseQueueName` now accepts only `[a-z0-9_]{1,47}`.
> An existing database must be checked for **mixed-case `pgmq.meta` rows** and transactionally
> remediated *before* rollout.
>
> Reliability also improves: a lease extension that races a delete/archive/pop is a successful no-op
> instead of a row-count decoder error; transient retries inherit pgmq-effectful 0.5's broader
> SQLSTATE classification (serialization, deadlock, lock-unavailable, shutdown/recovery, resource
> exhaustion); schema installation inherits pgmq-migration 0.5's notification crash-safety migration.
>
> **`0.14.0.0` — structured dead-letter reasons.** Requires `shibuya-core ^>=0.9.0.0` for
> `ApplicationFailure` and the total public reason projections. Every new DLQ payload keeps the
> compatibility field `dead_letter_reason` and adds `dead_letter_reason_code` plus an
> **always-present** `dead_letter_reason_detail` (JSON `null` when the reason carries no detail).
> Application-owned codes and details are transported **verbatim** through Shibuya's projections; the
> adapter no longer duplicates Shibuya's constructor renderer.
>
> **Pages UPDATED:** `integrations/shibuya-pgmq-adapter.mdx` (versions, the `parseQueueName`
> prerequisite callout, 0.13 reliability notes, and a new *Structured reason fields* section),
> `getting-started/compatibility-and-upgrades.mdx`, `getting-started/choosing-a-library.mdx`.
>
> **Pages ADDED / RETIRED:** none.
>
> **Deliberately NOT documented:** upstream `docs/plans/*`, `.seihou/`, and `agents/` scaffolding.

The `99e997e..85931b4` review covers the pgmq-hs 0.4/pg-migrate dependency
upgrade and the idle-shutdown fix: an empty poll reaches the stop gate, ends the
source, and lets Shibuya drain instead of waiting forever. The source tree was
clean at the reviewed SHA.

## Current source-backed claims

- `pgmqAdapter` takes `PgmqAdapterEnv` plus `PgmqAdapterConfig`, returns
  `Either PgmqConfigError (Adapter es Value)`, and requires `Pgmq`, `Error
  PgmqRuntimeError`, `IOE`, and `Tracing`.
- `PgmqAdapterConfig` includes queue name, visibility timeout, batch size,
  polling mode, poll retry settings, ack retry settings, optional DLQ config,
  halt visibility timeout, max retries, optional FIFO config, and optional
  prefetch config.
- `AckOk` deletes the leased message; `AckRetry` changes visibility;
  `AckDeadLetter` archives or writes a DLQ copy and removes the original;
  `AckHalt` changes visibility using `haltVisibilityTimeout` or the main
  visibility timeout and stops.
- `AckHandle.finalize` is idempotent per delivery; DLQ write plus original
  delete run in one transaction when a DLQ target is configured.
- Concurrent prefetch is opt-in via `PrefetchConfig`; shutdown of prefetched
  unread messages is at-least-once safe, with redelivery delayed by visibility
  timeout rather than lost.
- Messages whose PGMQ read count exceeds `maxRetries` are automatically
  dead-lettered as `MaxRetriesExceeded` before handler delivery.
- DLQ targets can be direct queues or topic routes. DLQ writes preserve consumer
  trace context and keep upstream trace context in `x-shibuya-upstream-*`
  headers.
- Envelope conversion lifts PGMQ id, cursor, enqueue time, trace headers, FIFO
  group, zero-based attempt, and raw JSON payload. `headers` is intentionally
  `Nothing` because PGMQ JSONB headers are not exposed as an ordered broker
  header stream.
- On shutdown, the stop gate observes the next poll result before empty chunks
  are filtered; an idle source therefore ends and lets the Shibuya runner drain.

## Previous pointers

- `85931b45702faecc035d89bb5cff381e8679f793` (`85931b4`, 2026-07-14, shibuya-pgmq-adapter 0.12.0.0) — the baseline before the 0.13/0.14 review. The `85931b4..fee9b3a` range (13 commits) moved the adapter to pgmq-hs 0.5 (narrowing `parseQueueName` to `[a-z0-9_]{1,47}`, which needs a mixed-case `pgmq.meta` remediation before rollout) and then to shibuya-core 0.9, adding `dead_letter_reason_code` and an always-present `dead_letter_reason_detail` to every DLQ payload. Public Haskell signatures unchanged.
- `99e997e8a05f4a0deb92ddede4d419351f6da3d8` (`99e997e`), 2026-07-04 —
  0.11.0.0 baseline before the 0.12 dependency and idle-shutdown pass.
- `71a7b82223449d84c395b64e480c9cfe4ff274f1 (71a7b82)`, 2026-06-14:
  0.8.0.0 source-backed pass before the 0.11 adapter break that added
  `PgmqAdapterEnv`, split ack retry config, hardened finalization, and
  reintroduced scoped concurrent prefetch.
- `8e6f6e93e729bac129d7a9f2f8917f40fa4d6d9c` (`8e6f6e9`), 2026-06-05:
  bootstrap baseline. The integration page had only placeholder prose and no
  source-backed behavior transcribed.

## Update procedure

1. List what changed since the pointer:
   ```text
   ADAPTER=$(mori registry show shinzui/shibuya-pgmq-adapter --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$ADAPTER" log --oneline fee9b3a..HEAD
   git -C "$ADAPTER" diff --stat fee9b3a..HEAD
   ```
   Also inspect `README.md`, `CHANGELOG.md`, `docs/user/`, and the source
   modules listed above. Because the adapter sits on `pgmq-hs`, check
   `docs/pgmq-hs-source-sync.md` when a change spans both packages.
2. Update `content/docs/integrations/shibuya-pgmq-adapter.mdx` and any linked
   pgmq or keiro-pgmq pages that repeat adapter behavior.
3. Replace the **Last reviewed commit** block with the new `HEAD`, and move the
   old SHA into **Previous pointers** with a one-line summary of the range.
