import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/app/constants";
import { formatPostDate, getLabPosts } from "@/lib/content";
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
  const labs = getLabPosts();

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
          <p className="mt-4 max-w-[58ch] text-sm leading-loose text-muted-foreground">
            Self-hosted environments and retired boxes, each taken end to end
            from recon to root. Every offensive step is paired with the control
            that stops it, because the fix is the point.
          </p>
        </header>

        {labs.length === 0 ? (
          <p className="mt-16 text-sm text-muted-foreground">
            First writeup is on its way.
          </p>
        ) : (
          <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-border/60 sm:grid-cols-2">
            {labs.map((lab) => {
              const { title, description, date, platform, difficulty, target } =
                lab.frontmatter;
              return (
                <li key={lab.slug} className="bg-background">
                  <Link
                    href={`/security/labs/${lab.slug}`}
                    className="group flex h-full flex-col gap-3 p-7 transition-colors duration-300 hover:bg-muted/40"
                  >
                    <span className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                      <span className="rounded-full border border-[#be123c]/30 bg-[#be123c]/5 px-2.5 py-0.5 text-[#be123c]">
                        {platform}
                      </span>
                      <span className="rounded-full border border-border/40 px-2.5 py-0.5">
                        {difficulty}
                      </span>
                      <span aria-hidden>·</span>
                      {formatPostDate(date)}
                      <span aria-hidden>·</span>
                      {lab.readingMinutes} min
                    </span>

                    <span className="text-lg font-semibold leading-snug text-primary underline-offset-4 group-hover:underline">
                      {title}
                    </span>

                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      Target: {target}
                    </span>

                    <span className="max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="relative bg-background z-10 w-full rounded-b-[2rem] md:rounded-b-[4rem] overflow-hidden">
        <ContactsRef />
      </div>
    </article>
  );
}
