// These ordered lifecycle, HTTP, or file-copy steps must complete before the next step.
/* oxlint-disable no-await-in-loop */
import { expect, test } from "bun:test"

import { parseAnalyticsConfig } from "./config"
import { fetchAnalyticsIdentity } from "./identity"

const value = {
  enabled: true,
  baseUrl: "https://collector.example",
  writeKey: "ksk_w_fixture",
  sourceService: "docs",
  identity: { mode: "required", timeoutMs: 100 },
}
const config = parseAnalyticsConfig(value, "https://docs.example")
if (!config.enabled) throw new Error("fixture config")
test("only a bounded same-origin successful plain text response verifies identity", async () => {
  for (const status of [204, 401, 403, 404, 302, 500]) {
    expect(
      await fetchAnalyticsIdentity(
        config,
        async () =>
          new Response(status === 204 ? null : "user:alice", {
            status,
            headers: { "Content-Type": "text/plain" },
          }),
      ),
    ).toBeUndefined()
  }
  for (const body of ["", " ", "a\nb", "user\tbad", "x".repeat(1025)]) {
    expect(
      await fetchAnalyticsIdentity(
        config,
        async () => new Response(body, { headers: { "Content-Type": "text/plain" } }),
      ),
    ).toBeUndefined()
  }
  for (const type of ["text/html", "application/json"]) {
    expect(
      await fetchAnalyticsIdentity(
        config,
        async () => new Response("user:alice", { headers: { "Content-Type": type } }),
      ),
    ).toBeUndefined()
  }
  expect(
    await fetchAnalyticsIdentity(config, async (_url, init) => {
      expect(init).toMatchObject({
        cache: "no-store",
        credentials: "same-origin",
        redirect: "error",
      })
      return new Response('user:"a\\b"', {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    }),
  ).toBe('user:"a\\b"')
  expect(
    await fetchAnalyticsIdentity(config, async () => {
      throw new Error("network")
    }),
  ).toBeUndefined()
  expect(await fetchAnalyticsIdentity(config, () => new Promise(() => {}))).toBeUndefined()
})
test("anonymous identity mode never contacts endpoint", async () => {
  const anonymous = { ...config, identity: { ...config.identity, mode: "none" as const } }
  expect(
    await fetchAnalyticsIdentity(anonymous, async () => {
      throw new Error("must not fetch")
    }),
  ).toBeUndefined()
})
