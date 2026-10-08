# Fumadocs module adoption — 2026-10-08

Adopted mori://shinzui/seihou-modules/templates/fumadocs 0.2.1 and
mori://shinzui/seihou-modules/templates/nix-bun-flake 0.3.0 using the
`upgrade-fumadocs` blueprint from mori://shinzui/seihou-modules
(project-relative `blueprints/upgrade-fumadocs`; blueprint artifact URI pending).
The Fumadocs and blueprint changes are unpublished candidates at validation time.

## Versions and ownership

Core/UI are 16.16.2, MDX is 15.4.6, Bun is 1.4.2, TypeScript is 7.0.2,
oxlint is 1.87.0, and oxfmt is 0.72.0. The project retains pnpm 11.4.0 and
its workspace and frozen lockfile. The unmanaged `flake.module.nix` adds Node 22
and pnpm to the shared shell. The project-local TypeScript dependency was removed
so typechecking uses the Nix compiler. CI enters the same shell for every gate.

Seihou operations generated the application IDs and canonical baselines. The recorded
origins identify the shared modules' canonical remote, with no machine-local paths.
Ignored discovery symlinks point to external candidate copies for this local test;
install the released modules from their recorded origin once these changes are published.
The previous standalone Bun application and new composed Fumadocs application share
managed paths. Include shared owners when updating and review the merge; do not blindly
remove the old application. Customized application files remain visible modifications
against generated baselines. `docs.starter-content=false` prevents content ownership.

## Preserved behavior

All 805 content files retain their original SHA-256 hashes. The Keiro grammar,
custom MDX registration, SVG diagram renderer, source highlighting, navigation,
port 5214, package-manager scripts, optional licensed-font fallback, and full release
gate remain intact. Only precise compiler, Mermaid state, TanStack validator, and
static-search compatibility changes were merged into customized source files.
The old shell's informational version banner was omitted; it set no environment values.

## Validation

- `nix develop --command pnpm install --frozen-lockfile` passed.
- `nix develop --command pnpm run check` passed documentation tests, prose,
  terminology, TypeScript, lint, formatting, navigation, diagram checks, production
  prerendering, and links. The source link checker covered 500 MDX files.
- The actual Fumadocs `staticClient` queried the exported search index and found
  60 Keiro results, including existing `/docs/keiro` pages.
- Prerendered Keiro HTML, raw Markdown, and 500 static server-function cache files
  were verified. Custom grammar bytes matched the pre-migration backup.
- `nix flake lock` and `nix flake update` retained the byte-identical shared lock.
- `nix flake check` passed the native Darwin hook check. Linux outputs were
  evaluated; Linux builds and GitHub CI were not run locally.
- Both blueprint debug entry points rendered. Debug run records blueprint provenance;
  debug migrate leaves the manifest unchanged. This legacy site had no recorded
  Fumadocs application, so no fictitious 0.1.2 migration receipt was recorded.

Lint emits nonblocking warnings. The static SPA's HTML crawler reports zero links,
as before; the source-level checker provides the meaningful internal-link gate.

## Future updates

After publication, install the current module and blueprint cohort from the recorded
repository origin. Use `seihou agent run upgrade-fumadocs` for reviewed updates, retaining
the complete `pnpm run check` gate and authored content hashes. The explicit blueprint
0.1.2-to-0.2.1 edge is for sites actually using module 0.1.2. Seihou updates of shared
files require `--include-shared-owners`; inspect the plan before applying it.
