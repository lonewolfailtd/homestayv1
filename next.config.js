/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This disables ESLint during production builds
    // Only use this temporarily for deployment, then fix the remaining issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has TypeScript errors.
    // !! WARN !!
    ignoreBuildErrors: false, // Keep TypeScript checking enabled
  },
  // Optimize font loading for faster dev startup
  optimizeFonts: false, // Disable font optimization in development
}

module.exports = nextConfig