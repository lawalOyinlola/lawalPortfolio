"use client";

import { LinkedinLogoIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { BRAND } from "@/app/constants/brand";

const { whatsapp, linkedin } = BRAND.socials;

function ContactsRef() {
  return (
    <div className="sticky top-0 h-screen bg-background flex-center">
      <div className="wrapper max-w-screen w-full min-h-screen pt-4.5 flex flex-col gap-19">
        <div className="relative mt-2 grow w-full flex justify-end items-end overflow-hidden tv-static">
          <div className="tv-static-overlay" />
          <h2 className="contact-title">
            <span className="inline-block bg-background px-2 py-1">
              LET&apos;S EXECUTE
            </span>
            <br />
            <span className="inline-block bg-background px-2 py-1">
              YOUR NEXT PROJECT
            </span>
          </h2>
        </div>

        <div className="mt-auto w-full flex justify-end pb-4">
          <div className="w-full max-w-130 border-b border-foreground/70 px-1.25 py-2.5 flex items-center gap-5 text-lg">
            <p className="mr-auto">Get In Touch Today!</p>
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
        </div>
      </div>
    </div>
  );
}

export default ContactsRef;
