"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Covers that have already opened during this visit, by key. Filtering,
 * sorting or paging remounts the rows, and without this a cover the reader
 * has already seen would wipe open a second time. Module scope, so it lasts
 * for the visit and starts empty on every full page load.
 */
const revealed = new Set<string>();

/**
 * A cover frame that wipes open the first time it scrolls into view, then
 * stays open: scrolling back, filtering or re-sorting does not replay it. The
 * attribute is set on the element directly rather than through state, so the
 * reveal costs no re-render. The wipe itself, and the reduced-motion and
 * no-script fallbacks, live with `.cover-reveal` in globals.css. The frame
 * must be positioned (`relative`): the cover inside fills it.
 */
export default function CoverReveal({
  revealKey,
  className = "",
  children,
}: {
  /** Identifies the cover across remounts; the image path is enough. */
  revealKey: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Read once at mount. On the first load the set is empty on both server and
  // client, so hydration matches; it only fills in on later remounts.
  const [seen] = useState(() => revealed.has(revealKey));

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.revealed = "";
        revealed.add(revealKey);
        observer.disconnect();
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealKey, seen]);

  // The wipe clips an inner layer, not the observed frame: a clipped target
  // reports no intersection, so it would never be told to open.
  return (
    <div
      ref={ref}
      data-revealed={seen ? "" : undefined}
      className={`cover-reveal ${className}`}
    >
      <div className="cover-wipe absolute inset-0">{children}</div>
    </div>
  );
}
