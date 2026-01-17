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
    const classCode = this.generateClassCode();
    const classroom = Classroom.create({
      classCode,
      name: dto.name,
      description: dto.description,
    });

    return this.repo.create(classroom, userId);
  }

  async findOne(id: number): Promise<Classroom> {
    const classroom = await this.repo.findById(id);
    if (!classroom) throw new NotFoundException('Classroom not found');
    return classroom;
  }

  async findByClassCode(code: string): Promise<Classroom> {
    const classroom = await this.repo.findByClassCode(code);
    if (!classroom) throw new NotFoundException('Classroom not found');
    return classroom;
  }

  async findAll(userId: number) {
    return this.repo.findAllByUser(userId);
  }

  async update(id: number, dto: UpdateClassroomDto) {
    const classroom = await this.findOne(id);

    if (dto.name !== undefined) classroom.rename(dto.name);
    if (dto.description !== undefined)
      classroom.updateDescription(dto.description);

    return this.repo.update(classroom);
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.repo.deleteById(id);
  }

  private generateClassCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    // XXXX-XXXX FORMAT
    return `${this.chunk(chars, 4)}-${this.chunk(chars, 4)}`;
  }

  private chunk(chars: string, len: number) {
    return Array.from({ length: len })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join('');
  }
}