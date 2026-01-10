import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ClassroomRepository } from '../domain/classroom.repository';
import { Classroom } from '../domain/classroom.entity';
import { CreateClassroomDto } from '../presentation/dto/create-classroom.dto';
import { UpdateClassroomDto } from '../presentation/dto/update-classroom.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class ClassroomService {
  constructor(
    @Inject('ClassroomRepository')
    private readonly repo: ClassroomRepository,
  ) {}

  async create(dto: CreateClassroomDto, userId: number): Promise<Classroom> {
    const maxretries = 5;
    let tries = 0;

    while (tries < maxretries) {
      const classCode = this.generateClasscode();
      tries++;

      try {
        const classroom = await this.repo.create(
          new Classroom(0, classCode, dto.name, dto.description),
          userId,
        );

        return classroom;
      } catch (err: any) {
        if (err.code === 'P2002' && err.meta?.target?.include('class_code')) {
          continue;
        }

        throw err;
      }
    }

    throw new Error('Failed to generate unique class code. Please try again');
  }

  async findAll(user: { id: number }): Promise<Classroom[]> {
    return this.repo.findAll(user);
  }

  async findOne(id: number): Promise<Classroom | null> {
    const classroom = await this.repo.findById(id);
    if (!classroom) throw new NotFoundException('Classroom Not Found!');

    return classroom;
  }

  async findByClassCode(classCode: string): Promise<Classroom | null> {
    const classroom = await this.repo.findByClassCode(classCode);
    if (!classCode) throw new NotFoundException('Classroom Not Found!');

    return classroom;
  }

  async update(
    id: number,
    dto: UpdateClassroomDto,
    userId: number,
  ): Promise<Classroom> {
    const record = await this.repo.findById(id);

    if (!record) throw new NotFoundException('Classroom not found.');

    const classroom = new Classroom(
      record.id,
      record.classCode,
      record.name,
      record.description,
      record.createdAt,
      record.updatedAt,
    );

    if (dto.name !== undefined) {
      classroom.rename(dto.name);
    }

    if (dto.description !== undefined) {
      classroom.updateDescription(dto.description);
    }

    await this.repo.update(classroom);

    return classroom;
  }

  async delete(id: number, userId: number): Promise<void> {
    const record = await this.repo.findById(id);

    if (!record) throw new NotFoundException('Classroom not found!');

    await this.repo.deleteById(id);
  }

  private generateClasscode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    function randomChunk(length: number): string {
      let result = '';
      const bytes = randomBytes(length);
      for (let i = 0; i < length; i++) {
        result += chars[bytes[i] % chars.length];
      }

      return result;
    }

    // XXXX-XXXX FORMAT
    return `${randomChunk(4)}-${randomChunk(4)}`;
  }
}
