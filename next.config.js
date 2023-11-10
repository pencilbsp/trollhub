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
    ];
  },
};

module.exports = nextConfig;
