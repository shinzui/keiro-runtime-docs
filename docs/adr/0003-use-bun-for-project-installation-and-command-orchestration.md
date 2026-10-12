# Use Bun for project installation and command orchestration

Status: Accepted

Date: 2026-10-12

## Context

The shared Nix development shell supplies Bun and the compiler/Oxc tools. Project commands, dependency metadata, and documentation must agree with the user's selected package manager. Dependency executables and existing test scripts still use Node shebangs and APIs.

## Decision

Use Bun for installation and script orchestration. The package-manager declaration matches Bun 1.4.2 supplied by the committed Nix shell; retain Node 22 for tools that require it. Commit the migrated text `bun.lock` and use `bun install --frozen-lockfile` in CI and reproducible local setup. Preserve the 611 resolved package identities during migration; dependency upgrades remain separate work. Limit native install permission to `esbuild`, the actual dependency requiring it.

Run font preparation explicitly once in `dev` and `build`. Remove the redundant lifecycle aliases. Unattended builds set `KEIRO_DOCS_SKIP_FONTS=1`, which exits before licensed-font discovery; normal local builds may use the existing optional font support.

Use the same Bun commands in package scripts, task recipes, CI, contributor guidance, and doc-sync instructions. At the user's explicit request, remove retired-manager references from project-owned archived text and the managed ignore baseline too. Normalize old command examples to current equivalents while labeling historical verification scope; do not reinterpret old runs as Bun verification. Re-hash the adjusted content-addressed ignore baseline and its manifest reference together.

## Consequences

Fresh installs and all release checks work without a second package manager. The release gate keeps the same tests, source snapshots, prose, terminology, type, navigation, diagram, build, and link checks. The deployment work in [ExecPlan 49](../plans/49-deploy-the-docs-to-the-labs-intranet-with-local-bun-builds.md) remains separate from this toolchain migration.
