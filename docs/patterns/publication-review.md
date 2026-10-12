# Runtime pattern publication review

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

The complete `nix develop -c bun run check` release gate passed after the final presentation fix: 12 pattern/status fixtures and seven prose fixtures, zero prose errors, terminology, typechecking, lint, formatting, 598-page navigation, all 259 SVG assets/references, production build, and source links. The static crawler reports zero links scanned; the source checker and importer provide document/link and bundle-anchor coverage instead.

Production browser review covered the landing inventory, long read-model standard, historical Codd migration, behavior-conformance criteria, eight scoped histories, every drawing batch on desktop and phone, and the additional configuration illustration. Search finds the imported projection catalog and opens its real route. The offered Markdown view and copy control preserve canonical resource, full revision, applicability, all five criteria, and readable diagram text without executable component markup or a fabricated owner edit URL. Search exports an explicit JSON artifact to avoid SPA-shell rewriting; nested Markdown exports use the plain-text splat endpoint.

Coupled product review corrected rich-query delivery policy and the truncated-history snapshot exception in the read-side explanation, and linked the product catalog reference to canonical policy. Deploy ordering, evolution gates, and event-envelope upcasting remain coherent. Product API references retain their independent library review boundaries; ordinary upstream drift is not hidden by the new publication pointer.

The completed baseline is recorded in `docs/runtime-patterns-source-sync.md` at the selected full SHA after source, visual, product, browser, and release checks. The owner checkout is clean and its eight library watermarks are unchanged.

Final read-only status reports the patterns publication as `reviewed`, with matching imported/completed-review SHAs, no pending visual issues, zero commits behind, and a clean owner checkout. The complete status command still discovers all 12 boundaries: eight pre-existing library boundaries are behind and four boundaries are current. No ordinary library pointer was advanced. The review browser blocked direct plain-text navigation/reload with `ERR_BLOCKED_BY_CLIENT`; opening the site's offered Markdown link displayed the complete final artifact, and HTTP 200 `text/plain` plus the copy control were independently verified.
