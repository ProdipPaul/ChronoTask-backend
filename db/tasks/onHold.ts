// db/tasks/onHold.ts
import { pgTable } from 'drizzle-orm/pg-core';
import { taskBase } from './columns';

export const taskOnHold = pgTable('task_on_hold', taskBase);
