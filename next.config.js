/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure server-side secrets are never bundled into the client-side JS
  serverRuntimeConfig: {
    azureSecret: process.env.AZURE_CLIENT_SECRET,
  },
  // Security Headers for HIPAA compliance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;