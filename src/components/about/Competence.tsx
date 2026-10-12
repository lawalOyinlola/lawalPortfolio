"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { COMPETENCIES } from "@/app/constants/competencies";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SectionHeader } from "@/components/ui/SectionHeader";

const COMPETENCY_GROUPS = [
  { group: "build", label: "Building it", gridClassName: "lg:grid-cols-3" },
  { group: "secure", label: "Securing it", gridClassName: "lg:grid-cols-4" },
] as const;

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export default function Competence() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion) return;

      // Each grid reveals as it scrolls in, rather than both on the first.
      gsap.utils.toArray<HTMLElement>(".competency-grid").forEach((grid) => {
        gsap.fromTo(
          grid.querySelectorAll(".competency-card"),
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.1,
            scrollTrigger: { trigger: grid, start: "top 70%" },
          },
        );
      });
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] },
  );

  return (
    <div ref={sectionRef} id="competence" className="relative z-1 bg-muted">
      {/* ── Skills Grid ── */}
      <section className="flex-center">
        <div className="wrapper pb-30 flex flex-col gap-13.5 text-foreground/40">
          <SectionHeader
            subtitle="What I do"
            title="My Competence"
            description="Two halves of the same job: building software that holds up, and securing it before anyone else tests that."
            className="max-w-[68ch]"
            descriptionClassName="max-w-xl"
          />

          {/* Two grids with a different rhythm: six build cards in threes,
              four security cards in fours, so the halves read as distinct. */}
          {COMPETENCY_GROUPS.map(({ group, label, gridClassName }) => (
            <div key={group} className="flex flex-col gap-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/50">
                {label}
              </h3>
              <div
                className={`competency-grid grid grid-cols-1 sm:grid-cols-2 gap-px bg-border ${gridClassName}`}
              >
                {COMPETENCIES.filter((item) => item.group === group).map(
                  (item) => (
                    <div
                      key={item.title}
                      className="competency-card bg-muted p-8 flex flex-col gap-4 group hover:bg-background transition-colors duration-300"
                    >
                      <h4 className="text-primary font-semibold text-sm md:text-base leading-snug group-hover:text-black transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-sm leading-loose flex-1">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] uppercase tracking-widest border border-border px-2 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
