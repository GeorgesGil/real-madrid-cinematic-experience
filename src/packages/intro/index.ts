/**
 * Public entry point of the intro package.
 *
 * Exports the pure CinematicIntro seams only: `intro.ts` owns the
 * loading/ready/complete phase state and `intro-signal.ts` owns the
 * completion handoff signal. Both are JSX- and dependency-free, so the Node
 * test runner imports this barrel directly (type stripping), satisfying the
 * test-through-public-entry-points rule. The `CinematicIntro` component and
 * the `useIntroComplete` hook (`use-intro-complete.ts`) are client-only
 * adapters and are deliberately NOT re-exported here: consumers must opt in
 * via `@/packages/intro/CinematicIntro` / `@/packages/intro/use-intro-complete`
 * so no client JS enters a route bundle until the intro is actually mounted
 * (deep-import boundary, see docs/adr/0002-deep-modules-seams-policy.md).
 */
export type { IntroAction, IntroPhase, IntroState } from "./intro.ts";
export {
  createIntroState,
  introReducer,
  isIntroComplete,
  shouldPlayIntro,
} from "./intro.ts";
export type { IntroCompleteSignal } from "./intro-signal.ts";
export {
  createIntroCompleteSignal,
  introCompleteSignal,
} from "./intro-signal.ts";
