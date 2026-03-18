"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { scrollToAnchor } from "@/lib/navigation";

/**
 * Scrolls to the element matching `window.location.hash` once
 * the page has hydrated. Works around Next.js not natively
 * auto-scrolling to hash anchors on client-side navigation.
 */
export default function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const pendingAnchor = sessionStorage.getItem("pendingAnchor");
    const targetAnchor = pendingAnchor || hash;

    if (!targetAnchor) return;

    let attempts = 0;
    const maxAttempts = 10;

    const retryTimer = setInterval(() => {
      const element = document.getElementById(targetAnchor);
      if (element) {
        scrollToAnchor(targetAnchor);
        if (pendingAnchor) {
          sessionStorage.removeItem("pendingAnchor");
        }
        clearInterval(retryTimer);
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          if (pendingAnchor) {
            sessionStorage.removeItem("pendingAnchor");
          }
          clearInterval(retryTimer);
        }
      }
    }, 100);

    return () => clearInterval(retryTimer);
  }, [pathname]);

  return null;
}
