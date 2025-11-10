/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
  transpilePackages: ['@lab/nft-utils', '@lab/core', '@lab/farcaster-auth', '@lab/bearbrick-contract'],
  experimental: {
    optimizePackageImports: ['@lab/nft-utils'],
  },
}

module.exports = nextConfig