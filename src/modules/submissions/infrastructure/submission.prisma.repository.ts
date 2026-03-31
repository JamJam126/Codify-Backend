import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { Submission } from "../domain/submission.entity";
import { SubmissionRepository } from "./submission.repository";
import { CodeSubmission } from "../domain/challengeSubmission.entity";
import { CodeSubmissionDetail, SubmissionByAssignment, SubmissionDetail } from "../submission.types";
import { SubmissionStatus } from "@prisma/client";

@Injectable()
export class SubmissionPrismaRepository implements SubmissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(submission: Submission): Promise<Submission> {
    const created = await this.prisma.submission.create({
      data: {
        user_id: submission.userId,
        assignment_id: submission.assignmentId,
        status: submission.status,
        total_score: submission.totalScore,
        submitted_at: submission.submittedAt,
        created_at: submission.createdAt,
        updated_at: submission.updatedAt,
        codeSubmissions: {
          create: submission.codeSubmissions.map(cs => ({
            code: cs.code,
            assignmentChallenge: {
              connect: { id: cs.challengeId }
            }            
          })),
        },
      },
      include: {
        codeSubmissions: true,
      },
    });

    return Submission.rehydrate({
      id: created.id,
      userId: created.user_id,
      assignmentId: created.assignment_id,
      status: created.status as SubmissionStatus,
      totalScore: created.total_score,
      submittedAt: created.submitted_at,
      createdAt: created.created_at,
      updatedAt: created.updated_at,
      codeSubmissions: created.codeSubmissions.map(cs => ({
        id: cs.id,
        challengeId: cs.assignment_challenge_id,
        code: cs.code,
      })),
    });
  }

  async findById(id: number): Promise<Submission | null> {
    const found = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        codeSubmissions: true,
      }
    });

    if (!found) return null;

    return Submission.rehydrate({
      id: found.id,
      userId: found.user_id,
      assignmentId: found.assignment_id,
      status: found.status as SubmissionStatus,
      totalScore: found.total_score,
      submittedAt: found.submitted_at,
      createdAt: found.created_at,
      updatedAt: found.updated_at,
      codeSubmissions: found.codeSubmissions.map(cS => {
        return CodeSubmission.rehydrate({
          id: cS.id,
          challengeId: cS.assignment_challenge_id,
          code: cS.code
        });
      }),
    });
  }

  async findSubmissionDetail(id: number): Promise<SubmissionDetail | null> {
    const result = await this.prisma.submission.findFirst({
      where: { id },
      include: {
        codeSubmissions: {
          include: {
            feedbackChallenge: true
          }
        },
        assignment: {
          select: {
            due_at: true
          }
        },
        feedback: true,
      }
    });

    return result;
  }

  async findCodeSubmissionDetail(id: number): Promise<CodeSubmissionDetail | null> {
    const result = await this.prisma.codeSubmission.findUnique({
      where: { id },
      include: {
        feedbackChallenge: true,
        assignmentChallenge: true,
      }
    })

    return result ?? null;
  }

  async findByAssignment(assignmentId: number): Promise<SubmissionByAssignment[]> {
    const submissions = await this.prisma.submission.findMany({
      where: { assignment_id: assignmentId },
      include: { 
        user: true,
        assignment: {
          select: {
            due_at: true
          }
        }
      }
    });

    return submissions
  }

  async update(submission: Submission): Promise<Submission> {
    const updated = await this.prisma.submission.update({
      where: { id: submission.id! },
      include: {
        codeSubmissions: true
      },
      data: {
        status: submission.status,
        submitted_at: submission.submittedAt,
        updated_at: new Date(),
        codeSubmissions: {
          update: submission.codeSubmissions
            .filter(cS => cS.id != null)
            .map(cS => ({
              where: { id: cS.id! },
              data: { code: cS.code }
            })),
        }
      },
    });

    return Submission.rehydrate({
      id: updated.id,
      userId: updated.user_id,
      assignmentId: updated.assignment_id,
      status: updated.status as SubmissionStatus,
      totalScore: updated.total_score,
      submittedAt: updated.submitted_at,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
      codeSubmissions: updated.codeSubmissions.map(cS => {
        return CodeSubmission.rehydrate({
          id: cS.id,
          challengeId: cS.assignment_challenge_id,
          code: cS.code
        });
      }),
    });
  }
}