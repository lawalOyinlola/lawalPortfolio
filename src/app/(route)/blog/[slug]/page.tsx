import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BRAND } from "@/app/constants";
import {
  formatPostDate,
  getBlogPost,
  getBlogPosts,
  getRelatedPosts,
  toAbsoluteAssetUrl,
} from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import Prose from "@/components/content/Prose";
import TableOfContents from "@/components/content/TableOfContents";
import ArticleJsonLd from "@/components/content/ArticleJsonLd";
import TagPill from "@/components/content/TagPill";
import ContactsRef from "@/components/ContactsRef";
import { getTagColor } from "@/lib/tag-colors";

export async function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  const { title, description, date, updated, cover, coverAlt, tags } =
    post.frontmatter;
  const url = `${BRAND.url}/blog/${post.slug}`;
  const image = cover ? toAbsoluteAssetUrl(cover) : `${BRAND.url}${BRAND.ogImage}`;

  return {
    title,
    description,
    keywords: tags,
    // Belt and braces: even if a syndicated copy ever goes out without its
    // canonical_url set, the original still declares itself the original.
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url,
      title: `${BRAND.name} | ${title}`,
      description,
      siteName: BRAND.name,
      publishedTime: date.toISOString(),
      modifiedTime: (updated ?? date).toISOString(),
      authors: [BRAND.url],
      tags,
      images: [
        {
          url: image,
          // Only the site default is known to be 1200x630; covers vary.
          ...(!cover && { width: 1200, height: 630 }),
          alt: coverAlt ?? title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${BRAND.name} | ${title}`,
      description,
      images: [image],
      creator: BRAND.socials.twitter.username,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const { title, description, date, updated, tags, cover, coverAlt, devto_url } =
    post.frontmatter;
  const { html, headings } = await renderMarkdown(post.body);
  const related = getRelatedPosts(post);
  // The first tag's colour becomes the post's accent: links, list markers,
  // heading anchors and the active TOC entry all pick it up from here.
  const accentStyle = tags[0]
    ? ({ "--post-accent": getTagColor(tags[0]) } as CSSProperties)
    : undefined;

  return (
    <article className="min-h-screen relative bg-background z-1" style={accentStyle}>
      <ArticleJsonLd
        title={title}
        description={description}
        url={`${BRAND.url}/blog/${post.slug}`}
        image={cover}
        datePublished={date}
        dateModified={updated}
        tags={tags}
      />

      <div className="h-24 md:h-32" aria-hidden />

      <div className="wrapper mx-auto">
        <header className="max-w-3xl">
          <Link
            href="/blog"
            className="text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
          >
            ← All writing
          </Link>

          <h1 className="title mt-6 text-primary normal-case">{title}</h1>

          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <time dateTime={date.toISOString()}>{formatPostDate(date)}</time>
            <span aria-hidden>·</span>
            <span>{post.readingMinutes} min read</span>
            {updated && (
              <>
                <span aria-hidden>·</span>
                <span>Updated {formatPostDate(updated)}</span>
              </>
            )}
          </div>

          {tags.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tags">
              {tags.map((tag) => (
                <TagPill key={tag} tag={tag} />
              ))}
            </ul>
          )}
        </header>

        {cover && (
          <div className="relative mt-12 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border/20 bg-muted">
            <Image
              src={cover}
              // The schema requires coverAlt whenever cover is set.
              alt={coverAlt ?? title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
              preload
            />
          </div>
        )}

        <div className="mt-16 flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
          <TableOfContents
            headings={headings}
            className="lg:sticky lg:top-28 lg:order-2 lg:w-56 lg:shrink-0"
          />
          <Prose html={html} className="lg:order-1 lg:flex-1" />
        </div>

        {devto_url && (
          <p className="mt-16 max-w-2xl text-sm text-muted-foreground">
            This post is also published on{" "}
            <a
              href={devto_url}
              className="underline underline-offset-4 hover:text-primary"
              rel="noopener noreferrer"
              target="_blank"
            >
              dev.to
            </a>
            .
          </p>
        )}

        {related.length > 0 && (
          <section className="mt-24 border-t border-border/20 pt-12">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
              Keep reading
            </h2>
            <ul className="mt-6 flex flex-col gap-4">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/blog/${item.slug}`}
                    className="group flex flex-col gap-1"
                  >
                    <span className="text-lg font-semibold text-primary transition-opacity group-hover:opacity-70">
                      {item.frontmatter.title}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {item.frontmatter.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="relative bg-background z-10 w-full rounded-b-[2rem] md:rounded-b-[4rem] overflow-hidden">
        <ContactsRef />
      </div>
    </article>
  );
}
