# Animation system

## Modules and seams

- `SceneTimeline` is the deep module whose interface accepts a scene root, breakpoints, reduced-motion state, and lifecycle callbacks. It owns GSAP context and cleanup.
- `MotionPreference` exposes the stable reduced-motion decision to CSS and JavaScript.
- `MediaPlayback` owns intersection-based play/pause, poster fallback, and failure state.
- `PlayerStory` owns selected-player state independently of presentation; scroll, buttons, touch, and keyboard are adapters at the same seam.
- `OverlayController` owns menu/video focus trapping, Escape handling, scroll locking, and focus restoration.
- `IntroCompletion` (`intro/intro-signal.ts`) is the pure completion handoff seam: `CinematicIntro` latches it when the opening reaches `complete` (natural end or skip) and `useIntroComplete` reads it, so the hero aperture reveal starts only after the intro finishes.

## Rules

- Use GSAP, `@gsap/react`, `ScrollTrigger`, and `useGSAP()` as the only synchronized scroll engine.
- Use `gsap.matchMedia()`; `ScrollTrigger.matchMedia()` is deprecated and forbidden.
- Pin a container and animate descendants. Do not transform the pinned node.
- CSS handles hover, focus, simple colour changes, and small button movement.
- Every scene has a stable state before animation initialization.
- Reduced motion removes scrub, parallax, large masks, smooth scrolling, and decorative autoplay.

## Scene contracts

| Scene | Desktop | Mobile/reduced motion |
| --- | --- | --- |
| Opening | 1.5–3s resource-aware crest trace | Immediate static mark, ≤200ms fade |
| Hero | 200–250svh pin, subtle 3–5 layer push | 100–130svh, 2 layers, no long pin |
| Bernabéu | 3 image states cross-faded in one scene | Vertical sequence with short reveals |
| Team | Vertical scroll drives editorial horizontal story | Explicit vertical player sequence |
| Honours | Slow trophy light/scale around giant `15` | Static composition with brief opacity |
| History | Sticky year and changing era media | Linear timeline |

The Opening contract is a hard gate for the Hero: `useApertureReveal` waits on
the `IntroCompletion` signal before it may create any GSAP context, so the
aperture reveal begins only after the intro reaches `complete` (natural end or
skip) — never behind the intro layer. Under reduced motion the completion is
the ≤200ms fade's `animationend`, and the hero keeps its static mask with no
scrub/parallax.
