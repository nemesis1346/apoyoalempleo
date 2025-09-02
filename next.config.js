/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for SPA on Cloudflare Pages
  output: "export",
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
  },
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
