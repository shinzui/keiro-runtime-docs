---
id: 43
slug: rebuild-keiro-dsl-0-2-authoring-and-evolution-documentation
title: "Rebuild keiro-dsl 0.2 authoring and evolution documentation"
kind: exec-plan
created_at: 2026-07-14T15:14:31Z
intention: "intention_01kxgjsgnse1z9r0w141akd9g2"
master_plan: "docs/masterplans/6-prepare-keiro-runtime-documentation-for-wider-announcement.md"
---

# Rebuild keiro-dsl 0.2 authoring and evolution documentation

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.


## Purpose / Big Picture

After this change, a reader can author, validate, scaffold, compile, and evolve a realistic keiro
0.2 service specification without falling through gaps in the old notation page. The documentation
will cover every first-class node family and the new persistence and worker policies, explain why
the checker rejects unsafe identities or incomplete disposition tables, show how scaffold protects
hand-owned files, and teach `diff` as an upgrade gate with breaking, warning, and safe changes. A
reader can verify the result by starting from a `.keiro` file, generating modules, filling typed
holes, running the harness, and classifying a changed spec with commands and outcomes that match the
0.2 conformance suites.


## Progress

- [x] (2026-07-14T17:54:30Z) Milestone 1: rebuilt the 0.2 learning and upgrade path around the
  source-valid aggregate/read-model/router cold-start fixture.
- [ ] Milestone 2: make the notation reference complete and navigable.
- [ ] Milestone 3: add task-oriented authoring and evolution guides.
- [ ] Milestone 4: reconcile keiro-dsl across the keiro documentation.


## Surprises & Discoveries

- The current committed Keiro source is `c68dcc7`, not the planned `87bf3ff` boundary. The only
  later keiro-dsl change is the 0.3.0.0 release metadata in its Cabal file and changelog; the
  changelog explicitly records no user-facing changes, so the documented 0.2 surface is unchanged.
- The upstream source tree acquired an untracked `mori.automation.dhall` during the audit. It is
  excluded from evidence and left untouched; all documentation claims come from committed files.


## Decision Log

- Decision: Rebuild the authoring journey around the 0.2 node families and lifecycle instead of
  patching only syntax snippets in the existing notation reference.
  Rationale: keiro-dsl added read models, routers, snapshot policy, queue ordering/provisioning,
  intake persistence, workflow evolution, stricter validation, and safer scaffolding. These changes
  affect how a service is designed, not only how individual clauses are spelled.
  Date: 2026-07-14
- Decision: Use committed keiro SHA `87bf3ff173b2f4ce274e36cea64923ad33817d7c` as the source
  boundary and use `keiro-dsl/test/conformance-*` fixtures rather than the external
  keiro-runtime-jitsurei repository as runnable evidence.
  Rationale: The user explicitly excluded the not-yet-upgraded example repository; the DSL's own
  fixtures are current, isolated, and compile against the released toolchain.
  Date: 2026-07-14
- Decision: Keep generated modules and create-once hole modules distinct in every example.
  Rationale: The 0.2 scaffold firewall and `@generated` banner are core safety contracts. Examples
  that blur ownership teach users to overwrite their own code.
  Date: 2026-07-14
- Decision: Review committed Keiro `c68dcc7` while continuing to describe the DSL surface introduced
  in 0.2.
  Rationale: The 0.3.0.0 release changes package metadata only and explicitly has no user-facing
  changes. Using current committed fixtures avoids documenting a stale test inventory without
  conflating the untracked upstream file with released behavior.
  Date: 2026-07-14


## Outcomes & Retrospective

- Milestone 1 replaced the stale aggregate-only tutorial with the checked
  `transfer-routing.keiro` vertical, rebuilt the toolchain explanation around its six distinct
  gates and transactional scaffold plan, and added a 0.1-to-0.2 migration guide. The current CLI
  accepts the documented fixture (with its intended policy warnings), and
  `keiro-dsl-conformance-newsurface` passes all aggregate, read-model, and router assertions.


## Context and Orientation

`keiro-dsl` is a toolchain package in the registered `shinzui/keiro` repository. It parses a typed
service specification stored in a `.keiro` file, validates references and safety rules, pretty
prints the normalized spec, compares revisions, scaffolds Haskell modules, and emits harnesses.
It is an authoring tool: generated Haskell depends on keiro and keiki, not on the DSL package at
runtime.

Resolve source with `mori registry show shinzui/keiro --full`. During planning it was
`/Users/shinzui/Keikaku/bokuno/keiro` at committed SHA `87bf3ff`. The current site pointer in
`docs/keiro-source-sync.md` is `601f9f3`; the 0.2 work is concentrated in
`keiro-dsl/src/Keiro/Dsl/Grammar.hs`, `Parser.hs`, `PrettyPrint.hs`, `Validate.hs`, `Diff.hs`,
`Scaffold.hs`, `ScaffoldRun.hs`, `ScaffoldRecord.hs`, `Harness.hs`, and `Skeleton.hs`, with CLI
dispatch in `keiro-dsl/app/Main.hs`. The release contract is summarized in
`keiro-dsl/CHANGELOG.md`. The most useful checked-in authoring references are
`agents/skills/keiro-dsl-authoring/NOTATION.md`, `TAXONOMY.md`, `LOOP.md`, and
`docs/corpus/keiro-dsl-corpus.md`; source and conformance tests win when prose disagrees.

The 0.2 grammar adds a first-class `readmodel` node with schema, table, typed columns, captured
shape, version, consistency, scope, feed, and subscription identity. It adds a `router` node with a
stable resolver contract, typed row/input bindings, target aggregate, dispatch identity, and worker
policies. Aggregates can declare snapshot cadence and captured codec/shape fixtures. Work queues
declare unordered or FIFO ordering, group-key derivation, and standard/unlogged/partitioned
provisioning. Intakes can choose full-envelope or dedupe-only persistence. Durable workflows can
declare guarded patches and terminal `continueAsNew` evolution.

Several old forms are now rejected. A process saga names a validated category instead of a raw
stream prefix. Process and router nodes must declare `rejected` and `poison` policies. Timer fire
tables need an `on-ambiguous` arm, and ambiguity cannot be marked benign. Identifiers must be ASCII,
Haskell-safe, non-keyword, and collision-free. Numeric literals parse through `Integer` and reject
overflow. Duplicate or dangling names, unresolved topology, incomplete/shadowed dispositions,
queue/read-model drift, unsafe register initials, and many policy contradictions are located
diagnostics rather than silently accepted input.

Scaffolding first plans the whole output set, validates module paths and self-firewalls, and only
then writes. Generated paths require an `@generated` banner before overwrite unless the explicit
`--force-generated-overwrite` escape hatch is used. Create-once holes remain hand-owned. Scaffold
records make stale generated modules visible. The `diff` engine uses an exhaustive node-family
registry, reports `BREAKING:`, `WARNING:`, and safe change lines, and exits nonzero only for breaking
changes.

Existing public pages are scattered across `content/docs/keiro/tutorials/author-a-service-with-keiro-dsl.mdx`,
`reference/keiro-dsl-notation.mdx`, `explanation/the-keiro-dsl-toolchain.mdx`, and how-tos for check,
scaffold, placement, and diff. They teach the 0.1 surface and need a coherent 0.2 upgrade path.
Navigation is controlled by the nearest `meta.json` files.


## Plan of Work

Milestone 1 creates the 0.2 learning and upgrade path. Rewrite
`content/docs/keiro/tutorials/author-a-service-with-keiro-dsl.mdx` around a small service that uses
an aggregate, projection/read model, router or process, and one operational node without depending
on `content/docs/example-app/`. Update `explanation/the-keiro-dsl-toolchain.mdx` to show the
parse/check/pretty/scaffold/harness/diff lifecycle and ownership boundary. Add
`content/docs/keiro/how-to/migrate-a-keiro-spec-to-0-2.mdx` and register it in
`content/docs/keiro/how-to/meta.json`; it must cover saga category syntax, required policies,
timer ambiguity, identifier/literal hardening, diff output changes, and scaffold overwrite rules.
Acceptance is a before/after 0.1-to-0.2 example whose new form passes `check` and whose changed
identity is classified by `diff`.

Milestone 2 makes the notation reference complete and navigable. Refactor
`content/docs/keiro/reference/keiro-dsl-notation.mdx` into an overview and add focused pages when the
single page would be too large: `reference/keiro-dsl-cli.mdx`,
`reference/keiro-dsl-domain-nodes.mdx`, and `reference/keiro-dsl-runtime-nodes.mdx` are the default
names. Update `reference/meta.json` and `reference/index.mdx`. Define every node and clause,
including aggregate, projection, read model, process, router, contract, intake, emit, publisher,
work queue, dispatch, workflow, operation, timer, snapshot, patch, and continue-as-new. Include
closed vocabularies, captured fixtures, default values, identity-bearing fields, generated files,
hole ownership, and the exact validation rules users need to correct errors. Acceptance is a node
inventory cross-check against `Grammar.hs` and `Validate.hs` with every grammar node represented
once and every code sample parseable.

Milestone 3 adds task-oriented verticals for the largest new surfaces. Add or expand how-tos for
authoring a registered read model plus router, configuring snapshot policy, declaring FIFO queue
ordering/provisioning, choosing inbox persistence, and evolving a workflow with patch and
`continueAsNew`. Update existing `check-a-service-spec`, `scaffold-and-fill-holes`,
`place-generated-modules-and-wire-cabal`, and `gate-spec-evolution-with-diff` pages. Each vertical
must name generated modules, create-once holes, runtime values/policies, and the conformance command
or harness that proves cold start. Acceptance is that a reader can go from a node snippet to the
generated files and know exactly what must be hand-filled.

Milestone 4 reconciles the rest of the keiro docs. Update affected cards, FAQ, keiro landing page,
read-model/router/snapshot/workflow/PGMQ explanations, and integration links so they use the same
0.2 names and policy taxonomy owned by plans 41 and 42. Run a stale-syntax scan across
`content/docs/keiro/`. Do not modernize `content/docs/example-app/` and do not claim the external
keiro-runtime-jitsurei repository validates these examples. Acceptance is complete metadata,
source-valid examples, and zero links to removed or renamed DSL forms.


## Concrete Steps

Work from `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`. Resolve and inspect source:

```bash
mori registry show shinzui/keiro --full
KEIRO=/Users/shinzui/Keikaku/bokuno/keiro
git -C "$KEIRO" status --short
git -C "$KEIRO" rev-parse HEAD
git -C "$KEIRO" log --oneline 601f9f3..HEAD -- keiro-dsl agents/skills/keiro-dsl-authoring docs/corpus
sed -n '1,260p' "$KEIRO/keiro-dsl/CHANGELOG.md"
```

The planned committed SHA is:

```text
87bf3ff173b2f4ce274e36cea64923ad33817d7c
```

Inventory grammar, diagnostics, CLI, and generated fixtures without guessing:

```bash
rg -n 'data (Node|ServiceNode)|ReadModel|Router|WorkQueue|ContinueAsNew|Snapshot' "$KEIRO/keiro-dsl/src/Keiro/Dsl"
rg -n 'command|subparser|scaffold|diff|harness|check|pretty|new' "$KEIRO/keiro-dsl/app/Main.hs"
rg --files "$KEIRO/keiro-dsl/test" | sort
rg -n 'saga .*stream|on-ambiguous|force-generated-overwrite|readmodel|router' content/docs/keiro
```

If practical, validate snippets against the source CLI in the keiro development shell. The exact
fixture path may be chosen from `keiro-dsl/test/fixtures/`:

```bash
cd "$KEIRO"
nix develop -c cabal run keiro-dsl -- check keiro-dsl/test/fixtures/<selected-fixture>.keiro
nix develop -c cabal run keiro-dsl -- pretty keiro-dsl/test/fixtures/<selected-fixture>.keiro
```

Return to the docs repository and run after each milestone:

```bash
cd /Users/shinzui/Keikaku/bokuno/keiro-runtime-docs
pnpm run typecheck
pnpm run format:check
pnpm build
node scripts/check-doc-links.mjs
git diff --check
```

Successful docs checks exit zero; the selected upstream `check` command prints no error diagnostics
and exits zero.


## Validation and Acceptance

The main acceptance scenario starts with a valid 0.2 spec, runs check and normalization, scaffolds
without touching hand-owned holes, fills the named holes, runs a harness/cold-start proof, and then
compares a changed spec. The docs must predict that breaking identity or persistence changes exit
nonzero, warnings remain visible but exit zero, and safe additions are classified without falling
through an unknown node family.

The migration guide must show old syntax failing and the 0.2 replacement succeeding. A process
example must use `saga <Aggregate> category "<camelCase>"`, declare `rejected` and `poison`, and
never map `on-ambiguous` to a benign fired outcome. A router example must state resolver stability
and target-based identity. A queue example must distinguish ordering from delivery uniqueness and
warn that unlogged queues can lose data after a database crash. A read-model example must align
schema, table, columns, captured shape, consistency, scope, feed, and subscription.

Run and inspect these stale-form scans:

```bash
rg -n 'saga .*stream=|on-ambiguous[[:space:]]*=>[[:space:]]*Fired' content/docs/keiro
rg -n 'scaffold.*overwrite.*unconditionally|diff.*only.*BREAKING.*output' content/docs/keiro
rg -n 'readmodel|router|snapshot every|continueAsNew|persist =|ordering fifo' content/docs/keiro
```

The first two commands should return no obsolete instruction. The third must show coverage in both
reference and task-oriented pages. `pnpm run typecheck`, `pnpm build`,
`node scripts/check-doc-links.mjs`, and `git diff --check` must exit zero. Record the reviewed SHA
and exact pages in this plan for EP-7; do not advance the shared keiro source pointer here.


## Idempotence and Recovery

The docs edits and CLI checks are repeatable. Run scaffold demonstrations only in an upstream test
fixture or disposable temporary directory already provided by the keiro repo; never point
`--force-generated-overwrite` at user source as part of documentation validation. If the tutorial
becomes too broad, keep one end-to-end spine and move lookup material into reference pages rather
than dropping validation or ownership details. Preserve unrelated working-tree changes in both
repositories.


## Interfaces and Dependencies

The source dependency is the `keiro-dsl` package in `shinzui/keiro`. Use only exported CLI behavior
and public modules under `Keiro.Dsl`; source internals may explain implementation but must not be
presented as application APIs. The checked-in `keiro-dsl-authoring` skill and corpus are supporting
references, not substitutes for source and conformance tests.

This plan integrates with
`docs/plans/40-refresh-keiki-0-2-correctness-replay-and-persistence-documentation.md` for builder and
replay terms, plan 41 for read-model/snapshot contracts, and plan 42 for rejection, poison,
dead-letter, router, and workflow policy terms. It has no hard dependency because the upstream
source is self-contained, but final wording must agree. Plan 46 owns final navigation and source
pins. No runtime interface is created; the documentation interface is a complete node catalog plus
one verifiable author/check/scaffold/harness/diff journey.
