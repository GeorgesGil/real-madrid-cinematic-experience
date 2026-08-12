import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { players } from "../src/packages/content/index.ts";

import {
  createPlayerStory,
  nextPlayer,
  playerStoryReducer,
  previousPlayer,
  selectPlayer,
  selectedId,
} from "../src/packages/player/index.ts";

/*
 * Behavior tests import the player barrel directly: it re-exports only the
 * pure `.ts` seam, so Node type stripping can parse it and the tests exercise
 * the public entry point. The content barrel is imported for the roster
 * integration test, proving PlayerStory stays decoupled from content data.
 */
const root = new URL("..", import.meta.url);
const ROSTER = ["alonso", "bell", "carlos"];

function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

test("createPlayerStory copies the roster and starts with no selection", () => {
  const source = ["alonso", "bell", "carlos"];
  const story = createPlayerStory(source);
  assert.deepEqual(story, {
    ids: ["alonso", "bell", "carlos"],
    selectedIndex: null,
  });
  assert.equal(selectedId(story), null);
  source.push("mutated");
  assert.deepEqual(story.ids, ["alonso", "bell", "carlos"]);
});

test("select chooses an existing id and selectedId resolves it", () => {
  let story = createPlayerStory(ROSTER);
  story = selectPlayer(story, "bell");
  assert.equal(story.selectedIndex, 1);
  assert.equal(selectedId(story), "bell");
});

test("select with an unknown id clears the selection", () => {
  let story = createPlayerStory(ROSTER);
  story = selectPlayer(story, "zidane");
  assert.equal(story.selectedIndex, null);
  assert.equal(selectedId(story), null);
  story = selectPlayer(story, "alonso");
  assert.equal(story.selectedIndex, 0);
  story = selectPlayer(story, "absent");
  assert.equal(story.selectedIndex, null);
  assert.equal(selectedId(story), null);
});

test("next from no selection starts at the first player", () => {
  const story = nextPlayer(createPlayerStory(ROSTER));
  assert.equal(story.selectedIndex, 0);
  assert.equal(selectedId(story), "alonso");
});

test("previous from no selection starts at the last player", () => {
  const story = previousPlayer(createPlayerStory(ROSTER));
  assert.equal(story.selectedIndex, 2);
  assert.equal(selectedId(story), "carlos");
});

test("next wraps from the last player to the first", () => {
  let story = selectPlayer(createPlayerStory(ROSTER), "carlos");
  story = nextPlayer(story);
  assert.equal(story.selectedIndex, 0);
  assert.equal(selectedId(story), "alonso");
});

test("previous wraps from the first player to the last", () => {
  let story = selectPlayer(createPlayerStory(ROSTER), "alonso");
  story = previousPlayer(story);
  assert.equal(story.selectedIndex, 2);
  assert.equal(selectedId(story), "carlos");
});

test("an empty roster is a no-op for every action", () => {
  const story = createPlayerStory([]);
  assert.equal(nextPlayer(story), story);
  assert.equal(previousPlayer(story), story);
  assert.equal(selectPlayer(story, "anyone"), story);
  assert.equal(story.selectedIndex, null);
});

test("the reducer is pure and never mutates the roster or state", () => {
  const state = Object.freeze(createPlayerStory(ROSTER));
  assert.throws(() => {
    state.selectedIndex = 0;
  }, TypeError);
  const rosterBefore = [...state.ids];
  const first = playerStoryReducer(state, { type: "next" });
  assert.deepEqual(first, { ids: ROSTER, selectedIndex: 0 });
  const second = playerStoryReducer(first, { type: "next" });
  assert.deepEqual(second, { ids: ROSTER, selectedIndex: 1 });
  assert.deepEqual(state.ids, rosterBefore);
  assert.deepEqual(state, { ids: ROSTER, selectedIndex: null });
});

test("cycling next visits the full roster and wraps (integration)", () => {
  const roster = players.map((player) => player.id);
  let story = createPlayerStory(roster);
  assert.equal(story.selectedIndex, null);
  const visited = [];
  for (let step = 0; step < roster.length; step += 1) {
    story = nextPlayer(story);
    visited.push(selectedId(story));
  }
  assert.deepEqual(visited, roster);
  story = nextPlayer(story);
  assert.equal(selectedId(story), roster[0]);
});

test("the player seam stays JSX- and dependency-free for Node type stripping", async () => {
  const source = await read("src/packages/player/player-story.ts");
  assert.doesNotMatch(source, /"use client"/);
  assert.doesNotMatch(source, /from\s+["']react["']/);
  assert.doesNotMatch(source, /from\s+["']next[\/\w-]*["']/);
  assert.doesNotMatch(source, /<[A-Za-z]/);
});

test("the player barrel exports the seam only and never content data", async () => {
  const index = await read("src/packages/player/index.ts");
  assert.match(index, /playerStoryReducer/);
  assert.match(index, /selectedId/);
  assert.doesNotMatch(index, /\.tsx/);
  assert.doesNotMatch(index, /@\/packages\/content/);
});
