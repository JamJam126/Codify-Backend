import { Injectable } from '@nestjs/common';
import { ClassroomRepository } from '../domain/classroom.repository';
import { Classroom } from '../domain/classroom.entity';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ClassroomRepositoryPrisma implements ClassroomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(classroom: Classroom, creatorId: number): Promise<Classroom> {
    return await this.prisma.$transaction(async (tx) => {
      const result = await this.prisma.classroom.upsert({
        where: {
          id: classroom.id ?? -1,
        },
        create: {
          class_code: classroom.classCode,
          name: classroom.name,
          description: classroom.description ?? null,
        },
        update: {
          class_code: classroom.classCode,
          name: classroom.name,
          description: classroom.description ?? null,
          updated_at: classroom.updatedAt,
        },  
      });

      if (classroom.id === 0 && creatorId) {
        await tx.classroomUser.create({
          data: {
            classroom_id: result.id,
            user_id: creatorId,
            role: 'ADMIN', 
          },
        });
      }
      return this.toDomain(result);
    });
  }

  
  private toDomain(raw: any): Classroom {
    return new Classroom(
      raw.id,
      raw.class_code,
      raw.name,
      raw.description,
      raw.created_at,
      raw.updated_at,
    );
  }
}
