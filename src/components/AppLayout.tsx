"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "./Navbar";
import Preloader from "./Preloader";
import Footer from "./Footer";
import PageTransition from "./PageTransition";
import ScrollMemory from "./ScrollMemory";
import { useLoading } from "./providers/LoadingContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  // The page is revealed as the columns start lifting (`loading` goes false),
  // and the overlay only unmounts once they're gone (`showPreloader`).
  const { loading, setLoading, showPreloader, setShowPreloader } = useLoading();
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  const handleReveal = useCallback(() => setLoading(false), [setLoading]);
  const handleComplete = useCallback(
    () => setShowPreloader(false),
    [setShowPreloader],
  );

  // Fallback: if the intro never finishes (script error, GSAP failing to
  // load), don't leave the page hidden behind it. The full intro runs about
  // 7.5s from hydration, so this leaves room for a slow, janky device
  // without ever cutting a healthy intro short.
  useEffect(() => {
    if (!showPreloader) return;
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setShowPreloader(false);
    }, 15000);
    return () => clearTimeout(timeoutId);
  }, [showPreloader, setLoading, setShowPreloader]);

  // ScrollTrigger measures positions once and only re-measures on window
  // resize. Anything that changes height after mount (a layout waiting on the
  // motion preference, an FAQ opening, a late image) would leave every trigger
  // below it firing early, so re-measure whenever the page's height changes.
  // Never mid-scroll: a refresh puts the scroll position back, which on a
  // phone stops a fling dead and reads as the page shaking. A change made
  // while scrolling waits for the scroll to end.
  useEffect(() => {
    const content = mainRef.current;
    if (!content) return;
    let frame = 0;
    let pending = false;
    let lastHeight = content.offsetHeight;
    const refresh = () => {
      pending = false;
      ScrollTrigger.refresh();
    };
    const onScrollEnd = () => {
      if (pending) refresh();
    };
    const observer = new ResizeObserver(() => {
      const height = content.offsetHeight;
      if (height === lastHeight) return;
      lastHeight = height;
      pending = true;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!ScrollTrigger.isScrolling()) refresh();
      });
    });
    observer.observe(content);
    ScrollTrigger.addEventListener("scrollEnd", onScrollEnd);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      ScrollTrigger.removeEventListener("scrollEnd", onScrollEnd);
    };
  }, []);

  // Accessibility: Reset focus to main container on page change (if no anchor)
  useEffect(() => {
    if (
      !loading &&
      pathname &&
      typeof window !== "undefined" &&
      !window.location.hash
    ) {
      // Small delay to ensure the page has updated its layout
      const timer = setTimeout(() => {
        if (mainRef.current) {
          mainRef.current.setAttribute("tabindex", "-1");
          mainRef.current.focus({ preventScroll: true });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname, loading]);

  return (
    <>
      {showPreloader && (
        <Preloader onReveal={handleReveal} onComplete={handleComplete} />
      )}

      <PageTransition />
      <ScrollMemory ready={!loading} />

      <main
        ref={mainRef}
        className={`app-shell relative min-h-screen overflow-x-clip bg-background ${loading ? "overflow-hidden h-screen" : ""}`}
      >
        <div
          className={`app-content relative z-10 bg-background ${loading ? "opacity-0 invisible" : "opacity-100 visible"}`}
        >
          <Navbar ready={!loading} />
          {children}
          {/* Tail section that reveals footer underneath */}
          <div
            id="footer-reveal-sentinel"
            className="h-[20vh] pointer-events-none"
          />
          <Footer className="sticky inset-x-0 bottom-0 h-screen z-0" />
        </div>
      </main>
    </>
  );
}
