---
id: 19
slug: keiro-walkthrough-finalization-hub-ordering-and-whole-tree-gate
title: "Keiro walkthrough finalization: hub, ordering, and whole-tree gate"
kind: exec-plan
created_at: 2026-06-02T04:47:38Z
master_plan: "docs/masterplans/2-keiro-framework-documentation-set.md"
---

# Keiro walkthrough finalization: hub, ordering, and whole-tree gate

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

**keiro** is a Haskell *library you import* (not a server you run) that composes three lower
libraries — **kiroku** (an append-only PostgreSQL event store), **keiki** (a pure
finite-state *transducer* that is the decision core), and **shibuya** (a supervised
subscription/worker substrate) — into an event-sourcing and workflow framework. Its
documentation lives under `content/docs/keiro/` in this repository, which is a **fumadocs +
TanStack Start static single-page app** ("SPA" — a website whose pages are rendered in the
browser by JavaScript rather than served as finished HTML).

Inside that documentation set there is a **Code Walkthrough** section
(`content/docs/keiro/walkthrough/`): a set of *ordered source tours*, one per subsystem, that
read keiro's real Haskell line by line so a developer can contribute to keiro or trust how it
works. A **tour** is a subdirectory under `walkthrough/` (for example
`walkthrough/command-cycle/`) holding a `00-start-here.mdx` and numbered chapter files plus its
own `meta.json` listing them in sidebar order. A **hub** (`walkthrough/index.mdx`) is the
landing page that links every tour with a grid of `<Card>`s. A `meta.json` `pages` array lists
the child slugs (a *slug* is a filename without its `.mdx` extension, or a subdirectory name)
in **sidebar display order**.

This plan is **EP-19**, the **finalization** plan of **Phase 4** of the master plan
`docs/masterplans/2-keiro-framework-documentation-set.md`. Phase 4 reopened the walkthrough
tree to bring it to *contribution-grade depth*. Six **authoring** plans run before this one:
EP-13 deepens `walkthrough/command-cycle/`, EP-14 deepens `walkthrough/read-side/`, EP-15
deepens `walkthrough/workflow/`, EP-16 deepens `walkthrough/integration/`, EP-17 creates the
**new** `walkthrough/foundation/` tour (the keiki↔keiro core), and EP-18 creates the **new**
`walkthrough/operations/` tour (telemetry and migrations). After this plan completes, a reader
who lands on `/docs/keiro/walkthrough` can:

- see a hub with **six** cards — one per tour — every card linking to a real
  `…/00-start-here` page that opens without a 404, including the two new tours
  (**foundation**, **operations**) that Phases 1–3 never had;
- read the tours in a deliberate **pedagogical order** in the sidebar (foundation first,
  because it teaches the keiki↔keiro core the other tours build on; operations last, because
  it is cross-cutting), rather than the historical append order;
- follow every cross-link the authoring plans left pointing at a now-existing tour and arrive
  at the precise page (not a generic landing);
- and trust that the whole expanded tree builds and links cleanly: `pnpm build` prerenders
  all six tours and their cross-links with **zero** crawler warnings, and `pnpm lint:links`
  exits 0.

You can see it working from the repo root `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`:
`pnpm build` exits 0 with no `[unhandledRejection]`/`Failed to fetch` line, `pnpm lint:links`
prints `✓ doc links OK …`, and browsing `http://localhost:3000/docs/keiro/walkthrough` (via
`pnpm dev`, or `pnpm build && pnpm start`) shows six cards on the hub and six tours in the
sidebar in the new order.

This plan **owns** two shared artifacts — `content/docs/keiro/walkthrough/index.mdx` (the hub)
and `content/docs/keiro/walkthrough/meta.json` (the top-level tour ordering) — and runs the
post-expansion **whole-tree gate**. It does **not** rewrite any tour's chapter content; the
authoring plans own that. It is the direct Phase-4 analogue of how **EP-12**
(`docs/plans/12-keiro-operations-faq-cookbook-and-docs-finalization.md`) finalized Phase 3:
the same hub-href / meta-ordering / parked-link-upgrade / build-and-link-check pattern, now
applied to the expanded six-tour walkthrough tree.

This plan documents keiro **as shipped at the pinned upstream commit `3f5dc9c`** (keiro
`0.1.0.0`; the telemetry surface tracks the post-0.1.0.0 pin `94c85e2` — see the master plan's
Decision Log). It authors **no** Haskell snippets of its own — it is an integration/ordering
plan — so it inherits the source-accuracy guarantees from the six authoring plans and only
verifies them at the gate.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [x] M0. Preconditions verified — all six tour subdirs present with `00-start-here.mdx` and real
      chapters; the two new subdirs (`foundation`, `operations`) exist; `walkthrough/meta.json`
      already listed all six folder names (appended by EP-17/EP-18). Baseline build clean. _(2026-06-02)_
- [x] M1. Two new hub `<Card href>`s added to `walkthrough/index.mdx` — foundation (first) and
      operations (last), matching the existing four cards' voice; intro prose updated for six tours.
      Hub now shows six cards; build clean. _(2026-06-02)_
- [x] M2. Final ordering pass over `walkthrough/meta.json` — `pages` set to
      `["index","foundation","command-cycle","read-side","workflow","integration","operations"]`
      (reorder only). _(2026-06-02)_
- [x] M3. Parked forward-links upgraded — the four `](/docs/keiro/walkthrough)` landing-only links in
      the foundation tour (Integration Point #7 forward-links naming the read-side snapshot chapters)
      upgraded to `/docs/keiro/walkthrough/read-side/01-the-snapshot-codec-and-the-register-pair`;
      post-pass grep returns no landing-only link naming a page. Also swept **five inbound links** that
      Phase-4 renumbering broke from outside the tours (`reference/snapshot`, `explanation/integration-events`,
      `how-to/bridge-the-outbox-to-kafka`, `walkthrough/workflow/00-start-here`, and a bare `…/operations/`
      directory link). _(2026-06-02)_
- [x] M4. Depth/consistency review — each tour covers its authoring plan's depth checklist (verified by
      each authoring agent's depth grep + source-name check); the six tours share the "ordered source
      tour" voice; the snapshot/keiki-register story reads coherently across the foundation tour
      (register model) and read-side tour (snapshot persistence of **both** state and registers), with
      bidirectional cross-links and no contradiction. _(2026-06-02)_
- [x] M5. WHOLE-TREE GATE green — `pnpm typecheck` clean; `pnpm build` prerenders the expanded tree
      with **zero** crawler/`unhandledRejection` warnings; `pnpm lint:links` exits 0 over **166** files;
      no relative links anywhere under `content/docs/keiro/**`; no v2 API presented as shipped. _(2026-06-02)_


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

- **Chapter renumbering broke five inbound links from outside the tours (2026-06-02).** The Phase-4
  authoring plans renumbered chapters inside their own subdirs (command-cycle `01-the-command-processor`
  → `03-…`; integration `03-kafka-mapping` → `05-…`; read-side `02-the-read-model-query-path` → `03-…`).
  Because each authoring plan owns only its subdir, it could not see — and so did not fix — links that
  *pre-existing Phase-1–3 pages* (and one sibling tour) pointed at the **old** slugs. The whole-tree
  doc-link checker surfaced exactly five: `content/docs/keiro/reference/snapshot.mdx`,
  `content/docs/keiro/explanation/integration-events.mdx`,
  `content/docs/keiro/how-to/bridge-the-outbox-to-kafka.mdx`,
  `content/docs/keiro/walkthrough/workflow/00-start-here.mdx`, and a bare-directory link
  `content/docs/keiro/walkthrough/command-cycle/03-the-command-processor.mdx -> /docs/keiro/walkthrough/operations/`
  (the checker treats `…/operations/` as broken because there is no `operations/index.mdx`, only
  `00-start-here.mdx`). **Bearing:** the inbound-link sweep is finalization (EP-19) work, not authoring
  work — the same lesson EP-12 learned for parked reference links in Phase 3. Resolution: each was
  upgraded to the renumbered slug (or to `…/operations/00-start-here`). Evidence:
  `node scripts/check-doc-links.mjs` went `✗ 5 broken internal doc link(s)` → `✓ doc links OK — checked
  166 files, no broken internal links.`
- **The new tours appended themselves to `walkthrough/meta.json` before EP-19 ran (2026-06-02).** EP-17
  and EP-18 each appended their folder name (`foundation`, `operations`) to the top-level
  `walkthrough/meta.json` per Integration Point #2 (so the tours are sidebar-navigable), leaving the
  array in append order `[…, integration, operations, foundation]`. EP-19's M2 reordered it to the
  pedagogical order without adding or removing any folder name, as designed. No conflict — the two
  appends were disjoint JSON edits.
- **The `^```$` "untagged fence" grep is noisy by design.** EP-19's own M4 check
  `grep -rnE '^```$' content/docs/keiro/walkthrough` matches every **closing** fence (closers are bare
  by definition), so it cannot distinguish a bare *opening* fence from a normal closer. The
  authoritative checks are (a) `pnpm typecheck`/`pnpm build` parsing all MDX (an unbalanced or bare
  opening fence breaks the parse) and (b) the authoring agents' per-file "tagged-open count == bare-close
  count" balance check. Both passed; no genuinely untagged opening fence exists.


## Decision Log

Record every decision made while working on the plan.

- Decision: EP-19 owns only the **shared** walkthrough artifacts — the hub
  `walkthrough/index.mdx` and the top-level `walkthrough/meta.json` ordering — plus the
  two new hub `<Card href>`s, the parked-link upgrade, the depth/consistency review, and the
  whole-tree gate. It does **not** edit any tour's chapter `.mdx` content nor any tour's own
  `walkthrough/<subdir>/meta.json`; those belong to the six authoring plans.
  Rationale: master plan Integration Point #2 (Phase-4 extension) assigns the shared hub and
  top-level ordering to EP-19, mirroring EP-12's Phase-3 role; touching chapter content would
  collide with the authoring plans.
  Date: 2026-06-02
- Decision: The two new hub `<Card href>`s are added **here, by EP-19**, not by EP-17/EP-18.
  Rationale: the prerender crawler follows `<Card href>`s (master plan Surprises), so a hub
  card pointing at `foundation/00-start-here` or `operations/00-start-here` before **both**
  tours exist would make every intermediate `pnpm build` emit a `Failed to fetch` warning.
  EP-17/EP-18 create their subdir, its `00-start-here.mdx`, and append the folder name to
  `walkthrough/meta.json` (so the tour is sidebar-navigable) but deliberately withhold the hub
  href; EP-19 adds both hrefs at once, after both tours exist, keeping every build clean.
  Date: 2026-06-02
- Decision: Reading order is
  `["index","foundation","command-cycle","read-side","workflow","integration","operations"]`.
  Rationale: foundation first teaches the keiki↔keiro core (`EventStream`/`Stream`, the codec
  boundary, and the `SymTransducer`/`Keiki.step` transducer step) that every other tour assumes;
  the command-cycle, read-side, workflow, and integration tours then follow the natural
  data-flow (write path → read side → workflow → integration events); operations last because
  telemetry and migrations are cross-cutting concerns a reader consults after understanding the
  subsystems, not before.
  Date: 2026-06-02
- Decision: All cross-page links use **absolute** doc paths (`/docs/keiro/...`), never relative
  `./` or `../`.
  Rationale: relative MDX links resolve wrong in the static SPA and trip the prerender crawler
  (a hard-won kiroku lesson, master plan Integration Point #6); `scripts/check-doc-links.mjs`
  treats an absolute non-`/docs` internal link as broken and resolves relative links against
  the file directory.
  Date: 2026-06-02
- Decision: Author MDX **without `import` lines** for `Card`/`Cards` (and the other registered
  components). They are registered globally in `src/components/mdx.tsx` via `getMDXComponents`,
  and every existing keiro page uses them bare.
  Rationale: matches house style; avoids duplicate-import drift. (Verified by EP-12, decision
  of 2026-06-01, in `docs/plans/12`.)
  Date: 2026-06-02


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

**Outcome (2026-06-02): EP-19 is Complete — the expanded six-tour walkthrough tree is wired up,
ordered, and passes the whole-tree gate.**

The walkthrough hub (`walkthrough/index.mdx`) now shows **six** `<Card href=…/00-start-here>` entries
— foundation, command-cycle, read-side, workflow, integration, operations — in pedagogical order
(foundation first as the conceptual root, operations last as the cross-cutting concern), with the
intro prose updated for the six tours. The top-level `walkthrough/meta.json` `pages` is
`["index","foundation","command-cycle","read-side","workflow","integration","operations"]` (reorder
only; no folder name added or removed). The four parked foundation forward-links were upgraded to the
read-side snapshot codec chapter, giving the snapshot/keiki-register thread (Integration Point #7)
bidirectional cross-links: foundation→read-side (4 files) and read-side→foundation (2 files), with no
contradiction between the register *model* (foundation) and its *persistence* (read side). Five
inbound links broken by Phase-4 renumbering were swept (see Surprises).

**Gate (the acceptance):** `pnpm typecheck` clean; `pnpm build` exits 0 with **zero**
`[unhandledRejection]`/`Failed to fetch` lines (all six tours and every cross-link prerender); `pnpm
lint:links` prints `✓ doc links OK — checked 166 files, no broken internal links.`; no relative
`./`/`../` links anywhere under `content/docs/keiro/**`; `grep` for `Keiro.Workflow`/`keiro_workflow_steps`
in the walkthrough tree returns nothing (no v2 API presented as shipped). The 166-file count exceeds
the Phase-3 baseline of 148 by the two new tours and the extra chapters in the four deepened tours
(the walkthrough tree is now 35 chapters across six tours).

**Lessons:** (1) parallel authoring across disjoint subdirs is collision-free for *intra-subdir* files,
but *inbound* links from pages outside the tours are invisible to the authors and must be swept by the
finalizer — exactly EP-12's Phase-3 role. (2) Handing every author a canonical final-slug map up front
eliminated cross-*tour* link churn; only the inbound-from-Phase-1–3 links (which no author owned)
needed the central fix. (3) The hub-href-withheld-until-both-tours-exist contract held: every
intermediate build stayed clean, and EP-19 added both new hrefs at once after both tours existed.


## Context and Orientation

Read this whole section before editing. It is written so a novice with only this file and the
working tree can complete the work.

### Where you are working

You edit content files under `content/docs/keiro/walkthrough/` in **this** repository,
`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`. The site is a **fumadocs** documentation
app (fumadocs-ui 16.9.3, fumadocs-mdx 15.0.10) built on **TanStack Start as a static SPA**
(React 19 + Vite, TypeScript), built and served with **pnpm** on **Node 22** inside the Nix dev
shell (`nix develop`). `pnpm dev` runs `vite dev`; `pnpm build` runs `vite build` and emits a
static SPA under `.output/public`; `pnpm start` serves it.

This plan touches only **two** files directly — the hub `content/docs/keiro/walkthrough/index.mdx`
and the top-level `content/docs/keiro/walkthrough/meta.json` — plus whichever chapter/prose files
carry a **parked** walkthrough-landing link that M3 upgrades (found by grep, not known in
advance). It does not author chapter content.

The MDX components you use here — `Cards`, `Card` — are **registered globally** in
`src/components/mdx.tsx` (verified by EP-12), so use them **without** an `import` line. Every
fenced code block in this plan and in any file you edit must carry a language tag (`mdx`,
`json`, `bash`, `text`, `mermaid`, …); a bare ```` ``` ```` is not allowed.

### The walkthrough tree as it stands when this plan runs

When EP-19 begins, the six authoring plans (EP-13 … EP-18) are Complete. The tree looks like
this (the four deepened subdirs may have **more** chapters than shown — the authoring plans add
and renumber chapters inside their own subdir; the two new subdirs are created by EP-17/EP-18):

```text
content/docs/keiro/walkthrough/
  index.mdx                    <- the HUB (this plan owns it; M1 adds 2 cards)
  meta.json                    <- top-level tour ordering (this plan owns it; M2 orders it)
  foundation/                  <- NEW, created by EP-17 (keiki↔keiro core)
    00-start-here.mdx
    01-…  02-…  …
    meta.json
  command-cycle/               <- deepened by EP-13
    00-start-here.mdx  01-…  …
    meta.json
  read-side/                   <- deepened by EP-14 (snapshots + keiki registers)
    00-start-here.mdx  01-…  …
    meta.json
  workflow/                    <- deepened by EP-15
    00-start-here.mdx  01-…  …
    meta.json
  integration/                 <- deepened by EP-16
    00-start-here.mdx  01-…  …
    meta.json
  operations/                  <- NEW, created by EP-18 (telemetry + migrations)
    00-start-here.mdx  01-…  …
    meta.json
```

Each tour's `00-start-here.mdx` is the page a hub card links to; its slug is literally
`00-start-here`, so the foundation and operations hub hrefs are
`/docs/keiro/walkthrough/foundation/00-start-here` and
`/docs/keiro/walkthrough/operations/00-start-here`.

The hub as it stands today already has **four** cards **with** hrefs (added by EP-12 in Phase 3),
for command-cycle, read-side, workflow, and integration:

```mdx
<Cards>
  <Card title="The command cycle" href="/docs/keiro/walkthrough/command-cycle/00-start-here" description="Hydrate → Transduce → Append: Keiro.Command, the codec, and the typed event stream." />
  <Card title="The read side" href="/docs/keiro/walkthrough/read-side/00-start-here" description="Projections, read models, and snapshots." />
  <Card title="The workflow engine" href="/docs/keiro/walkthrough/workflow/00-start-here" description="Process managers and durable timers." />
  <Card title="Integration events" href="/docs/keiro/walkthrough/integration/00-start-here" description="The inbox, the outbox, and the Kafka bridge." />
</Cards>
```

M1 **adds two more** cards to this block — foundation and operations — matching that style.

The top-level `walkthrough/meta.json` as it stands lists, in the order the authoring plans
appended them:

```json
{
  "title": "Code Walkthrough",
  "pages": ["index", "command-cycle", "read-side", "workflow", "integration", "foundation", "operations"]
}
```

(The two new folder names `foundation` and `operations` are present because EP-17/EP-18 appended
them — that is what makes the new tours appear in the sidebar at all. M2 only **reorders** this
array; it never adds or removes a folder name.)

### Why the hub hrefs were withheld until now (the crawler lesson)

The site's `pnpm build` runs a **prerender crawler** that follows `<Card href>` links to
discover routes. If a hub card points at a page that does not yet exist, `pnpm build` still
exits 0 **but** prints a warning line containing `[unhandledRejection]` and `Failed to fetch …`
for that href — which the gate treats as a failure. This is exactly why EP-7 first shipped the
hub with **href-less** cards and EP-12 added the four Phase-3 hrefs only after those four tours
existed (master plan Surprises, the "create-hub-without-hrefs" contract). The same discipline
governs the two new tours: EP-17/EP-18 created their subdirs and `00-start-here.mdx` pages and
made them sidebar-navigable via `meta.json`, but they did **not** add the hub `<Card href>` —
**EP-19 does, once both tours exist**, so every intermediate build stayed clean.

### The build and link-check gate (read `package.json` scripts and `scripts/check-doc-links.mjs`)

These commands, run from the repo root, are the gate this plan must pass. They are defined in
`package.json` (verified):

- `pnpm typecheck` runs `fumadocs-mdx && tsc --noEmit`. The `fumadocs-mdx` step regenerates the
  `.source/` collection so newly added pages and any `meta.json` reorder are picked up; `tsc
  --noEmit` type-checks the app. Expected tail: no errors.
- `pnpm build` runs `vite build`. It prerenders every doc route and runs the crawler. Success
  ends with a Vite `✓ built in <N>s` line and writes `.output/public`. **Failure mode to
  watch:** any line containing `[unhandledRejection]` or `Failed to fetch` means a page links to
  a route that does not exist — for this plan, a premature/parked `<Card href>` or a parked
  prose link. Zero such lines is an acceptance criterion.
- `pnpm lint:links` runs `node scripts/check-doc-links.mjs && linkinator .output/public …`. The
  first script (read it: `scripts/check-doc-links.mjs`) scans every `content/docs/**/*.mdx`
  (skipping `_templates/`) for internal links and fails (exit 1, printing `✗ N broken internal
  doc link(s):` and each `file -> target`) if any points at a page that does not exist on disk;
  on success it prints `✓ doc links OK — checked <N> files, no broken internal links.`. It
  resolves a `/docs/...` link to `<path>.mdx` or `<path>/index.mdx` under `content/docs`, treats
  any other absolute (`/...`) internal link as **broken**, and resolves relative links against
  the file's own directory. The `linkinator` step then crawls the built SPA; because the
  prerendered HTML has **zero** static `<a>` tags (the SPA injects links client-side — the
  script's own header comment documents this), `linkinator` scans ~0 links and the **source
  scan is the meaningful check**.
- `pnpm check` runs the whole chain (`typecheck`, `lint`, `format:check`, `build`, `lint:links`).
  You may run the chain or the individual steps.

At Phase-3 completion EP-12's gate scanned **148** files. Phase 4 adds the foundation and
operations tours plus extra chapters in the four deepened tours, so the final `checked <N>
files` count will be **higher than 148** (the exact number depends on how many chapters the six
authoring plans shipped — record it at M5, do not hard-code an expectation).

### The source of truth (NEVER search `/nix/store` or `/`)

The keiro source is on disk at `/Users/shinzui/Keikaku/bokuno/keiro`, pinned at commit `3f5dc9c`
(`git -C /Users/shinzui/Keikaku/bokuno/keiro rev-parse HEAD` →
`3f5dc9c1fa90f6358cebb9e85d92dde4c325db48`). This plan opens it read-only **only** during the M4
depth review (to confirm a tour names a function that really exists); it authors no snippets.
The six authoring plans already cross-checked every snippet against this source.


## Plan of Work

The work is six milestones, run **in order**, all after the six authoring plans (EP-13 … EP-18)
are Complete. M0 verifies that precondition. M1 adds the two hub cards. M2 orders the tours. M3
upgrades parked links. M4 is the depth/consistency review. M5 is the whole-tree gate, which is
the acceptance. Each milestone ends with `pnpm build` clean so failures are localized.

### Milestones

- **M0 — Preconditions (runs only after EP-13 … EP-18 are Complete).** Confirm Node 22 + pnpm on
  PATH and `node_modules` present. Confirm all six tour subdirectories exist with a
  `00-start-here.mdx` and at least one numbered chapter, that the two **new** subdirs
  (`foundation`, `operations`) are present, and that `walkthrough/meta.json` already lists all
  six folder names (the authoring plans appended them). Baseline `pnpm typecheck` and `pnpm
  build` clean on the unmodified tree. Acceptance: the precondition checks all print "present"
  and both commands exit 0. If any subdir is missing or `meta.json` lacks a folder name, an
  authoring plan is not Complete — **stop**; this plan's precondition is not met.

- **M1 — Two new hub `<Card href>`s.** In `content/docs/keiro/walkthrough/index.mdx`, add two
  `<Card>` elements inside the existing `<Cards>` block: one for **foundation** (href
  `/docs/keiro/walkthrough/foundation/00-start-here`) and one for **operations** (href
  `/docs/keiro/walkthrough/operations/00-start-here`), with titles and descriptions in the same
  voice as the existing four cards. Place foundation **first** in the card grid (it is the
  conceptual root) and operations **last** (cross-cutting), matching the M2 sidebar order so the
  hub grid and the sidebar tell the same story. Acceptance: `pnpm build` exits 0 with **zero**
  crawler warnings (both new hrefs resolve, because both tours now exist); the hub shows six
  cards.

- **M2 — Final ordering pass over `walkthrough/meta.json`.** Set `pages` to the pedagogical
  order `["index","foundation","command-cycle","read-side","workflow","integration","operations"]`.
  **Reorder only** — every folder name already in the array must remain; do not add or delete any
  (the array's membership is owned by the authoring plans; only its order is owned here).
  Acceptance: the sidebar under "Code Walkthrough" shows the six tours in that order; `pnpm
  build` still clean.

- **M3 — Upgrade parked forward-links.** The authoring plans, when they wrote a chapter that
  wanted to reference a tour that did not yet exist, **parked** the link on the walkthrough
  landing `/docs/keiro/walkthrough` and named the target tour/page in nearby prose (the same
  crawler-avoidance discipline EP-12 used for the reference landing). Now that all six tours
  exist, upgrade each such link to its precise slug. Find them with
  `grep -rn "](/docs/keiro/walkthrough)" content/docs/keiro`; for each hit, read the surrounding
  prose to learn which tour/page it means, and rewrite the link target to that page's absolute
  slug (e.g. `/docs/keiro/walkthrough/foundation/00-start-here` or a specific chapter). Reorder
  only the link target; do not rewrite the prose. Acceptance: the post-pass grep returns no
  landing-only `](/docs/keiro/walkthrough)` link that names a specific page in nearby prose
  (a bare "see the walkthrough section" link that genuinely means the landing may remain — judge
  by the prose, exactly as EP-12 did for `](/docs/keiro/reference)`). `pnpm lint:links` clean.

- **M4 — Depth/consistency review.** A read-through pass, not an edit pass (its output is a
  recorded judgment plus, if a gap is found, a note in Surprises and a hand-off to the owning
  authoring plan — EP-19 does not rewrite chapter content). Confirm: (a) each tour covers its
  subsystem's public surface, checked against that authoring plan's own depth checklist (the
  plans are checked into the repo at `docs/plans/13` … `docs/plans/18` — open each and compare
  its promised coverage to the shipped chapters); (b) voice and depth are consistent across the
  six tours (same "ordered source tour" framing, same chapter granularity, absolute links, every
  fence tagged); (c) the **snapshot/keiki-register** story (master plan Integration Point #7)
  reads as one coherent thread across the **foundation** tour (which owns the *register model* —
  what a `SymTransducer`'s `registers` `rs` are versus the folded `state` `s`, how `Keiki.step`
  threads the `(state, registers)` pair) and the **read-side** tour (which owns the
  *persistence* — the snapshot codec that serializes/restores **both** state and registers), with
  the two cross-linking each other and **no contradiction**. Acceptance: the review checklist in
  Validation passes, or any gap is recorded in Surprises with the owning plan named.

- **M5 — WHOLE-TREE GATE (the acceptance).** Run `pnpm typecheck`, `pnpm build`, `pnpm
  lint:links` from the repo root over the **expanded** tree. Require: typecheck clean; build
  exits 0 with **zero** `[unhandledRejection]`/`Failed to fetch` lines (all six tours and every
  cross-link resolve); `lint:links` exits 0; no relative links anywhere under
  `content/docs/keiro/**`. Record the final `checked <N> files` count. Acceptance: see Validation
  and Acceptance.


## Concrete Steps

Run all commands from the repo root `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` unless
stated otherwise. The toolchain is **pnpm** on **Node 22** inside the Nix dev shell.

### M0 — Preconditions

```bash
nix develop                       # enter the dev shell (pnpm + Node 22)
pnpm install

# All six tour subdirs must exist with a start-here page. The two NEW ones
# (foundation, operations) are the proof EP-17/EP-18 landed.
for d in foundation command-cycle read-side workflow integration operations; do
  if test -f content/docs/keiro/walkthrough/$d/00-start-here.mdx; then
    echo "tour present: $d"
  else
    echo "MISSING tour: $d"
  fi
done

# The top-level meta.json must already list all six folder names (appended by EP-13…EP-18).
cat content/docs/keiro/walkthrough/meta.json
```

Expected:

```text
tour present: foundation
tour present: command-cycle
tour present: read-side
tour present: workflow
tour present: integration
tour present: operations
```

and the `meta.json` `pages` array contains `index` plus all six folder names (in any order).
If any line says `MISSING tour:` or a folder name is absent from `meta.json`, an authoring plan
(EP-13 … EP-18) is **not** Complete — stop; EP-19's precondition is not met.

Confirm the keiro source pin (for the M4 review), then baseline the build:

```bash
git -C /Users/shinzui/Keikaku/bokuno/keiro rev-parse HEAD
# expect: 3f5dc9c1fa90f6358cebb9e85d92dde4c325db48

pnpm typecheck
pnpm build
```

Expected tail:

```text
✓ built in <N>s
```

with **no** `[unhandledRejection]`/`Failed to fetch` line. (The baseline build is already clean
because EP-17/EP-18 withheld their hub hrefs — the two new tours are navigable from the sidebar
but not yet linked from the hub.)

### M1 — Add the two new hub `<Card href>`s

Open `content/docs/keiro/walkthrough/index.mdx`. Inside the existing `<Cards>` block, add a
foundation card as the **first** child and an operations card as the **last** child, so the grid
reads foundation → command-cycle → read-side → workflow → integration → operations (matching the
M2 sidebar order). The result:

```mdx
<Cards>
  <Card title="The foundation" href="/docs/keiro/walkthrough/foundation/00-start-here" description="The keiki↔keiro core: the typed EventStream/Stream handles, the codec boundary, and the SymTransducer/step that threads (state, registers)." />
  <Card title="The command cycle" href="/docs/keiro/walkthrough/command-cycle/00-start-here" description="Hydrate → Transduce → Append: Keiro.Command, the codec, and the typed event stream." />
  <Card title="The read side" href="/docs/keiro/walkthrough/read-side/00-start-here" description="Projections, read models, and snapshots — including how the snapshot codec persists keiki's registers." />
  <Card title="The workflow engine" href="/docs/keiro/walkthrough/workflow/00-start-here" description="Process managers and durable timers." />
  <Card title="Integration events" href="/docs/keiro/walkthrough/integration/00-start-here" description="The inbox, the outbox, and the Kafka bridge." />
  <Card title="Operations" href="/docs/keiro/walkthrough/operations/00-start-here" description="The cross-cutting internals: Keiro.Telemetry span helpers and the Keiro.Migrations runner." />
</Cards>
```

Keep the surrounding prose. The hub's intro currently says "There is one tour per subsystem" —
update it to read naturally for six tours including the cross-cutting operations tour and the
foundation tour (for example, "There is one tour per subsystem, plus a foundation tour for the
keiki↔keiro core and a cross-cutting operations tour."). Then:

```bash
pnpm build
```

Expected: `✓ built in <N>s` with no `Failed to fetch`. If a `Failed to fetch
…/foundation/00-start-here` (or operations) line appears, that tour's `00-start-here.mdx` is
missing — return to M0; an authoring plan did not land.

### M2 — Order `walkthrough/meta.json`

Set the `pages` array to the pedagogical order. Reorder only — keep every folder name:

```json
{
  "title": "Code Walkthrough",
  "pages": ["index", "foundation", "command-cycle", "read-side", "workflow", "integration", "operations"]
}
```

Then regenerate the collection and rebuild:

```bash
pnpm typecheck
pnpm build
```

Expected: clean. Browsing `/docs/keiro/walkthrough` (via `pnpm dev`) the sidebar lists the six
tours in this order under "Code Walkthrough".

### M3 — Upgrade parked walkthrough-landing links

Find every link that targets the walkthrough **landing** rather than a specific page:

```bash
grep -rn "](/docs/keiro/walkthrough)" content/docs/keiro
```

For each hit, read the surrounding sentence(s) to determine which tour or chapter it actually
means (the authoring plans named the target in prose because they could not link it yet — e.g.
"see the foundation tour" or "the snapshot chapter of the read-side tour"). Then upgrade the
link target to that page's absolute slug. Examples of the *upgrade direction* (the actual hits
depend on what the authoring plans parked — inspect each):

```text
[the foundation tour](/docs/keiro/walkthrough)
  -> [the foundation tour](/docs/keiro/walkthrough/foundation/00-start-here)

[how the snapshot codec persists registers](/docs/keiro/walkthrough)
  -> [how the snapshot codec persists registers](/docs/keiro/walkthrough/read-side/01-snapshots-in-the-command-path)

[the operations tour](/docs/keiro/walkthrough)
  -> [the operations tour](/docs/keiro/walkthrough/operations/00-start-here)
```

Edit only the target inside the parentheses; leave the link text and surrounding prose alone.
A bare link whose prose genuinely means "the whole walkthrough section" (not a named page) may
stay pointed at `/docs/keiro/walkthrough` — judge by the prose, exactly as EP-12 did for the
`](/docs/keiro/reference)` upgrades. Re-run the grep to confirm:

```bash
grep -rn "](/docs/keiro/walkthrough)" content/docs/keiro
```

Expected: no remaining landing-only link that names a specific page in its prose (output is
empty, or contains only genuine "whole section" links you deliberately left). Then:

```bash
pnpm lint:links
```

Expected: `✓ doc links OK — checked <N> files, no broken internal links.` (every upgraded slug
resolves to a real chapter on disk).

### M4 — Depth/consistency review

This is a read-through, recorded as a judgment. Open each authoring plan and its tour side by
side and confirm the tour covers the surface the plan promised:

```bash
# The six authoring plans (checked in) and their tours:
#   EP-13 docs/plans/13-…  -> content/docs/keiro/walkthrough/command-cycle/
#   EP-14 docs/plans/14-…  -> content/docs/keiro/walkthrough/read-side/
#   EP-15 docs/plans/15-…  -> content/docs/keiro/walkthrough/workflow/
#   EP-16 docs/plans/16-…  -> content/docs/keiro/walkthrough/integration/
#   EP-17 docs/plans/17-…  -> content/docs/keiro/walkthrough/foundation/
#   EP-18 docs/plans/18-…  -> content/docs/keiro/walkthrough/operations/
ls docs/plans/1[3-8]-*.md
for d in foundation command-cycle read-side workflow integration operations; do
  echo "== $d =="; ls content/docs/keiro/walkthrough/$d/
done
```

For each tour: open its authoring plan's depth checklist (its Progress / Validation section
naming the functions, types, and SQL it promised to walk) and confirm the shipped chapters cover
each item. Spot-check voice and depth: every tour opens with the "ordered source tour" framing,
chapters are comparably granular, links are absolute, and every fence carries a language tag:

```bash
# No relative links anywhere in the walkthrough tree.
grep -rnE "\]\(\.\.?/" content/docs/keiro/walkthrough && echo "FOUND relative links" || echo "no relative links"
# Every fenced block tagged: list any bare opening fence (a ``` immediately followed by newline).
grep -rnE '^```$' content/docs/keiro/walkthrough || echo "no untagged fences"
```

Expected: `no relative links` and `no untagged fences`.

For the **snapshot/keiki-register** thread (Integration Point #7), read the foundation tour's
transducer/register chapter and the read-side tour's snapshot chapter together and confirm: the
foundation tour defines registers (`rs`) as keiki's auxiliary register bank, distinct from the
folded `state` (`s`), and explains `Keiki.step` threading the `(state, registers)` pair; the
read-side tour says the snapshot codec persists/restores **both** state and registers (not just
state); the two **cross-link** each other; and neither describes registers in a way the other
contradicts. Confirm the cross-links exist:

```bash
# Foundation tour links forward to the read-side snapshot persistence chapter:
grep -rn "/docs/keiro/walkthrough/read-side" content/docs/keiro/walkthrough/foundation
# Read-side snapshot chapter links back to the foundation register model:
grep -rn "/docs/keiro/walkthrough/foundation" content/docs/keiro/walkthrough/read-side
```

Expected: at least one match in each direction. If a tour falls short of its depth checklist or
the register story contradicts itself, **do not edit the chapter here** — record the gap in
Surprises, name the owning authoring plan (EP-13 … EP-18), and hand it back; EP-19 owns only the
shared hub/ordering. (Trivial wording nudges that do not change a tour's coverage may be left for
the owning plan too; EP-19's job is to *detect and route* depth gaps, not to author chapters.)

### M5 — Whole-tree gate (the acceptance)

Run the full gate over the expanded tree:

```bash
pnpm typecheck
pnpm build
pnpm lint:links
```

Expected (abridged):

```text
✓ built in <N>s
✓ doc links OK — checked <N> files, no broken internal links.
```

The `pnpm build` output must contain **no** `[unhandledRejection]` and **no** `Failed to fetch`
line. Record the `checked <N> files` count (it will exceed the Phase-3 baseline of 148). Final
relative-link sweep across the whole keiro tree:

```bash
grep -rnE "\]\(\.\.?/" content/docs/keiro && echo "FOUND relative links" || echo "no relative links"
```

Expected: `no relative links`.


## Validation and Acceptance

Exercise the system and observe specific behaviors. Acceptance is the **green whole-tree gate**.

1. **The hub shows six cards, all hrefs resolve.** After M1, browsing
   `http://localhost:3000/docs/keiro/walkthrough` (via `pnpm dev`) shows six `<Card>`s —
   foundation, command-cycle, read-side, workflow, integration, operations — and clicking each
   opens that tour's `00-start-here` page without a 404. Evidence: the hub file contains six
   `<Card href=…/00-start-here>` entries, and `pnpm build` prerenders with no `Failed to fetch`:

   ```bash
   grep -c "00-start-here" content/docs/keiro/walkthrough/index.mdx   # expect 6
   ```

2. **The sidebar reads in pedagogical order.** After M2, the "Code Walkthrough" sidebar lists
   foundation, command-cycle, read-side, workflow, integration, operations — in that order. The
   `walkthrough/meta.json` `pages` array equals
   `["index","foundation","command-cycle","read-side","workflow","integration","operations"]`.

3. **No parked walkthrough-landing links remain.** After M3,
   `grep -rn "](/docs/keiro/walkthrough)" content/docs/keiro` returns no landing-only link that
   names a specific page in nearby prose; every such link now points at a precise tour/chapter
   slug that exists on disk.

4. **The whole expanded tree builds with zero crawler warnings.** `pnpm build` exits 0 and its
   output contains no `[unhandledRejection]` and no `Failed to fetch` line. **Interpreting
   failure:** a `Failed to fetch …/<path>` line means some `<Card href>` or prose link points at
   a route that does not exist — i.e. a **parked or premature href**. The path in the message is
   the culprit: if it is a `…/00-start-here` under a tour, that tour's start page is missing
   (an authoring plan did not land — return to M0); if it is a chapter slug, an M3 upgrade
   pointed at the wrong filename (fix the link to the real chapter). Evidence to capture:

   ```text
   ✓ built in <N>s
   ```

5. **Link-check passes.** `pnpm lint:links` prints `✓ doc links OK — checked <N> files, no
   broken internal links.` and exits 0; record `<N>` (greater than the Phase-3 baseline of 148).
   The `linkinator` crawl reports no broken links (it scans ~0 links on the SPA — expected, per
   the script header; the source scan is the meaningful check). No relative `./`/`../` links
   exist anywhere under `content/docs/keiro/**`:

   ```bash
   grep -rnE "\]\(\.\.?/" content/docs/keiro && echo "FOUND relative links" || echo "no relative links"
   ```

   Expected: `no relative links`.

6. **Depth and consistency hold (M4).** Each of the six tours covers its subsystem's public
   surface per its authoring plan's depth checklist; the six tours share the "ordered source
   tour" voice and comparable chapter granularity; every fence is tagged; and the
   snapshot/keiki-register thread reads coherently across the foundation tour (register model)
   and the read-side tour (snapshot persistence of **both** state and registers), with
   bidirectional cross-links and no contradiction. Any gap found is recorded in Surprises with
   the owning authoring plan named (EP-19 does not author chapter content).

7. **No unshipped API presented as real.** The walkthrough tree names only keiro identifiers
   that exist at the pinned commit; no chapter presents the v2 durable-execution engine
   (`Keiro.Workflow`, `keiro_workflow_steps`, named steps) as shipped. Spot-check:

   ```bash
   grep -rn "Keiro.Workflow\|keiro_workflow_steps" content/docs/keiro/walkthrough \
     && echo "CHECK: must be roadmap-only" || echo "no v2 API referenced as shipped"
   ```

   Expected: `no v2 API referenced as shipped`. (This is an inherited guarantee from the
   authoring plans; EP-19 only verifies it.)


## Idempotence and Recovery

All steps are file authoring (two files plus parked-link target edits) and command runs, all
safe to repeat. Re-running `pnpm typecheck`/`pnpm build`/`pnpm lint:links` is idempotent.
Editing `walkthrough/index.mdx`, `walkthrough/meta.json`, or a parked link overwrites the same
text; re-running a milestone simply rewrites the same files. No database, no keiro source, and
no tour **chapter content** is modified (the keiro tree is opened read-only for the M4 review;
the `meta.json` reorder and the parked-link target edits never delete or rename another plan's
pages).

Recovery:
- If `pnpm build` emits `[unhandledRejection]`/`Failed to fetch`, read the path in the message.
  A `…/00-start-here` under a tour means that tour is missing — an authoring plan did not land;
  return to M0 and do not proceed. A chapter slug means an M3 link upgrade pointed at the wrong
  filename; fix the target to the real chapter (check `ls content/docs/keiro/walkthrough/<tour>/`).
- If `pnpm lint:links` fails, it prints each broken `file -> target`; fix the link to an existing
  `/docs/keiro/...` page (absolute, never relative) and re-run.
- If the M0 precondition check shows a missing tour subdir or a folder name absent from
  `walkthrough/meta.json`, stop — an authoring plan (EP-13 … EP-18) is not Complete. Do not add
  the missing folder name yourself; that is the authoring plan's job (it must also ship the
  subdir's chapters). Resume EP-19 once it lands.
- If a parked-link grep hit is ambiguous (the prose does not clearly name a single target),
  prefer leaving it on the landing over guessing a wrong slug; record the ambiguity in Surprises.
- The two new hub cards are idempotent: if M1 is re-run, ensure the `<Cards>` block contains
  exactly one foundation card and one operations card (no duplicates) by re-reading the file
  before editing.

To **roll back** any change, restore the two owned files and any edited prose file from git
(`git checkout -- content/docs/keiro/walkthrough/index.mdx content/docs/keiro/walkthrough/meta.json`),
since this plan makes only additive/reordering content edits.


## Interfaces and Dependencies

### Files this plan OWNS and edits

- `content/docs/keiro/walkthrough/index.mdx` — the walkthrough **hub**. M1 adds two `<Card
  href>`s (foundation, operations) to the existing `<Cards>` block and updates the intro prose
  for six tours. This plan is the sole owner of the hub per master plan Integration Point #2
  (Phase-4 extension).
- `content/docs/keiro/walkthrough/meta.json` — the top-level tour **ordering**. M2 reorders
  `pages` to `["index","foundation","command-cycle","read-side","workflow","integration","operations"]`.
  Reorder only; never add or remove a folder name (membership is owned by the authoring plans).

### Files this plan EDITS but does not own (M3, found by grep)

- Any `content/docs/keiro/**/*.mdx` carrying a parked `](/docs/keiro/walkthrough)` link that
  names a specific tour/page in nearby prose. M3 upgrades only the link **target** to the precise
  slug; it does not touch the link text or surrounding prose. The exact set is discovered at run
  time (the authoring plans determine what they parked); it is not known in advance.

### Files this plan READS but never edits

- `docs/plans/13` … `docs/plans/18` (the six authoring ExecPlans, checked in) — read in M4 to
  compare each tour's promised depth checklist against its shipped chapters.
- The keiro source at `/Users/shinzui/Keikaku/bokuno/keiro` (commit `3f5dc9c`, read-only) — used
  in M4 only to confirm a tour names a function/type/table that really exists.
- `scripts/check-doc-links.mjs` and `package.json` (the gate definitions).

### Docs tooling (TypeScript, this repo)

- fumadocs (`fumadocs-core`/`fumadocs-ui` 16.9.3, `fumadocs-mdx` 15.0.10) — renders MDX and the
  sidebar from `meta.json`; `Cards`/`Card` are registered globally in `src/components/mdx.tsx`
  (use bare, no imports).
- TanStack Start + Vite — `pnpm dev`/`pnpm build`/`pnpm start`; `pnpm typecheck` =
  `fumadocs-mdx && tsc --noEmit`; `pnpm lint:links` = `node scripts/check-doc-links.mjs &&
  linkinator .output/public …`; `pnpm check` runs the whole chain.
- pnpm + Node 22 inside the Nix dev shell (`nix develop`).

### Dependencies on other plans

- **Hard dependency — EP-7**
  (`docs/plans/7-keiro-overview-getting-started-and-the-jitsurei-example-spine.md`): it created
  the `content/docs/keiro/walkthrough/index.mdx` hub and the initial `walkthrough/meta.json` this
  plan finalizes. Complete.
- **Integration dependency — EP-13 … EP-18** (`docs/plans/13`–`docs/plans/18`): this plan's whole
  finalization runs **after** all six are Complete. Each must have created/expanded its tour
  subdirectory (with a `00-start-here.mdx`), kept that subdir's own `meta.json` in sync with its
  files, and **appended** its folder name to `walkthrough/meta.json`. The two new-tour plans
  (EP-17 foundation, EP-18 operations) deliberately did **not** add their hub `<Card href>` —
  EP-19 adds both, once both tours exist, per the crawler-avoidance contract. EP-19 reorders the
  top-level `meta.json` and upgrades parked links but never deletes/renames another plan's pages
  and never rewrites another plan's chapter content.

### Postconditions that must hold at the end

- `content/docs/keiro/walkthrough/index.mdx` contains six `<Card href=…/00-start-here>` entries
  (foundation, command-cycle, read-side, workflow, integration, operations).
- `content/docs/keiro/walkthrough/meta.json` `pages` =
  `["index","foundation","command-cycle","read-side","workflow","integration","operations"]`.
- No `](/docs/keiro/walkthrough)` landing-only link in `content/docs/keiro/**` names a specific
  page in nearby prose (all such links upgraded to precise slugs).
- `pnpm typecheck` clean; `pnpm build` exits 0 with **zero** `[unhandledRejection]`/`Failed to
  fetch` lines; `pnpm lint:links` exits 0 over the recorded file count (greater than 148).
- No relative `./`/`../` links anywhere under `content/docs/keiro/**`.
- The M4 review judgment is recorded (each tour covers its surface; voice/depth consistent; the
  snapshot/register thread coherent and bidirectionally cross-linked), with any gap routed to its
  owning authoring plan in Surprises.
