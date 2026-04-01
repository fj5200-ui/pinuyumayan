import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Use direct connection (port 5432) for migrations
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
});
