"use client";

import { useEffect, useRef } from "react";
import { tour } from "@/lib/hairline/stage";
import { inject } from "@/lib/hairline/styles";
import {
  mount,
  TYPEWRITER_RANGE,
  TYPEWRITER_TOUR,
} from "@/lib/hairline/typewriter";

const NS = "http://www.w3.org/2000/svg";
const LABEL =
  "A typewriter with a sheet of paper in it. Moving across the type bars swings one up to strike the paper.";

/**
 * The blog header's figure: a typewriter whose type bars swing up to strike
 * the paper as the pointer moves across them. With no hand on it, an unseen
 * pointer walks a short lap, which rests under reduced motion and sleeps
 * while the figure is off screen.
 *
 * The plate is filled with the page background, so the figure sits on the
 * page in both themes; the engine follows `.dark` on <html> for its strokes.
 */
export default function BlogTypewriter({ className }: { className?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    inject(document);

    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 400 320");
    svg.setAttribute("aria-hidden", "true");
    stage.appendChild(svg);

    // The engine names the bar under the pointer here; the figure stands
    // alone on the page, so the name is kept and not shown.
    const read = { textContent: "rest" as string | null };
    // The tour registers first, so in each frame the pointer moves before the
    // typewriter answers it.
    const lap = tour(stage, TYPEWRITER_TOUR);
    const figure = mount({ stage, svg, read }, TYPEWRITER_RANGE[1]);

    return () => {
      lap.stop();
      figure.destroy();
      svg.remove();
    };
  }, []);

  return (
    <div className={className}>
      {/* The engine draws in a 5:4 box with the typewriter in its middle:
          about half the width and two-thirds of the height. The stage is
          widened past the window and the window shows only the typewriter.
          The stage keeps its full box, since the pointer is read against it. */}
      <div className="relative aspect-10/7 overflow-hidden">
        <div
          ref={stageRef}
          data-hairline="typewriter"
          role="img"
          aria-label={LABEL}
          className="absolute left-[-17.5%] top-1/2 aspect-5/4 w-[135%] translate-y-[-52.5%] [--hairline-plate:var(--background)]"
        />
      </div>
    </div>
  );
}
