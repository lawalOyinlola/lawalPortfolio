import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { getTagColor } from "@/lib/tag-colors";
import type { PostSummary } from "@/lib/content";
import TagPill from "./TagPill";

// Type-only, so the client components that render cards never pull in the
// file-reading content layer.
export type { PostSummary };

export default function PostCard({
  post,
  index = 0,
  featured = false,
  headingAs = "h2",
}: {
  post: PostSummary;
  index?: number;
  /** The lead post: the cover takes most of the row and the title grows to match. */
  featured?: boolean;
  /** The featured title's level: "h3" where the card sits under a section heading. */
  headingAs?: "h2" | "h3";
}) {
  if (featured) return <FeaturedPostCard post={post} headingAs={headingAs} />;

  const { title, description, dateISO, dateLabel, tags, cover } = post;
  const accentStyle = tags[0]
    ? ({ "--post-accent": getTagColor(tags[0]) } as CSSProperties)
    : undefined;

  return (
    <article
      style={{ ...accentStyle, "--i": index } as CSSProperties}
      className="post-row group relative flex flex-col gap-5 py-7 pr-1 transition-colors duration-300 md:flex-row md:gap-8 md:py-8 md:pr-6"
    >
      {cover && (
        // self-start is load-bearing: without it the flex row stretches this
        // box to the text column's height, the 16/9 ratio loses, and
        // object-cover crops the sides off the cover art.
        <div className="cover-wipe relative aspect-video w-full shrink-0 self-start overflow-hidden rounded-xl bg-muted ring-1 ring-border/15 md:w-64 lg:w-72">
          <Image
            src={cover}
            // Decorative here on purpose: the title and description beside it
            // already say what the post is, so a long alt would just be read
            // out before the title on every card. The post page describes it.
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 256px, 288px"
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2.5">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
          <time dateTime={dateISO}>{dateLabel}</time>
          <span aria-hidden>·</span>
          <span>{post.readingMinutes} min read</span>
        </div>

        <h2 className="max-w-[40ch] text-xl font-semibold leading-snug tracking-tight text-primary md:text-[1.6rem]">
          <Link
            href={`/blog/${post.slug}`}
            className="after:absolute after:inset-0 decoration-(--post-accent,var(--ring)) decoration-2 underline-offset-[6px] group-hover:underline"
          >
            {title}
          </Link>
        </h2>

        <p className="max-w-[68ch] text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {tags.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-2 pt-3" aria-label="Tags">
            {tags.slice(0, 4).map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </ul>
        )}
      </div>

      <ArrowUpRightIcon
        weight="bold"
        className="absolute right-4 top-7 size-4 text-(--post-accent,var(--ring)) opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 md:static md:self-center"
        aria-hidden
      />
    </article>
  );
}

/**
 * The newest post, shown at the top of the unfiltered list. Same parts as a
 * row, rearranged: the cover leads at three fifths, as on the home page's
 * project and lab panels, with the title set large beside it.
 */
function FeaturedPostCard({
  post,
  headingAs: Heading,
}: {
  post: PostSummary;
  headingAs: "h2" | "h3";
}) {
  const { title, description, dateISO, dateLabel, tags, cover } = post;
  const accentStyle = tags[0]
    ? ({ "--post-accent": getTagColor(tags[0]) } as CSSProperties)
    : undefined;

  return (
    <article
      style={accentStyle}
      className="post-row group relative grid gap-6 py-8 md:grid-cols-5 md:gap-10 md:py-10"
    >
      {cover && (
        <div className="cover-wipe relative aspect-video w-full overflow-hidden rounded-xl bg-muted ring-1 ring-border/15 md:col-span-3">
          <Image
            src={cover}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
          />
        </div>
      )}

      <div
        className={`flex flex-col gap-3 ${cover ? "md:col-span-2" : "md:col-span-5"}`}
      >
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="rounded-full bg-(--post-accent,var(--ring)) px-2.5 py-0.5 font-semibold text-background">
            Latest
          </span>
          <time dateTime={dateISO}>{dateLabel}</time>
          <span aria-hidden>·</span>
          <span>{post.readingMinutes} min read</span>
        </div>

        <Heading className="text-2xl font-semibold leading-[1.15] tracking-tight text-primary md:text-[2.1rem] lg:text-[2.5rem]">
          <Link
            href={`/blog/${post.slug}`}
            className="after:absolute after:inset-0 decoration-(--post-accent,var(--ring)) decoration-2 underline-offset-[6px] group-hover:underline"
          >
            {title}
          </Link>
        </Heading>

        <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground md:text-base">
          {description}
        </p>

        {tags.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-2 pt-3" aria-label="Tags">
            {tags.slice(0, 4).map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </ul>
        )}

        <span className="mt-2 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary">
          Read the post
          <ArrowUpRightIcon
            weight="bold"
            aria-hidden
            className="size-3.5 text-(--post-accent,var(--ring)) transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </article>
  );
}

/**
 * A compact card for a short run of posts under a featured one: cover on top,
 * then the date and title. Used where a full row would repeat the blog index.
 */
export function PostTile({
  post,
  index = 0,
}: {
  post: PostSummary;
  index?: number;
}) {
  const { title, dateISO, dateLabel, tags, cover } = post;
  const style = {
    ...(tags[0] ? { "--post-accent": getTagColor(tags[0]) } : {}),
    "--i": index,
  } as CSSProperties;

  return (
    <article style={style} className="post-row group relative flex flex-col gap-4">
      {cover && (
        <div className="cover-wipe relative aspect-video w-full overflow-hidden rounded-xl bg-muted ring-1 ring-border/15">
          <Image
            src={cover}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        </div>
      )}
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
        <time dateTime={dateISO}>{dateLabel}</time>
        <span aria-hidden>·</span>
        <span>{post.readingMinutes} min read</span>
      </div>
      <h3 className="text-lg font-semibold leading-snug tracking-tight text-primary">
        <Link
          href={`/blog/${post.slug}`}
          className="after:absolute after:inset-0 decoration-(--post-accent,var(--ring)) decoration-2 underline-offset-[5px] group-hover:underline"
        >
          {title}
        </Link>
      </h3>
    </article>
  );
}
