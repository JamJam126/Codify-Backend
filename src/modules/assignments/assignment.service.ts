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
      title: dto.title,
      description: dto.description,
      dueAt: dto.dueAt,
    });

    return this.repo.create(assignment);
  }

  async attachChallenges(
    classroomId: number,
    assignmentId: number,
    userId: number,
    challengeIds: number[],
  ): Promise<void> {

    await this.membershipService.ensureRole(
      classroomId,
      userId,
      [Role.OWNER, Role.TEACHER],
    );

    const assignment = await this.repo.findById(assignmentId);
    if (!assignment || assignment.classroomId !== classroomId) {
      throw new NotFoundException('Assignment not found');
    }

    if (new Set(challengeIds).size !== challengeIds.length) {
      throw new BadRequestException('Duplicate challenge IDs in request');
    }

    // if (assignment.isPublished) {
    //   throw new BadRequestException(
    //     'Cannot modify a published assignment',
    //   );
    // }

    await this.repo.attachChallenges(assignmentId, challengeIds);
  }

  async updateAssignmentChallenge(
    classroomId: number,
    assignmentId: number,
    assignmentChallengeId: number,
    userId: number,
    dto: UpdateAssignmentChallengeDto,
  ) {

    await this.membershipService.ensureRole(
      classroomId,
      userId,
      [Role.OWNER, Role.TEACHER],
    );

    const assignment = await this.repo.findById(assignmentId);

    if (!assignment || assignment.classroomId !== classroomId) {
      throw new NotFoundException('Assignment not found');
    }

    // if (assignment.isPublished) {
    //   throw new BadRequestException(
    //     'Cannot modify a published assignment',
    //   );
    // }

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

  async removeChallenge(
    classroomId: number,
    assignmentId: number,
    challengeId: number,
    userId: number,
  ): Promise<void> {

    await this.membershipService.ensureRole(
      classroomId,
      userId,
      [Role.OWNER, Role.TEACHER]
    );

    const assignment = await this.repo.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundException(
        'Assignment not found'
      );
    }

    // if (assignment.isPublished) {
    //   throw new BadRequestException('Cannot modify a published assignment');
    // }

    const removed = await this.repo.removeChallenge(assignmentId, challengeId);
    if (!removed) {
      throw new NotFoundException('Challenge is not attached to this assignment');
    }
  }

  async findOne(id: number, classroomId: number, userId: number): Promise<Assignment> {
    await this.membershipService.assertIsMember(classroomId, userId);
    
    const assignment = await this.repo.findById(id);

    if (!assignment || assignment.classroomId !== classroomId) {
      throw new NotFoundException(`Assignment ${id} not found`);
    }
    
    return assignment;
  }

  async findAssignmentDetail(id: number, classroomId: number, userId: number):
    Promise<AssignmentDetailDto>
  {
    const assignment = await this.repo.findOneWithChallenges(id, classroomId, userId);
    
    return assignment
  }

  async getChallengeDetail(
    classroomId: number,
    assignmentId: number,
    challengeId: number,
    userId: number
  ) {
    const challenge = await this.repo.findAssignmentChallengeDetail(assignmentId, challengeId);
    return challenge;
  }

  async findAllByClassroomId(classroomId: number, userId: number): Promise<Assignment[]> {
    await this.membershipService.assertIsMember(classroomId, userId);
    return this.repo.findAllByClassroom(classroomId,userId);
  }

  async update(
    id: number,
    classroomId: number,
    userId: number,
    dto: UpdateAssignmentDto
  ): Promise<AssignmentDetailDto> {
    await this.membershipService.ensureRole(
      classroomId,
      userId,
      [Role.OWNER, Role.TEACHER]
    );

    const assignment = await this.findOne(id, classroomId, userId);
    assignment.update(dto);

    const updated = await this.repo.update(assignment);
    const codingChallenges = await this.codingChallengeService.getAllChallengeByAssignment(id);
    return {
      ...updated,
      codingChallenges
    }    
  }

  async publish(
    id: number,
    classroomId: number, 
    userId: number
  ): Promise<AssignmentDetailDto> {
    await this.membershipService.ensureRole(
      classroomId,
      userId,
      [Role.OWNER, Role.TEACHER]
    );

    const assignment = await this.findOne(id, classroomId, userId);
    assignment.publish();
    
    const publishedAssignment = await this.repo.update(assignment);
    const codingChallenges = await this.codingChallengeService.getAllChallengeByAssignment(id);
    return {
      ...publishedAssignment,
      codingChallenges
    }
  }

  async unPublish(
    id: number,
    classroomId: number,
    userId: number,
  ): Promise<AssignmentDetailDto> {
    await this.membershipService.ensureRole(
      classroomId,
      userId,
      [Role.OWNER, Role.TEACHER]
    );

    const assignment = await this.findOne(id, classroomId, userId);
    assignment.unPublish();


    const unPublishedAssignment = await this.repo.update(assignment);
    const codingChallenges = await this.codingChallengeService.getAllChallengeByAssignment(id);
    return {
      ...unPublishedAssignment,
      codingChallenges
    }
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
