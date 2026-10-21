// These ordered lifecycle, HTTP, or file-copy steps must complete before the next step.
/* oxlint-disable no-await-in-loop */
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { readdirSync } from "node:fs"
import { createServer } from "node:net"

const [image, commit] = process.argv.slice(2)
assert.ok(image && /^[a-f0-9]{40}$/.test(commit), "Usage: check-docs-container.mjs IMAGE FULL_SHA")
// Apple container requires an explicit host port; let macOS select a free one.
const listener = createServer()
await new Promise((resolve, reject) => {
  listener.once("error", reject)
  listener.listen(0, "127.0.0.1", resolve)
})
const port = listener.address().port
await new Promise((resolve, reject) =>
  listener.close((error) => (error ? reject(error) : resolve())),
)
const appleContainer = (...args) => execFileSync("container", args, { encoding: "utf8" }).trim()
const hostileConfig =
  '{"enabled":false,"literal":"quotes \\\" backslash \\\\ $(touch /tmp/analytics-injected) `id` $http_x_forwarded_user"}'
for (const scenario of [
  { name: "disabled", variables: [], trusted: false, config: '{"enabled":false}' },
  {
    name: "trusted-enabled",
    variables: [
      "--env",
      'KEIRO_DOCS_ANALYTICS_CONFIG={"enabled":true,"baseUrl":"https://collector.example","writeKey":"ksk_w_FIXTURE","sourceService":"docs"}',
      "--env",
      "KEIRO_DOCS_TRUST_FORWARDED_USER=1",
    ],
    trusted: true,
    config:
      '{"enabled":true,"baseUrl":"https://collector.example","writeKey":"ksk_w_FIXTURE","sourceService":"docs"}',
  },
  {
    name: "trusted-hostile",
    variables: [
      "--env",
      `KEIRO_DOCS_ANALYTICS_CONFIG=${hostileConfig}`,
      "--env",
      "KEIRO_DOCS_TRUST_FORWARDED_USER=1",
    ],
    trusted: true,
    config: hostileConfig,
  },
  {
    name: "untrusted-value",
    variables: [
      "--env",
      "KEIRO_DOCS_ANALYTICS_CONFIG=not-json",
      "--env",
      "KEIRO_DOCS_TRUST_FORWARDED_USER=true",
    ],
    trusted: false,
    config: "not-json",
  },
]) {
  const container = appleContainer(
    "run",
    "--platform",
    "linux/amd64",
    "--detach",
    "--rosetta",
    "--publish",
    `127.0.0.1:${port}:8080`,
    ...scenario.variables,
    image,
  )

  try {
    const base = `http://127.0.0.1:${port}`
    // The VM can be reachable before Nginx has finished starting.
    const deadline = Date.now() + 10_000
    const ready = async () => {
      try {
        const response = await fetch(`${base}/healthz`)
        if (response.ok) return
      } catch {
        // Retry only startup readiness; route assertions below must fail normally.
      }
      assert.ok(Date.now() < deadline, "Container did not become healthy within 10 seconds")
      await new Promise((resolve) => setTimeout(resolve, 100))
      await ready()
    }
    await ready()
    const check = async (path, type, pattern) => {
      const response = await fetch(`${base}${path}`)
      assert.equal(response.status, 200, path)
      assert.match(response.headers.get("content-type") ?? "", type, path)
      const body = await response.text()
      assert.match(body, pattern, path)
      return body
    }
    const configResponse = await fetch(`${base}/analytics-config.json`)
    assert.equal(configResponse.status, 200)
    assert.equal(await configResponse.text(), `${scenario.config}\n`)
    assert.match(configResponse.headers.get("cache-control"), /no-store/)
    const identity = async (options, status, body) => {
      const response = await fetch(`${base}/api/analytics/identity`, options)
      assert.equal(response.status, status, scenario.name)
      const text = await response.text()
      if (body !== undefined) assert.equal(text, body)
      assert.match(response.headers.get("cache-control"), /private, no-store/)
      assert.equal(response.headers.get("x-content-type-options"), "nosniff")
      assert.equal(response.headers.get("access-control-allow-origin"), null)
      if (status === 200)
        assert.match(response.headers.get("content-type"), /text\/plain; charset=utf-8/)
    }
    await identity({}, scenario.trusted ? 204 : 404)
    const subject = 'fixture:user:"punctuation\\and-quotes"'
    await identity(
      { headers: { "X-Forwarded-User": subject } },
      scenario.trusted ? 200 : 404,
      scenario.trusted ? subject : undefined,
    )
    appleContainer(
      "exec",
      container,
      "mv",
      "/usr/share/nginx/html/analytics-config.json",
      "/tmp/analytics-config.saved",
    )
    const missingConfig = await fetch(`${base}/analytics-config.json`)
    assert.equal(missingConfig.status, 404)
    assert.match(missingConfig.headers.get("cache-control"), /no-store/)
    appleContainer(
      "exec",
      container,
      "mv",
      "/tmp/analytics-config.saved",
      "/usr/share/nginx/html/analytics-config.json",
    )
    await identity({ method: "POST" }, 405)
    await identity({ method: "HEAD" }, 405)
    assert.equal(
      appleContainer(
        "exec",
        container,
        "sh",
        "-c",
        "test ! -e /tmp/analytics-injected && echo literal",
      ),
      "literal",
    )
    await check("/healthz", /text\/plain/, /^ok\n$/)
    const html = await check("/", /text\/html/, /<!doctype html>/i)
    await check("/docs/runtime-patterns/messaging/outbox", /text\/html/, /Outbox/i)
    await check("/api/search.json", /application\/json/, /runtime-patterns/)
    await check(
      "/api/markdown/runtime-patterns/messaging/outbox.txt",
      /text\/plain; charset=utf-8/,
      /^# /,
    )
    const asset = html.match(/(?:src|href)="([^" ]+\.js)"/)?.[1]
    assert.ok(asset, "SPA shell must reference JavaScript")
    await check(asset, /javascript/, /./)
    const diagram = readdirSync(".output/public/assets").find((file) =>
      /^deployment-and-crash-recovery-.*\.js$/.test(file),
    )
    assert.ok(diagram, "Build must contain the bundled SVG diagram")
    await check(`/assets/${diagram}`, /javascript/, /<svg/)
    const receipt = JSON.parse(await check("/_deployment.json", /application\/json/, /commit/))
    assert.equal(receipt.commit, commit)
    await Promise.all(
      ["/assets/missing.js", "/api/missing.json", "/api/markdown/missing.txt"].map(async (path) => {
        assert.equal((await fetch(`${base}${path}`)).status, 404, path)
      }),
    )
    console.log(
      `Container ${scenario.name} verified: analytics config/identity, HTML, deep route, JavaScript, SVG, search, Markdown, health, SHA ${commit}, and missing-file 404s.`,
    )
  } finally {
    appleContainer("delete", "--force", container)
  }
}
