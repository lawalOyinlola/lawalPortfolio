const PHONE_E164 = "+2348163992628";
const PHONE_DIGITS = PHONE_E164.replace(/\D/g, "");

export const BRAND = {
  name: "Oyinlola Lawal",
  shortName: "LAWAL",
  title: "Software Engineer & Application Security",
  description:
    "Software engineer building secure, reliable web apps: frontend craft, full-stack delivery, application security and DevSecOps.",
  url: "https://lawaloyinlola.com",
  resumeUrl: "https://resume.lawaloyinlola.com",
  ogImage: "/og-image.png",
  icons: {
    icon: "/icons/favicon-32.png",
    iconDark: "/icons/dark/favicon-32.png",
    apple: "/icons/apple-touch-icon.png",
    appleDark: "/icons/dark/apple-touch-icon.png",
  },
  email: "oyinlolalawal1705@gmail.com",
  phone: PHONE_E164,
  address: ["Lagos, Nigeria", "Freetown, Sierra Leone"],
  socials: {
    github: {
      label: "GitHub",
      href: "https://github.com/lawalOyinlola",
      username: "lawalOyinlola",
    },
    linkedin: {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/lawaloyinlola",
    },
    twitter: {
      label: "Twitter",
      href: "https://twitter.com/honeyzrich",
      username: "@honeyzrich",
    },
    instagram: {
      label: "Instagram",
      href: "https://instagram.com/honeyz_rich",
      username: "@honeyz_rich",
    },
    whatsapp: {
      label: "WhatsApp",
      href: `https://wa.me/${PHONE_DIGITS}`,
      username: PHONE_E164,
    },
  },
  // Also feeds the Person JSON-LD `knowsAbout`: only list what the site's
  // projects, posts or labs back up.
  keywords: [
    "Oyinlola Lawal",
    "Software Engineer",
    "Application Security",
    "Frontend Engineer",
    "Full-Stack Developer",
    "Next.js Developer",
    "TypeScript",
    "React Performance Optimization",
    "Web Accessibility (WCAG)",
    "Secure Software Development",
    "DevSecOps",
    "Penetration Testing",
    "Web Application Security",
    "Governance, Risk & Compliance (GRC)",
    "FinTech UI Development",
  ],
  tagline: ["Logic", "Architecture", "Workmanship", "Agility", "Longevity"],
  yearFounded: 2023,
};
