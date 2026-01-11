import { Assignment } from "../assignment.entity";

export interface AssignmentRepository {
  create(assignment: Assignment): Promise<Assignment>;
}
