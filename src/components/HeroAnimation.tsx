"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const COLUMN_COUNT = 16;
const CENTER = (COLUMN_COUNT - 1) / 2;
const FULL_HEIGHT_INDICES = new Set([0, 7, 8]);

// V-shape profile: percentage of container height each column covers.
// Center columns are tallest, edges taper off. Slight asymmetry for a natural feel.
const V_HEIGHTS = [
  28, 34, 40, 48, 55, 63, 72, 82, 80, 70, 60, 50, 42, 35, 28, 22,
];

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
  let hi = base + oscillation;

  if (FULL_HEIGHT_INDICES.has(i)) {
    hi = 0;
  }

  return { lo, hi, speed, delay };
}

const COLUMN_CONFIGS = V_HEIGHTS.map((_, i) => getColumnConfig(i));

interface HeroAnimationProps {
  ready?: boolean;
}

const HeroAnimation = ({ ready = true }: HeroAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const shutters = gsap.utils.toArray<HTMLDivElement>(".hero-shutter");

      gsap.set(shutters, { yPercent: -100 });

      if (!ready) return;

      // Phase 1: Columns descend from above into their V-shape positions,
      // staggered from center outward (mirrors the preloader exit).
      const intro = gsap.timeline();

      shutters.forEach((shutter, i) => {
        const { hi } = COLUMN_CONFIGS[i];
        const dist = Math.abs(i - CENTER) / CENTER;

        intro.to(
          shutter,
          {
            yPercent: hi,
            duration: 2,
            ease: "power3.out",
            stagger: {
              grid: [1, COLUMN_COUNT],
              from: "center",
              amount: 0.9,
            },
          },
          dist * 0.7,
        );
      });

      // Phase 2: Once the intro lands, kick off the continuous oscillation.
      intro.call(() => {
        shutters.forEach((shutter, i) => {
          const { lo, hi, speed, delay } = COLUMN_CONFIGS[i];

          gsap.fromTo(
            shutter,
            { yPercent: hi },
            {
              yPercent: lo,
              duration: speed,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              delay,
            },
          );
        });
      });
    },
    { scope: containerRef, dependencies: [ready] },
  );

  return (
    <div ref={containerRef} className="flex h-2/3 w-full">
      {[...Array(COLUMN_COUNT)].map((_, i) => (
        <div key={i} className="relative h-full flex-1 overflow-hidden">
          <div className="hero-shutter absolute inset-0 bg-foreground" />
        </div>
      ))}
    </div>
  );
};

export default HeroAnimation;
