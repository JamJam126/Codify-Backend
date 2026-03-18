export class TestCase {
  constructor(
    public readonly id: number | null,
    public challengeId: number,
    public input: string,
    public expectedOutput: string,
    public score: number,
    public isHidden: boolean = false,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  // create new test case
  static create(props: {
    challengeId: number;
    input: string;
    expectedOutput: string;
    score: number;
    isHidden?: boolean;
  }): TestCase {
    if (props.input.trim() === '' || props.expectedOutput.trim() === '') {
      throw new Error('Input and expected output cannot be empty');
    }
    if (props.score < 0) {
      throw new Error('Score must be non-negative');
    }
    const now = new Date();
    return new TestCase(
      null,
      props.challengeId,
      props.input,
      props.expectedOutput,
      props.score,
      props.isHidden ?? false,
      now,
      now
    );
  }

  static rehydrate(props: {
    id: number;
    challengeId: number;
    input: string;
    expectedOutput: string;
    score: number;
    isHidden: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): TestCase {
    return new TestCase(
      props.id,
      props.challengeId,
      props.input,
      props.expectedOutput,
      props.score,
      props.isHidden,
      props.createdAt,
      props.updatedAt
    );
  }
}
