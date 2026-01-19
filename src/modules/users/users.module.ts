import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from 'prisma/prisma.service';
import { UsersController } from './users.controller';

@Module({
  providers: [UserService, PrismaService],
  controllers: [UsersController],
})
export class UsersModule {}
