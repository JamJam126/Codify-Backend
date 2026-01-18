import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ClassroomRepository } from '../domain/classroom.repository';
import { Classroom } from '../domain/classroom.entity';

@Injectable()
export class ClassroomRepositoryPrisma implements ClassroomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(classroom: Classroom, creatorId: number): Promise<Classroom> {
    const result = await this.prisma.$transaction(async (tx) => {
      const created = await tx.classroom.create({
        data: {
          class_code: classroom.classCode,
          name: classroom.name,
          description: classroom.description ?? null,
        },
      });

      await tx.classroomUser.create({
        data: {
          classroom_id: created.id,
          user_id: creatorId,
          role: 'ADMIN',
        },
      });

      return created;
    });

    return Classroom.rehydrate({
      id: result.id,
      classCode: result.class_code,
      name: result.name,
      description: result.description ?? undefined,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    });
  }

  async findAllByUser(userId: number): Promise<Classroom[]> {
    const results = await this.prisma.classroom.findMany({
      where: { users: { some: { user_id: userId } } },
    });

    return results.map((r) =>
      Classroom.rehydrate({
        id: r.id,
        classCode: r.class_code,
        name: r.name,
        description: r.description ?? undefined,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })
    );
  }

  async findById(id: number): Promise<Classroom | null> {
    const result = await this.prisma.classroom.findUnique({ where: { id } });
    if (!result) return null;

    return Classroom.rehydrate({
      id: result.id,
      classCode: result.class_code,
      name: result.name,
      description: result.description ?? undefined,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    });
  }

  async findByClassCode(classCode: string): Promise<Classroom | null> {
    if (!classCode) return null;

    const result = await this.prisma.classroom.findUnique({ where: { class_code: classCode } });
    if (!result) return null;

    return Classroom.rehydrate({
      id: result.id,
      classCode: result.class_code,
      name: result.name,
      description: result.description ?? undefined,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    });
  }

  async update(classroom: Classroom): Promise<Classroom> {
    const result = await this.prisma.classroom.update({
      where: { id: classroom.id! },
      data: {
        name: classroom.name,
        description: classroom.description ?? null,
        updated_at: classroom.updatedAt,
      },
    });

    return Classroom.rehydrate({
      id: result.id,
      classCode: result.class_code,
      name: result.name,
      description: result.description ?? undefined,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    });
  }

  async deleteById(id: number): Promise<void> {
    await this.prisma.classroom.delete({ where: { id } });
  }
}
