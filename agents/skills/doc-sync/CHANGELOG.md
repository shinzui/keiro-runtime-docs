# Package release history

Use this procedure for library `status`, `sync`, and `register`, and for changelog-only requests.
Pattern-only work uses PATTERNS.md; the pattern catalog is not a package release.

## Inventory and scope

- Published home: `content/docs/changelog/`; its `index.mdx` links every family and adapter.
- Inventory and exact release evidence: `docs/changelog-release-review.md`.
- Source owners and coupled docs: LIBRARIES.md.

Cover every public runtime library/tool package in the six library families and four adapters,
including codecs, migrations, operations, metrics, tracing, and public test-support packages.
Resolve owners with `mori registry list`, `mori registry search <package>`,
`mori registry show <project> --full`, and `mori registry docs <project>`.
Verify current package membership against committed Cabal files; the registry can lag.
Use canonical package references `mori://<namespace>/<project>/packages/<package>`.

Examples, benchmarks, and the standalone example app are outside this inventory.
Keep source-only and archived packages visible with their actual publication status.
The Kiroku adapter lives in the Kiroku repository but has its own history page and API pointer.

For a new package, seed the latest three published releases, or all available releases if fewer.
Retain existing history when later releases arrive; three is the bootstrap depth, not a rolling cap.
Group packages only when their versions and release dates actually agree. Kiroku versions are independent.

## Check releases independently of commit drift

Run these checks for each selected package even if `status.mjs` reports zero commits behind.
That script does not check package publication. For `status`, inspect and report without editing files.

1. Query the authoritative registry, normally Hackage:

   ```bash
   curl -fsSL https://hackage.haskell.org/package/keiro.json
   ```

   Sort dotted numeric version components numerically, not lexically. Compare the newest versions
   with the package's site table and release evidence. For a coordinated family, check every
   package; one successful upload does not prove the other packages shipped.
2. Resolve the repository through Mori. Inspect upstream remote tags with
   `git -C <resolved-repo> ls-remote --tags origin`. Common tag shapes are `v<version>`,
   `<package>-<version>` (Keiro), and `<package>-v<version>` (Kiroku).
   Use the actual tag; do not infer a release from a version in a Cabal file.
3. Compare the remote tag's peeled commit with
   `git -C <resolved-repo> rev-parse '<tag>^{commit}'`.
   Fetch a missing tag if needed without changing the upstream worktree.
   For annotated tags compare the remote `^{}` line; for lightweight tags compare the tag line.
4. Read the package changelog at that exact release commit with
   `git -C <resolved-repo> show <full-commit>:<changelog-path>`.
   Check package-specific notes as well as the family changelog. Confirm ambiguous claims in
   the committed package/source at that tag, rather than current `HEAD` or a plan.
5. Preserve upstream release-note dates and identify their meaning. Do not substitute a source
   commit date for an unknown publication date. If a release lacks notes, derive a conservative
   summary from its tagged source diff and record that provenance.

Hackage publication plus matching upstream tag/source is the normal evidence for a published entry.
If only a tag exists, label it as tagged with registry publication unverified and record the gap.
If publication exists without a matching tag, retain the publication fact, use its registry source
distribution for verified notes, and record the missing tag. Do not silently omit either case.
A confirmed registry 404 can establish that no package is available there; a timeout, authentication
failure, or server error means the check is unresolved, not that the package is unpublished.

Inspect package metadata revisions when dependency bounds or compatibility claims change without a
new version. Record a revision as a revision of its existing release, not a new version or a new
source API. Registry revision evidence takes precedence over tag metadata for revised package bounds.

## Write useful history

For each new version, record affected packages, the release-note date, user-visible additions/fixes,
breaking changes, database/deployment requirements, and any required consumer action.
Bounds-only and coordinated version bumps still get entries; say when a package's API is unchanged.
Summarize in the site's short, active prose rather than copying an entire upstream log.

The package table links each selected published version to its exact Hackage package page.
The page's source section links notes at immutable release commits. Pair those links with canonical
package identities in the inventory. If an artifact-level changelog URI is unavailable, retain the
canonical owner plus project-relative path and state that the artifact URI is pending in the evidence.

Keep unreleased source changes outside published entries, even if the source version equals the
last published version. Preserve upstream candidate/stable language qualification. Historical
breaking-change notes are allowed; do not restore obsolete tutorials or unsupported DSL examples.

For a new family or adapter page, update `changelog/meta.json`, the changelog index, and at least
one related library/integration page. Update root navigation if adding a new section.
When a package stops publishing or becomes archived, retain its released history and label its status.

## Evidence and boundaries

After the applicable page/link/navigation/prose/type/build checks pass, update
`docs/changelog-release-review.md` with the check date, packages and versions checked, exact tags,
peeled full commits, note paths, and unresolved publication gaps. For a partial check, date the
individual checked packages; do not advance the global check date as though the whole cohort was checked.
Reflect check dates and latest-version summaries in the affected pages/index without claiming unchecked
families were refreshed. Unchanged families retain their prior check dates.

Release-only work does not advance any `docs/*-source-sync.md` pointer, the compatibility matrix's
reviewed-source versions, or the runtime-pattern source/published boundaries. Update a compatibility
claim only after its own source and composition review. Correct factual publication labels if needed.

Report missing releases and unavailable checks separately from source drift in `status`. During
`sync`, include changelog actions in the change ledger and report any release evidence gaps at the end.
