"use client";

import { useState, useEffect } from "react";

/**
 * Hook that returns whether the user prefers reduced motion.
 * Uses window.matchMedia('(prefers-reduced-motion: reduce)')
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Use addEventListener if supported, fallback to addListener for older browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      (mediaQuery as any).addListener(handler);
      return () => {
        (mediaQuery as any).removeListener(handler);
      };
    }
  }, []);

  return prefersReducedMotion;
}
