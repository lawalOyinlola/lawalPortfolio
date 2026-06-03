"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { BRAND } from "../app/constants/brand";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, SplitText);
}

interface PreloaderProps {
  setComplete: (value: boolean) => void;
}

const brandName = BRAND.shortName;

export default function Preloader({ setComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLHeadingElement>(null);
  const { isMobile, isMounted } = useWindowDimensions();
  const { prefersReducedMotion, isHydrated: isMotionHydrated } =
    usePrefersReducedMotion();

  // Responsive column count: fewer columns on mobile for clarity
  const columnCount = isMounted ? (isMobile ? 8 : 16) : 16;

  useGSAP(
    () => {
      if (!isMotionHydrated) return;

      // Reduced motion: brief hold, no flip or grid lift.
      if (prefersReducedMotion) {
        const timer = setTimeout(() => setComplete(true), 500);
        return () => clearTimeout(timer);
      }

      if (!brandRef.current) return;

      const split = new SplitText(brandRef.current, {
        type: "chars",
        charsClass: "char inline-block",
      });

      const tl = gsap.timeline({
        delay: 0.2,
        onComplete: () => setComplete(true),
      });

      tl
        // LAWAL → flip each char to mirrored (backwards)
        .to(split.chars, {
          scaleX: -1,
          ease: "expo.inOut",
          duration: 0.6,
          stagger: { amount: 0.5, from: "start" },
        })
        // brand exits
        .to(brandRef.current, { autoAlpha: 0, duration: 0.3 }, "+=0.25")
        // grid slides up to reveal the page
        .to(
          ".column",
          {
            yPercent: -100,
            duration: 1.0,
            ease: "power4.inOut",
            stagger: { grid: [1, columnCount], from: "center", amount: 0.4 },
          },
          "-=0.1",
        )
        .set(containerRef.current, { display: "none" });

      return () => {
        tl.kill();
        split.revert();
      };
    },
    {
      scope: containerRef,
      dependencies: [columnCount, prefersReducedMotion, isMotionHydrated],
      revertOnUpdate: true,
    },
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-99 flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Grid of columns that lifts away to reveal the page */}
      <div className="absolute inset-0 flex" aria-hidden="true">
        {[...Array(columnCount)].map((_, i) => (
          <div key={i} className="column h-full flex-1 bg-foreground" />
        ))}
      </div>

      {/* Brand name */}
      <h1
        ref={brandRef}
        aria-label={brandName}
        className="relative z-10 title text-background text-[clamp(3rem,15vw,9rem)] text-center select-none pointer-events-none"
      >
        {brandName}
      </h1>
    </div>
  );
}
