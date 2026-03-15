import { ClassroomResponseDto } from "../presentation/dto/classroom-response.dto";
import { Classroom } from "./classroom.entity";

export interface ClassroomRepository {
  create(classroom: Classroom, creatorId: number): Promise<ClassroomResponseDto>;
  findById(id: number,userId: number): Promise<ClassroomResponseDto|null>;
  findByClassCode(code: string): Promise<Classroom | null>;
  findAllByUser(userId: number): Promise<ClassroomResponseDto[]>;
  update(classroom: ClassroomResponseDto,userId:number): Promise<ClassroomResponseDto>;
  deleteById(id: number): Promise<void>;
}
