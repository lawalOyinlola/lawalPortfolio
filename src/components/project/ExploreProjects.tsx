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

export default function ExploreProjects({
  currentProjectSlug,
}: {
  currentProjectSlug: string;
}) {
  const otherProjects = PROJECTS.filter((p) => p.slug !== currentProjectSlug);
  const prefersReducedMotion = usePrefersReducedMotion();
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

  useEffect(() => {
    return () => {
      autoplayRef.current = null;
    };
  }, []);

  if (otherProjects.length === 0) return null;

  return (
    <section className="flex-center">
      <div className="wrapper pb-30">
        {/* <div className="py-3.75">
          <p className="text-sm text-muted-foreground mb-3.75">
            Other projects
          </p>
          <h2 className="header normal-case leading-none">
            Explore more projects
          </h2>
        </div> */}

        <div className="py-3.75">
          <p className="text-sm uppercase tracking-widest text-foreground/40 mb-2">
            Explore other projects
          </p>
          <h2 className="bold-title uppercase leading-none max-w-[13ch]">
            More projects
          </h2>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: otherProjects.length > 1,
          }}
          plugins={plugins}
          className="w-full relative group"
        >
          <CarouselContent className="-ml-4 md:-ml-6 py-4.5">
            {otherProjects.map((project) => (
              <CarouselItem
                key={`${project.slug}-${project.name}`}
                className="pl-4 md:pl-6 sm:basis-1/2 lg:basis-1/3"
              >
                <Link
                  href={`/projects/${project.slug}`}
                  className="flex flex-col gap-5 group/card w-full"
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
