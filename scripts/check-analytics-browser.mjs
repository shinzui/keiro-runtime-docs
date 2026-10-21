// These ordered lifecycle, HTTP, or file-copy steps must complete before the next step.
/* oxlint-disable no-await-in-loop */
import assert from "node:assert/strict"

import { chromium, expect } from "@playwright/test"

import { startAnalyticsFixture } from "./serve-analytics-fixture.mjs"

const outbox = "/docs/runtime-patterns/messaging/outbox"
const inbox = "/docs/runtime-patterns/messaging/inbox"
const browser = await chromium.launch({ headless: true })
const viewEvents = (fixture) => fixture.events.filter((event) => event.eventName === "page_view")
async function scenario(options, run) {
  const fixture = await startAnalyticsFixture({ port: 0, ...options })
  const context = await browser.newContext()
  const errors = []
  const page = await context.newPage()
  page.on("pageerror", (error) => errors.push(error.message))
  try {
    await run({ fixture, context, page, base: fixture.base })
    assert.deepEqual(errors, [], "Analytics must not throw into the page")
  } finally {
    await context.close()
    await fixture.close()
  }
}
const settle = (page) => page.waitForTimeout(400)
async function navigate(page, path) {
  // Use the site's links, preserving the root controller through SPA navigation.
  const link = page.locator(`a[href="${path}"]`).first()
  await link.click()
  await page.waitForURL((url) => url.pathname === path)
}
async function syntheticNavigation(page, path) {
  // Exercise router navigation to home/missing paths without a full document reload.
  // The installed TanStack runtime exposes its router for fixture-driven navigation.
  await page.evaluate((href) => window.__TSR_ROUTER__.navigate({ to: href }), path)
}
async function search(page, query, target) {
  await page.getByRole("button", { name: /^Search/ }).click()
  await page.getByRole("dialog").getByRole("combobox").fill(query)
  await page.getByRole("dialog").locator(`[id="fd-search-option-${target}"]`).click()
  await page.waitForURL((url) => url.pathname === target)
}
try {
  await scenario({ mode: "required" }, async ({ fixture, context, page, base }) => {
    await context.addCookies([{ name: "analytics_test_user", value: "user:alice", url: base }])
    await page.goto(`${base}${outbox}?secret=hidden#transactional-outbox`)
    await expect.poll(() => viewEvents(fixture).length).toBe(1)
    const first = viewEvents(fixture)[0]
    assert.equal(first.userId, "user:alice")
    assert.equal(first.sourceService, "keiro-runtime-docs")
    assert.equal(first.url, `${base}${outbox}`)
    assert.deepEqual(first.properties, {
      url: first.url,
      path: outbox,
      title: "Transactional Outbox",
    })
    for (const name of ["identify", "session_start", "page_view"])
      assert.ok(
        fixture.events.some((event) => event.eventName === name && event.userId === "user:alice"),
      )
    await navigate(page, inbox)
    await expect.poll(() => viewEvents(fixture).length).toBe(2)
    await page.goBack()
    await expect.poll(() => viewEvents(fixture).length).toBe(3)
    await page.locator('a[href="#enqueue-the-decision"]').first().click()
    await settle(page)
    assert.equal(viewEvents(fixture).length, 3, "Fragments do not count")
    await page.reload()
    await expect.poll(() => viewEvents(fixture).length).toBe(4)
    await search(page, "Idempotent Inbox", inbox)
    await expect.poll(() => viewEvents(fixture).length).toBe(5)
    await context.addCookies([{ name: "analytics_test_user", value: "user:bob", url: base }])
    await navigate(page, outbox)
    await expect.poll(() => viewEvents(fixture).length).toBe(6)
    assert.equal(viewEvents(fixture).at(-1).userId, "user:bob")
    await context.clearCookies()
    await navigate(page, inbox)
    await settle(page)
    assert.equal(viewEvents(fixture).length, 6, "Required missing subject cannot capture")
    await context.addCookies([{ name: "analytics_test_user", value: "user:bob", url: base }])
    await page.evaluate(() => {
      window.dispatchEvent(new Event("blur"))
      window.dispatchEvent(new Event("focus"))
    })
    await expect.poll(() => viewEvents(fixture).length).toBe(7)
    const before = viewEvents(fixture).length
    await page.evaluate(() => {
      window.dispatchEvent(new Event("blur"))
      window.dispatchEvent(new Event("focus"))
    })
    await settle(page)
    assert.equal(viewEvents(fixture).length, before)
    console.log(
      "✓ Real batches: A → B → Back, reload, search, fragment, Alice → Bob → missing, focus revalidation",
    )
  })
  for (const mode of ["anonymous", "optional"]) {
    await scenario({ mode }, async ({ fixture, page, base }) => {
      await page.goto(`${base}${outbox}`)
      await expect.poll(() => viewEvents(fixture).length).toBe(1)
      assert.equal(viewEvents(fixture)[0].userId, undefined)
      assert.equal(
        fixture.requests.some((request) => request.path === "/api/analytics/identity"),
        mode === "optional",
      )
    })
  }
  await scenario({ mode: "disabled" }, async ({ fixture, context, page, base }) => {
    const requests = []
    await context.addInitScript(() => {
      window.__analyticsStorageWrites = []
      const original = Storage.prototype.setItem
      Storage.prototype.setItem = function (key, value) {
        window.__analyticsStorageWrites.push(key)
        return original.call(this, key, value)
      }
    })
    page.on("request", (request) => requests.push(request.url()))
    await page.route("**/v1/batch", (route) => route.abort())
    await page.goto(`${base}${outbox}`)
    await navigate(page, inbox)
    await search(page, "Transactional Outbox", outbox)
    await expect(page.locator(".svg-diagram-frame svg").first()).toBeVisible()
    const markdown = await page.request.get(
      `${base}/api/markdown/runtime-patterns/messaging/outbox.txt`,
    )
    assert.equal(markdown.status(), 200)
    assert.match(await markdown.text(), /^# /)
    await settle(page)
    assert.equal(fixture.events.length, 0)
    assert.ok(!requests.some((url) => /\/api\/analytics\/identity|\/v1\/batch/.test(url)))
    // The SDK's constants identify its separate dynamic bundle, even after minification.
    const sdkRequests = await Promise.all(
      requests
        .filter((url) => /\/assets\/.*\.js$/.test(url))
        .map(async (url) => (await (await fetch(url)).text()).includes("anonymous_id")),
    )
    assert.ok(!sdkRequests.includes(true), "Disabled must not download the SDK")
    assert.deepEqual(
      await page.evaluate(() =>
        window.__analyticsStorageWrites.filter((key) => /kansoku|keiro-docs/.test(key)),
      ),
      [],
    )
    console.log(
      "✓ Disabled with collector blocked: docs, search, SVG, export; no SDK/identity/collector/storage",
    )
  })
  for (const failure of ["import", "401", "collector", "identity-timeout"]) {
    await scenario(
      {
        mode: failure === "identity-timeout" ? "required" : "anonymous",
        identityDelayMs: failure === "identity-timeout" ? 800 : 0,
        collectorStatus: failure === "401" ? 401 : 202,
      },
      async ({ fixture, context, page, base }) => {
        if (failure === "identity-timeout")
          await context.addCookies([
            { name: "analytics_test_user", value: "user:alice", url: base },
          ])
        if (failure === "collector") await page.route("**/v1/batch", (route) => route.abort())
        let importRejected = false
        if (failure === "import")
          await page.route("**/assets/*.js", async (route) => {
            const response = await route.fetch()
            const body = await response.text()
            if (
              body.includes("kansoku-js") &&
              body.includes("page_leave") &&
              body.includes("anonymous_id")
            ) {
              importRejected = true
              await route.abort()
            } else await route.fulfill({ response, body })
          })
        await page.goto(`${base}${outbox}`)
        await navigate(page, inbox)
        await search(page, "Transactional Outbox", outbox)
        await expect(page.locator(".svg-diagram-frame svg").first()).toBeVisible()
        await settle(page)
        if (failure !== "collector") assert.equal(fixture.events.length, 0)
        if (failure === "import")
          assert.ok(importRejected, "SDK chunk import must actually be rejected")
        console.log(`✓ ${failure}: navigation, search, diagrams remain usable`)
      },
    )
  }
  // Depart while identity is pending and after capture; root refresh on non-doc routes is inert.
  for (const pending of [true, false]) {
    await scenario(
      { mode: "required", identityDelayMs: pending ? 150 : 0 },
      async ({ fixture, context, page, base }) => {
        await context.addCookies([{ name: "analytics_test_user", value: "user:alice", url: base }])
        await page.goto(`${base}${outbox}`)
        await expect
          .poll(() =>
            fixture.requests.some((request) => request.path === "/api/analytics/identity"),
          )
          .toBe(true)
        if (!pending) await expect.poll(() => viewEvents(fixture).length).toBe(1)
        else
          assert.equal(
            viewEvents(fixture).length,
            0,
            "Departure must occur while identity is pending",
          )
        for (const destination of ["/", "/docs/missing-analytics-fixture"]) {
          const before = viewEvents(fixture).length
          await syntheticNavigation(page, destination)
          await settle(page)
          const identities = fixture.requests.filter(
            (request) => request.path === "/api/analytics/identity",
          ).length
          await page.evaluate(() => {
            window.dispatchEvent(new Event("blur"))
            window.dispatchEvent(new Event("focus"))
          })
          await settle(page)
          assert.equal(
            fixture.requests.filter((request) => request.path === "/api/analytics/identity").length,
            identities,
          )
          assert.equal(viewEvents(fixture).length, before)
          await syntheticNavigation(page, outbox)
          await expect.poll(() => viewEvents(fixture).length).toBe(before + 1)
        }
        console.log(
          `✓ Non-doc home/404 departures (${pending ? "pending identity" : "captured"}) invalidate work and allow fresh returns`,
        )
      },
    )
  }
} finally {
  await browser.close()
}
