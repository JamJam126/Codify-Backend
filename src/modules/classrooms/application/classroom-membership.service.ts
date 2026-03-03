import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ClassroomMemberRepository } from "../domain/classroom-member.repository";
import type { ClassroomRepository } from "../domain/classroom.repository";
import { AddMemberItemDto } from "../presentation/dto/add-member-item.dto";
import { ClassroomMember } from "../domain/classroom-member.entity";
import { Role } from "../domain/role.enum";

@Injectable()
export class ClassroomMembershipService {
  constructor(
    @Inject('ClassroomMemberRepository')
    private readonly memberRepo: ClassroomMemberRepository,

    @Inject('ClassroomRepository')
    private readonly classroomRepo: ClassroomRepository,
  ) { }
  
  async addMembers(
    classroomId: number,
    requesterId: number,
    dto: AddMemberItemDto[]
  ): Promise<ClassroomMember[]> {
    await this.ensureClassroomExists(classroomId);

    const isAdmin = await this.memberRepo.isAdmin(classroomId, requesterId);
    if (!isAdmin) {
      throw new ForbiddenException('Only owner or teacher can add members');
    }

    if (dto.some(m => m.role === Role.OWNER)) {
      throw new ForbiddenException('Role cannot be owner');
    }

    const userIds = dto.map(m => m.userId);

    const uniqueIds = new Set(userIds);
    if (uniqueIds.size !== userIds.length) {
      throw new ConflictException('Duplicates users in request');
    }

    const members = dto.map(
      m => new ClassroomMember(m.userId, m.role as Role)
    );
    
    return await this.memberRepo.addMemberBulks(classroomId, members);
  }

  async removeMember(
    classroomId: number,
    requesterId: number,
    userId: number
  ) {
    await this.ensureClassroomExists(classroomId);

    const isAdmin = await this.memberRepo.isAdmin(classroomId, requesterId);
    if (!isAdmin) {
      throw new ForbiddenException('Only owner or teacher can remove members');
    }

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
    await this.ensureClassroomExists(classroomId);

    const isOwner = await this.memberRepo.isOwner(classroomId, requesterId);
    if (!isOwner) {
      throw new ForbiddenException('Only owner can change roles');
    }

    const member = await this.memberRepo.findMember(classroomId, userId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (role === Role.OWNER) {
      throw new ForbiddenException('Cannot change role to Owner');
    }

    if (member.role === role) {
      throw new ConflictException('User already has this role');
    }

    const updated = await this.memberRepo.updateRole(classroomId, userId, role);
    return updated;
  }

  async listMembers(classroomId: number, userId: number): Promise<ClassroomMember[]> {
    await this.ensureClassroomExists(classroomId);
    return this.memberRepo.findMembers(classroomId);
  }

  async getMember(classroomId: number, memberId: number, userId: number) {
    await this.ensureClassroomExists(classroomId);

    const member = await this.memberRepo.findMember(classroomId, memberId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  async ensureMemberInClassroom(classroomId: number, userId: number) {
    await this.ensureClassroomExists(classroomId);
    await this.assertIsMember(classroomId, userId);
  }

  async assertIsMember(classroomId: number, userId: number): Promise<ClassroomMember> {
    await this.ensureClassroomExists(classroomId);
    const member = await this.memberRepo.findMember(classroomId, userId);
    if (!member) {
      throw new ForbiddenException('Not a member of this classroom');
    }

    return member
  }

  async ensureRole(classroomId: number, userId: number, allowedRoles: Role[]) {
    const member = await this.assertIsMember(classroomId, userId);

    if (!allowedRoles.includes(member.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return member;
  }

  private async ensureClassroomExists(classroomId: number) {
    const classroom = await this.classroomRepo.findById(classroomId);
    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }
  }
}