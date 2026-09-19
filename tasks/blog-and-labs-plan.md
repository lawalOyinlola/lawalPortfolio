# Blog + Cybersecurity Labs — Plan & Execution Checklist

Status: Phase 1 complete, Phase 3 scaffolded — awaiting real content · Created 2026-09-18 · Owner: Lawal

**Merged with the `Blog architecture — handoff` doc from the earlier session (2026-09-18).**
Where the two disagreed, the handoff wins on content format, frontmatter and image paths;
this doc wins on sequencing. Deltas are marked **[handoff]** below.

**Decisions taken (2026-09-18):**
- **Positioning:** defer. Build `/labs` as a standalone route with **no nav or brand-string
  changes**. Revisit once a few real writeups are live. (§3a stays open.)
- **dev.to sync:** RSS first (§4 Option A). Write API is a later upgrade, not Phase 1 work.
- **Authoring flow is the actual goal:** drop a Markdown file in `content/`, get a styled
  page on the portfolio, have it ship to dev.to. Everything else serves that.
- **[handoff] Default format is plain `.md`, not MDX.** MDX is opt-in, per file, and only
  for posts that will never be syndicated. See §2a.
- **[handoff] Own domain is canonical; dev.to is syndication, never a second home.**
  Hashnode rejected (pricing/maintenance concerns raised in the handoff — not re-verified
  here, and moot since it's out of scope).
- **[handoff] Sequencing changed:** the first post and its four diagrams already exist, so
  blog ships before labs. The pipeline is shared either way. See §6.

Scope: add a `/labs` section (cybersecurity writeups, authored in Markdown) and a `/blog`
section (migrated from dev.to, future posts authored here and synced out to dev.to).
Hashnode is out of scope by decision.

---

## 1. Recommendation summary

**Build it, don't template it — but build it on a content pipeline, not on hand-written pages.**

Three reasons the template/CMS route is wrong for this repo specifically:

1. The site has a strong, opinionated design language (PPMori, GSAP, `Preloader`,
   `TargetCursor`, `smokey-cursor-effect`, the rounded-footer-reveal z-index trick).
   A Tailwind blog starter arrives with its own layout assumptions; you'd spend longer
   deleting its design than writing the ~6 components you actually need
   (`Prose`, `CodeBlock`, `Callout`, `TOC`, `PostCard`, `PostHero`).
2. A headless CMS (Sanity / Contentful / Payload) adds an API key, a runtime fetch,
   webhook revalidation, and a second system that can break your build. It earns its
   keep when a non-developer writes the posts. Here the author is you, in an editor,
   next to the code.
3. Markdown files in git are the only source format that makes the dev.to sync cheap.
   Whatever you choose, you end up needing `.md` — so start there.

**What "build it" actually means:** ~80 lines in `src/lib/content.ts` + MDX rendering in
a server component. Not a from-scratch blog engine.

Rejected, with the one-line reason:

| Option | Verdict |
|---|---|
| `@next/mdx` file-based routes (`app/blog/post/page.mdx`) | Fine for 3 pages; painful for listing, filtering, tags, RSS — metadata lives outside the file system index. |
| `velite` / `content-collections` | Nice typed DX, but adds a build plugin and Turbopack-compat risk (Next 16 builds with Turbopack) for something you get in 80 lines. |
| Headless CMS | Second system, API keys, revalidation webhooks. Only if a non-dev writes posts. |
| dev.to / Hashnode as source, pulled via API | Your own domain then depends on their uptime, and you don't own rendering or SEO. |
| Blog template repo | Design fight, see above. |

**Escape hatch:** if you later want to write from your phone with a real editor, add
**Keystatic** or **TinaCMS** on top of the *same* MDX files. Both are git-backed, so that
is an addition, not a migration.

---

## 2. Architecture

```
content/
  labs/
    htb-<machine>.md
  blog/
    <slug>.md
public/
  images/blog/<slug>/*.{svg,png}    # [handoff] path — assets already produced against it
  images/labs/<slug>/*.{svg,png}
src/
  lib/
    content.ts          # read + parse + validate frontmatter, cached
    mdx-components.tsx  # the component map MDX renders into
  app/(route)/
    labs/page.tsx
    labs/[slug]/page.tsx
    labs/[slug]/opengraph-image.tsx
    blog/page.tsx
    blog/[slug]/page.tsx
    blog/[slug]/opengraph-image.tsx
    blog/rss.xml/route.ts
  components/
    content/            # Prose, CodeBlock, Callout, Toc, PostCard, TagPill, Terminal
```

Content lives at the repo root (`content/`), not under `src/` — it's data, not code, and
keeping it out of `src/` keeps it out of the TS module graph and makes the dev.to sync
script's glob obvious.

### 2a. Format: `.md` by default, `.mdx` by exception — **[handoff, adopted]**

The handoff is right and it's a better rule than the "MDX-lite" one this doc originally
carried. A post written in MDX has to be hand-rewritten into Markdown every time it's
syndicated, which defeats the purpose of having one source file. So:

- **`.md`** → rendered through `remark` → `remark-rehype` → `rehype` → HTML. Syndicates
  byte-for-byte. This is the default for everything.
- **`.mdx`** → rendered through `next-mdx-remote/rsc`, JSX allowed, `syncToDevto` forced
  to `false` by the loader. For site-only pieces — interactive lab walkthroughs, anything
  with a custom component.

`src/lib/content.ts` picks the renderer from the file extension. Both share the same
rehype plugin chain (`rehype-slug`, `rehype-autolink-headings`, `rehype-pretty-code`), so
they render identically; only the parser differs.

This also removes a real failure mode: plain Markdown is *not* always valid MDX. A stray
`{` or `<` in prose compiles fine as Markdown and throws as MDX. Routing `.md` through
remark means an imported dev.to post can never break the build on a brace.

### 2b. Frontmatter — **[handoff shape, adopted]**

Snake_case, dev.to-aligned, so the sync script maps fields with as little translation as
possible. This supersedes the camelCase shape drafted below in the original version of
this doc:

```yaml
---
title: Ethical hacking: the mindset, the method and the styles
description: A plain explanation of the three hats, the seven stages...
date: 2026-09-10
tags: [ethical-hacking, penetration-testing, cybersecurity, appsec]
cover: /images/blog/ethical-hacking-mindset-method-styles/01-permission-line.png
devto_id: null            # filled after first sync — presence switches POST to PUT
devto_published: false
draft: false
---
```

Labs add: `platform`, `target`, `difficulty`, `os`, `categories[]`, `tools[]`, `cves[]`,
`skills[]`, `status` (see §3b). Labs default to `devto_published: false`.

**Dependencies to add** (all verified current as of writing):

```
next-mdx-remote@6      # has an /rsc export — renders MDX inside a server component
gray-matter@4          # frontmatter parsing
remark-gfm@4           # tables, strikethrough, task lists
rehype-slug@6          # heading ids
rehype-autolink-headings
rehype-pretty-code@0.14 + shiki@4   # build-time syntax highlighting, no client JS
reading-time@1.5
zod                    # frontmatter schema — a bad post fails the build, not the page
```

Everything renders at build time via `generateStaticParams`, exactly like
`projects/[slug]/page.tsx` does today. No client JS added to the critical path.

**Lab frontmatter** (blog frontmatter is §2b):
```yaml
title, slug, description, publishedAt
platform: HackTheBox | TryHackMe | PortSwigger | PentesterLab | Self-hosted
target: "Machine/room name"
difficulty: Easy | Medium | Hard | Insane
os: Linux | Windows | Web | N/A
categories: [web, active-directory, forensics, crypto, privesc, recon]
tools: [nmap, burpsuite, ffuf, bloodhound]
cves: ["CVE-2021-44228"]
skills: ["SQLi", "Kerberoasting"]
status: retired | free-room | own-lab       # gate, see §3b
devto_published: false                      # default off for labs
```

---

## 3. Two things to decide before writing code

**a. Positioning.** Your brand string is *"Frontend Engineer & UI Architect"* and
`BRAND.keywords` / the `Person` JSON-LD `knowsAbout` are all frontend. Adding a security
section changes how a recruiter reads the site. Pick one deliberately:
- *Secondary interest* — `/labs` linked in the footer and from `/about`, not in the main nav.
- *Co-equal pillar* — `/labs` in `MenuOverlay` `NAV_LINKS`, `knowsAbout` extended with
  security terms, `BRAND.title` revisited, hero copy revisited.

The engineering is identical; only nav + JSON-LD + copy differ. But decide now, because
retrofitting a positioning change touches `brand.ts`, `JsonLd.tsx`, hero, about and llms.txt.

**b. Publication ethics — this is a real constraint, not a formality.**
- HackTheBox forbids public writeups for **active** machines; retired machines are fine.
  The `status` frontmatter field exists to enforce this — make the build fail on
  `status: active`.
- TryHackMe: writeups are generally fine, but respect per-room "no writeup" notices.
- Never publish flags. If you want to show one, show it redacted (`HTB{r3d4ct3d}`).
- Scrub real IPs, hostnames, creds and client names from anything not an intentionally
  vulnerable box. `10.10.x.x` lab IPs are fine; a client's IP is not.
- Anything touching a real engagement needs written authorization referenced in the post
  or it doesn't go up.

---

## 4. dev.to strategy

**Principle: your domain is canonical.** dev.to is distribution. Every synced article
carries `canonical_url` pointing at `lawaloyinlola.com/blog/<slug>`, so search engines
credit your domain and you don't compete with yourself for your own words.

**Migration direction:** dev.to → here (one-time), then here → dev.to (ongoing).

**Do not delete the dev.to originals.** They hold backlinks and reach. Instead, after
migrating, **PATCH each existing dev.to article to set `canonical_url`** to its new home.
This is the step most people skip and it's the one that actually moves the SEO value.

**RSS vs the Write API — the one place this doc and the handoff disagree.**

You chose RSS-first; the handoff argues for the Write API + GitHub Action. Both are
defensible, and the honest split is by post type, not by preference:

- RSS gives you **no control over `cover_image`, tags or inline image handling** — dev.to
  parses what the feed gives it. For a text-heavy post that's fine. **Your first post is
  not text-heavy**: it has four diagrams and a designated cover. RSS will likely make a
  mess of exactly that post.
- The Write API sets `cover_image`, `tags`, `series` and `canonical_url` explicitly, and
  `devto_id` makes re-runs update instead of duplicate.

**Recommendation, revised:** ship post #1 to dev.to **by hand** (paste the Markdown, set
the canonical field, attach the cover) — it's ten minutes and you get the images right.
Stand up RSS in parallel for the text-only posts that follow. Build the Write API script
when the diagram-heavy posts become routine rather than exceptional. The handoff says the
same thing in its open items: *"Action is the end state, but manual is fine to ship the
first post."*

**A constraint both docs agree on:** dev.to fetches images **by URL**, it does not accept
uploads. So the images must already be live at `https://lawaloyinlola.com/images/blog/...`
before any sync runs. Relative paths will not resolve. This means **deploy the portfolio
post first, syndicate second** — always, in that order, whichever mechanism you use.

**Ongoing sync — two options, do them in this order:**

- **Option A — RSS (start here, for text-led posts).** Add `/blog/rss.xml`, then dev.to → Settings →
  Extensions → *Publishing to DEV Community from RSS*: paste the feed URL and tick the
  option that marks your site as canonical. dev.to pulls new posts in as **drafts** you
  review and publish. Zero code, zero secrets, reversible, and it forces a human check
  before anything appears under your name.

- **Option B — Write API (upgrade later, when the cadence justifies it).** A GitHub
  Action on push to `main` diffs `content/blog/*.mdx` and calls the dev.to API:
  `POST /api/articles` to create, `PUT /api/articles/{id}` to update, with header
  `api-key: ${{ secrets.DEVTO_API_KEY }}`. The returned article id is written back into
  the file's `devtoId` frontmatter and committed, which is what makes re-runs idempotent
  instead of duplicating. Throttle the loop — dev.to rate-limits article writes hard.
  Confirm exact endpoints and limits against the current dev.to API docs at build time;
  they have changed before.

**The format mismatch to design around:** dev.to renders Markdown + Liquid tags, **not
MDX/JSX**. Any custom React component in a post will be dropped or rendered as garbage
over there. Rule: posts flagged `syncToDevto: true` stay "MDX-lite" — standard Markdown
plus components that degrade to nothing important. Keep the expressive JSX for `/labs`,
which doesn't sync.

---

## 5. Execution checklist

### Phase 0 — Decisions & prep
- [x] Positioning (§3a): **deferred** — standalone `/labs`, no nav/brand changes yet
- [x] Sync approach: **RSS first**, Write API deferred
- [ ] Confirm route name `/labs` (vs `/writeups` / `/security`) — defaulting to `/labs`
- [x] Labs sit outside `/projects` — different intent, different metadata
- [ ] Generate a dev.to API key (dev.to → Settings → Extensions → DEV Community API Keys); store in `.env.local`, never committed (`.env*` is already gitignored ✅)
- [ ] Inventory the dev.to posts worth migrating (all vs a curated subset)

### Phase 1 — Content layer (shared by labs + blog)
- [x] Installed (pnpm — `node_modules` is pnpm-built, despite both lockfiles being committed): `gray-matter unified remark-parse remark-gfm remark-rehype rehype-raw rehype-slug rehype-autolink-headings rehype-pretty-code shiki rehype-stringify unist-util-visit @types/hast reading-time zod`
- [ ] `next-mdx-remote` — deliberately **not** installed; add only when a `.mdx` post actually exists
- [x] `src/lib/content.ts` — loaders, tag index, related posts, `isSyndicatable()`, drafts excluded in production, cache disabled in dev
- [x] `.md` → unified/remark chain. `.mdx` branch is stubbed via `isSyndicatable()` (format-gated) but the MDX renderer itself is not wired yet — no `.mdx` post exists to justify it
- [x] Zod schemas for both shapes; invalid frontmatter throws with the file and field named
- [x] `src/lib/markdown.ts` — remark/rehype chain, dual shiki themes, TOC collection, `metastring` preservation across `rehype-raw`
- [x] `src/components/content/` — `Prose`, `CodeCopyButtons`, `TableOfContents`, `PostCard`, `ArticleJsonLd`. Code titles + line highlight come from `rehype-pretty-code`, so no `CodeBlock` component was needed
- [ ] `Callout` / `Terminal` components — deferred until a real post needs them
- [x] Prose styles hand-rolled in `globals.css` against the existing tokens. **Light mode only in practice**: no `ThemeProvider` is mounted, so `.dark` is never applied anywhere on the site today. The shiki dark palette is wired to that same `.dark` class and will switch the moment a theme toggle lands
- [x] Fixture `pipeline-check.md` (since deleted) rendered: heading ids + anchors, TOC, shiki dual-theme tokens, code titles, line highlight, tables, inline code. Content is in the server-rendered HTML; the preloader hides via CSS opacity rather than conditional rendering, so nothing is gated behind hydration
- [x] Flag guard tested both ways: `HTB{r3d4ct3d}` passes, a real-looking flag fails the render/build
- [x] `rehype-raw` is in the chain, so inline `<svg>` in Markdown renders. Not yet exercised against a real diagram

### Phase 2 — Labs section  ← **runs after Phase 3 now**
- [ ] `/labs` index: grid of `LabCard`s + filters (platform, difficulty, category) — filters as URL search params so they're linkable and SSR-friendly
- [ ] `/labs/[slug]` with `generateStaticParams` + `generateMetadata` (mirror the pattern in `projects/[slug]/page.tsx`)
- [ ] Lab hero: platform badge, difficulty, OS, tools, date, reading time
- [ ] `TechArticle` JSON-LD in `<head>` (never the body — see the React 19 hoisting note in `PORTFOLIO_SYNC.md`)
- [ ] Build-time guard: fail on `status: active` or on a flag-shaped string in the body
- [ ] Port your first 2–3 real labs from `.md` to `content/labs/*.mdx`
- [ ] Add `/labs` + each lab to `sitemap.ts`
- [ ] ~~Link from nav per §3a~~ — deferred by decision; reachable by URL + a footer link only

### Phase 3 — Blog section  ← **ships first, see §6**
- [ ] **Recover the produced assets from the earlier session** — `ethical-hacking-mindset-method-styles.md`, four SVGs + PNG renders. They are not in this repo or on this machine; nothing downstream can start without them
- [ ] Place: post → `content/blog/ethical-hacking-mindset-method-styles.md`, art → `public/images/blog/ethical-hacking-mindset-method-styles/` (SVG for the site, PNG for dev.to)
- [x] `/blog` index (no tag filter — pointless under ~10 posts; tag archives stay in Phase 8)
- [x] `/blog/[slug]` — static, TOC sidebar, cover, related posts, dev.to backlink when `devto_id` is set
- [x] `alternates: { canonical: \`${BRAND.url}/blog/${slug}\` }` in `generateMetadata` — **[handoff]** belt-and-braces if a dev.to-side canonical is ever missed (same pattern as `projects/[slug]/page.tsx`)
- [x] `BlogPosting` JSON-LD (`ArticleJsonLd`, also does `TechArticle` for labs)
- [ ] Per-post OG images via `opengraph-image.tsx` (`next/og` `ImageResponse`) — title + tag + your mark
- [ ] Related posts (shared tags) + prev/next
- [x] `/blog/rss.xml` — full `content:encoded`, absolute image URLs, gated on `devto_published`
- [x] `/blog` + posts in `sitemap.ts`, posts using their own `date`/`updated`

### Phase 4 — Import from dev.to
- [x] **Migrated by hand (2026-09-19)** — both dev.to posts that exist, verified against the public API:
  - `what-my-waf-actually-blocked.md` — dev.to `4651595`, images in `public/images/blog/what-my-waf-actually-blocked/` (SVG inline)
  - `ethical-hacking-is-not-a-toolset.md` — dev.to `4625357`, images in `public/images/blog/ethical-hacking-is-not-a-toolset/` (PNG only)
- [x] Convention: image folder name = post slug = filename
- [x] Dead code removed: fixture post, `getBlogTags`, `absolutifyImages`. Lab loaders kept for Phase 2
- [x] Syndication gate changed: RSS now offers any published `.md` post **without** a `devto_id`, so migrated posts can never be re-imported as duplicate drafts. `devto_published` is status only, per the handoff
- [ ] `scripts/import-devto.ts`: `GET https://dev.to/api/articles/me/all?per_page=100&page=N` with the `api-key` header, paginate to exhaustion
- [ ] Map each article → `content/blog/<slug>.mdx`: `body_markdown` as body; title/description/tags/cover/published_at into frontmatter; record `devtoId`
- [ ] Download `cover_image` and inline images to `public/blog/<slug>/`, rewrite the URLs
- [ ] Convert dev.to Liquid embeds (`{% embed %}`, `{% youtube %}`, `{% link %}`) into your own components or plain links — flag anything the script can't map instead of silently dropping it
- [ ] Review every imported post by hand (this is content, not a data migration — read it)
- [ ] Decide per post: publish, keep as draft, or retire

### Phase 5 — Reclaim canonical
- [ ] After the portfolio deploys — not before, a canonical pointing at a 404 is worse than none — set each dev.to copy's canonical (editor → ⋯ → Canonical URL):
  - [ ] WAF post → `https://lawaloyinlola.com/blog/what-my-waf-actually-blocked`
  - [ ] Ethical hacking post → `https://lawaloyinlola.com/blog/ethical-hacking-is-not-a-toolset`
- [ ] `scripts/set-devto-canonical.ts`: for each imported article, `PUT /api/articles/{id}` setting `canonical_url` to `https://lawaloyinlola.com/blog/<slug>`
- [ ] Dry-run mode first, printing the diff; only then write
- [ ] Spot-check 3 articles on dev.to for the "Originally published at" line
- [ ] Submit the new sitemap in Google Search Console and request indexing for the blog index

### Phase 6 — Forward sync
- [ ] **Post #1: deploy to the portfolio first**, confirm images resolve at absolute URLs, *then* hand-post to dev.to with the canonical field set and the PNG cover attached
- [ ] **Option A:** enable dev.to RSS publishing against `/blog/rss.xml`, canonical box ticked — for the text-led posts that follow
- [ ] Publish one new post end-to-end and verify it lands on dev.to as a draft with the right canonical
- [ ] (Later) Option B: `scripts/sync-devto.ts` + `.github/workflows/devto-sync.yml` on push to `main`
- [ ] (Later) Write `devtoId` back into frontmatter and commit, so re-runs update instead of duplicating
- [ ] (Later) `DEVTO_API_KEY` as a repo secret; least-privilege; never echoed in CI logs

### Phase 7 — SEO / AEO
- [ ] Extend `sitemap.ts` with both collections, using each post's `updatedAt` (not `new Date()` — keep the stable-date discipline already in the file)
- [ ] Update `/llms.txt` and `/llms-full.txt` routes to list posts and labs
- [ ] ~~Extend `BRAND.keywords` / `knowsAbout`~~ — deferred with the positioning decision
- [ ] Verify raw HTML contains post body text (`view-source:`), per the preloader caveat
- [ ] Lighthouse pass on `/blog`, `/blog/[slug]`, `/labs/[slug]`

### Phase 8 — Polish (optional)
- [ ] Client-side search over a prebuilt JSON index
- [ ] Tag archive pages `/blog/tags/[tag]`
- [x] Sticky TOC with scroll-spy (`aria-current`), auto-scrolls its own list, smooth-scroll on click (2026-09-19)
- [x] Per-tag colours (`src/lib/tag-colors.ts`, all ≥ 4.5:1 on white); first tag = per-post accent
- [x] Click/keyboard image zoom on native `<dialog>`
- [ ] Reading progress bar
- [ ] View Transitions between index and post
- [ ] Series support for multi-part labs

---

## 6. Order of work — **revised after the handoff**

Originally: labs first. Revised: **blog first**, because the handoff surfaced that a
finished post and four finished diagrams are already sitting there waiting for somewhere
to live. Shipping them validates the pipeline against real content instead of a fixture,
and it's the shortest path to something publicly visible.

1. **Phase 1** — content layer (shared; this is the bulk of the work)
2. **Phase 3** — `/blog` + the ethical-hacking post live on the portfolio
3. **Phase 6, partial** — hand-syndicate post #1 to dev.to, canonical set
4. **Phase 2** — `/labs`, which by then is mostly a second index + a richer card
5. **Phase 4–5** — import the dev.to back catalogue, then reclaim canonical on the originals
6. **Phase 6, rest** — RSS, and later the Write API
7. **Phase 7–8** — SEO sweep, polish

Labs and blog share ~90% of the pipeline, so the ordering costs nothing either way — it
only decides which one you get to look at first.

The ethical-hacking series is itself the bridge: post #2 is "the lab", which is the natural
first `/labs` entry and the point where the two sections start feeding each other.

## 7. Open questions
- [ ] **Where do the produced assets live?** They're not in this repo or under
      `~/Projects`, `~/Downloads`, `~/Desktop` or `~/Documents`. Re-export them from the
      earlier session before Phase 3.
- [ ] Image hosting long-term: `/public` on the Vercel deploy vs a CDN/bucket
      **[handoff open item]**. `/public` is right until you have enough posts that the
      repo size or deploy time complains — which is a long way off. Defaulting to
      `/public`; revisit at ~30 posts.
- [ ] How many dev.to posts are there, and are they all worth carrying over?
- [ ] Do you want labs to show a "skills demonstrated" summary that feeds a future
      security résumé section?
- [ ] Comments on posts? (Adds a third-party embed or a backend — triggers a security review.)


---

## 8. The authoring loop this produces

Once Phase 1–3 and 6 are done, publishing is:

1. `content/blog/my-post.md` (or `content/labs/htb-boxname.md`) — frontmatter block, then Markdown.
2. Commit and push. `next build` validates the frontmatter against the zod schema and fails
   the build if it's malformed, so a broken post never reaches production.
3. The page exists at `/blog/my-post`, appears on the index, in `sitemap.xml`, in `rss.xml`
   and in `llms.txt` — no page file written, no route registered, no data file edited.
4. dev.to's RSS reader picks it up on its next poll and creates a **draft** over there with
   your site marked canonical. You review, fix the cover if RSS mangled it, and publish.

Setting `draft: true` keeps a post visible in `next dev` and out of production.
Setting `devto_published: false` keeps it out of the RSS feed and off dev.to entirely —
the default for labs and for any `.mdx` file.

Note the ordering constraint from §4: **the portfolio deploys first, syndication second**,
because dev.to fetches images by absolute URL and they have to already be live.
