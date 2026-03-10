"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ContactButtons from "./ui/ContactButtons";

export interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectModal({ isOpen, onClose }: ProjectModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<HTMLDivElement[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  const [slideSide, setSlideSide] = useState<"left" | "right">("left");

  // Reset slide state when modal closes
  useEffect(() => {
    if (!isOpen) setSlideSide("left");
  }, [isOpen]);

  // Scroll lock + keyboard trapping
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
          return;
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
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  // GSAP animations — scoped to containerRef
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

  const handleBoxMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = (e.clientX - rect.left) / rect.width;
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
            "--sq3-bottom": "calc(var(--sq2-bottom) + var(--sq2-height))",
            "--sq3-right": "calc(var(--sq2-right) + var(--sq2-width))",
            "--sq3-width": "22vw",
            "--sq3-height": "max(180px, 20vh)",
            "--main-bottom": "calc(var(--sq3-bottom) + var(--sq3-height))",
            "--main-right": "calc(var(--sq3-right) + var(--sq3-width))",
          } as React.CSSProperties
        }
      >
        {/* Decorative Rectangle 1 (First Connector) */}
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

        {/* Decorative Rectangle 2 (Second Connector) */}
        <div
          ref={(el) => {
            if (el) blocksRef.current[1] = el;
          }}
          className="absolute bg-background shadow-xl z-20 pointer-events-none"
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
          className="absolute bg-background text-foreground shadow-2xl overflow-visible z-10 flex flex-row pointer-events-auto rounded-none p-6 md:p-12.5"
          onMouseMove={handleBoxMouseMove}
          style={{
            left: "var(--sq-pos)",
            bottom: "var(--main-bottom)",
            top: "var(--sq-pos)",
            right: "var(--sq-pos)",
            clipPath:
              slideSide === "left"
                ? "inset(0 42.8% 0 0 round 0px)"
                : "inset(0 0 0 42.8% round 0px)",
            transition: "clip-path 0.7s cubic-bezier(0.25,1,0.5,1)",
          }}
        >
          <div
            ref={contentRef}
            className="flex w-full h-full p-0 gap-12.5 *:basis-1/2"
          >
            {/* Left Panel */}
            <div className="h-full flex flex-col justify-end relative z-10">
              <div className="w-full flex flex-col justify-center gap-2.5">
                <h3 className="text-[clamp(1.75rem,5vw,2.5rem)] md:text-5xl font-semibold tracking-tight leading-none">
                  Got a big vision?
                  <br />
                  or a big idea?
                </h3>
                <p className="text-xs max-w-[28ch]">
                  We'll get you started — or help you dream bigger.
                </p>

                <ContactButtons
                  text="Contact me!"
                  className="text-xs max-w-88"
                />
              </div>
            </div>

            {/* Right Panel */}
            <div className="h-full flex flex-col justify-start relative z-0">
              <div className="w-full flex flex-col justify-center gap-2.5 text-xs">
                <span>Get a quote</span>
                <h3 className="text-[clamp(1.75rem,5vw,2.5rem)] md:text-5xl font-semibold tracking-tight leading-none">
                  Have a project
                  <br />
                  in mind?
                </h3>
                <p>
                  Let's get you accurate numbers,
                  <br />
                  strategic ideas, and let's co-create your project-today.
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
