import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root } from "hast";

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
