"use client";

import { useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import GridAnimation from "@/components/GridAnimation";
import { BRAND } from "@/app/constants/brand";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { handleNavigation } from "@/lib/navigation";
import FluidCursorEffect from "@/components/ui/smokey-cursor-effect";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { DURATION, EASE } from "@/lib/motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

const AboutHero = ({ ready = true }: { ready?: boolean }) => {
  const aboutRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { prefersReducedMotion } = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (!ready) return;

      const items = gsap.utils.toArray<HTMLElement>(".hero-item");
      const tags = gsap.utils.toArray<HTMLElement>(".tag-item");
      if (items.length === 0) return;

      // When user prefers reduced motion, just reveal everything immediately
      if (prefersReducedMotion) {
        gsap.set([...items, ...tags], { autoAlpha: 1, x: 0, y: 0, scale: 1 });
        return;
      }

      const tl = gsap.timeline({ delay: 0.2 });

      tl.fromTo(
        items,
        { y: 30, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: DURATION.slow,
          stagger: 0.15,
          ease: EASE.out,
        },
      );

      if (tags.length > 0) {
        tl.fromTo(
          tags,
          { autoAlpha: 0, x: -24 },
          {
            autoAlpha: 1,
            x: 0,
            duration: DURATION.slow,
            stagger: 0.08,
            ease: EASE.out,
          },
          "-=0.7",
        );
      }
    },
    { dependencies: [ready, prefersReducedMotion], scope: aboutRef },
  );

  return (
    <section
      id="introduction"
      ref={aboutRef}
      className="relative z-1 h-dvh w-full flex-center items-end overflow-hidden bg-foreground text-background"
    >
      {/* Smokey cursor effect */}
      <FluidCursorEffect triggerRef={aboutRef} />

      {/* Dusk grid animation in background */}
      <div className="absolute inset-0 z-2 opacity-80">
        <GridAnimation
          ready={ready}
          triggerRef={aboutRef}
          shutterClassName="bg-muted/10"
        />
      </div>

      {/* No blend mode here: blended over the coloured smoke, the text's
          colour (and its contrast) would change with every cursor move. */}
      <div className="wrapper relative z-10 max-w-206 flex flex-col gap-8">
        {/* Availability badge */}
        <div className="hero-item opacity-0 flex items-center gap-2 text-xs uppercase tracking-widest text-background/60">
          <span className="inline-block size-2 rounded-full bg-green-400 motion-safe:animate-pulse" />
          <span>Available for new projects</span>
        </div>

        <div className="hero-item opacity-0 flex flex-col gap-6">
          <h1 className="bold-title text-background leading-tight">
            Software Engineer
            <br />
            <span className="text-background/50 font-extralight normal-case italic">
              &amp; Application Security
            </span>
          </h1>

          <p className="text-background/70 text-sm md:text-base max-w-[52ch] leading-loose">
            {BRAND.description}
          </p>
        </div>

        <div className="hero-item opacity-0 flex items-center gap-4 flex-wrap">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() =>
              handleNavigation("/about", "competence", pathname, router)
            }
          >
            See my work
            <ArrowDownIcon className="group-hover:translate-y-0.5 transition-transform" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() =>
              handleNavigation("/about", "contact", pathname, router)
            }
          >
            Let&apos;s talk
            <ArrowRightIcon className="group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-2">
          {BRAND.tagline.map((tag) => (
            <span
              key={tag}
              className="tag-item opacity-0 text-[10px] uppercase tracking-widest border border-background/20 text-background/50 px-2.5 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
