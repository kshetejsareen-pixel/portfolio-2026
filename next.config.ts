import type { NextConfig } from 'next'
import { LEGACY_REDIRECTS, LEGACY_NOTION_CATCH_ALL } from './src/lib/legacyRedirects'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  serverExternalPackages: ['firebase-admin', 'google-auth-library', 'googleapis'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Stops the admin panel being framed for clickjacking.
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      { source: '/food',      destination: '/culinary', permanent: true },
      { source: '/interiors', destination: '/spaces',   permanent: true },
      { source: '/products',  destination: '/objects',  permanent: true },

      // Notion-era project URLs. See src/lib/legacyRedirects.ts — these carry
      // more Google impressions than the live site does, and every one of them
      // was returning 404.
      ...LEGACY_REDIRECTS.map((r) => ({ ...r, permanent: true })),

      // Must stay last: Next.js applies the first matching rule, so this only
      // sees Notion ids that no specific rule above claimed.
      { ...LEGACY_NOTION_CATCH_ALL, permanent: true },
    ]
  },
}

export default nextConfig
