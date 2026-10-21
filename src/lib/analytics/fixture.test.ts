import { expect, test } from "bun:test"

import { startAnalyticsFixture } from "../../../scripts/serve-analytics-fixture.mjs"

test("localhost collector accepts only arrays with the synthetic key, and resets between runs", async () => {
  const fixture = await startAnalyticsFixture({ mode: "required", port: 0 })
  try {
    const config = await (await fetch(`${fixture.base}/analytics-config.json`)).json()
    expect(config.identity.mode).toBe("required")
    const post = (key: string, body: unknown) =>
      fetch(`${fixture.base}/v1/batch`, {
        method: "POST",
        headers: { "X-Api-Key": key },
        body: JSON.stringify(body),
      })
    expect((await post("incorrect", [])).status).toBe(401)
    expect((await post(config.writeKey, {})).status).toBe(400)
    expect((await post(config.writeKey, [{ eventName: "page_view" }])).status).toBe(202)
    expect(await (await fetch(`${fixture.base}/__analytics/events`)).json()).toEqual([
      { eventName: "page_view" },
    ])
    const anonymous = await fetch(`${fixture.base}/api/analytics/identity`)
    expect(anonymous.status).toBe(204)
    const identified = await fetch(`${fixture.base}/api/analytics/identity`, {
      headers: { Cookie: "analytics_test_user=user:fixture" },
    })
    expect(await identified.text()).toBe("user:fixture")
    expect(identified.headers.get("cache-control")).toContain("no-store")
  } finally {
    await fixture.close()
  }
  const fresh = await startAnalyticsFixture({ port: 0 })
  try {
    expect(fresh.events).toEqual([])
  } finally {
    await fresh.close()
  }
})
