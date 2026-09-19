import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod";
import { BRAND } from "@/app/constants/brand";

/**
 * File-backed content layer for `/blog` and `/labs`.
 *
 * Source of truth is `content/<collection>/<slug>.md`. Everything here runs at
 * build time inside Server Components — never ship this to the client.
 *
 * Format rule (see tasks/blog-and-labs-plan.md §2a): `.md` is the default because
 * it syndicates to dev.to byte-for-byte. `.mdx` is opt-in for site-only posts and
 * is force-excluded from syndication by `isSyndicatable()`.
 */

export const CONTENT_ROOT = path.join(process.cwd(), "content");

export const COLLECTIONS = ["blog", "labs"] as const;
export type Collection = (typeof COLLECTIONS)[number];

/**
 * Where images resolve from when a URL has to be absolute (dev.to fetches by URL
 * and cannot take relative paths). Swap this one env var to move onto Cloudinary
 * or a bucket later without touching a single post.
 */
export const ASSET_ORIGIN = process.env.NEXT_PUBLIC_ASSET_ORIGIN ?? BRAND.url;

export function toAbsoluteAssetUrl(src: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  return `${ASSET_ORIGIN}${src.startsWith("/") ? "" : "/"}${src}`;
}

/* -------------------------------------------------------------------------- */
/* Frontmatter schemas                                                        */
/* -------------------------------------------------------------------------- */

const baseFrontmatter = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(320),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  cover: z.string().optional(),
  /** Required whenever `cover` is set; enforced by requireCoverAlt below. */
  coverAlt: z.string().min(1).optional(),
  draft: z.boolean().default(false),
  /**
   * Set once the post exists on dev.to (via sync, RSS import, or migration).
   * Its presence turns an API POST into a PUT, and drops the post from the RSS
   * feed so dev.to never imports a duplicate of an article it already has.
   */
  devto_id: z.number().int().positive().nullable().default(null),
  /** dev.to slugs carry a random suffix, so the URL is recorded, never guessed. */
  devto_url: z.string().url().optional(),
  /** Status only: whether the dev.to copy is live rather than a draft. */
  devto_published: z.boolean().default(false),
});

/**
 * A cover without alt text is invisible to screen readers, and covers here
 * often carry the post's headline numbers. Applied to each final schema rather
 * than the base, because zod 4 won't `.extend()` an object that has refinements.
 */
function requireCoverAlt(
  data: { cover?: string; coverAlt?: string },
  ctx: z.RefinementCtx,
): void {
  if (data.cover && !data.coverAlt) {
    ctx.addIssue({
      code: "custom",
      path: ["coverAlt"],
      message: "coverAlt is required when cover is set",
    });
  }
}

export const blogFrontmatterSchema = baseFrontmatter.superRefine(requireCoverAlt);

/**
 * `status` is the publication gate, not decoration. HackTheBox forbids writeups
 * for active machines, so "active" is simply not a value the schema accepts —
 * a lab marked active fails `next build` instead of reaching production.
 */
export const labFrontmatterSchema = baseFrontmatter.extend({
  platform: z.enum([
    "HackTheBox",
    "TryHackMe",
    "PortSwigger",
    "PentesterLab",
    "OverTheWire",
    "Self-hosted",
  ]),
  target: z.string().min(1),
  difficulty: z.enum(["Easy", "Medium", "Hard", "Insane"]),
  os: z.enum(["Linux", "Windows", "Web", "Mixed", "N/A"]).default("N/A"),
  categories: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  cves: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  status: z.enum(["retired", "free-room", "own-lab"]),
}).superRefine(requireCoverAlt);

export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;
export type LabFrontmatter = z.infer<typeof labFrontmatterSchema>;

export type Doc<T> = {
  slug: string;
  collection: Collection;
  format: "md" | "mdx";
  frontmatter: T;
  /** Raw markdown body, frontmatter stripped. */
  body: string;
  readingMinutes: number;
};

export type BlogPost = Doc<BlogFrontmatter>;
export type LabPost = Doc<LabFrontmatter>;

/* -------------------------------------------------------------------------- */
/* Guards                                                                     */
/* -------------------------------------------------------------------------- */

const FLAG_PATTERN = /\b(?:HTB|THM|FLAG|CTF)\{([^}]*)\}/gi;
/** Deliberate redactions: "redacted", leetspeak "r3d4ct3d", ***, xxxx, snip. */
const REDACTED = /r[3e]d[4a]ct|snip|\*{3,}|x{4,}/i;

/**
 * Publishing a live flag spoils the box for everyone and breaks platform rules.
 * Redacted forms — `HTB{r3d4ct3d}` — are allowed through deliberately.
 */
function assertNoLeakedFlags(raw: string, source: string): void {
  for (const match of raw.matchAll(FLAG_PATTERN)) {
    const inner = match[1] ?? "";
    if (!REDACTED.test(inner)) {
      // Point at the line, never print the value: this message lands in CI and
      // deploy logs, which would otherwise publish the flag it's protecting.
      const line = raw.slice(0, match.index).split("\n").length;
      throw new Error(
        `[content] ${source}:${line} contains what looks like an unredacted flag.\n` +
          `Redact it (e.g. HTB{r3d4ct3d}) or remove it before publishing.`,
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Loading                                                                    */
/* -------------------------------------------------------------------------- */

function collectionDir(collection: Collection): string {
  return path.join(CONTENT_ROOT, collection);
}

function listFiles(collection: Collection): string[] {
  const dir = collectionDir(collection);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .filter((file) => !file.startsWith("_") && !file.startsWith("."));
}

function parseFile<T>(
  collection: Collection,
  file: string,
  schema: z.ZodType<T>,
): Doc<T> {
  const fullPath = path.join(collectionDir(collection), file);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const source = `content/${collection}/${file}`;

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`[content] Invalid frontmatter in ${source}:\n${issues}`);
  }

  // The whole file, frontmatter included: a flag in the title or description
  // would reach the page, its metadata and the RSS feed just the same.
  assertNoLeakedFlags(raw, source);

  return {
    slug: file.replace(/\.mdx?$/, ""),
    collection,
    format: file.endsWith(".mdx") ? "mdx" : "md",
    frontmatter: parsed.data,
    body: content,
    readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
  };
}

/** Drafts stay visible in `next dev` and never reach production. */
function isVisible(doc: Doc<{ draft: boolean }>): boolean {
  return process.env.NODE_ENV === "development" || !doc.frontmatter.draft;
}

function byNewestFirst(
  a: Doc<{ date: Date }>,
  b: Doc<{ date: Date }>,
): number {
  return b.frontmatter.date.getTime() - a.frontmatter.date.getTime();
}

/**
 * Cached for the build (every page would otherwise re-read the whole directory),
 * but never in dev — a cache there means editing a post does nothing until the
 * server restarts.
 */
const SHOULD_CACHE = process.env.NODE_ENV === "production";

let blogCache: BlogPost[] | null = null;
let labCache: LabPost[] | null = null;

export function getBlogPosts(): BlogPost[] {
  if (blogCache && SHOULD_CACHE) return blogCache;

  const posts = listFiles("blog")
    .map((file) => parseFile("blog", file, blogFrontmatterSchema))
    .filter(isVisible)
    .sort(byNewestFirst);

  blogCache = posts;
  return posts;
}

export function getLabPosts(): LabPost[] {
  if (labCache && SHOULD_CACHE) return labCache;

  const posts = listFiles("labs")
    .map((file) => parseFile("labs", file, labFrontmatterSchema))
    .filter(isVisible)
    .sort(byNewestFirst);

  labCache = posts;
  return posts;
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return getBlogPosts().find((post) => post.slug === slug);
}

export function getLabPost(slug: string): LabPost | undefined {
  return getLabPosts().find((post) => post.slug === slug);
}

/**
 * What the RSS feed (and so dev.to's importer) is allowed to pick up: published
 * Markdown that dev.to doesn't have yet. MDX can't render there, and anything
 * with a `devto_id` already exists there — including every migrated post —
 * so re-offering it would create a duplicate draft.
 */
export function isSyndicatable(post: BlogPost): boolean {
  return (
    post.format === "md" &&
    !post.frontmatter.draft &&
    post.frontmatter.devto_id === null
  );
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  const tags = new Set(post.frontmatter.tags);
  return getBlogPosts()
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({
      candidate,
      overlap: candidate.frontmatter.tags.filter((tag) => tags.has(tag)).length,
    }))
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

export function formatPostDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
