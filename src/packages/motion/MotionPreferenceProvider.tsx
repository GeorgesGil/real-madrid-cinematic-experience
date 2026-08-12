"use client";

import { useEffect, type ReactNode } from "react";

import { isReducedMotion } from "./preference.ts";
import { useMotionPreference } from "./use-motion-preference.ts";

export interface MotionPreferenceProviderProps {
  children: ReactNode;
}

/**
 * Reflects the resolved motion preference on `document.documentElement` via
 * the `data-reduced-motion` attribute after hydration. First paint remains
 * covered by the existing CSS media query, so no flash of motion occurs.
 * Server children pass through as props and stay server components.
 */
export function MotionPreferenceProvider({
  children,
}: MotionPreferenceProviderProps) {
  const preference = useMotionPreference();

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(
      isReducedMotion(preference),
    );
    return () => {
      delete document.documentElement.dataset.reducedMotion;
    };
  }, [preference]);

  return children;
}
