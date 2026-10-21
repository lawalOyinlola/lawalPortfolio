import { YEARS_OF_EXPERIENCE } from "./stats";

export type Competency = {
  group: "build" | "secure";
  title: string;
  description: string;
  tags: string[];
};

export type AdaptabilityItem = {
  metric: string;
  label: string;
  detail: string;
};

export type Tool = {
  name: string;
  /** SVG src or public icon URL. Update with actual brand SVG/PNG as needed. */
  icon: string;
  /** Optional colour to tint the icon on hover */
  color?: string;
};

export type ToolCategory = {
  category: string;
  tools: Tool[];
};

// Two groups, rendered as separate grids on About: what I build, and how I
// secure it. Every card cites work a visitor can find on the site.
export const COMPETENCIES: Competency[] = [
  {
    group: "build",
    title: "UI Architecture & Motion",
    description:
      "Component systems that carry Figma into production code: accessible, responsive, and animated with GSAP and ScrollTrigger on transform and opacity only, so the motion never costs the frame rate.",
    tags: ["React", "Next.js", "Design Systems", "GSAP"],
  },
  {
    group: "build",
    title: "Accessibility & Performance",
    description:
      "WCAG-compliant interfaces with measurable performance wins. Re-platforming SafulPay took Lighthouse from 68 to a perfect 100 across Performance, Accessibility, Best Practices, and SEO.",
    tags: ["WCAG", "Web Vitals", "Lighthouse", "SEO"],
  },
  {
    group: "build",
    title: "FinTech Engineering",
    description:
      "Across SafulPay's payment ecosystem: the corporate site, the v2 frontend architecture with the Golang backend team, and the agency banking dashboard I led, covering agent onboarding, KYC collection and marketer performance.",
    tags: ["SafulPay", "Dashboards", "KYC", "Payments"],
  },
  {
    group: "build",
    title: "Real-time & Geospatial Systems",
    description:
      "Multi-tenant SaaS built on live data and interactive maps. Trakkam delivers fleet tracking with Mapbox geofencing and real-time WebSocket vehicle telemetry at Tech N' Goodwill.",
    tags: ["Mapbox", "WebSockets", "Multi-tenant", "IoT"],
  },
  {
    group: "build",
    title: "Full-Stack & Self-Hosted Infrastructure",
    description:
      "Trakkam ships on a self-hosted NestJS and Prisma API with NGINX, PM2, Docker and GitHub Actions on a $5/month VPS, roughly 8x cheaper than the equivalent managed setup. Self-hosting also means owning the attack surface.",
    tags: ["NestJS", "Prisma", "NGINX", "Self-hosted"],
  },
  {
    group: "build",
    title: "AI-Powered Platforms",
    description:
      "AI capabilities inside production interfaces, from Khariar's Gemini-powered ATS to MarketGist's AI summaries, built so the model never holds more authority than the user it's acting for.",
    tags: ["Gemini", "LLMs", "Inngest", "AI UI"],
  },
  {
    group: "secure",
    title: "Application Security",
    description:
      "Security designed into the apps I ship: CSP and security headers, auth and session handling, abuse controls on AI endpoints, and defences tested against real payloads, like the 26 I ran at a production app behind a WAF.",
    tags: ["AppSec", "OWASP", "CSP", "WAF"],
  },
  {
    group: "secure",
    title: "DevSecOps & Supply Chain",
    description:
      "Security as checks that fail the build: dependency audits, gitleaks secret scanning, GitHub Actions pinned to commit SHAs, Dependabot triage by reachability, and review of what a coding agent is allowed to install.",
    tags: ["CI/CD", "SAST", "Secrets", "Supply chain"],
  },
  {
    group: "secure",
    title: "Identity, Access & Governance",
    description:
      "Who can do what, and who did what: Trakkam's 7-tier role-based access model and tenant isolation, KYC data handling at SafulPay, audit trails, and risk explained to the leaders who own the decision.",
    tags: ["RBAC", "IAM", "Audit trails", "GRC"],
  },
  {
    group: "secure",
    title: "Offensive Testing & Detection",
    description:
      "A home lab on Apple Silicon for both sides: a full penetration test with a written report, and a Wazuh and Suricata SIEM that shows what the same attacks look like from the defender's seat.",
    tags: ["Kali", "Metasploit", "Wazuh", "SIEM"],
  },
];

// Icon paths. Use /tool-icons/<name>.svg once you drop logos into /public/tool-icons/
// or replace with CDN URLs e.g. https://cdn.simpleicons.org/<slug>
const si = (slug: string) => `https://cdn.simpleicons.org/${slug}`;
// set/name, not set:name: the colon form now answers 404.
const iconify = (set: string, name: string) =>
  `https://api.iconify.design/${set}/${name}.svg`;

// Six categories, merged down from ten: each row should read as one job.
export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    category: "Languages & Frameworks",
    tools: [
      { name: "TypeScript", icon: si("typescript"), color: "#3178c6" },
      { name: "JavaScript", icon: si("javascript"), color: "#f7df1e" },
      { name: "Python", icon: si("python"), color: "#3776ab" },
      { name: "Bash", icon: si("gnubash"), color: "#4eaa25" },
      { name: "PHP", icon: si("php"), color: "#777bb4" },
      { name: "Next.js", icon: si("nextdotjs"), color: "#ffffff" },
      { name: "React", icon: si("react"), color: "#61dafb" },
      { name: "Vue", icon: si("vuedotjs"), color: "#4fc08d" },
      { name: "Node.js", icon: si("nodedotjs"), color: "#5fa04e" },
      { name: "NestJS", icon: si("nestjs"), color: "#e0234e" },
      { name: "Laravel", icon: si("laravel"), color: "#ff2d20" },
    ],
  },
  {
    category: "Frontend & UI",
    tools: [
      { name: "Tailwind CSS", icon: si("tailwindcss"), color: "#06b6d4" },
      { name: "Shadcn UI", icon: si("shadcnui"), color: "#a1a1aa" },
      { name: "Radix UI", icon: si("radixui"), color: "#ffffff" },
      { name: "GSAP", icon: si("greensock"), color: "#88ce02" },
      { name: "Framer Motion", icon: si("framer"), color: "#0055ff" },
      { name: "TanStack Query", icon: si("reactquery"), color: "#ff4154" },
      { name: "Redux Toolkit", icon: si("redux"), color: "#764abc" },
      {
        name: "React Hook Form",
        icon: si("reacthookform"),
        color: "#ec5990",
      },
      { name: "Zod", icon: si("zod"), color: "#3068b7" },
      { name: "Figma", icon: iconify("logos", "figma"), color: "#f24e1e" },
      {
        name: "FlutterFlow",
        icon: "https://docs.flutterflow.io/logos/logoMark_outlinePrimary_transparent.svg",
        color: "#4B39EF",
      },
    ],
  },
  {
    category: "Data, APIs & Auth",
    tools: [
      { name: "PostgreSQL", icon: si("postgresql"), color: "#4169e1" },
      { name: "MongoDB", icon: si("mongodb"), color: "#47a248" },
      { name: "MariaDB", icon: si("mariadb"), color: "#c0765a" },
      { name: "Prisma", icon: si("prisma"), color: "#5a67d8" },
      { name: "Drizzle ORM", icon: si("drizzle"), color: "#c5f74f" },
      { name: "Socket.io", icon: si("socketdotio"), color: "#25c2a0" },
      { name: "Better Auth", icon: si("betterauth"), color: "#4F46E5" },
      {
        name: "Inngest",
        icon: "https://www.inngest.com/favicon-june-2025-dark.svg",
        color: "#cbb26a",
      },
      { name: "Mapbox", icon: si("mapbox"), color: "#4264fb" },
      { name: "Resend", icon: si("resend"), color: "#ffc446" },
    ],
  },
  {
    category: "Infrastructure & Delivery",
    tools: [
      { name: "Docker", icon: si("docker"), color: "#2496ed" },
      { name: "NGINX", icon: si("nginx"), color: "#009639" },
      {
        name: "GitHub Actions",
        icon: si("githubactions"),
        color: "#2088ff",
      },
      { name: "Git", icon: si("git"), color: "#f05032" },
      { name: "Vercel", icon: si("vercel"), color: "#ffffff" },
      { name: "Supabase", icon: si("supabase"), color: "#3ecf8e" },
      { name: "Firebase", icon: si("firebase"), color: "#ffca28" },
      { name: "Cloudinary", icon: si("cloudinary"), color: "#3448c5" },
      { name: "PostHog", icon: si("posthog"), color: "#f76707" },
      { name: "pnpm", icon: si("pnpm"), color: "#f69220" },
    ],
  },
  {
    category: "Security",
    tools: [
      { name: "Kali Linux", icon: si("kalilinux"), color: "#557c94" },
      { name: "nmap", icon: "https://nmap.org/favicon.ico", color: "#4f8fd6" },
      { name: "Metasploit", icon: si("metasploit"), color: "#2596cd" },
      { name: "Burp Suite", icon: si("burpsuite"), color: "#ff6633" },
      { name: "Wazuh", icon: "https://wazuh.com/favicon.ico", color: "#3d82f1" },
      {
        name: "Suricata",
        icon: "https://suricata.io/favicon.ico",
        color: "#ef9b2d",
      },
      { name: "OWASP CRS", icon: si("owasp"), color: "#ffffff" },
      {
        name: "gitleaks",
        icon: "https://gitleaks.io/favicon.ico",
        color: "#e8443a",
      },
      { name: "Dependabot", icon: si("dependabot"), color: "#025e8c" },
      { name: "VirusTotal", icon: si("virustotal"), color: "#394eff" },
    ],
  },
  {
    category: "AI & Automation",
    tools: [
      { name: "Claude", icon: si("claude"), color: "#d97757" },
      { name: "Gemini", icon: si("googlegemini"), color: "#4285f4" },
      {
        name: "ChatGPT",
        icon: iconify("logos", "openai-icon"),
        color: "#74aa9c",
      },
      { name: "Cursor", icon: si("cursor"), color: "#7c3aed" },
      { name: "CodeRabbit", icon: si("coderabbit"), color: "#ff570a" },
      { name: "n8n", icon: si("n8n"), color: "#10a37f" },
    ],
  },
];

export const ADAPTABILITY_ITEMS: AdaptabilityItem[] = [
  {
    metric: "68 → 100",
    label: "Lighthouse Lift",
    detail:
      "Re-platformed the SafulPay corporate site to Next.js and took Lighthouse from 68 to a perfect 100 across Performance, Accessibility, Best Practices, and SEO, all while shipping additional sections in the same pass.",
  },
  {
    metric: `${YEARS_OF_EXPERIENCE}+`,
    label: "Years of Engineering",
    detail:
      "From animal nutrition academia to production software, and now application security. Each move made deliberately, on top of the last.",
  },
  {
    metric: "8x",
    label: "Cheaper Infrastructure",
    detail:
      "Trakkam, the multi-tenant GPS fleet SaaS I shipped end-to-end, runs on a self-hosted $5/month VPS, roughly 8x cheaper than the equivalent managed setup, without sacrificing reliability.",
  },
  {
    metric: "30%",
    label: "Faster Review Cycles",
    detail:
      "Standardized Git/GitHub workflows and structured pull requests at Tech N' Goodwill cut code review turnaround by roughly 30%.",
  },
  {
    metric: "26",
    label: "Attack Payloads Measured",
    detail:
      "Ran 26 attack payloads at a production app with its WAF on and off, and published what each layer actually stopped and what neither did.",
  },
  {
    metric: "44",
    label: "Controls, Each Tested",
    detail:
      "A baseline security checklist where every control comes with a check that actually runs, applied before anything goes live.",
  },
];
