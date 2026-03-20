import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  GEMINI_API_KEY: z.string().optional(),
  DAY_IN_HISTORY_API_KEY: z.string().optional(),
  API_NINJAS_KEY: z.string().optional(),
  REGISTER_WEBHOOK_URL: z.string().url().default('https://httpbin.org/post'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Invalid environment variables:');
  console.error(result.error.format());
  process.exit(1);
}

export const env = result.data;
