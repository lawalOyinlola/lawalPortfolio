"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowClockwiseIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react";
import { PROJECTS_HREF } from "@/app/constants";
import { SectionHeader } from "@/components/ui/SectionHeader";

const ROUTES = [
  { href: PROJECTS_HREF, label: "Projects", kicker: "Shipped work, FinTech to fleet tracking" },
  { href: "/security", label: "Security", kicker: "I break what I build" },
  { href: "/security/labs", label: "Labs", kicker: "Hands-on security labs, end to end" },
  { href: "/blog", label: "Blog", kicker: "Engineering, security and the job" },
  { href: "/about", label: "About", kicker: "Who I am and how I work" },
  { href: "/faq", label: "FAQ", kicker: "Working together, stack and process" },
];

/**
 * The shared shell for the 404 and the error boundary: the same dark panel as
 * the /security hero, a request line that names the path that failed, and the
 * site's main routes as a way back in.
 */
export default function ErrorScreen({
  status,
  statusText,
  title,
  description,
  actions,
  reference,
}: {
  /** Shown in the request line and the eyebrow, e.g. "404". */
  status: string;
  statusText: string;
  title: string;
  description: string;
  actions?: ReactNode;
  /** A reference to quote when reporting the problem (the error digest). */
  reference?: string;
}) {
  const pathname = usePathname() ?? "/";

  return (
    <article className="relative z-10 min-h-[105vh] w-full overflow-hidden rounded-b-[2rem] bg-foreground text-background md:rounded-b-[4rem]">
      <div className="wrapper mx-auto flex min-h-screen flex-col justify-center gap-14 pb-16 pt-32 md:gap-20 md:pt-40">
        <div className="grid gap-12 md:grid-cols-12 md:gap-12">
          <div className="flex flex-col gap-8 md:col-span-7">
            {/* What the browser asked for and what came back, the way a
                server log would record it. Breaks anywhere, since a mistyped
                path can be one long word. */}
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-xs text-background/60 md:text-sm">
              <span className="text-background/40">GET</span>
              <span className="break-all text-background">{pathname}</span>
              <span aria-hidden className="text-background/30">
                →
              </span>
              <span className="text-[#fb7185] dark:text-[#be123c]">
                {status} {statusText}
              </span>
            </p>

            <SectionHeader
              as="h1"
              subtitle={`Error ${status}`}
              title={title}
              titleClassName="text-background text-balance"
              subtitleClassName="text-background/50"
              description={description}
              descriptionClassName="max-w-[52ch] text-base leading-relaxed text-background/70 md:text-lg"
              className="max-w-none"
            />

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="group inline-flex h-11 items-center gap-2 bg-background px-5 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:bg-background/85"
              >
                Back home
                <ArrowRightIcon
                  weight="bold"
                  aria-hidden
                  className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
              {actions}
            </div>

            {reference && (
              <p className="font-mono text-[11px] uppercase tracking-widest text-background/40">
                Reference: <span className="text-background/70">{reference}</span>
              </p>
            )}
          </div>

          <nav aria-labelledby="error-routes" className="md:col-span-5 md:self-end">
            <h2
              id="error-routes"
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-background/50"
            >
              Somewhere that exists
            </h2>
            <ol className="mt-4 flex flex-col divide-y divide-background/10 border-y border-background/10">
              {ROUTES.map((route, i) => (
                <li key={route.href}>
                  <Link
                    href={route.href}
                    className="group grid grid-cols-[2.25rem_1fr_auto] items-center gap-x-3 py-3.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
                  >
                    <span className="font-mono text-[11px] tabular-nums text-[#fb7185] dark:text-[#be123c]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold uppercase tracking-wide transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
                        {route.label}
                      </span>
                      <span className="text-sm text-background/55">
                        {route.kicker}
                      </span>
                    </span>
                    <ArrowUpRightIcon
                      weight="bold"
                      aria-hidden
                      className="size-4 text-background/30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-background"
                    />
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </article>
  );
}

/** "Try again" for the error boundaries: re-fetches and re-renders the page. */
export function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick()}
      className="group inline-flex h-11 cursor-pointer items-center gap-2 border border-background/30 px-5 text-xs font-semibold uppercase tracking-widest text-background transition-colors hover:border-background/70"
    >
      <ArrowClockwiseIcon
        weight="bold"
        aria-hidden
        className="size-3.5 transition-transform duration-500 group-hover:rotate-180"
      />
      Try again
    </button>
  );
}
