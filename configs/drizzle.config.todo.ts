// configs/drizzle.config.onHold.ts
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config();

export default defineConfig({
  schema: './db/tasks/todo.ts', // correct relative to project root
  out: './migrations/todo',
  dialect: 'postgresql', // REQUIRED in latest drizzle-kit
  dbCredentials: {
    url: process.env.DATABASE_URI_SHAD1!, // REQUIRED and correct key
  },
});
