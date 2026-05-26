export type FAQ = {
  question: string;
  answer: string;
  category?: "engagement" | "process" | "expertise" | "logistics";
};

export const FAQS: FAQ[] = [
  {
    category: "engagement",
    question: "What kind of projects do you typically take on?",
    answer:
      "My focus is on frontend and mobile interfaces where polish carries real weight. That usually means FinTech dashboards, real-time SaaS, AI-powered platforms, animation-heavy marketing sites, and design systems. Recent work spans Trakkam (a multi-tenant GPS fleet SaaS with Mapbox geofencing and live WebSocket tracking), SafulPay (a fintech I helped incubate from an internal product into a standalone company), and Khariar (an AI-powered ATS platform on the Gemini API). Builds that need pixel-perfect UI alongside serious engineering rigor and accessibility are the ones I do my best work on.",
  },
  {
    category: "logistics",
    question: "Are you available for full-time, contract, or freelance work?",
    answer:
      "All three. I'm open to senior frontend roles, embedded contract engagements with product teams, and well-scoped freelance builds. I'm based in Lagos and also work out of Freetown, which gives me comfortable overlap with EMEA, UK, and US-East working hours.",
  },
  {
    category: "process",
    question: "What does a typical engagement look like?",
    answer:
      "It usually starts with a short discovery call so we can align on goals, constraints, and what success actually looks like. After that I send over a proposed scope, milestones, and a working cadence. In practice that means weekly demos with continuous Slack or Linear updates in between. Most builds land somewhere between 4 and 10 weeks; embedded contracts naturally run longer.",
  },
  {
    category: "expertise",
    question: "Which stack do you specialise in?",
    answer:
      "Next.js, React, and TypeScript at the core. Tailwind and shadcn/ui for styling, with whatever CSS approach the project needs. GSAP and Framer Motion for animation. Mapbox GL and Turf.js when geospatial work shows up, with Socket.io for real-time interfaces. React Native and Flutter on mobile. I'm comfortable across REST, GraphQL, and tRPC, and when a project requires it I'll extend into NestJS, Prisma, MariaDB, and self-hosted infrastructure (NGINX, PM2, Docker, GitHub Actions CI/CD).",
  },
  {
    category: "expertise",
    question:
      "Do you handle full-stack or DevOps work, or are you purely frontend?",
    answer:
      "Frontend is my core strength, but I extend into backend, real-time, and self-hosted infrastructure when the build genuinely needs it. The clearest example is Trakkam, a multi-tenant GPS fleet SaaS I shipped end-to-end: Next.js 16, TypeScript, Mapbox geofencing, and live WebSocket vehicle tracking on the frontend, with a NestJS and Prisma API, self-hosted Traccar, NGINX, PM2, and GitHub Actions CI/CD on the back. Running it on a $5/month VPS kept operational costs roughly 8x lower than the equivalent managed setup, without compromising reliability. If your project needs that kind of vertical ownership, I can ship it. If a dedicated backend or DevOps team is already in place, I'll happily slot in on the frontend.",
  },
  {
    category: "expertise",
    question: "How do you approach performance and accessibility?",
    answer:
      "I treat both as baseline requirements, not nice-to-haves. I profile early with Lighthouse, WebPageTest, and the React Profiler, and I set LCP, INP, and CLS budgets before any feature work begins. WCAG 2.2 AA is the standard I work to by default. When I re-platformed the SafulPay corporate site to Next.js, the Lighthouse scores went from 68 to a perfect 100 across Performance, Accessibility, Best Practices, and SEO, all while we shipped additional sections and content in the same pass.",
  },
  {
    category: "expertise",
    question:
      "Can you handle animation-heavy interfaces without tanking performance?",
    answer:
      "Yes, that's actually a sweet spot for me. I lean on GSAP timelines and ScrollTrigger, stick to transform and opacity-only animations so the work stays on the compositor thread, and always wire up prefers-reduced-motion fallbacks. Motion should reinforce hierarchy, not punish someone's device or vestibular system.",
  },
  {
    category: "process",
    question:
      "Are you comfortable leading a team, or do you prefer to be embedded?",
    answer:
      "Both, depending on what the team needs. At Tech N' Goodwill I direct cross-functional squads across 6+ web applications, working with UI/UX, marketing, and backend engineers. Standardizing our Git/GitHub workflows and structured pull requests cut code-review turnaround by about 30% and noticeably accelerated feature delivery. In smaller contract engagements I'm equally happy embedded as a senior IC.",
  },
  {
    category: "process",
    question: "Do you work with existing designers, or can you handle UI/UX too?",
    answer:
      "I happily pair with designers and translate Figma into production-grade UI down to the pixel. When there's no designer attached, I can lead the UI direction myself: wireframes, component system, motion language, and visual polish.",
  },
  {
    category: "process",
    question: "How do you handle revisions and feedback?",
    answer:
      "Every milestone ships behind a preview URL with a short Loom walkthrough. Feedback lives in a single thread (Linear, Notion, or GitHub, whichever you prefer), and I batch revisions per milestone so scope creep doesn't sneak in. Two structured revision rounds per milestone is the cadence most teams settle into.",
  },
  {
    category: "engagement",
    question: "Do you offer maintenance, support, or feature work after launch?",
    answer:
      "Yes. Most clients keep me on a lightweight retainer for bug fixes, performance audits, and incremental features. I also take on focused one-off engagements: accessibility audits, performance audits, or a targeted refactor on a problem surface.",
  },
  {
    category: "engagement",
    question: "What's the fastest way to get started?",
    answer:
      "Drop me a note through the contact section with the rough shape of the project: goals, timeline, team, and any constraints I should know about up front. I'll get back to you within 1 to 2 business days with whether I'm a fit, a proposed scope, and the next steps.",
  },
];
