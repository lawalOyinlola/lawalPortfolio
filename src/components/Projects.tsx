"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FEATURED_PROJECTS } from "@/app/constants";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SectionHeader } from "@/components/ui/SectionHeader";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollToPlugin, ScrollTrigger, SplitText);
}

const COUNT = FEATURED_PROJECTS.length;
// Scroll distance per project after the first, in vh. The section is one
// screen (sticky) plus this much for every further project.
const STEP_VH = 80;

function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const transitionRef = useRef<gsap.core.Timeline | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { prefersReducedMotion, isHydrated } = usePrefersReducedMotion();

  const cursorEnabled = useMemo(
    () =>
      isHydrated &&
      !prefersReducedMotion &&
      !window.matchMedia("(pointer: coarse)").matches,
    [isHydrated, prefersReducedMotion],
  );

  // Pre-split text on mount so name-char-i classes exist
  useGSAP(
    () => {
      const splits = FEATURED_PROJECTS.map(
        (_, i) =>
          new SplitText(`.name-split-${i}`, {
            type: "words,chars",
            charsClass: `name-char-${i} inline-block`,
          }),
      );

      return () => {
        splits.forEach((split) => split.revert());
      };
    },
    { scope: sectionRef },
  );

  // Swap the visible panel. Scrolling never waits on this: a new change
  // finishes the running transition instantly and starts the next one, so
  // fast scrolling stays in step with the page.
  const showProject = useCallback(
    (target: number) => {
      const prev = indexRef.current;
      if (target === prev) return;
      indexRef.current = target;
      setActiveIndex(target);

      transitionRef.current?.progress(1).kill();
      transitionRef.current = null;

      if (prefersReducedMotion) {
        gsap.set(".project-panel", { autoAlpha: 0 });
        gsap.set(`.panel-${target}`, { autoAlpha: 1 });
        return;
      }

      // Forward moves everything right to left (like the image wipe), back
      // moves it left to right: the outgoing project leaves in the direction
      // of travel and the next one arrives from the opposite side.
      const dir = target > prev ? 1 : -1;
      const lead = dir > 0 ? "end" : "start";
      const tl = gsap.timeline({
        defaults: { overwrite: "auto" },
        onComplete: () => {
          transitionRef.current = null;
        },
      });
      transitionRef.current = tl;

      // Anything other than the two panels involved stays hidden, even after
      // an interrupted sequence.
      for (let i = 0; i < COUNT; i++) {
        if (i !== prev && i !== target)
          tl.set(`.panel-${i}`, { autoAlpha: 0 }, 0);
      }

      // EXIT. inOut rather than in: an ease-in exit sits still for its first
      // ~150ms, which reads as lag right after the scroll that triggered it.
      tl.addLabel("exit", 0)
        .to(
          `.name-char-${prev}`,
          {
            scaleX: -1,
            x: -dir * 24,
            opacity: 0,
            duration: 0.3,
            ease: "power2.inOut",
            stagger: { amount: 0.15, from: lead },
          },
          "exit",
        )
        .to(
          `.img-${prev}`,
          {
            clipPath: dir > 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)",
            duration: 0.35,
            ease: "power2.inOut",
          },
          "exit",
        )
        .to(
          `.cat-${prev}, .desc-${prev}, .tag-p${prev}`,
          { opacity: 0, x: -dir * 16, duration: 0.25, ease: "power2.inOut" },
          "exit",
        )
        .set(`.panel-${prev}`, { autoAlpha: 0 })

        // ENTER
        .addLabel("enter", "-=0.1")
        .set(`.panel-${target}`, { autoAlpha: 1 }, "enter")
        .fromTo(
          `.img-${target}`,
          { clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0%)", duration: 0.5, ease: "power3.out" },
          "enter",
        )
        .fromTo(
          `.name-char-${target}`,
          { scaleX: -1, x: dir * 24, opacity: 0.5 },
          {
            scaleX: 1,
            x: 0,
            opacity: 1,
            duration: 0.5,
            ease: "expo.out",
            stagger: { amount: 0.2, from: lead },
          },
          "enter",
        )
        .fromTo(
          `.cat-${target}, .desc-${target}`,
          { opacity: 0, x: dir * 16 },
          { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" },
          "enter+=0.05",
        )
        .fromTo(
          `.tag-p${target}`,
          { opacity: 0, x: dir * 12 },
          {
            opacity: 1,
            x: 0,
            duration: 0.3,
            ease: "power2.out",
            stagger: { each: 0.04, from: lead },
          },
          "enter+=0.1",
        );
    },
    [prefersReducedMotion],
  );

  // Scroll position picks the project; the browser keeps full control of the
  // scroll itself. Once scrolling stops, a short snap settles on the nearest
  // project so a panel is never left half-way.
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || COUNT < 2) return;

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          showProject(Math.round(self.progress * (COUNT - 1)));
        },
        snap: prefersReducedMotion
          ? undefined
          : {
              snapTo: 1 / (COUNT - 1),
              // Nearest project, not the next one in the scroll direction:
              // a small nudge shouldn't pull the page a whole step.
              directional: false,
              duration: { min: 0.2, max: 0.45 },
              delay: 0.12,
              ease: "power2.out",
            },
      });

      // A reload part-way down the page starts on the right project. Applied
      // directly rather than through showProject: reverting the previous run
      // restores the initial inline styles (panel 0 showing) while indexRef
      // still holds the old index, so showProject would return early.
      const initial = Math.round(trigger.progress * (COUNT - 1));
      transitionRef.current?.kill();
      transitionRef.current = null;
      indexRef.current = initial;
      setActiveIndex(initial);
      gsap.set(".project-panel", { autoAlpha: 0 });
      gsap.set(`.panel-${initial}`, { autoAlpha: 1 });

      return () => trigger.kill();
    },
    // revertOnUpdate: the motion preference resolves after hydration, and
    // without it the first trigger (built for reduced motion) would stay alive
    // beside the new one and swap panels instantly.
    {
      scope: sectionRef,
      dependencies: [showProject, prefersReducedMotion],
      revertOnUpdate: true,
    },
  );

  // Tabs and keys scroll to a project's position, so every input goes through
  // the same path as scrolling.
  const scrollToProject = useCallback(
    (target: number) => {
      const section = sectionRef.current;
      if (!section || target < 0 || target >= COUNT) return;
      const y =
        section.getBoundingClientRect().top +
        window.scrollY +
        target * window.innerHeight * (STEP_VH / 100);

      if (prefersReducedMotion) {
        window.scrollTo({ top: y });
        return;
      }
      gsap.to(window, {
        scrollTo: { y, autoKill: true },
        duration: 0.6,
        ease: "power3.inOut",
        overwrite: true,
      });
    },
    [prefersReducedMotion],
  );

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let newIndex = index;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        if (index >= COUNT - 1) return;
        newIndex = index + 1;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        if (index <= 0) return;
        newIndex = index - 1;
      } else if (e.key === "Home") {
        newIndex = 0;
      } else if (e.key === "End") {
        newIndex = COUNT - 1;
      } else {
        return;
      }

      e.preventDefault();
      scrollToProject(newIndex);

      // Move focus to the new tab
      setTimeout(() => {
        const nextTab = document.getElementById(`tab-${newIndex}`);
        if (nextTab) nextTab.focus();
      }, 0);
    },
    [scrollToProject],
  );

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

  // Tracking "View Project" cursor that follows the pointer over the panels
  useGSAP(
    () => {
      if (!cursorEnabled) return;
      const cursor = cursorRef.current;
      const area = panelsRef.current;
      if (!cursor || !area) return;

      gsap.set(cursor, {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        autoAlpha: 0,
      });

      const xTo = gsap.quickTo(cursor, "x", { duration: 0.45, ease: "power3" });
      const yTo = gsap.quickTo(cursor, "y", { duration: 0.45, ease: "power3" });

      const move = (e: MouseEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };

      const reveal = (e: MouseEvent) => {
        gsap.set(cursor, { x: e.clientX, y: e.clientY });
        gsap.to(cursor, {
          scale: 1,
          autoAlpha: 1,
          duration: 0.35,
          ease: "power3.out",
        });
      };

      const conceal = () => {
        gsap.to(cursor, {
          scale: 0,
          autoAlpha: 0,
          duration: 0.3,
          ease: "power3.in",
        });
      };

      area.addEventListener("mousemove", move);
      area.addEventListener("mouseenter", reveal as EventListener);
      area.addEventListener("mouseleave", conceal);

      return () => {
        area.removeEventListener("mousemove", move);
        area.removeEventListener("mouseenter", reveal as EventListener);
        area.removeEventListener("mouseleave", conceal);
      };
    },
    { scope: sectionRef, dependencies: [cursorEnabled] },
  );

  if (COUNT === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative z-1 bg-muted flex justify-center"
      style={{ height: `calc(100vh + ${(COUNT - 1) * STEP_VH}vh)` }}
      aria-label="Featured projects"
    >
      <div className="wrapper sticky top-0 h-screen flex flex-col justify-center gap-2 md:gap-4.5 max-sm:pt-18 max-sm:pb-20">
        {/* Pairs with the Security section that follows ("Then I test").
            The progress indicator replaces the old numbered tabs. */}
        <div className="flex items-end justify-between gap-6">
          {/* On phones the fixed logo sits where the small label would be */}
          <SectionHeader
            subtitle="Projects"
            title="I build"
            subtitleClassName="max-sm:hidden"
          />

          <div className="flex flex-col items-end gap-2 pb-2 md:pb-3">
            <span
              className="font-mono text-xs tabular-nums text-muted-foreground"
              aria-hidden
            >
              <span className="text-foreground">
                {String(activeIndex + 1).padStart(2, "0")}
              </span>{" "}
              / {String(COUNT).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1.5" role="tablist">
              {FEATURED_PROJECTS.map((project, index) => (
                <button
                  key={project.name}
                  role="tab"
                  aria-selected={activeIndex === index}
                  aria-controls={`panel-${index}`}
                  id={`tab-${index}`}
                  aria-label={`Project ${index + 1}: ${project.name}`}
                  onClick={() => scrollToProject(index)}
                  onKeyDown={(e) => handleTabKeyDown(e, index)}
                  tabIndex={activeIndex === index ? 0 : -1}
                  className="group flex h-8 w-6 md:w-9 cursor-pointer items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  {/* Filled up to the current project, so it reads as
                      progress through the set */}
                  <span className="relative h-0.5 w-full overflow-hidden bg-foreground/15 transition-colors duration-200 group-hover:bg-foreground/30">
                    <span
                      className={`absolute inset-0 origin-left transition-[transform,background-color] duration-300 ease-out ${
                        index <= activeIndex ? "scale-x-100" : "scale-x-0"
                      } ${index === activeIndex ? "bg-foreground" : "bg-foreground/40"}`}
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stacked Project Panels */}
        {/* No aria-live: every scroll step would read a whole panel out.
            The tabs above already say which project is showing. */}
        <div ref={panelsRef} className="relative flex-1 min-h-0">
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
                  {/* Clamped on phones, where the full text pushes the tags off
                      screen; the project page has the rest */}
                  <p
                    className={`desc-${i} text-sm md:text-base mt-2 md:mt-0 max-sm:line-clamp-4`}
                  >
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

          {/* Click-anywhere overlay — opens the active project. A real link,
              so it prefetches, opens in a new tab on cmd/middle-click and goes
              through the page transition like every other link. */}
          <Link
            href={`/projects/${FEATURED_PROJECTS[activeIndex].slug}`}
            aria-label={`View ${FEATURED_PROJECTS[activeIndex].name} — open project page`}
            className="absolute inset-0 z-20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            style={{ cursor: cursorEnabled ? "none" : "pointer" }}
          />
        </div>
      </div>

      {/* Tracking cursor */}
      {cursorEnabled && (
        <div
          ref={cursorRef}
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 z-50 flex items-center gap-2 whitespace-nowrap bg-foreground px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-background"
          style={{ opacity: 0, willChange: "transform" }}
        >
          View Project
          <span aria-hidden="true">&rarr;</span>
        </div>
      )}
    </section>
  );
}

export default Projects;
