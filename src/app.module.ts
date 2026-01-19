import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClassroomsModule } from './modules/classrooms/classrooms.module';
import { AssignmentModule } from './modules/assignments/assignment.module';
import { PrismaService } from 'prisma/prisma.service';
import { QueueModule } from './modules/queue/queue.module';
import { CodeRunnerModule } from './modules/code-runner/code-runner.module';
@Module({
  imports: [
    UsersModule,
    AuthModule,
    AssignmentModule,
    ClassroomsModule,
    QueueModule, CodeRunnerModule
  ],
  controllers: [],

  providers: [PrismaService],
})
export class AppModule {}