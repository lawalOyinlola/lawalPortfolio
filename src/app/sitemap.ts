import type { MetadataRoute } from "next";
import { BRAND, PROJECTS } from "./constants";
import { getBlogPosts } from "@/lib/content";

// Bump when content meaningfully changes; avoids a fresh date every build.
const LAST_UPDATED = new Date("2026-06-03T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = LAST_UPDATED;
  const posts = getBlogPosts();

  // The index changes whenever any post does, so it takes the newest post's
  // date (an edit to an older post counts, hence the max rather than posts[0]).
  const blogIndexModified = posts.reduce<Date>((latest, post) => {
    const modified = post.frontmatter.updated ?? post.frontmatter.date;
    return modified > latest ? modified : latest;
  }, now);

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
    {
      url: `${BRAND.url}/blog`,
      lastModified: blogIndexModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = PROJECTS.map((project) => ({
    url: `${BRAND.url}/projects/${project.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: project.featured ? 0.9 : 0.7,
  }));

  // Posts carry their own dates, so the stable-constant rule above doesn't apply:
  // a post's lastModified is real content metadata, not build churn.
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BRAND.url}/blog/${post.slug}`,
    lastModified: post.frontmatter.updated ?? post.frontmatter.date,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...blogRoutes];
}
