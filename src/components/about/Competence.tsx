"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { COMPETENCIES } from "@/app/constants/competencies";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SectionHeader } from "@/components/ui/SectionHeader";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export default function Competence() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion) return;

      gsap.fromTo(
        ".competency-card",
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".competency-grid",
            start: "top 70%",
          },
        },
      );
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
            title={<>My Competence</>}
            description="A deliberate stack of skills built to ship robust, performant, and accessible digital products end to end."
            className="max-w-[68ch]"
            descriptionClassName="max-w-xl"
          />

          {/* Skill cards — Mist aesthetic */}
          <div className="competency-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {COMPETENCIES.map((item) => (
              <div
                key={item.title}
                className="competency-card bg-muted p-8 flex flex-col gap-4 group hover:bg-background transition-colors duration-300"
              >
                <h3 className="text-primary font-semibold text-sm md:text-base leading-snug group-hover:text-black transition-colors">
                  {item.title}
                </h3>
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
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
