"use client";

import { useRef } from "react";
import gsap from "gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface HoverFlipTextProps {
  text: string | string[];
  className?: string;
  charClassName?: string;
}

export function HoverFlipText({
  text,
  className = "",
  charClassName = "",
}: HoverFlipTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleMouseEnter = () => {
    if (prefersReducedMotion) return;
    const chars = containerRef.current?.querySelectorAll(".hover-flip-char");
    if (chars && chars.length > 0) {
      gsap.killTweensOf(chars, "rotateY");
      // Force it to start from 0 and spin to 360.
      // Since 360 visually equals 0, the exit has no 'return' animation needed.
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

  const charArray = Array.isArray(text) ? text : text.split("");

  return (
    <span
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      className={`inline-flex ${className}`}
    >
      {charArray.map((char, i) => (
        <span
          key={i}
          className={`hover-flip-char inline-block ${charClassName}`}
          style={{ whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
