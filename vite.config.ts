import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import mdx from "fumadocs-mdx/vite"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    // SEAM (Plan B — Shiki): the fumadocs-mdx plugin reads source.config.ts;
    // Plan B configures Haskell-aware Shiki + ligature transformers there, not
    // here. This call stays as-is.
    mdx(),
    tailwindcss(),
    tanstackStart({
      // Static SPA: the build emits a fully static site under .output/public
      // (no server needed to host). `prerender` with `crawlLinks` walks the
      // pages listed below and any links it finds, producing real HTML.
      spa: {
        enabled: true,
        prerender: {
          enabled: true,
          crawlLinks: true,
        },
      },
      prerender: {
        // Fragments share an output file with their document. Crawling them
        // separately lets concurrent writes truncate the same HTML artifact.
        filter: ({ path }) => !/[?#]/.test(path),
      },
      pages: [{ path: "/docs" }, { path: "/api/search.json" }],
    }),
    react(),
    // See https://tanstack.com/start/latest/docs/framework/react/guide/hosting#nitro
    // Keep tslib in the server bundle: dependency tracing otherwise copies only
    // tslib.es6.js while Node's export conditions select modules/index.js.
    nitro({ noExternals: ["tslib"] }),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: {
      tslib: "tslib/tslib.es6.js",
    },
  },
})
