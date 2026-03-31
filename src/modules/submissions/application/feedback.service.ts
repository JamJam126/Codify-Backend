import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { FeedbackRepository } from "../infrastructure/feedback.repository";
import { SubmissionService } from "./submission.service";
import { ClassroomMembershipService } from "src/modules/classrooms/application/classroom-membership.service";
import { Role } from "src/modules/classrooms/domain/role.enum";
import { Feedback } from "../domain/feedback.entity";
import { FeedbackDto } from "src/modules/assignments/dto/feedback.dto";
import { AssignmentChallengeFeedback } from "../domain/assignmentChallengeFeedback.entity";

@Injectable()
export class FeedbackService{
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly membershipService: ClassroomMembershipService,    

    @Inject('FeedbackRepository')
    private readonly repo: FeedbackRepository,
  ){}

  async getFeedback(
    classroomId:number,
    assignmentId:number,
    submissionId: number,
    userId: number
  ): Promise<FeedbackDto> {
    const submissionDetail = await this.submissionService.getSubmission(classroomId,assignmentId,submissionId,userId);

    if (!submissionDetail) {
      throw new NotFoundException(`Submission with id ${submissionId} not found`);
    }
  
    const feedback = await this.repo.findBySubmissionId(submissionId);

    if (!feedback) {
      throw new NotFoundException(`Feedback for submission ${submissionId} not found`);
    }

    const dto = new FeedbackDto();
    dto.text = feedback.feedback?.toString() ?? "";

    return dto;
  }

  async createFeedback(
    classroomId: number,
    assignmentId: number,
    submissionId: number,
    teacherId: number,
    dto: FeedbackDto,
  ) {
    await this.membershipService.ensureRole(
      classroomId,
      teacherId,
      [Role.OWNER, Role.TEACHER]
    );

    const feedback = Feedback.create({
      teacherId: teacherId,
      submissionId: submissionId,
      feedback: dto.text,
    });

    await this.submissionService.giveScore(dto.score!, submissionId);

    return await this.repo.create(feedback);
    
  }

  async updateFeedback(
    classroomId: number, 
    assignmentId: number, 
    submissionId: number,
    userId: number,
    dto: FeedbackDto
  ) {
    await this.membershipService.ensureRole(
      classroomId,
      userId,
      [Role.OWNER, Role.TEACHER]
    );

    const existing = await this.repo.findBySubmissionId(submissionId);
    if (!existing) {
      throw new NotFoundException(`Feedback for submission ${submissionId} not found`);
    }

    existing.update(dto.text);

    return await this.repo.update(existing, submissionId);
  }

  async deleteFeedback(
    classroomId: number,
    assignmentId: number,
    submissionId: number,
    userId: number
  ) {
    await this.membershipService.ensureRole(
      classroomId,
      userId,
      [Role.OWNER, Role.TEACHER]
    );

    const existing = await this.repo.findBySubmissionId(submissionId);
    if (!existing) {
      throw new NotFoundException(`Feedback for submission ${submissionId} not found`);
    }

    await this.repo.delete(existing.submissionId);

    return { message: 'Feedback deleted successfully' };
  }

  async createChallengeFeedback(
    classroomId: number,
    assignmentId: number,
    codeSubmissionId: number,
    teacherId: number,
    dto: FeedbackDto,
  ): Promise<AssignmentChallengeFeedback> {
    await this.membershipService.ensureRole(
      classroomId,
      teacherId,
      [Role.OWNER, Role.TEACHER],
    );

    const feedback = AssignmentChallengeFeedback.create({
      teacherId,
      codeSubmissionId: codeSubmissionId, 
      feedback: dto.text,
    });

    return this.repo.createChallengeFeedback(feedback, codeSubmissionId);
  }

  async updateChallengeFeedback(
    classroomId: number,
    assignmentId: number,
    codeSubmissionId: number,
    teacherId: number,
    dto: FeedbackDto,
  ): Promise<AssignmentChallengeFeedback> {
    await this.membershipService.ensureRole(
      classroomId,
      teacherId,
      [Role.OWNER, Role.TEACHER],
    );

    const existing = await this.repo.findByCodeSubmissionId(codeSubmissionId);
    if (!existing) {
      throw new NotFoundException('Challenge feedback not found');
    }

    existing.feedback = dto.text;
    return this.repo.updateChallengeFeedback(existing, codeSubmissionId);
  }

  async deleteChallengeFeedback(
    classroomId: number,
    assignmentId: number,
    codeSubmissionId: number,
    teacherId: number,
  ): Promise<void> {
    await this.membershipService.ensureRole(
      classroomId,
      teacherId,
      [Role.OWNER, Role.TEACHER],
    );

    const existing = await this.repo.findByCodeSubmissionId(codeSubmissionId);
    if (!existing) {
      throw new NotFoundException('Challenge feedback not found');
    }
    
    return this.repo.deleteChallengeFeedback(codeSubmissionId);
  }

}