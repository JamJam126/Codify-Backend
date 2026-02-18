import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { TestCase } from "../test-case.entity";
import { TestCaseRepository } from "./test-case.repository";

@Injectable()
export class TestCasePrismaRepository implements TestCaseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(testCase: TestCase): Promise<TestCase> {
    const created = await this.prisma.testCase.create({
      data: {
        challenge_id: testCase.challengeId,
        input: testCase.input,
        expected_output: testCase.expectedOutput,
        score: testCase.score,
        is_hidden: testCase.isHidden,
        created_at: testCase.createdAt,
        updated_at: testCase.updatedAt,
      },
    });

    return TestCase.rehydrate({
      id: created.id,
      challengeId: created.challenge_id,
      input: created.input,
      expectedOutput: created.expected_output,
      score: created.score,
      isHidden: created.is_hidden,
      createdAt: created.created_at,
      updatedAt: created.updated_at,
    });
  }

  async findById(id: number): Promise<TestCase | null> {
    const found = await this.prisma.testCase.findUnique({ where: { id } });
    if (!found) return null;

    return TestCase.rehydrate({
      id: found.id,
      challengeId: found.challenge_id,
      input: found.input,
      expectedOutput: found.expected_output,
      score: found.score,
      isHidden: found.is_hidden,
      createdAt: found.created_at,
      updatedAt: found.updated_at,
    });
  }

  async getByChallengeId(challengeId: number): Promise<TestCase[]> {
    const cases = await this.prisma.testCase.findMany({
      where: { challenge_id: challengeId },
    });

    return cases.map(tc =>
      TestCase.rehydrate({
        id: tc.id,
        challengeId: tc.challenge_id,
        input: tc.input,
        expectedOutput: tc.expected_output,
        score: tc.score,
        isHidden: tc.is_hidden,
        createdAt: tc.created_at,
        updatedAt: tc.updated_at,
      }),
    );
  }

  async update(id: number, data: Partial<TestCase>): Promise<TestCase> {
    const updated = await this.prisma.testCase.update({
      where: { id },
      data: {
        input: data.input,
        expected_output: data.expectedOutput,
        score: data.score,
        is_hidden: data.isHidden,
        updated_at: new Date(),
      },
    });

    return TestCase.rehydrate({
      id: updated.id,
      challengeId: updated.challenge_id,
      input: updated.input,
      expectedOutput: updated.expected_output,
      score: updated.score,
      isHidden: updated.is_hidden,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.testCase.delete({ where: { id } });
  }
}
