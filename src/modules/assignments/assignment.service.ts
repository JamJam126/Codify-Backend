import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AssignmentRepository } from './repositories/assignment.repository';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Assignment } from './assignment.entity';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { ClassroomMembershipService } from '../classrooms/application/classroom-membership.service';
import { Role } from '../classrooms/domain/role.enum';

@Injectable()
export class AssignmentService {
  constructor(
    @Inject('ASSIGNMENT_REPOSITORY')
    private readonly repo: AssignmentRepository,

    private readonly membershipService: ClassroomMembershipService
  ) {}

  async create(
    classroomId: number,
    userId: number,
    dto: CreateAssignmentDto
  ): Promise<Assignment> {
    await this.membershipService.ensureRole(
      classroomId,
      userId,
      [Role.OWNER, Role.TEACHER]
    );

    const assignment = Assignment.create({
      classroomId: classroomId,
      sectionId: 1,
      title: dto.title,
      description: dto.description,
      dueAt: dto.dueAt,
      position: dto.position,
    });

    return this.repo.create(assignment);
  }

  async findOne(id: number, classroomId: number, userId: number): Promise<Assignment> {
    const assignment = await this.repo.findById(id);
    if (!assignment || assignment.classroomId !== classroomId) {
      throw new NotFoundException(`Assignment ${id} not found`);
    }
    
    await this.membershipService.assertIsMember(classroomId, userId);
    return assignment;
  }

  // async findAllBySection(sectionId: number): Promise<Assignment[]> {
  //   return this.repo.findAllBySection(sectionId);
  // }

  async findAllByClassroomId(classroomId: number, userId: number): Promise<Assignment[]> {
    await this.membershipService.assertIsMember(classroomId, userId);
    return this.repo.findAllByClassroom(classroomId);
  }

  async update(
    id: number,
    classroomId: number,
    userId: number,
    dto: UpdateAssignmentDto
  ): Promise<Assignment> {
    await this.membershipService.ensureRole(
      classroomId,
      userId,
      [Role.OWNER, Role.TEACHER]
    );

    const assignment = await this.findOne(id, classroomId, userId);
    assignment.update(dto);

    return this.repo.update(assignment);
  }

  async publish(
    id: number,
    classroomId: number, 
    userId: number
  ): Promise<Assignment> {
    await this.membershipService.ensureRole(
      classroomId,
      userId,
      [Role.OWNER, Role.TEACHER]
    );

    const assignment = await this.findOne(id, classroomId, userId);
    assignment.publish();

    return this.repo.update(assignment);
  }
  
  async delete(
    id: number,
    classroomId: number, 
    userId: number
  ): Promise<void> {
    await this.membershipService.ensureRole(
      classroomId,
      userId,
      [Role.OWNER, Role.TEACHER]
    );

    const assignment = await this.findOne(id, classroomId, userId);
    await this.repo.deleteById(id);
  }
}
