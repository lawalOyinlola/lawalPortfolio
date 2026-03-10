"use client";

import { useState, useEffect } from "react";

export function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const updateDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const handleResize = () => {
      clearTimeout(timer);
      timer = setTimeout(updateDimensions, 150);
    };

    updateDimensions();
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
