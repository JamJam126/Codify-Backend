import { Module } from "@nestjs/common";
import { SubmissionService } from "./application/submission.service";
import { SubmissionController } from "./presentation/submission.controller";
import { SubmissionPrismaRepository } from "./infrastructure/submission.prisma.repository";
import { ClassroomsModule } from "../classrooms/classrooms.module";
import { PrismaService } from "prisma/prisma.service";
import { AssignmentModule } from "../assignments/assignment.module";
import { CodingChallengModule } from "../coding-challenges/coding-challenge.module";

@Module({
  imports: [ClassroomsModule, CodingChallengModule],
  controllers: [SubmissionController],
  providers: [
    SubmissionService,
    PrismaService,
    {
      provide: 'SubmissionRepository',
      useClass: SubmissionPrismaRepository
    },
  ]
})
export class SubmissionModule {}