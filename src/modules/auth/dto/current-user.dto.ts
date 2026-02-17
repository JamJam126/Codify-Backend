import { Role } from "src/modules/classrooms/domain/role.enum";

export class CurrentUserDto {
  id: number;
  email: string;
  role: Role;
}