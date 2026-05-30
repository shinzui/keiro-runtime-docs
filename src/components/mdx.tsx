import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Mermaid } from "@/components/mermaid";

// Central MDX-to-React component map. `getMDXComponents` merges fumadocs'
// defaults with any overrides.
//
// SEAM (Plan C — Mermaid): Plan C registers a `Mermaid` component (and/or a
// code-fence override that detects ```mermaid fences) by spreading it into the
// returned map below.
//
// SEAM (Plan D — UI components): Plan D registers custom authoring components
// (callouts, cards, walkthrough/cookbook wrappers) the same way.
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    // Plan C — interactive, zoomable Mermaid diagrams (see src/components/mermaid.tsx).
    Mermaid,
    // ...Plan D components go here...
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
