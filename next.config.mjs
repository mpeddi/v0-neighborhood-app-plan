/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  cacheComponents: true,
  experimental: {
    dynamicIO: true,
  },
}

export default nextConfig
