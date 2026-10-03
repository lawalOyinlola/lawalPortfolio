import type { MetadataRoute } from "next";
import { BRAND, PROJECTS } from "./constants";
import { getBlogPosts, getLabPosts } from "@/lib/content";

// Bump when content meaningfully changes; avoids a fresh date every build.
const LAST_UPDATED = new Date("2026-06-03T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = LAST_UPDATED;
  const posts = getBlogPosts();
  const labs = getLabPosts();

  const labsIndexModified = labs.reduce<Date>((latest, lab) => {
    const modified = lab.frontmatter.updated ?? lab.frontmatter.date;
    return modified > latest ? modified : latest;
  }, now);

  // The /security hub renders both the labs and the security-tagged blog posts
  // (see SECURITY_TAGS in the hub page), so its freshness is the latest of
  // either set, not just the labs.
  const securityTags = new Set([
    "security",
    "cybersecurity",
    "appsec",
    "pentesting",
    "penetrationtesting",
  ]);
  const securityHubModified = posts.reduce<Date>((latest, post) => {
    const isSecurity = post.frontmatter.tags.some((tag) =>
      securityTags.has(tag.toLowerCase()),
    );
    if (!isSecurity) return latest;
    const modified = post.frontmatter.updated ?? post.frontmatter.date;
    return modified > latest ? modified : latest;
  }, labsIndexModified);

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
    {
      url: `${BRAND.url}/security`,
      lastModified: securityHubModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BRAND.url}/security/labs`,
      lastModified: labsIndexModified,
      changeFrequency: "weekly",
      priority: 0.7,
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

  const labRoutes: MetadataRoute.Sitemap = labs.map((lab) => ({
    url: `${BRAND.url}/security/labs/${lab.slug}`,
    lastModified: lab.frontmatter.updated ?? lab.frontmatter.date,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...blogRoutes, ...labRoutes];
}
