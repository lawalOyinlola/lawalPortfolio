export type Project = {
  name: string;
  category: string;
  description: string;
  image: string;
  github: string;
  live: string;
  tags: string[];
  featured?: boolean;
};

export const PROJECTS: Project[] = [
  {
    name: "SafulPay",
    category: "Fintech",
    description:
      "SafulPay is a groundbreaking fintech company based in Sierra Leone, dedicated to transforming the financial landscape. By offering innovative digital payment solutions, SafulPay empowers individuals and businesses to engage in seamless transactions. With a focus on accessibility and security, this platform aims to enhance financial inclusion, making it easier for everyone to manage their finances and participate in the economy.",
    image: "/projects/my_projects.jpeg",
    github: "https://github.com/lawalOyinlola/safulpay",
    live: "https://safulpay.com",
    tags: [
      "Project Strategy, Sprints & Coordination",
      "Software Development Projects - Merchant & Agent Onboarding Dashboard",
      "Multi-app Ecosystem (Merchant, Agent, Users)",
      "Corporate Website & Brand Platform",
    ],
    featured: true,
  },
  {
    name: "MarketGist",
    category: "Dashboard",
    description:
      "A comprehensive market analysis platform providing real-time insights into various industries and trends. MarketGist leverages AI-powered analytics to deliver actionable intelligence, helping investors and analysts make informed decisions with confidence.",
    image: "/projects/my_projects.jpeg",
    github:
      "https://github.com/lawalOyinlola/marketGist-stock-market-dashboard-with-AI-insights-alerts-charts",
    live: "https://marketgist.vercel.app",
    tags: [
      "Data Visualization & Analytics Platform",
      "Real-time Market Intelligence System",
      "AI-Powered Insights & Alerts Engine",
      "Interactive Dashboard & Charting Module",
    ],
    featured: true,
  },
  {
    name: "AI Resume Analyzer",
    category: "AI / ML",
    description:
      "An intelligent resume analysis tool that leverages machine learning to evaluate resumes against job descriptions. It provides actionable feedback, keyword optimization suggestions, and scoring to help job seekers improve their applications and increase interview chances.",
    image: "/projects/my_projects.jpeg",
    github: "https://github.com/lawalOyinlola/ai-resume-analyzer",
    live: "https://yero-ai-resume-analyzer.vercel.app/",
    tags: [
      "Natural Language Processing Pipeline",
      "Resume Scoring & Feedback System",
      "Job Description Matching Algorithm",
      "User Experience & Interface Design",
    ],
    featured: true,
  },
  {
    name: "LIA",
    category: "AI Assistant",
    description:
      "LinkedIn Intelligent Assistant — an AI-powered tool designed to supercharge your LinkedIn presence. LIA automates content creation, engagement strategies, and networking outreach, helping professionals build meaningful connections and grow their personal brand effortlessly.",
    image: "/projects/my_projects.jpeg",
    github: "https://github.com/TenacityVentures/Lia",
    live: "https://www.getlia.live",
    tags: [
      "AI Content Generation Pipeline",
      "Engagement Automation & Scheduling",
      "Network Growth Strategy Engine",
      "Analytics & Performance Tracking",
    ],
    featured: true,
  },
  {
    name: "Scissors Web",
    category: "Utility",
    description:
      "A URL shortening service that makes sharing links simple and efficient. Scissors Web provides custom short URLs, click analytics, and QR code generation to help users manage and track their links with ease.",
    image: "/projects/my_projects.jpeg",
    github: "https://github.com/lawalOyinlola/scissorsWeb",
    live: "https://scissorsweb.netlify.app/",
    tags: [
      "URL Shortening & Management",
      "Click Analytics & Tracking",
      "QR Code Generation",
      "Frontend Architecture & Design",
    ],
    featured: false,
  },
  {
    name: "Pig Game",
    category: "Game",
    description:
      "A fun and interactive dice game built as a browser-based experience. Players take turns rolling dice and strategically deciding when to hold their score, racing to be the first to reach the target.",
    image: "/projects/my_projects.jpeg",
    github: "https://github.com/lawalOyinlola/Pig-game",
    live: "https://dice-piggygame.netlify.app/",
    tags: [
      "Game Logic & State Management",
      "Interactive UI Development",
      "Responsive Design & Animation",
      "Browser-based Application",
    ],
    featured: false,
  },
  {
    name: "Resolve",
    category: "Productivity",
    description:
      "A goal-tracking and resolution management application designed to help users set, monitor, and achieve their personal and professional goals through structured planning and progress visualization.",
    image: "/projects/my_projects.jpeg",
    github: "https://github.com/hngprojects/E-Vote-FE",
    live: "https://resolve.vote",
    tags: [
      "Goal Tracking & Planning",
      "Progress Visualization System",
      "User Authentication & Profiles",
      "Data Persistence & Management",
    ],
    featured: false,
  },
  {
    name: "WCI Goderich",
    category: "Web Platform",
    description:
      "A professional web platform for WCI Goderich, delivering a polished online presence with comprehensive information about services, team, and community engagement initiatives.",
    image: "/projects/my_projects.jpeg",
    github: "https://github.com/lawalOyinlola/wci_goderich",
    live: "https://wcigoderich.org",
    tags: [
      "Corporate Website Development",
      "Content Management System",
      "Responsive Design & SEO",
      "Client Stakeholder Collaboration",
    ],
    featured: false,
  },
  {
    name: "Reach Afrika",
    category: "Social Impact",
    description:
      "A platform connecting communities across Africa with resources, opportunities, and support networks. Reach Afrika focuses on bridging gaps in access to education, healthcare, and economic empowerment.",
    image: "/projects/my_projects.jpeg",
    github: "https://github.com/lawalOyinlola/reach-afrika",
    live: "https://reach-afrika.vercel.app/",
    tags: [
      "Community Platform Development",
      "Resource Discovery & Access",
      "Impact Measurement & Reporting",
      "Cross-cultural UX Design",
    ],
    featured: false,
  },
  {
    name: "Task Pilot",
    category: "Productivity",
    description:
      "A task management application that helps teams and individuals organize, prioritize, and track their work efficiently with intuitive drag-and-drop interfaces and real-time collaboration features.",
    image: "/projects/my_projects.jpeg",
    github: "https://github.com/lawalOyinlola/vue_todo",
    live: "https://altschool-taskpilot.netlify.app/",
    tags: [
      "Task Organization & Prioritization",
      "Real-time Collaboration Features",
      "Drag-and-Drop Interface Design",
      "Notification & Reminder System",
    ],
    featured: false,
  },
  {
    name: "Macbook Clone",
    category: "Landing Page",
    description:
      "A pixel-perfect recreation of Apple's MacBook Pro product page, showcasing advanced CSS animations, scroll-driven interactions, and attention to detail in replicating premium web experiences.",
    image: "/projects/my_projects.jpeg",
    github: "https://github.com/lawalOyinlola/mackbook-landing-page",
    live: "https://yero-macbook-pro.vercel.app/",
    tags: [
      "Scroll-driven Animation Design",
      "Pixel-perfect UI Recreation",
      "Performance Optimization",
      "Advanced CSS & Motion Design",
    ],
    featured: false,
  },
  {
    name: "Zentry Clone",
    category: "Landing Page",
    description:
      "An award-worthy recreation of the Zentry website, featuring complex GSAP animations, immersive scroll experiences, and cutting-edge web design techniques that push the boundaries of frontend development.",
    image: "/projects/my_projects.jpeg",
    github: "https://github.com/lawalOyinlola/zentry-clone-awwwards",
    live: "https://zentryclone-awwwards.vercel.app",
    tags: [
      "GSAP Animation Architecture",
      "Immersive Scroll Experience",
      "Creative Frontend Development",
      "Awwwards-level Web Design",
    ],
    featured: false,
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);
