# Host static docs behind the Nagare intranet access policy

Status: Accepted

Date: 2026-10-14

## Context

The docs build emits static HTML, JavaScript, search JSON, and Markdown exports. Nagare v0.6.2 supports first-class static and server sites, but neither site model has an access-policy field. The requested hostname must use the existing intranet login and host grants.

## Decision

Package `.output/public/` in Nginx on port 8080 and deploy a Nagare `Deployment` with `access = Just requireLogin`. Reuse the accepted platform auth plane. Set `keiro-docs.labs.topagentnetwork.net` as the canonical domain, namespace `personal`, and keep one replica warm. Nagare owns the protected routes, image publication, and release history.

Use the operator environment from `mori://tan/tan-ng-labs`, project-relative `.envrc` and `flake.nix` (artifact-level URIs pending). Its current context is `intranet` and release is v0.6.3. Publish a linux/amd64 Docker archive through an image inventory review, then deploy the accepted image through a separate Service review. The config requires the same explicit image tag used for publication. Retain private reviews outside the public repository.

Build and smoke-test linux/amd64 images with Apple container on Apple silicon using Rosetta. Convert its OCI archive with daemonless `skopeo` to preserve the reviewed publisher’s Docker archive interface.

Build from clean committed source with the frozen Bun lock and the full release gate. Put the full source SHA in the image label and `/_deployment.json`; use `git-<full-SHA>` tags. Serve the SPA shell at the root, real prerendered deep routes, and strict 404s for absent API and asset files. Skip optional licensed fonts for releases.

Use relative directory redirects (`absolute_redirect off`) so Nginx does not expose internal port 8080 in public URLs. Declare `charset utf-8` so browsers decode Markdown punctuation correctly. Verify both behaviors against the actual runtime container before publication. Keep the private en API key available throughout reviewed grant planning and applying; automatic private transport does not acquire the credential.

## Consequences

The static runtime needs no Node server or persistent data. [ADR 5](0005-use-optional-runtime-analytics-with-explicit-identity-trust.md) adds optional runtime JSON and an explicitly enabled, non-cacheable forwarded-subject endpoint in Nginx. It preserves the private origin and existing login policy; browser configuration cannot enable origin trust. All docs, search, exports, and assets pass through the platform access enforcer. Users need separate grants for this host. First-class protected site hosting can replace this packaging when Nagare supports it; making that platform change is separate work.

Manual deployment is documented in [deployment.md](../deployment.md). Automatic deployment and local runner registration in [ExecPlan 49](../plans/49-deploy-the-docs-to-the-labs-intranet-with-local-bun-builds.md) remain future work.
