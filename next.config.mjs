/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude server-only packages from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "livekit-server-sdk": false,
      }
      
      // Prevent server SDK from being bundled
      config.externals = config.externals || []
      config.externals.push({
        "livekit-server-sdk": "livekit-server-sdk"
      })
    }
    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
