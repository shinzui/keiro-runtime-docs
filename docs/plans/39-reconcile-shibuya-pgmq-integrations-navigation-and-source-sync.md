---
id: 39
slug: reconcile-shibuya-pgmq-integrations-navigation-and-source-sync
title: "Reconcile shibuya pgmq integrations navigation and source sync"
kind: exec-plan
created_at: 2026-06-24T18:04:18Z
master_plan: "docs/masterplans/5-complete-shibuya-pgmq-and-adapter-documentation.md"
---

# Reconcile shibuya pgmq integrations navigation and source sync

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, the shibuya, pgmq, and adapter documentation reads as one finished docs set.
Navigation is ordered, landing pages point to the right content, integration cards are accurate,
source-sync pointers record the final reviewed commits, and whole-site validation passes.

This plan is the final integration pass for
`docs/masterplans/5-complete-shibuya-pgmq-and-adapter-documentation.md`. It should run only after
EP-1 through EP-4 have completed their content pages.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [ ] Read the completed EP-1 through EP-4 plans and their Outcomes & Retrospective sections.
- [ ] Reconcile `content/docs/shibuya/`, `content/docs/pgmq/`, and `content/docs/integrations/`
  navigation and landing pages.
- [ ] Update source-sync pointers for shibuya, pgmq-hs, shibuya-pgmq-adapter, and any newly
  documented adapter repos.
- [ ] Update top-level and getting-started cross-links if new shibuya/pgmq/adapter pages need to be
  discoverable from the runtime family pages.
- [ ] Run whole-site validation and stale-claim scans.
- [ ] Update the MasterPlan Progress, Surprises & Discoveries, and Outcomes & Retrospective.


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

(None yet.)


## Decision Log

Record every decision made while working on the plan.

- Decision: Make final source-sync and navigation reconciliation a separate hard-dependent plan.
  Rationale: Final pointers and landing pages are only correct after the content-authoring plans
  know exactly which source commits and pages they used.
  Date: 2026-06-24
- Decision: Let EP-5 decide whether Kafka and Message DB need dedicated source-sync pointer files.
  Rationale: EP-4 may add those pages; EP-5 has the whole-site view needed to keep pointer
  conventions consistent with existing docs.
  Date: 2026-06-24


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

(To be filled during and after implementation.)


## Context and Orientation

This repository is the documentation site. Work from
`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`. This plan should not begin until these child
plans are complete:

- `docs/plans/35-author-shibuya-foundation-core-and-walkthrough-docs.md`
- `docs/plans/36-document-shibuya-metrics-operations-and-recipes.md`
- `docs/plans/37-author-pgmq-hs-queue-substrate-documentation.md`
- `docs/plans/38-document-shibuya-adapters-across-pgmq-kiroku-kafka-and-message-db.md`

The final pass must read each child plan's Progress, Surprises & Discoveries, Decision Log, and
Outcomes & Retrospective before editing. Those sections should name final upstream commits,
validation results, and any source facts that need top-level treatment.

Current source-sync pointers at plan creation:

- `docs/pgmq-hs-source-sync.md` exists and says the pgmq section is a bootstrap skeleton.
- `docs/shibuya-pgmq-adapter-source-sync.md` exists and says the shibuya-pgmq page is a bootstrap
  skeleton.
- `docs/kiroku-source-sync.md`, `docs/keiro-source-sync.md`, `docs/keiki-source-sync.md`, and
  `docs/keiro-runtime-jitsurei-source-sync.md` exist.
- No `docs/shibuya-source-sync.md`, `docs/shibuya-kafka-adapter-source-sync.md`, or
  `docs/shibuya-message-db-adapter-source-sync.md` existed at plan creation.

Navigation files likely touched by this plan:

- `content/docs/meta.json`
- `content/docs/index.mdx`
- `content/docs/getting-started/index.mdx`
- `content/docs/getting-started/the-keiro-family.mdx`
- `content/docs/getting-started/choosing-a-library.mdx`
- `content/docs/shibuya/meta.json`
- `content/docs/shibuya/*/meta.json`
- `content/docs/pgmq/meta.json`
- `content/docs/pgmq/*/meta.json`
- `content/docs/integrations/meta.json`
- `content/docs/integrations/index.mdx`

A source-sync pointer is a Markdown file under `docs/` that pins the exact upstream commit used
when authoring docs and gives a repeatable diff procedure for future updates. Follow the style of
`docs/keiro-source-sync.md`, `docs/kiroku-source-sync.md`, and the existing pgmq pointers.


## Plan of Work

Milestone 1 reads completed child plans and collects final facts. For each EP-1 through EP-4, note
final upstream commits, new pages, validation commands, remaining gaps, and any cross-plan
discoveries. Update this plan's Surprises & Discoveries if earlier assumptions changed.

Milestone 2 reconciles navigation and landing pages. Confirm every new MDX page appears exactly
once in its nearest `meta.json`, in a useful reading order. Update `content/docs/shibuya/index.mdx`,
`content/docs/pgmq/index.mdx`, and `content/docs/integrations/index.mdx` so cards and descriptions
match the final pages. Update top-level runtime family pages only when needed to expose new
first-class content; avoid unrelated copy churn.

Milestone 3 updates source-sync pointers. Update `docs/pgmq-hs-source-sync.md` and
`docs/shibuya-pgmq-adapter-source-sync.md` from skeleton status to authored status. Add
`docs/shibuya-source-sync.md` if EP-1 or EP-2 authored source-checked shibuya pages without an
existing pointer. If EP-4 added Kafka or Message DB integration pages, decide whether to create
`docs/shibuya-kafka-adapter-source-sync.md` and
`docs/shibuya-message-db-adapter-source-sync.md`; if not, record the reason and where their source
pin is tracked.

Milestone 4 performs stale-stub and stale-claim cleanup. Scan shibuya, pgmq, and integrations for
"Documentation in progress", TODOs, obsolete bootstrap wording, broken card links, and old source
pin claims. Check the source-sync pointers and page frontmatter for consistency.

Milestone 5 runs whole-site validation and closes the MasterPlan. Run the project's validation
commands, update `docs/masterplans/5-complete-shibuya-pgmq-and-adapter-documentation.md` Progress
checkboxes, record any cross-plan surprises, and write Outcomes & Retrospective.


## Concrete Steps

Run all commands from `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`.

Read child plan outcomes:

```bash
sed -n '1,260p' docs/plans/35-author-shibuya-foundation-core-and-walkthrough-docs.md
sed -n '1,260p' docs/plans/36-document-shibuya-metrics-operations-and-recipes.md
sed -n '1,260p' docs/plans/37-author-pgmq-hs-queue-substrate-documentation.md
sed -n '1,260p' docs/plans/38-document-shibuya-adapters-across-pgmq-kiroku-kafka-and-message-db.md
```

Check page and navigation coverage:

```bash
find content/docs/shibuya content/docs/pgmq content/docs/integrations -maxdepth 3 -type f | sort
rg -n "Documentation in progress|bootstrap skeleton|TODO|coming soon" content/docs/shibuya content/docs/pgmq content/docs/integrations docs/*source-sync.md
```

Resolve final upstream commits before pointer edits:

```bash
mori registry show shinzui/shibuya --full
mori registry show shinzui/pgmq-hs --full
mori registry show shinzui/shibuya-pgmq-adapter --full
mori registry show shinzui/shibuya-kafka-adapter --full
mori registry show shinzui/shibuya-message-db-adapter --full
```

Validation:

```bash
pnpm run typecheck
pnpm run lint
pnpm build
node scripts/check-doc-links.mjs
```

If the repository's known formatting baseline is clean at implementation time, also run:

```bash
pnpm run format:check
```

If `format:check` fails only on pre-existing unrelated MDX formatting, record that in Outcomes &
Retrospective and rely on typecheck, lint, build, and link check as the docs gates, following the
precedent in `docs/plans/27-bootstrap-pgmq-hs-queue-substrate-and-shibuya-pgmq-adapter-docs.md`.


## Validation and Acceptance

Acceptance:

- `/docs/shibuya`, `/docs/pgmq`, and `/docs/integrations` have no bootstrap-only language in pages
  owned by this MasterPlan.
- Every new page from EP-1 through EP-4 appears in a `meta.json` sidebar and has a useful card or
  index path where appropriate.
- Source-sync pointers identify the final reviewed upstream commits for shibuya, pgmq-hs,
  shibuya-pgmq-adapter, and any additional adapter repos documented by EP-4.
- Top-level runtime family pages no longer contradict the completed shibuya/pgmq/adapter docs.
- `pnpm run typecheck`, `pnpm run lint`, `pnpm build`, and `node scripts/check-doc-links.mjs`
  pass.
- The MasterPlan registry marks EP-1 through EP-5 complete and records final outcomes.


## Idempotence and Recovery

This plan is mostly reconciliation and can be repeated. Re-run the scans after every edit. When
editing `meta.json`, preserve valid JSON and add each slug once. When updating source-sync
pointers, move prior pins into a previous-pointers section rather than deleting history.

If validation exposes a content issue owned by an earlier child plan, fix it in place and record
the cross-plan discovery in this plan and the MasterPlan. Do not change upstream library source
code from this docs repo.


## Interfaces and Dependencies

This plan depends on completed EP-1 through EP-4 docs and on mori-resolved source trees:

- `shinzui/shibuya`
- `shinzui/pgmq-hs`
- `shinzui/shibuya-pgmq-adapter`
- `shinzui/kiroku`
- `shinzui/shibuya-kafka-adapter`
- `shinzui/shibuya-message-db-adapter`

It touches documentation-site interfaces: MDX pages under `content/docs/`, ordered `meta.json`
navigation files, source-sync pointer Markdown files under `docs/`, and the MasterPlan file
`docs/masterplans/5-complete-shibuya-pgmq-and-adapter-documentation.md`.

Commits made while implementing this plan must include both trailers:

```text
MasterPlan: docs/masterplans/5-complete-shibuya-pgmq-and-adapter-documentation.md
ExecPlan: docs/plans/39-reconcile-shibuya-pgmq-integrations-navigation-and-source-sync.md
```
