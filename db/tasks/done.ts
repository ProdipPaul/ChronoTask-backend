// db/tasks/done.ts
import { pgTable } from 'drizzle-orm/pg-core';
import { taskBase } from './columns';

export const taskDone = pgTable('task_done', taskBase);
