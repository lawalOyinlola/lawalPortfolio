import Image from "next/image";
import { Project } from "@/app/constants/projects";

export default function ProjectDetails({ project }: { project: Project }) {
  if (!project.deeperDetails || project.deeperDetails.length === 0) return null;

  const details = project.deeperDetails.slice(0, 4);
  const count = details.length;

  return (
    <section id="deeper-details" className="py-16 md:py-24 flex-center">
      <div className="wrapper">
        <div className="mb-12 md:mb-20">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Details
          </p>
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight">
            Project views & more details
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {details.map((detail, index) => {
            let spanClass = "";
            if (count === 1) spanClass = "md:col-span-2";
            if (count === 3 && index === 0) spanClass = "md:col-span-2";

            return (
              <div key={index} className={`flex flex-col gap-6 ${spanClass}`}>
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
                  <h3 className="font-semibold text-lg md:text-xl w-full md:w-1/3">
                    {detail.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground w-full md:w-2/3">
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
