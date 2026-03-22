import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ClassroomMemberRepository } from "../domain/classroom-member.repository";
import type { ClassroomRepository } from "../domain/classroom.repository";
import { AddMemberItemDto } from "../presentation/dto/add-member-item.dto";
import { ClassroomMember } from "../domain/classroom-member.entity";
import { Role } from "../domain/role.enum";

@Injectable()
export class ClassroomMembershipService {
  private roleRank: Record<Role, number> = {
    [Role.OWNER]: 3,
    [Role.TEACHER]: 2,
    [Role.STUDENT]: 1,
  };

  constructor(
    @Inject('ClassroomMemberRepository')
    private readonly memberRepo: ClassroomMemberRepository,

    @Inject('ClassroomRepository')
    private readonly classroomRepo: ClassroomRepository,
  ) { }
  
  // REFACTORED
  async addMembers(
    classroomId: number,
    requesterId: number,
    dto: AddMemberItemDto[]
  ): Promise<ClassroomMember[]> {
    await this.ensureRole(classroomId, requesterId, [
      Role.OWNER,
      Role.TEACHER,
    ]);

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
    
    await this.memberRepo.addMemberBulks(classroomId, members);
    
    return this.memberRepo.findMembers(classroomId);
  }

  // REFACTORED
  async removeMember(
    classroomId: number,
    requesterId: number,
    userId: number
  ) {
    if (requesterId === userId) {
      throw new ConflictException('User cannot remove themselves');
    }

    const requester = await this.ensureRole(classroomId, requesterId, [
      Role.OWNER,
      Role.TEACHER,
    ]);

    const member = await this.memberRepo.findMember(classroomId, userId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (this.roleRank[requester.role] <= this.roleRank[member.role]) {
      throw new ForbiddenException(
        'Cannot remove a user with equal or higher role',
      );
    }

    await this.memberRepo.removeMember(classroomId, userId);
  }

  // REFACTORED
  async changeMemberRole(
    classroomId: number,
    requesterId: number,
    userId: number,
    role: Role
  ): Promise<ClassroomMember> {
    await this.ensureRole(classroomId, requesterId, [Role.OWNER]);

    if (role === Role.OWNER) {
      throw new ForbiddenException('Cannot assign owner role')
    }

    if (requesterId === userId) {
      throw new ConflictException('Owner cannot change their own role');
    }
    
    const member = await this.memberRepo.findMember(classroomId, userId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === role) {
      throw new ConflictException('User already has this role');
    }

    const updated = await this.memberRepo.updateRole(classroomId, userId, role);
    return updated;
  }

  async leaveClassroom(classroomId: number, userId: number) {
    const member = await this.assertIsMember(classroomId, userId);

    if (member.role === Role.OWNER) {
      throw new ForbiddenException('Owner cannot leave classroom');
    }

    await this.memberRepo.removeMember(classroomId, userId);
  }

  // REFACTORED
  async listMembers(classroomId: number, userId: number): Promise<ClassroomMember[]> {
    await this.assertIsMember(classroomId, userId);
    return await this.memberRepo.findMembers(classroomId);
  }

  // REFACTORED
  async getMember(classroomId: number, memberId: number, userId: number) {
    await this.assertIsMember(classroomId, userId);

    const member = await this.memberRepo.findMember(classroomId, memberId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  // ========== HELPERS ==========
  async assertIsMember(classroomId: number, userId: number): Promise<ClassroomMember> {
    const member = await this.memberRepo.findMember(classroomId, userId);

    if (!member) {
      throw new NotFoundException('Classroom not found');
    }

    return member;
  }

  async ensureRole(
    classroomId: number,
    userId: number,
    allowedRoles: Role[]
  ) {
    const member = await this.assertIsMember(classroomId, userId);

    if (!allowedRoles.includes(member.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return member;
  }
}