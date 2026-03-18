import Image from "next/image";
import { Project } from "@/app/constants/projects";

export default function ProjectDetails({ project }: { project: Project }) {
  if (!project.deeperDetails || project.deeperDetails.length === 0) return null;

  const details = project.deeperDetails.slice(0, 4);
  const count = details.length;

  return (
    <section id="deeper-details" className="bg-muted flex-center">
      <div className="wrapper">
        {/* <div className="py-3.75">
          <p className="text-sm text-muted-foreground mb-3.75">Details</p>
          <h2 className="header normal-case leading-none">
            Project views & more details
          </h2>
        </div> */}

        <div className="py-3.75">
          <p className="text-sm uppercase tracking-widest text-foreground/40 mb-2">
            Views & details
          </p>
          <h2 className="bold-title uppercase leading-none max-w-[13ch]">
            Project views
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-y-9 py-4.5">
          {details.map((detail, index) => {
            let spanClass = "";
            if (count === 1) spanClass = "md:col-span-2";
            if (count === 3 && index === 0) spanClass = "md:col-span-2";

            return (
              <div
                key={`${detail.title}-${detail.image}`}
                className={`flex flex-col gap-5 ${spanClass}`}
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
