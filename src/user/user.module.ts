import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UsersService } from './user.service';
import { DrizzleCoreModule } from '../../db/core/drizzle-core.module';
@Module({
  imports: [DrizzleCoreModule],
  controllers: [UserController],
  providers: [UsersService],
  exports: [UsersService], // Export UsersService for use in other modules
})
export class UserModule {}
