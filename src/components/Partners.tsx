"use client";

import Image from "next/image";
import { PARTNERS } from "@/app/constants";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { InfiniteSlider } from "./ui/infinite-slider";

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

function PartnerTooltipItems({ loopIndex }: { loopIndex: number }) {
  return (
    <>
      {PARTNERS.map((partner) => (
        <Tooltip key={`${loopIndex}-${partner.shortName}`}>
          <TooltipTrigger className="cursor-pointer brightness-40 grayscale transition-all duration-300 hover:grayscale-0 hover:brightness-100">
            <PartnerLogo partner={partner} />
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold mb-1">{partner.name}</p>
            <p className="text-background/60">{partner.role}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </>
  );
}

function Partners() {
  return (
    <section className="flex-center">
      <div className="wrapper max-w-screen flex-col flex-center gap-13.5 overflow-hidden bg-background z-1">
        <p>Proud to have worked with...</p>

        <div className="group relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-2 w-30 bg-linear-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-2 w-30 bg-linear-to-l from-background to-transparent" />

          <InfiniteSlider gap={80} speed={30} pauseOnHover>
            {Array.from({ length: 3 }, (_, loopIndex) => (
              <PartnerTooltipItems key={loopIndex} loopIndex={loopIndex} />
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </section>
  );
}

export default Partners;
