import { Feedback } from "../domain/feedback.entity";
import { FeedBackRepository } from "./feedback.repository";

class FeedBackPrismaRepository implements FeedBackRepository{
  create(submission: Feedback): Promise<Feedback> {
    throw new Error("Method not implemented.");
  }
  findBysubmissionId(id: number): Promise<Feedback | null> {
    throw new Error("Method not implemented.");
  }
  update(submission: Feedback): Promise<Feedback> {
    throw new Error("Method not implemented.");
  }
  fdeletefeedback(assignmentId: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

}