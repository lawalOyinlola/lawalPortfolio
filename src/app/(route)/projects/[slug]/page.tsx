import { notFound } from "next/navigation";
import { PROJECTS } from "@/app/constants/projects";
import ProjectHero from "@/components/project/ProjectHero";
import ProjectPoints from "@/components/project/ProjectPoints";
import ProjectDetails from "@/components/project/ProjectDetails";
import ExploreProjects from "@/components/project/ExploreProjects";
import ContactsRef from "@/components/ContactsRef";
import { Metadata } from "next";

export async function generateStaticParams() {
  return PROJECTS.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const project = PROJECTS.find((p) => p.slug === resolvedParams.slug);
  if (!project) return {};

  return {
    title: `${project.name} | Project Study`,
    description: project.description,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const project = PROJECTS.find((p) => p.slug === resolvedParams.slug);

  if (!project) {
    notFound();
  }

  return (
    <article className="min-h-screen relative bg-background project-content z-1 pb-0">
      <ProjectHero project={project} />
      <ProjectPoints project={project} />
      <ProjectDetails project={project} />

      {/* Spacer to give room before Explore and Contact */}
      <div className="h-16 md:h-32 bg-background"></div>

      <ExploreProjects currentProjectSlug={project.slug} />

      {/* Z-Index logic: We make ContactRef sit above the transparent hole that reveals footer */}
      <div className="relative bg-background z-10 w-full rounded-b-[2rem] md:rounded-b-[4rem] overflow-hidden">
        <ContactsRef />
      </div>
    </article>
  );
}
