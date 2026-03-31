import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AssignmentRepository } from './repositories/assignment.repository';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Assignment } from './assignment.entity';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { ClassroomMembershipService } from '../classrooms/application/classroom-membership.service';
import { Role } from '../classrooms/domain/role.enum';
import { AssignmentDetailDto } from './dto/response/assignment-detail.dto';
import { UpdateAssignmentChallengeDto } from './dto/update-assignment-challenge.dto';
import { AssignmentListItemDto } from './dto/response/assignment-list-item.dto';
import { AssignmentChallengeDetailDto } from './dto/response/assignment-challenge-detail.dto';
import { AssignmentDto } from './dto/response/assignment.dto';
import { AssignmentChallengeDto } from './dto/response/assignment-challenge.dto';
import { deriveSubmissionStatus } from 'src/common/utils/derive-submission-status.util';

@Injectable()
export class AssignmentService {
  constructor(
    @Inject('ASSIGNMENT_REPOSITORY')
    private readonly repo: AssignmentRepository,

    private readonly membershipService: ClassroomMembershipService,
  ) {}

  /* ========= CREATE ========= */
  async create(
    classroomId: number,
    userId: number,
    dto: CreateAssignmentDto
  ): Promise<AssignmentDto> {
    await this.ensureTeacherOrOwner(classroomId, userId);

    const assignment = Assignment.create({
      classroomId: classroomId,
      title: dto.title,
      description: dto.description,
      dueAt: dto.dueAt,
    });

    const created = await this.repo.create(assignment);
    return {
      id: created.id!,
      title: created.title,
      description: created.description,
      dueAt: created.dueAt,
      isPublished: created.isPublished,
    }
  }

  /* ========= READ ========= */ 
  async findOne(
    id: number,
    classroomId: number,
    userId: number
  ): Promise<Assignment> {
    await this.membershipService.assertIsMember(classroomId, userId);
    return await this.getAssignmentOrFail(id, classroomId);
  }

  async findAllByClassroomId(
    classroomId: number,
    userId: number
  ): Promise<AssignmentListItemDto[]> {
    const user = await this.membershipService.assertIsMember(classroomId, userId);
    const assignments = await this.repo.findAllByClassroom(classroomId, userId);
    
    const filtered =
      user.role === "STUDENT"
        ? assignments.filter(a => a.is_published)
        : assignments;
  
    return filtered.map(a => {
      const submission = a.submissions[0] ?? null;

      return {
        id: a.id,
        classroomId: a.classroom_id,
        title: a.title,
        description: a.description,
        dueAt: a.due_at,
        isPublished: a.is_published,
        submissionStatus: deriveSubmissionStatus(
          submission?.submitted_at ?? null,
          a.due_at,
          submission?.status
        ),
        submittedAt: submission?.submitted_at ?? null,
        totalScore: submission?.total_score ?? 0,
      };
    });
  }

  async findAssignmentDetail(id: number, classroomId: number, userId: number):
    Promise<AssignmentDetailDto>
  {
    const assignment = await this.repo.findOneWithChallenges(id);
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return {
      id: assignment.id,
      // classroomId: assignment.classroom_id,
      title: assignment.title,
      description: assignment.description,
      dueAt: assignment.due_at,
      isPublished: assignment.is_published,
      codingChallenges: assignment.assignmentChallenges.map(c => ({
        id: c.id ?? 0,
        originalChallengeId: c.original_challenge_id ?? 0,
        originalTitle: c.original_title,
        title: c.title,
        description: c.description,
        startCode: c.starter_code,
        language: c.language,
        difficulty: c.difficulty,
        tagName: c.tag_name ?? undefined,
      }))
    };
  }

  async getChallengeDetail(
    classroomId: number,
    assignmentId: number,
    challengeId: number,
    userId: number
  ): Promise<AssignmentChallengeDetailDto> {
    await this.membershipService.assertIsMember(classroomId, userId);

    const challenge = await this.repo.findAssignmentChallengeDetail(assignmentId, challengeId);
    if (!challenge) {
      throw new NotFoundException('Challenge not found in assignment');
    }
    
    return {
      id: challenge.id,
      assignmentId: challenge.assignment_id,
      originalChallengeId: challenge.original_challenge_id!,
      title: challenge.title,
      description: challenge.description,
      startCode: challenge.starter_code,
      language: challenge.language,
      difficulty: challenge.difficulty,
      // createdAt: challenge.created_at,
      // updatedAt: challenge.updated_at,
      testCases: challenge.test_cases.map(tc => ({
        id: tc.id,
        // createdAt: tc.created_at,
        // updatedAt: tc.updated_at,
        input: tc.input,
        expectedOutput: tc.expected_output,
        score: tc.score,
        isHidden: tc.is_hidden,
        assignmentChallengeId: tc.assignment_challenge_id,
        originalChallengeId: tc.assignmentChallenge.original_challenge_id ?? undefined
      }))
    };
  }

  /* ========= UPDATE ========= */   
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
    const assignmentChallenges = await this.repo.findAssignmentChallenges(id);
    return {
      id: updated.id!,
      // classroomId
      title: updated.title,
      description: updated.description,
      dueAt: updated.dueAt,
      isPublished: updated.isPublished,
      codingChallenges: assignmentChallenges.map(c => ({
        id: c.id!,
        originalChallengeId: c.originalChallengeId!,
        originalTitle: c.originalTitle,
        title: c.title,
        description: c.description,
        startCode: c.starterCode,
        language: c.language,
        difficulty: c.difficulty,
        tagName: c.tagName ?? undefined,
      }))
    }    
  }

  async updateAssignmentChallenge(
    classroomId: number,
    assignmentId: number,
    assignmentChallengeId: number,
    userId: number,
    dto: UpdateAssignmentChallengeDto,
  ): Promise<AssignmentChallengeDto> {
    await this.ensureTeacherOrOwner(classroomId, userId);
    await this.getAssignmentOrFail(assignmentId, classroomId);

    const aChallenge = await this.repo.findAssignmentChallenge(assignmentChallengeId);
    if (!aChallenge) {
      throw new NotFoundException('Assignment challenge not found');
    }

    aChallenge.update(dto);
    const updated = await this.repo.updateAssignmentChallenge(assignmentChallengeId, aChallenge);

    return {
      id: updated.id!,
      originalChallengeId: updated.originalChallengeId ?? undefined,
      originalTitle: updated.originalTitle,
      title: updated.title,
      description: updated.description,
      startCode: updated.starterCode,
      language: updated.language,
      difficulty: updated.difficulty,
      tagName: updated.tagName ?? undefined
    };
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
    const assignmentChallenges = await this.repo.findAssignmentChallenges(id);
    return {
      id: publishedAssignment.id!,
      // classroomId
      title: publishedAssignment.title,
      description: publishedAssignment.description,
      dueAt: publishedAssignment.dueAt,
      isPublished: publishedAssignment.isPublished,
      codingChallenges: assignmentChallenges.map(c => ({
        id: c.id ?? 0,
        originalChallengeId: c.originalChallengeId ?? 0,
        originalTitle: c.originalTitle,
        title: c.title,
        description: c.description,
        startCode: c.starterCode,
        language: c.language,
        difficulty: c.difficulty,
        tagName: c.tagName ?? undefined,
      }))
    }  
  }

  /* ========= RELATION ACTIONS ========= */   
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
  
  /* ========= DELETE ========= */   
  async delete(
    id: number,
    classroomId: number, 
    userId: number
  ): Promise<void> {
    await this.ensureTeacherOrOwner(classroomId, userId);
    await this.repo.deleteById(id);
  }

  /* ========= HELPERS ========= */   
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
