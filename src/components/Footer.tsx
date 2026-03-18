"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { usePathname, useRouter } from "next/navigation";
import { BRAND, BRAND_LETTERS } from "@/app/constants";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { handleNavigation } from "@/lib/navigation";
import {
  GithubLogoIcon,
  LinkedinLogoIcon,
  TwitterLogoIcon,
  InstagramLogoIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react";
import { Button, buttonVariants } from "./ui/button";
import Magnetic from "./ui/Magnetic";

interface FooterProps {
  className?: string;
}

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

const TAGLINE_WORDS = BRAND.tagline;
const EXPLORE_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Competence",
    href: "/about",
    anchor: "competence",
  },
  {
    label: "Adaptability",
    href: "/about",
    anchor: "adaptability",
  },
  { label: "Clients", href: "/about", anchor: "clients" },
  { label: "Work", href: "/projects" },
  {
    label: "Contact",
    href: "/about",
    anchor: "contact",
  },
];

const SOCIAL_ICON_MAP: Record<string, any> = {
  GitHub: GithubLogoIcon,
  LinkedIn: LinkedinLogoIcon,
  Twitter: TwitterLogoIcon,
  Instagram: InstagramLogoIcon,
  WhatsApp: WhatsappLogoIcon,
};

function Footer({ className }: FooterProps) {
  const footerRef = useRef<HTMLElement>(null);
  const { isSE } = useWindowDimensions();
  const pathname = usePathname();
  const router = useRouter();

  useGSAP(
    () => {
      const footerEl = footerRef.current;
      const sentinel = document.getElementById("footer-reveal-sentinel");
      if (!footerEl || !sentinel) return;

      const letters = gsap.utils.toArray<HTMLElement>(
        ".footer-letter",
        footerEl,
      );
      if (letters.length === 0) return;

      const flipTween = gsap.fromTo(
        letters,
        { scaleX: 1 },
        {
          scaleX: -1,
          ease: "expo.inOut",
          duration: 1.6,
          stagger: { amount: 0.8, from: "start" },
          paused: true,
        },
      );

      // Hide navbar only while in the footer reveal zone.
      const miniNavTrigger = ScrollTrigger.create({
        trigger: sentinel,
        start: "top bottom",
        onEnter: () => {
          document.documentElement.dataset.hideMiniNav = "true";
        },
        onEnterBack: () => {
          document.documentElement.dataset.hideMiniNav = "true";
        },
        onLeaveBack: () => {
          document.documentElement.dataset.hideMiniNav = "false";
        },
        onLeave: () => {
          document.documentElement.dataset.hideMiniNav = "true";
        },
        invalidateOnRefresh: true,
      });

      // Hide logo later than mini-nav, right before footer fully enters.
      const logoTrigger = ScrollTrigger.create({
        trigger: sentinel,
        start: "bottom 30%",
        onEnter: () => {
          document.documentElement.dataset.hideLogo = "true";
        },
        onEnterBack: () => {
          document.documentElement.dataset.hideLogo = "true";
        },
        onLeaveBack: () => {
          document.documentElement.dataset.hideLogo = "false";
        },
        onLeave: () => {
          document.documentElement.dataset.hideLogo = "true";
        },
        invalidateOnRefresh: true,
      });

      // Flip when footer is visually ~30–40% revealed.
      const flipTrigger = ScrollTrigger.create({
        trigger: sentinel,
        start: "bottom 70%",
        end: "bottom 60%",
        onEnter: () => flipTween.play(),
        onEnterBack: () => flipTween.play(),
        onLeaveBack: () => flipTween.reverse(),
        invalidateOnRefresh: true,
      });

      // Sync correct state on hard refresh when already inside footer zone.
      document.documentElement.dataset.hideMiniNav = miniNavTrigger.isActive
        ? "true"
        : "false";
      document.documentElement.dataset.hideLogo = logoTrigger.isActive
        ? "true"
        : "false";
      if (flipTrigger.isActive) {
        flipTween.progress(1);
      } else {
        flipTween.progress(0);
      }

      return () => {
        flipTrigger.kill();
        logoTrigger.kill();
        miniNavTrigger.kill();
        flipTween.kill();
        delete document.documentElement.dataset.hideMiniNav;
        delete document.documentElement.dataset.hideLogo;
      };
    },
    { scope: footerRef },
  );

  return (
    <footer
      ref={footerRef}
      className={`h-full bg-foreground text-background overflow-hidden flex-center ${className ?? ""}`}
    >
      <div
        className={`wrapper min-h-screen pb-1 flex justify-between flex-col ${isSE ? "py-4" : ""}`}
      >
        {/* Top Section */}
        <div
          className={`flex flex-col lg:flex-row justify-between w-full ${isSE ? "gap-12" : "gap-16"}`}
        >
          {/* Left: Logo + Description */}
          <div className="flex flex-col gap-6 max-w-sm">
            <Image
              src="/icons/menuLogo.svg"
              alt={`${BRAND.shortName} logo`}
              width={40}
              height={40}
              className="invert"
            />
            <p className="text-sm leading-relaxed text-background/70">
              Engineering isn&apos;t just about writing code — it&apos;s about
              building systems people can depend on.{" "}
              <span className="font-semibold text-background -scale-x-100 inline-block">
                {BRAND.shortName}
              </span>{" "}
              represents a commitment to precision, performance, and
              reliability. Every line of code is written with the intent to make
              technology <em>feel</em> effortless — stable under pressure,
              scalable by design, and secure by default.
            </p>
          </div>

          {/* Right: Nav Columns */}
          <div className="flex gap-16 sm:gap-24 sm:pr-20">
            <nav aria-label="Site navigation">
              <h3
                className={`text-[10px] font-semibold uppercase tracking-[3px] text-background/50 ${isSE ? "mb-4" : "mb-7.5"}`}
              >
                Explore
              </h3>
              <ul className="flex flex-col gap-2.5">
                {EXPLORE_LINKS.map((link) => (
                  <li key={link.label}>
                    <Button
                      type="button"
                      variant="link"
                      onClick={() =>
                        handleNavigation(
                          link.href,
                          link.anchor,
                          pathname,
                          router,
                        )
                      }
                      className="text-background font-normal text-sm p-0 py-1 h-fit"
                    >
                      {link.label}
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Social links">
              <h3
                className={`text-[10px] font-semibold uppercase tracking-[3px] text-background/50 ${isSE ? "mb-4" : "mb-7.5"}`}
              >
                Socials
              </h3>
              <ul className="flex flex-col gap-2.5">
                {Object.values(BRAND.socials).map((link) => {
                  const Icon = SOCIAL_ICON_MAP[link.label];
                  return (
                    <li key={link.label}>
                      <Magnetic strength={0.1} radius={80}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={buttonVariants({
                            variant: "link",
                            className:
                              "group text-background! text-sm! font-normal! p-0! py-1! h-fit",
                          })}
                        >
                          {Icon && (
                            <Icon
                              size={16}
                              weight="bold"
                              className="text-background/30 group-hover:text-background/70 transition-colors"
                            />
                          )}
                          {link.label}
                        </a>
                      </Magnetic>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom: Large Brand Letters */}
        <div className="flex w-full mt-12 sm:mt-0">
          <div className="relative flex gap-0.5 sm:gap-1 w-full pr-12 md:pr-20">
            {BRAND_LETTERS.map((letter, i) => (
              <div key={i} className="flex-1 flex flex-col">
                <span className="text-[min(2.5vw,14px)] md:text-sm font-semibold tracking-tighter md:tracking-tight px-0.5 sm:px-2 md:px-4 pb-1 md:pb-2 text-center md:text-left overflow-visible">
                  {TAGLINE_WORDS[i] ?? ""}
                </span>
                <div className="relative w-full aspect-square border border-background/20 bg-background flex-center">
                  <span className="footer-letter text-foreground font-semibold text-[clamp(4rem,15vw,12rem)] leading-none select-none inline-block">
                    {letter}
                  </span>
                </div>
              </div>
            ))}
            {/* Fade-out gradient on the right edge */}
            <div className="absolute right-0 top-0 bottom-0 w-24 md:w-52 bg-linear-to-l from-foreground via-foreground/80 to-transparent pointer-events-none z-10" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
