---
id: 27
slug: bootstrap-pgmq-hs-queue-substrate-and-shibuya-pgmq-adapter-docs
title: "Bootstrap pgmq-hs queue substrate and shibuya-pgmq adapter docs"
kind: exec-plan
created_at: 2026-06-07T15:37:55Z
intention: "intention_01ksx5mf7qe2ht659e4kr9w2t0"
---

# Bootstrap pgmq-hs queue substrate and shibuya-pgmq adapter docs

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

Most event-sourced systems built on the keiro runtime eventually need a plain **work
queue** — a place to enqueue jobs and have workers lease, process, retry, and dead-letter
them. The runtime already ships **shibuya** (the supervised, Broadway-style queue-processing
framework) but, in these docs, shibuya only has one documented backend adapter: the
`shibuya-kiroku-adapter` that pulls from the kiroku event store. There is no documented way
to put a general-purpose message queue *behind* shibuya.

Two first-party libraries already exist upstream to fill that gap:

- **`pgmq-hs`** (mori qualified name `shinzui/pgmq-hs`) — a Haskell client for **pgmq**, a
  PostgreSQL-native message queue (the `pgmq` Postgres extension). It is a *queue substrate*:
  create queues, send messages, read with a visibility timeout, archive/delete. It is the
  queue equivalent of what kiroku is for event storage.
- **`shibuya-pgmq-adapter`** (mori qualified name `shinzui/shibuya-pgmq-adapter`) — the
  cross-package glue that lets shibuya consume a pgmq queue, exactly parallel to the existing
  `shibuya-kiroku-adapter`. It adds visibility-timeout leasing, retry handling, optional
  dead-letter queue (DLQ) support, and OpenTelemetry tracing.

After this change, a reader browsing the docs site can **see that pgmq exists as a queue
option for the runtime, and that shibuya can consume it**:

- A new top-level **pgmq** section appears in the left navigation (a Diátaxis skeleton:
  Reference / How-To / Explanation / Cookbook), each page an honest "Documentation in
  progress" stub — exactly how **shibuya** itself is currently bootstrapped in this repo.
- A new **shibuya ⇄ pgmq adapter** page appears under **Integrations**, alongside the
  existing **shibuya ⇄ kiroku adapter** page.
- The family-level pages (the root landing page, *The keiro family*, *Choosing a library*,
  *Getting Started*) now **mention pgmq** as the queue substrate, so a newcomer asking "I
  need a work queue" is pointed at it.
- Two **source-sync pointer files** (`docs/pgmq-hs-source-sync.md`,
  `docs/shibuya-pgmq-adapter-source-sync.md`) pin the exact upstream commit the docs were
  bootstrapped against, so the later content-authoring plan knows its baseline — matching the
  established `docs/keiro-source-sync.md` / `docs/kiroku-source-sync.md` workflow.

**Scope is deliberately "mention + bootstrap" only.** This plan writes skeletons, navigation
wiring, cross-links, family-page mentions, and the sync pointers. It does **not** author the
full Reference / How-To / Cookbook prose (verbatim signatures, runnable `jitsurei`, delivery-
guarantee narratives) — that is deferred to a dedicated later ExecPlan, the same way shibuya's
own written content is deferred. The observable outcome is **navigation and discoverability**,
verified by a clean build and link check, not by new authored API content.


## Progress

- [x] **Milestone 1 — pgmq top-level section skeleton.** (2026-06-07) Created `content/docs/pgmq/`
  with `index.mdx` + `meta.json`, and the four Diátaxis subsections (`reference/`, `how-to/`,
  `explanation/`, `cookbook/`) each with a stub `index.mdx` + `meta.json`. Wired `pgmq` into the
  root `content/docs/meta.json`. Commit `ba8cf88`.
- [x] **Milestone 2 — shibuya ⇄ pgmq adapter integration page.** (2026-06-07) Created
  `content/docs/integrations/shibuya-pgmq-adapter.mdx` stub; added it to
  `content/docs/integrations/meta.json` and a `<Card>` in `content/docs/integrations/index.mdx`;
  mentioned both adapters in `content/docs/shibuya/index.mdx`. Commit `52c1ac7`.
- [x] **Milestone 3 — family-level mentions.** (2026-06-07) Updated `content/docs/index.mdx`,
  `content/docs/getting-started/index.mdx`, `content/docs/getting-started/the-keiro-family.mdx`,
  and `content/docs/getting-started/choosing-a-library.mdx`: four→five count, pgmq card, dependency
  diagram node + dotted "via shibuya-pgmq-adapter" edge, family bullet, and a problem→library match
  line. Commit `707238e`.
- [x] **Milestone 4 — source-sync pointers.** (2026-06-07) Created `docs/pgmq-hs-source-sync.md`
  (pinned `973c107`, pgmq-hasql 0.3.0.0) and `docs/shibuya-pgmq-adapter-source-sync.md` (pinned
  `8e6f6e9`, adapter 0.7.0.0). Commit `1f483ab`.
- [x] **Milestone 5 — validate + commit.** (2026-06-07) `pnpm typecheck` ✓, `node
  scripts/check-doc-links.mjs` ✓ (331 files, no broken links), `pnpm build` ✓ — all six new routes
  prerendered (`/docs/pgmq`, its four quadrants, `/docs/integrations/shibuya-pgmq-adapter`). Each
  milestone committed with `ExecPlan:` + `Intention:` trailers.


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

- **Upstream commits, not invented:** at bootstrap time `shinzui/pgmq-hs` HEAD was `973c107`
  (2026-06-03, pgmq-hasql 0.3.0.0) and `shinzui/shibuya-pgmq-adapter` HEAD was `8e6f6e9`
  (2026-06-05, adapter 0.7.0.0, which requires shibuya-core 0.7 Envelope headers). Captured via
  `git -C <path> log -1` and pinned in the two sync files.
- **`mori … --full` path extraction emits ANSI codes.** The plan's
  `sed -n 's/.*[Pp]ath: *//p'` pipeline picked up color escapes and produced an unusable path
  (`git -C` then failed with "No such file or directory"). Worked around by using the known
  absolute paths directly. The sync-file procedures keep the `sed` form (it is the established
  convention in `keiro-source-sync.md`), but a future run may need `mori … --full | sed 's/\x1b\[[0-9;]*m//g'`
  or `--no-color` if mori adds it.
- **`content/docs/integrations/index.mdx` had drifted** from the snapshot taken during planning
  (its callout and the `keiro-with-keiki` card description had been reworded by an earlier round).
  Re-reading before editing surfaced this; the card insertion still applied cleanly.
- **`format:check` correctly left out of the gate.** As recorded in project memory, the oxfmt MDX
  baseline is not clean repo-wide; the new stubs were matched byte-for-byte to the neighboring
  shibuya stubs instead. typecheck + link check + build are the real gates and all passed.


## Decision Log

- Decision: Give pgmq-hs its **own top-level docs section** (`content/docs/pgmq/`) rather than
  documenting it only as an integration page.
  Rationale: pgmq-hs is a standalone queue *substrate* (its own packages, schema, and config
  surface), peer to kiroku/keiki/shibuya — not merely glue. The user chose "Top-level section +
  adapter". The `shibuya-pgmq-adapter` remains an Integrations page because it *is* glue.
  Date: 2026-06-07

- Decision: **Skeleton + mentions only** — no full reference/how-to/cookbook prose in this plan.
  Rationale: User selected "Skeleton + mentions only". Mirrors how shibuya itself is bootstrapped
  in this repo (stub pages with "Documentation in progress" callouts; written content deferred to
  a later plan). Keeps this plan small and low-risk.
  Date: 2026-06-07

- Decision: Bootstrap **four** Diátaxis subsections under `content/docs/pgmq/` — Reference,
  How-To, Explanation, Cookbook — and **not** Tutorials or Walkthrough.
  Rationale: These four are the core Diátaxis quadrants and match the structure previewed to and
  approved by the user. Tutorials/Walkthrough can be added by the later content plan if warranted;
  empty quadrants add nav noise now.
  Date: 2026-06-07

- Decision: Create **two** separate source-sync pointer files (one per upstream repo) rather than
  one combined file.
  Rationale: `pgmq-hs` and `shibuya-pgmq-adapter` are distinct repos with independent commit
  histories; the existing convention (`keiro-source-sync.md`, `kiroku-source-sync.md`,
  `keiki-source-sync.md`) is one pointer file per source repo.
  Date: 2026-06-07

- Decision: Update the "four libraries" framing to **five** across the family pages, positioning
  pgmq as the **queue substrate** (distinct from the keiro core stack), and add a queue edge to
  the dependency mermaid (shibuya consumes pgmq via the adapter).
  Rationale: "Include the mention" requires the headline counts and diagrams to acknowledge pgmq;
  leaving "four" stale would contradict the new nav entry. pgmq is framed as a substrate consumed
  *through* shibuya, not a direct keiro dependency, to stay accurate.
  Date: 2026-06-07


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

**Completed 2026-06-07.** All five milestones landed in four content commits + one plan-tracking
commit, each carrying the `ExecPlan:` and `Intention:` trailers:

- `ba8cf88` — pgmq top-level section skeleton + root nav.
- `52c1ac7` — shibuya ⇄ pgmq adapter integration page + wiring.
- `707238e` — family-page pgmq mentions.
- `1f483ab` — two source-sync pointer files.

**Against the purpose:** the goal was discoverability — "make pgmq visible as the runtime's queue
option, with shibuya consuming it" — explicitly *not* full API content. Delivered exactly that: a
new top-level **pgmq** section (Reference/How-To/Explanation/Cookbook stubs), a **shibuya ⇄ pgmq
adapter** integration page, pgmq woven into all four family entry pages (count, cards, dependency
diagram, problem→library match line), and pinned source-sync baselines. Verified by `pnpm
typecheck`, `node scripts/check-doc-links.mjs` (331 files, zero broken links), and `pnpm build`
(all six new routes prerendered).

**Gaps / deferred (as designed):** no verbatim signatures, `<TypeTable>`s, delivery-guarantee
narrative, runnable jitsurei, "wire a pgmq queue to shibuya" how-to, or pgmq Tutorials/Walkthrough
quadrants. These are the remit of a follow-up content-authoring ExecPlan, which should diff forward
from the two pinned commits (`973c107` for pgmq-hs, `8e6f6e9` for the adapter). Upstream user docs
already exist to draw from: pgmq-hs `docs/user/queue-configuration.md` and the adapter's
`docs/user/{pgmq-getting-started,pgmq-advanced,pgmq-dead-letter-queues,pgmq-topic-routing}.md`.

**Lesson:** the shibuya skeleton was an ideal template to clone — mirroring its exact stub wording
kept the new section visually consistent and sidestepped the oxfmt-baseline trap.


## Context and Orientation

This repository, **keiro-runtime-docs**, is a documentation *site* — a fumadocs + TanStack
Start static app — not the source of the libraries it documents. Pages live as MDX files under
`content/docs/`. The working directory for all commands in this plan is the repository root,
`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`.

**Vocabulary.**

- **Diátaxis** — the documentation framework this site follows. Every page serves exactly one
  of: *Tutorials* (learning), *How-To Guides* (tasks), *Reference* (facts), *Explanation*
  (understanding); this repo adds *Cookbook* (short recipes) and *Code Walkthrough* (source
  tours).
- **`meta.json`** — every doc folder has one. Shape: `{ "title": "...", "pages": ["slug", ...] }`.
  The `pages` array is an **ordered list of slugs** (filenames without `.mdx`). A page that is
  *not listed* does not appear in the sidebar even if the `.mdx` file exists. So **every new page
  must be added to its folder's `meta.json`**.
- **MDX frontmatter** — every page begins with a YAML block containing `title` and `description`.
  Pages may use the components `<Callout type="info|warn">`, `<Cards>` / `<Card>`,
  `<TypeTable>`, `<Accordions>` — these are globally available; no import line is needed.
- **stub / skeleton page** — a real `.mdx` page whose body is a one- or two-sentence intro plus a
  `<Callout type="info">…Documentation in progress…</Callout>`. See the existing examples
  `content/docs/shibuya/index.mdx` and `content/docs/integrations/shibuya-kiroku-adapter.mdx`.
- **pgmq** — a PostgreSQL-native message queue (the `pgmq` Postgres extension). **`pgmq-hs`** is
  the first-party Haskell client for it.
- **substrate** — a backing store/transport the runtime sits on. kiroku is the *event-store*
  substrate; pgmq is a *queue* substrate.
- **source-sync pointer** — a Markdown file under `docs/` that pins the exact upstream commit the
  docs were last reviewed against, plus the procedure to diff forward. See
  `docs/keiro-source-sync.md` for the canonical example and
  `/Users/shinzui/.claude/projects/-Users-shinzui-Keikaku-bokuno-keiro-runtime-docs/memory/keiro-docs-source-sync-workflow.md`.

**Upstream facts** (gathered via `mori registry show … --full`; treat as the authoritative
description to transcribe into the stubs and pointer files):

- `shinzui/pgmq-hs` — on-disk path at bootstrap time
  `/Users/shinzui/Keikaku/bokuno/libraries/pgmq-hs-project/pgmq-hs` (resolve at runtime with
  `mori registry show shinzui/pgmq-hs --full`, do **not** hard-code). Domains: *Messaging,
  PostgreSQL*. Packages: `pgmq-core` (core types/classes), `pgmq-hasql` (the primary
  [hasql](https://hackage.haskell.org/package/hasql)-based implementation), `pgmq-effectful`
  (Effectful effect layer with OpenTelemetry-traced interpreters), `pgmq-config` (declarative,
  idempotent queue topology reconciliation at startup), `pgmq-migration` (install the pgmq schema
  without the extension), and a `pgmq-bench` tool. Depends on the third-party `pgmq/pgmq`
  Postgres extension; requires pgmq 1.11.0+ (or `pgmq-migration`).
- `shinzui/shibuya-pgmq-adapter` — on-disk path at bootstrap time
  `/Users/shinzui/Keikaku/bokuno/shibuya-project/shibuya-pgmq-adapter` (resolve with
  `mori registry show shinzui/shibuya-pgmq-adapter --full`). Description: *PGMQ adapter for the
  Shibuya queue-processing framework.* Domains: *concurrency, queue-processing, postgresql*.
  Library modules: `Shibuya.Adapter.Pgmq`, `Shibuya.Adapter.Pgmq.Config`,
  `Shibuya.Adapter.Pgmq.Convert`. Provides visibility-timeout-based leasing, automatic retry
  handling, optional dead-letter-queue support, and `hs-opentelemetry` 1.0 tracing. Depends on
  `shinzui/pgmq-hs`, `shinzui/shibuya`, `composewell/streamly`, `hasql/hasql`,
  `effectful/effectful`, `iand675/hs-opentelemetry`. Ships a `shibuya-pgmq-example` runnable
  demo and a `shibuya-pgmq-adapter-bench`.

**Current state to be changed (exact files).**

- Root nav: `content/docs/meta.json` →
  `{ "pages": ["index", "getting-started", "kiroku", "keiro", "keiki", "shibuya", "integrations"] }`
  (no `pgmq`).
- `content/docs/integrations/meta.json` →
  `{ "title": "Integrations", "pages": ["index", "shibuya-kiroku-adapter", "keiro-with-kiroku", "keiro-with-keiki"] }`
  (no pgmq adapter).
- `content/docs/integrations/index.mdx` — a `<Cards>` block with three cards (no pgmq card).
- `content/docs/shibuya/index.mdx` — describes shibuya; no mention of a pgmq adapter.
- `content/docs/index.mdx`, `content/docs/getting-started/index.mdx`,
  `content/docs/getting-started/the-keiro-family.mdx`,
  `content/docs/getting-started/choosing-a-library.mdx` — all say "**four** libraries" and omit
  pgmq.
- `content/docs/pgmq/` — **does not exist yet.**
- `docs/pgmq-hs-source-sync.md`, `docs/shibuya-pgmq-adapter-source-sync.md` — **do not exist yet.**

A reusable reference skeleton already exists at `content/docs/shibuya/` (top-level `index.mdx`
+ `meta.json` and per-quadrant `index.mdx` + `meta.json` stubs). **Copy that pattern.** Concrete
templates for full pages live under `content/docs/_templates/` (`reference.mdx`, `how-to.mdx`,
`explanation.mdx`, `cookbook-recipe.mdx`) — referenced from the stub callouts but not filled in
by this plan.

**Build/tooling note.** `package.json` scripts: `pnpm typecheck` (`fumadocs-mdx && tsc --noEmit`),
`pnpm build`, `pnpm lint:links` (`node scripts/check-doc-links.mjs` + linkinator over built
output), `pnpm format:check` (`oxfmt --check .`). **Per the project memory
`oxfmt-mdx-baseline-not-clean.md`, hand-authored MDX already fails `oxfmt --check` repo-wide** —
so do **not** run a formatter over the new MDX and do **not** treat `format:check` as a gate for
this plan. Match the byte-for-byte style of the neighboring stub files instead.


## Plan of Work

Five milestones, each independently verifiable and separately committed. All edits are MDX/JSON
content under `content/docs/` plus two Markdown pointer files under `docs/`. No TypeScript, build
config, or source code changes.

### Milestone 1 — pgmq top-level section skeleton

Create the new section by **mirroring `content/docs/shibuya/`** but with only the four Diátaxis
quadrants. New files:

- `content/docs/pgmq/index.mdx` — frontmatter `title: pgmq`, a one-paragraph description (pgmq is
  a PostgreSQL-native message queue; `pgmq-hs` is the Haskell client; it is the queue substrate the
  runtime's workers lease from, with shibuya consuming it via the `shibuya-pgmq-adapter`), an
  in-progress `<Callout type="info">`, and a `<Cards>` block linking to the four quadrants.
- `content/docs/pgmq/meta.json` — `{ "title": "pgmq", "pages": ["index", "reference", "how-to", "explanation", "cookbook"] }`.
- `content/docs/pgmq/reference/index.mdx` + `content/docs/pgmq/reference/meta.json`
  (`{ "title": "Reference", "pages": ["index"] }`).
- `content/docs/pgmq/how-to/index.mdx` + `content/docs/pgmq/how-to/meta.json`
  (`{ "title": "How-To Guides", "pages": ["index"] }`).
- `content/docs/pgmq/explanation/index.mdx` + `content/docs/pgmq/explanation/meta.json`
  (`{ "title": "Explanation", "pages": ["index"] }`).
- `content/docs/pgmq/cookbook/index.mdx` + `content/docs/pgmq/cookbook/meta.json`
  (`{ "title": "Cookbook", "pages": ["index"] }`).

Each quadrant `index.mdx` is a stub: a one-sentence Diátaxis-purpose intro + the same
"Pages in this section are coming soon … copy the matching template from `_templates/`"
`<Callout>` used by `content/docs/shibuya/reference/index.mdx`.

Then wire the section into the root nav: edit `content/docs/meta.json` so `pages` becomes
`["index", "getting-started", "kiroku", "keiro", "keiki", "shibuya", "pgmq", "integrations"]`
(insert `"pgmq"` between `"shibuya"` and `"integrations"`).

**At the end:** the left nav shows a **pgmq** entry with four child sections; every page builds.

### Milestone 2 — shibuya ⇄ pgmq adapter integration page

- Create `content/docs/integrations/shibuya-pgmq-adapter.mdx` — frontmatter
  `title: shibuya ⇄ pgmq adapter`, a short intro (pull pgmq messages through shibuya pipelines —
  visibility-timeout leasing, retries, optional DLQ, OTel tracing; built on `pgmq-hs`), and an
  in-progress `<Callout>`. Model it on `content/docs/integrations/shibuya-kiroku-adapter.mdx`.
- Edit `content/docs/integrations/meta.json` → insert `"shibuya-pgmq-adapter"` after
  `"shibuya-kiroku-adapter"`: `["index", "shibuya-kiroku-adapter", "shibuya-pgmq-adapter", "keiro-with-kiroku", "keiro-with-keiki"]`.
- Edit `content/docs/integrations/index.mdx` → add a `<Card>` (after the shibuya-kiroku card)
  `title="shibuya ⇄ pgmq adapter" href="/docs/integrations/shibuya-pgmq-adapter"
  description="Consume a pgmq message queue through shibuya's pipelines."`.
- Edit `content/docs/shibuya/index.mdx` → add one sentence noting shibuya consumes backends
  through adapters and linking the pgmq adapter (and, in passing, the existing kiroku adapter).

**At the end:** Integrations lists the pgmq adapter; the shibuya landing page points to it.

### Milestone 3 — family-level mentions

Introduce pgmq on the four family pages. Treat pgmq as the **queue substrate** (a fifth library,
but categorized as a substrate, consumed through shibuya — not a direct keiro dependency).

- `content/docs/index.mdx`: change the description and lead paragraph from "four" to "five"
  libraries (or rephrase to avoid a brittle count — e.g. "a family of Haskell libraries");
  add a `<Card title="pgmq" href="/docs/pgmq" description="A PostgreSQL-native message queue —
  the queue substrate, via pgmq-hs.">` to the libraries `<Cards>`; add a `pgmq[(pgmq — queue
  substrate)]` node to the "How they fit together" mermaid with an edge
  `shibuya -- via shibuya-pgmq-adapter --> pgmq` (shibuya consumes pgmq).
- `content/docs/getting-started/index.mdx`: update "four" → "five" in the lead paragraph.
- `content/docs/getting-started/the-keiro-family.mdx`: update the "four libraries" framing;
  add a bullet **pgmq — a PostgreSQL-native message queue (the queue substrate), used through
  `pgmq-hs` and consumed by shibuya via the `shibuya-pgmq-adapter`**; add the matching node/edge
  to the "How they depend on each other" mermaid.
- `content/docs/getting-started/choosing-a-library.mdx`: add a problem→library match line —
  **"I need a durable work queue to enqueue and lease jobs." → pgmq (PostgreSQL message queue via
  `pgmq-hs`), consumed by shibuya. Start at [pgmq](/docs/pgmq).**

**At the end:** a newcomer asking "where's the queue?" is routed to pgmq from every entry page;
counts and diagrams are internally consistent.

### Milestone 4 — source-sync pointers

Create two pointer files under `docs/`, each modeled on `docs/keiro-source-sync.md` (a shortened
form is fine for a bootstrap — the key elements are: the mori qualified name + how to resolve the
path, the **Last reviewed commit** block with the current upstream `HEAD` SHA and date, the
package list, and the **Update procedure**). Capture the SHAs at implementation time (see Concrete
Steps) — do **not** invent them.

- `docs/pgmq-hs-source-sync.md` — pins `shinzui/pgmq-hs`.
- `docs/shibuya-pgmq-adapter-source-sync.md` — pins `shinzui/shibuya-pgmq-adapter`.

Each must state that the `content/docs/pgmq/` tree (resp. the
`content/docs/integrations/shibuya-pgmq-adapter.mdx` page) is currently a **bootstrap skeleton**
and that written content is deferred to a later plan.

**At the end:** the later content-authoring plan has a pinned baseline to diff forward from.

### Milestone 5 — validate + commit

Run the validation commands (Concrete Steps / Validation sections). Commit per milestone (or in
two or three logical commits) with both required trailers. If milestones were committed as work
proceeded, this milestone is just the final full-tree validation + Outcomes write-up.


## Concrete Steps

All commands run from the repo root `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`.

1. **Confirm upstream paths and current commits** (used for Milestone 4 pointer files):

   ```bash
   PGMQ=$(mori registry show shinzui/pgmq-hs --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   ADAPTER=$(mori registry show shinzui/shibuya-pgmq-adapter --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$PGMQ"    log -1 --format='%H  (%h)  %cs'
   git -C "$ADAPTER" log -1 --format='%H  (%h)  %cs'
   ```

   Expected: one full SHA + short SHA + date for each, e.g.
   `a1b2c3d4...  (a1b2c3d)  2026-06-07`. Record both in the pointer files.

2. **Create the pgmq skeleton (Milestone 1).** Write the eleven new files listed in the Plan of
   Work using the Write tool, then edit `content/docs/meta.json`. Cross-check the stub bodies
   against the live examples first:

   ```bash
   cat content/docs/shibuya/index.mdx content/docs/shibuya/reference/index.mdx content/docs/shibuya/reference/meta.json
   ```

3. **Create the adapter page + wiring (Milestone 2)**, then **family mentions (Milestone 3)** and
   **pointers (Milestone 4)** with Write/Edit.

4. **Validate** (see Validation and Acceptance for expected output):

   ```bash
   pnpm typecheck
   node scripts/check-doc-links.mjs
   pnpm build
   ```

5. **Commit.** Example for the skeleton milestone (adjust subject per milestone). Per the global
   convention, do not branch; commit to the current branch:

   ```bash
   git add content/docs/pgmq content/docs/meta.json
   git commit -m "docs(pgmq): bootstrap top-level pgmq queue-substrate section skeleton

   Add content/docs/pgmq/ Diátaxis skeleton (index + reference/how-to/
   explanation/cookbook stubs) and wire it into the root nav. Mirrors the
   shibuya skeleton; written content deferred to a later plan.

   ExecPlan: docs/plans/27-bootstrap-pgmq-hs-queue-substrate-and-shibuya-pgmq-adapter-docs.md
   Intention: intention_01ksx5mf7qe2ht659e4kr9w2t0"
   ```

   Every commit on this plan **must** carry both the `ExecPlan:` and `Intention:` trailers shown
   above.


## Validation and Acceptance

The change is documentation-only; "working" means the site builds, the new navigation appears,
and no link is broken. Acceptance:

1. **Type/MDX validity** — `pnpm typecheck` exits 0. `fumadocs-mdx` parses every new `.mdx`
   (malformed frontmatter or an unknown component fails here) and `tsc --noEmit` passes.

2. **Internal links resolve** — `node scripts/check-doc-links.mjs` exits 0 with no broken-link
   report. This catches a `<Card href>` pointing at a slug not present in any `meta.json` (e.g. a
   typo in `/docs/pgmq/reference`). Every new `href` introduced — `/docs/pgmq`,
   `/docs/pgmq/reference`, `/docs/pgmq/how-to`, `/docs/pgmq/explanation`, `/docs/pgmq/cookbook`,
   `/docs/integrations/shibuya-pgmq-adapter` — must resolve.

3. **Build succeeds** — `pnpm build` completes and pre-renders the new routes. Confirm the new
   HTML exists:

   ```bash
   ls .output/public/docs/pgmq/index.html \
      .output/public/docs/pgmq/reference/index.html \
      .output/public/docs/integrations/shibuya-pgmq-adapter/index.html
   ```

   Expected: all three paths listed (no "No such file or directory").

4. **Navigation/mention sanity (manual or grep)** — every new page is registered in its folder's
   `meta.json` (an unregistered page silently vanishes from the sidebar):

   ```bash
   # pgmq appears in the root nav and the section has all five entries:
   grep -n '"pgmq"' content/docs/meta.json content/docs/pgmq/meta.json
   # the adapter is registered in integrations:
   grep -n 'shibuya-pgmq-adapter' content/docs/integrations/meta.json
   # the family pages now mention pgmq:
   grep -rln 'pgmq' content/docs/index.mdx content/docs/getting-started/
   ```

   Expected: each grep returns the edited line(s); no family page is missing from the last result.

5. **No stale counts** — after Milestone 3, no family page should still claim "four libraries"
   while listing five. `grep -rn 'four' content/docs/index.mdx content/docs/getting-started/`
   should return nothing referring to the library count (or only intentional, unrelated uses).

**Out of scope (explicitly not required to pass):** `pnpm format:check` / `oxfmt` — the MDX
baseline is already non-clean repo-wide (project memory `oxfmt-mdx-baseline-not-clean.md`); do not
reformat. External link crawling via linkinator requires the built output and network and is not a
gate for this skeleton.


## Idempotence and Recovery

All steps are **idempotent file writes** — re-running creates the same content. There is no
database, migration, or external mutation.

- The `meta.json` and family-page edits are small, targeted insertions. If an edit is applied
  twice (e.g. a duplicate `"pgmq"` entry or a duplicated `<Card>`), `git diff` will show it and
  `pnpm typecheck` may flag duplicate keys — inspect and revert the dupe.
- If `pnpm build` or `check-doc-links.mjs` reports a broken link, the cause is almost always a
  `href`/slug mismatch or a page missing from its `meta.json`; fix the `meta.json` or the `href`
  and re-run — no rollback needed.
- To abandon the whole change before committing: `git checkout -- content/docs docs` and
  `rm -rf content/docs/pgmq docs/pgmq-hs-source-sync.md docs/shibuya-pgmq-adapter-source-sync.md`.
- Commits are per-milestone, each leaving the tree in a buildable state, so `git revert` of a
  single milestone commit is safe.


## Interfaces and Dependencies

This is a docs-only change; the "interfaces" are the documentation contracts, not code.

**Files that must exist at the end (new):**

- `content/docs/pgmq/index.mdx`, `content/docs/pgmq/meta.json`
- `content/docs/pgmq/reference/index.mdx`, `content/docs/pgmq/reference/meta.json`
- `content/docs/pgmq/how-to/index.mdx`, `content/docs/pgmq/how-to/meta.json`
- `content/docs/pgmq/explanation/index.mdx`, `content/docs/pgmq/explanation/meta.json`
- `content/docs/pgmq/cookbook/index.mdx`, `content/docs/pgmq/cookbook/meta.json`
- `content/docs/integrations/shibuya-pgmq-adapter.mdx`
- `docs/pgmq-hs-source-sync.md`, `docs/shibuya-pgmq-adapter-source-sync.md`

**Files that must be edited (existing):**

- `content/docs/meta.json` (add `"pgmq"`)
- `content/docs/integrations/meta.json` (add `"shibuya-pgmq-adapter"`)
- `content/docs/integrations/index.mdx` (add `<Card>`)
- `content/docs/shibuya/index.mdx` (mention pgmq adapter)
- `content/docs/index.mdx`, `content/docs/getting-started/index.mdx`,
  `content/docs/getting-started/the-keiro-family.mdx`,
  `content/docs/getting-started/choosing-a-library.mdx` (pgmq mentions)

**Documentation contract for every stub page:** YAML frontmatter with `title` and `description`;
a one- to two-sentence intro; an honest `<Callout type="info">…Documentation in progress…</Callout>`.
No invented API surface — describe only what the upstream READMEs/manifests state (see Context).

**Tooling depended on:** `pnpm` (scripts in `package.json`), `node` (link checker),
`mori` (resolve upstream paths/commits for the sync pointers). **Upstream libraries referenced**
(not built here): `shinzui/pgmq-hs` and `shinzui/shibuya-pgmq-adapter`.

**Deferred to a later content-authoring ExecPlan (explicitly not in scope):** verbatim Haskell
signatures and `<TypeTable>`s for `Shibuya.Adapter.Pgmq` / `Pgmq` modules; runnable `jitsurei`
worked examples; delivery-guarantee/visibility-timeout/DLQ explanations; a "Wire a pgmq queue to
shibuya" how-to; any pgmq Tutorials or Code Walkthrough quadrant.
