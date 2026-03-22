export class CodeSubmission {
  constructor(
    public readonly id: number | null,
    public readonly challengeId: number,
    public code: string,
  ) {}

  static create(props: {
    challengeId: number;
    code: string;
  }): CodeSubmission {
    if (props.code.trim() === '') {
      throw new Error('Code cannot be empty');
    }

    return new CodeSubmission(
      null,           
      props.challengeId,
      props.code,
    );
  }

  static rehydrate(props: {
    id: number;
    challengeId: number;
    code: string;
  }): CodeSubmission {
    return new CodeSubmission(
      props.id,
      props.challengeId,
      props.code,
    );
  }
}