"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  PauseIcon,
  PlayIcon,
} from "@phosphor-icons/react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export type ShowcaseLab = {
  slug: string;
  title: string;
  platform: string;
  difficulty: string;
  target: string;
  cves: string[];
  cover?: string;
  coverAlt?: string;
  /** A screen recording of the result, shown instead of the cover */
  video?: { webm: string; mp4: string; poster: string; label: string };
  reportHref?: string;
};

// How I approach it, kept to claims the lab and the posts can back up
const APPROACH_LEAD =
  "Security isn't a final check. It's the second half of the job: I build with it in mind, then test my own work before anyone relies on it.";

const PRINCIPLES = [
  {
    title: "Test it myself",
    body: "Defences get tried in a lab I control before I trust them.",
  },
  {
    title: "Measure, don't assume",
    body: "Count what actually got through, not what a tool promises.",
  },
  {
    title: "Write it down",
    body: "Every test ends in writing: what held, what broke, and the fix.",
  },
];

interface SecurityShowcaseProps {
  lab: ShowcaseLab | null;
}

/**
 * Plays only while on screen, never on its own for reduced motion, and always
 * has a pause control, since it loops for longer than five seconds.
 */
function LabVideo({
  video,
  reducedMotion,
}: {
  video: NonNullable<ShowcaseLab["video"]>;
  reducedMotion: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (paused) {
      el.pause();
      return;
    }
    // The observer runs either way so a recording played on request still
    // stops once it scrolls away.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          el.pause();
          return;
        }
        // Reduced motion never autoplays; the button still plays it on request.
        if (reducedMotion) return;
        // Autoplay can still be refused (data saver, low power mode); the
        // poster stays up and the button offers to play it.
        el.play().catch(() => setPaused(true));
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion, paused]);

  // Switching to reduced motion stops whatever is playing. Kept apart from the
  // effect above so pressing play (which changes `paused`) isn't undone.
  useEffect(() => {
    if (reducedMotion) videoRef.current?.pause();
  }, [reducedMotion]);

  return (
    <>
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        poster={video.poster}
        aria-label={video.label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={video.webm} type="video/webm" />
        <source src={video.mp4} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={() => {
          if (playing) {
            setPaused(true);
          } else {
            setPaused(false);
            videoRef.current?.play().catch(() => setPaused(true));
          }
        }}
        aria-label={playing ? "Pause the recording" : "Play the recording"}
        className="absolute bottom-3 right-3 z-10 flex size-9 cursor-pointer items-center justify-center bg-black/60 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {playing ? (
          <PauseIcon weight="fill" className="size-4" />
        ) : (
          <PlayIcon weight="fill" className="size-4" />
        )}
      </button>
    </>
  );
}

/**
 * The home page's "build, then test" beat: one lab, kept short. Laid out like
 * the Projects panel before it (media at three fifths, details beside it) so
 * the two read as a pair, with the lab's own recording as the media; the
 * writing lives on /security. One entrance,
 * played once; no scroll scrubbing between the pinned sections around it.
 */
export default function SecurityShowcase({ lab }: SecurityShowcaseProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = usePrefersReducedMotion();

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>(".sec-item");
      const mediaEl = mediaRef.current;

      if (prefersReducedMotion) {
        if (items.length) gsap.set(items, { opacity: 1, y: 0 });
        if (mediaEl) gsap.set(mediaEl, { clipPath: "inset(0 0% 0 0)" });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
      });

      // The same side wipe the project images use
      if (mediaEl) {
        tl.fromTo(
          mediaEl,
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "power3.inOut" },
          0,
        );
      }
      if (items.length) {
        tl.fromTo(
          items,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.06,
          },
          0.2,
        );
      }
    },
    {
      scope: sectionRef,
      dependencies: [prefersReducedMotion],
      revertOnUpdate: true,
    },
  );

  if (!lab) return null;

  const labHref = `/security/labs/${lab.slug}`;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="security-showcase-title"
      className="relative z-1 flex-center bg-foreground text-background"
    >
      <div className="wrapper flex min-h-screen flex-col justify-between gap-12 py-16">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10">
          <SectionHeader
            subtitle="Security"
            title={<span id="security-showcase-title">Then I test</span>}
            titleClassName="text-background"
            subtitleClassName="text-background/50"
          />
          <Link
            href="/security"
            className="sec-item opacity-0 group inline-flex shrink-0 items-center gap-1.5 text-xs uppercase tracking-widest text-background/60 transition-colors duration-200 hover:text-background md:pb-3"
          >
            All security work
            <ArrowRightIcon
              weight="bold"
              className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
          <p className="sec-item opacity-0 text-xl font-medium leading-snug tracking-tight text-background md:col-span-7 md:text-3xl md:leading-tight">
            {APPROACH_LEAD}
          </p>
          <ol className="flex flex-col divide-y divide-background/10 border-y border-background/10 md:col-span-5">
            {PRINCIPLES.map((item, i) => (
              <li
                key={item.title}
                className="sec-item opacity-0 grid grid-cols-[2rem_1fr] gap-x-3 py-4"
              >
                <span className="font-mono text-[11px] tabular-nums text-background/40 pt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-sm font-semibold uppercase tracking-wide">
                    {item.title}
                  </span>
                  <span className="text-sm leading-relaxed text-background/60">
                    {item.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:gap-10">
          <div className="flex w-full flex-col gap-3 md:w-3/5">
            <div
              ref={mediaRef}
              className="group relative aspect-1024/524 overflow-hidden bg-black"
            >
              {lab.video ? (
                <LabVideo
                  video={lab.video}
                  reducedMotion={prefersReducedMotion}
                />
              ) : (
                lab.cover && (
                  <Image
                    src={lab.cover}
                    alt={lab.coverAlt ?? ""}
                    fill
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                )
              )}
              {/* The whole frame opens the lab; the play button sits above it */}
              <Link
                href={labHref}
                tabIndex={-1}
                aria-hidden="true"
                className="absolute inset-0"
              />
            </div>
            {lab.video && (
              <p className="sec-item opacity-0 font-mono text-[10px] uppercase tracking-widest text-background/40">
                Recorded in my own isolated lab, against a deliberately
                vulnerable VM
              </p>
            )}
          </div>

          <div className="flex w-full flex-col justify-between gap-6 md:w-2/5">
            <div className="flex flex-col gap-3 md:gap-4">
              <span className="sec-item opacity-0 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-widest text-background/50">
                <span>Featured lab</span>
                <span aria-hidden>·</span>
                <span>{lab.platform}</span>
                <span aria-hidden>·</span>
                <span>{lab.difficulty}</span>
              </span>
              <h3 className="sec-item opacity-0 text-xl font-semibold leading-snug tracking-tight md:text-2xl">
                <Link
                  href={labHref}
                  className="underline-offset-4 hover:underline"
                >
                  {lab.title}
                </Link>
              </h3>
              <p className="sec-item opacity-0 font-mono text-[11px] uppercase leading-relaxed tracking-wider text-background/50">
                {[lab.target, ...lab.cves].join(" · ")}
              </p>
            </div>

            <div className="sec-item opacity-0 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs uppercase tracking-widest">
              <Link
                href={labHref}
                className="group inline-flex items-center gap-1.5 text-background transition-colors duration-200"
              >
                Read the lab
                <ArrowRightIcon
                  weight="bold"
                  className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
              {lab.reportHref && (
                <a
                  href={lab.reportHref}
                  target="_blank"
                  rel="noopener"
                  className="group inline-flex items-center gap-1.5 text-background/60 transition-colors duration-200 hover:text-background"
                >
                  Report (PDF)
                  <ArrowUpRightIcon
                    weight="bold"
                    className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
