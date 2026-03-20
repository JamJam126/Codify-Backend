
import { Submission } from "./submission.entity";

export class Feedback {
  constructor(
    public readonly id: number | null,
    public teacherId: number,
    public submissionId: number,
    public score: number,
    public text?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  static create(props: {
    teacherId: number;
    submissionId: number;
    score: number;
    text?: string;
  }): Feedback {
    const now = new Date();
    return new Feedback(
      null,
      props.teacherId,
      props.submissionId,
      props.score,
      props.text,
      now,
      now,
    );
  }

  static rehydrate(props: {
    id: number;
    teacherId: number;
    submissionId: number;
    score: number;
    text?: string;
    createdAt: Date;
    updatedAt: Date;
  }): Feedback {
    return new Feedback(
      props.id,
      props.teacherId,
      props.submissionId,
      props.score,
      props.text,
      props.createdAt,
      props.updatedAt,
    );
  }
}