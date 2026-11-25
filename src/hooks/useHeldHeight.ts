"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Stops a paged list from collapsing when a later page holds fewer items.
 *
 * Without it, a short last page makes the document shorter, the browser pulls
 * the scroll position up to fit, and the controls jump away from the pointer.
 * The hook keeps the tallest height the list has reached and sets it as the
 * outer box's `min-height`, so a short page leaves empty space instead.
 *
 * Two boxes, because a box with a `min-height` cannot report how tall its own
 * content is: `innerRef` wraps the list and is measured, `outerRef` wraps that
 * and is held. The held height starts again when `resetKey` changes (a new
 * search, filter or sort is a new list, which may rightly be short) and when
 * the width changes (the same items wrap to a different height).
 *
 * The height is written straight to the element, not kept in state, so a
 * resize never re-renders the list.
 */
export function useHeldHeight<
  Outer extends HTMLElement = HTMLDivElement,
  Inner extends HTMLElement = HTMLDivElement,
>(resetKey: string) {
  const outerRef = useRef<Outer>(null);
  const innerRef = useRef<Inner>(null);
  const held = useRef({ width: -1, height: 0 });

  const hold = useCallback((reset: boolean) => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const { width, height } = inner.getBoundingClientRect();
    const current = held.current;
    if (reset || width !== current.width) {
      current.width = width;
      current.height = height;
    } else {
      current.height = Math.max(current.height, height);
    }
    outer.style.minHeight = `${current.height}px`;
  }, []);

  useEffect(() => {
    hold(true);
  }, [resetKey, hold]);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => hold(false));
    observer.observe(inner);
    return () => observer.disconnect();
  }, [hold]);

  return { outerRef, innerRef };
}
