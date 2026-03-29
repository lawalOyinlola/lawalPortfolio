"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { Project } from "@/app/constants/projects";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export default function ProjectHero({ project }: { project: Project }) {
  const containerRef = useRef<HTMLElement>(null);
  const { prefersReducedMotion } = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion) {
        gsap.set(".hero-anim", { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        ".hero-anim",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.2,
        },
      );
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] },
  );
  return (
    <section ref={containerRef} id="introduction" className="flex-center">
      <div className="wrapper flex-center gap-3.75 pb-4.5 flex-col text-center">
        <div className="hero-anim opacity-0 flex flex-col items-center gap-1">
          <p className="text-xs capitalize tracking-widest text-muted-foreground">
            {project.category}
          </p>
          {(project.startDate || project.endDate) && (
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {project.startDate && project.endDate
                ? `${project.startDate} - ${project.endDate}`
                : project.startDate
                  ? `${project.startDate} - Present`
                  : project.endDate}
            </p>
          )}
        </div>
        <h1 className="hero-anim opacity-0 bold-title mb-3.75 uppercase">
          {project.name}
        </h1>
        <p className="hero-anim opacity-0 max-w-4xl text-sm md:text-base text-center text-foreground mb-3.75 mx-4">
          {project.description}
        </p>

        <div className="hero-anim opacity-0 w-full relative aspect-video overflow-hidden bg-muted">
          <Image
            src={project.image}
            alt={`${project.name} Hero Image`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
        </div>
      </div>
    </section>
  );
}
