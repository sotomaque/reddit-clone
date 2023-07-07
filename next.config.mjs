await import('./src/lib/env.mjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
