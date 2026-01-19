import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ClassroomMemberRepository } from '../domain/classroom-member.repository';
import { ClassroomMember } from '../domain/classroom-member.entity';
import { Role } from '../domain/role.enum';

@Injectable()
export class ClassroomMemberRepositoryPrisma
  implements ClassroomMemberRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async addMember(
    classroomId: number,
    member: ClassroomMember,
  ): Promise<ClassroomMember> {
    const result = await this.prisma.classroomUser.create({
      data: {
        classroom_id: classroomId,
        user_id: +member.userId,
        role: member.role,
      },
    });

    return ClassroomMember.rehydrate({
      userId: result.user_id,
      role: result.role as Role,
    });
  }

  async removeMember(classroomId: number, userId: number): Promise<void> {
    await this.prisma.classroomUser.delete({
      where: {
        user_id_classroom_id: { 
          classroom_id: classroomId, 
          user_id: userId 
        },
      },
    });
  }

  async updateRole(
    classroomId: number,
    userId: number,
    role: Role,
  ): Promise<ClassroomMember> {
    const result = await this.prisma.classroomUser.update({
      where: { 
        user_id_classroom_id: { 
          classroom_id: classroomId, 
          user_id: userId 
        } 
      },
      data: { role }
    });

    return ClassroomMember.rehydrate({
      userId: result.user_id,
      role: result.role as Role,
    });
  }

  async findMembers(classroomId: number): Promise<ClassroomMember[]> {
    const results = await this.prisma.classroomUser.findMany({
      where: { classroom_id: classroomId },
      include: { user: { select: { name: true } } },
    });

    return results.map((result) =>
      ClassroomMember.rehydrate({
        userId: result.user_id,
        role: result.role as Role,
        name: result.user.name,
      })
    );
  }

  async findMember(classroomId: number, userId: number): Promise<ClassroomMember | null> {
    const result = await this.prisma.classroomUser.findFirst({
      where: { 
        classroom_id: classroomId, 
        user_id: +userId 
      },
      include: { 
        user: { 
          select: { 
            name: true 
          } 
        } 
      },
    });

    if (!result) return null;

    return ClassroomMember.rehydrate({
      userId: result.user_id,
      role: result.role as Role,
      name: result.user.name,
    });
  }

  async isAdmin(classroomId: number, userId: number): Promise<boolean> {
    const member = await this.prisma.classroomUser.findFirst({
      where: { classroom_id: classroomId, user_id: userId, role: Role.ADMIN },
      select: { id: true },
    });

    return !!member;
  }
}
