import type { ReactNode } from "react";

type SceneFrameProps = {
  children?: ReactNode;
  className?: string;
};

/**
 * Stable, full-bleed visual frame. It never transforms or animates itself:
 * later phases animate descendants only (docs/animation-system.md), keeping
 * the frame identical in the stable, reduced-motion, and JS-off states.
 */
export function SceneFrame({ children, className = "" }: SceneFrameProps) {
  return (
    <div
      className={`relative isolate w-full overflow-hidden scene-frame ${className}`}
    >
      {children}
    </div>
  );
}
