"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface HoverFlipIconProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Spins an icon once on hover, matching the nav links' HoverFlipText.
 *
 * The trigger is the enclosing link or button rather than the icon itself, so
 * hovering anywhere on "LinkedIn" flips the mark the same way hovering a nav
 * link flips its letters.
 */
export function HoverFlipIcon({
  children,
  className = "",
}: HoverFlipIconProps) {
  const iconRef = useRef<HTMLSpanElement>(null);
  const { prefersReducedMotion } = usePrefersReducedMotion();

  useEffect(() => {
    const icon = iconRef.current;
    const trigger = icon?.closest("a, button");
    if (!icon || !trigger) return;

    const handleMouseEnter = () => {
      if (prefersReducedMotion) return;
      gsap.killTweensOf(icon, "rotateY");
      gsap.fromTo(
        icon,
        { rotateY: 0 },
        { rotateY: 360, duration: 0.8, ease: "power2.out" },
      );
    };

    trigger.addEventListener("mouseenter", handleMouseEnter);
    return () => {
      trigger.removeEventListener("mouseenter", handleMouseEnter);
      gsap.killTweensOf(icon, "rotateY");
    };
  }, [prefersReducedMotion]);

  return (
    <span ref={iconRef} aria-hidden className={`inline-flex ${className}`}>
      {children}
    </span>
  );
}
