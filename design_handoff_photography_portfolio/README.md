# Handoff: Photography Portfolio Landing Page

## Overview
The landing page for **Kshetej Sareen** — an independent photographer. A single full-bleed page that lets a visitor browse five categories of work (Portraits, Culinary, Spaces, Objects, Motion) by clicking through a right-side category rail. Each category contains 2–5 "frames" the visitor can step through with arrow keys. Dark, editorial, gallery-quality. Direction internally codenamed "V2 Cinematic Selects."

## About the design files
The files under `src/` are **design references created in HTML + inline-Babel JSX** — a working prototype that demonstrates the intended look, layout, and behaviour. They are not meant to be shipped verbatim. The task is to recreate this design in the target codebase using its established patterns (Next.js, Astro, plain HTML — whatever is in the repo).

If the repo is already plain static HTML, the files **do work as-is** and can be dropped in directly. For a Next.js / React app, port `landing.jsx` into a proper component, replace the in-browser Babel with a real build, and move CSS into modules or globals as appropriate.

## Fidelity
**High-fidelity.** Exact colors, type scales, spacing, and interactions are specified. Recreate pixel-perfectly using the codebase's existing libraries and patterns. Photo content is placeholder — real imagery is expected to slot in.

## Page anatomy

The whole experience is one fixed-viewport page (`position: fixed; inset: 0`). All elements are positioned absolutely against this stage.

### Z-stack (back → front)
1. **Photo layer** — one `.frame` div per (category × frame), all stacked. Only the active one has `opacity: 1`; others `opacity: 0`. 600ms ease transition.
2. **Background frame numeral** — giant italic serif "01"/"02" etc., 220px, ~4.5% opacity. Pure decoration; toggleable via tweak.
3. **Cinemascope letterboxes** — solid `--ink` bars top + bottom, 56px each on desktop, 36px on mobile.
4. **Top bar** — wordmark left, top-nav right.
5. **Right category rail** (desktop) / **bottom category strip** (mobile).
6. **Step-hint arrows** (desktop only, fade in on stage hover).
7. **Bottom-left meta block** — eyebrow pill, big stacked name, subline.
8. **Bottom-right slate** (desktop) — subject · location · year · gear. Embedded inline into meta on mobile.
9. **Scrubber bar** — single 1px horizontal line, fills proportionally with frame index.
10. **Footer corner labels** (desktop).

### Layout — Desktop (≥768px)
- Top letterbox: `top:0 left:0 right:0 height:56px` solid `--ink`
- Top bar: `top:56px left:0 right:0`, padding `32px 56px`, flex space-between
- Right rail: `right:56px top:0 bottom:0`, flex column, centered, gap 22, grid per item `24px 120px 32px`
- Meta block: `left:56px bottom:96px max-width:720px`
- Right slate: `right:56px bottom:96px`, text-align right
- Scrubber: `left:56px right:56px bottom:72px`, height 1px
- Step hints: `top:50% transform:translateY(-50%)`, `.prev{left:12px} .next{right:240px}`, opacity 0 → 1 on `.stage:hover`
- Footer-l / footer-r: `bottom:32px`

### Layout — Mobile (<768px)
- Letterboxes 36px (status-area-ish at top)
- Top bar `padding:18px 22px top:36px`. Only the "Menu +" link visible (other nav items hidden).
- Category rail moves to `position:absolute bottom:88px left:0 right:0`, flex-direction row, padding `0 22px`, justify-content space-between
- Category items become column-flex with mono uppercase labels; active item gets a 22×1px line underneath
- Meta block `left:22px right:22px bottom:156px`, slate folds in as a third inline block under the subline
- Scrubber: `left:22px right:22px bottom:140px`
- Footer corners and side step hints: hidden
- Counter: 110px, `right:16px top:30%`

## Design tokens

### Colors (palette: Ink — default)
```
--ink:        #0b0b0c   /* background */
--paper:      #ece8e0   /* primary foreground */
--paper-dim:  #c8c4ba   /* secondary foreground */
--mute:       #8a857d   /* tertiary / labels */
--rule:       rgba(236, 232, 224, 0.16)   /* divider */
--rule-2:     rgba(236, 232, 224, 0.32)   /* divider on dark */
```

### Alternate palettes (set via class on `.stage`)
- `.theme-black`: `--ink:#000000  --paper:#f4f1ea`
- `.theme-sepia`: `--ink:#14110d  --paper:#e8dfc9`

### Typography
- **Display serif** — Bodoni Moda (Google Fonts), weights 400/500, ital 400/500
- **UI sans** — Helvetica Neue, Helvetica, Arial
- **Mono / labels** — JetBrains Mono (Google Fonts), 400/500

| Use | Family | Size | Weight | Letter-spacing | Notes |
|---|---|---|---|---|---|
| Hero name | Bodoni Moda | `clamp(48px, 9.5vw, 124px)` | 400 | -0.035em | line-height 0.94, last name italic + `--paper-dim` |
| Category name | Bodoni Moda | 18px | 400 | 0.01em | active = `--paper`, idle = rgba(236,232,224,0.4) |
| Eyebrow / labels | JetBrains Mono | 10.5px | 400 | 0.22em | uppercase, color `--mute` |
| Subline text | Helvetica Neue | 13px | 400 | normal | line-height 1.5, color `--paper-dim` |
| Slate | JetBrains Mono | 10.5px | 400 | 0.22em | uppercase, color `--mute`, subject in `--paper` |
| Background numeral | Bodoni Moda italic | 220px (desktop) / 110px (mobile) | 400 | -0.04em | opacity 0.045 |
| Wordmark "Ks" | Bodoni Moda italic | 28px (desktop) / 22px (mobile) | 400 | -0.02em ||

### Spacing & misc
- Outer padding: 56px desktop / 22px mobile
- Letterbox: 56px / 36px
- Frame fade transition: 600ms ease
- Scrubber fill transition: 600ms cubic-bezier(.22,.61,.36,1)
- Pulsing live-dot animation: 2.2s ease-in-out infinite, scale 1→0.6 + opacity 1→0.4

## Interactions

| Interaction | Behavior |
|---|---|
| Click category in rail | Set `catIdx`, reset `frameIdx` to 0; photo crossfades over 600ms, meta + slate + scrubber update |
| Click step-hint `←` / `→` | Step `frameIdx` within current category (wraps) |
| `ArrowLeft` / `ArrowRight` | Same as step hints |
| `ArrowUp` / `ArrowDown` | Cycle categories (wraps) |
| Hover anywhere on stage | Side step-hints fade in (200ms) |
| Live dot in eyebrow | Pulses continuously |
| Autoplay tweak on | Frames advance every 4200ms via `setInterval` |

## State (React)
```js
const [catIdx, setCatIdx] = useState(0);
const [frameIdx, setFrameIdx] = useState(0);
// When catIdx changes, useEffect resets frameIdx to 0
```

Plus the Tweaks object (preview-only — strip this from production unless you want a live theming UI):
```js
{ palette: "ink", letterbox: true, showCounter: true, showSlate: true,
  nameStyle: "stacked", navPosition: "rail", autoplay: false }
```

## Content
All copy and frame metadata live in `src/data.js` under `window.KS_CATEGORIES`. Each entry:
```js
{
  id: "portraits",
  n: "01",
  name: "Portraits",
  tint: "#1d1c1a",           // ambient photo placeholder bg
  frames: [
    { subj, loc, year, gear }, ...
  ]
}
```
Replace placeholder slots with real photos by adding an `image` field per frame and rendering `<img>` instead of (or behind) the tinted `.frame` div.

## Assets
- **Fonts** — Google Fonts (Bodoni Moda + JetBrains Mono). No license to manage.
- **Photos** — none yet. Tinted divs are placeholders. Drop real imagery into `public/photos/` (or equivalent) and wire into `data.js`.

## Files in this bundle (under `src/`)

### Landing page
- `index.html` — production entry (root route)
- `Landing Page.html` — identical content; the design-tool working copy
- `landing.css` / `landing.jsx` / `data.js`

### Category pages (one per category — all built on the same template)
- `Portraits.html` + `portraits-data.js`
- `Culinary.html` + `culinary-data.js`
- `Spaces.html` + `spaces-data.js`
- `Objects.html` + `objects-data.js`
- `Motion.html` + `motion-data.js`
- `category.jsx` / `category.css` — the shared template; each category page loads its own `<slug>-data.js` (which assigns `window.KS_CATEGORY`), then this template renders it. Adding a new category is just a new data file + HTML stub.

Each page has: pinned hero · intro paragraph · ten-row editorial flow · projects grid · footer. Sticky top bar fades to glass when scrolled.

### Shared
- `tweaks-panel.jsx` — preview-only Tweaks UI; safe to omit in production

See `CLAUDE_CODE_PROMPT.md` (sibling file) for a ready-to-paste instruction for Claude Code.

## Notes for the implementer
- The current prototype uses **in-browser Babel** for JSX — fine for prototyping but slow on first load. For production, use the codebase's existing build (Next.js, Vite, esbuild, etc.).
- If the repo is Next.js, this is one `page.tsx` (or `app/page.tsx`) plus `globals.css`. The `data.js` becomes a typed module. `useTweaks` and the tweaks panel are not needed in production.
- The `.frame` placeholders use `background-image: linear-gradient(...)` for a subtle diagonal stripe. When you add real images, render `<img>` filling the frame and keep the `::after` gradient overlay for legibility of the text on top.
- Keep the letterbox bars even on mobile — they're part of the cinematic identity. Just lighter (36px instead of 56px).
- Don't dilute the typography. Bodoni Moda + JetBrains Mono is doing a lot of the heavy lifting; substitutes will weaken the result.
