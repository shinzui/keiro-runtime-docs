# pg-migrate docs ↔ source sync pointer

The `content/docs/pg-migrate/` tree is ported and cross-checked against
committed pg-migrate source, tests, and upstream user documentation. It is not
generated API documentation. This file pins the exact reviewed source.

## Upstream source

- **Qualified name (mori):** `shinzui/pg-migrate`; resolve it with
  `mori registry show shinzui/pg-migrate --full`.
- **Path at last sync:** `/Users/shinzui/Keikaku/bokuno/pg-migrate`.
- **Reviewed release:** all six public packages at `1.1.0.0`:
  `pg-migrate`, `pg-migrate-cli`, `pg-migrate-embed`,
  `pg-migrate-import-codd`, `pg-migrate-import-hasql-migration`, and
  `pg-migrate-test-support`.
- **Upstream docs reviewed:** public API, quickstart, operations, compatibility,
  release policy, and the committed implementation/test suites.

## Last reviewed commit

```text
f39d64e354818999667d345a1452f33eb4857fc1  (f39d64e)
2026-07-13T13:57:39-07:00
chore(release): 1.1.0.0
```

The initial full-site review covers compile-time manifest embedding,
`MigrationComponent` and `MigrationPlan` ownership, pure validation, the v1
ledger/manifest/JSON contracts, dedicated locked connections, transactional
and nontransactional state machines, application-mounted CLI behavior,
deployment and strict verification, forward-only recovery, cleanup issues,
ephemeral PostgreSQL tests, and generic/Codd/hasql-migration history import.
The upstream public build and all 110 tests passed during the documentation
pass; the source tree was clean at the reviewed SHA.

## Most-coupled pages

- Public signatures and versioned contracts under
  `content/docs/pg-migrate/reference/`.
- Authoring, CLI integration, deployment, repair, and import guides under
  `content/docs/pg-migrate/how-to/`.
- Connection, execution-state, history-evidence, and forward-only explanations.
- Runtime component composition recipes shared with Kiroku, Keiro, and PGMQ.

## Previous pointers

- None; `f39d64e` is the first full reviewed boundary for this documentation
  tree.

## Update procedure

1. Resolve the source with mori and inspect committed drift:
   ```text
   PG_MIGRATE=$(mori registry show shinzui/pg-migrate --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$PG_MIGRATE" log --oneline f39d64e..HEAD
   git -C "$PG_MIGRATE" diff --stat f39d64e..HEAD
   ```
2. Read changed public modules, tests, changelogs, and upstream docs. Recheck
   every affected versioned contract and predecessor adapter.
3. Update the site, replace the reviewed SHA above, and retain the prior pointer
   with a concise range summary.
