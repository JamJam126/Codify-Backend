import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ClassroomRepository } from '../domain/classroom.repository';
import { Classroom } from '../domain/classroom.entity';
import { CreateClassroomDto } from '../presentation/dto/create-classroom.dto';
import { UpdateClassroomDto } from '../presentation/dto/update-classroom.dto';
import { Role } from '../domain/role.enum';
import { ClassroomMembershipService } from './classroom-membership.service';

@Injectable()
export class ClassroomService {
  constructor(
    @Inject('ClassroomRepository')
    private readonly repo: ClassroomRepository,

    private readonly membershipService: ClassroomMembershipService
  ) {}

  async create(dto: CreateClassroomDto, userId: number): Promise<Classroom> {
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

  async findOne(id: number, userId: number): Promise<Classroom> {
    const classroom = await this.repo.findById(id);
    if (!classroom) throw new NotFoundException('Classroom not found');

    await this.membershipService.assertIsMember(id, userId);

    return classroom;
  }

  async findByClassCode(code: string, userId: number): Promise<Classroom> {
    const classroom = await this.repo.findByClassCode(code);
    if (!classroom) throw new NotFoundException('Classroom not found');
    
    return classroom;
  }

  async findAll(userId: number) {
    return this.repo.findAllByUser(userId);
  }

  async update(id: number, dto: UpdateClassroomDto, userId: number) {
    await this.membershipService.ensureRole(id, userId, [Role.OWNER, Role.TEACHER])
    const classroom = await this.findOne(id, userId);

    if (dto.name !== undefined) classroom.rename(dto.name);
    if (dto.description !== undefined)
      classroom.updateDescription(dto.description);

    return this.repo.update(classroom);
  }

  async delete(classroomId: number, userId: number) {
    await this.membershipService.ensureRole(classroomId, userId, [Role.OWNER])
    await this.findOne(classroomId, userId);
    
    await this.repo.deleteById(classroomId);
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