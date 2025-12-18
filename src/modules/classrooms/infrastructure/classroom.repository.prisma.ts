import { Injectable } from '@nestjs/common';
import { ClassroomRepository } from '../domain/classroom.repository';
import { Classroom } from '../domain/classroom.entity';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ClassroomRepositoryPrisma implements ClassroomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(classroom: Classroom): Promise<Classroom> {
    const created = await this.prisma.classroom.upsert({
      where: { id: classroom.id ?? 0 },
      update: {
        class_code: classroom.classCode,
        name: classroom.name,
        description: classroom.description,
        teacher_id: classroom.teacherId,
        updated_at: classroom.updatedAt,
      },
      create: {
        class_code: classroom.classCode,
        name: classroom.name,
        description: classroom.description,
        teacher_id: classroom.teacherId,
      },
    });

    return this.toDomain(created);
  }

  async findAll(): Promise<Classroom[]> {
    const classrooms = await this.prisma.classroom.findMany();
    return classrooms.map(this.toDomain);
  }

  async findById(id: number): Promise<Classroom | null> {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id },
    });
    return classroom ? this.toDomain(classroom) : null;
  }

  async findByClassCode(classCode: string): Promise<Classroom | null> {
    if (!classCode) {
      throw new Error('classCode is required');
    }
    const classroom = await this.prisma.classroom.findUnique({
      where: { class_code: classCode }
    });
    return classroom ? this.toDomain(classroom) : null;
  }

  async findAllByTeacherId(teacherId: number): Promise<Classroom[]> {
    const classrooms = await this.prisma.classroom.findMany({
      where: { teacher_id: teacherId }
    });
    return classrooms.map(this.toDomain);
  }

  async deleteById(id: number): Promise<void> {
    await this.prisma.classroom.delete({ where: { id } });
  }
  
  private toDomain(raw: any): Classroom {
    return new Classroom(
      raw.id,
      raw.class_code,
      raw.name,
      raw.teacher_id,
      raw.description,
      raw.created_at,
      raw.updated_at,
    );
  }
}
