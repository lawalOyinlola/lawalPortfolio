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

const getWidth = () => window.innerWidth;
const getHeight = () => window.innerHeight;
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
