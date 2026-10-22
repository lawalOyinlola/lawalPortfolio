"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { CaretDownIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { getTagColor } from "@/lib/tag-colors";
import CoverReveal from "./CoverReveal";
import Pagination from "./Pagination";
import SortControl, { type SortDir, type SortOption } from "./SortControl";

/** Labs per page. The controls stay hidden until the list runs past this. */
const PAGE_SIZE = 6;

/**
 * "Series" is the default: it keeps the grouped, Foundation-first sections.
 * The other fields flatten the labs into a single sorted grid.
 */
const LAB_SORT_OPTIONS: SortOption[] = [
  { key: "series", label: "Series" },
  {
    key: "difficulty",
    label: "Difficulty",
    asc: "Easiest",
    desc: "Hardest",
    defaultDir: "asc",
  },
  { key: "date", label: "Date", asc: "Oldest", desc: "Newest", defaultDir: "desc" },
  { key: "title", label: "Title", asc: "A–Z", desc: "Z–A", defaultDir: "asc" },
  {
    key: "read",
    label: "Read time",
    asc: "Shortest",
    desc: "Longest",
    defaultDir: "asc",
  },
];

// Named difficulties map to a rank so they sort by effort, not alphabetically
// (Easy → Medium → Hard, not Easy → Hard → Medium). Synonyms share a rank;
// anything unrecognised sorts last.
const DIFFICULTY_RANK: Record<string, number> = {
  easy: 0,
  beginner: 0,
  medium: 1,
  intermediate: 1,
  hard: 2,
  advanced: 2,
  insane: 3,
  expert: 3,
};

function difficultyRank(difficulty: string): number {
  return DIFFICULTY_RANK[difficulty.toLowerCase()] ?? Number.POSITIVE_INFINITY;
}

/** Serializable lab shape passed from the server page. */
export type LabSummary = {
  slug: string;
  title: string;
  description: string;
  platform: string;
  difficulty: string;
  target: string;
  dateISO: string;
  dateLabel: string;
  readingMinutes: number;
  tags: string[];
  tools: string[];
  skills: string[];
  series: string | null;
  order: number | null;
  cover: string | null;
  coverAlt: string | null;
};

export type LabSeries = {
  name: string;
  blurb: string;
};

function LabCard({ lab, index }: { lab: LabSummary; index: number }) {
  const style = {
    ...(lab.tags[0] ? { "--post-accent": getTagColor(lab.tags[0]) } : {}),
    "--i": index,
  } as CSSProperties;

  return (
    <Link
      href={`/security/labs/${lab.slug}`}
      style={style}
      className="post-row group relative flex flex-col gap-5 py-7 pr-1 transition-colors duration-300 md:flex-row md:items-start md:gap-8 md:py-8 md:pl-2"
    >
      {/* Content first in the DOM, so on desktop it reads left of the cover. */}
      <div className="flex flex-1 flex-col gap-2.5">
        <span className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="rounded-full border border-(--post-accent,#be123c)/30 bg-(--post-accent,#be123c)/5 px-2.5 py-0.5 text-(--post-accent,#be123c)">
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
        <h3 className="max-w-[48ch] text-xl font-semibold leading-snug text-primary underline-offset-4 group-hover:underline">
          {lab.title}
        </h3>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Target: {lab.target}
        </span>
        <p className="max-w-[68ch] text-sm leading-relaxed text-muted-foreground">
          {lab.description}
        </p>
      </div>

      {lab.cover && (
        <CoverReveal revealKey={lab.cover} className="relative aspect-video w-full shrink-0 self-start overflow-hidden rounded-xl bg-muted ring-1 ring-border/15 md:w-64 lg:w-72">
          <Image
            src={lab.cover}
            alt={lab.coverAlt ?? ""}
            fill
            sizes="(max-width: 768px) 100vw, 288px"
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        </CoverReveal>
      )}
    </Link>
  );
}

function Grid({ labs }: { labs: LabSummary[] }) {
  return (
    <ul className="flex flex-col divide-y divide-border/60 border-y border-border/25">
      {labs.map((lab, index) => (
        <li key={lab.slug}>
          <LabCard lab={lab} index={index} />
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
  const [sortKey, setSortKey] = useState("series");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  // Below lg, search, sort and topics fold behind one toggle so the labs
  // start near the top of the screen; from lg up they sit in the sidebar.
  // The same fold as the blog's.
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchId = useId();
  const filtersId = useId();
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
      // Union, not intersection: two topics widen the list to labs in either.
      const matchesTags =
        activeTags.length === 0 ||
        activeTags.some((tag) => lab.tags.includes(tag));
      if (!matchesTags) return false;
      if (!needle) return true;
      const haystack = [
        lab.title,
        lab.description,
        lab.target,
        lab.platform,
        lab.difficulty,
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
  const activeCount = activeTags.length + (query.trim() ? 1 : 0);

  function toggleTag(tag: string) {
    setActiveTags((current) =>
      current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag],
    );
    setPage(1);
    scrollToResults();
  }

  function clearAll() {
    setQuery("");
    setActiveTags([]);
    setPage(1);
    scrollToResults();
  }

  function changeSort(key: string, dir: SortDir) {
    setSortKey(key);
    setSortDir(dir);
    setPage(1);
  }

  function changePage(next: number) {
    setPage(next);
    scrollToResults();
  }

  // Series rank from the declared order, so a "Series" sort over a filtered set
  // still reads Foundation-first instead of falling back to file order.
  const seriesRank = useMemo(() => {
    const m = new Map<string, number>();
    series.forEach((s, i) => m.set(s.name, i));
    return m;
  }, [series]);

  const sortedResults = useMemo(() => {
    const rankOf = (lab: LabSummary) =>
      lab.series ? (seriesRank.get(lab.series) ?? 99) : 99;
    const arr = [...results];
    arr.sort((a, b) => {
      // Series keeps its declared order regardless of direction: it is the
      // grouped default, not an A↔Z axis.
      if (sortKey === "series") {
        return (
          rankOf(a) - rankOf(b) ||
          (a.order ?? 0) - (b.order ?? 0) ||
          b.dateISO.localeCompare(a.dateISO)
        );
      }
      if (sortKey === "difficulty") {
        const ra = difficultyRank(a.difficulty);
        const rb = difficultyRank(b.difficulty);
        const aKnown = Number.isFinite(ra);
        const bKnown = Number.isFinite(rb);
        // Unknown difficulties sort last in both directions, so reversing to
        // "Hardest first" never floats an unlabelled lab to the top.
        if (aKnown !== bKnown) return aKnown ? -1 : 1;
        // Only the rank comparison follows the direction. Equal rank (and two
        // unknowns) fall back to the series order, never reversed, so the sort
        // never claims one same-rank lab is easier than another.
        if (aKnown && ra !== rb) return sortDir === "asc" ? ra - rb : rb - ra;
        return (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title);
      }
      let cmp: number;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "read") cmp = a.readingMinutes - b.readingMinutes;
      else cmp = a.dateISO.localeCompare(b.dateISO);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [results, sortKey, sortDir, seriesRank]);

  // The grouped sections are the resting state: only shown when nothing is
  // filtered and the default "Series" sort is active. Any other sort — or any
  // active filter — flattens to a single ordered grid.
  const showGrouped = sortKey === "series" && !isFiltered;

  const pageCount = Math.max(1, Math.ceil(sortedResults.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = useMemo(
    () =>
      sortedResults.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [sortedResults, currentPage],
  );

  // Unfiltered view: group the current page by series in declared order,
  // ungrouped labs last. The page is already in series order, so a series that
  // runs across two pages simply continues under the same heading on the next.
  const grouped = useMemo(() => {
    // Only series declared in LAB_SERIES get their own section; a lab tagged
    // with an unknown series still shows up, under "More", rather than
    // silently disappearing from the page.
    const knownNames = new Set(series.map((s) => s.name));
    const byName = new Map<string, LabSummary[]>();
    const ungrouped: LabSummary[] = [];
    for (const lab of pageItems) {
      if (lab.series && knownNames.has(lab.series)) {
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
  }, [pageItems, series]);


  return (
    <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-14">
      <aside className="lg:sticky lg:top-28 lg:order-2 lg:w-76 lg:shrink-0">
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          aria-controls={filtersId}
          className="flex w-full items-center justify-between gap-4 border-y border-border/40 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary lg:hidden"
        >
          <span>
            Search and filter
            {activeCount > 0 && (
              <span className="ml-2 font-normal tabular-nums text-muted-foreground">
                · {activeCount} on
              </span>
            )}
          </span>
          <CaretDownIcon
            size={12}
            weight="bold"
            aria-hidden
            className={`transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
          />
        </button>

        <div id={filtersId} className={filtersOpen ? "pt-6 pb-2" : "hidden lg:block"}>
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
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Wazuh, phishing, UTM"
              className="search-field w-full rounded-full border border-border bg-transparent py-2 pl-9 pr-9 text-sm text-primary outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-ring"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setPage(1);
                }}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-primary"
              >
                <XIcon size={13} weight="bold" aria-hidden />
              </button>
            )}
          </div>

          {labs.length > 1 && (
            <>
              <h2 className="mt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                Sort
              </h2>
              <SortControl
                options={LAB_SORT_OPTIONS}
                sortKey={sortKey}
                sortDir={sortDir}
                onChange={changeSort}
              />
            </>
          )}

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
                        style={{ "--tag": getTagColor(tag) } as CSSProperties}
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
        </div>
      </aside>

      <div ref={resultsRef} className="scroll-mt-28 lg:order-1">
        <p
          role="status"
          className="text-xs uppercase tracking-widest text-muted-foreground"
        >
          {isFiltered
            ? `${results.length} of ${labs.length} ${labs.length === 1 ? "lab" : "labs"}`
            : `${labs.length} ${labs.length === 1 ? "lab" : "labs"}`}
          {pageCount > 1 && ` · page ${currentPage} of ${pageCount}`}
        </p>

        {!showGrouped ? (
          sortedResults.length > 0 ? (
            <div className="mt-6">
              <Grid labs={pageItems} />
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

        <Pagination
          page={currentPage}
          pageCount={pageCount}
          onChange={changePage}
          label="Labs"
        />
      </div>
    </div>
  );
}
