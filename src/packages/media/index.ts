/**
 * Public entry point of the media package.
 *
 * Exports the cinematic image/video primitives and the pure playback seam.
 * Note that `playback.ts` must be imported directly by `node --test` suites
 * (same convention as `motion/preference.ts`): it is JSX-free, while the
 * barrel re-exports `.tsx` modules that Node's type stripping cannot parse.
 */
export { CinematicImage } from "./CinematicImage.tsx";
export { CinematicVideo } from "./CinematicVideo.tsx";
export type {
  PlaybackDecision,
  PlaybackInput,
  PlaybackState,
} from "./playback.ts";
export { decidePlayback, shouldRenderVideoElement } from "./playback.ts";
