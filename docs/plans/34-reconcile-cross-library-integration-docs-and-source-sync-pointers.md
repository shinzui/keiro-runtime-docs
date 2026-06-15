---
id: 34
slug: reconcile-cross-library-integration-docs-and-source-sync-pointers
title: "Reconcile cross library integration docs and source sync pointers"
kind: exec-plan
created_at: 2026-06-15T19:08:37Z
intention: intention_01kv6bpntyeh98ta4k2famkdm9
master_plan: "docs/masterplans/4-refresh-keiro-and-kiroku-documentation-after-june-hardening.md"
---

# Reconcile cross library integration docs and source sync pointers

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this plan is implemented, the documentation site reads as one current system instead of separate updated islands. The Keiro and Kiroku source-sync pointers will be bumped to the current upstream commits, integration pages will agree with the updated Kiroku and Keiro pages, navigation metadata will include any new pages, and whole-site validation will pass.

The user-visible proof is that a reader can start at the Kiroku, Keiro, or integration landing pages and follow links through write paths, subscriptions, workers, PGMQ, workflows, migrations, and operations without stale terminology or broken links. The maintainers can also inspect `docs/keiro-source-sync.md` and `docs/kiroku-source-sync.md` to see exactly which upstream commits the docs were reviewed against.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [x] Confirm EP-1 through EP-5 are complete or read their Outcomes & Retrospective sections for source-pointer text and deferred integration edits.
- [x] Reconcile integration pages for Keiro with Kiroku, PGMQ, Shibuya, and Keiki cross-links.
- [x] Reconcile Kiroku and Keiro landing/index/FAQ pages and section `meta.json` files.
- [x] Update `docs/kiroku-source-sync.md` to the current Kiroku `HEAD` with previous pointer history.
- [x] Update `docs/keiro-source-sync.md` to the current Keiro `HEAD` with previous pointer history.
- [x] Run whole-site validation, including link validation, and record results.


## Surprises & Discoveries

- EP-1 through EP-5 had already validated their domain-specific page sets and recorded source-pin
  summaries, so EP-6 could focus on bridge pages and final pointers.
- `content/docs/integrations/keiro-with-kiroku.mdx` was still a placeholder, so the final pass needed
  to add the actual Keiro/Kiroku persistence and subscription boundary rather than only adjust links.
- The Kiroku landing page still implied publisher fan-out for all subscriptions and consumer groups;
  current Kiroku behavior only fan-outs plain `$all` subscribers and uses `NOTIFY` as a wake/catch-up
  boundary for category subscriptions and consumer groups.
- The PGMQ integration page lagged behind the expanded `keiro-pgmq` API surface: `RetryDefault`,
  classified decode errors, tuning, headers, batch sends, traced sends, FIFO groups, provisioning,
  DLQ helpers, metrics, and retention.


## Decision Log

Record every decision made while working on the plan.

- Decision: Make source-sync pointer updates part of the final reconciliation plan.
  Rationale: The pointer notes must summarize all documentation updates, so applying them before EP-1 through EP-5 would risk an incomplete or misleading range summary.
  Date: 2026-06-15


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

(To be filled during and after implementation.)

EP-6 reconciled the integration story after EP-1 through EP-5. The integrations landing page no
longer calls current pages outlines, `keiro-with-kiroku` now explains the persistence,
transaction/source-consistency, stream/category, subscription, and worker boundary, and
`keiro-with-pgmq` now matches the current job/tuning/producer/DLQ surface. The Kiroku landing page
now distinguishes live `$all` fan-out from category/group catch-up behavior.

Source-sync pointers were bumped to the final upstream commits:

- Kiroku: `4312aa8cc3e4f6ab0d19fc8bb12d0dd9f8cc164a` (`2026-06-14T19:50:51-07:00`,
  `feat(kiroku-store): add eventExistsInStream point lookup`)
- Keiro: `f1d67a01b7457387a4861e7268d1c521ef82287d` (`2026-06-15T11:27:19-07:00`,
  `docs(master-plan): close production readiness hardening`)

Final validation passed with `pnpm run check` on 2026-06-15. That command ran typecheck, lint,
format check, production build, internal doc-link checks, and linkinator; `oxlint` reported only
pre-existing warnings in `src/routes/docs/{$}[.]md.ts`, `src/routes/docs/$.tsx`, and
`src/lib/rehype-mermaid.ts`.


## Context and Orientation

This plan is the final child of `docs/masterplans/4-refresh-keiro-and-kiroku-documentation-after-june-hardening.md`. It has hard dependencies on:

- `docs/plans/29-refresh-kiroku-write-path-schema-and-store-api-documentation.md`
- `docs/plans/30-refresh-kiroku-subscriptions-adapter-observability-and-metrics-documentation.md`
- `docs/plans/31-refresh-keiro-command-core-read-side-and-schema-documentation.md`
- `docs/plans/32-refresh-keiro-messaging-workers-and-pgmq-documentation.md`
- `docs/plans/33-refresh-keiro-durable-workflow-resume-and-lifecycle-documentation.md`

The final reconciliation touches docs that bridge subsystems: `content/docs/index.mdx`, `content/docs/kiroku/index.mdx`, `content/docs/keiro/index.mdx`, `content/docs/kiroku/faq.mdx`, `content/docs/keiro/faq.mdx`, and pages under `content/docs/integrations/`. It may also touch section metadata files such as `content/docs/keiro/meta.json`, `content/docs/keiro/reference/meta.json`, `content/docs/keiro/how-to/meta.json`, `content/docs/kiroku/meta.json`, `content/docs/kiroku/reference/meta.json`, and `content/docs/integrations/meta.json` if earlier plans added or renamed pages.

A source-sync pointer is a checked-in Markdown file that records the upstream commit last reviewed by this docs repo. The two pointers for this initiative are `docs/keiro-source-sync.md` and `docs/kiroku-source-sync.md`. They must be updated only after the docs reflect the source range.

The current upstream source paths must still be resolved with `mori`:

- `shinzui/keiro`, currently `/Users/shinzui/Keikaku/bokuno/keiro`
- `shinzui/kiroku`, currently `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku`

Do not search `/` or `/nix/store`. Scope all repository searches to `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` or the two source paths resolved by `mori`.


## Plan of Work

Milestone 1 confirms upstream plans are complete. Read the Progress and Outcomes & Retrospective sections of EP-1 through EP-5. If any plan is incomplete, stop and report which hard dependency is missing. If a plan deferred source-pointer text or integration edits, copy those notes into this plan's working checklist. Acceptance is that every domain-specific page has already been updated or a precise remaining edit is known.

Milestone 2 reconciles integration prose. Update `content/docs/integrations/keiro-with-kiroku.mdx`, `content/docs/integrations/shibuya-kiroku-adapter.mdx`, `content/docs/integrations/keiro-with-pgmq.mdx`, `content/docs/integrations/shibuya-pgmq-adapter.mdx`, and `content/docs/integrations/index.mdx` so they use the final terminology from EP-1 through EP-5. Acceptance is that integration pages do not contradict the canonical pages for Kiroku store, Kiroku subscriptions, Keiro messaging, PGMQ, or durable workflows.

Milestone 3 reconciles landing, FAQ, and navigation. Update the Kiroku and Keiro index/FAQ pages for the current hardening status. Check every `meta.json` touched by earlier plans and ensure new pages are listed once in the correct order. Acceptance is that the docs navigation includes all pages and has no stale titles.

Milestone 4 updates source-sync pointers. Use `git -C <source> rev-parse HEAD`, `git -C <source> show -s --format='%H%n%ad%n%s' --date=iso-strict HEAD`, and the summaries from EP-1 through EP-5. In `docs/kiroku-source-sync.md`, replace the Last reviewed commit block with the final Kiroku `HEAD`, move `0a39598` to Previous pointers, and summarize the whole range. In `docs/keiro-source-sync.md`, replace the Last reviewed commit block with final Keiro `HEAD`, move `9fa283b` to Previous pointers, and summarize the whole range. Acceptance is that both pointers name `mori` qualified names, final commits, dates, source paths, affected packages, and doc areas updated.

Milestone 5 runs whole-site validation. Run the commands in Concrete Steps. Acceptance is that `pnpm run check` passes, including typecheck, lint, format check, build, and link validation. If link validation requires a built site, `pnpm run check` already builds before linkinator through the package script.


## Concrete Steps

Work from this repository:

```bash
cd /Users/shinzui/Keikaku/bokuno/keiro-runtime-docs
mori registry show shinzui/keiro --full
mori registry show shinzui/kiroku --full
git -C /Users/shinzui/Keikaku/bokuno/keiro show -s --format='%H%n%ad%n%s' --date=iso-strict HEAD
git -C /Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku show -s --format='%H%n%ad%n%s' --date=iso-strict HEAD
```

Use these commands to inspect changed docs after earlier plans:

```bash
git diff -- content/docs docs/keiro-source-sync.md docs/kiroku-source-sync.md
rg "9fa283b|0a39598|f8950f4|98f46b3|TODO|stale|old" content/docs docs/keiro-source-sync.md docs/kiroku-source-sync.md
```

Run final validation:

```bash
pnpm run check
```

Expected final result is a zero exit code. If the command is too broad during implementation, use this narrower progression before the final check:

```bash
pnpm run typecheck
pnpm lint
pnpm run format:check
pnpm build
pnpm run lint:links
```


## Validation and Acceptance

Acceptance requires all hard dependencies complete, integration prose reconciled, navigation metadata correct, both source-sync pointers bumped to current upstream `HEAD`, and whole-site validation passing.

Run:

```bash
pnpm run check
```

The command should complete successfully. Then inspect:

```bash
git diff --stat
git diff -- docs/keiro-source-sync.md docs/kiroku-source-sync.md
```

The pointer diff should show old reviewed commits moved into Previous pointers and new `HEAD` commits in Last reviewed commit blocks. The docs diff should show only documentation and metadata changes in this repository.


## Idempotence and Recovery

All edits are documentation-only. Re-running `mori`, `git show`, `rg`, and validation commands is safe. If `pnpm run check` fails on links, fix links in docs rather than disabling link validation. If a final pointer summary is missing facts, go back to the relevant child plan and source modules; do not invent a summary from memory.


## Interfaces and Dependencies

This plan depends hard on EP-1 through EP-5 because it integrates their outputs. It uses `mori` to resolve source locations for `shinzui/keiro` and `shinzui/kiroku`. It uses the docs repository package scripts in `package.json`: `pnpm run typecheck`, `pnpm lint`, `pnpm run format:check`, `pnpm build`, `pnpm run lint:links`, and `pnpm run check`.

The files owned by this plan are `docs/keiro-source-sync.md`, `docs/kiroku-source-sync.md`, `content/docs/integrations/*.mdx`, top-level Keiro and Kiroku index/FAQ pages as needed, and `meta.json` navigation files required by pages added in EP-1 through EP-5.
