#!/usr/bin/env node
/**
 * Make a diagram SVG follow the site theme, without changing how it looks in
 * light mode.
 *
 * Adds class="dg" to the root, which tells the markdown renderer to inline the
 * file instead of linking it, and a dg-<kind>-<role> class to every element
 * whose colour has to change on a dark page. The original fill and stroke
 * attributes stay, so the file still renders as the light version anywhere CSS
 * cannot reach it: an <img>, GitHub, an editor. globals.css overrides the
 * classes under .dark.
 *
 *   node scripts/theme-svg.mjs public/images/labs/<lab>/*.svg
 *   node scripts/theme-svg.mjs --check public/images/labs/<lab>/*.svg
 *
 * Kinds: t = text fill, f = shape fill, s = stroke. A colour that is neither
 * mapped nor deliberately kept is reported and left alone; add it to ROLES
 * (and a matching rule in globals.css) before relying on the diagram in dark
 * mode. Running it twice changes nothing.
 */

import { readFileSync, writeFileSync } from "node:fs";
import process from "node:process";

// Colours that change on a dark page, by kind. The value is the role name used
// in the class, so every lab shares one set of dark overrides in globals.css.
const ROLES = {
  t: {
    "#1a3c5e": "ink", // headings and labels on the page
    "#555555": "body", // subtitles and body copy on the page
    "#8a6d1a": "gold", // text inside a tinted callout
    "#64748b": "slate", // secondary labels
    "#94a3b8": "faint", // legends and footnotes
  },
  f: {
    "#f5f2e8": "callout", // pale gold callout panel
    "#fdf2f4": "rose-tint", // pale rose highlight panel
  },
  s: {
    "#c8d3e0": "line", // outlines and frames
    "#cbd5e1": "line",
    "#2e7d46": "green",
    "#be123c": "rose",
  },
};

// Colours that read the same on either page, so they are deliberately left
// unclassed: solid box fills, and the light text that sits on them.
const KEEP = {
  t: ["#ffffff", "#d7e0ec", "#b9c7da", "#ece2cc", "#e2d6bb"],
  f: ["#1a3c5e", "#2e7d46", "#5a4a2a", "#c99a2e", "none"],
  s: ["#c99a2e", "none"],
};

const TEXT = new Set(["text", "tspan"]);
const SHAPES = new Set(["rect", "circle", "ellipse", "path", "line", "polyline", "polygon", "g"]);

const args = process.argv.slice(2);
const check = args.includes("--check");
const files = args.filter((a) => !a.startsWith("--"));
if (files.length === 0) {
  console.error("Usage: node scripts/theme-svg.mjs [--check] <file.svg>...");
  process.exit(1);
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1].trim().toLowerCase() : null;
}

function addClasses(tag, classes) {
  if (classes.length === 0) return tag;
  const existing = tag.match(/\sclass="([^"]*)"/);
  if (existing) {
    const have = new Set(existing[1].split(/\s+/).filter(Boolean));
    const merged = [...have, ...classes.filter((c) => !have.has(c))].join(" ");
    return tag.replace(existing[0], ` class="${merged}"`);
  }
  // Insert straight after the tag name so the attribute order stays readable.
  return tag.replace(/^<(\w+)/, `<$1 class="${classes.join(" ")}"`);
}

let problems = 0;

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const unmapped = new Set();

  const out = src.replace(/<(\w+)\b[^>]*>/g, (tag, name) => {
    if (name === "svg") return addClasses(tag, ["dg"]);
    const isText = TEXT.has(name);
    if (!isText && !SHAPES.has(name)) return tag;

    const classes = [];
    for (const [kind, colour] of [
      [isText ? "t" : "f", attr(tag, "fill")],
      ["s", attr(tag, "stroke")],
    ]) {
      if (!colour) continue;
      const role = ROLES[kind][colour];
      if (role) classes.push(`dg-${kind}-${role}`);
      else if (!KEEP[kind].includes(colour)) unmapped.add(`${kind} ${colour}`);
    }
    return addClasses(tag, classes);
  });

  for (const u of unmapped) {
    console.error(`unmapped ${u}  in ${file}`);
    problems += 1;
  }

  if (check) {
    console.log(`${out === src ? "themed  " : "needs run"} ${file}`);
    if (out !== src) problems += 1;
  } else if (out !== src) {
    writeFileSync(file, out);
    console.log(`themed   ${file}`);
  } else {
    console.log(`unchanged ${file}`);
  }
}

process.exit(problems ? 1 : 0);
