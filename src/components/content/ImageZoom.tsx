"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { XIcon } from "@phosphor-icons/react";

/** `aspect` is width / height, read from the rendered inline image. */
type ZoomedImage = { src: string; alt: string; aspect: number };

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
    const images = document.querySelectorAll<HTMLImageElement>("[data-prose] img");
    const cleanups: (() => void)[] = [];

    images.forEach((img) => {
      if (img.dataset.zoomable === "true") return;
      img.dataset.zoomable = "true";
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-haspopup", "dialog");
      img.setAttribute("aria-label", `Enlarge image: ${img.alt || "figure"}`);

      const open = () => {
        // Measured from the rendered image, not naturalWidth: an SVG with only
        // a viewBox has no intrinsic size, so it would open *smaller* than inline.
        const rect = img.getBoundingClientRect();
        const aspect = rect.height > 0 ? rect.width / rect.height : 16 / 9;
        setImage({ src: img.currentSrc || img.src, alt: img.alt, aspect });
      };
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      };

      img.addEventListener("click", open);
      img.addEventListener("keydown", onKeyDown);

      cleanups.push(() => {
        img.removeEventListener("click", open);
        img.removeEventListener("keydown", onKeyDown);
        img.removeAttribute("role");
        img.removeAttribute("aria-haspopup");
        img.removeAttribute("aria-label");
        img.removeAttribute("tabindex");
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
          {/* eslint-disable-next-line @next/next/no-img-element -- reuses the already-loaded prose asset; next/image would refetch a resized copy */}
          <img
            src={image.src}
            alt={image.alt}
            // As large as fits: 92% of the width, 1280px, or whatever width
            // keeps the height inside 82% of the viewport, whichever is smallest.
            style={{ width: `min(92vw, 1280px, calc(82dvh * ${image.aspect}))` }}
            className="h-auto max-h-[82dvh] rounded-xl bg-white object-contain shadow-2xl"
          />
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
