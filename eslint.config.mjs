// Flat config. `next lint` was deprecated in Next 15 and removed in 16, and
// this project never had an ESLint config at all — `npm run lint` dropped into
// create-next-app's interactive setup prompt and so had never actually run.
//
// FlatCompat is still needed because eslint-config-next ships eslintrc-style
// configs; drop it once that package publishes native flat configs.

import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) })

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'seo-reports/**',
      // Reference material and old scratch copies, not part of the built app.
      'Claude Code Working Data/**',
      'HTML Files/**',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Six existing <a> tags point at internal routes (KsMenuOverlay,
      // CategoryLanding). Swapping them for <Link> turns a full reload into a
      // client-side transition, which visibly changes how navigation feels on
      // a site built around PageTransition — so it is a design call, not a
      // lint cleanup. Kept as a warning so it stays visible without failing
      // the build, which now runs ESLint because this config exists.
      '@next/next/no-html-link-for-pages': 'warn',
    },
  },
]
