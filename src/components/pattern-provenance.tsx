import type { ReactNode } from "react"

export function PatternProvenance({ children }: { children: ReactNode }) {
  return (
    <details className="pattern-provenance mb-6 rounded-lg border text-sm">
      <summary className="cursor-pointer rounded-lg px-4 py-3 text-fd-muted-foreground hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring">
        Source details
      </summary>
      <div className="border-t px-4 py-3 wrap-anywhere [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
        {children}
      </div>
    </details>
  )
}
