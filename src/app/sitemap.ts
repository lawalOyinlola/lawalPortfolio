import type { MetadataRoute } from "next";
import { BRAND, PROJECTS } from "./constants";

// Bump when content meaningfully changes; avoids a fresh date every build.
const LAST_UPDATED = new Date("2026-06-03T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = LAST_UPDATED;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BRAND.url,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BRAND.url}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BRAND.url}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = PROJECTS.map((project) => ({
    url: `${BRAND.url}/projects/${project.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: project.featured ? 0.9 : 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}
