import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { formatPostDate, type BlogPost } from "@/lib/content";
import { getTagColor } from "@/lib/tag-colors";
import TagPill from "./TagPill";

export default function PostCard({ post }: { post: BlogPost }) {
  const { title, description, date, tags, cover, coverAlt } = post.frontmatter;
  const accentStyle = tags[0]
    ? ({ "--post-accent": getTagColor(tags[0]) } as CSSProperties)
    : undefined;

  return (
    <article
      style={accentStyle}
      className="group relative flex flex-col gap-4 rounded-2xl border border-border/20 p-4 transition-colors duration-300 hover:border-[color-mix(in_oklab,var(--post-accent,var(--ring))_45%,transparent)] md:flex-row md:gap-6 md:p-5"
    >
      {cover && (
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl bg-muted md:w-56">
          <Image
            src={cover}
            alt={coverAlt ?? ""}
            fill
            sizes="(max-width: 768px) 100vw, 224px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
          <time dateTime={date.toISOString()}>{formatPostDate(date)}</time>
          <span aria-hidden>·</span>
          <span>{post.readingMinutes} min read</span>
        </div>

        <h2 className="text-xl font-semibold tracking-tight text-primary md:text-2xl">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {title}
          </Link>
        </h2>

        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>

        {tags.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-2 pt-2" aria-label="Tags">
            {tags.slice(0, 4).map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </ul>
        )}
      </div>

      <ArrowUpRightIcon
        weight="bold"
        className="absolute right-4 top-4 size-4 text-[var(--post-accent,var(--ring))] opacity-0 transition-opacity group-hover:opacity-100 md:static md:self-center"
        aria-hidden
      />
    </article>
  );
}
