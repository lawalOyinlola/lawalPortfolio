"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BRAND, BRAND_LETTERS } from "@/app/constants";

gsap.registerPlugin(ScrollTrigger);

const TAGLINE_WORDS = BRAND.tagline;
const SOCIAL_LINKS = Object.values(BRAND.socials);

const EXPLORE_LINKS = [
  { label: "Home", href: "#" },
  { label: "Competence", href: "#competence" },
  { label: "Adaptability", href: "#adaptability" },
  { label: "Clients", href: "#clients" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const lettersRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".footer-letter",
        { scaleX: 1 },
        {
          scaleX: -1,
          ease: "expo.inOut",
          delay: 1,
          duration: 1.6,
          stagger: { amount: 0.8, from: "start" },
          scrollTrigger: {
            trigger: lettersRef.current,
            start: "top 85%",
            end: "top 20%",
            toggleActions: "play reverse play reverse",
          },
        },
      );
    },
    { scope: footerRef },
  );

  return (
    <footer
      ref={footerRef}
      className="bg-foreground text-background overflow-hidden flex-center z-999"
    >
      <div className="wrapper min-h-screen pb-1 flex justify-between flex-col">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between gap-16 w-full">
          {/* Left: Logo + Description */}
          <div className="flex flex-col gap-6 max-w-sm">
            <Image
              src="/icons/menuLogo.svg"
              alt={`${BRAND.shortName} logo`}
              width={40}
              height={40}
              className="invert"
            />
            <p className="text-sm leading-relaxed text-background/70">
              Engineering isn&apos;t just about writing code — it&apos;s about
              building systems people can depend on.{" "}
              <span className="font-semibold text-background -scale-x-100 inline-block">
                {BRAND.shortName}
              </span>{" "}
              represents a commitment to precision, performance, and
              reliability. Every line of code is written with the intent to make
              technology <em>feel</em> effortless — stable under pressure,
              scalable by design, and secure by default.
            </p>
          </div>

          {/* Right: Nav Columns */}
          <div className="flex gap-16 sm:gap-24 sm:pr-20">
            <nav aria-label="Site navigation">
              <h3 className="text-[10px] font-semibold uppercase tracking-[3px] text-background/50 mb-7.5">
                Explore
              </h3>
              <ul className="flex flex-col gap-2.5">
                {EXPLORE_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-background/70 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Social links">
              <h3 className="text-[10px] font-semibold uppercase tracking-[3px] text-background/50 mb-7.5">
                Socials
              </h3>
              <ul className="flex flex-col gap-2.5">
                {SOCIAL_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:text-background/70 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom: Large Brand Letters */}
        <div ref={lettersRef} className="relative flex gap-1 w-full">
          {BRAND_LETTERS.map((letter, i) => (
            <div key={i} className="flex-1 flex flex-col">
              <span className="text-xs sm:text-sm font-semibold tracking-tight px-4 pb-2">
                {TAGLINE_WORDS[i]}
              </span>
              <div className="relative aspect-square border border-background/20 bg-background flex-center">
                <span className="footer-letter text-foreground font-semibold text-[min(18vw,12rem)] leading-none select-none inline-block">
                  {letter}
                </span>
              </div>
            </div>
          ))}

          {/* Fade-out gradient on the right edge */}
          <div className="absolute right-0 top-0 bottom-0 w-1/6 bg-linear-to-l from-foreground to-transparent pointer-events-none" />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
