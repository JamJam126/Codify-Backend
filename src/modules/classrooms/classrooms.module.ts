import { Module } from '@nestjs/common';
import { ClassroomsController } from './presentation/classrooms.controller';
import { ClassroomService } from './application/classroom.service';
import { ClassroomRepositoryPrisma } from './infrastructure/classroom.repository.prisma';
import { PrismaService } from 'prisma/prisma.service';
import { ClassroomMemberRepositoryPrisma } from './infrastructure/classroom-member.repository.prisma';

@Module({
  controllers: [ClassroomsController],
  providers: [
    PrismaService,
    ClassroomService, 
    {
      provide: 'ClassroomRepository',
      useClass: ClassroomRepositoryPrisma,
    },
    {
      provide: 'ClassroomMemberRepository',
      useClass: ClassroomMemberRepositoryPrisma,
    }
  ],
})
export class ClassroomsModule {}
