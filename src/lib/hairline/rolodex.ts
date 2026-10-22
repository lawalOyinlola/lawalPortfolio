import { Cam, clamp, facing, fillet, fit, hull, poly, prism, proj, rad, rings, type Vec2 } from "./iso";
import { spring, stepS } from "./motion";
import { disposer, mk, pointer, put, register, solid, type FigureEls, type FigureHandle } from "./stage";

/**
 * Rolodex: a rotary card file on a drum between two knobs, held up by two
 * arms on a base, with one card per question. The wheel stands open at one
 * card, upright in the gap with the bright edge: the cards still to come lean
 * away from the viewer and the ones already passed fall toward them, so the
 * open card always shows its face. The pointer's x turns the wheel; it follows
 * on a spring, and the open card is read from the target, never from the
 * pose. With no pointer on it, the wheel opens at the card the page picked.
 * Each card carries a tab at one of three places along its top edge. The
 * value is the gap, in degrees.
 *
 * Drawn with the hairline-create skill on the engine vendored beside it
 * (lucasmarkes/hairline @ 37d2e78, MIT; see ./LICENSE).
 */

const W = 58, R0 = 7, R1 = 33, TH = 4.5, TW = 13, ZC = 30, STEP = 5.5, TMAX = 116;
const TABS = [-W / 2 + 5, -TW / 2, W / 2 - 5 - TW];
const KX = W / 2 + 4, KR = 10, KT = 3.5, AX = W / 2 + 8;
const BX = AX + 5, BY = 30, BH = 5;
// The band of screen x the pointer scrubs, from the first card to the last.
const SX0 = 110, SX1 = 290;

/** The gap, in degrees, at intensity 0, 0.5 and 1. */
export const ROLODEX_RANGE = [14, 24, 36] as const;

export type RolodexHandle = FigureHandle & {
  /** Opens the wheel at card i when no pointer is on it: the page's own choice. */
  pick(i: number): void;
};

/** A card's lean, in degrees, at u cards from the open one: the gap, then a fixed step, packed at the end of travel. */
const lean = (u: number, gap: number) =>
  Math.sign(u) * Math.min(TMAX, gap * Math.min(1, Math.abs(u)) + STEP * Math.max(0, Math.abs(u) - 1));

type Card = { i: number; shape: Vec2[]; grp: SVGGElement; face: SVGPathElement; drawn: number; lit: boolean | null; d: number };

/** A Rolodex of `count` cards. */
export function rolodex(count: number) {
  const N = Math.max(1, count);

  return ({ stage, svg, read }: FigureEls, value: number): RolodexHandle => {
    const bag = disposer();
    const C = Cam(45, 0.5, 1.95);
    fit(C, [[-BX, -BY, 0], [BX, BY, 0], [BX, -BY, 0], [-BX, BY, 0], [0, 0, ZC + R1 + TH], [0, -R1, ZC - 12], [0, R1, ZC - 12]], 200, 170);
    const P = proj(C), front = facing(C);
    const zf = Math.sqrt(1 - C.k * C.k), sa = Math.sin(C.az), ca = Math.cos(C.az);
    /** How near the viewer a world point is: larger is nearer. */
    const depth = (x: number, y: number, z: number) => (x * sa + y * ca) * zf + z * C.k;
    let gap = value, over: number | null = null;

    const g = mk("g", {}, svg);
    const [br, bi] = rings(-BX, -BY, BX, BY, 8, 2);
    put(solid(g), prism(P, front, br, bi, 0, BH));

    // An arm: a plate standing across the base, wide at the foot and narrow under the knob.
    const arm = (x: number) =>
      poly(fillet(([[x, -17, BH], [x, 17, BH], [x, 4.5, ZC], [x, -4.5, ZC]] as const).map((p) => P(p[0], p[1], p[2])), [2, 2, 3, 3]));
    // A knob, or the drum: a disc on the axis from x0 to x1, as a silhouette and the near face's rim.
    const disc = (x0: number, x1: number, r: number) => {
      const ring = (x: number) =>
        Array.from({ length: 32 }, (_, k) => P(x, r * Math.sin((k / 32) * 2 * Math.PI), ZC + r * Math.cos((k / 32) * 2 * Math.PI)));
      return { sil: poly(hull(ring(x0).concat(ring(x1)))), crease: poly(ring(x1)) };
    };
    const knob = (x0: number, x1: number) => {
      const s = solid(g), d = disc(x0, x1, KR);
      s.sil.setAttribute("d", d.sil);
      s.cr.setAttribute("d", d.crease);
    };

    // The far side, behind every card: its arm and knob.
    mk("path", { d: arm(-AX), class: "sil" }, g);
    knob(-KX - KT, -KX);

    // The wheel: the drum and the cards, reordered by depth as they turn.
    const wheel = mk("g", {}, g);
    const drum = solid(wheel);
    drum.sil.setAttribute("d", disc(-KX, KX, R0 - 1).sil);
    const cards: Card[] = [];
    for (let i = 0; i < N; i++) {
      const t0 = TABS[i % 3];
      const shape = fillet(
        [[-W / 2, R0], [W / 2, R0], [W / 2, R1], [t0 + TW, R1], [t0 + TW, R1 + TH], [t0, R1 + TH], [t0, R1], [-W / 2, R1]],
        [0.8, 0.8, 2.4, 1.2, 1.6, 1.6, 1.2, 2.4],
      );
      const grp = mk("g", {}, wheel) as SVGGElement;
      cards.push({ i, shape, grp, face: mk("path", { class: "sil" }, grp) as SVGPathElement, drawn: NaN, lit: null, d: 0 });
    }

    // The near side, in front of every card.
    mk("path", { d: arm(AX), class: "sil" }, g);
    knob(KX, KX + KT);

    const sp = spring(0, { eps: 0.002 });
    let rest = 0, order = "";

    function draw() {
      for (const c of cards) {
        const th = rad(lean(sp.x - c.i, gap)), s = Math.sin(th), co = Math.cos(th);
        c.d = depth(0, ((R0 + R1) / 2) * s, ZC + ((R0 + R1) / 2) * co);
        if (th === c.drawn) continue;
        c.drawn = th;
        c.face.setAttribute("d", poly(c.shape.map(([x, r]) => P(x, r * s, ZC + r * co))));
      }
      const pick = clamp(Math.round(sp.t), 0, N - 1);
      for (const c of cards) {
        const lit = c.i === pick;
        if (lit !== c.lit) {
          c.lit = lit;
          c.face.classList.toggle("hi", lit);
          c.face.classList.toggle("sil", !lit);
        }
      }
      // Back to front: cards behind the axis, the drum, then the cards before it.
      const axis = depth(0, 0, ZC);
      const seq = [...cards].sort((a, b) => a.d - b.d);
      const key = seq.map((c) => (c.d < axis ? "b" : "f") + c.i).join();
      if (key !== order) {
        order = key;
        for (const c of seq) if (c.d < axis) wheel.appendChild(c.grp);
        wheel.appendChild(drum.g);
        for (const c of seq) if (c.d >= axis) wheel.appendChild(c.grp);
      }
    }

    const B = register(stage, (dt) => {
      const m = stepS(sp, dt);
      draw();
      return m;
    });
    bag.add(B.unregister);

    function retarget() {
      sp.t = over === null ? rest : over;
      read.textContent = over === null ? "rest" : `card ${String(Math.round(over) + 1).padStart(2, "0")}`;
      B.wake();
    }

    // The pointer's x, on a fixed band of the screen: nothing it is tested against moves.
    bag.add(pointer(stage, {
      move: (p) => { over = clamp(((p[0] - SX0) / (SX1 - SX0)) * (N - 1), 0, N - 1); retarget(); },
      leave: () => { over = null; retarget(); },
    }));
    bag.add(() => svg.replaceChildren());

    return {
      set: (v) => { gap = v; for (const c of cards) c.drawn = NaN; B.wake(); },
      pick: (i) => { rest = clamp(i, 0, N - 1); if (over === null) retarget(); },
      destroy: bag.dispose,
    };
  };
}
