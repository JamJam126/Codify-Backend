import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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

  async findOne(id: number): Promise<Assignment> {
    const assignment = await this.repo.findById(id);
    if (!assignment) throw new NotFoundException(`Assignment ${id} not found`);
    
    return assignment;
  }

  async findAllBySection(sectionId: number): Promise<Assignment[]> {
    return this.repo.findAllBySection(sectionId);
  }
}
