/**
 * Pure PlayerStory selection seam.
 *
 * This module is deliberately free of React, JSX, and third-party
 * dependencies so both server code and the Node test runner can import it
 * directly (mirroring `motion/preference.ts`). It owns the selected-player
 * state documented in `docs/animation-system.md`: scroll, buttons, touch, and
 * keyboard are adapters at the same seam.
 */

/** Selection state of an editorial player story. */
export interface PlayerStoryState {
  /** Ordered roster of player ids, fixed for the lifetime of the story. */
  ids: readonly string[];
  /** Index of the selected player in `ids`, or `null` when none is selected. */
  selectedIndex: number | null;
}

/**
 * Deterministic selection actions. `select` targets a stable player id so
 * adapters never depend on array position; `next`/`previous` wrap around the
 * roster ends.
 */
export type PlayerStoryAction =
  | { type: "select"; id: string }
  | { type: "next" }
  | { type: "previous" };

/**
 * Creates the initial story state for an ordered roster. The caller's array
 * is copied, never aliased, so later mutation by the caller cannot leak into
 * the seam.
 */
export function createPlayerStory(ids: readonly string[]): PlayerStoryState {
  return { ids: [...ids], selectedIndex: null };
}

/**
 * Pure reducer over the story state. Never mutates its inputs; returns the
 * same state reference for no-op transitions so `useReducer` can bail out.
 *
 * - `select` with an id in the roster selects it; an unknown id resets the
 *   selection to `null`.
 * - `next` from no selection selects the first player; at the last player it
 *   wraps to the first. An empty roster is a no-op.
 * - `previous` from no selection selects the last player; at the first player
 *   it wraps to the last. An empty roster is a no-op.
 */
export function playerStoryReducer(
  state: PlayerStoryState,
  action: PlayerStoryAction,
): PlayerStoryState {
  switch (action.type) {
    case "select": {
      const selectedIndex = state.ids.indexOf(action.id);
      if (selectedIndex === -1) {
        if (state.selectedIndex === null) {
          return state;
        }
        return { ids: state.ids, selectedIndex: null };
      }
      if (state.selectedIndex === selectedIndex) {
        return state;
      }
      return { ids: state.ids, selectedIndex };
    }
    case "next": {
      if (state.ids.length === 0) {
        return state;
      }
      if (state.selectedIndex === null) {
        return { ids: state.ids, selectedIndex: 0 };
      }
      const nextIndex = (state.selectedIndex + 1) % state.ids.length;
      return {
        ids: state.ids,
        selectedIndex: nextIndex,
      };
    }
    case "previous": {
      if (state.ids.length === 0) {
        return state;
      }
      if (state.selectedIndex === null) {
        return {
          ids: state.ids,
          selectedIndex: state.ids.length - 1,
        };
      }
      const previousIndex =
        (state.selectedIndex - 1 + state.ids.length) % state.ids.length;
      return {
        ids: state.ids,
        selectedIndex: previousIndex,
      };
    }
  }
}

/** Selects the player with the given id, or clears the selection. */
export function selectPlayer(
  state: PlayerStoryState,
  id: string,
): PlayerStoryState {
  return playerStoryReducer(state, { type: "select", id });
}

/** Moves the selection forward, wrapping to the first player. */
export function nextPlayer(state: PlayerStoryState): PlayerStoryState {
  return playerStoryReducer(state, { type: "next" });
}

/** Moves the selection backward, wrapping to the last player. */
export function previousPlayer(state: PlayerStoryState): PlayerStoryState {
  return playerStoryReducer(state, { type: "previous" });
}

/** The id of the selected player, or `null` when none is selected. */
export function selectedId(state: PlayerStoryState): string | null {
  if (state.selectedIndex === null) {
    return null;
  }
  return state.ids[state.selectedIndex] ?? null;
}
