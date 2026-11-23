import type { MetadataRoute } from "next";
import { site } from "@/data/portfolio";

// Static export: robots.txt is written once at build time.
export const dynamic = "force-static";

// Everyone may crawl everything. The AI crawlers are named too, so a tool
// that only reads its own block still sees an explicit allow.
const AI_BOTS = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: AI_BOTS, allow: "/" },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
