import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("..", import.meta.url);

function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

test("globals.css declares the six canonical palette tokens", async () => {
  const css = await read("src/app/globals.css");
  const tokens = [
    ["--ink", "#050713"],
    ["--navy", "#0a1a3a"],
    ["--white", "#f7f8fc"],
    ["--silver", "#b7c2d2"],
    ["--gold", "#c7a34b"],
    ["--pitch", "#102b25"],
  ];
  for (const [name, value] of tokens) {
    assert.match(css, new RegExp(`${name}\\s*:\\s*${value}`));
  }
});

test(
  "globals.css maps tokens into the Tailwind theme and keeps color-scheme dark",
  async () => {
    const css = await read("src/app/globals.css");
    assert.match(css, /@theme inline/);
    for (const name of ["ink", "navy", "white", "silver", "gold", "pitch"]) {
      assert.match(css, new RegExp(`--color-${name}:\\s*var\\(--${name}\\)`));
    }
    assert.match(css, /color-scheme:\s*dark/);
    assert.match(css, /background:\s*var\(--ink\)/);
    assert.match(css, /color:\s*var\(--white\)/);
  },
);

test("globals.css provides the reduced-motion baseline", async () => {
  const css = await read("src/app/globals.css");
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /animation-duration:\s*0\.01ms/);
  assert.match(css, /transition-duration:\s*0\.01ms/);
  assert.match(css, /scroll-behavior:\s*auto/);
  assert.match(css, /prefers-reduced-motion:\s*no-preference/);
  assert.match(css, /scroll-behavior:\s*smooth/);
});

test("globals.css styles the skip link and a visible focus ring", async () => {
  const css = await read("src/app/globals.css");
  assert.match(css, /\.skip-link\s*\{/);
  assert.match(css, /\.skip-link:focus-visible\s*\{/);
  assert.match(css, /:focus-visible\s*\{/);
  assert.match(css, /\.scene-frame\s*\{/);
});

test(
  "layout.tsx configures licensed next/font families and the landmark shell",
  async () => {
    const layout = await read("src/app/layout.tsx");
    assert.match(layout, /from "next\/font\/google"/);
    for (const family of ["Oswald", "Inter", "IBM_Plex_Mono"]) {
      assert.match(layout, new RegExp(family));
    }
    assert.match(layout, /display:\s*"swap"/);
    assert.match(layout, /subsets:\s*\["latin"\]/);
    assert.match(layout, /variable:\s*"--font-/);
    assert.match(layout, /<html\s+lang="en"/);
    assert.match(layout, /SkipLink/);
    assert.match(layout, /SiteHeader/);
    assert.match(layout, /<main id="main">/);
    assert.match(layout, /SiteFooter/);
    assert.match(layout, /from "@\/packages\/ui"/);
  },
);

test("the ui package exposes the six shell primitives", async () => {
  const index = await read("src/packages/ui/index.ts");
  for (const name of [
    "Container",
    "SceneFrame",
    "Section",
    "SiteFooter",
    "SiteHeader",
    "SkipLink",
  ]) {
    assert.match(index, new RegExp(`export \\{ ${name} \\}`));
  }
});

test("shell primitives are server components without client directives", async () => {
  for (const file of [
    "Container.tsx",
    "SceneFrame.tsx",
    "Section.tsx",
    "SiteFooter.tsx",
    "SiteHeader.tsx",
    "SkipLink.tsx",
  ]) {
    const source = await read(`src/packages/ui/${file}`);
    assert.doesNotMatch(source, /"use client"/);
  }
});

test(
  "header avoids dead anchors and footer carries the non-affiliation notice",
  async () => {
    const header = await read("src/packages/ui/SiteHeader.tsx");
    assert.match(header, /aria-label="Site"/);
    assert.match(header, /href="\/"/);
    assert.doesNotMatch(header, /href="#scene/);
    const footer = await read("src/packages/ui/SiteFooter.tsx");
    assert.match(footer, /independent, non-commercial concept/);
    assert.match(footer, /Not affiliated/);
  },
);

test("the home page composes the shell without feature chapters", async () => {
  const page = await read("src/app/page.tsx");
  assert.match(page, /from "@\/packages\/ui"/);
  assert.match(page, /<SceneFrame/);
  assert.match(page, /<Section/);
  assert.match(page, /<Container/);
  assert.doesNotMatch(page, /<main/);
  assert.doesNotMatch(page, /"use client"/);
  assert.doesNotMatch(page, /gsap/);
});
