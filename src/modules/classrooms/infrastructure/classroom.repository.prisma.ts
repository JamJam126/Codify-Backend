import { Injectable } from '@nestjs/common';
import { ClassroomRepository } from '../domain/classroom.repository';
import { Classroom } from '../domain/classroom.entity';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ClassroomRepositoryPrisma implements ClassroomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(classroom: Classroom): Promise<Classroom> {
    const created = await this.prisma.classroom.create({
      data: {
        class_code: classroom.classCode,
        name: classroom.name,
        description: classroom.description ?? null,
        teacher_id: classroom.teacherId,
      }
    });

    return new Classroom (
      created.id,
      created.class_code,
      created.name,
      created.teacher_id,
      created.description ?? undefined,
      created.created_at,
      created.updated_at,
    );
  }
}
