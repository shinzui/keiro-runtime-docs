# pgmq-hs docs ↔ source sync pointer

The `content/docs/pgmq/` tree is ported and cross-checked against committed
pgmq-hs source. This file records the exact review boundary.

## Upstream source

- **Qualified name (mori):** `shinzui/pgmq-hs`; resolve it with
  `mori registry show shinzui/pgmq-hs --full`.
- **Path at last sync:**
  `/Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs`.
- **Reviewed releases:** `pgmq-core`, `pgmq-hasql`, `pgmq-effectful`,
  `pgmq-config`, and `pgmq-migration` at `0.4.0.1`.
- **Schema boundary:** the embedded component installs PGMQ 1.11.0 without
  requiring the PostgreSQL extension.

## Last reviewed commit

```text
f4a101843ea6f5c055277fd84859ece02865eff4  (f4a1018)
2026-07-14T11:37:41-07:00
fix(pgmq-migration): support shared predecessor ledgers
```

The `973c107..f4a1018` review covers the 0.4 package line, including validated
names and queue APIs, Hasql and Effectful behavior, topology reconciliation,
FIFO and topics, OpenTelemetry, the native pg-migrate component, exact
hasql-migration predecessor import, and explicit selected-row policy for a
shared predecessor ledger. The source tree was clean at the reviewed SHA. The
uncommitted future PGMQ 1.12 grouped-head plan was excluded.

## Previous pointers

- `973c1076f469448818de5d2044a483296be2c02e` (`973c107`), 2026-06-03 —
  0.3 documentation baseline before the 0.4 native-migration and release pass.

## Update procedure

1. Resolve the source and inspect committed drift:
   ```text
   PGMQ=$(mori registry show shinzui/pgmq-hs --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$PGMQ" log --oneline f4a1018..HEAD
   git -C "$PGMQ" diff --stat f4a1018..HEAD
   ```
2. Read changed source, tests, changelogs, and user guides, especially the
   migration, FIFO/topic, and Effectful surfaces.
3. Update affected pages, replace the reviewed SHA, and retain the prior
   pointer with a concise range summary.
