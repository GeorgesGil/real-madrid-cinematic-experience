/**
 * Public entry point of the content package.
 *
 * Consumers must import from this module only; the internal modules are not
 * part of the public surface.
 */
export type * from "./types.ts";
export { honours, players, scenes, timelineChapters } from "./data.ts";
export {
  aggregateHonours,
  formatPlayerStats,
  formatShirtNumber,
  formatStatCount,
} from "./transforms.ts";
