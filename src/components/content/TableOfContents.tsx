"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { Heading } from "@/lib/markdown";
import { scrollToAnchor } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * How far below the viewport top a heading must pass before its section counts
 * as "current". Matches the headings' scroll-mt-28 (7rem) plus a little slack,
 * so a heading jumped to from this list is immediately the highlighted one.
 */
const ACTIVE_OFFSET_PX = 140;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
        className="relative space-y-1 overflow-y-auto border-l border-border/40 lg:max-h-[calc(100vh-11rem)]"
      >
        {headings.map((heading) => {
          const isActive = heading.id === activeId;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                data-toc-id={heading.id}
                aria-current={isActive ? "location" : undefined}
                onClick={(event) => onNavigate(event, heading.id)}
                className={cn(
                  "-ml-px block border-l-2 py-1 pr-2 leading-snug transition-colors duration-200",
                  heading.depth === 3 ? "pl-7" : "pl-4",
                  isActive
                    ? "border-(--post-accent,var(--ring)) font-medium text-primary"
                    : "border-transparent text-foreground/60 hover:border-border hover:text-primary",
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
