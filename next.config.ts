import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* serverRuntimeConfig ensures secrets are only available on the server */
  serverRuntimeConfig: {
    azureSecret: process.env.AZURE_CLIENT_SECRET,
  },

  /* Security Headers for HIPAA compliance */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Restricting browser features is a HIPAA best practice
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
