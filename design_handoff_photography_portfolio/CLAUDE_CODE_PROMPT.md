# Claude Code Prompt — Paste this in

Run Claude Code in your repo root (the one with auto-deploy already wired up). Then paste the entire fenced block below as a single prompt.

---

```
I have an updated design handoff for the photography portfolio. The bundle lives
in ./design_handoff_photography_portfolio/ — please:

1. READ design_handoff_photography_portfolio/README.md end-to-end. It has the
   full spec: layout, design tokens, typography, interactions, content shape,
   and the shared-template pattern used for category pages.

2. INSPECT the existing repo to understand the production setup:
   - Framework (Next.js / Astro / plain HTML / etc.)
   - Existing layout primitives, CSS approach (Tailwind / CSS modules / globals)
   - Build/deploy config (vercel.json, next.config.js, etc.)
   - Current entry route(s)

3. INTEGRATE — recreate the design in the repo's framework. Do NOT copy the HTML
   files verbatim. Specifically:

   PAGES
   - Landing page (`/`) — V2 Cinematic. Single full-bleed photo, right-side
     category rail, bottom-left meta block, frame counter background numeral,
     scrubber. Responsive: <768px collapses to bottom category strip + compact
     meta (subline removed on mobile entirely).
   - Five category pages — Portraits / Culinary / Spaces / Objects / Motion.
     ALL built from a SINGLE shared template. Each page is just a route that
     loads its own data file (assigns `window.KS_CATEGORY` in the prototype —
     in your framework, this is just a typed module import).

   SHARED CATEGORY TEMPLATE (the important part)
   The category page has these sections, in order:
   - Sticky top bar — wordmark + breadcrumb (Index / 02 · Culinary) on the
     left; single "Info" link on the right. Top bar fades to glass on scroll.
   - Hero — full-viewport letterboxed section with the category name in big
     italic serif, a stats line (frames · projects · year span), and a scroll
     hint.
   - Intro paragraph — two-column on desktop, single column on mobile.
   - Editorial flow — ten row layouts mixing rhythm:
     full-bleed / asym (large + 2 smalls) / centered-tall (with side captions
     and a big italic frame number) / three-up / pull-quote /
     full-bleed-pano / diptych / duo / offset (image + italic text) /
     closing full-bleed.
   - Projects grid — 2 columns desktop, 1 column mobile. Each card: cover,
     title (serif w/ italic subtitle), year + location + frame count, blurb.
   - Footer — 3 columns desktop, stacked mobile.

   CRITICAL SPACING + ALIGNMENT RULES (these were tuned painstakingly)
   - Photo-to-photo vertical gap on mobile is exactly 32px (--gap and
     row margin-bottom unified).
   - Captions are ONE line with ellipsis truncation — no wrapping allowed,
     so spacing stays uniform regardless of caption length.
   - The asym row's small-stack must stretch to match the height of the large
     image (align-items: stretch on the row, justify-content: space-between on
     the small-stack). This makes card 02 (large) and card 04 (bottom small)
     end at the same y-coordinate.
   - The centered-tall row's side columns must NOT have padding-bottom — they
     align flush with the center column's caption (align-items: end on the row).
   - The big italic number on the centered-tall row's left side is the FRAME
     index (zero-padded), not a hardcoded value from the data file.

   TOKENS, TYPE, COLORS — recreate using the codebase's existing system
   (Tailwind config, CSS variables, theme object — whatever's in use). The
   README has every value.

   TWEAKS PANEL — strip entirely. Design-tool only.

4. PRESERVE the design fidelity exactly. Match colors, font sizes, spacing,
   transitions. The README spells everything out — use it as ground truth,
   not the HTML literals.

5. PLACEHOLDER PHOTOS — frames currently render tinted background divs. Keep
   that as the fallback when no `image` field is provided in a frame's data,
   and add support for a real `image` URL per frame.

6. RESPONSIVE BREAKPOINTS
   - Mobile: <768px — full bottom-stack collapse on landing; single-column on
     category pages; subline removed on landing mobile.
   - Tablet: 768–1023px — uses the wider grid but the centered-tall side
     captions are hidden (display:none) at this width.
   - Desktop: ≥1024px — full layout with side captions visible.

7. COMMIT with a clear message and PUSH so the auto-deploy picks it up.

If anything in the spec is ambiguous or conflicts with an established pattern
in this repo, ASK before guessing. Prefer the repo's conventions over the HTML
literals for non-design matters (file structure, imports, etc).

Reference files (read but don't ship verbatim):
- design_handoff_photography_portfolio/README.md                  ← spec
- design_handoff_photography_portfolio/src/landing.css            ← landing styles
- design_handoff_photography_portfolio/src/landing.jsx            ← landing component
- design_handoff_photography_portfolio/src/data.js                ← landing categories data
- design_handoff_photography_portfolio/src/category.css           ← shared category styles
- design_handoff_photography_portfolio/src/category.jsx           ← shared category template
- design_handoff_photography_portfolio/src/<slug>-data.js         ← per-category content
  (culinary, portraits, spaces, objects, motion)
- design_handoff_photography_portfolio/src/Culinary.html etc.     ← page scaffolding (context only)
```

---

## How to run this end-to-end

1. **Download** the `design_handoff_photography_portfolio/` folder from this
   chat (the download card is right above).
2. **Unzip** it into the root of your local repo — so the folder sits next to
   your existing code at `<repo-root>/design_handoff_photography_portfolio/`.
3. **Open Claude Code** in your repo root (`claude` in your terminal, or via the
   Claude Code app).
4. **Paste the fenced block above** as your first message.
5. Claude Code will read the README, inspect your repo, and start implementing.
   It may ask clarifying questions about framework conventions — answer those
   and let it proceed.
6. When it commits + pushes, your Vercel auto-deploy will kick off as usual.

## After Claude Code finishes

1. Spot-check the dev server. Verify:
   - Right rail toggles categories on the landing
   - Arrow keys (← → and ↑ ↓) work on the landing
   - Each category page hero loads and the editorial flow renders cleanly
   - Mobile layout collapses correctly at <768px
2. If something looks off vs. the design preview, paste a side-by-side screenshot
   back into Claude Code and ask for an adjustment.

## If you're starting fresh (no app code yet)
Prepend this to the prompt:

```
The repo is empty — scaffold a Next.js 14 app router project with Tailwind, then
implement the design per the spec below.
```
