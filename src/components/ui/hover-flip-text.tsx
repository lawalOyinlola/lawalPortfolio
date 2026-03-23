"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

interface HoverFlipTextProps {
  text: string;
  className?: string;
  charClassName?: string;
}

export function HoverFlipText({
  text,
  className = "",
  charClassName = "",
}: HoverFlipTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const { prefersReducedMotion } = usePrefersReducedMotion();

  const handleMouseEnter = () => {
    if (prefersReducedMotion) return;
    const chars = containerRef.current?.querySelectorAll(".hover-flip-char");
    if (chars && chars.length > 0) {
      gsap.killTweensOf(chars, "rotateY");
      gsap.fromTo(
        chars,
        { rotateY: 0 },
        {
          rotateY: 360,
          duration: 1,
          stagger: 0.05,
          ease: "power2.out",
        },
      );
    }
  };

  useGSAP(
    () => {
      if (containerRef.current) {
        new SplitText(containerRef.current, {
          type: "words,chars",
          charsClass: `hover-flip-char inline-block ${charClassName}`,
        });
      }
    },
    { scope: containerRef, dependencies: [text, charClassName] },
  );

  return (
    <span
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      className={`inline-block ${className}`}
      role="presentation"
    >
      {text}
    </span>
  );
}
