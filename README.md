# keiro-runtime-docs

The documentation site for the **keiro runtime** — five Haskell runtime libraries for building
event-sourced systems on PostgreSQL, plus the pg-migrate schema toolkit they compose with. It is a
[Fumadocs](https://fumadocs.dev) content site rendered as a static
[TanStack Start](https://tanstack.com/start) SPA; all the prose lives as MDX under `content/docs/`.

The libraries it documents:

| Surface        | 漢字 | What it is                                                               |
| -------------- | ---- | ------------------------------------------------------------------------ |
| **keiro**      | 経路 | An event-sourcing framework and durable workflow engine.                 |
| **kiroku**     | 記録 | An append-only PostgreSQL event store — the persistence foundation.      |
| **keiki**      | 継起 | A pure, dependency-free mathematical core (the decision semantics).      |
| **shibuya**    | 渋谷 | Supervised queue processing with explicit acknowledgement decisions.     |
| **pgmq**       | —    | A PostgreSQL-native message queue — the queue substrate (via `pgmq-hs`). |
| **pg-migrate** | —    | Embedded migration components, application-owned plans, and operations.  |

The preserved `content/docs/example-app/` tree documents an older
`keiro-runtime-jitsurei` architecture. It is pending modernization and is not
release evidence for the July 2026 package matrix.

## Getting started

Requires **Node 22** and **pnpm**. A Nix dev shell is provided; it also supplies `oxlint`/`oxfmt`.
Licensed PragmataPro users can opt in to local code-block ligatures through an environment variable
or Nix registry alias; see [`docs/optional-commercial-fonts.md`](docs/optional-commercial-fonts.md).

```bash
pnpm install        # install dependencies
pnpm dev            # local dev server with hot reload
```

Open the URL Vite prints (default <http://localhost:3000>).

## Common scripts

| Command             | What it does                                                              |
| ------------------- | ------------------------------------------------------------------------- |
| `pnpm dev`          | Dev server with hot reload.                                               |
| `pnpm build`        | Prerender the static SPA into `.output/public/`.                          |
| `pnpm start`        | Serve a built `.output/public/`.                                          |
| `pnpm typecheck`    | Generate `.source/` with `fumadocs-mdx`, then run `tsc --noEmit`.         |
| `pnpm lint`         | `oxlint`.                                                                 |
| `pnpm format:check` | `oxfmt --check .` (use `pnpm format` to write).                           |
| `pnpm lint:nav`     | Verify every MDX page and child section appears exactly once in metadata. |
| `pnpm lint:links`   | Source-level `/docs` link check, then a `linkinator` crawl of the build.  |
| `pnpm check`        | The full gate: types → lint → format → nav → build → links.               |

`pnpm check` mirrors the CI workflow in `.github/workflows/ci.yml`; run it before pushing.

## Project layout

```text
content/docs/        # all documentation, as MDX — the source of truth
  <product>/         # keiro, kiroku, keiki, shibuya, pgmq, pg-migrate
    tutorials/  how-to/  reference/  explanation/  cookbook/  walkthrough/  faq.mdx
    meta.json        # per-folder sidebar order (the `pages` array)
  integrations/      # cross-product integration guides
  example-app/       # older keiro-runtime-jitsurei tour; pending modernization
  _templates/        # per-doc-type starting points (hidden from the sidebar)
docs/*-source-sync.md # exact upstream SHAs reviewed by each source-backed tree
src/                 # the TanStack Start app shell, routes, and MDX components
scripts/             # navigation/link checks and static asset helpers
```

## Writing docs

The docs follow the [Diátaxis](https://diataxis.fr) framework — every page is exactly one of Tutorial,
How-To Guide, Reference, or Explanation, plus the extras Cookbook, Code Walkthrough, and FAQ. The house
voice is **problem-first** (open with the reader's problem, then the mechanism), product names are
always lowercase, and em-dashes are the house punctuation.

To add a page: copy the matching template from `content/docs/_templates/`, save it under the right
`<product>/<section>/` folder with a lowercase-hyphenated name, fill in the frontmatter, then add its
name (without `.mdx`) to that folder's `meta.json` `pages` array. The full authoring and style guide
lives at [`content/docs/getting-started/contributing.mdx`](content/docs/getting-started/contributing.mdx).

## Deployment

`pnpm build` prerenders a fully static SPA into `.output/public/`, which can be served by any static
host. CI builds and link-checks every push and pull request to `master`.
