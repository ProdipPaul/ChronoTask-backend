// db/core/client.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { env } from '../../src/utils/env'; // path to env.ts file

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const pool = new Pool({
  connectionString: env.DATABASE_URI_SHAD1, // Use the type-safe env.CORE_DB
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export const dbCore = drizzle(pool, { schema });
