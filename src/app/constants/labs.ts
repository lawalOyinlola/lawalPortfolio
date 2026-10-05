/**
 * The lab portfolio as a graph: the full narrative (Foundation → tracks),
 * declared once so the interactive map on `/security/labs` can render the whole
 * story before every lab's Markdown exists. A node whose `slug` matches a
 * published lab lights up and becomes clickable; the rest read as "planned".
 *
 * Keep this in sync with `content/labs/*.md` slugs. The map treats a node as
 * live purely by whether its `slug` is in the published set — so shipping a
 * lab's `.md` is all it takes to activate its node.
 */

export type LabEnv = "local" | "cloud";

/**
 * Series are the sections the labs landing page groups into, in this order.
 * A lab joins one by setting `series: "<name>"` in its frontmatter (the name
 * must match exactly). Labs without a series fall to an ungrouped "More" block.
 */
export const LAB_SERIES = [
  {
    name: "Local labs · UTM on Apple Silicon",
    blurb:
      "One isolated network on an M-series Mac. A shared foundation, then offensive and defensive tracks that reuse the same boxes.",
  },
  {
    name: "Cloud labs · Azure",
    blurb:
      "The same discipline in the cloud: securing the AI infrastructure companies are actually deploying.",
  },
] as const;

export type LabNode = {
  id: string;
  label: string;
  /** One-line role, shown under the label and in the tooltip. */
  kicker: string;
  /** Matches a `content/labs/<slug>.md` once the lab is published. */
  slug: string;
  env: LabEnv;
  /** Foundation nodes anchor their environment; tracks branch from them. */
  kind: "foundation" | "track";
};

export type LabEdge = {
  from: string;
  to: string;
  /** A dashed edge is a soft relationship (shared topology), not a hard dependency. */
  soft?: boolean;
};

/**
 * Nodes in reading order. `slug`s for planned labs are the intended final
 * slugs; publishing a lab under that slug activates the node with no code change.
 */
export const LAB_NODES: LabNode[] = [
  {
    id: "foundation",
    label: "Foundation",
    kicker: "UTM, network, Kali setup",
    slug: "apple-silicon-lab-foundation",
    env: "local",
    kind: "foundation",
  },
  {
    id: "pentest",
    label: "Pentest Lab",
    kicker: "Recon to root on a box",
    slug: "building-a-pentest-lab-on-apple-silicon",
    env: "local",
    kind: "track",
  },
  {
    id: "detection",
    label: "Detection & SIEM",
    kicker: "Wazuh, Suricata and FIM",
    slug: "detection-siem-lab",
    env: "local",
    kind: "track",
  },
  {
    id: "phishing",
    label: "Phishing Bridge",
    kicker: "Run it, then detect it",
    slug: "phishing-simulation-lab",
    env: "local",
    kind: "track",
  },
  {
    id: "aisoc",
    label: "AI-Augmented SOC",
    kicker: "Detection, run with AI",
    slug: "ai-augmented-soc",
    env: "local",
    kind: "track",
  },
  {
    id: "cloud-foundation",
    label: "Cloud Foundation",
    kicker: "Azure tenant and logging",
    slug: "azure-lab-foundation",
    env: "cloud",
    kind: "foundation",
  },
  {
    id: "rag",
    label: "RAG Security",
    kicker: "Secure an Azure RAG app",
    slug: "azure-rag-security",
    env: "cloud",
    kind: "track",
  },
];

export const LAB_EDGES: LabEdge[] = [
  { from: "foundation", to: "pentest" },
  { from: "foundation", to: "detection" },
  { from: "detection", to: "phishing" },
  { from: "detection", to: "aisoc" },
  { from: "pentest", to: "phishing", soft: true },
  { from: "cloud-foundation", to: "rag" },
];
