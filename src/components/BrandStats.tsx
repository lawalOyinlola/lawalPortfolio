"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BRAND_STATS } from "@/app/constants";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

const INTRO_TEXT = "Where passion meets precision";
const OUTRO_TEXT = "Get in touch with us to learn more...";

function BrandStats({ children }: { children: React.ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const statsContentRef = useRef<HTMLDivElement>(null);
  const contactOverlayRef = useRef<HTMLDivElement>(null);
  const handoffRef = useRef<HTMLDivElement>(null);
  const handoffOverlayRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const sectionEl = sectionRef.current;
      const imageFrameEl = imageFrameRef.current;
      const statsContentEl = statsContentRef.current;
      const contactOverlayEl = contactOverlayRef.current;
      const handoffEl = handoffRef.current;
      const handoffOverlayEl = handoffOverlayRef.current;
      const cornerChildren =
        cornersRef.current?.querySelectorAll<HTMLElement>(":scope > div") ?? [];

      if (
        !sectionEl ||
        !imageFrameEl ||
        !statsContentEl ||
        !contactOverlayEl ||
        !handoffEl ||
        !handoffOverlayEl
      ) {
        return;
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.set(contactOverlayEl, { autoAlpha: 0, pointerEvents: "none" });
      gsap.set(handoffOverlayEl, { autoAlpha: 0 });
      gsap.set(imageFrameEl, {
        scale: 1,
        filter: "grayscale(0) brightness(1)",
        autoAlpha: 1,
      });

      const frameWidth = imageFrameEl.offsetWidth;
      const frameHeight = imageFrameEl.offsetHeight;

      if (!frameWidth || !frameHeight) return;

      const targetScale =
        Math.max(
          window.innerWidth / frameWidth,
          window.innerHeight / frameHeight,
        ) * 1.04;

      gsap.set(cornerChildren, { autoAlpha: 1 });

      if (prefersReducedMotion) {
        ScrollTrigger.create({
          trigger: handoffEl,
          start: "top 78%",
          end: "bottom 40%",
          onEnter: () => {
            gsap.set(statsContentEl, { autoAlpha: 0 });
            gsap.set(imageFrameEl, { autoAlpha: 0 });
            gsap.set(contactOverlayEl, { autoAlpha: 1, pointerEvents: "auto" });
          },
          onLeaveBack: () => {
            gsap.set(statsContentEl, { autoAlpha: 1 });
            gsap.set(imageFrameEl, { autoAlpha: 1 });
            gsap.set(contactOverlayEl, { autoAlpha: 0, pointerEvents: "none" });
          },
        });
        return;
      }

      const handoffTl = gsap.timeline({
        scrollTrigger: {
          trigger: handoffEl,
          start: "top 78%",
          end: "bottom 40%",
          scrub: 0.55,
          onUpdate: (self) => {
            contactOverlayEl.style.pointerEvents =
              self.progress > 0.62 ? "auto" : "none";
          },
        },
      });

      handoffTl
        .to(cornerChildren, { autoAlpha: 0, ease: "none", duration: 0.22 }, 0)
        .to(
          imageFrameEl,
          {
            scale: targetScale,
            transformOrigin: "center center",
            filter: "grayscale(1) brightness(0.58)",
            ease: "none",
            duration: 0.68,
          },
          0.05,
        )
        .to(statsContentEl, { autoAlpha: 0, ease: "none", duration: 0.4 }, 0.22)
        .to(
          handoffOverlayEl,
          { autoAlpha: 0.8, ease: "none", duration: 0.16 },
          0.74,
        )
        .to(
          contactOverlayEl,
          { autoAlpha: 1, ease: "none", duration: 0.28 },
          0.8,
        )
        .to(imageFrameEl, { autoAlpha: 0, ease: "none", duration: 0.2 }, 0.74)
        .to(
          handoffOverlayEl,
          { autoAlpha: 0, ease: "none", duration: 0.14 },
          0.92,
        );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-background flex-center z-1"
      aria-label="Stats highlights"
    >
      <div className="wrapper max-w-screen relative px-0">
        <div className="sticky top-0 h-screen pointer-events-none">
          <div
            ref={imageFrameRef}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-130 h-75 mx-auto overflow-hidden bg-foreground will-change-transform"
          >
            <Image
              src="/projects/my_projects.jpeg"
              alt="Stats showcase visual"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 90vw, 480px"
              priority={false}
            />
          </div>
        </div>

        {/* CORNERS BACKGROUND BLUR EFFECT */}
        <div
          ref={cornersRef}
          className="sticky inset-0 top-0 h-screen pointer-events-none z-15 *:bg-background *:blur-lg *:h-3/7 *:w-84"
        >
          <div className="absolute -top-10 right-0" />
          <div className="absolute -top-10 left-0" />
          <div className="absolute -bottom-10 left-0" />
          <div className="absolute -bottom-10 right-0" />
        </div>

        {/* Handoff shimmer overlay: visual layer only */}
        <div className="sticky top-0 h-screen pointer-events-none z-20">
          <div
            ref={handoffOverlayRef}
            className="absolute inset-0 tv-static"
            aria-hidden="true"
          />
        </div>

        <div ref={contactOverlayRef} className="absolute inset-0 z-30">
          {children}
        </div>

        {/* CONTENT SECTION */}
        <div
          ref={statsContentRef}
          className="relative z-10 flex flex-col gap-[18vh] -mt-[220vh] pb-[50vh] *:not-last:px-8"
        >
          <p className="self-center text-lg text-center font-semibold text-muted-foreground leading-[100%] max-w-[12ch]">
            {INTRO_TEXT}
          </p>

          {BRAND_STATS.map((stat) => (
            <div key={stat.name}>
              <div className="grid grid-cols-12 items-center gap-4 sm:gap-6 md:gap-8 *:not-even:max-w-72">
                <h2 className="col-span-12 md:col-span-4 title -tracking-[2px] capitalize text-left">
                  {stat.name}
                </h2>

                <p className="col-span-12 md:col-span-4 text-center font-semibold leading-none text-muted-foreground text-[clamp(4rem,12vw,9rem)]">
                  {stat.value}
                </p>

                <p className="col-span-12 md:col-span-4 text-left md:text-right text-base sm:text-lg leading-tight md:justify-self-end">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}

          <p className="self-center text-lg text-center font-semibold text-muted-foreground leading-[100%] max-w-[20ch]">
            {OUTRO_TEXT}
          </p>

          {/* Extra scroll distance to hold the cross-fade transition. */}
          <div ref={handoffRef} className="h-[190vh]" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

export default BrandStats;
