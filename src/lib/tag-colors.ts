/**
 * dev.to-style tag colours. Known tags get a fixed hue so they stay stable
 * across posts; anything else hashes into the same palette, so a new tag is
 * coloured on day one without anyone having to register it here.
 *
 * Every value clears 4.5:1 against the light background, so the colour can
 * carry text as well as decoration. Dark mode lightens them in CSS rather than
 * keeping a second table.
 */
const TAG_COLORS: Record<string, string> = {
  security: "#be123c",
  cybersecurity: "#0e7490",
  appsec: "#7c3aed",
  penetrationtesting: "#c2410c",
  ethicalhacking: "#b91c1c",
  webdev: "#2563eb",
  devops: "#15803d",
  javascript: "#a16207",
  typescript: "#1d4ed8",
  react: "#0369a1",
  nextjs: "#171717",
  css: "#be185d",
  performance: "#4d7c0f",
  accessibility: "#6d28d9",
  a11y: "#6d28d9",
  linux: "#44403c",
};

const FALLBACK_PALETTE = [
  "#be123c",
  "#0e7490",
  "#7c3aed",
  "#c2410c",
  "#2563eb",
  "#15803d",
  "#a16207",
  "#be185d",
];

function normalise(tag: string): string {
  return tag.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getTagColor(tag: string): string {
  const key = normalise(tag);
  const known = TAG_COLORS[key];
  if (known) return known;

  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return FALLBACK_PALETTE[hash % FALLBACK_PALETTE.length];
}
