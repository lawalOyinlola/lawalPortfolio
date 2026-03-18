"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    const xTo = gsap.quickTo(magnetic.current, "x", {
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });
    const yTo = gsap.quickTo(magnetic.current, "y", {
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!magnetic.current) return;

      const { clientX, clientY } = e;
      const { height, width, left, top } =
        magnetic.current.getBoundingClientRect();
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
    magnetic.current?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      magnetic.current?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength, radius]);

  // Using React.cloneElement to apply the ref to the child directly if it's a single element
  // But for safety and generic use, wrapping in a div with display: contents or inline-block
  return (
    <div
      ref={magnetic}
      style={{ display: "inline-block" }}
      className={cn("cursor-target magnetic", className)}
    >
      {children}
    </div>
  );
}
