/**
 * Pure SceneTimeline condition seam.
 *
 * This module is deliberately free of React, JSX, and third-party
 * dependencies so both server code and the Node test runner can import it
 * directly (mirroring `preference.ts`). It is the single source of truth for
 * when a scene may register scrub/pin choreography: desktop viewport width and
 * `prefers-reduced-motion: no-preference`.
 */

/** Minimum viewport width (CSS px) for the pinned hero scene. */
export const HERO_MIN_WIDTH = 768;

/**
 * Whether desktop scrolling choreography is allowed: motion is not reduced and
 * the viewport is at least `HERO_MIN_WIDTH` wide. `minWidth` defaults to the
 * canonical threshold so callers can pass their measured viewport width.
 */
export function desktopScrubAllowed(
  reducedMotion: boolean,
  minWidth: number = HERO_MIN_WIDTH,
): boolean {
  return !reducedMotion && minWidth >= HERO_MIN_WIDTH;
}

/**
 * The media query under which the hero scene registers its ScrollTriggers, or
 * `null` when no choreography may run (reduced motion, or a viewport below
 * `HERO_MIN_WIDTH`). Reduced motion is enforced in the query itself so the
 * pin-spacer can never be created under `prefers-reduced-motion: reduce`.
 */
export function heroSceneQuery(
  reducedMotion: boolean,
  minWidth: number = HERO_MIN_WIDTH,
): string | null {
  if (!desktopScrubAllowed(reducedMotion, minWidth)) {
    return null;
  }
  return `(min-width: ${HERO_MIN_WIDTH}px) and (prefers-reduced-motion: no-preference)`;
}
