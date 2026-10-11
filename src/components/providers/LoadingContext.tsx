"use client";

import { createContext, useContext, useMemo, useState } from "react";

type LoadingContextValue = {
  loading: boolean;
  setLoading: (value: boolean) => void;
  /** The overlay outlives `loading`: it stays mounted while the columns lift. */
  showPreloader: boolean;
  setShowPreloader: (value: boolean) => void;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  // Set initial state to `true` to show the Preloader intro on initial load
  const [loading, setLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);

  const value = useMemo(
    () => ({ loading, setLoading, showPreloader, setShowPreloader }),
    [loading, showPreloader],
  );

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return ctx;
}
