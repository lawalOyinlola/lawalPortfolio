import type { MetadataRoute } from "next";
import { BRAND } from "./constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${BRAND.url}/sitemap.xml`,
  };
}
