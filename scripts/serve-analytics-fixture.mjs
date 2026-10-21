// These ordered lifecycle, HTTP, or file-copy steps must complete before the next step.
/* oxlint-disable no-await-in-loop */
// Development-only collector and static origin. Never copied into production output.
import { readFile, stat } from "node:fs/promises"
import { createServer } from "node:http"
import { resolve, extname } from "node:path"
import { pathToFileURL } from "node:url"

export async function startAnalyticsFixture({
  mode = "disabled",
  identityDelayMs = 0,
  port = 5216,
  collectorStatus = 202,
  output = resolve(".output/public"),
} = {}) {
  if (!["disabled", "anonymous", "optional", "required"].includes(mode))
    throw new Error("Invalid fixture mode")
  const events = []
  const requests = []
  const key = "ksk_w_LOCAL_FIXTURE_ONLY"
  let base
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, base)
      requests.push({ method: request.method, path: url.pathname })
      const send = (status, type, body = "") => {
        response.writeHead(status, {
          "Content-Type": type,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        })
        response.end(body)
      }
      if (url.pathname === "/analytics-config.json") {
        return send(
          200,
          "application/json",
          JSON.stringify(
            mode === "disabled"
              ? { enabled: false }
              : {
                  enabled: true,
                  baseUrl: base,
                  writeKey: key,
                  sourceService: "keiro-runtime-docs",
                  identity: { mode: mode === "anonymous" ? "none" : mode, timeoutMs: 200 },
                  delivery: { flushIntervalMs: 100, maxRetries: 0, requestTimeoutMs: 200 },
                },
          ),
        )
      }
      if (url.pathname === "/api/analytics/identity") {
        if (request.method !== "GET") return send(405, "text/plain")
        const subject = request.headers.cookie
          ?.split(";")
          .map((part) => part.trim())
          .find((part) => part.startsWith("analytics_test_user="))
          ?.slice("analytics_test_user=".length)
        if (identityDelayMs) await new Promise((done) => setTimeout(done, identityDelayMs))
        return send(subject ? 200 : 204, "text/plain; charset=utf-8", subject ?? "")
      }
      if (url.pathname === "/v1/batch") {
        if (request.method !== "POST") return send(405, "application/json", "{}")
        if (request.headers["x-api-key"] !== key) return send(401, "application/json", "{}")
        if (collectorStatus !== 202) return send(collectorStatus, "application/json", "{}")
        let body = ""
        for await (const chunk of request) {
          body += chunk
          if (body.length > 1048576) return send(413, "application/json", "{}")
        }
        const batch = JSON.parse(body)
        if (!Array.isArray(batch)) return send(400, "application/json", "{}")
        events.push(...batch)
        return send(
          202,
          "application/json",
          JSON.stringify({ accepted: batch.length, rejected: [] }),
        )
      }
      if (url.pathname === "/__analytics/events")
        return send(200, "application/json", JSON.stringify(events))
      if (url.pathname === "/__analytics/requests")
        return send(200, "application/json", JSON.stringify(requests))
      if (request.method !== "GET" && request.method !== "HEAD") return send(405, "text/plain")
      const file = resolve(output, `.${decodeURIComponent(url.pathname)}`)
      if (!file.startsWith(`${output}/`) && file !== output) return send(404, "text/plain")
      const strict = /^\/(?:api|assets)\//.test(url.pathname) || /\.[\w]+$/.test(url.pathname)
      let found
      for (const candidate of [file, resolve(file, "index.html"), `${file}.html`]) {
        if ((await stat(candidate).catch(() => undefined))?.isFile()) {
          found = candidate
          break
        }
      }
      if (!found && strict) return send(404, "text/plain")
      found = url.pathname === "/" || !found ? resolve(output, "_shell.html") : found
      const types = {
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".txt": "text/plain; charset=utf-8",
        ".svg": "image/svg+xml",
        ".woff2": "font/woff2",
      }
      send(200, types[extname(found)] ?? "application/octet-stream", await readFile(found))
    } catch {
      response.writeHead(500)
      response.end("Fixture error")
    }
  })
  await new Promise((done, reject) => {
    server.once("error", reject)
    server.listen(port, "127.0.0.1", done)
  })
  base = `http://127.0.0.1:${server.address().port}`
  return {
    base,
    events,
    requests,
    close: () =>
      new Promise((done, reject) => server.close((error) => (error ? reject(error) : done()))),
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const argument = (name, fallback) => {
    const index = process.argv.indexOf(name)
    return index < 0 ? fallback : process.argv[index + 1]
  }
  const fixture = await startAnalyticsFixture({
    mode: argument("--mode", "disabled"),
    identityDelayMs: Number(argument("--identity-delay-ms", 0)),
    collectorStatus: Number(argument("--collector-status", 202)),
  })
  console.log(`Analytics fixture: ${fixture.base}; synthetic credentials only`)
}
