// configs/drizzle.config.onHold.ts
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config();

export default defineConfig({
  schema: './db/tasks/inProgress.ts', // correct relative to project root
  out: './migrations/inProgress',
  dialect: 'postgresql', // REQUIRED in latest drizzle-kit
  dbCredentials: {
    url: process.env.DATABASE_URI_SHAD3!, // REQUIRED and correct key
  },
});
