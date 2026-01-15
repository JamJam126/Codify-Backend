import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { PrismaService } from 'prisma/prisma.service';
import { AssignmentPrismaRepository } from './repositories/assignment.prisma.repository';
import { FakeAssignmentRepository } from './repositories/assignment.fake.repository';

@Module({
  controllers: [AssignmentController],
  providers: [
    PrismaService,
    AssignmentService,
    {
      provide: 'ASSIGNMENT_REPOSITORY',
      useClass: FakeAssignmentRepository
    }
  ],
})
export class AssignmentModule {}
