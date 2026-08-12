import { SceneTimeline } from "@/packages/motion/SceneTimeline";
import { Container, SceneFrame, Section } from "@/packages/ui";

export default function Home() {
  return (
    <>
      <SceneTimeline>
        <SceneFrame>
          <Container className="flex min-h-[70svh] items-end">
            <div
              className="max-w-2xl pb-[var(--section-space)]"
              data-parallax
            >
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
                Independent cinematic concept
              </p>
              <h1
                className="mt-4 font-display text-[var(--text-display)] leading-[0.95] text-white"
              >
                The Bernabéu is a character.
              </h1>
            </div>
          </Container>
        </SceneFrame>
      </SceneTimeline>
      <Section
        id="intro"
        kicker="Phase 1B"
        title="A stable semantic shell"
        summary="Design tokens, licensed typography, and the landmark structure land first. Feature scenes, GSAP timelines, and media playback follow in later phases."
      />
    </>
  );
}
