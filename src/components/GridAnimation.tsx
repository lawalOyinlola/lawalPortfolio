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

function getColumnConfig(i: number, isMobile: boolean, isSE: boolean) {
  const rawHeight = V_HEIGHTS[i];
  // On mobile, reduce the base height so it doesn't take up too much vertical space
  const height = isSE
    ? rawHeight * 0.5
    : isMobile
      ? rawHeight * 0.65
      : rawHeight;

  // yPercent 0 = full coverage, yPercent -100 = empty.
  const base = -(100 - height);

  const dist = Math.abs(i - CENTER) / CENTER;
  // Reduce oscillation magnitude on mobile to complement the scaled-down heights
  const baseOscillation = 6 + dist * 10;
  const oscillation = isSE
    ? baseOscillation * 0.5
    : isMobile
      ? baseOscillation * 0.7
      : baseOscillation;

  const speed = 2.2 + Math.random() * 2.3;
  const delay = Math.random() * 1.5;

  const lo = base - oscillation;
  const hi = base + oscillation;

  return { lo, hi, speed, delay };
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
  const { isMobile, isSE, width, height } = useWindowDimensions();
  const { prefersReducedMotion } = usePrefersReducedMotion();

  useGSAP(
    () => {
      const shutters = gsap.utils.toArray<HTMLDivElement>(
        ".grid-shutter",
        containerRef.current,
      );

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

      const scrubTargets = COLUMN_CONFIGS.map((c) => ({ y: c.hi }));
      const activeTargets = scrubStart ? scrubTargets : shutters;

      const setOscillationPaused = (paused: boolean) => {
        oscillationTweens.forEach((tween) => tween.paused(paused));
      };

      // Setup oscillation tweens
      activeTargets.forEach((target, i) => {
        const { lo, hi, speed, delay } = COLUMN_CONFIGS[i];
        const tween = gsap.fromTo(
          target,
          scrubStart ? { y: hi } : { yPercent: hi },
          {
            ...(scrubStart ? { y: lo } : { yPercent: lo }),
            duration: speed,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay,
            paused: !scrubStart,
            overwrite: "auto",
          },
        );
        oscillationTweens.push(tween);
      });

      let tickerUpdater: (() => void) | null = null;

      if (scrubStart) {
        // --- PARTNERS SECTION MODE (Scrub to Open) ---
        const mProxy = { m: 0 };

        // This ticker continuously applies the scrub scale to the running oscillation,
        // allowing flawless synchronization when scrubbing backwards from the current position!
        tickerUpdater = () => {
          shutters.forEach((shutter, i) => {
            gsap.set(shutter, {
              yPercent: scrubTargets[i].y * mProxy.m,
            });
          });
        };
        gsap.ticker.add(tickerUpdater);

        if (!ready) {
          return () => {
            if (tickerUpdater) gsap.ticker.remove(tickerUpdater);
            oscillationTweens.forEach((tween) => tween.kill());
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
          if (tickerUpdater) gsap.ticker.remove(tickerUpdater);
          oscillationTweens.forEach((tween) => tween.kill());
        };
      } else {
        // --- HERO SECTION MODE (Normal Intro) ---
        let capturedHeights: number[] = [];
        let closeTween: gsap.core.Tween | null = null;
        let restoreTween: gsap.core.Tween | null = null;

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
            gsap.set(shutters, { yPercent: -100 });
            gsap.set(containerRef.current, { yPercent: 0 });

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
        };
      }
    },
    {
      scope: containerRef,
      dependencies: [
        ready,
        triggerRef,
        scrubStart,
        width,
        height,
        prefersReducedMotion,
      ],
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
