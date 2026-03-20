"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
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
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>(".sh-item");
      const titleItem = containerRef.current?.querySelectorAll(".sh-title");

      if (prefersReducedMotion) {
        if (items.length > 0) gsap.set(items, { opacity: 1, y: 0 });
        if (titleItem && titleItem.length > 0)
          gsap.set(titleItem, { opacity: 1, scaleX: 1 });
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

      if (titleItem && titleItem.length > 0) {
        tl.fromTo(
          titleItem,
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
      }
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] },
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
          className={cn(
            "bold-title leading-tight text-primary flex flex-wrap",
            titleClassName,
          )}
        >
          {typeof title === "string" ? (
            title.split(" ").map((word, wordIdx) => (
              <span
                key={wordIdx}
                className="inline-block whitespace-nowrap mr-[0.25em] last:mr-0"
              >
                {word.split("").map((char, charIdx) => (
                  <span
                    key={charIdx}
                    className="sh-title opacity-0 origin-center inline-block"
                  >
                    {char}
                  </span>
                ))}
              </span>
            ))
          ) : (
            <span className="sh-title opacity-0 origin-left inline-block">
              {title}
            </span>
          )}
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
