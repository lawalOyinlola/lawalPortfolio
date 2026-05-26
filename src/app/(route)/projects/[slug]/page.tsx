import { notFound } from "next/navigation";
import { PROJECTS } from "@/app/constants/projects";
import { BRAND } from "@/app/constants/brand";
import ProjectHero from "@/components/project/ProjectHero";
import ProjectPoints from "@/components/project/ProjectPoints";
import ProjectDetails from "@/components/project/ProjectDetails";
import ExploreProjects from "@/components/project/ExploreProjects";
import ContactsRef from "@/components/ContactsRef";
import { Metadata } from "next";

function isValidISODate(value?: string): value is string {
  if (!value) return false;
  if (!/^\d{4}(-\d{2}(-\d{2}(T.+)?)?)?$/.test(value)) return false;
  return Number.isFinite(Date.parse(value));
}

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

  const title = `${project.name} | Project Study`;
  const url = `${BRAND.url}/projects/${project.slug}`;
  const image = project.image.startsWith("http")
    ? project.image
    : `${BRAND.url}${project.image}`;

  return {
    title,
    description: project.description,
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
    openGraph: {
      type: "article",
      url,
      title: `${BRAND.name} | ${title}`,
      description: project.description,
      siteName: BRAND.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${project.name} — ${project.category}`,
        },
      ],
      ...(isValidISODate(project.startDate) && {
        publishedTime: project.startDate,
      }),
      ...(isValidISODate(project.endDate) && {
        modifiedTime: project.endDate,
      }),
      authors: [BRAND.url],
    },
    twitter: {
      card: "summary_large_image",
      title: `${BRAND.name} | ${title}`,
      description: project.description,
      images: [image],
      creator: BRAND.socials.twitter.username,
    },
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

      <ExploreProjects currentProjectSlug={project.slug} />

      {/* Z-Index logic: We make ContactRef sit above the transparent hole that reveals footer */}
      <div className="relative bg-background z-10 w-full rounded-b-[2rem] md:rounded-b-[4rem] overflow-hidden">
        <ContactsRef />
      </div>
    </article>
  );
}
