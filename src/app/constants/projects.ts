export type Project = {
  name: string;
  slug: string;
  category: string;
  description: string;
  image: string;
  github: string;
  live: string;
  keypoints: string[];
  deeperDetails?: { image: string; title: string; description: string }[];
  featured?: boolean;
  startDate?: string;
  endDate?: string;
};

// Placeholder for deeper details so we can reuse it
const placeholderDetails = [
  {
    image: "/projects/my_projects.jpeg",
    title: "Project Discovery & Planning",
    description:
      "During the initial phase, we conducted thorough research to understand the target audience and define the core features that would deliver the most value.",
  },
  {
    image: "/projects/my_projects.jpeg",
    title: "Design & Prototyping",
    description:
      "We created wireframes and high-fidelity prototypes to visualize the user journey, ensuring a seamless and intuitive experience across all devices.",
  },
  {
    image: "/projects/my_projects.jpeg",
    title: "Development & Engineering",
    description:
      "The application was built using modern web technologies, focusing on performance, scalability, and maintainability for future iterations.",
  },
  {
    image: "/projects/my_projects.jpeg",
    title: "Testing & Launch",
    description:
      "Rigorous quality assurance testing was performed to ensure a bug-free experience before smoothly deploying the application to production environments.",
  },
];

export const PROJECTS: Project[] = [
  {
    name: "SafulPay",
    slug: "safulpay",
    category: "Fintech",
    description:
      "SafulPay is a groundbreaking fintech company based in Sierra Leone, dedicated to transforming the financial landscape. By offering innovative digital payment solutions, SafulPay empowers individuals and businesses to engage in seamless transactions. With a focus on accessibility and security, this platform aims to enhance financial inclusion, making it easier for everyone to manage their finances and participate in the economy.",
    image: "/projects/safulpay/hero.png",
    github: "https://github.com/TECH-N-GOODWILL-LIMITED/SafulPay-Website-v2",
    live: "https://safulpay.com",
    keypoints: [
      "Built mobile application using Flutterflow for seamless user experience",
      "Developed agent and merchant dashboards using React, Next.js, TypeScript",
      "Designed a comprehensive multi-app ecosystem for merchants and agents",
      "Created a responsive corporate website to establish brand identity",
    ],
    deeperDetails: [
      {
        image: "/projects/safulpay/laptop_mockup.png",
        title: "Strategic Discovery",
        description:
          "Conducted market research to define a roadmap for transforming the financial landscape in Sierra Leone through digital payment innovation.",
      },
      {
        image: "/projects/safulpay/safulpay_design.png",
        title: "User-Centric Prototyping",
        description:
          "Designed intuitive user journeys for diverse user groups, emphasizing accessibility and security for seamless cross-platform financial interactions.",
      },
      {
        image: "/projects/safulpay/safulpay_mockups.png",
        title: "Tech Stack & Engineering",
        description:
          "Engineered the mobile experience using Flutterflow (Flutter) and developed the agent monitoring dashboards with Next.js, integrated with a robust GoLang backend ecosystem.",
      },
      {
        image: "/projects/safulpay/safulpay_agency.png",
        title: "The Agency Platform",
        description:
          "Developed a robust business dashboard for monitoring agent performance, managing seamless onboarding, and orchestrating automated disbursement and recollection workflows.",
      },
    ],
    featured: true,
    startDate: "Mar 2023",
  },
  {
    name: "MarketGist",
    slug: "marketgist",
    category: "Dashboard",
    description:
      "A comprehensive market analysis platform providing real-time insights into various industries and trends. MarketGist leverages AI-powered analytics to deliver actionable intelligence, helping investors and analysts make informed decisions with confidence.",
    image: "/projects/marketgist/marketgist.png",
    github:
      "https://github.com/lawalOyinlola/marketGist-stock-market-dashboard-with-AI-insights-alerts-charts",
    live: "https://marketgist.vercel.app",
    keypoints: [
      "Built comprehensive stock dashboard using Finnhub API and TradingView",
      "Implemented automated background jobs for personalized AI news summaries",
      "Engineered real-time price alerts and inactivity reminder notification system",
      "Developed high-performance frontend with Next.js 15, React 19, TypeScript",
    ],
    deeperDetails: [
      {
        image: "/projects/marketgist/marketgist_multi_screenshot.png",
        title: "Project Discovery & Planning",
        description:
          "We analyzed the need for real-time market data and designed an automated system to aggregate financial news and stock metrics for investors.",
      },
      {
        image: "/projects/marketgist/marketgist_design.png",
        title: "Design & Prototyping",
        description:
          "We crafted a dashboard layout utilizing React 19 and Tailwind CSS, focusing on accessible data visualization and seamless user experience.",
      },
      {
        image: "/projects/marketgist/marketgist_watchlist.png",
        title: "Development & Engineering",
        description:
          "The platform was built with Next.js 15, integrating Finnhub API for live stocks and Inngest for background job processing and automation.",
      },
      {
        image: "/projects/marketgist/marketgist_on_a_curved_screen.png",
        title: "Testing & Launch",
        description:
          "We rigorously tested Gemini AI news summaries, background Cron jobs, and API rate limits to guarantee timely delivery of market insights.",
      },
    ],
    featured: true,
    startDate: "Oct 2025",
  },
  {
    name: "Khariar",
    slug: "khariar",
    category: "AI / ML",
    description:
      "An intelligent career platform leveraging Gemini AI to evaluate resumes against job descriptions. It provides deep ATS optimization, actionable feedback, and personalized scoring to help job seekers enhance their applications and land interviews.",
    image: "/projects/khariar/khariar_home.png",
    github: "https://github.com/lawalOyinlola/khariar",
    live: "https://khariar.vercel.app",
    keypoints: [
      "Engineered an AI-powered 'Career Co-pilot' for comprehensive resume analysis and ATS optimization",
      "Implemented an intelligent PDF parsing pipeline using Gemini AI for deep candidate-to-role matching",
      "Developed robust JSON parsing algorithms to safely handle AI hallucinations and ensure feedback stability",
      "Integrated Puter.js for seamless cloud-based job tracking and secure authentication",
    ],
    deeperDetails: [
      {
        image: "/projects/khariar/khariar_analysis.png",
        title: "Intelligent Text Extraction",
        description:
          "Integrated PDF.js to extract and format complex resume text, ensuring high data accuracy before routing it through the AI feedback pipeline.",
      },
      {
        image: "/projects/khariar/khariar_improve.png",
        title: "AI-Driven Feedback Engine",
        description:
          "Leveraged Gemini AI to generate actionable resume scores, keyword optimizations, and intelligent, section-by-section content improvements based on target job descriptions.",
      },
      {
        image: "/projects/khariar/khariar_review.png",
        title: "Robust Data Pipelines",
        description:
          "Engineered strict JSON parsing mechanisms and regex fallbacks to eliminate AI hallucinations and guarantee stable data extraction for the UI.",
      },
      {
        image: "/projects/khariar/khariar_mismatch.png",
        title: "Secure Cloud Architecture",
        description:
          "Built an intuitive file management dashboard mapped to Puter.js, providing users with fast, secure document storage and persistent authentication.",
      },
    ],
    featured: true,
    startDate: "Nov 2025",
  },
  {
    name: "LIA",
    slug: "lia",
    category: "AI Assistant",
    description:
      "LinkedIn Intelligent Assistant — an AI-powered tool designed to supercharge your LinkedIn presence. LIA automates content creation, engagement strategies, and networking outreach, helping professionals build meaningful connections and grow their personal brand effortlessly.",
    image: "/projects/lia/lia_laptop_mockup.jpeg",
    github: "https://github.com/TenacityVentures/Lia",
    live: "https://www.getlia.live",
    keypoints: [
      "Built AI content generation pipeline for high-engagement LinkedIn posts",
      "Implemented automated networking strategies for effortless professional growth",
      "Developed intelligent outreach engine to facilitate meaningful career connections",
      "Integrated performance tracking analytics for measuring LinkedIn profile impact",
    ],
    deeperDetails: [
      {
        image: "/projects/lia/lia_laptop_mockup.jpeg",
        title: "AI Content Generation",
        description:
          "Developed a sophisticated AI pipeline using various AI models to generate high-engagement LinkedIn posts, allowing users to maintain a professional presence with minimal effort.",
      },
      {
        image: "/projects/lia/lia_extension.png",
        title: "Smart Engagement",
        description:
          "Implemented an intelligent reply system that analyzes thread context to craft thoughtful, relevant comments, fostering meaningful professional discussions and growth.",
      },
      {
        image: "/projects/lia/lia_mockup_light.png",
        title: "Seamless Integration",
        description:
          "Engineered a robust Chrome Extension using React 19 and Vite, featuring a native-feel side panel and content script injections for a friction-less LinkedIn workflow.",
      },
      {
        image: "/projects/lia/lia_landing_page.png",
        title: "Full-Stack Ecosystem",
        description:
          "Built a modern architecture with a Next.js landing page and a dedicated API server, leveraging Tailwind CSS 4 for a premium, responsive user interface.",
      },
    ],
    featured: true,
    startDate: "Jan 2026",
  },
  {
    name: "ScissorsWeb",
    slug: "scissorsweb",
    category: "Utility",
    description:
      "A feature-rich URL shortening service built with React and Supabase. Scissors Web provides custom short URLs with emojis, real-time click analytics, and dynamic QR code generation to help users manage and track their digital presence with ease.",
    image: "/projects/scissorsweb/scissors_home.png",
    github: "https://github.com/lawalOyinlola/scissorsWeb",
    live: "https://scissorsweb.netlify.app/",
    keypoints: [
      "Developed secure URL shortening service with custom link aliases",
      "Implemented real-time click analytics and geographical tracking system",
      "Integrated dynamic QR code generation for enhanced link sharing",
      "Built responsive frontend using React, Tailwind CSS, and Supabase",
    ],
    deeperDetails: [
      {
        image: "/projects/scissorsweb/scissors_main.png",
        title: "Custom URL Shortening",
        description:
          "Developed a feature-rich URL shortening service that allows users to create memorable, custom aliases and use unique emoji-based slugs for their links.",
      },
      {
        image: "/projects/scissorsweb/scissors_analytics.png",
        title: "Real-Time Link Insights",
        description:
          "Built a robust analytics dashboard that tracks every click, providing detailed insights into geographic locations, device types, and referral sources.",
      },
      {
        image: "/projects/scissorsweb/scissors_qrcode.png",
        title: "Dynamic QR Code Generation",
        description:
          "Integrated an automatic QR code generator for every link, enabling seamless sharing across physical and digital platforms.",
      },
      {
        image: "/projects/scissorsweb/scissors_faq.png",
        title: "Secure Link Management",
        description:
          "Leveraged Supabase for secure authentication and reliable database management, ensuring performant link resolution and user data protection.",
      },
    ],
    featured: false,
  },
  {
    name: "Pig Game",
    slug: "pig-game",
    category: "Game",
    description:
      "A fun and interactive dice game built as a browser-based experience. Players take turns rolling dice and strategically deciding when to hold their score, racing to be the first to reach the target.",
    image: "/projects/my_projects.jpeg",
    github: "https://github.com/lawalOyinlola/Pig-game",
    live: "https://dice-piggygame.netlify.app/",
    keypoints: [
      "Engineered game logic and state management for seamless play",
      "Developed interactive UI with real-time score tracking and updates",
      "Implemented responsive design for an optimal mobile gaming experience",
      "Created smooth animations for enhanced player engagement and feedback",
    ],
    deeperDetails: placeholderDetails,
    featured: false,
  },
  {
    name: "Resolve",
    slug: "resolve",
    category: "Web Platform",
    description:
      "A secure and transparent electronic voting platform designed to facilitate digital democracy. Resolve provides a tamper-proof voting experience with real-time results and multi-stage authentication for secure collective decision-making.",
    image: "/projects/my_projects.jpeg",
    github: "https://github.com/hngprojects/E-Vote-FE",
    live: "https://resolve.vote",
    keypoints: [
      "Developed secure electronic voting platform for digital democratic processes",
      "Implemented multi-stage authentication for voter identity verification and security",
      "Integrated real-time results dashboard with tamper-proof data auditing systems",
      "Designed intuitive user interface for streamlined collective decision management",
    ],
    deeperDetails: placeholderDetails,
    featured: false,
  },
  {
    name: "WCI Goderich",
    slug: "wci-goderich",
    category: "Web Platform",
    description:
      "A complete digital solution for church management and community engagement built with Next.js 16 and Tailwind CSS 4. It features interactive resource libraries, event management, and seamless ministerial outreach tools.",
    image: "/projects/my_projects.jpeg",
    github: "https://github.com/lawalOyinlola/wci_goderich",
    live: "https://wcigoderich.org",
    keypoints: [
      "Developed comprehensive digital solution for church management and engagement",
      "Implemented interactive resource library for digital media and sermon archives",
      "Built dynamic event management system for service schedules and programs",
      "Designed responsive ministerial platforms optimizing community outreach across devices",
    ],
    deeperDetails: placeholderDetails,
    featured: false,
  },
  {
    name: "Reach Afrika",
    slug: "reach-afrika",
    category: "Social Impact",
    description:
      "A community-focused platform connecting Africa with vital resources and opportunities. Built with Next.js and Framer Motion, Reach Afrika emphasizes modern UX/UI and performance to bridge socio-economic gaps.",
    image: "/projects/my_projects.jpeg",
    github: "https://github.com/lawalOyinlola/reach-afrika",
    live: "https://reach-afrika.vercel.app/",
    keypoints: [
      "Engineered community platform connecting African populations with vital resources",
      "Implemented modern UX/UI design focusing on socio-economic impact storytelling",
      "Integrated high-performance SEO strategies to maximize platform visibility and reach",
      "Developed cross-cultural interface catering to diverse regional community needs",
    ],
    deeperDetails: placeholderDetails,
    featured: false,
  },
  {
    name: "Task Pilot",
    slug: "task-pilot",
    category: "Productivity",
    description:
      "An intuitive task management application built with Vue.js, featuring a robust drag-and-drop interface. Task Pilot streamlines team collaboration with real-time updates and efficient project tracking workflows.",
    image: "/projects/my_projects.jpeg",
    github: "https://github.com/lawalOyinlola/vue_todo",
    live: "https://altschool-taskpilot.netlify.app/",
    keypoints: [
      "Built intuitive task management application using Vue.js for reactivity",
      "Developed drag-and-drop interface for efficient task organization and prioritization",
      "Implemented real-time collaboration features for team productivity and tracking",
      "Created automated notification system for deadlines and project milestone reminders",
    ],
    deeperDetails: placeholderDetails,
    featured: false,
  },
  {
    name: "Macbook Clone",
    slug: "macbook-clone",
    category: "Landing Page",
    description:
      "A pixel-perfect recreation of Apple's MacBook Pro product page, showcasing advanced CSS animations and scroll-driven interactions. This project demonstrates high-fidelity UI replication and premium web motion design.",
    image: "/projects/my_projects.jpeg",
    github: "https://github.com/lawalOyinlola/mackbook-landing-page",
    live: "https://yero-macbook-pro.vercel.app/",
    keypoints: [
      "Engineered complex scroll-driven animations for an immersive product experience",
      "Achieved pixel-perfect UI recreation focusing on premium aesthetic details",
      "Optimized frontend performance for smooth 60fps motion and transitions",
      "Implemented advanced CSS techniques for replicating high-end hardware textures",
    ],
    deeperDetails: placeholderDetails,
    featured: false,
  },
  {
    name: "Zentry Clone",
    slug: "zentry-clone",
    category: "Landing Page",
    description:
      "An award-worthy recreation of the Zentry website featuring complex GSAP animations and immersive scroll experiences. This project pushes the boundaries of creative frontend development and interactive storytelling.",
    image: "/projects/my_projects.jpeg",
    github: "https://github.com/lawalOyinlola/zentry-clone-awwwards",
    live: "https://zentryclone-awwwards.vercel.app",
    keypoints: [
      "Architected complex GSAP animation sequences for a cinematic web experience",
      "Developed immersive scroll-based interactions with smooth state transitions",
      "Pushed creative frontend boundaries using cutting-edge motion and layout techniques",
      "Replicated Awwwards-level design standards with meticulous attention to detail",
    ],
    deeperDetails: placeholderDetails,
    featured: false,
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);
