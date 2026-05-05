/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['cloudconvert'],
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
};

export default nextConfig;
