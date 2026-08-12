import Image from "next/image";

type SizedImageProps = {
  /** Measured render width/height in px; used when the image is not `fill`. */
  width: number;
  height: number;
  fill?: false;
};

type FillImageProps = {
  /** Cover a positioned parent; the parent must provide the aspect context. */
  fill: true;
  width?: never;
  height?: never;
};

type CinematicImageProps = {
  alt: string;
  src: string;
  className?: string;
  /**
   * Required: describes the rendered width so the browser picks the correct
   * responsive variant (mandatory for `fill` per docs/performance-budget.md).
   */
  sizes: string;
  /**
   * The single LCP designation. When `true`, the image is `preload`ed;
   * otherwise `preload={false}`. No other loading prop is accepted or
   * forwarded (see docs/performance-budget.md).
   */
  lcp?: boolean;
} & (SizedImageProps | FillImageProps);

/**
 * Cinematic image primitive wrapping `next/image` with a strict typed
 * allowlist. Only the props above exist: there is no rest spread, so a
 * consumer cannot smuggle extra `next/image` props through.
 *
 * Default server component: no client directive, no event handlers, no
 * runtime JavaScript of its own (mirroring the ui package).
 */
export function CinematicImage(props: CinematicImageProps) {
  const { alt, src, className, sizes, lcp = false } = props;
  if (props.fill) {
    return (
      <Image
        alt={alt}
        src={src}
        fill
        className={className}
        sizes={sizes}
        preload={lcp}
      />
    );
  }
  return (
    <Image
      alt={alt}
      src={src}
      width={props.width}
      height={props.height}
      className={className}
      sizes={sizes}
      preload={lcp}
    />
  );
}
