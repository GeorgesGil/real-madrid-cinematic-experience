/**
 * Pure intro-completion signal seam.
 *
 * This module is deliberately free of React, JSX, and DOM access (mirroring
 * `intro.ts`), so both server code and the Node test runner can import it
 * directly. It is the handoff seam documented in `docs/animation-system.md`:
 * `CinematicIntro` publishes when the opening reaches `complete` (natural end
 * or skip) and `useIntroComplete` — the deep client adapter in
 * `use-intro-complete.ts` — consumes that value to gate the aperture reveal.
 *
 * The module-scope singleton below is the shared instance: the emitter and
 * every consumer subscribe to the same latch, so a `complete` published by
 * `CinematicIntro` (even after the layer unmounts) stays visible to hooks
 * that mount later in the tree, like the hero reveal adapter.
 */

/** Listener notified once when the intro completion latches. */
export type IntroCompleteListener = () => void;

/**
 * The intro-completion signal contract. `emit()` latches the completion once
 * and notifies current subscribers; later subscribers observe the latched
 * value through `read()`.
 */
export interface IntroCompleteSignal {
  /** Registers a listener; returns an unsubscribe that removes it. */
  subscribe(listener: IntroCompleteListener): () => void;
  /** Latches completion (idempotent) and notifies current subscribers. */
  emit(): void;
  /** Whether the intro has completed. Stable until the next `emit()`. */
  read(): boolean;
}

/** Creates an independent intro-completion signal. */
export function createIntroCompleteSignal(): IntroCompleteSignal {
  let complete = false;
  const listeners: IntroCompleteListener[] = [];

  return {
    subscribe(listener) {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      };
    },
    emit() {
      if (complete) {
        return;
      }
      complete = true;
      for (const listener of listeners) {
        listener();
      }
    },
    read() {
      return complete;
    },
  };
}

/**
 * The shared intro-completion signal. `CinematicIntro` emits on completion;
 * `use-intro-complete.ts` reads it. One module-scope instance guarantees the
 * emitter and consumers observe the same latch.
 */
export const introCompleteSignal = createIntroCompleteSignal();
