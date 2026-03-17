"use client";

import Image from "next/image";
import { PARTNERS } from "@/app/constants";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import AutoScroll from "embla-carousel-auto-scroll";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";

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

function PartnerTooltipItem({
  partner,
}: {
  partner: (typeof PARTNERS)[number];
}) {
  return (
    <Tooltip>
      <TooltipTrigger className="cursor-pointer brightness-40 grayscale transition-all duration-300 hover:grayscale-0 hover:brightness-100 px-4 md:px-10">
        <PartnerLogo partner={partner} />
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-semibold mb-1">{partner.name}</p>
        <p className="text-background/60">{partner.role}</p>
      </TooltipContent>
    </Tooltip>
  );
}
function Partners() {
  const { isMobile } = useWindowDimensions();

  return (
    <section className="flex-center relative z-1">
      <div className="wrapper max-w-screen flex-col flex-center gap-13.5 overflow-hidden bg-background px-0">
        <p>Proud to have worked with...</p>

        <div className="group relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-2 sm:w-30 w-8 bg-linear-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-2 sm:w-30 w-8 bg-linear-to-l from-background to-transparent" />

          <Carousel
            opts={{
              loop: true,
              align: "start",
              dragFree: true,
            }}
            plugins={[
              AutoScroll({
                playOnInit: true,
                speed: 1.2,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
                stopOnFocusIn: false,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="ml-0">
              {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((partner, index) => (
                <CarouselItem
                  key={`${partner.shortName}-${index}`}
                  className="pl-0 basis-auto"
                >
                  <PartnerTooltipItem partner={partner} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
}

export default Partners;
