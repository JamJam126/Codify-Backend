import { Role } from './role.enum';

export class ClassroomMember {
  constructor(
    public readonly userId: number,
    public role: Role,
    public name?: string,
    public email?: string,
  ) {}

  static rehydrate(props: {
    userId: number;
    role: Role;
    name?: string;
    email?: string;
  }): ClassroomMember {
    return new ClassroomMember(
      props.userId,
      props.role,
      props.name,
      props.email,
    );
  }
}
