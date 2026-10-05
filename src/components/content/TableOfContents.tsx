"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import type { Heading } from "@/lib/markdown";
import { scrollToAnchor } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * How far below the viewport top a heading must pass before its section counts
 * as "current". Matches the headings' scroll-mt-28 (7rem) plus a little slack,
 * so a heading jumped to from this list is immediately the highlighted one.
 */
const ACTIVE_OFFSET_PX = 140;

type Group = {
  heading: Heading;
  subs: Heading[];
};

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Folds the flat h2/h3 list into h2 groups, each carrying its h3 children. */
function groupHeadings(headings: Heading[]): Group[] {
  const groups: Group[] = [];
  for (const heading of headings) {
    if (heading.depth === 2 || groups.length === 0) {
      groups.push({ heading, subs: [] });
    } else {
      groups[groups.length - 1].subs.push(heading);
    }
  }
  return groups;
}

export default function TableOfContents({
  headings,
  className,
}: {
  headings: Heading[];
  className?: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const listRef = useRef<HTMLOListElement>(null);

  const groups = useMemo(() => groupHeadings(headings), [headings]);

  // Which group's children should be revealed because the reader has scrolled
  // into that section. Hover and keyboard focus reveal a group independently
  // of this, via CSS (:hover / :focus-within) — this only tracks scroll.
  const activeGroupId = useMemo(() => {
    for (const group of groups) {
      if (
        group.heading.id === activeId ||
        group.subs.some((sub) => sub.id === activeId)
      ) {
        return group.heading.id;
      }
    }
    return null;
  }, [groups, activeId]);

  // Scroll spy: the current section is the last heading already scrolled past
  // the offset line. Measured on scroll (rAF-throttled) rather than with an
  // IntersectionObserver, which misreports when a short section never fills
  // the observed band.
  useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      let current: string | null = null;
      for (const el of elements) {
        if (el.getBoundingClientRect().top - ACTIVE_OFFSET_PX > 0) break;
        current = el.id;
      }
      setActiveId(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [headings]);

  // Keep the active entry visible when the list is taller than its sticky box.
  // Scrolls the list itself, never the page, so it can't fight the reader.
  useEffect(() => {
    const list = listRef.current;
    if (!list || !activeId || list.scrollHeight <= list.clientHeight) return;

    const link = list.querySelector<HTMLElement>(
      `[data-toc-id="${CSS.escape(activeId)}"]`,
    );
    if (!link) return;

    const top = link.offsetTop;
    const bottom = top + link.offsetHeight;
    if (top >= list.scrollTop && bottom <= list.scrollTop + list.clientHeight)
      return;

    list.scrollTo({
      top: top - list.clientHeight / 2,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [activeId]);

  const onNavigate = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    // Let modified clicks (new tab, copy link) behave like normal links.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
      return;
    event.preventDefault();
    scrollToAnchor(id, prefersReducedMotion() ? "auto" : "smooth");
    history.replaceState(null, "", `#${id}`);
  };

  if (headings.length < 3) return null;

  return (
    <nav aria-labelledby="toc-heading" className={cn("text-sm", className)}>
      <h2
        id="toc-heading"
        className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary"
      >
        <span
          aria-hidden
          className="h-3.5 w-1 rounded-full bg-(--post-accent,var(--ring))"
        />
        On this page
      </h2>
      <ol
        ref={listRef}
        className="relative space-y-1 overflow-y-auto border-l border-border/80 lg:max-h-[calc(100vh-11rem)]"
      >
        {groups.map((group) => {
          const { heading, subs } = group;
          const isActive = heading.id === activeId;
          const isExpanded = group.heading.id === activeGroupId;

          return (
            <li key={heading.id} className="toc-group">
              <a
                href={`#${heading.id}`}
                data-toc-id={heading.id}
                aria-current={isActive ? "location" : undefined}
                onClick={(event) => onNavigate(event, heading.id)}
                className={cn(
                  "-ml-px block border-l-2 py-1 pl-4 pr-2 leading-snug transition-colors duration-200",
                  isActive
                    ? "border-(--post-accent,var(--ring)) font-medium text-primary"
                    : "border-transparent text-foreground/60 hover:border-foreground/20 hover:text-primary",
                )}
              >
                {heading.text}
              </a>

              {subs.length > 0 && (
                <div
                  className="toc-subitems"
                  data-expanded={isExpanded ? "true" : undefined}
                >
                  <div>
                    <ol>
                      {subs.map((sub) => {
                        const subActive = sub.id === activeId;
                        return (
                          <li key={sub.id}>
                            <a
                              href={`#${sub.id}`}
                              data-toc-id={sub.id}
                              aria-current={subActive ? "location" : undefined}
                              onClick={(event) => onNavigate(event, sub.id)}
                              className={cn(
                                "-ml-px block border-l-2 py-1 pl-7 pr-2 leading-snug transition-colors duration-200",
                                subActive
                                  ? "border-(--post-accent,var(--ring)) font-medium text-primary"
                                  : "border-transparent text-foreground/60 hover:border-foreground/20 hover:text-primary",
                              )}
                            >
                              {sub.text}
                            </a>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
