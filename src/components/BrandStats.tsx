"use client";

import Image from "next/image";
import { BRAND_STATS } from "@/app/constants";

const INTRO_TEXT = "Where passion meets precision";
const OUTRO_TEXT = "Get in touch with us to learn more...";

function BrandStats() {
  return (
    <section
      className="relative bg-background flex-center z-1"
      aria-label="Stats highlights"
    >
      <div className="wrapper relative px-0">
        <div className="sticky top-0 h-screen pointer-events-none">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-130 h-75 mx-auto overflow-hidden bg-foreground">
            <Image
              src="/projects/my_projects.jpeg"
              alt="Stats showcase visual"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 90vw, 480px"
              priority={false}
            />
          </div>
        </div>

        {/* CORNERS BACKGROUND BLUR EFFECT */}
        <div className="sticky inset-0 top-0 h-screen pointer-events-none z-200 *:bg-background *:blur-lg *:h-2/5 *:w-84 ">
          <div className="absolute -top-8 right-0" />
          <div className="absolute -top-8 left-0" />
          <div className="absolute -bottom-8 left-0" />
          <div className="absolute -bottom-8 right-0" />
        </div>

        {/* CONTENT SECTION */}
        <div className="relative z-10 flex flex-col gap-[18vh] -mt-[120vh] pb-[50vh] px-8">
          <p className="self-center text-lg text-center font-semibold text-muted-foreground leading-[100%] max-w-[12ch]">
            {INTRO_TEXT}
          </p>

          {BRAND_STATS.map((stat) => (
            <div key={stat.name}>
              <div className="grid grid-cols-12 items-center gap-4 sm:gap-6 md:gap-8 *:not-even:max-w-72">
                <h2 className="col-span-12 md:col-span-4 title -tracking-[2px] capitalize text-left">
                  {stat.name}
                </h2>

                <p
                  aria-label={stat.value}
                  className="col-span-12 md:col-span-4 text-center font-semibold leading-none text-muted-foreground text-[clamp(4rem,12vw,9rem)]"
                >
                  {stat.value}
                </p>

                <p className="col-span-12 md:col-span-4 text-left md:text-right text-base sm:text-lg leading-tight md:justify-self-end">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}

          <p className="self-center text-lg text-center font-semibold text-muted-foreground leading-[100%] max-w-[20ch]">
            {OUTRO_TEXT}
          </p>
        </div>
      </div>
    </section>
  );
}

export default BrandStats;
