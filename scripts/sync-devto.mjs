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
 * Needs DEVTO_API_KEY, read from the environment or from .env.local / .env
 * in the project root. Generate one at dev.to: Settings, Extensions, DEV
 * Community API Keys. Those files are gitignored; never commit the key.
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

// `--only` with nothing after it used to fall through to null, which meant it
// quietly synced every post instead of the one that was asked for.
let only = null;
if (args.includes("--only")) {
  const next = args[args.indexOf("--only") + 1];
  if (!next || next.startsWith("--")) {
    console.error("--only needs a slug, for example --only my-post.");
    process.exit(1);
  }
  only = next;
}

/**
 * An exported variable wins, so CI can inject the key without a file. Failing
 * to load a file is not an error: most of the time there simply is not one.
 */
function readApiKey() {
  if (process.env.DEVTO_API_KEY) return process.env.DEVTO_API_KEY;
  for (const file of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(path.join(process.cwd(), file));
    } catch {
      continue;
    }
    if (process.env.DEVTO_API_KEY) return process.env.DEVTO_API_KEY;
  }
  return null;
}

const apiKey = readApiKey();
if (!apiKey && !dryRun) {
  console.error(
    "DEVTO_API_KEY is not set.\n" +
      "Add it to .env.local as DEVTO_API_KEY=... , export it, or pass\n" +
      "--dry-run to preview without calling dev.to.",
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
    // devto_published is the switch, not `draft`. A post can be live here
    // while it is still a draft over there, and publishing to someone else's
    // audience should be a deliberate edit rather than a side effect of a
    // sync run.
    published: fm.devto_published === true,
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
function writeBackSyncFields(file, { id, url, published }) {
  const raw = readFileSync(file, "utf8");
  const end = raw.indexOf("\n---", 3);
  if (!raw.startsWith("---") || end === -1) {
    throw new Error(`No frontmatter block in ${file}`);
  }
  let head = raw.slice(0, end);
  const rest = raw.slice(end);

  // These three are optional in the schema, so a hand-written post may not
  // have them at all. Replacing a line that is not there silently does
  // nothing, which would lose the id and create a duplicate on the next run.
  const set = (text, key, value) =>
    new RegExp(`^${key}:.*$`, "m").test(text)
      ? text.replace(new RegExp(`^${key}:.*$`, "m"), `${key}: ${value}`)
      : `${text.replace(/\s*$/, "")}\n${key}: ${value}`;

  head = set(head, "devto_id", id);
  head = set(head, "devto_url", url);
  head = set(head, "devto_published", published === true);

  writeFileSync(file, head + rest);
}

/**
 * tag_list comes back as an array from the listing and as a comma-separated
 * string from a single fetch. Normalise both.
 */
function remoteTags(remote) {
  const raw = remote.tag_list ?? remote.tags ?? [];
  const list = Array.isArray(raw) ? raw : raw.split(",");
  return list.map((t) => t.trim()).filter(Boolean);
}

/**
 * Everything the account owns, keyed by id.
 *
 * GET /articles/{id} is no use for this: it 404s for a draft, and it kept
 * 404ing for a post that had just been published even though the public page
 * was live. The me/all listing carries body_markdown for drafts and published
 * posts alike, and costs one request instead of one per post.
 */
async function fetchRemoteArticles() {
  const byId = new Map();
  for (let page = 1; page <= 10; page += 1) {
    const batch = await api(`/articles/me/all?per_page=100&page=${page}`);
    if (!batch?.length) break;
    for (const article of batch) byId.set(article.id, article);
    if (batch.length < 100) break;
  }
  return byId;
}

/**
 * dev.to serves the cover through its own image proxy, so the value that comes
 * back is never the URL that was sent. It does percent-encode the original
 * inside the proxy URL, though, so decoding it is enough to tell whether the
 * cover still points at the file the frontmatter names. Without this, swapping
 * a cover and changing nothing else reads as no change and never reaches
 * dev.to.
 */
function sameCover(local, remote) {
  const localCover = local.main_image ?? null;
  const remoteCover = remote.cover_image ?? null;
  if (!localCover && !remoteCover) return true;
  if (!localCover || !remoteCover) return false;
  let decoded = remoteCover;
  try {
    decoded = decodeURIComponent(remoteCover);
  } catch {
    /* a malformed URL just means compare it raw */
  }
  return decoded.includes(localCover);
}

function sameArticle(local, remote) {
  return (
    local.title === remote.title &&
    local.body_markdown.trim() === (remote.body_markdown ?? "").trim() &&
    local.description === remote.description &&
    sameCover(local, remote) &&
    local.tags.join(",") === remoteTags(remote).join(",") &&
    // The me/all listing does carry this, and without it flipping
    // devto_published to true would be read as no change and never publish.
    local.published === remote.published
  );
}

const files = readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith(".md"))
  .sort();

let created = 0;
let updated = 0;
let skipped = 0;

// One listing up front, so each post can be compared without a fetch of its
// own. A dry run still reads it when a key is available, because a preview
// that cannot tell a real change from a no-op is not worth much; without a
// key it falls back to listing everything as a would-update.
const remoteArticles = apiKey ? await fetchRemoteArticles() : new Map();

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
    const remote = remoteArticles.get(fm.devto_id) ?? null;
    if (remote && sameArticle(article, remote)) {
      console.log(`unchanged     ${slug}`);
      skipped += 1;
      continue;
    }
    if (dryRun) {
      console.log(`would update  ${slug} (id ${fm.devto_id})`);
      updated += 1;
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
    writeBackSyncFields(file, {
      id: result.id,
      url: result.url,
      published: result.published,
    });
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
