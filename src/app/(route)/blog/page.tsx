import type { Metadata } from "next";
import { BRAND } from "@/app/constants";
import { getBlogPosts, toPostSummaries } from "@/lib/content";
import { RssSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import BlogExplorer from "@/components/content/BlogExplorer";
import BlogTypewriter from "@/components/content/BlogTypewriter";
import ContactsRef from "@/components/ContactsRef";
import { SectionHeader } from "@/components/ui/SectionHeader";

const title = "Blog";
const description = `Writing by ${BRAND.name} on software and frontend engineering, performance, accessibility and security, and on the communication and leadership that hold technical work together.`;

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
        <header className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-2xl flex-col gap-6">
            <SectionHeader
              as="h1"
              subtitle="Writing"
              title="Blog"
              description="Notes on what I build, break and learn along the way. Software and frontend engineering, performance, accessibility and security, plus the parts of the job that never show up in a diff, like leading a team and explaining a technical decision to people who don't write code. Posts live here first and are syndicated elsewhere."
              descriptionClassName="max-w-[58ch] text-muted-foreground"
            />
            {newest && (
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                <span>
                  <span className="font-mono tabular-nums text-primary">
                    {String(posts.length).padStart(2, "0")}
                  </span>{" "}
                  posts
                </span>
                <span aria-hidden>·</span>
                <span>
                  Last published{" "}
                  <time dateTime={newest.dateISO} className="text-primary">
                    {newest.dateLabel}
                  </time>
                </span>
                <span aria-hidden>·</span>
                <a
                  href="/blog/rss.xml"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
                >
                  <RssSimpleIcon weight="bold" aria-hidden className="size-3.5" />
                  RSS feed
                </a>
              </p>
            )}
          </div>
          {/* Hidden on phones, where it would push the first post a screen
              further down; the posts are what this page is for. */}
          <BlogTypewriter className="hidden w-96 shrink-0 self-end md:block lg:w-lg xl:w-xl" />
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
