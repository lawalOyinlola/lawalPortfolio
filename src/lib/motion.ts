// Easing and timing the site's entrances share, so they read as one system
// rather than a mix of eases picked case by case. Reach for these before
// writing a new curve; the grid, the preloader and scrubbed motion keep their
// own, since those are tuned to a specific feel.

export const EASE = {
  /** Things arriving: quick start, long settle. The default for entrances. */
  out: "power3.out",
  /** Things travelling across the screen and coming to rest. */
  inOut: "power3.inOut",
  /** Small shifts in opacity or position that should not draw the eye. */
  soft: "power2.out",
} as const;

export const DURATION = {
  fast: 0.3,
  base: 0.6,
  slow: 1,
} as const;
