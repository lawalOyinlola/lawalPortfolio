import { getLabPosts } from "@/lib/content";
import HomeClient from "./HomeClient";

// The lab with the fullest end-to-end write-up (and a cover that ties back to
// the intro). Falls back to the newest lab with a cover if it's ever removed.
const FEATURED_LAB_SLUG = "building-a-pentest-lab-on-apple-silicon";

// Extras that only exist for the featured lab: its screen recording (cut and
// cropped from the LinkedIn clip) and the written report.
const FEATURED_LAB_EXTRAS = {
  video: {
    webm: "/videos/pentest-defacement.webm",
    mp4: "/videos/pentest-defacement.mp4",
    poster: "/videos/pentest-defacement-poster.jpg",
    label:
      "Screen recording: the target's default Metasploitable page is replaced by a green terminal-style page reading SYSTEM COMPROMISED, I AM LAWAL, with the target, the attack vector and root access listed underneath.",
  },
  reportHref: "/files/apple-silicon-pentest-lab-report.pdf",
};

export default function Home() {
  const labs = getLabPosts();
  const lab =
    labs.find((l) => l.slug === FEATURED_LAB_SLUG) ??
    labs.find((l) => l.frontmatter.cover) ??
    labs[0];

  return (
    <HomeClient
      securityLab={
        lab
          ? {
              slug: lab.slug,
              title: lab.frontmatter.title,
              platform: lab.frontmatter.platform,
              difficulty: lab.frontmatter.difficulty,
              target: lab.frontmatter.target,
              cves: lab.frontmatter.cves,
              cover: lab.frontmatter.cover,
              coverAlt: lab.frontmatter.coverAlt,
              ...(lab.slug === FEATURED_LAB_SLUG ? FEATURED_LAB_EXTRAS : {}),
            }
          : null
      }
    />
  );
}
