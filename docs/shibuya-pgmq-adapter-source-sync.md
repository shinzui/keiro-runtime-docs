# shibuya-pgmq-adapter docs ↔ source sync pointer

The `content/docs/integrations/shibuya-pgmq-adapter.mdx` page is **ported and cross-checked**
against the shibuya-pgmq-adapter source repo, not generated from it. To keep updates efficient and
predictable we pin the exact upstream commit the docs were last reviewed against. When the adapter
changes, diff from the pinned commit to `HEAD`, update the affected page(s), then bump the pointer
below.

> **Status: bootstrap skeleton.** As of this pointer the integration page is a one-paragraph stub
> with a "Documentation in progress" callout — no wiring, delivery guarantees, configuration, or
> runnable jitsurei have been transcribed yet; written content is deferred to a later ExecPlan.
> Bootstrapped by `docs/plans/27-bootstrap-pgmq-hs-queue-substrate-and-shibuya-pgmq-adapter-docs.md`.

## Upstream source

- **Qualified name (mori):** `shinzui/shibuya-pgmq-adapter` — resolve the on-disk path with
  `mori registry show shinzui/shibuya-pgmq-adapter --full` (prefer this over the hard-coded path).
- **Path at last sync:** `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-pgmq-adapter`
- **What it is:** the PGMQ adapter for the shibuya queue-processing framework — the cross-package
  glue that lets shibuya consume a pgmq queue, parallel to the `shibuya-kiroku-adapter`. Provides
  visibility-timeout-based leasing, automatic retry handling, optional dead-letter-queue (DLQ)
  support, and `hs-opentelemetry` 1.0 tracing. Domains: concurrency, queue-processing, postgresql.
- Library modules: `Shibuya.Adapter.Pgmq`, `Shibuya.Adapter.Pgmq.Config`,
  `Shibuya.Adapter.Pgmq.Convert`. Also ships `shibuya-pgmq-example` (runnable demo) and
  `shibuya-pgmq-adapter-bench`. Depends on `shinzui/pgmq-hs`, `shinzui/shibuya`,
  `composewell/streamly`, `hasql/hasql`, `effectful/effectful`, `iand675/hs-opentelemetry`.

## Last reviewed commit

```text
8e6f6e93e729bac129d7a9f2f8917f40fa4d6d9c  (8e6f6e9)
2026-06-05 (bootstrap baseline: integration stub authored against this commit)
shibuya-pgmq-adapter 0.7.0.0 (requires shibuya-core 0.7 — Envelope headers)
```

> **Note.** This is the **bootstrap baseline** — the page is a stub, so no source surface is
> transcribed yet. The first content-authoring pass should diff `8e6f6e9..HEAD` and write the page
> against `Shibuya.Adapter.Pgmq` (the adapter constructor + leasing/retry/DLQ config in `.Config`)
> and the `shibuya-pgmq-example` demo.

## Update procedure

1. List what changed since the pointer:
   ```text
   ADAPTER=$(mori registry show shinzui/shibuya-pgmq-adapter --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$ADAPTER" log --oneline 8e6f6e9..HEAD
   git -C "$ADAPTER" diff --stat 8e6f6e9..HEAD
   ```
   The adapter also keeps its own `README.md`, `CHANGELOG.md`, and `docs/user/` guides
   (`pgmq-getting-started.md`, `pgmq-advanced.md`, `pgmq-dead-letter-queues.md`,
   `pgmq-topic-routing.md`) — the prose diff there is the fastest way to understand intent.
   Because the adapter sits on `pgmq-hs`, also check `docs/pgmq-hs-source-sync.md` when a change
   spans both.
2. Update `content/docs/integrations/shibuya-pgmq-adapter.mdx` (and any future pgmq how-to/cookbook
   pages that reference the adapter). The delivery-guarantee narrative and verbatim signatures are
   the parts most coupled to the source.
3. Replace the **Last reviewed commit** block above with the new `HEAD`, and move the old SHA into a
   **Previous pointers** section with a one-line summary of what the range covered.
