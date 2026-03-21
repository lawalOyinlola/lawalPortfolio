"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FEATURED_PROJECTS } from "@/app/constants";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollToPlugin, ScrollTrigger, SplitText);
}

const COUNT = FEATURED_PROJECTS.length;
const TRANSITION = 0.8;
const WHEEL_STEP_THRESHOLD = 250;
const WHEEL_STEP_COOLDOWN_MS = 250;

function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const indexRef = useRef(0);
  const transitioningRef = useRef(false);
  const transitionTokenRef = useRef(0);
  const wheelAccumulatorRef = useRef(0);
  const lastStepAtRef = useRef(0);
  const lastStepDirectionRef = useRef(0);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const reducedMotionRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mql.matches;
    const onChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mql.addEventListener("change", onChange);
    return () => {
      mql.removeEventListener("change", onChange);
      tlRef.current?.kill();
      gsap.killTweensOf(window);
    };
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const miniNavTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom 85%",
        onEnter: () => {
          document.documentElement.dataset.hideMiniNav = "true";
        },
        onLeaveBack: () => {
          document.documentElement.dataset.hideMiniNav = "false";
        },
        onEnterBack: () => {
          document.documentElement.dataset.hideMiniNav = "true";
        },
        onLeave: () => {
          document.documentElement.dataset.hideMiniNav = "false";
        },
      });

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const snapTrigger =
        prefersReducedMotion || COUNT < 2
          ? null
          : ScrollTrigger.create({
              trigger: section,
              start: "top top",
              end: "bottom bottom",
              snap: {
                snapTo: 1 / (COUNT - 1),
                duration: { min: 0.1, max: 0.3 },
                delay: 0,
                ease: "power1.inOut",
              },
            });

      return () => {
        miniNavTrigger.kill();
        snapTrigger?.kill();
        delete document.documentElement.dataset.hideMiniNav;
      };
    },
    { scope: sectionRef },
  );

  const settleToIndex = useCallback((index: number) => {
    const safeIndex = Math.min(Math.max(index, 0), COUNT - 1);
    const panels = document.querySelectorAll<HTMLDivElement>(".project-panel");
    panels.forEach((p, i) => {
      gsap.set(p, { autoAlpha: i === safeIndex ? 1 : 0 });
    });

    for (let idx = 0; idx < COUNT; idx++) {
      const split = new SplitText(`.name-split-${idx}`, { type: "chars" });
      gsap.set(split.chars, { scaleX: 1, opacity: 1 });

      document.querySelectorAll(`.img-${idx}`).forEach((el) => {
        gsap.set(el, { clipPath: "inset(0 0 0 0)" });
      });
      document.querySelectorAll(`.cat-${idx}, .desc-${idx}`).forEach((el) => {
        gsap.set(el, { opacity: 1, y: 0 });
      });
      document.querySelectorAll(`.tag-p${idx}`).forEach((el) => {
        gsap.set(el, { opacity: 1, y: 0 });
      });
    }
  }, []);

  const goTo = useCallback(
    (target: number) => {
      if (target < 0 || target >= COUNT) return;
      if (target === indexRef.current) return;

      transitionTokenRef.current += 1;
      const transitionToken = transitionTokenRef.current;
      const prev = indexRef.current;

      // Kill any in-flight transition, then normalize to a clean baseline.
      tlRef.current?.kill();
      gsap.killTweensOf(window);
      if (transitioningRef.current) {
        settleToIndex(prev);
      }

      transitioningRef.current = true;
      const dir = target > prev ? 1 : -1;
      indexRef.current = target;
      setActiveIndex(target);

      const reduced = reducedMotionRef.current;

      if (sectionRef.current) {
        const sectionTop = sectionRef.current.offsetTop;
        const dur = reduced
          ? 0
          : Math.min(TRANSITION + Math.abs(target - prev) * 0.15, 1.2);
        gsap.to(window, {
          scrollTo: {
            y: sectionTop + target * window.innerHeight,
            autoKill: false,
          },
          duration: dur,
          ease: "power3.inOut",
          overwrite: true,
        });
      }

      if (reduced) {
        settleToIndex(target);
        if (transitionTokenRef.current === transitionToken) {
          transitioningRef.current = false;
        }
        return;
      }

      const exitLabel = "exit";
      const enterLabel = "enter";

      const tl = gsap.timeline({
        onComplete: () => {
          if (transitionTokenRef.current === transitionToken) {
            transitioningRef.current = false;
          }
        },
      });
      tlRef.current = tl;

      // ── EXIT: animate each element out ──

      tl.addLabel(exitLabel);

      // Name: flip characters out
      tl.to(
        `.name-char-${prev}`,
        {
          scaleX: -1,
          opacity: 0,
          duration: 0.5,
          ease: "expo.inOut",
          stagger: { amount: 0.3, from: dir > 0 ? "start" : "end" },
        },
        exitLabel,
      );

      // Image: clip-path wipe out in the direction of travel
      tl.to(
        `.img-${prev}`,
        {
          clipPath: dir > 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)",
          duration: 0.55,
          ease: "power3.inOut",
        },
        exitLabel,
      );

      // Category: fade up and out
      tl.to(
        `.cat-${prev}`,
        { opacity: 0, y: -12, duration: 0.3, ease: "power2.in" },
        exitLabel,
      );

      // Description: fade down and out
      tl.to(
        `.desc-${prev}`,
        { opacity: 0, y: 15, duration: 0.35, ease: "power2.in" },
        `${exitLabel}+=0.05`,
      );

      // Tags: stagger fade out
      tl.to(
        `.tag-p${prev}`,
        {
          opacity: 0,
          y: 10,
          duration: 0.25,
          ease: "power2.in",
          stagger: 0.04,
        },
        `${exitLabel}+=0.05`,
      );

      // Hide the outgoing panel after all exit animations
      tl.set(`.panel-${prev}`, { autoAlpha: 0 });

      // ── ENTER: reveal the incoming panel, then animate each element in ──
      tl.addLabel(enterLabel, "-=0.2");

      // Show the panel container
      tl.set(`.panel-${target}`, { autoAlpha: 1 }, enterLabel);

      // Image: clip-path wipe in from the opposite side
      tl.fromTo(
        `.img-${target}`,
        {
          clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
        },
        {
          clipPath: "inset(0 0 0 0)",
          duration: 0.6,
          ease: "power3.inOut",
        },
        enterLabel,
      );

      // Category: fade in from below
      tl.fromTo(
        `.cat-${target}`,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
        `${enterLabel}+=0.1`,
      );

      // Name: flip characters in
      const nameSplit = new SplitText(`.name-split-${target}`, {
        type: "chars",
        charsClass: "inline-block",
      });

      tl.fromTo(
        nameSplit.chars,
        { scaleX: -1, opacity: 0.5 },
        {
          scaleX: 1,
          opacity: 1,
          duration: 0.6,
          ease: "expo.inOut",
          stagger: { amount: 0.3, from: dir > 0 ? "end" : "start" },
        },
        `${enterLabel}+=0.1`,
      );

      // Description: rise up into place
      tl.fromTo(
        `.desc-${target}`,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        `${enterLabel}+=0.2`,
      );

      // Tags: stagger in from left
      tl.fromTo(
        `.tag-p${target}`,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
          stagger: 0.06,
        },
        `${enterLabel}+=0.25`,
      );
    },
    [settleToIndex],
  );

  // Sync project index with scroll position for natural/fast scrolling
  useEffect(() => {
    const sync = () => {
      const section = sectionRef.current;
      if (!section || transitioningRef.current) return;

      const scrollIn = window.scrollY - section.offsetTop;

      // Switch items at a 30% scroll threshold instead of 50%
      const rawScrollProgress = scrollIn / window.innerHeight;
      const expected = Math.min(
        Math.max(Math.floor(rawScrollProgress + 0.7), 0),
        COUNT - 1,
      );

      if (expected !== indexRef.current) {
        settleToIndex(expected);
        indexRef.current = expected;
        setActiveIndex(expected);
      }
    };

    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, [settleToIndex]);

  // Intercept wheel events for discrete project switching
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const stickyEngaged = rect.top <= 5 && rect.bottom >= window.innerHeight;

      if (!stickyEngaged) return;

      const direction = Math.sign(e.deltaY);
      if (direction === 0) return;

      const current = indexRef.current;
      const movingOutOfRange =
        (direction > 0 && current >= COUNT - 1) ||
        (direction < 0 && current <= 0);

      if (movingOutOfRange) {
        wheelAccumulatorRef.current = 0;
        return;
      }

      // Keep snap pagination but allow interruption by a new wheel intent.
      e.preventDefault();

      if (Math.sign(wheelAccumulatorRef.current) !== direction) {
        wheelAccumulatorRef.current = 0;
      }

      wheelAccumulatorRef.current += e.deltaY;

      if (Math.abs(wheelAccumulatorRef.current) >= WHEEL_STEP_THRESHOLD) {
        const stepDirection = wheelAccumulatorRef.current > 0 ? 1 : -1;
        const now = performance.now();
        const reversing = stepDirection !== lastStepDirectionRef.current;
        const cooldownPassed =
          now - lastStepAtRef.current >= WHEEL_STEP_COOLDOWN_MS;

        if (reversing || cooldownPassed) {
          const next = Math.min(
            Math.max(indexRef.current + stepDirection, 0),
            COUNT - 1,
          );

          if (next !== indexRef.current) {
            goTo(next);
            lastStepAtRef.current = now;
            lastStepDirectionRef.current = stepDirection;
          }
        }

        wheelAccumulatorRef.current = 0;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [goTo]);

  if (COUNT === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative z-1 bg-muted flex justify-center"
      style={{ height: `${COUNT * 100}vh` }}
      aria-label="Featured projects"
    >
      <div className="wrapper sticky top-0 h-screen flex flex-col justify-center gap-2 md:gap-4.5 max-sm:py-10">
        <h2 className="font-semibold tracking-tight uppercase text-sm">
          Projects
        </h2>

        {/* Numbered Tabs */}
        <div
          className="flex items-center gap-8 md:gap-10 max-sm:hidden"
          role="tablist"
        >
          {FEATURED_PROJECTS.map((project, index) => (
            <button
              key={project.name}
              role="tab"
              aria-selected={activeIndex === index}
              aria-controls={`panel-${index}`}
              id={`tab-${index}`}
              aria-label={`Project ${index + 1}: ${project.name}`}
              onClick={() => goTo(index)}
              className={`title transition-all cursor-pointer min-h-10 md:min-h-19 ${
                activeIndex !== index
                  ? "text-[clamp(1.5rem,4vw,2.25rem)] text-muted-foreground"
                  : ""
              }`}
            >
              {String(index + 1).padStart(2, "0")}.
            </button>
          ))}
        </div>

        {/* Stacked Project Panels */}
        <div aria-live="polite" className="relative flex-1 min-h-0">
          {FEATURED_PROJECTS.map((project, i) => (
            <div
              key={project.name}
              className={`panel-${i} project-panel absolute inset-0 flex flex-col justify-between`}
              style={{
                visibility: i === 0 ? "visible" : "hidden",
                opacity: i === 0 ? 1 : 0,
              }}
              role="tabpanel"
              id={`panel-${i}`}
              aria-labelledby={`tab-${i}`}
              aria-hidden={activeIndex !== i}
            >
              <div className="flex flex-col md:flex-row flex-1 gap-4 md:gap-10">
                <div
                  className={`img-${i} relative w-full md:w-3/5 min-h-[35vh] md:min-h-0 overflow-hidden bg-foreground/5`}
                  style={{ clipPath: "inset(0 0 0 0)" }}
                >
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 57vw"
                  />
                </div>
                <div className="w-full md:w-2/5 flex flex-col justify-between py-0 md:py-2 sm:flex-1">
                  <div className="flex flex-col gap-2 md:gap-5">
                    <p className={`cat-${i} text-xs md:text-base`}>
                      {project.category}
                    </p>
                    <h3
                      className={`project-name bold-title md:text-auto max-sm:-mt-2 name-split-${i}`}
                      aria-label={project.name}
                    >
                      {project.name}
                    </h3>
                  </div>
                  <p className={`desc-${i} text-sm md:text-base mt-2 md:mt-0`}>
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 md:gap-x-2.5 gap-y-2 mt-4 md:mt-0">
                {project.keypoints.map((keypoint, ki) => (
                  <div
                    key={`${project.slug}-${keypoint}-${ki}`}
                    className={`tag-p${i} flex items-center md:items-start md:flex-col gap-2 md:gap-4 max-w-full md:max-w-43.5 md:py-4.5 md:pr-4`}
                  >
                    <div className="size-1.5 md:size-2.5 bg-foreground shrink-0" />
                    <p className="text-[10px] md:text-xs leading-snug">
                      {keypoint}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;
