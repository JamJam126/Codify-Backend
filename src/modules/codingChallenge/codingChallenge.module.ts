import { Module } from "@nestjs/common";
import { CodigChallengeController } from "./codingChallenge.controller";
import { PrismaService } from "prisma/prisma.service";
import { CodingChallengeService } from "./codingChellenge.service";
import { CodingChallengeRepository } from "./repositories/codingChallenge.repository";

@Module({
  controllers:[CodigChallengeController],
  providers: [
    PrismaService,
    CodingChallengeService,
    {
      provide:"CodingChallenge_Repository",
      useClass:CodingChallengeRepository
    }
  ]
})

export class CodingChallengModule {}