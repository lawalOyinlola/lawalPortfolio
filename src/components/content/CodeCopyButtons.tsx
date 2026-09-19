"use client";

import { useEffect } from "react";

/**
 * Adds a copy button to every code block after hydration.
 *
 * The markdown pipeline emits an HTML string, so there's no React element to
 * wrap — this attaches to the rendered DOM instead. Without JS the code blocks
 * are still complete and selectable, so nothing is lost.
 */
export default function CodeCopyButtons() {
  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLPreElement>("[data-prose] pre");
    const cleanups: (() => void)[] = [];

    blocks.forEach((block) => {
      if (block.dataset.copyReady === "true") return;
      block.dataset.copyReady = "true";
      block.classList.add("relative", "group");

      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Copy";
      button.setAttribute("aria-label", "Copy code to clipboard");
      button.className =
        "absolute right-2 top-2 rounded-md border border-border/40 bg-background/80 px-2 py-1 text-[0.7rem] uppercase tracking-wide text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100";

      let resetTimer: ReturnType<typeof setTimeout>;

      const onClick = async () => {
        const code = block.querySelector("code")?.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = "Copied";
        } catch {
          button.textContent = "Failed";
        }
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          button.textContent = "Copy";
        }, 2000);
      };

      button.addEventListener("click", onClick);
      block.appendChild(button);

      cleanups.push(() => {
        clearTimeout(resetTimer);
        button.removeEventListener("click", onClick);
        button.remove();
        delete block.dataset.copyReady;
      });
    });

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, []);

  return null;
}
