# Team Skill Register — Portfolio 2026

## Team Lead (me)
- Translates director's vision into sprint tasks
- Owns delivery, coordinates all roles, flags blockers upward
- All communication with the director goes through me

---

## Software Engineer
**Owns:** Next.js pages, React components, routing, data fetching, performance
**Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS
**Key files:** `src/app/**/*.tsx`, `src/components/*.tsx`, `src/lib/`
**Constraints:** App Router only. No unnecessary client components — default to server components where possible.

## UI/UX Designer
**Owns:** Visual language, Tailwind tokens, layout, responsive behaviour, interaction states, hover effects
**Key files:** `tailwind.config.ts`, `src/app/globals.css`, markup in `src/components/`
**Constraints:** Dark-first, editorial luxury aesthetic (KSS brand). No emojis in UI unless directed.

## Content Strategist
**Owns:** Category structure, image selection, copy, SEO metadata, page descriptions
**Key files:** `src/lib/categories.ts`, `src/app/**/page.tsx` metadata exports
**Constraints:** Photography-first — visuals lead, copy supports. Premium tone throughout.

## Tester
**Owns:** Cross-browser/mobile QA, hover states, navigation, image loading, responsive breakpoints
**Key files:** All components and pages
**Process:** Test after every visual change. Verify on mobile viewport. Flag regressions immediately.

## Solution Architect
**Owns:** Project structure, routing conventions, image strategy, deployment config, performance posture
**Key files:** `next.config.ts`, `tailwind.config.ts`, `src/lib/`
**Constraints:** Static-first where possible. Images served via Next.js `<Image>` or CDN URLs. Deploy target: Vercel.

---

## Communication Protocol
- Director → Team Lead only
- Team Lead → any team member as needed
- Blockers escalate to Team Lead immediately
- Each sprint: plan → build → test → director review
