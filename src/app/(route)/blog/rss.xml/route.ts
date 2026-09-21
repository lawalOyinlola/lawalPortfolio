import { BRAND } from "@/app/constants/brand";
import {
  ASSET_ORIGIN,
  getBlogPosts,
  isSyndicatable,
  toAbsoluteAssetUrl,
} from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";

/**
 * Full-content RSS feed.
 *
 * dev.to's RSS importer reads <content:encoded> to build the article body and
 * fetches every image by URL, so image paths must be absolute here — a relative
 * path resolves against dev.to and 404s.
 *
 * Only posts dev.to does not already have are included; see isSyndicatable().
 */

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Root-relative URLs have to be absolute in the feed. Assets and pages can sit
 * on different origins: ASSET_ORIGIN may point at a CDN later, while a link to
 * /projects/... must still resolve to the site itself. Protocol-relative URLs
 * (//host/path) are already absolute and are left alone.
 */
function absolutifyHtml(html: string): string {
  return html
    .replace(/src="\/(?!\/)/g, `src="${ASSET_ORIGIN}/`)
    .replace(/href="\/(?!\/)/g, `href="${BRAND.url}/`);
}

/**
 * The enclosure has to declare the cover's real type: covers are .jpg as often
 * as .png, and a reader that trusts a wrong type may refuse to render it.
 */
const MIME_BY_EXTENSION: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
};

function imageMimeType(url: string): string {
  const filename = url.split(/[?#]/)[0];
  const extension = filename.slice(filename.lastIndexOf(".") + 1).toLowerCase();
  return MIME_BY_EXTENSION[extension] ?? "application/octet-stream";
}

/**
 * A literal "]]>" in a post (a code sample about XML, say) would close the
 * CDATA section early and break the feed. Splitting it across two sections
 * keeps the HTML byte-for-byte identical once a reader unwraps it.
 */
function toCdata(html: string): string {
  return `<![CDATA[${html.replace(/\]\]>/g, "]]]]><![CDATA[>")}]]>`;
}

export const dynamic = "force-static";

export async function GET() {
  const posts = getBlogPosts().filter(isSyndicatable);

  const items = await Promise.all(
    posts.map(async (post) => {
      const { html } = await renderMarkdown(post.body);
      const url = `${BRAND.url}/blog/${post.slug}`;
      const { title, description, date, tags, cover } = post.frontmatter;

      return [
        "    <item>",
        `      <title>${escapeXml(title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${date.toUTCString()}</pubDate>`,
        `      <description>${escapeXml(description)}</description>`,
        cover
          ? `      <enclosure url="${escapeXml(toAbsoluteAssetUrl(cover))}" type="${imageMimeType(cover)}" />`
          : "",
        ...tags.map((tag) => `      <category>${escapeXml(tag)}</category>`),
        `      <content:encoded>${toCdata(absolutifyHtml(html))}</content:encoded>`,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    }),
  );

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${BRAND.name} | Blog`)}</title>
    <link>${BRAND.url}/blog</link>
    <description>${escapeXml(BRAND.description)}</description>
    <language>en</language>
    <atom:link href="${BRAND.url}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items.join("\n")}
  </channel>
</rss>
`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
