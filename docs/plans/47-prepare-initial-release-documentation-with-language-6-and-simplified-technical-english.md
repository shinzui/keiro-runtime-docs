---
id: 47
slug: prepare-initial-release-documentation-with-language-6-and-simplified-technical-english
title: "Prepare initial-release documentation with Language 6 and Simplified Technical English"
kind: exec-plan
created_at: 2026-10-02T16:12:55Z
provenance:
  created_by:
    model: "gpt-6.1-sol"
    harness: "codex-cli"
    at: 2026-10-02T16:12:55Z
  revisions:
    - model: "gpt-6.1-sol"
      harness: "codex-cli"
      at: 2026-10-02T16:15:04Z
      mode: "implement"
      note: "Implement initial-release cleanup and controlled-English authoring workflow"
---

# Prepare initial-release documentation with Language 6 and Simplified Technical English

## Purpose / Big Picture

Prepare the published documentation for the initial Keiro release. Readers must find current procedures and Language 6 examples. Remove obsolete Keiro upgrade guides and the old example application tour. Adopt ASD-STE100 Issue 9 as the writing reference. Keep technical meanings, code, and source evidence accurate.

## Progress

- [x] (2026-10-02) Inventory the published tree, build gates, source registry, and upstream language selectors.
- [x] (2026-10-02) Remove 46 legacy files and repair navigation and links. Rewrite release entry points and DSL references for Language 6.
- [x] (2026-10-02) Establish the writing policy, eight templates, and automated review aids.
- [x] (2026-10-02) Refresh all 64 canonical Keiro terminology definitions and explanations. Preserve term metadata and pass strict profile and log enforcement. Generate the site glossary and snapshot from the bundle.
- [x] (2026-10-02) Complete the first prose pass and remove selected contractions and conversational phrases outside literal code.
- [ ] Complete the remaining sentence, paragraph, grammar, and vocabulary review across the 500 published pages.
- [x] (2026-10-02) Check all five complete DSL examples with the reviewed Keiro DSL 0.18 executable. Correct the read-model shape hash for Language 6.
- [x] (2026-10-02) Pass the complete site gate and browser-check the glossary. Record the release policy in ADR-1 and the remaining editorial findings in a review report.
- [ ] Complete word-meaning and part-of-speech review against the official Issue 9 dictionary.

## Surprises & Discoveries

The inventory contains 608 content files and approximately 378,000 words outside code fences. Many pages contain historical version annotations. A short-sentence checker cannot establish ASD-STE100 compliance.

The checked source for `mori://shinzui/keiro/packages/keiro-dsl` retains a candidate Language 6 entry. `currentAuthoringLanguageVersion` returns 6, but `currentStableLanguageVersion` returns 5. The `new` command uses the stable selector. Documentation support policy must not change these reported implementation facts.

Keiro terminology contains 64 entries, including two deprecated names. TERM-1 means stored stream history; TERM-2 means the aggregate contract. The initial independent draft incorrectly treated event stream as stored history. The derived glossary corrects that distinction.

The converted read-model examples needed `fnv1a:476e92304e8784f8` for their Language 6 column declarations. The reviewed executable detected the stale captured hash; both examples now pass. The router tutorial retains three declared-policy warnings.

The official ASD website distributes Issue 9 by request. No official dictionary is in the working tree. The author requested a local copy from the user. Public ASD explanations support the writing policy, but are insufficient for a complete vocabulary review.

## Decision Log

On 2026-10-02, the user identified the existing Keiro terminology bundle and authorized its refresh. Use `mori://shinzui/keiro/okf/terminology` as the authority. Rewrite its definitions and explanations with short sentences before generating the local glossary. Do not maintain an independent competing dictionary. Preserve all term IDs and metadata relationships, including the two deprecated entries.

On 2026-10-02, use Language 6 as the only supported documentation language, as requested by the user. Complete source examples must explicitly declare `language keiro-dsl 6`. Preserve accurate reports of the checked toolchain's candidate label and starter behavior.

Remove published legacy tutorials and migration-only pages. Preserve internal source-review records and completed plans as audit evidence. Keep current runtime behavior for old stored payloads where it remains part of the current implementation contract.

Apply the writing policy to every published product tree and to the authoring templates. Treat code, identifiers, filenames, protocol values, and diagrams as literal technical content. Do not alter them through English word substitutions.

## Outcomes & Retrospective

The release cleanup and terminology refresh are implemented. Strict terminology validation, all five complete DSL source checks, and `nix develop -c pnpm check` pass. Navigation checks cover 56 metadata files and 500 pages. Six checker tests pass. The browser displays the glossary and its canonical definitions. The first editorial pass does not complete the requested conversion of every page. Remaining prose findings are recorded in [the editorial review](../writing/review-2026-10-02.md). The current review has 2775 findings across 392 files. Full compliance remains unverified until the remaining editing and official rules and dictionary review pass.

## Context and Orientation

The site reads MDX from `content/docs/`. Each directory has `meta.json` navigation entries. `scripts/check-doc-navigation.mjs` checks those entries. `scripts/check-doc-links.mjs` checks internal link destinations. `package.json` defines the complete `pnpm check` gate. CI runs the gates from `.github/workflows/ci.yml`.

There was no ADR directory or profiled ADR bundle before this change. [ADR-1](../adr/0001-initial-release-scope-and-technical-writing.md) now records the durable release and writing policy. Historical plans under `docs/plans/` and source-sync records under `docs/` are not site pages.

Dependency source was located with Mori. The owning project is `mori://shinzui/keiro`. Read its package-local `keiro-dsl/src/Keiro/DSL/LanguageVersion.hs` and checked fixtures to verify language behavior. No dependency bounds or package pins change in this work.

## Plan of Work

First remove `content/docs/example-app/`, Keiro 0.1 and 0.2 migration guides, and the legacy example and predecessor architecture pages. Remove navigation entries and replace inbound links with appropriate current guides. Replace the historical compatibility chronology with the exact reviewed package matrix and current operational constraints.

Next rewrite the language reference and complete examples for Language 6. Do not merely change the preamble of examples that use obsolete read-model clauses. Use projection owners for delivery and `freshness` for query policy. Retain the toolchain's actual reported labels in a concise implementation note.

Refresh the owning terminology bundle at `mori://shinzui/keiro/okf/terminology`. Mori resolves its directory. Validate it with its owning project profile, update the bundle log, and preserve identifiers, metadata relationships, and source anchors. `pnpm run sync:terminology` reads the canonical descriptions and generates `docs/writing/technical-terms.json` and `content/docs/getting-started/technical-terms.mdx`. CI compares the local snapshot and glossary without an upstream checkout.

Then replace the former conversational authoring voice with controlled technical English. Define technical terms, imperative procedures, active descriptions, short sentences, explicit conditions, and consistent vocabulary. Add a conservative source checker for unsupported language declarations and common prose issues. Explain its limits. Record remaining editorial findings rather than suppressing them with a grandfathered baseline.

Finally run navigation, links, typecheck, lint, format, and build checks. Review changed source examples and the rendered release routes. Record the result and any unresolved standard review in this plan.

## Milestones

### 1. Current release content

Published navigation and links resolve after retirement. No complete DSL example selects an older language. Run `node scripts/check-doc-navigation.mjs` and `node scripts/check-doc-links.mjs` from the repository root. Both must exit 0.

### 2. Controlled writing workflow

The contributing guide, templates, and terminology define the writing policy. A new documentation checker reports prose findings and fails on unsupported language examples. Its tests must prove it distinguishes prose from code and preserves literal technical values. The checker must never claim complete ASD-STE100 validation.

### 3. Release verification and editorial evidence

Run `pnpm check` from the repository root. The build must compile all retained MDX pages. Capture remaining editorial findings in a report. Complete the dictionary review when an official copy is available; keep that step open until it actually passes.

## Concrete Steps

Run all commands from `/Users/shinzui/Keikaku/bokuno/keiro-runtime-docs`.

```bash
node scripts/check-doc-navigation.mjs
node scripts/check-doc-links.mjs
pnpm run sync:terminology
pnpm run lint:terminology
nix develop -c pnpm check
```

Use `git diff --check` to detect malformed edits. Inspect `git diff --stat` and retired paths before committing. Commits use Conventional Commits and include this plan's `ExecPlan:` trailer.

## Validation and Acceptance

A reader can start from the documentation home, find the Language 6 reference, and use current tutorials without encountering the retired tour. Every complete `.keiro` source example declares Language 6. Navigation and source links pass. The typecheck and production build pass. The authoring guide explains the official standard and the distinction between automated review aids and verified dictionary compliance.

Full ASD-STE100 acceptance additionally requires word meanings, parts of speech, technical terms, procedure structure, and descriptive structure to pass review against Issue 9. That acceptance cannot be inferred from sentence length or an automated pass.

## Idempotence and Recovery

All content edits and retirements are recoverable through Git. The checks are read-only. The user authorized upstream terminology edits. Do not modify upstream runtime code or package bounds. Validate and commit the upstream bundle separately. Its commit trailer uses this plan's canonical URI: `mori://shinzui/keiro-runtime-docs/plans/47-prepare-initial-release-documentation-with-language-6-and-simplified-technical-english`. Preserve historical review records so a later source-sync can start from the existing reviewed commits.

## Artifacts and Notes

The initial working tree was clean. The authoritative ASD reference is https://www.asd-ste100.org/STE_downloads.html. The public rules explanation is https://asd-ste100.org/STE_faq.html.

Validate the upstream bundle from the directory returned by `mori path mori://shinzui/keiro`:

```bash
okf validate docs/terminology --strict --profile mori/terminology-profile.dhall --profile-enforce --log-enforce
```

Expected result: `OK: 64 concepts (okf_version 0.2)`.

## Interfaces and Dependencies

Use the existing Node and pnpm toolchain. Add no runtime dependency for prose checks. Keep Markdown links, MDX components, Haskell identifiers, CLI flags, and wire values unchanged during general prose edits.

Revision note (2026-10-02): The user authorized editing the canonical upstream terminology bundle. All 64 concepts were refreshed and validated. The local glossary now derives from that source. Release cleanup, first prose pass, and site checks pass; comprehensive editing and official dictionary review remain open.

Revision note (2026-10-02): Created the release cleanup and controlled-English implementation plan from the source and content inventory.
