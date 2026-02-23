"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { FEATURED_PROJECTS } from "@/app/constants";

gsap.registerPlugin(ScrollToPlugin);

const COUNT = FEATURED_PROJECTS.length;
const TRANSITION = 0.8;
const HOLD = 0.6;

function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const indexRef = useRef(0);
  const lockedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

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
      `.tag-${prev}`,
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
      `.tag-${target}`,
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
        const panels =
          document.querySelectorAll<HTMLDivElement>(".project-panel");
        panels.forEach((p, i) => {
          gsap.set(p, { autoAlpha: i === expected ? 1 : 0 });
        });
        for (let idx = 0; idx < COUNT; idx++) {
          document
            .querySelectorAll(`.name-char-${idx}`)
            .forEach((el) => gsap.set(el, { scaleX: 1 }));
          document
            .querySelectorAll(`.img-${idx}`)
            .forEach((el) => gsap.set(el, { clipPath: "inset(0 0 0 0)" }));
          document
            .querySelectorAll(`.cat-${idx}, .desc-${idx}`)
            .forEach((el) => gsap.set(el, { opacity: 1, y: 0 }));
          document
            .querySelectorAll(`.tag-${idx}`)
            .forEach((el) => gsap.set(el, { opacity: 1, y: 0 }));
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

  if (COUNT === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative bg-muted"
      style={{ height: `${COUNT * 100}vh` }}
      aria-label="Featured projects"
    >
      <div className="sticky top-0 h-screen flex flex-col justify-center gap-4.5 px-4.5 py-20 max-w-400 w-full">
        <h2 className="font-semibold tracking-tight uppercase text-sm">
          Projects
        </h2>

        {/* Numbered Tabs */}
        <div className="flex items-center gap-10" role="tablist">
          {FEATURED_PROJECTS.map((project, index) => (
            <button
              key={project.name}
              role="tab"
              aria-selected={activeIndex === index}
              aria-label={`Project ${index + 1}: ${project.name}`}
              onClick={() => goTo(index)}
              className={`title transition-all cursor-pointer min-h-19 ${
                activeIndex !== index ? "text-4xl text-muted-foreground" : ""
              }`}
            >
              {String(index + 1).padStart(2, "0")}.
            </button>
          ))}
        </div>

        {/* Stacked Project Panels */}
        <div
          className="relative flex-1 min-h-0"
          role="tabpanel"
          aria-live="polite"
        >
          {FEATURED_PROJECTS.map((project, i) => (
            <div
              key={project.name}
              className={`panel-${i} project-panel absolute inset-0 flex flex-col justify-between`}
              style={{
                visibility: i === 0 ? "visible" : "hidden",
                opacity: i === 0 ? 1 : 0,
              }}
            >
              <div className="flex gap-10">
                <div
                  className={`img-${i} relative w-1/2 aspect-4/3 rounded-lg overflow-hidden bg-foreground/5`}
                  style={{ clipPath: "inset(0 0 0 0)" }}
                >
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className="object-cover"
                    sizes="50vw"
                  />
                </div>
                <div className="flex flex-col justify-between w-1/2 py-2">
                  <div className="flex flex-col gap-5">
                    <p className={`cat-${i}`}>{project.category}</p>
                    <h3 className="bold-title" aria-label={project.name}>
                      {project.name.split("").map((char, c) => (
                        <span
                          key={c}
                          aria-hidden="true"
                          className={`name-char-${i} inline-block`}
                        >
                          {char === " " ? "\u00A0" : char}
                        </span>
                      ))}
                    </h3>
                  </div>
                  <p className={`desc-${i} max-w-lg`}>{project.description}</p>
                </div>
              </div>

              <div className="flex gap-2.5">
                {project.tags.map((tag, j) => (
                  <div
                    key={j}
                    className={`tag-${i} flex flex-col gap-4 max-w-43.5 py-4.5 pr-4`}
                  >
                    <div className="size-2.5 bg-foreground" />
                    <p className="text-xs leading-snug">{tag}</p>
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
