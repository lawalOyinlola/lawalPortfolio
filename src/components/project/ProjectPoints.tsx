import { Project } from "@/app/constants/projects";

export default function ProjectPoints({ project }: { project: Project }) {
  if (!project.keypoints || project.keypoints.length === 0) return null;

  return (
    <section id="key-points" className="flex-center">
      <div className="wrapper py-4.5 flex flex-col gap-6 md:gap-9">
        <div>
          <p className="text-sm text-muted-foreground mb-3.75">Points</p>
          <h2 className="header lowercase leading-none max-w-[11ch]">
            {project.keypoints.length} main points of this project
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-7">
          {project.keypoints.map((point) => (
            <div
              key={`${project.slug}-${point}`}
              className="flex flex-col gap-5"
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
