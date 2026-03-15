import { Assignment } from "../assignment.entity";

export interface AssignmentRepository {
  create(assignment: Assignment): Promise<Assignment>;
  attachChallenges(assignmentId: number, challengeIds: number[]): Promise<void>;
  removeChallenge(assignmentId: number, challengeId: number): Promise<boolean>;
  challengeExistsInAssignment(assignmentId: number, challengeId: number): Promise<Boolean>;
  findById(id: number): Promise<Assignment | null>;
  // findAllBySection(sectionId: number): Promise<Assignment[]>;
  findAllByClassroom(classroomId: number,userId:number): Promise<Assignment[]>;
  update(assignment: Assignment): Promise<Assignment>;
  deleteById(id: number): Promise<void>;
}
