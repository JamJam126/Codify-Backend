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

  async update(id: number, dto: UpdateClassroomDto, userId: number) {
    const classroom = await this.findOne(id);

    const isAdmin = await this.memberRepo.isAdmin(id, userId);
    if (!isAdmin)
      throw new ForbiddenException('Only owner or admin can update');

    if (dto.name !== undefined) classroom.rename(dto.name);
    if (dto.description !== undefined)
      classroom.updateDescription(dto.description);

    return this.repo.update(classroom);
  }

  async delete(userId: number, classroomId: number) {
    await this.findOne(classroomId);

    const isOwner = await this.memberRepo.isOwner(classroomId, userId);
    if (!isOwner)
      throw new ForbiddenException('Only owner can delete this classroom');
    
    await this.repo.deleteById(classroomId);
  }

  async addMember(
    classroomId: number,
    requesterId: number,
    dto: AddMemberDto
  ): Promise<ClassroomMember> {
    await this.findOne(classroomId);

    const isAdmin = await this.memberRepo.isAdmin(classroomId, requesterId);
    if (!isAdmin) throw new ForbiddenException('Only owner or teacher can add members');

    const existing = await this.memberRepo.findMember(classroomId, dto.userId);
    if (existing) throw new ConflictException('User already in classroom');

    const addedMember = await this.memberRepo.addMember(
      classroomId,
      new ClassroomMember(dto.userId, dto.role)
    );

    return addedMember;
  }

  async removeMember(
    classroomId: number,
    requesterId: number,
    userId: number
  ) {
    await this.findOne(classroomId);

    const isAdmin = await this.memberRepo.isAdmin(classroomId, requesterId);
    if (!isAdmin) throw new ForbiddenException('Only owner or teacher can remove members');

    if (requesterId === userId) {
      throw new ConflictException('Only owner or teacher cannot remove themselves');
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
  ): Promise<ClassroomMember> {
    await this.findOne(classroomId);

    const isOwner = await this.memberRepo.isOwner(classroomId, requesterId);
    if (!isOwner) throw new ForbiddenException('Only owner can change roles');

    const member = await this.memberRepo.findMember(classroomId, userId);
    if (!member) throw new NotFoundException('Member not found');

    if (role === Role.OWNER) throw new ForbiddenException('Cannot change role to Owner');

    if (member.role === role) {
      throw new ConflictException('User already has this role');
    }

    const updated = await this.memberRepo.updateRole(classroomId, userId, role);
    return updated;
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