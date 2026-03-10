"use client";

import { LinkedinLogoIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { BRAND } from "@/app/constants/brand";
import { cn } from "@/lib/utils";

interface ContactButtonsProp {
  text?: string;
  className?: string;
}

const { whatsapp, linkedin } = BRAND.socials;

export default function ContactButtons({
  text = "Get in touch today!",
  className,
}: ContactButtonsProp) {
  return (
    <div
      className={cn(
        "w-full max-w-130 border-b border-foreground/70 px-1.25 py-2.5 flex items-center gap-5 text-lg",
        className,
      )}
    >
      <p className="mr-auto capitalize">{text}</p>
      <a
        href={whatsapp.href}
        target="_blank"
        rel="noreferrer"
        aria-label={whatsapp.label}
        className="group inline-flex items-center justify-center"
      >
        <WhatsappLogoIcon
          size={24}
          weight="duotone"
          className="group-hover:text-[#075E54] transition-colors duration-300 ease-in-out"
        />
      </a>
      <a
        href={linkedin.href}
        target="_blank"
        rel="noreferrer"
        aria-label={linkedin.label}
        className="group inline-flex items-center justify-center"
      >
        <LinkedinLogoIcon
          size={24}
          weight="duotone"
          className="group-hover:text-[#0A66C2] transition-colors duration-300 ease-in-out"
        />
      </a>
    </div>
  );
}
