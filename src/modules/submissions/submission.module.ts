import { Module } from "@nestjs/common";
import { SubmissionService } from "./application/submission.service";
import { SubmissionController } from "./presentation/submission.controller";
import { SubmissionPrismaRepository } from "./infrastructure/submission.prisma.repository";
import { ClassroomsModule } from "../classrooms/classrooms.module";
import { PrismaService } from "prisma/prisma.service";
import { AssignmentModule } from "../assignments/assignment.module";
import { CodingChallengModule } from "../coding-challenges/coding-challenge.module";
import { FeedbackService } from "./application/feedback.service";
import { FeedbackPrismaRepository } from "./infrastructure/feedback.prisma.repository";
import { CodeRunnerModule } from "../code-runner/code-runner.module";

@Module({
  imports: [ClassroomsModule, CodingChallengModule, CodeRunnerModule],
  controllers: [SubmissionController],
  providers: [
    SubmissionService,
    FeedbackService,
    PrismaService,
    {
      provide: 'SubmissionRepository',
      useClass: SubmissionPrismaRepository
    },
    {
      provide: 'FeedbackRepository',
      useClass: FeedbackPrismaRepository
    },
  ]
})
export class SubmissionModule {}