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
const OUTRO_TEXT = "Get in touch with Lawal to learn more...";

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
          scrub: true,
          snap: {
            snapTo: [0, 1],
            duration: { min: 0.5, max: 2 },
            ease: "power2.inOut",
          },
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
      className="bg-background flex-center"
      aria-label="Stats highlights"
    >
      <div className="wrapper max-w-screen relative px-0">
        <div className="sticky top-0 h-screen pointer-events-none">
          <div
            ref={imageFrameRef}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] sm:w-[60vw] md:w-130 aspect-4/5 sm:aspect-square md:aspect-auto md:h-75 max-h-[60vh] mx-auto overflow-hidden bg-foreground will-change-transform"
          >
            <Image
              src="/stats_image.png"
              alt="Stats showcase visual"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 520px"
              priority={false}
            />
          </div>
        </div>

        {/* CORNERS BACKGROUND BLUR EFFECT */}
        <div
          ref={cornersRef}
          className="sticky max-w-400 mx-auto inset-0 top-0 h-screen pointer-events-none z-15 *:bg-background *:blur-lg *:h-[35%] md:*:h-3/7 *:w-[60vw] md:*:w-84 max-sm:max-w-screen"
        >
          <div className="absolute -top-10 right-0 max-sm:w-4xl max-sm:translate-x-1/2 max-sm:right-1/2" />
          <div className="absolute -top-10 left-0 max-sm:hidden" />
          <div className="absolute -bottom-10 left-0 max-sm:hidden" />
          <div className="absolute -bottom-10 right-0  max-sm:w-4xl max-sm:translate-x-1/2 max-sm:right-1/2" />
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
          className="relative max-w-400 mx-auto z-10 flex flex-col gap-[28vh] md:gap-[18vh] -mt-[220vh] pb-[50vh] px-4 md:px-0 *:not-last:px-2 md:*:not-last:px-8 mix-blend-difference text-background"
        >
          <p className="self-center text-[clamp(1.25rem,4vw,1.5rem)] text-center font-semibold text-zinc-200 leading-tight max-w-[20ch] md:max-w-[16ch]">
            {INTRO_TEXT}
          </p>

          {BRAND_STATS.map((stat) => (
            <div key={stat.name}>
              <div className="flex flex-col md:grid md:grid-cols-12 items-center gap-1 sm:gap-4 md:gap-8 md:*:not-even:max-w-72">
                <h2 className="md:col-span-4 title text-3xl md:text-5xl -tracking-[1px] md:-tracking-[2px] capitalize text-center md:text-left">
                  {stat.name}
                </h2>

                <p className="md:col-span-4 text-center font-semibold leading-none text-zinc-200 text-[clamp(5.5rem,20vw,9rem)] max-md:-mt-2">
                  {stat.value}
                </p>

                <p className="md:col-span-4 text-center md:text-right text-sm sm:text-lg leading-relaxed md:leading-tight md:justify-self-end mt-2 md:mt-0 max-w-[280px] md:max-w-none mx-auto md:mx-0">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}

          <p className="self-center text-[clamp(1.25rem,4vw,1.5rem)] text-center font-semibold text-zinc-200 leading-tight max-w-[24ch] md:max-w-[22ch]">
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
