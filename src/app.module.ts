import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaService } from 'prisma/prisma.service';
import { AppController } from './app.controller';
import { QueueModule } from './modules/queue/queue.module';
import { CodeRunnerModule } from './modules/code-runner/code-runner.module';
@Module({
  imports: [
    UsersModule,
    AuthModule,
    QueueModule, CodeRunnerModule
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
