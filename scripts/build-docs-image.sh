#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Commit or preserve local edits before building a release image." >&2
  exit 1
fi

commit=$(git rev-parse HEAD)
tag="git-$commit"
image="us-west1-docker.pkg.dev/tan-ng-labs/nagare-intranet/keiro-docs:$tag"
state="${KEIRO_DOCS_STATE_DIR:-$HOME/.local/state/keiro-docs/intranet}"
mkdir -p "$state"
chmod 700 "$state"

bun install --frozen-lockfile
KEIRO_DOCS_SKIP_FONTS=1 bun run check
node --input-type=module - "$commit" <<'JS'
import { copyFileSync, writeFileSync } from "node:fs"
const commit = process.argv[2]
copyFileSync(".output/public/_shell.html", ".output/public/index.html")
writeFileSync(".output/public/_deployment.json", JSON.stringify({
  commit,
  hostname: "keiro-docs.labs.topagentnetwork.net",
  context: "intranet",
}) + "\n")
JS
docker build --platform linux/amd64 --build-arg "SOURCE_COMMIT=$commit" \
  --tag "$image" --file deploy/Dockerfile .
node scripts/check-docs-container.mjs "$image" "$commit"
docker save --output "$state/$tag.tar" "$image"
echo "Archive: $state/$tag.tar"
echo "Image: $image"
