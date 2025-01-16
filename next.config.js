/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'https://dash.the20.co' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { 
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
          }
        ]
      }
    ];
  },
  cookies: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    domain: '.the20.co',
    path: '/',
  }
  
};

module.exports = nextConfig;