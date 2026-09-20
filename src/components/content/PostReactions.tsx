"use client";

import { useEffect, useState } from "react";
import {
  ChatCircleIcon,
  HeartIcon,
  LinkSimpleIcon,
  CheckIcon,
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

export default function PostReactions({
  slug,
  title,
  devtoUrl,
}: {
  slug: string;
  title: string;
  devtoUrl: string | null;
}) {
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reading in an effect rather than in useState keeps the server and the
  // first client render identical; storage is unavailable in private windows
  // and can throw outright, so a failure just means the default state.
  useEffect(() => {
    try {
      setLiked(localStorage.getItem(STORAGE_PREFIX + slug) === "1");
    } catch {
      /* no storage, no memory of a like: not worth surfacing */
    }
  }, [slug]);

  function toggleLike() {
    setLiked((current) => {
      const next = !current;
      try {
        if (next) localStorage.setItem(STORAGE_PREFIX + slug, "1");
        else localStorage.removeItem(STORAGE_PREFIX + slug);
      } catch {
        /* the button still reflects the click for this session */
      }
      return next;
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${BRAND.url}/blog/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard denied: the address bar still has the URL */
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
          className={liked ? "scale-110 transition-transform" : "transition-transform"}
        />
        {liked ? "Liked" : "Like this"}
      </button>

      <a href={discussHref} {...(devtoUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="reaction-chip">
        <ChatCircleIcon size={15} weight="bold" aria-hidden />
        {devtoUrl ? "Discuss on dev.to" : "Reply by email"}
      </a>

      <button type="button" onClick={copyLink} className="reaction-chip">
        {copied ? (
          <CheckIcon size={15} weight="bold" aria-hidden />
        ) : (
          <LinkSimpleIcon size={15} weight="bold" aria-hidden />
        )}
        {copied ? "Link copied" : "Copy link"}
      </button>

      <p className="w-full text-xs leading-relaxed text-muted-foreground sm:w-auto sm:pl-2">
        Likes are saved in your browser only.
      </p>
    </div>
  );
}
