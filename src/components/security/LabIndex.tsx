"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react";

export type LabIndexItem = {
  slug: string;
  title: string;
  platform: string;
  difficulty: string;
  target: string;
  cover: string | null;
  coverAlt: string | null;
};

/**
 * The labs on /security as a numbered index. On wide screens the row under the
 * pointer (or keyboard focus) swaps the preview beside the list; on narrow
 * ones each row carries its own cover instead. Numbers follow the build order
 * the labs page and its map use, Foundation first.
 */
export default function LabIndex({ labs }: { labs: LabIndexItem[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-12">
      <ol className="flex flex-col border-t border-border/40 md:col-span-7">
        {labs.map((lab, i) => {
          const isActive = i === active;
          return (
            <li key={lab.slug} className="border-b border-border/40">
              <Link
                href={`/security/labs/${lab.slug}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="group grid grid-cols-[2.75rem_1fr_auto] items-start gap-x-3 py-6 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring md:grid-cols-[4rem_1fr_auto] md:py-8"
              >
                <span
                  className={`pt-1 font-mono text-xs tabular-nums transition-colors duration-300 md:text-sm ${
                    isActive
                      ? "text-[#be123c] dark:text-[#fb7185]"
                      : "text-muted-foreground"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="flex flex-col gap-2">
                  {lab.cover && (
                    <span className="relative mb-3 block aspect-video overflow-hidden rounded-lg bg-muted md:hidden">
                      <Image
                        src={lab.cover}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 90vw, 10vw"
                        className="object-cover"
                      />
                    </span>
                  )}
                  <span
                    className={`text-xl font-semibold leading-snug tracking-tight text-primary transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-visible:underline md:text-[1.75rem] md:leading-tight ${
                      isActive ? "md:translate-x-2" : ""
                    }`}
                  >
                    {lab.title}
                  </span>
                  <span
                    className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-widest text-muted-foreground transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isActive ? "md:translate-x-2" : ""
                    }`}
                  >
                    <span>{lab.platform}</span>
                    <span aria-hidden>·</span>
                    <span>{lab.difficulty}</span>
                    <span aria-hidden>·</span>
                    <span>{lab.target}</span>
                  </span>
                </span>

                <ArrowUpRightIcon
                  weight="bold"
                  aria-hidden
                  className={`mt-1.5 size-5 transition-all duration-300 ${
                    isActive
                      ? "text-[#be123c] dark:text-[#fb7185] md:-translate-y-0.5 md:translate-x-0.5"
                      : "text-muted-foreground/50"
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ol>

      {/* Decorative: each row already names its lab, so the preview is
          hidden from assistive tech rather than read out a second time. */}
      <div aria-hidden className="hidden md:col-span-5 md:block">
        <div className="sticky top-28 aspect-4/3 overflow-hidden rounded-2xl bg-foreground ring-1 ring-border/15">
          {labs.map((lab, i) => (
            <div
              key={lab.slug}
              className={`absolute inset-0 transition-[opacity,scale] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                i === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
              }`}
            >
              {lab.cover ? (
                <Image
                  src={lab.cover}
                  alt=""
                  fill
                  sizes="40vw"
                  className="object-cover"
                />
              ) : (
                // No cover yet: the target itself, set large, so the frame
                // still says something about the lab instead of going blank.
                <div className="flex h-full flex-col justify-between p-8 pb-16 text-background">
                  <span className="font-mono text-xs uppercase tracking-widest text-background/50">
                    Target
                  </span>
                  <span className="text-4xl font-semibold uppercase leading-none tracking-tighter lg:text-5xl">
                    {lab.target}
                  </span>
                </div>
              )}
              <span className="absolute bottom-4 left-4 rounded-full bg-black/65 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur-sm">
                {String(i + 1).padStart(2, "0")} / {lab.platform}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
