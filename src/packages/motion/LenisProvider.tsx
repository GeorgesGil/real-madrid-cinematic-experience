"use client";

import { useEffect, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import { isReducedMotion } from "./preference.ts";
import { useMotionPreference } from "./use-motion-preference.ts";

/*
 * Register ScrollTrigger up front (idempotent) so the scroll sync below never
 * depends on a scene being mounted. Lenis remains an optional deep-import
 * adapter: nothing mounts it unless a consumer opts in.
 */
gsap.registerPlugin(ScrollTrigger);

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
    const onScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", onScroll);
    return () => {
      lenis.off("scroll", onScroll);
      lenis.destroy();
    };
  }, [preference, options]);

  return children;
}
