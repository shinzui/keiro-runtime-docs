# Publish the canonical runtime pattern catalog

Status: Accepted

Date: 2026-10-11

## Context

Agents discover implementation standards through `mori://shinzui/keiro-runtime-patterns/okf/runtime-patterns`. Readers need the same corpus on the product site, with observable version evidence and explanations of boundaries and recovery. Manual copies would create a second maintenance owner.

## Decision

Generate every concept from one validated committed Git tree. Keep raw bytes, complete metadata, reserved indexes and scoped logs, the profile, graph, hashes, and declared library review watermarks in a deterministic site snapshot. Offline checks establish projection consistency; a separate Mori/Git comparison establishes freshness against a selected source commit. Neither certifies technical correctness or agent compliance.

Keep normative corrections in the owner. Source controls show its canonical identity and full commit; offer a repository link only when actual metadata supplies one. Treat imported Markdown as data, never executable JSX. Convert Markdown syntax through its parsed tree, retaining code and literal text.

Supplementary diagrams and product links are site-owned. Bind visual assessments and diagram reviews to material concept hashes. Include the body, applicability, assessment criteria, and status; exclude review-only metadata and the importing commit. A changed material hash requires an actual review. Unrelated commits must not invalidate drawings. Record the reviewed asset hash as well, so an edited drawing requires renewed inspection. Maintain at least 18 new useful pattern drawings; equivalent existing assets may be explicitly reused without counting toward that baseline. Narrow expanded diagrams retain readable native size with horizontal scrolling.

Keep historical and candidate source claims visible and qualified. The Language 6 product policy in [ADR 1](0001-initial-release-scope-and-technical-writing.md) still applies to local guidance. Only source bodies verified against deterministic snapshot generation may retain historical examples and upstream editorial wording. Flags alone cannot exempt prose.

The completed publication pointer must match the imported commit after all source, visual, and coupled-page reviews pass. Import never changes the owner's library watermarks. Preserve the old pointer during partial publication.

## Consequences

Every committed concept is discoverable through navigation, search, and Markdown export. Export uses a dedicated splat endpoint and plain-text artifact extension, avoiding executable MDX and development-server Markdown module interception. Source gaps and stale upstream reviews remain evidence rather than implied approval. Review records distinguish faithful publication from source release certification.

Generated files are outputs. Refresh validates staged coverage and links before replacement, rejects human collisions or edited output, and removes only recorded generated files. Renames retain identity and a route stub; removed concepts retain a labeled historical route when previously published.

## Evidence

Implementation: [ExecPlan 48](../plans/48-publish-the-runtime-pattern-catalog-with-svg-diagrams-and-incremental-synchronization.md). Owner decisions: `mori://shinzui/keiro-runtime-patterns/okf/adrs/concepts/ADR-6` and `mori://shinzui/keiro-runtime-patterns/okf/adrs/concepts/ADR-8`.
