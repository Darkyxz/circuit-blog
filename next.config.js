/** @type {import('next').NextConfig} */
const nextConfig = {
  images:{
    domains:[
      "lh3.googleusercontent.com",
      "firebasestorage.googleapis.com",
      "res.cloudinary.com"
    ]
  },
  // Deshabilitar SSG para páginas problemáticas
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
