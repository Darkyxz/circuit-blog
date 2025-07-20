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
  // Configuración para mejorar la compilación en Render
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  // Excluir archivos de test del build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Configuración de ESLint para build
  eslint: {
    // Ignorar errores de ESLint durante el build en producción
    ignoreDuringBuilds: false,
    dirs: ['src']
  },
  // Excluir archivos de test
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  }
}

module.exports = nextConfig
