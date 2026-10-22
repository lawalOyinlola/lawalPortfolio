import { BRAND, PROJECTS } from "@/app/constants";
import { getBlogPosts, getLabPosts } from "@/lib/content";

const content = `# ${BRAND.name}

> ${BRAND.description}

- [About](${BRAND.url}/about): Background, focus, and how to connect.
- [Projects](${BRAND.url}/projects): Selected work.
- [Security](${BRAND.url}/security): Application security work, labs and writing.
- [Security labs](${BRAND.url}/security/labs): Reproducible lab write-ups.
- [Blog](${BRAND.url}/blog): Writing on engineering, application security and leadership.
- [FAQ](${BRAND.url}/faq): Common questions.

## Projects
${PROJECTS.map((p) => `- [${p.name}](${BRAND.url}/projects/${p.slug})`).join("\n")}

## Security labs
${getLabPosts()
  .map((lab) => `- [${lab.frontmatter.title}](${BRAND.url}/security/labs/${lab.slug})`)
  .join("\n")}

## Blog
${getBlogPosts()
  .map((post) => `- [${post.frontmatter.title}](${BRAND.url}/blog/${post.slug})`)
  .join("\n")}

## Connect
- Résumé site: ${BRAND.resumeUrl}
- Security case studies: ${BRAND.socials.github.href}/cybersecurity-portfolio
- GitHub: ${BRAND.socials.github.href}
- LinkedIn: ${BRAND.socials.linkedin.href}
`;

export const dynamic = "force-static";

export async function GET() {
  return new Response(content, {
    headers: { "Content-Type": "text/markdown;charset=utf-8" },
  });
}
