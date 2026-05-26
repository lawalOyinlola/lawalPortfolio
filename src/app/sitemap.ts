import type { MetadataRoute } from "next";
import { BRAND, PROJECTS } from "./constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

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
