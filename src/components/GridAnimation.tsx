"use client";

import { RefObject, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

// Resting V-shape profile (as % of full-screen container height).
// Intentionally capped near ~2/3 so the blackout can "close" to 100% on scroll.
const V_HEIGHTS = [
  27, 20, 24, 28, 40, 28, 42, 56, 60, 50, 40, 30, 16, 22, 18, 16,
];
const COLUMN_COUNT = V_HEIGHTS.length;
const CENTER = (COLUMN_COUNT - 1) / 2;

// Fixed speed/delay table; avoids Math.random() on every re-render/resize.
// Generated once at module load time and never changes.
const FIXED_SPEEDS: number[] = V_HEIGHTS.map(
  (_, i) => 2.2 + ((i * 37 + 13) % 100) / 43.5,
);
const FIXED_DELAYS: number[] = V_HEIGHTS.map(
  (_, i) => ((i * 53 + 7) % 100) / 66.7,
);

// Both modes move with the scroll rather than on a timer, so they can never
// lag behind a fast scroll: hero mode closes, partners mode opens. Each
// column eases on its own, and the outermost columns start this far into the
// scroll range after the centre ones, so the grid moves as a wave rather than
// one block sliding at a constant speed.
// The open eases more gently than the close: it plays across the whole
// section entering, and a steep curve there reads as a rush.
const SCRUB_STAGGER = 0.2;
const CLOSE_EASE = "power2.inOut";
const OPEN_EASE = "sine.inOut";

function getColumnConfig(
  i: number,
  isMobile: boolean,
  isSE: boolean,
): { lo: number; hi: number; speed: number; delay: number } {
  const rawHeight = V_HEIGHTS[i];
  const height = isSE
    ? rawHeight * 0.5
    : isMobile
      ? rawHeight * 0.65
      : rawHeight;

  const base = -(100 - height);
  const dist = Math.abs(i - CENTER) / CENTER;

  const baseOscillation = 6 + dist * 10;
  const oscillation = isSE
    ? baseOscillation * 0.5
    : isMobile
      ? baseOscillation * 0.7
      : baseOscillation;

  // Use fixed (stable) speed and delay values
  const speed = FIXED_SPEEDS[i];
  const delay = FIXED_DELAYS[i];

  return { lo: base - oscillation, hi: base + oscillation, speed, delay };
}

interface GridAnimationProps {
  ready?: boolean;
  triggerRef?: RefObject<HTMLElement | null>;
  invertDirection?: boolean;
  scrubStart?: boolean;
  shutterClassName?: string;
  className?: string;
}

const GridAnimation = ({
  ready = true,
  triggerRef,
  invertDirection = false,
  scrubStart = false,
  shutterClassName = "bg-foreground",
  className = "",
}: GridAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile, isSE } = useWindowDimensions();
  const { prefersReducedMotion } = usePrefersReducedMotion();

  useGSAP(
    () => {
      const shutters = gsap.utils.toArray<HTMLDivElement>(
        ".grid-shutter",
        containerRef.current,
      );

      // Sync GSAP's transform state with the inline CSS starting position.
      // Without this, GSAP would read yPercent as 0 (open) and animate incorrectly.
      gsap.set(shutters, { yPercent: -100 });

      if (prefersReducedMotion) {
        shutters.forEach((shutter, i) => {
          const { hi } = getColumnConfig(i, isMobile, isSE);
          gsap.set(shutter, { yPercent: hi });
        });
        return;
      }

      const triggerEl = triggerRef?.current ?? containerRef.current;
      if (!triggerEl) return;

      // Partners mode starts fully closed and only opens once it can scrub.
      if (scrubStart && !ready) {
        gsap.set(shutters, { yPercent: 0 });
        return;
      }

      const COLUMN_CONFIGS = V_HEIGHTS.map((_, i) =>
        getColumnConfig(i, isMobile, isSE),
      );

      // Each column's resting height, moved by the intro and the oscillation.
      // A ticker scales it by scroll progress and writes the result, so the
      // time-based and scroll-based motion never fight over yPercent.
      const heights = COLUMN_CONFIGS.map((c) => ({
        y: scrubStart ? c.hi : -100,
      }));
      // quickSetter writes straight to the element: no tween is created per
      // column per frame, which is what made the old ticker stutter.
      const setters = shutters.map(
        (shutter) =>
          gsap.quickSetter(shutter, "yPercent") as (value: number) => void,
      );

      const oscillationTweens = heights.map((height, i) => {
        const { lo, hi, speed, delay } = COLUMN_CONFIGS[i];
        return gsap.fromTo(
          height,
          { y: hi },
          {
            y: lo,
            duration: speed,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay,
            paused: true,
            immediateRender: false,
          },
        );
      });

      // 0 → 1 as the section scrolls. Partners mode opens with it; hero mode
      // closes with it. Centre columns first in both.
      const scroll = { p: 0 };
      const scrubEase = gsap.parseEase(scrubStart ? OPEN_EASE : CLOSE_EASE);
      const scrubDelays = COLUMN_CONFIGS.map(
        (_, i) => (Math.abs(i - CENTER) / CENTER) * SCRUB_STAGGER,
      );
      const factor = (i: number) => {
        const local = gsap.utils.clamp(
          0,
          1,
          (scroll.p - scrubDelays[i]) / (1 - SCRUB_STAGGER),
        );
        return scrubStart ? scrubEase(local) : 1 - scrubEase(local);
      };

      // Below md every other column is hidden (see the markup): nothing is
      // written to those, and their oscillation never plays. Read from the
      // same media query as the max-md class, so the two always agree.
      const belowMd = window.matchMedia("(width < 48rem)").matches;
      const shown = (i: number) => !belowMd || i % 2 === 0;
      const liveTweens = oscillationTweens.filter((_, i) => shown(i));

      // Fully closed, nothing moves: skip the writes until scrolling resumes.
      let wasSettled = false;
      const render = () => {
        const settled = scrubStart ? scroll.p === 0 : scroll.p === 1;
        if (settled && wasSettled) return;
        wasSettled = settled;
        heights.forEach((height, i) => {
          if (shown(i)) setters[i](height.y * factor(i));
        });
      };

      const scrollTween = gsap.to(scroll, {
        p: 1,
        ease: "none",
        scrollTrigger: scrubStart
          ? {
              trigger: triggerEl,
              start: "top bottom",
              end: "10% top",
              scrub: 0.6,
            }
          : { trigger: triggerEl, start: "8% top", end: "80% top", scrub: 1 },
      });

      // Off screen, the ticker and the oscillation both stop: nothing runs
      // for a section nobody can see.
      let oscillating = scrubStart;
      let active = false;
      const setActive = (next: boolean) => {
        if (next === active) return;
        active = next;
        if (active) {
          wasSettled = false;
          gsap.ticker.add(render);
          if (oscillating) liveTweens.forEach((t) => t.play());
        } else {
          gsap.ticker.remove(render);
          liveTweens.forEach((t) => t.pause());
        }
      };
      const visibility = ScrollTrigger.create({
        trigger: triggerEl,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => setActive(self.isActive),
      });

      let introTimeline: gsap.core.Timeline | null = null;
      if (!scrubStart && ready) {
        introTimeline = gsap.timeline({
          onComplete: () => {
            oscillating = true;
            if (active) liveTweens.forEach((t) => t.play());
          },
        });
        heights.forEach((height, i) => {
          const dist = Math.abs(i - CENTER) / CENTER;
          introTimeline?.to(
            height,
            { y: COLUMN_CONFIGS[i].hi, duration: 2, ease: "power3.out" },
            dist * 0.7,
          );
        });
      }

      render();
      setActive(visibility.isActive);

      return () => {
        gsap.ticker.remove(render);
        visibility.kill();
        scrollTween.scrollTrigger?.kill();
        scrollTween.kill();
        introTimeline?.kill();
        oscillationTweens.forEach((t) => {
          t.kill();
        });
      };
    },
    {
      scope: containerRef,
      // Re-run when layout-affecting state changes. isMobile/isSE are debounced
      // in useWindowDimensions, so this won't thrash on every resize pixel.
      dependencies: [ready, scrubStart, prefersReducedMotion, isMobile, isSE],
      // Without this the previous run (say, the one from before the intro was
      // ready) is never cleaned up: its ticker keeps writing its own heights
      // to the same columns, and whichever ticker runs last wins.
      revertOnUpdate: true,
    },
  );

  return (
    <div
      ref={containerRef}
      className={`flex h-full w-full ${invertDirection ? "rotate-180" : ""} ${className}`}
    >
      {[...Array(COLUMN_COUNT)].map((_, i) => (
        <div
          key={i}
          className={`relative h-full flex-1 overflow-hidden ${
            i % 2 !== 0 ? "max-md:hidden" : ""
          }`}
        >
          {/* Its own compositor layer: the setter writes a 2D translate every
              frame, which would otherwise repaint the section each time. */}
          <div
            className={`grid-shutter absolute inset-0 will-change-transform ${shutterClassName}`}
          />
        </div>
      ))}
    </div>
  );
};

export default GridAnimation;
