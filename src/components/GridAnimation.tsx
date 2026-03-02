"use client";

import { RefObject, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Resting V-shape profile (as % of full-screen container height).
// Intentionally capped near ~2/3 so the blackout can "close" to 100% on scroll.
const V_HEIGHTS = [
  27, 20, 24, 28, 40, 28, 42, 56, 60, 50, 40, 30, 16, 22, 18, 16,
];
const COLUMN_COUNT = V_HEIGHTS.length;
const CENTER = (COLUMN_COUNT - 1) / 2;

function getColumnConfig(i: number) {
  const height = V_HEIGHTS[i];
  // yPercent 0 = full coverage, yPercent -100 = empty.
  // A column at 80% height means the shutter is shifted up 20% → yPercent: -20
  const base = -(100 - height);

  const dist = Math.abs(i - CENTER) / CENTER;
  const oscillation = 6 + dist * 10;
  const speed = 2.2 + Math.random() * 2.3;
  const delay = Math.random() * 1.5;

  const lo = base - oscillation;
  const hi = base + oscillation;

  return { lo, hi, speed, delay };
}

const COLUMN_CONFIGS = V_HEIGHTS.map((_, i) => getColumnConfig(i));

interface GridAnimationProps {
  ready?: boolean;
  triggerRef?: RefObject<HTMLElement | null>;
  invertDirection?: boolean;
  scrubStart?: boolean;
}

const GridAnimation = ({ 
  ready = true, 
  triggerRef, 
  invertDirection = false, 
  scrubStart = false 
}: GridAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const shutters = gsap.utils.toArray<HTMLDivElement>(".grid-shutter");
      const oscillationTweens: gsap.core.Tween[] = [];
      let introTimeline: gsap.core.Timeline | null = null;
      let scrubTimeline: gsap.core.Timeline | null = null;

      const triggerEl = containerRef.current;
      if (!triggerEl) return;

      const setOscillationPaused = (paused: boolean) => {
        oscillationTweens.forEach((tween) => tween.paused(paused));
      };

      // 1. Setup continuous oscillation tweens (always initially paused)
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
          },
        );
        oscillationTweens.push(tween);
      });

      if (scrubStart) {
        // --- PARTNERS SECTION MODE (Scrub to Open) ---
        gsap.set(shutters, { yPercent: 0 }); // Start fully closed
        setOscillationPaused(true);

        // Scrub timeline gradually moves the shutters to their `hi` target config
        scrubTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: triggerEl,
            start: "top bottom", // Starts as soon as the top of container hits the bottom of viewport
            end: "14% top",     // Ends when 20% of the container has scrolled past the top
            scrub: true,
            onEnter: () => setOscillationPaused(true),
            onLeave: () => setOscillationPaused(false), // Resume oscillation when fully opened
            onEnterBack: () => setOscillationPaused(true),
            // if we scroll all the way back up, it stays closed
          }
        });

        shutters.forEach((shutter, i) => {
          const { hi } = COLUMN_CONFIGS[i];
          scrubTimeline?.to(shutter, {
            yPercent: hi,
            ease: "none",
          }, 0); // all start at time 0
        });

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
        const timer = setTimeout(st.refresh, 100);
        return () => clearTimeout(timer);
      }
    },
    { scope: containerRef, dependencies: [ready, triggerRef, scrubStart] },
  );

  return (
    <div 
      ref={containerRef} 
      className={`flex h-full w-full ${invertDirection ? "rotate-180" : ""}`}
    >
      {[...Array(COLUMN_COUNT)].map((_, i) => (
        <div key={i} className="relative h-full flex-1 overflow-hidden">
          <div className="grid-shutter absolute inset-0 bg-foreground" />
        </div>
      ))}
    </div>
  );
};

export default GridAnimation;
