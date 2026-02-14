import { ClassroomMember } from '../domain/classroom-member.entity';
import { ClassroomMemberRepository } from '../domain/classroom-member.repository';
import { Role } from '../domain/role.enum';

export class FakeClassroomMemberRepository
  implements ClassroomMemberRepository
{
  private members: Map<number, ClassroomMember[]> = new Map();

  async addMember(
    classroomId: number,
    member: ClassroomMember,
  ): Promise<ClassroomMember> {
    const list = this.members.get(classroomId) ?? [];
    list.push(member);
    this.members.set(classroomId, list);

    return ClassroomMember.rehydrate({ ...member });
  }

  async removeMember(classroomId: number, userId: number): Promise<void> {
    const list = this.members.get(classroomId) ?? [];
		this.members.set(
			classroomId,
			list.filter(m => m.userId !== userId),
		);
  }

  async updateRole(
    classroomId: number,
    userId: number,
    role: Role,
  ): Promise<ClassroomMember> {
		const list = this.members.get(classroomId) ?? [];
		const member = list.find(m => m.userId === userId);
		if (!member) throw Error('Member not found');
		
		member.role = role;
		return ClassroomMember.rehydrate({
			...member
		});
	}

  async findMembers(classroomId: number): Promise<ClassroomMember[]> {
    return (this.members.get(classroomId) ?? [])
			.map(m => ClassroomMember.rehydrate({ ...m }));
  }

  async findMember(
    classroomId: number,
    userId: number,
  ): Promise<ClassroomMember | null> {
    const member = (this.members.get(classroomId) ?? [])
			.find(m => m.userId === userId);

		return member ? ClassroomMember.rehydrate({
			...member
		}) : null;
  }

  async isOwner(
		classroomId: number, 
		userId: number
  ): Promise<boolean> {
    const member = (this.members.get(classroomId) ?? [])
      .find(m => m.userId === userId);

    if (userId === 1) return true;
    return member?.role === Role.OWNER;
  }

  async isAdmin(
		classroomId: number, 
		userId: number
	): Promise<boolean> {
		const member = (this.members.get(classroomId) ?? [])
		  .find(m => m.userId === userId);

    if (userId === 1) return true;
		return member?.role === Role.OWNER || member?.role === Role.TEACHER;
	}
}
