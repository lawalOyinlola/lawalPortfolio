"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowClockwiseIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  CopyIcon,
  EnvelopeSimpleIcon,
} from "@phosphor-icons/react";
import { PROJECTS_HREF } from "@/app/constants";
import { BRAND } from "@/app/constants/brand";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { SectionHeader } from "@/components/ui/SectionHeader";

const ROUTES = [
  {
    href: PROJECTS_HREF,
    label: "Projects",
    kicker: "Shipped work, FinTech to fleet tracking",
  },
  { href: "/security", label: "Security", kicker: "I break what I build" },
  {
    href: "/security/labs",
    label: "Labs",
    kicker: "Hands-on security labs, end to end",
  },
  { href: "/blog", label: "Blog", kicker: "Engineering, security and the job" },
  { href: "/about", label: "About", kicker: "Who I am and how I work" },
  { href: "/faq", label: "FAQ", kicker: "Working together, stack and process" },
];

/**
 * The digest of whatever an error boundary caught. Anything can be thrown,
 * including null or a string, so this checks before reading rather than
 * trusting the declared type: a throw of null must not stop the error screen
 * itself from rendering.
 */
export function digestOf(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const { digest } = error as { digest?: unknown };
  return typeof digest === "string" && digest ? digest : undefined;
}

/**
 * The reference a visitor can quote: the server's error digest when there is
 * one (it matches the server log); when the failure happened in the browser
 * there is no digest, so a short code stands in, and the page and time in the
 * email are what find it. Only shown once hydrated, since the code differs
 * between server and client.
 */
function useReference(digest: string | undefined, enabled: boolean) {
  const [fallback] = useState(
    () => `C-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  );
  const hydrated = useIsHydrated();
  return enabled && hydrated ? (digest ?? fallback) : null;
}

/** An email already filled in with the page, the reference and the time. */
function openReportEmail(reference: string) {
  const body = [
    "Hi,",
    "",
    "I ran into an error on your site.",
    "",
    `Page: ${window.location.href}`,
    `Reference: ${reference}`,
    `Time: ${new Date().toISOString()}`,
    "",
    "What I was doing:",
    "",
  ].join("\n");
  window.location.href = `mailto:${BRAND.email}?subject=${encodeURIComponent(`Site error ${reference}`)}&body=${encodeURIComponent(body)}`;
}

/** The reference, a way to copy it, and a one-click email that already carries it. */
function ReportBlock({ reference }: { reference: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the reference is on screen and in the email anyway.
    }
  };

  return (
    <div className="flex max-w-md flex-col gap-4 border-l-2 border-[#be123c] pl-4 dark:border-[#fb7185]">
      <div className="flex flex-col gap-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
          Reference
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <code className="break-all font-mono text-base text-foreground">
            {reference}
          </code>
          <button
            type="button"
            onClick={copy}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-foreground/70 transition-colors hover:text-foreground"
          >
            {copied ? (
              <CheckIcon weight="bold" aria-hidden className="size-3.5" />
            ) : (
              <CopyIcon weight="bold" aria-hidden className="size-3.5" />
            )}
            <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>
      <a
        href={`mailto:${BRAND.email}`}
        onClick={(e) => {
          e.preventDefault();
          openReportEmail(reference);
        }}
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold underline underline-offset-4 transition-colors hover:text-[#be123c] dark:hover:text-[#fb7185]"
      >
        <EnvelopeSimpleIcon weight="bold" aria-hidden className="size-4" />
        Email this to me
      </a>
    </div>
  );
}

/**
 * The shared shell for the 404 and the error boundary: a page-coloured panel
 * (so it reads as a page, not a second footer), a request line that names the
 * path that failed, and the site's main routes as a way back in.
 */
export default function ErrorScreen({
  status,
  statusText,
  title,
  description,
  actions,
  digest,
  report = false,
  plainLinks = false,
}: {
  /** Shown in the request line and the eyebrow, e.g. "404". */
  status: string;
  statusText: string;
  title: string;
  description: string;
  actions?: ReactNode;
  /** The error digest, when the server gave one. */
  digest?: string;
  /** Offer a reference and an email to report the failure (500s, not 404s). */
  report?: boolean;
  /**
   * Render links as plain anchors, which load the next page from scratch. For
   * global-error, where the app's router may be the thing that broke.
   */
  plainLinks?: boolean;
}) {
  const NavLink = plainLinks ? "a" : Link;
  const pathname = usePathname() ?? "/";
  const reference = useReference(digest, report);

  // Arriving from the bottom of another page (the footer, say) would otherwise
  // leave the visitor looking at the footer with no sign anything went wrong.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, []);

  return (
    <article className="relative z-10 min-h-[105vh] w-full overflow-hidden bg-background text-foreground">
      <div className="wrapper mx-auto flex min-h-screen flex-col justify-center gap-14 pb-16 pt-32 md:gap-20 md:pt-40">
        <div className="grid gap-12 md:grid-cols-12 md:gap-12">
          <div className="flex flex-col gap-8 md:col-span-7">
            {/* What the browser asked for and what came back, the way a
                server log would record it. Breaks anywhere, since a mistyped
                path can be one long word. */}
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-xs text-foreground/60 md:text-sm">
              <span className="text-foreground/40">GET</span>
              <span className="break-all text-foreground">{pathname}</span>
              <span aria-hidden className="text-foreground/30">
                →
              </span>
              <span className="text-[#be123c] dark:text-[#fb7185]">
                {status} {statusText}
              </span>
            </p>

            <SectionHeader
              as="h1"
              subtitle={`Error ${status}`}
              title={title}
              titleClassName="text-foreground text-balance"
              subtitleClassName="text-foreground/50"
              description={description}
              descriptionClassName="max-w-[52ch] text-base leading-relaxed text-foreground/70 md:text-lg"
              className="max-w-none"
            />

            <div className="flex flex-wrap items-center gap-3">
              <NavLink
                href="/"
                className="group inline-flex h-11 items-center gap-2 bg-foreground px-5 text-xs font-semibold uppercase tracking-widest text-background transition-colors hover:bg-foreground/85"
              >
                Back home
                <ArrowRightIcon
                  weight="bold"
                  aria-hidden
                  className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </NavLink>
              {actions}
            </div>

            {reference && <ReportBlock reference={reference} />}
          </div>

          <nav
            aria-labelledby="error-routes"
            className="md:col-span-5 md:self-end"
          >
            <h2
              id="error-routes"
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50"
            >
              Somewhere that exists
            </h2>
            <ol className="mt-4 flex flex-col divide-y divide-foreground/10 border-y border-foreground/10">
              {ROUTES.map((route, i) => (
                <li key={route.href}>
                  <NavLink
                    href={route.href}
                    className="group grid grid-cols-[2.25rem_1fr_auto] items-center gap-x-3 py-3.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  >
                    <span className="font-mono text-[11px] tabular-nums text-[#be123c] dark:text-[#fb7185]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold uppercase tracking-wide transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
                        {route.label}
                      </span>
                      <span className="text-sm text-foreground/55">
                        {route.kicker}
                      </span>
                    </span>
                    <ArrowUpRightIcon
                      weight="bold"
                      aria-hidden
                      className="size-4 text-foreground/30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                    />
                  </NavLink>
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
      className="group inline-flex h-11 cursor-pointer items-center gap-2 border border-foreground/30 px-5 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-foreground/70"
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
