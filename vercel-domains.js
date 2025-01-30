module.exports = {
  getCallbackUrls: () => {
    // This will work for both production and preview deployments
    const urls = [
      'https://dash.the20.co/api/auth/callback',
      'http://localhost:3000/api/auth/callback'
    ];

    // Add current Vercel preview deployment URL if available
    if (process.env.VERCEL_URL) {
      urls.push(`https://${process.env.VERCEL_URL}/api/auth/callback`);
    }

    return urls;
  }
};