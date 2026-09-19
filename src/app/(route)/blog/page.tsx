import type { Metadata } from "next";
import { BRAND } from "@/app/constants";
import { getBlogPosts } from "@/lib/content";
import PostCard from "@/components/content/PostCard";
import ContactsRef from "@/components/ContactsRef";

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
  const posts = getBlogPosts();

  return (
    <article className="min-h-screen relative bg-background z-1">
      <div className="h-24 md:h-32" aria-hidden />

      <div className="wrapper mx-auto">
        <header className="max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Writing
          </p>
          <h1 className="bold-title mt-1 text-primary">Blog</h1>
          <p className="mt-4 text-sm leading-loose text-muted-foreground">
            Notes on what I build and break: frontend engineering, performance,
            accessibility, and the security side of the craft. Posts live here first
            and are syndicated elsewhere.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="mt-16 text-sm text-muted-foreground">
            First post is on its way.
          </p>
        ) : (
          <div className="mt-16 flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>

      <div className="relative bg-background z-10 w-full rounded-b-[2rem] md:rounded-b-[4rem] overflow-hidden">
        <ContactsRef />
      </div>
    </article>
  );
}
