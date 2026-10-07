# Imagery

Rules for every image in a blog post or lab: the cover, the diagrams, and the
dark and light variants used elsewhere. They exist because each one was broken
at least once. [blogging.md](blogging.md) covers where files go and how they
reach dev.to; this covers what they should be.

---

## Every post has its own look

Each post gets a cover and a diagram style chosen together, so the post reads
as one piece and looks different from its neighbours on the index.

- Pick the diagram style from the cover's subject or palette, not from a house
  template. The amber meter cover gets utility-bill diagrams; the inspection-tag
  cover gets typewritten forms.
- Within one post, every diagram uses the same style.
- Do not restyle an existing post's diagrams to match a newer post.

| Post | Cover | Diagram style |
| --- | --- | --- |
| `prompt-injection-is-an-authority-problem` | UV torch on a letter, dark desk | navy, cream line art, purple accent |
| `the-ai-feature-that-bills-you` | brass meter, amber glow | printed statements, charcoal and amber |
| `the-skill-you-installed` | signpost into fog, inspection tag | typewritten forms on kraft, green and rust stamps |
| `the-three-questions-at-2am` | risograph corner shop | paper and navy ink, red accent, receipt |
| `what-my-waf-actually-blocked` | airport checkpoint at night | security signage, navy and signal yellow |
| `ethical-hacking-is-not-a-toolset` | lock picks and a signed letter | white report cards, navy, mustard and red |
| `from-zero-to-tech-lead` | gouache illustration, desk at night | no diagrams; real screenshots only |

Add a row when a post gets its imagery.

---

## Covers

- **Size:** 2752×1536 (16:9). The site crops covers to 16:9, so anything
  wider loses its sides. Never ship a cover under 2000px wide.
- **Format:** JPEG at quality 80, which lands between about 0.7 and 1.6 MB.
  Keep it `.jpg` or `.png`; it is also the social card.
- **Path:** `public/images/blog/<slug>/coverimage.jpg`.
- **Headline:** one short line taken from the post, top left, in large type.
  Not the post's title, which the page already shows beside it.
- **No other readable text.** Image generators garble body text, so screens,
  letters, receipts and clock faces must be abstract. Clocks have hands only.
- **No logos, brand marks or real company names**, and nothing that suggests
  a real company the post deliberately does not name.
- **The cover is not a diagram.** If a diagram appears in the post, it must not
  also be the cover.
- **`coverAlt` describes the image you actually got**, including the headline,
  not the prompt you wrote. Rewrite it whenever the cover changes.

End every generation prompt with:

```text
No other readable text anywhere in the image, and no logos or brand marks.
```

---

## Diagrams

### Files

- **Commit the SVG source next to the PNG**, with the same name. Edit the SVG
  and re-render the PNG; never edit the PNG.
- **Link the PNG in the post, not the SVG.** dev.to copies a PNG once; an SVG
  is hotlinked from the site on every view.
- **16:9**, as a `viewBox` of `1600 900` or `960 540`, rendered to a PNG
  2400×1350.
- Render with headless Chrome (scale 1.5 for a 1600-wide viewBox, 2.5 for 960):

  ```bash
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
    --disable-gpu --hide-scrollbars --force-device-scale-factor=1.5 \
    --window-size=1600,900 --screenshot="$PWD/name.png" "file://$PWD/name.svg"
  ```

- **Look at every render before using it.** Labels collide, text runs off the
  panel and repeated spaces collapse. In SVG, use `&#160;` to keep columns
  aligned; `xml:space` is not enough in Chrome.

### Content

- **Every number and claim in a diagram matches the post exactly.** A diagram
  repeating a line the post itself corrects is the worst kind of error, because
  it looks like evidence. Re-read the post's numbers before drawing.
- **Shape only encodes data when it means something.** Badges and bars that
  are not measuring anything are all the same width.
- **Be exact about what was tested.** "Legit PATCH blocked by the method rule",
  not "PATCH and DELETE blocked" when only PATCH was tested.
- **Name things for what they are.** A table is not a curve.
- **Sentence case.** Any full sentence starts with a capital, including after a
  full stop. Short labels may be lowercase when that is the post's style.
- **No em dashes**, the same as the prose.
- **"They" for a generic person** (a hacker, an attacker, a user), never "he".
- **No invented figures**, no prices, no dollar amounts that the post does not
  source.
- **Fonts that exist everywhere:** `Helvetica, Arial, sans-serif`, and
  `SFMono-Regular, Menlo, Consolas, Courier New, monospace` for code and digits.

### Alt text

Describe what the diagram shows, including its numbers and conclusion, so a
reader who cannot see it gets the same finding. A title is not alt text.
Update it whenever the diagram changes.

---

## Diagrams that follow the site theme

Lab diagrams have no background, so the page shows through, and their dark
ink would vanish on a dark page. Instead of a second file, one SVG carries
classes that the site restyles under `.dark`:

```bash
node scripts/theme-svg.mjs public/images/labs/<lab>/*.svg          # tag them
node scripts/theme-svg.mjs --check public/images/labs/<lab>/*.svg  # verify
```

- The script adds `class="dg"` to the root and a `dg-<kind>-<role>` class
  (`t` text, `f` fill, `s` stroke) to every element whose colour must change.
  The original colours stay, so the file is still the light version anywhere
  CSS cannot reach it: an `<img>`, GitHub, an editor.
- The markdown renderer inlines any linked SVG whose root has `class="dg"`, so
  the classes can see the page's `.dark` class. Posts keep linking the file
  as normal; nothing in the Markdown changes.
- The dark colours live once, in `globals.css`, shared by every lab. A colour
  the script does not know is reported and left alone: add it to `ROLES` in
  the script and a rule in `globals.css`, then run it again.
- Solid boxes and the light text on them are deliberately left unclassed; they
  read the same on either page.
- Converted so far: the Foundation lab. Convert the rest one lab at a time.

Blog diagrams do not need this: each has its own background and is linked as
a PNG, which dev.to copies.

---

## Dark and light variants

When a diagram is used outside the blog, for example in a GitHub README that
follows the viewer's colour scheme, keep both as
`<name>-dark.svg` and `<name>-light.svg` beside the blog PNG. Change both
together; a fix in one and not the other is a bug.

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="name-dark.svg">
  <img alt="..." src="name-light.svg">
</picture>
```

---

## Changing images on a published post

Follow [Replacing an image](blogging.md#replacing-an-image), which comes down
to:

- **New filename** for any changed PNG or JPEG (`diagram-v2.png`), or dev.to
  keeps showing the old one.
- **Delete the old PNG or JPEG** in the same commit.
- **Keep an old SVG** until the post has been synced and the dev.to copy shows
  the new image, then delete it in a follow-up commit.
- Set `updated:` in the frontmatter, deploy, then `pnpm sync:devto --only <slug>`.

---

## Compressing

```bash
sips -s format jpeg -s formatOptions 80 in.jpg --out coverimage.jpg   # cover
```

Generated covers come out at about 2.7 MB; this keeps the full 2752×1536 at
roughly a third of the size.
