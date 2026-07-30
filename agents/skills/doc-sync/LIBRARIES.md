# Tracked upstreams

One row per pointer file. `status.mjs` derives the pinned SHA and mori name from the pointer files
themselves — this table exists for the parts a script cannot know: where the docs live and what
bites you.

| Pointer file | mori name | Docs tree | Notes |
| --- | --- | --- | --- |
| `docs/keiro-source-sync.md` | `shinzui/keiro` | `content/docs/keiro/` | The largest tree and the fastest-moving upstream. Packages: `keiro`, `keiro-core`, `keiro-migrations`, `keiro-pgmq`, `keiro-dsl`, `keiro-test-support`. Read `docs/adr/*` first. |
| `docs/keiki-source-sync.md` | `shinzui/keiki` | `content/docs/keiki/` | The symbolic transducer core keiro builds on. A keiki edge-semantics change is usually also a keiro evolution-doc change. |
| `docs/kiroku-source-sync.md` | `shinzui/kiroku` | `content/docs/kiroku/` (+ `write-path/`) | The event store. Owns stream-category and id rules that keiro's `StreamCategory` docs defer to. |
| `docs/shibuya-source-sync.md` | `shinzui/shibuya` | `content/docs/shibuya/` | Worker/messaging runtime. Packages `shibuya-core`, `shibuya-metrics`, `shibuya-example`. |
| `docs/shibuya-pgmq-adapter-source-sync.md` | `shinzui/shibuya-pgmq-adapter` | `content/docs/integrations/shibuya-pgmq-adapter.mdx` | Single-page pointer. |
| `docs/shibuya-kafka-adapter-source-sync.md` | `shinzui/shibuya-kafka-adapter` | `content/docs/integrations/shibuya-kafka-adapter.mdx` | Single-page pointer. |
| `docs/shibuya-message-db-adapter-source-sync.md` | `shinzui/shibuya-message-db-adapter` | `content/docs/integrations/shibuya-message-db-adapter.mdx` | Single-page pointer. |
| `docs/shibuya-kiroku-adapter-source-sync.md` | `shinzui/kiroku` | `content/docs/integrations/shibuya-kiroku-adapter.mdx` | **Shares a repo with kiroku** — the adapter package lives inside it. This pointer and `kiroku-source-sync.md` advance independently; bumping one does not review the other. |
| `docs/pgmq-hs-source-sync.md` | `shinzui/pgmq-hs` | `content/docs/pgmq/` | Note the name mismatch: repo `pgmq-hs`, docs tree `pgmq/`. |
| `docs/pg-migrate-source-sync.md` | `shinzui/pg-migrate` | `content/docs/pg-migrate/` | Migration tooling; couples to keiro's `migrations-and-schema` and `deploy-ordering` pages. |
| `docs/keiro-runtime-jitsurei-source-sync.md` | `shinzui/haskell-jitsurei` | `content/docs/example-app/` | The **standalone example app**, not the in-repo `keiro/jitsurei` package. |

## Gotchas

- **Two distinct "jitsurei".** `content/docs/example-app/` documents the standalone
  `keiro-runtime-jitsurei` app (mori `shinzui/haskell-jitsurei`), pinned by its own pointer. The
  `jitsurei/` package *inside* the keiro repo is a legacy source anchor: a refactor there is **not**
  a reason to touch `example-app/` pages, and vice versa.
- **Upstream prose diverges from upstream source.** In keiro especially, `docs/research/*` and
  `docs/plans/*` predate the implementation — renamed types, different SQL columns, features never
  built. Read them for intent; trust only the shipped source for signatures.
- **Cross-library coupling.** A change in one upstream often invalidates a page in another tree:
  keiki edge semantics → keiro evolution/replay pages; kiroku category or subscription rules → keiro
  stream/subscription pages; shibuya ack/retry → keiro inbox/outbox and every adapter page; pgmq-hs
  → `keiro-pgmq` and the pgmq adapter; pg-migrate → keiro migrations/deploy-ordering. After folding
  one library's changes, check `content/docs/integrations/` for a page describing the pair.
- **`content/docs/getting-started/`** is shared: `the-keiro-family.mdx`, `choosing-a-library.mdx`,
  `compatibility-and-upgrades.mdx`, and `installation.mdx` mention versions and package sets for
  *every* library. A new package or a release bump lands here too, and it is the easiest wiring to
  forget.
- **Never search `/nix/store` or `/`.** Resolve every dependency path through mori.
