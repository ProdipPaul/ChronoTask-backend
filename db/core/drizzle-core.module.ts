// src/db/core/drizzle-core.module.ts
import { Module, Global } from '@nestjs/common';
import { DrizzleCoreService } from './drizzle-core.service';

@Global() // Make DrizzleCoreService available globally
@Module({
  providers: [DrizzleCoreService],
  exports: [DrizzleCoreService],
})
export class DrizzleCoreModule {}
