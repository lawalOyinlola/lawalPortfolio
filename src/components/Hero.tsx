"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import GridAnimation from "./GridAnimation";
import { BRAND } from "@/app/constants/brand";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, SplitText);
}

interface HeroProps {
  ready?: boolean;
}

const Hero = ({ ready = true }: HeroProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      // Don't animate if not ready or if user prefers reduced motion
      if (!ready || !textRef.current || prefersReducedMotion) {
        return;
      }

      // Split text into lines
      const split = new SplitText(textRef.current, {
        type: "lines",
        linesClass: "overflow-hidden",
      });

      // Animate lines with a subtle upward 3D-like flip
      gsap.from(split.lines, {
        opacity: 0,
        y: 40,
        rotateX: -80,
        stagger: 0.2,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.5,
      });

      // Cleanup
      return () => split.revert();
    },
    { scope: sectionRef, dependencies: [ready, prefersReducedMotion] },
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-1 h-dvh w-full flex-center items-end overflow-hidden bg-background"
    >
      {/* V-shape grid animation */}
      <div className="absolute inset-0 z-2">
        <GridAnimation ready={ready} triggerRef={sectionRef} />
      </div>

      {/* Hero texts */}
      <div className="wrapper relative z-10 max-w-206">
        <h1 ref={textRef} className="header">
          Engineering isn&apos;t just about writing code — it&apos;s about
          building systems people can depend on.{" "}
          <span className="text-accent font-normal">
            <span className="-scale-x-100 inline-block">{BRAND.shortName}</span>{" "}
            represents a commitment to precision, performance, and reliability.
            Every line of code is written with the intent to make technology
            feel effortless.
          </span>{" "}
          — stable under pressure, scalable by design, and secure by default.
        </h1>
      </div>
    </section>
  );
};

export default Hero;
