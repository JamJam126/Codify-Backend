import { Module } from "@nestjs/common";
import { CodigChallengeController } from "./coding-challenge.controller";
import { PrismaService } from "prisma/prisma.service";
import { CodingChallengeService } from "./coding-chellenge.service";
import { CodingChallengeRepository } from "./repositories/coding-challenge.repository";

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