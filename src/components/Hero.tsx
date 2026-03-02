"use client";

import { useRef } from "react";
import GridAnimation from "./GridAnimation";
import { BRAND } from "@/app/constants/brand";

interface HeroProps {
  ready?: boolean;
}

const Hero = ({ ready = true }: HeroProps) => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full flex-center items-end overflow-hidden bg-background z-1"
    >
      {/* V-shape grid animation — full height behind everything */}
      <div className="absolute inset-0 z-2">
        <GridAnimation ready={ready} triggerRef={sectionRef} />
      </div>

      {/* Hero copy — bottom-left, above the grid */}
      <div className="wrapper relative z-10 max-w-206">
        <h1 className="header">
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
