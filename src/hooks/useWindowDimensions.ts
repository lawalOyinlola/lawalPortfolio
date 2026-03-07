"use client";

import { useState, useEffect } from "react";

export function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timer: NodeJS.Timeout;
    const handleResize = () => {
      // Debounce resize updates
      clearTimeout(timer);
      timer = setTimeout(() => {
        setWindowDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  const isMobile = windowDimensions.width > 0 && windowDimensions.width < 768;
  const isSE =
    windowDimensions.width > 0 &&
    windowDimensions.height < 670 &&
    windowDimensions.width < 400;

  return { ...windowDimensions, isMobile, isSE };
}
