import { Injectable } from '@nestjs/common';
import { ClassroomRepository } from '../domain/classroom.repository';
import { Classroom } from '../domain/classroom.entity';
import { PrismaService } from 'prisma/prisma.service';

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

    return this.toDomain(result);
  }

  async findAllByUser(userId: number): Promise<Classroom[]> {
    const results = await this.prisma.classroom.findMany({
      where: { users: { some: { user_id: userId } } },
    });

    return results.map(this.toDomain);
  }

  async findById(id: number): Promise<Classroom | null> {
    const result = await this.prisma.classroom.findUnique({ where: { id } });
    return result ? this.toDomain(result) : null;
  }

  async findByClassCode(classCode: string): Promise<Classroom | null> {
    if (!classCode) return null;

    const result = await this.prisma.classroom.findUnique({ where: { class_code: classCode } });
    return result ? this.toDomain(result) : null;
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

    return this.toDomain(result);
  }

  async deleteById(id: number): Promise<void> {
    await this.prisma.classroom.delete({ where: { id } });
  }

  private toDomain(raw: any): Classroom {
    return Classroom.rehydrate({
      id: raw.id,
      classCode: raw.class_code,
      name: raw.name,
      description: raw.description ?? undefined,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  }
}
