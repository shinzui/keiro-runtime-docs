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
b4cab751198b5012f025353610dfb4f3782c6eea  (b4cab75)
2026-07-23T19:02:25-07:00
docs(plans): relocate pgmq hardening plans
```

The `f4a1018..b4cab75` range (1 commit) is **doc-neutral**:
`git diff --stat f4a1018..b4cab75 -- ':!docs'` is empty. It only relocates and
adds planning prose — masterplan 3 (*harden the pgmq-hs family surfaced by the
2026-07 review*) plus plans 13 (null-parameter semantics across pop/read/notify
statements), 14 (crash-surviving insert notifications and a documented channel
contract), and 15 (queue-name validation and transient-error classification),
and an edit to masterplan 2 / plan 12 for PGMQ 1.12 grouped-head reads.

**Deliberately not documented:** all of the above. None of it is in the source at
this pin — the reviewed releases are unchanged at `0.4.0.1`, and the PGMQ 1.12
grouped-head work remains unshipped (it was already excluded at the previous
pin). Do not port signatures from those plans; wait for the source.

The `973c107..f4a1018` review covers the 0.4 package line, including validated
names and queue APIs, Hasql and Effectful behavior, topology reconciliation,
FIFO and topics, OpenTelemetry, the native pg-migrate component, exact
hasql-migration predecessor import, and explicit selected-row policy for a
shared predecessor ledger. The source tree was clean at the reviewed SHA. The
uncommitted future PGMQ 1.12 grouped-head plan was excluded.

## Previous pointers

- `f4a101843ea6f5c055277fd84859ece02865eff4` (`f4a1018`), 2026-07-14, `0.4.0.1` —
  the baseline before the plan-relocation commit. The `f4a1018..b4cab75` range
  (1 commit) changed only `docs/`; bumped as doc-neutral.
- `973c1076f469448818de5d2044a483296be2c02e` (`973c107`), 2026-06-03 —
  0.3 documentation baseline before the 0.4 native-migration and release pass.

## Update procedure

1. Resolve the source and inspect committed drift:
   ```text
   PGMQ=$(mori registry show shinzui/pgmq-hs --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$PGMQ" log --oneline b4cab75..HEAD
   git -C "$PGMQ" diff --stat b4cab75..HEAD
   ```
2. Read changed source, tests, changelogs, and user guides, especially the
   migration, FIFO/topic, and Effectful surfaces.
3. Update affected pages, replace the reviewed SHA, and retain the prior
   pointer with a concise range summary.
