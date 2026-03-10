"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ContactButtons from "./ui/ContactButtons";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { useScrollLock } from "@/hooks/useScrollLock";

export interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectModal({ isOpen, onClose }: ProjectModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<HTMLDivElement[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const { width } = useWindowDimensions();
  const isMobileView = width > 0 && width < 600;

  const [slideSide, setSlideSide] = useState<"left" | "right">("left");

  useScrollLock(isOpen);

  // Keyboard trapping
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
          const focusable = contentRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          if (focusable && focusable.length) {
            const index = Array.from(focusable).indexOf(
              document.activeElement as HTMLElement,
            );
            let nextIndex = index;

            if (e.key === "ArrowDown" || e.key === "ArrowRight") {
              nextIndex = (index + 1) % focusable.length;
            } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
              nextIndex = (index - 1 + focusable.length) % focusable.length;
            }

            const nextEl = focusable[nextIndex];
            nextEl.focus();

            // Auto-switch slideSide based on which panel the element is in
            if (!isMobileView) {
              const rect = nextEl.getBoundingClientRect();
              const containerRect = contentRef.current?.getBoundingClientRect();
              if (containerRect) {
                const xPercent =
                  (rect.left + rect.width / 2 - containerRect.left) /
                  containerRect.width;
                if (xPercent < 0.49) setSlideSide("left");
                else if (xPercent > 0.51) setSlideSide("right");
              }
            }

            e.preventDefault();
          }
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

  // GSAP animations — scoped to containerRef
  useGSAP(
    () => {
      if (isOpen) {
        setSlideSide("left");
        // Animate In
        gsap.set(overlayRef.current, {
          display: "flex",
          pointerEvents: "auto",
        });

        const tl = gsap.timeline();
        tl.to(bgRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" })
          .fromTo(
            blocksRef.current.slice(0, 3),
            { scale: 0, opacity: 0, transformOrigin: "bottom right" },
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
              transformOrigin: "bottom right",
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

  const updateSlideSide = (clientX: number, rect: DOMRect) => {
    if (isMobileView) return;
    const xPercent = (clientX - rect.left) / rect.width;
    if (xPercent < 0.49) {
      setSlideSide("left");
    } else if (xPercent > 0.51) {
      setSlideSide("right");
    }
  };

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
            "--sq1-height": "2.75rem",
            "--sq1-width": "7rem",
            "--sq-pos": "1.125rem",
            "--sq2-bottom": "calc(var(--sq-pos) + var(--sq1-height))",
            "--sq2-right": "calc(var(--sq-pos) + var(--sq1-width))",
            "--sq2-width": "11vw",
            "--sq2-height": "max(90px, 10vh)",
            "--sq3-bottom": isMobileView
              ? "var(--sq2-bottom)"
              : "calc(var(--sq2-bottom) + var(--sq2-height))",
            "--sq3-right": isMobileView
              ? "calc(var(--sq-pos) + var(--sq1-width))"
              : "calc(var(--sq2-right) + var(--sq2-width))",
            "--sq3-width": isMobileView ? "15vw" : "22vw",
            "--sq3-height": isMobileView
              ? "max(120px, 15vh)"
              : "max(180px, 20vh)",
            "--main-bottom": "calc(var(--sq3-bottom) + var(--sq3-height))",
            "--main-right": isMobileView
              ? "var(--sq-pos)"
              : "calc(var(--sq3-right) + var(--sq3-width))",
          } as React.CSSProperties
        }
      >
        {/* Decorative Rectangle 1 (First Connector) */}
        {!isMobileView && (
          <div
            ref={(el) => {
              if (el) blocksRef.current[0] = el;
            }}
            className="absolute bg-background shadow-xl z-20 pointer-events-none"
            style={{
              width: "var(--sq2-width)",
              height: "var(--sq2-height)",
              right: "var(--sq2-right)",
              bottom: "var(--sq2-bottom)",
            }}
          />
        )}

        {/* Decorative Rectangle 2 (Second Connector) - Maintained on mobile */}
        <div
          ref={(el) => {
            if (el) blocksRef.current[1] = el;
          }}
          className={`absolute bg-background shadow-xl z-20 pointer-events-none ${
            isMobileView ? "opacity-100" : ""
          }`}
          style={{
            width: "var(--sq3-width)",
            height: "var(--sq3-height)",
            right: "var(--sq3-right)",
            bottom: "var(--sq3-bottom)",
          }}
        />

        {/* Main Box — 60% clip-path viewport */}
        <div
          ref={(el) => {
            if (el) blocksRef.current[2] = el as HTMLDivElement;
          }}
          role="dialog"
          aria-modal="true"
          className={`absolute bg-background text-foreground shadow-2xl z-10 flex flex-row pointer-events-auto rounded-none p-6 md:p-12.5 ${
            isMobileView ? "overflow-y-auto" : "overflow-visible"
          }`}
          onPointerMove={(e) =>
            updateSlideSide(e.clientX, e.currentTarget.getBoundingClientRect())
          }
          onPointerDown={(e) =>
            updateSlideSide(e.clientX, e.currentTarget.getBoundingClientRect())
          }
          style={{
            left: "var(--sq-pos)",
            bottom: "var(--main-bottom)",
            top: "var(--sq-pos)",
            right: "var(--sq-pos)",
            clipPath: isMobileView
              ? "none"
              : slideSide === "left"
                ? "inset(0 42.8% 0 0 round 0px)"
                : "inset(0 0 0 42.8% round 0px)",
            transition: "clip-path 0.7s cubic-bezier(0.25,1,0.5,1)",
          }}
        >
          <div
            ref={contentRef}
            className={`flex w-full p-0 gap-12.5 ${
              isMobileView
                ? "flex-col h-auto pt-8 pb-12"
                : "flex-row h-full *:basis-1/2"
            }`}
          >
            {/* Left Panel */}
            <div
              className={`flex flex-col relative z-10 ${isMobileView ? "mb-12" : "h-full justify-end"}`}
            >
              <div className="w-full flex flex-col justify-center gap-4">
                <h3 className="text-[clamp(1.75rem,5vw,2.5rem)] md:text-5xl font-semibold tracking-tight leading-tight">
                  Got a big vision?
                  <br />
                  or a big idea?
                </h3>
                <p className="text-sm max-w-[28ch] opacity-80">
                  We&apos;ll get you started — or help you dream bigger.
                </p>

                <ContactButtons
                  text="Contact me!"
                  className="text-xs max-w-88"
                />
              </div>
            </div>

            {/* Right Panel */}
            <div
              className={`flex flex-col relative z-0 ${isMobileView ? "" : "h-full justify-start"}`}
            >
              <div className="w-full flex flex-col justify-center gap-4">
                <span className="text-xs font-medium uppercase tracking-widest opacity-60">
                  Get a quote
                </span>
                <h3 className="text-[clamp(1.75rem,5vw,2.5rem)] md:text-5xl font-semibold tracking-tight leading-tight">
                  Have a project
                  <br />
                  in mind?
                </h3>
                <p className="text-sm opacity-80">
                  Let&apos;s get you accurate numbers,
                  <br />
                  strategic ideas, and let&apos;s co-create your project today.
                </p>

                <ContactButtons className="text-xs max-w-88" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
