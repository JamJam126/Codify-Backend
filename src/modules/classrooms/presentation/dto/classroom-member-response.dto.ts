import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../domain/role.enum';

export class ClassroomMemberResponseDto {
  @ApiProperty({ example: 1, description: 'User ID of the member' })
  userId: number;

  @ApiProperty({ enum: Role, example: Role.STUDENT, description: 'Role of the member in the classroom' })
  role: Role;

  @ApiProperty({ example: 'John Doe', required: false, description: 'Optional name of the user' })
  name?: string;
}
