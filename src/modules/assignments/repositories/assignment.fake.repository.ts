import { Assignment } from '../assignment.entity';
import { AssignmentRepository } from './assignment.repository';

export class FakeAssignmentRepository implements AssignmentRepository {
  private items: Assignment[] = [];
  private idSeq = 1;

  async create(assignment: Assignment): Promise<Assignment> {
    const rehydrated = Assignment.rehydrate({
      ...assignment,
      id: this.idSeq++,
    } as any);
    this.items.push(rehydrated);

    for (let i = 0; i < this.items.length; i++) console.log(this.items[i].title);
    return rehydrated;
  }
}
