export type Competency = {
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
  /** SVG src or public icon URL — update with actual brand SVG/PNG as needed */
  icon: string;
  /** Optional colour to tint the icon on hover */
  color?: string;
};

export type ToolCategory = {
  category: string;
  tools: Tool[];
};

export const COMPETENCIES: Competency[] = [
  {
    title: "UI Architecture & Design Systems",
    description:
      "Building scalable, reusable component libraries that bridge Figma designs and production code. Every interface is pixel-perfect, accessible, and responsive from day one.",
    tags: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    title: "FinTech Engineering",
    description:
      "End-to-end development of secure digital payment ecosystems — merchant dashboards, agent portals, and consumer apps — for real-world financial infrastructure.",
    tags: ["SafulPay", "Dashboards", "Security", "Multi-app"],
  },
  {
    title: "Animation & Motion Design",
    description:
      "Crafting immersive web experiences with GSAP, ScrollTrigger, and custom animation systems that enhance engagement without compromising performance.",
    tags: ["GSAP", "ScrollTrigger", "Micro-interactions"],
  },
  {
    title: "AI-Powered Platforms",
    description:
      "Integrating AI capabilities into production interfaces, from LLM-driven content pipelines to intelligent resume analyzers and LinkedIn automation tools.",
    tags: ["OpenAI", "LLMs", "Real-time APIs", "ML Interfaces"],
  },
  {
    title: "Accessibility & Performance",
    description:
      "Delivering WCAG-compliant interfaces with ~40% performance improvements through code-splitting, lazy loading, semantic HTML, and image optimization.",
    tags: ["WCAG", "Web Vitals", "a11y", "SEO"],
  },
  {
    title: "Cross-platform Development",
    description:
      "Building seamlessly across web and mobile using React, Vue, and FlutterFlow, always with a focus on consistent user experience across form factors.",
    tags: ["PWA", "Mobile-first", "FlutterFlow", "Vue.js"],
  },
];

// Icon paths — use /tool-icons/<name>.svg once you drop logos into /public/tool-icons/
// or replace with CDN URLs e.g. https://cdn.simpleicons.org/<slug>
const si = (slug: string) => `https://cdn.simpleicons.org/${slug}`;
const iconify = (set: string, name: string) =>
  `https://api.iconify.design/${set}:${name}.svg`;

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    category: "AI Tools",
    tools: [
      { name: "Claude", icon: si("claude"), color: "#d97757" },
      { name: "Gemini", icon: si("googlegemini"), color: "#4285f4" },
      {
        name: "ChatGPT",
        icon: iconify("logos", "openai-icon"),
        color: "#74aa9c",
      },
      { name: "Cursor", icon: si("cursor"), color: "#7c3aed" },
      {
        name: "Antigravity",
        icon: "https://antigravity.google/favicon.ico",
        color: "#0f5dab",
      },
      { name: "n8n", icon: si("n8n"), color: "#10a37f" },
      {
        name: "Open Claw",
        icon: "https://openclaw.ai/favicon.svg",
        color: "#ff4d4d",
      },
      { name: "CodeRabbit", icon: si("coderabbit"), color: "#ff570a" },
    ],
  },
  {
    category: "Languages & Frameworks",
    tools: [
      { name: "TypeScript", icon: si("typescript"), color: "#3178c6" },
      { name: "JavaScript", icon: si("javascript"), color: "#f7df1e" },
      { name: "Python", icon: si("python"), color: "#3776ab" },
      { name: "PHP", icon: si("php"), color: "#777bb4" },
      { name: "Laravel", icon: si("laravel"), color: "#ff2d20" },
      { name: "Next.js", icon: si("nextdotjs"), color: "#ffffff" },
      { name: "React", icon: si("react"), color: "#61dafb" },
      { name: "Vue", icon: si("vuedotjs"), color: "#4fc08d" },
      { name: "Redux Toolkit", icon: si("redux"), color: "#764abc" },
      { name: "React Router", icon: si("reactrouter"), color: "#ca4245" },
    ],
  },
  {
    category: "UI & Design",
    tools: [
      { name: "Figma", icon: iconify("logos", "figma"), color: "#f24e1e" },
      {
        name: "Rotato",
        icon: "https://www.rotato.app/favicon.ico",
        color: "#ffffff",
      },

      { name: "Radix UI", icon: si("radixui"), color: "#ffffff" },

      { name: "Shadcn UI", icon: si("shadcnui"), color: "#ffffff" },
      { name: "Tailwind CSS", icon: si("tailwindcss"), color: "#06b6d4" },
      { name: "GSAP", icon: si("greensock"), color: "#88ce02" },
      { name: "Framer Motion", icon: si("framer"), color: "#0055ff" },
    ],
  },
  {
    category: "Services & Ecosystem",
    tools: [
      { name: "Vercel", icon: si("vercel"), color: "#ffffff" },
      { name: "Netlify", icon: si("netlify"), color: "#00C7B7" },
      { name: "Firebase", icon: si("firebase"), color: "#ffca28" },
      { name: "Supabase", icon: si("supabase"), color: "#3ecf8e" },
      { name: "Cloudinary", icon: si("cloudinary"), color: "#3448c5" },
      {
        name: "Uploadthing",
        icon: "https://uploadthing.com/favicon.ico",
        color: "#782606",
      },
      { name: "Mapbox", icon: si("mapbox"), color: "#f1ffff" },
      { name: "React Leaflet", icon: si("leaflet"), color: "#199900" },
    ],
  },
  {
    category: "Data & Architecture",
    tools: [
      { name: "PostgreSQL", icon: si("postgresql"), color: "#4169e1" },
      { name: "MongoDB", icon: si("mongodb"), color: "#47a248" },
      { name: "Drizzle ORM", icon: si("drizzle"), color: "#c5f74f" },
      {
        name: "Inngest",
        icon: "https://www.inngest.com/favicon-june-2025-dark.svg",
        color: "#cbb26a",
      },
      { name: "PostHog", icon: si("posthog"), color: "#f76707" },
    ],
  },
  {
    category: "APIs & Auth",
    tools: [
      { name: "Better Auth", icon: si("betterauth"), color: "#4F46E5" },
      { name: "WhatsApp API", icon: si("whatsapp"), color: "#25d366" },
      { name: "Resend", icon: si("resend"), color: "#ffc446" },
      {
        name: "Finnhub",
        icon: "https://finnhub.io/static/img/webp/finnhub-logo.webp",
        color: "#1db954",
      },
    ],
  },
  {
    category: "Infrastructure & Dev Ops",
    tools: [
      { name: "Docker", icon: si("docker"), color: "#2496ed" },
      { name: "Git", icon: si("git"), color: "#f05032" },
      {
        name: "GitHub",
        icon: si("github"),
        color: "#ffffff",
      },
      {
        name: "Puter.js",
        icon: "https://puter.com/dist/favicons/android-icon-192x192.png",
        color: "#0041ff",
      },
    ],
  },
  {
    category: "Package Managers",
    tools: [
      { name: "Bun", icon: si("bun"), color: "#fbf0df" },
      { name: "pnpm", icon: si("pnpm"), color: "#f69220" },
      { name: "yarn", icon: si("yarn"), color: "#2c8ebb" },
      { name: "npm", icon: si("npm"), color: "#cb3837" },
    ],
  },
  {
    category: "Low-Code Tools",
    tools: [
      {
        name: "FlutterFlow",
        icon: "https://docs.flutterflow.io/logos/logoMark_outlinePrimary_transparent.svg",
        color: "#4B39EF",
      },
      {
        name: "Builder.io",
        icon: iconify("logos", "builder-io-icon"),
        color: "#f1f345",
      },
    ],
  },
];

export const ADAPTABILITY_ITEMS: AdaptabilityItem[] = [
  {
    metric: "40%",
    label: "Performance Boost",
    detail:
      "Achieved through code-splitting, lazy loading, and systematic image optimization across production FinTech applications.",
  },
  {
    metric: "3+",
    label: "Years of Engineering",
    detail:
      "From animal nutrition academia to shipping production-grade software — a deliberate, disciplined pivot driven by engineering curiosity.",
  },
  {
    metric: "2",
    label: "Countries, 12+ Projects",
    detail:
      "Deployed solutions across Sierra Leone and Nigeria, building inclusive digital infrastructure for underserved markets.",
  },
  {
    metric: "30%",
    label: "Faster Review Cycles",
    detail:
      "Standardized Git workflows and code review protocols across distributed engineering teams.",
  },
  {
    metric: "5+",
    label: "Tech Stacks Mastered",
    detail:
      "React, Next.js, Vue, TypeScript, GSAP — always learning, always shipping.",
  },
  {
    metric: "96%",
    label: "Client Retention",
    detail:
      "Clients trust the work and come back. Reliability, communication, and quality compound over time.",
  },
];
