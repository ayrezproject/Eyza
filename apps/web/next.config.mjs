/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@eyza/types', '@eyza/database'],
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
}

export default nextConfig
