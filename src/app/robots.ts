import type { MetadataRoute } from "next";
import { BRAND } from "./constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/private/"],
      },
      {
        userAgent: ["GPTBot", "ClaudeBot", "CCBot", "anthropic-ai", "Google-Extended"],
        allow: "/",
      },
    ],
    sitemap: `${BRAND.url}/sitemap.xml`,
    host: BRAND.url,
  };
}
