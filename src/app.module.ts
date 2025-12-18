import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaService } from 'prisma/prisma.service';
import { ClassroomsModule } from './modules/classrooms/classrooms.module';

@Module({
  imports: [UsersModule, AuthModule, ClassroomsModule],
  providers: [PrismaService],
})
export class AppModule {}
