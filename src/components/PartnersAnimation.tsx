"use client";

import { useRef } from "react";
import GridAnimation from "./GridAnimation";

interface PartnersAnimationProps {
  ready?: boolean;
}

const PartnersAnimation = ({ ready = true }: PartnersAnimationProps) => {
  const partnerRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={partnerRef}
      className="relative z-1 h-screen w-full flex-center items-end overflow-hidden bg-background"
    >
      {/* V-shape grid animation — full height behind everything */}
      <div className="absolute inset-0 z-2">
        <GridAnimation
          ready={ready}
          triggerRef={partnerRef}
          invertDirection={true}
          scrubStart={true}
        />
      </div>
    </section>
  );
};

export default PartnersAnimation;
