/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const allowedOrigins = [
      'https://2-0dash.vercel.app',
      'https://2-0dash-cxxjymn81-lynns-projects-354d9aa2.vercel.app',
      'http://localhost:3000'
    ];

    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' }
        ],
      }
    ];
  }
};

module.exports = nextConfig;