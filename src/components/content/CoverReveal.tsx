"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A cover frame that wipes open the first time it scrolls into view, then
 * stays open: scrolling back up and down again does not replay it. The
 * attribute is set on the element directly rather than through state, so the
 * reveal costs no re-render. The wipe itself, and the reduced-motion and
 * no-script fallbacks, live with `.cover-reveal` in globals.css. The frame
 * must be positioned (`relative`): the cover inside fills it.
 */
export default function CoverReveal({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.revealed = "";
        observer.disconnect();
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The wipe clips an inner layer, not the observed frame: a clipped target
  // reports no intersection, so it would never be told to open.
  return (
    <div ref={ref} className={`cover-reveal ${className}`}>
      <div className="cover-wipe absolute inset-0">{children}</div>
    </div>
  );
}
