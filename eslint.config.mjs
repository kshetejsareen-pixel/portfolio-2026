// Flat config. `next lint` was deprecated in Next 15 and removed in 16, and
// this project never had an ESLint config at all — `npm run lint` dropped into
// create-next-app's interactive setup prompt and so had never actually run.
//
// eslint-config-next ships native flat configs as of 16, so they are spread in
// directly. Routing them through FlatCompat instead fed already-flat arrays to
// a converter that expects eslintrc objects: the result failed schema
// validation, and the validator then crashed formatting its own error
// ("Converting circular structure to JSON"), so ESLint reported a stack trace
// rather than the lint run.

import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

const config = [
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
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    rules: {
      // Six existing <a> tags point at internal routes (KsMenuOverlay,
      // CategoryLanding). Swapping them for <Link> turns a full reload into a
      // client-side transition, which visibly changes how navigation feels on
      // a site built around PageTransition — so it is a design call, not a
      // lint cleanup. Kept as a warning so it stays visible without failing
      // the build, which now runs ESLint because this config exists.
      '@next/next/no-html-link-for-pages': 'warn',

      // eslint-config-next 16 enables the React Compiler rule set at 'error'.
      // It flags 29 places in components that have been live and working for
      // months — setState called synchronously in an effect, refs read during
      // render, values mutated after render. Every one is a real pattern worth
      // revisiting, but every fix changes how a client-facing component
      // behaves, so none of them is a lint cleanup to be done silently. Warn
      // keeps the whole list in front of us on every run while leaving the
      // first run of a lint that had never run at all with a clean exit.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/error-boundaries': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
]

// Named rather than exported anonymously, which import/no-anonymous-default-export
// flags — the config lints itself.
export default config
