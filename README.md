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

## Local development

Use Node 22 and pnpm. The Nix development environment also supplies oxlint and oxfmt.

```bash
pnpm install
pnpm dev
```

Open <http://127.0.0.1:5214>.

## Verification

| Command                     | Purpose                                                            |
| --------------------------- | ------------------------------------------------------------------ |
| `pnpm run lint:docs`        | Check release scope and common prose problems.                     |
| `pnpm run review:prose`     | Report sentence and paragraph findings for editorial review.       |
| `pnpm run test:docs`        | Verify the documentation checker.                                  |
| `pnpm run sync:terminology` | Refresh the glossary from Keiro's terminology bundle through Mori. |
| `pnpm run lint:terminology` | Verify the glossary against its canonical snapshot.                |
| `pnpm typecheck`            | Compile MDX metadata and check TypeScript.                         |
| `pnpm lint`                 | Check application code.                                            |
| `pnpm format:check`         | Check source formatting.                                           |
| `pnpm lint:nav`             | Check navigation coverage.                                         |
| `pnpm build`                | Build the static site.                                             |
| `pnpm lint:links`           | Check source links and built routes.                               |
| `pnpm check`                | Run the complete release gate.                                     |

Run `pnpm check` before a push.

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

`pnpm build` writes the static site to `.output/public/`.
CI verifies pushes and pull requests to `master`.
Serve that directory with a static host.
