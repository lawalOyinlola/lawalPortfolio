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
  /** "h1" when the FAQ is the page itself; sections keep "h2". */
  headingLevel?: "h1" | "h2";
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
  headingLevel = "h2",
}: FaqsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { prefersReducedMotion, isHydrated } = usePrefersReducedMotion();
  // One level under the title, so the outline never skips a level: h2
  // questions under the FAQ page's h1, h3 under a section's h2.
  const QuestionHeading = headingLevel === "h1" ? "h2" : "h3";

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

  // Two columns from lg up: the header stays put on the left while the
  // questions scroll on the right, which keeps every answer to a readable
  // measure (about 70 characters) instead of the full page width.
  return (
    <section
      id={id}
      ref={sectionRef}
      className={cn("flex-center relative z-1 bg-background", className)}
      aria-labelledby={`${id}-title`}
    >
      <div className="wrapper grid gap-12 md:gap-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 xl:gap-24">
        <div className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
          <SectionHeader
            as={headingLevel}
            subtitle={subtitle}
            title={<span id={`${id}-title`}>{title}</span>}
            description={description}
            className="max-w-xl"
            titleClassName="lg:text-[clamp(2.5rem,4.2vw,4.5rem)] lg:leading-[1.05]"
          />

          {hasMore && (
            <Link
              href="/faq"
              className={cn(
                "group inline-flex w-fit items-center gap-2 text-sm uppercase tracking-widest",
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
          )}
        </div>

        <div ref={listRef} className="border-t border-border">
          {visible.map((faq, i) => {
            const isOpen = openIndex === i;
            const panelId = `${id}-panel-${i}`;
            const buttonId = `${id}-trigger-${i}`;

            return (
              // A subgrid row: number, question, toggle. The answer sits in
              // the question's column from md up, so it lines up under the
              // question; on phones it takes the full width instead.
              <div
                key={faq.question}
                className="faq-row group grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-4 border-b border-border md:gap-x-6"
              >
                <QuestionHeading className="col-span-3 grid grid-cols-subgrid">
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(i)}
                    className="col-span-3 grid grid-cols-subgrid items-start py-6 text-left focus-visible:outline-ring/50 md:py-8"
                  >
                    <span
                      className="pt-1 font-mono text-xs tabular-nums text-muted-foreground md:pt-1.5 md:text-sm"
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}/
                    </span>
                    <span className="text-lg font-medium leading-snug text-primary transition-colors duration-200 group-hover:text-primary/70 md:text-2xl">
                      {faq.question}
                    </span>
                    <span
                      className={cn(
                        "flex-center size-9 rounded-full border border-border md:size-10",
                        "transition-[rotate,background-color,border-color,color] duration-300 ease-out",
                        isOpen
                          ? "rotate-45 border-primary bg-primary text-primary-foreground"
                          : "rotate-0 group-hover:border-primary",
                      )}
                      aria-hidden
                    >
                      <PlusIcon className="size-4 md:size-5" weight="bold" />
                    </span>
                  </button>
                </QuestionHeading>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={!isOpen}
                  className={cn(
                    "col-span-3 grid transition-[grid-template-rows,opacity] duration-400 ease-out md:col-span-1 md:col-start-2",
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
                    {/* Darker than muted-foreground, which is about 3:1 on
                        white: too faint for paragraphs this long. */}
                    <p className="max-w-136 pb-8 text-[0.9375rem] leading-relaxed text-foreground/75 md:pb-10 md:text-base">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
