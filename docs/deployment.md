# Deploying the protected docs

The site runs at <https://keiro-docs.labs.topagentnetwork.net> behind the existing Nagare intranet login and per-host grants. The static output runs in Nginx; no Node server is required. [ADR 4](adr/0004-host-static-docs-behind-the-nagare-intranet-access-policy.md) records why the current Nagare site models cannot express this protection.

Optional [page-read analytics](analytics.md) is disabled by default. Its runtime JSON and independent forwarded-user trust flag are deployment settings; the image smoke check verifies both trust modes before publication.

## Build and verify

Use clean committed source, Apple container on an Apple silicon Mac with Rosetta installed, and the docs Nix environment. Start the container service first:

```bash
container system start
nix develop --command just deploy-image
```

This installs frozen dependencies, runs the release gate, builds linux/amd64 with Apple container, and verifies local HTTP behavior through a temporary localhost port using Rosetta. It converts the OCI export to the Docker archive required by Nagare with `skopeo` from the dev shell, then saves it under `~/.local/state/keiro-docs/intranet/`. Docker and Colima are not required. Set `KEIRO_DOCS_STATE_DIR` to choose another private directory. A failed check prevents publication. The build skips optional licensed fonts.

## Publish and deploy

Discover the operator checkout through `mori://tan/tan-ng-labs`. Its `.envrc` pairs the intranet context, kubeconfig, gcloud configuration, and pinned Nagare release (currently v0.11.0; verify the operator pin before use). Keep credentials and reviews outside this repository. From the docs checkout:

```bash
LABS_REPO=$(mori path mori://tan/tan-ng-labs | tail -n 1)
SOURCE_SHA=$(git rev-parse HEAD)
export KEIRO_DOCS_IMAGE_TAG="git-$SOURCE_SHA"
KEY="keiro-docs-$KEIRO_DOCS_IMAGE_TAG"
STATE="${KEIRO_DOCS_STATE_DIR:-$HOME/.local/state/keiro-docs/intranet}"
REVIEWS="$STATE/reviews/$KEIRO_DOCS_IMAGE_TAG"
direnv exec "$LABS_REPO" nagarectl context guard
direnv exec "$LABS_REPO" nagarectl platform status --json
direnv exec "$LABS_REPO" kubectl get nodes
direnv exec "$LABS_REPO" nagarectl inventory store status --json

direnv exec "$LABS_REPO" nagarectl app image-plan \
  --archive "$STATE/$KEIRO_DOCS_IMAGE_TAG.tar" \
  --destination "us-west1-docker.pkg.dev/tan-ng-labs/nagare-intranet/keiro-docs:$KEIRO_DOCS_IMAGE_TAG" \
  --key "$KEY" --save-plan "$REVIEWS/image"
jq '.operations[] | {operation, summary}' "$REVIEWS/image/review.json"
direnv exec "$LABS_REPO" nagarectl inventory apply "$REVIEWS/image" --yes

IMAGE_RESOURCE="publication:app-image-$KEY/$KEY/oci-image"
direnv exec "$LABS_REPO" nagarectl deploy --file nagare/Config.hs \
  --tag "$KEIRO_DOCS_IMAGE_TAG" --source "$SOURCE_SHA" \
  --image-resource "$IMAGE_RESOURCE" --save-plan "$REVIEWS/deploy"
jq '.operations[] | {operation, summary}' "$REVIEWS/deploy/review.json"
direnv exec "$LABS_REPO" nagarectl inventory apply "$REVIEWS/deploy" --yes
```

Require exact CLI/cluster/context/host compatibility, node `intranet-nagare` Ready, and null `activeTransaction`/`executorClaim`. The image review must only publish this image. The deployment review must keep the origin private and route the canonical hostname through `nagare-access`. The default Knative hostname must not provide public access to the origin. Read the reviews before applying. Keep the archive unchanged until publication completes. Reuse an accepted publication for retries; do not rebuild and overwrite the same published tag.

Grant the intended account access using the operator procedure in `mori://tan/tan-ng-labs`, project-relative `docs/runbooks/operations.md` (artifact-level URI pending). Run both commands within its private en credential environment:

```bash
direnv exec "$LABS_REPO" nagarectl access grant \
  --host keiro-docs.labs.topagentnetwork.net --user EMAIL \
  --save-plan "$REVIEWS/grant"
direnv exec "$LABS_REPO" nagarectl inventory apply "$REVIEWS/grant" --yes
```

The operator runbook supplies the private en connection and `NAGARE_EN_API_KEY`. Reviewed planning and applying both require that key; the reviewed adapter opens its own private port-forward. If apply stops with a known-no-effect credential error, supply the key and use `inventory resume TRANSACTION --yes` for that transaction. Never print the API key or browser session cookies. A grant can take up to 30 seconds to enter the access cache.

## Verify and recover

Anonymous HTML requests must reach login; JSON/API requests must receive an authentication response without doc content. Check `/`, a deep docs route, `/api/search.json`, a Markdown export, and `/_deployment.json`. Repeat against `keiro-docs.personal.labs.topagentnetwork.net`. For an authorized browser session, require working navigation, search, diagrams, exports, and the expected full commit at `/_deployment.json`.

For a later rollback, retain the accepted publication and its archive/receipt, select that publication's original tag in `KEIRO_DOCS_IMAGE_TAG`, and save/apply another protected Service deployment with its exact image resource and original source SHA. Do not rebuild historical source. Interrupted transactions use Nagare's named inventory resume/recovery path; inspect the active transaction before retrying.

CI currently verifies pushes and pull requests. Automatic deployment and self-hosted runner registration have not been enabled.

## Deployed release

On 2026-10-14, source `494699ee46f47337402691661f421fff0e62a6e4` was published as `keiro-docs:git-494699ee46f47337402691661f421fff0e62a6e4` in the intranet app registry using Apple container. Ready revision `keiro-docs-00003` runs digest `sha256:b79b55af9017fa3c66c4ad9050601663de3313babb214b9fb52501143df6f0bb`. The full release gate, Rosetta HTTP smoke check, archive conversion, registry/running digest, embedded source SHA, live access boundary, authorized changelog/search/new-guide navigation, and live origin UTF-8 Markdown response passed. The existing host grant remains in effect. [ExecPlan 49](plans/49-deploy-the-docs-to-the-labs-intranet-with-local-bun-builds.md) records the saved reviews and browser limitation.

On 2026-10-21, verified source `eecb26bb7dfe31734e7a9fd7ba4a8aa0e0b50fdd` was published and activated as Ready revision `keiro-docs-00004`, running digest `sha256:e9e92b163c778a760f714a0efaa9fb98ed495f1beccefc9a51ff50d964adde71`. The deployment uses required identity, the independent forwarded-user trust flag, and a dedicated public ingest key encrypted in `mori://tan/tan-ng-labs`, project-relative `operator/intranet/kansoku-tokens.yaml`, entry `keiro_docs_write_key` (artifact-level URI pending). Supply the analytics runtime variables on future typed deployments too; omitting them restores the disabled default.

The reviewed update changed only the docs Service and its release history. The canonical domain still routes through `nagare-access`, and the origin remains cluster-local. Anonymous spoofed-header requests to identity, configuration, search, and exports all return 401. Live browser visits and a reload produced three stored page views plus identify/session/page-leave observations. Every event carried the same authenticated subject; the page-view subject matched the existing accepted Nagare docs access grant. URLs retained no query or fragment. Aggregate metrics increased from no docs points to recorded docs page views. Keep the private reviews, raw payloads, credential receipt, and attribution proof under the existing private deployment state directory; no user identifier or credential is recorded here.

On 2026-10-28, source `149b9f54d8d52ae98e69020a4892bab93557bc70` was built and verified with Apple container on one workstation, then copied with an unchanged archive hash to the operator workstation, which published and deployed it through intranet v0.11.0. Ready revision `keiro-docs-00005` runs digest `sha256:dc0bb61b14f009aed02c8196f4d282230e76b35578ed2c93a612fc5c0eee746e`, matching the image review. The update changed only the docs Service and its release history. The analytics runtime configuration was rebuilt from the same encrypted key and matched the previous revision's value exactly; forwarded-user trust stays enabled and the origin stays cluster-local. Anonymous HTML requests redirect to login, anonymous JSON search returns 401, a spoofed forwarded-user header does not bypass login, and the default Knative hostname serves nothing. The running container reports the source commit at `/_deployment.json`. Inventory transaction and executor claim are null.
