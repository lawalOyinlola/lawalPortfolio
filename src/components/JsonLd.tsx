import { BRAND } from "@/app/constants/brand";

export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: BRAND.name,
    jobTitle: BRAND.title,
    url: BRAND.url,
    image: `${BRAND.url}${BRAND.ogImage}`,
    sameAs: [
      BRAND.socials.github.href,
      BRAND.socials.linkedin.href,
      BRAND.socials.instagram.href,
      BRAND.socials.twitter.href,
    ],
    description: BRAND.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lagos",
      addressCountry: "NG",
    },
    knowsAbout: BRAND.keywords,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
