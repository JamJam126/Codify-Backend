import { ClassroomMember } from "./classroom-member.entity";
import { Role } from "./role.enum";

export interface ClassroomMemberRepository {
  addMember(classroomId: number, member: ClassroomMember): Promise<ClassroomMember>;
  removeMember(classroomId: number, userId: number): Promise<void>;
  updateRole(classroomId: number, userId: number, role: Role): Promise<ClassroomMember>;
  findMembers(classroomId: number): Promise<ClassroomMember[]>;
  findMember(classroomId: number, userId: number): Promise<ClassroomMember | null>;
  isAdmin(classroomId: number, userId: number): Promise<boolean>;
}