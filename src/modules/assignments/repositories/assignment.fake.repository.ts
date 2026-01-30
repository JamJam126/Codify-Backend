import { throwError } from 'rxjs';
import { Assignment } from '../assignment.entity';
import { AssignmentRepository } from './assignment.repository';

export class FakeAssignmentRepository implements AssignmentRepository {
  private items: Assignment[] = [];
  private idSeq = 1;

  async create(assignment: Assignment): Promise<Assignment> {
    const rehydrated = Assignment.rehydrate({
      id: this.idSeq++,
      classroomId: assignment.classroomId,
      sectionId: assignment.sectionId,
      title: assignment.title,
      description: assignment.description,
      dueAt: assignment.dueAt,
      position: assignment.position,
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
      sectionId: found.sectionId,
      title: found.title,
      description: found.description,
      dueAt: found.dueAt,
      position: found.position,
      isPublished: found.isPublished,
    }) : null;
  
  }

  async findAllBySection(sectionId: number): Promise<Assignment[]> {
    throw new Error('Method not implemented.');
    // return this.items
    //   .filter(a => a.sectionId === sectionId)
    //   .sort((a, b) => a.position - b.position)
    //   .map((a) => 
    //     Assignment.rehydrate({
    //       id: a.id!,
    //       classroomId: assignment.classroomId,
    //       sectionId: a.sectionId,
    //       title: a.title,
    //       description: a.description,
    //       dueAt: a.dueAt,
    //       position: a.position,
    //       isPublished: a.isPublished,
    //     })
    //   )
  }

  async findAllByClassroom(classroomId: number): Promise<Assignment[]> {
    return this.items
      .filter(a => a.classroomId === classroomId)
      .sort((a, b) => a.position - b.position)
      .map((a) => 
        Assignment.rehydrate({
          id: a.id!,
          classroomId: classroomId,
          sectionId: a.sectionId,
          title: a.title,
          description: a.description,
          dueAt: a.dueAt,
          position: a.position,
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
      sectionId: assignment.sectionId,
      title: assignment.title,
      description: assignment.description,
      dueAt: assignment.dueAt,
      position: assignment.position,
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