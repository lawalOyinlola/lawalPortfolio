"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PROJECTS } from "@/app/constants/projects";
import Autoplay from "embla-carousel-autoplay";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionHeader } from "@/components/ui/SectionHeader";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export default function ExploreProjects({
  currentProjectSlug,
}: {
  currentProjectSlug: string;
}) {
  const otherProjects = PROJECTS.filter((p) => p.slug !== currentProjectSlug);
  const { prefersReducedMotion } = usePrefersReducedMotion();
  const autoplayRef = useRef<ReturnType<typeof Autoplay> | null>(null);

  const plugins = useMemo(() => {
    if (prefersReducedMotion) {
      autoplayRef.current = null;
      return [];
    }

    if (!autoplayRef.current) {
      autoplayRef.current = Autoplay({
        delay: 3000,
      });
    }

    return [autoplayRef.current];
  }, [prefersReducedMotion]);

  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    return () => {
      autoplayRef.current?.stop?.();
      autoplayRef.current = null;
    };
  }, []);

  useGSAP(
    () => {
      // Don't animate if user prefers reduced motion
      if (prefersReducedMotion) {
        gsap.set(".explore-item", { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        ".explore-item",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 40%",
          },
        },
      );
    },
    { scope: containerRef, dependencies: [prefersReducedMotion, otherProjects.length] },
  );

  if (otherProjects.length === 0) return null;

  return (
    <section ref={containerRef} className="flex-center overflow-hidden">
      <div className="wrapper pb-30">
        <SectionHeader
          subtitle="Explore other projects"
          title="More projects"
          className="max-w-2xl"
        />

        <Carousel
          opts={{
            align: "start",
            loop: otherProjects.length > 1,
          }}
          aria-label="Explore other projects carousel"
          plugins={plugins}
          className="w-full relative group"
        >
          <CarouselContent className="-ml-4 md:-ml-6 py-4.5">
            {otherProjects.map((project, index) => (
              <CarouselItem
                key={`${project.slug}-${project.name}`}
                className="pl-4 md:pl-6 sm:basis-1/2 lg:basis-1/3"
                aria-label={`Project ${index + 1} of ${otherProjects.length}: ${project.name}`}
              >
                <Link
                  href={`/projects/${project.slug}`}
                  className="explore-item opacity-0 flex flex-col gap-5 group/card w-full"
                >
                  <div className="relative w-full aspect-4/3 overflow-hidden bg-foreground/5">
                    <Image
                      src={project.image}
                      alt={project.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover/card:scale-102"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base group-hover/card:opacity-80 transition-opacity">
                      {project.name}
                    </h3>
                    <p className="text-xs text-foreground/60">
                      {project.category}
                    </p>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="flex justify-end gap-2 mt-8 md:absolute md:-top-20 md:right-0 md:mt-0">
            <CarouselPrevious
              size="icon-lg"
              className="static size-9 top-auto start-auto translate-y-0 md:absolute md:top-10 md:start-auto md:-left-20 md:transform-none bg-background text-foreground border-foreground/20 hover:bg-foreground hover:text-background"
            />
            <CarouselNext
              size="icon-lg"
              className="static size-9 top-auto end-auto translate-y-0 md:absolute md:top-10 md:right-0 md:transform-none bg-background text-foreground border-foreground/20 hover:bg-foreground hover:text-background"
            />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
