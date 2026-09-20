"use client";

import { useId, useMemo, useRef, useState } from "react";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { getTagColor } from "@/lib/tag-colors";
import PostCard, { type PostSummary } from "./PostCard";

/**
 * Search and tag filtering for the post list.
 *
 * Everything runs against the already-rendered array: the whole blog is a
 * handful of posts, so filtering in memory beats shipping an index or calling
 * out to a search service, and it keeps working with JavaScript disabled right
 * up to the point someone types.
 */
export default function BlogExplorer({ posts }: { posts: PostSummary[] }) {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const searchId = useId();
  const resultsRef = useRef<HTMLDivElement>(null);

  /**
   * Bring the results back into view after a filter changes.
   *
   * Tied to the discrete actions (a tag, a clear) rather than to the result
   * count: scrolling the page on every keystroke while someone is still typing
   * would fight them for control of the viewport.
   */
  function scrollToResults() {
    const top = resultsRef.current?.getBoundingClientRect().top;
    if (top === undefined || top >= 0) return;
    resultsRef.current?.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesTags =
        activeTags.length === 0 ||
        activeTags.every((tag) => post.tags.includes(tag));
      if (!matchesTags) return false;
      if (!needle) return true;
      return (
        post.title.toLowerCase().includes(needle) ||
        post.description.toLowerCase().includes(needle) ||
        post.tags.some((tag) => tag.toLowerCase().includes(needle))
      );
    });
  }, [posts, query, activeTags]);

  const isFiltered = query.trim().length > 0 || activeTags.length > 0;

  function toggleTag(tag: string) {
    setActiveTags((current) =>
      current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag],
    );
    scrollToResults();
  }

  function clearAll() {
    setQuery("");
    setActiveTags([]);
    scrollToResults();
  }

  return (
    <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-14">
      {/* Mirrors the table of contents on a post page: same width, same side,
          same sticky behaviour, so the two pages feel like one system. */}
      <aside className="lg:sticky lg:top-28 lg:order-2 lg:w-76 lg:shrink-0">
        <label
          htmlFor={searchId}
          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary"
        >
          Search
        </label>
        <div className="relative mt-3">
          <MagnifyingGlassIcon
            size={15}
            weight="bold"
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="WAF, careers, tooling"
            className="search-field w-full rounded-full border border-border bg-transparent py-2 pl-9 pr-9 text-sm text-primary outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-ring"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-primary"
            >
              <XIcon size={13} weight="bold" aria-hidden />
            </button>
          )}
        </div>

        <h2 className="mt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Topics
        </h2>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {tags.map(({ tag, count }) => {
            const isActive = activeTags.includes(tag);
            return (
              <li key={tag}>
                <button
                  type="button"
                  onClick={() => toggleTag(tag)}
                  aria-pressed={isActive}
                  style={{ "--tag": getTagColor(tag) } as React.CSSProperties}
                  className={`tag-filter ${isActive ? "tag-filter-active" : ""}`}
                >
                  <span aria-hidden className="opacity-55">
                    #
                  </span>
                  {tag}
                  <span className="ml-0.5 tabular-nums opacity-55">
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {isFiltered && (
          <button
            type="button"
            onClick={clearAll}
            className="mt-5 text-[10px] uppercase tracking-widest text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            Clear Filter
            {activeTags.length > 1 && "s"}
          </button>
        )}
      </aside>
      <div ref={resultsRef} className="scroll-mt-28 lg:order-1">
        <p
          role="status"
          className="text-xs uppercase tracking-widest text-muted-foreground"
        >
          {isFiltered
            ? `${results.length} of ${posts.length} ${posts.length === 1 ? "post" : "posts"}`
            : `${posts.length} ${posts.length === 1 ? "post" : "posts"}`}
        </p>

        {results.length > 0 ? (
          <ul className="mt-6 divide-y divide-border/25 border-y border-border/25">
            {results.map((post, index) => (
              <li key={post.slug}>
                <PostCard post={post} index={index} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 border-y border-border/25 py-20 text-center">
            <p className="text-base text-primary">Nothing matches that yet.</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Try a looser word, or drop a filter. Everything here is tagged by
              what it is actually about rather than by what it mentions once.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-6 rounded-full border border-border/40 px-4 py-2 text-xs uppercase tracking-widest text-primary transition-colors hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
