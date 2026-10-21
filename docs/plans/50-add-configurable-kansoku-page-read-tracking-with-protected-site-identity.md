---
id: 50
slug: add-configurable-kansoku-page-read-tracking-with-protected-site-identity
title: "Add configurable Kansoku page-read tracking with protected-site identity"
kind: exec-plan
created_at: 2026-10-20T23:52:16Z
provenance:
  created_by:
    model: "gpt-6.1-sol"
    harness: "codex-cli"
    at: 2026-10-20T23:52:16Z
  revisions:
    - model: "gpt-6.1-sol"
      harness: "codex-cli"
      at: 2026-10-20T23:55:09Z
      mode: "other"
      note: "Create four-milestone optional analytics and protected identity plan grounded in SDK and Nagare source"
    - model: "gpt-6-astra"
      harness: "codex-cli"
      at: 2026-10-21T00:23:21Z
      mode: "update"
      note: "Address review findings: releasable visits with non-doc navigation checks, post-build static configuration, and milestone Progress"
  reviews:
    - model: "gpt-6-astra"
      harness: "codex-cli"
      at: 2026-10-21T00:12:13Z
      verdict: "changes-requested"
      note: "Verify source and ADR contracts; define non-doc visit teardown, reconcile enabled static builds with disabled artifact gate, and populate milestone Progress"
---


# Add configurable Kansoku page-read tracking with protected-site identity

This ExecPlan is a living document. Keep Progress, Surprises & Discoveries, Decision Log, and Outcomes & Retrospective current during implementation. Distill durable decisions into `docs/adr/` before completion.


## Purpose / Big Picture


Operators will be able to see which documentation pages people visit and attach those visits to the signed-in user on a protected host such as the Nagare labs intranet. A “page read” means a successfully rendered documentation page view; it does not prove that a person read every paragraph. Kansoku's optional page-leave event reports approximate elapsed time, not comprehension.

The same static site must also run with analytics disabled, with anonymous analytics, or with another host's compatible identity endpoint. Configuration belongs to the deployment. The default build works without a Kansoku server, write key, Nagare login, or dependency-source checkout. Analytics failures must never delay documentation rendering, navigation, search, diagrams, or Markdown exports. Demonstrate the feature locally by recording real browser requests at a test collector, including distinct users, then disable it and demonstrate zero SDK loading, identity requests, storage writes, and ingest requests.

This plan creates the integration and deployment instructions. Publishing a new labs release, provisioning analytics credentials, changing Nagare itself, and building a reporting dashboard are separate operator work. Existing Kansoku metrics show aggregate page counts; this change supplies `userId` on events and must not claim that an existing metrics endpoint lists individual readers.


## Progress


- [ ] Milestone 1: Valid runtime configuration enables the reproducible SDK adapter; disabled and invalid configurations leave it unloaded, with configuration tests and typechecking passing.
- [ ] Milestone 2: Container startup supplies runtime configuration and an explicitly trusted identity endpoint, with both disabled and trusted HTTP smoke checks passing.
- [ ] Milestone 3: Successful documentation visits carry the correct subject, with navigation, identity, cleanup, deduplication, and redaction behavior verified by lifecycle tests.
- [ ] Milestone 4: Real-browser batches prove the integration; release and container gates pass, and operator instructions and the integration ADR are complete.

Planning and review are complete; application implementation has not started.


## Surprises & Discoveries


(None yet.)


## Decision Log


Decision (2026-10-20): Default analytics to disabled and load the SDK only after a valid enabled configuration is available. Read public JSON at runtime so one build and image can serve protected, anonymous, and disabled installations. A static host can replace the JSON file without adopting the Nginx packaging.

Decision (2026-10-20): Expose the trusted subject through an explicitly enabled, non-cacheable, same-origin plain-text endpoint. Nagare already replaces `X-Forwarded-User` after authentication and host authorization. Keeping the subject out of HTML, static build output, and JSON interpolation preserves the static architecture and avoids per-user generated pages.

Decision (2026-10-20): Use the core browser SDK from `mori://shinzui/kansoku-ts/packages/kansoku-js` through a small local adapter. Use manual page capture after successful MDX rendering, with automatic SDK page capture disabled, to avoid counting preloads, redirects, missing routes, and both router and History API notifications for one visit. Retain the SDK's session, delivery, and optional page-leave behavior.

Decision (2026-10-20): Use memory identity storage and no persisted queue initially. Resolve identity before creating the active client or emitting its first event; replace the client when the verified subject changes. This prevents a previous user's persisted identity or unanswered events from being replayed as the next user. Expose delivery and privacy controls, but defer persistent identity and shared-domain cookies until a separate lifecycle requirement justifies them.

Decision (2026-10-20): Vendor a reproducibly generated ESM bundle and declarations at a full upstream source commit until a published package is verified. The authoritative npm lookup returned E404 for `kansoku-js`, and the upstream remote advertised no tags on 2026-10-20. Do not invent a released version from the source manifest's `0.0.0`, use an unversioned hosted SDK, or add a machine-local dependency path. Recheck registry and tags before implementing dependency acquisition; a verified package release can replace the snapshot with the same adapter contract.

Decision (2026-10-20): Proceed without an Intention ID, as requested by the user. This is a create-only session; no application integration has been implemented.

Decision (2026-10-21): Give each mounted documentation page a releasable visit registration. A genuine departure from documentation clears the current visit and its deduplication state, while synchronous React effect cleanup/setup preserves the same logical visit. Retire the SDK client after a genuine departure so its retained page snapshot cannot include time spent on a non-documentation route. The root controller remains available for a later visit.

Decision (2026-10-21): Keep `public/analytics-config.json` disabled for every build and release check. Static hosts enable analytics by replacing the generated JSON after the build has passed its gates; containers continue to inject configuration at startup. This preserves the reusable disabled artifact and removes the conflicting pre-build configuration path.


## Outcomes & Retrospective


(To be filled during and after implementation.)


## Context and Orientation


This repository renders MDX files under `content/docs/` using React, Fumadocs, TanStack Start, and Vite. A static site consists of files that a web server returns without running an application for each request. `vite.config.ts` configures prerendering, which renders HTML during the build, and a single-page application shell for subsequent browser navigation. `src/routes/__root.tsx` owns the shared document and providers. `src/routes/docs/$.tsx` resolves an actual documentation page through a static server function and renders MDX in `clientLoader`'s `component`. The component receives the resolved content path and `frontmatter.title`; this is the place to report a successful visible page. `src/router.tsx` enables intent preloading, which may fetch content before anyone visits it. Do not instrument loaders or `createServerFn` handlers.

`package.json` uses Bun 1.4.2, Node 22 tooling, and no analytics library or application test runner beyond existing Node test scripts. Run commands in `nix develop`. `bun run check` runs the release gate; CI in `.github/workflows/ci.yml` invokes its constituent checks separately. `scripts/check-static-output.mjs` checks actual prerendered artifacts after a build. `scripts/check-docs-container.mjs` checks an Apple container runtime over localhost. `scripts/build-docs-image.sh` requires clean committed source, runs checks, embeds the source SHA, and creates an immutable release archive.

`deploy/Dockerfile` packages `.output/public/` in Nginx on port 8080. `deploy/nginx.conf` serves existing API and asset files with strict 404s and other routes with the SPA shell fallback. There is no runtime TanStack server that could read incoming user headers. `nagare/Config.hs` deploys a protected service with `requireLogin`; `docs/deployment.md` explains reviewed publication and deployment.

The relevant local ADRs are [Bun and static-output verification](../adr/0003-use-bun-for-project-installation-and-command-orchestration.md) and [protected static deployment](../adr/0004-host-static-docs-behind-the-nagare-intranet-access-policy.md). Preserve Bun installation, the static artifact checks, the private origin, and protection of search and exports. These ADRs use plain Markdown with Status and Date, and `mori show --full` reports no profiled ADR bundle here. A new integration ADR should follow that existing convention, without incidental OKF migration. No existing local ADR defines analytics.

Use Mori to find external sources. `mori://shinzui/kansoku-ts/docs/kansoku-js-readme`, `mori://shinzui/kansoku-ts/docs/delivery-and-privacy`, and `mori://shinzui/kansoku-ts/docs/getting-started` explain the SDK. The verified cross-repository decisions are `mori://shinzui/kansoku-ts/okf/adrs/concepts/ADR-3` (identity storage, immutable queued attribution) and `mori://shinzui/kansoku-ts/okf/adrs/concepts/ADR-4` (capture ownership, browser-only lifecycle, URL collection). Source examined at commit `30abb48aadc37378a6e9006e9b1b6c9bcab3030d` confirms `createKansoku`, `page`, `identify`, `start`, `stop`, `shutdown`, `beforeSend`, `storage`, and `persistQueue`. Automatic page capture defaults on and would duplicate manual capture. The source's build script rejects Bun below 1.4.2 because older Bun drops entrypoint re-exports; use the pinned project shell.

Nagare source at `4878d333d185b64fe85a8a8967db33049d4ddc8f` confirms that `mori://shinzui/nagare` project-relative `cli/nagare-access/src/Nagare/Access/Proxy.hs` injects `X-Forwarded-User` with the authenticated subject and removes incoming copies in `hardenRequestHeaders` and `shouldStripRequestHeader` (artifact-level URI pending). This is a request header at the private origin, not a browser-readable identity API. The guarantee applies only behind the verified enforcer; a directly reachable origin must never trust arbitrary callers' headers. Browser events are observations, not authorization or an audit log.

The operator contract is `mori://tan/tan-ng-labs/docs/deploy-kansoku-to-the-intranet-as-a-shared-analytics-service-for-nagare-apps`. Its operator procedure is also in `mori://tan/tan-ng-labs`, project-relative `docs/runbooks/operations.md`, “Track an app with Kansoku” (artifact-level URI pending). It records a shared analytics service at `https://kansoku.labs.topagentnetwork.net`, a public ingest write key per app, and account `intranet`, distinguished by host and `source_service`. A write key may be visible in browser configuration; a service token can query metrics and must remain private. Browser batches are JSON arrays sent to `POST /v1/batch` with `X-Api-Key`; cross-origin POSTs need the collector's CORS policy, which allows a browser origin to send requests. Do not place the analytics collector behind an HTML login redirect. The reporting contract is `mori://shinzui/kansoku/okf/guides/concepts/DOC-10`.


## Plan of Work


### Milestone 1: Optional runtime configuration and a reproducible SDK boundary


Create `public/analytics-config.json` containing only `{"enabled":false}`. Implement parsing and bounded fetching in `src/lib/analytics/config.ts` and the public types described below. Fetch this resource only in the browser, with `cache: "no-store"`, a two-second default timeout, and no dependency on page rendering. A missing file, SPA HTML fallback, malformed JSON, invalid fields, timeout, or `enabled:false` selects the disabled branch. Disabled configuration needs no other fields. Never evaluate an SDK import, read identity, or touch analytics storage on that branch. No analytics code may access browser globals at module import or during prerendering.

Recheck `npm view kansoku-js version dist-tags repository --json` and `git ls-remote --tags https://github.com/shinzui/kansoku-ts.git`. If still unpublished, add `scripts/vendor-kansoku.ts` with an explicit full commit argument and temporary checkout acquisition, and generate `src/vendor/kansoku-js/index.js` plus its complete declaration tree from the pinned upstream build. Keep the snapshot's source URI, commit, bundle SHA-256, compiler versions, license notice, and regeneration command in `src/vendor/kansoku-js/README.md`. Default to the reviewed commit above; changing it requires reading its changes and recording why. Do not copy unverified existing `dist` files, track source maps exposing local paths, or fetch sources during ordinary installation/build. Generated bundle/declarations get narrowly scoped Oxc exclusions; first-party adapter code remains checked. Update `mori.dhall` to record the SDK's owning project using this manifest's existing dependency convention.

The vendor command must check out the exact detached revision, install its frozen dependencies in its own development environment, run the upstream `scripts/build.ts` for the core package, verify the built exports, and copy all declaration dependencies without formatting the bundle. Use a temporary checkout, never reset the owner's working tree. If a released npm version now exists, inspect its upstream release/tag and exported API, install the exact verified version with Bun, commit `bun.lock`, and record the replacement of the snapshot approach in every affected plan section.

Add `src/lib/analytics/sdk.ts` as the sole SDK import boundary, dynamically importing the local snapshot when enabled. Add `test:analytics` to `package.json`, initially running `bun test src/lib/analytics`, and meaningful configuration and SDK-boundary tests. Milestone acceptance is that `nix develop -c bun run test:analytics` and `nix develop -c bun run typecheck` pass; disabled/malformed configurations never invoke the injected SDK importer, and a test of the real snapshot finds callable `createKansoku`. A fresh frozen install and build do not require another checkout or an analytics network service.

### Milestone 2: Runtime server configuration and protected identity


Add an executable `deploy/40-analytics-config.sh` under the official image's `/docker-entrypoint.d/` directory through `deploy/Dockerfile`. On startup, write `KEIRO_DOCS_ANALYTICS_CONFIG` verbatim as data to a temporary file and atomically rename it to `/usr/share/nginx/html/analytics-config.json`; an unset/empty value writes the disabled default. Use shell `printf '%s\n'` with quoted values, never `eval` or variable substitution into executable JavaScript. Invalid JSON disables tracking in the browser and does not stop Nginx from serving docs. This script needs no Node or JSON runtime package. Shell expressions embedded in input remain literal data.

A separate environment variable, `KEIRO_DOCS_TRUST_FORWARDED_USER`, defaults to `0`. The startup script writes a fixed Nginx include implementing either disabled or trusted behavior. Only the exact value `1` enables the trusted variant; never interpolate arbitrary variable values into Nginx directives. Reserve `GET /api/analytics/identity` using an exact location before generic API handling. Off returns 404 even if a request supplies `X-Forwarded-User`. On returns 204 when the header is absent and otherwise 200 with its value as `text/plain; charset=utf-8`. Return 405 for unsupported methods. Plain text lets Nginx return the value without unsafe JSON or HTML quoting. Include `Cache-Control: private, no-store`, `X-Content-Type-Options: nosniff`, and no permissive CORS headers on every response. Preserve inherited response hardening when adding location headers. Keep the identity response out of logs and all static build artifacts. Disable caching for `/analytics-config.json` too, and make missing configuration a strict 404 rather than an HTML fallback.

Extend `nagare/Config.hs` to accept both optional environment variables from the operator process and forward them as literal runtime variables to the service. Use the installed Nagare DSL, discovering it through Mori and verifying its actual `EnvName`, `EnvLiteral`, and scoped-environment API before editing; source Nagare has `mkEnvName`, `runtimeScoped`, and a deployment `env` map, but the operator pin may differ. Do not upgrade Nagare just to enable analytics. Trust stays off unless explicitly selected, regardless of the browser's identity mode.

Extend `scripts/check-docs-container.mjs` to run disabled and enabled startup configurations and test both config bytes and identity responses, including an input containing quotes, backslashes, and shell substitution syntax. Assert that defaults ignore a spoofed identity header. An enabled isolated localhost origin test can supply a fake header to test serialization; label this as an origin fixture, not proof of authentication. All existing HTTP smoke assertions must continue passing. Acceptance is successful container checks for disabled and trusted variants, including an identity value with punctuation, no-store headers, and no changes to deep routes, exports, missing-file 404s, or source receipts.

### Milestone 3: Record committed page visits with the correct subject


Implement `src/lib/analytics/controller.ts` with injected configuration, identity fetch, SDK loading, and clock functions for deterministic tests. It owns one client per current subject and configuration. Configure `autoStart:false`, `autocapture.pageViews:false`, `storage:"memory"`, and `persistQueue:false`. After resolving a subject, identify with no traits and explicit identity-only schema version 1, then start and emit the current page through `page`. This avoids requiring the collector's newer profile-trait schema. Let session capture and page-leave capture follow configuration. SDK delivery uses its existing bounded queue/retries. Never wait for a flush before rendering or navigating.

Create `src/components/page-analytics.tsx`, returning no UI. Mount it in `src/routes/docs/$.tsx` inside `clientLoader`'s content component alongside the successful `DocsPage`. Supply the canonical `/docs/...` URL derived from the resolved content visit and its actual `frontmatter.title`, not the root document's generic title. Use a React effect so build-time rendering never emits events. Mount one root analytics owner in `src/routes/__root.tsx` to manage configuration and browser visibility lifecycle; page components submit successful visits to that owner. No event originates in a loader, preload, API request, Markdown download, 404, or redirect.

Have `visit(page)` return an idempotent release function and return that function from the page's React effect. Associate each registration with an opaque ownership token so cleanup from an old component cannot clear a newer page. Releasing the current registration immediately clears the visible page, invalidates its pending asynchronous work, and stops automatic SDK capture. While no page is registered, focus/visibility refresh does nothing and completed configuration, import, or identity requests cannot emit a page event. Finalize the departure in a microtask: if no replacement registration has arrived, clear the consecutive-visit deduplication state, detach the old client, and initiate its shutdown without awaiting delivery. Keep the root controller alive. The pinned SDK's `stop()` retains its page snapshot and `shutdown()` does not synthesize a leave; accept a missing best-effort leave at this boundary instead of allowing a later page to report time spent on home or a 404.

If React synchronously repeats cleanup/setup for the same page before departure finalization, cancel that finalization, retain the logical visit's deduplication state and existing client, and restart any necessary invalidated identity work before resuming capture. If the replacement is a different documentation page, process the new visit normally. An old release or finalizer must never clear that replacement. A later return after a finalized departure creates a new logical visit and resolves identity again, even when the pathname and subject match the previous documentation page.

Deduplicate consecutive reports of the same normalized pathname and subject, including React development effect restarts. Hash and query changes on the same documentation page do not add a read. A committed A → B → A sequence records three visits; a full reload records a new visit. While configuration, SDK import, or identity is pending, keep only the currently visible visit. An asynchronous response for an obsolete visit must not emit it after navigation. Teardown must invalidate pending work, remove app-owned listeners, and avoid duplicate clients/timers during development refresh.

Identity mode `none` sends anonymous events and never calls an identity endpoint. Modes `optional` and `required` fetch the configured same-origin plain-text endpoint with same-origin credentials, `cache:"no-store"`, redirect rejection, and a bounded timeout. Accept only a successful text/plain response containing one nonempty subject of at most 1024 characters and no control characters. Treat 204, 401, 403, 404, redirects/login HTML, other media types, and network errors as no verified identity. Optional mode records anonymously on failure; required mode emits no events for that visit and retries on the next visit or focus. The docs remain usable in either case. Never read login cookies, infer a user from a query string, or use a supplied client-side identity as an authorization fact.

Revalidate identity on each distinct page visit and when the document becomes visible after focus loss. A same-page focus refresh does not create a duplicate read when identity is unchanged. When the subject changes or disappears, retire the old client before accepting new events; old pending events retain their original subject. A focus-detected subject change may create a new view on the visible page for the new subject. Disable old capture immediately while replacement identity is pending; do not emit a leave under a newly assigned user. With memory-only storage there is no saved previous user to restore. Isolate the storage prefix by `sourceService` even though current storage is memory.

Redact outgoing events in one `beforeSend` function. Keep a valid absolute URL with origin and normalized pathname in both top-level `url` and `properties.url`; remove query strings, fragments, referrer, and all UTM fields by default. Preserve `properties.path`, `properties.title`, event/session IDs, `userId`, and SDK envelope fields. Apply this to `page_leave` too. Allow an explicit `includeQuery` switch to retain query parameters; fragments stay excluded. Do not add email/name traits or invent unregistered events or schema properties. Honor configured GPC and DNT preferences, both true by default for this app. A page view means rendered content, and page-leave duration remains best effort.

Acceptance is passing lifecycle tests for delayed initialization, obsolete responses, duplicate effects, A → B → A, anonymous versus required identity failure, user A → user B → missing identity, focus revalidation, URL redaction at both locations, and SDK/network exceptions. Include docs → home → same docs and docs → 404 → same docs, both after capture and while configuration, SDK import, or identity is pending. Assert no stale view or identity request during the non-doc route, a fresh view after returning, harmless stale release callbacks, and one view across synchronous effect cleanup/setup. Browser verification in the next milestone proves that the real SDK emits the specified wire events.

### Milestone 4: Browser proof, release gates, and operator instructions


Add `scripts/serve-analytics-fixture.mjs`, a development-only localhost server on port 5216. It serves `.output/public/` with the production SPA/static routing rules, supplies runtime configuration, returns a synthetic subject from a test-only cookie at `/api/analytics/identity`, accepts JSON arrays at `/v1/batch` with a synthetic write key and HTTP 202 acknowledgement, and exposes recorded events at `/__analytics/events`. Provide `--mode disabled|anonymous|optional|required` and `--identity-delay-ms` arguments. Fixture endpoints must never be copied into production output. Reject an incorrect synthetic key, and isolate recorded events between runs. This gives a novice a complete demonstration without real credentials or shared-service mutation.

Run a real browser against the fixture and inspect its recorded requests. Visit `/docs/runtime-patterns/messaging/outbox`, then another valid documentation page, use Back, reload, navigate by search, and follow a heading fragment. For required identity mode set the fixture cookie `analytics_test_user=user:alice`, repeat with `user:bob`, then remove it. Confirm correct subjects and no stale identity on both first and subsequent views. The expected batches include `identify`, `session_start`, and `page_view`; page-leave events depend on configuration. Inspect returned `userId`, `sourceService`, `url`, and page properties; tests must not merely assert that an SDK mock was called. Disable tracking and repeat with collector requests blocked to prove independent functionality. Also simulate import rejection, a 401 write key, unavailable collector, and identity timeout; navigation, search, and diagrams continue functioning.

Wire `test:analytics` into `bun run check` and an explicit `.github/workflows/ci.yml` test step, preserving all current gates. Extend `scripts/check-static-output.mjs` to require the disabled config artifact and ensure no fixture identity, real key, or user-specific data is baked into HTML. This gate checks the reusable build before deployment configuration is applied. Keep `public/analytics-config.json` disabled; static hosts replace only the generated `.output/public/analytics-config.json` after the build and release checks pass. A subsequent build restores the disabled default, so repeat the deployment override after each successful build. Keep the fixture and test assertions first-party and type/lint/format checked.

Create `docs/analytics.md` documenting every configuration field and environment variable, the disabled static-host path, anonymous setup, required protected identity, the private-origin trust prerequisite, public versus private credentials, CORS troubleshooting, URL policy, event-loss limits, approximate read semantics, and rollback. Link it from `README.md` and `docs/deployment.md`. For labs, show the enabled configuration with collector base URL, a separately issued public write key, `sourceService:"keiro-runtime-docs"`, required identity, and the independent server trust flag. Never commit actual keys or subjects. Explain that changing runtime configuration affects new page loads; an already open tab should be reloaded after an operator disables collection.

Create a local ADR following the plain Markdown convention for optional analytics, trusted identity, and manual capture ownership. Revisit the two relevant existing ADRs only where their architectural description actually changes. Run the full release gate and record evidence. Local browser and container proof complete this implementation. A later labs activation must additionally prove through the enforcer that anonymous callers cannot obtain identity, spoofed user headers are replaced, the origin remains private, and a real granted account's page-view payload uses its verified subject. Query aggregate counts with a private service token only in an operator terminal; keep receipts and identity evidence outside this repository.


## Concrete Steps


Run all project commands from the repository root. Begin with a clean-state inspection; preserve unrelated edits. Discover dependencies with Mori before opening their sources, and never search `/nix/store` or filesystem root.

```bash
cd /Users/shinzui/Keikaku/bokuno/keiro-runtime-docs
git status --short
mori registry search kansoku
mori registry show shinzui/kansoku-ts --full
mori registry docs shinzui/kansoku-ts
mori path mori://shinzui/kansoku-ts/okf/adrs/concepts/ADR-3
mori registry show shinzui/nagare --full
npm view kansoku-js version dist-tags repository --json
git ls-remote --tags https://github.com/shinzui/kansoku-ts.git
nix develop -c bun install --frozen-lockfile
```

At authoring time npm returns E404 and the tag command succeeds with no tag lines. Recheck rather than treating that observation as permanent. If still unpublished, the new acquisition command must work from this repository:

```bash
nix develop -c bun scripts/vendor-kansoku.ts --commit 30abb48aadc37378a6e9006e9b1b6c9bcab3030d
nix develop -c bun run test:analytics
nix develop -c bun run typecheck
```

Expect verified `createKansoku` exports, a recorded bundle digest, and passing tests. Ordinary subsequent installs/builds use the committed snapshot and do not rerun acquisition. Implement each milestone and update its Progress checkbox with timestamped acceptance evidence and any remaining work.

After the fixture exists, run the following in separate terminals:

```bash
KEIRO_DOCS_SKIP_FONTS=1 nix develop -c bun run build
nix develop -c node scripts/serve-analytics-fixture.mjs --mode required
```

Open `http://127.0.0.1:5216/docs/runtime-patterns/messaging/outbox`. Set the fixture cookie with browser developer tools and reload:

```javascript
document.cookie = "analytics_test_user=user:alice; Path=/; SameSite=Lax"
location.reload()
```

Inspect the collector's events after the configured flush interval:

```bash
curl -fsS http://127.0.0.1:5216/__analytics/events
```

Expect an array containing a page-view equivalent to this excerpt; generated IDs and timestamps vary:

```json
{
  "eventName": "page_view",
  "sourceService": "keiro-runtime-docs",
  "userId": "user:alice",
  "url": "http://127.0.0.1:5216/docs/runtime-patterns/messaging/outbox",
  "properties": {
    "url": "http://127.0.0.1:5216/docs/runtime-patterns/messaging/outbox",
    "path": "/docs/runtime-patterns/messaging/outbox",
    "title": "Outbox"
  }
}
```

The excerpt is an expected shape, not evidence already collected. Use actual frontmatter title spelling when asserting. Restart the fixture with disabled/anonymous modes for independent cases. Use a delayed identity response and client-side navigation to `/` and to a missing docs path to verify that leaving a page before its resolution never records that obsolete page. While on each non-doc route, trigger a focus/visibility refresh and confirm no new identity request or page view. Return to the original document and confirm one new view. Repeat after the original view has already been captured; existing queued events may finish delivery with their original identity, but must not be mistaken for newly captured visits.

After all milestones:

```bash
nix develop -c bun run test:analytics
KEIRO_DOCS_SKIP_FONTS=1 nix develop -c bun run check
git diff --check
```

Use the existing Apple container image flow after committing the source, because it rejects dirty trees. Extend that flow to exercise both runtime modes before any publication:

```bash
container system start
nix develop -c just deploy-image
```

Do not treat missing Apple container availability as passing container verification; record the exact outstanding verification. No live deployment is needed to author or implement the local integration. Every implementation commit uses Conventional Commits and an `ExecPlan: docs/plans/50-add-configurable-kansoku-page-read-tracking-with-protected-site-identity.md` trailer. There is no Intention trailer for this work unless the user later supplies one.


## Validation and Acceptance


Disabled behavior is the release baseline: install and build without analytics credentials, start the unmodified static output, and visit deep docs, search, diagrams, and Markdown exports. Browser network inspection shows at most the local configuration fetch and no SDK chunk download, identity request, or collector traffic; storage remains untouched by analytics. An absent or invalid config and an SDK import failure have the same documentation availability.

Anonymous mode emits one `page_view` per successful normalized documentation visit without `userId` and without contacting identity. Required identity mode emits the first and later views with the verified subject, or emits nothing when the subject cannot be obtained. Optional mode explicitly permits anonymous fallback. An A → B → A navigation sequence counts three; preloads, fragments, same-page query changes, search typing, and duplicate React effects do not inflate counts. A captured docs A → home or 404 → docs A sequence counts two documentation views. A pending view abandoned for home or a 404 never emits after its asynchronous work completes; focus refresh on those routes does nothing, and returning to docs starts a fresh visit. Separate reloads count separately. Verify first-load titles against MDX frontmatter rather than the root title.

The Nginx smoke matrix verifies exact routes, disabled header ignoring, enabled plain-text subject serialization, no-store response headers, missing header 204, method rejection, and hostile config text treated as data. A local test supplying the trusted header verifies only the origin adapter. Real authentication validation belongs at the enforcer boundary when labs is activated.

Automated tests must cover configuration bounds, all identity outcomes, stale async work, SDK initialization order, disabled import isolation, lifecycle deduplication and cleanup, redaction in both envelope and properties, queue/user separation, and nonblocking errors. Real-browser fixture evidence must use the vendored SDK's actual POST batches, including distinct users and no stale identity after disappearance. All existing release checks and container HTTP checks must retain their previous coverage. Record commands, concise outcomes, and any skipped environmental checks in the living sections. Do not claim completion while a required local behavior remains unverified.


## Idempotence and Recovery


Regenerating the SDK at the same commit must reproduce the bundle digest or fail with a tooling difference to investigate. The acquisition script uses its own temporary checkout and atomic destination replacement so an interrupted build preserves the last good snapshot. Normal builds stay offline with respect to analytics. Runtime config writes replace the file atomically and are repeated on every container start, including explicitly resetting to disabled when the environment is removed.

Disable collection by setting `KEIRO_DOCS_ANALYTICS_CONFIG` to `{"enabled":false}` or replacing the static config with that content, then roll/restart the service and reload browser tabs. Turn off `KEIRO_DOCS_TRUST_FORWARDED_USER` independently to remove identity exposure. Analytics configuration must never remove `requireLogin` or widen origin access. If a published deployment regresses, follow the existing immutable-image rollback in `docs/deployment.md`; do not rebuild an old tag. Avoid live collector credentials in tests, logs, source, or screenshots. Pending telemetry is best effort and may be lost during a user change or shutdown; documentation availability takes priority.


## Interfaces and Dependencies


Use the following deployment-facing configuration contract in `src/lib/analytics/config.ts`. Defaults apply only after a valid enabled configuration is parsed. Reject out-of-range numbers rather than passing unchecked values into the SDK. Unknown keys are invalid so a misspelled enablement or identity field cannot silently change policy. Require a nonempty public write key with the `ksk_w_` prefix and reject service-token prefixes. Require a nonempty `sourceService` of at most 128 characters, restricted to letters, digits, dots, underscores, colons, and hyphens. `baseUrl` must be HTTP(S), contain no credentials, query, or fragment, and use HTTPS outside localhost; `identity.endpoint` must resolve to the same origin, have no credentials or fragment, and is fetched only for identity modes other than `none`. Do not allow arbitrary SDK module URLs or arbitrary executable callbacks in public JSON.

```typescript
export type AnalyticsConfig =
  | { enabled: false }
  | {
      enabled: true
      baseUrl: string
      writeKey: string
      sourceService: string
      identity: {
        mode: "none" | "optional" | "required" // default: none
        endpoint: string // default: /api/analytics/identity
        timeoutMs: number // default: 2000; range: 100..10000
      }
      privacy: {
        respectGlobalPrivacyControl: boolean // default: true
        respectDoNotTrack: boolean // default: true
        includeQuery: boolean // default: false
      }
      capture: {
        sessions: boolean // default: true
        pageLeave: boolean // default: true
      }
      delivery: {
        flushAt: number // default: 20; range: 1..100
        flushIntervalMs: number // default: 5000; range: 100..60000
        maxQueueSize: number // default: 1000; range: 1..10000
        maxRetries: number // default: 5; range: 0..10
        requestTimeoutMs: number // default: 10000; range: 100..30000
      }
      debug: boolean // default: false; never log subjects or keys
    }

export function parseAnalyticsConfig(value: unknown, origin: string): AnalyticsConfig
```

The parser returns disabled for invalid input, optionally supplying a redacted diagnostic through an injected callback. The enabled example operators supply can omit nested defaulted values:

```json
{
  "enabled": true,
  "baseUrl": "https://kansoku.labs.topagentnetwork.net",
  "writeKey": "ksk_w_REPLACE_WITH_PUBLIC_APP_WRITE_KEY",
  "sourceService": "keiro-runtime-docs",
  "identity": { "mode": "required", "endpoint": "/api/analytics/identity" }
}
```

Expose `KEIRO_DOCS_ANALYTICS_CONFIG` for this JSON and `KEIRO_DOCS_TRUST_FORWARDED_USER=1` only on a verified protected origin. Public static deployments keep `public/analytics-config.json` disabled, run the build and release checks, then replace `.output/public/analytics-config.json` in the deployment output with their configuration and choose anonymous identity mode. Serve that JSON with no-store caching and reload open tabs after replacement. Validate the deployed behavior with the browser checks above; the disabled-artifact build gate applies before this deployment override. Do not commit deployment-specific configuration. Repeat the override after every build, which restores the disabled default.

Keep the first-party controller independent of React. Export `createAnalyticsController(dependencies)` returning `visit(page): () => void`, `refreshIdentity(): void`, and `dispose(): void`; use an `AnalyticsPage` containing normalized absolute URL, pathname, and MDX title. The function returned by `visit` releases only that registration and is safe to call repeatedly or after a newer registration. Each registration and identity refresh uses a generation number to reject obsolete work. Apply the immediate invalidation and deferred departure semantics in Milestone 3; `refreshIdentity` is a no-op without a current registration, and root `dispose` immediately invalidates registrations and pending finalizers, removes listeners, and initiates client shutdown. SDK loading, identity lookup, and delivery errors resolve within the controller and never reject into a route. The page component returns the release function from its effect; the root owner manages focus/visibility refresh and terminal disposal.

Use only the pinned core SDK's exported interfaces and real methods. `identify(subject, {}, {schemaVersion:1})` establishes the user before page capture; `page({url, path, title})` creates the governed page event; `beforeSend` sanitizes the complete envelope; `start`, `stop`, and `shutdown` own timers/listeners and best-effort flushing. Verify the selected artifact's behavior in tests instead of inventing router hooks or ingest formats. The immutable events returned by the fixture demonstrate the `userId`/page relationship; metrics credentials and reader-report UI remain outside the browser integration.

Revision note (2026-10-20): Created from repository, SDK, Nagare, and labs operator-source research. This plan defines four implementation milestones; application code and deployment remain unchanged in this create-only session.

Revision note (2026-10-21): Addressed review findings by defining visit release and non-doc navigation acceptance, making static-host configuration a post-build deployment step consistent with the disabled artifact gate, and adding the four unfinished milestone outcomes to Progress. Application implementation has not started.
