// configs/drizzle.config.onHold.ts
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config();

export default defineConfig({
  schema: './db/tasks/onHold.ts', // correct relative to project root
  out: './migrations/onHold',
  dialect: 'postgresql', // REQUIRED in latest drizzle-kit
  dbCredentials: {
    url: process.env.DATABASE_URI_SHAD4!, // REQUIRED and correct key
  },
});
