"use client";

import { useEffect } from "react";

/**
 * Keeps every `[data-shot-id]` checkbox in sync, on one page load and across
 * reloads.
 *
 * A lab guide marks the same screenshot in two places: inline, right where
 * you'd take it ("capture for your report"), and again in the Appendix C
 * table. Both carry the same `data-shot-id`, so ticking either one ticks the
 * other immediately, and the state is written to localStorage so it survives
 * a reload. Storage is per-viewer, per-page and best-effort: a private window
 * or blocked storage just means it doesn't persist, never that the checkbox
 * stops working for this page view.
 *
 * Same attach-to-rendered-DOM approach as CodeCopyButtons and ImageZoom: the
 * markdown pipeline emits an HTML string, so there's no React element to wrap.
 */
export default function ChecklistPersistence() {
  useEffect(() => {
    const boxes = document.querySelectorAll<HTMLInputElement>(
      "[data-prose] input[type=\"checkbox\"][data-shot-id]",
    );
    if (boxes.length === 0) return;

    const storageKey = `checklist:${window.location.pathname}`;

    const read = (): Record<string, boolean> => {
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) return {};
        const parsed: unknown = JSON.parse(raw);
        // Only a plain object is safe to index; anything else (null, an array,
        // a primitive, tampered data) resets to empty.
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? (parsed as Record<string, boolean>)
          : {};
      } catch {
        return {};
      }
    };

    const write = (state: Record<string, boolean>) => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(state));
      } catch {
        // Private window, storage disabled, or quota exceeded — the checkbox
        // still works for this page view, it just won't survive a reload.
      }
    };

    // Group every checkbox that shares an ID — inline note + Appendix C row —
    // so one toggle can update all of them.
    const groups = new Map<string, HTMLInputElement[]>();
    boxes.forEach((box) => {
      const id = box.dataset.shotId;
      if (!id) return;
      const group = groups.get(id);
      if (group) group.push(box);
      else groups.set(id, [box]);
    });

    const state = read();
    const cleanups: (() => void)[] = [];

    groups.forEach((group, id) => {
      if (state[id]) {
        for (const box of group) box.checked = true;
      }

      const onChange = (event: Event) => {
        const source = event.currentTarget as HTMLInputElement;
        for (const box of group) {
          if (box !== source) box.checked = source.checked;
        }
        const next = read();
        if (source.checked) {
          next[id] = true;
        } else {
          delete next[id];
        }
        write(next);
      };

      for (const box of group) {
        box.addEventListener("change", onChange);
        cleanups.push(() => box.removeEventListener("change", onChange));
      }
    });

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, []);

  return null;
}
