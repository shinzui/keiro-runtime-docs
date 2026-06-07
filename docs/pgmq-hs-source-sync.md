# pgmq-hs docs ↔ source sync pointer

The `content/docs/pgmq/` tree is **ported and cross-checked** against the pgmq-hs source repo, not
generated from it. To keep updates efficient and predictable we pin the exact upstream commit the
docs were last reviewed against. When pgmq-hs changes, diff from the pinned commit to `HEAD`, update
the affected pages, then bump the pointer below.

> **Status: bootstrap skeleton.** As of this pointer the `content/docs/pgmq/` section is a
> navigation skeleton only — a section `index.mdx` plus "Documentation in progress" stubs for the
> Reference / How-To / Explanation / Cookbook quadrants. No API surface has been transcribed yet;
> written content is deferred to a later ExecPlan. Bootstrapped by
> `docs/plans/27-bootstrap-pgmq-hs-queue-substrate-and-shibuya-pgmq-adapter-docs.md`.

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
2026-06-03 (bootstrap baseline: pgmq doc section skeleton authored against this commit)
pgmq-hasql 0.3.0.0 (development line)
```

> **Note.** This is the **bootstrap baseline** — the section is a skeleton, so no source surface is
> transcribed yet. The first content-authoring pass should diff `973c107..HEAD` and write the
> Reference pages against the `Pgmq` API (`createQueue`, `sendMessage`, `readMessage`, archive/delete,
> visibility timeout) and the `Pgmq.Config` reconciliation surface.

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
2. Update the affected pages under `content/docs/pgmq/`. Once the section is fleshed out, the pages
   most coupled to the source surface (verbatim signatures, SQL shapes, option records) will be the
   Reference quadrant and any code walkthroughs.
3. Replace the **Last reviewed commit** block above with the new `HEAD`, and move the old SHA into a
   **Previous pointers** section with a one-line summary of what the range covered.
