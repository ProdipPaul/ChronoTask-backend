// db/tasks/todo.ts
import { pgTable } from 'drizzle-orm/pg-core';
import { taskBase } from './columns';

export const taskTodo = pgTable('task_todo', taskBase);
