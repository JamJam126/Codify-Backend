import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AssignmentRepository } from './repositories/assignment.repository';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Assignment } from './assignment.entity';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { ClassroomMembershipService } from '../classrooms/application/classroom-membership.service';
import { Role } from '../classrooms/domain/role.enum';
import { CodingChallengeService } from '../coding-challenges/application/coding-chellenge.service';
import { CodingChallenge } from '../coding-challenges/domain/coding-challenge.entity';
import { AssignmentDetailDto } from './dto/assignment-detail.dto';
import { UpdateAssignmentChallengeDto } from './dto/update-assignment-challenge.dto';

@Injectable()
export class AssignmentService {
  constructor(
    @Inject('ASSIGNMENT_REPOSITORY')
    private readonly repo: AssignmentRepository,

    private readonly membershipService: ClassroomMembershipService,
    private readonly codingChallengeService: CodingChallengeService
  ) {}

  // REFACTORED
  async create(
    classroomId: number,
    userId: number,
    dto: CreateAssignmentDto
  ): Promise<Assignment> {
    await this.ensureTeacherOrOwner(classroomId, userId);

    const assignment = Assignment.create({
      classroomId: classroomId,
      title: dto.title,
      description: dto.description,
      dueAt: dto.dueAt,
    });

    return this.repo.create(assignment);
  }

  // REFACTORED
  async findOne(id: number, classroomId: number, userId: number): Promise<Assignment> {
    await this.membershipService.assertIsMember(classroomId, userId);
    return this.getAssignmentOrFail(id, classroomId);
  }

  // NOTHING CHANGED
  async findAllByClassroomId(classroomId: number, userId: number): Promise<Assignment[]> {
    await this.membershipService.assertIsMember(classroomId, userId);
    return this.repo.findAllByClassroom(classroomId,userId);
  }

  // REFACTORED
  async findAssignmentDetail(id: number, classroomId: number, userId: number):
    Promise<AssignmentDetailDto>
  {
    const assignment = await this.repo.findOneWithChallenges(id);
    return assignment
  }

  async update(
    id: number,
    classroomId: number,
    userId: number,
    dto: UpdateAssignmentDto
  ): Promise<AssignmentDetailDto> {
    await this.ensureTeacherOrOwner(classroomId, userId);

    const assignment = await this.findOne(id, classroomId, userId);
    assignment.update(dto);

    const updated = await this.repo.update(assignment);
    const codingChallenges = await this.codingChallengeService.getAllChallengeByAssignment(id);
    return {
      ...updated,
      codingChallenges
    }    
  }

  async updateAssignmentChallenge(
    classroomId: number,
    assignmentId: number,
    assignmentChallengeId: number,
    userId: number,
    dto: UpdateAssignmentChallengeDto,
  ) {
    await this.ensureTeacherOrOwner(classroomId, userId);
    await this.getAssignmentOrFail(assignmentId, classroomId);

    const updated = await this.repo.updateAssignmentChallenge(
      assignmentChallengeId,
      dto,
    );

    if (!updated) {
      throw new NotFoundException(
        'Assignment challenge not found',
      );
    }

    return updated;
  }

  async publish(
    id: number,
    classroomId: number, 
    userId: number
  ): Promise<AssignmentDetailDto> {
    await this.ensureTeacherOrOwner(classroomId, userId);

    const assignment = await this.findOne(id, classroomId, userId);
    assignment.publish();
    
    const publishedAssignment = await this.repo.update(assignment);
    const codingChallenges = await this.codingChallengeService.getAllChallengeByAssignment(id);
    return {
      ...publishedAssignment,
      codingChallenges
    }
  }

  // REFACTORED
  async attachChallenges(
    classroomId: number,
    assignmentId: number,
    userId: number,
    challengeIds: number[],
  ): Promise<void> {
    await this.ensureTeacherOrOwner(classroomId, userId);
    await this.getAssignmentOrFail(assignmentId, classroomId);

    if (new Set(challengeIds).size !== challengeIds.length) {
      throw new BadRequestException('Duplicate challenge IDs in request');
    }

    await this.repo.attachChallenges(assignmentId, challengeIds);
  }

  // REFACTORED
  async removeChallenge(
    classroomId: number,
    assignmentId: number,
    challengeId: number,
    userId: number,
  ): Promise<void> {
    await this.ensureTeacherOrOwner(classroomId, userId);
    await this.getAssignmentOrFail(assignmentId, classroomId);

    const removed = await this.repo.removeChallenge(assignmentId, challengeId);
    if (!removed) {
      throw new NotFoundException('Challenge is not attached to this assignment');
    }
  }

  // REFACTORED
  async getChallengeDetail(
    classroomId: number,
    assignmentId: number,
    challengeId: number,
    userId: number
  ) {
    await this.membershipService.assertIsMember(classroomId, userId);

    const challenge = await this.repo.findAssignmentChallengeDetail(assignmentId, challengeId);
    if (!challenge) {
      throw new NotFoundException('Challenge not found in assignment');
    }
    
    return challenge;
  }
  
  // REFACTORED
  async delete(
    id: number,
    classroomId: number, 
    userId: number
  ): Promise<void> {
    await this.ensureTeacherOrOwner(classroomId, userId);
    await this.repo.deleteById(id);
  }

  // ========== HELPERS ==========
  private async ensureTeacherOrOwner(classroomId: number, userId: number) {
    await this.membershipService.ensureRole(classroomId, userId, [Role.OWNER, Role.TEACHER]);
  }

  private async getAssignmentOrFail(assignmentId: number, classroomId: number): Promise<Assignment> {
    const assignment = await this.repo.findById(assignmentId);
    if (!assignment || assignment.classroomId !== classroomId) {
      throw new NotFoundException('Assignment not found');
    }
    return assignment;
  }
}
