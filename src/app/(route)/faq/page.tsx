import type { Metadata } from "next";
import { BRAND, FAQS } from "@/app/constants";
import Faqs from "@/components/Faqs";
import FaqJsonLd from "@/components/FaqJsonLd";
import ContactsRef from "@/components/ContactsRef";

const title = "FAQ";
const description = `Frequently asked questions about working with ${BRAND.name}, covering engagement models, stack, process, performance, and accessibility.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    type: "website",
    url: `${BRAND.url}/faq`,
    title: `${BRAND.name} | ${title}`,
    description,
    siteName: BRAND.name,
    images: [
      {
        url: BRAND.ogImage,
        width: 1200,
        height: 630,
        alt: `${BRAND.name} - ${title}`,
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

export default function FaqPage() {
  return (
    <article className="min-h-screen relative bg-background z-1">
      <FaqJsonLd items={FAQS} />
      <div className="h-24 md:h-32" aria-hidden />
      <Faqs
        id="faq"
        title="Frequently asked questions"
        subtitle="FAQ"
        description={`Everything I usually get asked before we start working together: engagement models, my stack, how I scope and ship, and what to expect after launch. Can't find what you're looking for? Reach out and I'll respond within 1 to 2 business days.`}
      />
      <div className="relative bg-background z-10 w-full rounded-b-[2rem] md:rounded-b-[4rem] overflow-hidden">
        <ContactsRef />
      </div>
    </article>
  );
}
