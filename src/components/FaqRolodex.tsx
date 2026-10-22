"use client";

import { useEffect, useRef } from "react";
import { rolodex, ROLODEX_RANGE, type RolodexHandle } from "@/lib/hairline/rolodex";
import { inject } from "@/lib/hairline/styles";

const NS = "http://www.w3.org/2000/svg";

/**
 * The FAQ's figure: a Rolodex with one card per question. It opens at the
 * question that is open below it, and the pointer can flip through the cards.
 * It does not play on its own: the cards would turn away from the question
 * someone is reading.
 *
 * The plate is filled with the page background, so the figure sits on the
 * page in both themes; the engine follows `.dark` on <html> for its strokes.
 */
export default function FaqRolodex({
  count,
  openIndex,
  className,
}: {
  count: number;
  /** The open question; the wheel stays where it was when every question is closed. */
  openIndex: number | null;
  className?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<RolodexHandle | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    inject(document);

    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 400 320");
    svg.setAttribute("aria-hidden", "true");
    stage.appendChild(svg);

    // The engine names the card under the pointer here; the figure stands
    // alone on the page, so the name is kept and not shown.
    const read = { textContent: "rest" as string | null };
    const figure = rolodex(count)({ stage, svg, read }, ROLODEX_RANGE[1]);
    figureRef.current = figure;

    return () => {
      figureRef.current = null;
      figure.destroy();
      svg.remove();
    };
  }, [count]);

  // Declared after the mount, so on the first render it runs second and
  // finds the figure there.
  useEffect(() => {
    if (openIndex !== null) figureRef.current?.pick(openIndex);
  }, [openIndex, count]);

  return (
    <div className={className}>
      {/* The engine draws in a 5:4 box with the Rolodex in its middle: under
          half the width and two-thirds of the height. The stage is widened
          past the window and the window shows only the Rolodex. The stage
          keeps its full box, since the pointer is read against it. */}
      <div className="relative aspect-5/4 overflow-hidden">
        <div
          ref={stageRef}
          data-hairline="rolodex"
          role="img"
          aria-label={`A rotary card file with ${count} cards, one for each question, open at the card of the question below that is open.`}
          className="absolute -left-[30%] top-1/2 aspect-5/4 w-[160%] -translate-y-[53%] [--hairline-plate:var(--background)]"
        />
      </div>
    </div>
  );
}
