"use client";

import { useSyncExternalStore } from "react";
import { useIsHydrated } from "./useIsHydrated";

// Resizes are debounced so a drag doesn't re-render every subscriber per frame.
function subscribe(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const handleResize = () => {
    clearTimeout(timer);
    timer = setTimeout(onChange, 300);
  };

  window.addEventListener("resize", handleResize);
  window.addEventListener("orientationchange", handleResize);

  return () => {
    clearTimeout(timer);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleResize);
  };
}

// A phone resizes the window each time its toolbar slides in or out on
// scroll. On touch screens the height is only re-read when the width changes
// too (a rotation, a split view), so that slide never flips the layout flags
// below mid-scroll and rebuilds what depends on them.
let stableHeight = 0;
let stableHeightWidth = 0;

const getWidth = () => window.innerWidth;
const getHeight = () => {
  const width = window.innerWidth;
  if (
    !stableHeight ||
    width !== stableHeightWidth ||
    !window.matchMedia("(pointer: coarse)").matches
  ) {
    stableHeight = window.innerHeight;
    stableHeightWidth = width;
  }
  return stableHeight;
};
const getServerSize = () => 0;

export function useWindowDimensions() {
  const width = useSyncExternalStore(subscribe, getWidth, getServerSize);
  const height = useSyncExternalStore(subscribe, getHeight, getServerSize);
  const isMounted = useIsHydrated();

  const isMobile = isMounted && width > 0 && width < 768;
  const isSE = isMounted && width > 0 && height < 670 && width < 400;

  const zFold = isMounted && width > 0 && width < 350 && height > 700;

  return { width, height, isMobile, isSE, isMounted, zFold };
}
