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

const INTRO_TEXT = "The record so far";
const OUTRO_TEXT = "Still have questions?";

/**
 * Stats scroll over a pinned, framed image, each figure flanked by a label and
 * a line that only resolve near the middle of the screen; the image then zooms to fill the
 * screen. The section after this one is expected to overlap its last
 * screen (`mt-[-100vh]` and a higher z-index), so it slides up over the pinned
 * image like a sheet, while the image drifts up more slowly behind it.
 * Everything is scrubbed to the scroll. The figures stay solid the whole way;
 * only the labels beside them haze in and out.
 */
function BrandStats() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const zoomZoneRef = useRef<HTMLDivElement>(null);
  const coverZoneRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const imageFrameEl = imageFrameRef.current;
      const zoomZoneEl = zoomZoneRef.current;
      const coverZoneEl = coverZoneRef.current;
      if (!imageFrameEl || !zoomZoneEl || !coverZoneEl) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      // Enough to cover the viewport from the frame's resting size. Read as a
      // function so a resize refresh recomputes it.
      const coverScale = () =>
        Math.max(
          window.innerWidth / imageFrameEl.offsetWidth,
          window.innerHeight / imageFrameEl.offsetHeight,
        ) * 1.04;

      // The labels and descriptions either side of each figure come out of a
      // haze as they reach the middle of the screen and go back into it on the
      // way up, while the figures themselves stay clear the whole way.
      gsap.utils.toArray<HTMLElement>(".stat-side").forEach((el) => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          })
          .fromTo(
            el,
            { autoAlpha: 0, filter: "blur(12px)" },
            {
              autoAlpha: 1,
              filter: "blur(0px)",
              // Late on the way in, early on the way out: clear only in a
              // narrow band around the middle of the screen.
              ease: "power2.in",
              duration: 0.45,
            },
          )
          .to(el, {
            autoAlpha: 0,
            filter: "blur(12px)",
            ease: "power2.out",
            duration: 0.45,
            delay: 0.1,
          });
      });

      // Zoom to full-bleed across the zoom zone. No hold afterwards: the zoom
      // finishes as the next section starts to slide over, and the scrub lag
      // lets the two overlap slightly, so it never reads as a stop.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: zoomZoneEl,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })
        // An explicit start filter: tweening from the computed "none" would
        // snap straight to the end value, darkening the image before it zooms.
        .fromTo(
          imageFrameEl,
          { scale: 1, filter: "grayscale(0) brightness(1)" },
          {
            scale: coverScale,
            filter: "grayscale(1) brightness(0.55)",
            ease: "power2.inOut",
            duration: 0.8,
          },
          0,
        );

      // Parallax under the incoming section: the image rises at a fraction of
      // the scroll speed while the next section covers it at full speed.
      gsap.to(imageFrameEl, {
        y: () => -window.innerHeight * 0.18,
        ease: "none",
        scrollTrigger: {
          trigger: coverZoneEl,
          start: "top bottom",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="brand-stats"
      className="relative z-1 bg-background"
      aria-label="Track record"
    >
      {/* Pinned image: stays put for the whole section, including the last
          screen that the next section slides over */}
      <div className="sticky top-0 h-screen overflow-hidden pointer-events-none">
        <div
          ref={imageFrameRef}
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] sm:w-[60vw] md:w-130 aspect-4/5 sm:aspect-square md:aspect-auto md:h-75 max-h-[60vh] mx-auto overflow-hidden bg-foreground will-change-transform"
        >
          <Image
            src="/stats_image.webp"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </div>

      {/* Stats: scroll normally over the pinned image */}
      <div className="relative max-w-400 mx-auto z-10 flex flex-col items-center justify-center gap-[28vh] md:gap-[18vh] mt-[-100vh] pt-[80vh] pb-[20vh] px-4.5 mix-blend-difference text-background pointer-events-none">
        <p className="text-[clamp(1.25rem,4vw,1.5rem)] text-center font-semibold text-zinc-200 leading-tight max-w-[20ch] md:max-w-[16ch]">
          {INTRO_TEXT}
        </p>

        <div className="w-full max-w-400 mx-auto flex flex-col gap-[28vh] md:gap-[18vh]">
          {BRAND_STATS.map((stat) => (
            <div key={stat.name} className="w-full">
              <div className="flex flex-col md:grid md:grid-cols-12 items-center gap-1 sm:gap-4 md:gap-8 md:*:not-even:max-w-72">
                <h2 className="stat-side md:col-span-4 title text-3xl md:text-5xl tracking-[-1px] md:tracking-[-2px] capitalize text-center md:text-left">
                  {stat.name}
                </h2>
                <p className="md:col-span-4 text-center font-semibold leading-none text-zinc-200 text-[clamp(5.5rem,20vw,9rem)] max-md:-mt-2">
                  {stat.value}
                </p>
                <p className="stat-side md:col-span-4 text-center md:text-right text-sm sm:text-lg leading-relaxed md:leading-tight md:justify-self-end mt-2 md:mt-0 max-w-70 md:mx-0">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[clamp(1.25rem,4vw,1.5rem)] text-center font-semibold text-zinc-200 leading-tight max-w-[24ch] md:max-w-[22ch]">
          {OUTRO_TEXT}
        </p>
      </div>

      {/* Scroll distance for the zoom (short when nothing zooms) */}
      <div
        ref={zoomZoneRef}
        className="h-[80vh] motion-reduce:h-[20vh]"
        aria-hidden="true"
      />
      {/* The last screen: the next section overlaps it */}
      <div ref={coverZoneRef} className="h-screen" aria-hidden="true" />
    </section>
  );
}

export default BrandStats;
