import type { CSSProperties } from "react";
import { getTagColor } from "@/lib/tag-colors";

export default function TagPill({ tag }: { tag: string }) {
  return (
    <li
      className="tag-pill"
      style={{ "--tag": getTagColor(tag) } as CSSProperties}
    >
      <span aria-hidden className="tag-pill-hash">
        #
      </span>
      {tag}
    </li>
  );
}
