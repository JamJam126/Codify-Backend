import { Classroom } from './classroom.entity';

export interface ClassroomRepository {
  save(entity: Classroom, creatorId: number): Promise<Classroom>;
}
