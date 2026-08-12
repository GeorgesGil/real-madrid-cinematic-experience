"use client";

import { useSyncExternalStore } from "react";

import { introCompleteSignal } from "./intro-signal.ts";

/**
 * Client-only adapter over the pure intro-completion signal seam. Reads the
 * module-scope `introCompleteSignal` singleton through `useSyncExternalStore`
 * with the same snapshot for client and server, so it is SSR-safe with no
 * effects and no DOM access. `CinematicIntro` publishes `complete` (natural
 * end or skip); consumers such as `useApertureReveal` gate their animation
 * setup on the returned boolean.
 *
 * Deliberately not exported from the intro barrel — consumers opt in via
 * `@/packages/intro/use-intro-complete` (ADR 0002 §1).
 */
export function useIntroComplete(): boolean {
  return useSyncExternalStore(
    introCompleteSignal.subscribe,
    introCompleteSignal.read,
    introCompleteSignal.read,
  );
}
