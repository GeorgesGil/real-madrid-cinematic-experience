import type {
  Honour,
  Player,
  Scene,
  TimelineChapter,
} from "./types.ts";

/**
 * Deeply freezes an object graph and returns the same reference, guarding
 * against accidental fixture mutation at runtime.
 */
function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze((value as unknown as Record<string, unknown>)[key]);
    }
  }
  return value;
}

/**
 * Representative fixture data for the cinematic timeline.
 *
 * The data is intentionally representative and independent: it does not use
 * official assets, player likenesses, or site copy. The European Cup total is
 * defined here once and must never be duplicated in UI or transform code.
 */

/** The seven scenes of the cinematic timeline in narrative order. */
export const scenes = deepFreeze([
  {
    id: "crest",
    order: 1,
    title: "Crest",
    kicker: "Identity",
    summary:
      "The crest tells the story of the club: the crown from the royal title and the initials at its heart.",
  },
  {
    id: "bernabeu",
    order: 2,
    title: "Bernabéu",
    kicker: "Home",
    summary:
      "Santiago Bernabéu Stadium has been the club's home since 1947, the stage for its greatest nights.",
  },
  {
    id: "team",
    order: 3,
    title: "Team",
    kicker: "Squad",
    summary:
      "The squad carries the shirt every week — a balance of academy talent and world-class signings.",
  },
  {
    id: "european-royalty",
    order: 4,
    title: "European Royalty",
    kicker: "Legacy",
    summary:
      "No club has lifted the European Cup more times; each trophy renews the claim to royalty.",
  },
  {
    id: "history",
    order: 5,
    title: "History",
    kicker: "Timeline",
    summary:
      "From the founding years to the modern era, the club's history is written in milestones.",
  },
  {
    id: "moments",
    order: 6,
    title: "Moments",
    kicker: "Magic",
    summary:
      "The moments that defined a century — comebacks, finals, and nights that become legend.",
  },
  {
    id: "future",
    order: 7,
    title: "Future",
    kicker: "Tomorrow",
    summary:
      "The next chapter begins at the renovated Bernabéu, where tradition meets the new century.",
  },
] as const satisfies readonly Scene[]);

/** A small representative editorial squad with realistic, non-endorsed stats. */
export const players = deepFreeze([
  {
    id: "player-01",
    name: "Marco Vela",
    position: "goalkeeper",
    shirtNumber: 1,
    appearances: 289,
    goals: 0,
    nationality: "Spain",
  },
  {
    id: "player-02",
    name: "Rafael Duarte",
    position: "defender",
    shirtNumber: 3,
    appearances: 312,
    goals: 11,
    nationality: "Brazil",
  },
  {
    id: "player-03",
    name: "Luka Petrovic",
    position: "midfielder",
    shirtNumber: 5,
    appearances: 418,
    goals: 47,
    nationality: "Croatia",
  },
  {
    id: "player-04",
    name: "Andres Salgado",
    position: "forward",
    shirtNumber: 9,
    appearances: 356,
    goals: 174,
    nationality: "Argentina",
  },
  {
    id: "player-05",
    name: "Theo Marchand",
    position: "midfielder",
    shirtNumber: 8,
    appearances: 401,
    goals: 39,
    nationality: "France",
  },
  {
    id: "player-06",
    name: "Kenji Watanabe",
    position: "defender",
    shirtNumber: 17,
    appearances: 198,
    goals: 4,
    nationality: "Japan",
  },
] as const satisfies readonly Player[]);

/**
 * One honour lineage per category. The `european-cup` count is the single
 * source of truth for the current European Cup total.
 */
export const honours = deepFreeze([
  {
    id: "honour-european-cup",
    category: "european-cup",
    title: "European Cup",
    count: 15,
    yearFirst: 1956,
    yearLast: 2024,
  },
  {
    id: "honour-club-world-cup",
    category: "club-world-cup",
    title: "FIFA Club World Cup",
    count: 9,
    yearFirst: 1960,
    yearLast: 2024,
  },
  {
    id: "honour-super-cup",
    category: "super-cup",
    title: "UEFA Super Cup",
    count: 6,
    yearFirst: 2002,
    yearLast: 2024,
  },
  {
    id: "honour-league",
    category: "league",
    title: "La Liga",
    count: 36,
    yearFirst: 1932,
    yearLast: 2024,
  },
  {
    id: "honour-domestic-cup",
    category: "domestic-cup",
    title: "Copa del Rey",
    count: 20,
    yearFirst: 1905,
    yearLast: 2023,
  },
] as const satisfies readonly Honour[]);

/** Representative milestones in ascending chronological order. */
export const timelineChapters = deepFreeze([
  {
    id: "chapter-1902",
    order: 1,
    year: 1902,
    title: "Foundation",
    summary:
      "The club is founded as Madrid Football Club, beginning the journey to the Bernabéu era.",
  },
  {
    id: "chapter-1920",
    order: 2,
    year: 1920,
    title: "Royal Title",
    summary:
      "King Alfonso XIII grants the club the 'Real' title, sealing the royal connection in the crest.",
  },
  {
    id: "chapter-1956",
    order: 3,
    year: 1956,
    title: "First European Crown",
    summary:
      "The first European Cup is lifted in Paris, the start of the club's European dynasty.",
  },
  {
    id: "chapter-1966",
    order: 4,
    year: 1966,
    title: "Six European Cups",
    summary:
      "The sixth European Cup completes a golden era and a run of five titles in a row.",
  },
  {
    id: "chapter-1998",
    order: 5,
    year: 1998,
    title: "La Séptima",
    summary:
      "The seventh European Cup returns after 32 years, ending the longest wait in club history.",
  },
  {
    id: "chapter-2002",
    order: 6,
    year: 2002,
    title: "La Novena",
    summary:
      "The ninth European Cup is won in Glasgow, in a final that entered the club's folklore.",
  },
  {
    id: "chapter-2014",
    order: 7,
    year: 2014,
    title: "La Décima",
    summary:
      "The tenth European Cup is claimed in Lisbon, completing a twelve-year quest.",
  },
  {
    id: "chapter-2018",
    order: 8,
    year: 2018,
    title: "Three in a Row",
    summary:
      "A third consecutive European Cup crowns a dominant run across 2016, 2017, and 2018.",
  },
  {
    id: "chapter-2022",
    order: 9,
    year: 2022,
    title: "Decimocuarta",
    summary:
      "The fourteenth European Cup is won in Paris after a run of dramatic comebacks.",
  },
  {
    id: "chapter-2024",
    order: 10,
    year: 2024,
    title: "Decimoquinta",
    summary:
      "The fifteenth European Cup — the current total — is lifted in London.",
  },
] as const satisfies readonly TimelineChapter[]);
