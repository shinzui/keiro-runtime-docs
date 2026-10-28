# Changelog release review

Checked on 2026-10-27. This is a release-history boundary, independent of every
`docs/*-source-sync.md` API review pointer. The [source sync](source-sync-2026-10-14.md)
records API and catalog reviews independently of this release evidence.

## Scope and evidence

The inventory covers 33 Hackage packages and two unpublished/archived declarations.
Example applications, benchmarks, and the standalone example app are excluded.
Bootstrap depth is three published releases per package; future updates retain older entries.

For each package, queried `https://hackage.haskell.org/package/<package>.json`,
sorted version components numerically, and selected the latest three published versions.
Compared `git ls-remote --tags origin` with local peeled tag commits, then read
package changelogs from those exact commits using `git show <commit>:<path>`.
The initial 93 releases have matching remote and local tag commits; the 2026-10-27 recheck below records the expanded inventory and new tags. Older retained entries preserve their prior verification.
Dates in the site are upstream changelog dates, not inferred upload dates.

Canonical package references below identify the source owner. Changelog files are
identified by that owner plus project-relative path in the evidence table;
artifact-level changelog URIs are pending. GitHub links on the published pages
pin the actual note files to the verified release commits.

## Package inventory

| Canonical package | Published versions, newest first | Site page |
| --- | --- | --- |
| `mori://shinzui/keiro/packages/keiro` | `0.22.0.0`, `0.21.0.0`, `0.20.0.0` | [History](../content/docs/changelog/keiro.mdx) |
| `mori://shinzui/keiro/packages/keiro-core` | `0.22.0.0`, `0.21.0.0`, `0.20.0.0` | [History](../content/docs/changelog/keiro.mdx) |
| `mori://shinzui/keiro/packages/keiro-dsl` | `0.22.0.0`, `0.21.0.0`, `0.20.0.0` | [History](../content/docs/changelog/keiro.mdx) |
| `mori://shinzui/keiro/packages/keiro-migrations` | `0.22.0.0`, `0.21.0.0`, `0.20.0.0` | [History](../content/docs/changelog/keiro.mdx) |
| `mori://shinzui/keiro/packages/keiro-ops` | `0.22.0.0`, `0.21.0.0`, `0.20.0.0` | [History](../content/docs/changelog/keiro.mdx) |
| `mori://shinzui/keiro/packages/keiro-pgmq` | `0.22.0.0`, `0.21.0.0`, `0.20.0.0` | [History](../content/docs/changelog/keiro.mdx) |
| `mori://shinzui/keiro/packages/keiro-test-support` | `0.22.0.0`, `0.21.0.0`, `0.20.0.0` | [History](../content/docs/changelog/keiro.mdx) |
| `mori://shinzui/keiki/packages/keiki` | `0.9.1.0`, `0.9.0.0`, `0.8.0.0` | [History](../content/docs/changelog/keiki.mdx) |
| `mori://shinzui/keiki/packages/keiki-codec-json` | `0.9.1.0`, `0.9.0.0`, `0.8.0.0` | [History](../content/docs/changelog/keiki.mdx) |
| `mori://shinzui/keiki/packages/keiki-codec-json-test` | `0.9.1.0`, `0.9.0.0`, `0.8.0.0` | [History](../content/docs/changelog/keiki.mdx) |
| `mori://shinzui/kiroku/packages/kiroku-store` | `0.12.0.0`, `0.11.0.1`, `0.11.0.0` | [History](../content/docs/changelog/kiroku.mdx) |
| `mori://shinzui/kiroku/packages/kiroku-store-migrations` | `0.7.2.0`, `0.7.1.0`, `0.7.0.0` | [History](../content/docs/changelog/kiroku.mdx) |
| `mori://shinzui/kiroku/packages/kiroku-cli` | `0.2.0.11`, `0.2.0.10`, `0.2.0.9` | [History](../content/docs/changelog/kiroku.mdx) |
| `mori://shinzui/kiroku/packages/kiroku-otel` | `0.3.0.0`, `0.2.0.12`, `0.2.0.11` | [History](../content/docs/changelog/kiroku.mdx) |
| `mori://shinzui/kiroku/packages/kiroku-metrics` | `0.4.0.0`, `0.3.0.1`, `0.3.0.0` | [History](../content/docs/changelog/kiroku.mdx) |
| `mori://shinzui/kiroku/packages/kiroku-test-support` | Source only, declares `0.1.0.0` | [History](../content/docs/changelog/kiroku.mdx) |
| `mori://shinzui/shibuya/packages/shibuya-core` | `0.12.0.0`, `0.11.0.0`, `0.10.0.1` | [History](../content/docs/changelog/shibuya.mdx) |
| `mori://shinzui/shibuya/packages/shibuya-metrics` | `0.12.0.0`, `0.11.0.0`, `0.10.0.1` | [History](../content/docs/changelog/shibuya.mdx) |
| `mori://shinzui/pgmq-hs/packages/pgmq-core` | `0.7.0.0`, `0.6.1.1`, `0.6.1.0` | [History](../content/docs/changelog/pgmq.mdx) |
| `mori://shinzui/pgmq-hs/packages/pgmq-hasql` | `0.7.0.0`, `0.6.1.1`, `0.6.1.0` | [History](../content/docs/changelog/pgmq.mdx) |
| `mori://shinzui/pgmq-hs/packages/pgmq-effectful` | `0.7.0.0`, `0.6.1.1`, `0.6.1.0` | [History](../content/docs/changelog/pgmq.mdx) |
| `mori://shinzui/pgmq-hs/packages/pgmq-config` | `0.7.0.0`, `0.6.1.1`, `0.6.1.0` | [History](../content/docs/changelog/pgmq.mdx) |
| `mori://shinzui/pgmq-hs/packages/pgmq-migration` | `0.7.0.0`, `0.6.1.1`, `0.6.1.0` | [History](../content/docs/changelog/pgmq.mdx) |
| `mori://shinzui/pg-migrate/packages/pg-migrate` | `1.2.0.0`, `1.1.0.0`, `1.0.0.0` | [History](../content/docs/changelog/pg-migrate.mdx) |
| `mori://shinzui/pg-migrate/packages/pg-migrate-cli` | `1.2.0.0`, `1.1.0.0`, `1.0.0.0` | [History](../content/docs/changelog/pg-migrate.mdx) |
| `mori://shinzui/pg-migrate/packages/pg-migrate-embed` | `1.2.0.0`, `1.1.0.0`, `1.0.0.0` | [History](../content/docs/changelog/pg-migrate.mdx) |
| `mori://shinzui/pg-migrate/packages/pg-migrate-import-codd` | `1.2.0.0`, `1.1.0.0`, `1.0.0.0` | [History](../content/docs/changelog/pg-migrate.mdx) |
| `mori://shinzui/pg-migrate/packages/pg-migrate-import-hasql-migration` | `1.2.0.0`, `1.1.0.0`, `1.0.0.0` | [History](../content/docs/changelog/pg-migrate.mdx) |
| `mori://shinzui/pg-migrate/packages/pg-migrate-test-support` | `1.2.0.0`, `1.1.0.0`, `1.0.0.0` | [History](../content/docs/changelog/pg-migrate.mdx) |
| `mori://shinzui/kiroku/packages/shibuya-kiroku-adapter` | `0.7.0.0`, `0.6.0.1`, `0.6.0.0` | [History](../content/docs/changelog/shibuya-kiroku-adapter.mdx) |
| `mori://shinzui/shibuya-pgmq-adapter/packages/shibuya-pgmq-adapter` | `0.18.0.0`, `0.16.1.0`, `0.16.0.0` | [History](../content/docs/changelog/shibuya-pgmq-adapter.mdx) |
| `mori://shinzui/shibuya-kafka-adapter/packages/shibuya-kafka-adapter` | `0.12.0.0`, `0.9.1.0`, `0.9.0.1` | [History](../content/docs/changelog/shibuya-kafka-adapter.mdx) |
| `mori://shinzui/shibuya-message-db-adapter/packages/shibuya-message-db-adapter` | Archived, declares `0.1.0.0`; no release verified | [History](../content/docs/changelog/shibuya-message-db-adapter.mdx) |
| `mori://shinzui/keiro/packages/keiro-ops-http` | `0.22.0.0` | [History](../content/docs/changelog/keiro.mdx) |
| `mori://shinzui/pgmq-hs/packages/pgmq-inspect` | `0.7.0.0` | [History](../content/docs/changelog/pgmq.mdx) |

## Exact tagged sources

| Canonical project | Tag | Peeled commit | Changelog paths (project-relative) |
| --- | --- | --- | --- |
| `mori://shinzui/keiro` | `keiro-0.21.0.0` | `e6ef560b0a8db0dc091d0f8d7da1bb08c29155be` | `keiro/CHANGELOG.md` |
| `mori://shinzui/keiro` | `keiro-0.20.0.0` | `d1492d748fc1063a7eceb8e36516c71b853397b3` | `keiro/CHANGELOG.md` |
| `mori://shinzui/keiro` | `keiro-0.19.0.1` | `9b215c1121a694e49d582d9bb4e8600a3b9b446f` | `keiro/CHANGELOG.md` |
| `mori://shinzui/keiro` | `keiro-core-0.21.0.0` | `e6ef560b0a8db0dc091d0f8d7da1bb08c29155be` | `keiro-core/CHANGELOG.md` |
| `mori://shinzui/keiro` | `keiro-core-0.20.0.0` | `d1492d748fc1063a7eceb8e36516c71b853397b3` | `keiro-core/CHANGELOG.md` |
| `mori://shinzui/keiro` | `keiro-core-0.19.0.1` | `9b215c1121a694e49d582d9bb4e8600a3b9b446f` | `keiro-core/CHANGELOG.md` |
| `mori://shinzui/keiro` | `keiro-dsl-0.21.0.0` | `e6ef560b0a8db0dc091d0f8d7da1bb08c29155be` | `keiro-dsl/CHANGELOG.md` |
| `mori://shinzui/keiro` | `keiro-dsl-0.20.0.0` | `d1492d748fc1063a7eceb8e36516c71b853397b3` | `keiro-dsl/CHANGELOG.md` |
| `mori://shinzui/keiro` | `keiro-dsl-0.19.0.1` | `9b215c1121a694e49d582d9bb4e8600a3b9b446f` | `keiro-dsl/CHANGELOG.md` |
| `mori://shinzui/keiro` | `keiro-migrations-0.21.0.0` | `e6ef560b0a8db0dc091d0f8d7da1bb08c29155be` | `keiro-migrations/CHANGELOG.md` |
| `mori://shinzui/keiro` | `keiro-migrations-0.20.0.0` | `d1492d748fc1063a7eceb8e36516c71b853397b3` | `keiro-migrations/CHANGELOG.md` |
| `mori://shinzui/keiro` | `keiro-migrations-0.19.0.1` | `9b215c1121a694e49d582d9bb4e8600a3b9b446f` | `keiro-migrations/CHANGELOG.md` |
| `mori://shinzui/keiro` | `keiro-ops-0.21.0.0` | `e6ef560b0a8db0dc091d0f8d7da1bb08c29155be` | `keiro-ops/CHANGELOG.md` |
| `mori://shinzui/keiro` | `keiro-ops-0.20.0.0` | `d1492d748fc1063a7eceb8e36516c71b853397b3` | `keiro-ops/CHANGELOG.md` |
| `mori://shinzui/keiro` | `keiro-ops-0.19.0.1` | `9b215c1121a694e49d582d9bb4e8600a3b9b446f` | `keiro-ops/CHANGELOG.md` |
| `mori://shinzui/keiro` | `keiro-pgmq-0.21.0.0` | `e6ef560b0a8db0dc091d0f8d7da1bb08c29155be` | `keiro-pgmq/CHANGELOG.md` |
| `mori://shinzui/keiro` | `keiro-pgmq-0.20.0.0` | `d1492d748fc1063a7eceb8e36516c71b853397b3` | `keiro-pgmq/CHANGELOG.md` |
| `mori://shinzui/keiro` | `keiro-pgmq-0.19.0.1` | `9b215c1121a694e49d582d9bb4e8600a3b9b446f` | `keiro-pgmq/CHANGELOG.md` |
| `mori://shinzui/keiro` | `keiro-test-support-0.21.0.0` | `e6ef560b0a8db0dc091d0f8d7da1bb08c29155be` | `keiro-test-support/CHANGELOG.md` |
| `mori://shinzui/keiro` | `keiro-test-support-0.20.0.0` | `d1492d748fc1063a7eceb8e36516c71b853397b3` | `keiro-test-support/CHANGELOG.md` |
| `mori://shinzui/keiro` | `keiro-test-support-0.19.0.1` | `9b215c1121a694e49d582d9bb4e8600a3b9b446f` | `keiro-test-support/CHANGELOG.md` |
| `mori://shinzui/keiki` | `v0.9.1.0` | `15bc83b1eb38d78488862f24bb1d873aa32a919a` | `CHANGELOG.md`, `keiki-codec-json-test/CHANGELOG.md`, `keiki-codec-json/CHANGELOG.md` |
| `mori://shinzui/keiki` | `v0.9.0.0` | `9714d37033c37595e3aaa3319ca0ca77466782e0` | `CHANGELOG.md`, `keiki-codec-json-test/CHANGELOG.md`, `keiki-codec-json/CHANGELOG.md` |
| `mori://shinzui/keiki` | `v0.8.0.0` | `9ee8de0fece845bf12dda861604b77856782d90b` | `CHANGELOG.md`, `keiki-codec-json-test/CHANGELOG.md`, `keiki-codec-json/CHANGELOG.md` |
| `mori://shinzui/kiroku` | `kiroku-cli-v0.2.0.10` | `7394055de458bef8f6ec2e68231f3ca7932bb9be` | `kiroku-cli/CHANGELOG.md` |
| `mori://shinzui/kiroku` | `kiroku-cli-v0.2.0.9` | `364ffa82136fcfc83d39ead1234abffaf500844b` | `kiroku-cli/CHANGELOG.md` |
| `mori://shinzui/kiroku` | `kiroku-cli-v0.2.0.8` | `94e11392a1e84f33ecd7f135f816e4ce3ea019d2` | `kiroku-cli/CHANGELOG.md` |
| `mori://shinzui/kiroku` | `kiroku-metrics-v0.3.0.0` | `7394055de458bef8f6ec2e68231f3ca7932bb9be` | `kiroku-metrics/CHANGELOG.md` |
| `mori://shinzui/kiroku` | `kiroku-metrics-v0.2.0.0` | `364ffa82136fcfc83d39ead1234abffaf500844b` | `kiroku-metrics/CHANGELOG.md` |
| `mori://shinzui/kiroku` | `kiroku-metrics-v0.1.0.10` | `94e11392a1e84f33ecd7f135f816e4ce3ea019d2` | `kiroku-metrics/CHANGELOG.md` |
| `mori://shinzui/kiroku` | `kiroku-otel-v0.2.0.12` | `7394055de458bef8f6ec2e68231f3ca7932bb9be` | `kiroku-otel/CHANGELOG.md` |
| `mori://shinzui/kiroku` | `kiroku-otel-v0.2.0.11` | `364ffa82136fcfc83d39ead1234abffaf500844b` | `kiroku-otel/CHANGELOG.md` |
| `mori://shinzui/kiroku` | `kiroku-otel-v0.2.0.10` | `94e11392a1e84f33ecd7f135f816e4ce3ea019d2` | `kiroku-otel/CHANGELOG.md` |
| `mori://shinzui/kiroku` | `kiroku-store-v0.11.0.0` | `7394055de458bef8f6ec2e68231f3ca7932bb9be` | `kiroku-store/CHANGELOG.md` |
| `mori://shinzui/kiroku` | `kiroku-store-v0.10.0.0` | `364ffa82136fcfc83d39ead1234abffaf500844b` | `kiroku-store/CHANGELOG.md` |
| `mori://shinzui/kiroku` | `kiroku-store-v0.9.0.1` | `94e11392a1e84f33ecd7f135f816e4ce3ea019d2` | `kiroku-store/CHANGELOG.md` |
| `mori://shinzui/kiroku` | `kiroku-store-migrations-v0.7.1.0` | `7394055de458bef8f6ec2e68231f3ca7932bb9be` | `kiroku-store-migrations/CHANGELOG.md` |
| `mori://shinzui/kiroku` | `kiroku-store-migrations-v0.7.0.0` | `364ffa82136fcfc83d39ead1234abffaf500844b` | `kiroku-store-migrations/CHANGELOG.md` |
| `mori://shinzui/kiroku` | `kiroku-store-migrations-v0.6.0.0` | `691c6efed78ca6bb344c9cac5d122eb5ca4980b2` | `kiroku-store-migrations/CHANGELOG.md` |
| `mori://shinzui/kiroku` | `shibuya-kiroku-adapter-v0.6.0.1` | `7394055de458bef8f6ec2e68231f3ca7932bb9be` | `shibuya-kiroku-adapter/CHANGELOG.md` |
| `mori://shinzui/kiroku` | `shibuya-kiroku-adapter-v0.6.0.0` | `364ffa82136fcfc83d39ead1234abffaf500844b` | `shibuya-kiroku-adapter/CHANGELOG.md` |
| `mori://shinzui/kiroku` | `shibuya-kiroku-adapter-v0.5.1.5` | `94e11392a1e84f33ecd7f135f816e4ce3ea019d2` | `shibuya-kiroku-adapter/CHANGELOG.md` |
| `mori://shinzui/shibuya` | `v0.10.0.1` | `de42f07a874bd7d59aff7e41e7ac07b7333f1397` | `shibuya-core/CHANGELOG.md`, `shibuya-metrics/CHANGELOG.md` |
| `mori://shinzui/shibuya` | `v0.10.0.0` | `694daf72f32db673bd6ae0d00867ce9ca565a3c7` | `shibuya-core/CHANGELOG.md`, `shibuya-metrics/CHANGELOG.md` |
| `mori://shinzui/shibuya` | `v0.9.0.3` | `7512b5c692af1c005392e4445cfa26a9be41f9ea` | `shibuya-core/CHANGELOG.md`, `shibuya-metrics/CHANGELOG.md` |
| `mori://shinzui/shibuya-pgmq-adapter` | `v0.16.1.0` | `6ce44abb28c983ede774ac8c6a9ada9c96b0a65f` | `shibuya-pgmq-adapter/CHANGELOG.md` |
| `mori://shinzui/shibuya-pgmq-adapter` | `v0.16.0.0` | `7472c77690d833b76ba3ba36500ff2810c9f0fc8` | `shibuya-pgmq-adapter/CHANGELOG.md` |
| `mori://shinzui/shibuya-pgmq-adapter` | `v0.15.0.0` | `22f5c4dae97722727f2f2ed47d1bf2ed9603d4ed` | `shibuya-pgmq-adapter/CHANGELOG.md` |
| `mori://shinzui/shibuya-kafka-adapter` | `v0.9.1.0` | `adadf9f52c7ca235fc41f5d7d3e95494735530ab` | `shibuya-kafka-adapter/CHANGELOG.md` |
| `mori://shinzui/shibuya-kafka-adapter` | `v0.9.0.1` | `6c0cd3fc840c9f5ba48558ca94c7d826a3da6c9f` | `shibuya-kafka-adapter/CHANGELOG.md` |
| `mori://shinzui/shibuya-kafka-adapter` | `v0.9.0.0` | `89e8026b3aeb7ebca9ff93482fa7f0195be06f63` | `shibuya-kafka-adapter/CHANGELOG.md` |
| `mori://shinzui/pgmq-hs` | `v0.6.1.1` | `696b6bd28f29e1ea53d07bf66d2d6d59f1182fa3` | `pgmq-config/CHANGELOG.md`, `pgmq-core/CHANGELOG.md`, `pgmq-effectful/CHANGELOG.md`, `pgmq-hasql/CHANGELOG.md`, `pgmq-migration/CHANGELOG.md` |
| `mori://shinzui/pgmq-hs` | `v0.6.1.0` | `163413b3ccc85ce6a517646da6ff8969c2dd7482` | `pgmq-config/CHANGELOG.md`, `pgmq-core/CHANGELOG.md`, `pgmq-effectful/CHANGELOG.md`, `pgmq-hasql/CHANGELOG.md`, `pgmq-migration/CHANGELOG.md` |
| `mori://shinzui/pgmq-hs` | `v0.6.0.0` | `7269f4de0a6e4e6f138c849758c18c7324410ac2` | `pgmq-config/CHANGELOG.md`, `pgmq-core/CHANGELOG.md`, `pgmq-effectful/CHANGELOG.md`, `pgmq-hasql/CHANGELOG.md`, `pgmq-migration/CHANGELOG.md` |
| `mori://shinzui/pg-migrate` | `v1.2.0.0` | `13865052bef62688c40576ad36889221a0ba7e08` | `pg-migrate-cli/CHANGELOG.md`, `pg-migrate-embed/CHANGELOG.md`, `pg-migrate-import-codd/CHANGELOG.md`, `pg-migrate-import-hasql-migration/CHANGELOG.md`, `pg-migrate-test-support/CHANGELOG.md`, `pg-migrate/CHANGELOG.md` |
| `mori://shinzui/pg-migrate` | `v1.1.0.0` | `f39d64e354818999667d345a1452f33eb4857fc1` | `pg-migrate-cli/CHANGELOG.md`, `pg-migrate-embed/CHANGELOG.md`, `pg-migrate-import-codd/CHANGELOG.md`, `pg-migrate-import-hasql-migration/CHANGELOG.md`, `pg-migrate-test-support/CHANGELOG.md`, `pg-migrate/CHANGELOG.md` |
| `mori://shinzui/pg-migrate` | `v1.0.0.0` | `ea0fa520da33332127c4af2588ad505e043b4838` | `pg-migrate-cli/CHANGELOG.md`, `pg-migrate-embed/CHANGELOG.md`, `pg-migrate-import-codd/CHANGELOG.md`, `pg-migrate-import-hasql-migration/CHANGELOG.md`, `pg-migrate-test-support/CHANGELOG.md`, `pg-migrate/CHANGELOG.md` |

## Publication gaps

- `mori://shinzui/kiroku/packages/kiroku-test-support` declares `0.1.0.0` at
  `ad866f925ac11484a2ee758fe235035840c85c0a`, project-relative
  `kiroku-test-support/kiroku-test-support.cabal`. Hackage returned HTTP 404;
  no matching public package tag exists. Record as source-only, not released.
- `mori://shinzui/shibuya-message-db-adapter/packages/shibuya-message-db-adapter`
  declares `0.1.0.0` at `51a36348ee31bd97eea595b34533ca8cfa931f82`,
  project-relative `shibuya-message-db-adapter/shibuya-message-db-adapter.cabal`.
  Hackage returned HTTP 404; the upstream has no tags and Mori marks it Archived.
  The earlier compatibility matrix's “release” terminology is corrected to “source”.
- Keiki SCXML, Shibuya controls/detail/tracing, and PGMQ inspection/disconnect
  work present after the selected tags are not folded into published history.
- Keiro 0.21 and Kiroku's October APIs are now covered by the independent
  [source review](source-sync-2026-10-14.md). Package history itself does not certify API coverage.

## Maintenance

Use [the doc-sync release procedure](../agents/skills/doc-sync/CHANGELOG.md)
on every library status/sync, including when the upstream commit pointer has no drift.
Update this evidence only after checking release availability and tagged notes.
A release-only review never advances the API source pointers or runtime catalog boundary.

## Validation

- `KEIRO_DOCS_SKIP_FONTS=1 nix develop -c bun run check` passed: 19 tests,
  catalog/terminology checks, prose, types, lint/format, navigation, diagrams,
  static build, and internal links. The static crawler scanned zero links;
  source-level link checks covered all 609 published pages.
- Coverage inspection found all 33 canonical package identities once and all
  93 selected Hackage version links once. There were no missing release links.
- Browser review verified the changelog landing cards/sidebar and Keiro's
  release table and notes.
- Skill YAML parses, companion references resolve, and existing invocation
  settings are preserved. The bundled generic skill validator rejects the
  pre-existing `argument-hint` and `user-invocable` keys in both the original
  and updated skill; this change preserves those local invocation settings.

## 2026-10-14 source-sync release recheck

Requeried all 33 identities: the latest three versions for each of the 31 published packages
remain the 93 entries above. All 57 remote/local tag rows match their recorded peeled commits,
and package changelogs were reread from those immutable trees. No new published version was missing.
The latest 31 registry Cabal files have no `x-revision` (revision 0), so no bounds revision entry
is required. Kiroku test support and the archived Message DB adapter again returned confirmed HTTP 404.
No release tag or publication gap changed. New source-only API guidance preserves its qualification.

## 2026-10-27 release recheck

All 35 committed public package declarations were inventoried through Mori plus the committed Cabal files. Hackage package JSON and latest-version Cabal metadata were queried independently for every package. The cohort now has 33 published packages and two confirmed HTTP-404 declarations (Kiroku test support and archived Message DB adapter). All latest Cabal files remain revision 0 (no x-revision). No registry checks remain unresolved.

New inventory members: `mori://shinzui/keiro/packages/keiro-ops-http` (0.22.0.0) and `mori://shinzui/pgmq-hs/packages/pgmq-inspect` (0.7.0.0), each with one published release. Existing histories are retained in full. Published Keiro/PGMQ inspection and Shibuya control/detail work is no longer classified as source-only; Keiki SCXML remains outside its published tag.

Each package's latest three available versions (one for each new package) were compared with remote tag refs and local peeled commits, and package notes were read at those exact trees. The newly added releases are:

| Canonical package | Version | Tag | Peeled commit | Notes within canonical owner |
| --- | --- | --- | --- | --- |
| `mori://shinzui/shibuya-kafka-adapter/packages/shibuya-kafka-adapter` | 0.12.0.0 | `v0.12.0.0` | `52a63a1353487da589b5e56468c9193147f448a7` | `shibuya-kafka-adapter/CHANGELOG.md` |
| `mori://shinzui/keiro/packages/keiro-core` | 0.22.0.0 | `keiro-core-0.22.0.0` | `b28201f2063fa4f6dcb724cbf474959107e36b74` | `keiro-core/CHANGELOG.md` |
| `mori://shinzui/keiro/packages/keiro-dsl` | 0.22.0.0 | `keiro-dsl-0.22.0.0` | `b28201f2063fa4f6dcb724cbf474959107e36b74` | `keiro-dsl/CHANGELOG.md` |
| `mori://shinzui/keiro/packages/keiro-migrations` | 0.22.0.0 | `keiro-migrations-0.22.0.0` | `b28201f2063fa4f6dcb724cbf474959107e36b74` | `keiro-migrations/CHANGELOG.md` |
| `mori://shinzui/keiro/packages/keiro-ops-http` | 0.22.0.0 | `keiro-ops-http-0.22.0.0` | `b28201f2063fa4f6dcb724cbf474959107e36b74` | `keiro-ops-http/CHANGELOG.md` |
| `mori://shinzui/keiro/packages/keiro-ops` | 0.22.0.0 | `keiro-ops-0.22.0.0` | `b28201f2063fa4f6dcb724cbf474959107e36b74` | `keiro-ops/CHANGELOG.md` |
| `mori://shinzui/keiro/packages/keiro-pgmq` | 0.22.0.0 | `keiro-pgmq-0.22.0.0` | `b28201f2063fa4f6dcb724cbf474959107e36b74` | `keiro-pgmq/CHANGELOG.md` |
| `mori://shinzui/keiro/packages/keiro-test-support` | 0.22.0.0 | `keiro-test-support-0.22.0.0` | `b28201f2063fa4f6dcb724cbf474959107e36b74` | `keiro-test-support/CHANGELOG.md` |
| `mori://shinzui/keiro/packages/keiro` | 0.22.0.0 | `keiro-0.22.0.0` | `b28201f2063fa4f6dcb724cbf474959107e36b74` | `keiro/CHANGELOG.md` |
| `mori://shinzui/kiroku/packages/kiroku-cli` | 0.2.0.11 | `kiroku-cli-v0.2.0.11` | `22d103e4f424caab06c6a2b76ad92b408c262bc0` | `kiroku-cli/CHANGELOG.md` |
| `mori://shinzui/kiroku/packages/kiroku-metrics` | 0.4.0.0 | `kiroku-metrics-v0.4.0.0` | `22d103e4f424caab06c6a2b76ad92b408c262bc0` | `kiroku-metrics/CHANGELOG.md` |
| `mori://shinzui/kiroku/packages/kiroku-metrics` | 0.3.0.1 | `kiroku-metrics-v0.3.0.1` | `084fd8359850342447cdda8e632b7dc456c7fca4` | `kiroku-metrics/CHANGELOG.md` |
| `mori://shinzui/kiroku/packages/kiroku-otel` | 0.3.0.0 | `kiroku-otel-v0.3.0.0` | `22d103e4f424caab06c6a2b76ad92b408c262bc0` | `kiroku-otel/CHANGELOG.md` |
| `mori://shinzui/kiroku/packages/kiroku-store-migrations` | 0.7.2.0 | `kiroku-store-migrations-v0.7.2.0` | `22d103e4f424caab06c6a2b76ad92b408c262bc0` | `kiroku-store-migrations/CHANGELOG.md` |
| `mori://shinzui/kiroku/packages/kiroku-store` | 0.12.0.0 | `kiroku-store-v0.12.0.0` | `22d103e4f424caab06c6a2b76ad92b408c262bc0` | `kiroku-store/CHANGELOG.md` |
| `mori://shinzui/kiroku/packages/kiroku-store` | 0.11.0.1 | `kiroku-store-v0.11.0.1` | `084fd8359850342447cdda8e632b7dc456c7fca4` | `kiroku-store/CHANGELOG.md` |
| `mori://shinzui/kiroku/packages/shibuya-kiroku-adapter` | 0.7.0.0 | `shibuya-kiroku-adapter-v0.7.0.0` | `22d103e4f424caab06c6a2b76ad92b408c262bc0` | `shibuya-kiroku-adapter/CHANGELOG.md` |
| `mori://shinzui/pgmq-hs/packages/pgmq-config` | 0.7.0.0 | `v0.7.0.0` | `88afb93802f790c1ecfbd3ed8bcce196c4430d13` | `pgmq-config/CHANGELOG.md` |
| `mori://shinzui/pgmq-hs/packages/pgmq-core` | 0.7.0.0 | `v0.7.0.0` | `88afb93802f790c1ecfbd3ed8bcce196c4430d13` | `pgmq-core/CHANGELOG.md` |
| `mori://shinzui/pgmq-hs/packages/pgmq-effectful` | 0.7.0.0 | `v0.7.0.0` | `88afb93802f790c1ecfbd3ed8bcce196c4430d13` | `pgmq-effectful/CHANGELOG.md` |
| `mori://shinzui/pgmq-hs/packages/pgmq-hasql` | 0.7.0.0 | `v0.7.0.0` | `88afb93802f790c1ecfbd3ed8bcce196c4430d13` | `pgmq-hasql/CHANGELOG.md` |
| `mori://shinzui/pgmq-hs/packages/pgmq-inspect` | 0.7.0.0 | `v0.7.0.0` | `88afb93802f790c1ecfbd3ed8bcce196c4430d13` | `pgmq-inspect/CHANGELOG.md` |
| `mori://shinzui/pgmq-hs/packages/pgmq-migration` | 0.7.0.0 | `v0.7.0.0` | `88afb93802f790c1ecfbd3ed8bcce196c4430d13` | `pgmq-migration/CHANGELOG.md` |
| `mori://shinzui/shibuya-pgmq-adapter/packages/shibuya-pgmq-adapter` | 0.18.0.0 | `v0.18.0.0` | `e549451978f93f28ccb39912404be9a8a3fea4d7` | `shibuya-pgmq-adapter/CHANGELOG.md` |
| `mori://shinzui/shibuya/packages/shibuya-core` | 0.12.0.0 | `v0.12.0.0` | `14f35d8995cc3dc3e2671e4d2505abf9bf4f5a9e` | `shibuya-core/CHANGELOG.md` |
| `mori://shinzui/shibuya/packages/shibuya-core` | 0.11.0.0 | `v0.11.0.0` | `a4b2b8e3e876f550b7fa08fb8d5a94975a0cc9da` | `shibuya-core/CHANGELOG.md` |
| `mori://shinzui/shibuya/packages/shibuya-metrics` | 0.12.0.0 | `v0.12.0.0` | `14f35d8995cc3dc3e2671e4d2505abf9bf4f5a9e` | `shibuya-metrics/CHANGELOG.md` |
| `mori://shinzui/shibuya/packages/shibuya-metrics` | 0.11.0.0 | `v0.11.0.0` | `a4b2b8e3e876f550b7fa08fb8d5a94975a0cc9da` | `shibuya-metrics/CHANGELOG.md` |

Project-relative note paths above belong to the canonical package owner in the first column; artifact-level changelog URIs remain pending. Dates on the site follow the exact tagged notes. Source-only release automation after Keiro's publication tag is not presented as a published API change.

The PGMQ adapter 0.18 release explicitly retains two unsuccessful FIFO acknowledgement performance bounds; its publication does not establish performance acceptance. Uncommitted upstream benchmark changes were excluded. Package history does not advance incomplete API reviews or the runtime-pattern publication boundary. See [the current source ledger](source-sync-2026-10-27.md).
