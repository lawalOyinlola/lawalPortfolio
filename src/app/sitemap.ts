import type { MetadataRoute } from "next";
import { BRAND } from "./constants";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BRAND.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
