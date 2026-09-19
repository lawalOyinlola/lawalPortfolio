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
 * Only posts with `devto_published: true` are included; see isSyndicatable().
 */

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function absolutifyHtml(html: string): string {
  return html.replace(/(src|href)="\/(?!\/)/g, `$1="${ASSET_ORIGIN}/`);
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
          ? `      <enclosure url="${escapeXml(toAbsoluteAssetUrl(cover))}" type="image/png" />`
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
