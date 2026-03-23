"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Project } from "@/app/constants/projects";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export default function ProjectPoints({ project }: { project: Project }) {
  const containerRef = useRef<HTMLElement>(null);
  const { prefersReducedMotion } = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion) {
        gsap.set(".point-item", { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        ".point-item",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          },
        },
      );
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] },
  );
  if (!project.keypoints || project.keypoints.length === 0) return null;

  return (
    <section ref={containerRef} id="key-points" className="flex-center">
      <div className="wrapper py-4.5 flex flex-col gap-6 md:gap-9">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Points</p>
          <h2 className="header lowercase leading-none max-w-[11ch]">
            {project.keypoints.length} main points of this project
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-7">
          {project.keypoints.map((point) => (
            <div
              key={`${project.slug}-${point}`}
              className="point-item opacity-0 flex flex-col gap-5"
            >
              <div className="size-2.5 bg-foreground" />
              <p className="text-xs md:text-sm leading-snug">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
