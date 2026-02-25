"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
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

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const words = gsap.utils.toArray<HTMLSpanElement>(".reveal-word");
      const imageEl = imageRef.current;
      const textPanelEl = textPanelRef.current;
      if (!imageEl || !textPanelEl) return;

      if (prefersReducedMotion) {
        gsap.set(textPanelEl, { yPercent: 0, opacity: 1 });
        gsap.set(words, { opacity: 1, y: 0 });
        gsap.set(imageEl, { scale: 1 });
        return;
      }

      gsap.set(textPanelEl, { yPercent: 100 });
      gsap.set(words, { opacity: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.45,
        },
      });
      tl.to(imageEl, { scale: 1.08, ease: "none", duration: 1 }, 0);

      // Keep the image pinned while the text panel overlays it.
      tl.to(textPanelEl, { yPercent: 0, ease: "none", duration: 0.9 }, 0.35);

      tl.to(
        words,
        { opacity: 1, y: 0, ease: "none", stagger: 0.05, duration: 0.45 },
        0.6,
      );
    },
    { scope: sectionRef },
  );

  const wordsArray = STATEMENT.split(" ");

  return (
    <section ref={sectionRef} className="relative h-[260vh] bg-foreground z-1">
      <div className="sticky top-0 h-screen overflow-hidden will-change-transform">
        {/* Phase 1: full-screen image */}
        <div
          ref={imageRef}
          className="product-image absolute inset-0 origin-center will-change-transform"
        >
          <Image
            src={imageSrc}
            alt="Featured product showcase"
            fill
            className="object-cover object-top p-4.5"
            sizes="100vw"
          />
        </div>

        {/* Phase 2: full-screen text panel over pinned image */}
        {/* <div
          ref={textPanelRef}
          className="text-panel absolute inset-0 z-10 flex-center bg-foreground will-change-transform"
        >
          <div className="wrapper flex justify-end">
            <h2
              aria-label={STATEMENT}
              className="max-w-175 title leading-none text-white"
            >
              {wordsArray.map((word, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="reveal-word mr-[0.25em] inline-block"
                >
                  {word}
                </span>
              ))}
            </h2>
          </div>
        </div> */}

        <div
          ref={textPanelRef}
          className="text-panel absolute inset-0 z-10 flex items-center justify-center bg-black will-change-transform"
        >
          <div className="wrapper flex justify-end w-full px-12">
            <h2 aria-label={STATEMENT} className="max-w-175 title leading-none">
              {wordsArray.map((word, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="reveal-word inline-block mr-[0.25em] text-transparent bg-clip-text bg-fixed bg-cover bg-top bg-no-repeat"
                  style={{ backgroundImage: `url(${imageSrc})` }}
                >
                  {word}
                </span>
              ))}
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Product;
