import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/app/constants";
import { formatPostDate, getBlogPosts, getLabPosts } from "@/lib/content";
import ContactsRef from "@/components/ContactsRef";

const title = "Security";
const description = `The security side of ${BRAND.name}'s work: application security from the builder's side, hands-on lab writeups, and the method behind them — permission, scope, and a report anyone can act on.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/security" },
  openGraph: {
    type: "website",
    url: `${BRAND.url}/security`,
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

const SECURITY_TAGS = new Set([
  "security",
  "cybersecurity",
  "appsec",
  "pentesting",
  "penetrationtesting",
]);

export default function SecurityPage() {
  const labs = getLabPosts();
  const securityPosts = getBlogPosts().filter((post) =>
    post.frontmatter.tags.some((tag) => SECURITY_TAGS.has(tag.toLowerCase())),
  );

  return (
    <article className="min-h-screen relative bg-background z-1">
      <div className="h-24 md:h-32" aria-hidden />

      <div className="wrapper mx-auto">
        <header className="max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Security
          </p>
          <h1 className="bold-title mt-1 text-primary">Security</h1>
          <p className="mt-4 max-w-[60ch] text-sm leading-loose text-muted-foreground">
            I build software secure by default, and I break it to understand
            how. That means application security from the builder&rsquo;s side,
            hands-on lab work, and a discipline that matters more than any tool:
            test only with permission, stay inside scope, and write a report the
            people who have to fix things can actually act on.
          </p>
        </header>

        <section aria-labelledby="labs-heading" className="mt-16">
          <div className="flex items-baseline justify-between gap-4">
            <h2
              id="labs-heading"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-primary"
            >
              Labs
            </h2>
            <Link
              href="/security/labs"
              className="text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
            >
              All labs →
            </Link>
          </div>

          {labs.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              First writeup is on its way.
            </p>
          ) : (
            <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl bg-border/60 sm:grid-cols-2">
              {labs.map((lab) => (
                <li key={lab.slug} className="bg-background">
                  <Link
                    href={`/security/labs/${lab.slug}`}
                    className="group flex h-full flex-col gap-2 p-6 transition-colors duration-300 hover:bg-muted/40"
                  >
                    <span className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                      <span className="rounded-full border border-[#be123c]/30 bg-[#be123c]/5 px-2.5 py-0.5 text-[#be123c]">
                        {lab.frontmatter.platform}
                      </span>
                      <span className="rounded-full border border-border/40 px-2.5 py-0.5">
                        {lab.frontmatter.difficulty}
                      </span>
                    </span>
                    <span className="text-base font-semibold leading-snug text-primary underline-offset-4 group-hover:underline">
                      {lab.frontmatter.title}
                    </span>
                    <span className="max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
                      {lab.frontmatter.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {securityPosts.length > 0 && (
          <section aria-labelledby="writing-heading" className="mt-16">
            <h2
              id="writing-heading"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-primary"
            >
              Writing
            </h2>
            <ul className="mt-6 flex flex-col divide-y divide-border/60">
              {securityPosts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col gap-1 py-5 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                      {formatPostDate(post.frontmatter.date)}
                      <span aria-hidden>·</span>
                      {post.readingMinutes} min
                    </span>
                    <span className="text-base font-semibold leading-snug text-primary underline-offset-4 group-hover:underline">
                      {post.frontmatter.title}
                    </span>
                    <span className="max-w-[64ch] text-sm leading-relaxed text-muted-foreground">
                      {post.frontmatter.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="relative bg-background z-10 w-full rounded-b-[2rem] md:rounded-b-[4rem] overflow-hidden">
        <ContactsRef />
      </div>
    </article>
  );
}
