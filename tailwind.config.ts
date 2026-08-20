import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'
import forms from '@tailwindcss/forms'
import animate from 'tailwindcss-animate'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
        serif: ['var(--font-serif)'],
      },
      colors: {
        brand: {
          black: '#0A0A0A',
          white: '#F5F5F0',
          silver: '#C8C8CC',
          muted: '#6B6B6B',
        },
      },
    },
  },
  plugins: [
    typography,
    forms,
    animate,
  ],
}

export default config
