import { TestCase } from '../test-case.entity';
import { TestCaseRepository } from './test-case.repository';

export class FakeTestCaseRepository implements TestCaseRepository {
  private items: TestCase[] = [];
  private idSeq = 1;

  async create(testCase: TestCase): Promise<TestCase> {
    const created = TestCase.rehydrate({
      id: this.idSeq++,
      challengeId: testCase.challengeId,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      score: testCase.score,
      isHidden: testCase.isHidden,
      createdAt: testCase.createdAt ?? new Date(),
      updatedAt: testCase.updatedAt ?? new Date(),
    });

    this.items.push(created);
    return created;
  }

  async findById(id: number): Promise<TestCase | null> {
    const found = this.items.find(tc => tc.id === id);

    if (!found) return null;

    return TestCase.rehydrate({
      id: found.id!,
      challengeId: found.challengeId,
      input: found.input,
      expectedOutput: found.expectedOutput,
      score: found.score,
      isHidden: found.isHidden,
      createdAt: found.createdAt!,
      updatedAt: found.updatedAt!,
    });
  }

  async getByChallengeId(challengeId: number): Promise<TestCase[]> {
    return this.items
      .filter(tc => tc.challengeId === challengeId)
      .map(tc =>
        TestCase.rehydrate({
          id: tc.id!,
          challengeId: tc.challengeId,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          score: tc.score,
          isHidden: tc.isHidden,
          createdAt: tc.createdAt!,
          updatedAt: tc.updatedAt!,
        }),
      );
  }

  async update(id: number, data: Partial<TestCase>): Promise<TestCase> {
    const index = this.items.findIndex(tc => tc.id === id);

    if (index === -1) {
      throw new Error('TestCase not found');
    }

    const existing = this.items[index];

    const updated = TestCase.rehydrate({
      id: existing.id!,
      challengeId: existing.challengeId,
      input: data.input ?? existing.input,
      expectedOutput: data.expectedOutput ?? existing.expectedOutput,
      score: data.score ?? existing.score,
      isHidden: data.isHidden ?? existing.isHidden,
      createdAt: existing.createdAt!,
      updatedAt: new Date(),
    });

    this.items[index] = updated;

    return updated;
  }

  async delete(id: number): Promise<void> {
    const exists = this.items.some(tc => tc.id === id);

    if (!exists) {
      throw new Error('TestCase not found');
    }

    this.items = this.items.filter(tc => tc.id !== id);
  }
}
