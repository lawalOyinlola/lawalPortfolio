"use client";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BRAND } from "../app/constants/brand";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { markIntroDone, markIntroSeen, shouldPlayIntro } from "@/lib/intro";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface PreloaderProps {
  /** Fires as the columns start lifting, so the page is already there underneath. */
  onReveal: () => void;
  /** Fires once the columns are gone and the overlay can unmount. */
  onComplete: () => void;
}

// "I AM LAWAL" types out, LAWAL mirrors end to start, and the gap in "I AM"
// closes so the line settles on "IAM ⅃AWA⅃": the identity-and-access pun.
const NBSP = "\u00A0";
// Two spaces before the name so "IAM" and "LAWAL" read as separate words.
const PREFIX = ["I", NBSP, "A", "M", NBSP, NBSP];
const LINE = [...PREFIX, ...BRAND.shortName.split("")];
const NAME_LENGTH = BRAND.shortName.length;
const GAP_INDEX = 1;

// The subline tells the same story as the motions above it, in words that land
// with a manager or HR as much as an engineer: what people use (typed forward
// with the name), the systems behind it (uncovered end to start as LAWAL
// flips, as if peeling the product back),
// and the people and process in between (closing up as I AM becomes IAM).
const SUB_LEAD = `Secure${NBSP}`;
const SUB_WORDS = ["products", "systems", "people & process"] as const;
const SUB_TYPE_EACH = 0.05;
// How long each finished subline phrase stays readable before the next beat.
const SUB_HOLD = 0.7;

// The LAWAL flip and the I AM gap closing share an ease so they read as one
// rhythm; each letter's turn is a touch quicker than the gap.
const FLIP_EASE = "power2.inOut";
const FLIP_DURATION = 0.6;
const GAP_DURATION = 0.7;

export default function Preloader({ onReveal, onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const subLeadRef = useRef<HTMLSpanElement>(null);
  const subWordRef = useRef<HTMLSpanElement>(null);
  const subTopRef = useRef<HTMLSpanElement>(null);
  const subUnderRef = useRef<HTMLSpanElement>(null);
  const skipRef = useRef<() => void>(() => {});
  const { prefersReducedMotion, isHydrated: isMotionHydrated } =
    usePrefersReducedMotion();

  // Fewer columns on mobile for clarity. Taken once, on the first render
  // that knows the width, then held: following resizes would rebuild the
  // timeline and restart the intro.
  const { isMobile, isMounted } = useWindowDimensions();
  const [heldColumnCount, setHeldColumnCount] = useState<number | null>(null);
  if (isMounted && heldColumnCount === null) {
    setHeldColumnCount(isMobile ? 8 : 16);
  }
  const columnCount = heldColumnCount ?? 16;

  useGSAP(
    () => {
      const line = lineRef.current;
      const subLead = subLeadRef.current;
      const subWord = subWordRef.current;
      const subTop = subTopRef.current;
      const subUnder = subUnderRef.current;
      if (
        !isMotionHydrated ||
        !line ||
        !subLead ||
        !subWord ||
        !subTop ||
        !subUnder
      )
        return;

      // The subline is written as text, which a context revert doesn't undo,
      // so reset it for a fresh run. "systems" waits, fully clipped, under
      // where "products" will be typed.
      subLead.textContent = "";
      subTop.textContent = "";
      subUnder.textContent = SUB_WORDS[1];
      gsap.set(subUnder, { clipPath: "inset(0 0 0 100%)" });

      const reveal = () => {
        markIntroSeen();
        onReveal();
      };

      // I AM → IAM: the "I" holds still and everything after the gap slides
      // left by the gap's width. A transform, so nothing re-lays out and the
      // subline under the "I" stays put. The gap is measured on the invisible
      // copy, which is always laid out.
      const gapShift = () =>
        -(line.querySelector<HTMLElement>(".pl-gap-measure")?.offsetWidth ?? 0);

      // The line sits half a gap right of centre from the start, so that once
      // the gap closes "IAM ⅃AWA⅃" ends up exactly centred, still without the
      // "I" ever moving.
      gsap.set(line, { x: () => -gapShift() / 2 });

      // Reduced motion: show the settled line briefly, no typing or lift.
      if (prefersReducedMotion) {
        gsap.set(".pl-char", { display: "inline-block" });
        gsap.set(".pl-shift", { x: gapShift });
        gsap.set(".pl-name", { scaleX: -1 });
        gsap.set(".pl-caret", { display: "none" });
        subLead.textContent = SUB_LEAD;
        subUnder.textContent = SUB_WORDS[2];
        gsap.set(subUnder, { clipPath: "none" });
        const timer = setTimeout(() => {
          reveal();
          markIntroDone();
          onComplete();
        }, 700);
        return () => clearTimeout(timer);
      }

      const tl = gsap.timeline({
        delay: 0.2,
        onComplete: () => {
          markIntroDone();
          onComplete();
        },
      });
      let stopListening = () => {};

      if (!shouldPlayIntro()) {
        gsap.set(line, { autoAlpha: 0 });
        tl.addLabel("lift", 0);
      } else {
        const chars = gsap.utils.toArray<HTMLElement>(".pl-char");
        const caret = gsap.to(".pl-caret", {
          opacity: 0,
          duration: 0.4,
          ease: "steps(1)",
          repeat: -1,
          yoyo: true,
        });

        tl
          // a short blink before the first keystroke
          .to({}, { duration: 0.35 });

        // I AM LAWAL → typed one character at a time
        chars.forEach((char, i) => {
          tl.set(char, { display: "inline-block" }, `>${i === 0 ? 0 : 0.12}`);
        });

        // Subline typing: one character per step, from a timeline position.
        const typeOut = (el: HTMLElement, text: string, at: string) => {
          for (let i = 1; i <= text.length; i++) {
            tl.call(
              () => {
                el.textContent = text.slice(0, i);
              },
              undefined,
              `${at}+=${(i - 1) * SUB_TYPE_EACH}`,
            );
          }
          return text.length * SUB_TYPE_EACH;
        };
        // drop the caret as soon as the name is spelt
        tl.add(() => caret.pause(0), "+=0.1")
          .set(".pl-caret", { display: "none" })
          .addLabel("typed");

        // "Secure products" types in under the name
        const leadTime = typeOut(subLead, SUB_LEAD, "typed");
        const firstTime =
          leadTime + typeOut(subTop, SUB_WORDS[0], `typed+=${leadTime}`);

        // LAWAL → flip each char to mirrored, last letter first
        const flipStagger = 0.1;
        const flipTotal = FLIP_DURATION + flipStagger * (NAME_LENGTH - 1);
        tl.addLabel("flip", `typed+=${firstTime + SUB_HOLD}`).to(
          ".pl-name",
          {
            scaleX: -1,
            ease: FLIP_EASE,
            duration: FLIP_DURATION,
            stagger: { each: flipStagger, from: "end" },
          },
          "flip",
        );

        // ...while one edge sweeps end to start across the word, in step with
        // the flip: "products" is cut away behind it and "systems", stacked
        // underneath, is uncovered in its place.
        const peel = { duration: flipTotal, ease: FLIP_EASE };
        tl.fromTo(
          subTop,
          { clipPath: "inset(0 0% 0 0)" },
          { clipPath: "inset(0 100% 0 0)", ...peel, immediateRender: false },
          "flip",
        ).to(subUnder, { clipPath: "inset(0 0 0 0%)", ...peel }, "flip");

        // a beat on "I AM ⅃AWA⅃", then I AM → IAM
        tl.addLabel("gap", `flip+=${flipTotal + SUB_HOLD}`)
          .to(
            ".pl-shift",
            { x: gapShift, duration: GAP_DURATION, ease: FLIP_EASE },
            "gap",
          )
          // ...as "people & process" closes up from wide spacing
          .to(subWord, { autoAlpha: 0, duration: 0.15 }, "gap-=0.15")
          .call(
            () => {
              subTop.textContent = "";
              subUnder.textContent = SUB_WORDS[2];
            },
            undefined,
            "gap",
          )
          .fromTo(
            subWord,
            { letterSpacing: "0.7em", autoAlpha: 0 },
            {
              letterSpacing: "0.2em",
              autoAlpha: 1,
              duration: GAP_DURATION,
              ease: FLIP_EASE,
              // fromTo renders its start state at build time by default, which
              // would hide the earlier words from the outset
              immediateRender: false,
            },
            "gap",
          )
          // let "IAM" settle for a beat, then lift the grid
          .addLabel("lift", `gap+=${GAP_DURATION + SUB_HOLD}`)
          // brand fades as the columns start moving
          .to(
            line,
            { autoAlpha: 0, duration: 0.35, ease: "power1.inOut" },
            "lift+=0.1",
          );

        // Skip: the button, or any key, click, tap or scroll attempt, jumps
        // to the lift. Events aren't suppressed, so every typing step in
        // between still runs and the line lands in its finished state.
        const skipButton = containerRef.current?.querySelector(".pl-skip");
        tl.to(skipButton ?? [], { autoAlpha: 1, duration: 0.3 }, 0.8).to(
          skipButton ?? [],
          { autoAlpha: 0, duration: 0.2 },
          "lift",
        );

        const liftAt = tl.labels.lift;
        const skip = () => {
          stopListening();
          if (tl.time() < liftAt) tl.seek(liftAt - 0.001, false);
        };
        const events = ["keydown", "pointerdown", "wheel", "touchmove"];
        events.forEach((type) =>
          window.addEventListener(type, skip, { passive: true }),
        );
        stopListening = () =>
          events.forEach((type) => window.removeEventListener(type, skip));
        skipRef.current = skip;
      }

      tl
        // grid slides up to reveal the page, which is already visible beneath
        .call(reveal, undefined, "lift")
        .to(
          ".column",
          {
            yPercent: -100,
            duration: 1.4,
            ease: "power4.inOut",
            stagger: { grid: [1, columnCount], from: "center", amount: 0.5 },
          },
          "lift",
        )
        .set(containerRef.current, { display: "none" });

      return () => {
        stopListening();
        tl.kill();
      };
    },
    {
      scope: containerRef,
      dependencies: [columnCount, prefersReducedMotion, isMotionHydrated],
      revertOnUpdate: true,
    },
  );

  return (
    <div
      ref={containerRef}
      className="preloader fixed inset-0 z-99 flex items-center justify-center overflow-hidden"
    >
      {/* Grid of columns that lifts away to reveal the page. Each overlaps
          the next by a pixel, so fractional widths never show hairline gaps. */}
      <div className="absolute inset-0 flex" aria-hidden="true">
        {[...Array(columnCount)].map((_, i) => (
          <div
            key={i}
            className="column h-full flex-1 -mr-px last:mr-0 bg-foreground"
          />
        ))}
      </div>

      {/* Brand line: decorative, the page underneath carries the real h1.
          An invisible copy of the full line holds the width, so the typing
          runs left to right instead of growing from the centre and the "I"
          never moves. */}
      <div ref={lineRef} className="pl-line relative z-10" aria-hidden="true">
        <p className="grid whitespace-nowrap title text-background text-[clamp(2.25rem,11vw,8rem)] select-none pointer-events-none">
          <span className="invisible col-start-1 row-start-1 flex">
            {LINE.map((char, i) => (
              <span
                key={i}
                className={`inline-block ${i === GAP_INDEX ? "pl-gap-measure" : ""}`}
              >
                {char}
              </span>
            ))}
          </span>
          <span className="col-start-1 row-start-1 flex items-center">
            {LINE.map((char, i) => (
              <span
                key={i}
                className={`pl-char hidden ${i > GAP_INDEX ? "pl-shift" : ""} ${i >= PREFIX.length ? "pl-name origin-center" : ""}`}
              >
                {char}
              </span>
            ))}
            {/* Zero-width anchor so the caret never takes up room in the line:
                otherwise the line re-centres, and the letters jump, when it goes. */}
            <span className="pl-caret relative inline-block h-[0.8em] w-0">
              <span className="absolute inset-y-0 left-[0.06em] w-[0.08em] bg-background" />
            </span>
          </span>
        </p>

        {/* Subline: sits out of flow under the "I" so its changing length
            never moves the name above it. Typed in by the timeline. */}
        <p className="absolute left-0 top-full mt-3 md:mt-5 whitespace-nowrap text-[11px] sm:text-xs md:text-sm font-medium uppercase tracking-[0.2em] text-background/70 select-none pointer-events-none">
          <span ref={subLeadRef} className="inline-block align-top" />
          {/* Two words stacked in one cell, so the peel can uncover one
              exactly where the other was; "top" paints over "under". Both
              halves of the line are top-aligned, since the grid's baseline
              shifts as its words change. */}
          <span ref={subWordRef} className="inline-grid align-top">
            <span ref={subUnderRef} className="col-start-1 row-start-1" />
            <span ref={subTopRef} className="col-start-1 row-start-1" />
          </span>
        </p>
      </div>

      {/* The only part of the overlay exposed to assistive tech: the line
          and grid are decorative. Faded in by the timeline once the intro
          is underway. */}
      <button
        type="button"
        onClick={() => skipRef.current()}
        className="pl-skip invisible absolute bottom-4 right-4 z-10 min-h-11 px-3 text-[11px] md:bottom-6 md:right-6 md:text-xs font-medium uppercase tracking-[0.2em] text-background/60 opacity-0 outline-none transition-colors duration-200 hover:text-background focus-visible:text-background focus-visible:ring-1 focus-visible:ring-background/60"
      >
        Skip intro
      </button>
    </div>
  );
}
