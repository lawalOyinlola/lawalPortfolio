import type { Metadata } from "next";
import { BRAND } from "@/app/constants/brand";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${BRAND.name} — ${BRAND.title}. ${BRAND.description}`,
};

export default function AboutPage() {
  return <AboutClient />;
}
