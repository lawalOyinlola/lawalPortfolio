import type { Metadata } from "next";
import { BRAND } from "@/app/constants/brand";
import AboutClient from "./AboutClient";

const title = "About";
const description = `Learn about ${BRAND.name} — ${BRAND.title}. ${BRAND.description}`;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    type: "profile",
    url: `${BRAND.url}/about`,
    title: `${BRAND.name} | ${title}`,
    description,
    siteName: BRAND.name,
    images: [
      {
        url: BRAND.ogImage,
        width: 1200,
        height: 630,
        alt: `${BRAND.name} — ${BRAND.title}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} | ${title}`,
    description,
    images: [BRAND.ogImage],
    creator: BRAND.socials.twitter.username,
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
