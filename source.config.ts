import { defineConfig, defineDocs } from "fumadocs-mdx/config"
import keiroGrammar from "shiki-keiro/syntaxes/keiro.tmLanguage.json" with { type: "json" }

import { rehypeMermaid } from "./src/lib/rehype-mermaid"

const keiroLanguage = {
  ...keiroGrammar,
  name: "keiro",
  scopeName: "source.keiro",
  aliases: ["keiro-dsl"],
}

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
})

// Plan B: Haskell-aware Shiki. `themes` pins a light/dark pair (fumadocs renders
// both and CSS shows the right one per theme). `langs` preloads the exact
// grammars the docs use. We do NOT pass `transformers`, so fumadocs' default
// code transformers (notation highlight/diff/focus) are preserved.
export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: { light: "github-light", dark: "github-dark" },
      // `cabal` is not a bundled Shiki grammar in this version; omitted (Cabal
      // snippets fall back to plain text). `keiro` is provided by shiki-keiro.
      langs: ["haskell", "nix", "bash", "json", keiroLanguage],
    },
    // Plan C: turn ```mermaid fences into <Mermaid> before any code highlighting
    // runs. The function form prepends rehypeMermaid to the default plugin array
    // (`v`, which includes fumadocs' built-in Shiki `rehypeCode`), so our plugin
    // runs FIRST and removes the language-mermaid pre/code node before Shiki can
    // claim it. The plain array form `[rehypeMermaid]` runs AFTER the defaults,
    // by which point Shiki has already rewritten the node and `isMermaidPre` no
    // longer matches (verified: with the array form, mermaid fences compiled to
    // `<pre class="shiki ...">` instead of `<Mermaid>`).
    rehypePlugins: (v) => [rehypeMermaid, ...v],
  },
})
