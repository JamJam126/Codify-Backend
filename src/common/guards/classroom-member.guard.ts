import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ClassroomMembershipService } from "src/modules/classrooms/application/classroom-membership.service";

@Injectable()
export class ClassroomMemberGuard implements CanActivate {
  constructor(private membershipService: ClassroomMembershipService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const userId = req.user.id;
    const classroomId = +req.params.classroomId;

    await this.membershipService.assertIsMember(classroomId, userId);

    return true;
  }
}