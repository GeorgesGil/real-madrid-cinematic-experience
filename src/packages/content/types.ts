/**
 * Domain model for the cinematic timeline content package.
 *
 * Every type here uses erasable-only syntax (no enums, namespaces, or
 * parameter properties) so that Node's type stripping can execute the module
 * directly at runtime.
 */

/** Identifier of a scene in the cinematic timeline. */
export type SceneId =
  | "crest"
  | "bernabeu"
  | "team"
  | "european-royalty"
  | "history"
  | "moments"
  | "future";

/** A semantically complete chapter of the cinematic timeline. */
export interface Scene {
  /** Stable identifier, unique across the timeline. */
  id: SceneId;
  /** Position in the narrative scroll order (1-based, sequential). */
  order: number;
  /** Short editorial heading. */
  title: string;
  /** Optional eyebrow/kicker label shown above the title. */
  kicker?: string;
  /** Accessible stable-state text shown when animation is unavailable. */
  summary: string;
}

/** On-pitch role of an editorial player. */
export type Position = "goalkeeper" | "defender" | "midfielder" | "forward";

/** Large-format editorial player presentation contract. */
export interface Player {
  /** Stable identifier, unique across the squad. */
  id: string;
  /** Display name. */
  name: string;
  /** On-pitch role. */
  position: Position;
  /** Squad number, rendered zero-padded in display contexts. */
  shirtNumber: number;
  /** Total appearances. */
  appearances: number;
  /** Total goals scored. */
  goals: number;
  /** Country the player represents. */
  nationality: string;
}

/** Trophy category used for honours aggregation. */
export type HonourCategory =
  | "european-cup"
  | "club-world-cup"
  | "super-cup"
  | "league"
  | "domestic-cup";

/** A trophy lineage with its accumulated count. */
export interface Honour {
  /** Stable identifier, unique across honours. */
  id: string;
  /** Aggregation category. */
  category: HonourCategory;
  /** Display name of the competition. */
  title: string;
  /** Number of titles won. */
  count: number;
  /** First year the trophy was won. */
  yearFirst?: number;
  /** Most recent year the trophy was won. */
  yearLast?: number;
}

/** A decade/era milestone consumed by the History scene. */
export interface TimelineChapter {
  /** Stable identifier, unique across chapters. */
  id: string;
  /** Chronological position (ascending). */
  order: number;
  /** Calendar year of the milestone. */
  year: number;
  /** Short editorial heading. */
  title: string;
  /** Accessible stable-state text for the milestone. */
  summary: string;
}
