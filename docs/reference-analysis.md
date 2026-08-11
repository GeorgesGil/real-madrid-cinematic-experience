# Reference analysis

Date: 2026-08-11. Detailed primary-source citations live in `docs/research/primary-sources.md`.

## Observed behavior

- The current GTA VI page begins with a short dark Rockstar loader, then reveals a full-screen visual composition with minimal navigation and a single dominant action.
- At 1920×1080, the opening artwork occupies most of the viewport while release metadata and platforms sit in a restrained lower band.
- Scrolling replaces the opening composition with full-bleed chapters, then paired trailer panels. Navigation remains sparse and persistent while its contrast treatment adapts.
- The page uses large media as the narrative surface; text is short, high-contrast, and attached to a scene rather than placed in a generic card grid.
- The official Real Madrid home uses a white institutional shell, navy typography, the crest, partner marks, large news imagery, and direct ecosystem links. Its identity is disciplined, but its news-oriented layout is not the target composition.
- A real 390×844 browser session confirmed the GTA page switches to a shorter 9,508px document versus roughly 13,471px on desktop. The in-app screenshot renderer timed out on the media-heavy mobile page, so no unverified mobile visual claim is recorded.

## Probable implementation

- Section-level timelines and pinned containers, with media descendants transformed inside the pin rather than animating the pinned element itself.
- Responsive art direction and different scroll distances, not simple proportional scaling.
- Layered media and overlay typography with explicit z-index ownership.
- A persistent navigation module whose visual state derives from the active scene.
- These are informed inferences, not claims about Rockstar's private source code.

## Our Real Madrid interpretation

- Translate the montage grammar, not GTA branding: Crest → Bernabéu → Team → European Royalty → History → Moments → Future.
- Use architectural silver, floodlight white, deep stadium navy, pitch shadow, and restrained Champions gold.
- The signature moment is an abstract `RM` aperture: stadium light appears inside two monumental letterforms, which open into the Bernabéu scene once.
- Use original, generated, or explicitly licensed media. Do not reuse Rockstar or Real Madrid assets, logos, player likenesses, or site copy without authorization.

## Performance implications

- One unambiguous LCP asset; atmospheric layers must not compete for preload bandwidth.
- Prefer transform and opacity. Use clip-path only for the signature aperture and one major scene transition.
- Create ScrollTriggers in document order and refresh only after critical media/font dimensions settle.
- No smooth-scrolling dependency until native scroll is correct; Lenis remains optional and removable.

## Mobile fallback

- Two or three depth layers, shorter scenes, no long horizontal pinning, posters instead of heavy autoplay video, and explicit previous/next controls for players.
- All content exists in the stable state and remains accessible with reduced motion or without JavaScript.
