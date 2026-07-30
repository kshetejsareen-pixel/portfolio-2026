import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  serverExternalPackages: ['firebase-admin', 'google-auth-library', 'googleapis'],
  async redirects() {
    return [
      { source: '/food',      destination: '/culinary', permanent: true },
      { source: '/interiors', destination: '/spaces',   permanent: true },
      { source: '/products',  destination: '/objects',  permanent: true },
    ]
  },
}

export default nextConfig
