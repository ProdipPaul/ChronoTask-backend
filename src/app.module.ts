import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { UserModule } from './user/user.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [AuthModule, DrizzleModule, UserModule, TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
