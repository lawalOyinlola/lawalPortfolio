"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
}

const STATEMENT =
  "Digital product development goes beyond just coding; it's about creating reliable systems that users can trust.";

interface ProductProps {
  imageSrc?: string;
}

const Product = ({ imageSrc = "/projects/my_projects.jpeg" }: ProductProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textPanelRef = useRef<HTMLDivElement>(null);

  const { prefersReducedMotion, isHydrated } = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (!isHydrated) return;

      const imageEl = imageRef.current;
      const textPanelEl = textPanelRef.current;
      if (!imageEl || !textPanelEl) return;

      const split = new SplitText(".product-statement", {
        type: "words,chars",
        charsClass: "inline-block",
      });

      if (prefersReducedMotion) {
        gsap.set(textPanelEl, { opacity: 1, y: 0 });
        gsap.set(split.chars, { opacity: 1, y: 0 });
        gsap.set(imageEl, { scale: 1 });
        return;
      }

      // Parallax/Overlay mode
      gsap.set(textPanelEl, { yPercent: 100 });
      gsap.set(split.chars, { opacity: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.45,
        },
      });

      tl.to(imageEl, { scale: 1.08, ease: "none", duration: 1 }, 0);
      tl.to(textPanelEl, { yPercent: 0, ease: "none", duration: 1.1 }, 0.55);

      tl.to(
        split.chars,
        { opacity: 1, y: 0, ease: "none", stagger: 0.02, duration: 0.25 },
        0.75,
      );

      return () => {
        split.revert();
      };
    },
    { scope: sectionRef, dependencies: [isHydrated, prefersReducedMotion] },
  );

  return (
    <section
      ref={sectionRef}
      className={`relative z-1 bg-foreground ${
        prefersReducedMotion ? "h-auto" : "h-[260vh]"
      }`}
    >
      <div
        className={`${
          prefersReducedMotion
            ? "relative"
            : "sticky top-0 h-screen overflow-hidden will-change-transform"
        }`}
      >
        {/* Phase 1: full-screen image */}
        <div
          ref={imageRef}
          className={`product-image origin-center will-change-transform ${
            prefersReducedMotion ? "relative h-screen" : "absolute inset-0"
          }`}
        >
          <Image
            src={imageSrc}
            alt="Featured product showcase"
            fill
            className="object-cover object-top p-4.5"
            sizes="100vw"
          />
        </div>

        {/* Phase 2: text panel */}
        <div
          ref={textPanelRef}
          className={`text-panel z-10 flex-center bg-foreground will-change-transform ${
            prefersReducedMotion
              ? "relative h-screen py-24 md:py-32"
              : "absolute inset-0"
          }`}
        >
          <div className="wrapper flex justify-end w-full px-12">
            <h2
              aria-label={STATEMENT}
              className="product-statement max-w-175 title leading-none text-white"
            >
              {STATEMENT}
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Product;
