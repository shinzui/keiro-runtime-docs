import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { appName, gitConfig } from "./shared";

// Shared layout configuration (nav title + GitHub link) used by both the home
// and docs layouts.
//
// SEAM (Plan D): the navigation taxonomy lives here. Plan D defines the real
// information architecture and adds the per-library top-level `links`
// (kiroku / keiro / keiki / shibuya). The scaffold intentionally ships only the
// title so the SPA prerenderer does not crawl links to pages that do not exist
// yet.
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: appName,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
