import type { NextConfig } from 'next'
import { LEGACY_REDIRECTS, LEGACY_NOTION_CATCH_ALL } from './src/lib/legacyRedirects'

const nextConfig: NextConfig = {
  // Dev only. Next 16 blocks cross-origin requests to /_next/* — including the
  // HMR socket — unless the origin is listed here, so opening the dev server
  // from a phone on the same Wi-Fi renders the page but 403s on every dev
  // asset and never hot-reloads. Update the IP if the Mac's DHCP lease moves
  // (`ipconfig getifaddr en0`). Has no effect on the production build.
  allowedDevOrigins: ['192.168.31.242'],
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
