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

      // Initial states
      gsap.set(contactOverlayEl, {
        yPercent: 100,
        autoAlpha: 1,
        pointerEvents: "none",
      });
      gsap.set(handoffOverlayEl, { autoAlpha: 0 });
      gsap.set(imageFrameEl, {
        scale: 1,
        filter: "grayscale(0) brightness(1)",
        autoAlpha: 1,
      });

      if (prefersReducedMotion) {
        gsap.set(contactOverlayEl, { yPercent: 0, pointerEvents: "auto" });
        return;
      }

      const frameWidth = imageFrameEl.offsetWidth;
      const frameHeight = imageFrameEl.offsetHeight;
      if (!frameWidth || !frameHeight) return;

      const targetScale =
        Math.max(
          window.innerWidth / frameWidth,
          window.innerHeight / frameHeight,
        ) * 1.05;

      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: handoffEl,
          start: "top center",
          end: "bottom bottom",
          scrub: 0.5,
          onUpdate: (self) => {
            contactOverlayEl.style.pointerEvents =
              self.progress > 0.5 ? "auto" : "none";
          },
        },
      });

      // Fixed corners visibility toggle
      gsap.set(cornersRef.current, { autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: sectionEl,
        start: "top top",
        end: "bottom top",
        onToggle: (self) => {
          gsap.to(cornersRef.current, {
            autoAlpha: self.isActive ? 1 : 0,
            duration: 0.3,
          });
        },
      });

      mainTl
        // Phase 1: Zoom image completely to fullscreen beforehand
        .to(cornerChildren, { autoAlpha: 0, duration: 0.3 }, 0)
        .to(
          imageFrameEl,
          {
            scale: targetScale,
            filter: "grayscale(1) brightness(0.4)",
            duration: 0.6,
            ease: "power1.inOut",
          },
          0,
        )
        // Fade out stats content natively as we scroll
        .to(statsContentEl, { autoAlpha: 0, duration: 0.3 }, 0)

        // Phase 2: Reveal Contact Overlay (Parallax Slide Up) AFTER zoom
        .to(
          contactOverlayEl,
          {
            yPercent: 0,
            duration: 0.5,
            ease: "none",
          },
          0.6, // Wait for zoom (duration 0.6) to finish before sliding up
        )

        // Phase 3: Shimmer handoff (briefly show tv static)
        .to(handoffOverlayEl, { autoAlpha: 0.15, duration: 0.1 }, 0.5)

        // Phase 4: Minimum pin hold
        .to({}, { duration: 0.05 });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="stats-contact-section"
      className="relative z-1 bg-background"
      aria-label="Stats and Contact"
    >
      {/* CORNERS BACKGROUND BLUR EFFECT */}
      <div
        ref={cornersRef}
        className="fixed inset-0 max-w-400 mx-auto h-screen pointer-events-none z-60 opacity-0 *:blur-lg *:bg-background *:h-[40%] md:*:h-3/7 *:w-3/5 md:*:w-1/4 max-sm:max-w-screen"
      >
        <div className="absolute -top-10 -right-10 max-sm:w-4xl max-sm:translate-x-1/2 max-sm:right-1/2" />
        <div className="absolute -top-10 -left-10 max-sm:hidden" />
        <div className="absolute -bottom-10 -left-10 max-sm:hidden" />
        <div className="absolute -bottom-10 -right-10  max-sm:w-4xl max-sm:translate-x-1/2 max-sm:right-1/2" />
      </div>

      <div className="wrapper max-w-screen relative px-0">
        <div className="sticky top-0 h-screen overflow-hidden pointer-events-none">
          {/* BACKGROUND IMAGE - PINNED AND ZOOMING */}
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

          {/* HANDOFF STATIC SHIMMER */}
          <div
            ref={handoffOverlayRef}
            className="absolute inset-0 z-20 tv-static pointer-events-none"
            aria-hidden="true"
          />

          {/* CONTACT REVEAL OVERLAY (SLIDES UP) */}
          <div
            ref={contactOverlayRef}
            className="absolute inset-0 z-30 pointer-events-none"
          >
            {children}
          </div>
        </div>

        {/* STATS CONTENT - SCROLLS NORMALLY OVER */}
        <div
          ref={statsContentRef}
          className="relative max-w-400 mx-auto z-10 flex flex-col items-center justify-center gap-[28vh] md:gap-[18vh] -mt-[100vh] pt-[80vh] pb-[10vh] px-4.5 mix-blend-difference text-background pointer-events-none"
        >
          <p className="text-[clamp(1.25rem,4vw,1.5rem)] text-center font-semibold text-zinc-200 leading-tight max-w-[20ch] md:max-w-[16ch]">
            {INTRO_TEXT}
          </p>

          <div className="w-full max-w-400 mx-auto flex flex-col gap-[28vh] md:gap-[18vh]">
            {BRAND_STATS.map((stat) => (
              <div key={stat.name} className="w-full">
                <div className="flex flex-col md:grid md:grid-cols-12 items-center gap-1 sm:gap-4 md:gap-8 md:*:not-even:max-w-72">
                  <h2 className="md:col-span-4 title text-3xl md:text-5xl -tracking-[1px] md:-tracking-[2px] capitalize text-center md:text-left">
                    {stat.name}
                  </h2>
                  <p className="md:col-span-4 text-center font-semibold leading-none text-zinc-200 text-[clamp(5.5rem,20vw,9rem)] max-md:-mt-2">
                    {stat.value}
                  </p>
                  <p className="md:col-span-4 text-center md:text-right text-sm sm:text-lg leading-relaxed md:leading-tight md:justify-self-end mt-2 md:mt-0 max-w-[280px] md:mx-0">
                    {stat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[clamp(1.25rem,4vw,1.5rem)] text-center font-semibold text-zinc-200 leading-tight max-w-[24ch] md:max-w-[22ch]">
            {OUTRO_TEXT}
          </p>

          {/* Scroll spacer to drive the zoom and slide-reveal timeline */}
          <div
            ref={handoffRef}
            className="h-[250vh] w-full"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}

export default BrandStats;
