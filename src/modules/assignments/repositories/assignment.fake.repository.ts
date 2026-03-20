import { throwError } from 'rxjs';
import { Assignment } from '../assignment.entity';
import { AssignmentRepository } from './assignment.repository';
import { AssignmentChallenge } from '@prisma/client';
import { UpdateAssignmentChallengeDto } from '../dto/update-assignment-challenge.dto';

export class FakeAssignmentRepository implements AssignmentRepository {
  findOneWithChallenges(id: number) {
    throw new Error('Method not implemented.');
  }
  findAssignmentChallengeDetail(assignmentId: number, challengeId: number) {
    throw new Error('Method not implemented.');
  }
  updateAssignmentChallenge(assignmentChallengeId: number, dto: UpdateAssignmentChallengeDto): Promise<AssignmentChallenge | null> {
    throw new Error('Method not implemented.');
  }
  removeChallenge(assignmentId: number, challengeId: number): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  challengeExistsInAssignment(assignmentId: number, challengeId: number): Promise<Boolean> {
    throw new Error('Method not implemented.');
  }
  attachChallenges(assignmentId: number, challengeIds: number[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

  private items: Assignment[] = [];
  private idSeq = 1;

  async create(assignment: Assignment): Promise<Assignment> {
    const rehydrated = Assignment.rehydrate({
      id: this.idSeq++,
      classroomId: assignment.classroomId,
      title: assignment.title,
      description: assignment.description,
      dueAt: assignment.dueAt,
      isPublished: assignment.isPublished,
    });
    this.items.push(rehydrated);

    return rehydrated;
  }

  async findById(id: number): Promise<Assignment | null> {
    const found = this.items.find(a => a.id === id);
    return found ? Assignment.rehydrate({
      id: found.id!,
      classroomId: found.classroomId,
      title: found.title,
      description: found.description,
      dueAt: found.dueAt,
      isPublished: found.isPublished,
    }) : null;
  
  }

  async findAllByClassroom(classroomId: number): Promise<Assignment[]> {
    return this.items
      .filter(a => a.classroomId === classroomId)
      .map((a) => 
        Assignment.rehydrate({
          id: a.id!,
          classroomId: classroomId,
          title: a.title,
          description: a.description,
          dueAt: a.dueAt,
          isPublished: a.isPublished,
        })
      )
  }

  async update(assignment: Assignment): Promise<Assignment> {
    const index = this.items.findIndex(a => a.id === assignment.id);
    if (index === -1) throw new Error('Assignment Not Found');
    const updated = Assignment.rehydrate({
      id: assignment.id!,
      classroomId: assignment.classroomId,
      title: assignment.title,
      description: assignment.description,
      dueAt: assignment.dueAt,
      isPublished: assignment.isPublished,
    });

    this.items[index] = updated;
    return updated;
  }

  async deleteById(id: number): Promise<void> {
    const exists = this.items.some(a => a.id === id);
    if (!exists) throw new Error('Assignment Not Found');

    this.items = this.items.filter(a => a.id !== id);
  }
}