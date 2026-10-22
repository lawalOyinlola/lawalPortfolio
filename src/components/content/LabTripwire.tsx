"use client";

import { useEffect, useRef } from "react";
import { tour } from "@/lib/hairline/stage";
import { inject } from "@/lib/hairline/styles";
import { mount, TRIPWIRE_RANGE, TRIPWIRE_TOUR } from "@/lib/hairline/tripwire";

const NS = "http://www.w3.org/2000/svg";
const LABEL =
  "A lab network of sixteen hosts with sensor posts. Sensor paddles rise as the pointer walks near, and sink slowly once it moves on.";

/**
 * The labs header's figure: the "attack to alert" idea drawn as a line
 * figure. The pointer is the intruder; nearby sensors raise their paddles.
 * With no hand on it, an unseen intruder walks a short lap, which rests under
 * reduced motion and sleeps while the figure is off screen.
 *
 * The plate is filled with the page background, so the figure sits on the
 * page in both themes; the engine follows `.dark` on <html> for its strokes.
 */
export default function LabTripwire({ className }: { className?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    inject(document);

    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 400 320");
    svg.setAttribute("aria-hidden", "true");
    stage.appendChild(svg);

    // The engine names the host under the pointer here; the figure stands
    // alone on this page, so the name is kept and not shown.
    const read = { textContent: "rest" as string | null };

    // The tour registers first, so in each frame the intruder moves before
    // the sensors answer it.
    const lap = tour(stage, TRIPWIRE_TOUR);
    const figure = mount({ stage, svg, read }, TRIPWIRE_RANGE[1]);

    return () => {
      lap.stop();
      figure.destroy();
      svg.remove();
    };
  }, []);

  return (
    <div className={className}>
      {/* The engine draws in a 5:4 box with the floor in its middle: about
          two-thirds of the width and half the height. The stage is widened
          past the window and the window shows only that floor, so the figure
          fills the column. The stage keeps its full box, since the pointer is
          read against it. */}
      <div className="relative aspect-3/2 overflow-hidden">
        <div
          ref={stageRef}
          data-hairline="tripwire"
          role="img"
          aria-label={LABEL}
          className="absolute left-[-17.5%] top-1/2 aspect-5/4 w-[135%] translate-y-[-52%] [--hairline-plate:var(--background)]"
        />
      </div>
    </div>
  );
}
