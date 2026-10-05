import type { Metadata } from "next";
import Link from "next/link";
import { BRAND, LAB_SERIES } from "@/app/constants";
import { formatPostDate, getLabPosts } from "@/lib/content";
import LabMap from "@/components/content/LabMap";
import LabsExplorer, {
  type LabSummary,
} from "@/components/content/LabsExplorer";
import ContactsRef from "@/components/ContactsRef";

const title = "Labs";
const description = `Hands-on security lab writeups by ${BRAND.name}: self-hosted environments and retired boxes, each taken end to end from recon to root, with the defensive lesson behind every step.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/security/labs" },
  openGraph: {
    type: "website",
    url: `${BRAND.url}/security/labs`,
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

export default function LabsPage() {
  const posts = getLabPosts();

  const labs: LabSummary[] = posts.map((lab) => ({
    slug: lab.slug,
    title: lab.frontmatter.title,
    description: lab.frontmatter.description,
    platform: lab.frontmatter.platform,
    difficulty: lab.frontmatter.difficulty,
    target: lab.frontmatter.target,
    dateLabel: formatPostDate(lab.frontmatter.date),
    readingMinutes: lab.readingMinutes,
    tags: lab.frontmatter.tags,
    tools: lab.frontmatter.tools,
    skills: lab.frontmatter.skills,
    series: lab.frontmatter.series ?? null,
    order: lab.frontmatter.order ?? null,
    cover: lab.frontmatter.cover ?? null,
    coverAlt: lab.frontmatter.coverAlt ?? null,
  }));

  const liveSlugs = posts.map((lab) => lab.slug);

  return (
    <article className="min-h-screen relative bg-background z-1">
      <div className="h-24 md:h-32" aria-hidden />

      <div className="wrapper mx-auto">
        <header className="max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            <Link href="/security" className="hover:text-primary">
              Security
            </Link>{" "}
            / Labs
          </p>
          <h1 className="bold-title mt-1 text-primary">Labs</h1>
          <p className="mt-4 max-w-[60ch] text-sm leading-loose text-muted-foreground">
            A connected set of security labs built on one machine, not a pile of
            one-off writeups. A shared foundation stands up the environment once;
            each track then reuses it to go end to end, from recon to root or
            from attack to alert, with the control that stops it named at every
            step. The map shows how they fit together.
          </p>
        </header>

        {labs.length === 0 ? (
          <p className="mt-16 text-sm text-muted-foreground">
            First writeup is on its way.
          </p>
        ) : (
          <>
            <LabMap liveSlugs={liveSlugs} />
            <LabsExplorer labs={labs} series={[...LAB_SERIES]} />
          </>
        )}
      </div>

      <div className="relative bg-background z-10 w-full rounded-b-[2rem] md:rounded-b-[4rem] overflow-hidden">
        <ContactsRef />
      </div>
    </article>
  );
}
