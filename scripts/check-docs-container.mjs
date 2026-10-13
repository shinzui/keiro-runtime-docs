import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { readdirSync } from "node:fs"

const [image, commit] = process.argv.slice(2)
assert.ok(image && /^[a-f0-9]{40}$/.test(commit), "Usage: check-docs-container.mjs IMAGE FULL_SHA")
const docker = (...args) => execFileSync("docker", args, { encoding: "utf8" }).trim()
const container = docker("run", "--detach", "--publish", "127.0.0.1::8080", image)

try {
  const address = docker("port", container, "8080/tcp")
  const base = `http://${address}`
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
  await check("/api/markdown/runtime-patterns/messaging/outbox.txt", /text\/plain/, /^# /)
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
  for (const path of ["/assets/missing.js", "/api/missing.json", "/api/markdown/missing.txt"]) {
    assert.equal((await fetch(`${base}${path}`)).status, 404, path)
  }
  console.log(
    `Container verified: HTML, deep route, JavaScript, SVG, search, Markdown, health, SHA ${commit}, and missing-file 404s.`,
  )
} finally {
  docker("rm", "--force", container)
}
