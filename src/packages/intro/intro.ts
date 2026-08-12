/**
 * Pure CinematicIntro seam.
 *
 * This module is deliberately free of React, JSX, and third-party
 * dependencies so both server code and the Node test runner can import it
 * directly (mirroring `overlay/overlay.ts`). It owns the opening state
 * documented in `docs/animation-system.md`: the loading/ready/complete
 * phases of the cinematic intro layer plus the reduced-motion decision. The
 * DOM adapter lives in `CinematicIntro.tsx` and stays thin: every decision
 * below is pure and testable.
 */

/** The three phases of the cinematic intro layer. */
export type IntroPhase = "loading" | "ready" | "complete";

/** Intro layer state. */
export interface IntroState {
  phase: IntroPhase;
}

/**
 * Deterministic intro actions. `ready` marks the layer prepared after its
 * static presentation settles; `skip` and `complete` both finish the intro
 * and hand focus to the main content.
 */
export type IntroAction =
  | { type: "ready" }
  | { type: "skip" }
  | { type: "complete" };

/** The initial phase: the layer is loading. */
export function createIntroState(): IntroState {
  return { phase: "loading" };
}

/**
 * Pure reducer over the intro state. Never mutates its inputs; returns the
 * same state reference for redundant transitions so `useReducer` can bail
 * out: `ready` is a no-op once ready or complete, and `skip`/`complete` are
 * no-ops once complete. `skip` and `complete` are both valid from `loading`
 * and `ready`.
 */
export function introReducer(
  state: IntroState,
  action: IntroAction,
): IntroState {
  switch (action.type) {
    case "ready": {
      if (state.phase === "ready" || state.phase === "complete") {
        return state;
      }
      return { phase: "ready" };
    }
    case "skip": {
      if (state.phase === "complete") {
        return state;
      }
      return { phase: "complete" };
    }
    case "complete": {
      if (state.phase === "complete") {
        return state;
      }
      return { phase: "complete" };
    }
  }
}

/**
 * Whether the trace animation may play. The opening scene contract
 * (docs/animation-system.md) allows the resource-aware crest trace only when
 * motion is allowed; under reduced motion the layer shows the immediate
 * static mark with a ≤200ms fade instead.
 */
export function shouldPlayIntro(reducedMotion: boolean): boolean {
  return !reducedMotion;
}

/** Whether the intro has finished and the layer can be removed. */
export function isIntroComplete(state: IntroState): boolean {
  return state.phase === "complete";
}
