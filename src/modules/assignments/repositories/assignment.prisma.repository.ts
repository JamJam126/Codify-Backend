import { Injectable } from '@nestjs/common';
import { AssignmentRepository } from './assignment.repository';
import { PrismaService } from 'prisma/prisma.service';
import { Assignment } from '../assignment.entity';
import { UpdateAssignmentChallengeDto } from '../dto/update-assignment-challenge.dto';

@Injectable()
export class AssignmentPrismaRepository implements AssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

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

  async attachChallenges(assignmentId: number, challengeIds: number[]): Promise<void> {
    for (const challengeId of challengeIds) {
      const challenge = await this.prisma.codingChallenge.findUnique({
        where: { id: challengeId },
        include: { test_cases: true },
      });

      if (!challenge) continue;

      await this.prisma.assignmentChallenge.create({
        data: {
          assignment_id: assignmentId,
          original_challenge_id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          starter_code: challenge.starter_code,
          language: challenge.language,
          difficulty:challenge.difficulty,
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

  async updateAssignmentChallenge(
    assignmentChallengeId: number,
    dto: UpdateAssignmentChallengeDto,
  ) {
    return this.prisma.assignmentChallenge.update({
      where: { id: assignmentChallengeId },
      data: {
        title: dto.title,
        description: dto.description,
        starter_code: dto.starterCode,
        language: dto.language,
        difficulty:dto.difficulty,
      },
    });
  }
    
  async removeChallenge(assignmentId: number, challengeId: number): Promise<boolean> {
    const result = await this.prisma.assignmentChallenge.deleteMany({
      where: { assignment_id: assignmentId, original_challenge_id: challengeId },
    });

    return result.count > 0;
  }

  async challengeExistsInAssignment(assignmentId: number, challengeId: number): Promise<Boolean> {
    const count  = await this.prisma.assignmentChallenge.count({
      where: {
        assignment_id: assignmentId,
        original_challenge_id: challengeId
      },
    });

    return count > 0;
  }

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

  async findAllByClassroom(classroomId: number,userId:number): Promise<Assignment[]> {
    const results = await this.prisma.assignment.findMany({
      where: { classroom_id: classroomId },
    });

    const role = await this.prisma.classroomUser.findFirst({
      where: {
          user_id: userId ,
          classroom_id: classroomId,
      },
      select: {
        role:true
      }
    });

    if (role?.role === "STUDENT") {
      const newResult = results.filter((result, index) => result.is_published == true);
      return newResult.map(result =>
        Assignment.rehydrate({
          id: result.id,
          classroomId: result.classroom_id,
          title: result.title,
          description: result.description,
          dueAt: result.due_at,
          isPublished: result.is_published,
        }),
      );
    }
		
    return results.map(result =>
      Assignment.rehydrate({
        id: result.id,
        classroomId: result.classroom_id,
        title: result.title,
        description: result.description,
        dueAt: result.due_at,
        isPublished: result.is_published,
      }),
    );
  }

  async findOneWithChallenges(id: number) {
    const result = await this.prisma.assignment.findUnique({
      where: {
        id: id,
      },
      include: {
        assignmentChallenges: true
      }
    });

  return result ? {
    id: result.id,
    classroomId: result.classroom_id,
    title: result.title,
    description: result.description,
    dueAt: result.due_at,
    isPublished: result.is_published,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
    assignmentChallenges: result.assignmentChallenges.map((challenge) => ({
      id: challenge.id,
      assignmentId: challenge.assignment_id,
      originalChallenge_id: challenge.original_challenge_id,
      title: challenge.title,
      description: challenge.description,
      starterCode: challenge.starter_code,
      language: challenge.language,
      difficulty: challenge.difficulty,
      createdAt: challenge.created_at,
      updatedAt: challenge.updated_at,
    })),
    } : null;
  }

  async findAssignmentChallengeDetail(assignmentId: number, challengeId: number) {
    const result = await this.prisma.assignmentChallenge.findUnique({
      where: {
        assignment_id_original_challenge_id: {
          assignment_id: assignmentId,
          original_challenge_id: challengeId
        }
      },
      include: {
        test_cases: true
      }
    });

    return result ? {
      id: result.id,
      assignmentId: result.assignment_id,
      originalChallengeId: result.original_challenge_id,
      title: result.title,
      description: result.description,
      startCode: result.starter_code,
      language: result.language,
      difficulty: result.difficulty,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      testCases: result.test_cases.map(tc => ({
        id: tc.id,
        createdAt: tc.created_at,
        updatedAt: tc.updated_at,
        input: tc.input,
        expectedOutput: tc.expected_output,
        score: tc.score,
        isHidden: tc.is_hidden,
        assignmentChallengeId: tc.assignment_challenge_id,
      }))
    } : null;
  }

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
  
  async deleteById(id: number): Promise<void> {
    await this.prisma.assignment.delete({ where: { id } });
  }
}
