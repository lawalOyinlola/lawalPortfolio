"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TOOL_CATEGORIES } from "@/app/constants/competencies";
import TargetCursor from "../TargetCursor";
import { SectionHeader } from "@/components/ui/SectionHeader";

type ToolChipStyle = CSSProperties & {
  "--tool-color": string;
  "--tool-color-fade": string;
};

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export default function Tools() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const categories = gsap.utils.toArray<HTMLElement>(".tool-category");

      categories.forEach((cat) => {
        const chars = cat.querySelectorAll(".tool-cat-char");
        const chips = cat.querySelectorAll(".tool-chip");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: cat,
            start: "top 85%",
            // toggleActions: "play none none reverse",
          },
        });

        if (chars.length > 0) {
          tl.fromTo(
            chars,
            { opacity: 0, x: -10 },
            {
              opacity: 1,
              x: 0,
              duration: 0.4,
              stagger: 0.05,
              ease: "power2.out",
            },
          );
        }

        if (chips.length > 0) {
          tl.fromTo(
            chips,
            { opacity: 0, x: -20 },
            {
              opacity: 1,
              x: 0,
              duration: 0.6,
              stagger: 0.08,
              ease: "back.out(1.2)",
            },
            "-=0.2",
          );
        }
      });
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
        <SectionHeader
          subtitle="Stack"
          title="Tool &amp; Tech"
          description="The tools I reach for every day — from AI copilots to databases, animations, and deployment pipelines."
          titleClassName="text-background"
          subtitleClassName="text-background/40"
          descriptionClassName="text-muted-foreground"
        />

        {/* Category list */}
        <div className="flex flex-col divide-y divide-background/10">
          {TOOL_CATEGORIES.map(({ category, tools }) => (
            <div
              key={category}
              className="tool-category py-8 flex flex-col md:flex-row md:items-start gap-6"
            >
              {/* Category label */}
              <div className="md:w-52 flex-none">
                <span className="text-xs uppercase tracking-widest text-background/40 flex">
                  {category.split("").map((char, charIdx) => (
                    <span
                      key={charIdx}
                      className={
                        char === " "
                          ? "w-1"
                          : "tool-cat-char inline-block opacity-0"
                      }
                    >
                      {char}
                    </span>
                  ))}
                </span>
              </div>

              {/* Tool chips */}
              <div className="flex flex-wrap gap-3">
                {tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="tool-chip opacity-0 group cursor-target flex items-center gap-2.5 border border-background/10 bg-background/5 hover:bg-(--tool-color-fade) px-3.5 py-2 transition-all duration-500 cursor-default hover:border-(--tool-color) hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] backdrop-blur-sm"
                    style={
                      {
                        "--tool-color": tool.color ?? "currentColor",
                        "--tool-color-fade": tool.color
                          ? `${tool.color}15`
                          : "rgba(255,255,255,0.05)",
                      } as ToolChipStyle
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
