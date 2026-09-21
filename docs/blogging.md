# Blogging

Posts are Markdown files in `content/blog/`. The filename is the URL slug, so
`content/blog/my-post.md` becomes `lawaloyinlola.com/blog/my-post`.

These files are the only source of truth. The site renders them, and
`pnpm sync:devto` pushes them to dev.to. Nothing ever syncs back from dev.to.

---

## The short version

**New post:** write the file → `git push` → wait for the deploy →
`pnpm sync:devto`. It lands on dev.to as a draft. Review it there, set
`devto_published: true`, run the sync again to publish.

**Editing a post:** edit the file → `git push` → wait for the deploy →
`pnpm sync:devto`. Done.

The site updates itself when you deploy. dev.to only ever changes when you run
that command.

---

## What is automatic and what is not

| Step | How |
| --- | --- |
| Post appears on your site | **Automatic** on deploy |
| RSS feed, sitemap, tag filters, reading time | **Automatic** on deploy |
| Post reaches dev.to | **Manual** — `pnpm sync:devto` |
| dev.to copy goes public | **Manual** — set `devto_published: true`, sync again |

Deploying never touches dev.to. Nothing is published to anyone else's audience
unless you run the command yourself.

---

## Setup, once

Copy `.env.example` to `.env.local` and paste in a key from dev.to
(Settings → Extensions → DEV Community API Keys):

```
DEVTO_API_KEY=your_key_here
```

`.env.local` is gitignored. Never commit the key. If one leaks, revoke it on
dev.to and generate another.

---

## Writing a new post

### 1. The file

Create `content/blog/<slug>.md`. **This is everything you write by hand:**

```yaml
---
title: "The title, as it appears on the page"
description: "One or two sentences. Used on the blog index, in search results and on social cards."
date: 2026-09-21
tags: [security, webdev]
cover: "/images/blog/<slug>/coverimage.jpg"
coverAlt: "What the cover image shows, for screen readers."
draft: false
devto_published: false
---

The post itself starts here, in normal Markdown.

## A heading

Headings become the "On this page" list automatically.
```

Yes — the frontmatter block between the two `---` lines, then the post body
below it. That is the whole file.

**You do not write `devto_id` or `devto_url`.** The sync fills those in for
you the first time it uploads the post. If you add them by hand with the wrong
value you will get a duplicate on dev.to.

Only `title`, `description` and `date` are strictly required. Everything else
has a sensible default, but include `tags` and `devto_published: false` anyway
so the file says what it means.

### 2. Images

Put them in `public/images/blog/<slug>/` and link from the root:

```markdown
![Alt text describing the image](/images/blog/<slug>/diagram.png)
```

The sync rewrites these to absolute URLs, because dev.to fetches every image
by URL and a root-relative path would resolve against dev.to and 404.

Convert large screenshots before committing so the repo stays lean:

```bash
cwebp -q 85 -m 6 screenshot.png -o screenshot.webp
```

Keep the **cover** as `.jpg` or `.png`. It doubles as the social preview
image, and WebP is unreliable in social scrapers.

### 3. Check it locally

```bash
pnpm dev     # http://localhost:3000/blog
```

Drafts (`draft: true`) show here but never on the live site.

### 4. Ship it

```bash
git add content/blog/<slug>.md public/images/blog/<slug>
git commit -m "feat(blog): add <slug>"
git push
```

Once Vercel has deployed, the post is live on your site.

### 5. Send it to dev.to

```bash
pnpm sync:devto --dry-run   # says what would change, changes nothing
pnpm sync:devto
```

Sync **after** the deploy, not before: dev.to fetches your images from your
live site, so they have to exist there first.

With `devto_published: false` it arrives on dev.to as a **draft**. Open it
there and check the cover and images rendered.

### 6. Publish on dev.to

Set `devto_published: true` in the frontmatter, then:

```bash
pnpm sync:devto
```

### 7. Commit what the sync wrote back

The sync adds `devto_id` and `devto_url` to your frontmatter. **Commit them.**

```bash
git add content/blog/<slug>.md
git commit -m "chore(blog): record the dev.to id for <slug>"
```

That id is what makes the next sync an *update* instead of a second copy, and
it drops the post out of the RSS feed so dev.to cannot import a duplicate.

---

## Editing a post that already exists

Edit the Markdown, push, wait for the deploy, then:

```bash
pnpm sync:devto
```

That is all. The script sees `devto_id` in the frontmatter and updates that
dev.to article in place. Posts that have not changed are skipped, so running
it costs nothing.

```bash
pnpm sync:devto --dry-run        # preview everything
pnpm sync:devto --only <slug>    # just one post
```

**The sync overwrites the dev.to copy.** If you edited a post directly in the
dev.to editor, those edits are lost on the next sync. Edit here instead.

---

## Frontmatter reference

### You write these

| Field | Meaning |
| --- | --- |
| `title` | Required. |
| `description` | Required, up to 320 characters. |
| `date` | Required. Publication date, `YYYY-MM-DD`. |
| `updated` | Optional. Shows as "Updated ..." on the post. |
| `tags` | Sets the accent colour and feeds the index filters. dev.to takes the first four. |
| `cover` | Optional. Also becomes the social card and the dev.to cover. |
| `coverAlt` | **Required whenever `cover` is set.** |
| `draft` | `true` keeps it off the live site and out of the sync. Still visible in `pnpm dev`. |
| `devto_published` | Your publish switch for dev.to. `false` = draft over there, `true` = public. |

### The sync writes these

| Field | Meaning |
| --- | --- |
| `devto_id` | The dev.to article id. Its presence turns the next sync into an update. |
| `devto_url` | Renders the "also published on dev.to" line on your post. |

---

## Good to know

- **Canonical URLs** point at your site automatically, so the dev.to copy can
  never outrank the original in search.
- **Flags are blocked on purpose.** A literal `HTB{...}` or `FLAG{...}` fails
  the build. Redact it (`HTB{r3d4ct3d}`) and it passes.
- **`pnpm sync:devto --dry-run` is always safe.** It only reads.

---

## Could this be automated?

Yes, with a GitHub Action that runs the sync on every push to `main`. It would
remove step 5 — you would push, and dev.to would catch up on its own.

What it would change:

- You would stop running anything locally. Push is the only action.
- The `DEVTO_API_KEY` would move into GitHub repository secrets, so your
  laptop would no longer need a copy.
- It would run whether or not you were paying attention, which is the point
  and also the risk: a typo merged to `main` reaches dev.to within a minute,
  with no chance to look at the draft first.
- `devto_published` would still gate publishing, so a new post would still land
  as a draft. Automation would not publish anything you had not marked.

It is worth doing once the manual command has been boring for a few posts.
Until then, running it yourself means you see the diff before anyone else does.
