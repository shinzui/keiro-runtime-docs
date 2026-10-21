// These ordered lifecycle, HTTP, or file-copy steps must complete before the next step.
/* oxlint-disable no-await-in-loop */
import { describe, expect, test } from "bun:test"

import { fetchAnalyticsConfig, parseAnalyticsConfig } from "./config"
import { loadAnalyticsSdk } from "./sdk"

export const origin = "https://docs.example"
export const enabled = {
  enabled: true,
  baseUrl: "https://collector.example",
  writeKey: "ksk_w_fixture",
  sourceService: "docs",
}
describe("configuration boundary", () => {
  test("disabled and malformed configuration never imports SDK", async () => {
    let imports = 0
    for (const value of [
      undefined,
      null,
      [],
      {},
      { enabled: false },
      { enabled: true },
      { ...enabled, typo: true },
      { ...enabled, identity: { mode: "require" } },
    ]) {
      const config = parseAnalyticsConfig(value, origin)
      expect(config).toEqual({ enabled: false })
      await loadAnalyticsSdk(config, async () => {
        imports++
        throw new Error("must not import")
      })
    }
    expect(imports).toBe(0)
  })
  test("defaults, same-origin identity and delivery bounds", () => {
    const config = parseAnalyticsConfig(enabled, origin)
    expect(config.enabled).toBe(true)
    if (!config.enabled) return
    expect(config.identity).toEqual({
      mode: "none",
      endpoint: `${origin}/api/analytics/identity`,
      timeoutMs: 2000,
    })
    expect(config.privacy.respectDoNotTrack).toBe(true)
    for (const bad of [
      { baseUrl: "http://collector.example" },
      { baseUrl: "https://user:pass@collector.example" },
      { baseUrl: "https://collector.example?key=x" },
      { baseUrl: "https://collector.example/#fragment" },
      { writeKey: "ksk_s_private" },
      { sourceService: "x".repeat(129) },
      { sourceService: "bad space" },
      { identity: { endpoint: "https://other.example/identity" } },
      { identity: { endpoint: "/i#x" } },
      { identity: { timeoutMs: 99 } },
      { delivery: { flushAt: 101 } },
      { delivery: { maxRetries: -1 } },
      { delivery: { flushIntervalMs: 1.5 } },
      { capture: { pageLeave: "false" } },
      { privacy: { unknown: true } },
    ])
      expect(parseAnalyticsConfig({ ...enabled, ...bad }, origin)).toEqual({ enabled: false })
    expect(
      parseAnalyticsConfig({ ...enabled, baseUrl: "http://127.0.0.1:5216" }, origin).enabled,
    ).toBe(true)
  })
  test("fetch failures, HTML fallback and stalled bodies disable without blocking", async () => {
    for (const response of [
      new Response("missing", { status: 404 }),
      new Response("<!doctype html>"),
      new Response("{"),
    ]) {
      expect(await fetchAnalyticsConfig(origin, async () => response)).toEqual({ enabled: false })
    }
    expect(await fetchAnalyticsConfig(origin, () => new Promise(() => {}), 5)).toEqual({
      enabled: false,
    })
    let options: RequestInit | undefined
    await fetchAnalyticsConfig(origin, async (_url, init) => {
      options = init
      return Response.json(enabled)
    })
    expect(options?.cache).toBe("no-store")
  })
  test("real snapshot exposes the callable SDK", async () => {
    expect(
      typeof (await loadAnalyticsSdk(parseAnalyticsConfig(enabled, origin)))?.createKansoku,
    ).toBe("function")
  })
})
