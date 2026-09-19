import { cn } from "@/lib/utils";
import CodeCopyButtons from "./CodeCopyButtons";
import ImageZoom from "./ImageZoom";

/**
 * Renders markdown that has already been compiled to HTML by `renderMarkdown`.
 * The HTML comes from files in this repo only — see the note in src/lib/markdown.ts.
 */
export default function Prose({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div
        data-prose
        className="prose"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted, repo-authored markdown
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <CodeCopyButtons />
      <ImageZoom />
    </div>
  );
}
