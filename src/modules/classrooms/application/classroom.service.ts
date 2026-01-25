import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ClassroomRepository } from '../domain/classroom.repository';
import type { ClassroomMemberRepository } from '../domain/classroom-member.repository';
import { Classroom } from '../domain/classroom.entity';
import { CreateClassroomDto } from '../presentation/dto/create-classroom.dto';
import { UpdateClassroomDto } from '../presentation/dto/update-classroom.dto';
import { randomBytes } from 'crypto';
import { AddMemberDto } from '../presentation/dto/add-member.dto';
import { ClassroomMember } from '../domain/classroom-member.entity';
import { Role } from '../domain/role.enum';

@Injectable()
export class ClassroomService {
  constructor(
    @Inject('ClassroomRepository')
    private readonly repo: ClassroomRepository,

    @Inject('ClassroomMemberRepository')
    private readonly memberRepo: ClassroomMemberRepository
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

  async addMember(
    classroomId: number,
    requesterId: number,
    dto: AddMemberDto
  ) {
    await this.findOne(classroomId);

    const isAdmin = await this.memberRepo.isAdmin(classroomId, requesterId);
    if (!isAdmin) throw new ForbiddenException('Only admin can add members');

    const existing = await this.memberRepo.findMember(classroomId, dto.userId);
    if (existing) throw new ConflictException('User already in classroom');

    await this.memberRepo.addMember(
      classroomId,
      new ClassroomMember(dto.userId, dto.role)
    );
  }

  async removeMember(
    classroomId: number,
    requesterId: number,
    userId: number
  ) {
    await this.findOne(classroomId);

    const isAdmin = await this.memberRepo.isAdmin(classroomId, requesterId);
    if (!isAdmin) throw new ForbiddenException('Only admin can remove members');

    if (requesterId === userId) {
      throw new ConflictException('Admin cannot remove themselves');
    }

    const member = await this.memberRepo.findMember(classroomId, userId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    await this.memberRepo.removeMember(classroomId, userId);
  }

  async changeMemberRole(
    classroomId: number,
    requesterId: number,
    userId: number,
    role: Role
  ) {
    await this.findOne(classroomId);

    const isAdmin = await this.memberRepo.isAdmin(classroomId, requesterId);
    if (!isAdmin) throw new ForbiddenException('Only admin can change roles');

    const member = await this.memberRepo.findMember(classroomId, userId);
    if (!member) throw new NotFoundException('Member not found');

    if (member.role === role) {
      throw new ConflictException('User already has this role');
    }

    await this.memberRepo.updateRole(classroomId, userId, role);
  }

  async listMembers(classroomId: number): Promise<ClassroomMember[]> {
    await this.findOne(classroomId);
    return this.memberRepo.findMembers(classroomId);
  }

  async getMember(classroomId: number, userId: number) {
    await this.findOne(classroomId);

    const member = await this.memberRepo.findMember(classroomId, userId);
    if (!member) throw new NotFoundException('Member not found');

    return member;
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