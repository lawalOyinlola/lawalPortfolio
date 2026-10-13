"use client";

import { useSyncExternalStore } from "react";
import { useIsHydrated } from "./useIsHydrated";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mediaQuery = window.matchMedia(QUERY);
  // Use addEventListener if supported, fallback to addListener for older browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }
  mediaQuery.addListener(onChange);
  return () => mediaQuery.removeListener(onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;

// Assume reduced motion until the client says otherwise, so nothing animates
// before the real preference is known.
const getServerSnapshot = () => true;

/**
 * Hook that returns whether the user prefers reduced motion.
 * Uses window.matchMedia('(prefers-reduced-motion: reduce)')
 */
export function usePrefersReducedMotion() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const isHydrated = useIsHydrated();

  return { prefersReducedMotion, isHydrated };
}
