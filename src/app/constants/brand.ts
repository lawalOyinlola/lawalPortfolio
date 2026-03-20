const PHONE_E164 = "+2348163992628";
const PHONE_DIGITS = PHONE_E164.replace(/\D/g, "");

export const BRAND = {
  name: "Oyinlola Lawal",
  shortName: "LAWAL",
  title: "Frontend Engineer & UI Architect",
  description:
    "Frontend Engineer specializing in high-performance Web & Mobile Interfaces, animations, accessibility and scalable AI-powered platforms. Bridging the gap between complex infrastructure and pixel-perfect user experiences.",
  url: "https://lawaloyinlola.com",
  // resumeUrl: "https://<actual-resume-url>",
  ogImage: "/og-image.jpg",
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
  keywords: [
    "Oyinlola Lawal",
    "Frontend Engineer",
    "Website Developer",
    "App Developer",
    "Animation Expert (GSAP/Framer Motion)",
    "Next.js Developer",
    "React Performance Optimization",
    "FinTech UI Development",
    "Web Accessibility (WCAG)",
    "TypeScript Expert",
  ],
  tagline: ["Logic", "Architecture", "Workmanship", "Agility", "Longevity"],
  yearFounded: 2023,
};

export const BRAND_LETTERS = BRAND.shortName.split("");
