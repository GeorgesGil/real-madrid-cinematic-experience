"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { useIntroComplete } from "@/packages/intro/use-intro-complete";
import { isReducedMotion } from "@/packages/motion/preference.ts";
import { heroSceneQuery } from "@/packages/motion/scene-conditions.ts";
import { useMotionPreference } from "@/packages/motion/use-motion-preference.ts";

gsap.registerPlugin(useGSAP);

/**
 * Self-contained client adapter that drives the Monumental Aperture reveal.
 *
 * Always mounted inside `ApertureGeometry`, whose static mask markup renders
 * in SSR HTML regardless of motion or viewport. The reveal waits for the
 * intro-completion signal (`useIntroComplete`): no GSAP context is created
 * before the opening reaches `complete` (natural end or skip), so the
 * aperture never fires behind the intro layer. On desktop viewports with
 * motion allowed (the canonical `heroSceneQuery`) a one-shot GSAP timeline
 * enlarges the mask once and dissolves it into the full scene. When the
 * query is null (intro incomplete, reduced motion, or a sub-768px viewport)
 * the adapter returns before creating any GSAP context, leaving the static
 * mask composition untouched. Browser globals are only ever touched inside
 * the useGSAP effect, never during render. Deliberately not exported from
 * the hero barrel — consumers opt in via `@/packages/hero/use-aperture-reveal`.
 */
export function useApertureReveal() {
  const preference = useMotionPreference();
  const introComplete = useIntroComplete();

  useGSAP(
    () => {
      if (!introComplete) {
        return;
      }
      const query = heroSceneQuery(isReducedMotion(preference));
      if (query === null) {
        return;
      }
      const mm = gsap.matchMedia();
      mm.add(query, () => {
        gsap.timeline().to("[data-aperture-mask]", {
          scale: 1.35,
          autoAlpha: 0,
          duration: 1.2,
          ease: "power2.inOut",
        });
      });
      return () => {
        mm.revert();
      };
    },
    {
      dependencies: [preference, introComplete],
      revertOnUpdate: true,
    },
  );
}
