import { CodeSubmission } from "./challengeSubmission.entity";
import { SubmissionStatus } from "./submissionStatus.enum";

export class Submission {
  constructor(
    public readonly id: number | null,
    public userId: number,
    public assignmentId: number,
    public status: SubmissionStatus = SubmissionStatus.DRAFT,
    public totalScore: number,
    public createdAt?: Date,
    public updatedAt?: Date,
    public submittedAt?: Date,
    public codeSubmissions: CodeSubmission[] = [],
  ) {}

  static create(props: {
    userId: number;
    assignmentId: number;
    status?: SubmissionStatus;
    submittedAt?: Date;
    codeSubmissions?: CodeSubmission[];
  }): Submission {
    const now = new Date();
    return new Submission(
      null,
      props.userId,
      props.assignmentId,
      props.status ?? SubmissionStatus.DRAFT,
      0,
      now,
      now,
      props.submittedAt,
      props.codeSubmissions ?? [],
    );
  }

  static rehydrate(props: {
    id: number;
    userId: number;
    assignmentId: number;
    status: SubmissionStatus;
    totalScore: number;
    createdAt: Date;
    updatedAt: Date;
    submittedAt?: Date;
    codeSubmissions: CodeSubmission[];
  }): Submission {
    return new Submission(
      props.id,
      props.userId,
      props.assignmentId,
      props.status,
      props.totalScore,
      props.createdAt,
      props.updatedAt,
      props.submittedAt,
      props.codeSubmissions,
    );
  }

  turnIn() {
    const now = new Date();

    this.status = SubmissionStatus.SUBMITTED;
    this.submittedAt = now;
    this.updatedAt = now;
  }
}