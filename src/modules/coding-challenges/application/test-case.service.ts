import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { TestCaseRepository } from "../domain/test-case.repository";
import { CodingChallengeService } from "./coding-chellenge.service";
import { CreateTestCaseDto } from "../presentation/dto/create-test-case.dto";
import { TestCase } from "../domain/test-case.entity";
import { UpdateTestCaseDto } from "../presentation/dto/update-test-case.dto";

@Injectable()
export class TestCaseService {
  constructor(
    @Inject("TestCaseRepository")
    private readonly repo: TestCaseRepository,

    private readonly challengeService: CodingChallengeService,    
  ) { }
  
  async createTestCase(
    challengeId: number,
    userId: number,
    dto: CreateTestCaseDto
  ) {
    await this.challengeService.getChallengeById(challengeId, userId);
    let testCase: TestCase;

    try {
      testCase = TestCase.create({
        challengeId: challengeId,
        input: dto.input,
        expectedOutput: dto.expectedOutput,
        score: dto.score,
        isHidden: dto.isHidden,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    return this.repo.create(testCase);
  }

  async getTestCaseById(id: number, userId: number) {
    const testCase = await this.repo.findById(id);
    if (!testCase) throw new NotFoundException("Test case not found");

    await this.challengeService.getChallengeById(testCase.challengeId, userId);
    return testCase;
  }

  async getAllTestCasesForChallenge(challengeId: number, userId: number) {
    await this.challengeService.getChallengeById(challengeId, userId);
    return this.repo.getByChallengeId(challengeId);
  }

  async updateTestCase(id: number, dto: UpdateTestCaseDto, userId: number) {
    const testCase = await this.repo.findById(id);
    if (!testCase) throw new NotFoundException("Test case not found");

    await this.challengeService.getChallengeById(testCase.challengeId, userId);

    const updatedTestCase = await this.repo.update(id, {
      input: dto.input,
      expectedOutput: dto.expectedOutput,
      score: dto.score,
      isHidden: dto.isHidden,
    });

    return updatedTestCase;
  }

  async deleteTestCase(id: number, userId: number) {
    const testCase = await this.repo.findById(id);
    if (!testCase) throw new NotFoundException("Test case not found");

    await this.challengeService.getChallengeById(testCase.challengeId, userId);

    await this.repo.delete(id);

    return { message: "Test case deleted successfully" };
  }
}