"use client";

import { createContext, useContext, useMemo, useState } from "react";

type LoadingContextValue = {
  loading: boolean;
  setLoading: (value: boolean) => void;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  // Set initial state to `false` to skip the Preloader intro and show content
  // immediately (see AppLayout/Preloader).
  const [loading, setLoading] = useState(true);

  const value = useMemo(() => ({ loading, setLoading }), [loading]);

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
