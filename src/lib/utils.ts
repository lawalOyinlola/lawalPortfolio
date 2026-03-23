import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BRAND } from "@/app/constants/brand";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleEmailClick = (e?: React.MouseEvent<HTMLElement>) => {
  if (e) e.preventDefault();
  if (typeof window === "undefined") return;
  const subject = encodeURIComponent("Inquiry from Portfolio Website");
  const body = encodeURIComponent(
    "Hi there,\n\nI am reaching out to you from your portfolio website concerning...",
  );
  window.location.href = `mailto:${BRAND.email}?subject=${subject}&body=${body}`;
};

/**
 * Handles directional keyboard navigation (Arrow keys) within a container.
 */
export const handleDirectionalFocus = (
  e: React.KeyboardEvent | KeyboardEvent,
  container: HTMLElement | null,
  orientation: "horizontal" | "vertical" | "both" = "both",
  loop: boolean = true,
  onFocusChange?: (el: HTMLElement) => void,
) => {
  if (!container) return;

  const focusableElements = Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => {
    // Basic visibility check
    const style = window.getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden";
  }) as HTMLElement[];

  const currentIndex = focusableElements.indexOf(
    document.activeElement as HTMLElement,
  );
  if (currentIndex === -1) return;

  let nextIndex = -1;

  switch (e.key) {
    case "ArrowRight":
    case "ArrowDown":
      if (
        (e.key === "ArrowRight" && orientation !== "vertical") ||
        (e.key === "ArrowDown" && orientation !== "horizontal")
      ) {
        nextIndex = currentIndex + 1;
        if (loop && nextIndex >= focusableElements.length) nextIndex = 0;
      }
      break;
    case "ArrowLeft":
    case "ArrowUp":
      if (
        (e.key === "ArrowLeft" && orientation !== "vertical") ||
        (e.key === "ArrowUp" && orientation !== "horizontal")
      ) {
        nextIndex = currentIndex - 1;
        if (loop && nextIndex < 0) nextIndex = focusableElements.length - 1;
      }
      break;
  }

  if (nextIndex >= 0 && nextIndex < focusableElements.length) {
    e.preventDefault();
    const nextEl = focusableElements[nextIndex];
    nextEl.focus();
    if (onFocusChange) onFocusChange(nextEl);
  }
};
