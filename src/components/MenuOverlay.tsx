"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BRAND } from "@/app/constants";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { useScrollLock } from "@/hooks/useScrollLock";
import { handleNavigation } from "@/lib/navigation";
import { handleDirectionalFocus } from "@/lib/utils";
import { HoverFlipText } from "./ui/hover-flip-text";

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_LINKS: { label: string; href: string; anchor?: string }[] = [
  { label: "HOME", href: "/" },
  { label: "ABOUT", href: "/about" },
  { label: "PROJECTS", href: "/projects" },
  { label: "TOOLS & TECH", href: "/about", anchor: "tools-tech" },
  { label: "CONTACT", href: "/about", anchor: "contact" },
];

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
          className={`absolute bg-background p-6 md:p-12.5 shadow-2xl z-10 flex flex-col pointer-events-auto ${
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
                    className="title tracking-tighter hover:text-chart-3 transition-colors text-black text-left block"
                  >
                    <HoverFlipText text={label} />
                  </a>
                ))}
              </nav>

              {/* Top Right Text */}
              <div className="md:w-1/4 flex-none hidden md:block">
                <p className="text-xs md:text-base italic font-extralight leading-relaxed max-w-sm">
                  As Your Engineering Reliability Operator, {BrandName} bridges
                  creativity with engineering discipline — transforming complex
                  ideas into dependable digital products that work flawlessly
                  every time.
                </p>
              </div>
            </div>

            {/* Bottom Text */}
            <div className="mt-auto max-w-4xl pt-4">
              <p className="text-xs md:text-base opacity-90">
                Engineering isn&apos;t just about writing code — it&apos;s about
                building systems people can depend on. {BrandName} represents a
                commitment to precision, performance, and reliability. Every
                line of code is written with the intent to make technology feel
                effortless — stable under pressure, scalable by design, and
                secure by default.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
