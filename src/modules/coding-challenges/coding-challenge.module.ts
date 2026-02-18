import { Module } from "@nestjs/common";
import { CodigChallengeController } from "./coding-challenge.controller";
import { PrismaService } from "prisma/prisma.service";
import { CodingChallengeService } from "./coding-chellenge.service";
import { CodingChallengeRepository } from "./repositories/coding-challenge.repository";
import { CodingChallengePrismaRepository } from "./repositories/coding-challenge.prisma.repository";
import { TestCasePrismaRepository } from "./repositories/test-case.prisma.repository";
import { TestCaseService } from "./test-case.service";

@Module({
  controllers:[CodigChallengeController],
  providers: [
    PrismaService,
    CodingChallengeService,
    TestCaseService,
    {
      provide: "CodingChallengeRepository",
      useClass: CodingChallengePrismaRepository
    },
    {
      provide: "TestCaseRepository",
      useClass: TestCasePrismaRepository
    }
  ]
})

export class CodingChallengModule {}