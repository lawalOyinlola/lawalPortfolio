"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";

/** Serializable lab shape passed from the server page. */
export type LabSummary = {
  slug: string;
  title: string;
  description: string;
  platform: string;
  difficulty: string;
  target: string;
  dateLabel: string;
  readingMinutes: number;
  tags: string[];
  tools: string[];
  skills: string[];
  series: string | null;
  order: number | null;
  /** Non-published nodes the map shows but that have no page yet. */
  comingSoon?: boolean;
};

export type LabSeries = {
  name: string;
  blurb: string;
};

function LabCard({ lab }: { lab: LabSummary }) {
  return (
    <Link
      href={`/security/labs/${lab.slug}`}
      className="group flex h-full flex-col gap-3 p-7 transition-colors duration-300 hover:bg-muted/40"
    >
      <span className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
        <span className="rounded-full border border-[#be123c]/30 bg-[#be123c]/5 px-2.5 py-0.5 text-[#be123c]">
          {lab.platform}
        </span>
        <span className="rounded-full border border-border/40 px-2.5 py-0.5">
          {lab.difficulty}
        </span>
        <span aria-hidden>·</span>
        {lab.dateLabel}
        <span aria-hidden>·</span>
        {lab.readingMinutes} min
      </span>
      <span className="text-lg font-semibold leading-snug text-primary underline-offset-4 group-hover:underline">
        {lab.title}
      </span>
      <span className="text-xs uppercase tracking-widest text-muted-foreground">
        Target: {lab.target}
      </span>
      <span className="max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
        {lab.description}
      </span>
    </Link>
  );
}

function Grid({ labs }: { labs: LabSummary[] }) {
  return (
    <ul className="grid gap-px overflow-hidden rounded-2xl bg-border/60 sm:grid-cols-2">
      {labs.map((lab) => (
        <li key={lab.slug} className="bg-background">
          <LabCard lab={lab} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Search, tag filtering and series grouping for the labs list. Mirrors
 * `BlogExplorer`: everything runs in memory over the already-rendered array.
 * Unfiltered, labs read as ordered sections (Foundation → tracks); the moment
 * someone searches or picks a tag, it collapses to a flat relevance grid.
 */
export default function LabsExplorer({
  labs,
  series,
}: {
  labs: LabSummary[];
  series: LabSeries[];
}) {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const searchId = useId();
  const resultsRef = useRef<HTMLDivElement>(null);

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
    for (const lab of labs) {
      for (const tag of lab.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag, count]) => ({ tag, count }));
  }, [labs]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return labs.filter((lab) => {
      const matchesTags =
        activeTags.length === 0 ||
        activeTags.every((tag) => lab.tags.includes(tag));
      if (!matchesTags) return false;
      if (!needle) return true;
      const haystack = [
        lab.title,
        lab.description,
        lab.target,
        ...lab.tags,
        ...lab.tools,
        ...lab.skills,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [labs, query, activeTags]);

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

  // Unfiltered view: group by series in declared order, ungrouped labs last.
  const grouped = useMemo(() => {
    const byName = new Map<string, LabSummary[]>();
    const ungrouped: LabSummary[] = [];
    for (const lab of labs) {
      if (lab.series) {
        const arr = byName.get(lab.series) ?? [];
        arr.push(lab);
        byName.set(lab.series, arr);
      } else {
        ungrouped.push(lab);
      }
    }
    const sections = series
      .filter((s) => byName.has(s.name))
      .map((s) => ({
        ...s,
        labs: [...(byName.get(s.name) ?? [])].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0),
        ),
      }));
    return { sections, ungrouped };
  }, [labs, series]);

  return (
    <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-14">
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
            placeholder="Wazuh, phishing, UTM"
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

        {tags.length > 0 && (
          <>
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
                      style={
                        { "--tag": "#be123c" } as React.CSSProperties
                      }
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
          </>
        )}

        {isFiltered && (
          <button
            type="button"
            onClick={clearAll}
            className="mt-5 text-[10px] uppercase tracking-widest text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            Clear filter{activeTags.length > 1 && "s"}
          </button>
        )}
      </aside>

      <div ref={resultsRef} className="scroll-mt-28 lg:order-1">
        <p
          role="status"
          className="text-xs uppercase tracking-widest text-muted-foreground"
        >
          {isFiltered
            ? `${results.length} of ${labs.length} ${labs.length === 1 ? "lab" : "labs"}`
            : `${labs.length} ${labs.length === 1 ? "lab" : "labs"}`}
        </p>

        {isFiltered ? (
          results.length > 0 ? (
            <div className="mt-6">
              <Grid labs={results} />
            </div>
          ) : (
            <div className="mt-6 border-y border-border/25 py-20 text-center">
              <p className="text-base text-primary">Nothing matches that yet.</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Try a looser word, or drop a filter.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-6 rounded-full border border-border/40 px-4 py-2 text-xs uppercase tracking-widest text-primary transition-colors hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]"
              >
                Clear filters
              </button>
            </div>
          )
        ) : (
          <div className="mt-6 flex flex-col gap-12">
            {grouped.sections.map((section) => (
              <section key={section.name} aria-label={section.name}>
                <div className="mb-4 flex flex-col gap-1">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    {section.name}
                  </h2>
                  <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
                    {section.blurb}
                  </p>
                </div>
                <Grid labs={section.labs} />
              </section>
            ))}

            {grouped.ungrouped.length > 0 && (
              <section aria-label="More labs">
                {grouped.sections.length > 0 && (
                  <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    More
                  </h2>
                )}
                <Grid labs={grouped.ungrouped} />
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
