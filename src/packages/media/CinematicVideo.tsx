"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useMotionPreference } from "@/packages/motion";
import {
  decidePlayback,
  shouldRenderVideoElement,
  type PlaybackState,
} from "./playback.ts";

type CinematicVideoProps = {
  src: string;
  /** Required: stable poster shown before/without playback. */
  poster: string;
  /** Accessible name; omit only for decorative videos. */
  label?: string;
  /** Decorative videos are hidden from assistive technology. */
  decorative?: boolean;
  className?: string;
};

/**
 * Cinematic video primitive with intersection-driven playback and a static
 * poster fallback.
 *
 * - Autoplay requirements are baked in: `muted`, `playsInline`, `preload="none"`.
 * - Under `prefers-reduced-motion: reduce` (or after a decode error) the
 *   `<video>` element is never mounted; the poster `<img>` is the accessible
 *   stable state per docs/responsive-strategy.md and CONTEXT.md.
 * - The observer is only ever set up when a video element is actually
 *   rendered, and every `play()` promise is caught into the failure state so
 *   content is never blank (docs/animation-system.md `MediaPlayback`).
 */
export function CinematicVideo({
  src,
  poster,
  label,
  decorative = false,
  className,
}: CinematicVideoProps) {
  const motionPreference = useMotionPreference();
  const reducedMotion = motionPreference === "reduce";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [state, setState] = useState<PlaybackState>("idle");
  const stateRef = useRef<PlaybackState>("idle");

  const setPlaybackState = useCallback((next: PlaybackState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }
    const video = videoRef.current;
    if (video === null) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        const decision = decidePlayback({
          reducedMotion,
          inView: entry.isIntersecting,
          state: stateRef.current,
          canPlay: video.readyState >= 2,
        });
        if (decision.action === "play") {
          const promise = video.play();
          if (promise !== undefined) {
            promise.catch(() => {
              setPlaybackState("error");
            });
          }
        } else if (decision.action === "pause") {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => {
      observer.disconnect();
    };
  }, [reducedMotion, setPlaybackState]);

  if (!shouldRenderVideoElement(reducedMotion) || state === "error") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- already-sized CDN poster
      <img
        src={poster}
        alt={decorative ? "" : label}
        aria-hidden={decorative ? true : undefined}
        className={className}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      playsInline
      preload="none"
      aria-label={label}
      aria-hidden={decorative ? true : undefined}
      className={className}
      onError={() => {
        setPlaybackState("error");
      }}
    />
  );
}
