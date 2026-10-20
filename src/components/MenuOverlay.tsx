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
import { BRAND, PROJECTS_HREF } from "@/app/constants";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { useScrollLock } from "@/hooks/useScrollLock";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { EASE } from "@/lib/motion";
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
  { label: "PROJECTS", href: PROJECTS_HREF },
  { label: "SECURITY", href: "/security" },
  { label: "LABS", href: "/security/labs" },
  { label: "BLOG", href: "/blog" },
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
  // The running open or close, so a quick reopen can cancel the close
  // before its onComplete hides the overlay again.
  const animationRef = useRef<gsap.core.Timeline | gsap.core.Tween | null>(
    null,
  );
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
  const { prefersReducedMotion } = usePrefersReducedMotion();

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

  // Content is readable after about 1.2s and the close takes about 0.85s:
  // the blocks still have room to land, without the old 2s wait before the
  // content appeared. The main box waits a beat longer than the connectors,
  // and the overshoot is kept small so it settles rather than bounces.
  // Reduced motion gets a short fade, with nothing growing or moving.
  useGSAP(
    () => {
      animationRef.current?.kill();
      const overlay = overlayRef.current;
      const blocks = blocksRef.current.slice(0, 3).filter(Boolean);
      const layers = [bgRef.current, ...blocks, contentRef.current];
      const hide = () =>
        gsap.set(overlay, { display: "none", pointerEvents: "none" });

      if (isOpen) {
        gsap.set(overlay, { display: "flex", pointerEvents: "auto" });

        if (prefersReducedMotion) {
          gsap.set(blocks, { scale: 1 });
          gsap.set(contentRef.current, { y: 0 });
          animationRef.current = gsap.fromTo(
            layers,
            { opacity: 0 },
            { opacity: 1, duration: 0.2, ease: EASE.soft },
          );
          return;
        }

        animationRef.current = gsap
          .timeline()
          .to(bgRef.current, { opacity: 1, duration: 0.35, ease: EASE.soft })
          .fromTo(
            blocks,
            { scale: 0, opacity: 0, transformOrigin: "bottom left" },
            {
              scale: 1,
              opacity: 1,
              duration: 0.75,
              // The connectors follow each other closely; the main box, last,
              // gets the extra pause.
              stagger: (i, _target, list) =>
                i === list.length - 1 ? 0.4 : i * 0.15,
              ease: "back.out(0.6)",
            },
            0.05,
          )
          .fromTo(
            contentRef.current,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.35, ease: EASE.soft },
            0.85,
          );
      } else {
        if (prefersReducedMotion) {
          animationRef.current = gsap.to(layers, {
            opacity: 0,
            duration: 0.15,
            ease: "power1.in",
            onComplete: hide,
          });
          return;
        }

        animationRef.current = gsap
          .timeline({ onComplete: hide })
          .to(contentRef.current, {
            opacity: 0,
            y: -10,
            duration: 0.25,
            ease: "power2.in",
          })
          .to(
            blocks,
            {
              scale: 0,
              opacity: 0,
              duration: 0.45,
              stagger: -0.1,
              transformOrigin: "bottom left",
              ease: "power2.inOut",
            },
            0.15,
          )
          .to(
            bgRef.current,
            { opacity: 0, duration: 0.3, ease: "power2.in" },
            0.55,
          );
      }
    },
    { scope: overlayRef, dependencies: [isOpen, prefersReducedMotion] },
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
        // Pointer convenience only: Escape and the X button the trigger turns
        // into are the accessible ways out, so this is not exposed as a button.
        aria-hidden="true"
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
                    // On short desktop screens (a 1280x720 laptop) the seven links at
                    // full size overflow the fixed menu box and the top one is
                    // clipped; tie the size to the viewport height there instead.
                    className="title tracking-tighter hover:text-chart-3 transition-colors text-black text-left block [@media(min-width:600px)_and_(max-height:800px)]:text-[min(5vw,4.2vh)]"
                  >
                    <HoverFlipText text={label} />
                  </a>
                ))}
              </nav>

              {/* Top Right Text */}
              <div className="md:w-1/4 flex-none hidden md:block">
                <p className="text-xs md:text-base italic font-extralight leading-relaxed max-w-sm">
                  {BrandName} builds software people can depend on, then tries
                  every lock before an attacker does.
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
