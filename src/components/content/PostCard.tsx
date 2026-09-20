import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { getTagColor } from "@/lib/tag-colors";
import TagPill from "./TagPill";

/** The parts of a post the list needs, flattened so it can cross to a client component. */
export type PostSummary = {
  slug: string;
  title: string;
  description: string;
  dateISO: string;
  dateLabel: string;
  readingMinutes: number;
  tags: string[];
  cover: string | null;
};

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
      className="post-row group relative flex flex-col gap-5 py-7 transition-colors duration-300 md:flex-row md:gap-8 md:py-8"
    >
      {cover && (
        // self-start is load-bearing: without it the flex row stretches this
        // box to the text column's height, the 16/9 ratio loses, and
        // object-cover crops the sides off the cover art.
        <div className="relative aspect-video w-full shrink-0 self-start overflow-hidden rounded-xl bg-muted ring-1 ring-border/15 md:w-64 lg:w-72">
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

        <h2 className="max-w-[34ch] text-xl font-semibold leading-snug tracking-tight text-primary md:text-[1.6rem]">
          <Link
            href={`/blog/${post.slug}`}
            className="after:absolute after:inset-0 decoration-(--post-accent,var(--ring)) decoration-2 underline-offset-[6px] group-hover:underline"
          >
            {title}
          </Link>
        </h2>

        <p className="max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
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
