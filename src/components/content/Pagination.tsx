"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";

/**
 * Page controls for the index lists. Renders nothing until there is a second
 * page, so a short list stays a plain list and the controls switch on by
 * themselves once enough has been published to need them.
 */
export default function Pagination({
  page,
  pageCount,
  onChange,
  label,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  /** What is being paged, for the landmark name: "Posts", "Labs". */
  label: string;
}) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <nav
      aria-label={`${label} pages`}
      className="mt-6 flex flex-wrap items-center justify-between gap-4"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="page-step group"
      >
        <ArrowLeftIcon
          weight="bold"
          aria-hidden
          className="size-3.5 transition-transform duration-200 group-enabled:group-hover:-translate-x-0.5"
        />
        Previous
      </button>

      <ol className="flex items-center gap-1">
        {pages.map((n) => (
          <li key={n}>
            <button
              type="button"
              onClick={() => onChange(n)}
              aria-current={n === page ? "page" : undefined}
              aria-label={`Page ${n}`}
              className={`page-chip ${n === page ? "page-chip-active" : ""}`}
            >
              {String(n).padStart(2, "0")}
            </button>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
        className="page-step group"
      >
        Next
        <ArrowRightIcon
          weight="bold"
          aria-hidden
          className="size-3.5 transition-transform duration-200 group-enabled:group-hover:translate-x-0.5"
        />
      </button>
    </nav>
  );
}
