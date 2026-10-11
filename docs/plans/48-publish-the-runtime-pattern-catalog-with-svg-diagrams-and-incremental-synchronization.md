---
id: 48
slug: publish-the-runtime-pattern-catalog-with-svg-diagrams-and-incremental-synchronization
title: "Publish the runtime pattern catalog with SVG diagrams and incremental synchronization"
kind: exec-plan
created_at: 2026-10-11T23:02:00Z
intention: "intention_01m4pkhk4eewr91e9bj6h09ep8"
provenance:
  created_by:
    model: "gpt-6.1-sol"
    harness: "codex-cli"
    at: 2026-10-11T23:02:00Z
  revisions:
    - model: "gpt-6.1-sol"
      harness: "codex-cli"
      at: 2026-10-11T23:07:58Z
      mode: "update"
      note: "Link the user-supplied intention and its implementation commit trailer"
    - model: "gpt-6.1-sol"
      harness: "codex-cli"
      at: 2026-10-11T23:27:58Z
      mode: "implement"
      note: "Implement the committed catalog projection, audit presentation, maintained diagrams, and incremental sync"
---

# Publish the runtime pattern catalog with SVG diagrams and incremental synchronization

This ExecPlan is a living document. Keep Progress, Surprises & Discoveries, Decision Log, and Outcomes & Retrospective current. Distill durable decisions into ADRs during implementation.


## Purpose / Big Picture


Publish the complete runtime pattern catalog as a searchable, versioned section of the microsite. A reviewer can read the rules available to coding agents, identify their canonical source and exact revision, inspect assessment criteria where supplied, and understand difficult boundaries and failure sequences through SVG diagrams. Open `/docs/runtime-patterns`, follow a concept, and compare its source revision and wording with the imported catalog to observe the result.

Keep `mori://shinzui/keiro-runtime-patterns` authoritative. Generate the website from a committed catalog snapshot, with separately maintained explanatory diagrams and product links. Updating this repository's doc-sync skill to maintain that presentation is a required milestone of this plan.

The site reveals the standards agents can use. It does not prove that an agent followed them. Publish an audit-reading procedure that asks a work record to cite the pattern URI, revision, applicable criterion, and evidence. Building an agent execution recorder or compliance dashboard is outside this plan.


## Progress


- [x] (2026-10-11 23:40Z) Establish ownership and release-scope decisions; inventory the committed catalog, profile, and scoped logs.
- [x] (2026-10-11 23:40Z) Implement deterministic snapshot import, generation, coverage checks, and meaningful failure tests.
- [ ] Publish every concept with navigation, search, provenance, supplied criteria, Markdown export, and audit guidance.
- [x] (2026-10-11 23:53Z) Assess the complete catalog for visual explanations and record diagram or text-only decisions.
- [x] (2026-10-11 23:53Z) Add at least 18 useful SVG explanations in three batches and enforce their relationship to reviewed source content.
- [ ] Extend doc-sync and its companions, register the initial reviewed pointer, and demonstrate incremental synchronization.
- [ ] Pass the release gate, inspect browser and diagram previews, and distill durable decisions into ADRs.


## Surprises & Discoveries

Browser review exposed an existing nested Markdown export 404: `{$}.md` is not a splat route. A dedicated `/api/markdown/$` route handles nested paths. Vite intercepts `.md` source requests even with a valid route; `.txt` with a plain-text MIME type works for the browser view and copy controls and preserves Markdown content. No dependency change was needed.

Phone-width expansion originally shrank SVG labels too far. Expanded diagrams now retain native SVG width with horizontal scrolling on narrow screens. Desktop expansion remains bounded to the viewport.


The committed owner check confirms 88 concepts, despite the smaller registered DocRef listing. Validation runs in a temporary tree because the owner regenerates indexes. Owner ADR-6 changed in commit `2102ba1cce26d0f7ccfee775f5fc8bc60fada58e`; it is the selected publication target.

Markdown stringification initially escaped entity markers, which would display entities literally. The compilation fixture exposed this. A text handler now emits inert literals after Markdown escaping; seven fixture tests pass.


## Decision Log


On 2026-10-11, publish every concept in the `runtime-patterns` OKF bundle, including guides and migration guidance. The reserved `index.md` and `log.md` files provide navigation and history, not normative concept pages. Repository plans, skills, and ADRs remain outside the public inventory. Complete coverage means the corpus agents can discover, not every administrative file in the repository.

On 2026-10-11, retain one normative owner and generate the site from a pinned committed snapshot. Corrections to standards land upstream before site refresh. Source-faithful quotation and supplementary explanation must remain visibly distinct.

On 2026-10-11, use scoped logs as review context and Git trees plus hashes as completeness evidence. Offline CI establishes snapshot/output consistency; a separate local upstream comparison establishes freshness against a selected commit. Neither establishes technical correctness or agent compliance.

On 2026-10-11, bind SVG reviews to the material content of the source concepts they explain. A meaningful source change requires diagram review, even if the correct decision is to retain the drawing. An unrelated catalog commit must not invalidate every diagram.

On 2026-10-11, expand the initial six-diagram scope to a baseline of at least 18 useful SVGs, delivered in three batches. Review every catalog concept for visual value, without requiring a drawing on every page. Prioritize spatial boundaries, ordering, lifecycle states, failure/recovery paths, and composition; simple naming rules and short procedures can remain text-only. Record those decisions so future sync rounds can reconsider them when source changes. Eighteen is a baseline, not a ceiling, and diagrams must explain distinct ideas rather than pad a count.

On 2026-10-11, include doc-sync changes as implementation work. Do not register an empty patterns pointer while planning: it can only certify a completed review and publication baseline.


## Outcomes & Retrospective

Visual review covers all 88 canonical resources. The three six-asset batches plus configuration precedence provide 19 new SVGs; two existing evolution/upcaster diagrams are explicitly bound and reused without counting toward the new baseline. Every selected drawing was rendered in both themes; timer park/expiry and outbox boundaries were rerouted after clipping/arrow review. Desktop and phone expansion were inspected for each batch. Per-concept text-only reasons, source hashes, actor/time, and diagram asset hashes are recorded in `docs/patterns/presentation.json`.

Twelve focused fixtures pass: committed-only deterministic import, unknown metadata and supplied criteria, nested logs, inventory integrity, inert MDX including imports/exports, staging preservation, human collisions, material-change review invalidation, unrelated/review-only retention, complete-section retirement, prose quotation integrity, pointer status, unavailable sources, and divergent or failed Git comparisons. Full gate and final pointer remain pending.


Ownership and deterministic import are implemented. Publication review records committed inventory, scoped evidence, profile digest, and source qualification gaps. Remaining work is the complete visual review, doc-sync integration, and release/browser validation.


## Context and Orientation


The site uses React, TanStack Start, and Fumadocs. `source.config.ts` reads `content/docs/` and retains processed Markdown. `src/lib/source.ts` creates the page collection and Markdown text. `src/routes/docs/$.tsx` renders pages and source-view controls; it currently assumes every source belongs to this repository. `src/routes/docs/{$}[.]md.ts` serves processed Markdown. `src/routes/api/search.ts` provides search. `content/docs/meta.json` lists top-level sections. Add a generated `content/docs/runtime-patterns/` tree using these routes.

`package.json` defines `pnpm check`. Navigation and link checks are in `scripts/check-doc-navigation.mjs` and `scripts/check-doc-links.mjs`. `scripts/check-doc-prose.mjs` and `scripts/doc-prose.mjs` enforce release and writing policy, including selected words such as “gotcha” and non-Language-6 examples. Canonical patterns contain different prose and historical version material. Introduce an explicit policy for verified source quotations without rewriting the source or broadly disabling checks. `.github/workflows/ci.yml` runs individual gates; it currently omits the SVG gate even though `pnpm check` includes it.

`src/components/diagram.tsx`, `src/lib/diagram-svg.mjs`, and `src/styles/diagrams.css` support theme-aware SVGs and expansion. `content/diagrams/README.md` defines semantic classes, descriptive alt text, and a maximum viewBox width of 680 units. `scripts/render-diagram.mjs` produces light/dark previews; `scripts/check-doc-diagrams.mjs` checks asset contracts and page references.

Resolve `mori://shinzui/keiro-runtime-patterns/okf/runtime-patterns` through Mori. Within that project, `runtime-patterns/` contains Markdown concepts, generated indexes, and root and subject logs. Open Knowledge Format (OKF) is the metadata, relationship, index, and update-log convention governing this collection. `okf/runtime-patterns.dhall` imports the pinned `documentation.patternCatalog` profile, the schema used to validate concepts. At planning time the owner's validation script expects 88 graph nodes; determine actual coverage at implementation time rather than hard-coding that number. The registered document listing is smaller than the current bundle and cannot be the coverage denominator.

Concepts carry canonical `resource` URIs, types, descriptions, statuses, material timestamps, generated provenance, and sometimes reviews. Preserve unknown metadata too. The concept `mori://shinzui/keiro-runtime-patterns/docs/keiro-behavior-conformance` also carries `patternId: PAT-1`, applicability, and five assessment criteria. A criterion is an identified requirement with a statement, severity, and evidence kind. Most concepts do not yet have these fields. Publication must not invent assessment IDs or requirements.

The owner decision `mori://shinzui/keiro-runtime-patterns/okf/adrs/concepts/ADR-6` assigns implementation standards to the catalog and product explanations to this site. It discourages duplicate normative copies. Explicitly extend it to allow generated, versioned presentation while preserving one maintenance owner. `mori://shinzui/keiro-runtime-patterns/okf/adrs/concepts/ADR-8` isolates the bundle and establishes its profile, generated indexes, and nearest-log update contract. Resolve the exact handles through Mori and read those records before changing them. The local [release and writing ADR](../adr/0001-initial-release-scope-and-technical-writing.md) supports Language 6 product documentation and snapshot-derived terminology. Extend its scope boundary for audit quotations without restoring retired product tutorials. Local ADRs are ordinary Markdown, not a profiled OKF bundle.

Tracked skill files live in `agents/skills/doc-sync/`; `.agents/skills/doc-sync` is a symlink. `SKILL.md` assumes manually ported library docs. `LIBRARIES.md` lists upstreams, `POINTER.md` defines review boundaries, `TRIAGE.md` classifies changes, and `status.mjs` discovers `docs/*-source-sync.md`. Its parser expects `Qualified name (mori)` and `Last reviewed commit` headings with a full SHA and compares pointers with upstream HEAD. Preserve the library workflow while adding a generated-patterns branch.

The catalog already reconciles its own library dependencies through the skill declared at `mori://shinzui/keiro-runtime-patterns`, project-relative `agents/skills/update-patterns/SKILL.md` (artifact-level skill URI pending). Its sibling `sources.json` records reviewed source commits and configured branches. Those watermarks certify the catalog's source review; the new site pointer certifies review of a catalog publication. Importing the catalog must not advance its library watermarks.


## Plan of Work


### Milestone 1: Establish ownership and committed coverage


Resolve the owner through Mori, select one committed SHA, and use it throughout the round. Enumerate every non-reserved Markdown concept recursively from that Git tree, every index and scoped log, the profile descriptor, and the owner's upstream watermark ledger. Compare this inventory with the OKF graph. Registered DocRefs supplement routing but do not determine coverage. Report missing or duplicate resource identities as errors. Record commit, counts, type/status distributions, profile identity, and source-review gaps in `docs/patterns/publication-review.md`. Identify visual candidates throughout all seven subjects; Milestone 4 completes the per-concept decisions and drawings.

Read and validate the committed tree, never silently import a dirty checkout. Materialize the selected tree in a task-owned temporary directory when validation requires files. Run owner checks there because its script regenerates indexes. Preserve the user's owner checkout and branch.

Create `docs/adr/0002-publish-the-canonical-runtime-pattern-catalog.md`, rechecking allocation first and following local Markdown convention. Record source ownership, version evidence, diagram maintenance, historical-content labeling, and independent sync boundaries. Update the owner separation decision through its stable handle to permit generated publication. Follow owner instructions for timestamp, generated provenance, nearest log, index regeneration, and strict profiled ADR validation. Commit owner changes separately with this plan's canonical URI in the trailer. No standard should change merely to ease rendering.

Acceptance: the inventory accounts for every committed concept and log, the ownership decisions permit the projection, and relevant ADR validation passes. Do not create the site's reviewed pointer yet.


### Milestone 2: Import snapshots and generate deterministic pages


Add `scripts/runtime-patterns.mjs` with `--refresh --ref <commit-or-ref>`, default read-only `--check`, and read-only `--check-upstream [--ref <commit-or-ref>]`. Refresh resolves the owner through Mori and captures the requested ref as a full commit before extracting anything. Validate the selected committed tree, stage output, and report the fixed target. Upstream comparison reports unavailable checkout, drift, and dirty work without changing files or pointers. Offline check reads only committed site inputs.

Store `docs/patterns/catalog.json` with a schema version, source project/bundle URIs, full commit and committer date, profile descriptor and digest, declared upstream watermark ledger, complete raw concept Markdown and metadata, graph links, reserved indexes/logs, and sorted path/content hashes. Exclude local absolute paths and import-time wall-clock timestamps. Preserve raw bytes even where presentation requires escaping. Never mix concepts from different source revisions.

Add `scripts/lib/runtime-patterns.mjs` for parsing, generation, link mapping, and coverage validation. Generate one MDX page per concept under `content/docs/runtime-patterns/<subject>/<slug>.mdx`, including root concepts at their bundle-relative paths. Generate a landing page, section metadata, and a scoped change-history page. Keep supplementary configuration in `docs/patterns/presentation.json` and human-written audit guidance in `content/docs/runtime-pattern-audit.mdx`, outside generated ownership.

Treat Markdown as data, not executable JSX. Use Markdown-aware conversion to preserve braces, angle-bracket type notation, code fences, tables, and prose. Inspect existing parser/compiler dependencies through Mori and the lockfile before selecting APIs. Rewrite bundle links to local routes and retain anchors; map index links to section landing routes and log links to scoped history anchors. For references outside the bundle, preserve canonical URIs or resolve registered artifact identities. If artifact coverage is pending, display the canonical project URI together with its project-relative path. The registry currently supplies no owner repository URL, so do not fabricate GitHub links.

Validate staged output for traversal, collisions, resource duplicates, unsupported syntax, unresolved links, and exact coverage before replacing managed files. Remove only previously recorded generated files. Default check regenerates in memory and rejects missing, edited, or extra output and hash disagreement. Once the reviewed pointer exists, it must also reject pointer/snapshot disagreement. A staged refresh may intentionally leave the old review pointer unchanged until the remaining review is complete.

Add `sync:patterns`, `lint:patterns`, and `test:patterns` commands to `package.json`. Use `node --test scripts/runtime-patterns.test.mjs` with temporary Git repositories. Cover omitted/extra concepts, dirty-source exclusion, nested logs, rename/deletion cleanup, unsafe MDX-sensitive text, links and anchors, missing identities, unknown metadata and criteria preservation, deterministic reruns, and staged failure leaving existing output intact.

Acceptance: two refreshes of one SHA produce no second diff; offline checks work without upstream or Mori; fixtures pass; deleting or editing a generated page causes a specific failing diagnostic; uncommitted owner content is absent.


### Milestone 3: Publish the complete audit view


Add “Runtime patterns” to `content/docs/meta.json` and link it from `content/docs/index.mdx` and related getting-started pages. Group concepts by the seven current subjects, expose type/status in the catalog listing, and include the complete inventory in discovery. Retain deprecated or superseded entries with explicit labels and successor links where supplied. Label historical guidance without altering the source's status metadata or treating old examples as current product procedures.

Create `src/components/pattern-provenance.tsx` and wire it through `src/components/mdx.tsx` and generated pages. Show canonical URI, concept path, type/status, material timestamp, source actor, full catalog SHA, and supplied review records. A review applies to the material revision only when its document timestamp matches; preserve stale reviews as history. Expose owner watermark facts as declared review evidence, not a blanket claim that dependencies are current.

Render supplied applicability and criteria with original IDs, statements, evidence kinds, and required/advisory severity. The audit guide uses the real behavior-conformance criteria to demonstrate resource URI plus source SHA plus evidence citation. It distinguishes consulting a rule from proving implementation of it.

Update `src/routes/docs/$.tsx` so source controls identify the canonical owner for imported pages rather than offering a misleading normative edit target in this repository. Offer an external repository URL only if actual metadata supplies it. Ensure `src/lib/source.ts` and the Markdown route retain readable provenance and criteria. Replace diagram-component markup in copied Markdown with its textual alt/caption explanation. Confirm the existing search finds imported patterns.

Introduce a narrow verified-source policy in the prose checks. Only bodies proven generated from the snapshot can retain differing upstream prose or historical DSL examples. Locally authored landing text, audit guidance, captions, and explanations retain normal release/prose checks. A frontmatter flag alone cannot grant an exemption. Report upstream editorial or technical gaps in the publication review; a source claim about planned or candidate work stays qualified. Do not fix normative contradictions through a website-only rewrite.

Acceptance: navigation reaches every concept, search finds projection catalogs, rendered and copied Markdown show matching provenance and five behavior-conformance criteria, historical content is labeled, and existing product-page checks remain enforced. Browser-inspect the landing page, a long standard, a migration guide, an assessable standard, and scoped history.


### Milestone 4: Review visual needs and add at least 18 maintained SVG explanations


Assess every concept in the imported snapshot for whether a diagram clarifies its rules. Favor transaction/process boundaries, event ordering, composition wiring, state transitions, cursor positions, and recovery sequences. Leave simple terminology, naming conventions, and short textual procedures text-only when a drawing would merely repeat them. One diagram can explain several related concepts, and one complex concept can need several diagrams. The baseline is at least 18 distinct, useful SVGs; add more when the review identifies another important visual explanation. Do not require one per pattern or pad the count with decorative or duplicate drawings.

Record a visual assessment for each canonical resource in `docs/patterns/presentation.json`: diagram IDs or a brief text-only reason, plus the semantic source hash reviewed. This is the review of whether a picture is useful, separate from review of an existing picture's accuracy. New concepts and material changes invalidate that assessment until rechecked. Existing equivalent site diagrams can be reused and cross-linked with source bindings; record them in the inventory, but the expanded baseline calls for at least 18 new pattern explanations rather than counting unchanged incidental assets.

Use three batches of six so each batch can be rendered and reviewed before the next. All asset paths below are relative to `content/diagrams/runtime-patterns/`. Batch scope may be refined against the actual selected source, with substitutions justified in the publication review and the baseline preserved.

Batch 1 retains the six foundational explanations: `architecture/service-boundaries.svg`, `keiro/command-and-async-projections.svg`, `messaging/outbox-inbox.svg`, `keiro/workflow-recovery.svg`, `keiro/projection-rebuild.svg`, and `messaging/retry-and-checkpoint.svg`. Derive their claims from the architecture/domain, command/read-model, outbox/inbox, workflow, projection-catalog, and processing/subscription concepts. Explain the boundaries between isolated services, command transactions and async delivery, durable handoff and deduplication, journaled execution and recovery, fenced rebuild and live work, and retry versus checkpoint advancement.

Batch 2 adds six structural and replay explanations. `architecture/generated-and-hand-owned.svg` shows specification, generated modules, and create-once application responsibilities, anchored to `mori://shinzui/keiro-runtime-patterns/docs/architecture-spec-and-scaffolding` and `mori://shinzui/keiro-runtime-patterns/docs/architecture-generated-compilation-contract`. `keiki/checked-composition.svg` explains compatible sequential wiring and its consistency boundary from `mori://shinzui/keiro-runtime-patterns/docs/keiki-checked-composition`. `keiki/replay-and-hydration.svg` shows complete versus paged replay and settled/in-flight reconstruction from `mori://shinzui/keiro-runtime-patterns/docs/keiki-structured-replay-and-hydration`. `keiki/exact-projection-domains.svg` explains the complete projected image and verification obligations from `mori://shinzui/keiro-runtime-patterns/docs/keiki-exact-projection-domains`. `kiroku/log-positions-and-cursors.svg` distinguishes stream versions, append/visible frontiers, and exclusive read cursors from `mori://shinzui/keiro-runtime-patterns/docs/kiroku-append-and-read`. `kiroku/checkpoint-observation.svg` explains one coherent inventory snapshot and observation versus lifecycle mutation from `mori://shinzui/keiro-runtime-patterns/docs/kiroku-checkpoint-inventory`.

Batch 3 adds six lifecycle and operations explanations. `keiro/dead-timer-resume.svg` shows guarded claims, expiry, and recovery from `mori://shinzui/keiro-runtime-patterns/docs/keiro-dead-timer-resume`. `keiro/revision-generation-promotion.svg` distinguishes beside-serving rebuilds and guarded promotion from the fenced reset/replay in Batch 1, using `mori://shinzui/keiro-runtime-patterns/docs/keiro-projection-catalogs`. `keiro/behavior-obligations-and-evidence.svg` shows derived obligations, executed witnesses, and report/gate outcomes from `mori://shinzui/keiro-runtime-patterns/docs/keiro-behavior-conformance`. `messaging/fifo-heads-and-ordering.svg` explains job ordering boundaries from `mori://shinzui/keiro-runtime-patterns/docs/messaging-pgmq-jobs`. `messaging/connection-fault-retry-budget.svg` shows an outage, bounded retry layers, exhaustion, and lost-reply idempotency from `mori://shinzui/keiro-runtime-patterns/docs/messaging-pgmq-connection-faults`. `migrations/deployment-and-crash-recovery.svg` shows writer-stop, migration, verification, and ambiguous crash-state recovery from `mori://shinzui/keiro-runtime-patterns/docs/migrations-operations`.

Assess configuration and every other unlisted concept too. The batch list is a concrete starting selection, not a declaration that unlisted topics are unworthy of diagrams. For example, add a configuration-layer or deployment-boundary drawing if its choices become materially clearer through layout. Prefer a text-only reason when the source is already a short unambiguous rule. Avoid drawing planned behavior as though it were shipped.

Use spatial layout for boundaries, committed/pending states, acknowledgment decisions, and parallel lifecycle paths. Place every drawing next to the related source section and visibly identify it as a supplementary explanation. Follow `content/diagrams/README.md`, reuse the existing renderer, and introduce each drawing in prose. Keep one principal idea per SVG, using multiple diagrams where combining ideas would make labels or sequencing unreadable.

Each diagram entry in `docs/patterns/presentation.json` records source resource URIs, semantic content hashes last reviewed, placement heading, alt text, caption, review actor, and review time. Semantic hashes include body, applicability/criteria, and relevant status fields, excluding import commit and review-only timestamps. A material source change, removed concept, or missing placement heading fails `lint:patterns` until the asset is updated or explicitly re-approved after inspection. Review evidence is not automatic technical certification.

Acceptance for each batch: preview its six SVGs in both themes, inspect every PNG for clipping, arrows, labels, alignment, and contrast, and browser-check expansion and narrow layouts before continuing. Final acceptance requires at least 18 distinct explanations, every imported concept's visual assessment recorded and current, and every selected asset placed, referenced, and reviewed. Tests prove material source changes invalidate both applicable visual assessments and bound diagram reviews, unrelated commits do not, and actual review with new bindings clears the failure. A text-only decision remains valid when the review finds no useful picture; completeness is assessed by the recorded decisions, not by a diagram on every page.


### Milestone 5: Extend doc-sync and complete release integration


Update tracked `agents/skills/doc-sync/SKILL.md` description, triggers, argument examples, and ownership introduction for both manually ported library docs and generated pattern publication. Preserve `status`, `sync`, and `register`. Add `agents/skills/doc-sync/PATTERNS.md` with the exact pattern workflow and recovery rules. The `.agents/skills/doc-sync` symlink requires no duplicate edit.

Add `docs/runtime-patterns-source-sync.md`, Mori qualified name `shinzui/keiro-runtime-patterns`, and `content/docs/runtime-patterns/` to `LIBRARIES.md`. Extend `POINTER.md` for a generated source: its completed-review SHA must equal the snapshot commit, and review includes logs, profile, watermark evidence, diagrams, and related product explanations. Preserve the exact headings required by `status.mjs`. Create the initial pointer only after baseline review and verification.

Extend `TRIAGE.md` before its library-only admission rules. Every new authoritative concept gets a generated page. Changed rules or criteria update the projection and trigger review of related explanations and diagrams. Rename keeps canonical identity and redirects the old route when appropriate. Retirement follows owner intent and records history. Profile/log/watermark-only changes refresh evidence with explicit review outcomes. A prose-only owner commit is not automatically NO-OP because that prose is the canonical source.

The new companion procedure resolves the owner, fixes a target commit, and compares it with the reviewed pointer. Read changed ADRs, every affected nearest log, graph/inventory changes, and actual concept diffs. Build a ledger covering every commit with ADD, UPDATE, RETIRE, or reasoned NO-OP. Use Git diff for completeness even when the root log is unchanged. Validate the committed catalog, refresh to the fixed target, review source qualification gaps and generated changes, repair supplemental links, review invalidated diagrams and reconsider visual assessments for new or materially changed concepts, and run gates. Only then advance the pointer, update-command SHA, and current-range summary. A partial round leaves the pointer unchanged and records staged target and remaining work in the plan.

Explain the two independent directions: library source is reconciled into the catalog by the owner update-patterns skill when in authorized scope; committed catalog changes flow into the site's snapshot. Import must not advance owner library watermarks. A library-only site sync reports catalog subjects potentially affected and any discovered catalog drift, rather than claiming pattern freshness. Respect the owner's configured source branches and dirty checkouts; import does not require pulling or switching them.

Extend `status.mjs` only as needed to report imported SHA, completed-review SHA, stale diagram bindings and visual assessments, unavailable sources, and non-ancestor ranges alongside normal drift. Keep `--json` machine-readable and status read-only. Distinguish imported-but-unreviewed output from completed publication. Do not classify a failed Git comparison or non-ancestor ref as current. Add focused fixtures for these failure cases while preserving library behavior.

The initial pointer records actual SHA and committer date, complete inventory, scoped logs, profile evidence, known source gaps, the complete visual-assessment inventory, at least 18 diagram reviews, and coupled product pages. It certifies faithful reviewed catalog publication, not release certification of every source claim. Wire `test:patterns`, `lint:patterns`, and `lint:diagrams` into `pnpm check` and the individual jobs in `.github/workflows/ci.yml`. Update `README.md` and `content/docs/getting-started/contributing.mdx` with ownership, refresh commands, generated-file restrictions, diagram review, and offline consistency versus upstream freshness.

Acceptance: filtered and all-upstream status include patterns with correct snapshot/pointer information. A temporary next catalog commit changing a concept and nested log with unchanged root log must trigger refresh and diagram review; failure leaves the pointer unchanged. Completed review advances pointer and snapshot to the same fixed SHA. The full gate and browser checks pass. Distill final project decisions into ADRs before completion.


## Concrete Steps


Run site commands from `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`. Use Nix for the project toolchain. Commands for new scripts apply after their milestone implements them.

```bash
mori registry list
mori registry show shinzui/keiro-runtime-patterns --full
mori registry docs shinzui/keiro-runtime-patterns
mori registry bundles shinzui/keiro-runtime-patterns
mori registry concepts shinzui/keiro-runtime-patterns --bundle runtime-patterns
mori path mori://shinzui/keiro-runtime-patterns/okf/adrs/concepts/ADR-6
mori path mori://shinzui/keiro-runtime-patterns/okf/adrs/concepts/ADR-8
```

Resolve the owner and select the committed SHA. Normal refresh performs committed-tree validation in a temporary tree; do not run its index-regenerating check against a dirty checkout.

```bash
PATTERNS_REPO=$(mori path mori://shinzui/keiro-runtime-patterns)
git -C "$PATTERNS_REPO" status --short
git -C "$PATTERNS_REPO" log -1 --format='%H%n%cI%n%s'
```

Replace `SELECTED_SHA` below with the selected full 40-hex commit, not a moving HEAD. The consistency command must report count and imported SHA, exiting zero only when generation, reviewed pointer, and diagram bindings agree.

```bash
nix develop -c pnpm run sync:patterns -- --ref SELECTED_SHA
nix develop -c pnpm run test:patterns
nix develop -c pnpm run lint:patterns
node agents/skills/doc-sync/status.mjs runtime-patterns --json
node agents/skills/doc-sync/status.mjs
nix develop -c pnpm check
git diff --check
```

Upstream comparison is separately read-only:

```bash
nix develop -c node scripts/runtime-patterns.mjs --check-upstream --ref SELECTED_SHA
```

Render every selected asset in each Milestone 4 batch, including any added beyond the baseline of 18. The preview command defaults to both themes.

```bash
nix develop -c node scripts/render-diagram.mjs content/diagrams/runtime-patterns/keiro/command-and-async-projections.svg
nix develop -c pnpm run lint:diagrams
nix develop -c pnpm dev
```

Open `http://127.0.0.1:5214/docs/runtime-patterns`, `/docs/runtime-patterns/keiro/projection-catalogs`, `/docs/runtime-patterns/keiro/behavior-conformance`, and each page's offered Markdown view. Inspect listing completeness, source SHA, criteria, scoped history, search, and diagrams. Stop the development server after inspection. Record actual outputs and reviewed commit in this plan during implementation.


## Validation and Acceptance


Coverage means exactly one normative page for every non-reserved Markdown concept in the selected committed bundle, with no unexplained extra page. Source wording, raw bytes, identities, metadata, criteria, logs, and declared upstream evidence survive publication apart from documented presentation transformations. Historical/candidate statements stay qualified and do not become recommended product procedures.

Run `node --test scripts/runtime-patterns.test.mjs` plus focused status tests. They must demonstrate missing concepts, edited output, unresolved links, MDX-sensitive input, dirty-source exclusion, deterministic reruns, partial-write recovery, stale SVG review, and pointer mismatch. Offline tests and consistency checks run without a Mori registry or upstream checkout; owner fixtures are temporary. A separate upstream check distinguishes unavailable source from a consistent snapshot.

The required incremental exercise uses a temporary owner repository with baseline and next commits. Change a concept plus its nearest log while leaving the root log unchanged. Observe drift, stage import, observe stale diagram failure with unchanged pointer, perform review, and complete publication with matching snapshot/pointer SHA. Repeat for rename and deletion to demonstrate route policy and cleanup. Do not alter the user's production owner checkout for this exercise.

`nix develop -c pnpm check` and CI must pass the added catalog and SVG gates. Browser inspection verifies owner source controls, provenance and criteria in Markdown, search discovery, complete navigation, and at least 18 distinct, readable diagrams in both themes and narrow layouts. Every catalog concept must have a current visual assessment, including justified text-only decisions. Check imported anchors against actual headings: the existing link checker strips anchors and does not prove their validity.


## Idempotence and Recovery


Generation is deterministic for a selected commit and presentation configuration. Validate staged results before replacing managed output, and remove only task-owned temporary files and recorded generated artifacts. Refuse to overwrite human-written route collisions or unrelated local edits. Interrupted refresh can regenerate from the prior committed snapshot or rerun against the same fixed target.

Keep the prior completed-review pointer until all review passes. A newer imported snapshot with an older pointer is an explicit incomplete state. Never advance a pointer to hide incomplete diagrams or an unreviewed range, and never roll a pointer back while leaving newer content advertised as reviewed.

Renames retain canonical identities; retirements follow owner intent. Use a redirect or labeled removal page where the prior identity matters. Never recycle assessment IDs or redirect a removed standard to unrelated guidance.

Use Conventional Commits on the current branch. Site commits include the repository-local `ExecPlan:` trailer for this file. Owner commits use `ExecPlan: mori://shinzui/keiro-runtime-docs/plans/48-publish-the-runtime-pattern-catalog-with-svg-diagrams-and-incremental-synchronization`. Every commit also includes `Intention: intention_01m4pkhk4eewr91e9bj6h09ep8`. This plan requires no deployment. Planning creates only this document; publication and skill changes remain implementation work.


## Interfaces and Dependencies


Reuse existing Node/pnpm, Fumadocs, TanStack, Markdown, and SVG infrastructure. Locate dependency APIs through Mori and local primary source. No package bounds or pins change by default; verify registry releases and upstream tags before any necessary change. Never search `/` or `/nix/store`.

`scripts/lib/runtime-patterns.mjs` exposes pure parsing and rendering functions receiving explicit snapshot/presentation values. `scripts/runtime-patterns.mjs` owns Git, Mori, filesystem staging, and CLI orchestration. Snapshot concept records contain bundle-relative path, canonical resource URI, raw Markdown, complete parsed metadata, raw-byte hash, and semantic hash. Serialize records and keys consistently. Preserve schema version, source/profile/input identities, graph links, reserved files, and owner source-review facts.

`docs/patterns/presentation.json` is the maintenance interface for related product routes and per-concept visual assessments and diagram source associations/reviews, keyed by canonical resource identity. Generated MDX is an output, not an editing interface. `src/components/pattern-provenance.tsx` receives serialized source facts and renders accessible, copyable identities.

`docs/runtime-patterns-source-sync.md` is the completed-review boundary read by `agents/skills/doc-sync/status.mjs`. `docs/patterns/catalog.json` holds published source data. `agents/skills/doc-sync/PATTERNS.md` documents their coordinated maintenance. The owner library ledger remains separate and is captured as evidence without being updated by import.

Creation note (2026-10-11): Created a five-milestone plan for complete pattern publication, provenance and assessment criteria, six SVG explanations, and incremental maintenance through doc-sync. No publication, pointer advance, or skill implementation has occurred.

Revision note (2026-10-11): Linked the user-supplied intention in frontmatter and required its trailer on implementation commits.

Revision note (2026-10-11): Expanded visual scope from six to at least 18 SVG explanations in three batches, added a full-catalog visual-needs review with text-only decisions, and updated synchronization, progress, and acceptance requirements. The user requested broader useful coverage without a diagram for every pattern.

Revision note (2026-10-11): Implemented ownership and committed-tree import, recorded inventory evidence, and added failure and incremental synchronization fixtures.

Revision note (2026-10-11 23:53Z): complete the visual assessment inventory, add configuration and equivalent reused illustrations, record responsive and Markdown-export findings, and implement independent generated-source synchronization/status fixtures.
