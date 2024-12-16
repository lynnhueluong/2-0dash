// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 's.gravatar.com',
          pathname: '/**',
        },
        {
            protocol: 'https',
            hostname: 'framerusercontent',
            pathname: '/images/qnf8lnV37ylwHXqqKGX3lsZSY9c.png',
          },
        {
          protocol: 'https',
          hostname: 'cdn.auth0.com',
          pathname: '/avatars/**',
        }
      ],
    },
  }
  
  module.exports = nextConfig
