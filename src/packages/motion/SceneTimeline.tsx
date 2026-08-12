"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { isReducedMotion } from "./preference.ts";
import { heroSceneQuery } from "./scene-conditions.ts";
import { useMotionPreference } from "./use-motion-preference.ts";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export interface SceneTimelineProps {
  children?: ReactNode;
}

/**
 * Client-only scene adapter. It owns a single GSAP matchMedia context scoped
 * to the scene root and registers the hero pin plus descendant-only parallax
 * under the canonical desktop / no-reduced-motion query; children render as
 * stable markup always, and when the query does not match no ScrollTrigger,
 * pin-spacer, or scrub is ever created. Deliberately not exported from the
 * motion barrel — consumers opt in via `@/packages/motion/SceneTimeline`.
 */
export function SceneTimeline({ children }: SceneTimelineProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const preference = useMotionPreference();

  useGSAP(
    () => {
      const query = heroSceneQuery(isReducedMotion(preference));
      if (query === null) {
        return;
      }
      const root = rootRef.current;
      if (root === null) {
        return;
      }
      const mm = gsap.matchMedia();
      mm.add(query, () => {
        ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: "+=120%",
          pin: root,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });
        gsap.to("[data-parallax]", {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });
      });
      return () => {
        mm.revert();
      };
    },
    { scope: rootRef, dependencies: [preference], revertOnUpdate: true },
  );

  return (
    <div ref={rootRef} data-scene-timeline data-variant="hero">
      {children}
    </div>
  );
}
