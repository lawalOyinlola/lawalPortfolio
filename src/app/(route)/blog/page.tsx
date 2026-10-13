import type { Metadata } from "next";
import { BRAND } from "@/app/constants";
import { getBlogPosts, toPostSummaries } from "@/lib/content";
import { RssSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import BlogExplorer from "@/components/content/BlogExplorer";
import ContactsRef from "@/components/ContactsRef";
import { SectionHeader } from "@/components/ui/SectionHeader";

const title = "Blog";
const description = `Writing by ${BRAND.name} on frontend engineering, performance, accessibility and security, and the reasoning behind the work rather than just the result.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/blog",
    types: {
      "application/rss+xml": `${BRAND.url}/blog/rss.xml`,
    },
  },
  openGraph: {
    type: "website",
    url: `${BRAND.url}/blog`,
    title: `${BRAND.name} | ${title}`,
    description,
    siteName: BRAND.name,
    images: [
      {
        url: BRAND.ogImage,
        width: 1200,
        height: 630,
        alt: `${BRAND.name} - ${title}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} | ${title}`,
    description,
    images: [BRAND.ogImage],
    creator: BRAND.socials.twitter.username,
  },
};

export default function BlogPage() {
  const allPosts = getBlogPosts();
  const posts = toPostSummaries(allPosts);
  // Looked up by slug rather than taken as posts[0]: a featured post is
  // pinned above newer ones.
  const newest = posts.find((post) => post.slug === allPosts[0]?.slug);

  return (
    <article className="min-h-screen relative bg-background z-1">
      <div className="h-24 md:h-32" aria-hidden />

      <div className="wrapper mx-auto">
        <header className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            as="h1"
            subtitle="Writing"
            title="Blog"
            description="Notes on what I build and break: frontend engineering, performance, accessibility, and the security side of the craft. Posts live here first and are syndicated elsewhere."
            descriptionClassName="max-w-[58ch] text-muted-foreground"
            className="max-w-2xl"
          />
          {newest && (
            <div className="flex shrink-0 flex-col gap-4 border-t border-border/40 pt-5 md:mb-3 md:items-end md:border-t-0 md:pt-0">
              <dl className="flex gap-10 text-[11px] uppercase tracking-widest md:text-right">
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">Posts</dt>
                  <dd className="font-mono text-sm tabular-nums text-primary">
                    {String(posts.length).padStart(2, "0")}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">Last published</dt>
                  <dd className="text-sm text-primary">
                    <time dateTime={newest.dateISO}>{newest.dateLabel}</time>
                  </dd>
                </div>
              </dl>
              <a
                href="/blog/rss.xml"
                className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
              >
                <RssSimpleIcon weight="bold" aria-hidden className="size-3.5" />
                RSS feed
              </a>
            </div>
          )}
        </header>

        {posts.length === 0 ? (
          <p className="mt-16 text-sm text-muted-foreground">
            First post is on its way.
          </p>
        ) : (
          <BlogExplorer posts={posts} />
        )}
      </div>

      <div className="relative bg-background z-10 w-full rounded-b-[2rem] md:rounded-b-[4rem] overflow-hidden">
        <ContactsRef />
      </div>
    </article>
  );
}
