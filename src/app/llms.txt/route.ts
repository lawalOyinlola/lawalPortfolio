import { BRAND, PROJECTS } from "@/app/constants";

const content = `# ${BRAND.name}

> ${BRAND.description}

- [About](${BRAND.url}/about): Background, focus, and how to connect.
- [Projects](${BRAND.url}/projects): Selected work.
- [FAQ](${BRAND.url}/faq): Common questions.

## Projects
${PROJECTS.map((p) => `- [${p.name}](${BRAND.url}/projects/${p.slug})`).join("\n")}

## Connect
- Résumé site: ${BRAND.resumeUrl}
- GitHub: ${BRAND.socials.github.href}
- LinkedIn: ${BRAND.socials.linkedin.href}
`;

export const dynamic = "force-static";

export async function GET() {
  return new Response(content, {
    headers: { "Content-Type": "text/markdown;charset=utf-8" },
  });
}