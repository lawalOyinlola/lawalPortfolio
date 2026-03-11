"use client";

import { useEffect } from "react";

/**
 * Shared counter for scroll locks.
 * Using a simple singleton variable since we always target `document.body`.
 */
let lockCount = 0;
let originalOverflow: string | null = null;

export const useScrollLock = (isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) return;

    // Apply lock only if this is the first one
    if (lockCount === 0) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    lockCount++;

    return () => {
      // Decrement counter on cleanup
      lockCount = Math.max(0, lockCount - 1);
      // Remove lock only if no other components are holding it
      if (lockCount === 0) {
        document.body.style.overflow = originalOverflow ?? "";
        originalOverflow = null;
      }
    };
  }, [isOpen]);
};
