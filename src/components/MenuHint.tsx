"use client";

import { useEffect, useRef, useState } from "react";

const SEEN_KEY = "menuHintSeen";
// Wait for the page to settle before pointing at anything.
const SHOW_AFTER_MS = 2500;
// Long enough to be noticed and read; it comes back on the next visit if the
// menu still has not been opened.
const SHOW_FOR_MS = 14000;

function hasSeenMenu() {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberMenu() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Storage unavailable: the hint just shows again next visit.
  }
}

/**
 * A hand-written note with a sketched arrow pointing down at the menu button,
 * floating gently. Shown on a visit until the menu has been opened once (then
 * never again) or it has been up for a while. Decorative: the button carries
 * its own label. Placed inside the menu button's wrapper, which must be
 * `relative`.
 */
export default function MenuHint({ menuOpen }: { menuOpen: boolean }) {
  const [visible, setVisible] = useState(false);
  // Set when the menu opens, so a show timer still pending cannot bring the
  // hint back. A ref rather than storage, which may be unavailable.
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (hasSeenMenu()) return;
    const show = setTimeout(() => {
      if (!dismissedRef.current) setVisible(true);
    }, SHOW_AFTER_MS);
    const hide = setTimeout(
      () => setVisible(false),
      SHOW_AFTER_MS + SHOW_FOR_MS,
    );
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    dismissedRef.current = true;
    rememberMenu();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the menu opening is the event that dismisses the hint
    setVisible(false);
  }, [menuOpen]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-full left-0 mb-1 transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <div className="menu-hint flex w-max flex-col items-start">
        <p className="menu-hint-text pl-5 font-(family-name:--font-caveat) text-2xl leading-none text-foreground md:text-[1.75rem]">
          Menu is here
        </p>
        {/* Drawn at 1:1 pixels and pulled 32px down past the hint, so the
            curve swings out to the right and comes back to point at the
            button's right edge (the button is 44px square, at x 0 to 44). */}
        <svg
          viewBox="0 0 92 72"
          className="menu-hint-arrow -mb-8 h-18 w-23 text-foreground"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* The sketch is drawn twice: a wide stroke in the page colour
              underneath, so it reads over dark and light sections alike. */}
          {[
            { stroke: "var(--background)", width: 7 },
            { stroke: "currentColor", width: 2.6 },
          ].map(({ stroke, width }) => (
            <g key={stroke} stroke={stroke} strokeWidth={width}>
              <path pathLength={1} d="M30 4C78 6 88 52 52 60" />
              <path pathLength={1} d="M52 60L64 64M52 60L62 51" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
