/* ========================================
   Scroll-driven color theme
   ----------------------------------------
   Single source of truth for the color stops the page background and the
   ember particles travel through as the user scrolls. Keeping it in one
   place means the traveling glow and the drifting embers always match.

   Each stop maps a scroll fraction (0 = top, 1 = bottom) to an RGB color.
   The journey mirrors the sections: cover -> forge -> alchemy -> watch ->
   footer, rising in warmth then settling back to near-black.
   ======================================== */

export type RGB = readonly [r: number, g: number, b: number];

export interface ScrollStop {
  /** Scroll fraction in the range [0, 1]. */
  at: number;
  rgb: RGB;
}

/* Color stops — tuned to read as warm light, never bright enough to fight
   the content sitting above it. Values are deliberately low-intensity. */
export const SCROLL_STOPS: readonly ScrollStop[] = [
  { at: 0.0, rgb: [26, 18, 12] }, // cover  — warm near-black
  { at: 0.3, rgb: [70, 44, 16] }, // forge  — bronze / gold
  { at: 0.55, rgb: [92, 24, 22] }, // alchemy — deep crimson
  { at: 0.78, rgb: [58, 38, 14] }, // watch  — dim ember gold
  { at: 1.0, rgb: [14, 10, 8] }, // footer — settle to near-black
] as const;

/** Clamp n into [min, max]. */
const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

/** Linear interpolation between two numbers. */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Sample the color ramp at a given scroll fraction.
 *
 * Finds the two stops that bracket `progress`, blends their RGB channels
 * by the local t, and returns the interpolated color. Progress is clamped
 * to [0, 1]. Returns the first stop's color below the range and the last
 * stop's color above it.
 *
 * @param progress scroll fraction, 0..1 (clamped)
 * @param stops    color ramp (defaults to SCROLL_STOPS)
 */
export function lerpColor(
  progress: number,
  stops: readonly ScrollStop[] = SCROLL_STOPS
): RGB {
  const p = clamp(progress, 0, 1);

  // Before / at the first stop.
  if (p <= stops[0].at) return stops[0].rgb;
  // After / at the last stop.
  if (p >= stops[stops.length - 1].at) return stops[stops.length - 1].rgb;

  // Find the bracketing pair.
  let i = 0;
  while (i < stops.length - 1 && p > stops[i + 1].at) i++;

  const a = stops[i];
  const b = stops[i + 1];
  const span = b.at - a.at || 1; // guard against duplicate stops
  const t = (p - a.at) / span;

  return [
    Math.round(lerp(a.rgb[0], b.rgb[0], t)),
    Math.round(lerp(a.rgb[1], b.rgb[1], t)),
    Math.round(lerp(a.rgb[2], b.rgb[2], t)),
  ];
}

/** Format an RGB tuple as a CSS `rgb(...)` string. */
export const toCss = ([r, g, b]: RGB): string => `rgb(${r}, ${g}, ${b})`;

/** Format an RGB tuple as an `rgba(...)` string with the given alpha. */
export const toCssAlpha = ([r, g, b]: RGB, alpha: number): string =>
  `rgba(${r}, ${g}, ${b}, ${alpha})`;
