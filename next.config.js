const removeImports = require('next-remove-imports')();

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                port: '',
                protocol: 'https',
                pathname: '/media/**',
                hostname: 'media.funhub.net',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/comic-chapter/:path*',
                destination: '/chapter/:path*',
            },
            {
                source: '/novel-chapter/:path*',
                destination: '/chapter/:path*',
            },
            {
                source: '/novel/:path*',
                destination: '/novel/:path*',
            },
            {
                source: '/comic/:path*',
                destination: '/comic/:path*',
            },
            {
                source: '/api/prv-dash/:path*',
                destination: `${process.env.STREAME_DASH_API}/:path*`,
            },
        ];
    },
};

module.exports = removeImports(nextConfig);
