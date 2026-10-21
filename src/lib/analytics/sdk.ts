import type { AnalyticsConfig } from "./config"

export type {
  AnalyticsEvent,
  KansokuClient,
  KansokuOptions,
} from "../../vendor/kansoku-js/index.js"
export type AnalyticsSdk = Pick<typeof import("../../vendor/kansoku-js/index.js"), "createKansoku">
export async function loadAnalyticsSdk(
  config: AnalyticsConfig,
  importer: () => Promise<AnalyticsSdk> = () => import("../../vendor/kansoku-js/index.js"),
): Promise<AnalyticsSdk | undefined> {
  if (!config.enabled) return undefined
  return importer()
}
