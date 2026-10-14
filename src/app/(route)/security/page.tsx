import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  GithubLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import { BRAND, LAB_SERIES } from "@/app/constants";
import { getBlogPosts, getLabPosts, toPostSummaries } from "@/lib/content";
import ContactsRef from "@/components/ContactsRef";
import { PostTile } from "@/components/content/PostCard";
import LabIndex from "@/components/security/LabIndex";
import ToolMarquee from "@/components/security/ToolMarquee";
import { SectionHeader } from "@/components/ui/SectionHeader";

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

// The discipline from the intro, broken out so it reads as the rules every
// lab and post on this page is held to.
const RULES = [
  {
    title: "Permission",
    body: "I only test what I own or have written permission to test.",
  },
  {
    title: "Scope",
    body: "I stay inside what was agreed, even when something interesting sits just past it.",
  },
  {
    title: "Report",
    body: "Every test ends in a written report: what I found, why it matters, and how to fix it.",
  },
];

/**
 * The wider case-study record, kept on GitHub in CAR form (Context, Action,
 * Result). Linked rather than mirrored: the repo is the source of truth and
 * grows on its own schedule.
 */
const CASE_STUDIES_URL = `${BRAND.socials.github.href}/cybersecurity-portfolio`;

const CASE_STUDY_THEMES = [
  "Application security engineering",
  "Incident analysis",
  "Governance, risk and compliance",
  "Technical skills labs",
];

/**
 * Shown as a static badge with links out rather than Credly's embed: the
 * embed is a third-party script and iframe, which the site's CSP blocks by
 * design. The badge image is a local copy of Credly's own.
 */
const CREDENTIAL = {
  name: "Google Cybersecurity Professional Certificate",
  issuer: "Google",
  badge: "/images/credentials/google-cybersecurity-certificate.png",
  links: [
    {
      label: "Verify on Credly",
      href: "https://www.credly.com/badges/99d514e9-c306-4f55-95db-efd37a099b53/public_url",
    },
    {
      label: "Coursera record",
      href: "https://www.coursera.org/account/accomplishments/specialization/PZZDNMRKGNAL",
    },
  ],
};

/** How many posts the Writing section shows before handing off to /blog. */
const WRITING_LIMIT = 4;

export default function SecurityPage() {
  // Series order, then build order within a series: the same reading order
  // the labs page and its map use, AppSec first.
  const seriesRank = (series?: string) => {
    const i = LAB_SERIES.findIndex((s) => s.name === series);
    return i === -1 ? LAB_SERIES.length : i;
  };
  const labs = [...getLabPosts()].sort(
    (a, b) =>
      seriesRank(a.frontmatter.series) - seriesRank(b.frontmatter.series) ||
      (a.frontmatter.order ?? 99) - (b.frontmatter.order ?? 99),
  );
  const securityPosts = getBlogPosts().filter((post) =>
    post.frontmatter.tags.some((tag) => SECURITY_TAGS.has(tag.toLowerCase())),
  );
  // Featured security posts first (newest featured leading), then the newest
  // of the rest to fill the row; with none featured, the newest is Latest.
  const writing = toPostSummaries(securityPosts).slice(0, WRITING_LIMIT);

  // Every tool the labs used, then every CVE they exploited, once each.
  const toolStrip = [
    ...new Set([
      ...labs.flatMap((lab) => lab.frontmatter.tools),
      ...labs.flatMap((lab) => lab.frontmatter.cves),
    ]),
  ];

  return (
    <article className="min-h-screen relative bg-background z-1">
      <section
        aria-labelledby="security-title"
        className="relative overflow-hidden rounded-b-[2rem] bg-foreground text-background md:rounded-b-[4rem]"
      >
        <div className="wrapper mx-auto flex flex-col gap-14 pb-10 pt-32 md:gap-20 md:pb-14 md:pt-44">
          <div className="grid gap-10 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-7">
              <SectionHeader
                as="h1"
                subtitle="Security"
                title="I break what I build"
                titleId="security-title"
                titleClassName="text-background text-balance"
                subtitleClassName="text-background/50"
                description="Application security from the builder's side. I build software secure by default, then take it apart in a lab I control to see what actually holds, and write down what I find."
                descriptionClassName="max-w-[52ch] text-base leading-relaxed text-background/70 md:text-lg"
                className="max-w-none"
              />
            </div>

            <div className="md:col-span-5 md:self-end">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-background/50">
                Rules of engagement
              </h2>
              <ol className="mt-4 flex flex-col divide-y divide-background/10 border-y border-background/10">
                {RULES.map((rule, i) => (
                  <li
                    key={rule.title}
                    className="grid grid-cols-[2.25rem_1fr] gap-x-3 py-4"
                  >
                    <span className="pt-0.5 font-mono text-[11px] tabular-nums text-[#fb7185] dark:text-[#be123c]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="text-sm font-semibold uppercase tracking-wide">
                        {rule.title}
                      </span>
                      <span className="text-sm leading-relaxed text-background/60">
                        {rule.body}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-6 flex items-center gap-4">
                <Image
                  src={CREDENTIAL.badge}
                  alt=""
                  width={56}
                  height={54}
                  className="size-14 shrink-0 object-contain"
                />
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold leading-snug">
                    {CREDENTIAL.name}
                  </span>
                  <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-widest text-background/60">
                    <span>{CREDENTIAL.issuer}</span>
                    {CREDENTIAL.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener"
                        className="group inline-flex items-center gap-1 text-background/80 transition-colors hover:text-background"
                      >
                        {link.label}
                        <ArrowUpRightIcon
                          weight="bold"
                          aria-hidden
                          className="size-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </a>
                    ))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <ToolMarquee items={toolStrip} />
        </div>
      </section>

      <div className="wrapper mx-auto">
        <section aria-labelledby="labs-heading" className="mt-20 md:mt-28">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              subtitle={`${labs.length} ${labs.length === 1 ? "lab" : "labs"}`}
              title="Labs"
                titleId="labs-heading"
              description="Each one goes end to end and names the control that would have stopped it."
              descriptionClassName="max-w-[52ch] text-muted-foreground"
            />
            <Link
              href="/security/labs"
              className="group inline-flex shrink-0 items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary md:pb-3"
            >
              Labs and the map
              <ArrowRightIcon
                weight="bold"
                aria-hidden
                className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          {labs.length === 0 ? (
            <p className="mt-10 text-sm text-muted-foreground">
              First writeup is on its way.
            </p>
          ) : (
            <div className="mt-10 md:mt-14">
              <LabIndex
                labs={labs.map((lab) => ({
                  slug: lab.slug,
                  title: lab.frontmatter.title,
                  platform: lab.frontmatter.platform,
                  difficulty: lab.frontmatter.difficulty,
                  target: lab.frontmatter.target,
                  cover: lab.frontmatter.cover ?? null,
                  coverAlt: lab.frontmatter.coverAlt ?? null,
                }))}
              />
            </div>
          )}
        </section>

        <section
          aria-labelledby="case-studies-heading"
          className="mt-20 md:mt-28"
        >
          {/* One real link, stretched over the card with ::after, so the whole
              card is clickable without reading every line as the link name. */}
          <div className="group relative grid gap-8 rounded-2xl border border-border/40 p-6 transition-colors duration-300 hover:border-primary/30 hover:bg-muted/40 md:grid-cols-12 md:gap-10 md:p-10"
          >
            <div className="flex flex-col gap-3 md:col-span-7">
              <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                <GithubLogoIcon weight="fill" aria-hidden className="size-4" />
                Case studies on GitHub
              </span>
              <h2
                id="case-studies-heading"
                className="text-2xl font-semibold leading-tight tracking-tight text-primary md:text-[2rem]"
              >
                The full record, written up as context, action and result
              </h2>
              <p className="max-w-[56ch] text-sm leading-relaxed text-muted-foreground md:text-base">
                Threat models, incident analyses, audits, and the CI/CD
                pipeline and WAF work behind posts here. Each one says what the
                situation was, what I did, and what came of it.
              </p>
              <a
                href={CASE_STUDIES_URL}
                target="_blank"
                rel="noopener"
                className="mt-2 inline-flex w-fit items-center gap-1.5 text-xs uppercase tracking-widest text-primary after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
              >
                Open the portfolio on GitHub
                <ArrowUpRightIcon
                  weight="bold"
                  aria-hidden
                  className="size-3.5 text-[#be123c] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-[#fb7185]"
                />
              </a>
            </div>
            <ol className="flex flex-col divide-y divide-border/40 self-end border-y border-border/40 md:col-span-5">
              {CASE_STUDY_THEMES.map((theme, i) => (
                <li
                  key={theme}
                  className="grid grid-cols-[2.25rem_1fr] gap-x-3 py-3 text-sm text-primary"
                >
                  <span className="pt-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {theme}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {writing.length > 0 && (
          <section
            aria-labelledby="writing-heading"
            className="mt-24 pb-24 md:mt-32 md:pb-32"
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <SectionHeader
                subtitle="From the blog"
                title="Writing"
                titleId="writing-heading"
                description="What the labs taught me, written for the people who build the software rather than the people who attack it."
                descriptionClassName="max-w-[52ch] text-muted-foreground"
              />
              <Link
                href="/blog"
                className="group inline-flex shrink-0 items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary md:pb-3"
              >
                All {securityPosts.length} posts
                <ArrowRightIcon
                  weight="bold"
                  aria-hidden
                  className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
            </div>

            <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 md:mt-14">
              {writing.map((post, i) => (
                <li key={post.slug}>
                  <PostTile post={post} index={i} />
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
