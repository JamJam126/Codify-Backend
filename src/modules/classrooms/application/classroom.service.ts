import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ClassroomRepository } from '../domain/classroom.repository';
import { Classroom } from '../domain/classroom.entity';
import { CreateClassroomDto } from '../presentation/dto/create-classroom.dto';
import { UpdateClassroomDto } from '../presentation/dto/update-classroom.dto';
import { Role } from '../domain/role.enum';
import { ClassroomMembershipService } from './classroom-membership.service';
import { ClassroomResponseDto } from '../presentation/dto/classroom-response.dto';

@Injectable()
export class ClassroomService {
  constructor(
    @Inject('ClassroomRepository')
    private readonly repo: ClassroomRepository,

    private readonly membershipService: ClassroomMembershipService
  ) {}

  async create(dto: CreateClassroomDto, userId: number): Promise<ClassroomResponseDto> {
    const classCode = this.generateClassCode();
    const classroom = Classroom.create({
      classCode,
      name: dto.name,
      description: dto.description,
    });

    try {
      return this.repo.create(classroom, userId);
    } catch (e) {
      if (e.code === '23505') {
        throw new ConflictException('Classroom Code already exist');
      }

      throw e;
    }
  }

  // REFACTORED
  async update(id: number, dto: UpdateClassroomDto, userId: number) {
    await this.membershipService.ensureRole(id, userId, [
      Role.OWNER,
      Role.TEACHER
    ]);

    const classroom = await this.repo.findById(id);

    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    if (dto.name !== undefined) classroom.rename(dto.name);
    if (dto.description !== undefined)
      classroom.updateDescription(dto.description);

    this.repo.update(classroom);

    return this.repo.findByIdWithDetails(id, userId);
  }

  // REFACTORED
  async delete(classroomId: number, userId: number) {    
    await this.membershipService.ensureRole(classroomId, userId, [
      Role.OWNER,
    ]);
    await this.repo.deleteById(classroomId);
  }

  // REFACTORED
  async findAll(userId: number) {
    return this.repo.findAllByUser(userId);
  }

  // REFACTORED
  async findOne(id: number, userId: number): Promise<ClassroomResponseDto> {
    const classroom = await this.repo.findByIdWithDetails(id, userId);
    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    return classroom;
  }

  async findByClassCode(code: string, userId: number): Promise<Classroom> {
    const classroom = await this.repo.findByClassCode(code);
    if (!classroom) throw new NotFoundException('Classroom not found');
    
    return classroom;
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