export type AnalyticsFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>
export type EnabledAnalyticsConfig = {
  enabled: true
  baseUrl: string
  writeKey: string
  sourceService: string
  identity: { mode: "none" | "optional" | "required"; endpoint: string; timeoutMs: number }
  privacy: {
    respectGlobalPrivacyControl: boolean
    respectDoNotTrack: boolean
    includeQuery: boolean
  }
  capture: { sessions: boolean; pageLeave: boolean }
  delivery: {
    flushAt: number
    flushIntervalMs: number
    maxQueueSize: number
    maxRetries: number
    requestTimeoutMs: number
  }
  debug: boolean
}
export type AnalyticsConfig = { enabled: false } | EnabledAnalyticsConfig
const disabled: AnalyticsConfig = { enabled: false }
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("object")
  return value as Record<string, unknown>
}
function keys(value: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(value).some((key) => !allowed.includes(key))) throw new Error("unknown field")
}
function boolean(value: unknown, fallback: boolean): boolean {
  if (value === undefined) return fallback
  if (typeof value !== "boolean") throw new Error("boolean")
  return value
}
function integer(value: unknown, fallback: number, min: number, max: number): number {
  if (value === undefined) return fallback
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min || value > max)
    throw new Error("integer")
  return value
}
function section(value: unknown, allowed: string[]) {
  const result = value === undefined ? {} : object(value)
  keys(result, allowed)
  return result
}

export function parseAnalyticsConfig(value: unknown, origin: string): AnalyticsConfig {
  try {
    const root = object(value)
    keys(root, [
      "enabled",
      "baseUrl",
      "writeKey",
      "sourceService",
      "identity",
      "privacy",
      "capture",
      "delivery",
      "debug",
    ])
    if (root.enabled !== true) return disabled
    if (typeof root.baseUrl !== "string") return disabled
    const url = new URL(root.baseUrl)
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
    )
      return disabled
    if (typeof root.writeKey !== "string" || !/^ksk_w_[A-Za-z0-9_-]+$/.test(root.writeKey))
      return disabled
    if (
      typeof root.sourceService !== "string" ||
      !/^[A-Za-z0-9._:-]{1,128}$/.test(root.sourceService)
    )
      return disabled
    const identity = section(root.identity, ["mode", "endpoint", "timeoutMs"])
    const mode = identity.mode ?? "none"
    if (mode !== "none" && mode !== "optional" && mode !== "required") return disabled
    if (identity.endpoint !== undefined && typeof identity.endpoint !== "string") return disabled
    const endpoint = new URL((identity.endpoint as string) ?? "/api/analytics/identity", origin)
    if (endpoint.origin !== origin || endpoint.username || endpoint.password || endpoint.hash)
      return disabled
    const privacy = section(root.privacy, [
      "respectGlobalPrivacyControl",
      "respectDoNotTrack",
      "includeQuery",
    ])
    const capture = section(root.capture, ["sessions", "pageLeave"])
    const delivery = section(root.delivery, [
      "flushAt",
      "flushIntervalMs",
      "maxQueueSize",
      "maxRetries",
      "requestTimeoutMs",
    ])
    return {
      enabled: true,
      baseUrl: url.href.replace(/\/+$/, ""),
      writeKey: root.writeKey,
      sourceService: root.sourceService,
      identity: {
        mode,
        endpoint: endpoint.href,
        timeoutMs: integer(identity.timeoutMs, 2000, 100, 10000),
      },
      privacy: {
        respectGlobalPrivacyControl: boolean(privacy.respectGlobalPrivacyControl, true),
        respectDoNotTrack: boolean(privacy.respectDoNotTrack, true),
        includeQuery: boolean(privacy.includeQuery, false),
      },
      capture: {
        sessions: boolean(capture.sessions, true),
        pageLeave: boolean(capture.pageLeave, true),
      },
      delivery: {
        flushAt: integer(delivery.flushAt, 20, 1, 100),
        flushIntervalMs: integer(delivery.flushIntervalMs, 5000, 100, 60000),
        maxQueueSize: integer(delivery.maxQueueSize, 1000, 1, 10000),
        maxRetries: integer(delivery.maxRetries, 5, 0, 10),
        requestTimeoutMs: integer(delivery.requestTimeoutMs, 10000, 100, 30000),
      },
      debug: boolean(root.debug, false),
    }
  } catch {
    return disabled
  }
}

// Racing the full operation also bounds injected fetches and stalled response bodies.
export async function bounded<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  const abort = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      operation(abort.signal),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          abort.abort()
          reject(new Error("timeout"))
        }, timeoutMs)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}
export async function fetchAnalyticsConfig(
  origin: string,
  request: AnalyticsFetch = fetch,
  timeoutMs = 2000,
): Promise<AnalyticsConfig> {
  try {
    return await bounded(async (signal) => {
      const response = await request(new URL("/analytics-config.json", origin), {
        cache: "no-store",
        credentials: "same-origin",
        redirect: "error",
        signal,
      })
      if (!response.ok) return disabled
      return parseAnalyticsConfig(await response.json(), origin)
    }, timeoutMs)
  } catch {
    return disabled
  }
}
