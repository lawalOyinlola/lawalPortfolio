"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TOOL_CATEGORIES } from "@/app/constants/competencies";
import TargetCursor from "../TargetCursor";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export default function Tools() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".tool-category",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: ".tools-wrapper",
            start: "top 78%",
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-1 flex-center bg-foreground text-background overflow-hidden"
    >
      <TargetCursor
        containerRef={sectionRef}
        spinDuration={2}
        hideDefaultCursor
        parallaxOn
        hoverDuration={0.2}
      />
      <div className="wrapper tools-wrapper flex flex-col gap-13.5">
        {/* Header */}
        <div className="flex flex-col gap-2 max-w-lg">
          <p className="text-xs uppercase tracking-widest text-background/40">
            Stack
          </p>
          <h2 className="bold-title text-background leading-tight">
            Tool &amp; Tech
          </h2>
          <p className="text-muted-foreground text-sm leading-loose mt-2">
            The tools I reach for every day — from AI copilots to databases,
            animations, and deployment pipelines.
          </p>
        </div>

        {/* Category list */}
        <div className="flex flex-col divide-y divide-background/10">
          {TOOL_CATEGORIES.map(({ category, tools }) => (
            <div
              key={category}
              className="tool-category py-8 flex flex-col md:flex-row md:items-start gap-6"
            >
              {/* Category label */}
              <div className="md:w-52 flex-none">
                <span className="text-xs uppercase tracking-widest text-background/40">
                  {category}
                </span>
              </div>

              {/* Tool chips */}
              <div className="flex flex-wrap gap-3">
                {tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="group cursor-target flex items-center gap-2.5 border border-background/10 bg-background/5 hover:bg-(--tool-color-fade) px-3.5 py-2 transition-all duration-500 cursor-default hover:border-(--tool-color) hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] backdrop-blur-sm"
                    style={
                      {
                        "--tool-color": tool.color || "currentColor",
                        "--tool-color-fade":
                          `${tool.color}15` || "rgba(255,255,255,0.05)",
                      } as any
                    }
                  >
                    {/* Icon */}
                    <div className="relative size-5 flex-none transition-transform duration-300 group-hover:scale-110">
                      <Image
                        src={tool.icon}
                        alt={tool.name}
                        fill
                        className="object-contain opacity-40 grayscale brightness-800 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100 transition-all duration-300"
                        unoptimized
                      />
                    </div>

                    {/* Label */}
                    <span className="text-xs text-background/40 group-hover:text-(--tool-color) transition-colors duration-300 whitespace-nowrap font-medium">
                      {tool.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
