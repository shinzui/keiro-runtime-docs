import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

import { fetchAnalyticsConfig } from "@/lib/analytics/config"
import { createAnalyticsController } from "@/lib/analytics/controller"
import { fetchAnalyticsIdentity } from "@/lib/analytics/identity"
import { loadAnalyticsSdk } from "@/lib/analytics/sdk"

type Controller = ReturnType<typeof createAnalyticsController>
const AnalyticsContext = createContext<Controller | undefined>(undefined)
export function PageAnalyticsOwner({ children }: { children: ReactNode }) {
  // Construction is inert, including during prerendering. Effects own the browser lifetime.
  const [controller, setController] = useState<Controller>()
  useEffect(() => {
    const owner = createAnalyticsController({
      loadConfig: () => fetchAnalyticsConfig(window.location.origin),
      loadSdk: loadAnalyticsSdk,
      identity: fetchAnalyticsIdentity,
    })
    setController(owner)
    let hidden = document.visibilityState === "hidden"
    const blur = () => {
      hidden = true
    }
    const visible = () => {
      if (document.visibilityState === "hidden") {
        hidden = true
        return
      }
      if (hidden) {
        hidden = false
        owner.refreshIdentity()
      }
    }
    window.addEventListener("blur", blur)
    window.addEventListener("focus", visible)
    document.addEventListener("visibilitychange", visible)
    return () => {
      window.removeEventListener("blur", blur)
      window.removeEventListener("focus", visible)
      document.removeEventListener("visibilitychange", visible)
      owner.dispose()
    }
  }, [])
  return <AnalyticsContext.Provider value={controller}>{children}</AnalyticsContext.Provider>
}
export function PageAnalytics({ pathname, title }: { pathname: string; title: string }) {
  const controller = useContext(AnalyticsContext)
  useEffect(
    () =>
      controller?.visit({
        pathname,
        url: new URL(pathname + window.location.search, window.location.origin).href,
        title,
      }),
    [controller, pathname, title],
  )
  return null
}
