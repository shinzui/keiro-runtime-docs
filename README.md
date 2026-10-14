# keiro-runtime-docs

This repository contains the technical documentation for the keiro runtime.
The published content uses MDX under `content/docs/`.
Fumadocs and TanStack Start render the site as a static application.

| Library    | Role                                                            |
| ---------- | --------------------------------------------------------------- |
| keiro      | Commands, read models, process managers, and durable workflows. |
| kiroku     | PostgreSQL event storage and subscriptions.                     |
| keiki      | Pure transducers, symbolic validation, and replay.              |
| shibuya    | Supervised message processing and acknowledgment decisions.     |
| pgmq-hs    | PostgreSQL queue clients and configuration.                     |
| pg-migrate | Database components, migration plans, and verification.         |

Language 6 is the only supported Keiro DSL language in the release documentation.
Obsolete Keiro upgrade guides and the older example-app tour are retired.
Historical plans and source-review records remain under `docs/`.

The [changelog](content/docs/changelog/index.mdx) covers the runtime package families and adapters,
starting with three published releases per package. Source-only and archived packages are explicitly
labelled. Hackage and upstream tag evidence is recorded in [the release review](docs/changelog-release-review.md).
The [doc-sync skill](agents/skills/doc-sync/SKILL.md) checks and maintains release history independently
of API review pointers; its [release procedure](agents/skills/doc-sync/CHANGELOG.md) applies even when no source commits changed.

The [runtime catalog](content/docs/runtime-patterns/index.mdx) publishes all 88 concepts from a fixed committed revision of `mori://shinzui/keiro-runtime-patterns/okf/runtime-patterns`. Historical and candidate source examples remain qualified quotations. Local product guidance remains Language 6. Source rules are maintained in the owner; site explanations and SVGs are maintained here.

Refresh with `nix develop -c bun run sync:patterns --ref FULL_COMMIT_SHA`. Do not edit generated MDX. Review the snapshot diff, all invalidated concept visual assessments and diagram bindings in `docs/patterns/presentation.json`, and coupled product pages. Render changed drawings in both themes and inspect desktop/mobile expansion. Complete the [pattern sync procedure](agents/skills/doc-sync/PATTERNS.md) before advancing [the reviewed pointer](docs/runtime-patterns-source-sync.md).

`bun run lint:patterns` checks offline generation, coverage, visual bindings, and pointer agreement. `node scripts/runtime-patterns.mjs --check-upstream` separately reports owner drift. `node agents/skills/doc-sync/status.mjs runtime-patterns --json` distinguishes imported output from completed review. Import does not advance the owner's library review ledger or certify that an agent complied with a pattern.

## Local development

Enter the Nix environment before running project commands. The shared flake-parts
module supplies Bun 1.4.2, TypeScript 7.0.2, oxlint, and oxfmt. The project-owned
`flake.module.nix` retains Node 22 for dependency executables; `packageManager` selects Bun 1.4.2.

```bash
nix develop
bun install --frozen-lockfile
bun run dev
```

Open <http://127.0.0.1:5214>.

`dev` and `build` prepare optional fonts exactly once. Set `KEIRO_DOCS_SKIP_FONTS=1`
for unattended checks/builds to skip licensed-font lookup and use the system font fallback.

## Verification

| Command                    | Purpose                                                            |
| -------------------------- | ------------------------------------------------------------------ |
| `bun run lint:docs`        | Check release scope and common prose problems.                     |
| `bun run review:prose`     | Report sentence and paragraph findings for editorial review.       |
| `bun run test:patterns`    | Verify committed import, failure recovery, and incremental review. |
| `bun run lint:patterns`    | Check catalog output and completed visual/source bindings.         |
| `bun run lint:diagrams`    | Check SVG structure and placement.                                 |
| `bun run test:docs`        | Verify the documentation checker.                                  |
| `bun run sync:terminology` | Refresh the glossary from Keiro's terminology bundle through Mori. |
| `bun run lint:terminology` | Verify the glossary against its canonical snapshot.                |
| `bun run typecheck`        | Compile MDX metadata and check TypeScript.                         |
| `bun run lint`             | Check application code.                                            |
| `bun run format:check`     | Check source formatting.                                           |
| `bun run lint:nav`         | Check navigation coverage.                                         |
| `bun run build`            | Build the static site.                                             |
| `bun run lint:links`       | Check source links and built routes.                               |
| `bun run check`            | Run the complete release gate.                                     |

Run `bun run check` before a push.

The [module migration report](docs/fumadocs-module-upgrade-2026-10-08.md) records
the tested versions, preserved customizations, and future update procedure.

## Authoring

Use [the contributing guide](content/docs/getting-started/contributing.mdx) and the templates in `content/docs/_templates/`.
Use short instructions, active descriptions, and consistent technical terms.
The writing reference is ASD-STE100 Issue 9.
Keiro owns the canonical terminology at `mori://shinzui/keiro/okf/terminology`.
The local [terminology snapshot](docs/writing/technical-terms.json) supplies project noun definitions to the [glossary](content/docs/getting-started/technical-terms.mdx).

The local policy and checks start the STE review. They do not establish complete compliance.
General vocabulary review requires the official dictionary.
Request the standard from [ASD](https://www.asd-ste100.org/STE_downloads.html).

Use Mori to verify dependency source and cross-repository references.
Document current supported behavior. Do not restore obsolete release tutorials.

## Layout

```text
content/docs/          # Published MDX and navigation metadata.
content/docs/_templates/ # Authoring templates.
docs/                  # Source-review evidence, plans, and writing records.
src/                   # Site routes and components.
scripts/               # Documentation checks and asset helpers.
```

For licensed local fonts, read [the font setup guide](docs/optional-commercial-fonts.md).

## Deployment

`bun run build` writes the static site to `.output/public/`.
CI verifies pushes and pull requests to `master`.
The protected Nagare intranet deployment uses `nagare/Config.hs` and a static
Nginx image. See [the deployment procedure](docs/deployment.md) for building,
publishing, access grants, verification, and recovery.
