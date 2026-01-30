import { z } from 'zod';

const envSchema = z.object({
  // Azure Credentials
  AZURE_TENANT_ID: z.string().uuid(),
  AZURE_CLIENT_ID: z.string().uuid(),
  AZURE_CLIENT_SECRET: z.string().min(10),
  
  // Vercel / App Config
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('https://phitag.com'),
  
  // Stripe (For your next step)
  STRIPE_SECRET_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);