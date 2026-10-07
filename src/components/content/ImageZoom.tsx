"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { XIcon } from "@phosphor-icons/react";

/**
 * `aspect` is width / height, read from the rendered inline image. A linked
 * image carries its `src`; an inlined theme-aware diagram (svg.dg) carries its
 * markup instead, so the enlarged copy follows the site theme too.
 */
type ZoomedImage = { src?: string; svg?: string; alt: string; aspect: number };

/**
 * Click, Enter or Space on any image inside `[data-prose]` opens it full size.
 *
 * Built on <dialog>.showModal(), which brings Escape-to-close, focus
 * containment, and focus restoration to the image on close, so none of that is
 * reimplemented here. Like CodeCopyButtons it attaches to the rendered markdown
 * rather than wrapping it, because the prose arrives as an HTML string.
 */
export default function ImageZoom() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [image, setImage] = useState<ZoomedImage | null>(null);

  useEffect(() => {
    const images = document.querySelectorAll<HTMLImageElement | SVGSVGElement>(
      "[data-prose] img, [data-prose] svg.dg",
    );
    const cleanups: (() => void)[] = [];

    images.forEach((img) => {
      if (img.dataset.zoomable === "true") return;
      const isSvg = img instanceof SVGSVGElement;
      const alt = isSvg ? (img.getAttribute("aria-label") ?? "") : img.alt;
      // Captured before the button semantics below overwrite them, so cleanup
      // can hand an inlined diagram back its role="img" and description.
      const original = { role: img.getAttribute("role"), label: img.getAttribute("aria-label") };

      img.dataset.zoomable = "true";
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-haspopup", "dialog");
      img.setAttribute("aria-label", `Enlarge image: ${alt || "figure"}`);

      const open = () => {
        // Measured from the rendered image, not naturalWidth: an SVG with only
        // a viewBox has no intrinsic size, so it would open *smaller* than inline.
        const rect = img.getBoundingClientRect();
        const aspect = rect.height > 0 ? rect.width / rect.height : 16 / 9;
        if (img instanceof SVGSVGElement) {
          // A clean copy: the enlarged diagram is decoration of the dialog,
          // which is already labelled, so it needs none of the button wiring.
          const copy = img.cloneNode(true) as SVGSVGElement;
          for (const name of ["role", "aria-label", "aria-haspopup", "tabindex", "data-zoomable", "style"]) {
            copy.removeAttribute(name);
          }
          copy.setAttribute("aria-hidden", "true");
          setImage({ svg: copy.outerHTML, alt, aspect });
        } else {
          setImage({ src: img.currentSrc || img.src, alt, aspect });
        }
      };
      // Typed as Event: on an img | svg union, addEventListener resolves to the
      // generic overload, which will not accept a KeyboardEvent-only listener.
      const onKeyDown = (event: Event) => {
        const { key } = event as KeyboardEvent;
        if (key === "Enter" || key === " ") {
          event.preventDefault();
          open();
        }
      };

      img.addEventListener("click", open);
      img.addEventListener("keydown", onKeyDown);

      cleanups.push(() => {
        img.removeEventListener("click", open);
        img.removeEventListener("keydown", onKeyDown);
        img.removeAttribute("aria-haspopup");
        img.removeAttribute("tabindex");
        for (const [name, value] of [["role", original.role], ["aria-label", original.label]] as const) {
          if (value === null) img.removeAttribute(name);
          else img.setAttribute(name, value);
        }
        delete img.dataset.zoomable;
      });
    });

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !image || dialog.open) return;

    dialog.showModal();
    // showModal() doesn't stop the page behind from scrolling.
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";

    return () => {
      root.style.overflow = previous;
    };
  }, [image]);

  const close = useCallback(() => dialogRef.current?.close(), []);

  return (
    <dialog
      ref={dialogRef}
      className="image-zoom"
      aria-label={image?.alt ? `Enlarged image: ${image.alt}` : "Enlarged image"}
      onClose={() => setImage(null)}
      // Any click closes it, the image included, matching the zoom-out cursor.
      onClick={close}
    >
      {image && (
        <figure className="flex max-h-full max-w-full flex-col items-center gap-3">
          {image.svg ? (
            <div
              role="img"
              aria-label={image.alt}
              style={{ width: `min(92vw, 1280px, calc(82dvh * ${image.aspect}))` }}
              className="max-h-[82dvh] rounded-xl bg-background p-4 shadow-2xl md:p-6"
              // Markup cloned from this page's own rendered prose, which is
              // built only from SVG files committed to this repo.
              dangerouslySetInnerHTML={{ __html: image.svg }}
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element -- reuses the already-loaded prose asset; next/image would refetch a resized copy */
            <img
              src={image.src}
              alt={image.alt}
              // As large as fits: 92% of the width, 1280px, or whatever width
              // keeps the height inside 82% of the viewport, whichever is smallest.
              style={{ width: `min(92vw, 1280px, calc(82dvh * ${image.aspect}))` }}
              className="h-auto max-h-[82dvh] rounded-xl bg-white object-contain shadow-2xl"
            />
          )}
          {image.alt && (
            <figcaption className="max-w-2xl text-center text-sm text-white/80">
              {image.alt}
            </figcaption>
          )}
        </figure>
      )}
      <button
        type="button"
        onClick={close}
        autoFocus
        aria-label="Close enlarged image"
        className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
      >
        <XIcon weight="bold" className="size-5" aria-hidden />
      </button>
    </dialog>
  );
}
