import { notFound, redirect } from "next/navigation";
import { PROJECTS } from "@/app/constants/projects";

const defaultProject = PROJECTS.find((p) => p.featured) ?? PROJECTS[0];

export default function ProjectsIndexPage() {
  if (!defaultProject) notFound();
  redirect(`/projects/${defaultProject.slug}`);
}
