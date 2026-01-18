import { Role } from "./role.enum";

export class ClassroomMember {
	constructor(
		public readonly userId: number,
		public role: Role,
		public name?: string,
	) {};

	static rehydrate(props: { userId: number; role: Role; name?: string }): ClassroomMember {
    return new ClassroomMember(props.userId, props.role, props.name);
  }
}