import { BRAND, FAQS, PROJECTS } from "@/app/constants";

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

const faqSection = FAQS.map((f) => `### ${f.question}\n${f.answer}`).join("\n\n");

const content = `# ${BRAND.name} — ${BRAND.title}

> ${BRAND.description}

- Website: ${BRAND.url}
- Résumé site: ${BRAND.resumeUrl}
- GitHub: ${BRAND.socials.github.href}
- LinkedIn: ${BRAND.socials.linkedin.href}
- Location: ${BRAND.address.join(" · ")}

## Projects
${projectsSection}

## FAQ
${faqSection}
`;

export const dynamic = "force-static";

export async function GET() {
  return new Response(content, {
    headers: { "Content-Type": "text/markdown;charset=utf-8" },
  });
}