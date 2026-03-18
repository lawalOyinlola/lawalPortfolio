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
      className="relative z-1 h-dvh w-full flex-center items-end overflow-hidden bg-background"
    >
      {/* V-shape grid animation */}
      <div className="absolute inset-0 z-2">
        <GridAnimation ready={ready} triggerRef={sectionRef} />
      </div>

      {/* Hero texts */}
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
