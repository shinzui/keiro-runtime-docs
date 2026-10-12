# Task runner for this Fumadocs (TanStack Start + Vite) documentation site.
# Tools (bun, oxlint, oxfmt, tsc) are provided by the Nix dev shell (nix-bun-flake).
# Node-shebang bins (vite, fumadocs-mdx) use Node from flake.module.nix.

# List available recipes
default:
    @just --list

# Install the committed dependency set with Bun
install:
    bun install --frozen-lockfile

# Start the dev server (http://127.0.0.1:5214); copies fonts first
dev:
    bun run dev

# Build the static site into .output/public
build:
    bun run build

# Generate the MDX source map, then type-check without emitting
typecheck:
    bun run typecheck

# Format sources in place (strips semicolons, sorts imports)
format:
    oxfmt --write .

# Verify formatting without writing (CI mode)
format-check:
    oxfmt --check .

# Lint sources with oxlint
lint:
    oxlint

# Lint and auto-fix where possible
lint-fix:
    oxlint --fix

# Check source-level internal links and crawl the built site
lint-links:
    bun run lint:links

# Run every documentation and application release gate
check:
    bun run check
