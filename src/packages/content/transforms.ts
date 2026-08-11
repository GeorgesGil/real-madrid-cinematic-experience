import type { Honour, HonourCategory, Player } from "./types.ts";

/**
 * Pure, deterministic transforms for the content package. These functions keep
 * no module state and never embed domain totals as literals — aggregation
 * values are always read from the supplied data.
 */

/** Formats a squad number as a zero-padded two-digit string. */
export function formatShirtNumber(shirtNumber: number): string {
  return shirtNumber.toString().padStart(2, "0");
}

/**
 * Formats a stat count with en-US grouping, deterministic across
 * environments (e.g. 1250 -> "1,250").
 */
export function formatStatCount(count: number): string {
  return new Intl.NumberFormat("en-US").format(count);
}

/** Display record produced for an editorial player. */
export interface PlayerStatsDisplay {
  name: string;
  position: Player["position"];
  nationality: string;
  shirtNumber: string;
  appearances: string;
  goals: string;
}

/** Composes the display record for an editorial player. */
export function formatPlayerStats(player: Player): PlayerStatsDisplay {
  return {
    name: player.name,
    position: player.position,
    nationality: player.nationality,
    shirtNumber: formatShirtNumber(player.shirtNumber),
    appearances: formatStatCount(player.appearances),
    goals: formatStatCount(player.goals),
  };
}

/** Per-category honour counts and derived totals. */
export interface HonoursAggregate {
  byCategory: Record<HonourCategory, number>;
  /** Sum of all per-category counts. */
  total: number;
  /** Current European Cup total, read from the `european-cup` category. */
  europeanCupTotal: number;
}

/** Aggregates honours into per-category counts and totals from data. */
export function aggregateHonours(honours: readonly Honour[]): HonoursAggregate {
  const byCategory: Record<HonourCategory, number> = {
    "european-cup": 0,
    "club-world-cup": 0,
    "super-cup": 0,
    league: 0,
    "domestic-cup": 0,
  };

  for (const honour of honours) {
    byCategory[honour.category] += honour.count;
  }

  const total = Object.values(byCategory).reduce((sum, count) => sum + count, 0);

  return {
    byCategory,
    total,
    europeanCupTotal: byCategory["european-cup"],
  };
}
