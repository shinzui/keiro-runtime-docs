# Runtime patterns docs ↔ source sync pointer

This boundary covers generated publication of the complete canonical runtime pattern bundle, its supplied audit evidence, and the site's supplementary explanations. The committed snapshot is imported from one Git tree; this pointer certifies the completed source, visual, product-page, and browser review of that publication. It is independent of the owner's library review watermarks.

## Upstream source

- **Qualified name (mori):** `shinzui/keiro-runtime-patterns` — resolve with `mori registry show shinzui/keiro-runtime-patterns --full`.
- **Path at last sync:** `/Users/shinzui/Keikaku/bokuno/keiro-runtime-patterns` — a checkout hint for `mori://shinzui/keiro-runtime-patterns`; Mori remains authoritative.
- **Bundle reviewed:** `mori://shinzui/keiro-runtime-patterns/okf/runtime-patterns`.
- **Ownership decisions reviewed:** `mori://shinzui/keiro-runtime-patterns/okf/adrs/concepts/ADR-6` and `mori://shinzui/keiro-runtime-patterns/okf/adrs/concepts/ADR-8`.
- **Reviewed release:** committed catalog publication, not certification of every declared dependency release. The captured profile is `documentation.patternCatalog` from OKF profiles v0.18.0.

## Last reviewed commit

```text
5957590e4370f6a791ef1f7480c00c3809526f6c  (5957590e)
2026-10-14T15:21:59-07:00
docs(keiro): document mapped construction in DSL adoption guide
```

> **Current range.** `2102ba1c..5957590e` (**2 commits**). Reviewed two committed catalog changes. Added generated Kiroku and Shibuya inspection standards; updated 39 existing concepts and all affected scoped evidence. The complete committed inventory is 90 concepts, 16 reserved files and graph 90 nodes/740 edges. Reassessed 41 concepts and 13 bound figures, correcting the PGMQ classifier label to implemented/unreleased. All reviewed figures rendered in both themes and passed desktop plus actual 390-pixel iframe expansion checks. Six product pages were added and coupled API/migration/replay guidance reconciled independently. Preserved the owner profile and eight watermarks exactly; importing did not advance owner library reviews. Keiki SCXML, Shibuya post-tag additions and PGMQ post-tag fixes remain outside the owner published boundary.
> Every commit is classified in [the sync ledger](source-sync-2026-10-14.md). No pages retired. The reviewed committed tree was clean.

> **Note (prior range).** Initial complete-tree publication baseline. Added one generated normative page for each of 88 concepts, seven subject sections, the landing page, and all eight scoped histories from 16 reserved files. The validated graph contains 88 nodes and 707 edges. Captured complete raw Markdown, unknown metadata, the profile descriptor, hashes, and eight independently reviewed library boundaries. The selected owner commit authorizes faithful publication through ADR-6; it changes no implementation standard. The owner checkout is clean and no watermark was advanced.

## Initial publication evidence (prior range)

The following records the initial publication at `2102ba1cce26d0f7ccfee775f5fc8bc60fada58e`.
The current incremental review and independently advanced product pointers are recorded in
[the sync ledger](source-sync-2026-10-14.md).

Every concept has a current visual assessment. Nineteen new diagrams and two explicitly reused figures were checked against their bound concepts and rendered in both themes. Desktop and 390-pixel expansion checks cover all three drawing batches and the additional configuration explanation. Drawings and assessments are bound to material source hashes; figure reviews also record asset hashes.

Only `PAT-1` supplies an assessment ID and five criteria. Other concepts retain their actual metadata without invented obligations. Historical language, generated Haskell, migration, and Codd examples remain qualified source quotations. September owner review boundaries, planned mapped-register work, excluded unpublished Shibuya candidates, package-cohort constraints, and historical technical reviews remain visible evidence rather than blanket release approval. See [publication review](patterns/publication-review.md).

Coupled product review clarified subscription delivery as the rich-query default and the covering-snapshot requirement after history truncation. Projection catalog API references now link to the separately pinned catalog baseline. Deploy ordering, evolution gates, and event-envelope upcasting remain consistent with the bound explanations. Ordinary library pointers remain unchanged; their outstanding upstream ranges need their own doc-sync rounds.

The complete release gate passed after production search and nested Markdown export repairs: 12 pattern/status fixtures, seven prose fixtures, zero prose errors, terminology, typechecking, lint, formatting, navigation, SVG contracts, production build, and source link checks. Browser review verified catalog discovery and navigation, long and migration guidance, scoped history, matching source SHA, all five criteria, the offered plain Markdown view, and copied textual diagram explanations. The static link crawler reports zero scanned links; the source link checker independently validates all 598 document files, and the importer validates its bundle anchors.

## Most-coupled pages

- [Generated catalog tree](../content/docs/runtime-patterns/), [snapshot](patterns/catalog.json), [presentation inventory](patterns/presentation.json), and [publication review](patterns/publication-review.md).
- [Audit guide](../content/docs/runtime-pattern-audit.mdx), [provenance component](../src/components/pattern-provenance.tsx), and [Markdown export](../src/lib/source.ts).
- [Projections, read models, and snapshots](../content/docs/keiro/explanation/projections-read-models-and-snapshots.mdx) and [projection catalog reference](../content/docs/keiro/reference/projection-catalog.mdx).
- [Deploy ordering](../content/docs/keiro/reference/deploy-ordering.mdx), [evolution and replayability](../content/docs/keiro/explanation/evolution-and-replayability.mdx), and [event-envelope upcasting](../content/docs/keiki/walkthrough/rendering-and-codecs/08-th-derivers.mdx).
- [Diagram assets](../content/diagrams/runtime-patterns/) and the reused assets recorded in the presentation inventory.

## Previous pointers

- `2102ba1cce26d0f7ccfee775f5fc8bc60fada58e` (2026-10-11T16:28:51-07:00) — baseline before the 2026-10-14 review; `2102ba1c..5957590e` (2 commits) reconciles runtime-patterns source and retains explicit publication limits.

## Update procedure

Follow [the generated-patterns workflow](../agents/skills/doc-sync/PATTERNS.md). Resolve the owner with Mori, choose one full committed target, and classify its complete Git range from `5957590e4370f6a791ef1f7480c00c3809526f6c`. Read every changed concept and nearest log, root and section indexes, affected ADRs, graph/profile changes, and watermark changes. A quiet root log does not establish completeness.

The commands below reproduce this completed baseline; a subsequent round must substitute its newly selected full target:

```bash
mori registry show shinzui/keiro-runtime-patterns --full
nix develop -c bun run sync:patterns --ref 5957590e4370f6a791ef1f7480c00c3809526f6c
nix develop -c node scripts/runtime-patterns.mjs --check-upstream --ref 5957590e4370f6a791ef1f7480c00c3809526f6c
nix develop -c bun run check
nix develop -c node agents/skills/doc-sync/status.mjs runtime-patterns --json
```

Import leaves this pointer unchanged. Finish every ADD, UPDATE, RETIRE, or explicit NOOP decision, re-review stale visual decisions and affected figures, check coupled product pages, and verify browser/source controls before advancing it. Partial rounds keep the old boundary. Refresh rejects edited generated files and human collisions; recover those explicitly rather than overwriting them. Offline checks establish consistency, while the separate upstream comparison establishes freshness. Neither proves agent compliance.
