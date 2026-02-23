"use client";

import Image from "next/image";
import { PARTNERS } from "@/app/constants";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

function PartnerLogo({ partner }: { partner: (typeof PARTNERS)[number] }) {
  return (
    <div className="relative h-12 w-32 flex-center">
      <Image
        src={partner.logo}
        alt={partner.name}
        width={128}
        height={48}
        className="object-contain max-h-12"
      />
    </div>
  );
}

function Partners() {
  return (
    <section className="flex-center">
      <div className="wrapper max-w-screen flex-col flex-center gap-13.5 overflow-hidden">
        <p>Proud to have worked with...</p>

        <TooltipProvider>
          <div className="group relative w-full">
            {/* Fade edges */}
            {/* <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-background to-transparent" /> */}
            {/* <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-background to-transparent" /> */}

            <div className="flex w-max animate-marquee gap-20 group-hover:paused">
              {/* Real items — focusable with tooltips */}
              {PARTNERS.map((partner) => (
                <Tooltip key={partner.shortName}>
                  <TooltipTrigger className="shrink-0 cursor-pointer brightness-40 grayscale transition-all duration-300 hover:grayscale-0 hover:brightness-100">
                    <PartnerLogo partner={partner} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold mb-1">{partner.name}</p>
                    <p className="text-background/60">{partner.role}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {PARTNERS.map((partner) => (
                <Tooltip key={partner.shortName}>
                  <TooltipTrigger className="shrink-0 cursor-pointer brightness-40 grayscale transition-all duration-300 hover:grayscale-0 hover:brightness-100">
                    <PartnerLogo partner={partner} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold mb-1">{partner.name}</p>
                    <p className="text-background/60">{partner.role}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {PARTNERS.map((partner) => (
                <Tooltip key={partner.shortName}>
                  <TooltipTrigger className="shrink-0 cursor-pointer brightness-40 grayscale transition-all duration-300 hover:grayscale-0 hover:brightness-100">
                    <PartnerLogo partner={partner} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold mb-1">{partner.name}</p>
                    <p className="text-background/60">{partner.role}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </TooltipProvider>
      </div>
    </section>
  );
}

export default Partners;
