import { AssignmentChallenge } from "@prisma/client";
import { Assignment } from "../assignment.entity";
import { UpdateAssignmentChallengeDto } from "../dto/update-assignment-challenge.dto";

export interface AssignmentRepository {
  create(assignment: Assignment): Promise<Assignment>;
  attachChallenges(assignmentId: number, challengeIds: number[]): Promise<void>;
  updateAssignmentChallenge(
    assignmentChallengeId: number,
    dto: UpdateAssignmentChallengeDto
  ): Promise<AssignmentChallenge | null>;
  removeChallenge(assignmentId: number, challengeId: number): Promise<boolean>;
  challengeExistsInAssignment(assignmentId: number, challengeId: number): Promise<Boolean>;
  findById(id: number): Promise<Assignment | null>;
  findOneWithChallenges(id: number);
  findAssignmentChallengeDetail(assignmentId: number, challengeId: number);
  findAllByClassroom(classroomId: number,userId:number): Promise<Assignment[]>;
  update(assignment: Assignment): Promise<Assignment>;
  deleteById(id: number): Promise<void>;
}
