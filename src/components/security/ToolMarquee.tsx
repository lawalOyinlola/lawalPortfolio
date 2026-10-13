"use client";

import { useState } from "react";
import { PauseIcon, PlayIcon } from "@phosphor-icons/react";

/**
 * A running strip of what the labs actually used: the tools from each lab's
 * frontmatter and the CVEs it exploited, so the list grows as labs ship.
 *
 * It moves for longer than five seconds, so it carries its own pause button
 * as well as pausing on hover; reduced motion never moves it at all (see
 * `.marquee-track` in globals.css).
 */
export default function ToolMarquee({ items }: { items: string[] }) {
  const [paused, setPaused] = useState(false);

  if (items.length === 0) return null;

  const copy = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      aria-label={hidden ? undefined : "Tools and CVEs from the labs"}
      className="flex shrink-0 items-center"
    >
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center whitespace-nowrap font-mono text-xs uppercase tracking-widest text-background/55 md:text-sm"
        >
          <span
            className={item.startsWith("CVE-")
                ? "text-[#fb7185] dark:text-[#be123c]"
                : undefined}
          >
            {item}
          </span>
          <span aria-hidden className="px-5 text-background/25 md:px-7">
            /
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee relative flex items-center gap-3 border-y border-background/10 py-4">
      <div className="relative min-w-0 flex-1 overflow-hidden mask-[linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div
          className="marquee-track flex w-max"
          style={paused ? { animationPlayState: "paused" } : undefined}
        >
          {copy(false)}
          {copy(true)}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Play the tool list" : "Pause the tool list"}
        className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-background/50 transition-colors duration-200 hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background motion-reduce:hidden"
      >
        {paused ? (
          <PlayIcon weight="fill" className="size-3.5" />
        ) : (
          <PauseIcon weight="fill" className="size-3.5" />
        )}
      </button>
    </div>
  );
}
