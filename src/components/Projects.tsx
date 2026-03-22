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
const TRANSITION = 0.6;
const HOLD = 0.4;

function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const indexRef = useRef(0);
  const lockedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Pre-split text on mount so name-char-i classes exist
  useGSAP(
    () => {
      FEATURED_PROJECTS.forEach((_, i) => {
        new SplitText(`.name-split-${i}`, {
          type: "words,chars",
          charsClass: `name-char-${i} inline-block`,
        });
      });
    },
    { scope: sectionRef },
  );

  const goTo = useCallback((target: number) => {
    if (target < 0 || target >= COUNT) return;
    if (target === indexRef.current) return;
    if (lockedRef.current) return;

    lockedRef.current = true;
    const prev = indexRef.current;
    const dir = target > prev ? 1 : -1;
    indexRef.current = target;
    setActiveIndex(target);

    if (sectionRef.current) {
      const sectionTop = sectionRef.current.offsetTop;
      const dur = Math.min(TRANSITION + Math.abs(target - prev) * 0.15, 1.2);
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

    const exitLabel = "exit";
    const enterLabel = "enter";

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.delayedCall(HOLD, () => {
          lockedRef.current = false;
        });
      },
    });

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
    tl.fromTo(
      `.name-char-${target}`,
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
  }, []);

  // Sync project index with scroll position for natural/fast scrolling
  useEffect(() => {
    const sync = () => {
      const section = sectionRef.current;
      if (!section || lockedRef.current) return;

      const scrollIn = window.scrollY - section.offsetTop;
      const expected = Math.min(
        Math.max(Math.round(scrollIn / window.innerHeight), 0),
        COUNT - 1,
      );

      if (expected !== indexRef.current) {
        // Immediate visual update to ensure the correct panel is visible
        const panels =
          document.querySelectorAll<HTMLDivElement>(".project-panel");
        panels.forEach((p, i) => {
          gsap.set(p, { autoAlpha: i === expected ? 1 : 0 });
        });

        // Ensure characters and elements of the expected panel are in their "normal" state
        for (let idx = 0; idx < COUNT; idx++) {
          document.querySelectorAll(`.name-char-${idx}`).forEach((el) => {
            gsap.set(el, { scaleX: 1, opacity: 1 });
          });
          document.querySelectorAll(`.img-${idx}`).forEach((el) => {
            gsap.set(el, { clipPath: "inset(0 0 0 0)" });
          });
          document
            .querySelectorAll(`.cat-${idx}, .desc-${idx}`)
            .forEach((el) => {
              gsap.set(el, { opacity: 1, y: 0 });
            });
          document.querySelectorAll(`.tag-p${idx}`).forEach((el) => {
            gsap.set(el, { opacity: 1, y: 0 });
          });
        }

        indexRef.current = expected;
        setActiveIndex(expected);
      }
    };

    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);

  // Intercept wheel events for discrete project switching
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const stickyEngaged = rect.top <= 5 && rect.bottom >= window.innerHeight;

      if (!stickyEngaged) return;

      if (lockedRef.current) {
        e.preventDefault();
        return;
      }

      if (e.deltaY > 0 && indexRef.current < COUNT - 1) {
        e.preventDefault();
        goTo(indexRef.current + 1);
      } else if (e.deltaY < 0 && indexRef.current > 0) {
        e.preventDefault();
        goTo(indexRef.current - 1);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [goTo]);

  // Handle mini-nav visibility via ScrollTrigger
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

      return () => {
        miniNavTrigger.kill();
        delete document.documentElement.dataset.hideMiniNav;
      };
    },
    { scope: sectionRef },
  );

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
