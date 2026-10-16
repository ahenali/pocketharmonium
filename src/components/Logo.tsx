import { useId } from "react";

// Left edge (x) of each white key and each black key in the 512 x 512 mark.
const WHITE_KEYS = [88, 137, 186, 235, 284, 333, 382];
const BLACK_KEYS = [120.5, 169.5, 267.5, 316.5, 365.5];

/**
 * The Pocket Harmonium app-icon mark: a bellows zig-zag over a keyboard on a rounded tile.
 * Colours follow the site theme (dark tile in light mode, cream tile in dark mode).
 * Use `compact` below ~48px: thicker zig-zag and no dot, so it stays legible when small.
 */
export function LogoMark({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const clipId = `ph-logo-clip-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden>
      <rect width="512" height="512" rx="108" className="fill-[#2b1c12] dark:fill-[#f1e7cf]" />
      <clipPath id={clipId}>
        <rect x="88" y="70" width="336" height="120" />
      </clipPath>
      <polyline
        clipPath={`url(#${clipId})`}
        points="32,108 88,158 144,108 200,158 256,108 312,158 368,108 424,158 480,108"
        fill="none"
        strokeWidth={compact ? 34 : 24}
        strokeLinejoin="miter"
        strokeMiterlimit={10}
        className="stroke-[#c4903f] dark:stroke-[#a8761f]"
      />
      <g className="fill-[#f8f1e3] dark:fill-[#2b1c12]">
        {WHITE_KEYS.map((x) => (
          <path
            key={x}
            d={`M${x} 208H${x + 42}V402Q${x + 42} 412 ${x + 32} 412H${x + 10}Q${x} 412 ${x} 402Z`}
          />
        ))}
      </g>
      <g className="fill-[#2b1c12] dark:fill-[#f1e7cf]">
        {BLACK_KEYS.map((x) => (
          <path
            key={x}
            d={`M${x} 208H${x + 26}V325Q${x + 26} 332 ${x + 19} 332H${x + 7}Q${x} 332 ${x} 325Z`}
          />
        ))}
      </g>
      {compact ? null : (
        <circle cx="109" cy="382" r="9" className="fill-[#c4903f] dark:fill-[#a8761f]" />
      )}
    </svg>
  );
}
