import { Cam, clamp, facing, fillet, fit, open, poly, prism, proj, rings, seg, unproj, type Vec2 } from "./iso";
import { spring, stepS, type Spring } from "./motion";
import { disposer, mk, pointer, put, register, solid, type FigureMount, type Tour } from "./stage";

/**
 * Tripwire: sixteen hosts on a lab network, each with a sensor post whose arm
 * and paddle lie flat across its lid. The pointer is the intruder on the
 * floor: paddles within reach raise toward upright, the nearer the higher, and
 * when it moves on they hold and sink slowly, as an alert lingers. At rest one
 * paddle is still up from the last alert. Raised paddles take the bright
 * stroke. The value is the detection radius, in cells.
 *
 * Drawn with the hairline-create skill on the engine vendored beside it
 * (lucasmarkes/hairline @ 37d2e78, MIT; see ./LICENSE).
 */

const N = 4, CELL = 30, FOOT = 20, EXT = N * CELL, PB = 5, M = 7;
const MAST = 8, ARM = 24, PAD = 5.2, LIFT = 84, DRAIN = 0.45;
// Servers stand taller than workstations; the floor is not a regular grid.
const TALL = new Set(["0,1", "1,3", "2,0", "3,2"]);
// The last alert: one arm up, a neighbour on its way down.
const REST: Record<string, number> = { "2,2": 1, "3,2": 0.38 };
const COLS = "abcd";

/** The detection radius, in cells, at intensity 0, 0.5 and 1. */
export const TRIPWIRE_RANGE = [1.1, 1.8, 2.6] as const;
/** Where play walks the intruder: in on the left, across the front, out on the right. */
export const TRIPWIRE_TOUR: Tour = [[108, 176], [200, 200], [292, 170], null];

/** The share of an alert at u radii from the intruder: full inside half the reach, easing to none at its edge. */
const falloff = (u: number) => {
  const t = clamp((1 - u) / 0.5, 0, 1);
  return t * t * (3 - 2 * t);
};

type Host = {
  i: number; j: number; h: number; a0: number; x0: number; y0: number; px: number; py: number;
  arm: SVGPathElement; pad: SVGPathElement; lvl: number; sp: Spring; drawn: number; lit: boolean | null;
};

export const mount: FigureMount = ({ stage, svg, read }, value) => {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.45);
  fit(C, [[-M, -M, -PB], [EXT + M, EXT + M, -PB], [EXT + M, -M, -PB], [-M, EXT + M, -PB], [0, 0, 12 + MAST + ARM], [EXT, EXT, 12 + MAST + ARM]], 200, 166);
  const P = proj(C), front = facing(C);
  let R = value * CELL, over: Vec2 | null = null;

  const g = mk("g", {}, svg);
  const [pr, pi] = rings(-M, -M, EXT + M, EXT + M, 9, 2.2);
  put(solid(g), prism(P, front, pr, pi, -PB, 0));

  // The network: dashed runs between neighbours, on the floor, under every host.
  let wires = "";
  const mid = (k: number) => (k + 0.5) * CELL;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    if (i < N - 1) wires += seg(P(mid(i) + FOOT / 2, mid(j), 0), P(mid(i + 1) - FOOT / 2, mid(j), 0));
    if (j < N - 1) wires += seg(P(mid(i), mid(j) + FOOT / 2, 0), P(mid(i), mid(j + 1) - FOOT / 2, 0));
  }
  mk("path", { d: wires, class: "dash nf" }, g);

  const hosts: Host[] = [];
  for (let s = 0; s <= 2 * (N - 1); s++) for (let i = 0; i < N; i++) {
    const j = s - i;
    if (j < 0 || j >= N) continue;
    const key = i + "," + j, h = TALL.has(key) ? 12 : 6, a0 = REST[key] ?? 0;
    const x0 = mid(i) - FOOT / 2, y0 = mid(j) - FOOT / 2;
    const [ring, inner] = rings(x0, y0, x0 + FOOT, y0 + FOOT, 3, 1);
    put(solid(g), prism(P, front, ring, inner, 0, h));
    const px = x0 + 4, py = mid(j);
    const [mr, mi] = rings(px - 1.6, py - 1.6, px + 1.6, py + 1.6, 1.6, 0.5);
    put(solid(g), prism(P, front, mr, mi, h, h + MAST));
    const arm = mk("path", { class: "nf sil" }, g) as SVGPathElement;
    const pad = mk("path", { class: "sil" }, g) as SVGPathElement;
    hosts.push({ i, j, h, a0, x0, y0, px, py, arm, pad, lvl: a0, sp: spring(a0, { eps: 0.002 }), drawn: NaN, lit: null });
  }

  function draw(o: Host) {
    const a = clamp(o.sp.x, 0, 1);
    if (a === o.drawn) return;
    o.drawn = a;
    const t = (a * LIFT * Math.PI) / 180, z = o.h + MAST;
    const c = Math.cos(t), s = Math.sin(t), at = (d: number, w: number) => P(o.px + d * c, o.py + w, z + d * s);
    o.arm.setAttribute("d", open([at(0, 0), at(ARM * 0.45, 0)]));
    // The paddle: a plate across the arm's far half, flat on the lid at rest, upright on alert.
    o.pad.setAttribute("d", poly(fillet([at(ARM * 0.45, -PAD), at(ARM, -PAD), at(ARM, PAD), at(ARM * 0.45, PAD)], [1, 1, 1, 1])));
    const lit = a > 0.5;
    if (lit !== o.lit) {
      o.lit = lit;
      o.pad.classList.toggle("sil", !lit);
      o.pad.classList.toggle("hi", lit);
    }
  }

  // The intruder's reach, read from the ground, which never moves.
  const reach = (o: Host) => (over ? falloff(Math.hypot(mid(o.i) - over[0], mid(o.j) - over[1]) / R) : 0);

  const B = register(stage, (dt) => {
    let m = false;
    for (const o of hosts) {
      const want = Math.max(reach(o), over ? 0 : o.a0);
      const lvl = want >= o.lvl ? want : Math.max(want, o.lvl - DRAIN * dt);
      if (lvl !== o.lvl) { o.lvl = lvl; m = true; }
      o.sp.t = lvl;
      if (stepS(o.sp, dt)) m = true;
      draw(o);
    }
    return m;
  });
  bag.add(B.unregister);

  /** The host under the pointer: each tested on its own resting lid. */
  function hostAt(p: Vec2) {
    for (let k = hosts.length - 1; k >= 0; k--) {
      const o = hosts[k], [x, y] = unproj(C, p[0], p[1], o.h);
      if (x >= o.x0 && x <= o.x0 + FOOT && y >= o.y0 && y <= o.y0 + FOOT) return o;
    }
    return null;
  }

  function readout(p: Vec2 | null) {
    if (!p || !over) { read.textContent = "rest"; return; }
    const o = hostAt(p);
    const up = hosts.filter((q) => reach(q) > 0.5).length;
    read.textContent = (o ? `host ${COLS[o.i]}${o.j + 1}` : "floor") + ` · ${up} up`;
  }

  bag.add(pointer(stage, {
    move: (p) => { over = unproj(C, p[0], p[1], 0); readout(p); B.wake(); },
    leave: () => { over = null; readout(null); B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { R = v * CELL; B.wake(); },
    destroy: bag.dispose,
  };
};
