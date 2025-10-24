/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Skip static generation errors during build
  // These pages need dynamic data and will be rendered on-demand
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

export default nextConfig
