"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { PlusIcon } from "@phosphor-icons/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FAQS, type FAQ } from "@/app/constants";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

interface FaqsProps {
  items?: FAQ[];
  limit?: number;
  showSeeAll?: boolean;
  className?: string;
  id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
}

export default function Faqs({
  items = FAQS,
  limit,
  showSeeAll = false,
  className,
  id = "faq",
  title = "Frequently asked",
  subtitle = "FAQ",
  description = "Answers to the questions I hear most often from teams, founders, and recruiters.",
}: FaqsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { prefersReducedMotion, isHydrated } = usePrefersReducedMotion();

  const visible = typeof limit === "number" ? items.slice(0, limit) : items;
  const hasMore =
    showSeeAll && typeof limit === "number" && items.length > limit;

  const toggle = useCallback((i: number) => {
    setOpenIndex((curr) => (curr === i ? null : i));
  }, []);

  useGSAP(
    () => {
      if (!isHydrated) return;
      const rows = gsap.utils.toArray<HTMLElement>(".faq-row");
      if (!rows.length) return;

      if (prefersReducedMotion) {
        gsap.set(rows, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        rows,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: "power2.out",
          scrollTrigger: {
            trigger: listRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );
    },
    {
      scope: sectionRef,
      dependencies: [isHydrated, prefersReducedMotion, visible.length],
    },
  );

  return (
    <section
      id={id}
      ref={sectionRef}
      className={cn("flex-center relative z-1 bg-background", className)}
      aria-labelledby={`${id}-title`}
    >
      <div className="wrapper flex flex-col gap-12 md:gap-16">
        <SectionHeader
          subtitle={subtitle}
          title={<span id={`${id}-title`}>{title}</span>}
          description={description}
          className="max-w-3xl"
        />

        <div ref={listRef} className="flex flex-col gap-3 md:gap-4">
          {visible.map((faq, i) => {
            const isOpen = openIndex === i;
            const panelId = `${id}-panel-${i}`;
            const buttonId = `${id}-trigger-${i}`;

            return (
              <div
                key={faq.question}
                className={cn(
                  "faq-row group rounded-2xl border border-border bg-card/40 backdrop-blur-sm",
                  "transition-colors duration-300",
                  isOpen ? "bg-card" : "hover:bg-card/70",
                )}
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(i)}
                    className={cn(
                      "flex w-full items-center gap-4 md:gap-6 px-5 md:px-8 py-5 md:py-7 text-left",
                      "focus-visible:outline-ring/50",
                    )}
                  >
                    <span
                      className="shrink-0 text-sm md:text-base font-mono tabular-nums text-muted-foreground"
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}/
                    </span>
                    <span className="flex-1 text-base md:text-xl font-medium text-primary leading-snug">
                      {faq.question}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 flex-center size-9 md:size-10 rounded-full border border-border",
                        "transition-transform duration-300 ease-out",
                        isOpen
                          ? "rotate-45 bg-primary text-primary-foreground border-primary"
                          : "rotate-0",
                      )}
                      aria-hidden
                    >
                      <PlusIcon className="size-4 md:size-5" weight="bold" />
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={!isOpen}
                  className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-400 ease-out",
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0",
                  )}
                  style={{
                    transitionDuration: prefersReducedMotion
                      ? "0ms"
                      : undefined,
                  }}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 md:px-8 pb-6 md:pb-8 pl-13 md:pl-20 pr-12 md:pr-20">
                      <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && (
          <div className="flex justify-start">
            <Link
              href="/faq"
              className={cn(
                "group inline-flex items-center gap-2 text-sm uppercase tracking-widest",
                "text-primary hover:text-muted-foreground transition-colors duration-300",
              )}
            >
              <span>See all questions</span>
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
