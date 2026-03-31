import { Prisma } from "@prisma/client";

export type AssignmentWithSubmission = Prisma.AssignmentGetPayload<{
  include: {
    submissions: {
      select: {
        status: true,
        total_score: true,
        submitted_at: true,
      }
    }
  }
}>

export type AssignmentWithChallenges = Prisma.AssignmentGetPayload<{
  include: {
    assignmentChallenges: true
  }
}>

export type AssignmentChallengeWithTestCases = Prisma.AssignmentChallengeGetPayload<{
  include: {
    test_cases: {
      include: {
        assignmentChallenge: {
          select: {
            original_challenge_id: true
          }
        }
      }
    },
  }
}>