import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UpdateSubmissionDto } from "../presentation/dto/update-submission.dto";
import { ClassroomMembershipService } from "../../classrooms/application/classroom-membership.service";
import { Role } from "../../classrooms/domain/role.enum";
import { Submission } from "../domain/submission.entity";
import { SubmissionStatus } from "../domain/submissionStatus.enum";
import type { SubmissionRepository } from "../infrastructure/submission.repository";
import { CodeSubmission } from "../domain/challengeSubmission.entity";
import { CodingChallengeService } from "../../coding-challenges/application/coding-chellenge.service";

@Injectable() 
export class SubmissionService {
  constructor(
    private readonly membershipService: ClassroomMembershipService,
    private readonly challengeService: CodingChallengeService,

    @Inject("SubmissionRepository")
    private readonly repo: SubmissionRepository
  ) { }
  
  async createDraft(
    classroomId: number,
    assignmentId: number,
    userId: number
  ) {
    this.membershipService.ensureRole(classroomId, userId, [Role.STUDENT]);

    const challenges = await this.challengeService.getAllChallengeByAssignment(assignmentId);
    const codeSubmissions = challenges.map(c =>
      new CodeSubmission(null, c.id!, c.starterCode)
    );

    const submission = Submission.create({
      userId: userId,
      assignmentId: assignmentId,
      status: SubmissionStatus.DRAFT,
      codeSubmissions,
    });

    return await this.repo.create(submission);
  } 

  async updateDraft(
    classroomId: number,
    assignmentId: number,
    submissionId: number,
    userId: number,
    dto: UpdateSubmissionDto
  ) { 
    await this.membershipService.ensureRole(classroomId, userId, [Role.STUDENT]);

    const submission = await this.repo.findById(submissionId);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.status !== SubmissionStatus.DRAFT) {
      throw new BadRequestException('Only draft submission can be updated');
    }

    submission.codeSubmissions = dto.codes.map(c => new CodeSubmission(
      c.id!,
      c.challengeId,
      c.code
    ));

    return await this.repo.update(submission);
  }

  async turnIn(
    classroomId: number,
    assignmentId: number,
    submissionId: number,
    userId: number
  ) { 
    this.membershipService.ensureRole(classroomId, userId, [Role.STUDENT]);

    const submission = await this.repo.findById(submissionId);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    submission.turnIn();

    return this.repo.update(submission);
  }

  // async getMySubmission(
  //   classroomId: number,
  //   assignmentId: number,
  //   userId: number
  // ) {
  //   return this.repo.findByStudentAndAssignment
  // }

  async getAssignmentSubmissions(
    classroomId: number,
    assignmentId: number,
    userId: number
  ) { 
    return await this.repo.findByAssignment(assignmentId);
  }

  async getSubmission(
    classroomId: number,
    assignmentId: number,
    submissionId: number,
    userId: number
  ) {
    const submission = await this.repo.findById(submissionId);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return submission;
  }

  // evaluate(classroomId, assignmentId, submissionId, dto)
}