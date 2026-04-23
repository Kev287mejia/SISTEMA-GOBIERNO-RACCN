const { PHASE_PRODUCTION_BUILD } = require('next/constants')

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Esto evita que Next.js intente ejecutar el código de Prisma durante el build
  output: 'standalone',
}

module.exports = (phase) => {
    const isBuild = phase === PHASE_PRODUCTION_BUILD;

    return {
        ...nextConfig,
        reactStrictMode: true,
        swcMinify: true,
        poweredByHeader: false,
        optimizeFonts: true,
        compiler: {
            removeConsole: process.env.NODE_ENV === "production",
        },
        eslint: {
            ignoreDuringBuilds: true,
        },
        typescript: {
            ignoreBuildErrors: true,
        },
        env: {
            IS_BUILD_PHASE: isBuild ? "true" : "false",
            NEXTAUTH_URL: process.env.RENDER_EXTERNAL_URL
                ? process.env.RENDER_EXTERNAL_URL
                : process.env.VERCEL_PROJECT_PRODUCTION_URL 
                    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
                    : process.env.VERCEL_URL 
                        ? `https://${process.env.VERCEL_URL}` 
                        : undefined,
        }
    }
}
