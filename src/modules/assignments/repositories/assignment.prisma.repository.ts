import { Injectable } from '@nestjs/common';
import { AssignmentRepository } from './assignment.repository';
import { PrismaService } from 'prisma/prisma.service';
import { Assignment } from '../assignment.entity';

@Injectable()
export class AssignmentPrismaRepository implements AssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(assignment: Assignment): Promise<Assignment> {
    const result = await this.prisma.assignment.create({
      data: {
        classroom_id: assignment.classroomId,
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
      classroomId: result.classroom_id,
      sectionId: result.section_id,
      title: result.title,
      description: result.description,
      dueAt: result.due_at,
      position: result.position,
      isPublished: result.is_published,
    });
  }

	async findById(id: number): Promise<Assignment | null> {
    const result = await this.prisma.assignment.findUnique({ where: { id } });
    if (!result) return null;
    
    return Assignment.rehydrate({
      id: result.id,
      classroomId: result.classroom_id,
      sectionId: result.section_id,
      title: result.title,
      description: result.description,
      dueAt: result.due_at,
      position: result.position,
      isPublished: result.is_published,
    });
  }

  async findAllBySection(sectionId: number): Promise<Assignment[]> {
    throw new Error('Method not implemented.');
    // const results = await this.prisma.assignment.findMany({
    //   where: { section_id: sectionId },
    //   orderBy: { position: 'asc' },
    // });
		
    // return results.map(result =>
    //   Assignment.rehydrate({
    //     id: result.id,
    //     classroomId: result.classroom_id,
    //     sectionId: result.section_id,
    //     title: result.title,
    //     description: result.description,
    //     dueAt: result.due_at,
    //     position: result.position,
    //     isPublished: result.is_published,
    //   }),
    // );
  }

  async findAllByClassroom(classroomId: number): Promise<Assignment[]> {
    const results = await this.prisma.assignment.findMany({
      where: { classroom_id: classroomId },
      orderBy: { position: 'asc' },
    });
		
    return results.map(result =>
      Assignment.rehydrate({
        id: result.id,
        classroomId: result.classroom_id,
        sectionId: result.section_id,
        title: result.title,
        description: result.description,
        dueAt: result.due_at,
        position: result.position,
        isPublished: result.is_published,
      }),
    );
  }

  async update(assignment: Assignment): Promise<Assignment> {
    const result = await this.prisma.assignment.update({
      where: { id: assignment.id! },
      data: {
        title: assignment.title,
        description: assignment.description,
        due_at: assignment.dueAt,
        position: assignment.position,
        is_published: assignment.isPublished,
      }
    });

    return Assignment.rehydrate({
      id: result.id,
      classroomId: result.classroom_id,
      sectionId: result.section_id,
      title: result.title,
      description: result.description,
      dueAt: result.due_at,
      position: result.position,
      isPublished: result.is_published,
    });
  }
  
  async deleteById(id: number): Promise<void> {
    await this.prisma.assignment.delete({ where: { id } });
  }
}
