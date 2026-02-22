"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

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

  useGSAP(
    () => {
      const words = gsap.utils.toArray<HTMLSpanElement>(".reveal-word");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
      });

      tl.to(".product-image", { scale: 1.15, ease: "none", duration: 3 }, 0);

      // Dark overlay fades in first
      tl.to(".knockout-layer", { opacity: 1, ease: "none", duration: 0.8 }, 0);

      // Words begin only after the overlay is fully established
      tl.fromTo(
        words,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, ease: "none", stagger: 0.08, duration: 0.6 },
        0.4,
      );
    },
    { scope: sectionRef },
  );

  const wordsArray = STATEMENT.split(" ");

  return (
    <section ref={sectionRef} className="relative h-[300vh] bg-foreground">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Product image */}
        <div className="product-image absolute inset-0 origin-center">
          <Image
            src={imageSrc}
            alt="Featured product showcase"
            fill
            className="object-cover object-top p-4.5"
            sizes="100vw"
          />
        </div>

        <div className="knockout-layer absolute inset-0 flex items-center justify-end bg-foreground opacity-0">
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
      </div>
    </section>
  );
};

export default Product;
