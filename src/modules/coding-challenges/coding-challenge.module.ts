import { Module } from "@nestjs/common";
import { CodingChallengeController } from "./presentation/coding-challenge.controller";
import { PrismaService } from "prisma/prisma.service";
import { CodingChallengeService } from "./application/coding-chellenge.service";
import { CodingChallengeRepository } from "./domain/coding-challenge.repository";
import { CodingChallengePrismaRepository } from "./repositories/coding-challenge.prisma.repository";
import { TestCasePrismaRepository } from "./repositories/test-case.prisma.repository";
import { TestCaseService } from "./application/test-case.service";
import { TagService } from "./application/tag.service";
import { TagPrismaRepository } from "./repositories/tag.prisma.repository";

@Module({
  controllers:[CodingChallengeController],
  providers: [
    PrismaService,
    CodingChallengeService,
    TestCaseService,
    TagService,
    {
      provide: "CodingChallengeRepository",
      useClass: CodingChallengePrismaRepository
    },
    {
      provide: "TestCaseRepository",
      useClass: TestCasePrismaRepository
    },
    {
      provide: "TagRepository",
      useClass: TagPrismaRepository
    }
  ],
  exports: [CodingChallengeService]
})

export class CodingChallengModule {}