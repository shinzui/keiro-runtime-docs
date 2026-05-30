import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Mermaid } from "@/components/mermaid";
import { Callout } from "fumadocs-ui/components/callout";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { Card, Cards } from "fumadocs-ui/components/card";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { TypeTable } from "fumadocs-ui/components/type-table";

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
    // Plan D — shared fumadocs-ui authoring components used across the templates.
    Callout,
    Step,
    Steps,
    Tab,
    Tabs,
    Card,
    Cards,
    Accordion,
    Accordions,
    TypeTable,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
