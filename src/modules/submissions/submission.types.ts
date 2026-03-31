import { Prisma } from "@prisma/client";

export type SubmissionByAssignment = Prisma.SubmissionGetPayload<{
  include: { 
    user: true,
    assignment: {
      select: {
        due_at: true
      }
    }
  }
}>

export type SubmissionDetail = Prisma.SubmissionGetPayload<{
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
}>

export type CodeSubmissionDetail = Prisma.CodeSubmissionGetPayload<{
  include: {
    feedbackChallenge: true,
    assignmentChallenge: true,
  }
}>