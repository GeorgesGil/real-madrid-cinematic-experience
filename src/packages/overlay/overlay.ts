/**
 * Pure OverlayController seam.
 *
 * This module is deliberately free of React, JSX, and third-party
 * dependencies so both server code and the Node test runner can import it
 * directly (mirroring `motion/preference.ts`). It owns the modal state
 * documented in `docs/animation-system.md`: menu/video focus trapping, Escape
 * handling, scroll locking, and focus restoration. The DOM adapter lives in
 * `use-overlay-controller.ts` and stays thin: every decision below is pure
 * and testable.
 */

/** The two visible phases of an overlay. */
export type OverlayPhase = "closed" | "open";

/** Modal state of an overlay controller. */
export interface OverlayState {
  phase: OverlayPhase;
  /**
   * Selector of the element that receives focus back when the overlay
   * closes; retained after close so the decision survives the transition.
   */
  returnFocusSelector: string | null;
}

/**
 * Deterministic modal actions. `open` records the trigger selector;
 * `keydown` closes on Escape and is a no-op for every other key.
 */
export type OverlayAction =
  | { type: "open"; returnFocusSelector: string }
  | { type: "close" }
  | { type: "keydown"; key: string };

/** The initial, fully closed state. */
export function createOverlayState(): OverlayState {
  return { phase: "closed", returnFocusSelector: null };
}

/**
 * Pure reducer over the overlay state. Never mutates its inputs; returns the
 * same state reference for no-op transitions so `useReducer` can bail out.
 */
export function overlayReducer(
  state: OverlayState,
  action: OverlayAction,
): OverlayState {
  switch (action.type) {
    case "open": {
      if (state.phase === "open") {
        return state;
      }
      return {
        phase: "open",
        returnFocusSelector: action.returnFocusSelector,
      };
    }
    case "close": {
      if (state.phase === "closed") {
        return state;
      }
      return { ...state, phase: "closed" };
    }
    case "keydown": {
      if (state.phase === "closed" || !closeOnKey(action.key)) {
        return state;
      }
      return { ...state, phase: "closed" };
    }
  }
}

/** Whether the page scroll must be locked for this state. */
export function isScrollLocked(state: OverlayState): boolean {
  return state.phase === "open";
}

/** Whether Tab focus must be trapped within the overlay for this state. */
export function shouldTrapFocus(state: OverlayState): boolean {
  return state.phase === "open";
}

/** Whether a key press should close the overlay. */
export function closeOnKey(key: string): boolean {
  return key === "Escape";
}
