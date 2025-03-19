/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
        };
        return config;
    },
    experimental: {
        appDir: true
    }
}

module.exports = nextConfig 