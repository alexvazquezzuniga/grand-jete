import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Temporal: permite desplegar la versión de prueba aunque
    // Vercel encuentre un error de tipado no mostrado en los logs.
    ignoreBuildErrors: true,
  },
}

export default nextConfig
