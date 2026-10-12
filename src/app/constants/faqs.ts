export type FAQ = {
  question: string;
  answer: string;
  category?: "engagement" | "process" | "expertise" | "security" | "logistics";
};

export const FAQS: FAQ[] = [
  {
    category: "expertise",
    question: "What do you do, in one line?",
    answer:
      "I build web applications and then test them the way an attacker would. Most of my shipped work is frontend and full-stack: FinTech dashboards, real-time SaaS and AI platforms in Next.js, React and TypeScript. Alongside that I work on application security from the builder's side: hardening the apps I ship, testing their defences against real attack payloads, and reporting each finding to the team that owns it with the fix attached. Client findings stay with the client. The blog and labs are separate: my own environments and my own projects, written up so others can learn from them and reproduce the work.",
  },
  {
    category: "engagement",
    question: "What kind of projects do you typically take on?",
    answer:
      "Products where both the interface and the engineering underneath it have to hold up. That usually means FinTech dashboards, real-time SaaS, AI-powered platforms and design systems. Recent work spans Trakkam (a multi-tenant GPS fleet SaaS with Mapbox geofencing and live WebSocket tracking), SafulPay (a fintech I helped incubate from an internal product into a standalone company), and Khariar (an AI-powered ATS on the Gemini API). Increasingly that includes the security side of the same builds: auth and session handling, rate limits on AI endpoints, security headers, and a review before launch.",
  },
  {
    category: "security",
    question: "What security work can you take on?",
    answer:
      "Application security for software I build or join: secure design and code review, hardening (CSP and security headers, auth and session handling, rate limits and abuse controls on AI endpoints), dependency and secret scanning in CI, and a pre-launch review against a written checklist of controls, each with a check you can actually run. I also test defences against real attack payloads; one post on the blog measures what a WAF in front of a production app actually blocked. Formal penetration tests of systems I didn't build happen only with written permission and an agreed scope. I hold the Google Cybersecurity Professional Certificate.",
  },
  {
    category: "expertise",
    question:
      "Do you handle full-stack or DevOps work, or are you purely frontend?",
    answer:
      "Frontend is my core strength, but I extend into backend, real-time, and self-hosted infrastructure when the build genuinely needs it. The clearest example is Trakkam, a multi-tenant GPS fleet SaaS I shipped end-to-end: Next.js 16, TypeScript, Mapbox geofencing, and live WebSocket vehicle tracking on the frontend, with a NestJS and Prisma API, self-hosted Traccar, NGINX, PM2, and GitHub Actions CI/CD on the back. Running it on a $5/month VPS kept operational costs roughly 8x lower than the equivalent managed setup, without compromising reliability. If your project needs that kind of vertical ownership, I can ship it. If a dedicated backend or DevOps team is already in place, I'll happily slot in on the frontend.",
  },
  {
    category: "logistics",
    question: "Are you available for full-time, contract, or freelance work?",
    answer:
      "All three. I'm open to senior frontend, full-stack and application security roles, embedded contract engagements with product teams, and well-scoped freelance builds. I'm based in Lagos and also work out of Freetown, which gives me comfortable overlap with EMEA, UK and US-East working hours.",
  },
  {
    category: "expertise",
    question: "Which stack do you specialise in?",
    answer:
      "Next.js, React, and TypeScript at the core. Tailwind and shadcn/ui for styling, with whatever CSS approach the project needs. GSAP and Framer Motion for animation. Mapbox GL and Turf.js when geospatial work shows up, with Socket.io for real-time interfaces. React Native and Flutter on mobile. I'm comfortable across REST, GraphQL, and tRPC, and when a project requires it I'll extend into NestJS, Prisma, MariaDB, and self-hosted infrastructure (NGINX, PM2, Docker, GitHub Actions CI/CD). On the security side: ModSecurity with the OWASP Core Rule Set, gitleaks and dependency auditing in CI, and for lab work Kali, nmap, Metasploit and Wazuh. Node and Bash scripts handle the automation, such as the dev.to sync and diagram theming behind this site's blog.",
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
    category: "security",
    question: "Do you do penetration testing or ethical hacking?",
    answer:
      "Yes, in a lab I built and with permission, never otherwise. The labs on this site walk a full engagement end to end on an Apple Silicon Mac: reconnaissance, vulnerability scanning, two independent paths to root on a deliberately vulnerable target, post-exploitation, and a written report that ties each finding back to its root cause and fix. Tools include Kali, nmap, OpenVAS, Metasploit, Hydra and John the Ripper. The method matters more than the tools: permission first, a defined scope, and a report someone can act on.",
  },
  {
    category: "security",
    question: "How do you build security into CI/CD?",
    answer:
      "As checks that fail the build, not reminders. This site is the working example: every push runs a dependency audit and a gitleaks secret scan, third-party GitHub Actions are pinned to commit SHAs rather than tags, Dependabot raises updates, and advisories that don't apply are documented with the reason instead of silently ignored. When an alert lands I check whether the vulnerable code is actually reachable before deciding between a fix, an override or a dismissal.",
  },
  {
    category: "security",
    question: "Do you have any blue-team or SOC experience?",
    answer:
      "Foundational, and lab-based rather than from a SOC role. I run a Wazuh SIEM with Suricata network detection and file-integrity monitoring, then attack my own targets and check what the detection actually catches. It's the defensive mirror of the pentest lab, and it's where I learned that an attack you can't see in the logs is the one that matters.",
  },
  {
    category: "security",
    question: "Can you help with governance, risk and compliance?",
    answer:
      "Yes, from the engineering side, which is where most policies quietly fail. I turn a policy into controls the system actually enforces and a check that proves each one, keep audit trails that can answer who did what, when and with whose permission, and report on a review control by control with evidence rather than a single \"compliant\" stamp. I also translate findings for non-technical leaders in terms of impact, likelihood and cost, so the decision about a risk sits with the people who own it. I'm not an auditor or a lawyer, and I'll say plainly when something needs one.",
  },
  {
    category: "process",
    question: "What does a typical engagement look like?",
    answer:
      "It usually starts with a short discovery call so we can align on goals, constraints, and what success actually looks like. After that I send over a proposed scope, milestones, and a working cadence. In practice that means weekly demos with continuous Slack or Linear updates in between. Most builds land somewhere between 4 and 10 weeks; embedded contracts naturally run longer.",
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
      "Yes. Most clients keep me on a lightweight retainer for bug fixes, performance audits, and incremental features. I also take on focused one-off engagements: accessibility, performance or security reviews, or a targeted refactor on a problem surface.",
  },
  {
    category: "engagement",
    question: "What's the fastest way to get started?",
    answer:
      "Drop me a note through the contact section with the rough shape of the project: goals, timeline, team, and any constraints I should know about up front. I'll get back to you within 1 to 2 business days with whether I'm a fit, a proposed scope, and the next steps.",
  },
];
