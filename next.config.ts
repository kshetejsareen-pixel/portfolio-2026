import type { NextConfig } from 'next'

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
    ]
  },
}

export default nextConfig
