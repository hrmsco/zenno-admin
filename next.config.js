/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  distDir: "out",
  images: {
    domains: [
      "zenno-backend.hrms.group", // Replace with your backend domain
      "lh3.googleusercontent.com",
    ],
  },
};

module.exports = nextConfig;
