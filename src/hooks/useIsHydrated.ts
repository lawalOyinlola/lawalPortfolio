"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False on the server and during hydration, true on every client render after
 * that. React swaps the server snapshot for the client one once hydration is
 * done, so there is no setState-in-effect round trip.
 */
export function useIsHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
