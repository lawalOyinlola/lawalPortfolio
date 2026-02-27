import { PROJECTS } from "./projects";
import { BRAND } from "./brand";

interface Stat {
  name: string;
  value: string;
  description: string;
}

const YEARS_OF_EXPERIENCE = new Date().getFullYear() - BRAND.yearFounded;
const COUNTRIES_REACHED = 2;

export const BRAND_STATS: Stat[] = [
  {
    name: "Projects Delivered",
    value: `${PROJECTS.length}`,
    description:
      "Exciting project, attention to details. Each developed to leave a mark.",
  },
  {
    name: "Client's Loyalty",
    value: "99%",
    description:
      "Our clients trust us with their projects and keep coming back.",
  },
  {
    name: "Years of Experience",
    value: `${YEARS_OF_EXPERIENCE}+`,
    description: `We have been in the industry for over ${YEARS_OF_EXPERIENCE} years, delivering top-notch solutions.`,
  },
  {
    name: "Countries Reached",
    value: `${COUNTRIES_REACHED}+`,
    description:
      "We build global impact solutions from Sierra Leone and Nigeria.",
  },
];
