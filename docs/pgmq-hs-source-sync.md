# pgmq-hs docs ↔ source sync pointer

The `content/docs/pgmq/` tree is ported and cross-checked against committed
pgmq-hs source. This file records the exact review boundary.

## Upstream source

- **Qualified name (mori):** `shinzui/pgmq-hs`; resolve it with
  `mori registry show shinzui/pgmq-hs --full`.
- **Path at last sync:**
  `/Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs`.
- **Reviewed releases:** `pgmq-core`, `pgmq-hasql`, `pgmq-effectful`,
  `pgmq-config`, and `pgmq-migration` at `0.5.0.0`.
- **Schema boundary:** the embedded component installs PGMQ 1.11.0 without
  requiring the PostgreSQL extension, plus the released `0003` divergence file.

## Last reviewed commit

```text
590a46f3e499d8b129976ca15e76acb4c1d928c6  (590a46f3)
2026-08-19T20:54:54-07:00
docs(okf): add UI inspection improvement requests from keiro-ui
```

> **Current range.** `9ee9a2f3..590a46f3` (**2 commits**). Both commits are doc-neutral OKF registration/check tooling and improvement requests. Non-destructive peek/archive/fetch, public JSON codecs, and a metrics/HTTP/WebSocket sister package are proposals, not shipped APIs. No pgmq pages changed; shared compatibility records the new SHA. The public cohort remains 0.5.0.0; this also corrects stale top-of-file release metadata from the prior range.
> No pages retired. Every commit is classified in [the sync ledger](source-sync-2026-09-06.md).

> **Note (prior range).** The `5eca8d6..9ee9a2f` range (**3 commits**, 29 files) **cuts
> the 0.5.0.0 release**: `pgmq-core`, `pgmq-hasql`, `pgmq-effectful`, `pgmq-config`, and
> `pgmq-migration` all move from `0.4.0.1` to `0.5.0.0`. `pgmq-bench` stays `0.1.0.0`.
>
> **This closes the one place where these docs ran *ahead* of a release.** The previous rounds
> documented the 0.5 surface behind explicit version callouts because the work was committed but not
> cut, and because most of it was correctness work whose defects were live on `0.4.0.1`. Those
> callouts now describe a shipped release, so
> `getting-started/compatibility-and-upgrades.mdx` no longer carries the "docs run ahead" warning.
>
> The only non-release commit is `fix(docs,pgmq-hasql): delete orphans in the mixed-case remediation
> and serialize its spec` — a fix to the remediation procedure the pgmq pages already document — plus
> the OKF capabilities bundle (upstream metadata).
>
> **Pages UPDATED:** `getting-started/compatibility-and-upgrades.mdx` (row moved to `0.5.0.0`; the
> ahead-of-release callout replaced with a released note).
>
> **Pages ADDED / RETIRED:** none. The `content/docs/pgmq/` tree was already written for 0.5.
>
> **Downstream:** `shibuya-pgmq-adapter 0.13.0.0` is the adopting release; its `parseQueueName`
> narrowing to `[a-z0-9_]{1,47}` is the operator-visible consequence.

> **Note (prior range).** The `b4cab75..5eca8d6` range (19 commits) lands masterplan 3
> (*harden the pgmq-hs family*) and masterplan 4 (*make the pgmq-config
> reconciler truthful*) as **committed but unreleased** source. This is the
> pointer's one unusual property and the thing to check first next round: all
> five `.cabal` files still read `0.4.0.1`, and the CHANGELOG section is headed
> `## Unreleased (0.5.0.0)`. **When 0.5.0.0 is actually cut, the only work needed
> is to flip the version callouts** — the surface itself is documented.
>
> Documenting unreleased source was a deliberate call for this round, because
> most of the range is *correctness* work whose defects are live on `0.4.0.1`
> today. Every affected page therefore carries an explicit callout naming which
> behaviour belongs to which release, rather than silently describing `0.5.0.0`
> as current.
>
> **1. A documentation bug that was wrong for the released version too.**
> `reference/core-types.mdx` claimed insert notifications arrive on
> `pgmq_<queue_name>`. The real channel is `pgmq.q_<lowercased>.INSERT`, and this
> was already true at the *previous* pin — `0001-install-v1.11.0.sql:1587` fires
> `PG_NOTIFY('pgmq.' || TG_TABLE_NAME || '.' || TG_OP, NULL)`. Anyone following
> the old text listened on a dead channel. Corrected, with the new
> `notifyChannelName :: QueueName -> Text` helper (0.5.0.0) documented as the
> contract.
>
> **2. Boundary values that did not mean what the docs said (design 014).** On
> `0.4.0.1`: `pop` with `qty = Nothing` deletes and returns the entire queue;
> `readMessage`/`readWithPoll` with `batchSize = Nothing` lease the entire queue;
> `enableNotifyInsert` with `throttleIntervalMs = Nothing` fails SQLSTATE 23502
> on every call, permanently failing startup for any config using the default
> throttle; `ReadMessage.conditional` is silently ignored. All fixed in
> `0.5.0.0`; all documented with warn callouts on `reference/hasql-api.mdx`.
>
> **3. Queue-name validation, and the migration it forces (design 016).**
> `parseQueueName` now rejects empty and non-lowercase names, and `FromJSON
> QueueName` validates instead of being newtype-derived. Lowercase-only is a
> *correctness* rule: pgmq lowercases physical table names, `pgmq.meta` keeps the
> caller's casing, and the trigger looks up the lowercased name, so `MyQueue` and
> `myqueue` silently interleave in one physical table. Added
> `how-to/remediate-mixed-case-queue-names.mdx`, transcribing the upstream DO
> block (pinned by `MixedCaseRemediationSpec.hs`) verbatim. Note the design doc's
> own **scope correction**: mixed-case rows no longer break `pgmq-config`
> reconciliation, only the typed `listQueues`.
>
> **4. New migration `0003-notify-crash-safety-and-locking.sql`** — manifest
> count **2 → 3**. Three divergences from upstream PGMQ 1.11.0: notify fails open
> when the `UNLOGGED` throttle row is truncated by crash recovery (it previously
> suppressed *every* notification forever), `enable_notify_insert` takes the
> per-queue advisory lock and coalesces NULL to 250 ms (~28% replica collision
> rate without it), and `create_partitioned` is re-entrant via a `part_config`
> probe.
>
> **5. The reconciliation contract (design 018).** `ReconcileAction` gains
> `UpdatedNotifyThrottle` and `DetectedQueueTypeDrift`; new `ObservedQueueType`
> and `defaultThrottleMs = 250`. The reconciler now snapshots with four
> read-only queries and mutates existing state in exactly one case — the throttle
> interval, because pgmq has a non-destructive in-place update for it. Queue-type
> drift is reported, never repaired, because converting a queue means dropping
> it.
>
> **6. Breaking signatures.** `changeVisibilityTimeout` and
> `setVisibilityTimeoutAt` return `Maybe Message` at statement, session, and
> effect layers (batch variants unaffected). `isTransient` whitelists SQLSTATEs
> `40001`, `40P01`, `55P03`, `57P01`, `57P02`, `57P03`, and class `53`. New
> `listQueuesUnvalidated`, `listFifoIndexQueueNames`, `UnvalidatedQueue`.
>
> **Pages:** added `how-to/remediate-mixed-case-queue-names.mdx`. Updated
> `reference/core-types.mdx`, `reference/hasql-api.mdx`,
> `reference/effectful-api.mdx`, `reference/queue-configuration.mdx`,
> `reference/migrations.mdx`, `explanation/postgresql-queue-model.mdx`,
> `explanation/topology-and-schema.mdx`, `cookbook/reconcile-queues-on-boot.mdx`,
> `cookbook/handle-transient-errors.mdx`, `how-to/install-or-migrate-schema.mdx`,
> `index.mdx`. Nothing retired.
>
> **Fixed while in the file (pre-existing, out of range):**
> `cookbook/handle-transient-errors.mdx` used `runError` with a `Left err` match,
> which does not typecheck — `runError` yields `Either (CallStack, e) a`. Changed
> to `runErrorNoCallStack`, matching
> `keiro/how-to/declare-a-background-job.mdx:80`. Also added the missing
> `Data.Foldable (traverse_)` import to `cookbook/reconcile-queues-on-boot.mdx`.
>
> **Deliberately not documented:** `Pgmq/Config/Reconcile.hs` (the extracted
> backend-agnostic `ReconcileOps` core) — it is an internal refactor and is not
> re-exported from `Pgmq.Config`, so it has no public surface. The PGMQ 1.12
> grouped-head work (masterplan 2 / plan 12) **remains unshipped** and excluded
> for the third consecutive round. The derived-`FromJSON` validation bypass still
> present on `RoutingKey` and `TopicPattern` is an upstream-acknowledged
> follow-up (plan 15 Decision Log), not yet fixed, so not documented.

> **Note (prior range).** The `973c107..f4a1018` review covers the 0.4 package
> line, including validated names and queue APIs, Hasql and Effectful behavior,
> topology reconciliation, FIFO and topics, OpenTelemetry, the native pg-migrate
> component, exact hasql-migration predecessor import, and explicit selected-row
> policy for a shared predecessor ledger.

## Previous pointers

- `9ee9a2f30fc461244ed7539fbfe2165d9f80df91` (`9ee9a2f3`) — baseline before the `9ee9a2f3..590a46f3` review (2 commits); see [2026-09-06 ledger](source-sync-2026-09-06.md).

- `5eca8d6515cc629d29b9a15b0bd3b2243048d7bc` (`5eca8d6`, 2026-08-05, pgmq-hs 0.4.0.1) — the baseline before the 0.5.0.0 release review. The `5eca8d6..9ee9a2f` range (3 commits) cut `0.5.0.0` across all five public packages, closing the one place these docs ran ahead of a release; the ahead-of-release callout in `getting-started/compatibility-and-upgrades.mdx` was replaced with a released note.
- `b4cab751198b5012f025353610dfb4f3782c6eea` (`b4cab75`), 2026-07-23, `0.4.0.1` —
  the baseline before the hardening round. The `b4cab75..5eca8d6` range (19
  commits) landed masterplans 3 and 4 as committed-but-unreleased `0.5.0.0`
  source: notify-channel correction, NULL-parameter fixes, queue-name
  validation plus its mixed-case remediation, migration `0003`, and the
  truthful reconciliation contract.
- `f4a101843ea6f5c055277fd84859ece02865eff4` (`f4a1018`), 2026-07-14, `0.4.0.1` —
  the baseline before the plan-relocation commit. The `f4a1018..b4cab75` range
  (1 commit) changed only `docs/`; bumped as doc-neutral.
- `973c1076f469448818de5d2044a483296be2c02e` (`973c107`), 2026-06-03 —
  0.3 documentation baseline before the 0.4 native-migration and release pass.

## Update procedure

1. Resolve the source and inspect committed drift:
   ```text
   PGMQ=$(mori registry show shinzui/pgmq-hs --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$PGMQ" log --oneline 590a46f3..HEAD
   git -C "$PGMQ" diff --stat 590a46f3..HEAD
   ```
2. **Check the release status first.** `grep '^version' "$PGMQ"/*/*.cabal`. If
   they now read `0.5.0.0`, the main task is to remove the "unreleased"
   callouts across `content/docs/pgmq/` (`grep -rn 'unreleased' content/docs/pgmq/`)
   and update `getting-started/compatibility-and-upgrades.mdx`. The surface is
   already documented.
3. Read changed source, tests, changelogs, and design notes, especially the
   migration, FIFO/topic, and Effectful surfaces. Watch for the PGMQ 1.12
   grouped-head work finally landing.
4. Update affected pages, replace the reviewed SHA, and retain the prior
   pointer with a concise range summary.
