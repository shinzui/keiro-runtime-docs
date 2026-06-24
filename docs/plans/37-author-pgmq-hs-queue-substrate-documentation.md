---
id: 37
slug: author-pgmq-hs-queue-substrate-documentation
title: "Author pgmq hs queue substrate documentation"
kind: exec-plan
created_at: 2026-06-24T18:04:10Z
master_plan: "docs/masterplans/5-complete-shibuya-pgmq-and-adapter-documentation.md"
---

# Author pgmq hs queue substrate documentation

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, `/docs/pgmq` is a complete documentation section for pgmq-hs instead of a
navigation skeleton. A reader can understand pgmq as a PostgreSQL-native queue substrate, choose
the right pgmq-hs package, create and configure queues, send and read messages with visibility
timeouts, use archive/delete semantics, use FIFO and topics when appropriate, install or upgrade
the pgmq schema without the extension, and observe queue operations through Effectful and
OpenTelemetry.

The visible result is a populated `content/docs/pgmq/` tree with reference, how-to, explanation,
and cookbook pages, plus an updated `docs/pgmq-hs-source-sync.md` pointer.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [ ] Resolve and audit current pgmq-hs source and upstream docs with mori.
- [ ] Replace pgmq section stubs with a real overview and section indexes.
- [ ] Author pgmq-hs reference pages for core types, hasql operations, Effectful, config, and
  migration.
- [ ] Author how-to, explanation, and cookbook pages for common queue substrate workflows.
- [ ] Update pgmq `meta.json` files and `docs/pgmq-hs-source-sync.md`.
- [ ] Validate typecheck, build, link check, and stale-stub scan.


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

(None yet.)


## Decision Log

Record every decision made while working on the plan.

- Decision: Treat pgmq-hs as a top-level queue substrate, not merely an adapter detail.
  Rationale: `docs/plans/27-bootstrap-pgmq-hs-queue-substrate-and-shibuya-pgmq-adapter-docs.md`
  already established a top-level `content/docs/pgmq/` section, and mori shows pgmq-hs has its own
  package bundle and source-sync pointer.
  Date: 2026-06-24
- Decision: Keep adapter-specific shibuya-pgmq delivery guarantees out of this plan.
  Rationale: pgmq-hs documents queue operations and schema behavior; shibuya-pgmq maps those
  operations into shibuya envelopes and ack decisions and is owned by
  `docs/plans/38-document-shibuya-adapters-across-pgmq-kiroku-kafka-and-message-db.md`.
  Date: 2026-06-24


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

(To be filled during and after implementation.)


## Context and Orientation

This repository is the documentation site. Work from
`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`. Resolve source with mori before editing:

```bash
mori registry show shinzui/pgmq-hs --full
mori registry docs shinzui/pgmq-hs
```

At plan creation, mori resolved `shinzui/pgmq-hs` to
`/Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs`. Current HEAD was
`973c1076f469448818de5d2044a483296be2c02e` (`973c107`, 2026-06-03,
`build(nix): migrate flake to flake-parts on the haskell-nix-dev base flake`). Recheck before
implementation.

`docs/pgmq-hs-source-sync.md` says the current `content/docs/pgmq/` section is a bootstrap
skeleton produced by `docs/plans/27-bootstrap-pgmq-hs-queue-substrate-and-shibuya-pgmq-adapter-docs.md`.
This plan is the first full content-authoring pass.

pgmq-hs is split into five documented packages plus a benchmark tool:

- `pgmq-core` exposes `Pgmq.Types`, including core queue and message types.
- `pgmq-hasql` exposes `Pgmq` and lower-level `Pgmq.Hasql.*` modules. It is the primary hasql
  client for queue management, send/read, visibility timeout, archive/delete, FIFO, topics,
  notifications, and observability.
- `pgmq-effectful` exposes `Pgmq.Effectful`, `Pgmq.Effectful.Effect`,
  `Pgmq.Effectful.Interpreter`, `Pgmq.Effectful.Interpreter.Traced`,
  `Pgmq.Effectful.Telemetry`, and `Pgmq.Effectful.Traced`.
- `pgmq-config` exposes `Pgmq.Config`, `Pgmq.Config.Types`, and, with its default cabal flag,
  `Pgmq.Config.Effectful`.
- `pgmq-migration` exposes `Pgmq.Migration`, migration definitions, sessions, statements, and
  transactions for installing or upgrading the schema without the pgmq extension.

Relevant source and upstream docs:

- `/Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs/README.md`
- `/Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs/docs/user/queue-configuration.md`
- `/Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs/docs/OPENTELEMETRY_INSTRUMENTATION.md`
- `/Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs/docs/design/*.md`
- `/Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs/vendor/pgmq/docs/index.md`
- `/Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs/vendor/pgmq/docs/api/sql/functions.md`
- `/Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs/vendor/pgmq/docs/fifo-queues.md`
- `/Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs/vendor/pgmq/docs/topics.md`
- `/Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs/pgmq-core/src/Pgmq/Types.hs`
- `/Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs/pgmq-hasql/src/Pgmq.hs`
- `/Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs/pgmq-hasql/src/Pgmq/Hasql/Statements/*.hs`
- `/Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs/pgmq-effectful/src/Pgmq/Effectful*.hs`
- `/Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs/pgmq-config/src/Pgmq/Config*.hs`
- `/Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs/pgmq-migration/src/Pgmq/Migration*.hs`

Definitions for this plan:

Visibility timeout is the interval after a worker reads a message during which the message is
hidden from other readers. If the worker does not archive or delete it before the timeout expires,
it becomes visible again. Verify exact fields and functions from `Pgmq` and `Pgmq.Types`.

Archive means moving a processed message into pgmq's archive table, preserving it for inspection.
Delete means removing the message. Verify whether the Haskell API exposes both and how it names
them before writing.

Topic routing means sending messages to a topic and routing them to bound queues. Verify topic
pattern types and functions from `Pgmq.Types`, `Pgmq.Hasql.Statements.TopicManagement`, and the
vendored pgmq docs.

Queue configuration reconciliation means declaring desired queue topology as Haskell values and
running an idempotent function at startup to create or update queues and related objects.


## Plan of Work

Milestone 1 audits source and replaces the top-level stubs. Re-run mori, inspect current source,
and update `content/docs/pgmq/index.mdx` plus each subsection `index.mdx` to describe the real
learning path. Remove the "Documentation in progress" callouts once the target pages exist.

Milestone 2 authors reference pages. Add pages under `content/docs/pgmq/reference/` for core
types, hasql operations, queue management, message operations, observability, topics/FIFO, Effectful
interpreters, queue configuration, and migrations. Use signatures and record fields verified from
source. Do not document a lower-level internal module unless it is exposed or needed to explain a
public API.

Milestone 3 authors task and concept pages. Add how-to guides for installing or migrating schema,
creating a queue, sending and reading messages, archiving/deleting, configuring queues at startup,
using Effectful, enabling OpenTelemetry, using notifications, and choosing FIFO or topics. Add
explanation pages for pgmq as a PostgreSQL queue, visibility timeout semantics, delivery guarantees,
schema choices, and the relationship between pgmq-hs and shibuya.

Milestone 4 authors recipes. Add cookbook pages for common snippets: enqueue a JSON job, build a
worker read loop, reconcile queues on boot, route topics, use FIFO groups, inspect queue depth,
handle transient pgmq errors, and migrate without the extension.

Milestone 5 updates sync and validates. Update `docs/pgmq-hs-source-sync.md` from bootstrap status
to full content status, recording the reviewed commit and any previous pointer. Validate the site
and link graph.


## Concrete Steps

Run all commands from `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`.

```bash
mori registry show shinzui/pgmq-hs --full
mori registry docs shinzui/pgmq-hs
git -C /Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs log -1 --date=short --pretty=format:%H%n%h%n%ad%n%s
```

Expected shape at plan creation:

```text
973c1076f469448818de5d2044a483296be2c02e
973c107
2026-06-03
build(nix): migrate flake to flake-parts on the haskell-nix-dev base flake
```

Inspect the package and docs surface:

```bash
rg --files /Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs/pgmq-core
rg --files /Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs/pgmq-hasql
rg --files /Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs/pgmq-effectful
rg --files /Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs/pgmq-config
rg --files /Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs/pgmq-migration
sed -n '1,260p' /Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs/README.md
```

Use existing docs style anchors:

```bash
sed -n '1,220p' content/docs/kiroku/reference/store-effect.mdx
sed -n '1,220p' content/docs/kiroku/how-to/run-against-postgres.mdx
sed -n '1,220p' content/docs/keiro/reference/pgmq-jobs.mdx
```

Validate:

```bash
pnpm run typecheck
pnpm build
node scripts/check-doc-links.mjs
rg -n "Documentation for pgmq is in progress|Documentation in progress|TODO|coming soon" content/docs/pgmq
```


## Validation and Acceptance

Acceptance:

- `/docs/pgmq` explains pgmq-hs as the queue substrate and links to real reference, how-to,
  explanation, and cookbook pages.
- `/docs/pgmq/reference` covers `Pgmq.Types`, `Pgmq`, `Pgmq.Effectful`, `Pgmq.Config`, and
  `Pgmq.Migration` public surfaces.
- `/docs/pgmq/how-to` includes concrete tasks for queue creation, send/read, archive/delete,
  schema migration, queue configuration, OpenTelemetry, FIFO, topics, and queue inspection.
- `/docs/pgmq/explanation` explains visibility timeout, delivery guarantees, queue topology,
  schema installation, and how pgmq relates to shibuya.
- `/docs/pgmq/cookbook` contains reusable source-checked snippets.
- `docs/pgmq-hs-source-sync.md` records the final reviewed commit and no longer describes the
  section as skeleton-only.
- `pnpm run typecheck`, `pnpm build`, and `node scripts/check-doc-links.mjs` pass.


## Idempotence and Recovery

This work is additive and safe to repeat. Re-run mori and source inspection before each session.
When adding pages, add each slug once to the relevant `meta.json`. If pgmq-hs has moved since the
plan was written, diff from the old pointer and record the range in Surprises & Discoveries before
updating content.

Do not alter pgmq-hs source code from this docs repository. If a function is unclear or
undocumented, prefer a narrow docs statement that can be proven from tests over a broad claim.


## Interfaces and Dependencies

This plan depends on the registered `shinzui/pgmq-hs` source tree and the vendored `pgmq` docs
inside that repository. It has a soft dependency on
`docs/plans/35-author-shibuya-foundation-core-and-walkthrough-docs.md` for cross-links explaining
how shibuya consumes pgmq through an adapter.

Primary public modules:

- `Pgmq.Types`
- `Pgmq`
- `Pgmq.Hasql.Sessions`
- `Pgmq.Hasql.Statements`
- `Pgmq.Hasql.Statements.Message`
- `Pgmq.Hasql.Statements.QueueManagement`
- `Pgmq.Hasql.Statements.QueueObservability`
- `Pgmq.Hasql.Statements.TopicManagement`
- `Pgmq.Effectful`
- `Pgmq.Effectful.Effect`
- `Pgmq.Effectful.Interpreter`
- `Pgmq.Effectful.Interpreter.Traced`
- `Pgmq.Effectful.Telemetry`
- `Pgmq.Config`
- `Pgmq.Config.Types`
- `Pgmq.Config.Effectful`
- `Pgmq.Migration`

Final reconciliation of integration cards and whole-site source-sync language is owned by
`docs/plans/39-reconcile-shibuya-pgmq-integrations-navigation-and-source-sync.md`.
