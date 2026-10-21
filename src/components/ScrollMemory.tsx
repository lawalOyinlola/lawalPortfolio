"use client";

import { useLayoutEffect, useEffect, useRef } from "react";

// A reload should land where the visitor was, not back at the top. The
// browser would normally do this itself, but while the preloader shows, main
// is one screen tall, so its restore clamps to zero. This remembers the spot
// on the way out and puts it back once the page is full height again, still
// under the lifting columns, so the jump is never seen.

const KEY = "scrollMemory";

// Past this, a reload is treated as a fresh visit and starts at the top.
const MAX_AGE_MS = 30 * 60 * 1000;

interface Saved {
  /** Path and query of the page the position belongs to. */
  path: string;
  y: number;
  /** The section the top of the viewport was in, and how far into it. */
  section?: string;
  offset?: number;
  at: number;
}

const currentPath = () => window.location.pathname + window.location.search;

/** The last section with an id whose top has scrolled past the viewport top. */
function sectionAtTop() {
  const sections = document.querySelectorAll<HTMLElement>("main section[id]");
  let found: HTMLElement | null = null;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= 1) found = section;
  }
  return found;
}

function read(): Saved | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function isReload() {
  const [nav] = performance.getEntriesByType(
    "navigation",
  ) as PerformanceNavigationTiming[];
  return nav?.type === "reload";
}

export default function ScrollMemory({ ready }: { ready: boolean }) {
  // Decided once, on the first render that can see the browser: whether this
  // load is a reload of the page that saved a position, recently enough.
  const pendingRef = useRef<Saved | null | undefined>(undefined);
  const readyRef = useRef(ready);

  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  useEffect(() => {
    const save = () => {
      // Under the preloader the page is one screen tall and scrollY is 0: a
      // reload then (a quick double refresh) would overwrite the real spot.
      // Keep the earlier record instead.
      if (!readyRef.current) return;
      const section = sectionAtTop();
      const saved: Saved = {
        path: currentPath(),
        y: window.scrollY,
        at: Date.now(),
      };
      if (section) {
        saved.section = section.id;
        saved.offset = -section.getBoundingClientRect().top;
      }
      try {
        sessionStorage.setItem(KEY, JSON.stringify(saved));
      } catch {
        // Storage unavailable: a reload just starts at the top.
      }
    };
    window.addEventListener("pagehide", save);
    return () => window.removeEventListener("pagehide", save);
  }, []);

  useLayoutEffect(() => {
    if (pendingRef.current === undefined) {
      const saved = read();
      pendingRef.current =
        saved &&
        isReload() &&
        !window.location.hash &&
        saved.path === currentPath() &&
        Date.now() - saved.at < MAX_AGE_MS
          ? saved
          : null;
    }

    const saved = pendingRef.current;
    if (!ready || !saved) return;
    pendingRef.current = null;

    // By section first, so content that changed above it does not throw the
    // position off; the raw offset when the section is gone.
    const section = saved.section
      ? document.getElementById(saved.section)
      : null;
    const y = section
      ? section.getBoundingClientRect().top +
        window.scrollY +
        (saved.offset ?? 0)
      : saved.y;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: Math.min(Math.max(y, 0), max),
      behavior: "instant",
    });
  }, [ready]);

  return null;
}
