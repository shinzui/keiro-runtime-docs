---
id: 49
slug: deploy-the-docs-to-the-labs-intranet-with-local-bun-builds
title: "Deploy the docs to the Labs intranet with local Bun builds"
kind: exec-plan
created_at: 2026-10-11T23:32:05Z
intention: "intention_01m4pmxkq5eqa8c99thec1xn43"
provenance:
  created_by:
    model: "gpt-6.1-sol"
    harness: "codex-cli"
    at: 2026-10-11T23:32:05Z
  revisions:
    - model: "gpt-6.1-sol"
      harness: "codex-cli"
      at: 2026-10-11T23:36:13Z
      mode: "other"
      note: "Complete the initial Bun-based local-runner deployment plan with release and access compatibility gates"
---


# Deploy the docs to the Labs intranet with local Bun builds

This ExecPlan is a living document. Keep Progress, Surprises & Discoveries, Decision Log, and Outcomes & Retrospective current. Promote durable decisions into `docs/adr/` during implementation. This plan is linked to `intention_01m4pmxkq5eqa8c99thec1xn43`.


## Purpose / Big Picture


Publish this repository at `https://keiro-docs.labs.topagentnetwork.net` on the existing Nagare Labs intranet. An authorized user must be able to sign in through the existing intranet login, browse documentation, search, and read Markdown exports. Anonymous users must go through login; signed-in users without the host's access grant must receive the intranet's denial response.

Build with Bun on a local machine using the repository's Nix development shell. After a successful push to `master`, GitHub Actions will dispatch a deployment job to a self-hosted runner: the GitHub Actions agent running on the local build machine. That job checks out the exact pushed commit, checks and builds the docs, and invokes Nagare to deploy the resulting container. Provide `just deploy` for the same operation manually. No Kotei installation, new platform provisioning, custom webhook service, or Nix derivation for the site is required. The local runner must be online for automatic deployments; an offline runner leaves jobs queued and the previous site serving.

The user's instruction that this project uses Bun is authoritative. Existing pnpm files and instructions are migration work, not a reason to retain pnpm in the new deployment flow. This document is a plan only; its creation does not deploy a site or register a runner.


## Progress


Implementation has not started. Add timestamped implementation entries and milestone checkboxes when execution begins.


## Surprises & Discoveries


(None from implementation yet; planning evidence is recorded in Context and Orientation.)


## Decision Log


- Decision: Use Bun for installation and script orchestration, with a committed `bun.lock` and frozen installs. Retain Node 22 where dependencies and existing check scripts require it.
  Rationale: The user explicitly corrected the package-manager assumption; changing every dependency's runtime to Bun is unnecessary.
  Date: 2026-10-11.

- Decision: Serve the built static output in a small Nginx container through an ordinary protected Nagare `Deployment`.
  Rationale: `StaticSite` currently lacks an access-policy field. `access = Just requireLogin` on a web service uses the existing intranet authentication and authorization machinery.
  Date: 2026-10-11.

- Decision: Use GitHub Actions' existing push trigger with a local self-hosted deployment runner. Keep Kotei, a polling daemon, and Git hooks outside this plan.
  Rationale: This preserves automatic deployment for pushes from any contributor's machine. The same repository-owned deployment command remains usable locally.
  Date: 2026-10-11.

- Decision: Resolve the Nagare binary from the Labs operator flake and verify its release against the live target before selecting deployment commands.
  Rationale: Current source supports reviewed image publication, but the recorded Labs release does not expose the same API. Do not blindly use the workstation's default binary, newer source commands, or upgrade the shared intranet as a side effect.
  Date: 2026-10-11.

- Decision: Use Nix to supply existing development and operator tools. Do not add `packages.docs`, `packages.image`, or a sandboxed Nix build of the website in this plan.
  Rationale: Bun's frozen dependency installation and commit-addressed images are sufficient for this delivery workflow.
  Date: 2026-10-11.


## Outcomes & Retrospective


(To be filled during implementation. Completion requires a real automatic deployment and verified protected access, not merely a workflow file or successful container build.)


## Context and Orientation


`content/docs/` contains the published Markdown with embedded components, called MDX. `src/routes/`, `src/lib/source.ts`, `source.config.ts`, and `vite.config.ts` define the Fumadocs site and its TanStack Start/Vite build. `vite.config.ts` enables a prerendered static application, producing `.output/public/`. It seeds `/docs` and `/api/search`; `src/routes/api/search.ts` produces static search data. `src/routes/docs/{$}[.]md.ts` implements Markdown export. A static host cannot execute that handler at request time: acceptance must prove that required exports are actually emitted, or extend the prerender/build to emit them. Do not assume a successful HTML build proves search or Markdown export works.

`package.json` defines the release checks and a `check` script that already builds the site. It currently declares pnpm 11.4.0, invokes pnpm internally, and uses `predev` and `prebuild` to call `scripts/copy-fonts.mjs`. `justfile`, `README.md`, `.github/workflows/ci.yml`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, and `flake.module.nix` also retain pnpm wiring. The shared `nix/bun.nix` module already supplies Bun, TypeScript, oxlint, and oxfmt. Project-owned `flake.module.nix` supplies Node 22 and pnpm. Use the Bun version actually supplied by the committed flake; the bare shell reported Bun 1.3.13 during planning, while README reports a different shell version. Do not infer the runtime version from either description.

Bun's lifecycle and dependency-script behavior must be checked rather than assumed identical to pnpm. Make the font preparation an explicit step in the Bun build/dev commands so it happens exactly once. The optional licensed font helper currently attempts a registry-based Nix build. Provide a deterministic skip option for unattended builds and use system-font fallback by default there; do not depend on a workstation font alias or copy licensed assets into a production image without an established deployment entitlement. Existing Node scripts can keep their Node shebangs and `node --test` usage.

`.github/workflows/ci.yml` currently runs verification on pull requests and pushes to `master` on GitHub-hosted Ubuntu runners. It has no deployment job. Keep pull-request verification on those hosted runners. Only the trusted `master` push path and an explicit manual dispatch of `master` may reach the local deployment runner.

Local [ADR 1](../adr/0001-initial-release-scope-and-technical-writing.md) requires Language 6 release documentation, canonical terminology, and the existing editorial checks. Local [ADR 2](../adr/0002-publish-the-canonical-runtime-pattern-catalog.md) requires committed source snapshots and working search/Markdown access for the projected pattern catalog. Read their current versions and retain their checks. No local ADR presently defines hosting or deployment. The ADR directory uses ordinary Markdown records, and `mori.dhall` has no profiled ADR bundle. During implementation, allocate a new ADR according to the then-current filesystem convention rather than assuming a filename number now. Preserve other ongoing work: planning began with edits to ADR 1 and ExecPlan 48, an untracked ADR 2, and untracked files under `scripts/lib/`.

Cross-repository dependencies have canonical owners. Discover them with Mori before reading their files:

```bash
# Run from this repository.
mori registry show shinzui/nagare --full
mori registry docs shinzui/nagare
mori registry show tan/tan-ng-labs --full
mori path mori://shinzui/nagare
mori path mori://tan/tan-ng-labs
```

`mori://tan/tan-ng-labs` owns the operator configuration for context `labs`, GCP project `tan-ng-labs`, and base domain `labs.topagentnetwork.net`. Its project-relative `flake.nix` pins Nagare v0.3.0 and its project-relative `contexts/labs.env` records platform version 0.3.0. These file-level artifact URIs are pending; use the canonical project URI together with these relative paths. Mori's package metadata still reports an older version, demonstrating why registry observations are discovery aids rather than release authority. `mori://tan/tan-ng-labs/docs/readme` describes the context and access setup. No new DNS delegation, VM, authentication plane, or base-domain change is part of this work.

`mori://shinzui/nagare/packages/nagarectl` owns deployment. Within `mori://shinzui/nagare`, the relevant project-relative files are `cli/nagare-dsl/src/Nagare/Dsl/Presets.hs`, `cli/nagare-dsl/src/Nagare/Dsl/Types.hs`, `cli/nagare-dsl/src/Nagare/Dsl/Static/Types.hs`, `cli/nagarectl/app/Main.hs`, `cli/nagarectl/src/Nagare/Image.hs`, and `cli/nagarectl/src/Nagare/Access/Resolve.hs`; file-level artifact URIs are pending. Read these at the selected release with `git show v0.3.0:<project-relative-path>`, not just at checkout HEAD. The v0.3.0 API has `webService`, `mkDomains`, `DockerfileBuild`, and `requireLogin`. A short image name is qualified using the selected context's Artifact Registry prefix. Its Dockerfile deployment builds for the context's platform, pushes, applies the Service, and waits for readiness. The newer reviewed route instead requires accepted image resources and inventory apply. The default binary on the planning shell was 0.2.2 and rejected `app image-plan`. None of these observations proves which release the live cluster currently runs; milestone 2 must establish that.

There is also a concrete protection-ordering concern in v0.3.0: `runDeploy` applies ordinary Service/DomainMapping manifests and waits before calling `resolveDeploymentAccess`. The access resolver registers configured custom domains; a secondary default Knative hostname also needs explicit verification. Do not claim this route is protected throughout deployment merely because the final config carries `requireLogin`. Milestone 2 must determine whether the actual installed release closes these paths. If a platform fix or upgrade is necessary, make it an explicit bounded prerequisite in the owning Nagare/Labs projects; do not conceal it in the docs script or open a temporary public route to make a deploy pass.

An OCI image is the packaged container filesystem stored in the registry. Its digest is a content hash identifying the exact published bytes. Keep the full Git commit as source provenance and in a small build-information JSON file; use a commit-derived tag for navigation. The image's `linux/amd64` target must follow the actual Labs node architecture, rather than the local Mac architecture. Planning found no running Docker daemon at the workstation's Colima socket; Docker availability is an implementation prerequisite, not evidence that this repository cannot build.


## Plan of Work


### Milestone 1: Make Bun the reproducible project command path


Convert active commands in `package.json`, `justfile`, `README.md`, `.github/workflows/ci.yml`, and `flake.module.nix` to Bun. Remove pnpm from project-owned shell packages while preserving Node 22. Generate and commit `bun.lock`, migrate the existing lock where the selected Bun supports it, and inspect the resolved dependency diff so this work does not silently upgrade application libraries. Remove `pnpm-lock.yaml` and `pnpm-workspace.yaml` only after Bun's lock and native-package installation work from an empty dependency directory. Translate only actually needed dependency build permissions to Bun's `trustedDependencies`; do not grant broad script trust. Do not rewrite historical plans or source-review transcripts merely because they mention pnpm.

Keep the release gate equivalent to today's checks, including diagram checks and terminology verification. Use `bun run` for orchestration and retain the shared shell's compiler/Oxc tools. Make `copy-fonts` explicit in `build` and `dev`, eliminating duplicate or silently skipped lifecycle behavior; add a documented skip mode to `scripts/copy-fonts.mjs` for the deployment runner. Verify source-map generation for Fumadocs during typecheck. Update CI to use `bun install --frozen-lockfile` and `bun run check` or the equivalent individually reported steps.

Acceptance is a fresh dependency install and full release check inside `nix develop`, with no pnpm executable required and no lockfile modification. The static output must exist. Bun install, typecheck, and build failures must remain failing commands.

### Milestone 2: Establish the version-matched Labs deployment contract


Use the Mori-resolved Labs operator flake to obtain `nagarectl`; compare CLI, payload, context, and live cluster release with `platform status --json`. Run context and kube guards and confirm GCP project `tan-ng-labs`, context `labs`, base domain `labs.topagentnetwork.net`, registry prefix, and the node's image platform. Read only the necessary non-secret context fields. Check Docker availability and registry authentication. Reuse existing kubeconfig and operator credentials; do not regenerate cluster state or switch the machine's global current-context pointer.

Add `scripts/deploy-docs.ts` with an initial `--preflight` mode that resolves these tools, selects context `labs` explicitly, and reports actionable failures. Obtain the Labs checkout from Mori, with a documented `KEIRO_DOCS_LABS_REPO` override for a runner that has the operator checkout but no Mori registry. Keep the operator flake lock as the source of the CLI pin. The deployment script must refuse release or project mismatch and missing Docker before building or mutating an application.

Inspect the selected release's auth renderers and ordering. Verify that protection will include both the chosen domain and any reachable default Knative hostname, and will persist through rollout failures. If the live release retains the v0.3.0 ordering/bypass problem, record a bounded prerequisite ExecPlan in `mori://shinzui/nagare` and the compatible rollout work in `mori://tan/tan-ng-labs` as the operator owner. That prerequisite must move auth availability checks before application mutation, avoid emitting direct public mappings for protected apps, and close alternate public backend routes while keeping the enforcer's internal origin reachable. Use an existing versioned fix if available. Do not upgrade shared platform resources or manufacture a raw Kubernetes deployment in this docs plan. Leave live deployment disabled until that prerequisite is satisfied and record its canonical plan URI here.

Acceptance is a reproducible preflight on the intended build machine and a recorded supported, protection-preserving Nagare invocation. A wrong project, old PATH binary, unavailable Docker, absent auth plane, or incompatible release produces a clear nonzero result before application mutation. Record the selected release and command contract in this plan.

### Milestone 3: Package and exercise the static site locally


Add `deploy/Dockerfile`, `deploy/nginx.conf`, `.dockerignore`, and `scripts/check-docs-container.ts`. The Dockerfile packages only the already-built `.output/public/` and the Nginx configuration; it does not reinstall JavaScript dependencies or rebuild the site in Docker. Select an existing maintained Nginx image, verify its authoritative registry identity when implementing, and pin its image digest. Do not guess a current tag in this plan. Listen on `0.0.0.0:8080`. The container needs no Bun, Node, Nix, database, or volume at runtime.

Nginx must serve actual files, directory indexes, prerendered HTML, and the existing `/_shell.html` SPA fallback in the correct order. Its search route must serve the generated JSON with the correct media type; Markdown export must return Markdown rather than the HTML shell. Missing assets must return 404 rather than the SPA shell. Cache fingerprinted assets with a long immutable lifetime and keep HTML, search data, and `/_deployment.json` fresh. Provide an internal `/healthz` returning HTTP 200 and body `ok`. Match the current app's static behavior rather than copying `serve.json`'s catch-all literally. If Markdown routes are not emitted, add their concrete paths to the build's prerender inputs or generate static export files during the build, and test the content.

Have the deployment script create a private temporary Git worktree at the selected full commit: a separate checkout whose contents cannot be changed by edits to the user's working tree. Install and check with Bun there, using the font skip mode, then write `/_deployment.json` with the full commit and target hostname. Ensure the Docker context allowlist includes only the Dockerfile, Nginx config, and built output. Exclude `.git`, operator material, environment files, and dependencies. Run the smoke container on an ephemeral localhost port and remove it on success or failure.

Acceptance is a container built for the Labs target architecture serving the landing page, a deep docs route, an SVG diagram, search JSON, Markdown export, and the expected build commit. A missing JavaScript asset must return 404, and the health endpoint must return `ok`. These tests exercise the image locally without registry push or cluster apply.

### Milestone 4: Deploy a protected, commit-addressed application


Add `nagare/Config.hs`. Base it on the selected release's `webService "keiro-docs" "keiro-docs"` preset, set the existing application namespace `personal` unless milestone 2 records a different established Labs application namespace, and set canonical domains with `mkDomains [("keiro-docs.labs.topagentnetwork.net", True)]`. Set `access = Just requireLogin`. Point `DockerfileBuild` at `deploy/Dockerfile`, context `.`, so Nagare packages the output built in milestone 3. Retain port 8080, small declared resource requests/limits, and request-driven scaling appropriate for a docs site. Do not configure new databases, volumes, tasks, or CDN resources.

Implement `just deploy`, `just deploy-preflight`, `just deploy-dry-run`, `just deploy-smoke`, and `just deploy-rollback TAG`. `scripts/deploy-docs.ts` accepts `--commit`, uses a verified full Git SHA, and runs milestone 2 preflight plus milestone 3 checks. On the version-compatible direct Dockerfile route, Nagare owns image build, registry push, and deployment. On a release whose supported interface requires reviewed image publication, export the exact built image archive, publish/apply its image review, and pass its accepted resource ID to deploy. Implement the single route proven in milestone 2; do not infer support through silent fallback after a failed deploy. Put any private reviews under the local deployment state directory, never in the repo.

Use the full Git commit for `--source` and a deterministic `git-<full-SHA>` image tag. Preserve the full published image digest in the local release receipt along with commit, hostname, context, CLI release, and previous image. Do not overwrite an already published tag with different bytes: inspect it first and reuse the accepted image for retries. A container built from a later source tree must never claim the earlier commit.

After deployment, verify that the desired hostname targets the existing access enforcer, that its backend resolves only through the protected path, and that existing intranet routes still work. Preserve the existing login portal. Reuse the existing host-grant policy; new users or broad access grants are not guessed. Provide the operator's existing grant procedure for this host if no intended reader has access yet. Portal synchronization follows the selected release's supported interface and occurs only if required for the new host, not as a blanket reinstall of auth.

Acceptance is one real release at the requested URL with matching Git SHA/image evidence, valid HTTPS, login for anonymous requests, denial for an unauthorized account, and usable docs for an authorized account. A repeated invocation for the same accepted image converges on that release. A rollback selects a previously recorded image without rebuilding its source and retains the protected host configuration.

### Milestone 5: Deploy automatically after a successful master push


Extend `.github/workflows/ci.yml` with a deployment job depending on the hosted `gates` job. Run it only for `push` to `refs/heads/master` and an explicit `workflow_dispatch` targeting `master`. The deployment job uses a local self-hosted runner labeled `nagare-labs`; document its OS/architecture and match the `runs-on` labels to the actual machine. Checkout `${{ github.sha }}` with credentials not persisted, verify HEAD matches that SHA, and call the same `just deploy` implementation. The build occurs on the local runner even though hosted CI also verifies the source.

Give the deploy job a separate concurrency group, `keiro-docs-labs`, with `cancel-in-progress: false`: do not terminate a running cluster mutation when another push arrives. Keep the existing CI supersession behavior for hosted verification separately, moving its top-level cancellation to the hosted job so it cannot cancel a deployment. Just before deployment starts, compare the candidate with the current remote master tip; skip superseded automatic candidates and report their SHAs. Manual rollback is not subject to that latest-tip guard. Serialize manual and automatic deployment on the build machine with the same local lock and refuse overlapping mutations.

Keep the runner installed outside the checkout and use a stable private state directory for locks, receipts, and any saved reviews. Configure a dedicated local account/runner directory with access to the existing operator flake, Nix, Docker, and the version-matched Labs credentials. Check out the operator repository on that machine independently of this public docs repository. Reuse its established kubeconfig and credential handling; do not place operator credentials, registration tokens, or decrypted secrets in repository files, caches, or Actions artifacts. Use `gh api` or repository runner settings during setup to register the runner, following the instructions returned by GitHub for that machine; never log its registration token. Test runner readiness before enabling the deployment job. Pull-request jobs, including fork submissions, stay on hosted runners and receive no deployment credentials.

Acceptance is a real push to `master` that passes hosted gates, builds locally without a manual build step, and updates the protected URL to that commit. A pull request and a push to another branch cannot schedule the deployment job. Failing verification does not deploy. Two quick pushes do not interrupt a rollout or leave the older commit as the final release. The operator can see a queued deployment when the runner is offline and resume it by bringing the runner online.

### Milestone 6: Prove the complete flow and document operations


Add `docs/deployment.md` explaining the local commands, runner setup, required non-secret configuration, selected Nagare contract, host access policy, release evidence, rollback, and offline-runner behavior. Update README's deployment and development sections. Add a hosting ADR describing Bun with the existing Nix shell, protected static content in a regular Deployment, Nagare's ownership, and GitHub Actions with a local runner. Follow the local ADR convention and preserve already allocated records.

Add focused tests for the deployment orchestration boundaries in `scripts/deploy-docs.test.ts`: wrong context/release, failed check/build, SHA mismatch, superseded automatic commit, same-image retry, concurrent deployment, and prebuilt rollback. Use an injectable command runner and a temporary fixture repository so tests exercise meaningful failures without cloud changes. Verify Docker routing with the real local smoke test and verify authentication with the existing intranet accounts. Unit tests cannot establish live access protection.

Capture concise transcripts of the automatic deployment, protected browser access, search, Markdown export, image/source match, and one rollback/redeploy exercise. Preserve full logs privately; put only non-secret evidence in the plan or deployment document. Run the final release gate. The plan remains incomplete while the local runner is unregistered, auth compatibility is unresolved, or the real push-to-protected-site path has not passed.


## Concrete Steps


All project commands below run from this repository's root unless a working directory is specified. The implementation adds the `deploy-*` recipes and scripts; they do not exist at plan creation.

Establish the tool versions and target contract first:

```bash
nix develop --command bun --version
LABS_REPO=$(mori path mori://tan/tan-ng-labs | tail -n 1)
nix develop "$LABS_REPO" --command nagarectl version
nix develop "$LABS_REPO" --command nagarectl --context labs platform status --json
nix develop "$LABS_REPO" --command nagarectl --context labs context guard
nix develop "$LABS_REPO" --command nagarectl --context labs kube guard
nix develop "$LABS_REPO" --command nagarectl --context labs deploy --help
docker version
```

Mori currently prints the URI and path on separate lines; `tail -n 1` selects the resolved path. Validate that it is an existing operator checkout before using it. Expected context-guard success is `context guard: labs confined to project tan-ng-labs (stack labs)`. Platform status must report compatible identities; if it differs from the recorded v0.3.0 pin, investigate through that operator project's source and release evidence before proceeding. Do not print the complete context environment into shared logs.

After milestone 1, run the frozen install and release gate:

```bash
nix develop --command bun install --frozen-lockfile
nix develop --command bun run check
git diff --exit-code -- bun.lock
```

Expected outcomes are exit 0 for all commands and built files under `.output/public/`. Use the new documented font skip setting on the unattended build machine. Check a clean temporary worktree as well as the existing working tree so leftover dependencies cannot mask an installation failure.

After the deployment commands are implemented:

```bash
nix develop --command bun test scripts/deploy-docs.test.ts
nix develop --command just deploy-preflight
nix develop --command just deploy-smoke
nix develop --command just deploy-dry-run
nix develop --command just deploy
```

Preflight and dry-run must not apply application resources. The smoke command starts only a local container. The real deployment must finish with the target URL, full source commit, and image evidence. Its default candidate is the current committed HEAD; it builds from an isolated checkout and does not publish uncommitted local edits. CI supplies its explicit verified commit.

A version-matched direct deployment, if milestone 2 establishes it is safe, has this shape inside the prepared worktree:

```bash
# Run from the isolated docs worktree containing its freshly built output.
SOURCE_SHA=$(git rev-parse HEAD)
nix develop "$LABS_REPO" --command nagarectl --context labs deploy \
  --file nagare/Config.hs --tag "git-$SOURCE_SHA" --source "$SOURCE_SHA" \
  --base-domain labs.topagentnetwork.net
```

Do not add `app image-plan`, `--image-resource`, `--save-plan`, or `--skip-build` to a release that does not support them. If milestone 2 establishes a newer reviewed route, replace this example in the living plan with the exact proven image-publication/deployment invocation and required accepted resource identities before live execution.

Verify the public access boundary without providing cookies:

```bash
curl -sS -o /dev/null -D - https://keiro-docs.labs.topagentnetwork.net/
curl -sS -o /dev/null -D - https://keiro-docs.labs.topagentnetwork.net/api/search
curl -sS -o /dev/null -D - https://keiro-docs.labs.topagentnetwork.net/_deployment.json
```

Expect the existing login flow, normally HTTP 302 to `/_nagare/login`, and no docs/search/build JSON bodies. Verify a known emitted Markdown export similarly. Use the browser's existing intranet sessions for signed-in acceptance; never paste session cookies into commands or evidence. For an authorized user, check a deep link, a rendered diagram, search results, Markdown export, and the deployment-info JSON. For a signed-in ungranted account, expect HTTP 403 with the existing denial page.

After registering the local runner and enabling the job, use a harmless documentation change committed to the existing `master` branch and push normally. Observe the specific workflow run and its exact source SHA, then verify that SHA through the protected build-info endpoint. Finally run:

```bash
nix develop --command just deploy-rollback PREVIOUS_TAG
nix develop --command just deploy
```

Replace `PREVIOUS_TAG` with an actual prior receipt's `git-<full-SHA>` tag. Both releases must preserve hostname and access policy. This is a real service change during implementation, not a planning-time check.


## Validation and Acceptance


The project must install and pass all existing release checks using Bun and the committed lockfile from a clean checkout. The optional font helper must have a deterministic unattended path. Active scripts and CI must not execute pnpm, and the check command must still exercise terminology, prose, navigation, diagrams, typecheck, lint, formatting, build, and links.

The local image must pass concrete HTTP checks for HTML, deep routes, assets, diagrams, search JSON, and Markdown exports. Verify content and media types, not just HTTP 200. A JS/JSON request returning the HTML shell is a failure. Test emitted Markdown for a retained docs page and, once present in the committed candidate, a runtime-pattern catalog page. Ensure the image architecture matches the Labs node.

The actual requested domain must have working HTTPS and the existing intranet login/denial behavior. Both configured and alternate reachable hostnames must prevent anonymous content access. A failed or interrupted deployment must not create an unprotected path. Confirm that other intranet applications and the login portal still function after the new host is added. Do not mark protection verified solely from a dry-run manifest.

A successful `master` push must trigger hosted gates and then the local deployment job, without an operator manually building an image. The job's checkout, the image receipt, Nagare's source provenance, and the protected `/_deployment.json` must identify the same full Git commit. A failing gate, wrong target, unavailable auth plane, SHA mismatch, or unsupported CLI contract must prevent deployment. Pull requests and non-master pushes must not run on the deployment runner.

Repeat a successful release and exercise a previous-image rollback. Verify that a concurrent attempt cannot mutate the app and that a superseded queued automatic release cannot overwrite a newer desired release. Retain concise non-secret evidence for each outcome. The hosted gate passing is necessary but does not establish live deployment or authentication success.


## Idempotence and Recovery


Use isolated worktrees and private temporary directories for builds. Remove only directories, containers, and worktrees created by the deployment invocation; never restore or clean the user's working tree. Signal handling must stop owned child processes, remove the smoke container, and release the local lock. A stale lock requires proof its owner no longer runs before removal.

Record the previous live image before application mutation and write a successful receipt only after readiness and protected-route verification pass. Do not rebuild a historical image for rollback. Select its immutable published digest and retain the current hostname/access configuration through a version-matched prebuilt deployment, or the selected release's supported reviewed rollback. In the direct API, `PrebuiltImage` carries the chosen tag and may ignore `--tag`; verify the actually rendered image. Expose rollback through the same context/version/auth preflight and local lock.

A gate or local build failure leaves the current release untouched. A registry or cluster failure may leave an unused image or incomplete release; retain the receipt/proposed release privately, inspect the actual live image and route, and resume or roll back through Nagare. Do not delete the shared auth backend map or other sites to repair this app. An auth-ordering failure is a platform prerequisite failure, not a reason to retry public deployment.

The automatic job may be retried after credentials, Docker, network, or runner availability recover. Recheck its SHA against remote master and report an intentional skip if it is superseded. Serialize all deployments; do not use cancellation to interrupt an in-progress apply. An operator rollback must remain in place until an explicitly new automatic candidate or manual deploy requests another release.


## Interfaces and Dependencies


`nagare/Config.hs` exports `main :: IO ()` and emits a Nagare `Deployment` using `emitDeployment`. It declares the canonical hostname, protected access, static-server port, and Dockerfile build. Its dependencies are the selected release's `Nagare.Dsl.Presets.webService`, `Nagare.Dsl.Types.mkDomains`, `Nagare.Dsl.Build.DockerfileBuild`, and `Nagare.Dsl.Access.requireLogin`; verify their source via `mori://shinzui/nagare` before implementation. Never traverse `/nix/store` to discover them.

`scripts/deploy-docs.ts` provides argument-based modes for preflight, dry-run, smoke, deploy of an exact commit, and rollback of a recorded tag. `justfile` offers the named user-facing recipes. Keep command execution injectable for focused tests; pass argument arrays rather than shell-concatenating paths, commit IDs, or credentials. Its subprocesses use the docs flake for Bun/checks and the operator flake for Nagare, with context `labs` explicit. State lives in a stable private directory chosen by `KEIRO_DOCS_STATE_DIR`, defaulting under the runner user's home outside the repository. `KEIRO_DOCS_LABS_REPO` locates the operator checkout when Mori is unavailable. The implementation documents and validates both overrides without reusing system-reserved variables.

`scripts/check-docs-container.ts` builds/runs an isolated local smoke container and checks routes plus media types. `.github/workflows/ci.yml` calls the same deploy interface on a local runner after hosted verification for the exact trusted master revision. The workflow uses the runner's established credentials, not secrets committed in the docs repo. `.dockerignore` defines the narrow public-output packaging boundary.

Bun and Node are build tools; Nginx is the static runtime; Nix supplies the already pinned tool environments; GitHub Actions supplies triggers and job status; Nagare supplies image publication/deployment, HTTPS routing, application lifecycle, and integration with the existing identity system. Kotei is not a dependency of this plan. If the selected Nagare release requires a protected-deployment prerequisite, record the canonical owning plan URI here and satisfy it before the live milestones.


## Creation Note


Created on 2026-10-11 from the current working tree, local Mori registry, selected Nagare release sources, and the user's instructions. The plan corrects the earlier pnpm assumption and distinguishes current Nagare checkout APIs from the installed CLI and Labs release. No implementation, runner registration, platform upgrade, or production deployment was performed while creating it.
