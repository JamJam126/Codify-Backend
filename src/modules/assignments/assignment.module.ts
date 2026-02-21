import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { PrismaService } from 'prisma/prisma.service';
import { AssignmentPrismaRepository } from './repositories/assignment.prisma.repository';
import { FakeAssignmentRepository } from './repositories/assignment.fake.repository';
import { ClassroomMembershipService } from '../classrooms/application/classroom-membership.service';
import { ClassroomMemberRepositoryPrisma } from '../classrooms/infrastructure/classroom-member.prisma.repository';
import { ClassroomsModule } from '../classrooms/classrooms.module';

@Module({
  imports: [ClassroomsModule],
  controllers: [AssignmentController],
  providers: [
    PrismaService,
    AssignmentService,
    {
      provide: 'ASSIGNMENT_REPOSITORY',
      useClass: AssignmentPrismaRepository
    },
  ],
})
export class AssignmentModule {}
