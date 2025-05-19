/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',
  webpack: (config, options) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["@lens-protocol", "@madfi"],
  experimental: {
    esmExternals: true,
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    optimizePackageImports: [
      '@emotion/css',
      '@emotion/styled',
      '@apollo/client',
      '@ensdomains/ensjs',
      '@lens-chain/sdk',
      '@lens-chain/storage-client',
      '@lens-protocol/client',
      '@lens-protocol/gated-content',
      '@lens-protocol/metadata',
      '@madfi/lens-oa-client',
      '@madfi/widgets-react',
      '@tailwindcss/forms',
      '@tanstack/react-query',
      '@vercel/analytics',
      '@vercel/og',
      '@wagmi/chains',
      'react-confetti-explosion',
      'react-datepicker',
      'react-dropzone',
      'react-hot-toast',
      'react-hotkeys-hook',
      'react-intersection-observer',
      'react-responsive',
      'react-select',
      'react-use-cookie',
      'react-window',
      'framer-motion',
      'tss-react',
      'wagmi',
    ]
  },
  i18n: {
    locales: ['en-US', 'zh-CN'],
    defaultLocale: 'en-US',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/.well-known/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
        ],
      },
      {
        source: '/opengraph-image.jpg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/splash.jpg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/og-image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/:path*.jpg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      "arweave.net",
      "api.grove.storage",
      "media.firefly.land",
      "lh3.googleusercontent.com",
      "img.seadn.io",
      "ipfs.infura.io",
      "ipfs.io",
      "madfinance.mypinata.cloud",
      "placeimg.com",
      "ik.imagekit.io",
      "www.storj-ipfs.com",
      "link.storjshare.io",
      "lens.infura-ipfs.io",
      "gateway.storjshare.io",
      "pbs.twimg.com",
      "cdn.stamp.fyi",
      "oaidalleapiprodscus.blob.core.windows.net",
      "statics-polygon-lens.s3.*.amazonaws.com",
      "gw.ipfs-lens.dev",
      "nft-cdn.alchemy.com",
      "ipfs.4everland.io"
    ].map((domain) => ({
      protocol: "https",
      hostname: domain,
      port: "",
      pathname: "/**",
    })),
  },
};

module.exports = nextConfig;
