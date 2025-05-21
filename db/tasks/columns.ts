// db/tasks/columns.ts
import { uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const taskBase = {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  priority: integer('priority'), // 0 = Low, 1 = Medium, etc.
  startAt: timestamp('start_at'),
  endAt: timestamp('end_at'),
  userId: uuid('user_id').notNull(),
  projectId: uuid('project_id'),
  recurrenceRuleId: uuid('recurrence_rule_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
};
