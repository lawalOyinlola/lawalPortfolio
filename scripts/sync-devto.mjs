#!/usr/bin/env node
/**
 * Push the Markdown in content/blog to dev.to.
 *
 * The files here are the source of truth. A post without a devto_id is
 * created; a post with one is updated in place, which is the thing RSS cannot
 * do. After a create, the new id and URL are written back into the
 * frontmatter, which also drops the post out of the RSS feed so dev.to can
 * never import a duplicate of an article it already has.
 *
 *   node scripts/sync-devto.mjs --dry-run      # say what would change
 *   node scripts/sync-devto.mjs                # do it
 *   node scripts/sync-devto.mjs --only <slug>  # one post
 *
 * Needs DEV_API_KEY (dev.to: Settings, Extensions, DEV Community API Keys).
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";

const API = "https://dev.to/api";
const BLOG_DIR = path.join(process.cwd(), "content", "blog");

// Read the canonical origin from the same constant the site renders with,
// rather than keeping a second copy of it in sync by hand.
const BRAND_URL = (() => {
  const src = readFileSync(
    path.join(process.cwd(), "src", "app", "constants", "brand.ts"),
    "utf8",
  );
  const match = src.match(/url:\s*"([^"]+)"/);
  if (!match) throw new Error("Could not read BRAND.url from brand.ts");
  return match[1].replace(/\/$/, "");
})();

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const onlySlug = args[args.indexOf("--only") + 1] || null;
const only = args.includes("--only") ? onlySlug : null;

const apiKey = process.env.DEV_API_KEY;
if (!apiKey && !dryRun) {
  console.error(
    "DEV_API_KEY is not set. Export it, or pass --dry-run to preview.",
  );
  process.exit(1);
}

/** dev.to allows at most four tags, lowercase and alphanumeric. */
function normaliseTags(tags) {
  return tags
    .map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter(Boolean)
    .slice(0, 4);
}

/**
 * dev.to fetches every image by URL, so a root-relative path would resolve
 * against dev.to and 404. Same problem the RSS feed solves.
 */
function absolutify(markdown) {
  return markdown
    .replace(/(!\[[^\]]*\]\()\/(?!\/)/g, `$1${BRAND_URL}/`)
    .replace(/(\]\()\/(?!\/)/g, `$1${BRAND_URL}/`);
}

function buildArticle(fm, body, slug) {
  const article = {
    title: fm.title,
    body_markdown: absolutify(body).trim(),
    published: !fm.draft,
    canonical_url: `${BRAND_URL}/blog/${slug}`,
    description: fm.description,
    tags: normaliseTags(fm.tags ?? []),
  };
  if (fm.cover) article.main_image = `${BRAND_URL}${fm.cover}`;
  return article;
}

async function api(pathname, options = {}) {
  const res = await fetch(`${API}${pathname}`, {
    ...options,
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      accept: "application/vnd.forem.api-v1+json",
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 400)}`);
  }
  return text ? JSON.parse(text) : null;
}

/**
 * Rewrite only the three sync fields, line by line. Re-serialising the whole
 * frontmatter would reformat dates and quoting across every post.
 */
function writeBackSyncFields(file, { id, url }) {
  const raw = readFileSync(file, "utf8");
  const end = raw.indexOf("\n---", 3);
  if (!raw.startsWith("---") || end === -1) {
    throw new Error(`No frontmatter block in ${file}`);
  }
  let head = raw.slice(0, end);
  const rest = raw.slice(end);

  head = head.replace(/^devto_id:.*$/m, `devto_id: ${id}`);
  head = head.replace(/^devto_published:.*$/m, "devto_published: true");
  if (/^devto_url:/m.test(head)) {
    head = head.replace(/^devto_url:.*$/m, `devto_url: ${url}`);
  } else {
    head = head.replace(
      /^devto_id:.*$/m,
      (line) => `${line}\ndevto_url: ${url}`,
    );
  }
  writeFileSync(file, head + rest);
}

function sameArticle(local, remote) {
  return (
    local.title === remote.title &&
    local.body_markdown.trim() === (remote.body_markdown ?? "").trim() &&
    local.description === remote.description &&
    (local.main_image ?? null) === (remote.cover_image ?? null) &&
    local.tags.join(",") === (remote.tags ?? []).join(",")
  );
}

const files = readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith(".md"))
  .sort();

let created = 0;
let updated = 0;
let skipped = 0;

for (const filename of files) {
  const slug = filename.replace(/\.md$/, "");
  if (only && slug !== only) continue;

  const file = path.join(BLOG_DIR, filename);
  const { data: fm, content: body } = matter(readFileSync(file, "utf8"));

  if (fm.draft) {
    console.log(`skip    ${slug} (draft)`);
    skipped += 1;
    continue;
  }

  const article = buildArticle(fm, body, slug);

  if (fm.devto_id) {
    if (dryRun) {
      console.log(`would update  ${slug} (id ${fm.devto_id})`);
      updated += 1;
      continue;
    }
    const remote = await api(`/articles/${fm.devto_id}`);
    if (sameArticle(article, remote)) {
      console.log(`unchanged     ${slug}`);
      skipped += 1;
      continue;
    }
    await api(`/articles/${fm.devto_id}`, {
      method: "PUT",
      body: JSON.stringify({ article }),
    });
    console.log(`updated       ${slug}`);
    updated += 1;
  } else {
    if (dryRun) {
      console.log(`would create  ${slug}`);
      created += 1;
      continue;
    }
    const result = await api("/articles", {
      method: "POST",
      body: JSON.stringify({ article }),
    });
    writeBackSyncFields(file, { id: result.id, url: result.url });
    console.log(`created       ${slug} -> ${result.url}`);
    created += 1;
  }

  // dev.to throttles article writes; a short pause keeps a multi-post run
  // well inside the limit.
  await new Promise((r) => setTimeout(r, 1500));
}

console.log(
  `\n${dryRun ? "Dry run. " : ""}created ${created}, updated ${updated}, skipped ${skipped}`,
);
if (created > 0 && !dryRun) {
  console.log("Frontmatter updated with the new ids: commit those changes.");
}
