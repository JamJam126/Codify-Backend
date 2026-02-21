import { Module } from '@nestjs/common';
import { ClassroomsController } from './presentation/classrooms.controller';
import { ClassroomService } from './application/classroom.service';
import { ClassroomRepositoryPrisma } from './infrastructure/classroom.prisma.repository';
import { PrismaService } from 'prisma/prisma.service';
import { ClassroomMemberRepositoryPrisma } from './infrastructure/classroom-member.prisma.repository';
import { ClassroomMembershipService } from './application/classroom-membership.service';

@Module({
  controllers: [ClassroomsController],
  providers: [
    PrismaService,
    ClassroomService,
    ClassroomMembershipService,
    {
      provide: 'ClassroomRepository',
      useClass: ClassroomRepositoryPrisma,
    },
    {
      provide: 'ClassroomMemberRepository',
      useClass: ClassroomMemberRepositoryPrisma,
    }
  ],
  exports: [ClassroomMembershipService],
})
export class ClassroomsModule {}
