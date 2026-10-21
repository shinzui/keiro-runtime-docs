// A successful Vite exit does not guarantee that TanStack prerendering worked.
// Check the published artifacts before treating a build as deployable.
import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"

const output = resolve(import.meta.dirname, "../.output/public")
const read = (path) => readFileSync(resolve(output, path), "utf8")

for (const path of [
  "_shell.html",
  "docs/index.html",
  "docs/runtime-patterns/index.html",
  "docs/runtime-patterns/messaging/outbox/index.html",
]) {
  assert.match(read(path), /<!doctype html>/i, `${path} must contain HTML`)
}

const search = JSON.parse(read("api/search.json"))
assert.ok(["advanced", "simple"].includes(search.type), "Search data must contain an index")
assert.ok(
  JSON.stringify(search).includes("/docs/runtime-patterns/messaging/outbox"),
  "Search data must include runtime patterns",
)

const markdown = read("api/markdown/runtime-patterns/messaging/outbox.txt")
assert.match(markdown, /^# /, "Markdown export must contain the page heading")
assert.doesNotMatch(markdown, /<!doctype html>/i, "Markdown export must not be an HTML fallback")
console.log("✓ static output OK — landing, docs, deep pattern, search, and Markdown artifacts.")

assert.deepEqual(
  JSON.parse(read("analytics-config.json")),
  { enabled: false },
  "Release config must stay disabled",
)
function checkHtml(directory = "") {
  for (const file of readdirSync(resolve(output, directory), { withFileTypes: true })) {
    const path = `${directory}/${file.name}`
    if (file.isDirectory()) checkHtml(path.replace(/^\//, ""))
    else if (file.name.endsWith(".html")) {
      assert.doesNotMatch(
        read(path.replace(/^\//, "")),
        /analytics_test_user|ksk_[ws]_[A-Za-z0-9_-]+|user:(?:alice|bob)|__analytics\/events/,
        `${path} contains analytics fixture or credential data`,
      )
    }
  }
}
checkHtml()
console.log("✓ analytics artifact is disabled; HTML contains no fixture identity or credentials.")
