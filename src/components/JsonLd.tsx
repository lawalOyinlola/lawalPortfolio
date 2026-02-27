import { BRAND } from "@/app/constants/brand";

export default function JsonLd() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: BRAND.name,
    alternateName: BRAND.shortName,
    jobTitle: BRAND.title,
    url: BRAND.url,
    image: `${BRAND.url}${BRAND.ogImage}`,
    email: `mailto:${BRAND.email}`,
    sameAs: [
      BRAND.socials.github.href,
      BRAND.socials.linkedin.href,
      BRAND.socials.instagram.href,
      BRAND.socials.twitter.href,
    ],
    description: BRAND.description,
    address: BRAND.address.map((loc) => {
      const [city, country] = loc.split(", ");
      return {
        "@type": "PostalAddress",
        addressLocality: city,
        addressCountry: country,
      };
    }),
    knowsAbout: BRAND.keywords,
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${BRAND.name} | ${BRAND.title}`,
    url: BRAND.url,
    description: BRAND.description,
    mainEntity: { "@id": BRAND.url },
  };

  return (
    <>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be injected as raw text in an ld+json script tag. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be injected as raw text in an ld+json script tag. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
    </>
  );
}
