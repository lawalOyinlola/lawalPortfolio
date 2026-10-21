"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { useLoading } from "@/components/providers/LoadingContext";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { setPageRevealed } from "@/lib/pageReveal";
import { scrollToAnchor } from "@/lib/navigation";
import { EASE } from "@/lib/motion";

// How far through the lift the page may start its own entrance animations: far
// enough that the grid is nearly gone, early enough that nothing plays unseen.
const REVEAL_AT_PROGRESS = 0.6;

// The longest the cover waits for the next page before lifting anyway, so a
// stalled request can never leave the site hidden behind it.
const ARRIVAL_TIMEOUT_MS = 4000;

// Moving around inside one of these (a post to the next post, the index to a
// lab) is reading, not changing section: a quick fade keeps the grid from
// becoming a toll paid on every click.
const READING_AREAS = ["/blog", "/security/labs"];

type Mode = "grid" | "fade";

interface Target {
  pathname: string;
  /** Path and query, without the hash. */
  href: string;
  /** The section to land on, if the link names one. */
  hash: string;
}

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * The fragment as an element id. A malformed escape such as "#50%" cannot be
 * decoded, so it is used as written rather than throwing out of the click.
 */
function fragmentId(hash: string) {
  const raw = hash.slice(1);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** Where a click on this link would take the visitor, if it is a plain page change. */
function internalTarget(anchor: HTMLAnchorElement): Target | null {
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  // Files such as /blog/rss.xml are not pages: the browser opens those itself.
  if (/\.[a-z0-9]+$/i.test(url.pathname)) return null;
  // Same page, even with a different query or an anchor: the cover lifts when
  // the pathname changes, so it would wait for the timeout, and an anchor here
  // keeps its own smooth scroll. An anchor on another page does go through
  // the cover, which lands on that section instead of the top.
  if (url.pathname === window.location.pathname) return null;
  return {
    pathname: url.pathname,
    href: url.pathname + url.search,
    hash: fragmentId(url.hash),
  };
}

function readingArea(pathname: string) {
  return READING_AREAS.find(
    (area) => pathname === area || pathname.startsWith(`${area}/`),
  );
}

/**
 * Page changes from the footer, links and buttons on a page: the preloader's
 * grid rises to cover the screen, the route changes underneath it, then the
 * grid lifts away on the new page, at the top or at the section the link
 * names. Within a reading area,
 * and for reduced motion, a short fade stands in for the grid. Links inside a
 * dialog, such as the menu overlay, are left alone since those already have
 * their own exit. Skipped while the intro is still playing, and for anything
 * that is not a plain same-site page change.
 */
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const { showPreloader } = useLoading();
  const { isMobile, isMounted } = useWindowDimensions();
  const columnCount = isMounted && isMobile ? 8 : 16;

  const overlayRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const arrivedRef = useRef<(() => void) | null>(null);
  const introRef = useRef(showPreloader);

  useEffect(() => {
    introRef.current = showPreloader;
  }, [showPreloader]);

  // The new route has rendered: let the cover know it can lift.
  useEffect(() => {
    arrivedRef.current?.();
  }, [pathname]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const tweens: gsap.core.Tween[] = [];

    const play = async (target: Target, mode: Mode) => {
      busyRef.current = true;
      // Fetched while the cover comes down, so it is usually ready on landing.
      router.prefetch(target.href);

      const columns = overlay.querySelectorAll(".pt-col");
      const fade = overlay.querySelector(".pt-fade");
      gsap.set(overlay, { display: "block" });
      gsap.set(columns, { yPercent: 100 });
      gsap.set(fade, { opacity: 0 });

      const stagger: gsap.StaggerVars = {
        grid: [1, columns.length],
        from: "center",
        amount: 0.15,
      };
      await new Promise<void>((resolve) => {
        tweens.push(
          mode === "grid"
            ? gsap.to(columns, {
                yPercent: 0,
                duration: 0.4,
                ease: EASE.inOut,
                stagger,
                onComplete: resolve,
              })
            : gsap.to(fade, {
                opacity: 1,
                duration: 0.15,
                ease: "power1.out",
                onComplete: resolve,
              }),
        );
      });

      const arrived = new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, ARRIVAL_TIMEOUT_MS);
        arrivedRef.current = () => {
          clearTimeout(timer);
          resolve();
        };
      });
      // The home page runs its own entrance (the hero and its scroll
      // animations), which does not fit being held back, so it is left out.
      if (target.pathname !== "/") setPageRevealed(false);
      // With a section named, the scroll below places it; Next's own scroll
      // would race it.
      if (target.hash) {
        router.push(`${target.href}#${target.hash}`, { scroll: false });
      } else {
        router.push(target.href);
      }
      await arrived;
      arrivedRef.current = null;

      // Under the cover, so the jump is never seen. Landing on a section also
      // moves focus there, as a same-page anchor does.
      if (target.hash && document.getElementById(target.hash)) {
        scrollToAnchor(target.hash, "instant");
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      await nextFrame();
      await nextFrame();

      await new Promise<void>((resolve) => {
        const onUpdate = () => {
          if (lift.progress() >= REVEAL_AT_PROGRESS) setPageRevealed(true);
        };
        const lift: gsap.core.Tween =
          mode === "grid"
            ? gsap.to(columns, {
                yPercent: -100,
                duration: 0.65,
                ease: "power4.inOut",
                stagger: { ...stagger, amount: 0.2 },
                onUpdate,
                onComplete: resolve,
              })
            : gsap.to(fade, {
                opacity: 0,
                duration: 0.25,
                ease: "power1.inOut",
                onUpdate,
                onComplete: resolve,
              });
        tweens.push(lift);
      });
      setPageRevealed(true);
      gsap.set(overlay, { display: "none" });
      busyRef.current = false;
    };

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      if (busyRef.current || introRef.current) return;

      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor || anchor.closest('[role="dialog"], [data-no-transition]'))
        return;
      const target = internalTarget(anchor);
      if (!target) return;

      const area = readingArea(target.pathname);
      const mode: Mode =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        (area && area === readingArea(window.location.pathname))
          ? "fade"
          : "grid";

      // Stop the link's own handler too: this takes over the navigation.
      event.preventDefault();
      event.stopPropagation();
      void play(target, mode);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      tweens.forEach((tween) => tween.kill());
      arrivedRef.current = null;
      busyRef.current = false;
      setPageRevealed(true);
      gsap.set(overlay, { display: "none" });
    };
  }, [router]);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="fixed inset-0 z-90 hidden overflow-hidden"
    >
      {/* Each column overlaps the next by a pixel: at fractional widths,
          edge-to-edge columns leave hairline gaps mid-animation. */}
      <div className="absolute inset-0 flex">
        {[...Array(columnCount)].map((_, i) => (
          <div
            key={i}
            className="pt-col h-full flex-1 -mr-px last:mr-0 bg-foreground"
          />
        ))}
      </div>
      <div className="pt-fade absolute inset-0 bg-background opacity-0" />
    </div>
  );
}
