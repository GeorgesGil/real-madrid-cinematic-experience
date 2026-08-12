"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

import { isReducedMotion } from "./preference.ts";
import { useMotionPreference } from "./use-motion-preference.ts";

/**
 * Options accepted by the installed Lenis build, derived from the constructor
 * signature so the surface adapts to the pinned `lenis` version.
 */
type LenisOptions = ConstructorParameters<typeof Lenis>[0];

export interface LenisProviderProps {
  children: ReactNode;
  /** Extra Lenis options merged over the auto-RAF default. */
  options?: LenisOptions;
}

/**
 * Optional smooth-scroll adapter. Only mounts when motion is allowed; under
 * reduced motion it renders children untouched and never touches `lenis`.
 * Deliberately not exported from the motion barrel — consumers opt in via
 * `@/packages/motion/LenisProvider`.
 */
export function LenisProvider({ children, options }: LenisProviderProps) {
  const preference = useMotionPreference();

  useEffect(() => {
    if (isReducedMotion(preference)) {
      return;
    }
    const lenis = new Lenis({ autoRaf: true, ...options });
    return () => {
      lenis.destroy();
    };
  }, [preference, options]);

  return children;
}
