/**
 * Pure media-playback decision seam.
 *
 * This module is deliberately free of React, JSX, and third-party
 * dependencies so both server code and the Node test runner can import it
 * directly (mirroring `motion/preference.ts`). It is the single source of
 * truth for the `MediaPlayback` responsibilities documented in
 * `docs/animation-system.md`: intersection-based play/pause, the
 * reduced-motion fallback, and the failure state.
 */

/** The visible playback states a media element can report. */
export type PlaybackState = "idle" | "playing" | "paused" | "error";

export interface PlaybackInput {
  /** True under `prefers-reduced-motion: reduce`. */
  reducedMotion: boolean;
  /** True when the media element intersects the viewport. */
  inView: boolean;
  /** Current element state; `"error"` wins over every other input. */
  state: PlaybackState;
  /**
   * Element readiness (`readyState >= 2`): when `false`, playback is deferred
   * so `play()` is never called while the element cannot start.
   */
  canPlay?: boolean;
}

export type PlaybackDecision =
  | { action: "play"; reason: "in-view" }
  | { action: "pause"; reason: "off-screen" }
  | { action: "none"; reason: "reduced-motion" | "error" | "buffering" };

/**
 * Decides what a media element should do for a given visibility, preference,
 * and readiness snapshot.
 *
 * Order of precedence: reducedMotion > error > !inView > buffering (!canPlay)
 * > play. The first matching rule wins, so the decision is deterministic and
 * the caller never has to reconcile conflicting inputs.
 */
export function decidePlayback(input: PlaybackInput): PlaybackDecision {
  if (input.reducedMotion) {
    return { action: "none", reason: "reduced-motion" };
  }
  if (input.state === "error") {
    return { action: "none", reason: "error" };
  }
  if (!input.inView) {
    return { action: "pause", reason: "off-screen" };
  }
  if (input.canPlay === false) {
    return { action: "none", reason: "buffering" };
  }
  return { action: "play", reason: "in-view" };
}

/**
 * Whether a `video` element should be mounted at all for this preference.
 * `false` means the static poster image is the accessible stable state.
 */
export function shouldRenderVideoElement(reducedMotion: boolean): boolean {
  return !reducedMotion;
}
