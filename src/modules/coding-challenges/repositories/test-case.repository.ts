import { TestCase } from "../test-case.entity";

export interface TestCaseRepository {
  create(testCase: TestCase): Promise<TestCase>;
  findById(id: number): Promise<TestCase | null>;
  getByChallengeId(challengeId: number): Promise<TestCase[]>;
  update(id: number, testCase: Partial<TestCase>): Promise<TestCase>;
  delete(id: number): Promise<void>;
}
