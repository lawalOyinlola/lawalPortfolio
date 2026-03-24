"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Preloader from "./Preloader";
import Footer from "./Footer";
import { useLoading } from "./providers/LoadingContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { loading, setLoading } = useLoading();
  const [forceUnlock, setForceUnlock] = useState(false);
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (loading) {
      timeoutId = setTimeout(() => {
        setForceUnlock(true);
      }, 10000); // 10s fallback
    } else {
      setForceUnlock(false);
    }
    return () => clearTimeout(timeoutId);
  }, [loading]);

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
    <main
      ref={mainRef}
      className={`relative min-h-screen overflow-x-clip bg-background ${loading && !forceUnlock ? "overflow-hidden h-screen" : ""}`}
    >
      {loading && <Preloader setComplete={() => setLoading(false)} />}

      <div
        className={`relative z-10 bg-background transition-opacity duration-800 ${loading ? "opacity-0 invisible" : "opacity-100 visible"}`}
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
  );
}
