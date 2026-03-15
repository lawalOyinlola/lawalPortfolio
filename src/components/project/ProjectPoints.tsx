import { Project } from "@/app/constants/projects";

export default function ProjectPoints({ project }: { project: Project }) {
  if (!project.keypoints || project.keypoints.length === 0) return null;

  return (
    <section
      id="key-points"
      className="py-16 md:py-24 bg-foreground/5 flex-center"
    >
      <div className="wrapper">
        <div className="mb-12 md:mb-20">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Points
          </p>
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight max-w-sm">
            {project.keypoints.length} main points of this project
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {project.keypoints.map((point, index) => (
            <div key={index} className="flex flex-col gap-4">
              <div className="size-2 bg-foreground" />
              <p className="text-sm md:text-base leading-snug">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
