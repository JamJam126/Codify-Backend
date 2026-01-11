import { Inject, Injectable } from '@nestjs/common';
import type { AssignmentRepository } from './repositories/assignment.repository';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Assignment } from './assignment.entity';

@Injectable()
export class AssignmentService {
  constructor(
    @Inject('ASSIGNMENT_REPOSITORY')
    private readonly repo: AssignmentRepository
  ) {}

  create(dto: CreateAssignmentDto): Promise<Assignment> {
    const assignment = Assignment.create({
      sectionId: dto.sectionId,
      title: dto.title,
      description: dto.description,
      dueAt: dto.dueAt,
      position: dto.position,
    });

    return this.repo.create(assignment);
  }
}
