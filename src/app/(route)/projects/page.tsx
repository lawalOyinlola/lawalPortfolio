import { notFound, redirect } from "next/navigation";
import { PROJECTS_HREF } from "@/app/constants/projects";

export default function ProjectsIndexPage() {
  if (PROJECTS_HREF === "/projects") notFound();
  redirect(PROJECTS_HREF);
}
