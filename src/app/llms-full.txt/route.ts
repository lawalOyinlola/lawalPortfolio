import { BRAND, FAQS, PROJECTS } from "@/app/constants";
import { getBlogPosts, getLabPosts } from "@/lib/content";

const projectsSection = PROJECTS.map((p) => {
  const links = [p.live && `Live: ${p.live}`, p.github && `GitHub: ${p.github}`]
    .filter(Boolean)
    .join(" · ");
  const keypoints = p.keypoints.map((k) => `  - ${k}`).join("\n");

  return `### ${p.name} (${p.category})
${BRAND.url}/projects/${p.slug}
${links}

${p.description}

Highlights:
${keypoints}`;
}).join("\n\n");

const labsSection = getLabPosts()
  .map(
    (lab) => `### ${lab.frontmatter.title}
${BRAND.url}/security/labs/${lab.slug}

${lab.frontmatter.description}`,
  )
  .join("\n\n");

const blogSection = getBlogPosts()
  .map(
    (post) => `### ${post.frontmatter.title}
${BRAND.url}/blog/${post.slug}

${post.frontmatter.description}`,
  )
  .join("\n\n");

const faqSection = FAQS.map((f) => `### ${f.question}\n${f.answer}`).join("\n\n");

const content = `# ${BRAND.name} — ${BRAND.title}

> ${BRAND.description}

- Website: ${BRAND.url}
- Résumé site: ${BRAND.resumeUrl}
- GitHub: ${BRAND.socials.github.href}
- LinkedIn: ${BRAND.socials.linkedin.href}
- Security case studies: ${BRAND.socials.github.href}/cybersecurity-portfolio
- Location: ${BRAND.address.join(" · ")}

## Projects
${projectsSection}

## Security labs
${labsSection}

## Blog
${blogSection}

## FAQ
${faqSection}
`;

export const dynamic = "force-static";

export async function GET() {
  return new Response(content, {
    headers: { "Content-Type": "text/markdown;charset=utf-8" },
  });
}