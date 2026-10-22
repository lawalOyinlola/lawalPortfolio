import { Cam, clamp, facing, fillet, fit, hull, open, poly, proj, rad, ringAt, rrect, run, type Sample, type Vec2 } from "./iso";
import { tdone, tset, tval, tween, type Tween } from "./motion";
import { disposer, mk, place, pointer, register, type FigureMount, type Tour } from "./stage";

/**
 * Typewriter: a body that slopes down to three stepped rows of round keys, a
 * fan of type bars lying in their basket, and a sheet of paper standing up
 * behind the platen with a few dim lines already typed on it. Moving across
 * picks a type bar: it swings up and over to strike the paper at the printing
 * point, its neighbours lift a little, staggered outwards. At rest one bar is
 * half way up, mid-keystroke. The value is how far the neighbours' lift
 * reaches, in bars.
 *
 * Drawn with the hairline-create skill on the engine vendored beside it
 * (lucasmarkes/hairline @ 37d2e78, MIT; see ./LICENSE).
 */

const NB = 22, RP = 20, ZB = 20, FAN = 74;
const PY = -16, PZ = 30, PR = 7, AX = -22;
const L = Math.hypot(RP, PZ - ZB), STRIKE = 180 - (Math.atan2(PZ - ZB, RP) * 180) / Math.PI;
const BX = 56, BY0 = -34, BY1 = 50;
const REST_BAR = 8, REST_LIFT = 0.5, NEAR_LIFT = 72;

/** How far the neighbours' lift reaches, in bars, at intensity 0, 0.5 and 1. */
export const TYPEWRITER_RANGE = [1, 2.5, 4] as const;
/** Where play points: a bar on the left, one in the middle, one on the right. */
export const TYPEWRITER_TOUR: Tour = [[150, 190], [250, 170], [200, 180], null];

/** The body's top height at y: high at the back under the platen, low at the front under the keys. */
const top = (y: number) => 6 + ((BY1 - y) / (BY1 - BY0)) * 16;

type Bar = {
  i: number; ox: number; oy: number; ax: number; ay: number; tw: Tween; drawn: number; lit: boolean | null;
  grp: SVGGElement; arm: SVGPathElement; slug: SVGCircleElement;
};

export const mount: FigureMount = ({ stage, svg, read }, value) => {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.72);
  fit(C, [[-BX, BY0, 0], [BX, BY1, 0], [BX, BY0, 0], [-BX, BY1, 0], [-28, AX - 10, 66], [28, AX - 10, 66], [-60, -6, 42]], 200, 168);
  const P = proj(C), front = facing(C);
  let reach = value;

  const g = mk("g", {}, svg);

  // The body: a rounded footprint whose top slopes down toward the keys.
  const foot = rrect(-BX, BY0, BX, BY1, 10, 6), lid = rrect(-BX + 2, BY0 + 2, BX - 2, BY1 - 2, 8, 6);
  const atTop = (ring: readonly Sample[]) => ring.map((q) => P(q.u, q.v, top(q.v)));
  mk("path", { d: poly(hull(ringAt(P, foot, 0).concat(atTop(foot)))), class: "sil" }, g);
  mk("path", { d: open(atTop(run(lid, front))), class: "nf lo" }, g);
  mk("path", { d: poly(atTop(lid)), class: "nf lo" }, g);

  // The paper, standing up behind the platen and leaning back.
  const sheet = ([[-26, AX, PZ + PR], [26, AX, PZ + PR], [26, AX - 10, 66], [-26, AX - 10, 66]] as const).map((p) => P(p[0], p[1], p[2]));
  mk("path", { d: poly(fillet(sheet, [0.5, 0.5, 1.5, 1.5])), class: "sil" }, g);
  // What has been typed so far: a few lines of uneven length, dim, no letters.
  const onSheet = (x: number, f: number) => P(x, AX - 10 * f, PZ + PR + (66 - PZ - PR) * f);
  const typed = [[0.72, 18], [0.62, 12], [0.52, 16], [0.42, 6]].map(([f, w]) => open([onSheet(-20, f), onSheet(-20 + w * 2, f)]));
  mk("path", { d: typed.join(""), class: "nf lo" }, g);

  // The platen and its knobs: discs on the axis along x.
  const disc = (x0: number, x1: number, r: number) => {
    const ring = (x: number) =>
      Array.from({ length: 32 }, (_, k) => P(x, AX + r * Math.sin((k / 32) * 2 * Math.PI), PZ + r * Math.cos((k / 32) * 2 * Math.PI)));
    return [poly(hull(ring(x0).concat(ring(x1)))), poly(ring(x1))];
  };
  const [ks0, kc0] = disc(-52, -47, 9);
  mk("path", { d: ks0, class: "sil" }, g);
  mk("path", { d: kc0, class: "nf lo" }, g);
  mk("path", { d: disc(-47, 47, PR)[0], class: "sil" }, g);
  const [ks1, kc1] = disc(47, 52, 9);
  mk("path", { d: ks1, class: "sil" }, g);
  mk("path", { d: kc1, class: "nf lo" }, g);
  // The carriage return lever, off the left end.
  mk("path", { d: open([P(-50, AX + 4, PZ + 6), P(-58, AX + 12, PZ + 12), P(-60, -4, PZ + 12)]), class: "nf sil" }, g);

  // The basket: the arc the bars pivot on.
  const arc: Vec2[] = [];
  for (let k = 0; k <= 24; k++) {
    const t = rad(-FAN - 6 + ((2 * FAN + 12) * k) / 24);
    arc.push(P(RP * Math.sin(t), PY + RP * Math.cos(t), ZB - 1));
  }
  mk("path", { d: open(arc), class: "nf lo" }, g);

  // The bars, then repainted from the sides in to the middle, so the middle ones are on top.
  const bars: Bar[] = [];
  for (let i = 0; i < NB; i++) {
    const t = rad(-FAN + (2 * FAN * i) / (NB - 1)), ox = Math.sin(t), oy = Math.cos(t);
    const grp = mk("g", {}, g) as SVGGElement;
    bars.push({
      i, ox, oy, ax: RP * ox, ay: PY + RP * oy, tw: tween(i === REST_BAR ? STRIKE * REST_LIFT : 0), drawn: NaN, lit: null, grp,
      arm: mk("path", { class: "nf sil" }, grp) as SVGPathElement,
      slug: mk("circle", { r: 1.6, class: "dot off" }, grp) as SVGCircleElement,
    });
  }
  for (const b of [...bars].sort((a, c) => Math.abs(c.i - (NB - 1) / 2) - Math.abs(a.i - (NB - 1) / 2))) g.appendChild(b.grp);
  /** Where bar b's slug is when swung up by phi degrees. */
  const tip = (b: Bar, phi: number) => {
    const c = Math.cos(rad(phi)), s = Math.sin(rad(phi));
    return P(b.ax + L * c * b.ox, b.ay + L * c * b.oy, ZB + L * s);
  };
  // Where each bar's tip lies at rest, across the screen: the hit test, which never moves.
  const restX = bars.map((b) => tip(b, 0)[0]);
  const minX = Math.min(...restX) - 12, maxX = Math.max(...restX) + 12;

  // The keys: three stepped rows of round tops on stems.
  const keys = mk("g", {}, g);
  for (const [y, n] of [[26, 9], [35, 10], [44, 9]]) for (let k = 0; k < n; k++) {
    const x = (k - (n - 1) / 2) * 10.5, z = top(y) + 3;
    mk("path", { d: open([P(x, y, top(y)), P(x, y, z)]), class: "nf lo" }, keys);
    place(mk("ellipse", { rx: 3.4 * C.S, ry: 3.4 * C.S * C.k, class: "sil" }, keys), P(x, y, z));
  }

  let pick: number | null = null;

  function draw(now: number) {
    let moving = false;
    const lead = pick ?? REST_BAR;
    for (const b of bars) {
      const phi = tval(b.tw, now);
      if (!tdone(b.tw, now)) moving = true;
      if (phi !== b.drawn) {
        b.drawn = phi;
        const e = tip(b, phi);
        b.arm.setAttribute("d", open([P(b.ax, b.ay, ZB), e]));
        place(b.slug, e);
      }
      const lit = b.i === lead;
      if (lit !== b.lit) {
        b.lit = lit;
        b.arm.classList.toggle("hi", lit);
        b.arm.classList.toggle("sil", !lit);
        b.slug.setAttribute("class", lit ? "dot" : "dot off");
      }
    }
    return moving;
  }

  const B = register(stage, (_dt, now) => draw(now));
  bag.add(B.unregister);

  function retarget() {
    const now = performance.now();
    for (const b of bars) {
      if (pick === null) {
        tset(b.tw, b.i === REST_BAR ? STRIKE * REST_LIFT : 0, now, 0);
        continue;
      }
      const d = Math.abs(b.i - pick);
      tset(b.tw, d === 0 ? STRIKE : NEAR_LIFT * clamp(1 - d / (reach + 1), 0, 1), now, d * 35);
    }
    read.textContent = pick === null ? "rest" : `bar ${String(pick + 1).padStart(2, "0")}`;
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => {
      // The bar whose resting tip is nearest across the screen; past either end of the fan, none.
      let next: number | null = null;
      if (p[0] >= minX && p[0] <= maxX) {
        next = 0;
        for (let k = 1; k < NB; k++) if (Math.abs(restX[k] - p[0]) < Math.abs(restX[next] - p[0])) next = k;
      }
      if (next !== pick) { pick = next; retarget(); }
    },
    leave: () => { pick = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { reach = v; if (pick !== null) retarget(); },
    destroy: bag.dispose,
  };
};
