import { Feedback } from "../domain/feedback.entity";

export interface FeedBackRepository {
  create(submission: Feedback): Promise<Feedback>;
  findBysubmissionId(id: number): Promise<Feedback | null>;
  update(submission: Feedback): Promise<Feedback>;
  fdeletefeedback(assignmentId: number): Promise<void>;
}