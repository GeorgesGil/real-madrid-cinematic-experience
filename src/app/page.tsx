import { Hero } from "@/packages/hero/Hero";
import { CinematicIntro } from "@/packages/intro/CinematicIntro";
import { SceneTimeline } from "@/packages/motion/SceneTimeline";
import { Section } from "@/packages/ui";

export default function Home() {
  return (
    <>
      <CinematicIntro />
      <SceneTimeline>
        <Hero />
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
