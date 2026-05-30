import { defineConfig, defineDocs } from "fumadocs-mdx/config";

// Docs collection: every .mdx under content/docs/ becomes a page.
// `includeProcessedMarkdown` keeps a plain-markdown copy of each page so the
// static client loader (and any future raw-markdown / llms.txt routes) can use
// it.
//
// SEAM (Plan D): the content tree under content/docs/ is owned by Plan D's IA.
export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

// Plan B: Haskell-aware Shiki. `themes` pins a light/dark pair (fumadocs renders
// both and CSS shows the right one per theme). `langs` preloads the exact
// grammars the docs use. We do NOT pass `transformers`, so fumadocs' default
// code transformers (notation highlight/diff/focus) are preserved.
export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: { light: "github-light", dark: "github-dark" },
      // `cabal` is not a bundled Shiki grammar in this version; omitted (Cabal
      // snippets fall back to plain text). The four below are bundled.
      langs: ["haskell", "nix", "bash", "json"],
    },
  },
});
