import type { ReactNode } from "react";

import { Container } from "./Container";

type SectionProps = {
  id?: string;
  labelledBy?: string;
  kicker?: string;
  title?: string;
  summary?: string;
  children?: ReactNode;
  className?: string;
};

/**
 * Editorial section: consistent vertical rhythm plus an optional
 * kicker / title / summary composition. When a title is rendered the section
 * is labelled by it, so `labelledBy` is only needed for custom compositions.
 */
export function Section({
  id,
  labelledBy,
  kicker,
  title,
  summary,
  children,
  className = "",
}: SectionProps) {
  const derivedHeadingId = title ? `${id ?? "section"}-title` : undefined;
  const headingId = labelledBy ?? derivedHeadingId;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`py-[var(--section-space)] ${className}`}
    >
      <Container>
        {kicker ? (
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
            {kicker}
          </p>
        ) : null}
        {title ? (
          <h2
            id={derivedHeadingId}
            className="mt-4 font-display text-[var(--text-title)] leading-tight text-white"
          >
            {title}
          </h2>
        ) : null}
        {summary ? (
          <p className="mt-4 max-w-prose text-base leading-relaxed text-silver">
            {summary}
          </p>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
