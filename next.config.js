const { PHASE_PRODUCTION_BUILD } = require('next/constants')

/** @type {import('next').NextConfig} */
module.exports = (phase) => {
    const isBuild = phase === PHASE_PRODUCTION_BUILD;

    return {
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
        }
    }
}
