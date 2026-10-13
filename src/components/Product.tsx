"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

// Bridges the hero into the projects that follow without repeating the hero's
// "not just code" opening.
const STATEMENT =
  "Every product is a promise: that it works, that it holds, and that it keeps people's data safe.";

const STATEMENT_CLASS =
  "w-full md:w-[56%] text-left text-[clamp(2rem,4.2vw,4.5rem)] font-semibold uppercase leading-[0.98] tracking-tight text-white";

interface ProductProps {
  imageSrc?: string;
}

/**
 * The image holds for one screen while a black panel slides up over it, and
 * the statement is cut out of that panel, so the photo shows through the
 * letters. The cutout is `mix-blend-multiply`: black multiplied with anything
 * is black, white multiplied with the photo is the photo. Where blending isn't
 * supported it degrades to white text on black.
 *
 * The section is exactly two screens and the sticky image releases as the
 * panel lands, so the "pin" is just the slide; no scroll is held.
 */
const Product = ({ imageSrc = "/projects/my_projects.webp" }: ProductProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const { prefersReducedMotion, isHydrated } = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (!isHydrated || prefersReducedMotion) return;
      const sectionEl = sectionRef.current;
      const imageEl = imageRef.current;
      if (!sectionEl || !imageEl) return;

      // A slow settle from slightly zoomed in, across the whole section, so
      // the photo inside the letters keeps moving after the panel lands.
      gsap.fromTo(
        imageEl,
        { scale: 1.12 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      // Most of the photo is a dark desk, which would leave the letters
      // nearly black. It lifts while the panel slides over, by which point
      // only the strip above the panel still shows it unmasked.
      gsap.fromTo(
        imageEl,
        { filter: "brightness(1) saturate(1)" },
        {
          filter: "brightness(1.5) saturate(1.2)",
          ease: "none",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        },
      );
    },
    {
      scope: sectionRef,
      dependencies: [isHydrated, prefersReducedMotion],
      revertOnUpdate: true,
    },
  );

  return (
    <section ref={sectionRef} className="relative z-1 bg-black">
      <div className="sticky top-0 h-screen p-4.5">
        <div className="relative h-full w-full overflow-hidden">
          <div ref={imageRef} className="absolute inset-0 will-change-transform">
            <Image
              src={imageSrc}
              alt="A selection of projects shown on laptop and phone screens"
              fill
              className="object-cover object-top"
              sizes="100vw"
            />
          </div>
        </div>
      </div>

      <div className="relative h-screen">
        <div className="absolute inset-0 flex items-center justify-end bg-black px-6 md:px-12 mix-blend-multiply">
          <h2 className={STATEMENT_CLASS}>{STATEMENT}</h2>
        </div>
        {/* The same letters again, faint and unblended, so even the darkest
            parts of the photo still read as letters */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-end px-6 md:px-12"
        >
          <p className={`${STATEMENT_CLASS} opacity-20`}>{STATEMENT}</p>
        </div>
      </div>
    </section>
  );
};

export default Product;
