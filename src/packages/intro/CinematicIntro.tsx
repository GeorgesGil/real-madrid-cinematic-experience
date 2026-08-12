"use client";

import { useEffect, useReducer, useRef } from "react";

import { isReducedMotion } from "@/packages/motion/preference.ts";
import { useMotionPreference } from "@/packages/motion/use-motion-preference.ts";
import {
  createIntroState,
  introReducer,
  isIntroComplete,
  shouldPlayIntro,
} from "./intro.ts";
import { introCompleteSignal } from "./intro-signal.ts";

/**
 * Client-only cinematic intro adapter over the pure `intro.ts` seam.
 *
 * The static crest mark is always rendered, so it is present in SSR HTML and
 * accessible with JS off and under reduced motion. The CSS trace animation
 * plays only when motion is allowed and ends at `visibility: hidden` with
 * `animation-fill-mode: forwards`, so the layer self-dismisses without JS.
 * Escape (and only Escape) and the visible Skip control dispatch `skip`
 * through the seam; on completion the layer unmounts in the same commit and
 * focus hands off to the main landmark. The dismiss `animationend` (natural
 * trace end or reduced-motion fade — same keyframes name) dispatches
 * `complete`, so the seam and the completion signal observe the real end even
 * though the CSS keeps self-dismissal for JS-off. Deliberately not exported
 * from the intro barrel — consumers opt in via `@/packages/intro/CinematicIntro`.
 */
export function CinematicIntro() {
  const [state, dispatch] = useReducer(
    introReducer,
    undefined,
    createIntroState,
  );
  const preference = useMotionPreference();
  const playTrace = shouldPlayIntro(isReducedMotion(preference));
  const rootRef = useRef<HTMLDivElement>(null);

  // Escape (and only Escape) skips the intro while the layer is live; the
  // listener is symmetric and removed on cleanup.
  useEffect(() => {
    if (isIntroComplete(state)) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dispatch({ type: "skip" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [state]);

  // The CSS dismiss animation ends the layer with or without JS; with JS the
  // `animationend` hands the real end (2.6s natural trace or the 180ms
  // reduced-motion fade — both animate `cinematic-intro-dismiss`) to the
  // seam so downstream consumers start exactly when the intro finishes. The
  // inner trace animation also ends and bubbles, so it is filtered strictly
  // by animation name.
  useEffect(() => {
    const node = rootRef.current;
    if (isIntroComplete(state) || node === null) {
      return;
    }
    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.animationName === "cinematic-intro-dismiss") {
        dispatch({ type: "complete" });
      }
    };
    node.addEventListener("animationend", onAnimationEnd);
    return () => {
      node.removeEventListener("animationend", onAnimationEnd);
    };
  }, [state]);

  // The layer unmounts in the same commit as the phase flip; publish the
  // completion signal and hand focus to the main landmark after removal so
  // keyboard users land on stable content.
  useEffect(() => {
    if (!isIntroComplete(state)) {
      return;
    }
    introCompleteSignal.emit();
    document.querySelector<HTMLElement>("#main")?.focus();
  }, [state]);

  if (isIntroComplete(state)) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className="cinematic-intro"
      data-cinematic-intro
      data-trace={playTrace ? "true" : "false"}
    >
      <div className="cinematic-intro-mark" aria-hidden="true">
        <svg
          className="cinematic-intro-mark-svg"
          viewBox="0 0 96 96"
          fill="none"
        >
          <circle
            cx="48"
            cy="48"
            r="44"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <path
            d="M 48 14 L 56.2 36.7 L 80.3 37.5 L 61.3 52.3 L 68 75.5 L 48 62 L 28 75.5 L 34.7 52.3 L 15.7 37.5 L 39.8 36.7 Z"
            pathLength="1"
          />
        </svg>
      </div>
      <button
        type="button"
        className="cinematic-intro-skip"
        onClick={() => dispatch({ type: "skip" })}
      >
        Skip intro
      </button>
    </div>
  );
}
