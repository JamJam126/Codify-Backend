import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from './modules/queue/queue.module';
import { CodeRunnerModule } from './modules/code-runner/code-runner.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuthModule,
    QueueModule, CodeRunnerModule
  ],
  providers: [PrismaService],
})
export class AppModule {}