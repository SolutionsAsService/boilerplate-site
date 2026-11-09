import type { NextConfig } from 'next'

// A static export: every page is HTML in out/, so the site needs no server and the gate can read exactly what visitors get.
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
}
export default nextConfig
