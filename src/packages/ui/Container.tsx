import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Max-width content wrapper that owns the responsive horizontal gutter.
 * Full-bleed frames (SceneFrame) deliberately sit outside this wrapper.
 */
export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-[var(--container-width)] px-[var(--gutter)] ${className}`}
    >
      {children}
    </div>
  );
}
