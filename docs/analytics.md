# Optional page-read analytics

Analytics is disabled in every build. Operators can enable Kansoku after building, without rebuilding JavaScript. A page read means a successfully rendered documentation page view. It does not measure comprehension. `page_leave` reports approximate elapsed time and can be lost when a tab closes or an identity changes. Browser events are observations, never authorization facts or an audit log. Aggregate metrics count views; the integration does not add an individual-reader reporting UI.

## Deployment configuration

The browser fetches `/analytics-config.json` with no-store caching and a two-second timeout. Missing, invalid, disabled, or HTML responses disable collection. Disabled tracking loads no SDK, requests no identity, and writes no analytics storage. An enabled tab keeps its configuration until reload; reload open tabs after disabling or changing configuration.

Keep `public/analytics-config.json` disabled. Static hosts run `nix develop -c bun run check`, then replace **only** `.output/public/analytics-config.json` in the deployment output with the desired JSON. Serve it with `Cache-Control: no-store` and strict missing-file 404s. Repeat the override after every build, which restores the disabled default. To disable, replace the deployed file with `{"enabled":false}` and reload tabs.

Containers accept `KEIRO_DOCS_ANALYTICS_CONFIG` as literal JSON at startup. Unset or empty values restore disabled configuration. The entrypoint writes it atomically. Malformed JSON disables collection in the browser and does not prevent docs service. Configuration is public: use a separately issued **public ingest write key**, never a private service token for querying metrics.

For anonymous collection use this configuration, replacing the collector and public key:

```json
{
  "enabled": true,
  "baseUrl": "https://collector.example",
  "writeKey": "ksk_w_REPLACE_WITH_PUBLIC_APP_WRITE_KEY",
  "sourceService": "keiro-runtime-docs",
  "identity": { "mode": "none" }
}
```

All fields below are optional after the three required enabled fields. Unknown fields and invalid values disable collection, including misspelled identity options. `{ "enabled": false }` needs nothing else.

| Field | Default and accepted values |
| --- | --- |
| `enabled` | `false`; exact `true` enables validated configuration |
| `baseUrl` | Required when enabled. Absolute HTTP(S) collector base URL; HTTPS except localhost, 127.0.0.1, or ::1. No credentials, query, or fragment |
| `writeKey` | Required public `ksk_w_` key followed by letters, digits, underscores, or hyphens. Service tokens are rejected |
| `sourceService` | Required, 1–128 letters, digits, dots, underscores, colons, or hyphens |
| `identity.mode` | `none`; also `optional` (anonymous fallback) or `required` (suppress capture until verified) |
| `identity.endpoint` | `/api/analytics/identity`; must resolve to this site's origin, with no credentials or fragment |
| `identity.timeoutMs` | `2000`; integer 100–10000 |
| `privacy.respectGlobalPrivacyControl` | `true` |
| `privacy.respectDoNotTrack` | `true` |
| `privacy.includeQuery` | `false`; explicitly allow query parameters. Fragments always excluded |
| `capture.sessions` | `true`; SDK `session_start` events |
| `capture.pageLeave` | `true`; best-effort `page_leave` events |
| `delivery.flushAt` | `20`; integer 1–100 |
| `delivery.flushIntervalMs` | `5000`; integer 100–60000 |
| `delivery.maxQueueSize` | `1000`; integer 1–10000 |
| `delivery.maxRetries` | `5`; integer 0–10 |
| `delivery.requestTimeoutMs` | `10000`; integer 100–30000 |
| `debug` | `false`; accepted for deployment compatibility; SDK diagnostics stay disabled to avoid logging subject or credential details |

## Protected identity

`KEIRO_DOCS_TRUST_FORWARDED_USER` independently controls the container identity endpoint. It defaults to `0`; **only exact `1`** enables it. Enable it only when a verified access enforcer authenticates and authorizes every request, replaces incoming `X-Forwarded-User`, and keeps the origin private. Browser identity mode alone never enables server trust. A directly reachable origin must not trust arbitrary caller headers.

For labs, pass both variables to the operator process used to evaluate `nagare/Config.hs`:

```bash
export KEIRO_DOCS_ANALYTICS_CONFIG='{"enabled":true,"baseUrl":"https://kansoku.labs.topagentnetwork.net","writeKey":"ksk_w_REPLACE_WITH_PUBLIC_APP_WRITE_KEY","sourceService":"keiro-runtime-docs","identity":{"mode":"required","endpoint":"/api/analytics/identity"}}'
export KEIRO_DOCS_TRUST_FORWARDED_USER=1
```

Follow the [deployment procedure](deployment.md) with a separately issued key. The typed config forwards these values as literal runtime variables and retains `requireLogin`. This implementation does not publish a release or provision credentials.

`GET /api/analytics/identity` returns 404 with trust off, 204 with trust on but no subject, and 200 with the forwarded subject as `text/plain; charset=utf-8`. Other methods return 405. Every response is private/no-store, disables content sniffing, and has no permissive CORS headers. The endpoint does not log access or embed identity into static HTML. Its local smoke fixture proves serialization only. Later labs activation must additionally prove anonymous denial, replacement of spoofed headers, private origin routing, and a real granted account's verified subject in an event. Keep private evidence outside this repository.

Other protected hosts can supply a compatible same-origin plain-text endpoint. The browser uses same-origin credentials, rejects redirects and other media types, and accepts one nonempty subject up to 1024 characters without control characters. It never reads authentication cookies or derives identity from URL parameters. Optional mode falls back anonymously on failure; required mode captures nothing and retries on a distinct docs visit or return to focus. Identity is resolved before initial client creation, then rechecked on each distinct visit and on focus after inactivity. A changed or missing subject retires the previous client, preserving attribution of any queued events.

## Capture, privacy, and delivery

Only mounted successful MDX content registers a visit. Preloading, redirects, home, missing pages, search typing, Markdown requests, fragments, same-page query changes, and repeated effects do not count. A → B → A counts three visits; docs → home/404 → the same docs counts two. Releasing a visit cancels pending capture and stops SDK listeners immediately. Synchronous React cleanup/setup preserves the visit; a genuine departure retires the retained page snapshot so time away is not reported as reading time.

The SDK uses memory identity and no persisted queue, isolated by source service. Reloads and client replacement can lose events. The pinned SDK still probes sessionStorage when creating its queue adapter, even with queue persistence disabled; it stores no identity or queued events there. No SDK storage code runs in disabled mode. The SDK owns bounded retries, queue limits, session capture, privacy signal suppression, and best-effort delivery. Analytics never blocks documentation rendering or navigation.

Both envelope and page-property URLs retain only origin and normalized pathname by default. Referrer and UTM fields are removed; query parameters require explicit opt-in and fragments are always removed. Events contain the documentation frontmatter title and the trusted subject where required, with no name/email traits. Identify uses identity-only schema version 1. Treat the remaining pathname/title/subject as collected data when setting retention policy.

The collector must accept browser `POST /v1/batch` JSON arrays with `Content-Type: application/json` and `X-Api-Key`. For a different origin, configure collector CORS to allow the docs origin, POST, and those headers. The collector must not redirect ingest to an HTML login page. A 401 generally indicates a rejected write key; a CORS error may prevent the browser seeing the response. Unavailable collectors, failed SDK imports, and identity timeouts leave navigation, search, and diagrams available. Do not expose a metrics service token in browser JSON; query aggregate counts only from a private operator terminal.

## Local proof and rollback

Build and run the development-only fixture:

```bash
KEIRO_DOCS_SKIP_FONTS=1 nix develop -c bun run build
nix develop -c node scripts/serve-analytics-fixture.mjs --mode required
```

Open `http://127.0.0.1:5216/docs/runtime-patterns/messaging/outbox`. In browser developer tools set a synthetic cookie and reload:

```javascript
document.cookie = "analytics_test_user=user:alice; Path=/; SameSite=Lax"
location.reload()
```

Inspect real batches at `http://127.0.0.1:5216/__analytics/events`. Repeat with `user:bob`, then delete the cookie. Modes are `disabled`, `anonymous`, `optional`, and `required`. `--identity-delay-ms 800` exercises the fixture's 200ms identity timeout; `--collector-status 401` exercises a rejected key. The fixture rejects incorrect synthetic keys and resets events on restart. It binds only localhost and is never included in the image.

For repeatable Chromium verification:

```bash
nix develop -c bun x --no-install playwright install chromium
nix develop -c bun run test:analytics:browser
nix develop -c bun run test:analytics
```

The browser script uses synthetic credentials and the actual built SDK, and exercises navigation/search/failures. Unit tests cover deferred config/import/identity, release ownership, and synchronous effect restarts. `bun run check` and CI run the unit suite and disabled artifact gate. `just deploy-image` additionally runs the Nginx HTTP matrix for disabled, trusted, hostile-data, and invalid runtime settings.

Rollback collection by restoring disabled JSON (or unsetting the container variable), restarting the service, and reloading tabs. Independently unset `KEIRO_DOCS_TRUST_FORWARDED_USER` to close the identity endpoint. Keep the private origin and login policy in place. For an image regression follow immutable-image rollback in [deployment.md](deployment.md). The SDK snapshot and regeneration instructions are in [its README](../src/vendor/kansoku-js/README.md); ordinary installs/builds require no SDK source checkout or live collector.
