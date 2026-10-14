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
const container = appleContainer(
  "run",
  "--platform",
  "linux/amd64",
  "--detach",
  "--rosetta",
  "--publish",
  `127.0.0.1:${port}:8080`,
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
    `Container verified: HTML, deep route, JavaScript, SVG, search, Markdown, health, SHA ${commit}, and missing-file 404s.`,
  )
} finally {
  appleContainer("delete", "--force", container)
}
