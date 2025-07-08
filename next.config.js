/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "firebasestorage.googleapis.com",
      "res.cloudinary.com"
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      }
    ],
    minimumCacheTTL: 60,
    formats: ['image/webp', 'image/avif']
  },
  experimental: {
    optimizePackageImports: ['next/image']
  },
  // Configuración para mejorar la compilación en Render
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true
}

module.exports = nextConfig
