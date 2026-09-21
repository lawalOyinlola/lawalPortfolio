# Blogging

Posts are Markdown files in `content/blog/`. The filename is the URL slug:
`content/blog/my-post.md` becomes `/blog/my-post`.

These files are the single source of truth. The site renders them, and
`pnpm sync:devto` pushes them to dev.to. Nothing ever syncs back.

## What is automatic and what is not

| Step | How |
| --- | --- |
| Post appears on the site | **Automatic** on deploy |
| RSS feed, sitemap, llms.txt | **Automatic** on deploy |
| Post appears on dev.to | **Manual** — you run `pnpm sync:devto` |
| dev.to draft becomes public | **Manual** — you set `devto_published: true` |

Deploying never touches dev.to. Nothing is published to anyone else's
audience unless you run the sync yourself.

## One-time setup

Copy `.env.example` to `.env.local` and paste in a key from dev.to
(Settings → Extensions → DEV Community API Keys):

```
DEVTO_API_KEY=your_key_here
```

`.env.local` is gitignored. Never commit the key.

## Writing a new post

1. Create `content/blog/<slug>.md`:

```yaml
---
title: "The title, as it appears on the page"
description: "One or two sentences. Used for search results and social cards."
date: 2026-09-21
tags: [security, webdev]
cover: "/images/blog/<slug>/coverimage.jpg"
coverAlt: "What the cover image shows, for screen readers."
draft: false
devto_id: null
devto_published: false
---

Body starts here.
```

2. Put images in `public/images/blog/<slug>/` and reference them from the
   root: `![alt text](/images/blog/<slug>/diagram.png)`. The sync rewrites
   these to absolute URLs, because dev.to fetches every image by URL.

3. Check it locally, then commit and deploy:

```bash
pnpm dev          # http://localhost:3000/blog
git add content/blog/<slug>.md public/images/blog/<slug>
git commit -m "feat(blog): add <slug>"
```

4. Once the deploy is live, push it to dev.to:

```bash
pnpm sync:devto --dry-run   # says what would change, changes nothing
pnpm sync:devto
```

With `devto_published: false` it lands on dev.to **as a draft**. Review it
there, then set `devto_published: true` and run the sync again to publish.

5. The sync writes `devto_id` and `devto_url` back into the frontmatter.
   **Commit those.** That id is what turns the next sync into an update
   instead of a second copy, and it drops the post out of the RSS feed so
   dev.to cannot import a duplicate.

## Updating a post

Edit the Markdown, deploy, then:

```bash
pnpm sync:devto
```

Posts that have not changed are skipped, so re-running is free. Useful flags:

```bash
pnpm sync:devto --dry-run          # preview
pnpm sync:devto --only <slug>      # one post
```

Remember that the sync overwrites the dev.to copy. If you edited a post
directly on dev.to, those edits are lost. Edit here instead.

## Frontmatter reference

| Field | Meaning |
| --- | --- |
| `title`, `description` | Required. `description` is capped at 320 characters. |
| `date` | Publication date, `YYYY-MM-DD`. |
| `updated` | Optional. Shown as "Updated ..." on the post. |
| `tags` | Drives the accent colour and the index filters. dev.to takes the first four. |
| `cover`, `coverAlt` | Optional, but `coverAlt` is required whenever `cover` is set. Keep covers as `.jpg` or `.png`: the cover doubles as the social card, and WebP is unreliable in social scrapers. |
| `draft` | `true` keeps it off the live site and out of the sync. It still shows in `pnpm dev`, so you can preview it. |
| `devto_id` | `null` until synced; then the dev.to article id. Do not edit by hand. |
| `devto_url` | Written by the sync. Renders the "also published on dev.to" line. |
| `devto_published` | Your switch: `false` keeps the dev.to copy a draft, `true` publishes it. |

## Notes

- **Canonical URLs** are set automatically to your own site, so the dev.to
  copy can never outrank the original in search.
- **Flags are blocked.** A literal `HTB{...}` or `FLAG{...}` in a post fails
  the build on purpose. Redact it (`HTB{r3d4ct3d}`) and it passes.
- **Images live in the repo**, not on a CDN, so `public/` stays lean. Convert
  large screenshots before committing: `cwebp -q 85 -m 6 in.png -o out.webp`.
