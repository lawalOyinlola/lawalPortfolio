"use client";

import { useRef } from "react";
import gsap from "gsap";
import {
  EnvelopeSimpleIcon,
  LinkedinLogoIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react";
import { BRAND } from "@/app/constants/brand";
import { cn, handleEmailClick, handleDirectionalFocus } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface ContactButtonsProp {
  text?: string;
  className?: string;
}

const { whatsapp, linkedin } = BRAND.socials;

export default function ContactButtons({
  text = "Get in touch today!",
  className,
}: ContactButtonsProp) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = usePrefersReducedMotion();

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => {
    const icon = e.currentTarget.querySelector("svg");
    if (prefersReducedMotion || !icon) return;

    gsap.killTweensOf(icon, "rotateY");
    gsap.fromTo(
      icon,
      { rotateY: 0 },
      {
        rotateY: 360,
        duration: 1,
        ease: "power2.out",
      },
    );
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={(e) =>
        handleDirectionalFocus(e, containerRef.current, "horizontal")
      }
      className={cn(
        "w-full max-w-130 border-b border-foreground/70 px-1.25 py-2.5 flex items-end min-[377px]:items-center gap-3 min-[376px]:gap-5 text-lg focus-within:border-primary/50 transition-colors",
        className,
      )}
    >
      <p className="mr-auto capitalize">{text}</p>

      <a
        href={linkedin.href}
        target="_blank"
        rel="noreferrer"
        onMouseEnter={handleMouseEnter}
        aria-label={`Reach us on ${linkedin.label}`}
        className="group inline-flex items-center justify-center"
      >
        <LinkedinLogoIcon
          size={24}
          weight="duotone"
          className="group-hover:text-[#0A66C2] transition-colors duration-300 ease-in-out"
        />
      </a>
      <button
        type="button"
        onClick={handleEmailClick}
        onMouseEnter={handleMouseEnter}
        aria-label="Send us an email"
        className="group inline-flex items-center justify-center cursor-pointer"
      >
        <EnvelopeSimpleIcon
          size={24}
          weight="duotone"
          className="group-hover:text-[#EA4335] transition-colors duration-300 ease-in-out"
        />
      </button>
      <a
        href={whatsapp.href}
        target="_blank"
        rel="noreferrer"
        onMouseEnter={handleMouseEnter}
        aria-label={`Reach us on ${whatsapp.label}`}
        className="group inline-flex items-center justify-center"
      >
        <WhatsappLogoIcon
          size={24}
          weight="duotone"
          className="group-hover:text-[#075E54] transition-colors duration-300 ease-in-out"
        />
      </a>
    </div>
  );
}
