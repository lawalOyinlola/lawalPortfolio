import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { getTagColor } from "@/lib/tag-colors";
import type { PostSummary } from "@/lib/content";
import CoverReveal from "./CoverReveal";
import TagPill from "./TagPill";

// Type-only, so the client components that render cards never pull in the
// file-reading content layer.
export type { PostSummary };

/**
 * The Featured or Latest label. At most one post carries it at a time; see
 * `toPostSummaries`.
 */
function PostBadge({ badge }: { badge: PostSummary["badge"] }) {
  if (!badge) return null;
  return (
    <span className="rounded-full bg-(--post-accent,var(--ring)) px-2.5 py-0.5 font-semibold text-background">
      {badge}
    </span>
  );
}

export default function PostCard({
  post,
  index = 0,
}: {
  post: PostSummary;
  index?: number;
}) {
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
        <CoverReveal className="relative aspect-video w-full shrink-0 self-start overflow-hidden rounded-xl bg-muted ring-1 ring-border/15 md:w-64 lg:w-72">
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
        </CoverReveal>
      )}

      <div className="flex flex-1 flex-col gap-2.5">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
          <PostBadge badge={post.badge} />
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
 * A compact card for a short run of posts: cover on top, then the date and
 * title. Used where a full row would repeat the blog index.
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
        <CoverReveal className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted ring-1 ring-border/15">
          <Image
            src={cover}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        </CoverReveal>
      )}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-widest text-muted-foreground">
        <PostBadge badge={post.badge} />
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
