import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UpdateSubmissionDto } from "../presentation/dto/update-submission.dto";
import { ClassroomMembershipService } from "../../classrooms/application/classroom-membership.service";
import { Role } from "../../classrooms/domain/role.enum";
import { Submission } from "../domain/submission.entity";
import type { SubmissionRepository } from "../infrastructure/submission.repository";
import { CodeSubmission } from "../domain/challengeSubmission.entity";
import { CodingChallengeService } from "../../coding-challenges/application/coding-chellenge.service";
import { deriveSubmissionStatus } from "src/common/utils/derive-submission-status.util";
import { SubmissionStatus } from "@prisma/client";
import { SubmissionDto } from "../dto/response/submission.dto";
import { CodeRunnerService } from "src/modules/code-runner/code-runner.service";
import { SubmissionItemDto } from "../dto/response/submission-item.dto";

@Injectable() 
export class SubmissionService {
  constructor(
    private readonly membershipService: ClassroomMembershipService,
    private readonly challengeService: CodingChallengeService,
    private readonly runnerSerivice: CodeRunnerService,

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
    console.log(dto)
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

    // submission.turnIn();

    const updated = await this.repo.update(submission);

    this.runnerSerivice.runSubmittedCode(submissionId);

    return updated;
  }

  async getAssignmentSubmissions(
    classroomId: number,
    assignmentId: number,
    userId: number
  ): Promise<SubmissionItemDto[]> { 
    const results = await this.repo.findByAssignment(assignmentId);

    return results.map(r => ({
      id: r.id,
      userId: r.user_id,
      username: r.user.name,
      assignmentId: r.assignment_id,
      status: deriveSubmissionStatus(r.submitted_at, r.assignment.due_at),
      totalScore: r.total_score,
      submittedAt: r.submitted_at,
    }));
  }

  async getSubmission(
    classroomId: number,
    assignmentId: number,
    submissionId: number,
    userId: number
  ): Promise<SubmissionDto> {
    const submission = await this.repo.findSubmissionDetail(submissionId);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return {
      id: submission.id!,
      userId: submission.user_id,
      assignmentId: submission.assignment_id,
      status: deriveSubmissionStatus(
        submission.submitted_at || null, 
        submission.assignment.due_at,
      ),
      totalScore: submission.total_score,
      submittedAt: submission.submitted_at,
      feedback: submission.feedback?.text,
      codeSubmissions: submission.codeSubmissions.map(c => ({
        id: c.id!,
        challengeId: c.assignment_challenge_id,
        code: c.code,
        feedback: c.feedbackChallenge?.text
      }))
    };
  }

  async getCodeSubmission(
    classroomId: number,
    assignmentId: number,
    submissionId: number,
    codeSubmissionId: number,
    userId: number
  ) {
    const codeSubmission = await this.repo.findCodeSubmissionDetail(codeSubmissionId);
    if (!codeSubmission) {
      throw new NotFoundException('Code submission not found');
    }

    return {
      id: codeSubmission.id,
      code: codeSubmission.code,
      assignmentId: codeSubmission.assignmentChallenge.assignment_id,
      originalId: codeSubmission.assignmentChallenge.original_challenge_id,
      originalTitle: codeSubmission.assignmentChallenge.original_title,
      title: codeSubmission.assignmentChallenge.title,
      description: codeSubmission.assignmentChallenge.description,
      language: codeSubmission.assignmentChallenge.language,
      difficulty: codeSubmission.assignmentChallenge.difficulty,
      tagName: codeSubmission.assignmentChallenge.tag_name
    };
  }

  // evaluate(classroomId, assignmentId, submissionId, dto)
}