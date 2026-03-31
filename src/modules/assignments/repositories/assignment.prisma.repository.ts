import { Injectable } from '@nestjs/common';
import { AssignmentRepository } from './assignment.repository';
import { PrismaService } from 'prisma/prisma.service';
import { Assignment } from '../assignment.entity';
import { AssignmentChallengeWithTestCases, AssignmentWithChallenges, AssignmentWithSubmission } from '../assignment.types';
import { AssignmentChallenge } from '../assignment-challenge.entity';

@Injectable()
export class AssignmentPrismaRepository implements AssignmentRepository {
  constructor(private readonly prisma: PrismaService) { }
  
  // CREATE
  async create(assignment: Assignment): Promise<Assignment> {
    const result = await this.prisma.assignment.create({
      data: {
        classroom_id: assignment.classroomId,
        title: assignment.title,
        description: assignment.description,
        due_at: assignment.dueAt,
        is_published: assignment.isPublished,
      },
    });

    return Assignment.rehydrate({
      id: result.id,
      classroomId: result.classroom_id,
      title: result.title,
      description: result.description,
      dueAt: result.due_at,
      isPublished: result.is_published,
    });
  }

  // 2. READ (SINGLE)
	async findById(id: number): Promise<Assignment | null> {
    const result = await this.prisma.assignment.findUnique({ where: { id } });
    if (!result) return null;
    
    return Assignment.rehydrate({
      id: result.id,
      classroomId: result.classroom_id,
      title: result.title,
      description: result.description,
      dueAt: result.due_at,
      isPublished: result.is_published,
    });
  }

  async findAssignmentChallenge(
    assignmentChallengeId: number
  ): Promise<AssignmentChallenge | null> {
    const result = await this.prisma.assignmentChallenge.findFirst({
      where: {
        id: assignmentChallengeId
      }
    });

    return result ? AssignmentChallenge.rehydrate({
      id: result.id,
      assignmentId: result.assignment_id,
      originalChallengeId: result.original_challenge_id,
      originalTitle: result.original_title,
      title: result.title,
      description: result.description,
      starterCode: result.starter_code,
      language: result.language,
      difficulty: result.difficulty,
      tagName: result.tag_name,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    }): null;
  }

  async findAssignmentChallengeDetail(
    assignmentId: number,
    challengeId: number
  ): Promise<AssignmentChallengeWithTestCases | null> {
    const result = await this.prisma.assignmentChallenge.findUnique({
      where: {
        id: challengeId,
      },
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
    });

    return result;
  }

  // 3. READ (COLLECTIONS / RELATIONS)
  async findAssignmentChallenges(
    assignmentId: number
  ): Promise<AssignmentChallenge[]> {
    const result = await this.prisma.assignmentChallenge.findMany({
      where: {
        assignment_id: assignmentId
      }
    });

    return result.map((item) =>
      AssignmentChallenge.rehydrate({
        id: item.id,
        assignmentId: item.assignment_id,
        originalChallengeId: item.original_challenge_id,
        originalTitle: item.original_title,
        title: item.title,
        description: item.description,
        starterCode: item.starter_code,
        language: item.language,
        difficulty: item.difficulty,
        tagName: item.tag_name,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })
    );
  }

  async findOneWithChallenges(
    id: number
  ): Promise<AssignmentWithChallenges | null> {
    const result = await this.prisma.assignment.findUnique({
      where: {
        id: id,
      },
      include: {
        assignmentChallenges: true
      }
    });

    return result || null;
  }

  async findAllByClassroom(
    classroomId: number,
    userId: number
  ): Promise<AssignmentWithSubmission[]> {
    const results = await this.prisma.assignment.findMany({
      where: { classroom_id: classroomId },
      include: {
        submissions: {
          where: {
            id: userId
          },
          select: {
            total_score: true,
            status: true,
            submitted_at: true
          }
        }
      }
    });
		
    return results;
  }

  // 4. UPDATE
  async update(assignment: Assignment): Promise<Assignment> {
    const result = await this.prisma.assignment.update({
      where: { id: assignment.id! },
      data: {
        title: assignment.title,
        description: assignment.description,
        due_at: assignment.dueAt,
        is_published: assignment.isPublished,
      }
    });

    return Assignment.rehydrate({
      id: result.id,
      classroomId: result.classroom_id,
      title: result.title,
      description: result.description,
      dueAt: result.due_at,
      isPublished: result.is_published,
    });
  }
  
  async updateAssignmentChallenge(
    assignmentChallengeId: number,
    aChallenge: AssignmentChallenge
  ): Promise<AssignmentChallenge> {
    const updated = await this.prisma.assignmentChallenge.update({
      where: { id: assignmentChallengeId },
      data: {
        title: aChallenge.title,
        description: aChallenge.description,
        starter_code: aChallenge.starterCode,
        language: aChallenge.language,
        difficulty: aChallenge.difficulty,
      },
    });

    return AssignmentChallenge.rehydrate({
      id: updated.id,
      assignmentId: updated.assignment_id,
      originalChallengeId: updated.original_challenge_id,
      originalTitle: updated.original_title,
      title: updated.title,
      description: updated.description,
      starterCode: updated.starter_code,
      language: updated.language,
      difficulty: updated.difficulty,
      tagName: updated.tag_name,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    })
  }

  // 5. DELETE
  async deleteById(id: number): Promise<void> {
    await this.prisma.assignment.delete({ where: { id } });
  }
  
  async removeChallenge(
    assignmentId: number,
    challengeId: number
  ): Promise<boolean> {
    const result = await this.prisma.assignmentChallenge.deleteMany({
      where: { assignment_id: assignmentId, original_challenge_id: challengeId },
    });

    return result.count > 0;
  }

  // 6. RELATIONSHIP / ULTILITY METHODS
  async attachChallenges(
    assignmentId: number,
    challengeIds: number[]
  ): Promise<void> {
    for (const challengeId of challengeIds) {
      const challenge = await this.prisma.codingChallenge.findUnique({
        where: { id: challengeId },
        include: {
          tag: true,
          test_cases: true
        },
      });

      if (!challenge) continue;

      await this.prisma.assignmentChallenge.create({
        data: {
          assignment_id: assignmentId,
          original_challenge_id: challenge.id,
          original_title: challenge.title,
          title: challenge.title,
          description: challenge.description,
          starter_code: challenge.starter_code,
          language: challenge.language,
          difficulty: challenge.difficulty,
          tag_name: challenge.tag?.name,
          test_cases: {
            create: challenge.test_cases.map(tc => ({
              input: tc.input,
              expected_output: tc.expected_output,
              score: tc.score,
              is_hidden: tc.is_hidden,
            })),
          },
        },
      });
    }
  }

  async challengeExistsInAssignment(
    assignmentId: number,
    challengeId: number
  ): Promise<boolean> {
    const count  = await this.prisma.assignmentChallenge.count({
      where: {
        assignment_id: assignmentId,
        original_challenge_id: challengeId
      },
    });

    return count > 0;
  }
}
