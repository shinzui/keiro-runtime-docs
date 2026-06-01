---
id: 12
slug: keiro-operations-faq-cookbook-and-docs-finalization
title: "Keiro operations, FAQ, cookbook, and docs finalization"
kind: exec-plan
created_at: 2026-06-01T17:36:29Z
master_plan: "docs/masterplans/2-keiro-framework-documentation-set.md"
intention: intention_01ksx5mf7qe2ht659e4kr9w2t0
---

# Keiro operations, FAQ, cookbook, and docs finalization

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

**keiro** is a Haskell *library you import* (not a server you run) that composes three lower
libraries into an event-sourcing and workflow framework: **kiroku** (an append-only
PostgreSQL event store), **keiki** (a pure finite-state transducer that is the decision
core), and **shibuya** (a supervised subscription/worker substrate). Its documentation lives
under `content/docs/keiro/` in this repository's documentation site (a **fumadocs** +
**TanStack Start** static single-page app — "SPA", a website whose pages render in the
browser via JavaScript rather than being served as finished HTML).

This plan is the **last** of six child plans under the master plan
`docs/masterplans/2-keiro-framework-documentation-set.md`. After this plan a reader who lands
on `/docs/keiro` can:

- follow three **operations** how-tos and look up their reference: how to **enable
  OpenTelemetry** (configure a `Tracer` and thread it into the publisher/command surfaces so
  keiro emits distributed-tracing spans), how to **run the database migrations** (the
  `keiro-migrate` command-line tool and how to compose keiro's SQL with a service's own), and
  how to **write tests with the Postgres fixture** (`Keiro.Test.Postgres`, a per-test isolated
  database cloned from one migrated template);
- read two **reference** pages — the telemetry span helpers and the migrations/schema surface
  — that state the exact Haskell names and the PostgreSQL tables keiro owns;
- copy two **cookbook** recipes (idempotent fan-out; a timeout saga);
- get quick answers from a real **FAQ** (is keiro a server or a library? how does it relate to
  kiroku/keiki/shibuya? does it ship durable workflows? Postgres-only? how do I get
  exactly-once with Kafka?); and
- navigate the **whole** keiro tree with every section landing showing a `<Cards>` index
  (no "coming soon" placeholders) and every sidebar section in a sensible reading order.

You can see it working by running the docs site from the repo root
`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`: `pnpm build` exits 0 and prerenders every
keiro page with **zero** crawler warnings; `pnpm lint:links` reports no broken internal links;
and browsing `http://localhost:3000/docs/keiro` (via `pnpm dev`, or `pnpm build && pnpm start`)
shows the keiro tree with the operations pages, the FAQ rendering as expandable accordions, and
every section index showing cards.

This plan has two kinds of work. The **original-content** milestones (operations how-tos,
reference, cookbook, FAQ) can be done as soon as the foundation plan EP-7 is Complete. The
**finalization** milestone — ordering every `meta.json`, replacing every "coming soon" landing
with `<Cards>`, and running the whole-tree build + link-check gate — must run **last**, after
the four subsystem plans (EP-8, EP-9, EP-10, EP-11) are Complete, because it touches and
verifies pages those plans create.

This plan documents keiro **as shipped at the pinned upstream commit `3f5dc9c`** (keiro
`0.1.0.0`). The planned v2 durable-execution workflow engine (`Keiro.Workflow`, named steps)
does **not** exist in the source and is presented only as a clearly labelled roadmap in the FAQ.


## Progress

Use a checklist to summarize granular steps. Every stopping point must be documented here,
even if it requires splitting a partially completed task into two ("done" vs. "remaining").
This section must always reflect the actual current state of the work.

- [x] M0. Preconditions verified — Node 22.22.3 + pnpm 11.4.0 on PATH, `node_modules` present, EP-7
      Complete (the `content/docs/keiro/` tree, `docs/keiro-source-sync.md`, and the
      getting-started/overview pages exist), baseline `pnpm typecheck` and `pnpm build` clean
      (zero crawler warnings). _(2026-06-01)_
- [x] M1. Telemetry pages authored — `how-to/enable-opentelemetry.mdx` and
      `reference/telemetry.mdx`; their slugs appended to the how-to and reference `meta.json`.
      All names cross-checked against `Keiro/Telemetry.hs`; build clean. _(2026-06-01)_
- [x] M2. Migrations pages authored — `how-to/run-migrations.mdx` and
      `reference/migrations-and-schema.mdx`; slugs appended. Names + five tables cross-checked
      against `Migrations.hs`/`app/Main.hs`/the three SQL files; build clean. _(2026-06-01)_
- [x] M3. Testing how-to authored — `how-to/test-with-the-postgres-fixture.mdx`; slug appended.
      `withMigratedSuite`/`withFreshStore`/`withFreshStores2`/`Fixture` verified; build clean. _(2026-06-01)_
- [x] M4. Cookbook recipes authored — `cookbook/idempotent-fan-out.mdx` and
      `cookbook/timeout-saga.mdx`; slugs appended. `deterministicCommandId`/`eventAlreadyIn`/
      `DuplicateEvent`/`TimerRequest`/`runTimerWorker` verified in source; build clean. _(2026-06-01)_
- [x] M5. FAQ authored — `faq.mdx` stub overwritten with real `<Accordions>` Q&A (library vs server,
      the kiroku/keiki/shibuya family, process managers + timers today / named-step durable execution
      is roadmap, Postgres-only, at-least-once + inbox dedupe). "coming soon" callout gone. _(2026-06-01)_
- [ ] M6. FINALIZATION (runs LAST — precondition: EP-8/9/10/11 Complete). Every section
      `meta.json` ordered; every section landing's "coming soon" callout replaced with
      `<Cards>`; `docs/keiro-source-sync.md` "most-coupled pages" updated; whole-tree gate
      green (`pnpm typecheck`, `pnpm build` zero crawler warnings, `pnpm lint:links`, search
      index, snippet cross-check vs `3f5dc9c`).


## Surprises & Discoveries

Document unexpected behaviors, bugs, optimizations, or insights discovered during
implementation. Provide concise evidence.

(None yet.)


## Decision Log

Record every decision made while working on the plan.

- Decision: Document keiro **as shipped at the pinned commit `3f5dc9c` (keiro 0.1.0.0)**.
  Every Haskell name in a snippet must exist in the keiro source tree at that commit
  (`/Users/shinzui/Keikaku/bokuno/keiro`); the in-repo `docs/research/*` notes predate the
  code and must be treated as rationale/history, not as API.
  Rationale: self-containment and accuracy — a snippet that names a non-existent function would
  not compile and would mislead every downstream reader.
  Date: 2026-06-01
- Decision: EP-12 owns the **cookbook**, the **FAQ**, the cross-cutting **operations** docs
  (telemetry, migrations, testing), and the **final information-architecture pass** (ordering
  every section `meta.json` and replacing every "coming soon" landing with `<Cards>`). It does
  **not** own any subsystem page; those belong to EP-8/9/10/11.
  Rationale: the master plan's Decomposition Strategy assigns the two cross-cutting concerns
  (introduction and operations) plus the final reconciliation to the bookend plans EP-7 and
  EP-12; EP-12 is the reconciliation bookend.
  Date: 2026-06-01
- Decision: keiro's **v2 durable-execution workflow engine** (named-step workflows,
  `Keiro.Workflow`, a `keiro_workflow_steps` table) is presented in the FAQ **only as a
  clearly labelled roadmap**. The shipped capability today is process managers plus durable
  **timers** (`keiro_timers`), and that is what the FAQ states keiro can do now.
  Rationale: those names do not exist at `3f5dc9c`; presenting them as shipped would make the
  docs wrong. Confirmed: there is no `Keiro/Workflow.hs` and no `keiro_workflow_steps` table in
  the three migration SQL files.
  Date: 2026-06-01
- Decision: The **finalization** milestone (M6) runs **after Phase 2** — i.e. after EP-8, EP-9,
  EP-10, and EP-11 are Complete — and treats their pages as read-only inputs: M6 may **reorder**
  another plan's slugs within a section `meta.json` into a sensible reading order, but must
  **never delete or rename** another plan's pages. The original-content milestones (M1–M5) only
  depend on EP-7 and may proceed as soon as EP-7 is Complete.
  Rationale: the master plan's Dependency Graph marks EP-12 as hard-dep on EP-7 and
  *integration*-dep on EP-8–EP-11; the whole-tree ordering and link-check require every Phase-2
  page to be present, but the operations/FAQ/cookbook content does not.
  Date: 2026-06-01
- Decision: Append-then-order. Each original-content milestone **appends** its own page slugs to
  the relevant section `meta.json` (never reordering siblings); the full cross-section ordering
  pass happens once, in M6.
  Rationale: this mirrors the master plan's Integration Point #1 ("each plan appends only its own
  page slugs; EP-12 owns the final ordering pass") and avoids merge churn while Phase-2 plans run
  in parallel.
  Date: 2026-06-01
- Decision: Author MDX **without `import` lines** for `Callout`/`Cards`/`Card`/`Steps`/`Tabs`/
  `TypeTable`/`Accordions`/`Accordion`. They are registered globally in
  `src/components/mdx.tsx` via `getMDXComponents` (verified: lines 1–6 import them and lines
  27–36 spread them into the component map), and every existing keiro/kiroku page uses them bare.
  Rationale: matches the established house style and avoids duplicate-import drift.
  Date: 2026-06-01
- Decision: All cross-page links use **absolute** doc paths (`/docs/keiro/...`), never relative
  `./` or `../`.
  Rationale: relative MDX links resolve wrong in the static SPA and trip the prerender crawler —
  a hard-won kiroku lesson recorded in `docs/plans/5`'s Surprises & Discoveries; the
  `pnpm lint:links` gate (`scripts/check-doc-links.mjs`) treats an absolute non-`/docs` internal
  link as broken and resolves relative links against the file directory.
  Date: 2026-06-01


## Outcomes & Retrospective

Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
Compare the result against the original purpose.

(To be filled during and after implementation. Compare against Purpose: the operations how-tos
and reference, two cookbook recipes, a real FAQ, and a finalized IA where every keiro section
landing carries `<Cards>` and the whole tree builds and link-checks with zero crawler warnings.)


## Context and Orientation

Read this whole section before editing. It is written so that a novice with only this file and
the working tree can complete the work.

### Where you are working

You author MDX content files under `content/docs/keiro/` in **this** repository,
`/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`. The site is a **fumadocs** documentation
app (fumadocs-ui 16.9.3, fumadocs-mdx 15.0.10) built on **TanStack Start as a static SPA**
(React 19 + Vite, TypeScript), built and served with **pnpm** on **Node 22** inside the Nix dev
shell (`nix develop`). `pnpm dev` runs `vite dev`; `pnpm build` runs `vite build` and emits a
static SPA under `.output/public`; `pnpm start` serves it.

Each directory under `content/docs/` has a `meta.json` whose `pages` array lists the child page
slugs (a *slug* is the filename without its `.mdx` extension, or a subdirectory name) **in
sidebar display order**. A page is an `.mdx` file: YAML frontmatter (`title`, `description`)
then an MDX body. Subject code samples are **Haskell** (the site is TypeScript; the documented
library is Haskell). Every fenced code block must carry a language tag — `haskell`, `bash`,
`sql`, `json`, `text`, or `mermaid`. A bare ```` ``` ```` is not allowed.

The MDX components you will use — `Callout`, `Cards`, `Card`, `Steps`, `Tabs`, `TypeTable`,
`Accordions`, `Accordion` — are **registered globally** in `src/components/mdx.tsx`, so use them
**without** an `import` line (verified by reading that file).

### The build and link-check gate (read `package.json` scripts and `scripts/check-doc-links.mjs`)

These commands, run from the repo root, are the gate this plan must pass. They are defined in
`package.json`:

- `pnpm typecheck` runs `fumadocs-mdx && tsc --noEmit`. The `fumadocs-mdx` step regenerates the
  `.source/` collection so newly added pages are picked up; `tsc --noEmit` type-checks the app.
  Expected tail: no errors (a silent exit, or a final `tsc` line with no diagnostics).
- `pnpm build` runs `vite build`. It prerenders every doc route. Success ends with a Vite
  `built in <N>s` line and writes `.output/public`. **Failure modes to watch:** a line containing
  `[unhandledRejection]` or `Failed to fetch` means a page links to a route that does not exist
  (the kiroku precedent: relative `./` links produce exactly these crawler warnings). Zero such
  lines is an acceptance criterion.
- `pnpm lint:links` runs `node scripts/check-doc-links.mjs && linkinator .output/public ...`.
  The first script (read it: `scripts/check-doc-links.mjs`) scans every `content/docs/**/*.mdx`
  for internal links and fails (exit 1, printing `✗ N broken internal doc link(s)`) if any points
  at a page that does not exist on disk; on success it prints
  `✓ doc links OK — checked <N> files, no broken internal links.`. It treats a link beginning
  `/docs` by resolving `<path>.mdx` or `<path>/index.mdx` under `content/docs`, treats any other
  absolute (`/...`) internal link as **broken**, and resolves relative links against the file's
  own directory. The `linkinator` step then crawls the built SPA. Because the SPA's prerendered
  HTML has zero static `<a>` tags (the script's own header comment explains this), the source
  scan is the meaningful check for in-content links.
- `pnpm check` runs the full chain: `typecheck`, `lint` (oxlint), `format:check` (oxfmt), `build`,
  then `lint:links`. You may run the whole chain or the individual steps.

The `_templates/` directory is skipped by the link checker (its placeholder links like
`./00-start-here` are not real pages), so never put real content there.

### The page templates (copy these shapes)

Copy the matching template from `content/docs/_templates/` for each page type and fill it in:

- `content/docs/_templates/how-to.mdx` — task-oriented; assumes the basics; one goal per page.
- `content/docs/_templates/reference.mdx` — dry, exhaustive; one subsection per item;
  `<TypeTable>` for record fields.
- `content/docs/_templates/cookbook-recipe.mdx` — Problem → Solution (one-screen `haskell`
  snippet) → How it works; carries the `<Callout type="info">` defining "jitsurei".
- `content/docs/_templates/faq.mdx` — `<Accordions>` wrapping one `<Accordion title="...">` per
  question.

### The source of truth (NEVER search `/nix/store` or `/`)

The keiro source is on disk at `/Users/shinzui/Keikaku/bokuno/keiro`, pinned at commit
`3f5dc9c` (`git -C /Users/shinzui/Keikaku/bokuno/keiro rev-parse HEAD` →
`3f5dc9c1fa90f6358cebb9e85d92dde4c325db48`). Open it read-only to cross-check names; do not edit
it. The `docs/keiro-source-sync.md` pointer in **this** repo (created by EP-7) records that
commit and a "most-coupled pages" list; M6 updates that list. (If `docs/keiro-source-sync.md`
does not exist, EP-7 has not landed — stop; this is a hard dependency.)

The four subsystems below were verified by reading the named files at `3f5dc9c`. Treat this as
your cheat-sheet; re-open the files to confirm a detail while authoring.

#### Telemetry — `keiro/src/Keiro/Telemetry.hs`

This is the **single** module where keiro touches `hs-opentelemetry-api`. Tracing is **opt-in**
through `Maybe Tracer`: when `Nothing`, every helper is a pass-through (it runs the body and
returns its value — **zero spans**, one `Maybe` branch of overhead); when `Just tracer`, it opens
a span. The application configures the `Tracer` itself (typically `OpenTelemetry.Trace.makeTracer`
from `hs-opentelemetry-sdk`) and threads it into keiro's surfaces via the `tracer` field on the
run/publish option records (`RunCommandOptions.tracer` for the command path,
`OutboxPublishOptions.tracer` for the outbox publisher — those records are owned and documented by
EP-8 and EP-11; this plan's telemetry pages link to them, they do not re-document them).

There are exactly **three** span helpers, all `MonadUnliftIO m` with `HasCallStack` (signatures
transcribed verbatim — re-verify against the module):

```haskell
withProducerSpan
  :: (MonadUnliftIO m, HasCallStack)
  => Maybe Tracer -> IntegrationEvent -> KafkaProducerRecord -> (Maybe Span -> m a) -> m a
-- Producer-kind span named ("send " <> destination); messaging.* attributes.

withConsumerSpan
  :: (MonadUnliftIO m, HasCallStack)
  => Maybe Tracer -> Maybe Text -> KafkaInboundRecord -> Maybe IntegrationEvent
  -> (Maybe Span -> m a) -> m a
-- Consumer-kind span named ("process " <> topic). Extracts the upstream parent from the
-- inbound record's W3C traceparent/tracestate headers, so this span becomes a CHILD of the
-- producer span in the upstream process — joining the two traces by trace id.

withCommandSpan
  :: (MonadUnliftIO m, HasCallStack)
  => Maybe Tracer -> Text -> Maybe Int64 -> (Maybe Span -> m a) -> m a
-- Internal-kind span named after the resolved stream; sets keiro.stream.name and (when given)
-- keiro.retry.attempt. The caller adds keiro.events.appended after a successful append.
```

The W3C trace-context bridge (W3C is the web standard for propagating a trace across processes
via the `traceparent`/`tracestate` HTTP-style headers):

```haskell
traceContextFromCurrentSpan :: (MonadIO m) => m (Maybe TraceContext)
traceContextFromHeaders     :: [(Text, Text)] -> Maybe TraceContext
injectTraceContext          :: (MonadIO m) => [(Text, Text)] -> m [(Text, Text)]
```

**Vendored attribute keys (the key rationale to lift onto the reference page).** keiro links
against `hs-opentelemetry-semantic-conventions 0.1.0.0` (generated from spec v1.24), which exports
only 9 of the 22+ typed `AttributeKey`s keiro needs. So `Keiro.Telemetry` **vendors** the missing
keys locally — each binding carries the canonical dotted-name string from spec v1.40, so the
**wire name matches the spec exactly**; only the binding *location* differs. The vendored keys
(verbatim names) are: `messaging_operation_type` (`"messaging.operation.type"`),
`messaging_operation_name`, `messaging_destination_partition_id`, `messaging_consumer_group_name`,
`messaging_client_id`, `messaging_kafka_offset`, `db_system_name`, `db_namespace`,
`db_collection_name`, `db_operation_name`, plus three **bespoke** keiro keys with no upstream
equivalent: `keiro_stream_name` (`"keiro.stream.name"`), `keiro_retry_attempt`
(`"keiro.retry.attempt"`), `keiro_events_appended` (`"keiro.events.appended"`). The full
per-site instrumentation status is in the keiro repo's
`docs/research/opentelemetry-semconv-audit.md`: publish, inbox-consume, and command-run spans are
**done**; hydration, snapshot, projection, and timer spans are **deferred** — the reference page
must say so honestly rather than implying full coverage.

#### Migrations — `keiro-migrations` (`keiro-migrations/src/Keiro/Migrations.hs`, `app/Main.hs`)

keiro's schema ships as embedded `codd` migrations (codd is a Haskell migration tool; the SQL
files are baked into the binary via Template Haskell `Data.FileEmbed.embedDir "sql-migrations"`).
There are three embedded SQL files under `keiro-migrations/sql-migrations/`, applied in
filename-timestamp order:

- `2026-05-17-00-00-00-keiro-bootstrap.sql` — creates `keiro_snapshots`, `keiro_read_models`,
  `keiro_timers` (plus the index `keiro_snapshots_compat_idx` and `keiro_timers_due_idx`).
- `2026-05-17-01-00-00-keiro-outbox.sql` — creates `keiro_outbox` (indexes
  `keiro_outbox_pending_idx`, `keiro_outbox_head_of_line_idx`).
- `2026-05-17-02-00-00-keiro-inbox.sql` — creates `keiro_inbox` (indexes
  `keiro_inbox_received_idx`, `keiro_inbox_completed_idx`).

All five keiro tables live in the **`kiroku` schema** (the same schema kiroku uses; keiro extends
it). The public API of `Keiro.Migrations` (verbatim exports):

```haskell
keiroFrameworkMigrations  :: (MonadFail m, EnvVars m) => m [AddedSqlMigration m]  -- keiro-owned SQL only
keiroMigrations           :: (MonadFail m, EnvVars m) => m [AddedSqlMigration m]  -- alias of the above
allKeiroMigrations        :: (MonadFail m, EnvVars m) => m [AddedSqlMigration m]  -- Kiroku THEN Keiro (order is load-bearing)
runKeiroMigrations        :: CoddSettings -> DiffTime -> VerifySchemas -> IO ApplyResult
runKeiroMigrationsNoCheck :: CoddSettings -> DiffTime -> IO ()
runAllKeiroMigrations     :: CoddSettings -> DiffTime -> VerifySchemas -> IO ApplyResult
runAllKeiroMigrationsNoCheck :: CoddSettings -> DiffTime -> IO ()
```

The ordering in `allKeiroMigrations` is **load-bearing**: it concatenates kiroku's migrations
(from `Kiroku.Store.Migrations.kirokuMigrations`) *then* keiro's framework migrations, so the
event-store tables exist before keiro's tables that reference them.

The CLI `keiro-migrate` (`keiro-migrations/app/Main.hs`) reads codd settings from the environment
via `getCoddSettings`, then: if `KEIRO_MIGRATE_NO_CHECK` is set it calls
`runAllKeiroMigrationsNoCheck settings (secondsToDiffTime 5)`; otherwise it calls
`runAllKeiroMigrations settings (secondsToDiffTime 5) LaxCheck` (a 5-second connect timeout,
`LaxCheck` schema verification). The keiro repo's `Justfile` target `jitsurei-migrate` invokes it
with `KEIRO_MIGRATE_NO_CHECK=1`, `CODD_CONNECTION="host=... dbname=... user=..."`,
`CODD_SCHEMAS=kiroku`, and a couple of placeholder `CODD_*` paths (the dirs are unused for
embedded migrations). That target is the canonical real invocation to mirror in the how-to.

Table column shapes (verified from the SQL — for the reference overview table). `keiro_snapshots`:
`stream_id BIGINT PK`, `stream_version`, `state JSONB`, `state_codec_version`,
`regfile_shape_hash`, `created_at`, `updated_at`. `keiro_read_models`: `name TEXT PK`, `version`,
`shape_hash`, `last_built_at`, `status`, `updated_at`. `keiro_timers`: `timer_id UUID PK`,
`process_manager_name`, `correlation_id`, `fire_at`, `payload JSONB`,
`status DEFAULT 'scheduled'`, `attempts`, `fired_event_id`, timestamps. `keiro_outbox`:
`outbox_id UUID PK`, `message_id`, `source`, `destination`, …, `status DEFAULT 'pending'`,
`attempt_count`, `next_attempt_at`, `last_error`, `published_at`, `UNIQUE (source, message_id)`.
`keiro_inbox`: composite `PRIMARY KEY (source, dedupe_key)`, `status DEFAULT 'processing'`,
`received_at`, `completed_at`, `failed_at`, Kafka columns (`kafka_topic`/`partition`/`offset`).
The reference page lists each table with a one-line purpose and **cross-links to the owning
subsystem page** (snapshots/read-models → EP-9's read-side reference; timers → EP-10's workflow
reference; outbox/inbox → EP-11's integration-events reference) rather than duplicating field
docs.

#### Test support — `keiro-test-support/src/Keiro/Test/Postgres.hs`

A suite-level template-database fixture built on `ephemeral-pg` (a Haskell helper that starts a
throwaway PostgreSQL server for tests). It starts **one** cached PostgreSQL server, runs
`allKeiroMigrations … LaxCheck` once against a `keiro_template` database, and then clones an
isolated database per test from that template. Public surface (verbatim):

```haskell
data Fixture = Fixture { server :: Pg.Database, templateName :: Text, nextId :: TVar Int }

withMigratedSuite :: (Fixture -> IO a) -> IO a
withFreshStore    :: Fixture -> (Store.KirokuStore -> IO ()) -> IO ()
withFreshStores2  :: Fixture -> ((Store.KirokuStore, Store.KirokuStore) -> IO ()) -> IO ()
```

It is designed for `hspec`'s `around` combinator. The idiom (transcribed from the module's
Haddock) is:

```haskell
main :: IO ()
main =
  withMigratedSuite \fixture ->
    hspec $
      describe "..." $ around (withFreshStore fixture) $ do
        it "..." \store -> pure ()
```

`withFreshStore` clones a fresh DB via `CREATE DATABASE … TEMPLATE keiro_template`, opens a
`Store.KirokuStore`, runs the action, then `DROP DATABASE … WITH (FORCE)`. `withFreshStores2`
provides two isolated databases/stores for cross-context integration tests. The expensive
work — server startup and migrations — happens **once per suite**, not once per test.


## Plan of Work

The work is organized as seven milestones. M0 verifies preconditions. M1–M5 author the
original-content pages (telemetry, migrations, testing, cookbook, FAQ); each can proceed as soon
as EP-7 is Complete and each appends its own slugs to the relevant section `meta.json`. M6 is the
finalization pass and must run **last**, after the four Phase-2 plans are Complete.

The pages this plan creates, all under `content/docs/keiro/`:

| File | Type → template | Built from |
|---|---|---|
| `how-to/enable-opentelemetry.mdx` | How-To | `Keiro/Telemetry.hs` |
| `reference/telemetry.mdx` | Reference | `Keiro/Telemetry.hs` + `docs/research/opentelemetry-semconv-audit.md` |
| `how-to/run-migrations.mdx` | How-To | `keiro-migrations/{src/Keiro/Migrations.hs,app/Main.hs}` + `Justfile` |
| `reference/migrations-and-schema.mdx` | Reference | `Keiro/Migrations.hs` + the three SQL files |
| `how-to/test-with-the-postgres-fixture.mdx` | How-To | `Keiro/Test/Postgres.hs` |
| `cookbook/idempotent-fan-out.mdx` | Cookbook | command-id determinism + at-least-once dispatch |
| `cookbook/timeout-saga.mdx` | Cookbook | timer scheduling + compensating command |
| `faq.mdx` | FAQ (overwrite stub) | family framing + roadmap boundary |

### Milestones

- **M0 — Preconditions.** Confirm Node 22 + pnpm are on PATH, `node_modules` is present, and
  **EP-7 is Complete** (the `content/docs/keiro/` tree exists with section `meta.json` files,
  `docs/keiro-source-sync.md` exists, and the `/docs/keiro` overview + getting-started pages
  exist). At the end: a baseline `pnpm typecheck` and `pnpm build` both succeed before you add a
  page. Acceptance: both commands exit 0 on the unmodified tree.

- **M1 — Telemetry (how-to + reference).** Author `how-to/enable-opentelemetry.mdx` (configure a
  `Tracer` with `hs-opentelemetry-sdk`'s `makeTracer`, thread it via `RunCommandOptions.tracer` /
  `OutboxPublishOptions.tracer`, wire the W3C propagator on the `TracerProvider`) and
  `reference/telemetry.mdx` (the three span helpers with their exact signatures, span
  names/kinds, the attribute table, and the vendored-key rationale lifted from the audit, ending
  with the honest "deferred sites" note). Append `enable-opentelemetry` to `how-to/meta.json` and
  `telemetry` to `reference/meta.json`. Acceptance: both pages build; every Haskell name
  (`withProducerSpan`, `withConsumerSpan`, `withCommandSpan`, `injectTraceContext`,
  `traceContextFromCurrentSpan`, `traceContextFromHeaders`, the vendored key names) appears in
  `keiro/src/Keiro/Telemetry.hs`.

- **M2 — Migrations (how-to + reference).** Author `how-to/run-migrations.mdx` (run
  `keiro-migrate`: the `CODD_CONNECTION`/`CODD_SCHEMAS=kiroku` env vars, `KEIRO_MIGRATE_NO_CHECK`,
  the `LaxCheck` default, and how to compose keiro's migrations with a service's own via
  `keiroFrameworkMigrations`) and `reference/migrations-and-schema.mdx`
  (`keiroFrameworkMigrations` vs `allKeiroMigrations`, the load-bearing kiroku-then-keiro order,
  the runner signatures, and an overview table of the five keiro tables cross-linking the owning
  subsystem reference pages). Append `run-migrations` to `how-to/meta.json` and
  `migrations-and-schema` to `reference/meta.json`. Acceptance: both build; the env vars and
  function names match `app/Main.hs`/`Migrations.hs`; the five table names match the SQL files.

- **M3 — Testing how-to.** Author `how-to/test-with-the-postgres-fixture.mdx` (the
  `Keiro.Test.Postgres` pattern with `hspec`'s `around`: `withMigratedSuite` outermost,
  `withFreshStore fixture` per example, the template-clone model, and `withFreshStores2` for
  two-database tests). Append `test-with-the-postgres-fixture` to `how-to/meta.json`. Acceptance:
  builds; `withMigratedSuite`/`withFreshStore`/`withFreshStores2`/`Fixture` match the module.

- **M4 — Cookbook recipes.** Author two self-contained, copy-pasteable recipes:
  `cookbook/idempotent-fan-out.mdx` (derive a **deterministic command id** so at-least-once
  dispatch from a subscription/process manager does not double-act) and `cookbook/timeout-saga.mdx`
  (schedule a timeout **timer** and fire a **compensating command** when it fires). Each follows
  the cookbook template (Problem → Solution → How it works) and cross-links the relevant subsystem
  pages (the command cycle for fan-out; process managers + timers for the saga). Append
  `idempotent-fan-out` and `timeout-saga` to `cookbook/meta.json`. Acceptance: both build; the
  snippets use only names present in the keiro source.

- **M5 — FAQ.** Overwrite `faq.mdx` (currently a one-question stub with a "coming soon" callout)
  with real `<Accordions>`/`<Accordion>` Q&A: "Is keiro a server or a library?" (a library you
  import), "How does it relate to kiroku/keiki/shibuya?" (the three composed libraries), "Does it
  ship durable workflows (Temporal-style)?" (**process managers + durable timers today;
  named-step durable execution is roadmap**), "Is keiro Postgres-only?" (yes — one substrate),
  "How do I get exactly-once with Kafka?" (you don't get distributed exactly-once; you get
  **at-least-once** delivery plus the **inbox** dedupe table keyed by `(source, dedupe_key)` for
  effectively-once processing). Each answer links to the deeper page. Acceptance: `faq.mdx` no
  longer contains the "coming soon" callout; the page renders as expandable accordions.

- **M6 — FINALIZATION (runs LAST).** **Precondition: EP-8, EP-9, EP-10, and EP-11 are Complete.**
  How to verify the precondition is described in Concrete Steps (their pages exist on disk and
  their slugs are present in the section `meta.json` files). Then: (a) order **every** section
  `meta.json` (`tutorials`, `how-to`, `reference`, `explanation`, `cookbook`, `walkthrough` and
  every `walkthrough/<subdir>/meta.json`) into a sensible reading order — append/reorder only,
  never delete another plan's slug; (b) replace **every** section `index.mdx` "coming soon"
  callout with a real `<Cards>` index of that section's pages (tutorials, how-to, reference,
  explanation, cookbook, and the walkthrough hub); (c) update `docs/keiro-source-sync.md`'s
  "most-coupled pages" list to cover the pages the whole keiro set added; (d) run the gate:
  `pnpm typecheck` clean, `pnpm build` exits 0 prerendering all keiro pages with **zero**
  crawler/`unhandledRejection` warnings, `pnpm lint:links` passes (no broken or relative links in
  `content/docs/keiro/**`), the search index carries the new pages, and the snippet cross-check
  confirms every Haskell name used across the keiro tree exists at `3f5dc9c`. Acceptance: see
  Validation and Acceptance.


## Concrete Steps

Run all commands from the repo root `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs` unless
stated otherwise. The toolchain is **pnpm** on **Node 22** inside the Nix dev shell.

### M0 — Preconditions

```bash
nix develop                       # enter the dev shell (pnpm + Node 22)

# EP-7 must be Complete: these must all exist.
test -d content/docs/keiro && echo "keiro tree present"
test -f docs/keiro-source-sync.md && echo "source-sync pointer present"
test -f content/docs/keiro/index.mdx && echo "overview present"

pnpm install
pnpm typecheck
pnpm build
```

Expected (abridged):

```text
keiro tree present
source-sync pointer present
overview present
✓ built in <N>s
```

If `docs/keiro-source-sync.md` or `content/docs/keiro/` is missing, EP-7 has not landed — stop
and finish EP-7 first (hard dependency). Confirm the keiro source commit before cross-checking:

```bash
git -C /Users/shinzui/Keikaku/bokuno/keiro rev-parse HEAD
# expect: 3f5dc9c1fa90f6358cebb9e85d92dde4c325db48
```

### M1 — Telemetry pages

Create `content/docs/keiro/how-to/enable-opentelemetry.mdx` from the how-to template and
`content/docs/keiro/reference/telemetry.mdx` from the reference template. Author the snippets
against `keiro/src/Keiro/Telemetry.hs` (signatures in Context). The reference page's attribute
section should be a `<TypeTable>` or a plain table of attribute → value → key-binding, ending with
the deferred-sites note. Then append the slugs (append only — keep any existing entries):

```json
// content/docs/keiro/how-to/meta.json — append "enable-opentelemetry" to pages
{
  "title": "How-To Guides",
  "pages": ["index", "enable-opentelemetry"]
}
```

```json
// content/docs/keiro/reference/meta.json — append "telemetry"
{
  "title": "Reference",
  "pages": ["index", "telemetry"]
}
```

Verify the names quoted exist in source:

```bash
grep -nE "withProducerSpan|withConsumerSpan|withCommandSpan|injectTraceContext|traceContextFrom" \
  /Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Telemetry.hs
grep -nE "keiro_stream_name|keiro_retry_attempt|keiro_events_appended|messaging_operation_type" \
  /Users/shinzui/Keikaku/bokuno/keiro/keiro/src/Keiro/Telemetry.hs
```

Expected: each name prints at least one matching line. Then `pnpm typecheck && pnpm build`.

### M2 — Migrations pages

Create `content/docs/keiro/how-to/run-migrations.mdx` (how-to) and
`content/docs/keiro/reference/migrations-and-schema.mdx` (reference). The how-to mirrors the real
invocation:

```bash
# Apply Kiroku + Keiro schema to a database (local dev: skip schema verification).
export CODD_CONNECTION="host=localhost dbname=myservice user=postgres"
export CODD_SCHEMAS=kiroku
export KEIRO_MIGRATE_NO_CHECK=1
cabal run keiro-migrate
```

Append the slugs:

```json
// content/docs/keiro/how-to/meta.json
{ "title": "How-To Guides", "pages": ["index", "enable-opentelemetry", "run-migrations"] }
```

```json
// content/docs/keiro/reference/meta.json
{ "title": "Reference", "pages": ["index", "telemetry", "migrations-and-schema"] }
```

Verify names and tables:

```bash
grep -nE "keiroFrameworkMigrations|allKeiroMigrations|runAllKeiroMigrations" \
  /Users/shinzui/Keikaku/bokuno/keiro/keiro-migrations/src/Keiro/Migrations.hs
grep -rnE "CREATE TABLE IF NOT EXISTS keiro_(snapshots|read_models|timers|outbox|inbox)" \
  /Users/shinzui/Keikaku/bokuno/keiro/keiro-migrations/sql-migrations
```

Expected: the migration functions print; all five `CREATE TABLE` lines print. Then
`pnpm typecheck && pnpm build`.

### M3 — Testing how-to

Create `content/docs/keiro/how-to/test-with-the-postgres-fixture.mdx`. Use the `hspec`/`around`
idiom from Context. Append the slug:

```json
// content/docs/keiro/how-to/meta.json
{
  "title": "How-To Guides",
  "pages": ["index", "enable-opentelemetry", "run-migrations", "test-with-the-postgres-fixture"]
}
```

Verify:

```bash
grep -nE "withMigratedSuite|withFreshStore|withFreshStores2|data Fixture" \
  /Users/shinzui/Keikaku/bokuno/keiro/keiro-test-support/src/Keiro/Test/Postgres.hs
```

Expected: each name prints. Then `pnpm typecheck && pnpm build`.

### M4 — Cookbook recipes

Create `content/docs/keiro/cookbook/idempotent-fan-out.mdx` and
`content/docs/keiro/cookbook/timeout-saga.mdx` from the cookbook template. Append the slugs:

```json
// content/docs/keiro/cookbook/meta.json
{ "title": "Cookbook", "pages": ["index", "idempotent-fan-out", "timeout-saga"] }
```

Then `pnpm typecheck && pnpm build`.

### M5 — FAQ

Overwrite `content/docs/keiro/faq.mdx`. Remove the "coming soon" `<Callout>`; author the real
`<Accordions>` block from the M5 question list. No `meta.json` change is needed (`faq` is already
listed in `content/docs/keiro/meta.json`). Then `pnpm typecheck && pnpm build`, and confirm the
stub callout is gone:

```bash
grep -n "coming soon\|in progress" content/docs/keiro/faq.mdx || echo "stub removed"
```

Expected: `stub removed`.

### M6 — Finalization (runs LAST)

First, **verify the Phase-2 precondition** — every subsystem plan's pages must be present and
listed. There must be no remaining "coming soon" pages outstanding from those plans, and each
section `meta.json` must list more than just `["index"]`:

```bash
# Each subsystem plan's walkthrough subdir must exist (EP-8/9/10/11 own these).
for d in command-cycle read-side workflow integration; do
  test -d content/docs/keiro/walkthrough/$d && echo "walkthrough/$d present" || echo "MISSING walkthrough/$d"
done

# Reference/explanation/how-to must carry subsystem pages, not just index.
for s in reference explanation how-to; do
  echo "== $s =="; cat content/docs/keiro/$s/meta.json
done
```

Expected: all four walkthrough subdirs print "present"; each section `meta.json` lists multiple
slugs. If any prints "MISSING" or only `["index"]`, a Phase-2 plan is not Complete — **stop**;
M6's precondition is not met.

Then do the ordering pass. Edit every section `meta.json` (and each
`walkthrough/<subdir>/meta.json`) so `pages` is in a deliberate reading order. **Reorder only;
never delete a slug another plan added.** For example, the top-level keiro `meta.json` already
orders the sections; within `how-to` group the operations how-tos this plan added after the
subsystem how-tos, and so on. Replace every section landing's "coming soon" callout with a
`<Cards>` index. The shape (no imports — components are global):

```mdx
---
title: How-To Guides
description: Task-oriented recipes for readers who already know the basics.
---

Task-oriented recipes for readers who already know the basics and have a specific goal.

<Cards>
  <Card title="Enable OpenTelemetry" href="/docs/keiro/how-to/enable-opentelemetry" />
  <Card title="Run the migrations" href="/docs/keiro/how-to/run-migrations" />
  <Card title="Test with the Postgres fixture" href="/docs/keiro/how-to/test-with-the-postgres-fixture" />
</Cards>
```

Find every landing still carrying a placeholder, and fix each:

```bash
grep -rln "coming soon" content/docs/keiro
```

Expected after the pass: no matches. Update `docs/keiro-source-sync.md`'s "most-coupled pages"
list to name the pages the whole keiro set added (most-coupled to the source: the telemetry,
migrations-and-schema, command-cycle, integration, read-side, and workflow reference pages).

Run the full gate:

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

The `pnpm build` output must contain **no** `[unhandledRejection]` or `Failed to fetch` line.
Finally, snippet cross-check — every Haskell name used anywhere in the keiro tree must exist in
the source at `3f5dc9c`:

```bash
# Example spot-checks; extend to every distinctive identifier used in snippets.
grep -rhoE "[A-Za-z][A-Za-z0-9_']+" content/docs/keiro/**/*.mdx | sort -u > /tmp/keiro-idents.txt
grep -nE "withProducerSpan|allKeiroMigrations|withMigratedSuite|keiro_outbox|keiro_inbox" \
  -r /Users/shinzui/Keikaku/bokuno/keiro
```

Acceptance: every distinctive keiro identifier quoted in a snippet resolves to a definition in
the source tree. Record any divergence in Surprises & Discoveries and fix the snippet (the source
is authoritative).


## Validation and Acceptance

Exercise the system and observe specific behaviors:

1. **Original-content pages build and render.** After M1–M5, `pnpm typecheck` and `pnpm build`
   exit 0. Browsing `http://localhost:3000/docs/keiro` (via `pnpm dev`) shows the two telemetry
   pages, the two migrations pages, the testing how-to, the two cookbook recipes, and the FAQ in
   the sidebar; each opens without a 404 and shows its frontmatter title.

2. **FAQ renders as accordions.** The FAQ page shows the `<Accordion>` questions as expandable
   rows; clicking one reveals its answer. The "coming soon" callout is gone
   (`grep -n "coming soon" content/docs/keiro/faq.mdx` prints nothing).

3. **Every section landing shows Cards (no "coming soon").** After M6,
   `grep -rln "coming soon" content/docs/keiro` prints **nothing**; each of `tutorials`,
   `how-to`, `reference`, `explanation`, `cookbook`, and `walkthrough` `index.mdx` contains a
   `<Cards>` block, and each card link resolves.

4. **The whole keiro tree builds with zero crawler warnings.** `pnpm build` exits 0 and its
   output contains no `[unhandledRejection]` and no `Failed to fetch` line. Evidence to capture:

   ```text
   ✓ built in <N>s
   ```

5. **Link-check passes.** `pnpm lint:links` prints
   `✓ doc links OK — checked <N> files, no broken internal links.` and the `linkinator` crawl
   reports no broken links. There are no relative `./`/`../` links anywhere under
   `content/docs/keiro/**`:

   ```bash
   grep -rnE "\]\(\.\.?/" content/docs/keiro && echo "FOUND relative links" || echo "no relative links"
   ```

   Expected: `no relative links`.

6. **Search index carries the new pages.** After `pnpm build`, the generated search index
   includes the operations/FAQ/cookbook pages (e.g. searching the running site for "OpenTelemetry"
   or "keiro-migrate" returns the new pages). Verify by browsing and using the site search, or by
   confirming the pages appear in the generated `.source/`/search artifact.

7. **Snippets match the real API at `3f5dc9c`.** Every distinctive Haskell identifier in a snippet
   (the three span helpers, the migration functions, the fixture functions, the five table names,
   the vendored attribute keys) appears in `/Users/shinzui/Keikaku/bokuno/keiro` at the pinned
   commit (per the M6 cross-check grep transcript). No snippet names `Keiro.Workflow`, a
   named-step durable-execution API, or a `keiro_workflow_steps` table as a shipped feature — the
   FAQ mentions v2 durable workflows only as roadmap.

   ```bash
   grep -rn "Keiro.Workflow\|keiro_workflow_steps" content/docs/keiro && echo "CHECK: must be roadmap-only" || echo "no v2 API referenced as shipped"
   ```


## Idempotence and Recovery

All steps are file authoring and are safe to repeat. Re-running `pnpm typecheck`/`pnpm build`/
`pnpm lint:links` is idempotent. Editing or recreating an `.mdx`/`meta.json` file overwrites it;
re-running a milestone simply rewrites the same files. No database, no keiro source, and no other
plan's pages are modified (the keiro tree is opened read-only for cross-checking; `meta.json`
edits in M6 reorder but never delete sibling entries).

Recovery:
- If a page breaks the build, the error names the offending `.mdx` file and line; the usual causes
  are an untagged code fence, a stray `<` in prose, or a link to a non-existent route. Fix and
  rebuild.
- If `pnpm lint:links` fails, it prints each broken `file -> target`; fix the link to an existing
  `/docs/keiro/...` page (absolute, never relative) and re-run.
- If `pnpm build` emits `[unhandledRejection]`/`Failed to fetch`, a link points at a route that
  does not exist (most often a relative `./` link); replace it with an absolute `/docs/keiro/...`
  path.
- If the M6 precondition check shows a missing Phase-2 walkthrough subdir or an `["index"]`-only
  section `meta.json`, stop M6 and wait for that plan to complete; M1–M5 are unaffected and can
  remain merged.
- If a snippet diverges from the source at `3f5dc9c`, fix the snippet (the source is
  authoritative) and record the divergence in Surprises & Discoveries.


## Interfaces and Dependencies

### Documented subject (Haskell, read-only at `/Users/shinzui/Keikaku/bokuno/keiro`, commit `3f5dc9c`)

- `Keiro.Telemetry` (`keiro/src/Keiro/Telemetry.hs`) — the three span helpers
  (`withProducerSpan`, `withConsumerSpan`, `withCommandSpan`), the W3C bridge
  (`traceContextFromCurrentSpan`, `traceContextFromHeaders`, `injectTraceContext`), and the
  vendored/bespoke `AttributeKey`s. Backed by `hs-opentelemetry-api`; tracer made by
  `hs-opentelemetry-sdk`'s `makeTracer` on the application side; threaded via the EP-8/EP-11
  option records (`RunCommandOptions.tracer`, `OutboxPublishOptions.tracer`).
- `Keiro.Migrations` (`keiro-migrations/src/Keiro/Migrations.hs`, exe `keiro-migrate` from
  `keiro-migrations/app/Main.hs`) — `keiroFrameworkMigrations`, `keiroMigrations`,
  `allKeiroMigrations`, and the four runners; the three embedded SQL files under
  `keiro-migrations/sql-migrations/`; the five tables `keiro_snapshots`, `keiro_read_models`,
  `keiro_timers`, `keiro_outbox`, `keiro_inbox` (all in the `kiroku` schema).
- `Keiro.Test.Postgres` (`keiro-test-support/src/Keiro/Test/Postgres.hs`) — `Fixture`,
  `withMigratedSuite`, `withFreshStore`, `withFreshStores2`.

### Docs tooling (TypeScript, this repo)

- fumadocs (`fumadocs-core`/`fumadocs-ui` 16.9.3, `fumadocs-mdx` 15.0.10) — MDX + sidebar from
  `meta.json`; components registered globally in `src/components/mdx.tsx` (`Callout`, `Cards`,
  `Card`, `Steps`, `Tabs`, `TypeTable`, `Accordions`, `Accordion`) — use bare, no imports.
- TanStack Start + Vite — `pnpm dev`/`pnpm build`/`pnpm start`; `pnpm typecheck` =
  `fumadocs-mdx && tsc --noEmit`; `pnpm lint:links` = `node scripts/check-doc-links.mjs &&
  linkinator .output/public ...`; `pnpm check` runs the whole chain.
- pnpm + Node 22 inside the Nix dev shell (`nix develop`).

### Files this plan CREATES / OWNS (all under `content/docs/keiro/`)

- `how-to/enable-opentelemetry.mdx` — title "Enable OpenTelemetry".
- `how-to/run-migrations.mdx` — title "Run the migrations".
- `how-to/test-with-the-postgres-fixture.mdx` — title "Test with the Postgres fixture".
- `reference/telemetry.mdx` — title "Telemetry".
- `reference/migrations-and-schema.mdx` — title "Migrations and schema".
- `cookbook/idempotent-fan-out.mdx` — title "Idempotent fan-out".
- `cookbook/timeout-saga.mdx` — title "Timeout saga".
- `faq.mdx` — OVERWRITE the stub; title "keiro FAQ".

### meta.json slugs this plan APPENDS (M1–M5; append only)

- `content/docs/keiro/how-to/meta.json` — appends `enable-opentelemetry`, `run-migrations`,
  `test-with-the-postgres-fixture`.
- `content/docs/keiro/reference/meta.json` — appends `telemetry`, `migrations-and-schema`.
- `content/docs/keiro/cookbook/meta.json` — appends `idempotent-fan-out`, `timeout-saga`.
- (`faq` is already in the top-level `content/docs/keiro/meta.json`; no append needed.)

### meta.json files this plan REORDERS in finalization (M6; reorder only, never delete)

- Top-level `content/docs/keiro/meta.json`.
- `content/docs/keiro/{tutorials,how-to,reference,explanation,cookbook,walkthrough}/meta.json`.
- Every `content/docs/keiro/walkthrough/<subdir>/meta.json` created by EP-8/9/10/11
  (`command-cycle`, `read-side`, `workflow`, `integration`).

### Section landings this plan REWRITES in finalization (M6)

- `content/docs/keiro/{tutorials,how-to,reference,explanation,cookbook,walkthrough}/index.mdx` —
  replace each "coming soon" `<Callout>` with a `<Cards>` index of that section's pages.

### Files this plan TOUCHES but does not own

- `docs/keiro-source-sync.md` (created by EP-7) — M6 updates only its "most-coupled pages" list;
  it does not change the pinned commit or the update procedure.

### Dependencies on other plans

- **Hard dependency — EP-7** (`docs/plans/7-keiro-overview-getting-started-and-the-jitsurei-example-spine.md`):
  must be Complete before any milestone. It creates the `content/docs/keiro/` tree (including the
  section `meta.json` files and "coming soon" landings this plan finalizes), the `/docs/keiro`
  overview + getting-started pages every page links back to, the jitsurei module map, and
  `docs/keiro-source-sync.md`.
- **Integration dependency — EP-8/9/10/11** (`docs/plans/8`–`docs/plans/11`): M1–M5 do **not**
  depend on them and may proceed once EP-7 is Complete. **M6 must run after all four are
  Complete** (verified per Concrete Steps: their walkthrough subdirs exist and their section
  `meta.json` files list more than `["index"]`). M6 reorders their slugs and rewrites their
  section landings but must **never delete or rename** their pages.

### Postconditions that must hold at the end

- Every file listed above exists; `pnpm typecheck`, `pnpm build`, and `pnpm lint:links` all exit
  0 with the whole keiro tree present.
- `pnpm build` emits no `[unhandledRejection]`/`Failed to fetch` line (zero crawler warnings).
- No section `index.mdx` under `content/docs/keiro/` contains "coming soon"; each carries a
  `<Cards>` index whose links resolve.
- Every Haskell identifier quoted in a keiro snippet exists in the keiro source at `3f5dc9c`; no
  snippet presents the v2 durable-workflow engine as a shipped API.
- The search index includes the operations, FAQ, and cookbook pages.
