// db/tasks/inProgress.ts
import { pgTable } from 'drizzle-orm/pg-core';
import { taskBase } from './columns';

export const taskInProgress = pgTable('task_in_progress', taskBase);
