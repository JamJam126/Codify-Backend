import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ClassroomMemberRepository } from '../domain/classroom-member.repository';
import { ClassroomMember } from '../domain/classroom-member.entity';
import { Role } from '../domain/role.enum';

@Injectable()
export class ClassroomMemberRepositoryPrisma
  implements ClassroomMemberRepository
{
  constructor(private readonly prisma: PrismaService) { }

  async addMemberBulks(
    classroomId: number,
    members: ClassroomMember[]
  ): Promise<void> {
    await this.prisma.classroomUser.createMany({
      data: members.map(member => ({
        classroom_id: classroomId,
        user_id: member.userId,
        role: member.role,
      })),
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
      include: { user: { select: { name: true, email: true } } },
    });

    return results.map((result) =>
      ClassroomMember.rehydrate({
        userId: result.user_id,
        role: result.role as Role,
        name: result.user.name,
        email: result.user.email
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
            name: true,
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

  async findMembersByUserIds(classroomId: number, userIds: number[]): Promise<ClassroomMember[]> {
    const results = await this.prisma.classroomUser.findMany({
      where: {
        classroom_id: classroomId,
        user_id: { in: userIds }
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    return results.map(result =>
      ClassroomMember.rehydrate({
        userId: result.user_id,
        role: result.role as Role,
        name: result.user.name
      })
    );
  }
}
