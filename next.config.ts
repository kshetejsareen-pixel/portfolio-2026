import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  serverExternalPackages: ['firebase-admin', 'google-auth-library', 'googleapis'],
}

export default nextConfig
