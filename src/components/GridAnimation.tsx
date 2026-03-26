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

// Fixed speed/delay table — avoids Math.random() on every re-render/resize.
// Generated once at module load time and never changes.
const FIXED_SPEEDS: number[] = V_HEIGHTS.map(
  (_, i) => 2.2 + ((i * 37 + 13) % 100) / 43.5,
);
const FIXED_DELAYS: number[] = V_HEIGHTS.map(
  (_, i) => ((i * 53 + 7) % 100) / 66.7,
);

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

      const COLUMN_CONFIGS = V_HEIGHTS.map((_, i) =>
        getColumnConfig(i, isMobile, isSE),
      );

      const oscillationTweens: gsap.core.Tween[] = [];
      let introTimeline: gsap.core.Timeline | null = null;
      let scrubTimeline: gsap.core.Timeline | null = null;

      const triggerEl = triggerRef?.current ?? containerRef.current;
      if (!triggerEl) return;

      const setOscillationPaused = (paused: boolean) => {
        oscillationTweens.forEach((tween) => {
          tween.paused(paused);
        });
      };

      if (scrubStart) {
        // --- PARTNERS SECTION MODE (Scrub to Open) ---
        const scrubTargets = COLUMN_CONFIGS.map((c) => ({ y: c.hi }));

        scrubTargets.forEach((target, i) => {
          const { lo, hi, speed, delay } = COLUMN_CONFIGS[i];
          const tween = gsap.fromTo(
            target,
            { y: hi },
            {
              y: lo,
              duration: speed,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              delay,
              immediateRender: false,
            },
          );
          oscillationTweens.push(tween);
        });

        const mProxy = { m: 0 };
        const tickerUpdater = () => {
          shutters.forEach((shutter, i) => {
            gsap.set(shutter, { yPercent: scrubTargets[i].y * mProxy.m });
          });
        };
        gsap.ticker.add(tickerUpdater);

        if (!ready) {
          return () => {
            gsap.ticker.remove(tickerUpdater);
            oscillationTweens.forEach((t) => {
              t.kill();
            });
          };
        }

        scrubTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: triggerEl,
            start: "top bottom",
            end: "10% top",
            scrub: true,
          },
        });
        scrubTimeline.fromTo(mProxy, { m: 0 }, { m: 1, ease: "none" }, 0);

        return () => {
          scrubTimeline?.scrollTrigger?.kill();
          scrubTimeline?.kill();
          gsap.ticker.remove(tickerUpdater);
          oscillationTweens.forEach((t) => {
            t.kill();
          });
        };
      } else {
        // --- HERO SECTION MODE (Normal Intro) ---
        let capturedHeights: number[] = [];
        let closeTween: gsap.core.Tween | null = null;
        let restoreTween: gsap.core.Tween | null = null;

        shutters.forEach((shutter, i) => {
          const { lo, hi, speed, delay } = COLUMN_CONFIGS[i];
          const tween = gsap.fromTo(
            shutter,
            { yPercent: hi },
            {
              yPercent: lo,
              duration: speed,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              delay,
              paused: true,
              overwrite: "auto",
              immediateRender: false,
            },
          );
          oscillationTweens.push(tween);
        });

        const closeFromCurrent = () => {
          capturedHeights = shutters.map((shutter) =>
            Number(gsap.getProperty(shutter, "yPercent")),
          );

          introTimeline?.kill();
          restoreTween?.kill();
          closeTween?.kill();
          setOscillationPaused(true);

          closeTween = gsap.to(shutters, {
            yPercent: 0,
            duration: 2.4,
            ease: "power2.inOut",
            stagger: { amount: 0.14, from: "center" },
            overwrite: "auto",
          });
        };

        const restoreCaptured = () => {
          const targets = capturedHeights.length
            ? (i: number) => capturedHeights[i] ?? 0
            : (i: number) => COLUMN_CONFIGS[i].hi;

          introTimeline?.kill();
          closeTween?.kill();
          restoreTween?.kill();

          restoreTween = gsap.to(shutters, {
            yPercent: targets,
            duration: 2.4,
            ease: "power2.inOut",
            stagger: { amount: 0.12, from: "center" },
            overwrite: "auto",
            onComplete: () => {
              const currentRect = triggerEl.getBoundingClientRect();
              if (currentRect.top > -currentRect.height * 0.1) {
                setOscillationPaused(false);
              }
            },
          });
        };

        const st = ScrollTrigger.create({
          trigger: triggerEl,
          start: "10% top",
          onEnter: closeFromCurrent,
          onLeaveBack: restoreCaptured,
        });

        const initScrollState = () => {
          st.refresh();
          const rect = triggerEl.getBoundingClientRect();
          const isPastTrigger = rect.top <= -rect.height * 0.1;

          if (isPastTrigger) {
            gsap.set(shutters, { yPercent: 0 });
            setOscillationPaused(true);
          } else {
            // Shutters are already pre-set to translateY(-100%) via inline style.
            // Just run the intro animation from where they already are.
            if (!ready) return;

            introTimeline = gsap.timeline();
            shutters.forEach((shutter, i) => {
              const { hi } = COLUMN_CONFIGS[i];
              const dist = Math.abs(i - CENTER) / CENTER;

              introTimeline?.to(
                shutter,
                {
                  yPercent: hi,
                  duration: 2,
                  ease: "power3.out",
                },
                dist * 0.7,
              );
            });

            introTimeline.call(() => {
              const currentRect = triggerEl.getBoundingClientRect();
              if (currentRect.top > -currentRect.height * 0.1) {
                setOscillationPaused(false);
              }
            });
          }
        };

        initScrollState();
        const timer = setTimeout(() => st.refresh(), 100);

        return () => {
          clearTimeout(timer);
          st.kill();
          introTimeline?.kill();
          closeTween?.kill();
          restoreTween?.kill();
          oscillationTweens.forEach((t) => {
            t.kill();
          });
        };
      }
    },
    {
      scope: containerRef,
      // Re-run when layout-affecting state changes. isMobile/isSE are debounced
      // in useWindowDimensions, so this won't thrash on every resize pixel.
      dependencies: [ready, scrubStart, prefersReducedMotion, isMobile, isSE],
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
          <div
            className={`grid-shutter absolute inset-0 ${shutterClassName}`}
          />
        </div>
      ))}
    </div>
  );
};

export default GridAnimation;
