"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { scrollToAnchor } from "@/lib/navigation";
import { useLoading } from "@/components/providers/LoadingContext";

/**
 * Scrolls to the element matching `window.location.hash` once
 * the page has hydrated. Works around Next.js not natively
 * auto-scrolling to hash anchors on client-side navigation.
 */
export default function HashScrollHandler() {
  const pathname = usePathname();
  const { loading } = useLoading();

  useEffect(() => {
    // While the preloader shows, main is one screen tall and nothing can be
    // scrolled to; wait for it, as the browser's own fragment jump would.
    if (loading) return;

    const hash = window.location.hash.slice(1);
    const pendingAnchor = sessionStorage.getItem("pendingAnchor");
    const targetAnchor = pendingAnchor || hash;

    if (!targetAnchor) return;

    let attempts = 0;
    const maxAttempts = 10;

    const retryTimer = setInterval(() => {
      const element = document.getElementById(targetAnchor);
      if (element) {
        // A hash means the page was opened at this section: jump, as the
        // browser would. A pending anchor is a move from another page, which
        // keeps its smooth scroll.
        scrollToAnchor(targetAnchor, pendingAnchor ? "smooth" : "instant");
        // The hash only carried the destination: take it off the address so a
        // reload returns to where the visitor scrolls next, not back here.
        if (window.location.hash) {
          window.history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search,
          );
        }
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
  }, [pathname, loading]);

  return null;
}
