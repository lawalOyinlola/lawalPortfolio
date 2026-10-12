"use client";

import { ArrowDownIcon, ArrowUpIcon } from "@phosphor-icons/react";

export type SortDir = "asc" | "desc";

/**
 * One sortable field. A field is *directional* when it names both an ascending
 * and a descending order (Date → Newest/Oldest); clicking it while it is active
 * flips the order and the label follows. A field with no asc/desc is a fixed
 * order (Labs' grouped "Series" view), so it never shows an arrow.
 */
export type SortOption = {
  key: string;
  label: string;
  asc?: string;
  desc?: string;
  defaultDir?: SortDir;
};

export function defaultDirFor(option: SortOption): SortDir {
  return option.defaultDir ?? "desc";
}

/**
 * Sort toggles for the index pages. Picking a new field selects it in its
 * natural direction; clicking the field that is already active reverses it.
 * Mirrors the tag filters next to it, but neutral: these order results, they
 * don't carry a topic accent.
 */
export default function SortControl({
  options,
  sortKey,
  sortDir,
  onChange,
}: {
  options: SortOption[];
  sortKey: string;
  sortDir: SortDir;
  onChange: (key: string, dir: SortDir) => void;
}) {
  return (
    <div role="group" aria-label="Sort" className="mt-3 flex flex-wrap gap-1.5">
      {options.map((option) => {
        const isActive = option.key === sortKey;
        const directional = Boolean(option.asc && option.desc);
        const dirLabel =
          isActive && directional
            ? sortDir === "asc"
              ? option.asc
              : option.desc
            : null;

        function handleClick() {
          if (!isActive) {
            onChange(option.key, defaultDirFor(option));
          } else if (directional) {
            onChange(option.key, sortDir === "asc" ? "desc" : "asc");
          }
        }

        const accessibleName = directional
          ? isActive
            ? `Sorted by ${option.label}, ${dirLabel} first. Activate to reverse.`
            : `Sort by ${option.label}`
          : `Sort by ${option.label}`;

        return (
          <button
            key={option.key}
            type="button"
            onClick={handleClick}
            aria-pressed={isActive}
            aria-label={accessibleName}
            className={`sort-chip ${isActive ? "sort-chip-active" : ""}`}
          >
            {option.label}
            {dirLabel && (
              <>
                <span className="opacity-55">· {dirLabel}</span>
                {sortDir === "asc" ? (
                  <ArrowUpIcon size={11} weight="bold" aria-hidden />
                ) : (
                  <ArrowDownIcon size={11} weight="bold" aria-hidden />
                )}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
