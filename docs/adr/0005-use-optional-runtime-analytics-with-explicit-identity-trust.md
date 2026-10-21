# Use optional runtime analytics with explicit identity trust

Status: Accepted

Date: 2026-10-21

## Context

The reusable static build serves public, anonymous, and protected deployments. Protected page views need a verified subject without generating personalized HTML. Loaders also run for preloads, and route effects can restart or complete asynchronous work after the user has left a document.

The core SDK at `mori://shinzui/kansoku-ts/packages/kansoku-js` owns sessions, queues, delivery, and browser lifecycle. Its automatic History API capture cannot determine whether MDX rendered successfully. Its persistence and capture contracts are recorded at `mori://shinzui/kansoku-ts/okf/adrs/concepts/ADR-3` and `mori://shinzui/kansoku-ts/okf/adrs/concepts/ADR-4`.

## Decision

Ship disabled public JSON with every build and validate it at runtime before dynamically importing the SDK. Containers atomically replace JSON at startup; static hosts replace the generated artifact after release gates. Invalid configuration disables collection. Configuration never supplies executable code. Reload tabs to apply deployment changes.

Expose a same-origin plain-text identity endpoint only with an independent exact server trust flag. Trust requires an authenticated access enforcer that replaces spoofed forwarded-user headers and a private origin. Preserve `requireLogin`. Never interpolate a subject into JSON, HTML, or Nginx directives. Return private/no-store responses without CORS permission or access logging. Origin fixture tests prove serialization, while real authentication proof belongs to activation through the enforcer.

A root controller owns browser lifecycle; successful MDX components own releasable visits. Generation checks reject obsolete asynchronous work. Release immediately invalidates capture and stops SDK listeners; a microtask retires the client and deduplication state if no replacement registration arrives. This preserves synchronous React effect cleanup/setup while treating home/404 departures as real departures. Retire the retained SDK page snapshot so time spent away cannot be reported as documentation duration.

Resolve identity before creating the client. Recheck it on distinct visits and focus after inactivity; replace the client when the verified subject changes or disappears. Required mode suppresses unverified visits; optional mode permits anonymous fallback. Use explicit identity-only identify schema version 1, no personal traits, memory identity, and no queue persistence. Separate clients preserve historical queued attribution. The pinned SDK still probes sessionStorage while constructing its queue adapter, but stores no identity or pending events there in this configuration. Disabled mode never reaches SDK storage code.

Disable automatic page views and manually capture the canonical resolved docs URL and MDX title. Redact both envelope and property URLs, referrer, and UTM fields with one beforeSend policy; remove queries by default and always remove fragments. Honor GPC/DNT by default. Suppress upstream debug logging because it can contain event details. Leave bounded delivery and best-effort page leaves with the SDK; delivery never blocks the docs.

Vendor a verified build and complete declarations at a full source revision while no released npm package exists. Record digest, compiler versions, source URI, license notice, and regeneration command. Builds and installs consume the committed artifact without requiring the source checkout or collector. Keep generated exclusions narrow; lint and format all first-party integration and fixture code. The formatter commit hook checks the whole tree so a generated-only invocation cannot fail due to every explicit file being excluded.

## Consequences

One artifact supports disabled, anonymous, and protected installations. Public ingest keys are visible by design; private metrics tokens stay outside the browser. Page views describe rendered content, never authorization, audited access, or comprehension. Identity replacement, navigation, reload, and tab closure can lose memory-only events. A page leave is approximate and may be omitted on client retirement. Aggregate metrics do not become an individual-reader reporting interface.

[The operator guide](../analytics.md) defines configuration, CORS, local browser/container proof, rollback, and later protected activation checks. Disabling analytics and closing identity exposure are independent deployment operations; neither changes access protection.
