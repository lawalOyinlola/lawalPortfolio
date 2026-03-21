"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { Project } from "@/app/constants/projects";
import { SectionHeader } from "@/components/ui/SectionHeader";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export default function ProjectDetails({ project }: { project: Project }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".project-detail-item",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 40%",
          },
        },
      );
    },
    { scope: containerRef },
  );
  if (!project.deeperDetails || project.deeperDetails.length === 0) return null;

  const details = project.deeperDetails.slice(0, 4);
  const count = details.length;

  return (
    <section
      ref={containerRef}
      id="deeper-details"
      className="bg-muted flex-center"
    >
      <div className="wrapper">
        <SectionHeader
          subtitle="Views & details"
          title="Project views"
          className="max-w-2xl"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-y-9 py-4.5">
          {details.map((detail, index) => {
            let spanClass = "";
            if (count === 1) spanClass = "md:col-span-2";
            if (count === 3 && index === 0) spanClass = "md:col-span-2";

            return (
              <div
                key={`${detail.title}-${detail.image}`}
                className={`project-detail-item opacity-0 flex flex-col gap-5 ${spanClass}`}
              >
                <div className="relative w-full aspect-4/3 md:aspect-video overflow-hidden bg-muted">
                  <Image
                    src={detail.image}
                    alt={detail.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                  <h3 className="font-semibold text-sm md:text-base w-full md:w-2/7">
                    {detail.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground w-full md:w-5/7">
                    {detail.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
