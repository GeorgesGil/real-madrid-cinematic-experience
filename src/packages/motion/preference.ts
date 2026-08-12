/**
 * Pure motion-preference seam.
 *
 * This module is deliberately free of React, JSX, and third-party
 * dependencies so both server code and the Node test runner can import it
 * directly (mirroring `content/transforms.ts`). It is the single source of
 * truth for the reduced-motion decision shared between CSS and JavaScript.
 */

/** The two states of the `prefers-reduced-motion` media feature. */
export type MotionPreference = "reduce" | "no-preference";

/** Canonical media query for the reduced-motion feature. */
export const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Server-side default, mirroring the CSS baseline: without a stated
 * preference, smooth scrolling and motion stay enabled.
 */
export const SSR_MOTION_PREFERENCE: MotionPreference = "no-preference";

/**
 * Maps a `matchMedia` result (or its absence, e.g. on the server) to the
 * stable preference value.
 */
export function resolveMotionPreference(
  matches: boolean | null | undefined,
): MotionPreference {
  if (matches === null || matches === undefined) {
    return SSR_MOTION_PREFERENCE;
  }
  return matches ? "reduce" : "no-preference";
}

/** True when the preference requires motion to be removed. */
export function isReducedMotion(preference: MotionPreference): boolean {
  return preference === "reduce";
}

/**
 * Parses a raw `prefers-reduced-motion` media query value, case-insensitive,
 * into the canonical preference. Returns `null` for anything else.
 */
export function parseMotionPreference(query: string): MotionPreference | null {
  const match =
    /^\s*prefers-reduced-motion\s*:\s*(reduce|no-preference)\s*$/i.exec(
      query,
    );
  if (match === null) {
    return null;
  }
  return match[1].toLowerCase() === "reduce" ? "reduce" : "no-preference";
}
