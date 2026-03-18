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
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

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
  isDuplicate = false,
}: {
  partner: (typeof PARTNERS)[number];
  isDuplicate?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        className="cursor-pointer brightness-40 grayscale transition-all duration-300 hover:grayscale-0 hover:brightness-100 px-4 md:px-10"
        tabIndex={isDuplicate ? -1 : 0}
      >
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
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <Carousel
      opts={{
        loop: true,
        align: "start",
        dragFree: true,
      }}
      plugins={[
        AutoScroll({
          playOnInit: !prefersReducedMotion,
          speed: 1.2,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
          stopOnFocusIn: true,
        }),
      ]}
      className="w-full"
    >
      <CarouselContent className="ml-0">
        {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((partner, index) => {
          const isDuplicate = index >= PARTNERS.length;
          return (
            <CarouselItem
              key={`${partner.shortName}-${index}`}
              className="pl-0 basis-auto"
              aria-hidden={isDuplicate ? "true" : "false"}
            >
              <PartnerTooltipItem
                partner={partner}
                isDuplicate={isDuplicate}
              />
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}

export default Partners;
