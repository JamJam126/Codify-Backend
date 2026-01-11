import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AssignmentModule } from './modules/assignments/assignment.module';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [UsersModule, AuthModule, AssignmentModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}