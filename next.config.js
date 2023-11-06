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
};

module.exports = nextConfig;
