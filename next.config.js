/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        port: "",
        protocol: "https",
        pathname: "/media/**",
        hostname: "media.funhub.net",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/comic-chapter/:path*",
        destination: "/chapter/:path*",
      },
      {
        source: "/novel-chapter/:path*",
        destination: "/chapter/:path*",
      },
      {
        source: "/novel/:path*",
        destination: "/novel/:path*",
      },
      {
        source: "/comic/:path*",
        destination: "/comic/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
