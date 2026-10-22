"use client";

import { useCallback, useSyncExternalStore } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { PostTile, type PostSummary } from "@/components/content/PostCard";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useRatchet } from "@/hooks/useRatchet";

/**
 * The /security Writing row as a carousel that moves like a ratchet, whether
 * it's dragged or stepped with the buttons and arrow keys (see useRatchet).
 */
export default function WritingCarousel({ posts }: { posts: PostSummary[] }) {
  const [viewportRef, api] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    duration: 12,
  });
  const { prefersReducedMotion } = usePrefersReducedMotion();
  const step = useRatchet(api, prefersReducedMotion);

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!api) return () => {};
      api.on("select", onChange).on("reInit", onChange);
      return () => {
        api.off("select", onChange).off("reInit", onChange);
      };
    },
    [api],
  );
  const selected = useSyncExternalStore(
    subscribe,
    () => api?.selectedScrollSnap() ?? 0,
    () => 0,
  );
  const snapCount = useSyncExternalStore(
    subscribe,
    () => api?.scrollSnapList().length ?? 0,
    () => 0,
  );
  const canPrev = selected > 0;
  const canNext = selected < snapCount - 1;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Security writing"
      tabIndex={0}
      onKeyDownCapture={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          step(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
      className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <div ref={viewportRef} className="overflow-hidden">
        <div className="-ml-8 flex touch-pan-y">
          {posts.map((post, i) => (
            <div
              key={post.slug}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${posts.length}`}
              className="min-w-0 shrink-0 grow-0 basis-[85%] pl-8 sm:basis-1/2 lg:basis-1/3"
            >
              <div className="ratchet-slide">
                <PostTile post={post} index={i} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {posts.length > 1 && (
        <div className="mt-10 flex items-center justify-between gap-6">
          {/* One notch per stop, like the teeth on the ratchet. */}
          <div aria-hidden className="flex items-center gap-1.5">
            {Array.from({ length: snapCount }, (_, i) => (
              <span
                key={i}
                className={`h-3 w-1 transition-colors duration-200 ${
                  i === selected ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={!canPrev}
              aria-label="Previous posts"
              className="flex size-10 cursor-pointer items-center justify-center border border-border text-primary transition-colors duration-200 hover:bg-primary hover:text-background disabled:cursor-default disabled:text-muted-foreground/50 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <CaretLeftIcon weight="bold" className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={!canNext}
              aria-label="Next posts"
              className="flex size-10 cursor-pointer items-center justify-center border border-border text-primary transition-colors duration-200 hover:bg-primary hover:text-background disabled:cursor-default disabled:text-muted-foreground/50 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <CaretRightIcon weight="bold" className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
