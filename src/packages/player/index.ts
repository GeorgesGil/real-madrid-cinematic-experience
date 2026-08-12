/**
 * Public entry point of the player package.
 *
 * Exports the pure PlayerStory selection seam only. The seam is JSX- and
 * dependency-free, so the Node test runner imports this barrel directly
 * (type stripping), satisfying the test-through-public-entry-points rule.
 * The package deliberately holds no content data: consumers pass the ordered
 * roster ids (e.g. `players.map((player) => player.id)`), preserving the
 * content-data ownership rule. Any future React/DOM adapter must be a deep
 * import, never a barrel re-export (see
 * docs/adr/0002-deep-modules-seams-policy.md).
 */
export type { PlayerStoryAction, PlayerStoryState } from "./player-story.ts";
export {
  createPlayerStory,
  nextPlayer,
  playerStoryReducer,
  previousPlayer,
  selectPlayer,
  selectedId,
} from "./player-story.ts";
