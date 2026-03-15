import Image from "next/image";
import { Project } from "@/app/constants/projects";

export default function ProjectHero({ project }: { project: Project }) {
  return (
    <section id="introduction" className="flex-center">
      <div className="wrapper flex-center gap-3.75 pb-4.5 flex-col text-center">
        <p className="text-xs capitalize tracking-widest text-muted-foreground">
          {project.category}
        </p>
        {(project.startDate || project.endDate) && (
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {project.startDate || "Unknown Start"} -{" "}
            {project.endDate || "Present"}
          </p>
        )}
        <h1 className="bold-title mb-3.75 uppercase">{project.name}</h1>
        <p className="max-w-4xl text-sm md:text-base text-center text-foreground mb-3.75 mx-4">
          {project.description}
        </p>

        <div className="w-full relative aspect-video overflow-hidden bg-muted">
          <Image
            src={project.image}
            alt={`${project.name} Hero Image`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </div>
    </section>
  );
}
