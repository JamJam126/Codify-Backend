import { Injectable } from '@nestjs/common';
import { AssignmentRepository } from './assignment.repository';
import { PrismaService } from 'prisma/prisma.service';
import { Assignment } from '../assignment.entity';

@Injectable()
export class PrismaAssignmentRepository implements AssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(assignment: Assignment): Promise<Assignment> {
    const result = await this.prisma.assignment.create({
      data: {
        section_id: assignment.sectionId,
        title: assignment.title,
        description: assignment.description,
        due_at: assignment.dueAt,
        position: assignment.position,
        is_published: assignment.isPublished,
      },
    });

    return Assignment.rehydrate({
      id: result.id,
      sectionId: result.section_id,
      title: result.title,
      description: result.description,
      dueAt: result.due_at,
      position: result.position,
      isPublished: result.is_published,
    });
  }
}
