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

// SEAM (Plan B — Shiki): Plan B extends the config below with the Haskell-aware
// Shiki highlighter + ligature-friendly transformers, e.g.:
//
//   export default defineConfig({
//     mdxOptions: {
//       rehypeCodeOptions: {
//         // custom Shiki highlighter / themes / transformers for ligatures
//       },
//     },
//   });
//
// Until then, the default config gives plain (un-ligatured) syntax highlighting.
export default defineConfig();
