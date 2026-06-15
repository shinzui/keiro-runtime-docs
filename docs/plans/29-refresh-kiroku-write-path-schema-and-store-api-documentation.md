---
id: 29
slug: refresh-kiroku-write-path-schema-and-store-api-documentation
title: "Refresh Kiroku write path schema and store API documentation"
kind: exec-plan
created_at: 2026-06-15T19:08:17Z
master_plan: "docs/masterplans/4-refresh-keiro-and-kiroku-documentation-after-june-hardening.md"
---

# Refresh Kiroku write path schema and store API documentation

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this plan is implemented, a Kiroku user reading this docs site can understand the current store write path, read path, schema migration behavior, and public store API as of the current `shinzui/kiroku` `HEAD`. The docs will no longer describe only the June 1 pin in `docs/kiroku-source-sync.md`; they will cover the June 2026 hardening range that added stream-category helpers, oversized stream-name rejection, typed append/link failures, empty-batch rejection, backward-read fixes, `eventExistsInStream`, duplicate event surfacing from transactions, pipelined multi-stream append, and migration/schema hygiene.

The user-visible proof is that `content/docs/kiroku/reference/core-types.mdx`, `content/docs/kiroku/reference/store-effect.mdx`, the write-path walkthrough, migration/how-to pages, and the Kiroku source-sync pointer agree with the current source modules under `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store/` and `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store-migrations/`.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [ ] Re-read the current `shinzui/kiroku` source range and summarize source facts from `0a39598..HEAD`.
- [ ] Update Kiroku core type and store effect reference pages for current append/read/category/error APIs.
- [ ] Update write-path walkthrough pages for pipelined multi-stream append, empty-batch rejection, duplicate-event surfacing, and backward-read behavior.
- [ ] Update schema and migration docs for the June 11 migration files and dedicated `kiroku` schema behavior.
- [ ] Update `docs/kiroku-source-sync.md` notes only if EP-6 has not already claimed the final pointer edit; otherwise record the required pointer text in this plan's retrospective.
- [ ] Run docs validation commands and record results.


## Surprises & Discoveries

(None yet.)


## Decision Log

Record every decision made while working on the plan.

- Decision: Treat Kiroku's checked-in Haskell source and migration SQL as authoritative over older prose docs.
  Rationale: `mori registry docs shinzui/kiroku` reports no curated docs, and `docs/kiroku-source-sync.md` explicitly says to trust shipped source over older notes when they diverge.
  Date: 2026-06-15


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

(To be filled during and after implementation.)


## Context and Orientation

This repository is a Fumadocs documentation site. Kiroku docs live under `content/docs/kiroku/`. The source-sync pointer for those docs is `docs/kiroku-source-sync.md`. The current pointer says the docs were last reviewed at Kiroku commit `0a39598a4a9614528316f6c9c63842cc1d55d313` from 2026-06-01. The current local source tree is found through `mori registry show shinzui/kiroku --full` and is currently `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku`.

Kiroku is a PostgreSQL event store. A stream is the ordered event history for one entity or logical feed. The `$all` stream is the global event order. A category is the prefix before the hyphen in a stream name; for example, `invoice-123` is in category `invoice`. A subscription is a worker that reads events and acknowledges them after handling. A migration is a forward-only SQL schema change run before the store opens.

The source files that matter for this plan are:

- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store/src/Kiroku/Store.hs`, the umbrella public API.
- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store/src/Kiroku/Store/Types.hs`, where `StreamName`, `CategoryName`, `categoryName`, `streamNameInCategory`, `ExpectedVersion`, `RecordedEvent`, and `AppendResult` live.
- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store/src/Kiroku/Store/Append.hs`, where `appendToStream` and `appendMultiStream` are exposed.
- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store/src/Kiroku/Store/Read.hs`, where `readStreamForward`, `readStreamBackward`, `readAllForward`, `readAllBackward`, `readCategory`, and `eventExistsInStream` are exposed.
- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store/src/Kiroku/Store/Error.hs`, where `StoreError`, typed append/link failures, and `AppendConflict` are defined.
- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store/src/Kiroku/Store/Transaction.hs`, where transactional append helpers surface duplicate event and retry behavior.
- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store/src/Kiroku/Store/Effect.hs` and `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store/src/Kiroku/Store/SQL.hs`, where the interpreter, pipelined multi-append path, and SQL behavior can be checked.
- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store-migrations/sql-migrations/`, especially the four `2026-06-11-*` migration files for notification guarding, dead-letter indexes, fillfactor/index hygiene, and stream-name length checks.
- `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store-migrations/README.md`, which describes the embedded codd migration runner.

The docs most likely to need edits are `content/docs/kiroku/reference/core-types.mdx`, `content/docs/kiroku/reference/store-effect.mdx`, `content/docs/kiroku/explanation/streams-and-categories.mdx`, `content/docs/kiroku/how-to/run-against-postgres.mdx`, `content/docs/kiroku/write-path/01-the-store-effect-and-append-api.mdx`, `content/docs/kiroku/write-path/02-the-append-cte.mdx`, `content/docs/kiroku/write-path/03-outcomes-and-errors.mdx`, `content/docs/kiroku/write-path/04-multi-stream-and-transactions.mdx`, `content/docs/kiroku/tutorials/getting-started.mdx`, and `content/docs/kiroku/faq.mdx`.


## Plan of Work

Milestone 1 audits the source range. Run the commands in the Concrete Steps section, then read the modules listed in Context and Orientation. Produce a short working note for yourself that groups changes into public API, error behavior, SQL/migration behavior, and performance behavior. The milestone is complete when every changed behavior named in this plan has a source module or test file to cite.

Milestone 2 updates the public API and core concept pages. In `content/docs/kiroku/reference/core-types.mdx` and `content/docs/kiroku/explanation/streams-and-categories.mdx`, document `CategoryName`, `categoryName`, and `streamNameInCategory`; explain that category splitting is based on the first hyphen and that `streamNameInCategory` centralizes safe construction. In `content/docs/kiroku/reference/store-effect.mdx`, document `appendMultiStream`, `eventExistsInStream`, typed append/link failures, empty batch rejection, and current retry language. Acceptance is that each signature or behavior described can be found in the current source.

Milestone 3 updates the write-path walkthrough. Update `content/docs/kiroku/write-path/01-the-store-effect-and-append-api.mdx` through `04-multi-stream-and-transactions.mdx` so they describe the current interpreter: empty append batches fail loudly, backward reads paginate correctly, duplicate events from transactions surface as store errors, multi-stream append uses the pipelined path, and global positions remain an opaque strictly increasing cursor rather than a dense gap-free sequence. Acceptance is that a reader can follow the walkthrough and locate the corresponding functions in `Kiroku.Store.Effect`, `Kiroku.Store.SQL`, and `Kiroku.Store.Transaction`.

Milestone 4 updates schema and migration guidance. Update the migration/how-to pages that mention schema setup to include the dedicated `kiroku` schema, the embedded `kiroku-store-migrate` runner, and the June 11 migration intent: notification trigger append guard, dead-letter event-id index, index/fillfactor hygiene, and stream-name length check. Acceptance is that docs do not imply public-schema installation or editable historical migrations.

Milestone 5 validates and records the source-sync summary. If this plan directly updates `docs/kiroku-source-sync.md`, replace the Last reviewed commit block with current `HEAD` and move `0a39598` into Previous pointers with a concise summary. If EP-6 owns that edit, add the exact summary text to this plan's Outcomes & Retrospective so EP-6 can apply it. Acceptance is that `pnpm run typecheck`, `pnpm run format:check`, and `pnpm build` pass, or any failure is recorded with the exact failing output.


## Concrete Steps

Work from the docs repository:

```bash
cd /Users/shinzui/Keikaku/bokuno/keiro-runtime-docs
mori registry show shinzui/kiroku --full
git -C /Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku log --oneline --date=short --pretty=format:'%h %ad %s' 0a39598..HEAD
git -C /Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku diff --stat 0a39598..HEAD
```

Expected high-level output includes commits such as:

```text
4312aa8 2026-06-14 feat(kiroku-store): add eventExistsInStream point lookup
b005e99 2026-06-14 feat(kiroku-store): pipeline multi-stream append
5857eda 2026-06-14 feat(kiroku-store)!: reject oversized stream names
644a7c2 2026-06-14 fix(kiroku-store)!: make backward reads paginate correctly
```

Use `rg` to locate current symbols before editing prose:

```bash
rg "appendMultiStream|eventExistsInStream|streamNameInCategory|AppendConflict|Reject oversized|StreamName" /Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store/src /Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store/test
```

After edits, validate the docs site:

```bash
pnpm run typecheck
pnpm run format:check
pnpm build
```


## Validation and Acceptance

Acceptance is source agreement plus site validation. Every Kiroku write/read/schema claim in the edited pages must be backed by one of the source files or tests named in this plan. The updated docs must mention all breaking or behavior-changing commits in the write/read/schema slice: oversized stream-name rejection, empty append batch rejection, typed append/link failures, correct backward pagination, duplicate event surfacing from transactions, `eventExistsInStream`, pipelined multi-stream append, and June 11 schema hygiene.

Run:

```bash
pnpm run typecheck
pnpm run format:check
pnpm build
```

The commands should exit with status 0. If formatting changes are needed, run `pnpm run format`, inspect the diff, then rerun `pnpm run format:check`.


## Idempotence and Recovery

All edits are documentation-only and can be repeated safely. If a validation command fails, fix the reported MDX, TypeScript, or formatting issue and rerun the same command. Do not modify source under `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku` from this plan. If a page starts to grow too broad, keep the existing page and add a small focused subsection rather than reorganizing navigation unless the new behavior has no existing home.


## Interfaces and Dependencies

Use `mori` to resolve `shinzui/kiroku`; do not hard-code the source path without first confirming it. The docs site depends on Fumadocs MDX and is validated with `pnpm`.

The interfaces to document are the current Kiroku store public modules: `Kiroku.Store`, `Kiroku.Store.Types`, `Kiroku.Store.Append`, `Kiroku.Store.Read`, `Kiroku.Store.Error`, `Kiroku.Store.Transaction`, and `Kiroku.Store.Effect`. The concrete functions and types that must be represented are `appendToStream`, `appendMultiStream`, `readStreamForward`, `readStreamBackward`, `readAllForward`, `readAllBackward`, `readCategory`, `eventExistsInStream`, `StreamName`, `CategoryName`, `categoryName`, `streamNameInCategory`, `ExpectedVersion`, `AppendResult`, `StoreError`, `AppendConflict`, `runTransactionAppending`, and `runTransactionAppendingNoRetry`.

The schema dependency is `kiroku-store-migrations`, especially `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store-migrations/README.md` and the SQL files under `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku/kiroku-store-migrations/sql-migrations/`.
