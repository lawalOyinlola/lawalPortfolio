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

    // Give the page a moment to hydrate before scrolling
    const timer = setTimeout(() => {
      scrollToAnchor(targetAnchor);
      if (pendingAnchor) {
        sessionStorage.removeItem("pendingAnchor");
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
