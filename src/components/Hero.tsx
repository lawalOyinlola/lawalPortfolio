"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import GridAnimation from "./GridAnimation";
import { BRAND } from "@/app/constants/brand";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { DURATION, EASE } from "@/lib/motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, SplitText);
}

interface HeroProps {
  ready?: boolean;
}

const Hero = ({ ready = true }: HeroProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const { prefersReducedMotion } = usePrefersReducedMotion();

  useGSAP(
    () => {
      // Don't animate if not ready or if user prefers reduced motion
      if (!ready || !textRef.current || prefersReducedMotion) {
        return;
      }

      // Each line rises out of its own mask. autoSplit re-splits when the
      // window resizes or the web font lands, and carries the animation over
      // to the new lines, so the wraps are always the ones on screen.
      const split = SplitText.create(textRef.current, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            stagger: 0.12,
            duration: DURATION.slow,
            ease: EASE.out,
            delay: 0.5,
          }),
      });

      return () => split.revert();
    },
    { scope: sectionRef, dependencies: [ready, prefersReducedMotion] },
  );

  return (
    <section
      ref={sectionRef}
      // svh, not dvh: a dvh hero grows and shrinks as a phone's toolbar
      // slides in and out, which moves everything below it mid-scroll.
      className="relative z-1 h-svh w-full flex-center items-end overflow-hidden bg-background"
    >
      {/* V-shape grid animation */}
      <div className="absolute inset-0 z-2">
        <GridAnimation ready={ready} triggerRef={sectionRef} />
      </div>

      {/* Hero texts */}
      <div className="wrapper relative z-10 max-w-206">
        <h1 ref={textRef} className="header">
          Engineering isn&apos;t just about writing code. It&apos;s about
          building systems people can depend on.{" "}
          {/* Once the hero's grid closes on scroll, this accent sentence is the
              only part still readable on the dark columns, so it has to stand
              on its own. */}
          <span className="text-accent font-normal">
            <span className="-scale-x-100 inline-block">{BRAND.shortName}</span>{" "}
            builds the product, hardens the systems behind it, and secures the
            people and process in between.
          </span>{" "}
          Fast for users, hard on attackers.
        </h1>
      </div>
    </section>
  );
};

export default Hero;
