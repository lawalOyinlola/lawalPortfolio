"use client";

import HeroAnimation from "./HeroAnimation";
import { BRAND } from "@/app/constants/brand";

interface HeroProps {
  ready?: boolean;
}

const Hero = ({ ready = true }: HeroProps) => {
  return (
    <section className="relative h-screen w-full flex-center items-end overflow-hidden bg-background z-1">
      {/* V-shape grid animation — full height behind everything */}
      <div className="absolute inset-0 z-2">
        <HeroAnimation ready={ready} />
      </div>

      {/* Hero copy — bottom-left, above the grid */}
      <div className="wrapper relative z-10 max-w-206">
        <h1 className="header text-accent font-normal">
          Engineering isn&apos;t just about writing code — it&apos;s about
          building systems people can depend on.{" "}
          <span className="text-primary font-semibold">
            <span className="-scale-x-100 inline-block">{BRAND.shortName}</span>{" "}
            represents a commitment to precision, performance, and reliability.
            Every line of code is written with the intent to make technology
            feel effortless
          </span>{" "}
          — stable under pressure, scalable by design, and secure by default.
        </h1>
      </div>
    </section>
  );
};

export default Hero;
