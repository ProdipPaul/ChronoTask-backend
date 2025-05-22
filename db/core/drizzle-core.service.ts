// src/db/core/drizzle-core.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { dbCore } from './clients'; // Import your dbCore client

@Injectable()
export class DrizzleCoreService implements OnModuleInit, OnModuleDestroy {
  public readonly db = dbCore; // Expose your dbCore instance

  onModuleInit() {
    // Drizzle with node-postgres' Pool connects on first query,
    // but you could add a test query here to ensure connectivity if desired.
    console.log('Drizzle DB Core client initialized.');
  }

  async onModuleDestroy() {
    // Gracefully close the pool connections if your dbCore's pool instance has a .end() method
    // If 'pool' is directly exported and not exposed via dbCore, you might need to handle it in client.ts
    // For node-postgres Pool, dbCore's underlying pool has an .end() method.
    if (typeof (this.db as any).end === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await (this.db as any).end(); // This might vary based on how drizzle-orm exposes the pool
      console.log('Drizzle DB Core client disconnected.');
    }
  }
}
