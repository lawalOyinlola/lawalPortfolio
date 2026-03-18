"use client";

import { useRef } from "react";
import GridAnimation from "./GridAnimation";

interface ScrollAnimationProps {
  ready?: boolean;
}

const ScrollAnimation = ({ ready = true }: ScrollAnimationProps) => {
  const scrollRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={scrollRef}
      className="relative z-1 h-screen w-full flex-center items-end overflow-hidden bg-background"
    >
      {/* V-shape grid animation — full height behind everything */}
      <div className="absolute inset-0 z-2">
        <GridAnimation
          ready={ready}
          triggerRef={scrollRef}
          invertDirection={true}
          scrubStart={true}
        />
      </div>
    </section>
  );
};

export default ScrollAnimation;
