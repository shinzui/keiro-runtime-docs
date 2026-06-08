---
id: 28
slug: document-the-keiro-runtime-jitsurei-example-application
title: "Document the keiro-runtime-jitsurei example application"
kind: exec-plan
created_at: 2026-06-08T04:21:29Z
intention: "intention_01ksx5mf7qe2ht659e4kr9w2t0"
---

# Document the keiro-runtime-jitsurei example application

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, the documentation site gains a new top-level section —
**`content/docs/example-app/`**, published at `/docs/example-app` — that documents
**`keiro-runtime-jitsurei`**: the standalone, runnable reference application that exercises
nearly the entire keiro runtime end-to-end across two isolated microservices.

Today the docs explain each keiro subsystem in isolation (command cycle, read side,
workflows, integration events, pgmq jobs) and thread a *small* in-repo worked example
(`keiro/jitsurei/` — orders + escalation) through the prose. What is missing is a tour of a
**realistic, multi-service application** that wires all of those subsystems together: where a
command in one service triggers an outbox row, a Kafka publish, an inbox consume in a second
service, a PGMQ background job, a durable workflow that parks on an awakeable, and a reply that
travels all the way back — with a single OpenTelemetry trace stitched across the whole path.

`keiro-runtime-jitsurei` is exactly that application. It models **emergency-response
coordination**: an **Incident Command** service (declare incidents, assign commanders, triage
casualties, order evacuations, escalate on a timer) and a **Hospital Capacity** service (track
beds, run surge protocols, hold/confirm patient-transfer reservations). The two services share
no Haskell code — they communicate only through versioned message contracts over Kafka, and
Hospital Capacity drains reservation work through a `keiro-pgmq` job queue.

**What a reader can do after this section exists:**

- Read a guided, source-grounded code walkthrough of a complete keiro application and, for any
  runtime feature they already learned about abstractly, see it used *in anger* with real
  domain code — with a link from the example page back to the canonical keiro reference page.
- Follow `running-it/` to clone-build-migrate-run the three packaged scenarios
  (`mass-casualty-transfer`, `hospital-divert-reroute`, `supply-shortage-escalation`) and
  inspect the resulting traces in Jaeger.
- Navigate from the top-level docs index / the keiro family page into the example app, and from
  individual subsystem pages (e.g. the pgmq job pages) into the place where that subsystem is
  used by a real service.

**Observable outcome.** `pnpm run typecheck`, `pnpm run lint:links`, and `pnpm run build` all
pass with the new section in place; the new `example-app` entry appears in the top-level
sidebar; every internal cross-link resolves; and the dev server renders each new page with its
Haskell code blocks highlighted and its Mermaid diagrams interactive.

> **Scope note — docs only.** This plan writes **documentation** in the
> `keiro-runtime-docs` repository. It does **not** modify the `keiro-runtime-jitsurei`
> application source. The application is read-only source material here. Like the rest of this
> docs tree, the pages are *ported and cross-checked* against the app source at a pinned commit
> (see Milestone 1's source-sync pointer), not generated from it.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [x] **M1 — Scaffold + overview.** _(done 2026-06-07)_ Created the `content/docs/example-app/`
      tree, all `meta.json` navigation files, registered `example-app` (end of list) in the
      top-level `content/docs/meta.json`, wrote `index.mdx` + the four `overview/` pages + the four
      directory-stub `index.mdx` files, and added the `docs/keiro-runtime-jitsurei-source-sync.md`
      pointer pinned at app commit `04420ed`. Gate green: `typecheck`, `check-doc-links.mjs`
      (351 files), `build`, `lint:links` all pass.
- [ ] **M2 — Incident Command walkthrough.** Write `incident-command/` (start-here + 7
      chapters): aggregates/transducers, command cycle, read models, routers, escalation PM +
      timers, evacuation workflow, wiring/CLI.
- [ ] **M3 — Hospital Capacity walkthrough.** Write `hospital-capacity/` (start-here + 6
      chapters): aggregates/transducers, command cycle + read models, surge PM, reservation
      workflow, the `keiro-pgmq` reservation work queue, wiring/CLI.
- [ ] **M4 — Cross-service integration.** Write `cross-service/` (index + 5 chapters): the
      end-to-end message flow, message contracts, outbox + Kafka publishing, inbox + consuming,
      telemetry / trace continuity.
- [ ] **M5 — Running it.** Write `running-it/` (index + 4 chapters): prerequisites/setup,
      running the scenarios, the workers, observing traces.
- [ ] **M6 — Cross-links + finalization.** Add inbound cross-links from existing keiro pgmq
      pages and the keiro family / top index into the new section; run the full `pnpm run
      check` gate; fill Outcomes & Retrospective.


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

- **Two distinct things are both called "jitsurei".** The docs already use the phrase *"the
  jitsurei example"* for the small in-repo demo at `keiro/jitsurei/` (order fulfillment +
  incident escalation; documented in
  `content/docs/keiro/explanation/the-jitsurei-example.mdx`, referenced from ~113 content
  files). This plan documents a **different**, larger, standalone repository,
  `keiro-runtime-jitsurei` (two emergency-response microservices). To avoid confusion the new
  section refers to the app **literally as `keiro-runtime-jitsurei`** and never as just "the
  jitsurei example". See Decision Log.

- **The app is partially documented already.** `hospital-capacity`'s reservation work queue is
  *already* the worked example on the keiro PGMQ pages
  (`content/docs/keiro/reference/pgmq-jobs.mdx`,
  `content/docs/keiro/explanation/background-jobs-with-pgmq.mdx`,
  `content/docs/keiro/how-to/{declare-a-background-job,choose-a-job-run-cadence,version-a-job-payload,dead-letter-and-retry-jobs}.mdx`,
  `content/docs/keiro/cookbook/scheduled-job-drain.mdx`, and `content/docs/integrations/keiro-with-pgmq.mdx`).
  The new section must *cross-link to* these rather than restate them, and M6 adds inbound links
  from them back to the new walkthrough.

- **The app ships its own internal docs that are the primary source material.** Under
  `/Users/shinzui/Keikaku/bokuno/keiro-runtime-jitsurei/docs/` there are:
  `walkthroughs/runtime-feature-use.md`, `walkthroughs/evidence-map.md`, three scenario
  walkthroughs under `scenarios/` (`mass-casualty-transfer.md`, `hospital-divert-reroute.md`,
  `supply-shortage-escalation.md`) plus `scenarios/README.md` and `scenarios/transcripts/`,
  `contracts/` (message contracts + fixtures), `diagrams/keiki.md` (generated Keiki Mermaid),
  `type-safety/`, and `observability.md`. These are the **ground truth** for the prose — read
  them before transcribing source. There is **no `README.md`** at the app repo root.

- **`oxfmt --check` is not a clean gate for hand-authored MDX.** Per repo memory
  (`oxfmt-mdx-baseline-not-clean`), `oxfmt --check` already fails across the existing MDX tree;
  do **not** run `oxfmt --write` over the docs to "fix" it (it would reflow neighbors). Match
  the formatting style of neighboring `content/docs/keiro/walkthrough/**` pages by hand. The
  reliable gates for this work are `pnpm run typecheck`, `pnpm run lint:links`, and `pnpm run
  build`. (See Validation and Acceptance.)


## Decision Log

Record every decision made while working on the plan.

- Decision: Place the docs in a **new top-level section** `content/docs/example-app/` (a
  sibling of `keiro/`, `keiki/`, `shibuya/`, `pgmq/`, `integrations/`), not inside
  `content/docs/keiro/`.
  Rationale: `keiro-runtime-jitsurei` is a full-stack application that exercises the *whole*
  family (keiki + keiro + kiroku + shibuya + pgmq + Kafka + OpenTelemetry), so it reads more
  naturally as a peer of the per-library sections than as a sub-area of keiro. Chosen by the
  user from a three-way placement question on 2026-06-08.
  Date: 2026-06-08

- Decision: Refer to the application **literally as `keiro-runtime-jitsurei`** throughout the
  prose; introduce the repo name in the landing page and use it consistently. Do not call it
  "the jitsurei example" (that phrase is reserved for the in-repo `keiro/jitsurei/` demo).
  Rationale: avoids collision with ~113 existing content files that already use "the jitsurei
  example" for a different artifact. Chosen by the user from a naming question on 2026-06-08.
  Date: 2026-06-08

- Decision: The section's URL slug / directory is `example-app` while its **sidebar title** and
  prose name are `keiro-runtime-jitsurei`.
  Rationale: `example-app` is a short, stable URL base; the literal repo name is long and
  collides visually in a slug, but is the correct human-facing name (set via `meta.json`
  `title`). Reconciles the two user answers (top-level section preview showed `example-app/`;
  naming answer chose the literal repo name).
  Date: 2026-06-08

- Decision: Pin the docs to app commit `04420ed1734f6c7ee850de7e50ab11e7073b8bfd` (branch
  `master`, 2026-06-07, "chore(deps): drop now-unused direct shibuya-pgmq-adapter dep") via a
  new `docs/keiro-runtime-jitsurei-source-sync.md`, mirroring the existing
  `docs/keiro-source-sync.md` workflow.
  Rationale: the established convention in this repo is pinned-commit + diff-from-pointer
  updates; a standalone app source needs its own pointer file.
  Date: 2026-06-08

- Decision: Be honest about "under construction." The app's master plan (EP-9, *refactor service
  modules around aggregate vertical slices*) is partially complete; some horizontal composition
  modules (`Store.hs`, `CommandCli.hs`) still bundle multiple aggregates. The docs will note
  WIP areas with `<Callout type="info">` rather than implying everything is final.
  Rationale: the user explicitly described the app as "still under construction but already
  demonstrates how to use most of the keiro runtime."
  Date: 2026-06-08


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

(To be filled during and after implementation.)


## Context and Orientation

This section assumes no prior knowledge of either repository. Read it fully before editing.

### The two repositories

1. **This repo — `keiro-runtime-docs`** (working directory:
   `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`). A documentation site built with
   **Fumadocs** on **Vite** + **React**, authoring content in **MDX** (Markdown + JSX). Docs
   live under `content/docs/<section>/**`. Each directory has an optional `meta.json` that
   orders and titles its children in the sidebar. This is where all new files in this plan are
   created.

2. **The app — `keiro-runtime-jitsurei`** (read-only source at
   `/Users/shinzui/Keikaku/bokuno/keiro-runtime-jitsurei`). A Haskell monorepo with two
   service packages under `services/`:
   - `services/incident-command/` (package `incident-command`, modules `IncidentCommand.*`)
   - `services/hospital-capacity/` (package `hospital-capacity`, modules `HospitalCapacity.*`)
   plus `runtime/` (scenario runner infra), `scripts/`, `docs/` (internal source material —
   see Surprises), `process-compose.yaml` (local Postgres + Redpanda/Kafka + Jaeger),
   `justfile` (task recipes), `flake.nix` (Nix dev env), and a root `cabal.project`. Current
   `HEAD` = `04420ed`, branch `master`.

### Terms of art (define these for the reader in the prose, too)

- **Aggregate / transducer.** The app models each consistency boundary as a **Keiki
  transducer** — a typed state machine ("register file" of fields + guarded transitions) — that
  keiro hydrates from an event stream and steps with each command. Example:
  `IncidentCommand.Incident.Transducer` (the incident aggregate). Link concept to
  `/docs/keiro/explanation/the-keiro-stack#what-is-a-transducer` and
  `/docs/keiki/...`.
- **EventStream.** keiro's per-aggregate configuration (codec, stream naming, snapshot policy).
  Example: `IncidentCommand.Incident.EventStream`. Concept page:
  `/docs/keiro/reference/event-stream-and-stream`.
- **Command cycle / write path.** `runCommandWithProjections` hydrates the stream, transduces
  the command, appends events with optimistic concurrency, and runs inline projections in the
  same transaction. App example: `IncidentCommand.Incident.CommandProcessor`. Concept pages:
  `/docs/keiro/explanation/the-command-cycle`, `/docs/keiro/reference/command`.
- **Projection / read model.** SQL-backed query side. App example:
  `IncidentCommand.Incident.Projection` (incident dashboard). Concept:
  `/docs/keiro/explanation/projections-read-models-and-snapshots`, `/docs/keiro/reference/projection`.
- **Process manager (PM).** A long-lived reactor that watches events and emits commands/timers.
  App examples: `IncidentCommand.Escalation`, `HospitalCapacity.SurgeManager`. Concept:
  `/docs/keiro/explanation/process-managers-and-sagas`, `/docs/keiro/reference/process-manager`.
- **Durable timer.** Persisted scheduled wake-up driving a PM. App: `runDueEscalationTimer`.
  Concept: `/docs/keiro/explanation/durable-timers`, `/docs/keiro/reference/timers`.
- **Durable workflow / awakeable.** A journaled, replayable procedure with named steps that can
  *park* on an external signal (awakeable). App examples:
  `IncidentCommand.EvacuationWorkflow`, `HospitalCapacity.ReservationWorkflow`. Concept:
  `/docs/keiro/explanation/durable-execution`, `/docs/keiro/reference/durable-workflows`,
  `/docs/keiro/walkthrough/durable-execution/`.
- **Router.** Stateless content-based fan-out from events to commands. App:
  `IncidentCommand.ResourceRouter`, `HospitalCapacity.TransferNeedRouter`. Concept:
  `/docs/keiro/explanation/routers-and-content-based-dispatch`, `/docs/keiro/reference/router`.
- **Outbox / inbox.** Transactional outbound buffer + deduplicating inbound buffer for
  cross-service messages. App: `*/Integration/Outbox.hs`, `*/Integration/Inbox.hs`. Concept:
  `/docs/keiro/explanation/the-outbox-pattern`, `/docs/keiro/explanation/the-inbox-pattern`,
  `/docs/keiro/reference/outbox`, `/docs/keiro/reference/inbox`,
  `/docs/keiro/explanation/integration-events`.
- **Kafka transport.** Publishing outbox rows / consuming into the inbox via
  `shibuya-kafka-adapter`. App: `*/Integration/KafkaPublisher.hs`, `*/Integration/KafkaConsumer.hs`.
  Concept: `/docs/integrations/...`, `/docs/shibuya/...`.
- **PGMQ background job.** A typed Postgres-message-queue job with retry policy and a
  dead-letter queue, via `keiro-pgmq`. App: `HospitalCapacity.Reservation.WorkQueue`
  (`runJobOnce`, `JobCodec`, DLQ). Concept (already cites this app):
  `/docs/keiro/reference/pgmq-jobs`, `/docs/keiro/explanation/background-jobs-with-pgmq`,
  `/docs/pgmq/...`, `/docs/integrations/keiro-with-pgmq`.
- **TypeID.** Prefixed, sortable identifiers (`inc_…`, `hosp_…`) via `mmzk-typeid` +
  `typeid-hs`. App: `*/Identity.hs`.
- **Telemetry.** OpenTelemetry tracing (OTLP → Jaeger), with W3C `traceparent` propagated
  across Kafka and PGMQ so one trace spans both services. App: `*/Telemetry.hs`. Concept:
  `/docs/keiro/reference/telemetry`, `/docs/keiro/walkthrough/operations/`.

### Authoring conventions in this repo (match these exactly)

- **Frontmatter.** Every page begins with a YAML block with `title` and `description`:
  ```yaml
  ---
  title: "03 — The command cycle"
  description: "One sentence describing exactly what this page covers."
  ---
  ```
  Walkthrough/tour pages number their titles (`"00 — Start here"`, `"01 — …"`).
- **MDX components are auto-imported** (no `import` lines needed in MDX): `Callout`,
  `Card`/`Cards`, `Step`/`Steps`, `Tab`/`Tabs`, `Accordion`/`Accordions`, `TypeTable`, and
  `Mermaid` (registered in `src/components/mdx.tsx`).
- **Code blocks.** Use fenced blocks with a language tag. Bundled Shiki grammars are
  `haskell`, `nix`, `bash`, `json` (configured in `source.config.ts`); **`cabal` is not
  bundled** — tag cabal snippets as ```` ```text ````. Prefix transcribed Haskell with a
  one-line comment naming the source file, e.g. `-- services/incident-command/src/IncidentCommand/Incident/CommandProcessor.hs`.
  No twoslash, no line-number gutters; explain code in prose below the block.
- **Mermaid.** Either a ```` ```mermaid ```` fenced block or `<Mermaid>…</Mermaid>`; both render
  interactively (the `rehypeMermaid` step converts fenced blocks).
- **Cross-links.** Use **absolute** doc paths without the `.mdx` extension, e.g.
  `[the command cycle](/docs/keiro/explanation/the-command-cycle)`. Relative `../sibling`
  links are also used inside a tour. The link checker (`scripts/check-doc-links.mjs`) resolves
  `/docs/x/y` to `content/docs/x/y.mdx` **or** `content/docs/x/y/index.mdx` and **fails the
  build on any broken internal link** — so every link target must exist (create section
  `index.mdx` files so directory links resolve).
- **`meta.json`.** `{ "title": "…", "pages": ["index", "00-…", "01-…", …] }`. Pages not listed
  are hidden. Nested directories nest in the sidebar.

### Navigation today (top level)

`content/docs/meta.json` is currently:
```json
{
  "pages": ["index", "getting-started", "kiroku", "keiro", "keiki", "shibuya", "pgmq", "integrations"]
}
```
M1 inserts `"example-app"` into this `pages` array (placement decided in M1 — see Plan of Work).


## Plan of Work

The work is six milestones. Milestones M2–M5 are independent (different directories) and may be
done in any order after M1; M6 is last. Every milestone ends green on
`pnpm run typecheck && pnpm run lint:links && pnpm run build` (run from the repo root). Commit
at the end of each milestone (and more often within) with an `ExecPlan:` and `Intention:`
trailer (see Concrete Steps).

The complete target page tree (created across M1–M5):

```text
content/docs/example-app/
├── meta.json                                  # title "keiro-runtime-jitsurei"
├── index.mdx                                  # landing
├── overview/
│   ├── meta.json
│   ├── index.mdx
│   ├── 00-what-it-demonstrates.mdx
│   ├── 01-the-domain.mdx
│   ├── 02-architecture-and-boundaries.mdx
│   └── 03-runtime-feature-map.mdx
├── incident-command/
│   ├── meta.json
│   ├── index.mdx
│   ├── 00-start-here.mdx
│   ├── 01-aggregates-and-transducers.mdx
│   ├── 02-the-command-cycle.mdx
│   ├── 03-read-models-and-projections.mdx
│   ├── 04-routers.mdx
│   ├── 05-escalation-process-manager-and-timers.mdx
│   ├── 06-the-evacuation-workflow.mdx
│   └── 07-wiring-and-the-cli.mdx
├── hospital-capacity/
│   ├── meta.json
│   ├── index.mdx
│   ├── 00-start-here.mdx
│   ├── 01-aggregates-and-transducers.mdx
│   ├── 02-command-cycle-and-read-models.mdx
│   ├── 03-the-surge-process-manager.mdx
│   ├── 04-the-reservation-workflow.mdx
│   ├── 05-the-pgmq-reservation-work-queue.mdx
│   └── 06-wiring-and-the-cli.mdx
├── cross-service/
│   ├── meta.json
│   ├── index.mdx
│   ├── 00-the-message-flow.mdx
│   ├── 01-message-contracts.mdx
│   ├── 02-outbox-and-publishing.mdx
│   ├── 03-inbox-and-consuming.mdx
│   └── 04-telemetry-and-trace-continuity.mdx
└── running-it/
    ├── meta.json
    ├── index.mdx
    ├── 00-prerequisites-and-setup.mdx
    ├── 01-running-the-scenarios.mdx
    ├── 02-the-workers.mdx
    └── 03-observing-traces.mdx
```

And one pointer file outside `content/`:

```text
docs/keiro-runtime-jitsurei-source-sync.md
```

### Milestone 1 — Scaffold, navigation, source-sync pointer, landing + overview

**Scope.** Create the section skeleton, wire navigation, add the source-sync pointer, and write
the entry pages a reader meets first.

**What exists at the end.** The `example-app` section appears in the top-level sidebar with a
landing page and a four-page `overview/`. All directory links resolve (every directory has an
`index.mdx`). The pointer file pins app commit `04420ed`.

**Edits.**

1. **Register the section.** Edit `content/docs/meta.json` to add `"example-app"` to `pages`.
   Place it **after `"integrations"`** (end of the list) so the per-library sections keep their
   current order and the application section reads as a capstone:
   ```json
   { "pages": ["index", "getting-started", "kiroku", "keiro", "keiki", "shibuya", "pgmq", "integrations", "example-app"] }
   ```

2. **Section `meta.json`** — `content/docs/example-app/meta.json`:
   ```json
   {
     "title": "keiro-runtime-jitsurei",
     "pages": ["index", "overview", "incident-command", "hospital-capacity", "cross-service", "running-it"]
   }
   ```

3. **Per-subsection `meta.json`** for `overview/`, `incident-command/`, `hospital-capacity/`,
   `cross-service/`, `running-it/`. Create **all five now** (even though M2–M5 fill them later)
   so navigation is coherent and link-checks for `index` pages pass; list only the pages that
   exist after each milestone, OR list the full set now and create stub `index.mdx` for each
   directory in M1 so directory links resolve. **Chosen approach:** create all directory
   `index.mdx` files in M1 (short section intros) and create each subsection `meta.json` listing
   its final page set; the chapter bodies are filled in M2–M5. A `meta.json` may list a page
   that does not yet exist *only if* you also create that file the same milestone — so in M1,
   the `incident-command/meta.json` etc. should list **only `["index"]`** initially, and M2–M5
   extend those `pages` arrays as they add chapters. (This keeps each milestone independently
   building/link-clean.)

   M1's `overview/meta.json` (overview is fully written in M1):
   ```json
   {
     "title": "Overview",
     "pages": ["index", "00-what-it-demonstrates", "01-the-domain", "02-architecture-and-boundaries", "03-runtime-feature-map"]
   }
   ```
   M1's placeholder metas for the other three (extended in M2–M5):
   ```json
   { "title": "Incident Command", "pages": ["index"] }
   { "title": "Hospital Capacity", "pages": ["index"] }
   { "title": "Cross-service integration", "pages": ["index"] }
   { "title": "Running it", "pages": ["index"] }
   ```

4. **Landing page** — `content/docs/example-app/index.mdx`. Frontmatter title
   `"keiro-runtime-jitsurei"`. Content: one-paragraph statement of what the app is (the
   standalone emergency-response reference app), an explicit callout distinguishing it from the
   in-repo "jitsurei example" (link to `/docs/keiro/explanation/the-jitsurei-example`), a
   top-level architecture **Mermaid** diagram (two services + Kafka + PGMQ + Postgres + Jaeger),
   and a `<Cards>` grid linking to the five subsections. Add a `<Callout type="info">` noting
   the app is under active construction (vertical-slice refactor in progress) and that the docs
   are pinned to commit `04420ed`.

5. **`overview/index.mdx`** — short intro to the overview subsection + `<Cards>` to its four
   pages.

6. **`overview/00-what-it-demonstrates.mdx`** — the runtime-feature headline. Source material:
   app `docs/walkthroughs/runtime-feature-use.md` and `docs/walkthroughs/evidence-map.md`, plus
   `docs/scenarios/README.md`'s feature matrix. Present a table mapping each keiro feature →
   "demonstrated by" file(s) → link to the canonical keiro doc. This is the "why read this"
   page.

7. **`overview/01-the-domain.mdx`** — the emergency-response domain and ubiquitous language:
   the Incident Command aggregates (Incident, FieldResource, Triage), the Hospital Capacity
   aggregates (Hospital, Capacity, Reservation), the key enums (Severity, BedType, CapacityLevel,
   PatientAcuity, …) from `*/Domain/Types.hs`, and the TypeID prefixes from `*/Identity.hs`.
   Embed the generated Keiki state diagrams from app `docs/diagrams/keiki.md` (as `mermaid`
   blocks) where they illustrate an aggregate.

8. **`overview/02-architecture-and-boundaries.mdx`** — the two-service topology and *why they
   share no Haskell code*: each service owns its database, its event store (Kiroku), and its
   message contracts (`*/Integration/Contracts.hs`); they talk only over Kafka topics
   (`emergency.incident.events`, `emergency.hospital.events`) and Hospital Capacity's internal
   PGMQ queue. Mermaid sequence/flow diagram of the topology. Cross-link to
   `/docs/keiro/explanation/integration-events`.

9. **`overview/03-runtime-feature-map.mdx`** — the master index from feature → exact file/function
   in the app → the chapter in this section that covers it → the keiro reference page. This is
   the navigational spine of the whole section (every later chapter links back here).

10. **Source-sync pointer** — `docs/keiro-runtime-jitsurei-source-sync.md`. Mirror the structure
    of `docs/keiro-source-sync.md`: an "Upstream source" block (path
    `/Users/shinzui/Keikaku/bokuno/keiro-runtime-jitsurei`; note whether it is registered in
    `mori` — at plan time it is **not** in `mori registry list`, so reference it by path and
    say so), a "Last reviewed commit" block pinning
    `04420ed1734f6c7ee850de7e50ab11e7073b8bfd` (branch `master`, 2026-06-07), a list of the
    pages most coupled to the app source (this whole `example-app/` tree), and an "Update
    procedure" (diff `04420ed..HEAD` in the app repo; the app keeps its own `docs/plans` +
    `docs/masterplans` — read those for intent).

**Acceptance.** From repo root: `pnpm run typecheck && pnpm run lint:links && pnpm run build`
all pass. `pnpm dev` shows `keiro-runtime-jitsurei` in the sidebar with Overview expanded to
four pages; the landing diagram renders; all `<Cards>` links resolve.

### Milestone 2 — Incident Command walkthrough

**Scope.** A guided source tour of the `incident-command` service, one chapter per concern,
following the keiro `walkthrough/` house style (numbered chapters, real Haskell excerpts,
prose, Mermaid, links back to keiro reference pages).

**What exists at the end.** `incident-command/index.mdx` + `00-start-here.mdx` + 7 chapters;
`incident-command/meta.json` lists all of them.

**Chapters and their source grounding (read these files in the app before writing):**

- `00-start-here.mdx` — what the service is, the reading order, a `<Cards>` table of contents.
  Source: `services/incident-command/` layout, `app/IncidentCommandCli.hs`,
  `app/IncidentCommandWorker.hs`.
- `01-aggregates-and-transducers.mdx` — the three aggregates as Keiki transducers and their
  keiro EventStreams. Source: `Incident/Transducer.hs`, `Incident/EventStream.hs`,
  `FieldResource/Transducer.hs`, `FieldResource/EventStream.hs`, `Triage/Transducer.hs`,
  `Triage/EventStream.hs`. Embed the relevant Keiki diagrams from app `docs/diagrams/keiki.md`.
  Link: `/docs/keiro/reference/event-stream-and-stream`, `/docs/keiki/...`.
- `02-the-command-cycle.mdx` — `runIncidentCommandDurably` /
  `runIncidentCommandDurablyWithTelemetry` and `runCommandWithProjections`. Source:
  `Incident/CommandProcessor.hs` (+ FieldResource/Triage processors for contrast). Link:
  `/docs/keiro/explanation/the-command-cycle`, `/docs/keiro/reference/command`,
  `/docs/keiro/walkthrough/command-cycle/`.
- `03-read-models-and-projections.mdx` — the dashboard/evacuation-zone/triage/audit read models
  and inline-vs-async projection. Source: `Incident/Projection.hs`, `FieldResource/Projection.hs`,
  `Triage/Projection.hs`, `CommandAudit/Projection.hs`. Link:
  `/docs/keiro/explanation/projections-read-models-and-snapshots`, `/docs/keiro/reference/projection`,
  `/docs/keiro/reference/read-model`.
- `04-routers.mdx` — content-based fan-out. Source: `ResourceRouter.hs`,
  `CapacityChangeRouter.hs`. Link: `/docs/keiro/explanation/routers-and-content-based-dispatch`,
  `/docs/keiro/reference/router`, `/docs/keiro/cookbook/event-fan-out-with-routers`.
- `05-escalation-process-manager-and-timers.mdx` — the escalation PM and its durable timer
  worker. Source: `Escalation/Transducer.hs`, `Escalation.hs` (`runEscalationAfterIncidentDeclared`,
  `runDueEscalationTimer`). Link: `/docs/keiro/explanation/process-managers-and-sagas`,
  `/docs/keiro/explanation/durable-timers`, `/docs/keiro/reference/process-manager`,
  `/docs/keiro/reference/timers`. Note WIP per Decision Log.
- `06-the-evacuation-workflow.mdx` — the durable evacuation workflow with named steps and an
  awakeable awaiting hospital acknowledgement. Source: `EvacuationWorkflow.hs`. Link:
  `/docs/keiro/explanation/durable-execution`, `/docs/keiro/reference/durable-workflows`,
  `/docs/keiro/walkthrough/durable-execution/`. This chapter sets up the cross-service handoff
  detailed in `cross-service/`.
- `07-wiring-and-the-cli.mdx` — how it all composes: `Store.hs`
  (`withIncidentCommandStore`, the run* entrypoints), the CLI/worker executables, and
  `Scenario.hs`. Note the WIP horizontal-composition modules per Decision Log. Source:
  `Store.hs`, `app/IncidentCommandCli.hs`, `app/IncidentCommandWorker.hs`, `CommandCli.hs`,
  `WorkerCli.hs`, `Scenario.hs`, `Runtime.hs`, `Telemetry.hs`.

**Edit.** Extend `incident-command/meta.json` `pages` to:
`["index", "00-start-here", "01-aggregates-and-transducers", "02-the-command-cycle", "03-read-models-and-projections", "04-routers", "05-escalation-process-manager-and-timers", "06-the-evacuation-workflow", "07-wiring-and-the-cli"]`.

**Acceptance.** Typecheck + link-check + build green; each chapter has at least one real Haskell
excerpt (with a source-path comment) and at least one cross-link to a keiro reference page; the
chapter prose names real modules/functions verbatim.

### Milestone 3 — Hospital Capacity walkthrough

**Scope.** The mirror tour for `hospital-capacity`, plus the PGMQ chapter (the app's signature
background-job example).

**Chapters and source grounding:**

- `00-start-here.mdx` — service overview + TOC. Source: `services/hospital-capacity/`,
  `app/HospitalCapacityCli.hs`, `app/HospitalCapacityWorker.hs`.
- `01-aggregates-and-transducers.mdx` — Hospital, Capacity, Reservation transducers +
  EventStreams. Source: `Hospital/Transducer.hs`, `Hospital/EventStream.hs`,
  `Capacity/Transducer.hs`, `Capacity/EventStream.hs`, `Reservation/Transducer.hs`,
  `Reservation/EventStream.hs`. Embed Keiki diagrams.
- `02-command-cycle-and-read-models.mdx` — the three command processors + projections. Source:
  `Hospital/CommandProcessor.hs`, `Capacity/CommandProcessor.hs`, `Reservation/CommandProcessor.hs`,
  `Hospital/Projection.hs`, `Capacity/Projection.hs`, `Reservation/Projection.hs`.
- `03-the-surge-process-manager.mdx` — surge PM + supply-escalation timers. Source:
  `SurgeManager.hs`, `Surge/Transducer.hs`. Link to the same PM/timer keiro pages as M2.
- `04-the-reservation-workflow.mdx` — durable reservation workflow (hold → await confirmation →
  release). Source: `ReservationWorkflow.hs`. Link to the durable-execution keiro pages. This is
  the *receiving* end of the cross-service handoff begun by the evacuation workflow.
- `05-the-pgmq-reservation-work-queue.mdx` — the `keiro-pgmq` job: `ReservationWorkItem`,
  `JobCodec`, `RetryPolicy` (3 attempts, 5s delay), DLQ, `runJobOnce` one-shot drain, the
  store-failure→`Retry` / rejected→`Dead` mapping. Source: `Reservation/WorkQueue.hs`,
  `Integration/ReservationWorkDispatch.hs`. **Cross-link prominently** to the existing keiro
  pages that already use this exact example: `/docs/keiro/reference/pgmq-jobs`,
  `/docs/keiro/explanation/background-jobs-with-pgmq`,
  `/docs/keiro/how-to/dead-letter-and-retry-jobs`,
  `/docs/keiro/cookbook/scheduled-job-drain`, `/docs/integrations/keiro-with-pgmq`,
  `/docs/pgmq/...`. (M6 adds the inbound links from those pages back here.)
- `06-wiring-and-the-cli.mdx` — `Store.hs` (`withHospitalCapacityStore`, the PGMQ pool
  `withHospitalPgmqPool`), CLI/worker executables, `Scenario.hs`. Source: `Store.hs`,
  `app/HospitalCapacityCli.hs`, `app/HospitalCapacityWorker.hs`, `CommandCli.hs`,
  `WorkerCli.hs`, `Scenario.hs`, `Telemetry.hs`.

**Edit.** Extend `hospital-capacity/meta.json` `pages` to the full ordered list above.

**Acceptance.** Same bar as M2. The PGMQ chapter's cross-links to the existing keiro pgmq pages
all resolve.

### Milestone 4 — Cross-service integration

**Scope.** The payoff chapters: how the two services actually talk, end to end.

**Chapters and source grounding:**

- `index.mdx` — section intro + `<Cards>`.
- `00-the-message-flow.mdx` — **the headline end-to-end story**, told as one Mermaid sequence
  diagram + prose, following a critical patient from triage to confirmed bed: Triage command →
  `TransferNeedEmitted` to outbox → KafkaPublisher → `emergency.incident.events` → Hospital
  Capacity KafkaConsumer → inbox (dedupe) → `TransferNeedRouter` → PGMQ reservation work →
  ReservationWorkflow `HoldReservation` → confirmation → Hospital outbox → KafkaPublisher →
  `emergency.hospital.events` → Incident Command inbox → `signalAwakeable` resuming the
  EvacuationWorkflow. Source: app `docs/scenarios/mass-casualty-transfer.md` (the canonical
  narrative) + the Integration modules of both services.
- `01-message-contracts.mdx` — `IntegrationMessage` schema (v1), idempotency keys, trace-parent
  headers, topic routing, and *why the contract types are duplicated per service rather than
  shared*. Source: `IncidentCommand/Integration/Contracts.hs`,
  `HospitalCapacity/Integration/Contracts.hs`, and app `docs/contracts/`. Link:
  `/docs/keiro/reference/integration-event`, `/docs/keiro/explanation/integration-events`.
- `02-outbox-and-publishing.mdx` — enqueue-in-transaction + claim-and-publish. Source:
  `*/Integration/Outbox.hs`, `*/Integration/KafkaPublisher.hs`. Link:
  `/docs/keiro/explanation/the-outbox-pattern`, `/docs/keiro/reference/outbox`,
  `/docs/integrations/...` (shibuya kafka).
- `03-inbox-and-consuming.mdx` — consume → dedupe → store → dispatch. Source:
  `*/Integration/Inbox.hs`, `*/Integration/KafkaConsumer.hs`. Link:
  `/docs/keiro/explanation/the-inbox-pattern`, `/docs/keiro/reference/inbox`.
- `04-telemetry-and-trace-continuity.mdx` — how one trace spans both services: OTLP setup, the
  `traceparent` header carried through Kafka and PGMQ, `withApplicationSpan`. Source:
  `*/Telemetry.hs`, app `docs/observability.md`. Link: `/docs/keiro/reference/telemetry`,
  `/docs/keiro/walkthrough/operations/`.

**Edit.** Create `cross-service/meta.json` `pages`:
`["index", "00-the-message-flow", "01-message-contracts", "02-outbox-and-publishing", "03-inbox-and-consuming", "04-telemetry-and-trace-continuity"]`.

**Acceptance.** Same bar; the `00-the-message-flow` sequence diagram renders; every contract /
outbox / inbox / telemetry claim is grounded in a named module or app doc.

### Milestone 5 — Running it

**Scope.** Make the app runnable by a reader: setup, scenarios, workers, traces.

**Chapters and source grounding (read the `justfile`, `process-compose.yaml`,
`runtime/scenarios/run-scenario.sh`, and app `docs/scenarios/*` before writing):**

- `index.mdx` — intro + `<Cards>` + a `<Callout type="warn">` that scenario `--reset` drops the
  dev databases (never point it at non-dev connection strings — quoting `docs/scenarios/README.md`).
- `00-prerequisites-and-setup.mdx` — Nix/flake dev shell, `just dev-up` (Postgres + Redpanda +
  Jaeger via `process-compose.yaml`), `just create-databases`, `just migrate-all` (Kiroku +
  Keiro + TypeID + service SQL), `just build-all`. Use `<Steps>`.
- `01-running-the-scenarios.mdx` — `just scenario-list`; the three scenarios
  (`mass-casualty-transfer`, `hospital-divert-reroute`, `supply-shortage-escalation`) with
  `--trace`/`--reset`; show an expected transcript excerpt from
  `docs/scenarios/transcripts/`. Map each scenario to the chapters that explain it.
- `02-the-workers.mdx` — the per-service worker subcommands: projections (once/rebuild), timers
  once, inbox consume, outbox enqueue/publish, and (hospital) reservation-work setup/enqueue/
  consume. Source: `WorkerCli.hs` of both services + `app/*Worker.hs`. Link to the relevant
  walkthrough chapters and to `/docs/keiro/explanation/scaling-the-workers`.
- `03-observing-traces.mdx` — open Jaeger (`http://127.0.0.1:16686`), find the cross-service
  trace, `just verify-traces` / `just verify-example`. Source: `scripts/` verify tooling, app
  `docs/observability.md`. Cross-link to `cross-service/04-telemetry-and-trace-continuity`.

**Edit.** Create `running-it/meta.json` `pages`:
`["index", "00-prerequisites-and-setup", "01-running-the-scenarios", "02-the-workers", "03-observing-traces"]`.

**Acceptance.** Same bar; every `just`/script command shown is a real recipe (cross-checked
against the app `justfile`); commands are shown with a working directory and (where output
exists) a short expected transcript.

### Milestone 6 — Cross-links + finalization

**Scope.** Wire the new section into the rest of the docs and run the full gate.

**Edits.**

1. **Inbound links from existing pgmq pages.** Add a short "Seen in a real service" link from
   `content/docs/keiro/reference/pgmq-jobs.mdx`,
   `content/docs/keiro/explanation/background-jobs-with-pgmq.mdx`,
   `content/docs/keiro/how-to/dead-letter-and-retry-jobs.mdx`,
   `content/docs/keiro/cookbook/scheduled-job-drain.mdx`, and
   `content/docs/integrations/keiro-with-pgmq.mdx` to
   `/docs/example-app/hospital-capacity/05-the-pgmq-reservation-work-queue`. Keep edits minimal
   (one sentence / one `<Callout>` each) and match neighbor style — do **not** reflow the files.
2. **Discoverability from the top.** Add a `<Card>` to `content/docs/getting-started/the-keiro-family.mdx`
   (and/or the top-level `content/docs/index.mdx`) pointing to `/docs/example-app`, framed as
   "see the whole family working together."
3. **Source-sync cross-reference.** In `docs/keiro-source-sync.md`, where it already mentions
   `keiro-runtime-jitsurei` (the EP-3 hospital-capacity consumer migration note), add a pointer
   to the new `docs/keiro-runtime-jitsurei-source-sync.md`.
4. **Full gate.** Run `pnpm run check` (typecheck → lint → format:check → build → lint:links).
   Expect `format:check` (oxfmt) to report pre-existing failures across the MDX tree (see
   Surprises / repo memory) — that is the baseline, not a regression caused by this work; the
   binding gates are typecheck, lint:links, and build. Record the exact `format:check` outcome
   in Outcomes so the baseline is documented.
5. Fill in **Outcomes & Retrospective**; flip all Progress boxes.

**Acceptance.** `pnpm run typecheck`, `pnpm run lint:links`, `pnpm run build` all pass. The new
section is reachable from the family/top page and from the pgmq pages. `git log` shows one
commit per milestone (or finer), each with `ExecPlan:` + `Intention:` trailers.


## Concrete Steps

All commands run from the docs repo root unless noted:
`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`.

**0. Confirm the app pin before transcribing source.**
```bash
git -C /Users/shinzui/Keikaku/bokuno/keiro-runtime-jitsurei rev-parse HEAD
# expect: 04420ed1734f6c7ee850de7e50ab11e7073b8bfd
```
If `HEAD` differs, update the pointer file and the Decision Log, and transcribe against the
actual `HEAD`.

**1. Read the app's own source material first (per milestone).** For example, before M4:
```bash
APP=/Users/shinzui/Keikaku/bokuno/keiro-runtime-jitsurei
ls "$APP/docs/scenarios" "$APP/docs/contracts"
# read: $APP/docs/scenarios/mass-casualty-transfer.md, $APP/docs/walkthroughs/evidence-map.md
```
Then read the named source modules under `$APP/services/*/src/**` for that milestone (paths are
listed per chapter in Plan of Work).

**2. Create files.** Author each `.mdx` / `meta.json` with the Write tool. Keep code fences
language-tagged (`haskell`, `bash`, `json`, `text`; `mermaid` for diagrams). Prefix each
transcribed Haskell block with a `-- services/.../X.hs` comment naming the source file.

**3. Validate after each milestone** (fast inner loop):
```bash
pnpm run typecheck     # fumadocs-mdx regen + tsc --noEmit
pnpm run lint:links    # node scripts/check-doc-links.mjs + linkinator (build must exist for linkinator; see note)
pnpm run build         # vite build -> .output/public
```
Note: `lint:links` runs `linkinator` over `.output/public`, so run `pnpm run build` first (or
just run `node scripts/check-doc-links.mjs` for the source-level internal-link check during the
inner loop, and the full `pnpm run lint:links` after a build).

**4. Preview visually** when a diagram or layout needs checking:
```bash
pnpm dev   # then open the printed localhost URL and navigate to /docs/example-app
```

**5. Commit per milestone** (commit directly to `master` — no feature branch, per repo
convention). Example for M1:
```bash
git add content/docs/example-app docs/keiro-runtime-jitsurei-source-sync.md content/docs/meta.json
git commit -m "$(cat <<'EOF'
docs(example-app): scaffold keiro-runtime-jitsurei section + overview

Add the new top-level example-app docs section: navigation wiring, the
landing page, the four overview pages, and the source-sync pointer pinned
at app commit 04420ed.

ExecPlan: docs/plans/28-document-the-keiro-runtime-jitsurei-example-application.md
Intention: intention_01ksx5mf7qe2ht659e4kr9w2t0
EOF
)"
```
Subsequent milestone commits use scopes like `docs(example-app)` /
`docs(example-app): incident command walkthrough`, etc., always with both trailers.

**6. Final gate (M6).**
```bash
pnpm run check    # typecheck && lint && format:check && build && lint:links
```
Record the `format:check` result (expected pre-existing oxfmt MDX failures) in Outcomes.


## Validation and Acceptance

Acceptance is behavioral and link-exact, not "it compiled."

1. **Navigation.** After M1, `pnpm dev` → the left sidebar shows a top-level
   **`keiro-runtime-jitsurei`** entry (title from `meta.json`) at the end of the family list,
   expanding to Overview / Incident Command / Hospital Capacity / Cross-service integration /
   Running it. As M2–M5 land, each subsection expands to its chapters in the declared order.
2. **Internal links resolve.** `node scripts/check-doc-links.mjs` exits 0 — every
   `/docs/example-app/...` and every cross-link to `/docs/keiro/...`, `/docs/keiki/...`,
   `/docs/pgmq/...`, `/docs/integrations/...` resolves to an existing `*.mdx` or `*/index.mdx`.
   This is the single most important gate (a typo in a doc path fails the build).
3. **Build.** `pnpm run build` produces `.output/public` with each new page; `pnpm run
   lint:links` (linkinator over the built site) finds no broken links.
4. **Types.** `pnpm run typecheck` passes (MDX frontmatter parses; no MDX/JSX syntax errors —
   e.g. unescaped `<`/`{` in prose, unclosed components).
5. **Rendering (manual).** On the dev server: Haskell code blocks are syntax-highlighted;
   Mermaid diagrams render and are pan/zoom interactive; `<Callout>`, `<Cards>`, `<Steps>`,
   `<Tabs>` render. Spot-check the M1 architecture diagram and the M4 message-flow sequence
   diagram.
6. **Source fidelity.** Every Haskell excerpt carries a `-- services/.../File.hs` source
   comment and matches the file at commit `04420ed`. Every "the app does X" claim names a real
   module/function (cross-check against the app source and its `docs/walkthroughs/evidence-map.md`).
7. **Content completeness.** Each walkthrough chapter has ≥1 real code excerpt, ≥1 cross-link to
   a canonical keiro doc, and (where it illustrates state) ≥1 diagram. `running-it/` commands are
   all real `just`/script recipes.

**Known non-gate:** `pnpm run format:check` (oxfmt) fails on the pre-existing MDX baseline (repo
memory `oxfmt-mdx-baseline-not-clean`). Do not reformat existing files to chase it; match
neighbor style by hand. Document the baseline outcome rather than treating it as a regression.


## Idempotence and Recovery

- **Re-runnable.** All steps are additive file creation plus a few small, surgical edits to
  existing files (`content/docs/meta.json`, the five pgmq/family pages in M6, the keiro
  source-sync note). Re-running a milestone overwrites the same new files; re-applying a
  `meta.json` edit is safe (idempotent JSON).
- **Recovery from a broken link gate.** `node scripts/check-doc-links.mjs` prints the offending
  file + target; fix the path or create the missing `index.mdx`. Because every directory link
  needs a resolvable target, always create a directory's `index.mdx` in the same milestone you
  first link to it.
- **Per-milestone safety.** Each milestone leaves the tree building green; if a milestone is
  interrupted, the partially-written subsection's `meta.json` should list only the pages that
  exist (so navigation + link-check stay clean). Split a half-written chapter into a "done"
  page and a follow-up Progress item rather than committing a page that links to a not-yet-created
  sibling.
- **Pointer drift.** If the app `HEAD` advances mid-work, finish transcribing against the pinned
  `04420ed` for consistency, then optionally re-pin at the end and note the range in the
  source-sync file's "Update procedure" style.


## Interfaces and Dependencies

This is a documentation change; the "interfaces" are the docs-site contracts and the app source
surface the prose must faithfully describe.

**Docs-site contracts (must hold at the end of each milestone):**

- `content/docs/meta.json` — top-level `pages` includes `"example-app"`.
- `content/docs/example-app/meta.json` — `title: "keiro-runtime-jitsurei"`, `pages` lists exactly
  the subsections that exist.
- Each subsection `meta.json` — `pages` lists exactly the `.mdx` files that exist in that
  directory (no dangling entries; no orphan files).
- Every directory referenced by a link has an `index.mdx`.
- Frontmatter on every page: `title` (string) + `description` (string).
- MDX components used (`Callout`, `Cards`/`Card`, `Steps`/`Step`, `Tabs`/`Tab`, `Mermaid`,
  `TypeTable`) are the globally-registered set from `src/components/mdx.tsx` — no `import` lines.
- Code fences: language ∈ {`haskell`, `nix`, `bash`, `json`, `text`, `mermaid`}; cabal snippets
  use `text` (cabal grammar is not bundled).
- Link checker: `scripts/check-doc-links.mjs` resolves `/docs/...` to `content/docs/....mdx` or
  `content/docs/.../index.mdx`; externals/anchors are skipped.

**New artifact:** `docs/keiro-runtime-jitsurei-source-sync.md` — the pinned-commit pointer
(`04420ed`) and update procedure, modeled on `docs/keiro-source-sync.md`.

**App source surface the prose describes** (read-only; package `incident-command` modules
`IncidentCommand.*`, package `hospital-capacity` modules `HospitalCapacity.*`), grouped by the
runtime feature each demonstrates:

| Runtime feature | Incident Command | Hospital Capacity | Canonical keiro doc |
|---|---|---|---|
| Aggregate / transducer + EventStream | `Incident/`, `FieldResource/`, `Triage/` `{Transducer,EventStream}.hs` | `Hospital/`, `Capacity/`, `Reservation/` `{Transducer,EventStream}.hs` | `/docs/keiro/reference/event-stream-and-stream` |
| Command cycle (write path) | `*/CommandProcessor.hs` (`runCommandWithProjections`) | `*/CommandProcessor.hs` | `/docs/keiro/reference/command`, `/docs/keiro/explanation/the-command-cycle` |
| Read models / projections | `*/Projection.hs`, `CommandAudit/Projection.hs` | `*/Projection.hs` | `/docs/keiro/reference/projection`, `/docs/keiro/reference/read-model` |
| Routers | `ResourceRouter.hs`, `CapacityChangeRouter.hs` | `TransferNeedRouter.hs` | `/docs/keiro/reference/router` |
| Process manager + timers | `Escalation.hs`, `Escalation/Transducer.hs` (`runDueEscalationTimer`) | `SurgeManager.hs`, `Surge/Transducer.hs` | `/docs/keiro/reference/process-manager`, `/docs/keiro/reference/timers` |
| Durable workflow + awakeable | `EvacuationWorkflow.hs` | `ReservationWorkflow.hs` | `/docs/keiro/reference/durable-workflows` |
| Outbox / inbox | `Integration/{Outbox,Inbox}.hs` | `Integration/{Outbox,Inbox}.hs` | `/docs/keiro/reference/outbox`, `/docs/keiro/reference/inbox` |
| Kafka transport (shibuya) | `Integration/{KafkaPublisher,KafkaConsumer}.hs` | `Integration/{KafkaPublisher,KafkaConsumer}.hs` | `/docs/integrations/...`, `/docs/shibuya/...` |
| Message contracts | `Integration/Contracts.hs` | `Integration/Contracts.hs` | `/docs/keiro/reference/integration-event` |
| PGMQ background job | — | `Reservation/WorkQueue.hs`, `Integration/ReservationWorkDispatch.hs` | `/docs/keiro/reference/pgmq-jobs`, `/docs/integrations/keiro-with-pgmq` |
| TypeID | `Identity.hs` | `Identity.hs` | (mmzk-typeid / typeid-hs) |
| Telemetry (OTel) | `Telemetry.hs` | `Telemetry.hs` | `/docs/keiro/reference/telemetry` |
| Wiring / CLI / scenarios | `Store.hs`, `app/IncidentCommand{Cli,Worker}.hs`, `Scenario.hs` | `Store.hs`, `app/HospitalCapacity{Cli,Worker}.hs`, `Scenario.hs` | `/docs/keiro/explanation/scaling-the-workers` |

**App run surface** (described in `running-it/`, cross-checked against the app `justfile` /
`process-compose.yaml` / `runtime/scenarios/run-scenario.sh`): `just dev-up`/`dev-down`,
`just create-databases`, `just migrate-all`, `just build-all`, `just test-all`,
`just scenario-list`, `just scenario <name> --trace`, `just run-workers`, `just kafka-topics`,
`just verify-traces`, `just verify-example`; Jaeger UI at `http://127.0.0.1:16686`. The three
scenarios: `mass-casualty-transfer`, `hospital-divert-reroute`, `supply-shortage-escalation`.

**Build/validate dependencies** (already installed in this repo): `fumadocs-mdx`, `tsc`,
`oxlint`, `oxfmt`, `vite`, `linkinator`, and `scripts/check-doc-links.mjs`. No new dependency is
added by this plan.
