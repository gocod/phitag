import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Note: serverRuntimeConfig is deprecated in many modern Next.js setups.
     Your AZURE_CLIENT_SECRET is already secure as long as it doesn't 
     start with NEXT_PUBLIC_.
  */

  /* Security Headers for HIPAA compliance */
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

export default nextConfig;
