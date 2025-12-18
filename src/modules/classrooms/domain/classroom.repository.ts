import { Classroom } from './classroom.entity';

export interface ClassroomRepository {
  save(entity: Classroom): Promise<Classroom>;
  findAll(): Promise<Classroom[]>;
  findById(id: number): Promise<Classroom | null>;
  findByClassCode(classCode: string): Promise<Classroom | null>;
  findAllByTeacherId(teacherId: number): Promise<Classroom[]>;
  deleteById(id: number): Promise<void>;
}
