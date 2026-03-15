import { Project } from "@/app/constants/projects";
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

export default function ExploreProjects({
  currentProjectSlug,
}: {
  currentProjectSlug: string;
}) {
  const otherProjects = PROJECTS.filter((p) => p.slug !== currentProjectSlug);

  if (otherProjects.length === 0) return null;

  return (
    <section className="py-16 md:py-24 flex-center">
      <div className="wrapper">
        <div className="mb-12 pb-4 border-b border-foreground/10 flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Our projects
            </p>
            <h2 className="text-2xl md:text-4xl font-semibold tracking-tight">
              Explore more projects
            </h2>
          </div>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full relative group"
        >
          <CarouselContent className="-ml-4 md:-ml-8">
            {otherProjects.map((project, index) => (
              <CarouselItem
                key={index}
                className="pl-4 md:pl-8 sm:basis-1/2 lg:basis-1/3"
              >
                <Link
                  href={`/projects/${project.slug}`}
                  className="flex flex-col gap-4 group/card block w-full"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-foreground/5">
                    <Image
                      src={project.image}
                      alt={project.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg md:text-xl group-hover/card:opacity-80 transition-opacity">
                      {project.name}
                    </h3>
                    <p className="text-sm text-foreground/60">
                      {project.category}
                    </p>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-end gap-2 mt-8 md:absolute md:-top-20 md:right-0 md:mt-0">
            <CarouselPrevious className="static transform-none bg-background text-foreground border-foreground/20 hover:bg-foreground hover:text-background" />
            <CarouselNext className="static transform-none bg-background text-foreground border-foreground/20 hover:bg-foreground hover:text-background" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
