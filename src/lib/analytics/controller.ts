import type { AnalyticsConfig, EnabledAnalyticsConfig } from "./config"
import type { AnalyticsEvent, AnalyticsSdk, KansokuClient } from "./sdk"

export type AnalyticsPage = { url: string; pathname: string; title: string }
export type AnalyticsDependencies = {
  loadConfig: () => Promise<AnalyticsConfig>
  loadSdk: (config: EnabledAnalyticsConfig) => Promise<AnalyticsSdk | undefined>
  identity: (config: EnabledAnalyticsConfig) => Promise<string | undefined>
  now?: () => number
  defer?: (callback: () => void) => void
}
function cleanFields<T extends Record<string, unknown>>(fields: T): T {
  const result = { ...fields }
  for (const key of Object.keys(result)) {
    if (key.toLowerCase() === "referrer" || /^utm/i.test(key)) delete result[key]
  }
  return result
}
export function redactAnalyticsEvent(
  event: AnalyticsEvent,
  includeQuery: boolean,
): AnalyticsEvent | null {
  const result = cleanFields(event)
  result.properties = cleanFields(event.properties)
  const raw = typeof result.properties.url === "string" ? result.properties.url : result.url
  if (raw !== undefined) {
    try {
      const url = new URL(raw)
      if (!["http:", "https:"].includes(url.protocol)) return null
      const pathname = url.pathname.replace(/\/{2,}/g, "/").replace(/\/$/, "") || "/"
      const sanitized = url.origin + pathname + (includeQuery ? url.search : "")
      result.url = sanitized
      if (typeof result.properties.url === "string") result.properties.url = sanitized
      if (typeof result.properties.path === "string") result.properties.path = pathname
    } catch {
      return null
    }
  }
  return result
}

const safely = (action: () => void) => {
  try {
    action()
  } catch {
    /* Observations cannot break navigation. */
  }
}

export function createAnalyticsController(dependencies: AnalyticsDependencies) {
  let disposed = false
  let generation = 0
  let current: { token: symbol; page: AnalyticsPage } | undefined
  let configPromise: Promise<AnalyticsConfig> | undefined
  let sdkPromise: Promise<AnalyticsSdk | undefined> | undefined
  let active: { client: KansokuClient; subject: string | undefined } | undefined
  let captured: string | undefined
  const defer = dependencies.defer ?? queueMicrotask

  function pause() {
    if (active) safely(() => active!.client.stop())
  }
  function retire() {
    const previous = active
    active = undefined
    captured = undefined
    if (previous) {
      safely(() => previous.client.stop())
      safely(() => {
        void previous.client.shutdown().catch(() => {})
      })
    }
  }
  const key = (page: AnalyticsPage) => new URL(page.url).origin + page.pathname
  async function reconcile() {
    const attempt = ++generation
    const registration = current
    const valid = () =>
      !disposed && !!registration && current === registration && attempt === generation
    try {
      configPromise ??= dependencies.loadConfig()
      const config = await configPromise
      if (!valid() || !config.enabled) return
      const subject =
        config.identity.mode === "none"
          ? undefined
          : await dependencies.identity(config).catch(() => undefined)
      if (!valid()) return
      if (active && active.subject !== subject) retire()
      if (!subject && config.identity.mode === "required") {
        retire()
        return
      }
      if (!active) {
        sdkPromise ??= dependencies.loadSdk(config).catch(() => {
          sdkPromise = undefined
          return undefined
        })
        const sdk = await sdkPromise
        if (!valid() || !sdk) return
        const client = sdk.createKansoku({
          baseUrl: config.baseUrl,
          writeKey: config.writeKey,
          sourceService: config.sourceService,
          autoStart: false,
          autocapture: {
            pageViews: false,
            sessions: config.capture.sessions,
            pageLeave: config.capture.pageLeave,
          },
          storage: "memory",
          persistQueue: false,
          storageKeyPrefix: `keiro-docs.${config.sourceService}`,
          ...config.delivery,
          respectDoNotTrack: config.privacy.respectDoNotTrack,
          respectGlobalPrivacyControl: config.privacy.respectGlobalPrivacyControl,
          beforeSend: (event) => redactAnalyticsEvent(event, config.privacy.includeQuery),
          now: dependencies.now,
          // Upstream debug diagnostics can contain event details. Keep them out of browser logs.
          debug: false,
        })
        active = { client, subject }
        if (subject) client.identify(subject, {}, { schemaVersion: 1 })
      }
      if (!valid()) return
      active.client.start()
      const visitKey = JSON.stringify([key(registration!.page), subject])
      if (captured !== visitKey) {
        const page = registration!.page
        active.client.page({ url: page.url, path: page.pathname, title: page.title })
        captured = visitKey
      }
    } catch {
      if (valid()) retire()
    }
  }
  return {
    visit(page: AnalyticsPage): () => void {
      if (disposed) return () => {}
      const registration = { token: Symbol("visit"), page }
      current = registration
      pause()
      void reconcile()
      let released = false
      return () => {
        if (released) return
        released = true
        if (current?.token !== registration.token || disposed) return
        current = undefined
        generation++
        pause()
        const departure = generation
        defer(() => {
          if (!disposed && !current && generation === departure) retire()
        })
      }
    },
    refreshIdentity() {
      if (disposed || !current) return
      pause()
      void reconcile()
    },
    dispose() {
      if (disposed) return
      disposed = true
      current = undefined
      generation++
      retire()
    },
  }
}
