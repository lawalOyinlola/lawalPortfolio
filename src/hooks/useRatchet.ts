"use client";

import { useCallback, useEffect, useRef } from "react";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import gsap from "gsap";

type EmblaApi = UseEmblaCarouselType[1];

// The snag, in px: how far the row resists before it lets go, how far it
// runs past the stop, how far it knocks against an end it can't pass, and
// the click it gives as a drag passes each stop.
const CATCH = 10;
const OVERSHOOT = 8;
const KNOCK = 8;
const DETENT = 5;

// Past this many px a press is a drag, and the click it ends in is not a
// click on the link underneath.
const DRAG_THRESHOLD = 6;

/** Which stop the carousel is closest to right now. */
function nearestSnap(api: NonNullable<EmblaApi>) {
  const progress = api.scrollProgress();
  let best = 0;
  api.scrollSnapList().forEach((snap, i, snaps) => {
    if (Math.abs(snap - progress) < Math.abs(snaps[best] - progress)) best = i;
  });
  return best;
}

/**
 * Makes an Embla carousel move like a ratchet. The buttons and arrow keys
 * (via the returned `step`) catch for a beat against the pull, let go, run a
 * little past the stop and rattle back into it, or knock at an end they can't
 * pass. A drag clicks as it passes each stop and rattles into the one it lands
 * on.
 *
 * The offset rides on each slide's `.ratchet-slide` child, never on the slide
 * or the track, so it can't fight Embla's own transforms (loop mode moves the
 * slides themselves). Reduced motion gets a plain jump and no rattle.
 *
 * It also makes dragging over links behave: the browser's own link and image
 * drag is turned off, and the click a drag ends in is swallowed before the
 * page transition (listening on `document`, ahead of Embla) can follow it.
 */
export function useRatchet(api: EmblaApi, reducedMotion: boolean) {
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  // A move the last timeline was still holding back when it got cut short.
  const pendingRef = useRef<(() => void) | null>(null);

  const slides = useCallback(
    () => api?.rootNode().querySelectorAll<HTMLElement>(".ratchet-slide") ?? [],
    [api],
  );

  // Cut whatever is playing, keeping any move it hadn't made yet.
  const takeOver = useCallback(() => {
    tlRef.current?.kill();
    pendingRef.current?.();
    pendingRef.current = null;
    const tl = gsap.timeline();
    tlRef.current = tl;
    return tl;
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!api) return;
      const canMove = dir === 1 ? api.canScrollNext() : api.canScrollPrev();
      const move = () => (dir === 1 ? api.scrollNext() : api.scrollPrev());

      if (reducedMotion) {
        if (!canMove) return;
        if (dir === 1) api.scrollNext(true);
        else api.scrollPrev(true);
        return;
      }

      const targets = slides();
      if (!targets.length) {
        if (canMove) move();
        return;
      }

      // Moving next pulls the row left, so the catch leans right and the
      // overshoot carries on left.
      const tl = takeOver();
      if (canMove) {
        pendingRef.current = move;
        tl.to(targets, { x: CATCH * dir, duration: 0.09, ease: "power2.out" })
          .call(() => {
            pendingRef.current = null;
            move();
          })
          .to(targets, {
            x: -OVERSHOOT * dir,
            duration: 0.32,
            ease: "power3.out",
          })
          .to(targets, { x: 0, duration: 0.7, ease: "elastic.out(1, 0.35)" });
      } else {
        tl.to(targets, {
          x: -KNOCK * dir,
          duration: 0.08,
          ease: "power2.out",
        }).to(targets, { x: 0, duration: 0.6, ease: "elastic.out(1.2, 0.3)" });
      }
    },
    [api, reducedMotion, slides, takeOver],
  );

  useEffect(() => {
    if (!api) return;
    const root = api.rootNode();

    // Without this the browser picks up the link or cover as something to
    // drop elsewhere, and Embla never sees the drag.
    const onDragStart = (event: DragEvent) => event.preventDefault();

    let start: { x: number; y: number } | null = null;
    let dragged = false;
    const onPointerDown = (event: PointerEvent) => {
      start = { x: event.clientX, y: event.clientY };
      dragged = false;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!start || dragged) return;
      dragged =
        Math.hypot(event.clientX - start.x, event.clientY - start.y) >
        DRAG_THRESHOLD;
    };
    const onPointerUp = () => {
      start = null;
    };
    const onClick = (event: MouseEvent) => {
      if (!dragged || !root.contains(event.target as Node)) return;
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    };

    // While held, a click as each stop goes by: the row lags a few px behind
    // the pointer and snaps up to it.
    let held = false;
    let lastSnap = nearestSnap(api);
    let lastProgress = api.scrollProgress();
    const onEmblaDown = () => {
      held = true;
      lastSnap = nearestSnap(api);
      lastProgress = api.scrollProgress();
    };
    const onScroll = () => {
      const progress = api.scrollProgress();
      const travel = Math.sign(progress - lastProgress) as 1 | -1 | 0;
      lastProgress = progress;
      const snap = nearestSnap(api);
      if (snap === lastSnap) return;
      lastSnap = snap;
      if (!held || reducedMotion || !travel) return;
      const targets = slides();
      if (!targets.length) return;
      takeOver().fromTo(
        targets,
        { x: DETENT * travel },
        { x: 0, duration: 0.35, ease: "elastic.out(1, 0.4)" },
      );
    };
    // On release Embla throws the row to a stop; it runs a little past it and
    // rattles back, like the buttons.
    const onEmblaUp = () => {
      held = false;
      if (reducedMotion) return;
      const from = api.scrollProgress();
      requestAnimationFrame(() => {
        const travel = Math.sign(api.scrollProgress() - from);
        const targets = slides();
        if (!travel || !targets.length) return;
        takeOver()
          .to(targets, {
            x: -OVERSHOOT * travel,
            duration: 0.3,
            ease: "power3.out",
            delay: 0.08,
          })
          .to(targets, { x: 0, duration: 0.7, ease: "elastic.out(1, 0.35)" });
      });
    };

    root.addEventListener("dragstart", onDragStart);
    root.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    // Window capture runs before the page transition's document capture.
    window.addEventListener("click", onClick, true);
    api.on("pointerDown", onEmblaDown);
    api.on("scroll", onScroll);
    api.on("pointerUp", onEmblaUp);
    return () => {
      root.removeEventListener("dragstart", onDragStart);
      root.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("click", onClick, true);
      api.off("pointerDown", onEmblaDown);
      api.off("scroll", onScroll);
      api.off("pointerUp", onEmblaUp);
    };
  }, [api, reducedMotion, slides, takeOver]);

  useEffect(() => () => void tlRef.current?.kill(), []);

  return step;
}
