# pgmq-hs docs ↔ source sync pointer

The `content/docs/pgmq/` tree is **ported and cross-checked** against the pgmq-hs source repo, not
generated from it. To keep updates efficient and predictable we pin the exact upstream commit the
docs were last reviewed against. When pgmq-hs changes, diff from the pinned commit to `HEAD`, update
the affected pages, then bump the pointer below.

> **Status: full content pass.** As of this pointer the `content/docs/pgmq/` section has source-
> checked overview, Reference, How-To, Explanation, and Cookbook pages for pgmq-hs core types,
> Hasql sessions, Effectful interpreters, queue configuration, migrations, FIFO, topic routing,
> notifications, visibility timeout, and queue observability. Bootstrapped by
> `docs/plans/27-bootstrap-pgmq-hs-queue-substrate-and-shibuya-pgmq-adapter-docs.md` and authored
> by `docs/plans/37-author-pgmq-hs-queue-substrate-documentation.md`.

## Upstream source

- **Qualified name (mori):** `shinzui/pgmq-hs` — resolve the on-disk path with
  `mori registry show shinzui/pgmq-hs --full` (prefer this over the hard-coded path, which can move).
- **Path at last sync:** `/Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs`
- **What it is:** a first-party Haskell client for **pgmq**, a PostgreSQL-native message queue (the
  `pgmq` Postgres extension; requires pgmq 1.11.0+, or use `pgmq-migration` to install the schema
  without the extension). Domains: Messaging, PostgreSQL.
- Relevant packages: `pgmq-core` (core types and type classes), `pgmq-hasql` (the primary
  [hasql](https://hackage.haskell.org/package/hasql)-based implementation), `pgmq-effectful`
  (Effectful effect layer with OpenTelemetry-traced interpreters), `pgmq-config` (declarative,
  idempotent queue-topology reconciliation at startup), `pgmq-migration` (install the pgmq schema
  without the extension); plus the `pgmq-bench` tool. Depends on the third-party `pgmq/pgmq`
  extension.

## Last reviewed commit

```text
973c1076f469448818de5d2044a483296be2c02e  (973c107)
2026-06-03 (full content pass: pgmq doc section authored against this commit)
pgmq-hs packages 0.3.0.0 (development line)
```

> **Note.** `Pgmq.Hasql.Sessions` exposes FIFO grouped read helpers
> (`readGrouped`, `readGroupedRoundRobin`, and polling variants) that the top-level `Pgmq` module
> does not re-export at this commit. The docs call this out where FIFO examples import
> `Pgmq.Hasql.Sessions` directly.

## Update procedure

1. List what changed since the pointer:
   ```text
   PGMQ=$(mori registry show shinzui/pgmq-hs --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$PGMQ" log --oneline 973c107..HEAD
   git -C "$PGMQ" diff --stat 973c107..HEAD
   ```
   pgmq-hs also keeps its own `README.md`, per-package `CHANGELOG.md`, and `docs/` (e.g.
   `docs/user/queue-configuration.md`, `docs/OPENTELEMETRY_INSTRUMENTATION.md`) — the prose diff
   there is the fastest way to understand intent before touching the source.
2. Update the affected pages under `content/docs/pgmq/`. The pages most coupled to the source
   surface are the Reference quadrant and code-heavy Cookbook / How-To snippets.
3. Replace the **Last reviewed commit** block above with the new `HEAD`, and move the old SHA into a
   **Previous pointers** section with a one-line summary of what the range covered.
