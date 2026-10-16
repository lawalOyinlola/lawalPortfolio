"use client";

import { useSyncExternalStore } from "react";

// Whether the page underneath may start its entrance animations. It is open
// except during a page transition (see PageTransition): from the moment the
// route changes until the grid is nearly off the screen, so a new page plays
// its entrance where it can be seen instead of behind the cover. Pages that
// are not reached through a transition (a first load, a link opened in a new
// tab, reduced motion) never close it, so nothing needs to know which is which.
let open = true;
const listeners = new Set<() => void>();

export function setPageRevealed(value: boolean) {
  if (open === value) return;
  open = value;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** False while a page transition is still covering the new page. */
export function usePageRevealed() {
  return useSyncExternalStore(
    subscribe,
    () => open,
    () => true,
  );
}
