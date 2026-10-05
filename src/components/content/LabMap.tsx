"use client";

import { useRouter } from "next/navigation";
import { useState, type CSSProperties, type KeyboardEvent } from "react";
import { LAB_EDGES, LAB_NODES, type LabNode } from "@/app/constants";

/**
 * Interactive portfolio map for `/security/labs`.
 *
 * The hub-and-spoke diagram, made functional: Foundation anchors each
 * environment, tracks branch off it. A node is "live" when its slug is among
 * the published labs — then it is clickable, keyboard-focusable and routes to
 * the lab; otherwise it reads as "coming soon". Hover or focus surfaces a
 * tooltip naming the action. All colour comes from the site's tokens, so the
 * map themes in light and dark with everything else.
 */

const VIEW_W = 960;
const VIEW_H = 560;
const NODE_W = 176;
const NODE_H = 66;

/** Presentational layout — tweak freely; edges recompute from these. */
const POS: Record<string, { x: number; y: number }> = {
  foundation: { x: 242, y: 72 },
  pentest: { x: 70, y: 220 },
  detection: { x: 400, y: 220 },
  phishing: { x: 250, y: 398 },
  aisoc: { x: 452, y: 398 },
  "cloud-foundation": { x: 718, y: 96 },
  rag: { x: 718, y: 250 },
};

const GROUPS = [
  { label: "Local · UTM on Apple Silicon", x: 20, y: 40, w: 616, h: 500 },
  { label: "Cloud · Azure", x: 680, y: 40, w: 256, h: 360 },
];

function center(id: string) {
  const p = POS[id];
  return { cx: p.x + NODE_W / 2, cy: p.y + NODE_H / 2 };
}

/** Smooth vertical-ish connector between two node boxes. */
function edgePath(fromId: string, toId: string) {
  const a = center(fromId);
  const b = center(toId);
  const y1 = POS[fromId].y + NODE_H; // bottom of source
  const y2 = POS[toId].y; // top of target
  const my = (y1 + y2) / 2;
  return `M ${a.cx} ${y1} C ${a.cx} ${my}, ${b.cx} ${my}, ${b.cx} ${y2}`;
}

export default function LabMap({ liveSlugs }: { liveSlugs: string[] }) {
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);
  const live = new Set(liveSlugs);

  const isLive = (node: LabNode) => live.has(node.slug);

  function go(node: LabNode) {
    if (isLive(node)) router.push(`/security/labs/${node.slug}`);
  }

  function onKey(e: KeyboardEvent, node: LabNode) {
    if ((e.key === "Enter" || e.key === " ") && isLive(node)) {
      e.preventDefault();
      go(node);
    }
  }

  const activeNode = LAB_NODES.find((n) => n.id === active) ?? null;
  const activeLive = activeNode ? isLive(activeNode) : false;

  return (
    <figure
      className="group/map relative my-10 overflow-hidden rounded-2xl border border-border/60 bg-muted/20 p-3 sm:p-5"
      style={{ "--post-accent": "#be123c" } as CSSProperties}
    >
      <figcaption className="sr-only">
        A map of the lab portfolio. Foundation labs anchor each environment;
        track labs branch from them. Published labs are links; others are
        planned.
      </figcaption>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-auto w-full"
        role="group"
        aria-label="Lab portfolio map"
      >
        {/* Group frames */}
        {GROUPS.map((g) => (
          <g key={g.label}>
            <rect
              x={g.x}
              y={g.y}
              width={g.w}
              height={g.h}
              rx={20}
              fill="color-mix(in oklab, var(--muted) 40%, transparent)"
              stroke="var(--border)"
              strokeDasharray="2 6"
              strokeWidth={1.5}
            />
            <text
              x={g.x + 18}
              y={g.y + 26}
              fill="var(--muted-foreground)"
              fontSize={13}
              fontWeight={600}
              letterSpacing="0.14em"
              style={{ textTransform: "uppercase" }}
            >
              {g.label}
            </text>
          </g>
        ))}

        {/* Edges */}
        {LAB_EDGES.map((e) => {
          const lit = active === e.from || active === e.to;
          return (
            <path
              key={`${e.from}-${e.to}`}
              d={edgePath(e.from, e.to)}
              fill="none"
              stroke={lit ? "var(--post-accent)" : "var(--border)"}
              strokeWidth={lit ? 2.5 : 1.75}
              strokeDasharray={e.soft ? "5 5" : undefined}
              className="transition-all duration-300"
              opacity={lit ? 1 : 0.7}
            />
          );
        })}

        {/* Nodes */}
        {LAB_NODES.map((node) => {
          const { x, y } = POS[node.id];
          const liveNode = isLive(node);
          const isFoundation = node.kind === "foundation";
          const hot = active === node.id;

          const border = liveNode
            ? "var(--post-accent)"
            : "var(--border)";
          const fill = isFoundation
            ? "color-mix(in oklab, var(--post-accent) 10%, var(--background))"
            : "var(--background)";

          return (
            <g
              key={node.id}
              transform={`translate(${x} ${y})`}
              role={liveNode ? "link" : "img"}
              aria-label={
                liveNode
                  ? `${node.label}: ${node.kicker}. View lab.`
                  : `${node.label}: ${node.kicker}. Coming soon.`
              }
              tabIndex={0}
              onMouseEnter={() => setActive(node.id)}
              onMouseLeave={() => setActive((a) => (a === node.id ? null : a))}
              onFocus={() => setActive(node.id)}
              onBlur={() => setActive((a) => (a === node.id ? null : a))}
              onClick={() => go(node)}
              onKeyDown={(e) => onKey(e, node)}
              className={`outline-none ${liveNode ? "cursor-pointer" : "cursor-default"}`}
              style={{ opacity: liveNode || hot ? 1 : 0.62 }}
            >
              <rect
                width={NODE_W}
                height={NODE_H}
                rx={14}
                fill={fill}
                stroke={border}
                strokeWidth={hot ? 2.5 : isFoundation ? 2 : 1.5}
                strokeDasharray={liveNode ? undefined : "5 5"}
                className="transition-all duration-300 [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.05))]"
              />
              <text
                x={16}
                y={28}
                fill="var(--primary)"
                fontSize={16}
                fontWeight={700}
              >
                {node.label}
              </text>
              <text x={16} y={47} fill="var(--muted-foreground)" fontSize={10}>
                {node.kicker}
              </text>
              {/* Status dot */}
              <circle
                cx={NODE_W - 16}
                cy={18}
                r={4}
                fill={liveNode ? "var(--post-accent)" : "var(--muted-foreground)"}
                opacity={liveNode ? 1 : 0.5}
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip — HTML overlay positioned over the active node. */}
      {activeNode && (
        <div
          role="status"
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[115%] rounded-lg border border-border bg-background px-3 py-2 text-center shadow-lg"
          style={{
            left: `${((POS[activeNode.id].x + NODE_W / 2) / VIEW_W) * 100}%`,
            top: `${(POS[activeNode.id].y / VIEW_H) * 100}%`,
          }}
        >
          <span className="block text-sm font-semibold text-primary">
            {activeNode.label}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {activeNode.kicker}
          </span>
          <span
            className="mt-1 block text-[10px] font-semibold uppercase tracking-widest"
            style={{
              color: activeLive ? "var(--post-accent)" : "var(--muted-foreground)",
            }}
          >
            {activeLive ? "View lab →" : "Coming soon"}
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 px-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: "#be123c" }}
          />
          Published
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full border border-dashed border-muted-foreground" />
          Planned
        </span>
        <span className="hidden sm:inline">Dashed link = shared topology</span>
      </div>
    </figure>
  );
}
