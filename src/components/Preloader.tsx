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

const PROGRESS_DURATION = 9.0;
const brandName = BRAND.shortName;

// Sweep covers the left half of columns; at p=1 the front sits at grid center.
const colCentre = (i: number, halfCols: number) => (i + 0.5) / halfCols;

export default function Preloader({ setComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLHeadingElement>(null);
  const sloganRef = useRef<HTMLSpanElement>(null);
  const progressProxy = useRef({ value: 0 });
  const { isMobile, isMounted } = useWindowDimensions();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Responsive column count: fewer columns on mobile for clarity
  const columnCount = isMounted ? (isMobile ? 8 : 16) : 16;
  const halfCols = columnCount / 2;
  const waveHalf = 1 / halfCols;

  // Brand-name flip
  useGSAP(
    () => {
      if (!brandRef.current || prefersReducedMotion) return;

      const split = new SplitText(brandRef.current, {
        type: "words,chars",
        charsClass: "char inline-block",
      });

      gsap.to(split.chars, {
        scaleX: -1,
        ease: "expo.inOut",
        duration: 1.2,
        stagger: { amount: 0.8, from: "start" },
        repeat: 2,
        yoyo: true,
      });

      return () => split.revert();
    },
    { scope: containerRef },
  );

  // Main time-based progress + exit
  useGSAP(
    () => {
      const startProgress = progressProxy.current.value;
      gsap.set(".progress-trail", { width: `${startProgress * 50}%` });
      gsap.set(".pct-tip", { left: `${startProgress * 50}%` });
      gsap.set(".slogan-foreground", { opacity: 0 });

      const exitTl = gsap.timeline({
        paused: true,
        delay: 0.5,
        onComplete: () => setComplete(true),
      });

      exitTl
        .to(".progress-indicator-wrap", { opacity: 0, duration: 0.3 })
        .to(".column-wrapper", {
          height: "100vh",
          duration: 1.2,
          ease: "expo.inOut",
        })
        .to(".shutter", { y: 0, duration: 0.2 }, "<")
        .to(
          ".column-wrapper",
          {
            yPercent: -100,
            duration: 1.4,
            ease: "power4.inOut",
            stagger: { grid: [1, columnCount], from: "center", amount: 0.9 },
          },
          "-=0.2",
        )
        .to(".slogan-accent", { opacity: 0, duration: 0.3 }, "<0.4")
        .to(".slogan-foreground", { opacity: 1, duration: 0.2 }, "<")
        .to(containerRef.current, {
          opacity: 0,
          display: "none",
          duration: 0.4,
        });

      gsap
        .timeline({
          delay: 0.3,
          onComplete: () => {
            exitTl.play();
          },
        })
        .to(progressProxy.current, {
          value: 1,
          duration: PROGRESS_DURATION * (1 - startProgress),
          ease: "power1.inOut",
          onUpdate: function () {
            const p = progressProxy.current.value;

            // Shutter wave
            for (let i = 0; i < columnCount; i++) {
              const colWidth = 1 / halfCols;
              const peakHalf = colWidth / 2;
              const rampHalf = colWidth;
              const dist = p - colCentre(i, halfCols);
              let shutterY = 0;

              if (Math.abs(dist) <= peakHalf) {
                shutterY = 50;
              } else if (dist >= -(peakHalf + rampHalf) && dist < -peakHalf) {
                shutterY = ((dist + peakHalf + rampHalf) / rampHalf) * 50;
              } else if (dist > peakHalf && dist <= peakHalf + rampHalf) {
                shutterY = ((peakHalf + rampHalf - dist) / rampHalf) * 50;
              }
              gsap.set(`.shutter-${i}`, { y: shutterY });
            }

            // Trail + label
            const trailWidth = p * 50;
            gsap.set(".progress-trail", { width: `${trailWidth}%` });
            gsap.set(".pct-tip", { left: `${trailWidth}%` });
            const pctLabel = document.querySelector(".pct-tip .pct-label");
            if (pctLabel) pctLabel.textContent = `${Math.round(p * 100)}%`;
          },
        });
    },
    {
      scope: containerRef,
      dependencies: [columnCount],
      revertOnUpdate: true,
    },
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-99 flex flex-col overflow-hidden"
    >
      {/* Brand Name */}
      <h1
        ref={brandRef}
        aria-label={brandName}
        className="relative title text-foreground text-[clamp(3rem,15vw,9rem)] text-center h-1/2 select-none pointer-events-none"
      >
        {brandName}
      </h1>

      {/* Slogan + logo — bottom quarter, above grid but below brand name */}
      <div className="slogan-accent absolute inset-x-0 bottom-8 z-50 text-accent flex items-center justify-center gap-3 px-6 pointer-events-none">
        <svg
          width="24"
          height="24"
          viewBox="0 0 100 100"
          fill="none"
          className="shrink-0"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M20 20V80H80"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="square"
          />
          <rect x="40" y="40" width="10" height="10" fill="currentColor" />
        </svg>
        <span
          ref={sloganRef}
          className="text-xs sm:text-sm text-center max-w-sm leading-relaxed"
        >
          Engineering isn&apos;t just about writing code
        </span>
      </div>

      {/* Duplicated Slogan + logo */}
      <div
        aria-hidden="true"
        className="slogan-foreground absolute inset-x-0 bottom-8 z-50 text-foreground flex items-center justify-center gap-3 px-6 pointer-events-none"
      >
        <svg
          aria-hidden="true"
          focusable="false"
          width="24"
          height="24"
          viewBox="0 0 100 100"
          fill="none"
          className="shrink-0"
        >
          <path
            d="M20 20V80H80"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="square"
          />
          <rect x="40" y="40" width="10" height="10" fill="currentColor" />
        </svg>
        <span className="text-xs sm:text-sm text-center max-w-sm leading-relaxed">
          Engineering isn&apos;t just about writing code
        </span>
      </div>

      {/* Progress grid */}
      <div className="absolute inset-0 flex items-end">
        {/* Horizontal progress trail — positioned relative to this container */}
        <div
          className="progress-indicator-wrap absolute inset-x-0 z-20 pointer-events-none"
          style={{ top: "50%" }}
        >
          {/* Trail line */}
          <div
            className="progress-trail absolute left-0 top-0 h-px translate-y-5.5 -translate-x-6 bg-primary/70"
            style={{ width: "0%" }}
          />
          {/* Floating % tip */}
          <div
            className="pct-tip absolute top-0 translate-y-2 -translate-x-1/2"
            style={{ left: "0%" }}
          >
            <span className="pct-label font-mono text-xs font-bold text-foreground/60 tabular-nums">
              0%
            </span>
          </div>
        </div>

        {/* Columns */}
        {[...Array(columnCount)].map((_, i) => (
          <div
            key={i}
            className="column-wrapper relative h-1/2 flex-1 overflow-hidden"
          >
            <div
              className={`shutter shutter-${i} absolute inset-0 bg-foreground`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
