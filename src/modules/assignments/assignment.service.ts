import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AssignmentRepository } from './repositories/assignment.repository';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Assignment } from './assignment.entity';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentService {
  constructor(
    @Inject('ASSIGNMENT_REPOSITORY')
    private readonly repo: AssignmentRepository
  ) {}

  create(dto: CreateAssignmentDto): Promise<Assignment> {
    let assignment:Assignment
    try {
      assignment = Assignment.create({
        sectionId: dto.sectionId,
        title: dto.title,
        description: dto.description,
        dueAt: dto.dueAt,
        position: dto.position,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }

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

  async update(id: number, dto: UpdateAssignmentDto): Promise<Assignment> {
    const assignment = await this.findOne(id);
    assignment.update(dto);

    return this.repo.update(assignment);
  }

  async publish(id: number): Promise<Assignment> {
    const assignment = await this.findOne(id);
    assignment.publish();

    return this.repo.update(assignment);
  }
  
  async delete(id: number): Promise<void> {
    await this.findOne(id);
    await this.repo.deleteById(id);
  }
}
