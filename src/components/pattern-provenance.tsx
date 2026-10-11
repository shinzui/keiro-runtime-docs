export function PatternProvenance({ resource, commit }: { resource: string; commit: string }) {
  return (
    <aside
      aria-label="Canonical source"
      className="rounded-lg border bg-fd-muted/40 p-4 mb-6 text-sm"
    >
      <p className="font-medium">Versioned canonical source</p>
      <p className="break-all">
        <code>{resource}</code>
      </p>
      <p className="break-all">
        Catalog revision: <code>{commit}</code>
      </p>
      <p>
        Rules are maintained by the catalog owner. Supplementary explanations are maintained on this
        site.
      </p>
    </aside>
  )
}
