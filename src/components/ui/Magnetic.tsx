"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  radius?: number;
  className?: string;
}

export default function Magnetic({
  children,
  strength = 0.2,
  radius = 100,
  className,
}: MagneticProps) {
  const magnetic = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = usePrefersReducedMotion();

  useEffect(() => {
    const el = magnetic.current;
    if (!el || prefersReducedMotion) {
      if (el) gsap.set(el, { x: 0, y: 0, clearProps: "transform" });
      return;
    }

    const xTo = gsap.quickTo(el, "x", {
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });
    const yTo = gsap.quickTo(el, "y", {
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = el.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);

      // Calculate distance
      const distance = Math.sqrt(x * x + y * y);

      if (distance < radius) {
        xTo(x * strength);
        yTo(y * strength);
      } else {
        xTo(0);
        yTo(0);
      }
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      gsap.set(el, { x: 0, y: 0, clearProps: "transform" });
    };
  }, [strength, radius, prefersReducedMotion]);

  // Using React.cloneElement to apply the ref to the child directly if it's a single element
  // But for safety and generic use, wrapping in a div with display: contents or inline-block
  return (
    <div
      ref={magnetic}
      style={{ display: "inline-block" }}
      className={cn("cursor-target", className)}
    >
      {children}
    </div>
  );
}
