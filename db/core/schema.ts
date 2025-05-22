import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  varchar,
  primaryKey,
} from 'drizzle-orm/pg-core';

export type User = typeof user.$inferSelect; // Infer the select type
export type InsertUser = typeof user.$inferInsert; // Infer the insert type

// === User ===
export const user = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// === Project ===
export const project = pgTable('project', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// === TaskSession ===
export const taskSession = pgTable('task_session', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id),
  startedAt: timestamp('started_at').notNull(),
  endedAt: timestamp('ended_at'),
});

// === RecurrenceRule ===
export const recurrenceRule = pgTable('recurrence_rule', {
  id: uuid('id').primaryKey().defaultRandom(),
  frequency: text('frequency').notNull(), // e.g., 'daily', 'weekly'
  interval: integer('interval').default(1).notNull(),
  count: integer('count'),
  until: timestamp('until'),
  createdAt: timestamp('created_at').defaultNow(),
});

// === RecurrenceDay ===
export const recurrenceDay = pgTable(
  'recurrence_day',
  {
    recurrenceRuleId: uuid('recurrence_rule_id')
      .notNull()
      .references(() => recurrenceRule.id),
    day: varchar('day', { length: 2 }).notNull(),
  },
  (table) => ({
    primaryKey: primaryKey({ columns: [table.recurrenceRuleId, table.day] }),
  }),
);
