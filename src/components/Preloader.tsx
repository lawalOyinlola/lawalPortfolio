"use client";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { TIPS } from "../app/constants/tips";
import { BRAND } from "../app/constants/brand";

interface PreloaderProps {
  setComplete: (value: boolean) => void;
}

const progressSteps = [12, 25, 37, 50, 62, 75, 87, 100, ""];
const columnCount = 16;

const brandName = BRAND.shortName;

export default function Preloader({ setComplete }: PreloaderProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sloganRef = useRef<HTMLSpanElement>(null);
  const logoRef = useRef<SVGSVGElement>(null);

  // Progress Step Logic (Slower for 1200ms per step to show quotes)
  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= progressSteps.length - 1) {
          clearInterval(interval);
          return progressSteps.length - 1;
        }
        return prev + 1;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (stepIndex % 3 === 0 && stepIndex !== 0) {
      const chars = "!<>-_\\/+*^?#____";
      const target = sloganRef.current;
      if (!target) return;

      const newText = TIPS[Math.floor(Math.random() * TIPS.length)];
      const oldText = target.innerText;
      const maxLen = Math.max(oldText.length, newText.length);

      const tl = gsap.timeline();

      tl.to([target, logoRef.current], {
        skewX: 15,
        x: 4,
        opacity: 0.8,
        duration: 0.08,
        repeat: 3,
        yoyo: true,
        ease: "power3.inOut",
      })
        .set([target, logoRef.current], { x: 0, skewX: 0, opacity: 1 })
        .to(
          {},
          {
            duration: 1.4,
            onUpdate: function () {
              const progress = this.progress();
              let output = "";

              for (let i = 0; i < maxLen; i++) {
                if (progress > i / maxLen) {
                  output += newText[i] || "";
                } else {
                  if (i < newText.length || i < oldText.length) {
                    output += chars[Math.floor(Math.random() * chars.length)];
                  }
                }
              }
              target.innerText = output;
            },
          },
        );
    }
  }, [stepIndex]);

  const currentProgress = progressSteps[stepIndex];

  useGSAP(
    () => {
      const tl = gsap.timeline({
        repeat: 0,
        delay: 0.1,
      });

      tl.to(".char", {
        scaleX: -1,
        ease: "expo.inOut",
        duration: 1.2,
        stagger: { amount: 0.8, from: "start" },
      })
        .to(".char", {
          scaleX: 1,
          ease: "expo.inOut",
          duration: 1.2,
          stagger: { amount: 0.8, from: "end" },
        })
        .to(".char", {
          scaleX: -1,
          ease: "expo.inOut",
          duration: 1.2,
          stagger: { amount: 0.8, from: "start" },
        });
    },
    { scope: containerRef },
  );

  // Grid Column Animation
  useGSAP(
    () => {
      gsap.set(".progress-text", { opacity: 0 });
      gsap.set(".progress-line", { opacity: 0, x: -40 });

      const tl = gsap.timeline();
      tl.to(".shutter", { y: 0, duration: 1.4, ease: "power2.inOut" });

      tl.to(
        `.shutter-${stepIndex - 1}, .shutter-${stepIndex}`,
        {
          y: 60,
          duration: 1.4,
          ease: "expo.inOut",
        },
        0,
      );

      tl.to(
        `.line-${stepIndex}`,
        {
          opacity: 1,
          x: 12,
          scaleX: 1.4,
          duration: 1.4,
          ease: "power4.inOut",
        },
        "-=0.3",
      ).to(`.line-${stepIndex}`, { x: 12, opacity: 0.3, duration: 0.8 });

      tl.to(
        `.text-${stepIndex}`,
        {
          opacity: 1,
          duration: 1.2,
          ease: "power2.inOut",
        },
        "-=1",
      ).to(`.text-${stepIndex}`, { opacity: 0.4, duration: 0.4 });
    },
    { dependencies: [stepIndex], scope: containerRef },
  );

  // EXIT ANIMATION
  useGSAP(
    () => {
      if (currentProgress === 100) {
        const tl = gsap.timeline({
          delay: 2.2,
          onComplete: () => setComplete(true),
        });

        tl.to(".column-wrapper", {
          height: "100vh",
          duration: 1.4,
          ease: "expo.inOut",
        })
          .to(".shutter", { y: 0, duration: 0.2 }, "<")
          .to(
            ".column-wrapper",
            {
              yPercent: -100,
              duration: 1.4,
              ease: "power4.inOut",
              stagger: {
                grid: [1, columnCount],
                from: "center",
                amount: 0.9,
              },
            },
            "-=0.2",
          )
          .to(containerRef.current, {
            opacity: 0,
            display: "none",
            duration: 0.6,
          });
      }
    },
    { dependencies: [currentProgress], scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-99 flex flex-col overflow-hidden"
    >
      {/* Brand Name */}
      <h1
        aria-label="Lawal, written backwards"
        className="title text-foreground text-9xl z-999 flex-center h-1/2 mix-blend-difference"
      >
        {brandName.split("").map((char, i) => (
          <span key={i} className="char inline-block">
            {char}
          </span>
        ))}
      </h1>

      {/* Scrambling Slogan Container */}
      <div className="absolute inset-x-0 bottom-1/12 text-accent mix-blend-difference flex items-center justify-center z-50 px-10">
        {/* Custom Lawal Precision Logo */}
        <svg
          ref={logoRef}
          width="60"
          height="60"
          viewBox="0 0 100 100"
          fill="none"
        >
          <path
            d="M20 20V80H80"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="square"
          />
          <rect x="40" y="40" width="10" height="10" fill="currentColor" />
        </svg>

        <span ref={sloganRef} className="header text-center max-w-4xl">
          Engineering isn't just about writing code
        </span>
      </div>

      {/* Main Progress Grid */}
      <div className="absolute inset-0 flex items-end">
        {[...Array(columnCount)].map((_, i) => (
          <div
            key={i}
            className="column-wrapper relative h-1/2 flex-1 overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-15 flex items-center justify-center gap-1">
              <div
                className={`line-${i} progress-line h-px bg-primary w-full`}
              ></div>
              <span
                className={`text-${i} progress-text font-mono text-sm font-bold text-primary opacity-0`}
              >
                {progressSteps[i] ?? currentProgress}%
              </span>
            </div>
            <div
              className={`shutter shutter-${i} absolute inset-0 bg-primary z-10`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
