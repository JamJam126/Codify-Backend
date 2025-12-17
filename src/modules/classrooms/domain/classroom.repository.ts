import { Classroom } from './classroom.entity';

export interface ClassroomRepository {
  save(entity: Classroom): Promise<Classroom>;
}
