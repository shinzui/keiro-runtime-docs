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
    - model: "gpt-6.1-sol"
      harness: "codex-cli"
      at: 2026-10-12T02:14:43Z
      mode: "implement"
      note: "Implement the user-authorized Bun toolchain migration and remove legacy package-manager references"
    - model: "gpt-6.1-sol"
      harness: "codex-cli"
      at: 2026-10-13T04:58:40Z
      mode: "implement"
      note: "Deploy the protected docs manually using the current intranet v0.6.2 reviewed publication contract"
---

# Deploy the docs to the Labs intranet with local Bun builds

This ExecPlan is a living document. Keep its progress, discoveries, decisions, and outcomes current. Its intention is `intention_01m4pmxkq5eqa8c99thec1xn43`.

## Purpose / Big Picture


Publish the static Fumadocs site at `https://keiro-docs.labs.topagentnetwork.net`. Anonymous readers must authenticate through the existing intranet portal, and signed-in readers need a host grant. Search, Markdown exports, diagrams, and deep links must work.

The current user request authorizes a manual protected deployment. The original plan also proposes automatic master deployment through a local GitHub Actions runner. That broader automation remains pending; it is not needed to complete the current manual deployment.

## Progress


- [x] (2026-10-12 02:30Z) Milestone 1: migrated project commands to Bun, verified a fresh frozen install preserving all 611 dependency identities, and passed the release gate with real static artifacts.
- [x] (2026-10-13 04:59Z) Milestone 2: verified the operator environment and live intranet use Nagare v0.6.2 with exact CLI, cluster, host, context, and payload compatibility. Node `intranet-nagare` is Ready; auth is converged; no transaction or executor claim is active.
- [x] (2026-10-13) Milestone 3: built committed revision `b0e17e72ee7f044b37af5ad651e26ed0dc3b0a7f` for linux/amd64 with the complete release gate and a real HTTP smoke test. Root/deep HTML, JavaScript, bundled SVG, search, Markdown, health, SHA, and missing-file 404s passed. Saved the archive in private deployment state.
- [ ] Milestone 4: publish the accepted image, apply the protected deployment, grant the existing operator account, and verify live HTTPS and access behavior.
- [ ] Milestone 5: register a local runner and enable trusted-master automatic deployment.
- [ ] Milestone 6: complete automatic-release, rollback, and authorized/denied browser acceptance for the broader plan.

The initial image and protected deployment have converged, and the existing operator account has an accepted host grant. Browser acceptance found an omitted UTF-8 declaration on Markdown responses; a corrected immutable release is being built before recording final live acceptance.

## Surprises & Discoveries


The previous plan described the retired `labs` context and Nagare v0.3.0. The operator checkout now owns context `intranet`, registry repository `nagare-intranet`, and release v0.6.2. Mori registration metadata lagged these working files; authoritative upstream release metadata and live platform status confirm v0.6.2.

Nagare has first-class `StaticSite` and `ServerSite` support, but neither model in v0.6.2 has an access field. Protected `Deployment` is the supported route. The reviewed compiler keeps the origin private and contributes declared public routes to the accepted auth owner. When a custom domain is declared, the default Knative hostname is private rather than an additional public enforcer route.

The real smoke test caught Nginx directory redirects using internal port 8080. Setting `absolute_redirect off` preserved the public host and passed the deep-route check. The smoke test also waits for container readiness before making route assertions.

Live Markdown opened successfully after the host grant, but punctuation rendered as mojibake because the text response omitted a charset. `charset utf-8` in Nginx declares the source encoding, and the smoke check now requires it on Markdown exports. The [upstream charset reference](https://nginx.org/en/docs/http/ngx_http_charset_module.html) documents this response-header behavior.

Reviewed access planning and applying both require private `NAGARE_EN_API_KEY`. The adapter opens its own private port-forward, but does not acquire that credential. An apply attempted outside that environment stopped with a known-no-effect preflight refusal; the same transaction converged through `inventory resume` with the key supplied. The initial TLS issuance failed at the ACME finalize endpoint after successful DNS validation. The supported single-certificate `cmctl renew` recovery produced a valid Ready certificate; no TLS or auth policy was weakened.

The build emits `_shell.html` rather than root `index.html`. Packaging supplies the root entry point and preserves prerendered routes. Diagrams are bundled SVG strings in JavaScript modules, not standalone public SVG files; smoke checks verify the real emitted diagram module. Search is `/api/search.json`, and Markdown exports have `.txt` extensions.

The Bun migration exposed Nitro tracing of `tslib`: bundling it explicitly restored prerendering. `scripts/check-static-output.mjs` now fails when representative HTML, search, or Markdown artifacts are missing. The existing full gate passed again before deployment work on 2026-10-13.

## Decision Log


Use Bun with the frozen lock, retaining Node 22 for existing tools. Skip licensed-font discovery in release builds. This preserves the established toolchain and avoids workstation-only assets.

Use a protected Nagare `Deployment` with Nginx serving static files on port 8080, canonical host `keiro-docs.labs.topagentnetwork.net`, namespace `personal`, and scale 1..3. One warm replica avoids docs cold starts. [ADR 4](../adr/0004-host-static-docs-behind-the-nagare-intranet-access-policy.md) records the platform boundary.

Use only the current v0.6.2 reviewed route: build externally, export a Docker archive, publish with `app image-plan`, then deploy with its accepted image resource. `PrebuiltImage` must declare the same tag as publication; the CLI `--tag` does not override it. Keep reviews and archives outside the public checkout. Record full Git SHA provenance and use immutable `git-<full-SHA>` tags.

Complete the manual deployment authorized in this session. Keep runner registration and automatic deployment pending instead of treating the original broader plan as authorization to install automation now.

## Outcomes & Retrospective


The toolchain milestone is complete. Manual deployment evidence will be added after the live checks. No self-hosted runner or deployment CI job has been installed. The broader plan cannot be marked complete until its automatic deployment and recovery acceptance pass.

## Context and Orientation


The site sources are `content/docs/`, `src/`, `source.config.ts`, and `vite.config.ts`. `bun run check` verifies source snapshots, documentation, types, lint, formatting, navigation, diagrams, production build, and links. Production output is `.output/public/`.

[ADR 1](../adr/0001-initial-release-scope-and-technical-writing.md) defines release scope. [ADR 2](../adr/0002-publish-the-canonical-runtime-pattern-catalog.md) requires catalog search and Markdown exports. [ADR 3](../adr/0003-use-bun-for-project-installation-and-command-orchestration.md) defines the Bun command path. ADRs use ordinary Markdown records, not a profiled OKF bundle.

`mori://tan/tan-ng-labs` owns the operator environment: project-relative `.envrc`, `flake.nix`, `contexts/intranet.env`, and `docs/runbooks/operations.md` (file-level artifact URIs pending). Use `direnv exec` against that checkout so context, kubeconfig, gcloud configuration, and CLI pin stay paired. The GCP project is `tan-ng-labs`, base domain `labs.topagentnetwork.net`, target `linux/amd64`, and image prefix `us-west1-docker.pkg.dev/tan-ng-labs/nagare-intranet`.

`mori://shinzui/nagare` owns the DSL and deployment contract. Read the v0.6.2 versions of project-relative `cli/nagare-dsl/src/Nagare/Dsl/Types.hs`, `Presets.hs`, `Build.hs`, `Static/Types.hs`, `Server/Types.hs`, and `docs/user/deploying-apps.md`; artifact-level URIs are pending. Never traverse `/nix/store` for source. No platform upgrade, auth-plane reinstall, DNS delegation change, or new database is needed.

## Plan of Work


### Milestones 2–4: Manual protected release


Follow [the complete deployment procedure](../deployment.md). `nagare/Config.hs` emits a `Deployment` with `requireLogin` and reads `KEIRO_DOCS_IMAGE_TAG`. `scripts/build-docs-image.sh`, exposed as `just deploy-image`, requires clean committed source, runs frozen installation and the complete gate, prepares root HTML and `/_deployment.json`, builds a linux/amd64 image, runs `scripts/check-docs-container.mjs`, and exports the archive. `deploy/Dockerfile`, `deploy/nginx.conf`, and `.dockerignore` define the runtime and narrow packaging boundary.

Save and inspect the image review, then apply it. Save and inspect the Service review with the accepted image resource. Require a private origin plus a protected canonical route before applying; verify the default hostname cannot bypass protection. Grant the existing operator email through the existing en procedure. Verify HTTPS, anonymous denial/login, protected API behavior, and authorized usability. Retain full image/source evidence privately.

### Milestone 5: Automatic deployment


When authorized, register a local runner outside the checkout. Keep credentials in the operator environment. Add a deployment job after hosted gates, restricted to trusted master pushes and explicit master dispatch. Pull requests remain on hosted runners. Disable cancellation for deployment, serialize local mutations, verify the exact SHA, and skip superseded automatic candidates before mutation. Reuse the same reviewed publication/deployment contract. The runner must be online; offline jobs queue while the old release serves.

### Milestone 6: Complete broader acceptance


Prove a real push-to-protected-site release with matching SHA, repeat convergence using the accepted image, verify authorized and ungranted browser behavior, and exercise rollback using a previously published image. Add orchestration tests for wrong context/release, build failure, SHA mismatch, superseded candidate, publication retry, and concurrent deployment when implementing automation. Record concise evidence and distill durable decisions into the hosting ADR.

## Concrete Steps


Run build commands from the docs checkout:

```bash
nix develop --command just deploy-image
```

Run the publication, Service deployment, and grant commands exactly as documented in [deployment.md](../deployment.md). Resolve the operator checkout using `mori path mori://tan/tan-ng-labs`; use `direnv exec` and context `intranet`. Expect exact v0.6.2 compatibility, node Ready, and null transaction/claim. The standard reviewed route requires `--image-resource`; the former direct v0.3.0 example is obsolete.

For anonymous verification:

```bash
curl -sS -o /dev/null -D - https://keiro-docs.labs.topagentnetwork.net/
curl -sS -o /dev/null -D - https://keiro-docs.labs.topagentnetwork.net/api/search.json
curl -sS -o /dev/null -D - https://keiro-docs.labs.topagentnetwork.net/_deployment.json
```

Document requests should reach login; JSON/API requests can return 401 JSON. Neither may return docs content. Repeat on the default hostname. Use browser sessions for authorized tests, without exporting cookies.

## Validation and Acceptance


The image must serve root/deep HTML, real JavaScript, bundled SVG content, search JSON, Markdown text, health `ok`, and the expected full commit. Missing assets and API files must return 404. Local smoke verification does not establish live access protection.

The manual task is complete when the requested HTTPS hostname serves the expected release behind the existing login and grant policy, the default hostname cannot bypass it, and existing intranet routes remain usable. Record any browser acceptance unavailable without user interaction accurately.

The broader plan additionally requires successful automatic master deployment, denied-account acceptance, repeat convergence, and previous-image rollback. Keep those outcomes pending until observed.

## Idempotence and Recovery


Preserve the user's working tree; build only committed source. Keep archives and saved reviews in a private directory outside the repo. Remove only smoke containers created by the invocation. Keep archive bytes unchanged until image apply completes. Reuse accepted immutable publication evidence for retries; never overwrite a published tag with different bytes.

If apply is interrupted, inspect Nagare's active transaction and use its named resume/recovery path. Never delete shared auth state or manually patch cluster objects to bypass a refusal. Roll back with a previous accepted image resource, its original tag, and original source SHA while retaining `requireLogin` and the canonical domain.

## Interfaces and Dependencies


Bun/Node build and validate the source. Docker packages the static runtime. The operator-pinned Nagare publishes images and applies protected Service reviews, including TLS and access integration. Nginx serves the static content; no persistent volume or database is required.

`KEIRO_DOCS_IMAGE_TAG` is mandatory when evaluating the config. `KEIRO_DOCS_STATE_DIR` chooses private build state. `scripts/build-docs-image.sh` requires a clean tree, a running Docker daemon, and the docs Nix shell. Manual reviewed deployment commands and grants are documented in `docs/deployment.md`. Automatic orchestration remains pending.

## Creation Note


Created on 2026-10-11. Milestone 1 was implemented on 2026-10-12. Revised on 2026-10-13 to replace retired context/release assumptions with the verified intranet v0.6.2 contract and implement the currently authorized manual protected deployment. Historical toolchain evidence retains its original scope.
