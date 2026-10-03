import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BRAND } from "@/app/constants";
import {
  formatPostDate,
  getLabPost,
  getLabPosts,
  toAbsoluteAssetUrl,
} from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import Prose from "@/components/content/Prose";
import TableOfContents from "@/components/content/TableOfContents";
import ArticleJsonLd from "@/components/content/ArticleJsonLd";
import ContactsRef from "@/components/ContactsRef";

export async function generateStaticParams() {
  return getLabPosts().map((lab) => ({ slug: lab.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lab = getLabPost(slug);
  if (!lab) return {};

  const { title, description, date, updated, cover, coverAlt, tags } =
    lab.frontmatter;
  const url = `${BRAND.url}/security/labs/${lab.slug}`;
  const image = cover
    ? toAbsoluteAssetUrl(cover)
    : `${BRAND.url}${BRAND.ogImage}`;

  return {
    title,
    description,
    keywords: tags,
    alternates: { canonical: `/security/labs/${lab.slug}` },
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

/** A labelled row of small pills; renders nothing when the list is empty. */
function MetaPills({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] uppercase tracking-widest text-(--post-accent)">
        {label}
      </span>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-full border border-[color-mix(in_oklab,var(--post-accent)_25%,transparent)] bg-muted/40 px-3 py-1 text-xs text-primary"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function LabPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lab = getLabPost(slug);

  if (!lab) {
    notFound();
  }

  const {
    title,
    description,
    date,
    updated,
    cover,
    coverAlt,
    platform,
    target,
    difficulty,
    os,
    tools,
    cves,
    skills,
    status,
  } = lab.frontmatter;
  const { html, headings } = await renderMarkdown(lab.body);

  // Security content shares the site's security-tag accent (deep rose), which
  // also harmonises with the red in the lab's SVG diagrams. Prose links, list
  // markers, heading anchors and the active TOC entry pick it up from here.
  const accentStyle = { "--post-accent": "#be123c" } as CSSProperties;

  // The headline facts a reader scans before committing to a long writeup.
  const facts: Array<{ k: string; v: string }> = [
    { k: "Platform", v: platform },
    { k: "Target", v: target },
    { k: "Difficulty", v: difficulty },
    { k: "OS", v: os },
  ];

  return (
    <article
      className="min-h-screen relative bg-background z-1"
      style={accentStyle}
    >
      <ArticleJsonLd
        type="TechArticle"
        title={title}
        description={description}
        url={`${BRAND.url}/security/labs/${lab.slug}`}
        image={cover}
        datePublished={date}
        dateModified={updated}
        tags={lab.frontmatter.tags}
      />

      <div className="h-24 md:h-32" aria-hidden />

      <div className="wrapper mx-auto">
        <header className="max-w-3xl">
          <Link
            href="/security/labs"
            className="text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
          >
            ← All labs
          </Link>

          <h1 className="title mt-6 text-primary normal-case">{title}</h1>

          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <time dateTime={date.toISOString()}>{formatPostDate(date)}</time>
            <span aria-hidden>·</span>
            <span>{lab.readingMinutes} min read</span>
            <span aria-hidden>·</span>
            <span className="rounded-full bg-[color-mix(in_oklab,var(--post-accent)_12%,transparent)] px-2.5 py-0.5 font-medium text-(--post-accent)">
              {status === "own-lab" ? "Self-hosted lab" : status}
            </span>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.k} className="flex flex-col gap-1">
                <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {fact.k}
                </dt>
                <dd className="text-sm font-medium text-primary">{fact.v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-col gap-5">
            <MetaPills label="Tools" items={tools} />
            <MetaPills label="CVEs" items={cves} />
            <MetaPills label="Skills" items={skills} />
          </div>
        </header>

        {cover && (
          <div className="relative mt-12 aspect-video w-full overflow-hidden rounded-2xl border border-border/50 bg-muted">
            <Image
              src={cover}
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
            className="lg:sticky lg:top-28 lg:order-2 lg:w-76 lg:shrink-0"
          />
          <Prose html={html} className="lg:order-1 lg:flex-1" />
        </div>
      </div>

      <div className="relative bg-background z-10 w-full rounded-b-[2rem] md:rounded-b-[4rem] overflow-hidden">
        <ContactsRef />
      </div>
    </article>
  );
}
