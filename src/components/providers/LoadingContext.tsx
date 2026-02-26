"use client";

import { createContext, useContext, useMemo, useState } from "react";

type LoadingContextValue = {
  loading: boolean;
  setLoading: (value: boolean) => void;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
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
