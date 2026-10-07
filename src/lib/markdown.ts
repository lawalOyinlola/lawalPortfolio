import fs from "node:fs";
import path from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { visit, SKIP } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root, Element } from "hast";

/**
 * Markdown -> HTML for `/blog` and `/labs`.
 *
 * SECURITY: this pipeline enables raw HTML (`rehype-raw`) so posts can embed
 * inline SVG diagrams. That is safe only because every input is a file we
 * authored in this repo. Never run user-submitted markdown through it.
 */

export type Heading = {
  id: string;
  text: string;
  depth: 2 | 3;
};

export type RenderedMarkdown = {
  html: string;
  headings: Heading[];
};

const prettyCodeOptions: PrettyCodeOptions = {
  // Dual themes emit --shiki-light / --shiki-dark custom properties; globals.css
  // picks between them off the .dark class so code follows the site theme
  // without any client-side rehighlighting.
  theme: { light: "github-light", dark: "github-dark" },
  keepBackground: false,
  // Blocks only. Highlighting inline code wraps every `foo` in extra markup for
  // no visual gain and fights the inline-code styling in globals.css.
  defaultLang: { block: "plaintext" },
};

/**
 * Preserves code-fence metadata across rehype-raw.
 *
 * rehype-raw serialises the tree back to HTML and re-parses it, which drops
 * `node.data.meta` — the ```bash title="x" {2} part of a fence. Copying it onto
 * a real attribute first lets it survive the round trip; rehype-pretty-code
 * reads `metastring` as a fallback for exactly this reason.
 */
const rehypePreserveCodeMeta: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "code") return;
      const meta = (node.data as { meta?: string } | undefined)?.meta;
      if (meta) {
        node.properties = { ...node.properties, metastring: meta };
      }
    });
  };
};

/**
 * Wraps every table in a horizontally scrollable container.
 *
 * Wide reference tables (the troubleshooting list, the screenshot checklist)
 * overflow a phone otherwise. The wrapper scrolls instead of the whole page,
 * and `.table-scroll` in globals.css carries the overflow and the min-width
 * that forces the scroll rather than cramming cells.
 */
const rehypeWrapTables: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "table" || !parent || typeof index !== "number")
        return;

      const wrapper: Element = {
        type: "element",
        tagName: "div",
        properties: { className: ["table-scroll"] },
        children: [node],
      };
      parent.children[index] = wrapper;

      // Don't descend into the table we just moved, and skip revisiting the
      // wrapper (which would re-match the same table forever).
      return [SKIP, index + 1];
    });
  };
};

const PUBLIC_DIR = path.join(process.cwd(), "public");

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/**
 * Inlines theme-aware diagram SVGs in place of the <img> that links them.
 *
 * An SVG loaded through <img> is sealed off from the page, so it cannot see the
 * .dark class. Inlining lets the dg-* classes that scripts/theme-svg.mjs adds be
 * restyled from globals.css, while the file itself keeps its light colours for
 * anywhere it is still linked. Opt-in: only SVGs whose root carries class="dg"
 * are inlined; every other image is left exactly as it was.
 *
 * ids are prefixed per file, because two inlined diagrams on one page would
 * otherwise share an id namespace and a marker could resolve to the wrong one.
 * Must run after rehype-raw, so <img> tags written as raw HTML are seen too.
 */
const rehypeInlineThemedSvg: Plugin<[], Root> = () => {
  return (tree: Root) => {
    // Counts inlined diagrams in this document so each gets a unique id
    // namespace: the same file embedded twice on one page would otherwise emit
    // duplicate ids, and a marker could then resolve to the wrong instance.
    let instance = 0;

    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "img" || !parent || typeof index !== "number") return;
      const src = node.properties?.src;
      if (typeof src !== "string" || !src.startsWith("/images/") || !src.endsWith(".svg"))
        return;

      const file = path.join(PUBLIC_DIR, src);
      if (!file.startsWith(PUBLIC_DIR + path.sep) || !fs.existsSync(file)) return;

      let svg = fs.readFileSync(file, "utf8").replace(/<\?xml[^>]*>\s*/, "");
      const rootTag = svg.match(/<svg\b[^>]*>/)?.[0];
      if (!rootTag || !/\sclass=["'][^"']*\bdg\b/.test(rootTag)) return;

      // Path plus a per-instance counter, and quote-agnostic rewrites, so ids
      // defined with either quote style are prefixed in step with their refs.
      const prefix =
        src.replace(/^\/images\//, "").replace(/\.svg$/, "").replace(/[^a-z0-9]+/gi, "-") +
        `-${instance++}`;
      svg = svg
        .replace(/\sid=(["'])([^"']+)\1/g, (_m, q, id) => ` id=${q}${prefix}-${id}${q}`)
        .replace(/url\(#([^)]+)\)/g, (_m, id) => `url(#${prefix}-${id})`)
        .replace(/href=(["'])#([^"']+)\1/g, (_m, q, id) => ` href=${q}#${prefix}-${id}${q}`);

      const alt = typeof node.properties?.alt === "string" ? node.properties.alt : "";
      const style = typeof node.properties?.style === "string" ? node.properties.style : "";
      const extra =
        ` role="img" aria-label="${escapeAttr(alt)}"` +
        (style ? ` style="${escapeAttr(style)}"` : "");
      svg = svg.replace(/<svg\b/, `<svg${extra}`);

      parent.children[index] = { type: "raw", value: svg };
      return SKIP;
    });
  };
};

/** Collects h2/h3 into a table of contents. Must run after rehype-slug. */
const rehypeCollectHeadings: Plugin<[Heading[]], Root> = (sink) => {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "h2" && node.tagName !== "h3") return;
      const id = typeof node.properties?.id === "string" ? node.properties.id : "";
      if (!id) return;

      let text = "";
      visit(node, "text", (textNode) => {
        text += textNode.value;
      });

      sink.push({
        id,
        text: text.trim(),
        depth: node.tagName === "h2" ? 2 : 3,
      });
    });
  };
};

export async function renderMarkdown(source: string): Promise<RenderedMarkdown> {
  const headings: Heading[] = [];

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypePreserveCodeMeta)
    .use(rehypeRaw)
    .use(rehypeInlineThemedSvg)
    .use(rehypeWrapTables)
    .use(rehypeSlug)
    .use(rehypeCollectHeadings, headings)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: {
        className: ["heading-anchor"],
        ariaLabel: "Link to this section",
      },
      content: { type: "text", value: "#" },
    })
    .use(rehypePrettyCode, prettyCodeOptions)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(source);

  return { html: String(file), headings };
}
