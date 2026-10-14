# Runtime pattern publication review

Latest completed target: `5957590e4370f6a791ef1f7480c00c3809526f6c`; see the incremental review below.

Selected committed revision: `2102ba1cce26d0f7ccfee775f5fc8bc60fada58e` (2026-10-11T16:28:51-07:00). Normative owner: `mori://shinzui/keiro-runtime-patterns/okf/runtime-patterns`. Ownership authorization: `mori://shinzui/keiro-runtime-patterns/okf/adrs/concepts/ADR-6`.

## Inventory and validation

The committed Git tree contains 88 concepts and 16 reserved files. The OKF graph contains 88 nodes and 707 edges. Every non-reserved Markdown concept has one identity and one generated normative page. Registered DocRefs supplement discovery; they are not the denominator.

Types: Standard: 46, Pattern: 6, Overview: 7, Runbook: 4, Gotcha: 3, Navigation: 1, Guide: 19, Assessable Standard: 1, Reference: 1. Statuses: current: 88.

Profile descriptor in `mori://shinzui/keiro-runtime-patterns`, project-relative `okf/runtime-patterns.dhall` (artifact-level URI pending), SHA-256 `01be974e8b8a72abfc9ddf315a2fc20fb5b81ffce72bfbacb40ee7d86138738f`.

```dhall
let profiles =
      https://raw.githubusercontent.com/shinzui/okf-profiles/v0.18.0/package.dhall
        sha256:7d3a4a22be12fd0e697d6012ed1eb2efe4cb5dc4700d08fd49aa5e4c0e523df8

in  profiles.documentation.patternCatalog

```

Owner checks ran against a task-owned temporary Git tree. Strict runtime profile checks, graph coverage, generated index determinism, and ADR profile checks passed. The owner checkout was clean before the separately committed ADR change. No standard was changed for rendering.

## Scoped evidence

- `mori://shinzui/keiro-runtime-patterns`, project-relative `runtime-patterns/architecture/index.md` (reserved artifact URI pending).
- `mori://shinzui/keiro-runtime-patterns`, project-relative `runtime-patterns/architecture/log.md` (reserved artifact URI pending).
- `mori://shinzui/keiro-runtime-patterns`, project-relative `runtime-patterns/config/index.md` (reserved artifact URI pending).
- `mori://shinzui/keiro-runtime-patterns`, project-relative `runtime-patterns/config/log.md` (reserved artifact URI pending).
- `mori://shinzui/keiro-runtime-patterns`, project-relative `runtime-patterns/index.md` (reserved artifact URI pending).
- `mori://shinzui/keiro-runtime-patterns`, project-relative `runtime-patterns/keiki/index.md` (reserved artifact URI pending).
- `mori://shinzui/keiro-runtime-patterns`, project-relative `runtime-patterns/keiki/log.md` (reserved artifact URI pending).
- `mori://shinzui/keiro-runtime-patterns`, project-relative `runtime-patterns/keiro/index.md` (reserved artifact URI pending).
- `mori://shinzui/keiro-runtime-patterns`, project-relative `runtime-patterns/keiro/log.md` (reserved artifact URI pending).
- `mori://shinzui/keiro-runtime-patterns`, project-relative `runtime-patterns/kiroku/index.md` (reserved artifact URI pending).
- `mori://shinzui/keiro-runtime-patterns`, project-relative `runtime-patterns/kiroku/log.md` (reserved artifact URI pending).
- `mori://shinzui/keiro-runtime-patterns`, project-relative `runtime-patterns/log.md` (reserved artifact URI pending).
- `mori://shinzui/keiro-runtime-patterns`, project-relative `runtime-patterns/messaging/index.md` (reserved artifact URI pending).
- `mori://shinzui/keiro-runtime-patterns`, project-relative `runtime-patterns/messaging/log.md` (reserved artifact URI pending).
- `mori://shinzui/keiro-runtime-patterns`, project-relative `runtime-patterns/migrations/index.md` (reserved artifact URI pending).
- `mori://shinzui/keiro-runtime-patterns`, project-relative `runtime-patterns/migrations/log.md` (reserved artifact URI pending).

## Source qualification gaps

The captured owner ledger has 8 independently reviewed library boundaries. Its September review dates predate this October publication. It explicitly excludes unpublished coordinated Shibuya lifecycle candidates, keeps mapped-register construction planned, and records package-cohort constraints. Import leaves every watermark unchanged. Publication is faithful review, not release certification of those claims.

Language-version, older generated Haskell, Codd transition, migration, and upgrade examples remain historical source evidence. The site labels canonical quotations and keeps Language 6 as the policy for local product procedures. Upstream titles and wording such as “gotchas” remain only in verified source fields.

Supplied technical reviews that do not match the material timestamp are labeled historical. Only behavior conformance supplies an assessment ID and five criteria; none were invented for other concepts.

## Presentation transformations

Parse source Markdown with the parser versions already supplied by `mori://fuma-nama/fumadocs`. Escape executable MDX-sensitive text through the parsed tree; preserve fenced and inline code, tables, and literal content. Rewrite bundle links to local routes and validate heading anchors. Administrative paths outside bundle coverage retain canonical owner URI plus encoded project-relative path (artifact URI pending). Preserve complete raw Markdown in the snapshot. Scoped logs are quoted as text under stable history anchors.

## Visual review

All 88 concepts have current semantic-hash-bound visual decisions in `presentation.json`, including specific text-only reasons. Nineteen new assets cover every subject: three six-diagram batches as planned, plus configuration source order, malformed-winner behavior, and secret sensitivity. Two equivalent site drawings are reused with explicit bindings for evolution gates and event-envelope upcasting; they do not count toward the new baseline.

Every selected SVG was rendered and inspected in light and dark themes. Reviews checked boundaries, labels, arrows, clipping, contrast, and source qualification. Outbox grouping, post-commit waiting, and timer park/expiry arrows were corrected after inspection. Each batch was checked in the browser at desktop and 390-pixel width; narrow expanded drawings scroll at native size. The asset hashes additionally invalidate reviews when the drawing itself changes. Shared drawings link from related concepts to their actual placement.

The new drawings intentionally distinguish offline fenced rebuild from beside-serving generations, honest unverified conformance from proof strength, and the released PGMQ classifier defect from its unreleased fix.

## Incremental proof and release gates

The temporary-repository tests cover a material concept plus nearest-log change with unchanged root log. Import leaves the completed pointer unchanged and fails stale visual review. Explicit re-review and matching pointer clear it. Rename retains identity and a route stub; deletion keeps a labeled historical route. Deterministic reruns, missing/edited/extra outputs, dirty-source exclusion, safe literal compilation, and staged failure preservation pass.

The complete release gate passed after the final presentation fix: 12 pattern/status fixtures and seven prose fixtures, zero prose errors, terminology, typechecking, lint, formatting, 598-page navigation, all 259 SVG assets/references, production build, and source links. This original review preceded the Bun migration. The static crawler reports zero links scanned; the source checker and importer provide document/link and bundle-anchor coverage instead.

On 2026-10-12, a fresh frozen Bun install and `KEIRO_DOCS_SKIP_FONTS=1 nix develop -c bun run check` revalidated the same publication. All 19 fixtures and the full gate passed; the production output contains 599 HTML files, 598 Markdown exports, and static search JSON. The post-build artifact guard verifies representative pattern HTML, search discovery, and Markdown output. This toolchain revalidation leaves the imported source revision and completed review boundary unchanged.

Production browser review covered the landing inventory, long read-model standard, historical Codd migration, behavior-conformance criteria, eight scoped histories, every drawing batch on desktop and phone, and the additional configuration illustration. Search finds the imported projection catalog and opens its real route. The offered Markdown view and copy control preserve canonical resource, full revision, applicability, all five criteria, and readable diagram text without executable component markup or a fabricated owner edit URL. Search exports an explicit JSON artifact to avoid SPA-shell rewriting; nested Markdown exports use the plain-text splat endpoint.

Coupled product review corrected rich-query delivery policy and the truncated-history snapshot exception in the read-side explanation, and linked the product catalog reference to canonical policy. Deploy ordering, evolution gates, and event-envelope upcasting remain coherent. Product API references retain their independent library review boundaries; ordinary upstream drift is not hidden by the new publication pointer.

The completed baseline is recorded in `docs/runtime-patterns-source-sync.md` at the selected full SHA after source, visual, product, browser, and release checks. The owner checkout is clean and its eight library watermarks are unchanged.

Final read-only status reports the patterns publication as `reviewed`, with matching imported/completed-review SHAs, no pending visual issues, zero commits behind, and a clean owner checkout. The complete status command still discovers all 12 boundaries: eight pre-existing library boundaries are behind and four boundaries are current. No ordinary library pointer was advanced. The review browser blocked direct plain-text navigation/reload with `ERR_BLOCKED_BY_CLIENT`; opening the site's offered Markdown link displayed the complete final artifact, and HTTP 200 `text/plain` plus the copy control were independently verified.

## Incremental source review — 2026-10-14

Reviewed committed owner range `2102ba1cce26d0f7ccfee775f5fc8bc60fada58e` through
`5957590e4370f6a791ef1f7480c00c3809526f6c` (committer date 2026-10-14T15:21:59-07:00).
The owner checkout was clean. No owner files, library watermarks, branch, or release tags were changed.

| Commit in `mori://shinzui/keiro-runtime-patterns` | Action | Outcome |
| --- | --- | --- |
| `63d1a9b031785fc72ffee157a197d8f3452a3bd8` | ADD / UPDATE | Two inspection standards; published cohort, mapped construction, strict contract lists, guarded commands, subscription/migration/PGMQ operating rules, scoped logs/indexes and owner source ledger reconciled. |
| `5957590e4370f6a791ef1f7480c00c3809526f6c` | UPDATE | DSL adoption now routes construct-only mapped transitions to declared initial/lift writes while preserving totality and replay obligations. |

Git inventory and the complete generated diff cover 90 non-reserved concepts, 16 reserved files,
90 graph nodes and 740 edges. There are two additions, 39 materially updated existing concepts,
49 semantically unchanged concepts, and no renames or retirements. The 97 existing generated MDX
pages also receive the new immutable source revision; two new pages bring the projection to 99 MDX
pages. The captured profile descriptor is unchanged at SHA-256
`01be974e8b8a72abfc9ddf315a2fc20fb5b81ffce72bfbacb40ee7d86138738f`.
Changed nearest logs are architecture, config, Keiro, Kiroku, messaging, migrations, and root;
the unchanged Keiki history is retained. Ownership ADRs/profile were unchanged in this range.

The complete eight-row owner ledger is captured verbatim in `catalog.json`. Its Keiro and Kiroku
boundaries cover the new published cohorts. Keiki stops at `127d348a`, Shibuya at published
`de42f07a`, and PGMQ at published `696b6bd2`; their later source work remains explicitly unreleased.
The separate site API reviews can cover those source-only APIs without advancing these owner pins.
Candidate Language 6 remains candidate despite package 0.21 publication. Historical assessment
metadata is retained; no assessment IDs or criteria were invented.

### Incremental visual decisions

Reassessed all 41 changed/new concepts against their material hashes. The two new inspection
standards are text-only: endpoint/capability and refusal tables, exact cursor rules, process scope,
and recovery conditions are more precise than an additional topology. Existing checkpoint,
position, and processing drawings cover the common boundaries. Other changed text-only concepts
retain their specific syntax, checklist, compatibility, or instrumentation rationale.

Re-read all 20 canonical resources bound to the 13 invalidated figures, including unchanged coupled
resources, and inspected both light/dark renders. The asset inventory stays at 19 new drawings plus
two equivalent reused site figures; no new asset or criterion was needed.

| Figure | Source/visual review result |
| --- | --- |
| Command and async projections | Minimal synchronous authority remains inside commit; rich views and bounded waits remain after commit. Guarded admission does not change the depicted success boundary. |
| Outbox/inbox | Scalar contract arrays change payload shape, not local atomic enqueue, stable transport identity, or receipt retention. |
| Offline projection rebuild | Whole-group fence, bounded replay, source exhaustion and atomic promotion remain accurate. |
| Retry/checkpoint | AckHalt remains cancellation with no advance; typed decode stops and configurable bounds are qualified in prose. |
| Log positions/cursors | Sparse exclusive cursors and visible head remain distinct from the append frontier; the new originated head has its own scoped prose. |
| Checkpoint observation | One-statement durable observation remains separate from explicit resize/rebind mutation. |
| Dead timer resume | The expiring claim, external execution and park/recovery arrows remain accurate; configurable source retry does not change timer ownership. |
| Revision generation promotion | Candidate/serving separation and atomic final promotion remain accurate with guarded serving bindings. |
| Behavior obligations | Initial-hole history witnesses still reconcile into the same nine buckets and distinct completeness/proof-strength gates. |
| FIFO heads | Absolute group-head blocking remains the released order rule; client polling does not alter that rule. |
| Connection-fault retry budget | Corrected “planned” to “implemented but unreleased”; retained the released first-disconnect defect, separate budgets, and enqueue identity caveat. |
| Deployment/crash recovery | The explicitly labeled Keiro 0032 cutover and audited Running repair remain correct; added Kiroku 0012–0015 conditions stay in the owning text. |
| Reused evolution gates | Own-revision removal reports and used-lift identity still belong to the same distinct evidence boundaries. |

All 13 figures expanded and closed in the live site at desktop width and in a real 390×844 browser
iframe. The browser viewport override did not change actual window dimensions, so the iframe was
used and its `innerWidth = 390` verified. Expanded frames retained 660-pixel SVGs (680 for the reused
evolution figure), with a 305-pixel horizontal scrolling region and `overflow-x: auto`. A narrow
screenshot confirmed readable native-size content and reachable close control. Both theme renders
had legible labels, arrows, borders and contrast without clipping. Source/asset hashes and actual
review times are recorded in `presentation.json` after inspection.

The separate Kiroku migration-manifest drawing now includes 0013, 0014 and 0015 and the 15-entry
fresh-database boundary; both themes were rendered and inspected. It is not a new pattern asset.

### Coupled product and browser review

Added six product pages: descriptive SCXML reference, guarded-command how-to, Kiroku inspection
reference, resize/rebind and tail-recovery guides, and unreleased Shibuya pause/resume guide.
Updated source tours, projection/DSL/replay/migration/telemetry references, configuration/installation,
adapter composition, and FAQs. Product procedures keep Language 6 and explicit candidate/source-only
qualifications. Registry-aware schema comparison preserves strict unknown/missing/changed-object
handling and does not certify runtime view definitions.

Browser review covered both new standards, every new product route, source details with the full
selected SHA, scoped history, search discovery/open of the Shibuya standard, and the Kiroku standard's
Copy Markdown and offered View as Markdown. Copied and opened text retains canonical identity,
revision, qualification and exact protocol vocabulary. Diagram text fallbacks and captions remain
present. The quoted owner watermark notes exposed a prose-checker gap; the quotation exception now
covers only byte-identical regenerated provenance, while local prose and forged/edited content
remain checked by a regression test.

Validation: final complete gate outcome is recorded in [the sync ledger](../source-sync-2026-10-14.md).
