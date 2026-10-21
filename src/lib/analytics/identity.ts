import { bounded, type AnalyticsFetch, type EnabledAnalyticsConfig } from "./config"

export async function fetchAnalyticsIdentity(
  config: EnabledAnalyticsConfig,
  request: AnalyticsFetch = fetch,
): Promise<string | undefined> {
  if (config.identity.mode === "none") return undefined
  try {
    return await bounded(async (signal) => {
      const response = await request(config.identity.endpoint, {
        credentials: "same-origin",
        cache: "no-store",
        redirect: "error",
        signal,
      })
      if (
        response.status !== 200 ||
        response.redirected ||
        !/^text\/plain(?:\s*;|$)/i.test(response.headers.get("content-type") ?? "")
      )
        return undefined
      const subject = await response.text()
      // Control characters cannot be part of the trusted single-line subject.
      // oxlint-disable-next-line no-control-regex
      if (!subject.trim() || subject.length > 1024 || /[\x00-\x1f\x7f-\x9f]/.test(subject))
        return undefined
      return subject
    }, config.identity.timeoutMs)
  } catch {
    return undefined
  }
}
