export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  DONE = 'DONE',
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority?: number | null;
  startAt?: Date | null;
  endAt?: Date | null;
  userId: string;
  projectId?: string | null;
  recurrenceRuleId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  status: TaskStatus;
}

export interface CreateTaskInput {
  title: string;
  userId: string;
  status: TaskStatus;
  description?: string | null;
  priority?: number | null;
  startAt?: Date | null;
  endAt?: Date | null;
  projectId?: string | null;
  recurrenceRuleId?: string | null;
}

// For UpdateTaskInput, we can make all fields optional
// and it should not contain fields that are not updatable like id, createdAt
export type UpdateTaskInput = Partial<
  Omit<Task, 'id' | 'createdAt' | 'userId'>
>;
