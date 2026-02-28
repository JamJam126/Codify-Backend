import { ClassroomMember } from "./classroom-member.entity";
import { Role } from "./role.enum";

export interface ClassroomMemberRepository {
  addMemberBulks(classroomId: number, members: ClassroomMember[]): Promise<ClassroomMember[]>;
  removeMember(classroomId: number, userId: number): Promise<void>;
  updateRole(classroomId: number, userId: number, role: Role): Promise<ClassroomMember>;
  findMembers(classroomId: number): Promise<ClassroomMember[]>;
  findMember(classroomId: number, userId: number): Promise<ClassroomMember | null>;
  findMembersByUserIds(classroomId: number, userIds: number[]): Promise<ClassroomMember[]>;
  isOwner(classroomId: number, userId: number): Promise<boolean>;
  isAdmin(classroomId: number, userId: number): Promise<boolean>;
}