import { Assignment } from "../assignment.entity";

export interface AssignmentRepository {
  create(assignment: Assignment): Promise<Assignment>;
  findById(id: number): Promise<Assignment | null>;
  findAllBySection(sectionId: number): Promise<Assignment[]>;
  update(assignment: Assignment): Promise<Assignment>;
  deleteById(id: number): Promise<void>;
}
