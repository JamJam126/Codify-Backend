import { Submission } from "../submission.entity";

export interface SubmissionRepository {
  create(submission: Submission): Promise<Submission>;
  findById(id: number): Promise<Submission | null>;
  findByStudentAndAssignment(studentId: number, assignmentId: number): Promise<Submission[]>;
  findByAssignment(assignmentId: number): Promise<Submission[]>;
  update(submission: Submission): Promise<Submission>;
}