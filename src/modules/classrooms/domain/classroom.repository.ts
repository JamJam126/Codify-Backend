import { ClassroomResponseDto } from "../presentation/dto/classroom-response.dto";
import { Classroom } from "./classroom.entity";

export interface ClassroomRepository {
  create(classroom: Classroom, creatorId: number): Promise<ClassroomResponseDto>;
  findById(classroomId: number): Promise<Classroom | null>;
  findByIdWithDetails(id: number, userId: number): Promise<ClassroomResponseDto|null>;
  findByClassCode(code: string): Promise<Classroom | null>;
  findAllByUser(userId: number): Promise<ClassroomResponseDto[]>;
  update(classroom: Classroom): Promise<void>;
  deleteById(id: number): Promise<void>;
}
