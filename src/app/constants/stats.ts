import { PROJECTS } from "./projects";
import { BRAND } from "./brand";

interface Stat {
  name: string;
  value: string;
  description: string;
}

export const YEARS_OF_EXPERIENCE = new Date().getFullYear() - BRAND.yearFounded;
export const COUNTRIES_REACHED = 2;

export const BRAND_STATS: Stat[] = [
  {
    name: "Projects Delivered",
    value: `${PROJECTS.length}`,
    description:
      "Shipped to real users across FinTech, fleet tracking and AI platforms.",
  },
  {
    name: "Lighthouse Score",
    value: "100",
    description:
      "SafulPay's corporate site, up from 68, in all four Lighthouse categories.",
  },
  {
    name: "Years Building",
    value: `${YEARS_OF_EXPERIENCE}+`,
    description:
      "From IT operations to production software to application security.",
  },
  {
    name: "Countries Reached",
    value: `${COUNTRIES_REACHED}+`,
    description: "Products in daily use in Nigeria and Sierra Leone.",
  },
];
