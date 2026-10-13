"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ChatCircleIcon,
  HeartIcon,
  LinkSimpleIcon,
  CheckIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { BRAND } from "@/app/constants";

/**
 * Reader actions at the foot of a post.
 *
 * The like is stored in this browser and nowhere else, so there is no count to
 * show and none is invented: a filled heart means you marked it, and it will
 * still be filled when you come back. When the API behind this exists the
 * storage call is the only line that has to change.
 *
 * Discussion deliberately points at the syndicated thread rather than a
 * comment box that posts nowhere.
 */

const STORAGE_PREFIX = "post-liked:";

// The storage event only fires for writes from other tabs, which keeps a like
// made in one tab in step with the same post open in another.
function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export default function PostReactions({
  slug,
  title,
  devtoUrl,
}: {
  slug: string;
  title: string;
  devtoUrl: string | null;
}) {
  // The server snapshot keeps the server and the first client render
  // identical; React swaps in the stored value once hydration is done.
  // Storage is unavailable in private windows and can throw outright, so a
  // failure just means the default state.
  const stored = useSyncExternalStore(
    subscribeToStorage,
    () => {
      try {
        return localStorage.getItem(STORAGE_PREFIX + slug) === "1";
      } catch {
        /* no storage, no memory of a like: not worth surfacing */
        return false;
      }
    },
    () => false,
  );
  // A click this session wins over storage, so the button still answers when
  // the write fails. Keyed by slug so it never leaks onto another post.
  const [clicked, setClicked] = useState<{
    slug: string;
    liked: boolean;
  } | null>(null);
  const liked = clicked?.slug === slug ? clicked.liked : stored;
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  // The write stays outside the state updater: React is free to call an
  // updater more than once, and a function that touches storage cannot be
  // replayed safely.
  function toggleLike() {
    const next = !liked;
    setClicked({ slug, liked: next });
    try {
      if (next) localStorage.setItem(STORAGE_PREFIX + slug, "1");
      else localStorage.removeItem(STORAGE_PREFIX + slug);
    } catch {
      /* the button still reflects the click for this session */
    }
  }

  function flashCopyState(state: "copied" | "failed") {
    setCopyState(state);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState("idle"), 4000);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${BRAND.url}/blog/${slug}`);
      flashCopyState("copied");
    } catch {
      // Clipboard access is refused outright in some browsers and over plain
      // HTTP. Saying so beats a button that looks like it worked.
      flashCopyState("failed");
    }
  }

  const discussHref =
    devtoUrl ??
    `mailto:${BRAND.email}?subject=${encodeURIComponent(`Re: ${title}`)}`;

  return (
    <div className="mt-16 flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={toggleLike}
        aria-pressed={liked}
        className={`reaction-chip ${liked ? "reaction-chip-active" : ""}`}
      >
        <HeartIcon
          size={15}
          weight={liked ? "fill" : "bold"}
          aria-hidden
          className={
            liked ? "scale-110 transition-transform" : "transition-transform"
          }
        />
        {liked ? "Liked" : "Like this"}
      </button>

      <a
        href={discussHref}
        {...(devtoUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="reaction-chip"
      >
        <ChatCircleIcon size={15} weight="bold" aria-hidden />
        {devtoUrl ? "Discuss on dev.to" : "Reply by email"}
      </a>

      <button
        type="button"
        onClick={copyLink}
        className={`reaction-chip ${copyState === "failed" ? "reaction-chip-failed" : ""}`}
      >
        {copyState === "copied" && (
          <CheckIcon size={15} weight="bold" aria-hidden />
        )}
        {copyState === "failed" && (
          <WarningIcon size={15} weight="bold" aria-hidden />
        )}
        {copyState === "idle" && (
          <LinkSimpleIcon size={15} weight="bold" aria-hidden />
        )}
        {copyState === "copied"
          ? "Link copied"
          : copyState === "failed"
            ? "Copy failed"
            : "Copy link"}
      </button>

      {/* A label change inside a button is not reliably announced, so the
          outcome gets its own live region. */}
      <p
        role="status"
        className="w-full text-xs leading-relaxed text-muted-foreground sm:w-auto sm:pl-2"
      >
        {copyState === "failed"
          ? "Could not reach the clipboard. Copy the address from the address bar."
          : copyState === "copied"
            ? "Link copied to your clipboard."
            : "Likes are saved in your browser only."}
      </p>
    </div>
  );
}
