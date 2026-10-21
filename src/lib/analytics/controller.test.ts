// These ordered lifecycle, HTTP, or file-copy steps must complete before the next step.
/* oxlint-disable no-await-in-loop */
import { describe, expect, test } from "bun:test"

import { parseAnalyticsConfig, type AnalyticsConfig } from "./config"
import { createAnalyticsController, redactAnalyticsEvent, type AnalyticsPage } from "./controller"
import type { AnalyticsEvent, KansokuClient, KansokuOptions } from "./sdk"

const page = (name: string): AnalyticsPage => ({
  url: `https://docs.example/docs/${name}?private=secret#section`,
  pathname: `/docs/${name}`,
  title: name,
})
const config = (mode = "required") =>
  parseAnalyticsConfig(
    {
      enabled: true,
      baseUrl: "https://collector.example",
      writeKey: "ksk_w_fixture",
      sourceService: "docs",
      identity: { mode },
    },
    "https://docs.example",
  )
const tick = async () => {
  for (let i = 0; i < 20; i++) await Promise.resolve()
}
function pending<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}
function harness(initial: AnalyticsConfig = config()) {
  let subject: string | undefined = "user:alice"
  const events: Array<{ page: string; user?: string; client: number }> = []
  const order: string[] = []
  const options: KansokuOptions[] = []
  const clients: KansokuClient[] = []
  let identities = 0
  let imports = 0
  const dependencies = {
    loadConfig: async () => initial,
    identity: async () => {
      identities++
      return subject
    },
    loadSdk: async () => {
      imports++
      return {
        createKansoku: (settings: KansokuOptions) => {
          options.push(settings)
          const id = clients.length
          let user: string | undefined
          const client = {
            identify(value: string, traits: unknown, version: unknown) {
              order.push("identify")
              expect(traits).toEqual({})
              expect(version).toEqual({ schemaVersion: 1 })
              user = value
            },
            start() {
              order.push("start")
            },
            stop() {
              order.push("stop")
            },
            shutdown: async () => {
              order.push("shutdown")
            },
            page(value: { path: string }) {
              order.push("page")
              events.push({ page: value.path, user, client: id })
            },
          } as unknown as KansokuClient
          clients.push(client)
          return client
        },
      }
    },
    now: () => 42,
  }
  const controller = createAnalyticsController(dependencies)
  return {
    controller,
    dependencies,
    events,
    order,
    options,
    clients,
    subject: (value: string | undefined) => {
      subject = value
    },
    identities: () => identities,
    imports: () => imports,
  }
}

describe("committed visit lifecycle", () => {
  test("identity precedes start and first page; memory delivery and manual ownership", async () => {
    const h = harness()
    h.controller.visit(page("a"))
    await tick()
    expect(h.order.slice(-3)).toEqual(["identify", "start", "page"])
    expect(h.options[0]).toMatchObject({
      autoStart: false,
      storage: "memory",
      persistQueue: false,
      storageKeyPrefix: "keiro-docs.docs",
      autocapture: { pageViews: false },
      now: h.dependencies.now,
    })
    h.controller.dispose()
  })
  test("duplicate effects and stale releases do not inflate A → B → A", async () => {
    const h = harness()
    const releaseOld = h.controller.visit(page("a"))
    await tick()
    const releaseNew = h.controller.visit(page("a"))
    releaseOld()
    await tick()
    releaseNew()
    h.controller.visit(page("a"))
    await tick()
    h.controller.visit(page("b"))
    await tick()
    h.controller.visit(page("a"))
    await tick()
    expect(h.events.map((event) => event.page)).toEqual(["/docs/a", "/docs/b", "/docs/a"])
    h.controller.dispose()
  })
  for (const route of ["home", "404"]) {
    test(`captured docs → ${route} → same docs starts a fresh visit`, async () => {
      const h = harness()
      const release = h.controller.visit(page("a"))
      await tick()
      release()
      release()
      await tick()
      const before = h.identities()
      h.controller.refreshIdentity()
      await tick()
      expect(h.identities()).toBe(before)
      expect(h.order).toContain("shutdown")
      h.controller.visit(page("a"))
      release()
      await tick()
      expect(h.events).toHaveLength(2)
      expect(h.clients).toHaveLength(2)
      h.controller.dispose()
    })
    for (const stage of ["config", "sdk", "identity"]) {
      test(`abandoned ${stage} work cannot capture on ${route} or refresh identity`, async () => {
        const h = harness()
        const deferred = pending<never>()
        const deps = { ...h.dependencies }
        if (stage === "config") deps.loadConfig = () => deferred.promise
        if (stage === "sdk") deps.loadSdk = () => deferred.promise
        if (stage === "identity") deps.identity = () => deferred.promise
        const controller = createAnalyticsController(deps)
        const release = controller.visit(page("a"))
        await tick()
        release()
        await tick()
        const before = h.identities()
        controller.refreshIdentity()
        const result =
          stage === "config"
            ? config()
            : stage === "sdk"
              ? await h.dependencies.loadSdk()
              : "user:obsolete"
        deferred.resolve(result as never)
        await tick()
        expect(h.events).toHaveLength(0)
        expect(h.identities()).toBe(before)
        if (stage === "identity") deps.identity = h.dependencies.identity
        controller.visit(page("a"))
        await tick()
        expect(h.events).toHaveLength(1)
        controller.dispose()
      })
    }
  }
  test("obsolete user responses cannot label a newer page", async () => {
    const h = harness()
    const late = pending<string | undefined>()
    let calls = 0
    const controller = createAnalyticsController({
      ...h.dependencies,
      identity: () => (++calls === 1 ? late.promise : Promise.resolve("user:bob")),
    })
    controller.visit(page("a"))
    await tick()
    controller.visit(page("b"))
    await tick()
    late.resolve("user:alice")
    await tick()
    expect(h.events).toEqual([{ page: "/docs/b", user: "user:bob", client: 0 }])
    controller.dispose()
  })
  test("focus revalidates, separates subjects, and required missing identity stops capture", async () => {
    const h = harness()
    h.controller.visit(page("a"))
    await tick()
    h.controller.refreshIdentity()
    await tick()
    expect(h.events).toHaveLength(1)
    h.subject("user:bob")
    h.controller.refreshIdentity()
    await tick()
    h.subject(undefined)
    h.controller.refreshIdentity()
    await tick()
    h.controller.visit(page("b"))
    await tick()
    expect(h.events.map((event) => event.user)).toEqual(["user:alice", "user:bob"])
    expect(h.order.filter((value) => value === "shutdown")).toHaveLength(2)
    h.subject("user:carol")
    h.controller.refreshIdentity()
    await tick()
    expect(h.events.at(-1)?.user).toBe("user:carol")
    h.controller.dispose()
  })
  test("optional fallback replaces the old identified client with an anonymous client", async () => {
    const h = harness(config("optional"))
    h.controller.visit(page("a"))
    await tick()
    h.subject(undefined)
    h.controller.visit(page("b"))
    await tick()
    expect(h.events.map((event) => event.user)).toEqual(["user:alice", undefined])
    expect(h.events[1].client).not.toBe(h.events[0].client)
    h.controller.dispose()
  })
  test("anonymous and disabled modes avoid identity, disabled also avoids import", async () => {
    for (const settings of [config("none"), { enabled: false } as const]) {
      const h = harness(settings)
      h.controller.visit(page("a"))
      await tick()
      expect(h.identities()).toBe(0)
      expect(h.imports()).toBe(settings.enabled ? 1 : 0)
      h.controller.dispose()
    }
  })
  test("dispose invalidates deferred initialization and is terminal", async () => {
    const h = harness()
    const late = pending<AnalyticsConfig>()
    const controller = createAnalyticsController({
      ...h.dependencies,
      loadConfig: () => late.promise,
    })
    controller.visit(page("a"))
    controller.dispose()
    controller.dispose()
    late.resolve(config())
    await tick()
    controller.visit(page("b"))
    controller.refreshIdentity()
    await tick()
    expect(h.events).toHaveLength(0)
    expect(h.imports()).toBe(0)
  })
  test("SDK and identity exceptions stay inside the controller", async () => {
    const h = harness()
    for (const overrides of [
      {
        loadConfig: async () => {
          throw new Error("config")
        },
      },
      {
        loadSdk: async () => {
          throw new Error("import")
        },
      },
      {
        identity: async () => {
          throw new Error("identity")
        },
      },
      {
        loadSdk: async () => ({
          createKansoku: () => {
            throw new Error("SDK")
          },
        }),
      },
    ]) {
      const controller = createAnalyticsController({ ...h.dependencies, ...overrides })
      expect(() => controller.visit(page("a"))).not.toThrow()
      await tick()
      controller.dispose()
    }
    expect(h.events).toHaveLength(0)
  })
})
test("redaction applies to the real envelope and page-leave properties", () => {
  for (const eventName of ["page_view", "page_leave"]) {
    const event = {
      eventName,
      eventId: "event",
      sessionId: "session",
      userId: "user:a",
      url: "https://docs.example/wrong?q=1",
      referrer: "https://secret.example",
      utmSource: "secret",
      properties: {
        url: "https://docs.example/docs/a/?private=secret#section",
        path: "/docs/a/",
        title: "A",
        referrer: "secret",
        utm_source: "secret",
      },
    } as unknown as AnalyticsEvent
    const clean = redactAnalyticsEvent(event, false)!
    expect(clean.url).toBe("https://docs.example/docs/a")
    expect(clean.properties).toEqual({ url: clean.url, path: "/docs/a", title: "A" })
    expect(clean).toMatchObject({ eventId: "event", sessionId: "session", userId: "user:a" })
    expect(clean).not.toHaveProperty("referrer")
    expect(clean).not.toHaveProperty("utmSource")
    expect(redactAnalyticsEvent(event, true)?.url).toBe(
      "https://docs.example/docs/a?private=secret",
    )
    expect(event.url).toContain("wrong")
  }
})

test("optional identity lookup rejection explicitly falls back anonymously", async () => {
  const h = harness(config("optional"))
  const controller = createAnalyticsController({
    ...h.dependencies,
    identity: async () => {
      throw new Error("network")
    },
  })
  controller.visit(page("a"))
  await tick()
  expect(h.events).toEqual([{ page: "/docs/a", user: undefined, client: 0 }])
  controller.dispose()
})
