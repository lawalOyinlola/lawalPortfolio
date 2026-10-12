"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ADAPTABILITY_ITEMS } from "@/app/constants/competencies";
import { BRAND } from "@/app/constants/brand";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SectionHeader } from "@/components/ui/SectionHeader";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export default function Adaptability() {
  const sectionRef = useRef<HTMLElement>(null);
  const { prefersReducedMotion } = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion) return;

      gsap.fromTo(
        ".adapt-card",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".adapt-grid",
            start: "top 70%",
          },
        },
      );

      gsap.fromTo(
        ".adapt-text",
        { opacity: 0, x: -24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".adapt-text",
            start: "top 82%",
            // toggleActions: "play none none reverse",
          },
        },
      );
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] },
  );

  return (
    <section
      id="adaptability"
      ref={sectionRef}
      className="relative z-1 flex-center bg-muted"
    >
      <div className="wrapper pb-30 flex flex-col gap-13.5 text-foreground/40">
        {/* Header */}
        <SectionHeader
          subtitle="Why it matters"
          title="Adaptability"
          description={`
              From academia to production FinTech, and now into security,
              ${BRAND.shortName} learns how a system works, then how it fails.`}
        />

        {/* Two-column layout: metrics left, narrative right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Metric cards */}
          <div className="adapt-grid grid grid-cols-2 gap-px bg-border border border-border h-fit">
            {ADAPTABILITY_ITEMS.map((item) => (
              <div
                key={item.label}
                className="adapt-card group bg-muted p-6 flex flex-col gap-2 group hover:bg-background transition-colors duration-300"
              >
                <span className="text-primary text-3xl md:text-4xl font-semibold tracking-tight group-hover:text-black transition-colors">
                  {item.metric}
                </span>
                <span className="text-xs font-medium uppercase tracking-widest">
                  {item.label}
                </span>
                <p className="text-xs leading-relaxed mt-1 hidden sm:block">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>

          {/* Narrative (Veil style) */}
          <div className="adapt-text flex flex-col gap-8 justify-center">
            <div className="flex flex-col gap-5">
              <h3 className="text-primary font-semibold text-xl md:text-2xl leading-snug">
                Engineered by curiosity.
                <br />
                <span className="text-muted-foreground font-extralight italic">
                  Proven by delivery.
                </span>
              </h3>
              <p className="text-sm leading-loose">{BRAND.description}</p>
            </div>

            {/* Philosophy pillars */}
            <div className="flex flex-col divide-y divide-border">
              {[
                {
                  title: "The product",
                  body: "Fast, accessible interfaces people trust with their money and their data, from SafulPay's payment flows to Trakkam's live fleet tracking.",
                },
                {
                  title: "The systems behind it",
                  body: "APIs, infrastructure and pipelines hardened as they're built: security headers, rate limits, access control in the data model, and scanning in CI.",
                },
                {
                  title: "The people and process in between",
                  body: "Who can do what, who did what, and whether anyone can prove it: role-based access, audit trails, and risk explained to the people who own it.",
                },
              ].map((p) => (
                <div
                  key={p.title}
                  className="py-6 flex flex-col gap-2 group transition-all duration-300 hover:pl-2"
                >
                  <span className="text-sm text-primary/70 font-semibold group-hover:text-primary transition-colors">
                    {p.title}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
