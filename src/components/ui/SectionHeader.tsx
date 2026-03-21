"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
}

export interface SectionHeaderProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  titleClassName?: string;
  subtitleClassName?: string;
  descriptionClassName?: string;
}

export function SectionHeader({
  title,
  subtitle,
  description,
  titleClassName,
  subtitleClassName,
  descriptionClassName,
  className,
  ...props
}: SectionHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>(".sh-item");

      if (prefersReducedMotion) {
        if (items.length > 0) gsap.set(items, { opacity: 1, y: 0 });
        if (titleRef.current) gsap.set(titleRef.current, { opacity: 1 });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      if (items.length > 0) {
        // We stagger the regular items
        tl.fromTo(
          items,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power2.out",
          },
          0,
        );
      }

      if (titleRef.current && typeof title === "string") {
        const split = new SplitText(titleRef.current, {
          type: "chars",
          charsClass: "sh-title inline-block",
        });

        tl.fromTo(
          split.chars,
          { opacity: 0.4, scaleX: -1 },
          {
            opacity: 1,
            scaleX: 1,
            duration: 0.8,
            stagger: 0.05,
            ease: "expo.inOut",
          },
          0.1, // Let it start slightly after the subtitle starts
        );
      } else if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" },
          0.1,
        );
      }
    },
    {
      scope: containerRef,
      dependencies: [prefersReducedMotion, title],
      revertOnUpdate: true,
    },
  );

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col gap-1 max-w-xl", className)}
      {...props}
    >
      {subtitle && (
        <div className="sh-item opacity-0">
          <p
            className={cn(
              "text-xs uppercase tracking-widest text-muted-foreground",
              subtitleClassName,
            )}
          >
            {subtitle}
          </p>
        </div>
      )}
      <div className="w-fit">
        <h2
          ref={titleRef}
          className={cn(
            "bold-title leading-tight text-primary flex flex-wrap",
            titleClassName,
          )}
        >
          {title}
        </h2>
      </div>
      {description && (
        <div className="sh-item opacity-0">
          <p className={cn("text-sm leading-loose mt-2", descriptionClassName)}>
            {description}
          </p>
        </div>
      )}
    </div>
  );
}
