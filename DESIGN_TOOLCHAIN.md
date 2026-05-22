# Design & Build Toolchain

This project is now configured with a premium frontend design stack suitable for building a high-end website.

## Installed libraries

- `tailwindcss` — utility-first styling system already configured.
- `@tailwindcss/typography` — offers beautiful prose and content styling for marketing pages.
- `@tailwindcss/forms` — modern, consistent form styling.
- `tailwindcss-animate` — prebuilt motion utilities and animation support.
- `framer-motion` — advanced animations and page transitions.
- `lucide-react` — lightweight icon set for polished UI design.
- `@headlessui/react` — accessible UI primitives for modals, dropdowns, dialogs, and tabs.
- `clsx` — className utility for cleaner component styling.
- `eslint-plugin-tailwindcss` (dev dependency) — lint Tailwind class usage and enforce design consistency.

## Configuration

- `tailwind.config.ts` now includes the typography, forms, and animation plugins.
- Tailwind is scanning all files under `src/` for class usage.

## Next steps

1. build a design system in `src/components/` using Tailwind + Framer Motion
2. create page-level sections for hero, services, portfolio, case studies, and contact
3. add accessible interactions with Headless UI components
4. use typography utilities for rich editorial content and marketing copy

This setup gives you the foundational skills and dependencies needed to execute a premium website design and build.
