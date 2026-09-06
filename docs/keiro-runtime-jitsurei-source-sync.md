# keiro-runtime-jitsurei docs ↔ source sync pointer

The `content/docs/example-app/` tree is ported and cross-checked against the standalone
application `mori://shinzui/keiro-runtime-jitsurei`, not generated from it. This is separate from
the small legacy example tracked by [the Keiro pointer](keiro-source-sync.md).

## Upstream source

- **Qualified name (mori):** `shinzui/keiro-runtime-jitsurei` — resolve with
  `mori registry show shinzui/keiro-runtime-jitsurei --full`.
- **Path at last sync:** `/Users/shinzui/Keikaku/bokuno/keiro-runtime-jitsurei`
- **Packages reviewed:** `incident-command` and `hospital-capacity`, including their specs,
  generated facts/harnesses, hand-owned runtime, CLI/worker/migration entrypoints, tests and scripts.
- **Source guides:** `mori://shinzui/keiro-runtime-jitsurei/docs/runtime-walkthrough`,
  `mori://shinzui/keiro-runtime-jitsurei/docs/observability`,
  `mori://shinzui/keiro-runtime-jitsurei/docs/integration-contracts`, and
  `mori://shinzui/keiro-runtime-jitsurei/docs/scenarios`.
- **Application dependency baseline:** Keiki 0.2.0.0, Keiro 0.3.0.0, Kiroku Store 0.3.0.1,
  Shibuya/Kafka adapter 0.8.0.1, pgmq-hs 0.4.0.0, PGMQ adapter 0.12.0.0, pg-migrate 1.1.0.0.
  These are the app's committed pins, not the current library versions documented elsewhere.

## Last reviewed commit

```text
e3c800eb9d010289e05aa00390a38973a1ac239d  (e3c800eb)
2026-08-08T20:56:52-07:00
chore(dev): use the shared Redpanda cluster instead of starting one
```

> **Current range.** `04420ed1..e3c800eb` (**20 commits**, 272 changed files).
> The previously deferred source-tour re-port is complete: 30 example-app pages updated,
> none added or retired. Reviewed both service tours, contracts/inbox/outbox/Kafka/telemetry,
> overview/domain/architecture/feature map, setup, scenarios, workers and trace verification.
> The [sync ledger](source-sync-2026-09-06.md) classifies every commit.
>
> **Shipped boundaries:** permanent Keiro DSL specs and generated facts/harnesses coexist with
> hand-owned runtime transducers/codecs. List registers, arithmetic, composite router keys and
> severity-dependent timers remain hand-owned. Raw definitions are validated before command use;
> process-level resource runners replace raw store handles, and command IDs derive stable event IDs.
> Incident registers six Eventual read models and Hospital four; inline helpers do not imply Strong.
> Workflow signals find stored pending awakeables by owner instead of reconstructing IDs.
>
> **Messaging:** Shibuya runApp owns Kafka finalization and graceful lifecycle. Poison is retained
> in service tables before AckOk; unavailable retention retries. On-demand outbox enqueue reads
> an already-recorded source event and is separate from the original append. The live producer
> header owns Kafka trace parentage. Hospital uses typed one-shot runJobOnceWithContext with
> generated policy, idempotent job evidence and real DLQ retention; remote-parent extraction and
> a Shibuya job process span are not claimed for that pinned one-shot path.
>
> **Operations:** service-owned pg-migrate plans replace raw/TypeID SQL bootstrap. Incident orders
> kiroku/keiro/application; Hospital adds pgmq before application. The supported legacy cutover
> recreates only named local databases; no data-preserving import is claimed. Redpanda is now a
> shared-cluster reachability check, despite stale upstream README prose about rpk containers.
> Generic OTLP base URLs append /v1/traces; per-signal overrides are complete URLs.
>
> **Excluded:** the dirty `.gitignore`, historical DSL prototype grammar and unlanded proposals.
> Application dependencies were not upgraded. No live resets or upstream Haskell tests were run
> during this documentation pass; evidence commands are source-reviewed instructions.

## Most-coupled pages

- All service source tours under `content/docs/example-app/incident-command/` and `hospital-capacity/`.
- `cross-service/` for contract, ack, poison, outbox and trace boundaries.
- `running-it/` for exact recipes, migration ownership and live verification.
- `overview/00-what-it-demonstrates.mdx` owns generated/hand-owned authoring guidance.

## Previous pointers

- `04420ed1734f6c7ee850de7e50ab11e7073b8bfd` (`04420ed1`, 2026-06-07) — original raw-runtime tour baseline.
  Surveys on 2026-07-30 and 2026-08-14 deliberately kept this pin while the whole-tree re-port
  was outstanding. The 2026-09-06 review closes that gap against the committed tree above.

## Update procedure

1. Resolve `mori://shinzui/keiro-runtime-jitsurei` through Mori and inspect committed changes:
   ```text
   mori registry show shinzui/keiro-runtime-jitsurei --full
   git -C "$APP" log --oneline e3c800eb..HEAD
   git -C "$APP" diff --stat e3c800eb..HEAD
   ```
   Set `APP` to the resolved path. Read upstream intent, then committed source; exclude dirty files.
2. Re-read every changed toured function and update generated/hand-owned ownership claims together.
3. Check links, navigation, typecheck, build and changed anchors before moving this pointer.
