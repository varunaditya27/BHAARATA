import type { SVGProps } from "react";

type BrandMarkProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

/**
 * Geometric meridian-ring and Ashokan step-seal emblem for BHĀRATA.
 * Uses currentColor for archival ink strokes and crimson (#b3123f) for the focal axis.
 */
export function BrandMark({ size = 24, className, ...props }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Outer archival cartographic ring */}
      <circle
        cx="16"
        cy="16"
        r="13.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeOpacity="0.85"
      />
      {/* Cardinal meridian ticks */}
      <path
        d="M16 1V4.5M16 27.5V31M1 16H4.5M27.5 16H31"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="square"
      />
      {/* Inner meridian ellipse */}
      <ellipse
        cx="16"
        cy="16"
        rx="6.5"
        ry="13.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.45"
      />
      {/* Equator baseline */}
      <line
        x1="3.5"
        y1="16"
        x2="28.5"
        y2="16"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.45"
      />
      {/* Terracotta diamond seal at the center */}
      <path
        d="M16 9.5L21.5 16L16 22.5L10.5 16L16 9.5Z"
        fill="#b3123f"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      {/* Central pinpoint */}
      <circle cx="16" cy="16" r="1.75" fill="#fffbf0" />
    </svg>
  );
}
