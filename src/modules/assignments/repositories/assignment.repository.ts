import { Assignment } from "../assignment.entity";

export interface AssignmentRepository {
  create(assignment: Assignment): Promise<Assignment>;
  attachChallenges(assignmentId: number, challengeIds: number[]): Promise<void>
  findById(id: number): Promise<Assignment | null>;
  // findAllBySection(sectionId: number): Promise<Assignment[]>;
  findAllByClassroom(classroomId: number): Promise<Assignment[]>;
  update(assignment: Assignment): Promise<Assignment>;
  deleteById(id: number): Promise<void>;
}
