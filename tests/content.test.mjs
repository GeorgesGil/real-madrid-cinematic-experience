import assert from "node:assert/strict";
import test from "node:test";

import {
  aggregateHonours,
  formatPlayerStats,
  formatShirtNumber,
  formatStatCount,
  honours,
  players,
  scenes,
  timelineChapters,
} from "../src/packages/content/index.ts";

const NARRATIVE_ORDER = [
  "crest",
  "bernabeu",
  "team",
  "european-royalty",
  "history",
  "moments",
  "future",
];

test("scenes cover the seven narrative scenes in order with sequential orders", () => {
  assert.equal(scenes.length, 7);
  assert.deepEqual(
    scenes.map((scene) => scene.id),
    NARRATIVE_ORDER,
  );
  const uniqueIds = new Set(scenes.map((scene) => scene.id));
  assert.equal(uniqueIds.size, scenes.length);
  scenes.forEach((scene, index) => {
    assert.equal(scene.order, index + 1);
    assert.ok(scene.title.length > 0);
    assert.ok(scene.summary.length > 0);
  });
});

test("fixtures are deeply frozen", () => {
  assert.ok(Object.isFrozen(scenes));
  assert.ok(Object.isFrozen(players));
  assert.ok(Object.isFrozen(honours));
  assert.ok(Object.isFrozen(timelineChapters));
  assert.ok(Object.isFrozen(players[0]));
  assert.ok(Object.isFrozen(honours[0]));
  assert.throws(() => {
    scenes[0].title = "mutated";
  }, TypeError);
});

test("formatPlayerStats produces deterministic display output", () => {
  const midfielder = players.find((player) => player.shirtNumber === 5);
  assert.ok(midfielder);
  const first = formatPlayerStats(midfielder);
  const second = formatPlayerStats(midfielder);
  assert.deepEqual(first, second);
  assert.equal(first.shirtNumber, "05");
  assert.equal(first.goals, "47");
  assert.equal(first.name, midfielder.name);
  assert.equal(first.position, "midfielder");
  assert.equal(first.nationality, "Croatia");
  assert.equal(formatShirtNumber(5), "05");
  assert.equal(formatShirtNumber(17), "17");
  assert.equal(formatStatCount(1250), "1,250");
  assert.equal(formatStatCount(47), "47");
  assert.equal(formatStatCount(0), "0");
});

test("aggregateHonours reads the European Cup total from data", () => {
  const result = aggregateHonours(honours);
  assert.equal(result.europeanCupTotal, 15);
  assert.equal(result.byCategory["european-cup"], 15);
  const expectedTotal = honours.reduce((sum, honour) => sum + honour.count, 0);
  assert.equal(result.total, expectedTotal);
  assert.equal(
    result.total,
    Object.values(result.byCategory).reduce((sum, count) => sum + count, 0),
  );
  for (const honour of honours) {
    assert.equal(result.byCategory[honour.category], honour.count);
  }
});

test("timeline chapters are ordered, unique, and ascending by year", () => {
  assert.ok(timelineChapters.length >= 5);
  const uniqueIds = new Set(timelineChapters.map((chapter) => chapter.id));
  assert.equal(uniqueIds.size, timelineChapters.length);
  timelineChapters.forEach((chapter, index) => {
    assert.equal(chapter.order, index + 1);
    assert.ok(chapter.year >= 1900);
    assert.ok(chapter.title.length > 0);
    if (index > 0) {
      assert.ok(chapter.year > timelineChapters[index - 1].year);
    }
  });
});

test("player set is non-empty with valid positions and distinct shirt numbers", () => {
  assert.ok(players.length >= 5);
  const validPositions = new Set([
    "goalkeeper",
    "defender",
    "midfielder",
    "forward",
  ]);
  const shirtNumbers = new Set(players.map((player) => player.shirtNumber));
  assert.equal(shirtNumbers.size, players.length);
  for (const player of players) {
    assert.ok(validPositions.has(player.position));
    assert.ok(player.shirtNumber > 0);
    assert.ok(player.name.length > 0);
    assert.ok(player.nationality.length > 0);
  }
});
