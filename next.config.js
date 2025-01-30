/** @type {import('next').NextConfig} */

module.exports = {
  experimental: {
    serverActions: {
      allowedOrigins: ['dash.the20.co']
    }
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'https://dash.the20.co' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
        ]
      }
    ];
  },
  cookies: {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  }
};