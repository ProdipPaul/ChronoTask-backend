import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateTaskInput,
  UpdateTaskInput,
  Task,
  TaskStatus,
} from './taskTypes'; // Assuming taskTypes.ts is in the same directory

// Import the specific Drizzle clients and schemas for each task status shard
import { dbTodo } from '../../db/tasks/clients';
import { taskTodo } from '../../db/tasks/todo';
import { dbInProgress } from '../../db/tasks/clients';
import { taskInProgress } from '../../db/tasks/inProgress';
import { dbOnHold } from '../../db/tasks/clients';
import { taskOnHold } from '../../db/tasks/onHold';
import { dbDone } from '../../db/tasks/clients';
import { taskDone } from '../../db/tasks/done';

// Helper to get the correct DB client and schema based on status
const getDbClientAndSchema = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.TODO:
      return { db: dbTodo, schema: taskTodo, tableName: 'task_todo' };
    case TaskStatus.IN_PROGRESS:
      return { db: dbInProgress, schema: taskInProgress, tableName: 'task_in_progress' };
    case TaskStatus.ON_HOLD:
      return { db: dbOnHold, schema: taskOnHold, tableName: 'task_on_hold' };
    case TaskStatus.DONE:
      return { db: dbDone, schema: taskDone, tableName: 'task_done' };
    default:
      throw new BadRequestException(`Invalid task status: ${status}`);
  }
};

const allShards = [
  { status: TaskStatus.TODO, db: dbTodo, schema: taskTodo, tableName: 'task_todo' },
  { status: TaskStatus.IN_PROGRESS, db: dbInProgress, schema: taskInProgress, tableName: 'task_in_progress' },
  { status: TaskStatus.ON_HOLD, db: dbOnHold, schema: taskOnHold, tableName: 'task_on_hold' },
  { status: TaskStatus.DONE, db: dbDone, schema: taskDone, tableName: 'task_done' },
];

@Injectable()
export class TasksService {
  async createTask(taskData: CreateTaskInput): Promise<Task> {
    const taskStatus = taskData.status || TaskStatus.TODO; // Default status
    const { db, schema, tableName } = getDbClientAndSchema(taskStatus);

    // Destructure to separate status from other task data
    const { status, ...restOfTaskData } = taskData;

    // Construct the object for DB insertion without status
    const taskPayloadToInsert = {
      id: uuidv4(),
      ...restOfTaskData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const result = await db.insert(schema).values(taskPayloadToInsert).returning();

      if (!result || result.length === 0) {
        throw new InternalServerErrorException('Could not create task.');
      }
      // Add status to the returned task, as it's intrinsic to its location
      return { ...result[0], status: taskStatus } as Task;
    } catch (error) {
      console.error(`Error creating task in ${tableName} table:`, error);
      throw new InternalServerErrorException('Could not create task.');
    }
  }

  async getTask(id: string): Promise<Task | null> {
    for (const shard of allShards) {
      try {
        const result = await shard.db
          .select()
          .from(shard.schema)
          .where(eq(shard.schema.id, id))
          .limit(1);

        if (result && result.length > 0) {
          return { ...result[0], status: shard.status } as Task;
        }
      } catch (error) {
        // Log error for this specific shard but continue to check others
        console.error(
          `Error fetching task ${id} from ${shard.tableName}:`,
          error,
        );
      }
    }
    return null; // Not found in any shard
  }

  async getAllTasks(): Promise<Task[]> {
    const allTasks: Task[] = [];

    for (const shard of allShards) {
      try {
        const results = await shard.db.select().from(shard.schema);
        results.forEach((task) => {
          allTasks.push({ ...task, status: shard.status } as Task);
        });
      } catch (error) {
        console.error(`Error fetching tasks from ${shard.tableName}:`, error);
        // Continue to fetch from other shards even if one fails
      }
    }

    // Sort tasks by creation date (newest first)
    allTasks.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
    return allTasks;
  }

  async updateTask(
    id: string,
    taskData: UpdateTaskInput,
  ): Promise<Task | null> {
    const currentTask = await this.getTask(id);
    if (!currentTask) {
      return null;
    }

    const currentStatus = currentTask.status;
    const newStatus = taskData.status;

    // If status is changing, it's a move operation
    if (newStatus && newStatus !== currentStatus) {
      return this.changeTaskStatus(id, newStatus, taskData, currentTask);
    }

    // If status is not changing or not provided, update in the current table
    const { db, schema, tableName } = getDbClientAndSchema(currentStatus);
    
    // Destructure to separate status from other update data
    const { status, ...updateDataBase } = taskData;
    const updatePayload = {
      ...updateDataBase,
      updatedAt: new Date(),
    };

    try {
      const result = await db
        .update(schema)
        .set(updatePayload)
        .where(eq(schema.id, id))
        .returning();

      if (!result || result.length === 0) {
        return null;
      }
      return { ...result[0], status: currentStatus } as Task;
    } catch (error) {
      console.error(
        `Error updating task ${id} in ${tableName} table:`,
        error,
      );
      throw new InternalServerErrorException('Could not update task.');
    }
  }

  async deleteTask(id: string): Promise<Task | null> {
    for (const shard of allShards) {
      try {
        const result = await shard.db
          .delete(shard.schema)
          .where(eq(shard.schema.id, id))
          .returning();

        if (result && result.length > 0) {
          return { ...result[0], status: shard.status } as Task;
        }
      } catch (error) {
        console.error(
          `Error deleting task ${id} from ${shard.tableName}:`,
          error,
        );
        // Continue checking other shards
      }
    }
    return null; // Not found in any shard
  }

  async changeTaskStatus(
    id: string,
    newStatus: TaskStatus,
    updateData?: UpdateTaskInput,
    existingTask?: Task | null,
  ): Promise<Task | null> {
    const taskToMove = existingTask || (await this.getTask(id));

    if (!taskToMove) {
      return null;
    }

    const oldStatus = taskToMove.status;
    if (oldStatus === newStatus) {
      // If status isn't actually changing but other fields are
      if (updateData && Object.keys(updateData).length > 1) {
        // more than just 'status'
        const { db: currentDb, schema: currentSchema, tableName } =
          getDbClientAndSchema(oldStatus);
        
        // Destructure to separate status from other update data
        const { status, ...updatePayload } = updateData;
        const payload = { ...updatePayload, updatedAt: new Date() };

        const updatedResult = await currentDb
          .update(currentSchema)
          .set(payload)
          .where(eq(currentSchema.id, id))
          .returning();

        return updatedResult.length > 0
          ? ({ ...updatedResult[0], status: oldStatus } as Task)
          : null;
      }
      return taskToMove; // No change needed
    }

    const { db: oldDb, schema: oldSchema, tableName: oldTableName } = getDbClientAndSchema(oldStatus);
    const { db: newDb, schema: newSchema, tableName: newTableName } = getDbClientAndSchema(newStatus);

    // Extract status from taskToMove and updateData to avoid using delete
    const { status: _taskStatus, ...taskToMoveBase } = taskToMove;
    const { status: _updateStatus, ...updateDataBase } = updateData || {};

    // Prepare data for the new table
    const taskForNewTable = {
      ...taskToMoveBase,
      ...updateDataBase,
      id: taskToMove.id,
      createdAt: taskToMove.createdAt, // Preserve original creation date
      updatedAt: new Date(),
    };

    try {
      // 1. Insert into new table
      const insertResult = await newDb
        .insert(newSchema)
        .values(taskForNewTable)
        .returning();

      if (!insertResult || insertResult.length === 0) {
        throw new InternalServerErrorException(
          `Failed to insert task into ${newTableName} table during status change.`,
        );
      }

      // 2. Delete from old table
      await oldDb.delete(oldSchema).where(eq(oldSchema.id, id));

      return { ...insertResult[0], status: newStatus } as Task;
    } catch (error) {
      console.error(
        `Error changing task status for id ${id} from ${oldTableName} to ${newTableName}:`,
        error,
      );
      throw new InternalServerErrorException('Could not change task status.');
    }
  }
}
