"use client";
import { useState } from "react";
import Image from "next/image";
import { FEATURED_PROJECTS } from "@/app/constants";

function Projects() {
    const [activeIndex, setActiveIndex] = useState(0);

    if (FEATURED_PROJECTS.length === 0) {
        return null;
    }

    const project = FEATURED_PROJECTS[activeIndex];

    return (
        <section className="min-h-screen flex-center bg-muted">
            <div className="wrapper flex flex-col justify-center gap-4.5">
                <h1 className="font-semibold tracking-tight uppercase text-sm">
                    Projects
                </h1>

                {/* Numbered Tabs */}
                <div className="flex items-center gap-10">
                    {FEATURED_PROJECTS.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={`title transition-all cursor-pointer ${activeIndex !== index ? "text-4xl text-muted-foreground" : " "}`}
                        >
                            {String(index + 1).padStart(2, "0")}.
                        </button>
                    ))}
                </div>

                {/* Project Content */}
                <div className="flex gap-10">
                    {/* Project Image */}
                    <div className="relative w-1/2 aspect-4/3 rounded-lg overflow-hidden bg-foreground/5">
                        <Image
                            src={project.image}
                            alt={project.name}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Project Info */}
                    <div className="flex flex-col justify-between w-1/2 py-2">
                        <div className="flex flex-col gap-5">
                            <p>
                                {project.category}
                            </p>
                            <h2 className="bold-title">
                                {project.name}
                            </h2>
                        </div>
                        <p className="max-w-lg">
                            {project.description}
                        </p>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex gap-2.5">
                    {project.tags.map((tag, i) => (
                        <div key={i} className="flex flex-col gap-4 max-w-43.5 py-4.5 pr-4">
                            <div className="size-2.5 bg-foreground" />
                            <p className="text-xs leading-snug">
                                {tag}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Projects;
