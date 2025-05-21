// db/tasks/clients.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
// No need for 'dotenv/config' here if it's in your env.ts or entry file
import { taskTodo } from './todo';
import { taskDone } from './done';
import { taskInProgress } from './inProgress';
import { taskOnHold } from './onHold';
import { env } from '../../src/utils/env'; // Import the validated env object

export const dbTodo = drizzle(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
  new Pool({ connectionString: env.DATABASE_URI_SHAD1 }),
  {
    schema: { taskTodo },
  },
);

export const dbDone = drizzle(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
  new Pool({ connectionString: env.DATABASE_URI_SHAD2 }),
  {
    schema: { taskDone },
  },
);

export const dbInProgress = drizzle(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
  new Pool({ connectionString: env.DATABASE_URI_SHAD3 }),
  {
    schema: { taskInProgress },
  },
);

export const dbOnHold = drizzle(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
  new Pool({ connectionString: env.DATABASE_URI_SHAD4 }),
  {
    schema: { taskOnHold },
  },
);
