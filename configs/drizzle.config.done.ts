// configs/drizzle.config.onHold.ts
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config();

export default defineConfig({
  schema: './db/tasks/done.ts', // correct relative to project root
  out: './migrations/done',
  dialect: 'postgresql', // REQUIRED in latest drizzle-kit
  dbCredentials: {
    url: process.env.DATABASE_URI_SHAD2!, // REQUIRED and correct key
  },
});
