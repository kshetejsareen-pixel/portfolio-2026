import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
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
  plugins: [],
}

export default config
