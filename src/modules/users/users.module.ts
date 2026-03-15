import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from 'prisma/prisma.service';
import { UsersController } from './users.controller';
import { UserPrismaRepository } from './repositories/user.prisma.repository';
import { S3Service } from 'src/storage/s3.service';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [StorageModule],
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
