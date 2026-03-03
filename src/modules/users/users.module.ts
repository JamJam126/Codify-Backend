import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from 'prisma/prisma.service';
import { UsersController } from './users.controller';
import { UserPrismaRepository } from './repositories/user.prisma.repository';

@Module({
  providers: [
    UserService,
    PrismaService,
    {
      provide: "UserRepository",
      useClass: UserPrismaRepository
    }
  ],
  controllers: [UsersController],
  exports: [
    UserService,
    "UserRepository"
  ]
})
export class UsersModule {}
