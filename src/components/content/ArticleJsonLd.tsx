import { BRAND } from "@/app/constants/brand";
import { toAbsoluteAssetUrl } from "@/lib/content";

const PERSON_ID = `${BRAND.url}/#person`;

/**
 * Mirrors FaqJsonLd: JSON-LD in an ld+json script tag. React does not hoist
 * these the way it hoists async scripts, so rendering in the body is safe here.
 */
export default function ArticleJsonLd({
  type = "BlogPosting",
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  tags = [],
}: {
  type?: "BlogPosting" | "TechArticle";
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: Date;
  dateModified?: Date;
  tags?: string[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": type,
    headline: title,
    description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: datePublished.toISOString(),
    dateModified: (dateModified ?? datePublished).toISOString(),
    author: { "@type": "Person", "@id": PERSON_ID, name: BRAND.name },
    publisher: { "@type": "Person", "@id": PERSON_ID, name: BRAND.name },
    ...(image && { image: [toAbsoluteAssetUrl(image)] }),
    ...(tags.length > 0 && { keywords: tags.join(", ") }),
  };

  const safeJson = JSON.stringify(schema).replace(/</g, "\\u003c");

  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be injected as raw text in an ld+json script tag.
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}
