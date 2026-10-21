"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import GridAnimation from "@/components/GridAnimation";
import { BRAND } from "@/app/constants/brand";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowDownIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { handleNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { DURATION, EASE } from "@/lib/motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

// The portrait is uncovered by the same columns as the preloader and the page
// transition, so it arrives in the site's own motion rather than a fade.
const PORTRAIT_COLUMNS = 8;

// The tagline spells the name: Logic, Access, Workmanship, Assurance,
// Longevity. Each word sits over its letter, but only while that holds, so
// editing either constant can never pair a word with the wrong letter.
const LETTERS = BRAND.shortName.split("");
const LETTER_WORDS = LETTERS.every(
  (letter, i) => BRAND.tagline[i]?.[0]?.toUpperCase() === letter,
)
  ? BRAND.tagline
  : null;

const AboutHero = ({ ready = true }: { ready?: boolean }) => {
  const aboutRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { prefersReducedMotion } = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (!ready) return;

      const items = gsap.utils.toArray<HTMLElement>(".hero-item");
      const letters = gsap.utils.toArray<HTMLElement>(".hero-letter");
      const words = gsap.utils.toArray<HTMLElement>(".hero-word");
      const columns = gsap.utils.toArray<HTMLElement>(".portrait-col");
      if (items.length === 0) return;

      // When user prefers reduced motion, just reveal everything immediately
      if (prefersReducedMotion) {
        gsap.set([...items, ...letters, ...words], { autoAlpha: 1 });
        gsap.set(columns, { yPercent: -100 });
        return;
      }

      const tl = gsap.timeline({ delay: 0.2 });

      // The columns lift from the centre out while the photo settles from a
      // slight zoom, so it reads as one move rather than two.
      tl.to(columns, {
        yPercent: -100,
        duration: 1.3,
        ease: EASE.inOut,
        stagger: { amount: 0.35, from: "center" },
      })
        .fromTo(
          ".portrait-img",
          { scale: 1.15 },
          { scale: 1, duration: 1.8, ease: EASE.out },
          0,
        )
        // The name rises out of the bottom edge, a letter at a time...
        .fromTo(
          letters,
          { yPercent: 100, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: DURATION.slow,
            stagger: 0.07,
            ease: EASE.out,
          },
          0.45,
        )
        // ...and each word lands on its letter once the letter is up.
        .fromTo(
          words,
          { y: 8, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: DURATION.base,
            stagger: 0.07,
            ease: EASE.soft,
          },
          0.95,
        )
        .fromTo(
          items,
          { y: 20, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: DURATION.slow,
            stagger: 0.1,
            ease: EASE.out,
          },
          0.7,
        );

      // As the hero scrolls away the photo trails the page, and the name
      // trails it a little further. Transforms only.
      const scrollTrigger = {
        trigger: aboutRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      };
      gsap.to(".portrait-parallax", {
        yPercent: 8,
        ease: "none",
        scrollTrigger,
      });
      gsap.to(".hero-name", { yPercent: 35, ease: "none", scrollTrigger });
    },
    {
      dependencies: [ready, prefersReducedMotion],
      scope: aboutRef,
      revertOnUpdate: true,
    },
  );

  // Pointer depth: the photo drifts toward the cursor and the name away from
  // it, a few pixels each, so they read as layers. Its own wrapper, so it
  // never fights the scroll parallax or the entrance zoom. Fine pointers only,
  // and never for reduced motion.
  useGSAP(
    () => {
      const section = aboutRef.current;
      const photo = section?.querySelector(".portrait-shift");
      const name = section?.querySelector(".hero-name");
      if (!ready || prefersReducedMotion || !section || !photo || !name) return;
      if (!window.matchMedia("(pointer: fine)").matches) return;

      const follow = { duration: 1.1, ease: "power3" };
      const photoX = gsap.quickTo(photo, "x", follow);
      const photoY = gsap.quickTo(photo, "y", follow);
      const nameX = gsap.quickTo(name, "x", { ...follow, duration: 1.4 });

      const move = (e: PointerEvent) => {
        const rect = section.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        photoX(nx * 28);
        photoY(ny * 18);
        nameX(nx * -16);
      };
      const settle = () => {
        photoX(0);
        photoY(0);
        nameX(0);
      };

      section.addEventListener("pointermove", move);
      section.addEventListener("pointerleave", settle);
      return () => {
        section.removeEventListener("pointermove", move);
        section.removeEventListener("pointerleave", settle);
      };
    },
    {
      dependencies: [ready, prefersReducedMotion],
      scope: aboutRef,
      revertOnUpdate: true,
    },
  );

  return (
    <section
      id="introduction"
      ref={aboutRef}
      className="relative z-1 flex h-dvh min-h-160 w-full overflow-hidden bg-foreground text-background"
    >
      {/* Dusk grid animation, showing either side of the portrait */}
      <div className="absolute inset-0 z-2 opacity-80">
        <GridAnimation
          ready={ready}
          triggerRef={aboutRef}
          shutterClassName="bg-muted/10"
        />
      </div>

      {/* Portrait: centred and full height from md up, across the top of the
          screen on phones. The mask fades it into the section on every open side, so
          the photo has no edges and the name over it stays legible. */}
      <div className="about-portrait-mask absolute inset-x-0 top-0 z-3 h-[72%] md:inset-x-auto md:left-1/2 md:aspect-3/4 md:h-full md:-translate-x-1/2">
        <div className="portrait-parallax absolute inset-x-0 top-[-5%] h-[110%]">
          <div className="portrait-shift absolute inset-0">
            <Image
              src="/images/about/portrait.jpg"
              alt={`Portrait of ${BRAND.name}`}
              fill
              preload
              sizes="(max-width: 768px) 100vw, 75vh"
              className="portrait-img object-cover object-top grayscale contrast-125 brightness-75"
            />
          </div>
        </div>

        {/* Covers the photo until the reveal; the section's own colour, so
            before it lifts the photo is simply not there. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex"
        >
          {Array.from({ length: PORTRAIT_COLUMNS }, (_, i) => (
            <div
              key={i}
              className="portrait-col h-full flex-1 -mr-px last:mr-0 bg-foreground"
            />
          ))}
        </div>
      </div>

      <div className="wrapper relative z-10 mx-auto flex h-full flex-col justify-end gap-8 pb-24 md:gap-10 md:pb-20">
        <div className="grid items-end gap-6 md:grid-cols-2 md:gap-10">
          <div className="flex flex-col gap-4">
            {/* Availability badge */}
            <div className="hero-item invisible flex items-center gap-2 text-xs uppercase tracking-widest text-background/70">
              <span className="inline-block size-2 rounded-full bg-green-400 motion-safe:animate-pulse" />
              <span>Available for new projects</span>
            </div>

            <h1 className="hero-item invisible text-2xl font-semibold uppercase leading-tight tracking-tight md:text-4xl">
              <span className="sr-only">{BRAND.name}, </span>
              Software Engineer
              <br />
              <span className="font-extralight normal-case italic text-background/70">
                &amp; Application Security
              </span>
            </h1>
          </div>

          <div className="flex flex-col gap-4 md:max-w-sm md:justify-self-end">
            <p className="hero-item invisible text-sm leading-relaxed text-background/80 md:text-base">
              {BRAND.description}
            </p>

            {/* Read as buttons, not as more text: the ask is filled, the
                way to the work is outlined. The arrows say where each goes:
                down for the contact section on this page, right for another
                page (up-right stays for links that leave the site). */}
            <div className="hero-item invisible flex flex-wrap items-center gap-3">
              <Button
                type="button"
                size="lg"
                className="bg-background px-5 text-foreground hover:bg-background/85"
                onClick={() =>
                  handleNavigation("/about", "contact", pathname, router)
                }
              >
                Let&apos;s talk
                <ArrowDownIcon className="group-hover:translate-y-0.5 transition-transform" />
              </Button>
              {/* The featured projects on the home page, rather than one
                  project's page. A real link: it prefetches, opens in a new
                  tab on cmd-click, and the page transition lands on the
                  section under the cover. */}
              <Link
                href="/#projects"
                // cn, not buttonVariants alone: cva only concatenates, so the
                // ghost border and hover colours would not be overridden.
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "border-background/35 px-5 text-background hover:border-background hover:bg-transparent hover:text-background",
                )}
              >
                See my work
                <ArrowRightIcon className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* The name, mirrored a letter at a time. LAWAL reads the same either
            way, so the mirrored word still runs left to right, and each
            tagline word sits over the letter it starts with. */}
        {LETTER_WORDS && <p className="sr-only">{LETTER_WORDS.join(", ")}</p>}
        <div
          aria-hidden="true"
          className="hero-name flex justify-between font-black uppercase leading-[0.76] tracking-tighter text-[clamp(5.5rem,26vw,28rem)] select-none"
        >
          {LETTERS.map((letter, i) => (
            <span key={i} className="relative">
              {LETTER_WORDS && (
                <span className="hero-word invisible absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap text-[9px] font-medium tracking-[0.2em] text-background/60 max-sm:hidden md:mb-4 md:text-[11px]">
                  {LETTER_WORDS[i]}
                </span>
              )}
              <span className="block overflow-hidden">
                <span className="hero-letter invisible inline-block -scale-x-100">
                  {letter}
                </span>
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
