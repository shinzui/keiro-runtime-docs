# keiro-dsl documentation coverage audit — 2026-09-18

## Boundary

- Upstream project: `mori://shinzui/keiro`
- Reviewed commit: `11e0bba4f634ac6fa4526e2814bd5a8177e3f050`
- Package: `keiro-dsl` 0.17.0.0
- Stable contract: Language 5
- Accepted candidate: Language 6
- Pointer movement: none; this is a second-pass completeness audit at the existing reviewed commit.

Artifact-level Mori URIs for source modules are pending. Source facts below use the canonical project
URI plus project-relative paths.

## Inventories checked

| Surface | Authority under `mori://shinzui/keiro` | Count/result |
|---|---|---:|
| language contracts, syntax features, runtime capabilities | `keiro-dsl/src/Keiro/Dsl/LanguageVersion.hs` | 6 / 16 / 9 |
| top-level semantic node constructors | `keiro-dsl/src/Keiro/Dsl/Grammar.hs` | 17 |
| CLI commands and flags | `keiro-dsl/app/Main.hs` | 8 commands |
| starter kinds and emitted version selector | `keiro-dsl/src/Keiro/Dsl/Skeleton.hs` | 11; stable selector |
| installed library modules | `keiro-dsl/keiro-dsl.cabal` | 60 public modules |
| Candidate Language 6 reactions and fingerprints | `keiro-dsl/src/Keiro/Dsl/{ProcessReaction,CanonicalEncoding,Scaffold}.hs` | checked |
| workspace runtime package and version composition | `keiro-dsl/src/Keiro/Dsl/{Workspace,WorkspaceScaffold,RuntimePackage}.hs` | checked |
| conformance package generation | `keiro-dsl/src/Keiro/Dsl/{ConformancePackage,ServiceHarness,ScaffoldRun}.hs` | checked |

The documentation module inventory was mechanically compared with the Cabal `exposed-modules` list:
all 60 public names are present. `Keiro.Dsl.GeneratedHaskellLanguage` is mentioned separately as a
private-library module and is not counted as installed public API.

## Findings and actions

| Finding | Classification | Documentation action |
|---|---|---|
| Candidate Language 6 appeared only in a few focused paragraphs, leaving stable-only wording elsewhere | update + add | added an exhaustive Candidate Language 6 reference and linked it from notation, domain/read-side, runtime, mapped, workspace, CLI, how-to, tutorial, and explanation pages |
| `new <kind>` was documented as using `currentAuthoringLanguageVersion` | correct stale fact | corrected it to `currentStableLanguageVersion`; explicitly documented stable 5 output while candidate 6 is registered |
| runtime capability reference omitted `DelegatedInboxRuntime` and `StructuralNominalLeaves` | update | added both constructors and their fold-neutral decisions |
| reaction docs did not specify the frozen fingerprint or exact timer/fired UUID derivation | update | documented validation, canonical SHA-256 surface, separate UUIDv5 namespace/length-framed seed, generated runtime, and exact rollout classifications |
| scaffold summary omitted `--runtime-package` and `--apply-generated-haskell-edition`; diff summary omitted `--deny` | update | added flags and behavior, including conformance facade/package planning and denial-origin validation |
| workspace format omitted `runtime-package`; command matrix omitted `pretty`, `inspect`, and `behavior-obligations` | update | documented manifest field, precedence, generated conformance package, and all workspace-aware commands |
| no single auditable map covered the full public DSL surface | add | added the coverage map with registry counts, grammar/runtime families, all 60 exposed modules, diagnostic authority, and a future maintenance contract |

## Coverage rule applied

A developer-visible feature is considered documented only when its owning page covers the relevant
source syntax or public type, validation, generated/runtime behavior, persistence or identity impact,
and evolution/rollout behavior. A name appearing in an index alone does not satisfy coverage.

Pure implementation helpers remain out of the public module inventory. They are documented only
where their behavior defines a compatibility contract, as with the generated-Haskell migration
rewriter and the frozen reaction/identity encoders.
