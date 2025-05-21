// configs/drizzle.config.onHold.ts
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config();

export default defineConfig({
  schema: './db/core/schema.ts', // correct relative to project root
  out: './migrations/core',
  dialect: 'postgresql', // REQUIRED in latest drizzle-kit
  dbCredentials: {
    url: process.env.DATABASE_URI_SHAD5!, // REQUIRED and correct key
  },
});
