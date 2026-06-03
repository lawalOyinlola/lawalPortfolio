import { BRAND } from "@/app/constants/brand";

const PERSON_ID = `${BRAND.url}/#person`;

export default function JsonLd() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND.name,
    url: BRAND.url,
    description: BRAND.description,
    alternateName: [
      "Oyinlola Ibrahim Lawal",
      "Lawal Oyinlola",
      "honeyzrich",
      "HoneyzRich",
    ],
    author: { "@type": "Person", "@id": PERSON_ID },
  };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: BRAND.name,
    alternateName: [
      "Oyinlola Ibrahim Lawal",
      "Lawal Oyinlola",
      "honeyzrich",
      "HoneyzRich",
    ],
    jobTitle: BRAND.title,
    url: BRAND.url,
    image: `${BRAND.url}${BRAND.ogImage}`,
    email: `mailto:${BRAND.email}`,
    sameAs: [
      BRAND.url,
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
    worksFor: [
      { "@type": "Organization", name: "Trakkam" },
      { "@type": "Organization", name: "SafulPay" },
    ],
    alumniOf: [
      { "@type": "EducationalOrganization", name: "AltSchool Africa" },
    ],
    knowsAbout: BRAND.keywords,
  };

  const profilePageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${BRAND.name} | ${BRAND.title}`,
    url: BRAND.url,
    description: BRAND.description,
    mainEntity: { "@id": PERSON_ID },
  };

  const ld = (obj: object) =>
    JSON.stringify(obj).replace(/</g, "\\u003c");

  return (
    <>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be injected as raw text in an ld+json script tag. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld(websiteSchema) }}
      />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be injected as raw text in an ld+json script tag. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld(personSchema) }}
      />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be injected as raw text in an ld+json script tag. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld(profilePageSchema) }}
      />
    </>
  );
}