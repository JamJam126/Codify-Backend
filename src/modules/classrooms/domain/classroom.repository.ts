import { Classroom } from "./classroom.entity";

export interface ClassroomRepository {
  create(classroom: Classroom, creatorId: number): Promise<Classroom>;
  findById(id: number): Promise<Classroom | null>;
  findByClassCode(code: string): Promise<Classroom | null>;
  findAllByUser(userId: number): Promise<Classroom[]>;
  update(classroom: Classroom): Promise<Classroom>;
  deleteById(id: number): Promise<void>;
}
