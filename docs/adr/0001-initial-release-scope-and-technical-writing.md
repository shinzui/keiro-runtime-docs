# Initial release scope and technical writing

Status: Accepted

Date: 2026-10-02

## Context

Keiro is preparing its initial official release. The documentation included obsolete upgrade procedures, older DSL contracts, and a historical example-application tour. Technical terms also needed one authoritative source.

The official ASD-STE100 Issue 9 rules and dictionary are not available in the workspace. Public ASD explanations support an initial writing policy. They cannot establish full compliance.

## Decision

Support only Keiro DSL Language 6 in published release documentation. Complete examples must declare `language keiro-dsl 6` before `context`. Retire historical release tutorials and migration-only pages. Preserve internal source-review records and completed plans as audit evidence.

Keep current runtime contracts for retained event history, payload decoding, deduplication, and exported compatibility controls. Removing old tutorials does not change runtime behavior.

Adopt ASD-STE100 Issue 9 as the writing reference. Use direct instructions, active descriptions, consistent meanings, and short sentences. Use the official rules and dictionary for the final vocabulary and grammar review. Do not claim complete compliance before that review passes.

Use `mori://shinzui/keiro/okf/terminology` as the authority for Keiro technical terms. Preserve stable term IDs, aliases, relationships, source anchors, and deprecated replacements. Update the owning bundle before changing definitions on this site.

Generate the site glossary and `docs/writing/technical-terms.json` from the canonical bundle. CI checks the glossary against this snapshot without requiring the upstream checkout. A maintainer refresh uses Mori to find the owning repository. The snapshot records a SHA-256 digest of bundle filenames and contents.

Keep automated editorial checks separate from verified standard compliance. Fail on unsupported DSL declarations, retired paths, selected prose problems, and inconsistent glossary output. Report sentence and paragraph findings for contextual review. Do not hide them behind a grandfathered baseline.

## Consequences

Readers have one DSL language and one source of technical definitions. Deprecated term entries remain available for lookup, while new prose uses their replacements.

The checked upstream registry still labels Language 6 as candidate, and its starter uses the stable selector. Document those facts until the upstream release changes them. The documentation support policy does not change the runtime registry.

Full STE review remains release work. The initial prose pass and a successful site build do not establish publication readiness or dictionary compliance.

## Evidence

Implementation and remaining work are in [ExecPlan 47](../plans/47-prepare-initial-release-documentation-with-language-6-and-simplified-technical-english.md). The canonical terminology concepts include `mori://shinzui/keiro/okf/terminology/concepts/TERM-1` and `mori://shinzui/keiro/okf/terminology/concepts/TERM-2`.

The [official standard request page](https://www.asd-ste100.org/STE_downloads.html) provides the authoritative copy. The [ASD FAQ](https://asd-ste100.org/STE_faq.html) explains the role of writing rules, word meanings, and technical terms.
