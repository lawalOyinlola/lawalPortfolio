"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  EnvelopeSimpleIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { BRAND } from "@/app/constants";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { useScrollLock } from "@/hooks/useScrollLock";
import { handleNavigation } from "@/lib/navigation";
import { handleDirectionalFocus, handleEmailClick } from "@/lib/utils";
import { HoverFlipText } from "./ui/hover-flip-text";
import { HoverFlipIcon } from "./ui/hover-flip-icon";

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_LINKS: { label: string; href: string; anchor?: string }[] = [
  { label: "HOME", href: "/" },
  { label: "ABOUT", href: "/about" },
  { label: "PROJECTS", href: "/projects" },
  { label: "BLOG", href: "/blog" },
  { label: "TOOLS & TECH", href: "/about", anchor: "tools-tech" },
  { label: "FAQ", href: "/faq" },
];

// Direct contact routes replace the old CONTACT nav item: one tap to the
// channel itself rather than a jump to a section that lists them.
const CONTACT_LINKS: { label: string; href: string; icon: Icon }[] = [
  {
    label: "LinkedIn",
    href: BRAND.socials.linkedin.href,
    icon: LinkedinLogoIcon,
  },
  { label: "GitHub", href: BRAND.socials.github.href, icon: GithubLogoIcon },
  {
    label: "WhatsApp",
    href: BRAND.socials.whatsapp.href,
    icon: WhatsappLogoIcon,
  },
];

const contactLinkClass =
  "group inline-flex items-center gap-2 py-1 text-sm md:text-base text-foreground/80 hover:text-chart-3 transition-colors";

export function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<HTMLDivElement[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const { width } = useWindowDimensions();
  const isMobileView = width > 0 && width < 600;
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = useCallback(
    (href: string, anchor?: string) => {
      handleNavigation(href, anchor, pathname, router, onClose);
    },
    [pathname, router, onClose],
  );

  const { shortName: BrandName } = BRAND;

  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      const prevFocus = document.activeElement as HTMLElement;

      // Force initial focus
      const timer = setTimeout(() => {
        const firstFocusable = contentRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          contentRef.current?.focus();
        }
      }, 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
          return;
        }

        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
        ) {
          handleDirectionalFocus(e, contentRef.current, "both");
        }

        if (e.key === "Tab") {
          const focusable = contentRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          if (focusable && focusable.length) {
            const firstElement = focusable[0] as HTMLElement;
            const lastElement = focusable[focusable.length - 1] as HTMLElement;

            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
              }
            } else {
              if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
              }
            }
          } else {
            e.preventDefault();
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("keydown", handleKeyDown);
        prevFocus?.focus();
      };
    }
  }, [isOpen, onClose]);

  useGSAP(
    () => {
      if (isOpen) {
        // Animate In
        gsap.set(overlayRef.current, {
          display: "flex",
          pointerEvents: "auto",
        });

        const tl = gsap.timeline();
        tl.to(bgRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" })
          .fromTo(
            blocksRef.current.slice(0, 3),
            { scale: 0, opacity: 0, transformOrigin: "bottom left" },
            {
              scale: 1,
              opacity: 1,
              duration: 1,
              stagger: 0.4,
              ease: "back.out(1)",
            },
            "-=0.2",
          )
          .fromTo(
            contentRef.current,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
            "-=0.1",
          );
      } else {
        // Animate Out
        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(overlayRef.current, {
              display: "none",
              pointerEvents: "none",
            });
          },
        });
        tl.to(contentRef.current, {
          opacity: 0,
          y: -10,
          duration: 0.6,
          ease: "power2.in",
        })
          .to(
            blocksRef.current.slice(0, 3),
            {
              scale: 0,
              opacity: 0,
              duration: 0.5,
              stagger: -0.2,
              transformOrigin: "bottom left",
              ease: "power2.inOut",
            },
            "-=0.4",
          )
          .to(
            bgRef.current,
            { opacity: 0, duration: 0.3, ease: "power2.in" },
            "-=0.1",
          );
      }
    },
    { scope: overlayRef, dependencies: [isOpen] },
  );

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-21 hidden items-center justify-center pointer-events-none"
    >
      {/* Dark background */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-foreground/65 opacity-0 backdrop-blur-md"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Enter" && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close menu"
      />

      <div
        className="relative w-full h-full pointer-events-none"
        style={
          {
            "--sq1-size": "2.75rem",
            "--sq-pos": "1.125rem",
            "--sq2-pos": "calc(var(--sq-pos) + var(--sq1-size))",
            "--sq2-size": "max(5vw, 2.75rem)",
            "--sq3-pos": isMobileView
              ? "var(--sq2-pos)"
              : "calc(var(--sq2-pos) + var(--sq2-size))",
            "--sq3-size": isMobileView ? "max(8vw, 4rem)" : "max(10vw, 5.5rem)",
            "--main-pos": "calc(var(--sq3-pos) + var(--sq3-size))",
          } as React.CSSProperties
        }
      >
        {/* Decorative Square 1 (First Connector) */}
        {!isMobileView && (
          <div
            ref={(el) => {
              if (el) blocksRef.current[0] = el;
            }}
            className="absolute aspect-square bg-white z-20 pointer-events-none"
            style={{
              width: "var(--sq2-size)",
              left: "var(--sq2-pos)",
              bottom: "var(--sq2-pos)",
            }}
          />
        )}

        {/* Decorative Square 2 (Second Connector) - Maintained on mobile */}
        <div
          ref={(el) => {
            if (el) blocksRef.current[1] = el;
          }}
          className="absolute aspect-square bg-white z-20 pointer-events-none"
          style={{
            width: "var(--sq3-size)",
            left: "var(--sq3-pos)",
            bottom: "var(--sq3-pos)",
          }}
        />

        {/* Main White Box */}
        <div
          ref={(el) => {
            if (el) blocksRef.current[2] = el;
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation menu"
          className={`absolute bg-background p-6 md:p-12.5 [@media(min-width:600px)_and_(max-height:800px)]:py-8 shadow-2xl z-10 flex flex-col pointer-events-auto ${
            isMobileView ? "overflow-y-auto" : "overflow-hidden"
          }`}
          style={{
            left: "var(--main-pos)",
            bottom: "var(--main-pos)",
            top: "var(--sq-pos)",
            right: "var(--sq-pos)",
          }}
        >
          <div
            ref={contentRef}
            className="flex flex-col h-full justify-between gap-6 md:gap-10"
          >
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 h-full">
              {/* Links */}
              <nav className="flex flex-col justify-start md:justify-center gap-2 md:gap-4 flex-1">
                {NAV_LINKS.map(({ label, href, anchor }) => (
                  <a
                    key={label}
                    href={href + (anchor ? `#${anchor}` : "")}
                    onClick={(e) => {
                      if (
                        e.button === 0 &&
                        !e.metaKey &&
                        !e.ctrlKey &&
                        !e.shiftKey &&
                        !e.altKey
                      ) {
                        e.preventDefault();
                        handleNavClick(href, anchor);
                      }
                    }}
                    // On short desktop screens (a 1280x720 laptop) six links at full
                    // size overflow the fixed menu box and the top one is clipped;
                    // tie the size to the viewport height there instead.
                    className="title tracking-tighter hover:text-chart-3 transition-colors text-black text-left block [@media(min-width:600px)_and_(max-height:800px)]:text-[min(5vw,4.8vh)]"
                  >
                    <HoverFlipText text={label} />
                  </a>
                ))}
              </nav>

              {/* Top Right Text */}
              <div className="md:w-1/4 flex-none hidden md:block">
                <p className="text-xs md:text-base italic font-extralight leading-relaxed max-w-sm">
                  As Your Engineering Reliability Operator, {BrandName} bridges
                  creativity with engineering discipline, turning complex ideas
                  into dependable digital products that work flawlessly every
                  time.
                </p>
              </div>
            </div>

            {/* Contact. Replaces a paragraph that repeated the footer word for
                word, so the menu gets shorter rather than longer. */}
            <div className="mt-auto pt-4">
              <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[3px] text-foreground/50">
                Get in touch
              </h2>
              <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
                {CONTACT_LINKS.map(({ label, href, icon: LinkIcon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={contactLinkClass}
                    >
                      <HoverFlipIcon>
                        <LinkIcon size={18} weight="bold" />
                      </HoverFlipIcon>
                      {label}
                    </a>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={handleEmailClick}
                    aria-label={`Email ${BRAND.email}`}
                    className={contactLinkClass}
                  >
                    <HoverFlipIcon>
                      <EnvelopeSimpleIcon size={18} weight="bold" />
                    </HoverFlipIcon>
                    Email
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
